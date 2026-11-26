// A lista de contratos (supabase/functions/_compartilhado/contratos.ts) bate com a seção 8 da SPEC,
// e o que está marcado como existente existe no banco, com o acesso certo.
import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { CODIGOS_DE_ERRO, CONTRATOS } from '../functions/_compartilhado/contratos';
import { comBanco, RAIZ } from './apoio';

function funcoesDaSecao8(): string[] {
  const spec = fs.readFileSync(path.join(RAIZ, 'docs', 'SPEC.md'), 'utf8');
  const secao = spec.slice(spec.indexOf('## 8. Contratos'), spec.indexOf('## 9. '));
  return [...secao.matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1] ?? '');
}

describe('contratos da seção 8', () => {
  it('toda função da seção 8 está na lista, e nada além dela e de sync_apply', () => {
    const daSpec = funcoesDaSecao8();
    expect(daSpec.length).toBeGreaterThanOrEqual(24);
    expect(CONTRATOS.map((c) => c.nome).sort()).toEqual([...daSpec, 'sync_apply'].sort());
  });

  it('os códigos de erro são os da seção 8', () => {
    const spec = fs.readFileSync(path.join(RAIZ, 'docs', 'SPEC.md'), 'utf8');
    const linha = spec.split('\n').find((l) => l.includes('Códigos comuns')) ?? '';
    const codigos = linha.slice(linha.indexOf('Códigos comuns'));
    expect([...codigos.matchAll(/`([a-z_]+)`/g)].map((m) => m[1])).toEqual([...CODIGOS_DE_ERRO]);
  });

  it('as funções marcadas como existentes no banco existem e só quem tem login as chama', async () => {
    const noBanco = CONTRATOS.filter((c) => c.onde === 'banco' && c.estado !== 'a fazer').map((c) => c.nome);
    const r = await comBanco(
      async (c) =>
        (
          await c.query(
            `select p.proname as nome, has_function_privilege('authenticated', p.oid, 'execute') as login,
                    has_function_privilege('anon', p.oid, 'execute') as sem_login, p.prosecdef as definer
               from pg_proc p join pg_namespace n on n.oid = p.pronamespace
              where n.nspname = 'public' order by 1`,
          )
        ).rows,
    );
    expect(r).toEqual(noBanco.sort().map((nome) => ({ nome, login: true, sem_login: false, definer: true })));
  });
});
