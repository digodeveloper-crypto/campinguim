// Bloco de variáveis CSS da página web, gerado de tokens.json (uma fonte de verdade para app e web).
// Arquivo puro, sem importação: `gerar.mjs` (Node, com remoção de tipos) e o teste do tema passam os tokens.
// Os nomes das variáveis são os do protótipo (`design/prototipos/rumo/estilo.css`, seção 1).

export const MARCA_INICIO = '/* tokens:início · gerado de apps/mobile/src/tema/tokens.json por apps/mobile/src/tema/gerar.mjs; não edite à mão */';
export const MARCA_FIM = '/* tokens:fim */';

type Cores = Record<string, string>;

type TokensParaCss = {
  cores: { claro: Cores; escuro: Cores };
  raio: number;
  chanfro: { selo: number };
};

/** `textoSuave` → `texto-suave`. */
export function nomeVariavel(papel: string): string {
  return papel.replace(/[A-Z]/g, (l) => `-${l.toLowerCase()}`);
}

function bloco(seletor: string, cores: Cores, recuo: string, extra: string[] = []): string {
  const linhas = Object.entries(cores).map(([papel, valor]) => `${recuo}  --${nomeVariavel(papel)}: ${valor.toLowerCase()};`);
  return [`${recuo}${seletor} {`, ...linhas, ...extra.map((l) => `${recuo}  ${l}`), `${recuo}}`].join('\n');
}

export function cssDosTokens(tokens: TokensParaCss): string {
  return [
    MARCA_INICIO,
    bloco(':root', tokens.cores.claro, '', [
      `--raio: ${String(tokens.raio)}px;`,
      `--chanfro: ${String(tokens.chanfro.selo)}px;`,
      'color-scheme: light dark;',
    ]),
    '',
    '@media (prefers-color-scheme: dark) {',
    bloco(':root:not([data-tema="claro"])', tokens.cores.escuro, '  '),
    '}',
    '',
    bloco(':root[data-tema="escuro"]', tokens.cores.escuro, ''),
    MARCA_FIM,
  ].join('\n');
}

/** Troca (ou confere) o bloco entre as marcas. Devolve o arquivo novo. */
export function aplicarBloco(arquivo: string, novoBloco: string): string {
  const inicio = arquivo.indexOf(MARCA_INICIO);
  const fim = arquivo.indexOf(MARCA_FIM);
  if (inicio < 0 || fim < inicio) throw new Error('marcas tokens:início e tokens:fim não encontradas');
  return arquivo.slice(0, inicio) + novoBloco + arquivo.slice(fim + MARCA_FIM.length);
}
