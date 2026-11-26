// Mecanismo dos textos da interface: interpolação `{n}` e plural por chave própria (`_um`).
// Fica aqui, e não no app, porque o app e a página web usam o mesmo mecanismo (NF-09).
//
// Regra do plural (DESIGN, seção 10): a chave do plural é a chave normal ("itens") e a do singular
// leva o sufixo `_um` ("itens_um"). Vale o singular só quando a contagem é exatamente 1 e a chave
// `_um` existe; zero e os demais usam a chave normal. Em português, 0 vai no plural ("0 itens").

export type ValoresDeTexto = Readonly<Record<string, string | number>>;

const MARCA = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

/** Troca cada `{nome}` pelo valor de mesmo nome. Marca sem valor é erro: nunca sai texto com `{n}` solto. */
export function interpolar(modelo: string, valores: ValoresDeTexto = {}): string {
  return modelo.replace(MARCA, (_marca, nome: string) => {
    const valor = valores[nome];
    if (valor === undefined) throw new Error(`texto sem valor para {${nome}}: ${modelo}`);
    return String(valor);
  });
}

/** Nomes das marcas `{nome}` que o modelo pede, sem repetição, na ordem em que aparecem. */
export function marcasDoTexto(modelo: string): string[] {
  const nomes = [...modelo.matchAll(MARCA)].map((m) => m[1] ?? '');
  return [...new Set(nomes)];
}

/** Sufixo da chave do singular. */
export const SUFIXO_SINGULAR = '_um';

/** Dá a chave a usar para a contagem `n`: a do singular só quando n é 1 e ela existe. */
export function chaveDoPlural(chave: string, n: number, existe: (chave: string) => boolean): string {
  const singular = `${chave}${SUFIXO_SINGULAR}`;
  return n === 1 && existe(singular) ? singular : chave;
}

// ---- Arquivo de textos: acesso por chave -----------------------------------------------------

/** Início do texto que ainda não foi definido por quem decide o conteúdo. */
export const MARCA_PENDENTE = '[PENDENTE]';

export function ehTextoPendente(texto: string): boolean {
  return texto.startsWith(MARCA_PENDENTE);
}

/**
 * Todas as chaves do arquivo de textos, no formato "tela.chave". Chave que começa com "_" é
 * comentário do arquivo e não entra. A chave do singular (`_um`) fica de fora: quem escreve o
 * código usa a chave normal, e o plural escolhe sozinho.
 */
export type ChavesDeTexto<T, Prefixo extends string = ''> = {
  [K in keyof T & string]: K extends `_${string}` | `${string}${typeof SUFIXO_SINGULAR}`
    ? never
    : T[K] extends string
      ? `${Prefixo}${K}`
      : ChavesDeTexto<T[K], `${Prefixo}${K}.`>;
}[keyof T & string];

/** O texto na chave "tela.chave", ou `undefined` se a chave não existe ou não é texto. */
export function buscarTexto(arvore: unknown, chave: string): string | undefined {
  let atual: unknown = arvore;
  for (const parte of chave.split('.')) {
    if (typeof atual !== 'object' || atual === null || !Object.prototype.hasOwnProperty.call(atual, parte)) return undefined;
    atual = (atual as Record<string, unknown>)[parte];
  }
  return typeof atual === 'string' ? atual : undefined;
}

/** Todas as chaves de texto (folhas) do arquivo, com "_..." de comentário de fora, em ordem. */
export function listarChavesDeTexto(arvore: unknown, prefixo = ''): string[] {
  if (typeof arvore !== 'object' || arvore === null) return [];
  return Object.entries(arvore).flatMap(([nome, valor]) => {
    if (nome.startsWith('_')) return [];
    const caminho = `${prefixo}${nome}`;
    return typeof valor === 'string' ? [caminho] : listarChavesDeTexto(valor, `${caminho}.`);
  });
}

/**
 * O texto da chave, com as marcas trocadas. Se `valores.n` for um número, vale o plural: com
 * n igual a 1 e a chave `_um` existindo, o texto sai no singular. Chave que não existe é erro.
 */
export function textoDaChave(arvore: unknown, chave: string, valores: ValoresDeTexto = {}): string {
  if (buscarTexto(arvore, chave) === undefined) throw new Error(`texto sem chave no arquivo de textos: ${chave}`);
  const n = valores['n'];
  const escolhida =
    typeof n === 'number' ? chaveDoPlural(chave, n, (c) => buscarTexto(arvore, c) !== undefined) : chave;
  return interpolar(buscarTexto(arvore, escolhida) ?? '', valores);
}
