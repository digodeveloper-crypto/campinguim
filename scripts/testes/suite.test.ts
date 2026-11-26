// Regras do resumo da suíte local (QA B1, rodada 1, item 1): teste pulado nunca conta como passou.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { estadoDoApk, fontesDoManifesto } from '../app.mjs';
import { resumoGeral, resumoPlaywright, resumoVitest } from '../suite.mjs';

const teste = (status: string, ancestorTitles: string[] = ['grupo'], title = 'caso') => ({ status, ancestorTitles, title });

describe('resumoVitest', () => {
  it('tudo passou: etapa passou', () => {
    const r = resumoVitest({ numTotalTests: 2, numPassedTests: 2, numFailedTests: 0, numPendingTests: 0, testResults: [{ assertionResults: [teste('passed'), teste('passed')] }] }, true);
    expect(r).toEqual({ estado: 'passou', detalhe: '2 de 2 testes passaram' });
  });

  it('um teste pulado: etapa PULADO, com o motivo tirado do nome do grupo', () => {
    const r = resumoVitest(
      {
        numTotalTests: 4,
        numPassedTests: 1,
        numFailedTests: 0,
        numPendingTests: 3,
        testResults: [
          {
            assertionResults: [
              teste('passed'),
              ...[1, 2, 3].map(() => teste('skipped', ['manifesto final do app (ponto J9), PULADO: APK ausente: rode npm run app:gerar'])),
            ],
          },
        ],
      },
      true,
    );
    expect(r.estado).toBe('PULADO');
    expect(r.detalhe).toBe('1 de 4 testes passaram; 3 pulado(s): manifesto final do app (ponto J9), PULADO: APK ausente: rode npm run app:gerar');
  });

  it('teste "todo" também conta como pulado', () => {
    expect(resumoVitest({ numTotalTests: 1, numPassedTests: 0, numTodoTests: 1, testResults: [{ assertionResults: [teste('todo')] }] }, true).estado).toBe('PULADO');
  });

  it('falha vence pulo; sem relatório é falha', () => {
    expect(resumoVitest({ numTotalTests: 2, numPassedTests: 0, numFailedTests: 1, numPendingTests: 1, testResults: [] }, false).estado).toBe('FALHOU');
    expect(resumoVitest(null, true).estado).toBe('FALHOU');
  });
});

describe('resumoPlaywright', () => {
  it('pulado vira PULADO; inesperado vira FALHOU', () => {
    expect(resumoPlaywright({ expected: 2, unexpected: 0, flaky: 0, skipped: 0 }, true)).toEqual({ estado: 'passou', detalhe: '2 de 2 testes passaram' });
    expect(resumoPlaywright({ expected: 1, unexpected: 0, flaky: 0, skipped: 1 }, true).estado).toBe('PULADO');
    expect(resumoPlaywright({ expected: 1, unexpected: 1, flaky: 0, skipped: 0 }, false).estado).toBe('FALHOU');
  });
});

describe('resumoGeral', () => {
  const duracao = '1.0 s';
  it('com etapa pulada nunca diz COMPLETA', () => {
    const r = resumoGeral([{ estado: 'passou' }, { estado: 'PULADO' }], { exigirCompleta: false, duracao });
    expect(r.frase).toMatch(/^SUÍTE INCOMPLETA/);
    expect(r.frase).not.toMatch(/SUÍTE COMPLETA/);
    expect(r.codigo).toBe(0);
  });

  it('com --exigir-completa, etapa pulada faz a suíte falhar (código 1)', () => {
    const r = resumoGeral([{ estado: 'passou' }, { estado: 'PULADO' }], { exigirCompleta: true, duracao });
    expect(r.codigo).toBe(1);
    expect(r.frase).toMatch(/^SUÍTE INCOMPLETA, e --exigir-completa/);
  });

  it('tudo passou: COMPLETA; uma falha: FALHOU', () => {
    expect(resumoGeral([{ estado: 'passou' }], { exigirCompleta: true, duracao })).toEqual({ frase: 'SUÍTE COMPLETA: todas as 1 etapas passaram (1.0 s).', codigo: 0 });
    expect(resumoGeral([{ estado: 'passou' }, { estado: 'FALHOU' }, { estado: 'PULADO' }], { exigirCompleta: false, duracao }).codigo).toBe(1);
  });
});

describe('estadoDoApk', () => {
  const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'campinguim-apk-'));
  afterAll(() => fs.rmSync(pasta, { recursive: true, force: true }));
  const maisNova = Math.max(...fontesDoManifesto().map((f: string) => fs.statSync(f).mtimeMs));

  it('as fontes do manifesto são app.config.ts, package.json e os plugins do app', () => {
    const nomes = fontesDoManifesto().map((f: string) => path.relative(path.join(import.meta.dirname, '..', '..'), f).replaceAll('\\', '/'));
    expect(nomes).toEqual(expect.arrayContaining(['apps/mobile/app.config.ts', 'apps/mobile/package.json', 'apps/mobile/plugins/trafego-local.cjs']));
  });

  it('APK ausente: não serve', () => {
    expect(estadoDoApk(path.join(pasta, 'nao-existe.apk'))).toEqual({ ok: false, motivo: 'APK ausente: rode npm run app:gerar' });
  });

  it('APK mais velho que uma fonte do manifesto: desatualizado', () => {
    const apk = path.join(pasta, 'velho.apk');
    fs.writeFileSync(apk, '');
    const antes = new Date(maisNova - 60_000);
    fs.utimesSync(apk, antes, antes);
    const r = estadoDoApk(apk);
    expect(r.ok).toBe(false);
    expect(r.motivo).toMatch(/^APK desatualizado: rode npm run app:gerar/);
  });

  it('APK mais novo que todas as fontes: serve', () => {
    const apk = path.join(pasta, 'novo.apk');
    fs.writeFileSync(apk, '');
    const depois = new Date(maisNova + 60_000);
    fs.utimesSync(apk, depois, depois);
    expect(estadoDoApk(apk)).toEqual({ ok: true, motivo: '' });
  });
});
