// Variáveis da viagem (SPEC, seção 5) calculadas a partir dos dados da viagem (SPEC, seção 3:
// `trip`, `trip_family`, `trip_person`). Os nomes de entrada seguem o modelo de dados; os valores
// das variáveis seguem o vocabulário do catálogo (frio, ameno, calor; barraca_carro, mochila, motorhome).
//
// Itens de escopo família e pessoa são calculados com as contagens da própria família; itens de
// escopo grupo, com a soma de todas as famílias (E2-06). Numa viagem de uma família só, dá no mesmo.

import type { Valor } from './expressao';

export type FaixaEtaria = 'adult' | 'teen' | 'child' | 'toddler';
export type TipoDeViagem = 'tent_car' | 'backpack' | 'motorhome';
export type ClimaDaViagem = 'cold' | 'mild' | 'hot';

export interface PessoaDaViagem {
  readonly id: string;
  readonly faixa: FaixaEtaria;
}

export interface FamiliaDaViagem {
  readonly id: string;
  readonly pets: number;
  readonly pessoas: readonly PessoaDaViagem[];
}

export interface EntradaDaViagem {
  readonly tipo: TipoDeViagem;
  readonly noites: number;
  readonly clima: ClimaDaViagem;
  readonly chuva: boolean;
  readonly familias: readonly FamiliaDaViagem[];
  /** Destino informado (nome do camping, E1-13). */
  readonly destino: boolean;
  /** O servidor devolveu um retrato com dados para o camping escolhido (seção 6). */
  readonly dadosDoCamping: boolean;
}

export type Variaveis = Readonly<Record<string, Valor>>;

const CLIMA: Record<ClimaDaViagem, string> = { cold: 'frio', mild: 'ameno', hot: 'calor' };
const TIPO: Record<TipoDeViagem, string> = { tent_car: 'barraca_carro', backpack: 'mochila', motorhome: 'motorhome' };

/** Tipo da viagem no vocabulário do catálogo (as exclusões por tipo usam esse nome). */
export function tipoNoCatalogo(tipo: TipoDeViagem): 'barraca_carro' | 'mochila' | 'motorhome' {
  return TIPO[tipo] as 'barraca_carro' | 'mochila' | 'motorhome';
}

export class ErroDeEntrada extends Error {
  override name = 'ErroDeEntrada';
}

function inteiroNaoNegativo(valor: number, nome: string): void {
  if (!Number.isSafeInteger(valor) || valor < 0) throw new ErroDeEntrada(`${nome} precisa ser um número inteiro, zero ou mais`);
}

/** Confere a entrada: noites e pets inteiros, ao menos uma família e ao menos uma pessoa. */
export function validarEntrada(entrada: EntradaDaViagem): void {
  inteiroNaoNegativo(entrada.noites, 'noites');
  if (!(entrada.tipo in TIPO)) throw new ErroDeEntrada(`tipo de viagem desconhecido: ${String(entrada.tipo)}`);
  if (!(entrada.clima in CLIMA)) throw new ErroDeEntrada(`clima desconhecido: ${String(entrada.clima)}`);
  if (entrada.familias.length === 0) throw new ErroDeEntrada('a viagem precisa de ao menos uma família');
  const ids = new Set<string>();
  for (const f of entrada.familias) {
    if (ids.has(f.id)) throw new ErroDeEntrada(`família repetida: ${f.id}`);
    ids.add(f.id);
    inteiroNaoNegativo(f.pets, 'pets');
  }
  if (entrada.familias.every((f) => f.pessoas.length === 0)) throw new ErroDeEntrada('a viagem precisa de ao menos uma pessoa');
}

/** Contagens por faixa (as variáveis P, A, C e T) de um conjunto de pessoas. */
export function contarPessoas(pessoas: readonly PessoaDaViagem[]): { P: number; A: number; C: number; T: number } {
  let A = 0;
  let C = 0;
  let T = 0;
  for (const p of pessoas) {
    if (p.faixa === 'adult' || p.faixa === 'teen') A += 1;
    else if (p.faixa === 'child') C += 1;
    else T += 1;
  }
  return { P: A + C + T, A, C, T };
}

function comuns(entrada: EntradaDaViagem): Record<string, Valor> {
  return {
    N: entrada.noites,
    D: entrada.noites + 1,
    F: entrada.familias.length,
    clima: CLIMA[entrada.clima],
    chuva: entrada.chuva,
    tipo: TIPO[entrada.tipo],
    destino: entrada.destino,
    // A piscina entra na lista pelo ajuste da ficha do camping (seção 6), nunca pela geração base.
    piscina: false,
    semDadosDoCamping: !entrada.dadosDoCamping,
  };
}

/** Variáveis para itens de escopo grupo: a soma de todas as famílias (E2-06). */
export function variaveisDoGrupo(entrada: EntradaDaViagem): Variaveis {
  const contagem = contarPessoas(entrada.familias.flatMap((f) => f.pessoas));
  const pets = entrada.familias.reduce((soma, f) => soma + f.pets, 0);
  return { ...comuns(entrada), ...contagem, pets };
}

/** Variáveis para itens de escopo família e pessoa: as contagens da própria família. */
export function variaveisDaFamilia(entrada: EntradaDaViagem, familia: FamiliaDaViagem): Variaveis {
  return { ...comuns(entrada), ...contarPessoas(familia.pessoas), pets: familia.pets };
}

/**
 * Noites entre duas datas locais (`AAAA-MM-DD`, sem hora; SPEC, seção 3). Para quem informa datas em
 * vez do número de noites (E1-01).
 */
export function noitesEntre(inicio: string, fim: string): number {
  const dia = (data: string): number => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
    if (!m) throw new ErroDeEntrada(`data fora do formato AAAA-MM-DD: ${data}`);
    const ms = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (new Date(ms).toISOString().slice(0, 10) !== data) throw new ErroDeEntrada(`data inexistente: ${data}`);
    return ms / 86_400_000;
  };
  const noites = dia(fim) - dia(inicio);
  if (noites < 0) throw new ErroDeEntrada('a volta vem antes da ida');
  return noites;
}
