-- B5 · Apoio: aparelho, eventos e premissas (SPEC, seção 3, "Apoio"; seção 11); exclusão de conta
-- (seção 3). Regra do projeto: toda tabela nasce com RLS ativo, nesta mesma migração.
--
-- `device`, `event` e `config` são só de operação interna (seção 11): RLS ativo, nenhuma política
-- para o app e nenhum privilégio para anon e authenticated. Não vão ao aparelho.

-- ---------------------------------------------------------------------------------------------
-- device: um por instalação; base dos limites por aparelho (DEF-03).
-- `profile_id` (fora dos campos principais da seção 3) liga a marca de "aparelho verificado" à
-- conta que fez a verificação, além do `install_id` (ponto J4 da prova técnica: na prova, a marca
-- presa só ao `install_id` funcionava como senha do portador).
-- ---------------------------------------------------------------------------------------------

create table public.device (
  install_id uuid primary key,
  platform text not null check (platform in ('android', 'ios')),
  profile_id uuid references public.profile (id) on delete set null,
  integrity_ok_at timestamptz,
  first_seen_at timestamptz not null default now()
);
alter table public.device enable row level security;

-- ---------------------------------------------------------------------------------------------
-- event: eventos da seção 12. Sem texto livre do usuário (o esquema das propriedades é conferido
-- por events_ingest, feature da B6/1.11).
-- ---------------------------------------------------------------------------------------------

create table public.event (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name ~ '^[a-z_]{1,40}$'),
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object'),
  at timestamptz not null,
  install_id uuid,
  profile_id uuid references public.profile (id) on delete set null
);
alter table public.event enable row level security;

create index event_nome_quando_idx on public.event (name, at);

