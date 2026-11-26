// Verificação do aparelho (SPEC, seção 11; DEF-04, FRD-04; pontos J4 e D3 da prova técnica).
// A prova de desenvolvimento vale só no ambiente local; em produção fica desligada. A marca de
// "aparelho verificado" é do par instalação + conta, não só da instalação.
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type pg from 'pg';
import { describe, expect, it } from 'vitest';

import { RAIZ } from './apoio';
import { criarPessoa, entrarComo, naTransacao, tentar, voltarAoDono } from './apoio-banco';

type Resposta = { ok: boolean; code?: string; verified_until?: string };

async function registrar(c: pg.Client, uid: string, install: string, prova: unknown, plataforma = 'android'): Promise<Resposta> {
  await entrarComo(c, uid);
  const r = await c.query<{ r: Resposta }>('select public.device_register($1, $2, $3::jsonb) as r', [install, plataforma, JSON.stringify(prova)]);
  const resposta = r.rows[0]?.r;
  if (!resposta) throw new Error('device_register sem resposta');
  return resposta;
}

async function verificado(c: pg.Client, uid: string, install: string): Promise<boolean> {
  await entrarComo(c, uid);
  const r = await c.query<{ v: boolean }>('select private.device_is_verified($1) as v', [install]);
  return r.rows[0]?.v === true;
}

describe('verificação do aparelho: prova de desenvolvimento só no ambiente local', () => {
  it('no ambiente local, a prova de desenvolvimento marca o aparelho como verificado por 24 h (D3)', async () => {
    await naTransacao(async (c) => {
      const eu = await criarPessoa(c);
      const install = randomUUID();
      const r = await registrar(c, eu, install, { kind: 'dev' });
      expect(r.ok).toBe(true);
      const horas = (new Date(r.verified_until ?? 0).getTime() - Date.now()) / 3_600_000;
      expect(horas).toBeGreaterThan(23.9);
      expect(horas).toBeLessThanOrEqual(24.01);
      expect(await verificado(c, eu, install)).toBe(true);
    });
  });

  it('em produção (nenhum ajuste local, como deixam as migrações) a prova de desenvolvimento é recusada', async () => {
    await naTransacao(async (c) => {
      await voltarAoDono(c);
      await c.query('delete from private.server_setting');
      const eu = await criarPessoa(c);
      const install = randomUUID();
      expect(await registrar(c, eu, install, { kind: 'dev' })).toEqual({ ok: false, code: 'integrity_required' });
      expect(await verificado(c, eu, install)).toBe(false);
    });
  });

  it('chave ligada por engano fora do ambiente local continua recusando; ambiente local com a chave desligada também', async () => {
    await naTransacao(async (c) => {
      const eu = await criarPessoa(c);
      for (const [ambiente, chave] of [['production', 'true'], ['local', 'false'], ['', 'true']] as const) {
        await voltarAoDono(c);
        await c.query('delete from private.server_setting');
        await c.query(`insert into private.server_setting values ('environment', $1), ('accept_dev_device_proof', $2)`, [ambiente, chave]);
        expect(await registrar(c, eu, randomUUID(), { kind: 'dev' }), `${ambiente}/${chave}`).toEqual({ ok: false, code: 'integrity_required' });
      }
    });
  });

  it('nenhuma migração liga a prova de desenvolvimento: só os dados de exemplo do ambiente local', () => {
    const migracoes = path.join(RAIZ, 'supabase', 'migrations');
    for (const arquivo of fs.readdirSync(migracoes)) {
      const sql = fs.readFileSync(path.join(migracoes, arquivo), 'utf8').toLowerCase();
      expect(sql, arquivo).not.toMatch(/insert\s+into\s+private\.server_setting/);
    }
    const local = fs.readFileSync(path.join(RAIZ, 'supabase', 'dados-de-exemplo', '000-ambiente-local.sql'), 'utf8');
    expect(local).toMatch(/'accept_dev_device_proof', 'true'/);
  });

  it('prova real (Play Integrity) ainda não é validada aqui: recusada até a feature 3.7; sem prova, recusada', async () => {
    await naTransacao(async (c) => {
      const eu = await criarPessoa(c);
      expect(await registrar(c, eu, randomUUID(), { kind: 'play_integrity', token: 'x' })).toEqual({ ok: false, code: 'integrity_required' });
      expect(await registrar(c, eu, randomUUID(), {})).toEqual({ ok: false, code: 'integrity_required' });
      expect(await registrar(c, eu, randomUUID(), { kind: 'dev' }, 'windows')).toEqual({ ok: false, code: 'validation' });
    });
  });
});

describe('J4: a marca é da instalação E da conta', () => {
  it('outra conta com o mesmo install_id não herda a marca', async () => {
    await naTransacao(async (c) => {
      const dona = await criarPessoa(c);
      const outra = await criarPessoa(c);
      const install = randomUUID();
      await registrar(c, dona, install, { kind: 'dev' });
      expect(await verificado(c, outra, install)).toBe(false);
      // a outra conta registra a mesma instalação sem prova: a marca anterior deixa de valer
      expect((await registrar(c, outra, install, {})).ok).toBe(false);
      expect(await verificado(c, dona, install)).toBe(false);
      expect(await verificado(c, outra, install)).toBe(false);
    });
  });

  it('a marca vence depois da validade em config (24 h)', async () => {
    await naTransacao(async (c) => {
      const eu = await criarPessoa(c);
      const install = randomUUID();
      await registrar(c, eu, install, { kind: 'dev' });
      await voltarAoDono(c);
      await c.query(`update public.device set integrity_ok_at = now() - interval '24 hours 1 second' where install_id = $1`, [install]);
      expect(await verificado(c, eu, install)).toBe(false);
    });
  });

  it('sem login não há registro de aparelho, e o app não lê nem escreve a tabela device', async () => {
    await naTransacao(async (c) => {
      const eu = await criarPessoa(c);
      await entrarComo(c, null);
      expect((await tentar(c, `select public.device_register(gen_random_uuid(), 'android', '{"kind":"dev"}')`)).erro).toBe('42501');
      await entrarComo(c, eu);
      expect((await tentar(c, 'select * from public.device')).erro).toBe('42501');
      expect((await tentar(c, `update public.device set integrity_ok_at = now()`)).erro).toBe('42501');
      expect((await tentar(c, `select private.mark_device_verified(gen_random_uuid(), $1, 'android')`, [eu])).erro).toBe('42501');
    });
  });
});
