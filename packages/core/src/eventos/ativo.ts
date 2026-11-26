// Usuário ativo (RET-09, SPEC seção 12): quem tem `trip_created` ou `item_state_changed` nos
// últimos 12 meses. Não é uso semanal nem mensal: as métricas da seção 13 usam esta definição.
import type { NomeDoEvento } from './catalogo';

/** Os eventos que contam para o usuário ativo. */
export const EVENTOS_DE_USUARIO_ATIVO: readonly NomeDoEvento[] = ['trip_created', 'item_state_changed'];

/** Meses da janela. */
export const MESES_DE_USUARIO_ATIVO = 12;

export interface EventoParaAtividade {
  readonly nome: string;
  readonly ocorridoEm: string;
}

function lerInstante(texto: string, rotulo: string): Date {
  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) throw new RangeError(`${rotulo} não é um instante válido`);
  return data;
}

/**
 * O começo da janela: `agora` menos 12 meses, no mesmo dia e hora (UTC). Se o dia não existe lá
 * (29 de fevereiro), vale o último dia do mês.
 */
export function inicioDaJanelaDeAtividade(agoraIso: string): Date {
  const agora = lerInstante(agoraIso, 'agora');
  const inicio = new Date(agora.getTime());
  const diaOriginal = inicio.getUTCDate();
  inicio.setUTCDate(1);
  inicio.setUTCMonth(inicio.getUTCMonth() - MESES_DE_USUARIO_ATIVO);
  const ultimoDia = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + 1, 0)).getUTCDate();
  inicio.setUTCDate(Math.min(diaOriginal, ultimoDia));
  return inicio;
}

/**
 * Verdadeiro se há ao menos um evento de atividade na janela fechada [agora - 12 meses, agora].
 * Evento depois de `agora` (relógio do aparelho que andou para trás) não conta.
 */
export function ehUsuarioAtivo(eventos: readonly EventoParaAtividade[], agoraIso: string): boolean {
  const agora = lerInstante(agoraIso, 'agora').getTime();
  const inicio = inicioDaJanelaDeAtividade(agoraIso).getTime();
  return eventos.some((e) => {
    if (!(EVENTOS_DE_USUARIO_ATIVO as readonly string[]).includes(e.nome)) return false;
    const t = new Date(e.ocorridoEm).getTime();
    return Number.isFinite(t) && t >= inicio && t <= agora;
  });
}
