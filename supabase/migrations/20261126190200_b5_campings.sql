-- B5 · Campings, só no servidor (SPEC, seção 3, "Campings"; seção 6; seção 11).
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração.
--
-- Nenhuma destas tabelas tem política para o app e nenhuma entra na publicação do PowerSync:
-- campings, relatos, resumos, sugestões, fila de fusão e insumo do aprendizado só são lidos e
-- escritos pelas funções da seção 8 (DEF-01, DEF-05, DEF-10). O aparelho recebe só o retrato da
-- viagem (trip_camping_snapshot). Sem política, ninguém lê nem escreve pela API; além disso, os
-- privilégios de anon e authenticated são retirados.
--
-- Campos técnicos fora dos "campos principais" da seção 3: `id` em camping_alias, merge_candidate
-- e list_feedback; `created_at` onde a ordem importa.

-- ---------------------------------------------------------------------------------------------
-- city: lista oficial do IBGE (E3-20), carregada pela feature 3.1.
-- ---------------------------------------------------------------------------------------------

create table public.city (
  ibge_code text primary key check (ibge_code ~ '^[0-9]{7}$'),
  name text not null check (char_length(name) between 1 and 80),
  state text not null check (state ~ '^[A-Z]{2}$')
);
alter table public.city enable row level security;

-- ---------------------------------------------------------------------------------------------
-- camping. A busca devolve só id, nome e cidade (DEF-01). Valores de `status` ficam para a
-- feature 3.1 (a SPEC não os lista).
-- ---------------------------------------------------------------------------------------------

