// Script único da prova técnica: sobe e derruba tudo (Supabase local, serviço PowerSync e os dois
// emuladores) sem deixar processo para trás (SQD-09).
//
// Uso, sempre com o Node do sistema (o `node` do terminal dos agentes é outro):
//   "C:\Program Files\nodejs\node.exe" prova/prova.mjs subir [--sem-emuladores]
//   "C:\Program Files\nodejs\node.exe" prova/prova.mjs derrubar
//   "C:\Program Files\nodejs\node.exe" prova/prova.mjs estado
//
// Credenciais locais (senhas dos usuários de teste, chaves do Supabase local, ligação do PowerSync
// com o Postgres) ficam só em prova/.env.local, fora do git. Este script cria e atualiza esse arquivo.

import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const SERVIDOR = path.join(RAIZ, 'servidor');
const SINCRONIZACAO = path.join(RAIZ, 'sincronizacao');
const ENV_LOCAL = path.join(RAIZ, '.env.local');
const ENDERECOS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'config', 'enderecos.json'), 'utf8'));
const SUPABASE_CLI = path.join(SERVIDOR, 'node_modules', 'supabase', 'dist', 'supabase.js');
const PROJETO = 'campinguim-prova';
// Serviços do Supabase local que a prova não usa (economia de memória; plano, B3).
const SUPABASE_FORA = 'imgproxy,logflare,vector,studio,realtime,mailpit,postgres-meta,storage-api,supavisor';
const EMULADORES = [
  { avd: 'campinguim-a', porta: 5554 },
  { avd: 'campinguim-b', porta: 5556 },
];

const SDK =
  process.env.ANDROID_HOME ||
  process.env.ANDROID_SDK_ROOT ||
  path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
const ADB = path.join(SDK, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const EMULATOR = path.join(SDK, 'emulator', process.platform === 'win32' ? 'emulator.exe' : 'emulator');

// ---------------------------------------------------------------------------------------------

function log(msg) {
  console.log(`[prova] ${msg}`);
}

function rodar(cmd, args, { cwd = RAIZ, permitirFalha = false, silencioso = false } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', windowsHide: true });
  if (r.error) throw r.error;
  if (!silencioso && r.stderr?.trim()) process.stderr.write(mascarar(r.stderr));
  if (r.status !== 0 && !permitirFalha) {
    throw new Error(`falhou (${r.status}): ${path.basename(cmd)} ${args.join(' ')}\n${mascarar(r.stdout ?? '')}`);
  }
  return r;
}

// Nunca imprime chave nem senha (regra de segurança do projeto).
function mascarar(texto) {
  return texto
    .replace(/sb_(publishable|secret)_[A-Za-z0-9_-]+/g, 'sb_$1_***')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, 'eyJ***')
    .replace(/(postgres(?:ql)?:\/\/[^:\s]+:)[^@\s]+@/g, '$1***@')
    .replace(/("?(?:JWT_SECRET|SECRET_KEY|SERVICE_ROLE_KEY|ANON_KEY|PUBLISHABLE_KEY|S3_PROTOCOL_ACCESS_KEY_(?:ID|SECRET))"?\s*[:=]\s*"?)[^",\s]+/g, '$1***');
}

function supabase(args, opcoes = {}) {
  return rodar(process.execPath, [SUPABASE_CLI, ...args], { cwd: SERVIDOR, ...opcoes });
}

function compose(args, opcoes = {}) {
  return rodar(
    'docker',
    ['compose', '-f', path.join(SINCRONIZACAO, 'docker-compose.yml'), '--env-file', ENV_LOCAL, ...args],
    { cwd: SINCRONIZACAO, ...opcoes },
  );
}

