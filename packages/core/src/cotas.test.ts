import { describe, expect, it } from 'vitest';

import { dividirGasto, ErroDeCotas, meiasCotasDe, resumirGastos, valorDaMeiaCota, type Divisao, type EntradaDoGasto } from './cotas';
import { GRUPO_DO_C1 } from './testes/referencia';

const CARNE: EntradaDoGasto = {
  valorCentavos: 42_000,
  estimativaCentavos: null,
  regra: 'shares',
  compradoraId: 'bruno-paula',
  familias: GRUPO_DO_C1,
  excluidos: [],
};

const deve = (d: Divisao, familia: string): number | undefined => d.porFamilia.find((p) => p.familiaId === familia)?.deveCentavos;

/** Em todos os casos: o que as famílias devem mais a parte do comprador é o valor do gasto, ao centavo. */
function fecha(d: Divisao): void {
  const devido = d.porFamilia.reduce((soma, p) => soma + p.deveCentavos, 0);
  expect(devido + d.compradorAbsorveCentavos).toBe(d.baseCentavos);
  expect(d.compradorRecebeCentavos).toBe(devido);
  for (const p of d.porFamilia) expect(Number.isSafeInteger(p.deveCentavos)).toBe(true);
}

describe('Cotas (SPEC, seção 9)', () => {
  it('C1: R$ 420,00, regra de cotas', () => {
    const d = dividirGasto(CARNE);
    expect(d.totalDePartes).toBe(14);
    expect(d.valorDaParteCentavos).toBe(3_000);
    expect(deve(d, 'carla-rafael')).toBe(18_000);
    expect(deve(d, 'diego-livia')).toBe(12_000);
    expect(deve(d, 'bruno-paula')).toBe(0);
    expect(d.compradorRecebeCentavos).toBe(30_000);
    expect(d.tipo).toBe('real');
    fecha(d);
  });

  it('C2: R$ 100,00 entre três famílias de 1 adulto; a primeira comprou', () => {
    const familias = ['f1', 'f2', 'f3'].map((id) => ({ id, pessoas: [{ id: `${id}-a`, faixa: 'adult' as const }] }));
    const d = dividirGasto({ ...CARNE, valorCentavos: 10_000, compradoraId: 'f1', familias });
    expect(d.totalDePartes).toBe(6);
    expect(d.valorDaParteCentavos).toBe(1_666);
    expect(deve(d, 'f2')).toBe(3_332);
    expect(deve(d, 'f3')).toBe(3_332);
    expect(d.compradorAbsorveCentavos).toBe(3_336);
    fecha(d);
  });

  it('C3: como C1, com Lucas excluído do gasto', () => {
    const d = dividirGasto({ ...CARNE, excluidos: ['lucas'] });
    expect(d.totalDePartes).toBe(13);
    expect(d.valorDaParteCentavos).toBe(3_230);
    expect(deve(d, 'carla-rafael')).toBe(16_150);
    expect(deve(d, 'diego-livia')).toBe(12_920);
    expect(d.compradorRecebeCentavos).toBe(29_070);
    fecha(d);
  });

  it('C4: como C1, regra per_family', () => {
    const d = dividirGasto({ ...CARNE, regra: 'per_family' });
    expect(d.totalDePartes).toBe(3);
    expect(deve(d, 'carla-rafael')).toBe(14_000);
    expect(deve(d, 'diego-livia')).toBe(14_000);
    expect(d.compradorRecebeCentavos).toBe(28_000);
    fecha(d);
  });

  it('C5: como C1, regra adults_teens', () => {
    const d = dividirGasto({ ...CARNE, regra: 'adults_teens' });
    expect(d.totalDePartes).toBe(6);
    expect(d.valorDaParteCentavos).toBe(7_000);
    expect(deve(d, 'carla-rafael')).toBe(14_000);
    expect(deve(d, 'diego-livia')).toBe(14_000);
    expect(d.compradorRecebeCentavos).toBe(28_000);
    fecha(d);
  });

  it('C6: como C1, com todos excluídos menos a família compradora', () => {
    const excluidos = ['carla', 'rafael', 'lucas', 'bia', 'diego', 'livia'];
    for (const regra of ['shares', 'per_family', 'adults_teens'] as const) {
      const d = dividirGasto({ ...CARNE, regra, excluidos });
      expect(d.porFamilia.every((p) => p.deveCentavos === 0), regra).toBe(true);
      expect(d.compradorRecebeCentavos).toBe(0);
      expect(d.compradorAbsorveCentavos).toBe(42_000);
      fecha(d);
    }
  });

  it('C7: gasto só com estimativa: mostra a estimativa por família, marcada "estimado", sem dívida', () => {
    const d = dividirGasto({ ...CARNE, valorCentavos: null, estimativaCentavos: 42_000 });
    expect(d.tipo).toBe('estimado');
    expect(deve(d, 'carla-rafael')).toBe(18_000);
    expect(deve(d, 'diego-livia')).toBe(12_000);
    expect(resumirGastos([{ itemId: 'carne', compradoraId: 'bruno-paula', divisao: d }])).toEqual([]);
    fecha(d);
  });

  it('a soma fecha ao centavo em qualquer valor, regra e exclusão', () => {
    const pessoas = GRUPO_DO_C1.flatMap((f) => f.pessoas.map((p) => p.id));
    for (let valor = 0; valor <= 2_000; valor += 7) {
      for (const regra of ['shares', 'per_family', 'adults_teens'] as const) {
        const excluidos = pessoas.filter((_, i) => (valor + i) % 4 === 0);
        fecha(dividirGasto({ ...CARNE, valorCentavos: valor, regra, excluidos }));
      }
    }
  });
});

