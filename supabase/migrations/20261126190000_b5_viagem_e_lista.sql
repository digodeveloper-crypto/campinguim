-- B5 · Viagem e lista (SPEC, seção 3, "Viagem e lista"; seção 11, "Autorização").
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração, e cada tabela que vai
-- ao aparelho entra na publicação "powersync" aqui também (nunca "for all tables").
--
-- Regras gerais da seção 3 aplicadas a todas as tabelas abaixo:
--   - identificador aleatório UUID versão 4 (gen_random_uuid), gerado no aparelho ou no servidor
--     (DEF-08); nada sequencial;
--   - datas de viagem são `date` (data local, sem hora); carimbos são `timestamptz` (UTC);
--   - nada se apaga de verdade em tabela sincronizada: `deleted_at`;
--   - todo registro sincronizado tem `updated_at` e `updated_by` (preenchidos pelo servidor).
--
-- Campos técnicos que não estão na lista de "campos principais" da seção 3 (e que o B4 precisa
-- criar igual no aparelho; lista completa em docs/servidor.md):
--   - `created_at`, `updated_at`, `updated_by`, `deleted_at` em toda tabela sincronizada;
--   - `id` em `item_claim` (o serviço de sincronização exige um `id` por linha);
--   - `trip_id` em `trip_person` e `item_claim`, copiado do pai pelo servidor, para as políticas e
--     as regras de sincronização filtrarem por viagem sem junção.
--
-- Escrita: o app NÃO escreve direto nestas tabelas. Toda alteração vinda do aparelho passa por
-- public.sync_apply (migração 20261126190400), que confere a autorização por viagem e por família
-- e aplica as regras de conflito da seção 4. Por isso o papel `authenticated` só tem SELECT aqui, e
-- as políticas abaixo são de leitura ("Quem lê" da tabela de autorização da seção 11). O "Quem
-- escreve" está escrito e testado dentro da função (ponto J2 de docs/prova-tecnica/resultado.md).

-- ---------------------------------------------------------------------------------------------
-- Esquema interno: funções de apoio às políticas e registros que só o servidor lê.
-- A API (PostgREST) não expõe este esquema (supabase/config.jsonc, api.schemas).
-- ---------------------------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------------------------
-- profile
-- Criado no primeiro login (gatilho em auth.users, abaixo). Sem CPF, telefone ou endereço (PRV-01).
-- `id` é o mesmo do usuário do login: apagar o usuário apaga o perfil (exclusão de conta, seção 3).
-- ---------------------------------------------------------------------------------------------

create table public.profile (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  nickname text check (nickname is null or char_length(nickname) between 1 and 40),
  anonymous_by_default boolean not null default false,
  origin_channel text check (origin_channel is null or char_length(origin_channel) between 1 and 40),
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);
alter table public.profile enable row level security;

-- ---------------------------------------------------------------------------------------------
-- trip
-- `start_date` e `end_date` podem ser nulos (RET-02). Sem conta, a viagem fica só no aparelho
-- (E1-14); no servidor, `owner_profile_id` é quem enviou a viagem e fica nulo só depois da
-- exclusão da conta. `camping_id` só muda pelas funções de camping (seção 8, trip_set_camping):
-- a referência à tabela `camping` entra na migração de campings.
-- `source_trip_id` sem chave estrangeira: a viagem de origem pode ainda não ter subido (E1-12).
-- ---------------------------------------------------------------------------------------------

