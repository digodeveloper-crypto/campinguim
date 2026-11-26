-- F0-1 · Base da prova técnica
-- Tabelas mínimas de viagem e lista (SPEC, seção 3), só com os campos que a prova usa.
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração, com políticas por membro.
-- Sem CPF, telefone, endereço ou localização (PRV-01, PRV-02).
-- Simplificação da prova: `profile` e `trip_family` não existem; `profile_id` aponta direto para
-- `auth.users` e `family_id` é só um identificador (sem tabela de famílias).

-- ---------------------------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------------------------

create table public.trip (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  kind text not null default 'tent_car' check (kind in ('tent_car', 'backpack', 'motorhome')),
  start_date date,
  end_date date,
  nights integer check (nights is null or nights >= 0),
  is_group boolean not null default false,
  status text not null default 'planning'
    check (status in ('planning', 'packing', 'traveling', 'returning', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);
alter table public.trip enable row level security;

create table public.trip_member (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  family_id uuid,
  profile_id uuid references auth.users (id) on delete set null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role text not null default 'member' check (role in ('organizer', 'member', 'guest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  unique (trip_id, profile_id)
);
alter table public.trip_member enable row level security;

create table public.trip_item (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  family_id uuid,
  catalog_key text,
  name text not null check (char_length(name) between 1 and 120),
  category text,
  qty numeric not null default 1 check (qty >= 0),
  unit text,
  note text,
  origin text not null default 'manual' check (origin in ('generated', 'manual', 'camping_adjust')),
  removed boolean not null default false,
  pack_state text not null default 'todo' check (pack_state in ('todo', 'set_aside', 'in_car')),
  need_buy boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz
);
alter table public.trip_item enable row level security;

create index trip_member_profile_idx on public.trip_member (profile_id) where deleted_at is null;
create index trip_member_trip_idx on public.trip_member (trip_id);
create index trip_item_trip_idx on public.trip_item (trip_id);

-- ---------------------------------------------------------------------------------------------
-- Funções de apoio às políticas
-- Ficam num esquema que a API não expõe. São SECURITY DEFINER para consultar `trip_member` sem
-- cair de novo na política dela mesma (o que daria recursão).
-- ---------------------------------------------------------------------------------------------

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.is_trip_member(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_member m
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
    select 1
    from public.trip_member m
    where m.trip_id = p_trip_id
      and m.profile_id = (select auth.uid())
      and m.role = 'organizer'
      and m.deleted_at is null
  );
$$;

create function private.is_trip_owner(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip t
    where t.id = p_trip_id
      and t.owner_profile_id = (select auth.uid())
  );
$$;

revoke all on function private.is_trip_member(uuid) from public;
revoke all on function private.is_trip_organizer(uuid) from public;
revoke all on function private.is_trip_owner(uuid) from public;
grant execute on function private.is_trip_member(uuid) to authenticated;
grant execute on function private.is_trip_organizer(uuid) to authenticated;
grant execute on function private.is_trip_owner(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Políticas (SPEC, seção 11): membros leem e escrevem a viagem e os itens; dados da viagem e
-- membros, só o organizador. Nenhuma política para `anon`: sem login, nada.
-- Nenhuma política de DELETE: exclusão é lógica (`deleted_at`).
-- ---------------------------------------------------------------------------------------------

-- trip
create policy trip_select_member on public.trip
  for select to authenticated
  using ((select private.is_trip_member(id)) or owner_profile_id = (select auth.uid()));

create policy trip_insert_owner on public.trip
  for insert to authenticated
  with check (owner_profile_id = (select auth.uid()));

create policy trip_update_organizer on public.trip
  for update to authenticated
  using ((select private.is_trip_organizer(id)))
  with check ((select private.is_trip_organizer(id)));

-- trip_member
create policy trip_member_select_member on public.trip_member
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

-- O dono cria a própria linha de organizador; depois, só o organizador adiciona membros.
create policy trip_member_insert_organizer on public.trip_member
  for insert to authenticated
  with check (
    (select private.is_trip_organizer(trip_id))
    or (
      profile_id = (select auth.uid())
      and role = 'organizer'
      and (select private.is_trip_owner(trip_id))
    )
  );

create policy trip_member_update_organizer on public.trip_member
  for update to authenticated
  using ((select private.is_trip_organizer(trip_id)))
  with check ((select private.is_trip_organizer(trip_id)));

-- trip_item
create policy trip_item_select_member on public.trip_item
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy trip_item_insert_member on public.trip_item
  for insert to authenticated
  with check ((select private.is_trip_member(trip_id)));

create policy trip_item_update_member on public.trip_item
  for update to authenticated
  using ((select private.is_trip_member(trip_id)))
  with check ((select private.is_trip_member(trip_id)));

-- Sem login não há acesso direto a nenhuma tabela.
revoke all on public.trip, public.trip_member, public.trip_item from anon;

-- ---------------------------------------------------------------------------------------------
-- Publicação lida pelo serviço PowerSync (replicação lógica). Criada por migração, como manda a
-- regra do projeto. O serviço lê com credencial própria e não passa pelo RLS: a segunda barreira
-- são as regras de sincronização (prova/sincronizacao/).
-- ---------------------------------------------------------------------------------------------

create publication powersync for table public.trip, public.trip_member, public.trip_item;
