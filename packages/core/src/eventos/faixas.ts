// Faixas de valor dos gastos (`amount_band`, SPEC, seção 12): dinheiro nunca vai ao evento pelo
// valor exato, só pela faixa em que cai.
//
// PENDENTE (decisão do responsável): a SPEC não define os limites das faixas. Os limites abaixo são
// só uma PROPOSTA, para o código e os testes funcionarem, e não valem como regra de negócio até o
// orquestrador confirmar. A função recebe os limites como configuração; trocar o padrão não mexe em
// mais nada. Ver docs/textos-e-eventos.md, seção "Pendências".

export interface ConfigDeFaixas {
  /**
   * Limites de cima de cada faixa, em centavos, em ordem crescente, em reais inteiros. Com N
   * limites há N + 1 faixas: a última é "acima do último limite". O valor igual ao limite cai na
   * faixa de cima (cada faixa é fechada embaixo e aberta em cima).
   */
  readonly limitesEmCentavos: readonly number[];
}

/**
 * PENDENTE: R$ 50, R$ 150, R$ 500 e R$ 1.500 (faixas "0-50", "50-150", "150-500", "500-1500" e
 * "1500+", em reais). Proposta: a carne da jornada J6 (R$ 420) cai em "150-500".
 */
export const FAIXAS_PADRAO_PENDENTE: ConfigDeFaixas = Object.freeze({
  limitesEmCentavos: Object.freeze([5000, 15000, 50000, 150000]),
});

/** Confere a configuração: limites positivos, em reais inteiros e estritamente crescentes. */
export function conferirFaixas(config: ConfigDeFaixas): void {
  const { limitesEmCentavos: limites } = config;
  if (limites.length === 0) throw new RangeError('as faixas precisam de ao menos um limite');
  limites.forEach((limite, i) => {
    if (!Number.isSafeInteger(limite) || limite <= 0 || limite % 100 !== 0) {
      throw new RangeError('cada limite de faixa é um valor positivo em reais inteiros, escrito em centavos');
    }
    const anterior = limites[i - 1];
    if (anterior !== undefined && limite <= anterior) {
      throw new RangeError('os limites das faixas precisam ser estritamente crescentes');
    }
  });
}

/** Os nomes das faixas, da mais baixa à mais alta: "0-50", "50-150", ..., "1500+" (em reais). */
export function rotulosDeFaixa(config: ConfigDeFaixas = FAIXAS_PADRAO_PENDENTE): string[] {
  conferirFaixas(config);
  const reais = config.limitesEmCentavos.map((c) => c / 100);
  const rotulos = reais.map((limite, i) => `${i === 0 ? 0 : (reais[i - 1] ?? 0)}-${limite}`);
  rotulos.push(`${reais[reais.length - 1] ?? 0}+`);
  return rotulos;
}

/** Faixa de um valor em centavos inteiros, zero ou mais. Nunca devolve o valor exato. */
export function faixaDeValor(centavos: number, config: ConfigDeFaixas = FAIXAS_PADRAO_PENDENTE): string {
  if (!Number.isSafeInteger(centavos) || centavos < 0) {
    throw new RangeError('o valor precisa ser um número inteiro de centavos, zero ou mais');
  }
  const rotulos = rotulosDeFaixa(config);
  const indice = config.limitesEmCentavos.findIndex((limite) => centavos < limite);
  return rotulos[indice === -1 ? rotulos.length - 1 : indice] ?? '';
}
