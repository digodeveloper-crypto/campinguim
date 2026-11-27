// Largura de uma palavra na Archivo embutida, pelas larguras de avanço da própria fonte (metricas.json,
// gerado de assets/fontes por gerar.mjs). Serve para a regra de letra ampliada (DESIGN.md 4.4; NF-08):
// nenhuma palavra parte no meio. Se a palavra mais longa não cabe na linha, o texto diminui só o
// necessário para ela caber, em vez de o Android quebrá-la letra a letra. Arquivo puro.
import metricas from './metricas.json';

type Familias = Record<string, { unidadesPorEm: number; larguras: Record<string, number>; padrao: number }>;
const FAMILIAS = metricas.familias as Familias;

/** Largura, na mesma unidade de `tamanho`, de um texto numa linha só. */
export function larguraDoTexto(texto: string, familia: string, tamanho: number, espacoLetras = 0): number {
  const f = FAMILIAS[familia];
  if (!f) throw new Error(`sem métricas da família ${familia}`);
  let unidades = 0;
  let n = 0;
  for (const c of texto) {
    unidades += f.larguras[c] ?? f.padrao;
    n += 1;
  }
  return (unidades / f.unidadesPorEm) * tamanho + espacoLetras * n;
}

/** Palavras de um texto (o que não pode partir): separadas por espaço. */
export function palavras(texto: string): string[] {
  return texto.split(/\s+/).filter(Boolean);
}

export type Medida = { familia: string; tamanho: number; espacoLetras: number; caixaAlta: boolean };

/**
 * Quanto o texto precisa diminuir (1 = nada) para a palavra mais longa caber em `largura`.
 * `tamanho` e `espacoLetras` já na unidade final da tela (com a letra do sistema aplicada).
 */
export function escalaParaCaber(texto: string, medida: Medida, largura: number): number {
  if (!(largura > 0)) return 1;
  const t = medida.caixaAlta ? texto.toLocaleUpperCase('pt-BR') : texto;
  let maior = 0;
  for (const p of palavras(t)) maior = Math.max(maior, larguraDoTexto(p, medida.familia, medida.tamanho, medida.espacoLetras));
  // Folga de 3 % para arredondamento e ajuste entre pares de letras, que a conta não inclui.
  const precisa = maior * 1.03;
  return precisa > largura ? largura / precisa : 1;
}