function dormir(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------------------------
// prova/.env.local

function lerEnv() {
  const valores = {};
  if (!fs.existsSync(ENV_LOCAL)) return valores;
  for (const linha of fs.readFileSync(ENV_LOCAL, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha);
    if (m) valores[m[1]] = m[2];
  }
  return valores;
}

function gravarEnv(valores) {
  const linhas = [
    '# Credenciais LOCAIS da prova técnica. Fora do git (.gitignore: .env.*). Não copie para outro lugar.',
    '# Gerado e atualizado por prova/prova.mjs subir.',
    ...Object.entries(valores).map(([k, v]) => `${k}=${v}`),
    '',
  ];
  fs.writeFileSync(ENV_LOCAL, linhas.join('\n'), { encoding: 'utf8', mode: 0o600 });
}

function statusSupabase() {
  const r = supabase(['status', '-o', 'json'], { silencioso: true });
  const texto = r.stdout;
  return JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1));
}

function atualizarEnv() {
  const atual = lerEnv();
  const st = statusSupabase();
  const db = new URL(st.DB_URL);
  // Dentro da rede do Docker, o Postgres atende pelo nome do contêiner e pela porta 5432.
  db.hostname = `supabase_db_${PROJETO}`;
  db.port = '5432';
  const senha = () => randomBytes(18).toString('base64url');
  gravarEnv({
    SENHA_TESTE_A: atual.SENHA_TESTE_A || senha(),
    SENHA_TESTE_B: atual.SENHA_TESTE_B || senha(),
    SENHA_TESTE_C: atual.SENHA_TESTE_C || senha(),
    SENHA_TESTE_D: atual.SENHA_TESTE_D || senha(),
    SENHA_TESTE_E: atual.SENHA_TESTE_E || senha(),
    SUPABASE_URL_LOCAL: st.API_URL,
    SUPABASE_DB_URL_LOCAL: st.DB_URL,
    SUPABASE_CHAVE_PUBLICA: st.PUBLISHABLE_KEY,
    SUPABASE_CHAVE_SERVICO: st.SECRET_KEY,
    PS_DATA_SOURCE_URI: db.toString(),
    PS_PORT: String(ENDERECOS.portaSincronizacao),
  });
  log('prova/.env.local atualizado (valores não exibidos)');
}

// ---------------------------------------------------------------------------------------------
// Emuladores

function aparelhosLigados() {
  const r = rodar(ADB, ['devices'], { permitirFalha: true, silencioso: true });
  return (r.stdout ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim().split(/\s+/))
    .filter(([id, estado]) => id?.startsWith('emulator-') && estado === 'device')
    .map(([id]) => id);
}

// Processos do emulador: a máquina virtual (qemu) e o lançador (emulator.exe). Ao desligar, o
// emulador deixa ajudantes "emulator -kill <pid> -sleep 20" que saem sozinhos em ~20 s.
function processosDoEmulador() {
  if (process.platform !== 'win32') return [];
  const pids = [];
  for (const imagem of ['qemu-system-x86_64.exe', 'emulator.exe']) {
    const r = rodar('tasklist', ['/FI', `IMAGENAME eq ${imagem}`, '/FO', 'CSV', '/NH'], {
      permitirFalha: true,
      silencioso: true,
    });
    for (const l of (r.stdout ?? '').split(/\r?\n/)) {
      if (l.toLowerCase().includes(imagem)) pids.push(Number(l.split('","')[1]));
    }
  }
  return pids;
}

async function ligarEmuladores() {
  rodar(ADB, ['start-server'], { silencioso: true });
  const ligados = aparelhosLigados();
  for (const { avd, porta } of EMULADORES) {
    const id = `emulator-${porta}`;
    if (ligados.includes(id)) {
      log(`${avd} já ligado (${id})`);
      continue;
    }
    log(`ligando ${avd} (${id})`);
    spawn(EMULATOR, ['-avd', avd, '-port', String(porta), '-no-snapshot', '-no-audio', '-no-boot-anim'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    }).unref();
  }
  for (const { avd, porta } of EMULADORES) {
    const id = `emulator-${porta}`;
    const limite = Date.now() + 300_000;
    for (;;) {
      const r = rodar(ADB, ['-s', id, 'shell', 'getprop', 'sys.boot_completed'], {
        permitirFalha: true,
        silencioso: true,
      });
      if (r.stdout?.trim() === '1') break;
      if (Date.now() > limite) throw new Error(`${avd} não terminou de ligar em 5 minutos`);
      await dormir(3000);
    }
    log(`${avd} pronto (${id})`);
  }
}

