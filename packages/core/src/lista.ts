// Geração da lista e recálculo (SPEC, seção 5, "Regras de geração"; seção 9, casos L1 a L8;
// PRD E1-02, E1-03 e E1-04).
//
// - A lista sai do catálogo e das variáveis da viagem, na ordem do catálogo.
// - Escopo pessoa vira um item por família, com a quantidade por pessoa vezes as pessoas da família
//   ("mudas 3 por pessoa", "manta 4"). Escopo família, um por família. Escopo grupo, um para a viagem.
// - Recálculo: só itens de origem `generated` são recalculados. Removidos não voltam, manuais e
//   ajustes do camping não são tocados, quantidades editadas à mão ficam.
//
// Funções puras: nada de relógio, sorteio ou identificador aleatório. Cada item gerado tem uma
// referência estável (`chave@família` ou `chave@grupo`); o app guarda o UUID ao lado (SPEC, seção 3).

import type { Catalogo, ItemDoCatalogo } from './catalogo';
import { tipoNoCatalogo, validarEntrada, variaveisDaFamilia, variaveisDoGrupo, type EntradaDaViagem, type FamiliaDaViagem, type Variaveis } from './variaveis';

export type Origem = 'generated' | 'manual' | 'camping_adjust';
export type EstadoDeSeparacao = 'todo' | 'set_aside' | 'in_car';
export type EstadoDaVolta = 'unchecked' | 'checked' | 'dry_at_home' | 'wash_at_home';

/** Estados do item (SPEC, seção 3, `trip_item`). A geração cria todos zerados; o recálculo preserva. */
export interface EstadoDoItem {
  readonly packState: EstadoDeSeparacao;
  readonly needBuy: boolean;
  readonly returnState: EstadoDaVolta;
  readonly missing: boolean;
  readonly leftover: boolean;
}

export const ESTADO_INICIAL: EstadoDoItem = {
  packState: 'todo',
  needBuy: false,
  returnState: 'unchecked',
  missing: false,
  leftover: false,
};

export type TarefaDoItem =
  | { readonly tipo: 'conferir' }
  | { readonly tipo: 'planejar_refeicoes'; readonly partes: Readonly<Record<string, number>> }
  | { readonly tipo: 'ajuste'; readonly chave: string };

/** Marca do aprendizado de "faltou e sobrou" (E1-11), para a tela mostrar a mudança e desfazer. */
export type Aprendizado =
  | { readonly tipo: 'faltou' }
  | { readonly tipo: 'reduzido'; readonly qtyAnterior: number; readonly percentual: number }
  | { readonly tipo: 'sinalizado' };

/** Quantidade reduzida pelo aprendizado: menos `percentual` %, arredondada para cima (como o `teto` do catálogo). */
export function reduzirQuantidade(qty: number, percentual: number): number {
  return Math.ceil((qty * (100 - percentual)) / 100);
}

export interface ItemDaLista {
  /** Referência estável: `chave@família` ou `chave@grupo` nos gerados; dada pelo app nos manuais. */
  readonly ref: string;
  readonly catalogKey: string | null;
  readonly nome: string;
  readonly categoria: string;
  /** Nulo: item do grupo (SPEC, seção 3). */
  readonly familiaId: string | null;
  /** Nulo nas tarefas. */
  readonly qty: number | null;
  readonly unidade: string | null;
  /** Quantidade por pessoa, nos itens de escopo pessoa. */
  readonly porPessoa: number | null;
  readonly detalhe: { readonly qty: number; readonly unidade: string } | null;
  readonly tarefa: TarefaDoItem | null;
  readonly origem: Origem;
  readonly removido: boolean;
  /** A pessoa editou a quantidade: o recálculo não mexe mais nela (L7). */
  readonly qtyEditada: boolean;
  /** Etiqueta "depende do camping" (E3-09). */
  readonly dependeDoCamping: boolean;
  readonly nota: string | null;
  readonly estado: EstadoDoItem;
  readonly aprendizado: Aprendizado | null;
}

export class ErroDeLista extends Error {
  override name = 'ErroDeLista';
}

export function refDoItem(chave: string, familiaId: string | null): string {
  return `${chave}@${familiaId ?? 'grupo'}`;
}

function quantidade(item: ItemDoCatalogo, variaveis: Variaveis, qual: 'qty' | 'detalhe' = 'qty'): number {
  const expressao = qual === 'qty' ? item.qty : item.detalhe?.qty;
  if (!expressao) throw new ErroDeLista(`item ${item.key}: sem expressão de ${qual}`);
  const valor = expressao.avaliar(variaveis) as number;
  if (!Number.isSafeInteger(valor) || valor < 0) {
    throw new ErroDeLista(`item ${item.key}: a quantidade "${expressao.fonte}" deu ${valor}, esperava inteiro de zero para cima`);
  }
  return valor;
}

function tarefaDo(item: ItemDoCatalogo, variaveis: Variaveis): TarefaDoItem | null {
  if (!item.tarefa) return null;
  if (item.tarefa.tipo === 'conferir') return { tipo: 'conferir' };
  const partes: Record<string, number> = {};
  for (const [nome, expressao] of Object.entries(item.tarefa.partes)) partes[nome] = expressao.avaliar(variaveis) as number;
  return { tipo: 'planejar_refeicoes', partes };
}

