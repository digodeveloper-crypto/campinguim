// Apoio dos testes de esquema, autorização e sync_apply (B5).
//
// Cada teste roda numa transação que é DESFEITA no fim: cria as pessoas e as viagens de que
// precisa, troca para o papel e o login de uma pessoa (exatamente o que a API do Supabase faz a
// cada chamada: `set role authenticated` e o token em `request.jwt.claims`) e confere o resultado.
// Nada fica no banco depois do teste.
import { randomUUID } from 'node:crypto';

import type pg from 'pg';

import { comBanco } from './apoio';

export type Papel = 'anon' | 'authenticated';

/** Roda `fn` numa transação desfeita no fim. */
export async function naTransacao<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  return comBanco(async (c) => {
    await c.query('begin');
    try {
      return await fn(c);
    } finally {
      await c.query('rollback');
    }
  });
}

/** Passa a agir como a pessoa `uid` (ou sem login, com `null`), como a API faz. */
export async function entrarComo(c: pg.Client, uid: string | null): Promise<void> {
  await c.query('reset role');
  if (uid === null) {
    await c.query("select set_config('request.jwt.claims', '{\"role\":\"anon\"}', true)");
    await c.query('set local role anon');
    return;
  }
  const claims = JSON.stringify({ sub: uid, role: 'authenticated', aud: 'authenticated' });
  await c.query("select set_config('request.jwt.claims', $1, true)", [claims]);
  await c.query('set local role authenticated');
}

/** Volta ao papel do dono do banco (para montar dados e conferir sem RLS). */
export async function voltarAoDono(c: pg.Client): Promise<void> {
  await c.query('reset role');
  await c.query("select set_config('request.jwt.claims', '', true)");
}

/**
 * Tenta um comando como a pessoa e devolve o código do erro do Postgres (ou null se passou).
 * Usa um ponto de salvamento para o erro não estragar a transação do teste.
 */
export async function tentar(c: pg.Client, sql: string, params: unknown[] = []): Promise<{ erro: string | null; linhas: number }> {
  await c.query('savepoint tentativa');
  try {
    const r = await c.query(sql, params);
    await c.query('release savepoint tentativa');
    return { erro: null, linhas: r.rowCount ?? 0 };
  } catch (e) {
    await c.query('rollback to savepoint tentativa');
    return { erro: (e as { code?: string }).code ?? 'desconhecido', linhas: 0 };
  }
}

/** Cria uma pessoa com login (o perfil nasce pelo gatilho). E-mail em domínio de teste. */
export async function criarPessoa(c: pg.Client): Promise<string> {
  const id = randomUUID();
  await c.query(
    `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
       raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
       confirmation_token, recovery_token, email_change_token_new, email_change)
     values ('00000000-0000-0000-0000-000000000000', $1, 'authenticated', 'authenticated', $2, '', now(),
       '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')`,
    [id, `teste-${id}@pessoas-de-teste.test`],
  );
  return id;
}

export type Viagem = {
  trip: string;
  familiaA: string;
  familiaB: string;
  /** Organizador, da família A. */
  org: string;
  /** Outro membro da família A. */
  a2: string;
  /** Membro da família B. */
  b: string;
  /** Pessoa com login que não é da viagem. */
  fora: string;
  membroOrg: string;
  membroB: string;
  pessoaA: string;
  pessoaB: string;
  itemGrupo: string;
  itemFamiliaA: string;
  itemFamiliaB: string;
  claimB: string;
  gasto: string;
};

/**
 * Viagem de grupo com duas famílias: A (organizador e mais um adulto) e B (um adulto); um item do
 * grupo, um item de cada família, uma marcação de B no item do grupo e um gasto comprado por A.
 * Montada como dono do banco; termina com o papel do dono.
 */
