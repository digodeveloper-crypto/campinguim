// Premissas em `config` (SPEC, seção 15; PRD, seção 16) e dados de exemplo do ambiente local
// (SPEC, seção 13, "Dados de teste"), carregados por `npm run ambiente:zerar`.
import { describe, expect, it } from 'vitest';

import { comBanco } from './apoio';

const CARLA = '639868af-d201-4b8c-9784-5bd80e68e4b0';
const VIAGEM_CARLA = '85fd7af8-93e5-406b-80e9-be617938afe0';
const GRUPO = '8d84183b-0319-4aa5-aff2-32d2f71ef088';

describe('config: premissas numéricas', () => {
  it('traz os valores do PRD e da SPEC', async () => {
    const config = await comBanco(async (c) => Object.fromEntries((await c.query('select key, value from public.config')).rows.map((r) => [r.key, r.value])));
    expect(config).toMatchObject({
      'expense.half_shares_by_age_band': { adult: 2, teen: 2, child: 1, toddler: 0 },
      'list.water_liters_per_person_day': 3,
      'list.leftover_reduction_percent': 25,
      'camping.shower_attention_tents_per_shower_above': 15,
      'camping.capacity_upper_bound_tents': { ate_10: 10, '11_a_25': 25, '26_a_50': 50, mais_de_50: 60 },
      'camping.owner_report_weight': 0.5,
      'camping.fact_recent_max_months': 6,
      'camping.fact_valid_max_months': 12,
      'camping.attention_min_distinct_accounts': 2,
      'camping.similar_name_min_similarity': 0.6,
      'camping.merge_queue_min_similarity': 0.45,
      'invite.validity_days': 30,
      'snapshot.stale_after_days': 7,
      'sync.group_propagation_max_seconds': 5,
      'limits.camping_search_per_device_per_hour': 30,
      'limits.distinct_campings_per_device_per_day': 10,
      'limits.guest_join_per_ip_per_hour': 20,
      'limits.counted_report_trips_per_camping_per_month': 2,
      'limits.fact_history_max_rows': 20,
      // Lista de espera do site (1.12): mesmo valor inicial do limite de convidado.
      'limits.waitlist_join_per_ip_per_hour': 20,
      'antifraud.hold_reports_above': 5,
      'antifraud.hold_account_age_below_days': 7,
      'antifraud.hold_window_hours': 72,
      'device.proof_max_age_seconds': 300,
      'device.proof_future_tolerance_seconds': 60,
      'device.verified_validity_hours': 24,
    });
    expect(Object.keys(config).length).toBe(41);
  });
});

