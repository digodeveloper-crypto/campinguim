import type { EventoQualquer } from '@campinguim/core/eventos';

import type { ArmazenamentoDeEventos } from './porta';

/** Cópia profunda de um evento (só JSON simples), sem `structuredClone`, que o Hermes pode não ter. */
function copia(evento: EventoQualquer): EventoQualquer {
  return JSON.parse(JSON.stringify(evento)) as EventoQualquer;
}

/**
 * Armazenamento em memória: serve aos testes e como referência de comportamento para a
 * implementação em SQLite. O que está aqui se perde quando o app fecha.
 */
export function criarArmazenamentoEmMemoria(): ArmazenamentoDeEventos {
  // Map guarda a ordem de inserção: o mais antigo sai primeiro.
  const eventos = new Map<string, EventoQualquer>();

  return {
    guardar(evento) {
      if (!eventos.has(evento.id)) eventos.set(evento.id, copia(evento));
      return Promise.resolve();
    },
    listarPendentes(limite) {
      return Promise.resolve([...eventos.values()].slice(0, Math.max(0, limite)).map((e) => copia(e)));
    },
    marcarEnviados(ids) {
      ids.forEach((id) => eventos.delete(id));
      return Promise.resolve();
    },
    contarPendentes() {
      return Promise.resolve(eventos.size);
    },
  };
}
