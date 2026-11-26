// Trava de segredos e de dados pessoais (GIT-08; CLAUDE.md, "Segurança"). Script próprio em Node,
// sem binário externo. Roda em dois lugares:
//   - hook de pré-commit (.githooks/pre-commit): `--preparados` confere só o que vai no commit,
//     lendo o conteúdo preparado (o que o git vai gravar), não o da pasta;
//   - `npm run testar` e `npm run segredos`: `--tudo` confere todo arquivo rastreado ou novo
//     (os ignorados pelo .gitignore ficam de fora).
// Também aceita caminhos soltos: `node scripts/seguranca/verificar-segredos.mjs arquivo1 arquivo2`.
//
// O que barra: chaves e tokens (JWT, chaves do Supabase, service_role, sk-, chaves de nuvem e de
// GitHub, chave privada PEM), senha em arquivo de configuração, endereço de banco com senha,
// arquivos .env com valor, keystores e certificados, e-mail pessoal, nome do usuário do Windows e
// caminhos C:\Users\<nome>. Nunca imprime o segredo achado: só o começo, mascarado.
//
// Termos pessoais extras (nome real, e-mail pessoal) podem ficar em `.segredos-locais` na raiz,
// um por linha. Esse arquivo é ignorado pelo git e nunca é versionado.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const LIMITE_BYTES = 5 * 1024 * 1024;

// ---------------------------------------------------------------------------------------------
// Regras

/** Arquivos que nunca entram, pelo nome. */
const NOMES_PROIBIDOS = [
  { regra: 'keystore-ou-certificado', re: /\.(jks|keystore|p12|pfx|pem|key|p8|mobileprovision|der)$/i },
  { regra: 'credencial-de-servico', re: /(^|\/)(google-services\.json|GoogleService-Info\.plist|service-account[^/]*\.json)$/i },
  { regra: 'chave-ssh', re: /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i },
  { regra: 'termos-pessoais-locais', re: /(^|\/)\.segredos-locais$/ },
];

/** `.env`, `.env.local`, `.env.producao`... Só o modelo `.exemplo`/`.example` entra, e sem valores. */
const RE_ENV = /(^|\/)\.env(\.[^/]+)?$/i;
const RE_ENV_MODELO = /\.(exemplo|example)$/i;

