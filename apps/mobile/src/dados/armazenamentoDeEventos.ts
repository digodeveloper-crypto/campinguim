import type { EventoQualquer } from '@campinguim/core/eventos';

import type { ArmazenamentoDeEventos } from '../medicao/porta';
import type { ContextoDeAcesso } from './acesso/contexto';
import { apagarEventos, contarEventos, guardarEvento, lerLoteDeEventos, type PropriedadesDoEvento } from './acesso/local';

// A porta de armazenamento de eventos da B6 (`src/medicao/porta.ts`) sobre a tabela só local
// `evento_local` do banco cifrado (migração 2). Mesmo comportamento da referência em memória
// (`src/medicao/memoria.ts`), mas os eventos sobrevivem a fechar o app e reiniciar o celular,
// até o envio em lote (feature 2.2).
//
// A validação do evento (catálogo, sem texto livre) é da B6 e acontece antes, no registrador;
// aqui o evento é só guardado, lido e apagado.

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function criarArmazenamentoNoBanco(ctx: ContextoDeAcesso): ArmazenamentoDeEventos {
  return {
    async guardar(evento) {
      // Mesmo `id` de novo (o envio pode repetir): não guarda outra vez.
      await guardarEvento(ctx, {
        id: evento.id,
        at: evento.ocorridoEm,
        name: evento.nome,
        props: evento.propriedades as PropriedadesDoEvento,
      });
    },
    async listarPendentes(limite) {
      if (limite < 1) return [];
      const linhas = await lerLoteDeEventos(ctx, Math.floor(limite));
      return linhas.map(
        (l) => ({ id: l.id, nome: l.name, ocorridoEm: l.at, propriedades: JSON.parse(l.props) as unknown }) as EventoQualquer,
      );
    },
    async marcarEnviados(ids) {
      // Id desconhecido (ou que nem é UUID v4) é ignorado, como na referência em memória.
      await apagarEventos(
        ctx,
        ids.filter((id) => UUID_V4.test(id)),
      );
    },
    contarPendentes: () => contarEventos(ctx),
  };
}
