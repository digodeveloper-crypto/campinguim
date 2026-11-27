// Ambiente local do Campinguim em Docker (GIT-11): Supabase local (Postgres, login, API, portão e
// funções) e o serviço PowerSync auto-hospedado (decisão E1). Derivado de prova/prova.mjs, sem os
// emuladores (que têm script próprio, scripts/android.mjs) e sem derrubar o servidor do adb.
//
// Uso (na raiz do repositório):
//   npm run ambiente:subir    sobe tudo e espera os contêineres ficarem saudáveis
//   npm run ambiente:parar    para tudo e mantém os dados do banco
//   npm run ambiente:zerar    apaga os dados, recria o banco pelas migrações e dados de exemplo, e sobe
//   npm run ambiente:estado   mostra o que está rodando
//
// Credenciais locais (chaves do Supabase local, ligação do PowerSync com o Postgres) ficam só em
// .env.local na raiz, fora do git. Este script cria e atualiza esse arquivo e nunca imprime valores.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ENV_LOCAL = path.join(RAIZ, '.env.local');
const SINCRONIZACAO = path.join(RAIZ, 'supabase', 'sincronizacao', 'docker-compose.yml');
const SUPABASE_CLI = path.join(RAIZ, 'node_modules', 'supabase', 'dist', 'supabase.js');
export const ENDERECOS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'config', 'enderecos.json'), 'utf8')).local;
export const PROJETO = 'campinguim';
const PROJETO_SINCRONIZACAO = 'campinguim-sincronizacao';
// Serviços do Supabase local que o Campinguim ainda não usa (economia de memória; prova, F0-1).
// Quem precisar de um deles (por exemplo, storage) tira daqui e registra em docs/desenvolvimento.md.
const SUPABASE_FORA = 'imgproxy,logflare,vector,studio,realtime,mailpit,postgres-meta,storage-api,supavisor';
// Chaves que o .env.local precisa ter depois do `subir`.
export const CHAVES_ENV = ['SUPABASE_URL_LOCAL', 'SUPABASE_DB_URL_LOCAL', 'SUPABASE_CHAVE_PUBLICA', 'SUPABASE_CHAVE_SERVICO', 'PS_DATA_SOURCE_URI', 'PS_PORT'];

// ---------------------------------------------------------------------------------------------

function log(msg) {
  console.log(`[ambiente] ${msg}`);
}

/** Nunca imprime chave nem senha (regra de segurança do projeto). */
export function mascarar(texto) {
  return String(texto)
    .replace(/sb_(publishable|secret)_[A-Za-z0-9_-]+/g, 'sb_$1_***')
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, 'eyJ***')
    .replace(/((?:postgres(?:ql)?|mongodb):\/\/[^:\s/@]+:)[^@\s]+@/g, '$1***@')
    .replace(/("?(?:JWT_SECRET|SECRET_KEY|SERVICE_ROLE_KEY|ANON_KEY|PUBLISHABLE_KEY|S3_PROTOCOL_ACCESS_KEY_(?:ID|SECRET))"?\s*[:=]\s*"?)[^",\s]+/g, '$1***');
}

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {{ cwd?: string, permitirFalha?: boolean, silencioso?: boolean, env?: Record<string, string> }} [opcoes]
 */
function rodar(cmd, args, { cwd = RAIZ, permitirFalha = false, silencioso = false, env = undefined } = {}) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', windowsHide: true, env: env ? { ...process.env, ...env } : process.env });
  if (r.error) throw r.error;
  if (!silencioso && r.stderr?.trim()) process.stderr.write(mascarar(r.stderr));
  if (r.status !== 0 && !permitirFalha) {
    throw new Error(`falhou (${r.status}): ${path.basename(cmd)} ${args.join(' ')}\n${mascarar(r.stdout ?? '')}\n${mascarar(r.stderr ?? '')}`);
  }
  return r;
}

function supabase(args, opcoes = {}) {
  if (!fs.existsSync(SUPABASE_CLI)) throw new Error('falta a CLI do Supabase: rode "npm install" na raiz');
  // O endereço do site vai para o login do Supabase local pelo único valor de configuração.
  return rodar(process.execPath, [SUPABASE_CLI, ...args], { ...opcoes, env: { CAMPINGUIM_SITE: ENDERECOS.site } });
}

