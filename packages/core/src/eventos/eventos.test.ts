/// <reference types="node" />
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  CANAIS_PADRAO_PENDENTE,
  CATALOGO,
  EVENTOS_DE_USUARIO_ATIVO,
  FAIXAS_PADRAO_PENDENTE,
  NOMES_DE_EVENTO,
  ehUsuarioAtivo,
  faixaDeValor,
  inicioDaJanelaDeAtividade,
  resumoDoConvite,
  rotulosDeFaixa,
  sha256Hex,
  validarEvento,
  type EventoDeMedicao,
  type NomeDoEvento,
  type PropriedadesDe,
} from './index';

const ID = '0f8fad5b-d9cb-469f-a165-70867728950e';
const QUANDO = '2026-11-26T15:00:00.000Z';
const CAMPING = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

/** Um exemplo válido de cada evento, com as propriedades exatas da SPEC, seção 12. */
const EXEMPLOS: { [N in NomeDoEvento]: PropriedadesDe<N> } = {
  app_opened: { origin: 'icon' },
  install_attributed: { channel: 'invite', invite_token_hash: 'a'.repeat(64) },
  trip_created: { kind: 'tent_car', nights: 2, people: 4, has_dates: true, has_destination: false, from_previous: false },
  list_generated: { items_added: 12, items_removed: 0 },
  item_state_changed: { catalog_key: 'lanterna', to_state: 'in_car' },
  item_removed: { catalog_key: 'carvao' },
  item_added_manual: { is_custom: true },
  need_buy_marked: { catalog_key: 'lanterna' },
  affiliate_clicked: { catalog_key: 'lanterna' },
  departure_checked: { left_behind_count: 3 },
  missing_marked: { catalog_key: 'agua' },
  leftover_marked: { catalog_key: 'carvao' },
  return_checklist_done: { unchecked_count: 1 },
  trip_repeated: {},
  coming_soon_tapped: { feature: 'gear_inventory' },
  group_created: { families: 3 },
  invite_shared: { families: 3 },
  guest_joined: { installed_later: false },
  guest_claimed: { installed_later: true },
  expense_added: { catalog_key: 'carne', amount_band: '150-500', split_rule: 'shares' },
  destination_set: { camping_id: CAMPING, had_data: true },
  camping_not_found: { city_code: '3550308' },
  alert_shown: { fact_key: 'energia_voltagem', level: 'adjustment' },
  adjustment_undone: { fact_key: 'energia_tomada', catalog_key: 'extensao' },
  owner_questions_shared: { facts_count: 5 },
  return_questions_answered: { asked: 4, answered: 3, anonymous: false },
  suggestion_sent: { options_count: 2, has_text: true },
  notification_opened: { kind: 'eve_reminder' },
};

function montar(nome: string, propriedades: unknown, extra: Record<string, unknown> = {}) {
  return { id: ID, nome, ocorridoEm: QUANDO, propriedades, ...extra };
}

