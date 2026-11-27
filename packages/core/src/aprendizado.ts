// Aprendizado de "faltou e sobrou" e repetição de viagem (SPEC, seção 5, "Aprendizado (E1-11)";
// PRD E1-11 e E1-12). Só a parte que roda no aparelho, com o histórico da própria pessoa; o
// aprendizado entre usuários é do servidor (SPEC, seção 2, "O que roda onde").
//
// - "Faltou" na última viagem: o item entra na próxima lista (volta, se a pessoa o tinha removido).
// - "Sobrou" num consumível em duas viagens seguidas: quantidade reduzida em 25 % (premissa), com aviso.
//   Regra final das sobras (proposta pelo orquestrador em 26/11/2026 e confirmada pelo responsável em
//   27/11/2026): a redução acumula; cada viagem seguida a mais em que o item sobrou reduz de novo, sobre
//   a quantidade já reduzida: teto(qty × 0,75) e, se o teto não muda a quantidade, qty − 1, até o mínimo
//   de 1. Toda redução vem sinalizada "sobrou da última vez"; o item
//   que já está em 1 vem só sinalizado. A pessoa pode desfazer.
// - Consumíveis: os itens com `consumivel` no catálogo (decisão de 26/11/2026).

import type { Catalogo } from './catalogo';
import { ESTADO_INICIAL, ErroDeLista, gerarLista, reduzirQuantidade, type ItemDaLista } from './lista';
import type { EntradaDaViagem } from './variaveis';

/** Premissa da SPEC (seções 5 e 15): redução por "sobrou" em duas viagens seguidas. Vai para `config`. */
export const REDUCAO_POR_SOBRA_PERCENTUAL = 25;

/** Uma viagem anterior da mesma pessoa, com as marcações de "faltou" (`missing`) e "sobrou" (`leftover`). */
export interface ViagemAnterior {
  readonly itens: readonly ItemDaLista[];
}

export type AvisoDeAprendizado =
  | { readonly tipo: 'faltou_entrou'; readonly ref: string }
  | { readonly tipo: 'faltou_ja_estava'; readonly ref: string }
  /** `texto`: chave em `alertas.json`, `avisos` ("sobrou da última vez"), mostrada em toda redução. */
  | {
      readonly tipo: 'reduzido';
      readonly ref: string;
      readonly de: number;
      readonly para: number;
      readonly reducoes: number;
      readonly texto: 'sobrou_da_ultima_vez';
    }
  | { readonly tipo: 'sinalizado'; readonly ref: string; readonly texto: 'sobrou_da_ultima_vez' };

export interface ResultadoDoAprendizado {
  readonly lista: ItemDaLista[];
  readonly avisos: AvisoDeAprendizado[];
}

/**
 * Aplica o aprendizado na lista nova. `historico` vem da viagem mais recente para a mais antiga.
 */
