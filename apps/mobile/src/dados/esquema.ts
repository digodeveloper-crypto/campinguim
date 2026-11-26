import { column, Schema, Table } from '@powersync/common';

// Esquema do banco local: as tabelas da SPEC, seção 3, que sincronizam com o aparelho
// ("Viagem e lista" e "Gastos"). Nomes de tabelas e campos iguais aos da SPEC; o B5 cria o mesmo
// esquema no Postgres. O PowerSync cria sozinho a coluna `id` (texto, UUID v4; DEF-08).
//
// Importa de `@powersync/common` (e não de `@powersync/react-native`) para os testes rodarem no
// Node sem carregar o React Native. As classes são as mesmas.
//
// Regras gerais da seção 3 aplicadas a todas as tabelas daqui:
//   - `updated_at`, `updated_by` e `deleted_at` em todo registro (nada é apagado de verdade);
//   - dinheiro em centavos, inteiro; verdadeiro/falso como inteiro 0 ou 1 (o SQLite não tem
//     tipo lógico); datas da viagem como texto `AAAA-MM-DD`; carimbos de tempo em UTC (ISO 8601);
//   - `facts`, `alerts` e `adjustments` guardam o JSON devolvido pelo servidor, como texto.
//
// Campos que vêm da B3 (motor de regras), além da seção 3 da SPEC: `docs/regras.md`, seção 6,
// "Campos que o modelo de dados precisa" (pedido do orquestrador em 26/11/2026). Marcados com
// "B3" abaixo; o B5 cria os mesmos no Postgres.
//
// Fora do aparelho, sempre (DEF-11; seção 3, "O que chega ao aparelho"): `city`, `camping`,
// `camping_alias`, `fact_report`, `fact_summary`, `suggestion`, `merge_candidate`,
// `list_feedback`, `device`, `event` e `config`. Um teste confere que nenhuma delas existe aqui.

/** Campos de toda tabela sincronizada (seção 3, "Regras gerais"). */
const controle = {
  updated_at: column.text,
  updated_by: column.text,
  deleted_at: column.text,
};

// Tabelas que o app altera e manda ao servidor pela fila da sincronização (feature 2.2). Cada
// escrita leva o identificador da alteração, gerado no aparelho, em `_metadata` (seção 4,
// princípio 2: reenviar é sempre seguro). Escrita que não muda nada não entra na fila.
const escritaPeloApp = { trackMetadata: true, ignoreEmptyUpdates: true } as const;

// ---- Viagem e lista ---------------------------------------------------------------------------

const profile = new Table(
  {
    display_name: column.text,
    nickname: column.text,
    anonymous_by_default: column.integer,
    origin_channel: column.text,
    last_active_at: column.text,
    ...controle,
  },
  { ...escritaPeloApp },
);

const trip = new Table(
  {
    owner_profile_id: column.text,
    name: column.text,
    kind: column.text,
    start_date: column.text,
    end_date: column.text,
    nights: column.integer,
    climate: column.text,
    rain: column.integer,
    camping_id: column.text,
    is_group: column.integer,
    status: column.text,
    source_trip_id: column.text,
    // Citado na seção 11 (FRD-02) e pedido pela B3: viagem criada antes da data de ida; ordem do
    // histórico para o aprendizado e a repetição. Sempre preenchido.
    created_at: column.text,
    // B3: destino informado na etapa 1 sem camping do servidor (E1-13).
    destination_name: column.text,
    ...controle,
  },
  { ...escritaPeloApp },
);

const trip_family = new Table(
  {
    trip_id: column.text,
    name: column.text,
    pets: column.integer,
    is_organizer: column.integer,
    ...controle,
  },
  { indexes: { viagem: ['trip_id'] }, ...escritaPeloApp },
);

const trip_person = new Table(
  {
    family_id: column.text,
    age_band: column.text,
    label: column.text,
    ...controle,
  },
  { indexes: { familia: ['family_id'] }, ...escritaPeloApp },
);

const trip_member = new Table(
  {
    trip_id: column.text,
    family_id: column.text,
    profile_id: column.text,
    display_name: column.text,
    role: column.text,
    ...controle,
  },
  { indexes: { viagem: ['trip_id'] }, ...escritaPeloApp },
);

