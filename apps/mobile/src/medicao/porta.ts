// Porta de armazenamento dos eventos de medição. O registro de eventos (registrador.ts) só conversa
// com esta interface: ele não sabe se os eventos ficam na memória (testes) ou numa tabela do banco
// local cifrado (a integração com a B4, numa tarefa posterior). O envio em lote ao servidor é da
// feature 2.2 e usa `listarPendentes` e `marcarEnviados`.
import type { EventoQualquer } from '@campinguim/core/eventos';

export interface ArmazenamentoDeEventos {
  /** Guarda o evento. Um evento com `id` que já existe não é guardado de novo (o envio em lote pode repetir). */
  guardar(evento: EventoQualquer): Promise<void>;
  /** Os eventos ainda não enviados, do mais antigo para o mais novo, até `limite`. */
  listarPendentes(limite: number): Promise<EventoQualquer[]>;
  /** Tira do armazenamento os eventos que o servidor confirmou. Id desconhecido é ignorado. */
  marcarEnviados(ids: readonly string[]): Promise<void>;
  /** Quantos eventos aguardam envio (o indicador "aguardando envio" da SPEC, seção 7). */
  contarPendentes(): Promise<number>;
}
