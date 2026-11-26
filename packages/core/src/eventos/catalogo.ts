// Catálogo dos eventos de medição (SPEC, seção 12): um registro por evento, com as propriedades
// exatas da tabela. O que não está aqui não existe: o app não inventa evento nem propriedade, e a
// validação recusa o resto. Um teste compara este arquivo com a tabela da SPEC.
import { campo, type Campo, type ValorDe } from './campos';

// ---- Listas fechadas de valores ------------------------------------------------------------
// Tipo de viagem, estado de separação e regra de divisão vêm da SPEC, seção 3 (esquema de dados).
// As demais listas só têm, na SPEC, o nome em português; os códigos em inglês abaixo são a
// tradução direta, no mesmo estilo do esquema, e estão listados na seção "Pendências" de
// docs/textos-e-eventos.md para o orquestrador confirmar.

export const ORIGENS_DE_ABERTURA = ['icon', 'notification', 'invite_link'] as const;
export const TIPOS_DE_VIAGEM = ['tent_car', 'backpack', 'motorhome'] as const;
export const ESTADOS_DE_SEPARACAO = ['todo', 'set_aside', 'in_car'] as const;
export const REGRAS_DE_DIVISAO = ['shares', 'per_family', 'adults_teens'] as const;
export const NIVEIS_DE_ALERTA = ['attention', 'adjustment', 'information'] as const;
/** Funções "em breve" (DAT-05): ao menos inventário de equipamento e cardápio. */
export const FUNCOES_EM_BREVE = ['gear_inventory', 'menu_planner'] as const;
/** Os nove avisos da SPEC, seção 10, na ordem da tabela. */
export const TIPOS_DE_AVISO = [
  'pack_reminder',
  'eve_reminder',
  'return_checklist',
  'at_home',
  'dry_tent',
  'group_pending',
  'group_change',
  'repeat_trip',
  'camping_news',
] as const;

/**
 * PENDENTE (decisão do responsável): a SPEC não lista os canais de origem. Este padrão é a tradução
 * dos canais de divulgação do PRD (convite de grupo, conteúdo no site, comunidades, criadores,
 * campings, feiras), mais `store` (instalação direta pela loja) e `other`. Trocar a lista é
 * configuração: a validação recebe `canais`.
 */
export const CANAIS_PADRAO_PENDENTE = [
  'invite',
  'site_content',
  'communities',
  'creators',
  'camping_poster',
  'events',
  'store',
  'other',
] as const;

// ---- Definição dos eventos -----------------------------------------------------------------

export type Variante = Readonly<Record<string, Campo>>;

export interface DefinicaoDeEvento {
  /** Cada variante é um conjunto exato de propriedades. Quase todo evento tem uma só. */
  readonly variantes: readonly Variante[];
  /** Coluna "Quando" da SPEC. */
  readonly quando: string;
  /** Coluna "Serve a" da SPEC. */
  readonly serveA: string;
}

function evento<const V extends readonly Variante[]>(quando: string, serveA: string, ...variantes: V) {
  return { variantes, quando, serveA } as const;
}

const chave = campo.identificador();
const contagem = campo.inteiro(0, 9999);

