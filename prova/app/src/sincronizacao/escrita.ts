import type { Transaction } from '@powersync/react-native';

import { banco } from '../dados/banco';
import { registrar } from '../dados/registro';

// Toda alteração da lista passa por aqui (SPEC, seção 4):
//   - grava primeiro no aparelho, na hora (princípio 1);
//   - recebe um identificador gerado no aparelho, que vai junto para o servidor no `_metadata`
//     (princípio 2: o servidor ignora repetição);
//   - fica registrada em `registro_local`, na mesma transação, para o verificador da prova.
// Alteração que não muda nada não é gravada (nem vai para a fila).

type CampoDoItem = 'pack_state' | 'qty' | 'name' | 'note' | 'deleted_at';
export type EstadoDeSeparacao = 'todo' | 'set_aside' | 'in_car';

async function novoId(tx: Transaction): Promise<string> {
  const linha = await tx.get<{ c: string }>('select uuid() as c');
  return linha.c;
}

async function anotar(tx: Transaction, c: string, tabela: string, linha: string, op: string, dados: object) {
  await tx.execute(
    "insert into registro_local (id, tabela, linha_id, op, dados, feito_em) values (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))",
    [c, tabela, linha, op, JSON.stringify(dados)],
  );
}

async function alterarItemEm(tx: Transaction, itemId: string, campos: Partial<Record<CampoDoItem, string | number | null>>) {
  const atual = await tx.getOptional<Record<string, unknown>>('select * from trip_item where id = ?', [itemId]);
  if (!atual) return null;
  const mudou = (Object.keys(campos) as CampoDoItem[]).filter((k) => atual[k] !== campos[k]);
  if (mudou.length === 0) return null;
  const c = await novoId(tx);
  const valores = mudou.map((k) => campos[k] ?? null);
  await tx.execute(`update trip_item set ${mudou.map((k) => `${k} = ?`).join(', ')}, _metadata = ? where id = ?`, [
    ...valores,
    JSON.stringify({ c }),
    itemId,
  ]);
  const dados = Object.fromEntries(mudou.map((k) => [k, campos[k] ?? null]));
  await anotar(tx, c, 'trip_item', itemId, 'PATCH', dados);
  return { c, dados };
}

export async function alterarItem(itemId: string, campos: Partial<Record<CampoDoItem, string | number | null>>) {
  const feito = await banco.writeTransaction((tx) => alterarItemEm(tx, itemId, campos));
  if (feito) registrar('escrito', { c: feito.c, item: itemId, ...feito.dados });
  return feito;
}

export const marcarSeparacao = (itemId: string, estado: EstadoDeSeparacao) => alterarItem(itemId, { pack_state: estado });

export async function somarQuantidade(itemId: string, delta: number) {
  const item = await banco.getOptional<{ qty: number }>('select qty from trip_item where id = ?', [itemId]);
  if (!item) return null;
  return alterarItem(itemId, { qty: Math.max(0, (item.qty ?? 0) + delta) });
}

// A hora gravada aqui é só local; o servidor usa a própria hora (princípio 4).
export const removerItem = (itemId: string) => alterarItem(itemId, { deleted_at: new Date().toISOString() });
export const restaurarItem = (itemId: string) => alterarItem(itemId, { deleted_at: null });

export async function criarItem(tripId: string, nome: string, familyId: string | null = null) {
  const feito = await banco.writeTransaction(async (tx) => {
    const c = await novoId(tx);
    const id = await novoId(tx);
    const dados = { trip_id: tripId, family_id: familyId, name: nome, qty: 1, pack_state: 'todo', origin: 'manual' };
    await tx.execute(
      `insert into trip_item (id, trip_id, family_id, name, qty, pack_state, origin, removed, need_buy, _metadata)
       values (?, ?, ?, ?, 1, 'todo', 'manual', 0, 0, ?)`,
      [id, tripId, familyId, nome, JSON.stringify({ c })],
    );
    await anotar(tx, c, 'trip_item', id, 'PUT', dados);
    return { c, id };
  });
  registrar('escrito', { c: feito.c, item: feito.id, novo: true });
  return feito;
}

