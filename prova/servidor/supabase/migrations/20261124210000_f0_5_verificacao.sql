-- F0-5 · Verificação do aparelho, parte local (item 4 da prova; SPEC, seções 3, 8 e 11)
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração.
-- Estas tabelas não têm NENHUMA política: o app não lê nem escreve nelas. Só a função do
-- servidor `prova-chamada-protegida` chega nelas, com a chave de serviço (SPEC, seção 11).
-- Nada aqui guarda nome, e-mail ou o token em si: só o identificador aleatório da instalação e
-- o resumo (SHA-256) dos tokens já usados.

-- Um registro por instalação do app (SPEC, seção 3, `device`).
create table public.device (
  install_id text primary key check (install_id ~ '^[A-Za-z0-9-]{16,64}$'),
  platform text not null check (platform in ('android', 'ios')),
  integrity_ok_at timestamptz,
  first_seen_at timestamptz not null default now()
);
alter table public.device enable row level security;

-- Tokens já usados, para recusar repetição (replay). Guarda só o resumo, nunca o token.
create table public.integrity_token_used (
  token_sha256 text primary key check (token_sha256 ~ '^[0-9a-f]{64}$'),
  used_at timestamptz not null default now()
);
alter table public.integrity_token_used enable row level security;

-- Registro de cada tentativa, com o motivo da recusa (operação interna; base do DEF-03).
create table public.integrity_attempt (
  id uuid primary key default gen_random_uuid(),
  install_id text not null check (char_length(install_id) <= 64),
  result text not null check (result in ('accepted', 'refused')),
  reason text not null check (reason ~ '^[a-z_]{1,64}$'),
  created_at timestamptz not null default now()
);
alter table public.integrity_attempt enable row level security;

-- Sem política e sem permissão para o app (anon e authenticated).
revoke all on public.device, public.integrity_token_used, public.integrity_attempt from anon, authenticated;
grant select, insert, update on public.device to service_role;
grant select, insert on public.integrity_token_used, public.integrity_attempt to service_role;
