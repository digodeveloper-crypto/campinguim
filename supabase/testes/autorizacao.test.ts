// Regras de segurança que valem desde a base (CLAUDE.md, "Segurança"; SPEC, seção 11).
import { describe, expect, it } from 'vitest';

import { comBanco, envLocal } from './apoio';

// Esquemas que a aplicação cria. Os internos do Supabase (auth, storage...) são do fornecedor.
const ESQUEMAS = ['public', 'private'];
const TABELAS_SEM_RLS = `
  select n.nspname || '.' || c.relname as tabela
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p') and n.nspname = any($1) and not c.relrowsecurity
  order by 1`;

describe('RLS em toda tabela', () => {
  it('nenhuma tabela dos esquemas da aplicação está sem RLS', async () => {
    const semRls = await comBanco(async (c) => (await c.query(TABELAS_SEM_RLS, [ESQUEMAS])).rows);
    expect(semRls).toEqual([]);
  });

  it('a conferência acha uma tabela sem RLS (criada e desfeita dentro de uma transação)', async () => {
    const semRls = await comBanco(async (c) => {
      await c.query('begin');
      try {
        await c.query('create table public.tabela_sem_rls_de_proposito (id int primary key)');
        return (await c.query(TABELAS_SEM_RLS, [ESQUEMAS])).rows;
      } finally {
        await c.query('rollback');
      }
    });
    expect(semRls).toEqual([{ tabela: 'public.tabela_sem_rls_de_proposito' }]);
  });
});

describe('login', () => {
  it('cadastro aberto desligado: ninguém cria conta por e-mail e senha pela API', async () => {
    const env = envLocal();
    const r = await fetch(`${env.SUPABASE_URL_LOCAL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: env.SUPABASE_CHAVE_PUBLICA ?? '', 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'nova-pessoa@pessoas-de-teste.test', password: 'senha-de-teste-123' }),
    });
    expect(r.ok).toBe(false);
  });

  it('sem login, a chave pública não vê nenhuma tabela na API', async () => {
    const env = envLocal();
    const r = await fetch(`${env.SUPABASE_URL_LOCAL}/rest/v1/`, { headers: { apikey: env.SUPABASE_CHAVE_PUBLICA ?? '' } });
    // A descrição da API (OpenAPI) lista as rotas de dados visíveis para quem chama sem login.
    // Desde a B5 há tabelas e funções na API, mas nenhuma para quem não tem login: os privilégios
    // de anon são retirados em cada migração (conferido também em rls.test.ts).
    expect(r.status).toBe(200);
    const corpo = (await r.json()) as { paths?: Record<string, unknown> };
    const rotas = Object.keys(corpo.paths ?? {}).filter((p) => p !== '/');
    expect(rotas).toEqual([]);
  });
});
