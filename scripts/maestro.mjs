// Execução de roteiros do Maestro num emulador do projeto. Usado pelas jornadas (scripts/jornadas.mjs)
// e pelos cenários de sincronização (e2e/sincronizacao/rodar.mjs).
//
// Os roteiros não copiam texto da interface nem o nome do pacote: usam marcadores {{pacote}} e
// {{textos.<caminho>}}, trocados aqui antes de rodar, numa cópia em test-results/ (fora do git).
// A troca é feita no arquivo (UTF-8), não pela linha de comando, para acentos não se perderem.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { conferirSerial, PACOTE } from './android.mjs';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEXTOS_DO_APP = path.join(RAIZ, 'apps', 'mobile', 'src', 'textos', 'pt-BR.json');
const MAESTRO = process.env.MAESTRO_BIN || (process.platform === 'win32' ? 'maestro.bat' : 'maestro');

/** Troca {{pacote}} e {{textos.a.b}} no roteiro. Marcador desconhecido é erro, nunca texto vazio. */
export function prepararRoteiro(texto, { pacote = PACOTE, textos = JSON.parse(fs.readFileSync(TEXTOS_DO_APP, 'utf8')) } = {}) {
  return texto.replace(/\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/g, (_, chave) => {
    if (chave === 'pacote') return pacote;
    if (chave.startsWith('textos.')) {
      const valor = chave
        .slice('textos.'.length)
        .split('.')
        .reduce((obj, parte) => (obj && typeof obj === 'object' ? obj[parte] : undefined), textos);
      if (typeof valor !== 'string') throw new Error(`marcador sem texto no arquivo de textos: {{${chave}}}`);
      // Dentro de aspas duplas no YAML: escapa barra invertida e aspas.
      return valor.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }
    throw new Error(`marcador desconhecido no roteiro: {{${chave}}}`);
  });
}

/**
 * Roda um roteiro do Maestro num emulador.
 * @param {string} serial emulator-<porta>
 * @param {string} roteiro caminho do .yaml
 * @param {{ saida: string, variaveis?: Record<string, string> }} opcoes
 * @returns {Promise<{ ok: boolean, codigo: number | null, ms: number, texto: string }>}
 */
export function rodarRoteiro(serial, roteiro, { saida, variaveis = {} }) {
  conferirSerial(serial);
  fs.mkdirSync(saida, { recursive: true });
  const preparado = path.join(saida, path.basename(roteiro));
  fs.writeFileSync(preparado, prepararRoteiro(fs.readFileSync(roteiro, 'utf8')), 'utf8');
  const args = ['--device', serial, 'test', preparado, '--test-output-dir', saida];
  for (const [k, v] of Object.entries(variaveis)) args.push('-e', `${k}=${v}`);
  const inicio = Date.now();
  return new Promise((resolve) => {
    const p = spawn(MAESTRO, args, {
      cwd: saida,
      shell: process.platform === 'win32',
      windowsHide: true,
      env: {
        ...process.env,
        MAESTRO_CLI_NO_ANALYTICS: '1',
        MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true',
        // O driver do Maestro demora a subir com a máquina carregada (prova técnica, F0-1 e F0-2).
        MAESTRO_DRIVER_STARTUP_TIMEOUT: '120000',
      },
    });
    let texto = '';
    p.stdout.on('data', (d) => (texto += d));
    p.stderr.on('data', (d) => (texto += d));
    p.on('error', (e) => resolve({ ok: false, codigo: null, ms: Date.now() - inicio, texto: String(e) }));
    p.on('close', (codigo) => resolve({ ok: codigo === 0, codigo, ms: Date.now() - inicio, texto }));
  });
}
