// Listas de tabelas usadas pelos testes do servidor (SPEC, seções 3 e 11).

// Protegidas: sem nenhuma política (só as funções da seção 8 e a operação interna chegam nelas).
export const PROTEGIDAS = [
  'public.camping',
  'public.camping_alias',
  'public.city',
  'public.config',
  'public.device',
  'public.event',
  'public.fact_report',
  'public.fact_summary',
  'public.invite',
  'public.list_feedback',
  'public.merge_candidate',
  'public.suggestion',
  'private.server_setting',
  'private.sync_change',
];

// As que vão ao aparelho (SPEC, seção 3, "O que chega ao aparelho").
export const SINCRONIZADAS = [
  'expense',
  'expense_audit',
  'expense_exclusion',
  'expense_payment',
  'item_claim',
  'profile',
  'trip',
  'trip_camping_snapshot',
  'trip_family',
  'trip_item',
  'trip_member',
  'trip_person',
];