-- ---------------------------------------------------------------------------------------------
-- config: todas as premissas numéricas (PRD, seção 16; SPEC, seção 15, "Premissas numéricas a
-- calibrar", e as tabelas de limites das seções 8 e 10). Mudam sem nova versão do app.
-- Só valores que o PRD ou a SPEC trazem. Ficam de fora, à espera das listas da seção 15:
-- feriados nacionais, períodos de férias e operadoras de celular. As fórmulas de gás, gelo,
-- carvão e demais ficam no catálogo (B3), como a SPEC manda ("conforme o catálogo").
-- ---------------------------------------------------------------------------------------------

create table public.config (
  key text primary key check (key ~ '^[a-z0-9_.]{1,80}$'),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.config enable row level security;

insert into public.config (key, value) values
  -- Faixas etárias e cotas: 12+ cota inteira, 5 a 11 meia, menor de 5 isento (PRD, seções 10 e 16).
  -- Em meias cotas, como manda a SPEC (seção 9, "Cotas").
  ('expense.half_shares_by_age_band', '{"adult": 2, "teen": 2, "child": 1, "toddler": 0}'),
  -- Lista (SPEC, seção 15).
  ('list.water_liters_per_person_day', '3'),
  ('list.leftover_reduction_percent', '25'),
  -- Ficha do camping (PRD, seções 10 e 16; SPEC, seções 6 e 15).
  ('camping.shower_attention_tents_per_shower_above', '15'),
  ('camping.capacity_upper_bound_tents', '{"ate_10": 10, "11_a_25": 25, "26_a_50": 50, "mais_de_50": 60}'),
  ('camping.owner_report_weight', '0.5'),
  ('camping.fact_recent_max_months', '6'),
  ('camping.fact_valid_max_months', '12'),
  ('camping.attention_min_distinct_accounts', '2'),
  ('camping.similar_name_min_similarity', '0.6'),
  ('camping.merge_queue_min_similarity', '0.45'),
  -- Convite e retrato (SPEC, seções 3, 4 e 15).
  ('invite.validity_days', '30'),
  ('snapshot.stale_after_days', '7'),
  ('sync.group_propagation_max_seconds', '5'),
  -- Limites de consulta (SPEC, seção 8, "Limites").
  ('limits.camping_search_per_device_per_hour', '30'),
  ('limits.distinct_campings_per_device_per_day', '10'),
  ('limits.guest_join_per_ip_per_hour', '20'),
  ('limits.counted_report_trips_per_camping_per_month', '2'),
  ('limits.fact_history_max_rows', '20'),
  -- Retenção por pico de relatos (FRD-05; SPEC, seção 11): mais de 5, de contas com menos de 7
  -- dias, em 72 horas.
  ('antifraud.hold_reports_above', '5'),
  ('antifraud.hold_account_age_below_days', '7'),
  ('antifraud.hold_window_hours', '72'),
  -- Verificação do aparelho, provisórias até a F0-6 (decisão D3 de 26/11/2026; SPEC, seção 15).
  ('device.proof_max_age_seconds', '300'),
  ('device.proof_future_tolerance_seconds', '60'),
  ('device.verified_validity_hours', '24'),
  -- Horários e limites dos avisos (SPEC, seção 10; PRD, seção 19, RET-04 a RET-07, RET-11).
  ('notify.items_to_pack_days_before', '3'),
  ('notify.items_to_pack_hour', '19'),
  ('notify.eve_hour', '18'),
  ('notify.return_checklist_hour', '8'),
  ('notify.at_home_hour', '20'),
  ('notify.dry_tent_days_after', '2'),
  ('notify.group_pending_max_per_day', '1'),
  ('notify.group_changes_batch_minutes', '30'),
  ('notify.repeat_trip_days_before', '10'),
  ('notify.repeat_trip_max_per_year', '4'),
  ('notify.camping_news_max_per_month', '1'),
  ('notify.reactivation_suspend_after_ignored', '3'),
  ('account.inactive_warning_months', '23'),
  ('account.inactive_delete_months', '24'),
  ('account.inactive_warning_days_before', '30');

-- ---------------------------------------------------------------------------------------------
-- Ajustes do servidor que NÃO são premissas de produto e variam por ambiente. Esquema interno,
-- sem política: só o servidor lê. Vazio nas migrações, isto é, em produção tudo fica desligado.
-- O ambiente local liga o que precisa pelos dados de exemplo (supabase/dados-de-exemplo/), que o
-- `supabase db push` de produção não aplica.
-- ---------------------------------------------------------------------------------------------

create table private.server_setting (
  key text primary key check (key in ('environment', 'accept_dev_device_proof')),
  value text not null
);
alter table private.server_setting enable row level security;
revoke all on private.server_setting from public, anon, authenticated;

-- A prova de desenvolvimento do aparelho só vale com o ambiente marcado "local" E a chave ligada
-- (SPEC, seção 11). Qualquer outra combinação, inclusive a tabela vazia, é produção: desligada.
create function private.dev_device_proof_accepted()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select value = 'local' from private.server_setting where key = 'environment'), false)
     and coalesce((select value = 'true' from private.server_setting where key = 'accept_dev_device_proof'), false);
$$;
revoke all on function private.dev_device_proof_accepted() from public, anon, authenticated;

