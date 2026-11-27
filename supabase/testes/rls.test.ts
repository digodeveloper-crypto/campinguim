// Grupo 1 (SPEC, seção 11, "RLS ativo em todas as tabelas"): toda tabela tem RLS, e nenhuma
// tabela protegida tem política para o app. Roda em toda feature que toca o servidor.
import { describe, expect, it } from 'vitest';

import { comBanco } from './apoio';
import { naTransacao } from './apoio-banco';
import { PROTEGIDAS, SINCRONIZADAS } from './tabelas';

const ESQUEMAS = ['public', 'private'];

// Todas as políticas que existem, uma por linha: tabela, comando e papéis. Qualquer política nova
// faz este teste falhar até ser conferida contra a tabela de autorização da seção 11.
const POLITICAS_ESPERADAS = [
  'public.expense SELECT {authenticated}',
  'public.expense_audit SELECT {authenticated}',
  'public.expense_exclusion SELECT {authenticated}',
  'public.expense_payment SELECT {authenticated}',
  'public.item_claim SELECT {authenticated}',
  'public.pix_key DELETE {authenticated}',
  'public.pix_key INSERT {authenticated}',
  'public.pix_key SELECT {authenticated}',
  'public.pix_key UPDATE {authenticated}',
  'public.profile SELECT {authenticated}',
  'public.trip SELECT {authenticated}',
  'public.trip_camping_snapshot SELECT {authenticated}',
  'public.trip_family SELECT {authenticated}',
  'public.trip_item SELECT {authenticated}',
  'public.trip_member SELECT {authenticated}',
  'public.trip_person SELECT {authenticated}',
];

const TABELAS = `
  select n.nspname || '.' || c.relname as tabela, c.relrowsecurity as rls
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p') and n.nspname = any($1)
  order by 1`;

const POLITICAS = `
  select schemaname || '.' || tablename as tabela, cmd, roles::text as papeis
  from pg_policies where schemaname = any($1)
  order by 1, 2`;

describe('grupo 1: RLS em todas as tabelas (SPEC, seção 11)', () => {
  it('toda tabela dos esquemas da aplicação tem RLS ativo', async () => {
    const tabelas = await comBanco(async (c) => (await c.query(TABELAS, [ESQUEMAS])).rows);
    // As protegidas, as sincronizadas e a chave Pix: não pode sobrar tabela fora da conta.
    expect(tabelas.length).toBe(PROTEGIDAS.length + SINCRONIZADAS.length + 1);
    expect(tabelas.filter((t) => !t.rls)).toEqual([]);
  });

  it('as tabelas da seção 3 existem todas', async () => {
    const nomes = await comBanco(async (c) => (await c.query(TABELAS, [['public']])).rows.map((r) => r.tabela as string));
    expect(nomes.sort()).toEqual(
      [
        ...PROTEGIDAS.filter((t) => t.startsWith('public.')),
        ...SINCRONIZADAS.map((t) => `public.${t}`),
        'public.pix_key',
      ].sort(),
    );
  });

  it('nenhuma tabela protegida tem política (nem de leitura) para o app', async () => {
    const politicas = await comBanco(async (c) => (await c.query(POLITICAS, [ESQUEMAS])).rows);
    expect(politicas.filter((p) => PROTEGIDAS.includes(p.tabela as string))).toEqual([]);
  });

  it('as políticas são exatamente as da tabela de autorização, e nenhuma é para quem não tem login', async () => {
    const politicas = await comBanco(async (c) => (await c.query(POLITICAS, [ESQUEMAS])).rows);
    expect(politicas.map((p) => `${p.tabela} ${p.cmd} ${p.papeis}`)).toEqual(POLITICAS_ESPERADAS);
    expect(politicas.filter((p) => /anon|public/.test(p.papeis as string))).toEqual([]);
  });

  // A única exceção é `waitlist_join` (1.12): a lista de espera do site é sem conta (seção 8).
  it('quem não tem login (anon) não tem privilégio em nenhuma tabela, e só chama a função da lista de espera', async () => {
    const { tabelas, funcoes } = await comBanco(async (c) => ({
      tabelas: (
        await c.query(
          `select table_schema || '.' || table_name as t, privilege_type as p
             from information_schema.role_table_grants
            where grantee in ('anon', 'PUBLIC') and table_schema = any($1)`,
          [ESQUEMAS],
        )
      ).rows,
      funcoes: (
        await c.query(
          `select p.oid::regprocedure::text as f
             from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = any($1) and has_function_privilege('anon', p.oid, 'execute')`,
          [ESQUEMAS],
        )
      ).rows,
    }));
    expect(tabelas).toEqual([]);
    expect(funcoes).toEqual([{ f: 'waitlist_join(text,boolean,uuid)' }]);
  });

  it('o app (authenticated) não tem privilégio nas tabelas protegidas e só lê as sincronizadas', async () => {
    const privilegios = await comBanco(
      async (c) =>
        (
          await c.query(
            `select table_schema || '.' || table_name as t, string_agg(privilege_type, ',' order by privilege_type) as p
               from information_schema.role_table_grants
              where grantee = 'authenticated' and table_schema = any($1)
              group by 1 order by 1`,
            [ESQUEMAS],
          )
        ).rows,
    );
    expect(privilegios.filter((r) => PROTEGIDAS.includes(r.t as string))).toEqual([]);
    for (const t of SINCRONIZADAS) expect(privilegios).toContainEqual({ t: `public.${t}`, p: 'SELECT' });
    expect(privilegios).toContainEqual({ t: 'public.pix_key', p: 'DELETE,INSERT,SELECT,UPDATE' });
    expect(privilegios.length).toBe(SINCRONIZADAS.length + 1);
  });

  it('a publicação do PowerSync tem só as tabelas sincronizadas (nunca campings, relatos, resumos, sugestões)', async () => {
    const publicadas = await comBanco(
      async (c) =>
        (await c.query(`select tablename from pg_publication_tables where pubname = 'powersync' order by 1`)).rows.map(
          (r) => r.tablename as string,
        ),
    );
    expect(publicadas).toEqual(SINCRONIZADAS);
  });

  it('controle: a conferência acha uma tabela protegida que ganhe política de leitura', async () => {
    const achadas = await naTransacao(async (c) => {
      await c.query('create policy espiao on public.fact_report for select to authenticated using (true)');
      return (await c.query(POLITICAS, [ESQUEMAS])).rows.filter((p) => PROTEGIDAS.includes(p.tabela as string));
    });
    expect(achadas).toEqual([{ tabela: 'public.fact_report', cmd: 'SELECT', papeis: '{authenticated}' }]);
  });
});
