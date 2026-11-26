// Divisão de gastos em meias cotas (SPEC, seção 9, "Cotas", casos C1 a C7; PRD E2-09 a E2-13 e
// seção 10, "Divisão de gastos").
//
// Dinheiro é sempre inteiro em centavos: nunca há fração de centavo na conta. A família compradora
// não deve nada e absorve a diferença de arredondamento, então a soma do que as famílias devem mais
// a parte absorvida pelo comprador é sempre igual ao valor do gasto, ao centavo.

import type { FaixaEtaria } from './variaveis';

export type RegraDeDivisao = 'shares' | 'per_family' | 'adults_teens';

export class ErroDeCotas extends Error {
  override name = 'ErroDeCotas';
}

function centavos(valor: number, nome: string): void {
  if (!Number.isSafeInteger(valor) || valor < 0) {
    throw new RangeError(`${nome} precisa ser um número inteiro de centavos, zero ou mais`);
  }
}

/**
 * Valor da meia cota (SPEC, seção 9, passo 3): o valor do gasto dividido por `H` (soma das meias
 * cotas de todos os participantes), arredondado para baixo, em centavos. Serve também para a parte
 * das regras `per_family` e `adults_teens` (passo 5).
 */
export function valorDaMeiaCota(valorDoGastoCentavos: number, meiasCotas: number): number {
  centavos(valorDoGastoCentavos, 'o valor do gasto');
  if (!Number.isSafeInteger(meiasCotas) || meiasCotas < 1) {
    throw new RangeError('H precisa ser um número inteiro de meias cotas, ao menos 1');
  }
  return Math.floor(valorDoGastoCentavos / meiasCotas);
}

/** Meias cotas de uma pessoa (passo 1): adulto ou adolescente 2, criança 1, menor de 5 zero. */
export function meiasCotasDe(faixa: FaixaEtaria): number {
  if (faixa === 'adult' || faixa === 'teen') return 2;
  return faixa === 'child' ? 1 : 0;
}

export interface PessoaNoGasto {
  readonly id: string;
  readonly faixa: FaixaEtaria;
}

export interface FamiliaNoGasto {
  readonly id: string;
  readonly pessoas: readonly PessoaNoGasto[];
}

export interface EntradaDoGasto {
  /** Valor real (`amount_cents`). Nulo enquanto só há estimativa. */
  readonly valorCentavos: number | null;
  /** Estimativa antes da compra (`estimate_cents`, E2-09). */
  readonly estimativaCentavos: number | null;
  readonly regra: RegraDeDivisao;
  readonly compradoraId: string;
  readonly familias: readonly FamiliaNoGasto[];
  /** Pessoas desmarcadas deste gasto (E2-12, `expense_exclusion`). Valem zero. */
  readonly excluidos: readonly string[];
}

export interface ParteDaFamilia {
  readonly familiaId: string;
  /** Meias cotas (regra `shares`) ou partes (regras `per_family` e `adults_teens`). */
  readonly partes: number;
  /** Quanto a família deve ao comprador. A compradora deve zero. */
  readonly deveCentavos: number;
}

export interface Divisao {
  /** `real`: há valor e as dívidas valem. `estimado`: só estimativa, nada é dívida (C7). */
  readonly tipo: 'real' | 'estimado';
  readonly baseCentavos: number;
  readonly regra: RegraDeDivisao;
  /** Soma das partes (`H` na regra de cotas). */
  readonly totalDePartes: number;
  readonly valorDaParteCentavos: number;
  readonly porFamilia: readonly ParteDaFamilia[];
  /** O que o comprador recebe das outras famílias. */
  readonly compradorRecebeCentavos: number;
  /** A parte que fica com o comprador: a dele mais a diferença de arredondamento. */
  readonly compradorAbsorveCentavos: number;
}

