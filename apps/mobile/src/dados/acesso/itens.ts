import type { TiposDoBanco } from '../esquema';
import {
  ESTADOS_DA_VOLTA,
  ESTADOS_DE_SEPARACAO,
  identificadorOpcional,
  inteiroNaoNegativo,
  inteiroOpcional,
  logico,
  numeroNaoNegativo,
  ORIGENS_DO_ITEM,
  textoObrigatorio,
  textoOpcional,
  TIPOS_DE_APRENDIZADO,
  umDe,
  UNIDADES_DO_DETALHE,
  ValorInvalido,
  type EstadoDaVolta,
  type EstadoDeSeparacao,
  type OrigemDoItem,
  type TipoDeAprendizado,
  type UnidadeDoDetalhe,
} from '../valores';
import { alterar, inserir, type ContextoDeAcesso } from './contexto';

// Itens da lista da viagem (SPEC, seção 3, `trip_item`, com os campos da B3 em `docs/regras.md`,
// seção 6). Usada pelas features 1.2 a 1.10: gerar a lista, editar, marcar "separei" e "está no
// carro", "faltou", checklist da volta, "sobrou".
//
// Remover um item da lista é `removed` (E1-04: nunca volta por recálculo, e pode ser
// restaurado); `deleted_at` fica para o apagamento de verdade, que nenhuma feature da etapa 1 usa.
// `category` e `unit` são chaves do catálogo (`packages/content`); quem confere a chave é o motor
// (B3). Aqui só se confere que é texto.

export type Item = TiposDoBanco['trip_item'];

export type Aprendizado =
  | { kind: 'missing' | 'flagged' }
  | { kind: 'reduced'; qty_before: number; percent: number };

export type NovoItem = {
  /** `null` é item do grupo (seção 3). */
  family_id: string | null;
  catalog_key?: string | null;
  name: string;
  category?: string | null;
  /** Nulo em item que é tarefa (B3). */
  qty: number | null;
  unit?: string | null;
  note?: string | null;
  origin: OrigemDoItem;
  depends_on_camping?: boolean;
  /** Referência estável (B3). Sem ela, segue a regra de `referenciaDoItem`. */
  item_ref?: string;
  qty_edited?: boolean;
  qty_per_person?: number | null;
  detalhe?: { qty: number; unit: UnidadeDoDetalhe } | null;
  aprendizado?: Aprendizado | null;
};

/**
 * Referência estável do item (B3, `docs/regras.md`, seção 6): `<catalog_key>@<family_id>` ou
 * `<catalog_key>@grupo` (gerado), `ajuste:<...>` (ajuste do camping), o próprio `id` (manual).
 */
export function referenciaDoItem(origem: OrigemDoItem, catalogKey: string | null, familyId: string | null, id: string): string {
  if (origem === 'manual') return id;
  if (!catalogKey) throw new ValorInvalido('catalog_key', 'item gerado ou de ajuste precisa da chave do catálogo');
  const base = `${catalogKey}@${familyId ?? 'grupo'}`;
  return origem === 'camping_adjust' ? `ajuste:${base}` : base;
}

function camposDoDetalhe(campo: string, d: NovoItem['detalhe']) {
  if (d === null || d === undefined) return { detail_qty: null, detail_unit: null };
  return {
    detail_qty: inteiroNaoNegativo(`${campo}.qty`, d.qty),
    detail_unit: umDe(`${campo}.unit`, d.unit, UNIDADES_DO_DETALHE),
  };
}

function camposDoAprendizado(campo: string, a: Aprendizado | null | undefined) {
  if (a === null || a === undefined) return { learning_kind: null, learning_qty_before: null, learning_percent: null };
  const kind: TipoDeAprendizado = umDe(`${campo}.kind`, a.kind, TIPOS_DE_APRENDIZADO);
  if (kind !== 'reduced') return { learning_kind: kind, learning_qty_before: null, learning_percent: null };
  const r = a as Extract<Aprendizado, { kind: 'reduced' }>;
  const percentual = inteiroOpcional(`${campo}.percent`, r.percent);
  if (percentual === null || percentual < 1 || percentual > 99) throw new ValorInvalido(`${campo}.percent`, 'esperado inteiro de 1 a 99');
  const antes = inteiroOpcional(`${campo}.qty_before`, r.qty_before);
  if (antes === null) throw new ValorInvalido(`${campo}.qty_before`, 'obrigatório na redução');
  return { learning_kind: kind, learning_qty_before: antes, learning_percent: percentual };
}

