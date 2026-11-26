-- F0-2 · Sincronização offline: regras de conflito escritas no servidor (SPEC, seção 4).
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração.
--
-- Como funciona: o app não escreve direto nas tabelas. O conector do PowerSync manda as alterações
-- da fila do aparelho, em lote, para `public.sync_apply`. Cada alteração traz um identificador
-- gerado no aparelho (`change_id`). A função:
--   1. ignora repetição (o mesmo `change_id` nunca é aplicado duas vezes; princípio 2);
--   2. recusa quem não é membro ativo da viagem (S10), sem aplicar nada;
--   3. aplica as regras de conflito da seção 4, usando só a ordem de chegada e os valores, nunca o
--      relógio do aparelho (princípio 4):
--        - `pack_state`: alteração feita sobre um valor que já mudou no servidor (concorrente)
--          fica com o estado mais avançado (`in_car` > `set_aside` > `todo`); alteração feita
--          sobre o valor atual é aplicada como veio (a pessoa pode desmarcar);
--        - `item_claim`: cada marcação é uma linha; duas famílias no mesmo item ficam as duas;
--        - quantidade, nome e nota: vale a última a chegar; em item do grupo (`family_id` nulo),
--          cada troca vai para `trip_item_history`, com o valor anterior (o valor "perdido");
--        - remoção (`deleted_at`) vence edição: edição nunca desfaz a remoção; o valor editado
--          fica guardado e o item pode ser restaurado (`deleted_at` volta a nulo só por pedido
--          explícito de restaurar);
--        - dois itens novos com o mesmo nome ficam os dois (identificadores diferentes).
--   `updated_at` e `updated_by` são sempre do servidor.

-- ---------------------------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------------------------

-- Quem assumiu um item do grupo (SPEC, seção 3). Uma linha por marcação; duas famílias no mesmo
-- item são um duplicado, não um conflito (E2-08).
create table public.item_claim (
  id uuid primary key,
  trip_id uuid not null references public.trip (id) on delete cascade,
  item_id uuid not null references public.trip_item (id) on delete cascade,
  family_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);
alter table public.item_claim enable row level security;

create index item_claim_trip_idx on public.item_claim (trip_id);
create index item_claim_item_idx on public.item_claim (item_id);

-- Histórico de troca de quantidade, nome e nota em item do grupo (SPEC, seção 4).
create table public.trip_item_history (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  item_id uuid not null references public.trip_item (id) on delete cascade,
  field text not null check (field in ('name', 'qty', 'note')),
  old_value text,
  new_value text,
  changed_by uuid,
  change_id uuid not null,
  created_at timestamptz not null default now()
);
alter table public.trip_item_history enable row level security;

create index trip_item_history_trip_idx on public.trip_item_history (trip_id);

-- Alterações recebidas, uma linha por `change_id`. Serve para ignorar repetição (princípio 2) e,
-- na prova, como registro técnico da ordem de chegada (`arrival`), lido pelo verificador de
-- "sem perda" (plano, D, F0-2). Não sincroniza com o aparelho e não tem política: só a função lê
-- e escreve.
create table private.sync_change (
  change_id uuid primary key,
  arrival bigint generated always as identity unique,
  profile_id uuid,
  table_name text not null,
  row_id uuid,
  op text not null,
  payload jsonb,
  status text not null check (status in ('applied', 'rejected')),
  reason text,
  outcome jsonb,
  received_at timestamptz not null default clock_timestamp()
);
alter table private.sync_change enable row level security;
revoke all on private.sync_change from public, anon, authenticated;

-- Ajustes só da prova (por exemplo, atraso artificial no envio para o cenário P8). Vazio por
-- padrão. Não existe na base do app.
create table private.prova_ajuste (
  chave text primary key,
  valor text not null
);
alter table private.prova_ajuste enable row level security;
revoke all on private.prova_ajuste from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Políticas: membros leem; ninguém escreve direto (só pela função).
-- ---------------------------------------------------------------------------------------------

create policy item_claim_select_member on public.item_claim
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy trip_item_history_select_member on public.trip_item_history
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

revoke all on public.item_claim, public.trip_item_history from anon;
revoke insert, update, delete on public.item_claim, public.trip_item_history from authenticated;

-- Itens só mudam pela função: escrita direta pela API pularia as regras de conflito. As políticas
-- de escrita da migração base continuam lá, mas sem o privilégio não têm efeito.
revoke insert, update, delete on public.trip_item from authenticated;

