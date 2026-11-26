import { describe, expect, it } from 'vitest';

import {
  avaliarCriacao,
  compararCampings,
  desfazerFusao,
  ErroDeFusao,
  fundirCampings,
  normalizarNome,
  similaridade,
  trigramas,
  type BaseDeCampings,
} from './duplicados';

const CIDADE = '3550308';
const OUTRA_CIDADE = '3304557';

describe('Duplicados (SPEC, seção 9)', () => {
  it('D1: "Camping Recanto das Águas" e "recanto das aguas" são o mesmo camping; a criação devolve o existente', () => {
    expect(compararCampings({ nome: 'Camping Recanto das Águas', cidade: CIDADE }, { nome: 'recanto das aguas', cidade: CIDADE }).resultado).toBe('mesmo');
    const conhecidos = [{ id: 'recanto', cidade: CIDADE, nomes: ['Camping Recanto das Águas'] }];
    expect(avaliarCriacao(conhecidos, { nome: 'recanto das aguas', cidade: CIDADE })).toEqual({ existente: 'recanto', parecidos: [], filaDeFusao: [] });
  });

  it('D2: "Recanto das Águas" e "Recanto das Agoas" são parecidos: o app pergunta "é este?"', () => {
    const r = compararCampings({ nome: 'Recanto das Águas', cidade: CIDADE }, { nome: 'Recanto das Agoas', cidade: CIDADE });
    expect(r.resultado).toBe('parecido');
    expect(r.similaridade).toBeCloseTo(11 / 17, 10);
    const conhecidos = [{ id: 'recanto', cidade: CIDADE, nomes: ['Recanto das Águas'] }];
    expect(avaliarCriacao(conhecidos, { nome: 'Recanto das Agoas', cidade: CIDADE })).toEqual({
      existente: null,
      parecidos: [{ id: 'recanto', similaridade: 11 / 17 }],
      filaDeFusao: [],
    });
  });

  it('D3: "Recanto das Águas" e "Sítio Pedra Lisa" são distintos', () => {
    expect(compararCampings({ nome: 'Recanto das Águas', cidade: CIDADE }, { nome: 'Sítio Pedra Lisa', cidade: CIDADE }).resultado).toBe('distintos');
  });

  it('D4: mesmo nome em cidades diferentes são distintos', () => {
    expect(compararCampings({ nome: 'Recanto das Águas', cidade: CIDADE }, { nome: 'Recanto das Águas', cidade: OUTRA_CIDADE }).resultado).toBe('distintos');
    const conhecidos = [{ id: 'recanto', cidade: CIDADE, nomes: ['Recanto das Águas'] }];
    expect(avaliarCriacao(conhecidos, { nome: 'Recanto das Águas', cidade: OUTRA_CIDADE }).existente).toBeNull();
  });

  it('D5: fusão de dois campings com relatos; desfazer restaura os dois', () => {
    const antes: BaseDeCampings = {
      campings: [
        { id: 'recanto', nome: 'Camping Recanto das Águas', cidade: CIDADE, mergedIntoId: null },
        { id: 'recanto-2', nome: 'Recanto Águas Claras', cidade: CIDADE, mergedIntoId: null },
        { id: 'pedra', nome: 'Sítio Pedra Lisa', cidade: CIDADE, mergedIntoId: null },
      ],
      apelidos: [
        { campingId: 'recanto', nome: 'Recanto', nomeNormalizado: 'recanto' },
        { campingId: 'recanto-2', nome: 'Águas Claras', nomeNormalizado: 'aguas claras' },
      ],
      relatos: [
        { id: 'r1', campingId: 'recanto' },
        { id: 'r2', campingId: 'recanto-2' },
        { id: 'r3', campingId: 'recanto-2' },
        { id: 'r4', campingId: 'pedra' },
      ],
      sugestoes: [{ id: 's1', campingId: 'recanto-2' }],
      viagens: [
        { id: 'v1', campingId: 'recanto-2' },
        { id: 'v2', campingId: 'recanto' },
      ],
    };
    const { base: depois, registro } = fundirCampings(antes, 'recanto', 'recanto-2');
    // Todos os relatos no camping que fica
    expect(depois.relatos.filter((r) => r.campingId === 'recanto').map((r) => r.id)).toEqual(['r1', 'r2', 'r3']);
    expect(depois.relatos.find((r) => r.id === 'r4')?.campingId).toBe('pedra');
    expect(depois.sugestoes.every((s) => s.campingId === 'recanto')).toBe(true);
    expect(depois.viagens.every((v) => v.campingId === 'recanto')).toBe(true);
    // O nome do outro (e os apelidos dele) viram apelidos
    expect(depois.apelidos.filter((a) => a.campingId === 'recanto').map((a) => a.nome)).toEqual(['Recanto', 'Águas Claras', 'Recanto Águas Claras']);
    expect(depois.apelidos.at(-1)?.nomeNormalizado).toBe('recanto aguas claras');
    expect(depois.campings.find((c) => c.id === 'recanto-2')?.mergedIntoId).toBe('recanto');
    expect(registro).toEqual({
      ficaId: 'recanto',
      saiId: 'recanto-2',
      relatos: ['r2', 'r3'],
      sugestoes: ['s1'],
      viagens: ['v1'],
      apelidosMovidos: ['Águas Claras'],
      apelidoCriado: 'Recanto Águas Claras',
    });
    // Desfazer restaura os dois
    expect(desfazerFusao(depois, registro)).toEqual(antes);
  });
});