function partesDaFamilia(familia: FamiliaNoGasto, regra: RegraDeDivisao, excluidos: ReadonlySet<string>): number {
  const participantes = familia.pessoas.filter((p) => !excluidos.has(p.id));
  switch (regra) {
    case 'shares':
      return participantes.reduce((soma, p) => soma + meiasCotasDe(p.faixa), 0);
    case 'per_family':
      // Família participante: ao menos uma pessoa não excluída.
      return participantes.length > 0 ? 1 : 0;
    case 'adults_teens':
      return participantes.filter((p) => p.faixa === 'adult' || p.faixa === 'teen').length;
  }
}

/**
 * Divide um gasto entre as famílias (SPEC, seção 9, passos 1 a 5). Com valor real, devolve as dívidas;
 * só com estimativa, devolve a divisão estimada, que não vira dívida (C7).
 */
export function dividirGasto(entrada: EntradaDoGasto): Divisao {
  const tipo = entrada.valorCentavos === null ? 'estimado' : 'real';
  const base = entrada.valorCentavos ?? entrada.estimativaCentavos;
  if (base === null) throw new ErroDeCotas('o gasto precisa de valor ou de estimativa');
  centavos(base, tipo === 'real' ? 'o valor do gasto' : 'a estimativa');
  if (!entrada.familias.some((f) => f.id === entrada.compradoraId)) {
    throw new ErroDeCotas('a família compradora precisa estar entre as famílias do gasto');
  }
  const ids = new Set<string>();
  for (const f of entrada.familias) {
    if (ids.has(f.id)) throw new ErroDeCotas(`família repetida: ${f.id}`);
    ids.add(f.id);
  }

  const excluidos = new Set(entrada.excluidos);
  const partes = entrada.familias.map((f) => ({ familiaId: f.id, partes: partesDaFamilia(f, entrada.regra, excluidos) }));
  const total = partes.reduce((soma, p) => soma + p.partes, 0);
  // Ninguém participando (todos excluídos ou só menores de 5): não há o que dividir, o comprador fica com tudo.
  const valorDaParte = total === 0 ? 0 : valorDaMeiaCota(base, total);
  const porFamilia = partes.map((p) => ({
    ...p,
    deveCentavos: p.familiaId === entrada.compradoraId ? 0 : p.partes * valorDaParte,
  }));
  const recebe = porFamilia.reduce((soma, p) => soma + p.deveCentavos, 0);
  return {
    tipo,
    baseCentavos: base,
    regra: entrada.regra,
    totalDePartes: total,
    valorDaParteCentavos: valorDaParte,
    porFamilia,
    compradorRecebeCentavos: recebe,
    compradorAbsorveCentavos: base - recebe,
  };
}

export interface GastoParaResumo {
  readonly itemId: string;
  readonly compradoraId: string;
  readonly divisao: Divisao;
}

export interface DividaComComprador {
  readonly devedoraId: string;
  readonly compradoraId: string;
  readonly porItem: readonly { readonly itemId: string; readonly centavos: number }[];
  readonly totalCentavos: number;
}

/**
 * Resumo de gastos por família (E2-13): quanto cada família deve a cada comprador, por item e no
 * total. Gastos só com estimativa não entram (C7: nenhuma dívida é registrada).
 */
export function resumirGastos(gastos: readonly GastoParaResumo[]): DividaComComprador[] {
  const pares = new Map<string, { devedoraId: string; compradoraId: string; porItem: { itemId: string; centavos: number }[] }>();
  for (const gasto of gastos) {
    if (gasto.divisao.tipo !== 'real') continue;
    for (const parte of gasto.divisao.porFamilia) {
      if (parte.familiaId === gasto.compradoraId || parte.deveCentavos === 0) continue;
      const chave = JSON.stringify([parte.familiaId, gasto.compradoraId]);
      const par = pares.get(chave) ?? { devedoraId: parte.familiaId, compradoraId: gasto.compradoraId, porItem: [] };
      par.porItem.push({ itemId: gasto.itemId, centavos: parte.deveCentavos });
      pares.set(chave, par);
    }
  }
  return [...pares.values()].map((par) => ({ ...par, totalCentavos: par.porItem.reduce((soma, i) => soma + i.centavos, 0) }));
}
