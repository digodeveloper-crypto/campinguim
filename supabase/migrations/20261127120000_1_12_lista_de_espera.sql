-- 1.12 · Lista de espera do site (SPEC, seção 8, `waitlist_join`; seção 3, "Apoio"; seção 11).
-- Decisão R3 do responsável (27/11/2026): a lista guarda só o e-mail normalizado e a data do
-- consentimento, em tabela própria, com RLS ativo e nenhuma política; só a função `waitlist_join`
-- (security definer) escreve; ninguém lê pelo app; fora da publicação do PowerSync (não vai ao
-- aparelho, DEF-11). Consentimento obrigatório; sem confirmação por e-mail. É a única tabela do
-- servidor com e-mail fora do login: exceção explícita na SPEC, seção 11 ("Privacidade").
-- A lista promete um único aviso por e-mail, quando o app estiver na loja (decisão do piloto).
-- Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração.

-- ---------------------------------------------------------------------------------------------
-- waitlist: um e-mail por pessoa, já normalizado (sem espaços nas pontas, em minúsculas).
-- ---------------------------------------------------------------------------------------------

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique
    check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
revoke all on public.waitlist from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Limite de chamadas por endereço de rede (SPEC, seção 8, "Limites"; DEF-03). Guarda só o resumo
-- (SHA-256) do endereço e a hora, nunca o endereço nem o e-mail, e nada liga uma tentativa a um
-- e-mail. As tentativas com mais de uma hora são apagadas a cada chamada.
-- ---------------------------------------------------------------------------------------------

create table private.waitlist_attempt (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  at timestamptz not null default now()
);
alter table private.waitlist_attempt enable row level security;
revoke all on private.waitlist_attempt from public, anon, authenticated;

create index waitlist_attempt_ip_quando_idx on private.waitlist_attempt (ip_hash, at);
create index waitlist_attempt_quando_idx on private.waitlist_attempt (at);

-- Premissa nova em `config` (mesmo valor inicial do limite de entradas de convidado, seção 8;
-- muda sem nova versão do app).
insert into public.config (key, value) values ('limits.waitlist_join_per_ip_per_hour', '20');

-- Endereço de rede de quem chama, lido do cabeçalho que a API recebe. Vale o ÚLTIMO endereço de
-- `x-forwarded-for`: é o que o portão da API (Kong) acrescenta, e quem chama não consegue
-- escolher; os anteriores vêm de quem chama e podem ser inventados. Sem cabeçalho (chamada direta
-- ao banco), um valor fixo: todas essas chamadas dividem o mesmo limite.
-- O servidor hospedado precisa ser conferido na publicação (docs/infra.md, tarefa C da 1.12).
create function private.waitlist_client_ip()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    nullif(btrim((regexp_split_to_array(
      coalesce(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-forwarded-for', ''), ','))[
        cardinality(regexp_split_to_array(
          coalesce(nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-forwarded-for', ''), ','))]), ''),
    'sem-endereco');
$$;
revoke all on function private.waitlist_client_ip() from public, anon, authenticated;

-- Mesma regra da página (apps/web/src/site/listaDeEspera.ts): uma arroba, nada de espaço, algo
-- antes, e um domínio com ponto; até 254 caracteres, e até 64 antes da arroba.
create function private.waitlist_email_is_valid(p_email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_email is not null
     and char_length(p_email) <= 254
     and p_email ~ '^[^[:space:]@]{1,64}@[^[:space:]@]+\.[^[:space:]@.]+$'
     and p_email !~ '@[^@]*\.\.'
     and p_email !~ '@\.';
$$;
revoke all on function private.waitlist_email_is_valid(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- waitlist_join (contrato da seção 8): entrada `email` e o consentimento; saída `{ok: true}`.
-- Sem conta. Recusas: `{ok: false, code: 'validation'}` (sem consentimento ou e-mail inválido) e
-- `{ok: false, code: 'rate_limited'}` (acima do limite por endereço de rede, que também grava um
-- evento interno, DEF-03). A mensagem em português fica no arquivo de textos da página (NF-09).
-- E-mail repetido: a mesma resposta do primeiro, sem duplicar e sem dizer que já existia.
-- A resposta nunca traz e-mail nem a lista. `request_id` é aceito (seção 8, "Regras de todas as
-- funções"); a repetição já é inofensiva, porque o e-mail é único.
-- ---------------------------------------------------------------------------------------------

create function public.waitlist_join(p_email text, p_consent boolean, p_request_id uuid default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_ip_hash text := encode(sha256(convert_to(private.waitlist_client_ip(), 'UTF8')), 'hex');
  v_limite integer := coalesce(private.config_number('limits.waitlist_join_per_ip_per_hour'), 0)::integer;
  v_email text := lower(btrim(p_email));
  v_tentativas bigint;
begin
  -- Chamadas do mesmo endereço passam uma por vez, para a contagem do limite não falhar.
  perform pg_advisory_xact_lock(hashtextextended('waitlist_join:' || v_ip_hash, 0));
  delete from private.waitlist_attempt where at < now() - interval '1 hour';

  v_tentativas := (select count(*) from private.waitlist_attempt where ip_hash = v_ip_hash);
  if v_tentativas >= v_limite then
    -- Só a primeira recusa da hora fica registrada (uma tentativa a mais e um evento interno), para
    -- quem insiste não encher o banco.
    if v_tentativas = v_limite then
      insert into private.waitlist_attempt (ip_hash) values (v_ip_hash);
      insert into public.event (name, props, at) values ('rate_limited', '{"function": "waitlist_join"}', now());
    end if;
    return jsonb_build_object('ok', false, 'code', 'rate_limited');
  end if;
  insert into private.waitlist_attempt (ip_hash) values (v_ip_hash);

  if p_consent is distinct from true or not private.waitlist_email_is_valid(v_email) then
    return jsonb_build_object('ok', false, 'code', 'validation');
  end if;

  insert into public.waitlist (email, consent_at) values (v_email, now())
  on conflict (email) do nothing;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.waitlist_join(text, boolean, uuid) from public;
grant execute on function public.waitlist_join(text, boolean, uuid) to anon, authenticated;
