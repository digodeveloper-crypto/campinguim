// Registro de eventos de medição no app (SPEC, seção 12): valida cada evento contra o catálogo e o
// guarda na porta de armazenamento, para o envio em lote (feature 2.2) levar depois, quando houver
// internet. Regras:
//   - evento inválido nunca é guardado (nada de texto livre nem dado pessoal chega ao armazenamento);
//   - medir nunca atrapalha o app: `registrar` não lança erro, devolve o resultado;
//   - dinheiro entra só como faixa: use `faixaDe(centavos)` para montar `amount_band`.
import {
  type ConfigDeFaixas,
  type EventoDeMedicao,
  type NomeDoEvento,
  type PropriedadesDe,
  FAIXAS_PADRAO_PENDENTE,
  faixaDeValor,
  validarEvento,
} from '@campinguim/core/eventos';

import type { ArmazenamentoDeEventos } from './porta';

export type ResultadoDoRegistro =
  | { readonly ok: true; readonly id: string }
  | { readonly ok: false; readonly motivo: 'invalido'; readonly erros: readonly string[] }
  | { readonly ok: false; readonly motivo: 'armazenamento' };

export interface DependenciasDaMedicao {
  readonly armazenamento: ArmazenamentoDeEventos;
  /** O relógio. Injetado para o teste fixar a hora (e a jornada J3 adiantar o relógio). */
  readonly agora: () => Date;
  /** Gera o identificador de cada evento (UUID v4 em produção). */
  readonly gerarId: () => string;
  /** Limites das faixas de valor. PENDENTE: padrão em `faixas.ts` do core. */
  readonly faixas?: ConfigDeFaixas;
  /** Canais de origem aceitos. PENDENTE: padrão em `catalogo.ts` do core. */
  readonly canais?: readonly string[];
  /** Chamado quando um evento é recusado, só para registro de desenvolvimento (recebe os erros, nunca o valor). */
  readonly aoRecusar?: (nome: string, erros: readonly string[]) => void;
}

export interface Medicao {
  registrar<N extends NomeDoEvento>(nome: N, propriedades: PropriedadesDe<N>): Promise<ResultadoDoRegistro>;
  /** A faixa de um valor em centavos, para o `amount_band` do gasto. */
  faixaDe(centavos: number): string;
  /** Quantos eventos aguardam envio. */
  contarPendentes(): Promise<number>;
}

export function criarMedicao(dependencias: DependenciasDaMedicao): Medicao {
  const { armazenamento, agora, gerarId, faixas = FAIXAS_PADRAO_PENDENTE, canais, aoRecusar } = dependencias;

  return {
    async registrar(nome, propriedades) {
      const candidato: EventoDeMedicao = {
        id: gerarId(),
        nome,
        ocorridoEm: agora().toISOString(),
        propriedades,
      } as EventoDeMedicao;

      const validacao = validarEvento(candidato, { faixas, ...(canais ? { canais } : {}) });
      if (!validacao.ok) {
        aoRecusar?.(nome, validacao.erros);
        return { ok: false, motivo: 'invalido', erros: validacao.erros };
      }
      try {
        await armazenamento.guardar(validacao.evento);
        return { ok: true, id: validacao.evento.id };
      } catch {
        return { ok: false, motivo: 'armazenamento' };
      }
    },
    faixaDe: (centavos) => faixaDeValor(centavos, faixas),
    async contarPendentes() {
      try {
        return await armazenamento.contarPendentes();
      } catch {
        return 0;
      }
    },
  };
}