describe('dados de exemplo', () => {
  it('a família da Carla: viagem de referência com 2 adultos, 2 crianças e 1 pet, frio, 2 noites', async () => {
    const r = await comBanco(async (c) => ({
      viagem: (await c.query('select kind, nights, climate, rain, is_group, start_date from public.trip where id = $1', [VIAGEM_CARLA])).rows[0],
      familias: (await c.query('select name, pets from public.trip_family where trip_id = $1', [VIAGEM_CARLA])).rows,
      faixas: (await c.query('select age_band, count(*)::int as n from public.trip_person where trip_id = $1 group by 1 order by 1', [VIAGEM_CARLA])).rows,
      organizadora: (await c.query('select profile_id, role from public.trip_member where trip_id = $1', [VIAGEM_CARLA])).rows,
    }));
    expect(r.viagem).toEqual({ kind: 'tent_car', nights: 2, climate: 'cold', rain: false, is_group: false, start_date: null });
    expect(r.familias).toEqual([{ name: 'Carla e Rafael', pets: 1 }]);
    expect(r.faixas).toEqual([
      { age_band: 'adult', n: 2 },
      { age_band: 'child', n: 2 },
    ]);
    expect(r.organizadora).toEqual([{ profile_id: CARLA, role: 'organizer' }]);
  });

  it('o grupo de três famílias: meias cotas do caso C1 (H = 14), fogareiro triplicado e a carne de R$ 420,00', async () => {
    const r = await comBanco(async (c) => ({
      meiasCotas: (
        await c.query(
          `select f.name, sum(((select value from public.config where key = 'expense.half_shares_by_age_band') ->> p.age_band)::int)::int as h
             from public.trip_family f join public.trip_person p on p.family_id = f.id
            where f.trip_id = $1 group by 1 order by 1`,
          [GRUPO],
        )
      ).rows,
      fogareiro: (await c.query(`select count(*)::int as n from public.item_claim c join public.trip_item i on i.id = c.item_id where i.trip_id = $1 and i.name = 'Fogareiro'`, [GRUPO])).rows[0],
      semDono: (await c.query(`select i.name from public.trip_item i where i.trip_id = $1 and not exists (select 1 from public.item_claim c where c.item_id = i.id) order by 1`, [GRUPO])).rows,
      gasto: (await c.query(`select e.amount_cents, e.split_rule, f.name as comprador from public.expense e join public.trip_family f on f.id = e.buyer_family_id where e.trip_id = $1`, [GRUPO])).rows,
      membros: (await c.query(`select display_name, role, profile_id is null as sem_conta from public.trip_member where trip_id = $1 order by display_name`, [GRUPO])).rows,
    }));
    expect(r.meiasCotas).toEqual([
      { name: 'Bruno e Paula', h: 4 },
      { name: 'Carla e Rafael', h: 6 },
      { name: 'Diego e Lívia', h: 4 },
    ]);
    expect(r.fogareiro).toEqual({ n: 3 });
    expect(r.semDono).toEqual([{ name: 'Isqueiro' }, { name: 'Saco de lixo' }]);
    expect(r.gasto).toEqual([{ amount_cents: 42000, split_rule: 'shares', comprador: 'Bruno e Paula' }]);
    expect(r.membros).toEqual([
      { display_name: 'Bruno', role: 'member', sem_conta: false },
      { display_name: 'Carla', role: 'organizer', sem_conta: false },
      { display_name: 'Diego', role: 'guest', sem_conta: true },
    ]);
  });

  it('pessoas de teste só em domínio reservado para teste, sem senha', async () => {
    const r = await comBanco(async (c) => (await c.query(`select email, encrypted_password from auth.users where id = any($1) order by email`, [[CARLA, '42942872-cff4-4736-b2b7-ffde33cd7bd9']])).rows);
    expect(r).toEqual([
      { email: 'bruno@pessoas-de-teste.test', encrypted_password: '' },
      { email: 'carla@pessoas-de-teste.test', encrypted_password: '' },
    ]);
  });
});

