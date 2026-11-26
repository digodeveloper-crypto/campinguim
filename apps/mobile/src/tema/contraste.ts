// Contraste pela fórmula das WCAG 2.x, a mesma de `design/prototipos/rumo/identidade.html`.
// Arquivo puro (sem React Native), usado pelo teste do tema e pela galeria.
import tokens from './tokens.json';

export type NomeTema = 'claro' | 'escuro';
export type PapelCor = keyof typeof tokens.cores.claro;

function canal(valor: number): number {
  const c = valor / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m?.[1]) throw new Error(`cor inválida: ${hex}`);
  const n = parseInt(m[1], 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** `texto`: letra sobre fundo (piso 4,5, decisão D-2). `forma`: borda, linha ou preenchimento de controle (3:1, DESIGN.md 9). */
export type TipoPar = 'texto' | 'forma';

export type Par = {
  frente: PapelCor;
  fundo: PapelCor;
  tipo: TipoPar;
  /** Mínimo da tabela de DESIGN.md 3.2. */
  minimo: number;
  /** Valores publicados em DESIGN.md 3.2 (duas casas), para conferir o cálculo. */
  publicado: Record<NomeTema, number>;
};

// Os 14 pares de DESIGN.md 3.2, na mesma ordem.
export const PARES: readonly Par[] = [
  { frente: 'texto', fundo: 'fundo', tipo: 'texto', minimo: 7, publicado: { claro: 13.4, escuro: 15.47 } },
  { frente: 'texto', fundo: 'superficie', tipo: 'texto', minimo: 7, publicado: { claro: 15.84, escuro: 13.93 } },
  { frente: 'textoSuave', fundo: 'fundo', tipo: 'texto', minimo: 4.5, publicado: { claro: 6.74, escuro: 9.1 } },
  { frente: 'textoSuave', fundo: 'superficie', tipo: 'texto', minimo: 4.5, publicado: { claro: 7.97, escuro: 8.2 } },
  { frente: 'sobreAcento', fundo: 'acento', tipo: 'texto', minimo: 4.5, publicado: { claro: 9.08, escuro: 11.73 } },
  { frente: 'acento', fundo: 'fundo', tipo: 'forma', minimo: 3, publicado: { claro: 7.68, escuro: 11.73 } },
  { frente: 'linha', fundo: 'superficie', tipo: 'forma', minimo: 3, publicado: { claro: 3.83, escuro: 3.57 } },
  { frente: 'linha', fundo: 'fundo', tipo: 'forma', minimo: 3, publicado: { claro: 3.24, escuro: 3.96 } },
  { frente: 'atencao', fundo: 'superficie', tipo: 'texto', minimo: 4.5, publicado: { claro: 6.95, escuro: 7.52 } },
  { frente: 'atencao', fundo: 'fundo', tipo: 'texto', minimo: 4.5, publicado: { claro: 5.88, escuro: 8.35 } },
  { frente: 'separei', fundo: 'superficie', tipo: 'texto', minimo: 4.5, publicado: { claro: 6.32, escuro: 9.82 } },
  { frente: 'separei', fundo: 'fundo', tipo: 'texto', minimo: 4.5, publicado: { claro: 5.34, escuro: 10.9 } },
  { frente: 'carro', fundo: 'superficie', tipo: 'texto', minimo: 4.5, publicado: { claro: 7.8, escuro: 9.55 } },
  { frente: 'carro', fundo: 'fundo', tipo: 'texto', minimo: 4.5, publicado: { claro: 6.6, escuro: 10.6 } },
];

/** Piso de texto do app (decisão provisória D-2 do orquestrador): 4,5 para todo par texto/fundo, botões inclusive. */
export const PISO_TEXTO = 4.5;
/** Piso de borda, linha e ícone com significado (DESIGN.md 9). */
export const PISO_FORMA = 3;

export function pisoDoPar(par: Pick<Par, 'tipo' | 'minimo'>): number {
  return Math.max(par.minimo, par.tipo === 'texto' ? PISO_TEXTO : PISO_FORMA);
}
