// Executor dos cenários de sincronização S1 a S10 (SPEC, seções 4 e 13), com dois emuladores e o
// ambiente local. Na B1 só a estrutura existe: nenhum cenário está implementado ainda, e o
// executor diz isso com clareza, sem dar o conjunto por aprovado.
//
// Uso (na raiz do repositório):
//   npm run testar:sincronizacao                 todos os cenários implementados
//   npm run testar:sincronizacao -- S1 S3        só os indicados
//
// Antes: `npm run ambiente:subir`, os dois emuladores ligados (campinguim-a na porta 5554 e
// campinguim-b na 5556) e o app instalado nos dois. Modelo dos cenários: a prova técnica
// (prova/e2e/sincronizacao/), que mediu P1 a P10 com estas mesmas peças.
//
// Contrato de cada cenário (cenarios/<id>.mjs):
//   export async function executar({ a, b, ambiente, saida }) { ... }  // lança erro se falhar
//   a e b: { serial } dos emuladores; ambiente: credenciais locais; saida: pasta de evidências

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ambienteNoAr, lerEnv } from '../../scripts/ambiente/ambiente.mjs';
import { EMULADORES, ligado } from '../../scripts/android.mjs';
import { CENARIOS } from './cenarios.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');

export function cenariosImplementados() {
  return CENARIOS.filter((c) => fs.existsSync(path.join(AQUI, 'cenarios', `${c.id}.mjs`)));
}

async function principal() {
  const filtro = process.argv.slice(2).filter((a) => !a.startsWith('--')).map((a) => a.toUpperCase());
  const escolhidos = CENARIOS.filter((c) => filtro.length === 0 || filtro.includes(c.id));
  const prontos = cenariosImplementados().filter((c) => escolhidos.includes(c));

  console.log('[sincronizacao] cenários da SPEC, seção 4:');
  for (const c of escolhidos) {
    const pronto = prontos.includes(c);
    console.log(`  ${c.id.padEnd(3)}  ${pronto ? 'implementado' : `pendente (feature ${c.feature})`}  ${c.titulo}`);
  }
  if (prontos.length === 0) {
    console.log(`[sincronizacao] 0 de ${escolhidos.length} cenários implementados: nada a rodar (não é aprovação).`);
    return;
  }

  const saude = await ambienteNoAr();
  if (!saude.noAr) throw new Error(`ambiente local fora do ar: ${saude.motivo}`);
  for (const e of [EMULADORES.a, EMULADORES.b]) {
    if (!ligado(e.serial)) throw new Error(`o emulador ${e.avd} (${e.serial}) não está ligado`);
  }

  const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
  let falhas = 0;
  for (const c of prontos) {
    const saida = path.join(RAIZ, 'test-results', 'sincronizacao', carimbo, c.id);
    fs.mkdirSync(saida, { recursive: true });
    const modulo = await import(pathToFileURL(path.join(AQUI, 'cenarios', `${c.id}.mjs`)).href);
    const inicio = Date.now();
    try {
      await modulo.executar({ a: EMULADORES.a, b: EMULADORES.b, ambiente: lerEnv(), saida });
      console.log(`  passou  ${c.id}  (${((Date.now() - inicio) / 1000).toFixed(1)} s)`);
    } catch (e) {
      falhas++;
      console.log(`  FALHOU  ${c.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  console.log(`[sincronizacao] ${prontos.length - falhas} de ${prontos.length} passaram`);
  if (falhas) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  principal().catch((e) => {
    console.error(`[sincronizacao] erro: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  });
}
