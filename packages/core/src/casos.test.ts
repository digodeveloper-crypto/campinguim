/// <reference types="node" />
// Guarda da SPEC, seção 9: "Estes casos são obrigatórios em packages/core". Lê os códigos dos casos
// (C1, L1, A1, F1, D1...) direto das tabelas da SPEC e confere que cada um tem um teste com o código no
// título, e que `docs/regras.md` traz cada caso na tabela caso → teste. Caso novo na SPEC sem teste falha aqui.

import { readdirSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const ler = (caminho: string): string => readFileSync(new URL(caminho, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const SPEC = ler('../../../docs/SPEC.md');
const secao9 = SPEC.slice(SPEC.indexOf('\n## 9. '), SPEC.indexOf('\n## 10. '));
const casos = [...secao9.matchAll(/^\| ([CLAFD]\d+) \|/gm)].map((m) => m[1] as string);

const titulos = readdirSync(new URL('.', import.meta.url))
  .filter((nome) => nome.endsWith('.test.ts'))
  .flatMap((nome) => [...ler(`./${nome}`).matchAll(/\bit\(\s*'([A-Z]\d+): /g)].map((m) => m[1] as string));

describe('Casos obrigatórios da SPEC, seção 9', () => {
  it('a SPEC tem os 35 casos: C1 a C7, L1 a L8, A1 a A6, F1 a F9 e D1 a D5', () => {
    expect(casos).toHaveLength(35);
  });

  it.each(casos)('%s tem um teste com o código no título, em packages/core', (caso) => {
    expect(titulos.filter((t) => t === caso)).toHaveLength(1);
  });

  it.each(casos)('%s está na tabela caso → teste de docs/regras.md', (caso) => {
    expect(ler('../../../docs/regras.md')).toMatch(new RegExp(`^\\| ${caso} \\| ${caso}: `, 'm'));
  });
});
