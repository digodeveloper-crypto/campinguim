// Único lugar que chama o adb e o emulador (ponto J23 da prova técnica):
//   - todo comando do adb leva `-s emulator-<porta>`: nunca fala com "o aparelho que estiver ligado";
//   - nenhum script derruba ou reinicia o servidor do adb (outras tarefas usam emuladores ao mesmo
//     tempo); quem precisa desligar um emulador usa `emu kill` só nele.
// Um teste (scripts/testes/repositorio.test.ts) falha se outro arquivo chamar o adb direto.

import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const SDK =
  process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
const EXE = process.platform === 'win32' ? '.exe' : '';
export const ADB = path.join(SDK, 'platform-tools', `adb${EXE}`);
const EMULATOR = path.join(SDK, 'emulator', `emulator${EXE}`);

/** Emuladores do projeto (docs/prova-tecnica/ambiente.md): tela pequena e tela grande. */
export const EMULADORES = {
  a: { avd: 'campinguim-a', porta: 5554, serial: 'emulator-5554' },
  b: { avd: 'campinguim-b', porta: 5556, serial: 'emulator-5556' },
};

export const PACOTE = 'com.campinguim.prova';

/** Confere que o serial é de um emulador do projeto (emulator-<porta>). */
export function conferirSerial(serial) {
  if (!/^emulator-\d{4}$/.test(serial ?? '')) throw new Error(`serial inválido: "${serial}" (use emulator-<porta>)`);
  return serial;
}

/**
 * Roda um comando do adb num aparelho só.
 * @param {string} serial
 * @param {string[]} args
 * @param {{ permitirFalha?: boolean, encoding?: 'utf8' | 'buffer' }} [opcoes]
 */
export function adb(serial, args, { permitirFalha = false, encoding = 'utf8' } = {}) {
  const r = spawnSync(ADB, ['-s', serial, ...args], { encoding: encoding === 'buffer' ? 'buffer' : 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw r.error;
  if (r.status !== 0 && !permitirFalha) {
    throw new Error(`adb -s ${serial} ${args.join(' ')} falhou (${r.status}): ${String(r.stderr ?? '').trim()}`);
  }
  return r;
}

/** O emulador está ligado e terminou de iniciar? */
export function ligado(serial) {
  conferirSerial(serial);
  const r = adb(serial, ['shell', 'getprop', 'sys.boot_completed'], { permitirFalha: true });
  return r.status === 0 && String(r.stdout).trim() === '1';
}

function dormir(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Liga o AVD na porta dele, se ainda não estiver ligado, e espera terminar de iniciar. */
export async function ligar({ avd, porta, serial }, { limiteMs = 300_000 } = {}) {
  if (ligado(serial)) return false;
  spawn(EMULATOR, ['-avd', avd, '-port', String(porta), '-no-snapshot', '-no-audio', '-no-boot-anim'], {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  }).unref();
  const limite = Date.now() + limiteMs;
  while (!ligado(serial)) {
    if (Date.now() > limite) throw new Error(`${avd} não terminou de ligar em ${limiteMs / 1000} s`);
    await dormir(3000);
  }
  return true;
}

/** Desliga só este emulador. */
export function desligar(serial) {
  conferirSerial(serial);
  adb(serial, ['emu', 'kill'], { permitirFalha: true });
}

/** Captura a tela do aparelho (PNG). */
export function capturarTela(serial) {
  return /** @type {Buffer} */ (adb(serial, ['exec-out', 'screencap', '-p'], { encoding: 'buffer' }).stdout);
}
