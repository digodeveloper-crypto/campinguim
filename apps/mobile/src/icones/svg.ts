// Monta o SVG de um ícone com as cores já aplicadas (o React Native não tem CSS). Equivale às regras
// `.ico` de design/prototipos/rumo/estilo.css, seção 3: grade de 24, traço de 1,5, pontas retas,
// junções em ângulo; `f` cheio na cor do ícone; `r`, `rf`, `roda` e `roda-cheia` com o recorte. Arquivo puro.
import { ICONES, type NomeIcone } from './desenhos';

const CLASSES: Record<string, (cor: string, recorte: string) => string> = {
  f: (cor) => `fill="${cor}" stroke="none"`,
  r: (_cor, recorte) => `stroke="${recorte}" stroke-width="2"`,
  rf: (_cor, recorte) => `fill="${recorte}" stroke="none"`,
  roda: (_cor, recorte) => `fill="${recorte}"`,
  'roda-cheia': (cor, recorte) => `fill="${cor}" stroke="${recorte}" stroke-width="1.5"`,
  tracejado: () => 'stroke-dasharray="2 2"',
};

export function temAtivo(nome: NomeIcone): boolean {
  return 'ativo' in ICONES[nome];
}

/**
 * @param cor a cor do ícone (`currentColor` do protótipo: a cor do texto ou do estado ao lado)
 * @param recorte a cor do fundo onde o ícone está (`--ico-recorte`)
 */
export function svgDoIcone(nome: NomeIcone, ativo: boolean, cor: string, recorte: string): string {
  const desenho: { base: string; ativo?: string } = ICONES[nome];
  const corpo = ativo && desenho.ativo ? desenho.ativo : desenho.base;
  const pintado = corpo.replace(/class="([^"]+)"/g, (_t, classe: string) => {
    const regra = CLASSES[classe];
    if (!regra) throw new Error(`classe de ícone desconhecida: ${classe}`);
    return regra(cor, recorte);
  });
  return (
    `<svg viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="1.5" ` +
    `stroke-linecap="butt" stroke-linejoin="miter">${pintado}</svg>`
  );
}