describe('dados de exemplo: campings (SPEC, seções 6, 9 e 13)', () => {
  // Retrato de referência da seção 9, nos códigos das opções do motor da B3.
  const RETRATO: Record<string, string> = {
    energia_voltagem: '220v',
    energia_tomada: 'longe',
    chuveiros_qtd: '1',
    capacidade: '11_a_25',
    churrasco: 'area_comum',
    pet: 'aceita',
    som_horario: '22h',
    piscina: '10h',
  };

  it('dois campings fictícios em cidades reais, com o código do IBGE', async () => {
    const r = await comBanco(async (c) => (await c.query(
      `select k.name, k.name_normalized, c.ibge_code, c.name as cidade, c.state
         from public.camping k join public.city c on c.ibge_code = k.city_ibge_code order by k.name`)).rows);
    expect(r).toEqual([
      { name: 'Camping Recanto das Águas', name_normalized: 'recanto aguas', ibge_code: '3165206', cidade: 'São Tomé das Letras', state: 'MG' },
      { name: 'Sítio Pedra Lisa', name_normalized: 'sitio pedra lisa', ibge_code: '3513603', cidade: 'Cunha', state: 'SP' },
    ]);
  });

  it('Recanto das Águas: 7 relatos de 7 contas, e cada fato do retrato confirmado (2 contas ou mais) e recente', async () => {
    const r = await comBanco(async (c) => ({
      contas: (await c.query(`select count(distinct r.profile_id)::int as contas, count(distinct r.trip_id)::int as viagens
                                from public.fact_report r join public.camping k on k.id = r.camping_id where k.name = 'Camping Recanto das Águas'`)).rows[0],
      fatos: (await c.query(`select r.fact_key, array_agg(distinct r.value) as valores, count(distinct r.profile_id)::int as contas,
                                    max(r.visited_month)::text as ultimo
                               from public.fact_report r join public.camping k on k.id = r.camping_id
                              where k.name = 'Camping Recanto das Águas' and r.counts and not r.held
                              group by 1 order by 1`)).rows,
    }));
    expect(r.contas).toEqual({ contas: 7, viagens: 7 });
    const porFato = Object.fromEntries(r.fatos.map((f) => [f.fact_key as string, f]));
    for (const [fato, valor] of Object.entries(RETRATO)) {
      expect(porFato[fato]?.valores, fato).toEqual([valor]);
      expect(porFato[fato]?.contas, fato).toBeGreaterThanOrEqual(2);
      // "recente": o último relato tem até 6 meses (referência: novembro de 2026)
      expect(porFato[fato]?.ultimo >= '2026-05-01', fato).toBe(true);
    }
    expect(Object.keys(porFato).sort()).toEqual([...Object.keys(RETRATO), 'som_cumprido'].sort());
  });

  it('"som cumprido": 6 vezes "sim", e a última é da Carla, em novembro de 2026 (P-08)', async () => {
    const r = await comBanco(async (c) => (await c.query(
      `select r.value, r.visited_month::text as mes, p.display_name
         from public.fact_report r join public.profile p on p.id = r.profile_id
        where r.fact_key = 'som_cumprido' order by r.visited_month`)).rows);
    expect(r.length).toBe(6);
    expect(r.every((x) => x.value === 'sim')).toBe(true);
    expect(r.at(-1)).toEqual({ value: 'sim', mes: '2026-11-01', display_name: 'Carla' });
  });

  it('os relatos respeitam FRD-01, FRD-02, FRD-03 e FRD-05, e o limite de perguntas por viagem', async () => {
    const r = await comBanco(async (c) => (await c.query(
      `select t.id, t.status, t.end_date < current_date as voltou, t.camping_id = r.camping_id as mesmo_camping,
              t.created_at::date < t.start_date as criada_antes, r.visited_month = date_trunc('month', t.start_date)::date as mes_da_ida,
              count(*)::int as perguntas, bool_and(r.counts and not r.held) as contam,
              bool_and(u.created_at < r.created_at - interval '7 days') as conta_antiga,
              exists (select 1 from public.trip_item i where i.trip_id = t.id and i.pack_state <> 'todo') as item_marcado
         from public.fact_report r join public.trip t on t.id = r.trip_id join auth.users u on u.id = r.profile_id
        group by t.id, r.camping_id, r.visited_month order by t.start_date`)).rows);
    expect(r.length).toBe(7);
    for (const v of r) {
      expect(v).toMatchObject({ status: 'closed', voltou: true, mesmo_camping: true, criada_antes: true, mes_da_ida: true, contam: true, conta_antiga: true, item_marcado: true });
    }
    expect(r.map((v) => v.perguntas)).toEqual([6, 4, 4, 4, 4, 4, 4]);
    const porContaMes = await comBanco(async (c) => (await c.query(
      `select profile_id, visited_month, count(distinct trip_id)::int as n from public.fact_report group by 1, 2 having count(distinct trip_id) > 2`)).rows);
    expect(porContaMes).toEqual([]);
  });

  it('o Sítio Pedra Lisa é o camping sem dados, e as viagens da Carla vão ao Recanto das Águas', async () => {
    const r = await comBanco(async (c) => ({
      semDados: (await c.query(`select count(r.id)::int as n from public.camping k left join public.fact_report r on r.camping_id = k.id where k.name = 'Sítio Pedra Lisa'`)).rows[0],
      destinos: (await c.query(`select distinct k.name from public.trip t join public.camping k on k.id = t.camping_id where t.id = any($1)`, [[VIAGEM_CARLA, GRUPO]])).rows,
    }));
    expect(r.semDados).toEqual({ n: 0 });
    expect(r.destinos).toEqual([{ name: 'Camping Recanto das Águas' }]);
  });
});