export const CATALOGO = {
  app_opened: evento('App aberto', 'RET-10', { origin: campo.enum(ORIGENS_DE_ABERTURA) }),
  install_attributed: evento('Primeira abertura', 'DAT-04', {
    channel: campo.canal(),
    // Só existe quando a instalação veio de um convite.
    invite_token_hash: campo.opcional(campo.resumo()),
  }),
  trip_created: evento('Viagem criada', 'Ativação, E1-12', {
    kind: campo.enum(TIPOS_DE_VIAGEM),
    nights: campo.inteiro(0, 365),
    people: campo.inteiro(1, 999),
    has_dates: campo.booleano(),
    has_destination: campo.booleano(),
    from_previous: campo.booleano(),
  }),
  list_generated: evento('Lista gerada ou recalculada', 'E1-02', { items_added: contagem, items_removed: contagem }),
  item_state_changed: evento('Mudança de `pack_state`', 'Ativação', { catalog_key: chave, to_state: campo.enum(ESTADOS_DE_SEPARACAO) }),
  item_removed: evento('Edição da lista', 'Melhoria do catálogo', { catalog_key: chave }, { is_custom: campo.verdadeiro() }),
  item_added_manual: evento('Edição da lista', 'Melhoria do catálogo', { catalog_key: chave }, { is_custom: campo.verdadeiro() }),
  need_buy_marked: evento('"Preciso comprar"', 'Afiliados', { catalog_key: chave }),
  affiliate_clicked: evento('Toque em link de afiliado', 'Receita', { catalog_key: chave }),
  departure_checked: evento('"Vou sair" confirmado', 'E1-06', { left_behind_count: contagem }),
  missing_marked: evento('"Faltou"', 'E1-11', { catalog_key: chave }),
  leftover_marked: evento('"Sobrou"', 'E1-11', { catalog_key: chave }),
  return_checklist_done: evento('Checklist da volta concluído', 'Etapa 1', { unchecked_count: contagem }),
  trip_repeated: evento('Viagem criada a partir de outra', 'Retorno', {}),
  coming_soon_tapped: evento('Toque em função "em breve"', 'DAT-05', { feature: campo.enum(FUNCOES_EM_BREVE) }),
  group_created: evento('Grupo', 'Etapa 2', { families: contagem }),
  invite_shared: evento('Convite', 'Etapa 2', { families: contagem }),
  guest_joined: evento('Página do convidado', 'Etapa 2', { installed_later: campo.booleano() }),
  guest_claimed: evento('Página do convidado', 'Etapa 2', { installed_later: campo.booleano() }),
  expense_added: evento('Gasto lançado', 'Etapa 2', {
    catalog_key: chave,
    amount_band: campo.faixa(),
    split_rule: campo.enum(REGRAS_DE_DIVISAO),
  }),
  destination_set: evento('Destino escolhido', 'Etapa 3', { camping_id: campo.uuid(), had_data: campo.booleano() }),
  camping_not_found: evento('Busca sem resultado', 'DAT-01', { city_code: campo.ibge() }),
  alert_shown: evento('Alerta exibido', 'Etapa 3', { fact_key: chave, level: campo.enum(NIVEIS_DE_ALERTA) }),
  adjustment_undone: evento('Ajuste desfeito', 'Etapa 3', { fact_key: chave, catalog_key: chave }),
  owner_questions_shared: evento('Texto de perguntas compartilhado', 'E3-10', { facts_count: contagem }),
  return_questions_answered: evento('Perguntas da volta', 'Etapa 3', {
    asked: campo.inteiro(0, 4),
    answered: campo.inteiro(0, 4),
    anonymous: campo.booleano(),
  }),
  suggestion_sent: evento('Sugestão enviada', 'E3-25', { options_count: contagem, has_text: campo.booleano() }),
  notification_opened: evento('Aviso tocado', 'RET-07', { kind: campo.enum(TIPOS_DE_AVISO) }),
} as const satisfies Record<string, DefinicaoDeEvento>;

export type NomeDoEvento = keyof typeof CATALOGO;

export const NOMES_DE_EVENTO = Object.keys(CATALOGO) as NomeDoEvento[];

// ---- Tipos derivados do catálogo -----------------------------------------------------------

type Obrigatorios<V> = { [K in keyof V as V[K] extends { readonly opcional: true } ? never : K]: ValorDe<V[K]> };
type Opcionais<V> = { [K in keyof V as V[K] extends { readonly opcional: true } ? K : never]?: ValorDe<V[K]> };
type DeUmaVariante<V> = Obrigatorios<V> & Opcionais<V>;

/** As propriedades de um evento, na forma exata do catálogo. */
export type PropriedadesDe<N extends NomeDoEvento> = (typeof CATALOGO)[N]['variantes'][number] extends infer V
  ? V extends unknown
    ? DeUmaVariante<V>
    : never
  : never;

/** Um evento guardado no aparelho. `ocorridoEm` é o instante em UTC, no formato ISO 8601. */
export interface EventoDeMedicao<N extends NomeDoEvento = NomeDoEvento> {
  /** Identificador do evento no aparelho (para o envio em lote não duplicar). */
  readonly id: string;
  readonly nome: N;
  readonly ocorridoEm: string;
  readonly propriedades: PropriedadesDe<N>;
}

/** Qualquer evento do catálogo, com o nome e as propriedades combinando. */
export type EventoQualquer = { [N in NomeDoEvento]: EventoDeMedicao<N> }[NomeDoEvento];
