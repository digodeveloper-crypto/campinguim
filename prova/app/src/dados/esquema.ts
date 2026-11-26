import { column, Schema, Table } from '@powersync/react-native';

// Espelho no aparelho das tabelas das migrações (prova/servidor/supabase/migrations).
// O PowerSync cria a coluna `id` sozinho.
//
// F0-2: as tabelas que o app altera levam `trackMetadata` (cada escrita carrega o identificador da
// alteração, gerado no aparelho, no campo `_metadata`; SPEC, seção 4, princípio 2) e
// `trackPrevious` em `pack_state` e `deleted_at` (o servidor sabe sobre qual valor a pessoa
// mexeu e, assim, reconhece alteração concorrente sem usar o relógio do aparelho).
const opcoesDeEscrita = { trackMetadata: true, ignoreEmptyUpdates: true } as const;

const trip = new Table(
  {
    owner_profile_id: column.text,
    name: column.text,
    kind: column.text,
    start_date: column.text,
    end_date: column.text,
    nights: column.integer,
    is_group: column.integer,
    status: column.text,
    created_at: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
  },
  { ...opcoesDeEscrita },
);

const trip_member = new Table(
  {
    trip_id: column.text,
    family_id: column.text,
    profile_id: column.text,
    display_name: column.text,
    role: column.text,
    created_at: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
  },
  { indexes: { viagem: ['trip_id'] } },
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
    created_at: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
  },
  {
    indexes: { viagem: ['trip_id'] },
    ...opcoesDeEscrita,
    trackPrevious: { columns: ['pack_state', 'deleted_at'], onlyWhenChanged: true },
  },
);

const item_claim = new Table(
  {
    trip_id: column.text,
    item_id: column.text,
    family_id: column.text,
    created_at: column.text,
    updated_at: column.text,
    updated_by: column.text,
    deleted_at: column.text,
  },
  { indexes: { viagem: ['trip_id'] }, ...opcoesDeEscrita },
);

const trip_item_history = new Table(
  {
    trip_id: column.text,
    item_id: column.text,
    field: column.text,
    old_value: column.text,
    new_value: column.text,
    changed_by: column.text,
    change_id: column.text,
    created_at: column.text,
  },
  { indexes: { viagem: ['trip_id'] } },
);

// Tabelas só do aparelho (nunca sobem).
// Sessão de login guardada no próprio banco do app, para sobreviver a fechar o app (P1).
const sessao_local = new Table({ valor: column.text }, { localOnly: true });

// Registro de cada alteração feita neste aparelho, gravado na mesma transação da alteração.
// É a "folha de ponto" que o verificador de "sem perda" da prova confere contra o servidor.
const registro_local = new Table(
  {
    tabela: column.text,
    linha_id: column.text,
    op: column.text,
    dados: column.text,
    feito_em: column.text,
  },
  { localOnly: true },
);

// Avisos para a pessoa (por exemplo, alterações recusadas pelo servidor; SPEC, seção 4).
const aviso_local = new Table(
  {
    tipo: column.text,
    quantidade: column.integer,
    criado_em: column.text,
  },
  { localOnly: true },
);

export const esquema = new Schema({
  trip,
  trip_member,
  trip_item,
  item_claim,
  trip_item_history,
  sessao_local,
  registro_local,
  aviso_local,
});

export type Banco = (typeof esquema)['types'];
export type Viagem = Banco['trip'];
export type ItemDaViagem = Banco['trip_item'];
export type Membro = Banco['trip_member'];
export type Assuncao = Banco['item_claim'];
export type Aviso = Banco['aviso_local'];