create table public.trip (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profile (id) on delete set null,
  name text check (name is null or char_length(name) between 1 and 120),
  kind text not null default 'tent_car' check (kind in ('tent_car', 'backpack', 'motorhome')),
  start_date date,
  end_date date,
  nights integer check (nights is null or nights between 0 and 365),
  climate text check (climate is null or climate in ('cold', 'mild', 'hot')),
  rain boolean not null default false,
  camping_id uuid,
  is_group boolean not null default false,
  status text not null default 'planning'
    check (status in ('planning', 'packing', 'traveling', 'returning', 'closed')),
  source_trip_id uuid,
  -- Destino informado sem camping do servidor (E1-13). Campo pedido pela B3 (docs/regras.md, seção 6).
  destination_name text check (destination_name is null or char_length(destination_name) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  check (start_date is null or end_date is null or end_date >= start_date)
);
alter table public.trip enable row level security;

-- ---------------------------------------------------------------------------------------------
-- trip_family
-- Uma viagem de família única tem exatamente uma (conferido em sync_apply). Pets ficam aqui.
-- ---------------------------------------------------------------------------------------------

create table public.trip_family (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  name text check (name is null or char_length(name) between 1 and 80),
  pets integer not null default 0 check (pets between 0 and 20),
  is_organizer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  unique (id, trip_id)
);
alter table public.trip_family enable row level security;

-- ---------------------------------------------------------------------------------------------
-- trip_person
-- `label` é opcional (PRV-01: nome de criança não é obrigatório). As contagens por faixa saem daqui.
-- ---------------------------------------------------------------------------------------------

create table public.trip_person (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  family_id uuid not null,
  age_band text not null check (age_band in ('adult', 'teen', 'child', 'toddler')),
  label text check (label is null or char_length(label) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (family_id, trip_id) references public.trip_family (id, trip_id) on delete cascade
);
alter table public.trip_person enable row level security;

-- ---------------------------------------------------------------------------------------------
-- trip_member
-- Convidado da página web tem `profile_id` nulo e `role` 'guest'. `family_id` e `display_name`
-- podem ser nulos só enquanto a família e o nome do organizador ainda não subiram (viagem enviada
-- no primeiro login: o servidor cria a linha do organizador ao receber a viagem, ver sync_apply).
-- ---------------------------------------------------------------------------------------------

create table public.trip_member (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  family_id uuid,
  profile_id uuid references public.profile (id) on delete set null,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  role text not null default 'member' check (role in ('organizer', 'member', 'guest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (family_id, trip_id) references public.trip_family (id, trip_id),
  -- Convidado nunca tem conta. Membro sem conta só existe depois da exclusão da conta (seção 3).
  check (role <> 'guest' or profile_id is null)
);
alter table public.trip_member enable row level security;

-- Uma pessoa é membro ativo de uma viagem uma vez só.
create unique index trip_member_profile_ativo_uq on public.trip_member (trip_id, profile_id)
  where profile_id is not null and deleted_at is null;

-- ---------------------------------------------------------------------------------------------
-- trip_item
-- `family_id` nulo = item do grupo. Item com `removed` verdadeiro nunca volta por recálculo (E1-04).
-- `qty` aceita nulo para os itens-tarefa do catálogo ("tarefa: conferir"). `trip_id` e `family_id`
-- não mudam depois de criados (sync_apply recusa).
-- ---------------------------------------------------------------------------------------------

create table public.trip_item (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  family_id uuid,
  catalog_key text check (catalog_key is null or catalog_key ~ '^[a-z0-9_]{1,60}$'),
  name text not null check (char_length(name) between 1 and 120),
  -- category e unit são chaves do catálogo (packages/content, itens.json), pedidas pela B3.
  category text check (category is null or category in (
    'abrigo', 'dormir', 'cozinha', 'comida_bebida', 'roupa', 'higiene', 'socorros_seguranca',
    'ferramentas_energia', 'lazer_documentos', 'criancas', 'pet')),
  qty numeric check (qty is null or (qty >= 0 and qty <= 100000)),
  unit text check (unit is null or unit in (
    'jogo', 'kit', 'rolo', 'pacote', 'par', 'saco_4kg', 'saco_5kg', 'galao_5l', 'dia_de_racao')),
  note text check (note is null or char_length(note) <= 500),
  origin text not null default 'manual' check (origin in ('generated', 'manual', 'camping_adjust')),
  removed boolean not null default false,
  pack_state text not null default 'todo' check (pack_state in ('todo', 'set_aside', 'in_car')),
  need_buy boolean not null default false,
  depends_on_camping boolean not null default false,
  return_state text not null default 'unchecked'
    check (return_state in ('unchecked', 'checked', 'dry_at_home', 'wash_at_home')),
  missing boolean not null default false,
  leftover boolean not null default false,
  -- Campos pedidos pela B3 (docs/regras.md, seção 6, "Campos que o modelo de dados precisa"):
  -- referência estável do item para o recálculo, quantidade editada à mão, quantidade por pessoa,
  -- quantidade secundária (36 L, 20 m) e a marca do aprendizado (E1-11).
  item_ref text not null check (char_length(item_ref) between 1 and 160),
  qty_edited boolean not null default false,
  qty_per_person integer check (qty_per_person is null or qty_per_person between 0 and 1000),
  detail_qty integer check (detail_qty is null or detail_qty between 0 and 100000),
  detail_unit text check (detail_unit is null or detail_unit in ('litro', 'metro')),
  learning_kind text check (learning_kind is null or learning_kind in ('missing', 'reduced', 'flagged')),
  learning_qty_before integer check (learning_qty_before is null or learning_qty_before >= 0),
  learning_percent integer check (learning_percent is null or learning_percent between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (family_id, trip_id) references public.trip_family (id, trip_id),
  check ((detail_qty is null) = (detail_unit is null)),
  check (learning_kind = 'reduced' or (learning_qty_before is null and learning_percent is null))
);

-- Referência estável única entre os itens vivos da viagem (B3).
create unique index trip_item_ref_uq on public.trip_item (trip_id, item_ref) where deleted_at is null;

-- Sem item_ref, o servidor aplica a regra da B3: <catalog_key>@<família ou grupo> (gerado),
-- ajuste:<catalog_key>@<família ou grupo> (ajuste do camping), o próprio id (manual).
create function private.default_item_ref()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.item_ref is null then
    new.item_ref := case
      when new.origin = 'generated' and new.catalog_key is not null
        then new.catalog_key || '@' || coalesce(new.family_id::text, 'grupo')
      when new.origin = 'camping_adjust' and new.catalog_key is not null
        then 'ajuste:' || new.catalog_key || '@' || coalesce(new.family_id::text, 'grupo')
      else new.id::text
    end;
  end if;
  return new;
end;
$$;
revoke all on function private.default_item_ref() from public, anon, authenticated;

create trigger trip_item_default_ref
  before insert on public.trip_item
  for each row execute function private.default_item_ref();
alter table public.trip_item enable row level security;

-- ---------------------------------------------------------------------------------------------
-- item_claim
-- Uma linha por família que assumiu um item do grupo. Duas famílias no mesmo item são um
-- duplicado, não um conflito (E2-08, E2-05). A mesma família não assume o mesmo item duas vezes.
-- ---------------------------------------------------------------------------------------------

create table public.item_claim (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  item_id uuid not null references public.trip_item (id) on delete cascade,
  family_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (family_id, trip_id) references public.trip_family (id, trip_id) on delete cascade
);
alter table public.item_claim enable row level security;

create unique index item_claim_ativo_uq on public.item_claim (item_id, family_id) where deleted_at is null;

-- ---------------------------------------------------------------------------------------------
-- trip_camping_snapshot
-- Cópia do que o servidor devolveu para a viagem: a única informação de camping no aparelho
-- (DEF-11). Escrita só pelas funções de camping; o aparelho só marca "ciente" (`rules_ack_at`,
-- um mapa regra -> carimbo UTC). A referência a `camping` entra na migração de campings.
-- ---------------------------------------------------------------------------------------------

create table public.trip_camping_snapshot (
  trip_id uuid primary key references public.trip (id) on delete cascade,
  camping_id uuid not null,
  facts jsonb not null default '{}'::jsonb,
  alerts jsonb not null default '[]'::jsonb,
  adjustments jsonb not null default '[]'::jsonb,
  rules_ack_at jsonb not null default '{}'::jsonb check (jsonb_typeof(rules_ack_at) = 'object'),
  -- Ajustes que a pessoa desfez (E3-08, A6), pelo identificador fato:valor:efeito:alvo. Pedido pela B3.
  undone_adjustment_ids text[] not null default '{}',
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);
alter table public.trip_camping_snapshot enable row level security;

-- ---------------------------------------------------------------------------------------------
-- invite
-- `family_id` preenchido convida para a mesma família (E2-18). Validade padrão em `config`
-- (invite.validity_days). Lido e escrito só pelas funções da seção 8 (invite_create,
-- invite_revoke, guest_join): nenhuma política para o app, e não vai ao aparelho.
-- ---------------------------------------------------------------------------------------------

create table public.invite (
  token text primary key check (char_length(token) between 32 and 128),
  trip_id uuid not null references public.trip (id) on delete cascade,
  family_id uuid,
  created_by uuid references public.profile (id) on delete set null,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (family_id, trip_id) references public.trip_family (id, trip_id) on delete cascade
);
alter table public.invite enable row level security;

create index trip_member_perfil_idx on public.trip_member (profile_id) where deleted_at is null;
create index trip_member_viagem_idx on public.trip_member (trip_id);
create index trip_family_viagem_idx on public.trip_family (trip_id);
create index trip_person_viagem_idx on public.trip_person (trip_id);
create index trip_person_familia_idx on public.trip_person (family_id);
create index trip_item_viagem_idx on public.trip_item (trip_id);
create index trip_item_familia_idx on public.trip_item (family_id);
create index item_claim_viagem_idx on public.item_claim (trip_id);
create index invite_viagem_idx on public.invite (trip_id);

-- ---------------------------------------------------------------------------------------------
-- Funções de apoio às políticas e a sync_apply.
-- SECURITY DEFINER para consultar trip_member sem cair de novo na política dela mesma (recursão).
-- "Membro" é sempre membro ATIVO (deleted_at nulo) com login: quem foi removido perde tudo (S10).
-- ---------------------------------------------------------------------------------------------

create function private.is_trip_member(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_member m
    where m.trip_id = p_trip_id
      and m.profile_id = (select auth.uid())
      and m.deleted_at is null
  );
$$;

create function private.is_trip_organizer(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_member m
    where m.trip_id = p_trip_id
      and m.profile_id = (select auth.uid())
      and m.role = 'organizer'
      and m.deleted_at is null
  );
$$;

-- Quem chama é membro ativo daquela família (itens pessoais de uma família, seção 11).
create function private.is_family_member(p_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_member m
    where m.family_id = p_family_id
      and m.profile_id = (select auth.uid())
      and m.deleted_at is null
  );
$$;

-- Família de quem chama, naquela viagem (nula se não é membro ou ainda sem família).
create function private.my_family(p_trip_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.family_id from public.trip_member m
  where m.trip_id = p_trip_id
    and m.profile_id = (select auth.uid())
    and m.deleted_at is null
  limit 1;
$$;

-- Linha de membro de quem chama, naquela viagem (autor do histórico de gasto, expense_audit).
create function private.my_member_id(p_trip_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.id from public.trip_member m
  where m.trip_id = p_trip_id
    and m.profile_id = (select auth.uid())
    and m.deleted_at is null
  limit 1;
$$;

revoke all on function private.is_trip_member(uuid) from public, anon;
revoke all on function private.is_trip_organizer(uuid) from public, anon;
revoke all on function private.is_family_member(uuid) from public, anon;
revoke all on function private.my_family(uuid) from public, anon;
revoke all on function private.my_member_id(uuid) from public, anon;
grant execute on function private.is_trip_member(uuid) to authenticated;
grant execute on function private.is_trip_organizer(uuid) to authenticated;
grant execute on function private.is_family_member(uuid) to authenticated;
grant execute on function private.my_family(uuid) to authenticated;
grant execute on function private.my_member_id(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Perfil criado no primeiro login: gatilho no usuário do Supabase Auth. Só o identificador; o nome
-- de exibição chega depois (feature 2.1). Nenhum dado do provedor de login é copiado.
-- ---------------------------------------------------------------------------------------------

create function private.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile (id, updated_by) values (new.id, new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.create_profile_for_user() from public, anon, authenticated;

create trigger campinguim_create_profile
  after insert on auth.users
  for each row execute function private.create_profile_for_user();

-- ---------------------------------------------------------------------------------------------
-- Políticas de leitura (SPEC, seção 11, "Quem lê"). Nenhuma política para `anon`: sem login, nada.
-- ---------------------------------------------------------------------------------------------

-- O próprio perfil.
create policy profile_select_own on public.profile
  for select to authenticated
  using (id = (select auth.uid()));

-- Viagem, famílias, pessoas e membros: membros da viagem.
create policy trip_select_member on public.trip
  for select to authenticated
  using ((select private.is_trip_member(id)));

create policy trip_family_select_member on public.trip_family
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy trip_person_select_member on public.trip_person
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy trip_member_select_member on public.trip_member
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

-- Itens: do grupo, membros da viagem; pessoais de uma família, só membros daquela família.
create policy trip_item_select_member on public.trip_item
  for select to authenticated
  using (
    (family_id is null and (select private.is_trip_member(trip_id)))
    or (family_id is not null and (select private.is_family_member(family_id)))
  );

create policy item_claim_select_member on public.item_claim
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy trip_camping_snapshot_select_member on public.trip_camping_snapshot
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

-- invite: sem política (só as funções da seção 8).

-- ---------------------------------------------------------------------------------------------
-- Privilégios. O Supabase dá tudo a anon e authenticated por padrão em tabela nova do `public`;
-- aqui fica só o necessário: authenticated lê (o RLS filtra) e ninguém escreve direto.
-- ---------------------------------------------------------------------------------------------

revoke all on public.profile, public.trip, public.trip_family, public.trip_person, public.trip_member,
  public.trip_item, public.item_claim, public.trip_camping_snapshot, public.invite
  from anon, authenticated;
grant select on public.profile, public.trip, public.trip_family, public.trip_person, public.trip_member,
  public.trip_item, public.item_claim, public.trip_camping_snapshot
  to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Publicação do PowerSync: as tabelas desta migração que vão ao aparelho (SPEC, seção 3, "O que
-- chega ao aparelho"). `invite` não vai.
-- ---------------------------------------------------------------------------------------------

alter publication powersync add table public.profile, public.trip, public.trip_family, public.trip_person,
  public.trip_member, public.trip_item, public.item_claim, public.trip_camping_snapshot;
