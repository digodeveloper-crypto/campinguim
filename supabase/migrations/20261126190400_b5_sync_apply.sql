-- B5 · Aplicação das alterações vindas do aparelho (SPEC, seção 4; seção 8; seção 11).
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração.
--
-- O conector do PowerSync no app manda a fila de alterações, em lote, para public.sync_apply.
-- Cada alteração é {change_id, table, op: PUT | PATCH | DELETE, id, data, prev?}:
--   change_id  identificador gerado no aparelho; repetição é ignorada (princípio 2);
--   data       colunas novas (PUT: a linha inteira; PATCH: só as que mudaram);
--   prev       valores anteriores no aparelho (PowerSync `previousValues`; o app liga
--              "trackPrevious" em trip_item para o servidor reconhecer pack_state concorrente).
--
-- Devolve uma lista com um resultado por alteração, na mesma ordem, e NUNCA aborta o lote por
-- causa de uma alteração (ponto J1 de docs/prova-tecnica/resultado.md):
--   {change_id, status: 'applied', outcome?}
--   {change_id, status: 'rejected', reason: 'not_member' | 'not_allowed'}            autorização
--   {change_id, status: 'rejected', reason: 'validation' | 'not_found', detail?}     dado inválido
--   {change_id, status: 'duplicate', first_status, first_reason}                     repetição
-- O app tira da fila toda alteração recusada, desfaz a cópia local e avisa a pessoa (seção 4).
-- Só falha o lote inteiro: sem login (28000), lote que não é lista ou com mais de 500 alterações
-- (22023) e erro passageiro do banco (o app reenvia; a repetição é segura).
--
-- A função é SECURITY DEFINER: o RLS não vale dentro dela (ponto J2). Toda regra de "quem
-- escreve" da tabela de autorização da seção 11 está escrita aqui, por tabela, e testada em
-- supabase/testes/. O relógio do aparelho nunca decide conflito (princípio 4): `updated_at`,
-- `updated_by`, `deleted_at` e as marcas de "paguei" e "ciente" levam o carimbo do servidor.

-- ---------------------------------------------------------------------------------------------
-- Registro das alterações recebidas: uma linha por change_id, para ignorar repetição e guardar a
-- ordem de chegada. Sem conteúdo da alteração (nomes, notas): registros do servidor não guardam
-- texto livre (seção 11, "Privacidade"). Sem política: só a função lê e escreve.
-- ---------------------------------------------------------------------------------------------

create table private.sync_change (
  change_id uuid primary key,
  arrival bigint generated always as identity unique,
  profile_id uuid,
  table_name text not null,
  op text not null,
  row_id uuid,
  status text not null check (status in ('applied', 'rejected')),
  reason text,
  outcome jsonb,
  received_at timestamptz not null default clock_timestamp()
);
alter table private.sync_change enable row level security;
revoke all on private.sync_change from public, anon, authenticated;

create index sync_change_perfil_idx on private.sync_change (profile_id, arrival);

-- ---------------------------------------------------------------------------------------------
-- Pequenas funções de apoio
-- ---------------------------------------------------------------------------------------------

create function private.sync_ok(p_outcome jsonb default null)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when p_outcome is null or p_outcome = '{}'::jsonb then jsonb_build_object('status', 'applied')
    else jsonb_build_object('status', 'applied', 'outcome', p_outcome)
  end;
$$;

create function private.sync_refuse(p_reason text)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object('status', 'rejected', 'reason', p_reason);
$$;

-- Dado inválido: erro da classe 22, apanhado por sync_apply e devolvido como 'validation'.
create function private.sync_invalid(p_column text)
returns void
language plpgsql
volatile
set search_path = ''
as $$
begin
  raise exception 'validation' using errcode = '22023', column = p_column;
end;
$$;

