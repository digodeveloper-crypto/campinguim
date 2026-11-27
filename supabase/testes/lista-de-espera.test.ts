// Lista de espera do site (feature 1.12; SPEC, seção 8, `waitlist_join`; seção 11; decisão R3 do
// responsável, 27/11/2026): a função grava só o e-mail normalizado e a data do consentimento,
// recusa sem consentimento e e-mail inválido, não duplica nem revela repetidos, limita chamadas por
// endereço de rede, e ninguém lê nem escreve a tabela direto.
//
// Os casos pelo banco rodam numa transação desfeita no fim (apoio-banco.ts), como quem não tem
// login (`anon`), com o cabeçalho de endereço que a API passa ao banco (`request.headers`). O último
// grupo chama a API de verdade com a chave pública local e apaga o que criou.
import { randomUUID } from 'node:crypto';

import type pg from 'pg';
import { describe, expect, it } from 'vitest';

import { comBanco, envLocal } from './apoio';
import { entrarComo, naTransacao, tentar, voltarAoDono } from './apoio-banco';

type Resposta = { ok: boolean; code?: string };

const emailDeTeste = () => `lista-${randomUUID()}@pessoas-de-teste.test`;

/** Chama waitlist_join sem login, vindo do endereço `ip` (último do x-forwarded-for, como a API). */
async function entrar(c: pg.Client, email: unknown, consentimento: unknown, ip = '203.0.113.10'): Promise<Resposta> {
  await entrarComo(c, null);
  await c.query("select set_config('request.headers', $1, true)", [JSON.stringify({ 'x-forwarded-for': `198.51.100.7, ${ip}` })]);
  const r = await c.query<{ r: Resposta }>('select public.waitlist_join($1, $2) as r', [email, consentimento]);
  await voltarAoDono(c);
  return r.rows[0]?.r ?? { ok: false };
}

async function linhasDoEmail(c: pg.Client, email: string) {
  await voltarAoDono(c);
  return (await c.query('select email, consent_at, created_at from public.waitlist where email = $1', [email])).rows;
}

describe('waitlist_join: grava só e-mail e consentimento', () => {
  it('grava o e-mail normalizado (sem espaço e sem diferença de caixa) e a data do consentimento', async () => {
    await naTransacao(async (c) => {
      const email = emailDeTeste();
      const antes = new Date();
      const r = await entrar(c, `  ${email.toUpperCase()}  `, true);
      expect(r).toEqual({ ok: true });
      const linhas = await linhasDoEmail(c, email);
      expect(linhas).toHaveLength(1);
      expect(linhas[0]?.email).toBe(email);
      expect((linhas[0]?.consent_at as Date).getTime()).toBeGreaterThanOrEqual(antes.getTime() - 60_000);
    });
  });

  it('a tabela tem só identificador, e-mail e datas (nenhum outro dado pessoal)', async () => {
    const colunas = await comBanco(
      async (c) =>
        (
          await c.query(
            `select column_name from information_schema.columns where table_schema = 'public' and table_name = 'waitlist' order by 1`,
          )
        ).rows.map((r) => r.column_name as string),
    );
    expect(colunas).toEqual(['consent_at', 'created_at', 'email', 'id']);
  });

  it('e-mail repetido (em outra caixa) não duplica e recebe a mesma resposta, sem revelar que já existia', async () => {
    await naTransacao(async (c) => {
      const email = emailDeTeste();
      const primeira = await entrar(c, email, true);
      const consentimento = (await linhasDoEmail(c, email))[0]?.consent_at as Date;
      const segunda = await entrar(c, email.toUpperCase(), true);
      expect(segunda).toEqual(primeira);
      const linhas = await linhasDoEmail(c, email);
      expect(linhas).toHaveLength(1);
      expect((linhas[0]?.consent_at as Date).getTime()).toBe(consentimento.getTime());
    });
  });

  it.each([
    ['falso', false],
    ['nulo', null],
  ])('sem consentimento (%s) recusa com validation e não grava nada', async (_nome, consentimento) => {
    await naTransacao(async (c) => {
      const email = emailDeTeste();
      expect(await entrar(c, email, consentimento)).toEqual({ ok: false, code: 'validation' });
      expect(await linhasDoEmail(c, email)).toEqual([]);
    });
  });

  it.each([
    ['vazio', ''],
    ['nulo', null],
    ['sem arroba', 'pessoa.pessoas-de-teste.test'],
    ['sem domínio com ponto', 'pessoa@localhost'],
    ['com espaço no meio', 'pes soa@pessoas-de-teste.test'],
    ['duas arrobas', 'pessoa@@pessoas-de-teste.test'],
    ['ponto duplo no domínio', 'pessoa@pessoas..test'],
    ['domínio começa com ponto', 'pessoa@.pessoas-de-teste.test'],
    ['termina em ponto', 'pessoa@pessoas-de-teste.'],
    ['mais de 64 antes da arroba', `${'a'.repeat(65)}@pessoas-de-teste.test`],
    ['mais de 254 no total', `pessoa@${'a'.repeat(250)}.test`],
  ])('e-mail inválido (%s) recusa com validation e não grava nada', async (_nome, email) => {
    await naTransacao(async (c) => {
      const antes = Number((await c.query('select count(*) from public.waitlist')).rows[0]?.count);
      expect(await entrar(c, email, true)).toEqual({ ok: false, code: 'validation' });
      expect(Number((await c.query('select count(*) from public.waitlist')).rows[0]?.count)).toBe(antes);
    });
  });

  it('a resposta nunca traz e-mail, a lista nem quantas pessoas há nela', async () => {
    await naTransacao(async (c) => {
      const outro = emailDeTeste();
      await entrar(c, outro, true);
      for (const r of [await entrar(c, emailDeTeste(), true), await entrar(c, outro, true), await entrar(c, 'x', true)]) {
        expect(Object.keys(r).sort()).toEqual(r.ok ? ['ok'] : ['code', 'ok']);
        expect(JSON.stringify(r)).not.toContain('@');
      }
    });
  });
});