describe('Nome normalizado e similaridade (seção 6; E3-21)', () => {
  it('tira acento, pontuação, maiúsculas e as palavras genéricas', () => {
    expect(normalizarNome('Camping Recanto das Águas')).toBe('recanto aguas');
    expect(normalizarNome('Acampamento  Área de Lazer do Zé & Cia.')).toBe('lazer ze cia');
    expect(normalizarNome('Pousada e Camping São João-da-Serra')).toBe('pousada sao joao serra');
    expect(normalizarNome('ÁREA')).toBe('area');
    expect(normalizarNome('Camping')).toBe('');
  });

  it('trigramas no formato do pg_trgm', () => {
    expect([...trigramas('ab')].sort()).toEqual(['  a', ' ab', 'ab '].sort());
    expect(similaridade('', '')).toBe(0);
    expect(similaridade('recanto', 'recanto')).toBe(1);
  });

  it('similaridade entre 0,45 e 0,6 vai para a fila de fusão', () => {
    const r = compararCampings({ nome: 'Vale Verde', cidade: CIDADE }, { nome: 'Vale Verdinho', cidade: CIDADE });
    expect(r.similaridade).toBeGreaterThanOrEqual(0.45);
    expect(r.similaridade).toBeLessThan(0.6);
    expect(r.resultado).toBe('fila_de_fusao');
    const conhecidos = [
      { id: 'verde', cidade: CIDADE, nomes: ['Vale Verde'] },
      { id: 'pedra', cidade: CIDADE, nomes: ['Sítio Pedra Lisa'] },
    ];
    expect(avaliarCriacao(conhecidos, { nome: 'Vale Verdinho', cidade: CIDADE })).toMatchObject({ existente: null, parecidos: [], filaDeFusao: [{ id: 'verde' }] });
  });

  it('E3-22: a criação encontra o camping por qualquer apelido', () => {
    const conhecidos = [{ id: 'recanto', cidade: CIDADE, nomes: ['Camping Recanto das Águas', 'Camping do Seu Zé'] }];
    expect(avaliarCriacao(conhecidos, { nome: 'camping seu ze', cidade: CIDADE }).existente).toBe('recanto');
  });

  it('parecidos vêm do mais parecido para o menos', () => {
    const conhecidos = [
      { id: 'b', cidade: CIDADE, nomes: ['Recanto das Agoas'] },
      { id: 'a', cidade: CIDADE, nomes: ['Recanto das Águas Limpas'] },
    ];
    const r = avaliarCriacao(conhecidos, { nome: 'Recanto Aguas', cidade: CIDADE });
    // "recanto aguas limpas" 0,70; "recanto agoas" 0,65
    expect(r.parecidos.map((p) => p.id)).toEqual(['a', 'b']);
    expect(r.parecidos[0]?.similaridade).toBeCloseTo(0.7, 10);
  });
});

describe('Fusão: casos de erro', () => {
  const base: BaseDeCampings = {
    campings: [
      { id: 'a', nome: 'A', cidade: CIDADE, mergedIntoId: null },
      { id: 'b', nome: 'B', cidade: CIDADE, mergedIntoId: 'a' },
    ],
    apelidos: [],
    relatos: [],
    sugestoes: [],
    viagens: [],
  };
  it('recusa fundir consigo mesmo, camping inexistente e camping já fundido', () => {
    expect(() => fundirCampings(base, 'a', 'a')).toThrow(ErroDeFusao);
    expect(() => fundirCampings(base, 'a', 'z')).toThrow(/não encontrado/);
    expect(() => fundirCampings(base, 'a', 'b')).toThrow(/já fundido/);
  });
});
