import { describe, expect, it } from 'vitest';

import { frescorPelaIdade, idadeEmMeses, relatoContaNoLimite, resumirFato, verificarElegibilidade, type Relato } from './fatos';
import { ErroDeEntrada } from './variaveis';

/** Data de referência da SPEC, seção 9: novembro de 2026. */
const AGORA = '2026-11';

let sequencia = 0;
function relato(mudanca: Partial<Relato> = {}): Relato {
  sequencia += 1;
  return {
    id: `r${sequencia}`,
    contaId: `conta-${sequencia}`,
    viagemId: `viagem-${sequencia}`,
    valor: 'sim',
    origem: 'camper',
    mesVisita: '2026-10',
    ocasiao: 'fim_de_semana',
    retido: false,
    conta: true,
    ...mudanca,
  };
}

describe('Frescor e confirmação (SPEC, seção 9)', () => {
  it('F1: último relato em outubro de 2026 é recente', () => {
    expect(resumirFato([relato({ mesVisita: '2026-10' })], AGORA).frescor).toBe('recente');
  });

  it('F2: último relato em março de 2026 pode ter mudado', () => {
    expect(resumirFato([relato({ mesVisita: '2026-03' })], AGORA).frescor).toBe('pode_ter_mudado');
  });

  it('F3: último relato em outubro de 2025 fica sem valor vigente (e não gera alerta)', () => {
    const r = resumirFato([relato({ mesVisita: '2025-10' })], AGORA);
    expect(r).toMatchObject({ valorVigente: null, frescor: 'sem_valor', confirmado: false });
  });

  it('F4: dois relatos iguais, de contas diferentes, recentes: confirmado', () => {
    const r = resumirFato([relato({ contaId: 'ana' }), relato({ contaId: 'beto' })], AGORA);
    expect(r).toMatchObject({ valorVigente: 'sim', confirmado: true, concordam: 2, divergencia: null });
  });

  it('F5: dois relatos iguais, da mesma conta, em viagens diferentes: não confirmado', () => {
    const r = resumirFato([relato({ contaId: 'ana', viagemId: 'v1' }), relato({ contaId: 'ana', viagemId: 'v2' })], AGORA);
    expect(r).toMatchObject({ valorVigente: 'sim', confirmado: false });
  });

  it('F6: 5 relatos "cumprida" e 1 "não cumprida" em feriado: vale "cumprida", com a divergência e a ocasião', () => {
    const r = resumirFato([...Array.from({ length: 5 }, () => relato({ valor: 'sim' })), relato({ valor: 'nao', ocasiao: 'feriado' })], AGORA);
    expect(r.valorVigente).toBe('sim');
    expect(r.confirmado).toBe(true);
    expect(r.divergencia).toEqual([
      { valor: 'sim', contagem: 5, ultimoMes: '2026-10', ocasioes: { fim_de_semana: 5 } },
      { valor: 'nao', contagem: 1, ultimoMes: '2026-10', ocasioes: { feriado: 1 } },
    ]);
  });

  it('F7: 1 "sim" de setembro e 1 "não" de outubro: empate, vale "não", o mais recente; não confirmado', () => {
    const r = resumirFato([relato({ valor: 'sim', mesVisita: '2026-09' }), relato({ valor: 'nao', mesVisita: '2026-10' })], AGORA);
    expect(r).toMatchObject({ valorVigente: 'nao', confirmado: false });
    // a ordem de chegada não muda o resultado
    const invertido = resumirFato([relato({ valor: 'nao', mesVisita: '2026-10' }), relato({ valor: 'sim', mesVisita: '2026-09' })], AGORA);
    expect(invertido.valorVigente).toBe('nao');
  });

  it('F8: terceira viagem da mesma conta ao mesmo camping no mesmo mês: relato guardado, sem contar', () => {
    const anteriores = [
      relato({ contaId: 'ana', viagemId: 'v1', mesVisita: '2026-10' }),
      relato({ contaId: 'ana', viagemId: 'v2', mesVisita: '2026-10' }),
    ];
    expect(relatoContaNoLimite(anteriores, { viagemId: 'v3', mesVisita: '2026-10' })).toBe(false);
    expect(relatoContaNoLimite(anteriores.slice(0, 1), { viagemId: 'v2', mesVisita: '2026-10' })).toBe(true);
    expect(relatoContaNoLimite(anteriores, { viagemId: 'v3', mesVisita: '2026-11' })).toBe(true);
    // outra resposta de uma viagem que já conta, conta também; de uma que não conta, não conta
    expect(relatoContaNoLimite(anteriores, { viagemId: 'v1', mesVisita: '2026-10' })).toBe(true);
    const terceiro = relato({ contaId: 'ana', viagemId: 'v3', mesVisita: '2026-10', conta: false, valor: 'nao' });
    expect(relatoContaNoLimite([...anteriores, terceiro], { viagemId: 'v3', mesVisita: '2026-10' })).toBe(false);
    // guardado, sem contar: não entra no resumo
    expect(resumirFato([...anteriores, terceiro], AGORA)).toMatchObject({ valorVigente: 'sim', relatosConsiderados: 2, divergencia: null });
  });

  it('F9: relato de viagem criada depois da data de ida é recusado com not_eligible', () => {
    const viagem = { campingId: 'recanto', criadaEm: '2026-10-12', dataIda: '2026-10-10', dataVolta: '2026-10-12' };
    expect(verificarElegibilidade(viagem, 'recanto', { logado: true, hoje: '2026-11-26' })).toEqual({
      ok: false,
      code: 'not_eligible',
      motivo: 'criada_depois_da_ida',
    });
  });
});