describe('waitlist_join: tabela protegida (SPEC, seção 11)', () => {
  it('RLS ativo, nenhuma política e fora da publicação do PowerSync', async () => {
    const r = await comBanco(async (c) => ({
      rls: (
        await c.query(
          `select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where (n.nspname, c.relname) in (('public', 'waitlist'), ('private', 'waitlist_attempt')) order by 1`,
        )
      ).rows,
      politicas: (await c.query(`select * from pg_policies where tablename in ('waitlist', 'waitlist_attempt')`)).rows,
      publicadas: (await c.query(`select * from pg_publication_tables where tablename in ('waitlist', 'waitlist_attempt')`)).rows,
    }));
    expect(r.rls).toEqual([
      { relname: 'waitlist', relrowsecurity: true },
      { relname: 'waitlist_attempt', relrowsecurity: true },
    ]);
    expect(r.politicas).toEqual([]);
    expect(r.publicadas).toEqual([]);
  });

  it.each([
    ['sem login (anon)', null],
    ['com login (authenticated)', randomUUID()],
  ])('%s não lê nem escreve a lista direto', async (_nome, uid) => {
    await naTransacao(async (c) => {
      await entrar(c, emailDeTeste(), true);
      await entrarComo(c, uid);
      for (const sql of [
        'select * from public.waitlist',
        "insert into public.waitlist (email, consent_at) values ('direto@pessoas-de-teste.test', now())",
        'update public.waitlist set consent_at = now()',
        'delete from public.waitlist',
        'select * from private.waitlist_attempt',
      ]) {
        expect((await tentar(c, sql)).erro, sql).toBe('42501');
      }
    });
  });

  it('controle: quem pode (a própria função, como dono) grava', async () => {
    await naTransacao(async (c) => {
      const email = emailDeTeste();
      expect(await entrar(c, email, true)).toEqual({ ok: true });
      expect(await linhasDoEmail(c, email)).toHaveLength(1);
    });
  });

  it('a função roda como dona da tabela (security definer) e com caminho de busca vazio', async () => {
    const f = await comBanco(
      async (c) =>
        (
          await c.query(
            `select p.prosecdef as definer, p.proconfig as config from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' and p.proname = 'waitlist_join'`,
          )
        ).rows,
    );
    expect(f).toEqual([{ definer: true, config: ['search_path=""'] }]);
  });
});