/** Padrões de chave e token, em qualquer arquivo de texto. */
const PADROES = [
  { regra: 'chave-privada-pem', re: /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/g },
  { regra: 'jwt', re: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g },
  { regra: 'chave-supabase', re: /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{10,}/g },
  { regra: 'service-role', re: /service_role[A-Za-z_]*["']?\s*[:=]\s*["']?(?!env\(|\$\{|<|\*\*\*)[A-Za-z0-9._-]{20,}/gi },
  { regra: 'chave-sk', re: /\bsk-(?:proj-|ant-|live-)?[A-Za-z0-9_-]{20,}/g },
  { regra: 'chave-stripe', re: /\b[rs]k_live_[A-Za-z0-9]{16,}/g },
  { regra: 'chave-aws', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { regra: 'token-github', re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})/g },
  { regra: 'chave-google', re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { regra: 'token-slack', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
  { regra: 'token-npm', re: /\bnpm_[A-Za-z0-9]{36}\b/g },
  {
    regra: 'endereco-de-banco-com-senha',
    re: /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^:\s/@"'`]+:(?!\*\*\*@|<[^>]*>@|\$\{[^}]*\}@)[^@\s"'`]+@/gi,
  },
];

/** Senha ou chave atribuída em arquivo de configuração (não em código, onde gera ruído). */
const RE_ARQUIVO_DE_CONFIGURACAO = /(^|\/)(\.env[^/]*|[^/]+\.(ya?ml|toml|ini|cfg|conf|properties|jsonc?))$/i;
const RE_ATRIBUICAO_SENSIVEL =
  /(?:^|[\s"'{,])((?:[A-Za-z0-9_-]*?)(?:password|passwd|senha|secret|segredo|token|api[_-]?key|chave[_-]?(?:secreta|servico|privada)|private[_-]?key))["']?\s*[:=]\s*["']?([^\s"',#}]+)/gi;
const VALOR_DE_MODELO = /^(?:\*+|<[^>]*>|\$\{[^}]*\}|\$[A-Z_]+|env\(.*\)|!env|process\.env.*|true|false|null|none|""|''|x+|exemplo|example|changeme|sua?-.*|seu-.*)$/i;

/** E-mails permitidos: domínios reservados para exemplo e teste, e endereços públicos de serviço. */
const EMAILS_PERMITIDOS = [
  /@(?:[a-z0-9-]+\.)*(?:example|test|invalid|localhost)$/i,
  /@example\.(?:com|org|net)$/i,
  /@users\.noreply\.github\.com$/i,
  /^noreply@anthropic\.com$/i,
  // Modelo do arquivo de configuração gerado pela CLI do Supabase (comentário do fornecedor).
  /^admin@email\.com$/i,
];
// Limites de tamanho e o início em fronteira evitam lentidão em linhas longas (imagens em base64).
const RE_EMAIL = /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63}){0,8}\.[A-Za-z]{2,24}(?![A-Za-z0-9-])/g;

/** Caminhos com o nome de um usuário do computador. Marcadores como <usuário> e %USERPROFILE% passam. */
const RE_CAMINHO_DE_USUARIO = /(?:\b[A-Za-z]:[\\/]{1,2}|(?:^|[\s"'`(=])\/[a-z]\/|file:\/\/\/[A-Za-z]:\/)(?:Users|Usuarios|Usuários)[\\/]{1,2}([^\\/\s"'`<>%$*[\]…|)(:,;]+)/gi;
const RE_CAMINHO_HOME = /(?:^|[\s"'`(=])\/home\/([^/\s"'`<>%$*[\]…|)(:,;]+)/g;
const NOMES_GENERICOS = new Set([
  'public', 'default', 'default user', 'all users', 'usuario', 'usuário', 'user', 'username', 'voce', 'você',
  'nome', 'seu-usuario', 'seu_usuario', 'runner', 'node', 'root', 'admin', 'dev', 'vscode', 'ubuntu', '...', '.',
]);

// ---------------------------------------------------------------------------------------------
// Termos pessoais desta máquina (nunca escritos no repositório)

function lerTermosPessoais() {
  const termos = new Set();
  const usuario = os.userInfo().username;
  if (usuario && usuario.length >= 4 && !NOMES_GENERICOS.has(usuario.toLowerCase()) && !process.env.CI) {
    termos.add(usuario);
  }
  try {
    const emailGlobal = execFileSync('git', ['config', '--global', '--get', 'user.email'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (emailGlobal && !EMAILS_PERMITIDOS.some((re) => re.test(emailGlobal))) termos.add(emailGlobal);
  } catch {
    // sem e-mail global: nada a acrescentar
  }
  const arquivo = path.join(RAIZ, '.segredos-locais');
  if (fs.existsSync(arquivo)) {
    for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
      const termo = linha.trim();
      if (termo && !termo.startsWith('#') && termo.length >= 3) termos.add(termo);
    }
  }
  for (const termo of (process.env.CAMPINGUIM_TERMOS_PESSOAIS ?? '').split(';')) {
    if (termo.trim().length >= 3) termos.add(termo.trim());
  }
  return [...termos];
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------------------------
// Conferência

/** Mostra só o começo do achado, para o segredo nunca ir para a tela nem para registro. */
export function mascarar(trecho) {
  const limpo = trecho.replace(/\s+/g, ' ').trim();
  return limpo.length <= 6 ? '***' : `${limpo.slice(0, 6)}***`;
}

/** Confere o nome do arquivo. Devolve a lista de achados. */
export function verificarNome(caminho) {
  const rel = caminho.replaceAll('\\', '/');
  const achados = [];
  for (const { regra, re } of NOMES_PROIBIDOS) {
    if (re.test(rel)) achados.push({ arquivo: rel, linha: 0, regra, trecho: path.posix.basename(rel) });
  }
  if (RE_ENV.test(rel) && !RE_ENV_MODELO.test(rel)) {
    achados.push({ arquivo: rel, linha: 0, regra: 'arquivo-env', trecho: path.posix.basename(rel) });
  }
  return achados;
}

/**
 * Confere o conteúdo de um arquivo de texto.
 * @param {string} caminho caminho relativo à raiz, com barras normais
 * @param {string} texto conteúdo
 * @param {{ termosPessoais?: string[] }} [opcoes]
 */
export function verificarTexto(caminho, texto, opcoes = {}) {
  const rel = caminho.replaceAll('\\', '/');
  const termos = opcoes.termosPessoais ?? [];
  const reTermos = termos.length
    ? new RegExp(`(?<![A-Za-z0-9])(?:${termos.map(escaparRegex).join('|')})(?![A-Za-z0-9])`, 'gi')
    : null;
  const ehConfiguracao = RE_ARQUIVO_DE_CONFIGURACAO.test(rel);
  const ehModeloEnv = RE_ENV.test(rel) && RE_ENV_MODELO.test(rel);
  const achados = [];
  const linhas = texto.split(/\r?\n/);

  linhas.forEach((linha, i) => {
    const n = i + 1;
    const achar = (regra, trecho) => achados.push({ arquivo: rel, linha: n, regra, trecho: mascarar(trecho) });

    for (const { regra, re } of PADROES) {
      for (const m of linha.matchAll(re)) achar(regra, m[0]);
    }

    if (ehConfiguracao && !/^\s*(#|\/\/)/.test(linha)) {
      for (const m of linha.matchAll(RE_ATRIBUICAO_SENSIVEL)) {
        const valor = m[2] ?? '';
        if (valor.length >= 8 && !VALOR_DE_MODELO.test(valor)) achar('senha-ou-chave-em-configuracao', `${m[1]}=${valor}`);
      }
    }

    if (ehModeloEnv) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/.exec(linha);
      if (m && m[2] && !VALOR_DE_MODELO.test(m[2])) achar('modelo-env-com-valor', `${m[1]}=${m[2]}`);
    }

    for (const m of linha.matchAll(RE_EMAIL)) {
      if (!EMAILS_PERMITIDOS.some((re) => re.test(m[0]))) achar('email-pessoal', m[0]);
    }

    for (const re of [RE_CAMINHO_DE_USUARIO, RE_CAMINHO_HOME]) {
      for (const m of linha.matchAll(re)) {
        const nome = (m[1] ?? '').trim();
        if (nome && !NOMES_GENERICOS.has(nome.toLowerCase())) achar('caminho-com-usuario', m[0]);
      }
    }

    if (reTermos) {
      for (const m of linha.matchAll(reTermos)) achar('termo-pessoal', m[0]);
    }
  });
  return achados;
}

function ehBinario(buffer) {
  const n = Math.min(buffer.length, 8000);
  for (let i = 0; i < n; i++) if (buffer[i] === 0) return true;
  return false;
}

function git(args) {
  return execFileSync('git', args, { cwd: RAIZ, encoding: 'buffer', maxBuffer: 256 * 1024 * 1024 });
}

function listar(args) {
  return git(args).toString('utf8').split('\0').filter(Boolean);
}

/** Lê arquivos a conferir: preparados (do índice do git), todos (da pasta) ou caminhos soltos. */
function* arquivosParaConferir(modo, caminhos) {
  if (modo === 'preparados') {
    for (const rel of listar(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'])) {
      const tamanho = Number(git(['cat-file', '-s', `:${rel}`]).toString('utf8').trim());
      yield { rel, tamanho, ler: () => git(['show', `:${rel}`]) };
    }
    return;
  }
  const lista = modo === 'tudo' ? listar(['ls-files', '-z', '--cached', '--others', '--exclude-standard']) : caminhos;
  for (const item of lista) {
    const abs = path.resolve(RAIZ, item);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    yield { rel: path.relative(RAIZ, abs), tamanho: fs.statSync(abs).size, ler: () => fs.readFileSync(abs) };
  }
}

/** Roda a conferência e devolve { conferidos, achados }. */
export function conferir(modo, caminhos = []) {
  const termosPessoais = lerTermosPessoais();
  const achados = [];
  let conferidos = 0;
  for (const { rel, tamanho, ler } of arquivosParaConferir(modo, caminhos)) {
    conferidos++;
    achados.push(...verificarNome(rel));
    // Arquivo muito grande (vídeo, modelo 3D) não é lido; binário também não.
    if (tamanho > LIMITE_BYTES) continue;
    const conteudo = ler();
    if (ehBinario(conteudo)) continue;
    achados.push(...verificarTexto(rel, conteudo.toString('utf8'), { termosPessoais }));
  }
  return { conferidos, achados };
}

function principal() {
  const args = process.argv.slice(2);
  const modo = args.includes('--preparados') ? 'preparados' : args.includes('--tudo') ? 'tudo' : 'caminhos';
  const caminhos = args.filter((a) => !a.startsWith('--'));
  if (modo === 'caminhos' && caminhos.length === 0) {
    console.error('uso: verificar-segredos.mjs --preparados | --tudo | <arquivos...>');
    process.exit(2);
  }
  const { conferidos, achados } = conferir(modo, caminhos);
  if (achados.length === 0) {
    console.log(`[segredos] ${conferidos} arquivo(s) conferido(s): nenhum segredo nem dado pessoal`);
    return;
  }
  console.error(`[segredos] BARRADO: ${achados.length} achado(s) em ${conferidos} arquivo(s) conferido(s)`);
  for (const a of achados) {
    console.error(`  ${a.arquivo}${a.linha ? `:${a.linha}` : ''}  ${a.regra}  ${a.trecho}`);
  }
  console.error('[segredos] Tire o segredo do arquivo (credencial local vai em .env.local, fora do git) e tente de novo.');
  process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