create function private.try_uuid(p_text text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when p_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then p_text::uuid
  end;
$$;

-- Booleano vindo do aparelho: o SQLite guarda 0 e 1. Outra coisa é dado inválido.
create function private.sync_bool(p_data jsonb, p_key text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v jsonb := p_data -> p_key;
  t text;
begin
  if v is null or jsonb_typeof(v) = 'null' then
    return null;
  end if;
  if jsonb_typeof(v) = 'boolean' then
    return v::text::boolean;
  end if;
  t := v #>> '{}';
  if t in ('1', 'true') then return true; end if;
  if t in ('0', 'false') then return false; end if;
  perform private.sync_invalid(p_key);
  return null;
end;
$$;

-- JSON vindo do aparelho: o SQLite guarda como texto. Aceita o objeto ou o texto do objeto.
create function private.sync_json(p_data jsonb, p_key text)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v jsonb := p_data -> p_key;
begin
  if v is null or jsonb_typeof(v) = 'null' then
    return null;
  end if;
  if jsonb_typeof(v) = 'string' then
    begin
      return (v #>> '{}')::jsonb;
    exception when others then
      perform private.sync_invalid(p_key);
    end;
  end if;
  return v;
end;
$$;

-- Exclusão lógica: DELETE ou `deleted_at` preenchido removem (com o carimbo do servidor).
-- Restaurar (`deleted_at` nulo) só por PATCH explícito: uma linha inteira reenviada (PUT) nunca
-- desfaz uma remoção (seção 4, "vence a remoção").
create function private.sync_deleted_at(p_op text, p_data jsonb, p_current timestamptz)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select case
    when p_op = 'DELETE' then coalesce(p_current, now())
    when p_data ? 'deleted_at' and p_data ->> 'deleted_at' is not null then coalesce(p_current, now())
    when p_data ? 'deleted_at' and p_op = 'PATCH' then null
    else p_current
  end;
$$;

-- Estado de separação: in_car > set_aside > todo (seção 4).
create function private.pack_rank(p_state text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_state when 'in_car' then 2 when 'set_aside' then 1 when 'todo' then 0 end;
$$;

-- Campo que não pode mudar depois de criado: mandar outro valor é dado inválido.
create function private.sync_immutable(p_data jsonb, p_key text, p_current uuid)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_data ? p_key and (p_data ->> p_key)::uuid is distinct from p_current then
    perform private.sync_invalid(p_key);
  end if;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- profile: só o próprio perfil. Nome de exibição, apelido e "anônimo por padrão".
-- O canal de origem é gravado uma vez. Exclusão de conta é pela função account_delete (2.11).
-- ---------------------------------------------------------------------------------------------

create function private.sync_profile(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
begin
  if p_id is distinct from p_uid or p_op = 'DELETE' then
    return private.sync_refuse('not_allowed');
  end if;
  insert into public.profile (id, updated_by) values (p_uid, p_uid) on conflict (id) do nothing;
  update public.profile
     set display_name = case when p_data ? 'display_name' then p_data ->> 'display_name' else display_name end,
         nickname = case when p_data ? 'nickname' then p_data ->> 'nickname' else nickname end,
         anonymous_by_default = case when p_data ? 'anonymous_by_default'
                                     then private.sync_bool(p_data, 'anonymous_by_default')
                                     else anonymous_by_default end,
         origin_channel = coalesce(origin_channel, p_data ->> 'origin_channel'),
         updated_at = now(), updated_by = p_uid
   where id = p_uid;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- trip: quem envia uma viagem nova vira dono e organizador (o servidor cria a linha de membro).
-- Depois, dados da viagem só o organizador muda (seção 11). `camping_id` e o dono são do
-- servidor: o aparelho não os muda por aqui (o destino passa por trip_set_camping, seção 8).
-- ---------------------------------------------------------------------------------------------

create function private.sync_trip(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.trip;
begin
  select * into v_row from public.trip where id = p_id for update;
  if not found then
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    insert into public.profile (id, updated_by) values (p_uid, p_uid) on conflict (id) do nothing;
    -- created_at: hora da criação no aparelho, como a B3 pede (viagem feita sem conta sobe dias
    -- depois), nunca no futuro. A hora de chegada ao servidor fica em private.sync_change
    -- (received_at da alteração desta viagem), para o antifraude (FRD-02, feature 3.7).
    insert into public.trip (
      id, owner_profile_id, name, kind, start_date, end_date, nights, climate, rain, is_group,
      status, source_trip_id, destination_name, created_at, updated_by, deleted_at)
    values (
      p_id, p_uid, p_data ->> 'name', coalesce(p_data ->> 'kind', 'tent_car'),
      (p_data ->> 'start_date')::date, (p_data ->> 'end_date')::date, (p_data ->> 'nights')::integer,
      p_data ->> 'climate', coalesce(private.sync_bool(p_data, 'rain'), false),
      coalesce(private.sync_bool(p_data, 'is_group'), false), coalesce(p_data ->> 'status', 'planning'),
      (p_data ->> 'source_trip_id')::uuid, p_data ->> 'destination_name',
      least(coalesce((p_data ->> 'created_at')::timestamptz, now()), now()), p_uid,
      private.sync_deleted_at(p_op, p_data, null));
    insert into public.trip_member (trip_id, profile_id, role, updated_by)
    values (p_id, p_uid, 'organizer', p_uid);
    return private.sync_ok(jsonb_build_object('trip', 'created'));
  end if;

  if not private.is_trip_member(p_id) then
    return private.sync_refuse('not_member');
  end if;
  if not private.is_trip_organizer(p_id) then
    return private.sync_refuse('not_allowed');
  end if;

  update public.trip
     set name = case when p_data ? 'name' then p_data ->> 'name' else name end,
         kind = case when p_data ? 'kind' then p_data ->> 'kind' else kind end,
         start_date = case when p_data ? 'start_date' then (p_data ->> 'start_date')::date else start_date end,
         end_date = case when p_data ? 'end_date' then (p_data ->> 'end_date')::date else end_date end,
         nights = case when p_data ? 'nights' then (p_data ->> 'nights')::integer else nights end,
         climate = case when p_data ? 'climate' then p_data ->> 'climate' else climate end,
         rain = case when p_data ? 'rain' then private.sync_bool(p_data, 'rain') else rain end,
         is_group = case when p_data ? 'is_group' then private.sync_bool(p_data, 'is_group') else is_group end,
         status = case when p_data ? 'status' then p_data ->> 'status' else status end,
         source_trip_id = case when p_data ? 'source_trip_id' then (p_data ->> 'source_trip_id')::uuid
                               else source_trip_id end,
         destination_name = case when p_data ? 'destination_name' then p_data ->> 'destination_name'
                                 else destination_name end,
         deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at),
         updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- trip_family: membros da viagem escrevem (seção 11). Viagem de família única tem exatamente
-- uma família. A primeira família que sobe liga a linha de membro de quem envia, se ela ainda
-- não tem família (viagem de família única, ou a família marcada como do organizador).
-- ---------------------------------------------------------------------------------------------

create function private.sync_family(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.trip_family;
  v_trip public.trip;
  v_is_organizer boolean;
begin
  select * into v_row from public.trip_family where id = p_id for update;
  if not found then
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    select * into v_trip from public.trip where id = (p_data ->> 'trip_id')::uuid;
    if not found then
      perform private.sync_invalid('trip_id');
    end if;
    if not private.is_trip_member(v_trip.id) then
      return private.sync_refuse('not_member');
    end if;
    v_is_organizer := coalesce(private.sync_bool(p_data, 'is_organizer'), false);
    if v_is_organizer and not private.is_trip_organizer(v_trip.id) then
      return private.sync_refuse('not_allowed');
    end if;
    if not v_trip.is_group and exists (
      select 1 from public.trip_family f where f.trip_id = v_trip.id and f.deleted_at is null
    ) then
      perform private.sync_invalid('trip_id');
    end if;
    insert into public.trip_family (id, trip_id, name, pets, is_organizer, updated_by, deleted_at)
    values (p_id, v_trip.id, p_data ->> 'name', coalesce((p_data ->> 'pets')::integer, 0), v_is_organizer,
            p_uid, private.sync_deleted_at(p_op, p_data, null));
    update public.trip_member m
       set family_id = p_id, updated_at = now(), updated_by = p_uid
     where m.trip_id = v_trip.id and m.profile_id = p_uid and m.deleted_at is null and m.family_id is null
       and (not v_trip.is_group or v_is_organizer);
    return private.sync_ok();
  end if;

  if not private.is_trip_member(v_row.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  perform private.sync_immutable(p_data, 'trip_id', v_row.trip_id);
  if p_data ? 'is_organizer'
     and private.sync_bool(p_data, 'is_organizer') is distinct from v_row.is_organizer
     and not private.is_trip_organizer(v_row.trip_id) then
    return private.sync_refuse('not_allowed');
  end if;
  -- Tirar uma família da viagem é tirar os membros dela: só o organizador (seção 11).
  if private.sync_deleted_at(p_op, p_data, v_row.deleted_at) is distinct from v_row.deleted_at
     and not private.is_trip_organizer(v_row.trip_id) then
    return private.sync_refuse('not_allowed');
  end if;
  update public.trip_family
     set name = case when p_data ? 'name' then p_data ->> 'name' else name end,
         pets = case when p_data ? 'pets' then (p_data ->> 'pets')::integer else pets end,
         is_organizer = case when p_data ? 'is_organizer' then private.sync_bool(p_data, 'is_organizer')
                             else is_organizer end,
         deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at),
         updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- trip_person: membros da viagem escrevem (seção 11). A viagem vem da família, nunca do aparelho.
-- ---------------------------------------------------------------------------------------------

create function private.sync_person(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.trip_person;
  v_family public.trip_family;
begin
  select * into v_row from public.trip_person where id = p_id for update;
  if not found then
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    select * into v_family from public.trip_family where id = (p_data ->> 'family_id')::uuid;
    if not found then
      perform private.sync_invalid('family_id');
    end if;
    if not private.is_trip_member(v_family.trip_id) then
      return private.sync_refuse('not_member');
    end if;
    insert into public.trip_person (id, trip_id, family_id, age_band, label, updated_by, deleted_at)
    values (p_id, v_family.trip_id, v_family.id, p_data ->> 'age_band', p_data ->> 'label', p_uid,
            private.sync_deleted_at(p_op, p_data, null));
    return private.sync_ok();
  end if;

  if not private.is_trip_member(v_row.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  perform private.sync_immutable(p_data, 'family_id', v_row.family_id);
  perform private.sync_immutable(p_data, 'trip_id', v_row.trip_id);
  update public.trip_person
     set age_band = case when p_data ? 'age_band' then p_data ->> 'age_band' else age_band end,
         label = case when p_data ? 'label' then p_data ->> 'label' else label end,
         deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at),
         updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- trip_member: só o organizador muda membros (remover, papel, família, nome; seção 11).
-- Entrar numa viagem é pelas funções de convite (seção 8), não por aqui. A única linha nova
-- aceita é a do próprio organizador, que o servidor já criou ao receber a viagem: o envio dela
-- pelo aparelho é juntado à existente (família e nome), sem criar outra.
-- ---------------------------------------------------------------------------------------------

create function private.sync_member(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.trip_member;
  v_trip uuid;
  v_mine public.trip_member;
begin
  select * into v_row from public.trip_member where id = p_id for update;
  if not found then
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    v_trip := (p_data ->> 'trip_id')::uuid;
    if v_trip is null then
      perform private.sync_invalid('trip_id');
    end if;
    if not private.is_trip_member(v_trip) then
      return private.sync_refuse('not_member');
    end if;
    if coalesce((p_data ->> 'profile_id')::uuid, p_uid) is distinct from p_uid then
      return private.sync_refuse('not_allowed');
    end if;
    select * into v_mine from public.trip_member m
     where m.trip_id = v_trip and m.profile_id = p_uid and m.deleted_at is null
     for update;
    -- Juntar só preenche o que ainda está vazio. Trocar a própria família daria acesso aos itens
    -- pessoais de outra família (seção 11): recusado.
    if (p_data ? 'family_id' and v_mine.family_id is not null
        and (p_data ->> 'family_id')::uuid is distinct from v_mine.family_id)
       or (p_data ? 'display_name' and v_mine.display_name is not null
        and (p_data ->> 'display_name') is distinct from v_mine.display_name)
       or (p_data ? 'role' and (p_data ->> 'role') is distinct from v_mine.role) then
      return private.sync_refuse('not_allowed');
    end if;
    update public.trip_member
       set family_id = coalesce(family_id, (p_data ->> 'family_id')::uuid),
           display_name = coalesce(display_name, p_data ->> 'display_name'),
           updated_at = now(), updated_by = p_uid
     where id = v_mine.id;
    return private.sync_ok(jsonb_build_object('member', 'merged', 'member_id', v_mine.id));
  end if;

  if not private.is_trip_member(v_row.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  if not private.is_trip_organizer(v_row.trip_id) then
    return private.sync_refuse('not_allowed');
  end if;
  perform private.sync_immutable(p_data, 'trip_id', v_row.trip_id);
  perform private.sync_immutable(p_data, 'profile_id', v_row.profile_id);
  if p_data ? 'role' and p_data ->> 'role' = 'guest' and v_row.profile_id is not null then
    perform private.sync_invalid('role');
  end if;
  -- A família de um membro só é preenchida quando está vazia: mudar alguém de família (inclusive
  -- o próprio organizador) daria acesso aos itens pessoais de outra família. Entrar numa família é
  -- pelo convite para a mesma família (E2-18, seção 8).
  if p_data ? 'family_id' and v_row.family_id is not null
     and (p_data ->> 'family_id')::uuid is distinct from v_row.family_id then
    return private.sync_refuse('not_allowed');
  end if;
  update public.trip_member
     set family_id = case when p_data ? 'family_id' then (p_data ->> 'family_id')::uuid else family_id end,
         display_name = case when p_data ? 'display_name' then p_data ->> 'display_name' else display_name end,
         role = case when p_data ? 'role' then p_data ->> 'role' else role end,
         deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at),
         updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- trip_item: item do grupo (family_id nulo), qualquer membro da viagem; item de uma família, só
-- membros daquela família (seção 11), inclusive na criação: o family_id que o aparelho manda é
-- conferido (ponto J2). trip_id e family_id não mudam depois.
-- Regras de conflito (seção 4):
--   pack_state   alteração feita sobre um valor que já mudou no servidor (prev diferente do
--                atual) fica com o estado mais avançado; sobre o valor atual, vale o que veio
--                (a pessoa pode desmarcar);
--   qty, name, note e os demais campos: vale a última a chegar. Em item do grupo, os campos
--                sobrescritos voltam em outcome.overwritten (sem os valores: o registro do
--                servidor não guarda texto livre; ver docs/servidor.md, pendência do histórico);
--   remoção      vence a edição: editar não desfaz `removed` nem `deleted_at`; restaurar só por
--                PATCH explícito com removed = falso ou deleted_at = nulo;
--   itens novos  com o mesmo nome ficam os dois (identificadores diferentes).
-- ---------------------------------------------------------------------------------------------

create function private.sync_item(p_uid uuid, p_op text, p_id uuid, p_data jsonb, p_prev jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.trip_item;
  v_trip uuid;
  v_family uuid;
  v_outcome jsonb := '{}'::jsonb;
  v_overwritten text[] := '{}';
  v_field text;
  v_new_pack text;
  v_removed boolean;
begin
  select * into v_row from public.trip_item where id = p_id for update;
  if not found then
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    v_trip := (p_data ->> 'trip_id')::uuid;
    if v_trip is null or not exists (select 1 from public.trip t where t.id = v_trip) then
      perform private.sync_invalid('trip_id');
    end if;
    if not private.is_trip_member(v_trip) then
      return private.sync_refuse('not_member');
    end if;
    v_family := (p_data ->> 'family_id')::uuid;
    if v_family is not null and not private.is_family_member(v_family) then
      return private.sync_refuse('not_allowed');
    end if;
    insert into public.trip_item (
      id, trip_id, family_id, catalog_key, name, category, qty, unit, note, origin, removed,
      pack_state, need_buy, depends_on_camping, return_state, missing, leftover,
      item_ref, qty_edited, qty_per_person, detail_qty, detail_unit, learning_kind, learning_qty_before,
      learning_percent, updated_by, deleted_at)
    values (
      p_id, v_trip, v_family, p_data ->> 'catalog_key', p_data ->> 'name', p_data ->> 'category',
      (p_data ->> 'qty')::numeric, p_data ->> 'unit', p_data ->> 'note', coalesce(p_data ->> 'origin', 'manual'),
      coalesce(private.sync_bool(p_data, 'removed'), false), coalesce(p_data ->> 'pack_state', 'todo'),
      coalesce(private.sync_bool(p_data, 'need_buy'), false),
      coalesce(private.sync_bool(p_data, 'depends_on_camping'), false),
      coalesce(p_data ->> 'return_state', 'unchecked'), coalesce(private.sync_bool(p_data, 'missing'), false),
      coalesce(private.sync_bool(p_data, 'leftover'), false),
      p_data ->> 'item_ref', coalesce(private.sync_bool(p_data, 'qty_edited'), false),
      (p_data ->> 'qty_per_person')::integer, (p_data ->> 'detail_qty')::integer, p_data ->> 'detail_unit',
      p_data ->> 'learning_kind', (p_data ->> 'learning_qty_before')::integer,
      (p_data ->> 'learning_percent')::integer, p_uid,
      private.sync_deleted_at(p_op, p_data, null));
    return private.sync_ok();
  end if;

  -- Autorização sobre a linha que está no servidor, nunca sobre o que o aparelho diz dela.
  if not private.is_trip_member(v_row.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  if v_row.family_id is not null and not private.is_family_member(v_row.family_id) then
    return private.sync_refuse('not_allowed');
  end if;
  perform private.sync_immutable(p_data, 'trip_id', v_row.trip_id);
  perform private.sync_immutable(p_data, 'family_id', v_row.family_id);
  if p_data ? 'item_ref' and (p_data ->> 'item_ref') is distinct from v_row.item_ref then
    perform private.sync_invalid('item_ref');
  end if;

  -- Vale a última a chegar; em item do grupo, avisa quais campos foram sobrescritos.
  if v_row.family_id is null then
    foreach v_field in array array['qty', 'name', 'note'] loop
      if p_data ? v_field and (to_jsonb(v_row) ->> v_field) is distinct from (p_data ->> v_field) then
        v_overwritten := v_overwritten || v_field;
      end if;
    end loop;
    if cardinality(v_overwritten) > 0 then
      v_outcome := v_outcome || jsonb_build_object('overwritten', to_jsonb(v_overwritten));
    end if;
  end if;

  -- Estado de separação: concorrente fica com o mais avançado.
  if p_data ? 'pack_state' then
    v_new_pack := p_data ->> 'pack_state';
    if private.pack_rank(v_new_pack) is null then
      perform private.sync_invalid('pack_state');
    end if;
    if p_prev ? 'pack_state' and (p_prev ->> 'pack_state') is distinct from v_row.pack_state then
      if private.pack_rank(v_new_pack) < private.pack_rank(v_row.pack_state) then
        v_outcome := v_outcome || jsonb_build_object('pack_state', 'concurrent_lost');
        v_new_pack := v_row.pack_state;
      else
        v_outcome := v_outcome || jsonb_build_object('pack_state', 'concurrent_won');
      end if;
    end if;
  else
    v_new_pack := v_row.pack_state;
  end if;

  -- Remoção vence edição.
  v_removed := v_row.removed;
  if p_data ? 'removed' then
    if private.sync_bool(p_data, 'removed') then
      v_removed := true;
    elsif p_op = 'PATCH' and private.sync_bool(p_data, 'removed') = false then
      v_removed := false;
    end if;
  end if;
  if (v_row.removed or v_row.deleted_at is not null) and p_op <> 'DELETE'
     and not (p_data ? 'removed' or p_data ? 'deleted_at') then
    v_outcome := v_outcome || jsonb_build_object('edit_on_removed', true);
  end if;

  update public.trip_item
     set catalog_key = case when p_data ? 'catalog_key' then p_data ->> 'catalog_key' else catalog_key end,
         name = case when p_data ? 'name' then p_data ->> 'name' else name end,
         category = case when p_data ? 'category' then p_data ->> 'category' else category end,
         qty = case when p_data ? 'qty' then (p_data ->> 'qty')::numeric else qty end,
         unit = case when p_data ? 'unit' then p_data ->> 'unit' else unit end,
         note = case when p_data ? 'note' then p_data ->> 'note' else note end,
         origin = case when p_data ? 'origin' then p_data ->> 'origin' else origin end,
         removed = v_removed,
         pack_state = v_new_pack,
         need_buy = case when p_data ? 'need_buy' then private.sync_bool(p_data, 'need_buy') else need_buy end,
         depends_on_camping = case when p_data ? 'depends_on_camping'
                                   then private.sync_bool(p_data, 'depends_on_camping') else depends_on_camping end,
         return_state = case when p_data ? 'return_state' then p_data ->> 'return_state' else return_state end,
         missing = case when p_data ? 'missing' then private.sync_bool(p_data, 'missing') else missing end,
         leftover = case when p_data ? 'leftover' then private.sync_bool(p_data, 'leftover') else leftover end,
         qty_edited = case when p_data ? 'qty_edited' then private.sync_bool(p_data, 'qty_edited') else qty_edited end,
         qty_per_person = case when p_data ? 'qty_per_person' then (p_data ->> 'qty_per_person')::integer
                               else qty_per_person end,
         detail_qty = case when p_data ? 'detail_qty' then (p_data ->> 'detail_qty')::integer else detail_qty end,
         detail_unit = case when p_data ? 'detail_unit' then p_data ->> 'detail_unit' else detail_unit end,
         learning_kind = case when p_data ? 'learning_kind' then p_data ->> 'learning_kind' else learning_kind end,
         learning_qty_before = case when p_data ? 'learning_qty_before'
                                    then (p_data ->> 'learning_qty_before')::integer else learning_qty_before end,
         learning_percent = case when p_data ? 'learning_percent' then (p_data ->> 'learning_percent')::integer
                                 else learning_percent end,
         deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at),
         updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok(v_outcome);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- item_claim: qualquer membro assume um item do grupo, sempre em nome da PRÓPRIA família (o
-- family_id do aparelho é conferido); desfazer a marcação, só a família que marcou. Duas famílias
-- no mesmo item ficam as duas (seção 4); a mesma família duas vezes vira uma só.
-- ---------------------------------------------------------------------------------------------

create function private.sync_claim(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.item_claim;
  v_item public.trip_item;
  v_family uuid;
  v_deleted timestamptz;
begin
  select * into v_row from public.item_claim where id = p_id for update;
  if not found then
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    select * into v_item from public.trip_item where id = (p_data ->> 'item_id')::uuid;
    if not found then
      perform private.sync_invalid('item_id');
    end if;
    if not private.is_trip_member(v_item.trip_id) then
      return private.sync_refuse('not_member');
    end if;
    if v_item.family_id is not null then
      perform private.sync_invalid('item_id');
    end if;
    v_family := private.my_family(v_item.trip_id);
    if p_data ? 'family_id' and (p_data ->> 'family_id')::uuid is distinct from v_family then
      return private.sync_refuse('not_allowed');
    end if;
    if v_family is null then
      perform private.sync_invalid('family_id');
    end if;
    v_deleted := private.sync_deleted_at(p_op, p_data, null);
    if v_deleted is null and exists (
      select 1 from public.item_claim c
      where c.item_id = v_item.id and c.family_id = v_family and c.deleted_at is null
    ) then
      return private.sync_ok(jsonb_build_object('claim', 'already_claimed'));
    end if;
    insert into public.item_claim (id, trip_id, item_id, family_id, updated_by, deleted_at)
    values (p_id, v_item.trip_id, v_item.id, v_family, p_uid, v_deleted);
    return private.sync_ok();
  end if;

  if not private.is_trip_member(v_row.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  if not private.is_family_member(v_row.family_id) then
    return private.sync_refuse('not_allowed');
  end if;
  perform private.sync_immutable(p_data, 'item_id', v_row.item_id);
  perform private.sync_immutable(p_data, 'family_id', v_row.family_id);
  perform private.sync_immutable(p_data, 'trip_id', v_row.trip_id);
  v_deleted := private.sync_deleted_at(p_op, p_data, v_row.deleted_at);
  if v_deleted is null and v_row.deleted_at is not null and exists (
    select 1 from public.item_claim c
    where c.item_id = v_row.item_id and c.family_id = v_row.family_id and c.deleted_at is null
  ) then
    return private.sync_ok(jsonb_build_object('claim', 'already_claimed'));
  end if;
  update public.item_claim
     set deleted_at = v_deleted, updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- trip_camping_snapshot: escrito pelas funções de camping. O aparelho só marca "ciente" numa
-- regra (as chaves que chegam entram no mapa com o carimbo do servidor; nada sai do mapa) e muda
-- a lista de ajustes desfeitos (undone_adjustment_ids, E3-08 e A6; vale a última a chegar).
-- O identificador da linha, no aparelho, é o trip_id.
-- ---------------------------------------------------------------------------------------------

create function private.sync_snapshot(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.trip_camping_snapshot;
  v_acks jsonb;
  v_undone jsonb;
  v_key text;
  v_extra text;
begin
  select * into v_row from public.trip_camping_snapshot where trip_id = p_id for update;
  if not found then
    if private.is_trip_member(p_id) then
      return private.sync_refuse('not_allowed');
    end if;
    return private.sync_refuse('not_member');
  end if;
  if not private.is_trip_member(v_row.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  select k into v_extra from jsonb_object_keys(p_data) k
   where k not in ('rules_ack_at', 'undone_adjustment_ids', 'id', 'trip_id', 'updated_at', 'updated_by') limit 1;
  if p_op <> 'PATCH' or v_extra is not null then
    return private.sync_refuse('not_allowed');
  end if;
  if p_data ? 'undone_adjustment_ids' then
    v_undone := coalesce(private.sync_json(p_data, 'undone_adjustment_ids'), '[]'::jsonb);
    if jsonb_typeof(v_undone) <> 'array' or exists (
      select 1 from jsonb_array_elements(v_undone) e
      where jsonb_typeof(e) <> 'string' or char_length(e #>> '{}') not between 1 and 200
    ) then
      perform private.sync_invalid('undone_adjustment_ids');
    end if;
    update public.trip_camping_snapshot
       set undone_adjustment_ids = array(select jsonb_array_elements_text(v_undone)),
           updated_at = now(), updated_by = p_uid
     where trip_id = p_id;
  end if;
  v_acks := private.sync_json(p_data, 'rules_ack_at');
  if v_acks is null then
    return private.sync_ok();
  end if;
  if jsonb_typeof(v_acks) <> 'object' then
    perform private.sync_invalid('rules_ack_at');
  end if;
  v_acks := v_row.rules_ack_at;
  for v_key in select jsonb_object_keys(private.sync_json(p_data, 'rules_ack_at')) loop
    if v_key !~ '^[a-z0-9_]{1,40}$' then
      perform private.sync_invalid('rules_ack_at');
    end if;
    if not v_acks ? v_key then
      v_acks := v_acks || jsonb_build_object(v_key, to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'));
    end if;
  end loop;
  update public.trip_camping_snapshot
     set rules_ack_at = v_acks, updated_at = now(), updated_by = p_uid
   where trip_id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- expense: comprador e organizador escrevem (seção 11). Cada mudança de valor ou regra vira uma
-- linha em expense_audit, na ordem de chegada (seção 4; E2-15), inclusive os valores iniciais.
-- A família compradora não muda depois de criado o gasto.
-- ---------------------------------------------------------------------------------------------

create function private.sync_expense(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.expense;
  v_item public.trip_item;
  v_buyer uuid;
  v_actor uuid;
  v_field text;
  v_old text;
  v_new text;
begin
  select * into v_row from public.expense where id = p_id for update;
  if not found then
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    select * into v_item from public.trip_item where id = (p_data ->> 'item_id')::uuid;
    if not found then
      perform private.sync_invalid('item_id');
    end if;
    if not private.is_trip_member(v_item.trip_id) then
      return private.sync_refuse('not_member');
    end if;
    perform private.sync_immutable(p_data, 'trip_id', v_item.trip_id);
    v_buyer := (p_data ->> 'buyer_family_id')::uuid;
    if v_buyer is null then
      perform private.sync_invalid('buyer_family_id');
    end if;
    if not (private.is_trip_organizer(v_item.trip_id) or private.is_family_member(v_buyer)) then
      return private.sync_refuse('not_allowed');
    end if;
    insert into public.expense (
      id, trip_id, item_id, buyer_family_id, estimate_cents, amount_cents, split_rule, receipt_path,
      updated_by, deleted_at)
    values (
      p_id, v_item.trip_id, v_item.id, v_buyer, (p_data ->> 'estimate_cents')::integer,
      (p_data ->> 'amount_cents')::integer, coalesce(p_data ->> 'split_rule', 'shares'),
      p_data ->> 'receipt_path', p_uid, private.sync_deleted_at(p_op, p_data, null))
    returning * into v_row;
    v_actor := private.my_member_id(v_row.trip_id);
    insert into public.expense_audit (trip_id, expense_id, actor_member_id, field, old_value, new_value, updated_by)
    select v_row.trip_id, v_row.id, v_actor, f.field, null, f.value, p_uid
      from (values ('estimate_cents', v_row.estimate_cents::text),
                   ('amount_cents', v_row.amount_cents::text),
                   ('split_rule', v_row.split_rule)) as f (field, value)
     where f.value is not null;
    return private.sync_ok();
  end if;

  if not private.is_trip_member(v_row.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  if not (private.is_trip_organizer(v_row.trip_id) or private.is_family_member(v_row.buyer_family_id)) then
    return private.sync_refuse('not_allowed');
  end if;
  perform private.sync_immutable(p_data, 'trip_id', v_row.trip_id);
  perform private.sync_immutable(p_data, 'item_id', v_row.item_id);
  perform private.sync_immutable(p_data, 'buyer_family_id', v_row.buyer_family_id);

  v_actor := private.my_member_id(v_row.trip_id);
  foreach v_field in array array['estimate_cents', 'amount_cents', 'split_rule'] loop
    if p_data ? v_field then
      v_old := to_jsonb(v_row) ->> v_field;
      v_new := case when v_field = 'split_rule' then p_data ->> v_field
                    else ((p_data ->> v_field)::integer)::text end;
      if v_old is distinct from v_new then
        insert into public.expense_audit (trip_id, expense_id, actor_member_id, field, old_value, new_value, updated_by)
        values (v_row.trip_id, v_row.id, v_actor, v_field, v_old, v_new, p_uid);
      end if;
    end if;
  end loop;

  update public.expense
     set estimate_cents = case when p_data ? 'estimate_cents' then (p_data ->> 'estimate_cents')::integer
                               else estimate_cents end,
         amount_cents = case when p_data ? 'amount_cents' then (p_data ->> 'amount_cents')::integer
                             else amount_cents end,
         split_rule = case when p_data ? 'split_rule' then p_data ->> 'split_rule' else split_rule end,
         receipt_path = case when p_data ? 'receipt_path' then p_data ->> 'receipt_path' else receipt_path end,
         deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at),
         updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- expense_exclusion: comprador e organizador (é parte do gasto). A pessoa tem de ser da viagem.
-- ---------------------------------------------------------------------------------------------

create function private.sync_exclusion(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.expense_exclusion;
  v_expense public.expense;
  v_person public.trip_person;
  v_deleted timestamptz;
begin
  select * into v_row from public.expense_exclusion where id = p_id for update;
  if found then
    select * into v_expense from public.expense where id = v_row.expense_id;
  else
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    select * into v_expense from public.expense where id = (p_data ->> 'expense_id')::uuid;
    if not found then
      perform private.sync_invalid('expense_id');
    end if;
  end if;
  if not private.is_trip_member(v_expense.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  if not (private.is_trip_organizer(v_expense.trip_id) or private.is_family_member(v_expense.buyer_family_id)) then
    return private.sync_refuse('not_allowed');
  end if;

  if v_row.id is null then
    select * into v_person from public.trip_person where id = (p_data ->> 'person_id')::uuid;
    if not found or v_person.trip_id <> v_expense.trip_id then
      perform private.sync_invalid('person_id');
    end if;
    v_deleted := private.sync_deleted_at(p_op, p_data, null);
    if v_deleted is null and exists (
      select 1 from public.expense_exclusion x
      where x.expense_id = v_expense.id and x.person_id = v_person.id and x.deleted_at is null
    ) then
      return private.sync_ok(jsonb_build_object('exclusion', 'already_excluded'));
    end if;
    insert into public.expense_exclusion (id, trip_id, expense_id, person_id, updated_by, deleted_at)
    values (p_id, v_expense.trip_id, v_expense.id, v_person.id, p_uid, v_deleted);
    return private.sync_ok();
  end if;

  perform private.sync_immutable(p_data, 'expense_id', v_row.expense_id);
  perform private.sync_immutable(p_data, 'person_id', v_row.person_id);
  update public.expense_exclusion
     set deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at), updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- expense_payment: "paguei" só por membro da família devedora (seção 8, expense_mark_paid).
-- O carimbo é do servidor; paid_marked_at nulo desmarca.
-- ---------------------------------------------------------------------------------------------

create function private.sync_payment(p_uid uuid, p_op text, p_id uuid, p_data jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row public.expense_payment;
  v_expense public.expense;
  v_family uuid;
  v_paid timestamptz;
begin
  select * into v_row from public.expense_payment where id = p_id for update;
  if found then
    select * into v_expense from public.expense where id = v_row.expense_id;
    v_family := v_row.family_id;
    perform private.sync_immutable(p_data, 'expense_id', v_row.expense_id);
    perform private.sync_immutable(p_data, 'family_id', v_row.family_id);
  else
    if p_op <> 'PUT' then
      return private.sync_refuse('not_found');
    end if;
    select * into v_expense from public.expense where id = (p_data ->> 'expense_id')::uuid;
    if not found then
      perform private.sync_invalid('expense_id');
    end if;
    v_family := (p_data ->> 'family_id')::uuid;
    if v_family is null then
      perform private.sync_invalid('family_id');
    end if;
  end if;
  if not private.is_trip_member(v_expense.trip_id) then
    return private.sync_refuse('not_member');
  end if;
  if not private.is_family_member(v_family) then
    return private.sync_refuse('not_allowed');
  end if;

  v_paid := case
    when not p_data ? 'paid_marked_at' then v_row.paid_marked_at
    when p_data ->> 'paid_marked_at' is null then null
    else coalesce(v_row.paid_marked_at, now())
  end;

  if v_row.id is null then
    select * into v_row from public.expense_payment x
     where x.expense_id = v_expense.id and x.family_id = v_family and x.deleted_at is null
     for update;
    if found then
      update public.expense_payment
         set paid_marked_at = v_paid, updated_at = now(), updated_by = p_uid
       where id = v_row.id;
      return private.sync_ok(jsonb_build_object('payment', 'merged', 'payment_id', v_row.id));
    end if;
    insert into public.expense_payment (id, trip_id, expense_id, family_id, paid_marked_at, updated_by, deleted_at)
    values (p_id, v_expense.trip_id, v_expense.id, v_family, v_paid, p_uid,
            private.sync_deleted_at(p_op, p_data, null));
    return private.sync_ok();
  end if;

  update public.expense_payment
     set paid_marked_at = v_paid, deleted_at = private.sync_deleted_at(p_op, p_data, deleted_at),
         updated_at = now(), updated_by = p_uid
   where id = p_id;
  return private.sync_ok();
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Uma alteração: confere o envelope e chama a regra da tabela.
-- ---------------------------------------------------------------------------------------------

create function private.sync_apply_one(p_uid uuid, p_change jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_table text := p_change ->> 'table';
  v_op text := upper(coalesce(p_change ->> 'op', ''));
  v_id uuid;
  v_data jsonb := coalesce(p_change -> 'data', '{}'::jsonb);
  v_prev jsonb := coalesce(p_change -> 'prev', '{}'::jsonb);
begin
  if v_op not in ('PUT', 'PATCH', 'DELETE') then
    perform private.sync_invalid('op');
  end if;
  v_id := (p_change ->> 'id')::uuid;
  if v_id is null then
    perform private.sync_invalid('id');
  end if;
  if jsonb_typeof(v_data) = 'null' then
    v_data := '{}'::jsonb;
  end if;
  if jsonb_typeof(v_prev) = 'null' then
    v_prev := '{}'::jsonb;
  end if;
  if jsonb_typeof(v_data) <> 'object' then
    perform private.sync_invalid('data');
  end if;
  if jsonb_typeof(v_prev) <> 'object' then
    perform private.sync_invalid('prev');
  end if;

  return case v_table
    when 'profile' then private.sync_profile(p_uid, v_op, v_id, v_data)
    when 'trip' then private.sync_trip(p_uid, v_op, v_id, v_data)
    when 'trip_family' then private.sync_family(p_uid, v_op, v_id, v_data)
    when 'trip_person' then private.sync_person(p_uid, v_op, v_id, v_data)
    when 'trip_member' then private.sync_member(p_uid, v_op, v_id, v_data)
    when 'trip_item' then private.sync_item(p_uid, v_op, v_id, v_data, v_prev)
    when 'item_claim' then private.sync_claim(p_uid, v_op, v_id, v_data)
    when 'trip_camping_snapshot' then private.sync_snapshot(p_uid, v_op, v_id, v_data)
    when 'expense' then private.sync_expense(p_uid, v_op, v_id, v_data)
    when 'expense_exclusion' then private.sync_exclusion(p_uid, v_op, v_id, v_data)
    when 'expense_payment' then private.sync_payment(p_uid, v_op, v_id, v_data)
    -- Tabelas que existem mas o aparelho não escreve: histórico do gasto (servidor), convite e
    -- chave Pix (funções da seção 8), campings e apoio (só o servidor).
    when 'expense_audit' then private.sync_refuse('not_allowed')
    when 'invite' then private.sync_refuse('not_allowed')
    when 'pix_key' then private.sync_refuse('not_allowed')
    else private.sync_refuse('validation')
  end;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- O lote. Ver o contrato no começo deste arquivo.
-- ---------------------------------------------------------------------------------------------

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
  v_res jsonb;
  v_results jsonb := '[]'::jsonb;
  v_first_status text;
  v_first_reason text;
  v_state text;
  v_constraint text;
  v_column text;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) > 500 then
    raise exception 'invalid_batch' using errcode = '22023';
  end if;

  for v_ch in select value from jsonb_array_elements(p_changes) loop
    v_change_id := case when jsonb_typeof(v_ch) = 'object' then private.try_uuid(v_ch ->> 'change_id') end;
    if v_change_id is null then
      -- Sem identificador não há como ignorar repetição: recusa só esta alteração.
      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'change_id', case when jsonb_typeof(v_ch) = 'object' then v_ch -> 'change_id' end,
        'status', 'rejected', 'reason', 'validation',
        'detail', jsonb_build_object('column', 'change_id')));
      continue;
    end if;

    -- Repetição: o change_id é reservado antes de aplicar; já existindo, nada se aplica de novo.
    v_table := v_ch ->> 'table';
    if v_table is null or v_table !~ '^[a-z_]{1,40}$' then
      v_table := '?';
    end if;
    insert into private.sync_change (change_id, profile_id, table_name, op, row_id, status)
    values (v_change_id, v_uid, v_table, left(coalesce(upper(v_ch ->> 'op'), '?'), 10),
            private.try_uuid(v_ch ->> 'id'), 'applied')
    on conflict (change_id) do nothing;
    if not found then
      select status, reason into v_first_status, v_first_reason
        from private.sync_change where change_id = v_change_id;
      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'change_id', v_change_id, 'status', 'duplicate',
        'first_status', v_first_status, 'first_reason', v_first_reason));
      continue;
    end if;

    -- Cada alteração num bloco próprio: dado inválido desfaz só ela (J1). Erro passageiro do banco
    -- (bloqueio, falta de recurso) não é apanhado aqui e devolve o lote para o app reenviar.
    begin
      v_res := private.sync_apply_one(v_uid, v_ch);
    exception
      when data_exception or integrity_constraint_violation then
        get stacked diagnostics
          v_state = returned_sqlstate, v_constraint = constraint_name, v_column = column_name;
        v_res := jsonb_build_object(
          'status', 'rejected', 'reason', 'validation',
          'detail', jsonb_strip_nulls(jsonb_build_object(
            'sqlstate', v_state, 'constraint', nullif(v_constraint, ''), 'column', nullif(v_column, ''))));
    end;

    update private.sync_change
       set status = v_res ->> 'status', reason = v_res ->> 'reason',
           outcome = coalesce(v_res -> 'outcome', v_res -> 'detail')
     where change_id = v_change_id;
    v_results := v_results || jsonb_build_array(jsonb_build_object('change_id', v_change_id) || v_res);
  end loop;

  return v_results;
end;
$$;

-- As funções internas só rodam dentro de sync_apply.
revoke all on function private.sync_ok(jsonb), private.sync_refuse(text), private.sync_invalid(text),
  private.try_uuid(text), private.sync_bool(jsonb, text), private.sync_json(jsonb, text),
  private.sync_deleted_at(text, jsonb, timestamptz), private.pack_rank(text),
  private.sync_immutable(jsonb, text, uuid),
  private.sync_profile(uuid, text, uuid, jsonb), private.sync_trip(uuid, text, uuid, jsonb),
  private.sync_family(uuid, text, uuid, jsonb), private.sync_person(uuid, text, uuid, jsonb),
  private.sync_member(uuid, text, uuid, jsonb), private.sync_item(uuid, text, uuid, jsonb, jsonb),
  private.sync_claim(uuid, text, uuid, jsonb), private.sync_snapshot(uuid, text, uuid, jsonb),
  private.sync_expense(uuid, text, uuid, jsonb), private.sync_exclusion(uuid, text, uuid, jsonb),
  private.sync_payment(uuid, text, uuid, jsonb), private.sync_apply_one(uuid, jsonb)
  from public, anon, authenticated;

revoke all on function public.sync_apply(jsonb) from public, anon;
grant execute on function public.sync_apply(jsonb) to authenticated;