// Só o comando PARAR roda sem .env.local (worktree novo, arquivo apagado): o docker-compose.yml
// exige PS_DATA_SOURCE_URI, mas `compose down` nunca usa o valor, só precisa que ele exista para
// interpolar o arquivo. Este texto NÃO é credencial, nunca chega a um contêiner e não serve para
// ligar em nada. `subir` e `zerar` continuam exigindo o .env.local verdadeiro (compose falha sem ele).
const VALOR_FICTICIO_PARA_PARAR = 'valor-ficticio-so-para-parar';

/**
 * @param {string[]} args
 * @param {{ paraParar?: boolean, permitirFalha?: boolean, silencioso?: boolean }} [opcoes]
 */
function compose(args, { paraParar = false, ...opcoes } = {}) {
  const temEnv = fs.existsSync(ENV_LOCAL);
  const envFile = temEnv ? ['--env-file', ENV_LOCAL] : [];
  const env = paraParar && !temEnv ? { PS_DATA_SOURCE_URI: VALOR_FICTICIO_PARA_PARAR } : undefined;
  return rodar('docker', ['compose', '-p', PROJETO_SINCRONIZACAO, '-f', SINCRONIZACAO, ...envFile, ...args], { ...opcoes, ...(env ? { env } : {}) });
}

// ---------------------------------------------------------------------------------------------
// .env.local

export function lerEnv(arquivo = ENV_LOCAL) {
  const valores = {};
  if (!fs.existsSync(arquivo)) return valores;
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(linha);
    if (m && m[1]) valores[m[1]] = m[2] ?? '';
  }
  return valores;
}

function gravarEnv(valores) {
  const linhas = [
    '# Credenciais LOCAIS do ambiente em Docker. Fora do git (.gitignore: .env.*). Não copie para outro lugar.',
    '# Gerado e atualizado por "npm run ambiente:subir". Modelo sem valores: .env.local.exemplo',
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
  const api = new URL(st.API_URL);
  if (Number(api.port) !== ENDERECOS.portaApi) {
    throw new Error(`a API do Supabase local está na porta ${api.port}, mas config/enderecos.json diz ${ENDERECOS.portaApi}`);
  }
  const db = new URL(st.DB_URL);
  // Dentro da rede do Docker, o Postgres atende pelo nome do contêiner e pela porta 5432.
  const dbInterno = new URL(st.DB_URL);
  dbInterno.hostname = `supabase_db_${PROJETO}`;
  dbInterno.port = '5432';
  gravarEnv({
    ...atual,
    SUPABASE_URL_LOCAL: st.API_URL,
    SUPABASE_DB_URL_LOCAL: db.toString(),
    SUPABASE_CHAVE_PUBLICA: st.PUBLISHABLE_KEY,
    SUPABASE_CHAVE_SERVICO: st.SECRET_KEY,
    PS_DATA_SOURCE_URI: dbInterno.toString(),
    PS_PORT: String(ENDERECOS.portaSincronizacao),
  });
  log('.env.local atualizado (valores não exibidos)');
}

// ---------------------------------------------------------------------------------------------
// Contêineres

/** Contêineres deste ambiente: Supabase (supabase_*_campinguim) e sincronização (campinguim-sincronizacao-*). */
export function conteineres({ todos = false } = {}) {
  const r = rodar('docker', ['ps', ...(todos ? ['-a'] : []), '--format', '{{.Names}}\t{{.Status}}'], { permitirFalha: true, silencioso: true });
  return (r.stdout ?? '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => {
      const [nome = '', estado = ''] = l.split('\t');
      return { nome, estado };
    })
    .filter(({ nome }) => nome.endsWith(`_${PROJETO}`) || nome.startsWith(`${PROJETO_SINCRONIZACAO}-`));
}

