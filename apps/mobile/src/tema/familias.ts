// Nomes das famílias da Archivo e o estilo de cada uso da escala (DESIGN.md 4.2 a 4.4). Arquivo puro.
import tokens from './tokens.json';

export type UsoTexto = keyof typeof tokens.tipografia.escala;

/** Larguras e pesos que existem como arquivo (assets/fontes/archivo). */
export const COMBINACOES: readonly (readonly [number, number])[] = [
  [100, 400], [100, 500], [100, 600], [100, 700], [100, 800],
  [112.5, 600], [112.5, 700],
  [125, 600], [125, 700], [125, 800],
  [85, 500], [85, 700],
];

/** `Archivo-L125-P700`; a largura 112,5 vira `L112`. */
export function nomeDaFamilia(largura: number, peso: number): string {
  return `${tokens.tipografia.familia}-L${String(Math.floor(largura))}-P${String(peso)}`;
}

export type EstiloDeTexto = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'uppercase' | 'none';
};

/** Fator da letra a partir do qual valem as adaptações de 130 % e 200 % (DESIGN.md 4.4). */
export function faixaDaLetra(fator: number): 100 | 130 | 200 {
  if (fator >= tokens.tipografia.letraGrande.a200 - 0.01) return 200;
  if (fator >= tokens.tipografia.letraGrande.a130 - 0.01) return 130;
  return 100;
}

/**
 * Estilo de um uso da escala. `simulacao` multiplica tamanho e entrelinha (só a galeria usa; a letra do
 * sistema o React Native já aplica sozinho). `fator` é a letra total (sistema × simulação) e decide as
 * adaptações de largura e espaço entre letras.
 */
export function estiloDoUso(uso: UsoTexto, fator: number, simulacao = 1): EstiloDeTexto {
  const e = tokens.tipografia.escala[uso];
  const g = tokens.tipografia.letraGrande;
  const faixa = faixaDaLetra(fator);
  let largura = e.largura;
  let espaco = e.espacoLetras;
  let entrelinha = e.entrelinha;
  if (uso === 'letreiro' && faixa >= 130) {
    largura = g.letreiro.largura;
    espaco = g.letreiro.espacoLetras;
    entrelinha = Math.round(e.tamanho * g.letreiro.entrelinhaRelativa * 10) / 10;
  } else if (uso === 'tituloTela' && faixa === 200) {
    largura = g.tituloTela.largura;
    espaco = g.tituloTela.espacoLetras;
  } else if (uso === 'tituloPainel' && faixa === 200) {
    largura = g.tituloPainel.largura;
    espaco = g.tituloPainel.espacoLetras;
  } else if (uso === 'rotulo' && faixa === 200) {
    largura = g.rotulo.largura;
    espaco = g.rotulo.espacoLetras;
  }
  const tamanho = e.tamanho * simulacao;
  return {
    fontFamily: nomeDaFamilia(largura, e.peso),
    fontSize: tamanho,
    lineHeight: entrelinha * simulacao,
    letterSpacing: Math.round(espaco * tamanho * 100) / 100,
    textTransform: e.caixaAlta ? 'uppercase' : 'none',
  };
}
