// Endereço provisório num único valor de configuração (SPEC, seção 14, "Endereço provisório no
// desenvolvimento"; CLAUDE.md, "Segurança"). Falha se:
//   1. o domínio provisório do Cloud Run ou os da Cloudflare (lista DOMINIOS_PROIBIDOS, abaixo)
//      aparecerem em qualquer arquivo do repositório fora de config/enderecos.json;
//   2. o endereço do servidor local visto do emulador ou o domínio do site aparecerem em código
//      fora de config/enderecos.json.
// Fica de fora só a documentação: a pasta `docs/` e os arquivos Markdown (.md). É onde a SPEC, o
// CLAUDE.md e o registro de infraestrutura precisam citar esses domínios por nome, e onde ficam as
// evidências (que mostram o próprio teste falhando). Código, configuração e dados são conferidos.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ARQUIVO_DE_CONFIGURACAO = 'config/enderecos.json';

// Montados por partes para este arquivo não se achar.
export const DOMINIOS_PROIBIDOS = [['run', 'app'], ['pages', 'dev'], ['workers', 'dev']].map((p) => p.join('.'));

const PASTAS_DE_CODIGO = ['apps/', 'packages/', 'supabase/', 'e2e/', 'scripts/', 'config/', '.github/', '.githooks/'];
const ARQUIVOS_DE_CODIGO_NA_RAIZ = /^[^/]+\.(?:json|jsonc|mjs|cjs|js|ts|ya?ml)$/;

function ehBinario(buffer) {
  const n = Math.min(buffer.length, 8000);
  for (let i = 0; i < n; i++) if (buffer[i] === 0) return true;
  return false;
}

/** Todo arquivo rastreado ou novo (sem os ignorados), relativo à raiz. */
export function arquivosDoRepositorio(raiz = RAIZ) {
  return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: raiz })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((rel) => fs.existsSync(path.join(raiz, rel)));
}

/**
 * Procura os trechos proibidos. Devolve a lista de { arquivo, linha, trecho }.
 * @param {{ raiz?: string, arquivos?: string[] }} [opcoes]
 */
export function conferirEnderecos(opcoes = {}) {
  const raiz = opcoes.raiz ?? RAIZ;
  const arquivos = opcoes.arquivos ?? arquivosDoRepositorio(raiz);
  const enderecos = JSON.parse(fs.readFileSync(path.join(raiz, ARQUIVO_DE_CONFIGURACAO), 'utf8'));
  const locais = [enderecos.local.servidorNoEmulador, new URL(enderecos.local.site).host];
  const achados = [];
  for (const arquivo of arquivos) {
    const rel = arquivo.replaceAll('\\', '/');
    if (rel === ARQUIVO_DE_CONFIGURACAO || rel.startsWith('docs/') || rel.toLowerCase().endsWith('.md')) continue;
    const abs = path.join(raiz, rel);
    if (fs.statSync(abs).size > 5 * 1024 * 1024) continue;
    const conteudo = fs.readFileSync(abs);
    if (ehBinario(conteudo)) continue;
    const ehCodigo = PASTAS_DE_CODIGO.some((p) => rel.startsWith(p)) || ARQUIVOS_DE_CODIGO_NA_RAIZ.test(rel);
    const procurar = ehCodigo ? [...DOMINIOS_PROIBIDOS, ...locais] : DOMINIOS_PROIBIDOS;
    conteudo
      .toString('utf8')
      .split(/\r?\n/)
      .forEach((linha, i) => {
        for (const trecho of procurar) {
          if (linha.toLowerCase().includes(trecho.toLowerCase())) achados.push({ arquivo: rel, linha: i + 1, trecho });
        }
      });
  }
  return achados;
}

function principal() {
  const achados = conferirEnderecos();
  if (achados.length === 0) {
    console.log(`[enderecos] nenhum endereço fora de ${ARQUIVO_DE_CONFIGURACAO} (${DOMINIOS_PROIBIDOS.join(', ')} e endereços locais)`);
    return;
  }
  console.error(`[enderecos] FALHOU: ${achados.length} endereço(s) fora de ${ARQUIVO_DE_CONFIGURACAO}`);
  for (const a of achados) console.error(`  ${a.arquivo}:${a.linha}  ${a.trecho}`);
  console.error(`[enderecos] O endereço fica só em ${ARQUIVO_DE_CONFIGURACAO}; o código lê de lá.`);
  process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
