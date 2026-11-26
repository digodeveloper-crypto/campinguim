// Aprendizado de "faltou e sobrou" e repetição de viagem (SPEC, seção 5, "Aprendizado (E1-11)";
// PRD E1-11 e E1-12). Só a parte que roda no aparelho, com o histórico da própria pessoa; o
// aprendizado entre usuários é do servidor (SPEC, seção 2, "O que roda onde").
//
// - "Faltou" na última viagem: o item entra na próxima lista (volta, se a pessoa o tinha removido).
// - "Sobrou" num consumível em duas viagens seguidas: quantidade reduzida em 25 % (premissa), com aviso.
//   Se a redução arredondada para cima não muda a quantidade, o item vem só sinalizado
//   (E1-11: "com quantidade menor ou sinalizado"). A pessoa pode desfazer.

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
  | { readonly tipo: 'reduzido'; readonly ref: string; readonly de: number; readonly para: number }
  | { readonly tipo: 'sinalizado'; readonly ref: string };

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
  const penultima = historico[1];

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

  // Sobrou em duas viagens seguidas, só em consumível.
  const sobrou = (viagem: ViagemAnterior | undefined): Set<string> =>
    new Set((viagem?.itens ?? []).filter((i) => i.estado.leftover && i.catalogKey !== null).map((i) => i.catalogKey as string));
  const naUltima = sobrou(ultima);
  const naPenultima = sobrou(penultima);
  const reduzir = new Set([...naUltima].filter((k) => naPenultima.has(k) && catalogo.porChave.get(k)?.consumivel === true));
  saida = saida.map((item) => {
    if (!item.catalogKey || !reduzir.has(item.catalogKey) || item.removido || item.qtyEditada || item.qty === null) return item;
    const para = reduzirQuantidade(item.qty, percentual);
    if (para < item.qty) {
      avisos.push({ tipo: 'reduzido', ref: item.ref, de: item.qty, para });
      return { ...item, qty: para, aprendizado: { tipo: 'reduzido', qtyAnterior: item.qty, percentual } };
    }
    avisos.push({ tipo: 'sinalizado', ref: item.ref });
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
