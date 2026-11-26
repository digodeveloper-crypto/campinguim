// Suíte local completa com um comando (GIT-10; SPEC, seção 13). O QA roda isto antes de aprovar
// qualquer feature e registra o resumo do fim na aprovação.
//
// Uso (na raiz do repositório):
//   npm run testar                       tudo o que não precisa de emulador
//   npm run testar -- --exigir-servidor  falha (em vez de pular) se o ambiente Docker estiver fora do ar
//   npm run testar -- --exigir-completa  qualquer etapa pulada faz a suíte falhar (QA e esteira da versão)
//   npm run testar:rapido                sem servidor e sem navegador (para o ciclo de edição)
//
// Etapas, nesta ordem: trava de segredos, endereços fora da configuração, tipos (TypeScript
// estrito), lint, testes unitários (regras puras e travas do repositório), testes do servidor
// (contra o ambiente local em Docker) e testes da página web (Chromium e WebKit, tela de celular).
// O que precisa de emulador fica fora: `npm run testar:jornadas` e `npm run testar:sincronizacao`.
//
// Teste pulado nunca conta como passou: uma etapa com qualquer teste pulado (por exemplo, o do
// manifesto do app sem APK atualizado) sai PULADO, com o motivo, e a suíte fica INCOMPLETA.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ambienteNoAr } from './ambiente/ambiente.mjs';
import { resumoGeral, resumoPlaywright, resumoVitest } from './suite.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESULTADOS = path.join(RAIZ, 'test-results', 'suite');
const bin = (...partes) => path.join(RAIZ, 'node_modules', ...partes);
const BIN = {
  tsc: bin('typescript', 'bin', 'tsc'),
  eslint: bin('eslint', 'bin', 'eslint.js'),
  vitest: bin('vitest', 'vitest.mjs'),
  playwright: bin('@playwright', 'test', 'cli.js'),
};

const args = process.argv.slice(2);
const opcoes = {
  semServidor: args.includes('--sem-servidor'),
  semWeb: args.includes('--sem-web'),
  exigirCompleta: args.includes('--exigir-completa'),
  exigirServidor: args.includes('--exigir-servidor') || args.includes('--exigir-completa'),
};

/** @typedef {{ etapa: string, estado: 'passou' | 'FALHOU' | 'PULADO', detalhe: string, ms: number }} Resultado */
/** @type {Resultado[]} */
const resultados = [];

function titulo(texto) {
  console.log(`\n=== ${texto} ${'='.repeat(Math.max(0, 70 - texto.length))}`);
}

/** Roda um comando com a saída na tela. Devolve true se saiu com 0. */
function rodar(comando, argumentos, env = {}) {
  const r = spawnSync(comando, argumentos, { cwd: RAIZ, stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '0', ...env } });
  if (r.error) throw r.error;
  return r.status === 0;
}

/**
 * @param {string} nome
 * @param {() => { estado: Resultado['estado'], detalhe?: string }} fn
 */
function etapa(nome, fn) {
  titulo(nome);
  const inicio = Date.now();
  /** @type {Resultado['estado']} */
  let estado = 'FALHOU';
  let detalhe = '';
  try {
    const r = fn();
    estado = r.estado;
    detalhe = r.detalhe ?? '';
  } catch (e) {
    detalhe = e instanceof Error ? e.message : String(e);
  }
  resultados.push({ etapa: nome, estado, detalhe, ms: Date.now() - inicio });
}

/**
 * @param {string[]} projetos
 * @param {string} nomeArquivo
 * @returns {{ estado: Resultado['estado'], detalhe: string }}
 */
function vitest(projetos, nomeArquivo) {
  const saida = path.join(RESULTADOS, nomeArquivo);
  fs.rmSync(saida, { force: true });
  const ok = rodar(process.execPath, [
    BIN.vitest,
    'run',
    ...projetos.flatMap((p) => ['--project', p]),
    '--reporter=default',
    '--reporter=json',
    `--outputFile.json=${saida}`,
  ]);
  const relatorio = fs.existsSync(saida) ? JSON.parse(fs.readFileSync(saida, 'utf8')) : null;
  return resumoVitest(relatorio, ok);
}

