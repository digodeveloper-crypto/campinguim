import { describe, expect, it } from 'vitest';

import {
  chaveDoPlural,
  diaDaSemana,
  formatarData,
  formatarDataCurta,
  formatarMesAno,
  formatarNumero,
  formatarPeriodo,
  formatarPorcentagem,
  formatarReais,
  formatarReaisSemSimbolo,
  interpolar,
  lerDataIso,
  marcasDoTexto,
} from './index';

// O pacote das regras puras não carrega os tipos do Node; o teste só precisa do `env` para trocar o fuso.
declare const process: { env: Record<string, string | undefined> };

describe('reais (NF-09)', () => {
  it.each([
    [0, 'R$ 0,00'],
    [5, 'R$ 0,05'],
    [99, 'R$ 0,99'],
    [100, 'R$ 1,00'],
    [42000, 'R$ 420,00'], // a carne da jornada J6
    [123456, 'R$ 1.234,56'],
    [100000000, 'R$ 1.000.000,00'],
    [-1000, '-R$ 10,00'],
    [-5, '-R$ 0,05'],
  ])('%i centavos viram %s', (centavos, esperado) => {
    expect(formatarReais(centavos)).toBe(esperado);
  });

  it('sem o símbolo', () => {
    expect(formatarReaisSemSimbolo(123456)).toBe('1.234,56');
  });

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY])('recusa %s: dinheiro é centavo inteiro', (valor) => {
    expect(() => formatarReais(valor)).toThrow(RangeError);
  });
});

describe('números', () => {
  it.each([
    [0, 0, '0'],
    [999, 0, '999'],
    [1000, 0, '1.000'],
    [1234567, 0, '1.234.567'],
    [1234.5, 2, '1.234,50'],
    [0.5, 1, '0,5'],
    [-1234.5, 1, '-1.234,5'],
    [-0.0001, 2, '0,00'],
  ])('%d com %d casas vira %s', (valor, casas, esperado) => {
    expect(formatarNumero(valor, casas)).toBe(esperado);
  });

  it('porcentagem com espaço antes do símbolo', () => {
    expect(formatarPorcentagem(0.35)).toBe('35 %');
    expect(formatarPorcentagem(0.125, 1)).toBe('12,5 %');
  });

  it('recusa número infinito e casas fora de 0 a 6', () => {
    expect(() => formatarNumero(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(() => formatarNumero(1, 7)).toThrow(RangeError);
    expect(() => formatarNumero(1, -1)).toThrow(RangeError);
  });
});

describe('datas', () => {
  it('data completa em dia/mês/ano', () => {
    expect(formatarData('2027-01-12')).toBe('12/01/2027');
    expect(formatarData('2028-02-29')).toBe('29/02/2028');
  });

  it('data curta com o dia da semana abreviado', () => {
    expect(formatarDataCurta('2027-01-15')).toBe('sex., 15 de jan.');
    expect(formatarDataCurta('2027-01-12')).toBe('ter., 12 de jan.');
    expect(formatarDataCurta('2026-11-29')).toBe('dom., 29 de nov.');
    expect(formatarDataCurta('2026-12-05')).toBe('sáb., 5 de dez.');
  });

  it('dia da semana: 0 é domingo', () => {
    expect(diaDaSemana('2026-11-29')).toBe(0);
    expect(diaDaSemana('2027-01-01')).toBe(5);
  });

  it('a data não depende do fuso do aparelho', () => {
    const fuso = process.env['TZ'];
    try {
      for (const tz of ['America/Sao_Paulo', 'Pacific/Kiritimati', 'Pacific/Pago_Pago']) {
        process.env['TZ'] = tz;
        expect(formatarData('2027-03-01')).toBe('01/03/2027');
        expect(formatarDataCurta('2027-03-01')).toBe('seg., 1 de mar.');
      }
    } finally {
      if (fuso === undefined) delete process.env['TZ'];
      else process.env['TZ'] = fuso;
    }
  });

  it('mês e ano sem o dia', () => {
    expect(formatarMesAno('2026-11')).toBe('nov/2026');
    expect(formatarMesAno('2027-01')).toBe('jan/2027');
  });

  it('período, e uma data só quando ida e volta são no mesmo dia', () => {
    expect(formatarPeriodo('2027-01-15', '2027-01-17')).toBe('15/01/2027 a 17/01/2027');
    expect(formatarPeriodo('2027-01-15', '2027-01-15')).toBe('15/01/2027');
  });

  it.each(['2027-02-29', '2027-13-01', '2027-00-10', '2027-01-32', '12/01/2027', '2027-1-5', ''])(
    'recusa a data %j',
    (texto) => {
      expect(() => lerDataIso(texto)).toThrow(RangeError);
    },
  );

  it('recusa mês fora do formato', () => {
    expect(() => formatarMesAno('2027-13')).toThrow(RangeError);
    expect(() => formatarMesAno('nov/2026')).toThrow(RangeError);
  });
});

describe('interpolação e plural dos textos', () => {
  it('troca as marcas e repete a mesma marca', () => {
    expect(interpolar('{n} itens separados ainda fora do carro.', { n: 3 })).toBe('3 itens separados ainda fora do carro.');
    expect(interpolar('{a} e {a}', { a: 'x' })).toBe('x e x');
    expect(interpolar('Sem marcas.')).toBe('Sem marcas.');
  });

  it('marca sem valor é erro, nunca texto com chave solta', () => {
    expect(() => interpolar('{n} itens', {})).toThrow(/sem valor para \{n\}/);
  });

  it('valor zero entra como "0", não some', () => {
    expect(interpolar('{n} itens', { n: 0 })).toBe('0 itens');
  });

  it('lista as marcas que o texto pede, sem repetir', () => {
    expect(marcasDoTexto('{fato}: {valor}. {n} confirmações. {n}')).toEqual(['fato', 'valor', 'n']);
    expect(marcasDoTexto('nada')).toEqual([]);
  });

  it('singular só com contagem 1 e chave _um existente; 0 vai no plural', () => {
    const existe = (c: string) => c === 'itens_um';
    expect(chaveDoPlural('itens', 1, existe)).toBe('itens_um');
    expect(chaveDoPlural('itens', 0, existe)).toBe('itens');
    expect(chaveDoPlural('itens', 2, existe)).toBe('itens');
    expect(chaveDoPlural('outros', 1, existe)).toBe('outros');
  });
});
