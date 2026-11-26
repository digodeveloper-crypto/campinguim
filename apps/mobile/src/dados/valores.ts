// Valores fechados dos campos da SPEC, seção 3. A camada de acesso recusa qualquer outro valor
// antes de gravar: um valor fora da lista seria recusado pelo servidor e travaria a fila do
// aparelho (ponto J1 da prova técnica).

export const TIPOS_DE_VIAGEM = ['tent_car', 'backpack', 'motorhome'] as const;
export const CLIMAS = ['cold', 'mild', 'hot'] as const;
export const SITUACOES_DA_VIAGEM = ['planning', 'packing', 'traveling', 'returning', 'closed'] as const;
export const FAIXAS_DE_IDADE = ['adult', 'teen', 'child', 'toddler'] as const;
export const PAPEIS_DO_MEMBRO = ['organizer', 'member', 'guest'] as const;
export const ORIGENS_DO_ITEM = ['generated', 'manual', 'camping_adjust'] as const;
export const ESTADOS_DE_SEPARACAO = ['todo', 'set_aside', 'in_car'] as const;
export const ESTADOS_DA_VOLTA = ['unchecked', 'checked', 'dry_at_home', 'wash_at_home'] as const;
export const REGRAS_DE_DIVISAO = ['shares', 'per_family', 'adults_teens'] as const;
// Campos da B3 (`docs/regras.md`, seção 6).
export const UNIDADES_DO_DETALHE = ['litro', 'metro'] as const;
export const TIPOS_DE_APRENDIZADO = ['missing', 'reduced', 'flagged'] as const;

export type TipoDeViagem = (typeof TIPOS_DE_VIAGEM)[number];
export type Clima = (typeof CLIMAS)[number];
export type SituacaoDaViagem = (typeof SITUACOES_DA_VIAGEM)[number];
export type FaixaDeIdade = (typeof FAIXAS_DE_IDADE)[number];
export type PapelDoMembro = (typeof PAPEIS_DO_MEMBRO)[number];
export type OrigemDoItem = (typeof ORIGENS_DO_ITEM)[number];
export type EstadoDeSeparacao = (typeof ESTADOS_DE_SEPARACAO)[number];
export type EstadoDaVolta = (typeof ESTADOS_DA_VOLTA)[number];
export type RegraDeDivisao = (typeof REGRAS_DE_DIVISAO)[number];
export type UnidadeDoDetalhe = (typeof UNIDADES_DO_DETALHE)[number];
export type TipoDeAprendizado = (typeof TIPOS_DE_APRENDIZADO)[number];

export class ValorInvalido extends Error {
  constructor(
    readonly campo: string,
    mensagem: string,
  ) {
    super(`${campo}: ${mensagem}`);
    this.name = 'ValorInvalido';
  }
}

export function umDe<T extends string>(campo: string, valor: unknown, opcoes: readonly T[]): T {
  if (typeof valor !== 'string' || !(opcoes as readonly string[]).includes(valor)) {
    throw new ValorInvalido(campo, `esperado um de ${opcoes.join(', ')}`);
  }
  return valor as T;
}

export function textoObrigatorio(campo: string, valor: unknown): string {
  if (typeof valor !== 'string' || valor.trim() === '') throw new ValorInvalido(campo, 'texto vazio');
  return valor.trim();
}

export function textoOpcional(campo: string, valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  if (typeof valor !== 'string') throw new ValorInvalido(campo, 'esperado texto');
  const limpo = valor.trim();
  return limpo === '' ? null : limpo;
}

export function inteiroNaoNegativo(campo: string, valor: unknown): number {
  if (typeof valor !== 'number' || !Number.isInteger(valor) || valor < 0) {
    throw new ValorInvalido(campo, 'esperado inteiro maior ou igual a zero');
  }
  return valor;
}

export function numeroNaoNegativo(campo: string, valor: unknown): number {
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) {
    throw new ValorInvalido(campo, 'esperado número maior ou igual a zero');
  }
  return valor;
}

export function inteiroOpcional(campo: string, valor: unknown): number | null {
  return valor === null || valor === undefined ? null : inteiroNaoNegativo(campo, valor);
}

/** Verdadeiro/falso vira 1/0 (o SQLite não tem tipo lógico). */
export function logico(campo: string, valor: unknown): 0 | 1 {
  if (typeof valor !== 'boolean') throw new ValorInvalido(campo, 'esperado verdadeiro ou falso');
  return valor ? 1 : 0;
}

const DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Data local da viagem, sem hora (`AAAA-MM-DD`), ou nula (RET-02). */
export function dataOpcional(campo: string, valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  const m = typeof valor === 'string' ? DATA.exec(valor) : null;
  if (!m) throw new ValorInvalido(campo, 'esperado AAAA-MM-DD');
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  if (d.getUTCFullYear() !== ano || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) {
    throw new ValorInvalido(campo, 'data inexistente');
  }
  return valor as string;
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Identificador aleatório, UUID versão 4 em minúsculas (DEF-08). */
export function identificador(campo: string, valor: unknown): string {
  if (typeof valor !== 'string' || !UUID_V4.test(valor)) throw new ValorInvalido(campo, 'esperado UUID v4');
  return valor;
}

export function identificadorOpcional(campo: string, valor: unknown): string | null {
  return valor === null || valor === undefined ? null : identificador(campo, valor);
}
