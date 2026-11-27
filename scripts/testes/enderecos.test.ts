// Teste do endereço provisório num único valor de configuração (SPEC, seção 14). Roda na árvore
// real e numa cópia mínima em pasta temporária, onde um domínio proibido é plantado de propósito.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { ARQUIVO_DE_CONFIGURACAO, conferirEnderecos, DOMINIOS_PROIBIDOS, RAIZ } from '../seguranca/verificar-enderecos.mjs';

const temporaria = fs.mkdtempSync(path.join(os.tmpdir(), 'campinguim-enderecos-'));
afterAll(() => fs.rmSync(temporaria, { recursive: true, force: true }));

function arvoreDeTeste(arquivos: Record<string, string>) {
  const raiz = fs.mkdtempSync(path.join(temporaria, 'arvore-'));
  const config = fs.readFileSync(path.join(RAIZ, ARQUIVO_DE_CONFIGURACAO), 'utf8');
  for (const [rel, conteudo] of Object.entries({ [ARQUIVO_DE_CONFIGURACAO]: config, ...arquivos })) {
    fs.mkdirSync(path.dirname(path.join(raiz, rel)), { recursive: true });
    fs.writeFileSync(path.join(raiz, rel), conteudo);
  }
  return { raiz, arquivos: [ARQUIVO_DE_CONFIGURACAO, ...Object.keys(arquivos)] };
}

describe('endereços fora do arquivo de configuração', () => {
  // Varre todos os arquivos do repositório: ~0,6 s sozinho, mas 20 a 25 s com a máquina ocupada
  // (emulador e Docker do QA), acima do limite padrão de 5 s. O limite próprio de 60 s existe só
  // para esse teste de varredura; os demais (cópias pequenas em pasta temporária) seguem no padrão.
  it('a árvore do repositório está limpa', { timeout: 60_000 }, () => {
    expect(conferirEnderecos()).toEqual([]);
  });

  it.each(DOMINIOS_PROIBIDOS)('falha quando %s aparece num arquivo de código', (dominio) => {
    const arvore = arvoreDeTeste({ 'apps/web/src/x.ts': `export const site = 'https://campinguim.${dominio}';\n` });
    expect(conferirEnderecos(arvore)).toEqual([{ arquivo: 'apps/web/src/x.ts', linha: 1, trecho: dominio }]);
  });

  it('falha quando o domínio aparece fora das pastas de código (dados, configuração)', () => {
    const dominio = DOMINIOS_PROIBIDOS[0] ?? '';
    const arvore = arvoreDeTeste({ 'design/x.json': `{ "url": "https://a.${dominio}" }\n` });
    expect(conferirEnderecos(arvore)).toHaveLength(1);
  });

  it('falha quando o endereço do servidor local é escrito no código', () => {
    const config = JSON.parse(fs.readFileSync(path.join(RAIZ, ARQUIVO_DE_CONFIGURACAO), 'utf8'));
    const arvore = arvoreDeTeste({ 'apps/mobile/src/x.ts': `const api = 'http://${config.local.servidorNoEmulador}:1';\n` });
    expect(conferirEnderecos(arvore)).toHaveLength(1);
  });

  it('aceita o domínio dentro do arquivo de configuração e na documentação', () => {
    const dominio = DOMINIOS_PROIBIDOS[0] ?? '';
    const arvore = arvoreDeTeste({ 'docs/infra.md': `site em x.${dominio}\n`, 'LEIA-ME.md': `x.${dominio}\n` });
    expect(conferirEnderecos(arvore)).toEqual([]);
  });
});