/**
 * Monta o item da lista para um item do catálogo, num alvo (uma família ou o grupo). Devolve nulo
 * quando a quantidade dá zero (por exemplo, cadeiras numa família só de bebês): linha com zero não entra.
 */
export function montarItem(
  item: ItemDoCatalogo,
  variaveis: Variaveis,
  familia: FamiliaDaViagem | null,
  origem: Origem,
  dependeDoCamping: boolean,
): ItemDaLista | null {
  const pessoas = familia ? familia.pessoas.length : 0;
  let qty: number | null = null;
  let porPessoa: number | null = null;
  if (item.qty) {
    const q = quantidade(item, variaveis);
    if (item.scope === 'pessoa') {
      porPessoa = q;
      qty = q * pessoas;
    } else {
      qty = q;
    }
    if (qty === 0) return null;
  }
  const familiaId = item.scope === 'grupo' ? null : (familia?.id ?? null);
  return {
    ref: refDoItem(item.key, familiaId),
    catalogKey: item.key,
    nome: item.name,
    categoria: item.category,
    familiaId,
    qty,
    unidade: item.unit,
    porPessoa,
    detalhe: item.detalhe ? { qty: quantidade(item, variaveis, 'detalhe'), unidade: item.detalhe.unit } : null,
    tarefa: tarefaDo(item, variaveis),
    origem,
    removido: false,
    qtyEditada: false,
    dependeDoCamping,
    nota: null,
    estado: ESTADO_INICIAL,
    aprendizado: null,
  };
}

/** Alvos de um item do catálogo: o grupo, ou cada família, com as variáveis certas para cada um. */
export function alvos(item: ItemDoCatalogo, entrada: EntradaDaViagem): { familia: FamiliaDaViagem | null; variaveis: Variaveis }[] {
  if (item.scope === 'grupo') return [{ familia: null, variaveis: variaveisDoGrupo(entrada) }];
  return entrada.familias
    .filter((f) => item.scope === 'familia' || f.pessoas.length > 0)
    .map((f) => ({ familia: f, variaveis: variaveisDaFamilia(entrada, f) }));
}

/** Gera a lista da viagem a partir do catálogo (E1-02, E1-03). */
export function gerarLista(entrada: EntradaDaViagem, catalogo: Catalogo): ItemDaLista[] {
  validarEntrada(entrada);
  const tipo = tipoNoCatalogo(entrada.tipo);
  const excluidos = new Set(tipo === 'barraca_carro' ? [] : catalogo.exclusoesPorTipo[tipo]);
  const lista: ItemDaLista[] = [];
  for (const item of catalogo.itens) {
    if (excluidos.has(item.key)) continue;
    for (const { familia, variaveis } of alvos(item, entrada)) {
      if (item.when.avaliar(variaveis) !== true) continue;
      // Sem destino ou sem dados, o item que depende do camping entra com a etiqueta (E3-09).
      const etiqueta = item.dependsOnCamping && !entrada.dadosDoCamping;
      const montado = montarItem(item, variaveis, familia, 'generated', etiqueta);
      if (montado) lista.push(montado);
    }
  }
  return lista;
}

export interface MudancaDeQuantidade {
  readonly ref: string;
  readonly de: number | null;
  readonly para: number | null;
}

export interface ResultadoDoRecalculo {
  readonly lista: ItemDaLista[];
  /** Itens que entraram (a tela mostra "N entraram"). */
  readonly entraram: ItemDaLista[];
  /** Itens que saíram (a tela mostra "M saíram"). */
  readonly sairam: ItemDaLista[];
  readonly quantidadesAlteradas: MudancaDeQuantidade[];
}

/**
 * Recalcula a lista depois de mudar uma resposta da viagem (E1-02, E1-04; SPEC, seção 5, "Recálculo").
 * Só itens `generated` mudam; removidos ficam removidos; manuais e ajustes do camping ficam como estão;
 * quantidade editada à mão fica.
 */
