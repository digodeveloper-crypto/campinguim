// Grupo 2 (SPEC, seção 11): a sincronização lê o banco sem passar pelo RLS, então as regras de
// sincronização (supabase/sincronizacao/powersync/sync-config.yaml) são a segunda barreira. Este
// teste entra com login de verdade no Supabase local, abre o fluxo de sincronização do PowerSync
// como o app abre e confere, linha a linha, o que cada pessoa recebe.
//
// Pessoas e dados são criados no começo (senha aleatória, só na memória deste teste) e apagados
// no fim. Nada disso fica no banco nem em arquivo.
import { randomBytes, randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { comBanco, ENDERECOS, envLocal } from './apoio';
import { SINCRONIZADAS } from './tabelas';

type Linha = { tabela: string; id: string; trip_id?: string; family_id?: string | null };

const env = envLocal();
const pessoas: Record<'a' | 'b' | 'c', { id: string; email: string; senha: string; token: string }> = {
  a: { id: '', email: `sinc-a-${randomUUID()}@pessoas-de-teste.test`, senha: randomBytes(24).toString('base64url'), token: '' },
  b: { id: '', email: `sinc-b-${randomUUID()}@pessoas-de-teste.test`, senha: randomBytes(24).toString('base64url'), token: '' },
  c: { id: '', email: `sinc-c-${randomUUID()}@pessoas-de-teste.test`, senha: randomBytes(24).toString('base64url'), token: '' },
};
// Viagem V: A (família 1, organizador) e B (família 2). Viagem W: só C.
const ids = {
  v: randomUUID(),
  w: randomUUID(),
  fam1: randomUUID(),
  fam2: randomUUID(),
  famW: randomUUID(),
  itemGrupo: randomUUID(),
  itemFam1: randomUUID(),
  itemFam2: randomUUID(),
  itemW: randomUUID(),
  camping: randomUUID(),
  gasto: randomUUID(),
};
const CIDADE = '9999999';

async function admin(caminho: string, metodo: string, corpo?: unknown): Promise<Response> {
  return fetch(`${env.SUPABASE_URL_LOCAL}/auth/v1/admin/${caminho}`, {
    method: metodo,
    headers: { apikey: env.SUPABASE_CHAVE_SERVICO ?? '', 'content-type': 'application/json' },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
}

async function entrar(p: (typeof pessoas)['a']): Promise<string> {
  const r = await fetch(`${env.SUPABASE_URL_LOCAL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_CHAVE_PUBLICA ?? '', 'content-type': 'application/json' },
    body: JSON.stringify({ email: p.email, password: p.senha }),
  });
  expect(r.status).toBe(200);
  return ((await r.json()) as { access_token: string }).access_token;
}

/** Abre o fluxo de sincronização com o token e devolve as linhas do primeiro ciclo completo. */
async function sincronizar(token: string): Promise<Linha[]> {
  const resposta = await fetch(`http://${ENDERECOS.servidorNoComputador}:${ENDERECOS.portaSincronizacao}/sync/stream`, {
    method: 'POST',
    headers: { authorization: `Token ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      buckets: [],
      include_checksum: true,
      raw_data: true,
      client_id: `teste-${randomUUID()}`,
      streams: { include_defaults: true, subscriptions: [] },
    }),
  });
  expect(resposta.status).toBe(200);
  if (!resposta.body) throw new Error('o fluxo de sincronização veio sem corpo');
  const leitor = resposta.body.getReader();
  let texto = '';
  const limite = Date.now() + 15_000;
  while (!texto.includes('checkpoint_complete') && Date.now() < limite) {
    const { value, done } = await leitor.read();
    if (done) break;
    texto += new TextDecoder().decode(value);
  }
  await leitor.cancel();
  expect(texto).toContain('checkpoint_complete');
  const linhas: Linha[] = [];
  for (const l of texto.split('\n').filter(Boolean)) {
    const m = JSON.parse(l) as { data?: { data?: { op: string; object_type: string; data: string }[] } };
    for (const op of m.data?.data ?? []) {
      if (op.op === 'PUT') linhas.push({ tabela: op.object_type, ...(JSON.parse(op.data) as Omit<Linha, 'tabela'>) });
    }
  }
  return linhas;
}

/** Repete a leitura até a condição valer (a replicação leva alguns instantes). */
async function sincronizarAte(token: string, condicao: (l: Linha[]) => boolean): Promise<Linha[]> {
  const limite = Date.now() + 20_000;
  let linhas = await sincronizar(token);
  while (!condicao(linhas) && Date.now() < limite) {
    await new Promise((r) => setTimeout(r, 500));
    linhas = await sincronizar(token);
  }
  return linhas;
}

const daViagem = (l: Linha, trip: string) => l.trip_id === trip || (l.tabela === 'trip' && l.id === trip);

beforeAll(async () => {
  for (const p of Object.values(pessoas)) {
    const r = await admin('users', 'POST', { email: p.email, password: p.senha, email_confirm: true });
    expect(r.status).toBe(200);
    p.id = ((await r.json()) as { id: string }).id;
  }
  const { a, b, c } = pessoas;
  await comBanco(async (db) => {
    await db.query('begin');
    await db.query(`insert into public.trip (id, owner_profile_id, name, is_group) values ($1, $2, 'V', true), ($3, $4, 'W', false)`, [ids.v, a.id, ids.w, c.id]);
    await db.query(
      `insert into public.trip_family (id, trip_id, name) values ($1, $4, 'F1'), ($2, $4, 'F2'), ($3, $5, 'FW')`,
      [ids.fam1, ids.fam2, ids.famW, ids.v, ids.w],
    );
    await db.query(
      `insert into public.trip_member (trip_id, family_id, profile_id, display_name, role) values
         ($1, $2, $3, 'A', 'organizer'), ($1, $4, $5, 'B', 'member'), ($6, $7, $8, 'C', 'organizer')`,
      [ids.v, ids.fam1, a.id, ids.fam2, b.id, ids.w, ids.famW, c.id],
    );
    await db.query(`insert into public.trip_person (trip_id, family_id, age_band) values ($1, $2, 'adult'), ($1, $3, 'adult'), ($4, $5, 'adult')`, [
      ids.v,
      ids.fam1,
      ids.fam2,
      ids.w,
      ids.famW,
    ]);
    await db.query(
      `insert into public.trip_item (id, trip_id, family_id, name) values
         ($1, $5, null, 'Grupo'), ($2, $5, $6, 'Da família 1'), ($3, $5, $7, 'Da família 2'), ($4, $8, $9, 'De W')`,
      [ids.itemGrupo, ids.itemFam1, ids.itemFam2, ids.itemW, ids.v, ids.fam1, ids.fam2, ids.w, ids.famW],
    );
    await db.query(`insert into public.item_claim (trip_id, item_id, family_id) values ($1, $2, $3)`, [ids.v, ids.itemGrupo, ids.fam2]);
    await db.query(`insert into public.expense (id, trip_id, item_id, buyer_family_id, amount_cents) values ($1, $2, $3, $4, 1000)`, [
      ids.gasto,
      ids.v,
      ids.itemGrupo,
      ids.fam1,
    ]);
    await db.query(`insert into public.expense_payment (trip_id, expense_id, family_id, paid_marked_at) values ($1, $2, $3, now())`, [ids.v, ids.gasto, ids.fam2]);
    await db.query(`insert into public.expense_exclusion (trip_id, expense_id, person_id) select $1, $2, id from public.trip_person where family_id = $3`, [ids.v, ids.gasto, ids.fam2]);
    await db.query(`insert into public.expense_audit (trip_id, expense_id, field, new_value) values ($1, $2, 'amount_cents', '1000')`, [ids.v, ids.gasto]);
    // O que nunca vai ao aparelho, ligado à viagem V: camping, relato, resumo, sugestão, convite, Pix.
    await db.query(`insert into public.city values ($1, 'Cidade de teste', 'SP')`, [CIDADE]);
    await db.query(`insert into public.camping (id, name, name_normalized, city_ibge_code) values ($1, 'Camping de teste', 'teste', $2)`, [ids.camping, CIDADE]);
    await db.query(`update public.trip set camping_id = $1 where id = $2`, [ids.camping, ids.v]);
    await db.query(`insert into public.trip_camping_snapshot (trip_id, camping_id) values ($1, $2)`, [ids.v, ids.camping]);
    await db.query(`insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, visited_month) values ($1, $2, $3, 'pet', 'aceita', '2026-11-01')`, [ids.camping, ids.v, a.id]);
    await db.query(`insert into public.fact_summary (camping_id, fact_key, current_value) values ($1, 'pet', 'aceita')`, [ids.camping]);
    await db.query(`insert into public.suggestion (camping_id, trip_id, profile_id) values ($1, $2, $3)`, [ids.camping, ids.v, a.id]);
    await db.query(`insert into public.invite (token, trip_id, created_by, expires_at) values ($1, $2, $3, now() + interval '1 day')`, [randomBytes(24).toString('base64url'), ids.v, a.id]);
    await db.query(`insert into public.pix_key (profile_id, key, key_type) values ($1, 'teste@example.com', 'e-mail')`, [a.id]);
    await db.query('commit');
  });
  for (const p of Object.values(pessoas)) p.token = await entrar(p);
}, 60_000);

afterAll(async () => {
  await comBanco(async (db) => {
    await db.query('delete from public.fact_report where camping_id = $1', [ids.camping]);
    await db.query('delete from public.suggestion where camping_id = $1', [ids.camping]);
    await db.query('delete from public.trip where id = any($1)', [[ids.v, ids.w]]);
    await db.query('delete from public.fact_summary where camping_id = $1', [ids.camping]);
    await db.query('delete from public.camping where id = $1', [ids.camping]);
    await db.query('delete from public.city where ibge_code = $1', [CIDADE]);
  });
  for (const p of Object.values(pessoas)) if (p.id) await admin(`users/${p.id}`, 'DELETE');
}, 60_000);

describe('grupo 2: cada aparelho só recebe as viagens de que é membro (segunda barreira)', () => {
  it('C, membro só de W, não recebe nada da viagem V', async () => {
    const linhas = await sincronizarAte(pessoas.c.token, (l) => l.some((x) => x.id === ids.itemW));
    expect(linhas.some((x) => x.id === ids.itemW)).toBe(true);
    expect(linhas.filter((x) => daViagem(x, ids.v))).toEqual([]);
    expect(linhas.filter((x) => x.tabela === 'profile').map((x) => x.id)).toEqual([pessoas.c.id]);
  });

  it('controle: A recebe a viagem V inteira (todas as tabelas sincronizadas) e nada de W', async () => {
    const linhas = await sincronizarAte(pessoas.a.token, (l) => new Set(l.filter((x) => daViagem(x, ids.v)).map((x) => x.tabela)).size >= 11);
    const tabelas = [...new Set(linhas.filter((x) => daViagem(x, ids.v) || x.tabela === 'profile').map((x) => x.tabela))].sort();
    expect(tabelas).toEqual(SINCRONIZADAS);
    expect(linhas.filter((x) => daViagem(x, ids.w))).toEqual([]);
  });

  it('B recebe os itens do grupo e os da própria família, nunca os pessoais da outra família', async () => {
    const linhas = await sincronizarAte(pessoas.b.token, (l) => l.some((x) => x.id === ids.itemFam2));
    const itens = linhas.filter((x) => x.tabela === 'trip_item').map((x) => x.id).sort();
    expect(itens).toEqual([ids.itemGrupo, ids.itemFam2].sort());
  });

  it('ninguém recebe convite, chave Pix, camping, relato, resumo, sugestão, aparelho, evento ou config', async () => {
    for (const p of Object.values(pessoas)) {
      const linhas = await sincronizar(p.token);
      expect(linhas.filter((x) => !SINCRONIZADAS.includes(x.tabela))).toEqual([]);
    }
  });

  it('S10: B removido da viagem deixa de receber tudo dela', async () => {
    await comBanco((db) => db.query('update public.trip_member set deleted_at = now() where trip_id = $1 and profile_id = $2', [ids.v, pessoas.b.id]));
    const linhas = await sincronizarAte(pessoas.b.token, (l) => !l.some((x) => daViagem(x, ids.v)));
    expect(linhas.filter((x) => daViagem(x, ids.v))).toEqual([]);
  });
});