// Assumir um item do grupo (S2): uma linha por família; duas famílias no mesmo item ficam as duas.
export async function assumirItem(tripId: string, itemId: string, familyId: string) {
  const feito = await banco.writeTransaction(async (tx) => {
    const ja = await tx.getOptional(
      'select id from item_claim where item_id = ? and family_id = ? and deleted_at is null',
      [itemId, familyId],
    );
    if (ja) return null;
    const c = await novoId(tx);
    const id = await novoId(tx);
    await tx.execute('insert into item_claim (id, trip_id, item_id, family_id, _metadata) values (?, ?, ?, ?, ?)', [
      id,
      tripId,
      itemId,
      familyId,
      JSON.stringify({ c }),
    ]);
    await anotar(tx, c, 'item_claim', id, 'PUT', { trip_id: tripId, item_id: itemId, family_id: familyId });
    return { c, id };
  });
  if (feito) registrar('escrito', { c: feito.c, assumido: itemId });
  return feito;
}

// Viagem criada no aparelho, com ou sem login (S9). Sem login, nada sincroniza: as alterações
// esperam na fila e sobem com os mesmos identificadores no primeiro login.
export async function criarViagem(nome: string, itens: { nome: string; estado: EstadoDeSeparacao }[]) {
  return banco.writeTransaction(async (tx) => {
    const tripId = await novoId(tx);
    const c = await novoId(tx);
    await tx.execute(
      "insert into trip (id, name, kind, is_group, status, _metadata) values (?, ?, 'tent_car', 0, 'planning', ?)",
      [tripId, nome, JSON.stringify({ c })],
    );
    await anotar(tx, c, 'trip', tripId, 'PUT', { name: nome });
    for (const item of itens) {
      const ci = await novoId(tx);
      const id = await novoId(tx);
      await tx.execute(
        `insert into trip_item (id, trip_id, name, qty, pack_state, origin, removed, need_buy, _metadata)
         values (?, ?, ?, 1, ?, 'manual', 0, 0, ?)`,
        [id, tripId, item.nome, item.estado, JSON.stringify({ c: ci })],
      );
      await anotar(tx, ci, 'trip_item', id, 'PUT', { trip_id: tripId, name: item.nome, pack_state: item.estado });
    }
    return tripId;
  });
}

// P7 (S7 reduzido): 200 alterações, cada uma na sua transação, como uma pessoa faria ao longo do
// tempo offline: 40 itens novos e 160 alterações (separação, quantidade e nota) nos itens da lista.
export async function gerarAlteracoes(tripId: string, total = 200) {
  const novos = 40;
  for (let n = 1; n <= novos; n++) await criarItem(tripId, `Lote ${String(n).padStart(3, '0')}`);
  const itens = await banco.getAll<{ id: string }>(
    'select id from trip_item where trip_id = ? and deleted_at is null order by name, id',
    [tripId],
  );
  const estados: EstadoDeSeparacao[] = ['set_aside', 'in_car', 'todo'];
  let feitas = novos;
  for (let volta = 0; feitas < total; volta++) {
    for (const item of itens) {
      if (feitas >= total) break;
      const tipo = (volta + feitas) % 3;
      const r =
        tipo === 0
          ? await marcarSeparacao(item.id, estados[volta % 3])
          : tipo === 1
            ? await somarQuantidade(item.id, 1)
            : await alterarItem(item.id, { note: `nota ${volta}-${feitas}` });
      if (r) feitas++;
    }
  }
  registrar('lote', { total: feitas });
  return feitas;
}

// Medida "online" (SPEC, seção 4: até 5 s): 20 alterações de quantidade, uma a cada 3 s.
export async function medirOnline(itemId: string, vezes = 20, intervaloMs = 3000) {
  for (let n = 0; n < vezes; n++) {
    await somarQuantidade(itemId, 1);
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
  registrar('medida', { fim: true });
}