// ---------------------------------------------------------------------------------------------

fs.mkdirSync(RESULTADOS, { recursive: true });
const inicioGeral = Date.now();

etapa('Trava de segredos (GIT-08)', () => ({
  estado: rodar(process.execPath, ['scripts/seguranca/verificar-segredos.mjs', '--tudo']) ? 'passou' : 'FALHOU',
}));

etapa('Endereços só no arquivo de configuração (SPEC 14)', () => ({
  estado: rodar(process.execPath, ['scripts/seguranca/verificar-enderecos.mjs']) ? 'passou' : 'FALHOU',
}));

etapa('Tipos (TypeScript estrito)', () => {
  const projetos = ['apps/mobile/tsconfig.json', 'apps/web/tsconfig.json', 'packages/core/tsconfig.json', 'tsconfig.json', 'tsconfig.scripts.json'];
  const falhas = projetos.filter((p) => {
    console.log(`tsc -p ${p}`);
    return !rodar(process.execPath, [BIN.tsc, '--noEmit', '-p', p]);
  });
  return { estado: falhas.length ? 'FALHOU' : 'passou', detalhe: `${projetos.length - falhas.length} de ${projetos.length} projetos sem erro` };
});

etapa('Lint (ESLint, sem aviso tolerado)', () => ({
  estado: rodar(process.execPath, [BIN.eslint, '--max-warnings=0', '.']) ? 'passou' : 'FALHOU',
}));

etapa('Testes unitários: regras puras e travas do repositório', () => vitest(['core', 'scripts'], 'vitest-unitarios.json'));

if (opcoes.semServidor) {
  resultados.push({ etapa: 'Testes do servidor (ambiente local)', estado: 'PULADO', detalhe: 'pedido com --sem-servidor', ms: 0 });
} else {
  const saude = await ambienteNoAr();
  if (saude.noAr) {
    etapa('Testes do servidor (ambiente local)', () => vitest(['servidor'], 'vitest-servidor.json'));
  } else if (opcoes.exigirServidor) {
    resultados.push({ etapa: 'Testes do servidor (ambiente local)', estado: 'FALHOU', detalhe: saude.motivo, ms: 0 });
  } else {
    titulo('Testes do servidor (ambiente local)');
    console.log(`PULADO: ${saude.motivo}`);
    resultados.push({ etapa: 'Testes do servidor (ambiente local)', estado: 'PULADO', detalhe: saude.motivo, ms: 0 });
  }
}

if (opcoes.semWeb) {
  resultados.push({ etapa: 'Página web (Chromium e WebKit)', estado: 'PULADO', detalhe: 'pedido com --sem-web', ms: 0 });
} else {
  etapa('Página web (Chromium e WebKit)', () => {
    const saida = path.join(RESULTADOS, 'playwright.json');
    fs.rmSync(saida, { force: true });
    const ok = rodar(process.execPath, [BIN.playwright, 'test', '--reporter=list,json'], { PLAYWRIGHT_JSON_OUTPUT_NAME: saida });
    const stats = fs.existsSync(saida) ? (JSON.parse(fs.readFileSync(saida, 'utf8')).stats ?? null) : null;
    return resumoPlaywright(stats, ok);
  });
}

// ---------------------------------------------------------------------------------------------

titulo('Resumo da suíte local');
const largura = Math.max(...resultados.map((r) => r.etapa.length));
for (const r of resultados) {
  console.log(`${r.estado.padEnd(6)}  ${r.etapa.padEnd(largura)}  ${(r.ms / 1000).toFixed(1).padStart(6)} s  ${r.detalhe}`);
}
const final = resumoGeral(resultados, {
  exigirCompleta: opcoes.exigirCompleta,
  duracao: `${((Date.now() - inicioGeral) / 1000).toFixed(1)} s`,
});
console.log(`\n${final.frase}`);
process.exitCode = final.codigo;
console.log('Fora desta suíte (precisam de emulador): npm run testar:jornadas e npm run testar:sincronizacao.');