export function aplicarAprendizado(
  lista: readonly ItemDaLista[],
  historico: readonly ViagemAnterior[],
  catalogo: Catalogo,
  percentual: number = REDUCAO_POR_SOBRA_PERCENTUAL,
): ResultadoDoAprendizado {
  if (!Number.isFinite(percentual) || percentual <= 0 || percentual >= 100) {
    throw new ErroDeLista('o percentual de redução fica entre 0 e 100');
  }
  let saida = [...lista];
  const avisos: AvisoDeAprendizado[] = [];
  const ultima = historico[0];

  // Faltou na última viagem: entra na próxima lista.
  for (const faltou of ultima?.itens.filter((i) => i.estado.missing) ?? []) {
    const mesmo = (i: ItemDaLista): boolean =>
      faltou.catalogKey !== null ? i.catalogKey === faltou.catalogKey && i.familiaId === faltou.familiaId : i.ref === faltou.ref;
    const indice = saida.findIndex(mesmo);
    const existente = saida[indice];
    if (existente && !existente.removido) {
      avisos.push({ tipo: 'faltou_ja_estava', ref: existente.ref });
      continue;
    }
    if (existente) {
      saida[indice] = { ...existente, removido: false, aprendizado: { tipo: 'faltou' } };
      avisos.push({ tipo: 'faltou_entrou', ref: existente.ref });
      continue;
    }
    const novo: ItemDaLista = {
      ...faltou,
      ref: faltou.origem === 'manual' ? faltou.ref : `faltou:${faltou.ref}`,
      origem: 'manual',
      removido: false,
      qtyEditada: false,
      estado: ESTADO_INICIAL,
      aprendizado: { tipo: 'faltou' },
    };
    saida.push(novo);
    avisos.push({ tipo: 'faltou_entrou', ref: novo.ref });
  }

  // Sobrou em viagens seguidas, só em consumível: a partir da segunda, uma redução por viagem.
  const sobrou = historico.map(
    (viagem) => new Set(viagem.itens.filter((i) => i.estado.leftover && i.catalogKey !== null).map((i) => i.catalogKey as string)),
  );
  const seguidas = (chave: string): number => {
    let n = 0;
    while (sobrou[n]?.has(chave)) n += 1;
    return n;
  };
  saida = saida.map((item) => {
    if (!item.catalogKey || item.removido || item.qtyEditada || item.qty === null) return item;
    if (catalogo.porChave.get(item.catalogKey)?.consumivel !== true) return item;
    const reducoes = seguidas(item.catalogKey) - 1;
    if (reducoes < 1) return item;
    const para = reduzirQuantidade(item.qty, percentual, reducoes);
    if (para < item.qty) {
      avisos.push({ tipo: 'reduzido', ref: item.ref, de: item.qty, para, reducoes, texto: 'sobrou_da_ultima_vez' });
      return { ...item, qty: para, aprendizado: { tipo: 'reduzido', qtyAnterior: item.qty, percentual, reducoes } };
    }
    avisos.push({ tipo: 'sinalizado', ref: item.ref, texto: 'sobrou_da_ultima_vez' });
    return { ...item, aprendizado: { tipo: 'sinalizado' } };
  });

  return { lista: saida, avisos };
}

/** Desfaz o aprendizado de um item: a quantidade reduzida volta, e a marca some. */
export function desfazerAprendizado(lista: readonly ItemDaLista[], ref: string): ItemDaLista[] {
  const item = lista.find((i) => i.ref === ref);
  if (!item) throw new ErroDeLista(`item não está na lista: ${ref}`);
  const aprendizado = item.aprendizado;
  if (!aprendizado) throw new ErroDeLista(`o item não tem aprendizado para desfazer: ${ref}`);
  return lista.map((i) => {
    if (i.ref !== ref) return i;
    if (aprendizado.tipo === 'reduzido') return { ...i, qty: aprendizado.qtyAnterior, aprendizado: null };
    return { ...i, aprendizado: null };
  });
}

/**
 * Repete uma viagem (E1-12): a lista sai de novo do catálogo com as mesmas respostas, leva o que a
 * pessoa fez na lista anterior (removidos, itens manuais, quantidades editadas), começa com todos os
 * estados zerados e recebe o aprendizado do E1-11. `historico` começa pela viagem repetida.
 *
 * As famílias mantêm os mesmos identificadores; o app troca pelos da viagem nova.
 */
export function repetirViagem(
  entrada: EntradaDaViagem,
  listaAnterior: readonly ItemDaLista[],
  historico: readonly ViagemAnterior[],
  catalogo: Catalogo,
  percentual: number = REDUCAO_POR_SOBRA_PERCENTUAL,
): ResultadoDoAprendizado {
  const anteriores = new Map(listaAnterior.filter((i) => i.origem === 'generated').map((i) => [i.ref, i]));
  const lista: ItemDaLista[] = gerarLista(entrada, catalogo).map((item) => {
    const antes = anteriores.get(item.ref);
    if (!antes) return item;
    if (antes.removido) return { ...item, removido: true };
    if (antes.qtyEditada) return { ...item, qty: antes.qty, qtyEditada: true };
    return item;
  });
  for (const manual of listaAnterior.filter((i) => i.origem === 'manual' && !i.removido)) {
    lista.push({ ...manual, estado: ESTADO_INICIAL, aprendizado: null });
  }
  return aplicarAprendizado(lista, historico, catalogo, percentual);
}