async function desligarEmuladores() {
  for (const { porta } of EMULADORES) {
    rodar(ADB, ['-s', `emulator-${porta}`, 'emu', 'kill'], { permitirFalha: true, silencioso: true });
  }
  const limite = Date.now() + 90_000;
  while (processosDoEmulador().length > 0 && Date.now() < limite) await dormir(2000);
  const sobra = processosDoEmulador();
  for (const pid of sobra) {
    log(`emulador ainda aberto (processo ${pid}); encerrando à força`);
    rodar('taskkill', ['/PID', String(pid), '/F'], { permitirFalha: true, silencioso: true });
  }
  rodar(ADB, ['kill-server'], { permitirFalha: true, silencioso: true });
}

// ---------------------------------------------------------------------------------------------
// Comandos

async function subir({ semEmuladores }) {
  const docker = rodar('docker', ['info', '--format', '{{.ServerVersion}}'], { permitirFalha: true, silencioso: true });
  if (docker.status !== 0) throw new Error('o Docker Desktop não está rodando');

  log('subindo o Supabase local');
  supabase(['start', '-x', SUPABASE_FORA], { silencioso: true });
  atualizarEnv();

  log('subindo o serviço de sincronização (PowerSync)');
  compose(['up', '-d', '--wait'], { silencioso: true });

  log('criando os usuários e as viagens de teste');
  const semeadura = rodar(process.execPath, [path.join(SERVIDOR, 'scripts', 'semear.mjs')], { cwd: SERVIDOR });
  log(semeadura.stdout.trim());

  if (!semEmuladores) await ligarEmuladores();
  estado();
}

async function derrubar() {
  log('desligando os emuladores');
  await desligarEmuladores();
  if (fs.existsSync(ENV_LOCAL)) {
    log('derrubando o serviço de sincronização');
    compose(['down', '--remove-orphans'], { permitirFalha: true, silencioso: true });
  }
  log('derrubando o Supabase local');
  supabase(['stop'], { permitirFalha: true, silencioso: true });
  const sobra = estado();
  if (sobra > 0) {
    process.exitCode = 1;
    log(`ATENÇÃO: ${sobra} item(ns) da prova ainda rodando`);
  } else {
    log('nada da prova ficou rodando');
  }
}

function estado() {
  const conteineres = rodar(
    'docker',
    ['ps', '--filter', `name=${PROJETO}`, '--format', '{{.Names}}\t{{.Status}}'],
    { permitirFalha: true, silencioso: true },
  ).stdout?.trim();
  const qemu = processosDoEmulador();
  const adbRodando =
    process.platform === 'win32' &&
    (rodar('tasklist', ['/FI', 'IMAGENAME eq adb.exe', '/NH'], { permitirFalha: true, silencioso: true }).stdout ?? '').includes('adb.exe');
  const aparelhos = adbRodando ? aparelhosLigados() : [];
  const listaConteineres = conteineres ? conteineres.split(/\r?\n/) : [];
  console.log('--- estado da prova ---');
  console.log(`contêineres da prova: ${listaConteineres.length}`);
  for (const c of listaConteineres) console.log(`  ${c}`);
  console.log(`emuladores (processos): ${qemu.length}; aparelhos no adb: ${aparelhos.join(', ') || 'nenhum'}`);
  console.log(`servidor adb: ${adbRodando ? 'rodando' : 'parado'}`);
  return listaConteineres.length + qemu.length + (adbRodando ? 1 : 0);
}

const [comando, ...opcoes] = process.argv.slice(2);
const acoes = {
  subir: () => subir({ semEmuladores: opcoes.includes('--sem-emuladores') }),
  derrubar,
  estado: () => void estado(),
};
if (!acoes[comando]) {
  console.error('uso: node prova/prova.mjs subir [--sem-emuladores] | derrubar | estado');
  process.exit(2);
}
Promise.resolve(acoes[comando]()).catch((e) => {
  console.error(`[prova] erro: ${mascarar(String(e?.message ?? e))}`);
  process.exit(1);
});
