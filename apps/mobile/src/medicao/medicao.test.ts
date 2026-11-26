import { resumoDoConvite, type EventoQualquer } from '@campinguim/core/eventos';
import { describe, expect, it } from 'vitest';

import { criarArmazenamentoEmMemoria, criarMedicao, type ArmazenamentoDeEventos } from './index';

const UUID_CAMPING = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

function montar(opcoes: { armazenamento?: ArmazenamentoDeEventos; relogio?: { agora: Date } } = {}) {
  const armazenamento = opcoes.armazenamento ?? criarArmazenamentoEmMemoria();
  const relogio = opcoes.relogio ?? { agora: new Date('2026-11-26T15:00:00.000Z') };
  let contador = 0;
  const recusados: { nome: string; erros: readonly string[] }[] = [];
  const medicao = criarMedicao({
    armazenamento,
    agora: () => relogio.agora,
    gerarId: () => `evento-${String(++contador).padStart(8, '0')}`,
    aoRecusar: (nome, erros) => recusados.push({ nome, erros }),
  });
  return { medicao, armazenamento, relogio, recusados };
}

describe('registro de eventos no app', () => {
  it('guarda o evento válido com id, nome, instante e propriedades', async () => {
    const { medicao, armazenamento } = montar();
    const r = await medicao.registrar('trip_created', {
      kind: 'tent_car',
      nights: 2,
      people: 4,
      has_dates: true,
      has_destination: false,
      from_previous: false,
    });
    expect(r).toEqual({ ok: true, id: 'evento-00000001' });
    expect(await armazenamento.listarPendentes(10)).toEqual([
      {
        id: 'evento-00000001',
        nome: 'trip_created',
        ocorridoEm: '2026-11-26T15:00:00.000Z',
        propriedades: { kind: 'tent_car', nights: 2, people: 4, has_dates: true, has_destination: false, from_previous: false },
      },
    ]);
  });

  it('o instante vem do relógio injetado (a jornada J3 adianta o relógio)', async () => {
    const { medicao, armazenamento, relogio } = montar();
    await medicao.registrar('app_opened', { origin: 'icon' });
    relogio.agora = new Date('2026-12-20T09:30:00.000Z');
    await medicao.registrar('app_opened', { origin: 'notification' });
    const eventos = await armazenamento.listarPendentes(10);
    expect(eventos.map((e) => e.ocorridoEm)).toEqual(['2026-11-26T15:00:00.000Z', '2026-12-20T09:30:00.000Z']);
  });

  it('evento inválido não é guardado, e a resposta não repete o valor recusado', async () => {
    const { medicao, armazenamento, recusados } = montar();
    const proibido = { origin: 'icon', email: 'carla.silva@example.com' } as never;
    const r = await medicao.registrar('app_opened', proibido);
    expect(r.ok).toBe(false);
    if (!r.ok && r.motivo === 'invalido') {
      expect(r.erros.join(' ')).toMatch(/proibida/);
      expect(JSON.stringify(r)).not.toContain('carla.silva');
    }
    expect(await medicao.contarPendentes()).toBe(0);
    expect(await armazenamento.listarPendentes(10)).toEqual([]);
    expect(recusados).toHaveLength(1);
    expect(JSON.stringify(recusados)).not.toContain('carla.silva');
  });

  it('nome de camping e texto digitado nunca chegam ao armazenamento', async () => {
    const { medicao, armazenamento } = montar();
    await medicao.registrar('destination_set', { camping_id: 'Recanto das Águas', had_data: true });
    await medicao.registrar('need_buy_marked', { catalog_key: 'Lanterna de mão' });
    await medicao.registrar('suggestion_sent', { options_count: 1, has_text: true, text: 'mais sombra' } as never);
    expect(await armazenamento.listarPendentes(10)).toEqual([]);
  });

  it('dinheiro entra só como faixa: faixaDe monta o amount_band, o valor exato é recusado', async () => {
    const { medicao, armazenamento } = montar();
    const faixa = medicao.faixaDe(42000);
    expect(faixa).toBe('150-500');
    const ok = await medicao.registrar('expense_added', { catalog_key: 'carne', amount_band: faixa, split_rule: 'shares' });
    expect(ok.ok).toBe(true);
    const exato = await medicao.registrar('expense_added', { catalog_key: 'carne', amount_band: '420,00', split_rule: 'shares' });
    expect(exato.ok).toBe(false);
    const eventos = await armazenamento.listarPendentes(10);
    expect(eventos).toHaveLength(1);
    expect(JSON.stringify(eventos)).not.toMatch(/42000|420/);
  });

  it('o convite entra só pelo resumo irreversível', async () => {
    const { medicao, armazenamento } = montar();
    const codigo = 'Q7x-convite-secreto-4821';
    const cru = await medicao.registrar('install_attributed', { channel: 'invite', invite_token_hash: codigo });
    expect(cru.ok).toBe(false);
    const ok = await medicao.registrar('install_attributed', { channel: 'invite', invite_token_hash: resumoDoConvite(codigo) });
    expect(ok.ok).toBe(true);
    expect(JSON.stringify(await armazenamento.listarPendentes(10))).not.toContain('4821');
  });

  it('medir nunca derruba o app: falha do armazenamento vira resultado, não exceção', async () => {
    const quebrado: ArmazenamentoDeEventos = {
      guardar: () => Promise.reject(new Error('disco cheio')),
      listarPendentes: () => Promise.reject(new Error('disco cheio')),
      marcarEnviados: () => Promise.reject(new Error('disco cheio')),
      contarPendentes: () => Promise.reject(new Error('disco cheio')),
    };
    const { medicao } = montar({ armazenamento: quebrado });
    await expect(medicao.registrar('app_opened', { origin: 'icon' })).resolves.toEqual({ ok: false, motivo: 'armazenamento' });
    await expect(medicao.contarPendentes()).resolves.toBe(0);
  });
});

