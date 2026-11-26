// Teste de RLS (SPEC, seção 11; CLAUDE.md): lista todas as tabelas dos esquemas da aplicação e
// falha se alguma estiver sem RLS ativo.
//
// Para ver o teste falhar de propósito (mostrado uma vez como evidência):
//   PROVA_RLS_FALHA_DE_PROPOSITO=1 node --test testes/rls.test.mjs
// Nesse modo, uma tabela sem RLS é criada dentro de uma transação que é desfeita no fim:
// o banco não muda (regra "banco só muda por migração").
import assert from 'node:assert/strict';
import { test } from 'node:test';

import pg from 'pg';

import { lerEnvLocal } from '../scripts/comum.mjs';

// Esquemas que a aplicação cria. Os internos do Supabase (auth, storage...) são do fornecedor.
const ESQUEMAS = ['public', 'private'];

const CONSULTA = `
  select n.nspname as esquema, c.relname as tabela, c.relrowsecurity as rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p')
    and n.nspname = any($1)
  order by 1, 2`;

test('toda tabela dos esquemas da aplicação tem RLS ativo', async () => {
  const cliente = new pg.Client({ connectionString: lerEnvLocal().SUPABASE_DB_URL_LOCAL });
  await cliente.connect();
  try {
    await cliente.query('begin');
    if (process.env.PROVA_RLS_FALHA_DE_PROPOSITO === '1') {
      await cliente.query('create table public.tabela_sem_rls_de_proposito (id int primary key)');
    }
    const { rows } = await cliente.query(CONSULTA, [ESQUEMAS]);
    console.log(`tabelas encontradas: ${rows.map((r) => `${r.esquema}.${r.tabela}`).join(', ')}`);
    assert.ok(rows.length >= 3, 'esperava ao menos trip, trip_member e trip_item');
    const semRls = rows.filter((r) => !r.rls).map((r) => `${r.esquema}.${r.tabela}`);
    assert.deepEqual(semRls, [], `tabelas sem RLS: ${semRls.join(', ')}`);
  } finally {
    await cliente.query('rollback');
    await cliente.end();
  }
});

test('as tabelas da prova existem e estão na publicação do PowerSync', async () => {
  const cliente = new pg.Client({ connectionString: lerEnvLocal().SUPABASE_DB_URL_LOCAL });
  await cliente.connect();
  try {
    const { rows } = await cliente.query(
      `select tablename from pg_publication_tables where pubname = 'powersync' order by 1`,
    );
    assert.deepEqual(
      rows.map((r) => r.tablename),
      ['item_claim', 'trip', 'trip_item', 'trip_item_history', 'trip_member'],
    );
  } finally {
    await cliente.end();
  }
});