function linhaDoItem(tripId: string, item: NovoItem, i: number, id: string) {
  const familyId = identificadorOpcional(`itens[${i}].family_id`, item.family_id);
  const catalogKey = textoOpcional(`itens[${i}].catalog_key`, item.catalog_key);
  const origem = umDe(`itens[${i}].origin`, item.origin, ORIGENS_DO_ITEM);
  return {
    trip_id: tripId,
    family_id: familyId,
    catalog_key: catalogKey,
    name: textoObrigatorio(`itens[${i}].name`, item.name),
    category: textoOpcional(`itens[${i}].category`, item.category),
    qty: item.qty === null ? null : numeroNaoNegativo(`itens[${i}].qty`, item.qty),
    unit: textoOpcional(`itens[${i}].unit`, item.unit),
    note: textoOpcional(`itens[${i}].note`, item.note),
    origin: origem,
    removed: 0,
    pack_state: 'todo' satisfies EstadoDeSeparacao,
    need_buy: 0,
    depends_on_camping: logico(`itens[${i}].depends_on_camping`, item.depends_on_camping ?? false),
    return_state: 'unchecked' satisfies EstadoDaVolta,
    missing: 0,
    leftover: 0,
    item_ref: item.item_ref === undefined ? referenciaDoItem(origem, catalogKey, familyId, id) : textoObrigatorio(`itens[${i}].item_ref`, item.item_ref),
    qty_edited: logico(`itens[${i}].qty_edited`, item.qty_edited ?? false),
    qty_per_person: inteiroOpcional(`itens[${i}].qty_per_person`, item.qty_per_person),
    ...camposDoDetalhe(`itens[${i}].detalhe`, item.detalhe),
    ...camposDoAprendizado(`itens[${i}].aprendizado`, item.aprendizado),
  };
}

/** Grava vários itens numa transação só (a lista gerada inteira). Devolve os ids, na ordem. */
export async function inserirItens(ctx: ContextoDeAcesso, tripId: string, itens: NovoItem[]): Promise<string[]> {
  const ids = itens.map(() => ctx.gerarId());
  const linhas = itens.map((item, i) => linhaDoItem(tripId, item, i, ids[i] ?? ''));
  return ctx.db.writeTransaction(async (tx) => {
    const viagem = await tx.getOptional<{ id: string }>('select id from trip where id = ? and deleted_at is null', [tripId]);
    if (!viagem) throw new ValorInvalido('trip_id', 'viagem inexistente');
    const familias = new Set(
      (await tx.getAll<{ id: string }>('select id from trip_family where trip_id = ? and deleted_at is null', [tripId])).map((f) => f.id),
    );
    // `item_ref` é único por viagem entre as linhas não apagadas (B3).
    const referencias = new Set(
      (await tx.getAll<{ item_ref: string | null }>('select item_ref from trip_item where trip_id = ? and deleted_at is null', [tripId])).map(
        (l) => l.item_ref,
      ),
    );
    for (const [i, linha] of linhas.entries()) {
      if (linha.family_id !== null && !familias.has(linha.family_id)) {
        throw new ValorInvalido(`itens[${i}].family_id`, 'família de outra viagem ou inexistente');
      }
      if (referencias.has(linha.item_ref)) throw new ValorInvalido(`itens[${i}].item_ref`, 'referência repetida na viagem');
      referencias.add(linha.item_ref);
      await inserir(tx, ctx, 'trip_item', linha, ids[i]);
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
  qty: number | null;
  unit: string | null;
  note: string | null;
  pack_state: EstadoDeSeparacao;
  need_buy: boolean;
  return_state: EstadoDaVolta;
  missing: boolean;
  leftover: boolean;
  qty_edited: boolean;
  qty_per_person: number | null;
  detalhe: { qty: number; unit: UnidadeDoDetalhe } | null;
  aprendizado: Aprendizado | null;
}>;

/** Altera só o que mudou; sem mudança, nada entra na fila. Devolve false nesse caso. */
export async function alterarItem(ctx: ContextoDeAcesso, itemId: string, campos: AlteracaoDoItem): Promise<boolean> {
  const c: Partial<Item> = {};
  if (campos.name !== undefined) c.name = textoObrigatorio('name', campos.name);
  if (campos.category !== undefined) c.category = textoOpcional('category', campos.category);
  if (campos.qty !== undefined) c.qty = campos.qty === null ? null : numeroNaoNegativo('qty', campos.qty);
  if (campos.unit !== undefined) c.unit = textoOpcional('unit', campos.unit);
  if (campos.note !== undefined) c.note = textoOpcional('note', campos.note);
  if (campos.pack_state !== undefined) c.pack_state = umDe('pack_state', campos.pack_state, ESTADOS_DE_SEPARACAO);
  if (campos.need_buy !== undefined) c.need_buy = logico('need_buy', campos.need_buy);
  if (campos.return_state !== undefined) c.return_state = umDe('return_state', campos.return_state, ESTADOS_DA_VOLTA);
  if (campos.missing !== undefined) c.missing = logico('missing', campos.missing);
  if (campos.leftover !== undefined) c.leftover = logico('leftover', campos.leftover);
  if (campos.qty_edited !== undefined) c.qty_edited = logico('qty_edited', campos.qty_edited);
  if (campos.qty_per_person !== undefined) c.qty_per_person = inteiroOpcional('qty_per_person', campos.qty_per_person);
  if (campos.detalhe !== undefined) Object.assign(c, camposDoDetalhe('detalhe', campos.detalhe));
  if (campos.aprendizado !== undefined) Object.assign(c, camposDoAprendizado('aprendizado', campos.aprendizado));
  return ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_item', itemId, c));
}

export const marcarSeparacao = (ctx: ContextoDeAcesso, itemId: string, estado: EstadoDeSeparacao) =>
  alterarItem(ctx, itemId, { pack_state: estado });

/** Tira o item da lista (E1-04). Ele fica guardado e pode voltar com `restaurarItem`. */
export const removerItem = (ctx: ContextoDeAcesso, itemId: string) =>
  ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_item', itemId, { removed: 1 }));

export const restaurarItem = (ctx: ContextoDeAcesso, itemId: string) =>
  ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_item', itemId, { removed: 0 }));