describe('Regras das cotas', () => {
  it('meias cotas por faixa: adulto e adolescente 2, criança 1, menor de 5 zero', () => {
    expect([meiasCotasDe('adult'), meiasCotasDe('teen'), meiasCotasDe('child'), meiasCotasDe('toddler')]).toEqual([2, 2, 1, 0]);
  });

  it('valorDaMeiaCota recusa valor negativo, fração de centavo e H menor que 1', () => {
    expect(() => valorDaMeiaCota(-1, 2)).toThrow(RangeError);
    expect(() => valorDaMeiaCota(10.5, 2)).toThrow(RangeError);
    expect(() => valorDaMeiaCota(100, 0)).toThrow(RangeError);
  });

  it('família só com menor de 5, na regra per_family, participa; sem ninguém não participando, ninguém deve', () => {
    const familias = [
      { id: 'compra', pessoas: [{ id: 'a', faixa: 'adult' as const }] },
      { id: 'bebe', pessoas: [{ id: 'b', faixa: 'toddler' as const }] },
    ];
    expect(deve(dividirGasto({ ...CARNE, compradoraId: 'compra', familias, regra: 'per_family', valorCentavos: 1_000 }), 'bebe')).toBe(500);
    expect(deve(dividirGasto({ ...CARNE, compradoraId: 'compra', familias, regra: 'shares', valorCentavos: 1_000 }), 'bebe')).toBe(0);
    const ninguem = dividirGasto({ ...CARNE, compradoraId: 'compra', familias, excluidos: ['a'], valorCentavos: 1_000 });
    expect(ninguem.totalDePartes).toBe(0);
    expect(ninguem.compradorAbsorveCentavos).toBe(1_000);
  });

  it('recusa gasto sem valor e sem estimativa, compradora fora do gasto, família repetida e valor inválido', () => {
    expect(() => dividirGasto({ ...CARNE, valorCentavos: null })).toThrow(ErroDeCotas);
    expect(() => dividirGasto({ ...CARNE, compradoraId: 'outra' })).toThrow(/compradora/);
    expect(() => dividirGasto({ ...CARNE, familias: [...GRUPO_DO_C1, GRUPO_DO_C1[0] as never] })).toThrow(/repetida/);
    expect(() => dividirGasto({ ...CARNE, valorCentavos: 420.5 })).toThrow(RangeError);
    expect(() => dividirGasto({ ...CARNE, valorCentavos: null, estimativaCentavos: -1 })).toThrow(/estimativa/);
  });
});

describe('Resumo de gastos por família (E2-13)', () => {
  it('quanto cada família deve a cada comprador, por item e no total', () => {
    const carne = dividirGasto(CARNE);
    const bebida = dividirGasto({ ...CARNE, valorCentavos: 9_000, compradoraId: 'diego-livia', regra: 'adults_teens' });
    const gelo = dividirGasto({ ...CARNE, valorCentavos: 3_000, regra: 'per_family' });
    const estimado = dividirGasto({ ...CARNE, valorCentavos: null, estimativaCentavos: 5_000 });
    const resumo = resumirGastos([
      { itemId: 'carne', compradoraId: 'bruno-paula', divisao: carne },
      { itemId: 'bebida', compradoraId: 'diego-livia', divisao: bebida },
      { itemId: 'gelo', compradoraId: 'bruno-paula', divisao: gelo },
      { itemId: 'lenha', compradoraId: 'bruno-paula', divisao: estimado },
    ]);
    expect(resumo).toEqual([
      { devedoraId: 'carla-rafael', compradoraId: 'bruno-paula', porItem: [{ itemId: 'carne', centavos: 18_000 }, { itemId: 'gelo', centavos: 1_000 }], totalCentavos: 19_000 },
      { devedoraId: 'diego-livia', compradoraId: 'bruno-paula', porItem: [{ itemId: 'carne', centavos: 12_000 }, { itemId: 'gelo', centavos: 1_000 }], totalCentavos: 13_000 },
      { devedoraId: 'carla-rafael', compradoraId: 'diego-livia', porItem: [{ itemId: 'bebida', centavos: 3_000 }], totalCentavos: 3_000 },
      { devedoraId: 'bruno-paula', compradoraId: 'diego-livia', porItem: [{ itemId: 'bebida', centavos: 3_000 }], totalCentavos: 3_000 },
    ]);
  });
});