describe('catálogo × tabela da SPEC, seção 12', () => {
  const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
  const spec = fs.readFileSync(path.join(raiz, 'docs', 'SPEC.md'), 'utf8');
  const secao = spec.slice(spec.indexOf('## 12. Eventos de medição'), spec.indexOf('## 13.'));
  const linhas = secao.split('\n').filter((l) => /^\| `/.test(l));

  /** Cada linha da tabela: nomes de evento e propriedades, sem a crase. */
  const tabela = linhas.map((linha) => {
    const [eventos = '', , propriedades = ''] = linha.split('|').slice(1).map((c) => c.trim());
    const nomes = [...eventos.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] ?? '');
    const props = [...propriedades.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] ?? '');
    return { nomes, props };
  });

  it('a tabela foi lida (24 linhas, uma por grupo de eventos)', () => {
    expect(tabela.length).toBe(24);
    expect(new Set(tabela.flatMap((t) => t.nomes)).size).toBe(NOMES_DE_EVENTO.length);
  });

  it('todo evento da tabela está no catálogo e todo evento do catálogo está na tabela', () => {
    expect([...new Set(tabela.flatMap((t) => t.nomes))].sort()).toEqual([...NOMES_DE_EVENTO].sort());
  });

  it('cada evento tem exatamente as propriedades da tabela (nem mais, nem menos)', () => {
    for (const { nomes, props } of tabela) {
      for (const nome of nomes) {
        const doCatalogo = new Set(
          CATALOGO[nome as NomeDoEvento].variantes.flatMap((v) => Object.keys(v)),
        );
        expect([...doCatalogo].sort(), `propriedades de ${nome}`).toEqual([...new Set(props)].sort());
      }
    }
  });

  it('cada evento tem um exemplo válido neste teste', () => {
    expect(Object.keys(EXEMPLOS).sort()).toEqual([...NOMES_DE_EVENTO].sort());
  });
});

describe('validação: o que passa', () => {
  it.each(NOMES_DE_EVENTO)('aceita o exemplo de %s', (nome) => {
    const r = validarEvento(montar(nome, EXEMPLOS[nome]));
    expect(r, JSON.stringify(r)).toMatchObject({ ok: true });
  });

  it('install_attributed sem convite não leva o resumo', () => {
    expect(validarEvento(montar('install_attributed', { channel: 'store' })).ok).toBe(true);
  });

  it('item removido ou adicionado: com chave do catálogo OU como item da pessoa, nunca os dois', () => {
    for (const nome of ['item_removed', 'item_added_manual']) {
      expect(validarEvento(montar(nome, { catalog_key: 'carvao' })).ok).toBe(true);
      expect(validarEvento(montar(nome, { is_custom: true })).ok).toBe(true);
      expect(validarEvento(montar(nome, { catalog_key: 'carvao', is_custom: true })).ok).toBe(false);
      expect(validarEvento(montar(nome, {})).ok).toBe(false);
      expect(validarEvento(montar(nome, { is_custom: false })).ok).toBe(false);
    }
  });

  it('o tipo do evento acompanha o catálogo', () => {
    // Conferido pelo `npm run tipos` (o Vitest não checa tipos): cada diretiva de erro esperado
    // abaixo precisa mesmo dar erro de tipo, senão o verificador reclama.
    const certo: PropriedadesDe<'trip_created'> = { kind: 'backpack', nights: 1, people: 2, has_dates: false, has_destination: false, from_previous: true };
    // @ts-expect-error tipo de viagem fora da lista
    const tipoErrado: PropriedadesDe<'trip_created'> = { ...certo, kind: 'cabana' };
    // @ts-expect-error falta propriedade
    const faltando: PropriedadesDe<'app_opened'> = {};
    // @ts-expect-error propriedade que não é do evento
    const sobrando: PropriedadesDe<'app_opened'> = { origin: 'icon', email: 'a@example.com' };
    const semHash: PropriedadesDe<'install_attributed'> = { channel: 'store' };
    const ev: EventoDeMedicao<'trip_repeated'> = { id: ID, nome: 'trip_repeated', ocorridoEm: QUANDO, propriedades: {} };
    expect([certo, tipoErrado, faltando, sobrando, semHash, ev]).toHaveLength(6);
  });
});

describe('validação: o que é recusado', () => {
  it('evento fora do catálogo', () => {
    const r = validarEvento(montar('screen_viewed', {}));
    expect(r).toMatchObject({ ok: false });
  });

  it('propriedade que não existe no evento', () => {
    const r = validarEvento(montar('app_opened', { origin: 'icon', extra: 1 }));
    expect(r.ok).toBe(false);
  });

  it('falta de propriedade obrigatória', () => {
    expect(validarEvento(montar('trip_created', { kind: 'tent_car' })).ok).toBe(false);
  });

  it('valor de lista fechada fora da lista', () => {
    expect(validarEvento(montar('app_opened', { origin: 'Ícone do app' })).ok).toBe(false);
    expect(validarEvento(montar('item_state_changed', { catalog_key: 'lanterna', to_state: 'separei' })).ok).toBe(false);
  });

  it.each([
    ['nome', { origin: 'icon', nome: 'Carla' }],
    ['e-mail', { origin: 'icon', email: 'carla@example.com' }],
    ['texto digitado', { origin: 'icon', text: 'fui com a Carla' }],
    ['nome de camping', { origin: 'icon', camping_name: 'Recanto das Águas' }],
    ['chave Pix', { origin: 'icon', pix_key: 'carla@example.com' }],
    ['valor exato', { origin: 'icon', amount_cents: 42000 }],
  ])('recusa propriedade com %s e diz que é proibida', (_rotulo, propriedades) => {
    const r = validarEvento(montar('app_opened', propriedades));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/proibida/);
  });

  it('recusa texto livre onde cabe só uma chave', () => {
    for (const texto of ['Carla', 'carla@example.com', 'bateria portátil', 'Lanterna', '11999998888', '123.456.789-09', '']) {
      expect(validarEvento(montar('need_buy_marked', { catalog_key: texto })).ok, texto).toBe(false);
    }
  });

  it('recusa nome de camping no lugar do id, e id fora do formato', () => {
    expect(validarEvento(montar('destination_set', { camping_id: 'Recanto das Águas', had_data: true })).ok).toBe(false);
    expect(validarEvento(montar('destination_set', { camping_id: CAMPING.toUpperCase(), had_data: true })).ok).toBe(false);
  });

  it('código do IBGE tem 7 dígitos', () => {
    expect(validarEvento(montar('camping_not_found', { city_code: 'São Paulo' })).ok).toBe(false);
    expect(validarEvento(montar('camping_not_found', { city_code: '355030' })).ok).toBe(false);
    expect(validarEvento(montar('camping_not_found', { city_code: 3550308 })).ok).toBe(false);
  });

  it('o resumo do convite precisa ser o resumo, nunca o código do convite', () => {
    expect(validarEvento(montar('install_attributed', { channel: 'invite', invite_token_hash: 'ABCD1234token' })).ok).toBe(false);
    expect(validarEvento(montar('install_attributed', { channel: 'invite', invite_token_hash: 'A'.repeat(64) })).ok).toBe(false);
  });

  it('tipos errados: número como texto, texto como número, objeto, lista, nulo, NaN', () => {
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, nights: '2' })).ok).toBe(false);
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, nights: 1.5 })).ok).toBe(false);
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, nights: Number.NaN })).ok).toBe(false);
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, has_dates: 'sim' })).ok).toBe(false);
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, kind: ['tent_car'] })).ok).toBe(false);
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, kind: { x: 1 } })).ok).toBe(false);
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, kind: null })).ok).toBe(false);
  });

  it('contagem negativa ou absurda', () => {
    expect(validarEvento(montar('departure_checked', { left_behind_count: -1 })).ok).toBe(false);
    expect(validarEvento(montar('departure_checked', { left_behind_count: 1e9 })).ok).toBe(false);
    expect(validarEvento(montar('trip_created', { ...EXEMPLOS.trip_created, people: 0 })).ok).toBe(false);
  });

  it('respondidas não passam das perguntadas', () => {
    expect(validarEvento(montar('return_questions_answered', { asked: 2, answered: 3, anonymous: false })).ok).toBe(false);
    expect(validarEvento(montar('return_questions_answered', { asked: 4, answered: 4, anonymous: true })).ok).toBe(true);
  });

  it('o envelope: objeto, id, instante e campos extras', () => {
    expect(validarEvento(null).ok).toBe(false);
    expect(validarEvento('app_opened').ok).toBe(false);
    expect(validarEvento([]).ok).toBe(false);
    expect(validarEvento(montar('app_opened', { origin: 'icon' }, { id: 'curto' })).ok).toBe(false);
    expect(validarEvento(montar('app_opened', { origin: 'icon' }, { ocorridoEm: '2026-11-26' })).ok).toBe(false);
    expect(validarEvento(montar('app_opened', { origin: 'icon' }, { ocorridoEm: '2026-02-30T10:00:00.000Z' })).ok).toBe(false);
    expect(validarEvento(montar('app_opened', { origin: 'icon' }, { usuario: 'carla' })).ok).toBe(false);
    expect(validarEvento({ id: ID, nome: 'app_opened', ocorridoEm: QUANDO }).ok).toBe(false);
  });

  it('nunca repete na resposta o valor recusado (pode ser dado pessoal)', () => {
    const segredos = ['carla.silva@example.com', 'Recanto das Águas', '11999998888', 'Maria Aparecida'];
    for (const s of segredos) {
      const r = validarEvento(montar('need_buy_marked', { catalog_key: s, nome: s, e_mail: s }));
      expect(r.ok).toBe(false);
      if (!r.ok) expect(JSON.stringify(r.erros)).not.toContain(s);
    }
  });
});

describe('faixa de valor (amount_band) — limites PENDENTES, vindos de configuração', () => {
  it('as faixas padrão (proposta) e seus nomes', () => {
    expect(rotulosDeFaixa()).toEqual(['0-50', '50-150', '150-500', '500-1500', '1500+']);
  });

  it.each([
    [0, '0-50'],
    [4999, '0-50'],
    [5000, '50-150'], // o limite cai na faixa de cima
    [14999, '50-150'],
    [15000, '150-500'],
    [42000, '150-500'], // a carne da jornada J6
    [50000, '500-1500'],
    [149999, '500-1500'],
    [150000, '1500+'],
    [99999999, '1500+'],
  ])('%i centavos caem na faixa %s', (centavos, faixa) => {
    expect(faixaDeValor(centavos)).toBe(faixa);
  });

  it('a faixa nunca traz o valor exato: dois valores da mesma faixa dão o mesmo resultado', () => {
    expect(faixaDeValor(42000)).toBe(faixaDeValor(42001));
    expect(faixaDeValor(42000)).not.toContain('420');
  });

  it('os limites são configuração: outra lista muda as faixas sem mudar o código', () => {
    const config = { limitesEmCentavos: [10000, 100000] };
    expect(rotulosDeFaixa(config)).toEqual(['0-100', '100-1000', '1000+']);
    expect(faixaDeValor(42000, config)).toBe('100-1000');
    expect(faixaDeValor(100000, config)).toBe('1000+');
  });

  it('a validação do evento aceita só as faixas da configuração', () => {
    const config = { limitesEmCentavos: [10000, 100000] };
    const propriedades = { catalog_key: 'carne', amount_band: '100-1000', split_rule: 'shares' };
    expect(validarEvento(montar('expense_added', propriedades), { faixas: config }).ok).toBe(true);
    expect(validarEvento(montar('expense_added', propriedades)).ok).toBe(false); // não é faixa do padrão
    expect(validarEvento(montar('expense_added', { ...propriedades, amount_band: '420,00' })).ok).toBe(false);
    expect(validarEvento(montar('expense_added', { ...propriedades, amount_band: 42000 })).ok).toBe(false);
  });

  it('configuração inválida e valor inválido são erro', () => {
    expect(() => rotulosDeFaixa({ limitesEmCentavos: [] })).toThrow(RangeError);
    expect(() => rotulosDeFaixa({ limitesEmCentavos: [10000, 10000] })).toThrow(RangeError);
    expect(() => rotulosDeFaixa({ limitesEmCentavos: [20000, 10000] })).toThrow(RangeError);
    expect(() => rotulosDeFaixa({ limitesEmCentavos: [5050] })).toThrow(RangeError);
    expect(() => rotulosDeFaixa({ limitesEmCentavos: [0, 100] })).toThrow(RangeError);
    expect(() => faixaDeValor(-1)).toThrow(RangeError);
    expect(() => faixaDeValor(10.5)).toThrow(RangeError);
  });

  it('o padrão está marcado como pendente no nome e não pode ser alterado por engano', () => {
    expect(Object.isFrozen(FAIXAS_PADRAO_PENDENTE)).toBe(true);
    expect(FAIXAS_PADRAO_PENDENTE.limitesEmCentavos).toEqual([5000, 15000, 50000, 150000]);
  });
});

describe('canais de origem — lista PENDENTE, vinda de configuração', () => {
  it('o padrão serve e outra lista pode ser passada', () => {
    expect(CANAIS_PADRAO_PENDENTE).toContain('invite');
    expect(validarEvento(montar('install_attributed', { channel: 'parceiro_x' })).ok).toBe(false);
    expect(validarEvento(montar('install_attributed', { channel: 'parceiro_x' }), { canais: ['parceiro_x'] }).ok).toBe(true);
  });
});

describe('resumo irreversível do convite (invite_token_hash)', () => {
  it.each([
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
    ['The quick brown fox jumps over the lazy dog', 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'],
    ['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'],
  ])('SHA-256 de %j bate com o vetor conhecido', (texto, esperado) => {
    expect(sha256Hex(texto)).toBe(esperado);
  });

  it('bate com o SHA-256 do Node em textos de todos os tamanhos, com acento e emoji', () => {
    const base = 'ação do convite — 🐧 / ';
    for (let n = 0; n <= 200; n += 1) {
      const texto = base.repeat(Math.ceil((n + 1) / base.length)).slice(0, n);
      expect(sha256Hex(texto), `tamanho ${n}`).toBe(createHash('sha256').update(texto, 'utf8').digest('hex'));
    }
    const longo = 'x'.repeat(10_000);
    expect(sha256Hex(longo)).toBe(createHash('sha256').update(longo, 'utf8').digest('hex'));
  });

  it('o resumo do convite tem 64 letras hexadecimais, é estável e não contém o código', () => {
    const codigo = 'Q7x-convite-secreto-4821';
    const r = resumoDoConvite(codigo);
    expect(r).toMatch(/^[0-9a-f]{64}$/);
    expect(resumoDoConvite(codigo)).toBe(r);
    expect(r).not.toContain('4821');
    expect(resumoDoConvite(`${codigo}!`)).not.toBe(r);
  });

  it('o resumo é aceito pelo evento install_attributed', () => {
    const r = validarEvento(montar('install_attributed', { channel: 'invite', invite_token_hash: resumoDoConvite('Q7x-convite-secreto-4821') }));
    expect(r.ok).toBe(true);
  });

  it('código vazio é erro', () => {
    expect(() => resumoDoConvite('')).toThrow(RangeError);
  });
});

describe('usuário ativo (RET-09)', () => {
  const AGORA = '2026-11-26T12:00:00.000Z';
  const ev = (nome: string, ocorridoEm: string) => ({ nome, ocorridoEm });

  it('só trip_created e item_state_changed contam', () => {
    expect([...EVENTOS_DE_USUARIO_ATIVO].sort()).toEqual(['item_state_changed', 'trip_created']);
    expect(ehUsuarioAtivo([ev('trip_created', '2026-11-01T10:00:00.000Z')], AGORA)).toBe(true);
    expect(ehUsuarioAtivo([ev('item_state_changed', '2026-11-01T10:00:00.000Z')], AGORA)).toBe(true);
    for (const outro of NOMES_DE_EVENTO.filter((n) => !EVENTOS_DE_USUARIO_ATIVO.includes(n))) {
      expect(ehUsuarioAtivo([ev(outro, '2026-11-01T10:00:00.000Z')], AGORA), outro).toBe(false);
    }
  });

  it('sem nenhum evento, não é ativo', () => {
    expect(ehUsuarioAtivo([], AGORA)).toBe(false);
  });

  it('a janela é de 12 meses fechada nas duas pontas', () => {
    expect(inicioDaJanelaDeAtividade(AGORA).toISOString()).toBe('2025-11-26T12:00:00.000Z');
    expect(ehUsuarioAtivo([ev('trip_created', '2025-11-26T12:00:00.000Z')], AGORA)).toBe(true);
    expect(ehUsuarioAtivo([ev('trip_created', '2025-11-26T11:59:59.999Z')], AGORA)).toBe(false);
    expect(ehUsuarioAtivo([ev('trip_created', AGORA)], AGORA)).toBe(true);
  });

  it('evento depois de agora (relógio que andou para trás) não conta', () => {
    expect(ehUsuarioAtivo([ev('trip_created', '2026-11-26T12:00:00.001Z')], AGORA)).toBe(false);
  });

  it('um evento antigo e um recente: basta o recente', () => {
    expect(ehUsuarioAtivo([ev('trip_created', '2020-01-01T00:00:00.000Z'), ev('item_state_changed', '2026-06-01T00:00:00.000Z')], AGORA)).toBe(true);
    expect(ehUsuarioAtivo([ev('trip_created', '2020-01-01T00:00:00.000Z'), ev('app_opened', '2026-06-01T00:00:00.000Z')], AGORA)).toBe(false);
  });

  it('29 de fevereiro: a janela começa no último dia do mês', () => {
    expect(inicioDaJanelaDeAtividade('2028-02-29T00:00:00.000Z').toISOString()).toBe('2027-02-28T00:00:00.000Z');
    expect(inicioDaJanelaDeAtividade('2027-03-31T00:00:00.000Z').toISOString()).toBe('2026-03-31T00:00:00.000Z');
    expect(inicioDaJanelaDeAtividade('2026-03-31T00:00:00.000Z').toISOString()).toBe('2025-03-31T00:00:00.000Z');
  });

  it('instante inválido é erro; evento com instante inválido não conta', () => {
    expect(() => ehUsuarioAtivo([], 'ontem')).toThrow(RangeError);
    expect(ehUsuarioAtivo([ev('trip_created', 'ontem')], AGORA)).toBe(false);
  });
});
