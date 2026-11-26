// Gera o app Android e instala num emulador do projeto, sem conta Expo e sem EAS (como na prova
// técnica, F0-1). A variante release leva o JavaScript dentro do app (não depende do Metro) e é
// assinada com a chave de depuração do modelo do Expo: serve para os emuladores e para os testes
// com modo avião; nunca vai para a loja.
//
// Uso (na raiz do repositório):
//   npm run app:gerar                           expo prebuild + gradlew assembleRelease (x86_64)
//   npm run app:instalar [-- --serial emulator-5554]   instala o APK gerado (padrão: campinguim-a)
//   node scripts/app.mjs permissoes             lista as permissões do APK gerado (manifesto final)

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { adb, conferirSerial, EMULADORES, ligado, PACOTE } from './android.mjs';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(RAIZ, 'apps', 'mobile');
export const APK = path.join(APP, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const SDK =
  process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');

function rodar(cmd, args, cwd) {
  console.log(`[app] ${path.basename(cmd)} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' && /\.(bat|cmd)$/.test(cmd) });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} falhou (${r.status})`);
}

function gerar() {
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  rodar(npx, ['expo', 'prebuild', '--platform', 'android', '--clean', '--no-install'], APP);
  const gradlew = path.join(APP, 'android', process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
  rodar(gradlew, ['assembleRelease', '-PreactNativeArchitectures=x86_64'], path.join(APP, 'android'));
  console.log(`[app] gerado: ${path.relative(RAIZ, APK)}`);
}

function instalar(serial) {
  conferirSerial(serial);
  if (!fs.existsSync(APK)) throw new Error('falta o APK: rode antes "npm run app:gerar"');
  if (!ligado(serial)) throw new Error(`o emulador ${serial} não está ligado (emulator -avd campinguim-a -port 5554)`);
  const r = adb(serial, ['install', '-r', APK]);
  console.log(`[app] ${String(r.stdout).trim().split(/\r?\n/).pop()} em ${serial} (${PACOTE})`);
}

/** Permissões do APK gerado, lidas do manifesto final mesclado (aapt2 do SDK). */
export function permissoesDoApk(apk = APK) {
  const buildTools = path.join(SDK, 'build-tools');
  const versoes = fs.existsSync(buildTools) ? fs.readdirSync(buildTools).sort() : [];
  const ultima = versoes.at(-1);
  if (!ultima) throw new Error('não achei o build-tools do Android SDK');
  const aapt2 = path.join(buildTools, ultima, process.platform === 'win32' ? 'aapt2.exe' : 'aapt2');
  const r = spawnSync(aapt2, ['dump', 'permissions', apk], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`aapt2 falhou: ${r.stderr}`);
  return [...r.stdout.matchAll(/uses-permission(?:-sdk-23)?: name='([^']+)'/g)].map((m) => m[1] ?? '').sort();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [comando, ...resto] = process.argv.slice(2);
  const i = resto.indexOf('--serial');
  const serial = i >= 0 ? (resto[i + 1] ?? '') : EMULADORES.a.serial;
  try {
    if (comando === 'gerar') gerar();
    else if (comando === 'instalar') instalar(serial);
    else if (comando === 'permissoes') console.log(permissoesDoApk().join('\n'));
    else {
      console.error('uso: node scripts/app.mjs gerar | instalar [--serial emulator-5554] | permissoes');
      process.exit(2);
    }
  } catch (e) {
    console.error(`[app] erro: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}