export async function criarViagem(c: pg.Client): Promise<Viagem> {
  await voltarAoDono(c);
  const v: Viagem = {
    trip: randomUUID(),
    familiaA: randomUUID(),
    familiaB: randomUUID(),
    org: await criarPessoa(c),
    a2: await criarPessoa(c),
    b: await criarPessoa(c),
    fora: await criarPessoa(c),
    membroOrg: randomUUID(),
    membroB: randomUUID(),
    pessoaA: randomUUID(),
    pessoaB: randomUUID(),
    itemGrupo: randomUUID(),
    itemFamiliaA: randomUUID(),
    itemFamiliaB: randomUUID(),
    claimB: randomUUID(),
    gasto: randomUUID(),
  };
  await c.query(
    `insert into public.trip (id, owner_profile_id, name, is_group, nights) values ($1, $2, 'Viagem de teste', true, 2)`,
    [v.trip, v.org],
  );
  await c.query(
    `insert into public.trip_family (id, trip_id, name, is_organizer) values ($1, $3, 'Família A', true), ($2, $3, 'Família B', false)`,
    [v.familiaA, v.familiaB, v.trip],
  );
  await c.query(
    `insert into public.trip_member (id, trip_id, family_id, profile_id, display_name, role) values
       ($1, $3, $4, $5, 'Organizador', 'organizer'),
       (gen_random_uuid(), $3, $4, $6, 'Adulto A', 'member'),
       ($2, $3, $7, $8, 'Adulto B', 'member')`,
    [v.membroOrg, v.membroB, v.trip, v.familiaA, v.org, v.a2, v.familiaB, v.b],
  );
  await c.query(
    `insert into public.trip_person (id, trip_id, family_id, age_band) values ($1, $3, $4, 'adult'), ($2, $3, $5, 'adult')`,
    [v.pessoaA, v.pessoaB, v.trip, v.familiaA, v.familiaB],
  );
  await c.query(
    `insert into public.trip_item (id, trip_id, family_id, name, qty) values
       ($1, $4, null, 'Fogareiro', 1), ($2, $4, $5, 'Toalha A', 2), ($3, $4, $6, 'Toalha B', 2)`,
    [v.itemGrupo, v.itemFamiliaA, v.itemFamiliaB, v.trip, v.familiaA, v.familiaB],
  );
  await c.query(`insert into public.item_claim (id, trip_id, item_id, family_id) values ($1, $2, $3, $4)`, [
    v.claimB,
    v.trip,
    v.itemGrupo,
    v.familiaB,
  ]);
  await c.query(
    `insert into public.expense (id, trip_id, item_id, buyer_family_id, amount_cents) values ($1, $2, $3, $4, 10000)`,
    [v.gasto, v.trip, v.itemGrupo, v.familiaA],
  );
  return v;
}

export type Alteracao = {
  change_id: string;
  table: string;
  op: 'PUT' | 'PATCH' | 'DELETE' | string;
  id: string;
  data?: Record<string, unknown>;
  prev?: Record<string, unknown>;
};

export type Resultado = {
  change_id: string;
  status: 'applied' | 'rejected' | 'duplicate';
  reason?: string;
  outcome?: Record<string, unknown>;
  detail?: Record<string, unknown>;
  first_status?: string;
  first_reason?: string | null;
};

export function alteracao(table: string, op: Alteracao['op'], id: string, data?: Record<string, unknown>, prev?: Record<string, unknown>): Alteracao {
  return { change_id: randomUUID(), table, op, id, ...(data ? { data } : {}), ...(prev ? { prev } : {}) };
}

/** Chama sync_apply como a pessoa `uid` e volta ao dono. */
export async function enviar(c: pg.Client, uid: string, lote: unknown[]): Promise<Resultado[]> {
  await entrarComo(c, uid);
  const r = await c.query<{ r: Resultado[] }>('select public.sync_apply($1::jsonb) as r', [JSON.stringify(lote)]);
  await voltarAoDono(c);
  return r.rows[0]?.r ?? [];
}

/** Lê uma linha como dono do banco (sem RLS). */
export async function linha<T = Record<string, unknown>>(c: pg.Client, tabela: string, id: string, chave = 'id'): Promise<T | undefined> {
  await voltarAoDono(c);
  const r = await c.query(`select * from public.${tabela} where ${chave} = $1`, [id]);
  return r.rows[0] as T | undefined;
}