create table public.camping (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  name_normalized text not null check (char_length(name_normalized) between 1 and 120),
  city_ibge_code text not null references public.city (ibge_code),
  created_by uuid references public.profile (id) on delete set null,
  merged_into_id uuid references public.camping (id),
  status text check (status is null or char_length(status) between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (merged_into_id is null or merged_into_id <> id)
);
alter table public.camping enable row level security;

-- Mesmo camping = nome normalizado igual na mesma cidade (seção 6, "Duplicados").
create unique index camping_nome_cidade_uq on public.camping (city_ibge_code, name_normalized)
  where merged_into_id is null;

-- ---------------------------------------------------------------------------------------------
-- camping_alias: nomes alternativos e nomes vindos de fusão (E3-22).
-- ---------------------------------------------------------------------------------------------

create table public.camping_alias (
  id uuid primary key default gen_random_uuid(),
  camping_id uuid not null references public.camping (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  name_normalized text not null check (char_length(name_normalized) between 1 and 120),
  created_at timestamptz not null default now()
);
alter table public.camping_alias enable row level security;

-- ---------------------------------------------------------------------------------------------
-- fact_report: um relato de campista. Único por viagem e fato (FRD-03). `visited_month` guarda só
-- ano e mês (E3-19): sempre o dia 1. As chaves são as da seção 6; os valores de cada opção
-- (e os de `occasion` e `trip_kind`) ficam para a feature 3.2, que os fixa no catálogo.
-- Exclusão de conta: `profile_id` fica nulo e o relato passa a anônimo (seção 3).
-- ---------------------------------------------------------------------------------------------

create table public.fact_report (
  id uuid primary key default gen_random_uuid(),
  camping_id uuid not null references public.camping (id),
  trip_id uuid references public.trip (id) on delete set null,
  profile_id uuid references public.profile (id) on delete set null,
  fact_key text not null check (
    fact_key in (
      'energia_voltagem', 'energia_tomada', 'chuveiros_qtd', 'capacidade', 'agua_quente',
      'churrasco', 'pet', 'som_horario', 'som_cumprido', 'piscina', 'limpeza'
    )
    or fact_key ~ '^sinal_[a-z0-9_]{1,30}$'
  ),
  value text not null check (char_length(value) between 1 and 40),
  source text not null default 'camper' check (source in ('camper', 'owner_via_camper')),
  occasion text check (occasion is null or char_length(occasion) between 1 and 30),
  trip_kind text check (trip_kind is null or char_length(trip_kind) between 1 and 30),
  visited_month date not null check (extract(day from visited_month) = 1),
  anonymous boolean not null default false,
  held boolean not null default false,
  counts boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.fact_report enable row level security;

create unique index fact_report_viagem_fato_uq on public.fact_report (trip_id, fact_key)
  where trip_id is not null;
create index fact_report_camping_idx on public.fact_report (camping_id, fact_key);

-- ---------------------------------------------------------------------------------------------
-- fact_summary: calculada pelo servidor a partir de fact_report (feature 3.2).
-- ---------------------------------------------------------------------------------------------

create table public.fact_summary (
  camping_id uuid not null references public.camping (id) on delete cascade,
  fact_key text not null,
  current_value text,
  recent_count integer not null default 0 check (recent_count >= 0),
  last_month date check (last_month is null or extract(day from last_month) = 1),
  last_label text,
  divergence jsonb,
  -- Ao menos 2 relatos de contas diferentes concordando (seção 6, passo 5). Pedido pela B3.
  confirmed boolean not null default false,
  freshness text,
  updated_at timestamptz not null default now(),
  primary key (camping_id, fact_key)
);
alter table public.fact_summary enable row level security;

-- ---------------------------------------------------------------------------------------------
-- suggestion: só consulta interna (E3-26). Texto opcional com até 200 caracteres (seção 6).
-- ---------------------------------------------------------------------------------------------

create table public.suggestion (
  id uuid primary key default gen_random_uuid(),
  camping_id uuid not null references public.camping (id),
  trip_id uuid references public.trip (id) on delete set null,
  profile_id uuid references public.profile (id) on delete set null,
  option_keys text[] not null default '{}',
  text text check (text is null or char_length(text) <= 200),
  created_at timestamptz not null default now()
);
alter table public.suggestion enable row level security;

-- ---------------------------------------------------------------------------------------------
-- merge_candidate: fila de fusão (E3-23, E3-24). Só operação interna.
-- ---------------------------------------------------------------------------------------------

create table public.merge_candidate (
  id uuid primary key default gen_random_uuid(),
  camping_a uuid not null references public.camping (id),
  camping_b uuid not null references public.camping (id),
  score numeric check (score is null or (score >= 0 and score <= 1)),
  status text check (status is null or char_length(status) between 1 and 20),
  reviewed_by uuid,
  -- Registro da fusão aprovada, para desfazer (E3-24, D5). Pedido pela B3.
  merge_record jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (camping_a <> camping_b),
  unique (camping_a, camping_b)
);
alter table public.merge_candidate enable row level security;

-- ---------------------------------------------------------------------------------------------
-- list_feedback: insumo do aprendizado da lista (E1-11), escrito pelo servidor.
-- ---------------------------------------------------------------------------------------------

create table public.list_feedback (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trip (id) on delete set null,
  catalog_key text not null check (catalog_key ~ '^[a-z0-9_]{1,60}$'),
  kind text not null check (kind in ('missing', 'leftover')),
  created_at timestamptz not null default now()
);
alter table public.list_feedback enable row level security;

create index list_feedback_chave_idx on public.list_feedback (catalog_key);

-- ---------------------------------------------------------------------------------------------
-- Referências da viagem ao camping (as tabelas da viagem nasceram antes desta migração).
-- ---------------------------------------------------------------------------------------------

alter table public.trip
  add constraint trip_camping_id_fkey foreign key (camping_id) references public.camping (id);
alter table public.trip_camping_snapshot
  add constraint trip_camping_snapshot_camping_id_fkey foreign key (camping_id) references public.camping (id);

-- ---------------------------------------------------------------------------------------------
-- Sem política para o app (seção 11) e sem privilégio para anon e authenticated.
-- ---------------------------------------------------------------------------------------------

revoke all on public.city, public.camping, public.camping_alias, public.fact_report, public.fact_summary,
  public.suggestion, public.merge_candidate, public.list_feedback
  from anon, authenticated;
