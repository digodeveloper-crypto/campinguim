-- B5 · Gastos (SPEC, seção 3, "Gastos"; seção 11, "Autorização"; seção 4, regra do gasto).
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração.
-- Dinheiro é inteiro em centavos, nunca número com vírgula.
--
-- Gastos, exclusões, marcações de "paguei" e o histórico do gasto vão ao aparelho (seção 3, "O que
-- chega ao aparelho"). A escrita vinda do aparelho passa por public.sync_apply, que confere quem
-- pode escrever (comprador e organizador; "paguei" só a família devedora, seção 8) e grava cada
-- alteração de valor ou regra em `expense_audit` (E2-15). A chave Pix NÃO vai ao aparelho:
-- é lida só pela função pix_key_get (seção 8, PRV-06).
--
-- Campos técnicos fora dos "campos principais" da seção 3 (o B4 cria igual; docs/servidor.md):
-- `id` em expense_exclusion, expense_payment e expense_audit; `trip_id` copiado do gasto nas três,
-- para as políticas e a sincronização filtrarem por viagem; `created_at`, `updated_at`,
-- `updated_by`, `deleted_at` nas tabelas sincronizadas.

-- ---------------------------------------------------------------------------------------------
-- expense: um gasto por item dividido.
-- ---------------------------------------------------------------------------------------------

create table public.expense (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trip (id) on delete cascade,
  item_id uuid not null references public.trip_item (id) on delete cascade,
  buyer_family_id uuid not null,
  estimate_cents integer check (estimate_cents is null or estimate_cents between 0 and 100000000),
  amount_cents integer check (amount_cents is null or amount_cents between 0 and 100000000),
  split_rule text not null default 'shares' check (split_rule in ('shares', 'per_family', 'adults_teens')),
  receipt_path text check (receipt_path is null or char_length(receipt_path) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (buyer_family_id, trip_id) references public.trip_family (id, trip_id),
  unique (id, trip_id)
);
alter table public.expense enable row level security;

create unique index expense_item_ativo_uq on public.expense (item_id) where deleted_at is null;

-- ---------------------------------------------------------------------------------------------
-- expense_exclusion: pessoa desmarcada daquele gasto (E2-12).
-- ---------------------------------------------------------------------------------------------

create table public.expense_exclusion (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  expense_id uuid not null,
  person_id uuid not null references public.trip_person (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (expense_id, trip_id) references public.expense (id, trip_id) on delete cascade
);
alter table public.expense_exclusion enable row level security;

create unique index expense_exclusion_ativa_uq on public.expense_exclusion (expense_id, person_id)
  where deleted_at is null;

-- ---------------------------------------------------------------------------------------------
-- expense_payment: marcação de "paguei". Não há confirmação bancária. `paid_marked_at` nulo é
-- "desmarcou".
-- ---------------------------------------------------------------------------------------------

create table public.expense_payment (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  expense_id uuid not null,
  family_id uuid not null,
  paid_marked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (expense_id, trip_id) references public.expense (id, trip_id) on delete cascade,
  foreign key (family_id, trip_id) references public.trip_family (id, trip_id) on delete cascade
);
alter table public.expense_payment enable row level security;

create unique index expense_payment_ativa_uq on public.expense_payment (expense_id, family_id)
  where deleted_at is null;

-- ---------------------------------------------------------------------------------------------
-- expense_audit: escrito só pelo servidor a cada alteração de valor ou regra (E2-15). Só cresce.
-- `actor_member_id` é a linha de membro de quem alterou (o nome some com a exclusão da conta).
-- ---------------------------------------------------------------------------------------------

create table public.expense_audit (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null,
  expense_id uuid not null,
  actor_member_id uuid references public.trip_member (id) on delete set null,
  field text not null check (field in ('estimate_cents', 'amount_cents', 'split_rule')),
  old_value text,
  new_value text,
  at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  deleted_at timestamptz,
  foreign key (expense_id, trip_id) references public.expense (id, trip_id) on delete cascade
);
alter table public.expense_audit enable row level security;

-- ---------------------------------------------------------------------------------------------
-- pix_key: uma por pessoa. Não vai ao aparelho. `key_type` sem lista fechada: a SPEC não define
-- os tipos (feature 2.9).
-- ---------------------------------------------------------------------------------------------

create table public.pix_key (
  profile_id uuid primary key references public.profile (id) on delete cascade,
  key text not null check (char_length(key) between 1 and 140),
  key_type text not null check (char_length(key_type) between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pix_key enable row level security;

create index expense_viagem_idx on public.expense (trip_id);
create index expense_exclusion_viagem_idx on public.expense_exclusion (trip_id);
create index expense_payment_viagem_idx on public.expense_payment (trip_id);
create index expense_audit_viagem_idx on public.expense_audit (trip_id);
create index expense_audit_gasto_idx on public.expense_audit (expense_id);

-- ---------------------------------------------------------------------------------------------
-- Chave Pix: o dono dela é comprador em alguma viagem de que quem chama é membro ativo
-- (seção 11: "Membros logados de viagem em que o dono é comprador"; PRV-06).
-- ---------------------------------------------------------------------------------------------

create function private.can_read_pix_key(p_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.expense e
    join public.trip_member dono
      on dono.trip_id = e.trip_id
     and dono.family_id = e.buyer_family_id
     and dono.profile_id = p_owner
     and dono.deleted_at is null
    join public.trip_member eu
      on eu.trip_id = e.trip_id
     and eu.profile_id = (select auth.uid())
     and eu.deleted_at is null
    where e.deleted_at is null
  );
$$;
revoke all on function private.can_read_pix_key(uuid) from public, anon;
grant execute on function private.can_read_pix_key(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Políticas (seção 11). Gastos: membros da viagem leem. Chave Pix: o dono lê e escreve; membros
-- logados de viagem em que o dono é comprador leem.
-- ---------------------------------------------------------------------------------------------

create policy expense_select_member on public.expense
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy expense_exclusion_select_member on public.expense_exclusion
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy expense_payment_select_member on public.expense_payment
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy expense_audit_select_member on public.expense_audit
  for select to authenticated
  using ((select private.is_trip_member(trip_id)));

create policy pix_key_select_owner_or_buyer_trip on public.pix_key
  for select to authenticated
  using (profile_id = (select auth.uid()) or (select private.can_read_pix_key(profile_id)));

create policy pix_key_insert_owner on public.pix_key
  for insert to authenticated
  with check (profile_id = (select auth.uid()));

create policy pix_key_update_owner on public.pix_key
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy pix_key_delete_owner on public.pix_key
  for delete to authenticated
  using (profile_id = (select auth.uid()));

-- ---------------------------------------------------------------------------------------------
-- Privilégios: gastos só leitura direta (escrita por sync_apply); chave Pix escrita pelo dono.
-- ---------------------------------------------------------------------------------------------

revoke all on public.expense, public.expense_exclusion, public.expense_payment, public.expense_audit,
  public.pix_key from anon, authenticated;
grant select on public.expense, public.expense_exclusion, public.expense_payment, public.expense_audit
  to authenticated;
grant select, insert, update, delete on public.pix_key to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Publicação do PowerSync: gastos vão ao aparelho; a chave Pix não.
-- ---------------------------------------------------------------------------------------------

alter publication powersync add table public.expense, public.expense_exclusion, public.expense_payment,
  public.expense_audit;