const trip_item = new Table(
  {
    trip_id: column.text,
    family_id: column.text,
    catalog_key: column.text,
    name: column.text,
    category: column.text,
    qty: column.real,
    unit: column.text,
    note: column.text,
    origin: column.text,
    removed: column.integer,
    pack_state: column.text,
    need_buy: column.integer,
    depends_on_camping: column.integer,
    return_state: column.text,
    missing: column.integer,
    leftover: column.integer,
    // B3: referência estável do item para o recálculo (única por viagem entre as não apagadas).
    item_ref: column.text,
    // B3: quantidade editada à mão (o recálculo não mexe mais nela).
    qty_edited: column.integer,
    // B3: quantidade por pessoa nos itens de escopo pessoa.
    qty_per_person: column.integer,
    // B3: quantidade secundária mostrada junto (36 L, 20 m) e a sua unidade (`litro` ou `metro`).
    detail_qty: column.integer,
    detail_unit: column.text,
    // B3: marca do aprendizado (E1-11): `missing`, `reduced` ou `flagged`, e o que desfaz a redução.
    learning_kind: column.text,
    learning_qty_before: column.integer,
    learning_percent: column.integer,
    ...controle,
  },
  {
    indexes: { viagem: ['trip_id'], familia: ['family_id'], referencia: ['trip_id', 'item_ref'] },
    ...escritaPeloApp,
    // Valor anterior destes campos vai junto na alteração: o servidor reconhece alteração
    // concorrente sem depender do relógio do aparelho (seção 4: `pack_state` mais avançado vence;
    // remoção vence edição).
    trackPrevious: { columns: ['pack_state', 'removed', 'deleted_at'], onlyWhenChanged: true },
  },
);

const item_claim = new Table(
  {
    item_id: column.text,
    family_id: column.text,
    ...controle,
  },
  { indexes: { item: ['item_id'] }, ...escritaPeloApp },
);

// Retrato do camping da viagem: a única informação de camping no aparelho (DEF-11). Escrito pelo
// servidor (`trip_set_camping`); o app só lê.
const trip_camping_snapshot = new Table(
  {
    trip_id: column.text,
    camping_id: column.text,
    facts: column.text,
    alerts: column.text,
    adjustments: column.text,
    rules_ack_at: column.text,
    fetched_at: column.text,
    // B3: ajustes desfeitos pela pessoa (E3-08, A6). No Postgres é `text[]`; no aparelho, a lista
    // chega como JSON em texto (o PowerSync guarda listas assim).
    undone_adjustment_ids: column.text,
    ...controle,
  },
  { indexes: { viagem: ['trip_id'] } },
);

// Convites: criados e revogados pelas funções do servidor (`invite_create`, `invite_revoke`).
const invite = new Table(
  {
    token: column.text,
    trip_id: column.text,
    family_id: column.text,
    created_by: column.text,
    expires_at: column.text,
    revoked: column.integer,
    ...controle,
  },
  { indexes: { viagem: ['trip_id'] } },
);

// ---- Gastos (escritos pelas funções do servidor da seção 8; o app só lê) ----------------------

const expense = new Table(
  {
    trip_id: column.text,
    item_id: column.text,
    buyer_family_id: column.text,
    estimate_cents: column.integer,
    amount_cents: column.integer,
    split_rule: column.text,
    receipt_path: column.text,
    ...controle,
  },
  { indexes: { viagem: ['trip_id'] } },
);

const expense_exclusion = new Table(
  {
    expense_id: column.text,
    person_id: column.text,
    ...controle,
  },
  { indexes: { gasto: ['expense_id'] } },
);

const expense_payment = new Table(
  {
    expense_id: column.text,
    family_id: column.text,
    paid_marked_at: column.text,
    ...controle,
  },
  { indexes: { gasto: ['expense_id'] } },
);

const expense_audit = new Table(
  {
    expense_id: column.text,
    actor_member_id: column.text,
    field: column.text,
    old_value: column.text,
    new_value: column.text,
    at: column.text,
    ...controle,
  },
  { indexes: { gasto: ['expense_id'] } },
);

// Chave Pix: lida só por membros logados de viagem em que o dono é comprador (PRV-06). A barreira
// de verdade são as regras de sincronização e a função `pix_key_get` (B5); no aparelho, a leitura
// passa só por `acesso/pix.ts`, que aplica a mesma regra.
const pix_key = new Table(
  {
    profile_id: column.text,
    key: column.text,
    key_type: column.text,
    ...controle,
  },
  { indexes: { perfil: ['profile_id'] } },
);

export const esquema = new Schema({
  profile,
  trip,
  trip_family,
  trip_person,
  trip_member,
  trip_item,
  item_claim,
  trip_camping_snapshot,
  invite,
  expense,
  expense_exclusion,
  expense_payment,
  expense_audit,
  pix_key,
});

export type TiposDoBanco = (typeof esquema)['types'];
export type NomeDeTabelaSincronizada = keyof TiposDoBanco;

/** Tabelas que vêm só do servidor: a camada de acesso nunca escreve nelas. */
export const TABELAS_SO_DO_SERVIDOR = [
  'trip_camping_snapshot',
  'invite',
  'expense',
  'expense_exclusion',
  'expense_payment',
  'expense_audit',
  'pix_key',
] as const satisfies readonly NomeDeTabelaSincronizada[];

/** Tabelas da seção 3 que nunca podem existir no aparelho (DEF-11). */
export const TABELAS_PROIBIDAS_NO_APARELHO = [
  'city',
  'camping',
  'camping_alias',
  'fact_report',
  'fact_summary',
  'suggestion',
  'merge_candidate',
  'list_feedback',
  'device',
  'event',
  'config',
] as const;