describe('waitlist_join: limite por endereço de rede (SPEC, seção 8; DEF-03)', () => {
  const limite = async (c: pg.Client) =>
    Number((await c.query(`select value #>> '{}' as v from public.config where key = 'limits.waitlist_join_per_ip_per_hour'`)).rows[0]?.v);

  it('o limite é uma premissa em config, com 20 por hora', async () => {
    expect(await comBanco(limite)).toBe(20);
  });

  it('acima do limite recusa com rate_limited, conta também as chamadas recusadas, e outro endereço segue livre', async () => {
    await naTransacao(async (c) => {
      const n = await limite(c);
      const ip = '203.0.113.50';
      for (let i = 0; i < n - 1; i++) expect((await entrar(c, emailDeTeste(), true, ip)).ok).toBe(true);
      expect(await entrar(c, 'invalido', true, ip)).toEqual({ ok: false, code: 'validation' });
      const bloqueado = emailDeTeste();
      expect(await entrar(c, bloqueado, true, ip)).toEqual({ ok: false, code: 'rate_limited' });
      expect(await linhasDoEmail(c, bloqueado)).toEqual([]);
      expect(await entrar(c, emailDeTeste(), true, '203.0.113.51')).toEqual({ ok: true });
    });
  });

  it('o endereço vale pelo último do x-forwarded-for (o que a API acrescenta), não pelo que quem chama inventa', async () => {
    await naTransacao(async (c) => {
      const n = await limite(c);
      await entrarComo(c, null);
      for (let i = 0; i <= n; i++) {
        // Quem chama muda o primeiro endereço a cada vez; o último, posto pelo portão, é o mesmo.
        await c.query("select set_config('request.headers', $1, true)", [JSON.stringify({ 'x-forwarded-for': `10.0.0.${String(i)}, 203.0.113.60` })]);
        const r = (await c.query<{ r: Resposta }>('select public.waitlist_join($1, true) as r', [emailDeTeste()])).rows[0]?.r;
        expect(r?.ok, `chamada ${String(i + 1)}`).toBe(i < n);
      }
      await voltarAoDono(c);
    });
  });

  it('a primeira recusa da hora grava um evento interno, e as seguintes não enchem o banco', async () => {
    await naTransacao(async (c) => {
      const n = await limite(c);
      const ip = '203.0.113.70';
      const eventos = async () => Number((await c.query(`select count(*) from public.event where name = 'rate_limited'`)).rows[0]?.count);
      const antes = await eventos();
      for (let i = 0; i < n; i++) await entrar(c, emailDeTeste(), true, ip);
      for (let i = 0; i < 5; i++) expect((await entrar(c, emailDeTeste(), true, ip)).code).toBe('rate_limited');
      expect(await eventos()).toBe(antes + 1);
      const ultimo = (await c.query(`select props, install_id, profile_id from public.event where name = 'rate_limited' order by at desc limit 1`)).rows[0];
      expect(ultimo).toEqual({ props: { function: 'waitlist_join' }, install_id: null, profile_id: null });
    });
  });

  it('guarda só o resumo do endereço, nunca o endereço nem o e-mail, e apaga as tentativas com mais de uma hora', async () => {
    await naTransacao(async (c) => {
      const ip = '203.0.113.80';
      await c.query(`insert into private.waitlist_attempt (ip_hash, at) values (repeat('a', 64), now() - interval '61 minutes')`);
      const email = emailDeTeste();
      await entrar(c, email, true, ip);
      const linhas = (await c.query('select * from private.waitlist_attempt')).rows;
      expect(linhas.some((l) => l.ip_hash === 'a'.repeat(64))).toBe(false);
      expect(JSON.stringify(linhas)).not.toContain(ip);
      expect(JSON.stringify(linhas)).not.toContain(email);
      const resumo = (await c.query(`select encode(sha256(convert_to($1::text, 'UTF8')), 'hex') as h`, [ip])).rows[0]?.h as string;
      expect(linhas.filter((l) => l.ip_hash === resumo)).toHaveLength(1);
    });
  });
});

describe('waitlist_join pela API, com a chave pública (como a página chama)', () => {
  it('entra na lista pela API sem login, e a chave pública não lê a tabela', async () => {
    const env = envLocal();
    const email = emailDeTeste();
    const cabecalhos = { apikey: env.SUPABASE_CHAVE_PUBLICA ?? '', 'content-type': 'application/json' };
    // Todas as chamadas locais chegam do mesmo endereço (o do Docker): começa e termina sem
    // tentativas guardadas, para a suíte poder rodar várias vezes na mesma hora.
    const limpar = () => comBanco((c) => c.query('delete from private.waitlist_attempt'));
    await limpar();
    try {
      const r = await fetch(`${env.SUPABASE_URL_LOCAL}/rest/v1/rpc/waitlist_join`, {
        method: 'POST',
        headers: cabecalhos,
        body: JSON.stringify({ p_email: email, p_consent: true }),
      });
      expect(r.status).toBe(200);
      expect(await r.json()).toEqual({ ok: true });
      expect(await comBanco((c) => linhasDoEmail(c, email))).toHaveLength(1);

      const semConsentimento = await fetch(`${env.SUPABASE_URL_LOCAL}/rest/v1/rpc/waitlist_join`, {
        method: 'POST',
        headers: cabecalhos,
        body: JSON.stringify({ p_email: emailDeTeste(), p_consent: false }),
      });
      expect(await semConsentimento.json()).toEqual({ ok: false, code: 'validation' });

      const leitura = await fetch(`${env.SUPABASE_URL_LOCAL}/rest/v1/waitlist?select=email`, { headers: cabecalhos });
      expect(leitura.ok).toBe(false);
    } finally {
      await comBanco((c) => c.query('delete from public.waitlist where email = $1', [email]));
      await limpar();
    }
  });
});
