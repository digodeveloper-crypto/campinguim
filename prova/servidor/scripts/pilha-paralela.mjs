// Sobe uma SEGUNDA pilha do Supabase local, isolada da pilha padrão da prova (prova.mjs), para
// uma tarefa rodar em paralelo sem brigar por portas, contêineres nem volumes. Usada pela F0-5.
//
//   node prova/servidor/scripts/pilha-paralela.mjs subir    [--projeto campinguim-f0-5] [--deslocamento 1000]
//   node prova/servidor/scripts/pilha-paralela.mjs derrubar [--projeto campinguim-f0-5]
//   node prova/servidor/scripts/pilha-paralela.mjs estado   [--projeto campinguim-f0-5]
//
// Como funciona: copia `prova/servidor/supabase` para uma pasta temporária do sistema, troca o
// `project_id` e soma o deslocamento a todas as portas, e sobe dali (`--workdir`). O config.jsonc
// versionado não muda. Escreve as credenciais em `prova/.env.local` DESTE checkout (fora do git)
// e a configuração da verificação do aparelho em `functions/.env` da cópia temporária. O
// segredo do dublê de teste é gerado ao acaso e nunca é exibido.
// `derrubar` para os contêineres SÓ deste projeto, apaga os volumes dele e a pasta temporária.
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { RAIZ_PROVA } from './comum.mjs';

const SERVIDOR = path.join(RAIZ_PROVA, 'servidor');
const CLI = path.join(SERVIDOR, 'node_modules', 'supabase', 'dist', 'supabase.js');
const ENV_LOCAL = path.join(RAIZ_PROVA, '.env.local');
const MARCA = '# criado por pilha-paralela.mjs';
const FORA = 'imgproxy,logflare,vector,studio,realtime,mailpit,postgres-meta,storage-api,supavisor';
// Pacote provisório da prova (H6) e um certificado de TESTE, que só o dublê local usa.
const PACOTE_PROVISORIO = 'com.campinguim.prova';
const CERTIFICADO_DE_TESTE = 'dHN0LWNlcnRpZmljYWRvLWRvLWR1YmxlLWxvY2Fs';

const args = process.argv.slice(2);
const comando = args[0];
function opcao(nome, padrao) {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : padrao;
}
const PROJETO = opcao('projeto', 'campinguim-f0-5');
const DESLOCAMENTO = Number(opcao('deslocamento', '1000'));
const PASTA = path.join(os.tmpdir(), `campinguim-pilha-${PROJETO}`);

function log(msg) {
  console.log(`[pilha-paralela ${PROJETO}] ${msg}`);
}