describe('Resumo do fato: regras da seção 6', () => {
  it('relato "informado pelo camping, via campista" pesa metade', () => {
    const r = resumirFato([relato({ valor: 'a' }), relato({ valor: 'b', origem: 'owner_via_camper' })], AGORA);
    expect(r.valorVigente).toBe('a');
    // dois do camping empatam com um de campista; vale o mais recente
    const empate = resumirFato(
      [relato({ valor: 'a', mesVisita: '2026-08' }), relato({ valor: 'b', origem: 'owner_via_camper' }), relato({ valor: 'b', origem: 'owner_via_camper' })],
      AGORA,
    );
    expect(empate.valorVigente).toBe('b');
  });

  it('relato retido não entra na conta', () => {
    expect(resumirFato([relato({ valor: 'a', retido: true }), relato({ valor: 'b' })], AGORA)).toMatchObject({ valorVigente: 'b', relatosConsiderados: 1 });
  });

  it('relato de mais de 12 meses sai da conta, mesmo com outros recentes', () => {
    const r = resumirFato([relato({ valor: 'a', mesVisita: '2025-10' }), relato({ valor: 'b', mesVisita: '2026-06' })], AGORA);
    expect(r).toMatchObject({ valorVigente: 'b', frescor: 'recente', relatosConsiderados: 1, ultimoMes: '2026-06' });
  });

  it('relato de conta excluída (anônimo) vale como relato, mas não como conta diferente', () => {
    const r = resumirFato([relato({ contaId: null }), relato({ contaId: null })], AGORA);
    expect(r).toMatchObject({ valorVigente: 'sim', confirmado: false, concordam: 2 });
  });

  it('empate no mesmo mês: vale o que chegou depois', () => {
    expect(resumirFato([relato({ valor: 'a' }), relato({ valor: 'b' })], AGORA).valorVigente).toBe('b');
  });

  it('sem relatos: sem valor vigente', () => {
    expect(resumirFato([], AGORA)).toMatchObject({ valorVigente: null, frescor: 'sem_valor', ultimoMes: null });
  });

  it('idade e frescor nos limites: 6 meses recente, 12 pode ter mudado, 13 sem valor', () => {
    expect(idadeEmMeses('2026-11', '2026-05')).toBe(6);
    expect(frescorPelaIdade(6)).toBe('recente');
    expect(frescorPelaIdade(7)).toBe('pode_ter_mudado');
    expect(frescorPelaIdade(12)).toBe('pode_ter_mudado');
    expect(frescorPelaIdade(13)).toBe('sem_valor');
    expect(idadeEmMeses('2027-01', '2026-12')).toBe(1);
  });

  it('recusa mês fora do formato ou no futuro', () => {
    expect(() => idadeEmMeses('2026-11', '2026-13')).toThrow(ErroDeEntrada);
    expect(() => idadeEmMeses('nov/2026', '2026-10')).toThrow(ErroDeEntrada);
    expect(() => idadeEmMeses('2026-11', '2026-12')).toThrow(/depois/);
  });
});

describe('Quem pode relatar (E3-17)', () => {
  const viagem = { campingId: 'recanto', criadaEm: '2026-10-01', dataIda: '2026-10-10', dataVolta: '2026-10-12' };
  const contexto = { logado: true, hoje: '2026-11-26' };

  it('conta logada, viagem para aquele camping, volta já passada e criada antes da ida: pode', () => {
    expect(verificarElegibilidade(viagem, 'recanto', contexto)).toEqual({ ok: true });
    expect(verificarElegibilidade({ ...viagem, criadaEm: '2026-10-10' }, 'recanto', contexto)).toEqual({ ok: true });
  });

  it.each([
    ['sem conta', viagem, { ...contexto, logado: false }, 'sem_conta'],
    ['outro camping', { ...viagem, campingId: 'outro' }, contexto, 'outro_camping'],
    ['viagem sem data', { ...viagem, dataIda: null, dataVolta: null }, contexto, 'sem_datas'],
    ['volta ainda não passou', { ...viagem, dataVolta: '2026-11-26' }, contexto, 'volta_nao_passou'],
  ] as const)('%s: not_eligible', (_caso, v, c, motivo) => {
    expect(verificarElegibilidade(v, 'recanto', c)).toEqual({ ok: false, code: 'not_eligible', motivo });
  });

  it('recusa data fora do formato', () => {
    expect(() => verificarElegibilidade({ ...viagem, dataIda: '10/10/2026' }, 'recanto', contexto)).toThrow(ErroDeEntrada);
  });
});
