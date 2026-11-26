import { randomUUID } from 'node:crypto';

import type { EventoQualquer } from '@campinguim/core/eventos';
import { describe, expect, it } from 'vitest';

import { criarArmazenamentoEmMemoria, criarMedicao, type ArmazenamentoDeEventos } from '../../medicao';
import { criarArmazenamentoNoBanco } from '../armazenamentoDeEventos';
import { novoBancoDeTeste } from './bancoDeTeste';

// A porta de eventos da B6 sobre a tabela `evento_local`: o mesmo roteiro roda contra a referência
// em memória da B6 e contra o banco, e os dois têm de dar o mesmo resultado.

const evento = (nome: string, ocorridoEm: string, propriedades: Record<string, unknown>): EventoQualquer =>
  ({ id: randomUUID(), nome, ocorridoEm, propriedades }) as EventoQualquer;

async function roteiro(a: ArmazenamentoDeEventos) {
  const e1 = evento('app_opened', '2026-11-26T15:00:00.000Z', { origin: 'icon' });
  const e2 = evento('trip_created', '2026-11-26T15:00:00.000Z', { kind: 'tent_car', nights: 2, people: 4, has_dates: true, has_destination: false, from_previous: false });
  const e3 = evento('need_buy_marked', '2026-11-26T15:01:00.000Z', { catalog_key: 'lanterna' });
  for (const e of [e1, e2, e3, e1]) await a.guardar(e); // e1 repetido não duplica
  const passos: unknown[] = [];
  passos.push(await a.contarPendentes());
  passos.push((await a.listarPendentes(2)).map((e) => e.id));
  passos.push(await a.listarPendentes(0));
  await a.marcarEnviados([e1.id, 'id-desconhecido', randomUUID()]);
  passos.push(await a.listarPendentes(10));
  passos.push(await a.contarPendentes());
  return { passos, ids: [e1.id, e2.id, e3.id], e2, e3 };
}

describe('porta de eventos da B6 no banco local (evento_local)', () => {
  it('mesmo comportamento da referência em memória', async () => {
    const { ctx } = await novoBancoDeTeste();
    const banco = await roteiro(criarArmazenamentoNoBanco(ctx));
    expect(banco.passos).toEqual([3, [banco.ids[0], banco.ids[1]], [], [banco.e2, banco.e3], 2]);
    const memoria = await roteiro(criarArmazenamentoEmMemoria());
    expect(memoria.passos).toEqual([3, [memoria.ids[0], memoria.ids[1]], [], [memoria.e2, memoria.e3], 2]);
  });

  it('o registrador da B6 grava no banco, com a hora e o identificador dele', async () => {
    const { ctx } = await novoBancoDeTeste();
    const armazenamento = criarArmazenamentoNoBanco(ctx);
    const id = randomUUID();
    const medicao = criarMedicao({ armazenamento, agora: () => new Date('2026-11-26T15:00:00.000Z'), gerarId: () => id });
    expect(await medicao.registrar('app_opened', { origin: 'icon' })).toEqual({ ok: true, id });
    expect(await medicao.contarPendentes()).toBe(1);
    expect(await armazenamento.listarPendentes(10)).toEqual([
      { id, nome: 'app_opened', ocorridoEm: '2026-11-26T15:00:00.000Z', propriedades: { origin: 'icon' } },
    ]);
  });
});
