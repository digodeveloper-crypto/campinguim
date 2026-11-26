// Primeira regra pura da base, copiada ao pé da letra da SPEC, seção 9 ("Cotas", passo 3), para o
// executor de testes ter um caso real desde a B1. O cálculo completo das cotas (passos 1, 2, 4 e 5,
// casos C1 a C7) é da feature 2.8.
//
// Dinheiro é sempre inteiro em centavos: nunca há fração de centavo na conta.

/**
 * Valor da meia cota (SPEC, seção 9, passo 3): o valor do gasto dividido por `H` (soma das meias
 * cotas de todos os participantes), arredondado para baixo, em centavos.
 */
export function valorDaMeiaCota(valorDoGastoCentavos: number, meiasCotas: number): number {
  if (!Number.isSafeInteger(valorDoGastoCentavos) || valorDoGastoCentavos < 0) {
    throw new RangeError('o valor do gasto precisa ser um número inteiro de centavos, zero ou mais');
  }
  if (!Number.isSafeInteger(meiasCotas) || meiasCotas < 1) {
    throw new RangeError('H precisa ser um número inteiro de meias cotas, ao menos 1');
  }
  return Math.floor(valorDoGastoCentavos / meiasCotas);
}
