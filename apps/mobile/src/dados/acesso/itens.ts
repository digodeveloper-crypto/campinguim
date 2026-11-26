import type { TiposDoBanco } from '../esquema';
import {
  ESTADOS_DA_VOLTA,
  ESTADOS_DE_SEPARACAO,
  identificadorOpcional,
  logico,
  numeroNaoNegativo,
  ORIGENS_DO_ITEM,
  textoObrigatorio,
  textoOpcional,
  umDe,
  ValorInvalido,
  type EstadoDaVolta,
  type EstadoDeSeparacao,
  type OrigemDoItem,
} from '../valores';
import { alterar, inserir, type ContextoDeAcesso } from './contexto';

// Itens da lista da viagem (SPEC, seção 3, `trip_item`). Usada pelas features 1.2 a 1.10: gerar
// a lista, editar, marcar "separei" e "está no carro", "faltou", checklist da volta, "sobrou".
//
// Remover um item da lista é `removed` (E1-04: nunca volta por recálculo, e pode ser
// restaurado); `deleted_at` fica para o apagamento de verdade, que nenhuma feature da etapa 1 usa.

export type Item = TiposDoBanco['trip_item'];

export type NovoItem = {
  /** `null` é item do grupo (seção 3). */
  family_id: string | null;
  catalog_key?: string | null;
  name: string;
  category?: string | null;
  qty: number;
  unit?: string | null;
  note?: string | null;
  origin: OrigemDoItem;
  depends_on_camping?: boolean;
};

function linhaDoItem(tripId: string, item: NovoItem, i: number) {
  return {
    trip_id: tripId,
    family_id: identificadorOpcional(`itens[${i}].family_id`, item.family_id),
    catalog_key: textoOpcional(`itens[${i}].catalog_key`, item.catalog_key),
    name: textoObrigatorio(`itens[${i}].name`, item.name),
    category: textoOpcional(`itens[${i}].category`, item.category),
    qty: numeroNaoNegativo(`itens[${i}].qty`, item.qty),
    unit: textoOpcional(`itens[${i}].unit`, item.unit),
    note: textoOpcional(`itens[${i}].note`, item.note),
    origin: umDe(`itens[${i}].origin`, item.origin, ORIGENS_DO_ITEM),
    removed: 0,
    pack_state: 'todo' satisfies EstadoDeSeparacao,
    need_buy: 0,
    depends_on_camping: logico(`itens[${i}].depends_on_camping`, item.depends_on_camping ?? false),
    return_state: 'unchecked' satisfies EstadoDaVolta,
    missing: 0,
    leftover: 0,
  };
}

/** Grava vários itens numa transação só (a lista gerada inteira). Devolve os ids, na ordem. */
export async function inserirItens(ctx: ContextoDeAcesso, tripId: string, itens: NovoItem[]): Promise<string[]> {
  const linhas = itens.map((item, i) => linhaDoItem(tripId, item, i));
  return ctx.db.writeTransaction(async (tx) => {
    const viagem = await tx.getOptional<{ id: string }>('select id from trip where id = ? and deleted_at is null', [tripId]);
    if (!viagem) throw new ValorInvalido('trip_id', 'viagem inexistente');
    const familias = new Set(
      (await tx.getAll<{ id: string }>('select id from trip_family where trip_id = ? and deleted_at is null', [tripId])).map((f) => f.id),
    );
    const ids: string[] = [];
    for (const [i, linha] of linhas.entries()) {
      if (linha.family_id !== null && !familias.has(linha.family_id)) {
        throw new ValorInvalido(`itens[${i}].family_id`, 'família de outra viagem ou inexistente');
      }
      ids.push(await inserir(tx, ctx, 'trip_item', linha));
    }
    return ids;
  });
}

export type FiltroDeItens = { incluirRemovidos?: boolean; familyId?: string | null };

/** Itens da viagem. Sem filtro de família, vêm todos (do grupo e de cada família). */
export function listarItens(ctx: ContextoDeAcesso, tripId: string, filtro: FiltroDeItens = {}): Promise<Item[]> {
  const condicoes = ['trip_id = ?', 'deleted_at is null'];
  const parametros: (string | null)[] = [tripId];
  if (!filtro.incluirRemovidos) condicoes.push('removed = 0');
  if (filtro.familyId === null) condicoes.push('family_id is null');
  else if (filtro.familyId !== undefined) {
    condicoes.push('family_id = ?');
    parametros.push(filtro.familyId);
  }
  return ctx.db.getAll<Item>(`select * from trip_item where ${condicoes.join(' and ')} order by category, name, id`, parametros);
}

export function obterItem(ctx: ContextoDeAcesso, itemId: string): Promise<Item | null> {
  return ctx.db.getOptional<Item>('select * from trip_item where id = ? and deleted_at is null', [itemId]);
}

export type AlteracaoDoItem = Partial<{
  name: string;
  category: string | null;
  qty: number;
  unit: string | null;
  note: string | null;
  pack_state: EstadoDeSeparacao;
  need_buy: boolean;
  return_state: EstadoDaVolta;
  missing: boolean;
  leftover: boolean;
}>;

/** Altera só o que mudou; sem mudança, nada entra na fila. Devolve false nesse caso. */
export async function alterarItem(ctx: ContextoDeAcesso, itemId: string, campos: AlteracaoDoItem): Promise<boolean> {
  const c: Partial<Item> = {};
  if (campos.name !== undefined) c.name = textoObrigatorio('name', campos.name);
  if (campos.category !== undefined) c.category = textoOpcional('category', campos.category);
  if (campos.qty !== undefined) c.qty = numeroNaoNegativo('qty', campos.qty);
  if (campos.unit !== undefined) c.unit = textoOpcional('unit', campos.unit);
  if (campos.note !== undefined) c.note = textoOpcional('note', campos.note);
  if (campos.pack_state !== undefined) c.pack_state = umDe('pack_state', campos.pack_state, ESTADOS_DE_SEPARACAO);
  if (campos.need_buy !== undefined) c.need_buy = logico('need_buy', campos.need_buy);
  if (campos.return_state !== undefined) c.return_state = umDe('return_state', campos.return_state, ESTADOS_DA_VOLTA);
  if (campos.missing !== undefined) c.missing = logico('missing', campos.missing);
  if (campos.leftover !== undefined) c.leftover = logico('leftover', campos.leftover);
  return ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_item', itemId, c));
}

export const marcarSeparacao = (ctx: ContextoDeAcesso, itemId: string, estado: EstadoDeSeparacao) =>
  alterarItem(ctx, itemId, { pack_state: estado });

/** Tira o item da lista (E1-04). Ele fica guardado e pode voltar com `restaurarItem`. */
export const removerItem = (ctx: ContextoDeAcesso, itemId: string) =>
  ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_item', itemId, { removed: 1 }));

export const restaurarItem = (ctx: ContextoDeAcesso, itemId: string) =>
  ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_item', itemId, { removed: 0 }));