export function recalcularLista(atual: readonly ItemDaLista[], entrada: EntradaDaViagem, catalogo: Catalogo): ResultadoDoRecalculo {
  const nova = gerarLista(entrada, catalogo);
  const atuaisGerados = new Map(atual.filter((i) => i.origem === 'generated').map((i) => [i.ref, i]));
  const refsNovas = new Set(nova.map((i) => i.ref));
  // Item manual com chave do catálogo (o "faltou" do aprendizado) ocupa o lugar: o gerado igual não duplica.
  const manuais = new Set(atual.filter((i) => i.origem === 'manual' && i.catalogKey !== null).map((i) => refDoItem(i.catalogKey as string, i.familiaId)));
  const lista: ItemDaLista[] = [];
  const entraram: ItemDaLista[] = [];
  const sairam: ItemDaLista[] = [];
  const quantidadesAlteradas: MudancaDeQuantidade[] = [];

  for (const gerado of nova) {
    const existente = atuaisGerados.get(gerado.ref);
    if (!existente) {
      if (manuais.has(gerado.ref)) continue;
      lista.push(gerado);
      entraram.push(gerado);
      continue;
    }
    if (existente.removido) {
      lista.push(existente);
      continue;
    }
    // A redução do aprendizado (E1-11) vale sobre a quantidade nova, até a pessoa desfazer.
    const reducao = existente.aprendizado?.tipo === 'reduzido' && gerado.qty !== null ? existente.aprendizado : null;
    const qty = existente.qtyEditada ? existente.qty : reducao ? reduzirQuantidade(gerado.qty as number, reducao.percentual) : gerado.qty;
    if (qty !== existente.qty) quantidadesAlteradas.push({ ref: existente.ref, de: existente.qty, para: qty });
    lista.push({
      ...existente,
      qty,
      aprendizado: reducao && !existente.qtyEditada ? { ...reducao, qtyAnterior: gerado.qty as number } : existente.aprendizado,
      porPessoa: existente.qtyEditada ? existente.porPessoa : gerado.porPessoa,
      detalhe: existente.qtyEditada ? existente.detalhe : gerado.detalhe,
      tarefa: gerado.tarefa,
      dependeDoCamping: gerado.dependeDoCamping,
    });
  }
  for (const item of atual) {
    if (item.origem !== 'generated') lista.push(item);
    else if (!refsNovas.has(item.ref)) {
      if (item.removido) lista.push(item);
      else sairam.push(item);
    }
  }
  return { lista, entraram, sairam, quantidadesAlteradas };
}

function trocar(lista: readonly ItemDaLista[], ref: string, muda: (item: ItemDaLista) => ItemDaLista): ItemDaLista[] {
  let achou = false;
  const saida = lista.map((item) => {
    if (item.ref !== ref) return item;
    achou = true;
    return muda(item);
  });
  if (!achou) throw new ErroDeLista(`item não está na lista: ${ref}`);
  return saida;
}

/** Remove um item (E1-04). Fica guardado como removido e nunca volta por recálculo; pode ser restaurado. */
export function removerItem(lista: readonly ItemDaLista[], ref: string): ItemDaLista[] {
  return trocar(lista, ref, (item) => ({ ...item, removido: true }));
}

export function restaurarItem(lista: readonly ItemDaLista[], ref: string): ItemDaLista[] {
  return trocar(lista, ref, (item) => ({ ...item, removido: false }));
}

/** Altera a quantidade à mão (E1-04). O recálculo preserva esse valor (L7). */
export function editarQuantidade(lista: readonly ItemDaLista[], ref: string, qty: number): ItemDaLista[] {
  if (!Number.isSafeInteger(qty) || qty < 0) throw new ErroDeLista('a quantidade precisa ser um número inteiro, zero ou mais');
  return trocar(lista, ref, (item) => ({ ...item, qty, qtyEditada: true }));
}

/** Renomeia ou anota um item (E1-04). */
export function editarItem(lista: readonly ItemDaLista[], ref: string, mudanca: { nome?: string; nota?: string | null }): ItemDaLista[] {
  if (mudanca.nome !== undefined && mudanca.nome.trim() === '') throw new ErroDeLista('o nome não pode ficar vazio');
  return trocar(lista, ref, (item) => ({ ...item, ...mudanca }));
}

export interface NovoItemManual {
  readonly ref: string;
  readonly nome: string;
  readonly categoria: string;
  readonly familiaId: string | null;
  readonly qty: number;
  readonly unidade?: string | null;
  readonly nota?: string | null;
}

/** Adiciona um item à mão (E1-04). Item manual nunca é apagado nem alterado por recálculo (L6). */
export function adicionarItemManual(lista: readonly ItemDaLista[], novo: NovoItemManual): ItemDaLista[] {
  if (lista.some((i) => i.ref === novo.ref)) throw new ErroDeLista(`referência repetida: ${novo.ref}`);
  if (novo.nome.trim() === '') throw new ErroDeLista('o nome não pode ficar vazio');
  if (!Number.isSafeInteger(novo.qty) || novo.qty < 0) throw new ErroDeLista('a quantidade precisa ser um número inteiro, zero ou mais');
  return [
    ...lista,
    {
      ref: novo.ref,
      catalogKey: null,
      nome: novo.nome,
      categoria: novo.categoria,
      familiaId: novo.familiaId,
      qty: novo.qty,
      unidade: novo.unidade ?? null,
      porPessoa: null,
      detalhe: null,
      tarefa: null,
      origem: 'manual',
      removido: false,
      qtyEditada: false,
      dependeDoCamping: false,
      nota: novo.nota ?? null,
      estado: ESTADO_INICIAL,
      aprendizado: null,
    },
  ];
}

/** Categorias com ao menos um item não removido, na ordem do catálogo (E1-02: sem itens, não aparece). */
export function categoriasVisiveis(lista: readonly ItemDaLista[], catalogo: Catalogo): string[] {
  const usadas = new Set(lista.filter((i) => !i.removido).map((i) => i.categoria));
  return catalogo.categorias.map((c) => c.key).filter((k) => usadas.has(k));
}