describe('armazenamento em memória (a porta)', () => {
  const evento = (n: number): EventoQualquer => ({
    id: `evento-${String(n).padStart(8, '0')}`,
    nome: 'app_opened',
    ocorridoEm: '2026-11-26T15:00:00.000Z',
    propriedades: { origin: 'icon' },
  });

  it('lista do mais antigo ao mais novo, respeita o limite e conta', async () => {
    const a = criarArmazenamentoEmMemoria();
    for (const n of [1, 2, 3]) await a.guardar(evento(n));
    expect((await a.listarPendentes(2)).map((e) => e.id)).toEqual(['evento-00000001', 'evento-00000002']);
    expect(await a.contarPendentes()).toBe(3);
    expect(await a.listarPendentes(0)).toEqual([]);
  });

  it('marcar como enviado tira do armazenamento; id desconhecido é ignorado', async () => {
    const a = criarArmazenamentoEmMemoria();
    await a.guardar(evento(1));
    await a.guardar(evento(2));
    await a.marcarEnviados(['evento-00000001', 'evento-99999999']);
    expect((await a.listarPendentes(10)).map((e) => e.id)).toEqual(['evento-00000002']);
    expect(await a.contarPendentes()).toBe(1);
  });

  it('o mesmo id guardado duas vezes vale uma vez (reenvio em lote não duplica)', async () => {
    const a = criarArmazenamentoEmMemoria();
    await a.guardar(evento(1));
    await a.guardar(evento(1));
    expect(await a.contarPendentes()).toBe(1);
  });

  it('o que sai do armazenamento é cópia: mexer nela não muda o guardado', async () => {
    const a = criarArmazenamentoEmMemoria();
    await a.guardar(evento(1));
    const [lido] = await a.listarPendentes(1);
    (lido as { propriedades: { origin: string } }).propriedades.origin = 'alterado';
    expect((await a.listarPendentes(1))[0]?.propriedades).toEqual({ origin: 'icon' });
  });
});

describe('o catálogo inteiro passa pelo registro', () => {
  it('registrar cada evento do exemplo da SPEC não é recusado', async () => {
    const { medicao } = montar();
    const resultados = await Promise.all([
      medicao.registrar('app_opened', { origin: 'invite_link' }),
      medicao.registrar('install_attributed', { channel: 'store' }),
      medicao.registrar('list_generated', { items_added: 40, items_removed: 2 }),
      medicao.registrar('item_state_changed', { catalog_key: 'lanterna', to_state: 'set_aside' }),
      medicao.registrar('item_added_manual', { is_custom: true }),
      medicao.registrar('departure_checked', { left_behind_count: 3 }),
      medicao.registrar('trip_repeated', {}),
      medicao.registrar('coming_soon_tapped', { feature: 'menu_planner' }),
      medicao.registrar('destination_set', { camping_id: UUID_CAMPING, had_data: false }),
      medicao.registrar('notification_opened', { kind: 'pack_reminder' }),
    ]);
    expect(resultados.every((r) => r.ok)).toBe(true);
    expect(await medicao.contarPendentes()).toBe(10);
  });
});