/** Outro contêiner (por exemplo, a pilha da prova técnica) usando as portas deste ambiente. */
function conflitosDePorta() {
  const portas = [ENDERECOS.portaApi, ENDERECOS.portaBanco, ENDERECOS.portaSincronizacao];
  const r = rodar('docker', ['ps', '--format', '{{.Names}}\t{{.Ports}}'], { permitirFalha: true, silencioso: true });
  const proprios = new Set(conteineres().map((c) => c.nome));
  return (r.stdout ?? '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((l) => l.split('\t'))
    .filter(([nome = '', portasDoConteiner = '']) => !proprios.has(nome) && portas.some((p) => portasDoConteiner.includes(`:${p}->`)))
    .map(([nome]) => nome);
}

function dockerLigado() {
  return rodar('docker', ['info', '--format', '{{.ServerVersion}}'], { permitirFalha: true, silencioso: true }).status === 0;
}

/** O ambiente responde? Usado pelo `npm run testar` para decidir se roda ou pula os testes do servidor. */
export async function ambienteNoAr() {
  const env = lerEnv();
  if (!CHAVES_ENV.every((k) => env[k])) return { noAr: false, motivo: 'falta .env.local (rode npm run ambiente:subir)' };
  try {
    const api = await fetch(`${env.SUPABASE_URL_LOCAL}/auth/v1/health`, {
      headers: { apikey: env.SUPABASE_CHAVE_PUBLICA ?? '' },
      signal: AbortSignal.timeout(3000),
    });
    if (!api.ok) return { noAr: false, motivo: `a API do Supabase local respondeu ${api.status}` };
    const ps = await fetch(`http://${ENDERECOS.servidorNoComputador}:${ENDERECOS.portaSincronizacao}/probes/liveness`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!ps.ok) return { noAr: false, motivo: `o PowerSync respondeu ${ps.status}` };
    return { noAr: true, motivo: '' };
  } catch {
    return { noAr: false, motivo: 'o Supabase local ou o PowerSync não responde (rode npm run ambiente:subir)' };
  }
}

// ---------------------------------------------------------------------------------------------
// Comandos

async function subir() {
  if (!dockerLigado()) throw new Error('o Docker Desktop não está rodando: abra o Docker Desktop e tente de novo');
  const conflitos = conflitosDePorta();
  if (conflitos.length) {
    throw new Error(
      `outros contêineres usam as portas do ambiente (${conflitos.join(', ')}). ` +
        'Pare-os antes (a pilha da prova técnica, por exemplo). Nada foi derrubado por este script.',
    );
  }

  log('subindo o Supabase local');
  supabase(['start', '-x', SUPABASE_FORA], { silencioso: true });
  atualizarEnv();

  log('subindo o serviço de sincronização (PowerSync)');
  compose(['up', '-d', '--wait'], { silencioso: true });

  const saude = await ambienteNoAr();
  if (!saude.noAr) throw new Error(`o ambiente subiu mas não responde: ${saude.motivo}`);
  estado();
  log('pronto: Supabase local e PowerSync no ar');
}

function parar({ apagarDados = false } = {}) {
  log('parando o serviço de sincronização (PowerSync)');
  compose(['down', '--remove-orphans', ...(apagarDados ? ['--volumes'] : [])], { paraParar: true, permitirFalha: true, silencioso: true });
  log(apagarDados ? 'parando o Supabase local e apagando os dados' : 'parando o Supabase local (os dados ficam guardados)');
  supabase(['stop', ...(apagarDados ? ['--no-backup'] : [])], { permitirFalha: true, silencioso: true });
  const sobra = estado();
  if (sobra > 0) {
    process.exitCode = 1;
    log(`ATENÇÃO: ${sobra} contêiner(es) do ambiente ainda rodando`);
  } else {
    log('nada do ambiente ficou rodando');
  }
}

async function zerar() {
  parar({ apagarDados: true });
  if (process.exitCode) return;
  await subir();
}

function estado() {
  const lista = conteineres();
  console.log('--- estado do ambiente local ---');
  console.log(`contêineres do ambiente rodando: ${lista.length}`);
  for (const c of lista) console.log(`  ${c.nome}\t${c.estado}`);
  return lista.length;
}

const acoes = {
  subir,
  parar: () => parar(),
  zerar,
  estado: () => void estado(),
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const comando = process.argv[2] ?? '';
  const acao = acoes[comando];
  if (!acao) {
    console.error('uso: node scripts/ambiente/ambiente.mjs subir | parar | zerar | estado');
    process.exit(2);
  }
  Promise.resolve(acao()).catch((e) => {
    console.error(`[ambiente] erro: ${mascarar(String(e?.message ?? e))}`);
    process.exit(1);
  });
}
