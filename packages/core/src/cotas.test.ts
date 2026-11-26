import { describe, expect, it } from 'vitest';

import { valorDaMeiaCota } from './cotas';

// Valores de H e da meia cota tirados da tabela da SPEC, seção 9 (casos C1, C2 e C3).
describe('valorDaMeiaCota (SPEC, seção 9, passo 3)', () => {
  it('C1: R$ 420,00 com H = 14 dá meia cota de R$ 30,00', () => {
    expect(valorDaMeiaCota(42_000, 14)).toBe(3_000);
  });

  it('C2: R$ 100,00 com H = 6 dá meia cota de R$ 16,66 (arredonda para baixo)', () => {
    expect(valorDaMeiaCota(10_000, 6)).toBe(1_666);
  });

  it('C3: R$ 420,00 com H = 13 dá meia cota de R$ 32,30', () => {
    expect(valorDaMeiaCota(42_000, 13)).toBe(3_230);
  });

  it('recusa valor negativo ou com fração de centavo', () => {
    expect(() => valorDaMeiaCota(-1, 2)).toThrow(RangeError);
    expect(() => valorDaMeiaCota(10.5, 2)).toThrow(RangeError);
  });

  it('recusa H menor que 1', () => {
    expect(() => valorDaMeiaCota(100, 0)).toThrow(RangeError);
  });
});
