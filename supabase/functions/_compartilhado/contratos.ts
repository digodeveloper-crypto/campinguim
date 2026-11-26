// Contratos entre o app e o servidor (SPEC, seção 8): a lista única das funções, de quem é cada
// uma e o que já existe. A B5 implementa só `sync_apply` (aplicação das alterações vindas do
// aparelho) e o esboço de `device_register`; as demais são das features indicadas, que escrevem
// a função em `supabase/functions/<nome>/index.ts` (TypeScript, no servidor) ou como função do
// banco, e mudam `estado` aqui. A pasta `_compartilhado` não vira função publicada (o prefixo `_`
// a deixa de fora).
// Conferido por supabase/testes/contratos.test.ts contra a seção 8 da SPEC e contra o banco.

/** Códigos estáveis de erro (seção 8, "Regras de todas as funções"). A mensagem, em português,
 * vem do arquivo de textos (NF-09), nunca daqui. */
export const CODIGOS_DE_ERRO = ['not_member', 'rate_limited', 'integrity_required', 'invite_invalid', 'not_eligible', 'validation'] as const;
export type CodigoDeErro = (typeof CODIGOS_DE_ERRO)[number];

/** Motivos de recusa por alteração devolvidos por `sync_apply` (docs/servidor.md). */
export const MOTIVOS_DE_RECUSA_DA_SINCRONIZACAO = {
  autorizacao: ['not_member', 'not_allowed'],
  invalida: ['validation', 'not_found'],
} as const;

export type Contrato = {
  nome: string;
  grupo: 'sincronização' | 'camping' | 'grupo e convite' | 'gastos e conta' | 'apoio';
  /** Feature da SPEC, seção 14, que entrega a função. */
  feature: string;
  /** Sem conta, a função funciona? (seção 8). */
  semConta: boolean;
  /** Exige aparelho verificado em produção (seção 11; DEF-04, FRD-04). */
  exigeVerificacao: boolean;
  /** 'banco': função do Postgres chamada pela API; 'servidor': função em TypeScript. */
  onde: 'banco' | 'servidor' | 'a definir';
  estado: 'implementada' | 'esboço' | 'a fazer';
};

export const CONTRATOS: readonly Contrato[] = [
  { nome: 'sync_apply', grupo: 'sincronização', feature: 'B5', semConta: false, exigeVerificacao: false, onde: 'banco', estado: 'implementada' },

  { nome: 'camping_search', grupo: 'camping', feature: '3.1', semConta: true, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'camping_create', grupo: 'camping', feature: '3.1', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'trip_set_camping', grupo: 'camping', feature: '3.3', semConta: true, exigeVerificacao: true, onde: 'a definir', estado: 'a fazer' },
  { nome: 'camping_fact_history', grupo: 'camping', feature: '3.6', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'return_questions', grupo: 'camping', feature: '3.5', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'submit_fact_reports', grupo: 'camping', feature: '3.5', semConta: false, exigeVerificacao: true, onde: 'a definir', estado: 'a fazer' },
  { nome: 'submit_owner_answers', grupo: 'camping', feature: '3.4', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'submit_suggestion', grupo: 'camping', feature: '3.5', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'flag_same_camping', grupo: 'camping', feature: '3.1', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },

  { nome: 'invite_create', grupo: 'grupo e convite', feature: '2.4', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'invite_revoke', grupo: 'grupo e convite', feature: '2.4', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'guest_join', grupo: 'grupo e convite', feature: '2.4', semConta: true, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'guest_view', grupo: 'grupo e convite', feature: '2.4', semConta: true, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'guest_claim', grupo: 'grupo e convite', feature: '2.5', semConta: true, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'member_remove', grupo: 'grupo e convite', feature: '2.3', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },

  { nome: 'expense_upsert', grupo: 'gastos e conta', feature: '2.8', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'expense_mark_paid', grupo: 'gastos e conta', feature: '2.9', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'pix_key_set', grupo: 'gastos e conta', feature: '2.9', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'pix_key_get', grupo: 'gastos e conta', feature: '2.9', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'account_export', grupo: 'gastos e conta', feature: '2.11', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'account_delete', grupo: 'gastos e conta', feature: '2.11', semConta: false, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },

  { nome: 'device_register', grupo: 'apoio', feature: 'B5 (esboço) e 3.7', semConta: false, exigeVerificacao: false, onde: 'banco', estado: 'esboço' },
  { nome: 'events_ingest', grupo: 'apoio', feature: 'B6', semConta: true, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
  { nome: 'waitlist_join', grupo: 'apoio', feature: '1.12', semConta: true, exigeVerificacao: false, onde: 'a definir', estado: 'a fazer' },
];
