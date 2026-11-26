// Números na tela, no formato brasileiro: vírgula nos decimais e ponto nos milhares.
import { agruparMilhares } from './reais';

/**
 * Formata um número finito. `casasDecimais` fixa as casas (0 por padrão): 1234.5 com 2 casas vira
 * "1.234,50". O arredondamento é o do JavaScript (`toFixed`): use centavos inteiros para dinheiro,
 * nunca esta função.
 */
export function formatarNumero(valor: number, casasDecimais = 0): string {
  if (!Number.isFinite(valor)) throw new RangeError('o número precisa ser finito');
  if (!Number.isInteger(casasDecimais) || casasDecimais < 0 || casasDecimais > 6) {
    throw new RangeError('as casas decimais vão de 0 a 6');
  }
  const texto = Math.abs(valor).toFixed(casasDecimais);
  const [inteiro = '0', decimais] = texto.split('.');
  // "-0,0" nunca aparece: o sinal só entra quando o texto não é zero.
  const sinal = valor < 0 && Number(texto) !== 0 ? '-' : '';
  return `${sinal}${agruparMilhares(inteiro)}${decimais === undefined ? '' : `,${decimais}`}`;
}

/** Porcentagem a partir de uma fração: 0.35 vira "35 %" (com espaço, como no DESIGN, seção 9). */
export function formatarPorcentagem(fracao: number, casasDecimais = 0): string {
  return `${formatarNumero(fracao * 100, casasDecimais)} %`;
}
