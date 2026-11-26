// Dinheiro na tela: sempre inteiro em centavos, escrito em reais com vírgula nos centavos e ponto
// nos milhares ("R$ 1.234,56"). Sem Intl: a saída é a mesma em qualquer aparelho e no teste.

function exigirCentavos(valor: number): void {
  if (!Number.isSafeInteger(valor)) {
    throw new RangeError('o valor precisa ser um número inteiro de centavos');
  }
}

/** Separa os milhares com ponto: "1234567" vira "1.234.567". */
export function agruparMilhares(digitos: string): string {
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Centavos inteiros em reais: 123456 vira "R$ 1.234,56"; 42000 vira "R$ 420,00" (DESIGN, seção 10).
 * Valor negativo leva o sinal na frente: "-R$ 10,00".
 */
export function formatarReais(centavos: number): string {
  exigirCentavos(centavos);
  const sinal = centavos < 0 ? '-' : '';
  const absoluto = Math.abs(centavos);
  const reais = Math.floor(absoluto / 100);
  const resto = absoluto % 100;
  return `${sinal}R$ ${agruparMilhares(String(reais))},${String(resto).padStart(2, '0')}`;
}

/** Só o número, sem o "R$": 123456 vira "1.234,56". Serve a campo de digitação e a tabela. */
export function formatarReaisSemSimbolo(centavos: number): string {
  return formatarReais(centavos).replace('R$ ', '');
}