create function private.config_number(p_key text)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select (value #>> '{}')::numeric from public.config where key = p_key;
$$;
revoke all on function private.config_number(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------------------------
-- Verificação do aparelho: esboço (seção 11, DEF-04, FRD-04). A validação real com o Google fica
-- na feature 3.7 (função do servidor em TypeScript, que chama private.mark_device_verified).
-- A marca vale para o par (install_id, conta): outra conta no mesmo aparelho começa sem marca.
-- ---------------------------------------------------------------------------------------------

create function private.mark_device_verified(p_install_id uuid, p_profile_id uuid, p_platform text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_at timestamptz := now();
begin
  insert into public.device (install_id, platform, profile_id, integrity_ok_at)
  values (p_install_id, p_platform, p_profile_id, v_at)
  on conflict (install_id) do update
    set platform = excluded.platform, profile_id = excluded.profile_id, integrity_ok_at = v_at;
  return v_at;
end;
$$;
revoke all on function private.mark_device_verified(uuid, uuid, text) from public, anon, authenticated;

-- Aparelho verificado para quem chama: mesma instalação, mesma conta e dentro da validade.
create function private.device_is_verified(p_install_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.device d
    where d.install_id = p_install_id
      and d.profile_id = (select auth.uid())
      and d.integrity_ok_at is not null
      and d.integrity_ok_at > now() - make_interval(
        hours => coalesce(private.config_number('device.verified_validity_hours'), 0)::integer)
  );
$$;
revoke all on function private.device_is_verified(uuid) from public, anon;
grant execute on function private.device_is_verified(uuid) to authenticated;

-- device_register (contrato da seção 8): registra a instalação e renova a marca de verificado.
-- Entrada: install_id, plataforma e a prova de integridade ({"kind": "dev"} no ambiente local;
-- {"kind": "play_integrity", "token": ...} a partir da feature 3.7). Saída: {ok, code?, verified_until?}.
-- Exige login: a marca é da conta (J4). Destino sem conta (PRD, seção 16) fica para a 3.7.
create function public.device_register(p_install_id uuid, p_platform text, p_proof jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_kind text := p_proof ->> 'kind';
  v_at timestamptz;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if p_install_id is null or p_platform is null or p_platform not in ('android', 'ios') then
    return jsonb_build_object('ok', false, 'code', 'validation');
  end if;

  -- Registra a instalação. Se outra conta estava nela, a marca anterior deixa de valer.
  insert into public.device as d (install_id, platform, profile_id)
  values (p_install_id, p_platform, v_uid)
  on conflict (install_id) do update
    set platform = excluded.platform,
        profile_id = excluded.profile_id,
        integrity_ok_at = case when d.profile_id is distinct from excluded.profile_id
                               then null else d.integrity_ok_at end;

  if v_kind = 'dev' and private.dev_device_proof_accepted() then
    v_at := private.mark_device_verified(p_install_id, v_uid, p_platform);
    return jsonb_build_object(
      'ok', true,
      'verified_until', v_at + make_interval(
        hours => coalesce(private.config_number('device.verified_validity_hours'), 0)::integer));
  end if;

  -- Prova de desenvolvimento fora do ambiente local, prova real ainda não validada (3.7) ou prova
  -- ausente: recusa.
  return jsonb_build_object('ok', false, 'code', 'integrity_required');
end;
$$;
revoke all on function public.device_register(uuid, text, jsonb) from public, anon;
grant execute on function public.device_register(uuid, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Exclusão de conta (seção 3; E2-17, RET-11). Apagar o usuário do login apaga `profile`
-- (chave estrangeira em cascata), e com ele a `pix_key`. Antes disso, este gatilho:
--   - em `trip_member`, troca o nome por "participante" e solta a conta (os valores do grupo ficam);
--   - em `fact_report`, deixa `profile_id` nulo e marca o relato como anônimo.
-- As demais referências à pessoa ficam nulas pelas próprias chaves estrangeiras.
-- "participante" é o valor que a seção 3 manda gravar no lugar do nome, não um texto de tela.
-- ---------------------------------------------------------------------------------------------

create function private.anonymize_deleted_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.trip_member
     set display_name = 'participante', profile_id = null, updated_at = now(), updated_by = null
   where profile_id = old.id;
  update public.fact_report
     set profile_id = null, anonymous = true
   where profile_id = old.id;
  return old;
end;
$$;
revoke all on function private.anonymize_deleted_profile() from public, anon, authenticated;

create trigger profile_anonymize_before_delete
  before delete on public.profile
  for each row execute function private.anonymize_deleted_profile();

-- ---------------------------------------------------------------------------------------------
-- Sem política para o app e sem privilégio para anon e authenticated.
-- ---------------------------------------------------------------------------------------------

revoke all on public.device, public.event, public.config from anon, authenticated;
