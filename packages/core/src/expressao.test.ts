import { describe, expect, it } from 'vitest';

import { analisar, avaliar, compilar, ErroDeExpressao, tipoDe, type TipoDeValor } from './expressao';

const TIPOS: Record<string, TipoDeValor> = { P: 'numero', N: 'numero', D: 'numero', clima: 'texto', chuva: 'logico' };
const VALORES = { P: 4, N: 2, D: 3, clima: 'frio', chuva: false };
const valor = (fonte: string): unknown => compilar(fonte, TIPOS).avaliar(VALORES);

describe('Interpretador das expressões do catálogo (SPEC, seção 5, "Formato do arquivo")', () => {
  it('aritmética com precedência, teto e se()', () => {
    expect(valor('teto(P * N / 8) + 1')).toBe(2);
    expect(valor('teto(3 * P * D / 5)')).toBe(8);
    expect(valor('2 * D')).toBe(6);
    expect(valor('1 + 2 * 3 - 4 / 2')).toBe(5);
    expect(valor('(1 + 2) * 3')).toBe(9);
    expect(valor('-P + 10')).toBe(6);
    expect(valor('2.5 * 2')).toBe(5);
    expect(valor('se(P <= 8, 1, 2)')).toBe(1);
    expect(valor("se(clima == 'frio', 2, 1)")).toBe(2);
  });

  it('comparações e lógica (e, ou, nao, sempre)', () => {
    expect(valor('sempre')).toBe(true);
    expect(valor("clima == 'calor' ou chuva")).toBe(false);
    expect(valor("clima != 'calor' e nao chuva")).toBe(true);
    expect(valor('N >= 2')).toBe(true);
    expect(valor('N > 2')).toBe(false);
    expect(valor('N < 3')).toBe(true);
    expect(valor('P + D > 6 e (chuva ou P == 4)')).toBe(true);
    expect(valor('nao nao chuva')).toBe(false);
  });

  it('recusa variável e função desconhecidas e mistura de tipos, antes de avaliar', () => {
    expect(() => compilar('pessoas + 1', TIPOS)).toThrow(/variável desconhecida/);
    expect(() => compilar('raiz(P)', TIPOS)).toThrow(/função desconhecida/);
    expect(() => compilar('P + chuva', TIPOS)).toThrow(/espera numero/);
    expect(() => compilar('chuva e P', TIPOS)).toThrow(/espera logico/);
    expect(() => compilar("P == 'quatro'", TIPOS)).toThrow(/espera numero/);
    expect(() => compilar('nao P', TIPOS)).toThrow(/espera logico/);
    expect(() => compilar('-chuva', TIPOS)).toThrow(/espera numero/);
    expect(() => compilar('teto(P, N)', TIPOS)).toThrow(/um argumento/);
    expect(() => compilar('se(chuva, 1)', TIPOS)).toThrow(/três argumentos/);
    expect(() => compilar('se(P, 1, 2)', TIPOS)).toThrow(/espera logico/);
    expect(() => compilar("se(chuva, 1, 'a')", TIPOS)).toThrow(/espera numero/);
  });

  it('recusa texto mal formado', () => {
    expect(() => analisar('P +')).toThrow(ErroDeExpressao);
    expect(() => analisar('(P + 1')).toThrow(/esperava "\)"/);
    expect(() => analisar("clima == 'frio")).toThrow(/aspa/);
    expect(() => analisar('P ; N')).toThrow(/caractere inesperado/);
    expect(() => analisar('P N')).toThrow(/sobra texto/);
    expect(() => analisar('e P')).toThrow(/fora de lugar/);
    expect(() => analisar('')).toThrow(/incompleta/);
  });

  it('nunca executa código: só lê os símbolos da gramática', () => {
    expect(() => analisar('process.exit(1)')).toThrow(ErroDeExpressao);
    expect(() => analisar('constructor.constructor("return 1")()')).toThrow(ErroDeExpressao);
  });

  it('avaliar com variável sem valor ou divisão por zero é erro', () => {
    expect(() => avaliar(analisar('X + 1'), {})).toThrow(/sem valor/);
    expect(() => avaliar(analisar('P / 0'), VALORES)).toThrow(/divisão por zero/);
  });

  it('tipoDe diz o tipo do resultado', () => {
    expect(tipoDe(analisar('P > 1'), TIPOS)).toBe('logico');
    expect(tipoDe(analisar('clima'), TIPOS)).toBe('texto');
    expect(tipoDe(analisar('teto(P / 2)'), TIPOS)).toBe('numero');
  });
});
