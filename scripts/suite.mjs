// Regras do resumo da suíte local (scripts/testar.mjs), separadas para serem testadas
// (scripts/testes/suite.test.ts). Regra central: teste pulado nunca conta como passou. Uma etapa
// com qualquer teste pulado sai PULADO, com o motivo, e a suíte fica INCOMPLETA.

/** @typedef {'passou' | 'FALHOU' | 'PULADO'} Estado */

/**
 * Estado de uma etapa do Vitest a partir do relatório JSON dele.
 * @param {any} relatorio conteúdo do --outputFile.json do Vitest (ou null se não foi gerado)
 * @param {boolean} saiuComZero o Vitest terminou sem erro
 * @returns {{ estado: Estado, detalhe: string }}
 */
export function resumoVitest(relatorio, saiuComZero) {
  if (!relatorio) return { estado: 'FALHOU', detalhe: 'o Vitest não gerou o relatório' };
  const total = relatorio.numTotalTests ?? 0;
  const passaram = relatorio.numPassedTests ?? 0;
  const contagem = `${passaram} de ${total} testes passaram`;
  if (!saiuComZero || (relatorio.numFailedTests ?? 0) > 0) return { estado: 'FALHOU', detalhe: contagem };
  const pulados = (relatorio.testResults ?? [])
    .flatMap((arquivo) => arquivo.assertionResults ?? [])
    .filter((t) => t.status !== 'passed' && t.status !== 'failed');
  const numPulados = Math.max(pulados.length, (relatorio.numPendingTests ?? 0) + (relatorio.numTodoTests ?? 0));
  if (numPulados > 0) {
    // O motivo do pulo vem no nome do grupo (describe), como no teste do manifesto.
    const motivos = [...new Set(pulados.map((t) => (t.ancestorTitles ?? []).join(' > ') || t.title))];
    return { estado: 'PULADO', detalhe: `${contagem}; ${numPulados} pulado(s): ${motivos.join('; ')}` };
  }
  return { estado: 'passou', detalhe: contagem };
}

/**
 * Estado da etapa do Playwright a partir das estatísticas do relatório JSON dele.
 * @param {any} stats campo `stats` do relatório (ou null se não foi gerado)
 * @param {boolean} saiuComZero
 * @returns {{ estado: Estado, detalhe: string }}
 */
export function resumoPlaywright(stats, saiuComZero) {
  if (!stats) return { estado: 'FALHOU', detalhe: 'o Playwright não gerou o relatório' };
  const total = (stats.expected ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0) + (stats.skipped ?? 0);
  const contagem = `${stats.expected ?? 0} de ${total} testes passaram`;
  if (!saiuComZero || (stats.unexpected ?? 0) > 0 || (stats.flaky ?? 0) > 0) return { estado: 'FALHOU', detalhe: contagem };
  if ((stats.skipped ?? 0) > 0) return { estado: 'PULADO', detalhe: `${contagem}; ${stats.skipped} pulado(s)` };
  return { estado: 'passou', detalhe: contagem };
}

/**
 * Frase final e código de saída da suíte.
 * Sem --exigir-completa, INCOMPLETA sai com 0 (serve para o ciclo de edição, mas não para aprovar).
 * Com --exigir-completa (QA e esteira da versão), qualquer etapa pulada faz a suíte falhar.
 * @param {{ estado: Estado }[]} resultados
 * @param {{ exigirCompleta: boolean, duracao: string }} opcoes
 * @returns {{ frase: string, codigo: number }}
 */
export function resumoGeral(resultados, { exigirCompleta, duracao }) {
  const falhas = resultados.filter((r) => r.estado === 'FALHOU').length;
  const pulados = resultados.filter((r) => r.estado === 'PULADO').length;
  if (falhas) return { frase: `SUÍTE FALHOU: ${falhas} etapa(s) com falha (${duracao}).`, codigo: 1 };
  if (pulados && exigirCompleta) {
    return {
      frase: `SUÍTE INCOMPLETA, e --exigir-completa foi pedido: ${pulados} etapa(s) puladas contam como falha (${duracao}).`,
      codigo: 1,
    };
  }
  if (pulados) {
    return {
      frase: `SUÍTE INCOMPLETA: nada falhou, mas ${pulados} etapa(s) foram puladas (${duracao}). Não serve para aprovar.`,
      codigo: 0,
    };
  }
  return { frase: `SUÍTE COMPLETA: todas as ${resultados.length} etapas passaram (${duracao}).`, codigo: 0 };
}