-- ---------------------------------------------------------------------------------------------
-- Funções
-- ---------------------------------------------------------------------------------------------

create function private.pack_rank(p_state text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_state when 'in_car' then 2 when 'set_aside' then 1 else 0 end;
$$;

create function private.json_bool(p_value jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_value is null or jsonb_typeof(p_value) = 'null' then null
    when jsonb_typeof(p_value) = 'boolean' then (p_value)::text::boolean
    else (p_value #>> '{}') not in ('0', 'false', '')
  end;
$$;

-- Família de quem chama, na viagem (membro ativo).
create function private.my_family(p_trip_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.family_id
  from public.trip_member m
  where m.trip_id = p_trip_id
    and m.profile_id = (select auth.uid())
    and m.deleted_at is null
  limit 1;
$$;

revoke all on function private.pack_rank(text) from public;
revoke all on function private.json_bool(jsonb) from public;
revoke all on function private.my_family(uuid) from public;

-- Aplica um lote de alterações da fila do aparelho. Devolve, por alteração:
-- {change_id, status: applied | rejected | duplicate, reason, first_status}.
create function public.sync_apply(p_changes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_ch jsonb;
  v_change_id uuid;
  v_table text;
  v_op text;
  v_id uuid;
  v_data jsonb;
  v_prev jsonb;
  v_trip uuid;
  v_item public.trip_item;
  v_claim public.item_claim;
  v_trip_row public.trip;
  v_status text;
  v_reason text;
  v_outcome jsonb;
  v_first text;
  v_results jsonb := '[]'::jsonb;
  v_new_pack text;
  v_final_pack text;
  v_new_text text;
  v_family uuid;
  v_delay integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) > 500 then
    raise exception 'invalid_batch' using errcode = '22023';
  end if;

  for v_ch in select value from jsonb_array_elements(p_changes) loop
    v_change_id := (v_ch ->> 'change_id')::uuid;
    v_table := v_ch ->> 'table';
    v_op := v_ch ->> 'op';
    v_id := (v_ch ->> 'id')::uuid;
    v_data := coalesce(v_ch -> 'data', '{}'::jsonb);
    v_prev := coalesce(v_ch -> 'prev', '{}'::jsonb);
    v_status := 'applied';
    v_reason := null;
    v_outcome := '{}'::jsonb;

    if v_change_id is null or v_id is null then
      raise exception 'invalid_change' using errcode = '22023';
    end if;

    -- 1. Repetição: reservar o change_id. Se já existe, nada é aplicado de novo.
    insert into private.sync_change (change_id, profile_id, table_name, row_id, op, payload, status)
    values (v_change_id, v_uid, coalesce(v_table, '?'), v_id, coalesce(v_op, '?'),
            jsonb_build_object('data', v_data, 'prev', v_prev), 'applied')
    on conflict (change_id) do nothing;
    if not found then
      select status into v_first from private.sync_change where change_id = v_change_id;
      v_results := v_results || jsonb_build_object(
        'change_id', v_change_id, 'status', 'duplicate', 'first_status', v_first);
      continue;
    end if;

    -- 2 e 3. Autorização e regras, por tabela.
    if v_table = 'trip_item' then
      if v_op = 'PUT' then
        v_trip := (v_data ->> 'trip_id')::uuid;
        if v_trip is null or not private.is_trip_member(v_trip) then
          v_status := 'rejected'; v_reason := 'not_member';
        else
          insert into public.trip_item (
            id, trip_id, family_id, catalog_key, name, category, qty, unit, note, origin,
            removed, pack_state, need_buy, updated_by, deleted_at)
          values (
            v_id, v_trip, (v_data ->> 'family_id')::uuid, v_data ->> 'catalog_key',
            v_data ->> 'name', v_data ->> 'category', coalesce((v_data ->> 'qty')::numeric, 1),
            v_data ->> 'unit', v_data ->> 'note', coalesce(v_data ->> 'origin', 'manual'),
            coalesce(private.json_bool(v_data -> 'removed'), false),
            coalesce(v_data ->> 'pack_state', 'todo'),
            coalesce(private.json_bool(v_data -> 'need_buy'), false), v_uid,
            case when v_data ->> 'deleted_at' is not null then now() end)
          on conflict (id) do nothing;
          if not found then
            v_outcome := jsonb_build_object('insert', 'already_exists');
          end if;
        end if;
      else
        select * into v_item from public.trip_item where id = v_id for update;
        if not found then
          v_status := 'rejected'; v_reason := 'not_found';
        elsif not private.is_trip_member(v_item.trip_id) then
          v_status := 'rejected'; v_reason := 'not_member';
        elsif v_op = 'DELETE' then
          -- O app não apaga de verdade; se chegar um DELETE, vira remoção lógica.
          update public.trip_item
             set deleted_at = coalesce(deleted_at, now()), updated_at = now(), updated_by = v_uid
           where id = v_id;
          v_outcome := jsonb_build_object('deleted_at', 'removed');
        else
          -- Quantidade, nome e nota: vale a última a chegar; em item do grupo, histórico.
          if v_data ? 'qty' then
            if v_item.family_id is null and v_item.qty is distinct from (v_data ->> 'qty')::numeric then
              insert into public.trip_item_history (trip_id, item_id, field, old_value, new_value, changed_by, change_id)
              values (v_item.trip_id, v_id, 'qty', v_item.qty::text, (v_data ->> 'qty')::numeric::text, v_uid, v_change_id);
            end if;
            v_item.qty := coalesce((v_data ->> 'qty')::numeric, v_item.qty);
          end if;
          if v_data ? 'name' then
            v_new_text := v_data ->> 'name';
            if v_item.family_id is null and v_item.name is distinct from v_new_text then
              insert into public.trip_item_history (trip_id, item_id, field, old_value, new_value, changed_by, change_id)
              values (v_item.trip_id, v_id, 'name', v_item.name, v_new_text, v_uid, v_change_id);
            end if;
            v_item.name := coalesce(v_new_text, v_item.name);
          end if;
          if v_data ? 'note' then
            v_new_text := v_data ->> 'note';
            if v_item.family_id is null and v_item.note is distinct from v_new_text then
              insert into public.trip_item_history (trip_id, item_id, field, old_value, new_value, changed_by, change_id)
              values (v_item.trip_id, v_id, 'note', v_item.note, v_new_text, v_uid, v_change_id);
            end if;
            v_item.note := v_new_text;
          end if;
          if v_data ? 'unit' then v_item.unit := v_data ->> 'unit'; end if;
          if v_data ? 'category' then v_item.category := v_data ->> 'category'; end if;
          if v_data ? 'need_buy' then
            v_item.need_buy := coalesce(private.json_bool(v_data -> 'need_buy'), v_item.need_buy);
          end if;
          if v_data ? 'removed' then
            v_item.removed := coalesce(private.json_bool(v_data -> 'removed'), v_item.removed);
          end if;

          -- Estado de separação: concorrente fica com o mais avançado.
          if v_data ? 'pack_state' then
            v_new_pack := v_data ->> 'pack_state';
            if v_prev ? 'pack_state' and (v_prev ->> 'pack_state') is distinct from v_item.pack_state then
              if private.pack_rank(v_new_pack) >= private.pack_rank(v_item.pack_state) then
                v_final_pack := v_new_pack;
              else
                v_final_pack := v_item.pack_state;
              end if;
              v_outcome := v_outcome || jsonb_build_object(
                'pack_state', case when v_final_pack = v_new_pack then 'concurrent_won' else 'concurrent_lost' end);
            else
              v_final_pack := v_new_pack;
            end if;
            v_item.pack_state := coalesce(v_final_pack, v_item.pack_state);
          end if;

          -- Remoção vence; restaurar só por pedido explícito (deleted_at nulo enviado).
          if v_data ? 'deleted_at' then
            if v_data ->> 'deleted_at' is not null then
              v_item.deleted_at := coalesce(v_item.deleted_at, now());
              v_outcome := v_outcome || jsonb_build_object('deleted_at', 'removed');
            else
              v_item.deleted_at := null;
              v_outcome := v_outcome || jsonb_build_object('deleted_at', 'restored');
            end if;
          elsif v_item.deleted_at is not null then
            v_outcome := v_outcome || jsonb_build_object('edit_on_removed', true);
          end if;

          update public.trip_item
             set qty = v_item.qty, name = v_item.name, note = v_item.note, unit = v_item.unit,
                 category = v_item.category, need_buy = v_item.need_buy, removed = v_item.removed,
                 pack_state = v_item.pack_state, deleted_at = v_item.deleted_at,
                 updated_at = now(), updated_by = v_uid
           where id = v_id;
        end if;
      end if;

    elsif v_table = 'item_claim' then
      if v_op = 'PUT' then
        select * into v_item from public.trip_item where id = (v_data ->> 'item_id')::uuid;
        if not found then
          v_status := 'rejected'; v_reason := 'not_found';
        elsif not private.is_trip_member(v_item.trip_id) then
          v_status := 'rejected'; v_reason := 'not_member';
        else
          -- A família é a de quem chama, nunca a que o aparelho mandou.
          v_family := private.my_family(v_item.trip_id);
          insert into public.item_claim (id, trip_id, item_id, family_id, updated_by, deleted_at)
          values (v_id, v_item.trip_id, v_item.id, v_family, v_uid,
                  case when v_data ->> 'deleted_at' is not null then now() end)
          on conflict (id) do nothing;
          if not found then
            v_outcome := jsonb_build_object('insert', 'already_exists');
          end if;
        end if;
      else
        select * into v_claim from public.item_claim where id = v_id for update;
        if not found then
          v_status := 'rejected'; v_reason := 'not_found';
        elsif not private.is_trip_member(v_claim.trip_id) then
          v_status := 'rejected'; v_reason := 'not_member';
        else
          if v_op = 'DELETE' or (v_data ? 'deleted_at' and v_data ->> 'deleted_at' is not null) then
            update public.item_claim
               set deleted_at = coalesce(deleted_at, now()), updated_at = now(), updated_by = v_uid
             where id = v_id;
          elsif v_data ? 'deleted_at' then
            update public.item_claim
               set deleted_at = null, updated_at = now(), updated_by = v_uid
             where id = v_id;
          end if;
        end if;
      end if;

    elsif v_table = 'trip' then
      select * into v_trip_row from public.trip where id = v_id for update;
      if not found then
        if v_op = 'PUT' then
          -- Viagem criada no aparelho, inclusive sem conta (S9): sobe com o mesmo identificador,
          -- e quem envia passa a ser dono e organizador.
          insert into public.trip (id, owner_profile_id, name, kind, nights, is_group, status, updated_by)
          values (v_id, v_uid, coalesce(v_data ->> 'name', 'Viagem'), coalesce(v_data ->> 'kind', 'tent_car'),
                  (v_data ->> 'nights')::integer, coalesce(private.json_bool(v_data -> 'is_group'), false),
                  coalesce(v_data ->> 'status', 'planning'), v_uid);
          insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
          values (v_id, gen_random_uuid(), v_uid, 'Organizador', 'organizer', v_uid);
          v_outcome := jsonb_build_object('trip', 'created');
        else
          v_status := 'rejected'; v_reason := 'not_found';
        end if;
      elsif not private.is_trip_organizer(v_id) then
        v_status := 'rejected'; v_reason := 'not_member';
      else
        update public.trip
           set name = coalesce(v_data ->> 'name', name),
               status = coalesce(v_data ->> 'status', status),
               nights = case when v_data ? 'nights' then (v_data ->> 'nights')::integer else nights end,
               updated_at = now(), updated_by = v_uid
         where id = v_id;
      end if;

    else
      v_status := 'rejected'; v_reason := 'not_supported';
    end if;

    update private.sync_change
       set status = v_status, reason = v_reason, outcome = nullif(v_outcome, '{}'::jsonb)
     where change_id = v_change_id;
    v_results := v_results || jsonb_build_object(
      'change_id', v_change_id, 'status', v_status, 'reason', v_reason);
  end loop;

  -- Só na prova (P8): atraso artificial depois de aplicar, para cortar a rede com o lote já
  -- gravado e a resposta ainda a caminho. Sem a linha em private.prova_ajuste, não há atraso.
  select valor::integer into v_delay from private.prova_ajuste where chave = 'atraso_envio_ms';
  if coalesce(v_delay, 0) > 0 then
    perform pg_sleep(least(v_delay, 30000) / 1000.0);
  end if;

  return v_results;
end;
$$;

revoke all on function public.sync_apply(jsonb) from public, anon;
grant execute on function public.sync_apply(jsonb) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Publicação do PowerSync: as tabelas novas que vão ao aparelho.
-- ---------------------------------------------------------------------------------------------

alter publication powersync add table public.item_claim, public.trip_item_history;