function supabase(argumentos, { permitirFalha = false } = {}) {
  const r = spawnSync(process.execPath, [CLI, ...argumentos, '--workdir', PASTA], {
    cwd: SERVIDOR,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (r.status !== 0 && !permitirFalha) {
    // A saída do CLI pode trazer chaves: não é repassada.
    throw new Error(`supabase ${argumentos[0]} falhou (código ${r.status})`);
  }
  return r;
}

function copiarConfiguracao() {
  fs.rmSync(PASTA, { recursive: true, force: true });
  fs.cpSync(path.join(SERVIDOR, 'supabase'), path.join(PASTA, 'supabase'), {
    recursive: true,
    filter: (origem) => !/[\\/](\.temp|\.branches)([\\/]|$)/.test(origem) && !/[\\/]\.env/.test(origem),
  });
  const arquivo = path.join(PASTA, 'supabase', 'config.jsonc');
  let texto = fs.readFileSync(arquivo, 'utf8');
  texto = texto.replace(/("project_id"\s*:\s*)"[^"]*"/, `$1"${PROJETO}"`);
  const portas = [];
  texto = texto.replace(/("(?:port|shadow_port|inspector_port)"\s*:\s*)(\d+)/g, (_, chave, porta) => {
    const nova = Number(porta) + DESLOCAMENTO;
    portas.push(`${porta}->${nova}`);
    return `${chave}${nova}`;
  });
  fs.writeFileSync(arquivo, texto);
  log(`portas: ${portas.join(', ')}`);
}

function gravarEnvDasFuncoes() {
  const linhas = [
    '# Verificação do aparelho no ambiente LOCAL da F0-5. Fora do git. Gerado a cada subida.',
    'AMBIENTE=local',
    // Desligada por padrão (SPEC, seção 11). Os testes conferem a recusa com ela desligada.
    'VERIFICACAO_ACEITAR_DESENVOLVIMENTO=nao',
    // DUBLÊ DE TESTE do decodificador do Google (só local). Ver _verificacao/decodificador.ts.
    'VERIFICACAO_DUBLE_LOCAL=sim',
    `VERIFICACAO_DUBLE_SEGREDO=${randomBytes(32).toString('base64url')}`,
    `VERIFICACAO_PACOTE=${PACOTE_PROVISORIO}`,
    `VERIFICACAO_CERTIFICADOS_SHA256=${CERTIFICADO_DE_TESTE}`,
  ];
  fs.writeFileSync(path.join(PASTA, 'supabase', 'functions', '.env'), linhas.join('\n') + '\n', { mode: 0o600 });
  return Object.fromEntries(linhas.filter((l) => !l.startsWith('#')).map((l) => l.split(/=(.*)/s).slice(0, 2)));
}

function gravarEnvLocal(funcoes) {
  if (fs.existsSync(ENV_LOCAL) && !fs.readFileSync(ENV_LOCAL, 'utf8').startsWith(MARCA)) {
    throw new Error('prova/.env.local já existe e não foi criado por este script: não sobrescrevo');
  }
  const r = supabase(['status', '-o', 'json']);
  const st = JSON.parse(r.stdout.slice(r.stdout.indexOf('{'), r.stdout.lastIndexOf('}') + 1));
  const senha = () => randomBytes(18).toString('base64url');
  const valores = {
    // Senhas dos usuários de teste A, B e C (para semear.mjs e acesso.test.mjs), novas a cada subida.
    // D e E: usuários dos testes de sincronização da F0-2, que semear.mjs também cria (F0-INT).
    SENHA_TESTE_A: senha(),
    SENHA_TESTE_B: senha(),
    SENHA_TESTE_C: senha(),
    SENHA_TESTE_D: senha(),
    SENHA_TESTE_E: senha(),
    SUPABASE_URL_LOCAL: st.API_URL,
    SUPABASE_DB_URL_LOCAL: st.DB_URL,
    SUPABASE_CHAVE_PUBLICA: st.PUBLISHABLE_KEY,
    SUPABASE_CHAVE_SERVICO: st.SECRET_KEY,
    ...funcoes,
  };
  const linhas = [MARCA, '# Credenciais LOCAIS da pilha paralela. Fora do git (.gitignore: .env.*).'];
  for (const [k, v] of Object.entries(valores)) linhas.push(`${k}=${v}`);
  fs.writeFileSync(ENV_LOCAL, linhas.join('\n') + '\n', { encoding: 'utf8', mode: 0o600 });
  log(`prova/.env.local atualizado (valores não exibidos); API em ${new URL(st.API_URL).port}`);
}

function conteineres() {
  const r = spawnSync('docker', ['ps', '-a', '--filter', `name=_${PROJETO}`, '--format', '{{.Names}}\t{{.Status}}'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  return r.stdout.split(/\r?\n/).filter(Boolean);
}

function estado() {
  const lista = conteineres();
  log(`${lista.length} contêiner(es)`);
  for (const c of lista) console.log(`  ${c}`);
  return lista.length;
}

if (comando === 'subir') {
  copiarConfiguracao();
  const funcoes = gravarEnvDasFuncoes();
  log('subindo o Supabase local (saída não exibida: traz chaves)');
  supabase(['start', '-x', FORA]);
  gravarEnvLocal(funcoes);
  log('criando os usuários e as viagens de teste');
  const semeadura = spawnSync(process.execPath, [path.join(SERVIDOR, 'scripts', 'semear.mjs')], {
    cwd: SERVIDOR,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (semeadura.status !== 0) throw new Error('semear.mjs falhou');
  estado();
} else if (comando === 'derrubar') {
  if (fs.existsSync(PASTA)) supabase(['stop', '--no-backup'], { permitirFalha: true });
  fs.rmSync(PASTA, { recursive: true, force: true });
  if (fs.existsSync(ENV_LOCAL) && fs.readFileSync(ENV_LOCAL, 'utf8').startsWith(MARCA)) fs.rmSync(ENV_LOCAL);
  const sobra = estado();
  if (sobra > 0) process.exitCode = 1;
  else log('nada desta pilha ficou rodando; pasta temporária e prova/.env.local apagados');
} else if (comando === 'estado') {
  estado();
} else {
  console.error('uso: pilha-paralela.mjs subir|derrubar|estado [--projeto nome] [--deslocamento n]');
  process.exitCode = 2;
}
