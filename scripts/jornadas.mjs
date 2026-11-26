// Executor das jornadas automatizadas no emulador (SPEC, seção 13; GIT-12, GIT-14).
// Separado do `npm run testar` porque precisa de emulador ligado e do app instalado.
//
// Uso (na raiz do repositório):
//   npm run testar:jornadas                         todas as jornadas, no campinguim-a (emulator-5554)
//   npm run testar:jornadas -- fumaca J1            só as pastas indicadas
//   npm run testar:jornadas -- --serial emulator-5556
//
// Antes: emulador ligado (emulator -avd campinguim-a -port 5554), `npm run app:gerar` e
// `npm run app:instalar`. Capturas e registros: test-results/jornadas/<data-hora>/ (fora do git).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { adb, conferirSerial, EMULADORES, ligado, PACOTE } from './android.mjs';
import { RAIZ, rodarRoteiro } from './maestro.mjs';

const JORNADAS = path.join(RAIZ, 'e2e', 'jornadas');

/** Roteiros .yaml de cada pasta de jornada, em ordem. */
export function roteirosDasJornadas(filtro = []) {
  return fs
    .readdirSync(JORNADAS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && (filtro.length === 0 || filtro.some((f) => d.name.toLowerCase().startsWith(f.toLowerCase()))))
    .flatMap((d) =>
      fs
        .readdirSync(path.join(JORNADAS, d.name))
        .filter((f) => /\.ya?ml$/.test(f))
        .sort()
        .map((f) => ({ jornada: d.name, arquivo: path.join(JORNADAS, d.name, f) })),
    )
    .sort((a, b) => a.jornada.localeCompare(b.jornada) || a.arquivo.localeCompare(b.arquivo));
}

async function principal() {
  const args = process.argv.slice(2);
  const i = args.indexOf('--serial');
  const serial = conferirSerial(i >= 0 ? (args[i + 1] ?? '') : EMULADORES.a.serial);
  const filtro = args.filter((a, j) => !a.startsWith('--') && j !== i + 1);

  if (!ligado(serial)) {
    throw new Error(`o emulador ${serial} não está ligado. Ligue com: emulator -avd campinguim-a -port 5554`);
  }
  const instalado = adb(serial, ['shell', 'pm', 'path', PACOTE], { permitirFalha: true });
  if (!String(instalado.stdout).includes('package:')) {
    throw new Error(`o app ${PACOTE} não está instalado em ${serial}: rode "npm run app:gerar" e "npm run app:instalar"`);
  }

  const roteiros = roteirosDasJornadas(filtro);
  const vazias = fs
    .readdirSync(JORNADAS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !roteiros.some((r) => r.jornada === d.name))
    .map((d) => d.name);
  const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
  const saidaBase = path.join(RAIZ, 'test-results', 'jornadas', carimbo);

  console.log(`[jornadas] ${roteiros.length} roteiro(s) em ${serial}; saída em ${path.relative(RAIZ, saidaBase)}`);
  const resultados = [];
  for (const { jornada, arquivo } of roteiros) {
    const nome = path.basename(arquivo, path.extname(arquivo));
    const saida = path.join(saidaBase, jornada, nome);
    const r = await rodarRoteiro(serial, arquivo, { saida });
    resultados.push({ jornada, nome, ...r });
    console.log(`  ${r.ok ? 'passou' : 'FALHOU'}  ${jornada}/${nome}  (${(r.ms / 1000).toFixed(1)} s)`);
    if (!r.ok) console.log(r.texto.split(/\r?\n/).slice(-25).join('\n'));
  }
  if (vazias.length) console.log(`[jornadas] sem roteiro ainda (features futuras): ${vazias.join(', ')}`);
  const falhas = resultados.filter((r) => !r.ok).length;
  console.log(`[jornadas] ${resultados.length - falhas} de ${resultados.length} passaram`);
  if (falhas > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal().catch((e) => {
    console.error(`[jornadas] erro: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  });
}
