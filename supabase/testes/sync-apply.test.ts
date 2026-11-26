// Grupo 4: public.sync_apply, a função que aplica as alterações vindas do aparelho (SPEC, seções 4,
// 8 e 11; pontos J1 e J2 de docs/prova-tecnica/resultado.md). Cada teste roda numa transação
// desfeita no fim (apoio-banco.ts).
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { alteracao, criarPessoa, criarViagem, enviar, entrarComo, linha, naTransacao, tentar, voltarAoDono } from './apoio-banco';

type Item = { qty: string | null; name: string; note: string | null; pack_state: string; removed: boolean; deleted_at: string | null; family_id: string | null; updated_by: string };

describe('grupo 4: lote misto (válida, inválida e não autorizada)', () => {
  it('aplica as válidas e devolve o motivo das outras, na mesma ordem, sem abortar o lote', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const novo = randomUUID();
      const lote = [
        alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: 3 }),
        alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'x'.repeat(121) }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { qty: 9 }),
        alteracao('trip', 'PATCH', v.trip, { kind: 'camping' }),
        alteracao('trip_item', 'PUT', novo, { trip_id: v.trip, name: 'Isqueiro', qty: 2 }),
      ];
      const r = await enviar(c, v.b, lote);
      expect(r.map((x) => [x.change_id, x.status, x.reason ?? null])).toEqual([
        [lote[0]?.change_id, 'applied', null],
        [lote[1]?.change_id, 'rejected', 'validation'],
        [lote[2]?.change_id, 'rejected', 'not_allowed'],
        [lote[3]?.change_id, 'rejected', 'not_allowed'],
        [lote[4]?.change_id, 'applied', null],
      ]);
      expect(Number((await linha<Item>(c, 'trip_item', v.itemGrupo))?.qty)).toBe(3);
      expect(Number((await linha<Item>(c, 'trip_item', v.itemFamiliaA))?.qty)).toBe(2);
      expect((await linha<{ kind: string }>(c, 'trip', v.trip))?.kind).toBe('tent_car');
      expect((await linha<Item>(c, 'trip_item', novo))?.name).toBe('Isqueiro');
    });
  });

  it('o mesmo lote misto, mandado de novo, não aplica nada duas vezes e repete o primeiro veredito', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const lote = [
        alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: 3 }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { qty: 9 }),
        alteracao('trip', 'PATCH', v.trip, { kind: 'camping' }),
      ];
      await enviar(c, v.org, lote);
      const r = await enviar(c, v.org, lote);
      expect(r.map((x) => [x.status, x.first_status, x.first_reason ?? null])).toEqual([
        ['duplicate', 'applied', null],
        ['duplicate', 'applied', null],
        ['duplicate', 'rejected', 'validation'],
      ]);
    });
  });
});

describe('J1: um dado inválido não trava a fila (recusa só aquela alteração)', () => {
  const casos: [string, (v: Awaited<ReturnType<typeof criarViagem>>) => unknown][] = [
    ['tipo de viagem fora da lista', (v) => alteracao('trip', 'PATCH', v.trip, { kind: 'camping' })],
    ['nome com mais de 120 caracteres', (v) => alteracao('trip_item', 'PATCH', v.itemGrupo, { name: 'x'.repeat(121) })],
    ['identificador que não é uuid', () => alteracao('trip_item', 'PATCH', 'nao-e-uuid', { qty: 1 })],
    ['uuid inválido dentro dos dados', (v) => alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'A', family_id: 'zzz' })],
    ['quantidade negativa', (v) => alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: -1 })],
    ['estado de separação desconhecido', (v) => alteracao('trip_item', 'PATCH', v.itemGrupo, { pack_state: 'perdido' })],
    ['booleano que não é 0, 1, true ou false', (v) => alteracao('trip_item', 'PATCH', v.itemGrupo, { need_buy: 'talvez' })],
    ['data impossível', (v) => alteracao('trip', 'PATCH', v.trip, { start_date: '2026-02-31' })],
    ['volta antes da ida', (v) => alteracao('trip', 'PATCH', v.trip, { start_date: '2026-12-10', end_date: '2026-12-01' })],
    ['operação desconhecida', (v) => ({ ...alteracao('trip_item', 'PATCH', v.itemGrupo), op: 'MERGE' })],
    ['tabela desconhecida', (v) => alteracao('tabela_que_nao_existe', 'PUT', v.itemGrupo, {})],
    ['dados que não são objeto', (v) => ({ ...alteracao('trip_item', 'PATCH', v.itemGrupo), data: [1, 2] })],
    ['viagem de origem que não é uuid', (v) => alteracao('trip', 'PATCH', v.trip, { source_trip_id: 'abc' })],
    ['gasto com centavos quebrados', (v) => alteracao('expense', 'PATCH', v.gasto, { amount_cents: 10.5 })],
  ];

  for (const [nome, montar] of casos) {
    it(`${nome}: recusada como "validation", e a alteração válida depois dela é aplicada`, async () => {
      await naTransacao(async (c) => {
        const v = await criarViagem(c);
        const r = await enviar(c, v.org, [montar(v), alteracao('trip_item', 'PATCH', v.itemGrupo, { note: 'depois' })]);
        expect(r[0]).toMatchObject({ status: 'rejected', reason: 'validation' });
        expect(r[1]).toMatchObject({ status: 'applied' });
        expect((await linha<Item>(c, 'trip_item', v.itemGrupo))?.note).toBe('depois');
      });
    });
  }

  it('segunda família em viagem de família única: recusada como "validation"', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await c.query('update public.trip set is_group = false where id = $1', [v.trip]);
      await c.query('update public.trip_family set deleted_at = now() where id = $1', [v.familiaB]);
      const r = await enviar(c, v.org, [alteracao('trip_family', 'PUT', randomUUID(), { trip_id: v.trip, name: 'Outra' })]);
      expect(r[0]).toMatchObject({ status: 'rejected', reason: 'validation' });
    });
  });

  it('alteração sem change_id: recusada só ela', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, [{ table: 'trip_item', op: 'PATCH', id: v.itemGrupo, data: { qty: 7 } }, 42]);
      expect(r).toEqual([
        { change_id: null, status: 'rejected', reason: 'validation', detail: { column: 'change_id' } },
        { change_id: null, status: 'rejected', reason: 'validation', detail: { column: 'change_id' } },
      ]);
      expect(Number((await linha<Item>(c, 'trip_item', v.itemGrupo))?.qty)).toBe(1);
    });
  });

  it('o motivo da recusa não traz o valor enviado (registros sem texto livre)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const segredo = 'texto-livre-que-nao-pode-ir-para-registro';
      const ch = alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: segredo });
      const r = await enviar(c, v.org, [ch]);
      expect(JSON.stringify(r)).not.toContain(segredo);
      const registro = await c.query('select * from private.sync_change where change_id = $1', [ch.change_id]);
      expect(JSON.stringify(registro.rows)).not.toContain(segredo);
      expect(registro.rows[0]).toMatchObject({ status: 'rejected', reason: 'validation' });
    });
  });

  it('o lote inteiro só falha sem login, com mais de 500 alterações ou quando não é uma lista', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await entrarComo(c, v.org);
      expect((await tentar(c, 'select public.sync_apply($1::jsonb)', [JSON.stringify(Array(501).fill({}))])).erro).toBe('22023');
      expect((await tentar(c, 'select public.sync_apply($1::jsonb)', ['{"a":1}'])).erro).toBe('22023');
      await c.query("select set_config('request.jwt.claims', '{\"role\":\"authenticated\"}', true)");
      expect((await tentar(c, 'select public.sync_apply($1::jsonb)', ['[]'])).erro).toBe('28000');
      await entrarComo(c, null);
      expect((await tentar(c, 'select public.sync_apply($1::jsonb)', ['[]'])).erro).toBe('42501');
    });
  });
});

describe('J2: regras por viagem e por família escritas dentro da função', () => {
  it('item novo com a família de OUTRA família da viagem: recusado (o family_id do aparelho é conferido)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const id = randomUUID();
      const r = await enviar(c, v.b, [alteracao('trip_item', 'PUT', id, { trip_id: v.trip, family_id: v.familiaA, name: 'Intruso' })]);
      expect(r[0]).toMatchObject({ status: 'rejected', reason: 'not_allowed' });
      expect(await linha(c, 'trip_item', id)).toBeUndefined();
    });
  });

  it('item novo com família de outra viagem: recusado', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const w = await criarViagem(c);
      const r = await enviar(c, v.b, [alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, family_id: w.familiaB, name: 'X' })]);
      expect(r[0]?.status).toBe('rejected');
    });
  });

  it('item pessoal de outra família: não edita, não remove, não marca', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.b, [
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { qty: 5 }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { removed: 1 }),
        alteracao('trip_item', 'DELETE', v.itemFamiliaA),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { pack_state: 'in_car' }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(['not_allowed', 'not_allowed', 'not_allowed', 'not_allowed']);
      expect(await linha<Item>(c, 'trip_item', v.itemFamiliaA)).toMatchObject({ qty: '2', removed: false, deleted_at: null, pack_state: 'todo' });
    });
  });

  it('o próprio item pessoal: a família edita (inclusive o outro adulto da mesma família, E2-18)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.a2, [alteracao('trip_item', 'PATCH', v.itemFamiliaA, { qty: 5 })]);
      expect(r[0]?.status).toBe('applied');
    });
  });

  it('marcar "assumi" em nome de outra família: recusado; sem family_id, vale a família de quem marca', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.b, [
        alteracao('item_claim', 'PUT', randomUUID(), { item_id: v.itemGrupo, family_id: v.familiaA }),
        alteracao('item_claim', 'PUT', randomUUID(), { item_id: v.itemGrupo }),
      ]);
      expect(r[0]).toMatchObject({ status: 'rejected', reason: 'not_allowed' });
      expect(r[1]).toMatchObject({ status: 'applied', outcome: { claim: 'already_claimed' } });
    });
  });

  it('desfazer a marcação de outra família: recusado', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, [alteracao('item_claim', 'PATCH', v.claimB, { deleted_at: '2026-11-26T10:00:00Z' })]);
      expect(r[0]).toMatchObject({ status: 'rejected', reason: 'not_allowed' });
      expect((await linha<Item>(c, 'item_claim', v.claimB))?.deleted_at).toBeNull();
    });
  });

  it('assumir item pessoal de uma família não existe: recusado como inválido', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, [alteracao('item_claim', 'PUT', randomUUID(), { item_id: v.itemFamiliaA })]);
      expect(r[0]).toMatchObject({ status: 'rejected', reason: 'validation' });
    });
  });

  it('ninguém se muda para outra família (o que daria acesso aos itens pessoais dela)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.b, [
        // B reenvia a própria linha de membro com a família A
        alteracao('trip_member', 'PUT', randomUUID(), { trip_id: v.trip, profile_id: v.b, family_id: v.familiaA, display_name: 'Adulto B' }),
        // e tenta virar organizador do mesmo jeito
        alteracao('trip_member', 'PUT', randomUUID(), { trip_id: v.trip, profile_id: v.b, family_id: v.familiaB, role: 'organizer' }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(['not_allowed', 'not_allowed']);
      // nem o organizador muda a família de quem já tem uma, nem a própria
      const s = await enviar(c, v.org, [
        alteracao('trip_member', 'PATCH', v.membroB, { family_id: v.familiaA }),
        alteracao('trip_member', 'PATCH', v.membroOrg, { family_id: v.familiaB }),
      ]);
      expect(s.map((x) => x.reason)).toEqual(['not_allowed', 'not_allowed']);
      expect(await linha(c, 'trip_member', v.membroB)).toMatchObject({ family_id: v.familiaB, role: 'member' });
      await entrarComo(c, v.b);
      expect((await c.query('select count(*)::int as n from public.trip_item where id = $1', [v.itemFamiliaA])).rows[0]?.n).toBe(0);
    });
  });

  it('tirar uma família da viagem é só do organizador', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.b, [alteracao('trip_family', 'PATCH', v.familiaA, { deleted_at: '2026-01-01T00:00:00Z' }), alteracao('trip_family', 'DELETE', v.familiaA)]);
      expect(r.map((x) => x.reason)).toEqual(['not_allowed', 'not_allowed']);
      expect((await enviar(c, v.org, [alteracao('trip_family', 'DELETE', v.familiaB)]))[0]?.status).toBe('applied');
    });
  });

  it('trip_id e family_id não mudam depois de criados', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const w = await criarViagem(c);
      const r = await enviar(c, v.org, [
        alteracao('trip_item', 'PATCH', v.itemGrupo, { trip_id: w.trip }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { family_id: null }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(['validation', 'validation']);
    });
  });

  it('S10: quem foi removido da viagem tem tudo recusado, e o reenvio continua recusado', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await c.query('update public.trip_member set deleted_at = now() where trip_id = $1 and profile_id = $2', [v.trip, v.b]);
      const lote = [1, 2, 3].map((n) => alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: n }));
      expect((await enviar(c, v.b, lote)).map((x) => x.reason)).toEqual(['not_member', 'not_member', 'not_member']);
      expect((await enviar(c, v.b, lote)).map((x) => x.first_reason)).toEqual(['not_member', 'not_member', 'not_member']);
      expect(Number((await linha<Item>(c, 'trip_item', v.itemGrupo))?.qty)).toBe(1);
    });
  });
});

describe('regras de conflito da seção 4', () => {
  it('S3: in_car vence set_aside quando são concorrentes, nas duas ordens de chegada', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.b, [alteracao('trip_item', 'PATCH', v.itemGrupo, { pack_state: 'set_aside' }, { pack_state: 'todo' })]);
      const r = await enviar(c, v.org, [alteracao('trip_item', 'PATCH', v.itemGrupo, { pack_state: 'in_car' }, { pack_state: 'todo' })]);
      expect(r[0]?.outcome).toEqual({ pack_state: 'concurrent_won' });
      expect((await linha<Item>(c, 'trip_item', v.itemGrupo))?.pack_state).toBe('in_car');

      const w = await criarViagem(c);
      await enviar(c, w.org, [alteracao('trip_item', 'PATCH', w.itemGrupo, { pack_state: 'in_car' }, { pack_state: 'todo' })]);
      const s = await enviar(c, w.b, [alteracao('trip_item', 'PATCH', w.itemGrupo, { pack_state: 'set_aside' }, { pack_state: 'todo' })]);
      expect(s[0]?.outcome).toEqual({ pack_state: 'concurrent_lost' });
      expect((await linha<Item>(c, 'trip_item', w.itemGrupo))?.pack_state).toBe('in_car');
    });
  });

  it('desmarcar sobre o valor atual vale (não é concorrente)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.org, [alteracao('trip_item', 'PATCH', v.itemGrupo, { pack_state: 'in_car' }, { pack_state: 'todo' })]);
      await enviar(c, v.org, [alteracao('trip_item', 'PATCH', v.itemGrupo, { pack_state: 'todo' }, { pack_state: 'in_car' })]);
      expect((await linha<Item>(c, 'trip_item', v.itemGrupo))?.pack_state).toBe('todo');
    });
  });

  it('S4: remoção vence edição nas duas ordens, o valor editado fica e o item pode ser restaurado', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.org, [alteracao('trip_item', 'PATCH', v.itemGrupo, { removed: 1 })]);
      const r = await enviar(c, v.b, [alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: 4 })]);
      expect(r[0]?.outcome).toMatchObject({ edit_on_removed: true });
      expect(await linha<Item>(c, 'trip_item', v.itemGrupo)).toMatchObject({ removed: true, qty: '4' });
      await enviar(c, v.b, [alteracao('trip_item', 'PATCH', v.itemGrupo, { removed: 0 })]);
      expect((await linha<Item>(c, 'trip_item', v.itemGrupo))?.removed).toBe(false);

      const w = await criarViagem(c);
      await enviar(c, w.b, [alteracao('trip_item', 'PATCH', w.itemGrupo, { qty: 4 })]);
      await enviar(c, w.org, [alteracao('trip_item', 'PATCH', w.itemGrupo, { removed: true })]);
      expect(await linha<Item>(c, 'trip_item', w.itemGrupo)).toMatchObject({ removed: true, qty: '4' });
    });
  });

  it('remoção por deleted_at também vence; a linha inteira reenviada (PUT) não restaura', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.org, [alteracao('trip_item', 'DELETE', v.itemGrupo)]);
      await enviar(c, v.b, [alteracao('trip_item', 'PUT', v.itemGrupo, { trip_id: v.trip, name: 'Fogareiro', qty: 2, deleted_at: null, removed: 0 })]);
      expect((await linha<Item>(c, 'trip_item', v.itemGrupo))?.deleted_at).not.toBeNull();
      await enviar(c, v.b, [alteracao('trip_item', 'PATCH', v.itemGrupo, { deleted_at: null })]);
      expect((await linha<Item>(c, 'trip_item', v.itemGrupo))?.deleted_at).toBeNull();
    });
  });

  it('S5: dois itens novos com o mesmo nome ficam os dois', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.org, [alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'isqueiro' })]);
      await enviar(c, v.b, [alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'isqueiro' })]);
      const r = await c.query("select count(*)::int as n from public.trip_item where trip_id = $1 and name = 'isqueiro'", [v.trip]);
      expect(r.rows[0]?.n).toBe(2);
    });
  });

  it('quantidade, nome e nota: vale a última a chegar; em item do grupo, avisa o que foi sobrescrito', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.org, [alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: 2, note: 'do A' })]);
      const r = await enviar(c, v.b, [alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: 3, note: 'do B' })]);
      expect(r[0]?.outcome).toEqual({ overwritten: ['qty', 'note'] });
      expect(await linha<Item>(c, 'trip_item', v.itemGrupo)).toMatchObject({ qty: '3', note: 'do B', updated_by: v.b });
      const s = await enviar(c, v.a2, [alteracao('trip_item', 'PATCH', v.itemFamiliaA, { qty: 7 })]);
      expect(s[0]?.outcome).toBeUndefined();
    });
  });

  it('S2: duas famílias assumem o mesmo item e as duas marcações ficam', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, [alteracao('item_claim', 'PUT', randomUUID(), { item_id: v.itemGrupo, trip_id: v.trip })]);
      expect(r[0]?.status).toBe('applied');
      const n = await c.query('select family_id from public.item_claim where item_id = $1 and deleted_at is null order by family_id', [v.itemGrupo]);
      expect(n.rows.map((x) => x.family_id).sort()).toEqual([v.familiaA, v.familiaB].sort());
    });
  });

  it('S6: valor e regra do gasto quase juntos: as duas mudanças aplicadas, duas linhas no histórico', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const a = await enviar(c, v.org, [alteracao('expense', 'PATCH', v.gasto, { amount_cents: 42000 })]);
      const b = await enviar(c, v.org, [alteracao('expense', 'PATCH', v.gasto, { split_rule: 'per_family' })]);
      expect([a[0]?.status, b[0]?.status]).toEqual(['applied', 'applied']);
      expect(await linha(c, 'expense', v.gasto)).toMatchObject({ amount_cents: 42000, split_rule: 'per_family' });
      const h = await c.query('select field, old_value, new_value, actor_member_id from public.expense_audit where expense_id = $1 order by at, field', [v.gasto]);
      expect(h.rows).toEqual([
        { field: 'amount_cents', old_value: '10000', new_value: '42000', actor_member_id: v.membroOrg },
        { field: 'split_rule', old_value: 'shares', new_value: 'per_family', actor_member_id: v.membroOrg },
      ]);
    });
  });

  it('o relógio do aparelho não vale: updated_at, updated_by e deleted_at são do servidor', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.b, [alteracao('trip_item', 'PATCH', v.itemGrupo, { deleted_at: '1999-01-01T00:00:00Z', updated_at: '1999-01-01T00:00:00Z', updated_by: v.org })]);
      const r = await c.query('select deleted_at > now() - interval \'1 minute\' as recente, updated_by from public.trip_item where id = $1', [v.itemGrupo]);
      expect(r.rows[0]).toEqual({ recente: true, updated_by: v.b });
    });
  });
});

describe('viagem que sobe no primeiro login (E1-14, S9)', () => {
  it('viagem, família, pessoas e itens sobem com os mesmos identificadores; quem envia vira organizador', async () => {
    await naTransacao(async (c) => {
      const eu = await criarPessoa(c);
      const ids = { trip: randomUUID(), familia: randomUUID(), pessoa: randomUUID(), item: randomUUID(), membro: randomUUID() };
      const r = await enviar(c, eu, [
        alteracao('trip', 'PUT', ids.trip, { name: 'Feita sem conta', kind: 'tent_car', nights: 2, climate: 'cold', rain: 0, is_group: 0, camping_id: randomUUID(), owner_profile_id: randomUUID() }),
        alteracao('trip_family', 'PUT', ids.familia, { trip_id: ids.trip, name: 'Nós', pets: 1 }),
        alteracao('trip_member', 'PUT', ids.membro, { trip_id: ids.trip, family_id: ids.familia, display_name: 'Eu', role: 'organizer' }),
        alteracao('trip_person', 'PUT', ids.pessoa, { family_id: ids.familia, age_band: 'adult', trip_id: randomUUID() }),
        alteracao('trip_item', 'PUT', ids.item, { trip_id: ids.trip, family_id: ids.familia, name: 'Barraca', qty: 1, catalog_key: 'barraca', origin: 'generated' }),
      ]);
      expect(r.map((x) => x.status)).toEqual(['applied', 'applied', 'applied', 'applied', 'applied']);
      expect(await linha(c, 'trip', ids.trip)).toMatchObject({ owner_profile_id: eu, camping_id: null });
      const membros = await c.query('select profile_id, family_id, role, display_name from public.trip_member where trip_id = $1', [ids.trip]);
      expect(membros.rows).toEqual([{ profile_id: eu, family_id: ids.familia, role: 'organizer', display_name: 'Eu' }]);
      expect((await linha<{ trip_id: string }>(c, 'trip_person', ids.pessoa))?.trip_id).toBe(ids.trip);
      expect((await linha<Item>(c, 'trip_item', ids.item))?.family_id).toBe(ids.familia);
    });
  });

  it('a viagem de outra pessoa não é tomada por quem manda o mesmo identificador', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.fora, [alteracao('trip', 'PUT', v.trip, { name: 'Minha agora' })]);
      expect(r[0]).toMatchObject({ status: 'rejected', reason: 'not_member' });
      expect((await linha<{ owner_profile_id: string }>(c, 'trip', v.trip))?.owner_profile_id).toBe(v.org);
    });
  });
});

describe('campos e tabelas do servidor', () => {
  it('o destino da viagem não muda pela sincronização (só por trip_set_camping)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.org, [alteracao('trip', 'PATCH', v.trip, { camping_id: randomUUID(), name: 'Novo nome' })]);
      expect(await linha(c, 'trip', v.trip)).toMatchObject({ camping_id: null, name: 'Novo nome' });
    });
  });

  it('retrato do camping: o membro só marca "ciente", com o carimbo do servidor, e não muda o resto', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await c.query(`insert into public.city values ('3550308', 'Cidade de teste', 'SP')`);
      const camping = randomUUID();
      await c.query(`insert into public.camping (id, name, name_normalized, city_ibge_code) values ($1, 'Camping de teste', 'teste', '3550308')`, [camping]);
      await c.query(`insert into public.trip_camping_snapshot (trip_id, camping_id) values ($1, $2)`, [v.trip, camping]);
      const r = await enviar(c, v.b, [
        alteracao('trip_camping_snapshot', 'PATCH', v.trip, { rules_ack_at: JSON.stringify({ som: '1999-01-01T00:00:00Z' }) }),
        alteracao('trip_camping_snapshot', 'PATCH', v.trip, { alerts: '[]' }),
        alteracao('trip_camping_snapshot', 'PUT', v.trip, { camping_id: camping }),
      ]);
      expect(r.map((x) => x.reason ?? x.status)).toEqual(['applied', 'not_allowed', 'not_allowed']);
      const s = await linha<{ rules_ack_at: Record<string, string> }>(c, 'trip_camping_snapshot', v.trip, 'trip_id');
      expect(Object.keys(s?.rules_ack_at ?? {})).toEqual(['som']);
      expect(s?.rules_ack_at.som).not.toContain('1999');
    });
  });

  it('o aparelho não escreve histórico de gasto, convite nem chave Pix pela sincronização', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, [
        alteracao('expense_audit', 'PUT', randomUUID(), { expense_id: v.gasto, field: 'amount_cents' }),
        alteracao('invite', 'PUT', randomUUID(), { trip_id: v.trip }),
        alteracao('pix_key', 'PUT', v.org, { key: 'x', key_type: 'y' }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(['not_allowed', 'not_allowed', 'not_allowed']);
      await voltarAoDono(c);
    });
  });
});

describe('campos pedidos pela B3 (docs/regras.md da B3, seção 6)', () => {
  it('referência estável do item: regra da B3 quando o aparelho não manda, única entre os itens vivos, e não muda', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const gerado = randomUUID();
      const r = await enviar(c, v.a2, [
        alteracao('trip_item', 'PUT', gerado, { trip_id: v.trip, family_id: v.familiaA, name: 'Gás', catalog_key: 'gas', origin: 'generated', qty: 2 }),
        alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, family_id: v.familiaA, name: 'Gás de novo', item_ref: `gas@${v.familiaA}` }),
        alteracao('trip_item', 'PATCH', gerado, { item_ref: 'outra' }),
      ]);
      expect(r.map((x) => x.reason ?? x.status)).toEqual(['applied', 'validation', 'validation']);
      expect((await linha<{ item_ref: string }>(c, 'trip_item', gerado))?.item_ref).toBe(`gas@${v.familiaA}`);
      expect((await linha<{ item_ref: string }>(c, 'trip_item', v.itemGrupo))?.item_ref).toBe(v.itemGrupo);
    });
  });

  it('quantidade editada, por pessoa, quantidade secundária e marca do aprendizado sobem e são conferidas', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, [
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, {
          qty: 4, qty_edited: 1, qty_per_person: 2, detail_qty: 36, detail_unit: 'litro',
          learning_kind: 'reduced', learning_qty_before: 8, learning_percent: 25, unit: 'galao_5l', category: 'comida_bebida',
        }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { detail_unit: null }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { learning_kind: 'flagged' }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { unit: 'balde' }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { category: 'outra' }),
        alteracao('trip_item', 'PATCH', v.itemFamiliaA, { learning_percent: 100 }),
      ]);
      expect(r.map((x) => x.reason ?? x.status)).toEqual(['applied', 'validation', 'validation', 'validation', 'validation', 'validation']);
      expect(await linha(c, 'trip_item', v.itemFamiliaA)).toMatchObject({
        qty_edited: true, qty_per_person: 2, detail_qty: 36, detail_unit: 'litro', learning_kind: 'reduced', learning_qty_before: 8, learning_percent: 25,
      });
    });
  });

  it('viagem: destino sem camping e data de criação do aparelho (nunca no futuro)', async () => {
    await naTransacao(async (c) => {
      const eu = await criarPessoa(c);
      const antiga = randomUUID();
      const futura = randomUUID();
      await enviar(c, eu, [
        alteracao('trip', 'PUT', antiga, { name: 'A', destination_name: 'Praia', created_at: '2026-11-01T12:00:00Z' }),
        alteracao('trip', 'PUT', futura, { name: 'B', created_at: '2999-01-01T00:00:00Z' }),
      ]);
      expect(await linha(c, 'trip', antiga)).toMatchObject({ destination_name: 'Praia', created_at: new Date('2026-11-01T12:00:00Z') });
      const r = await c.query('select created_at <= now() as ok from public.trip where id = $1', [futura]);
      expect(r.rows[0]?.ok).toBe(true);
    });
  });

  it('retrato: o membro grava os ajustes desfeitos (A6); lista inválida é recusada', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await c.query(`insert into public.city values ('3550308', 'Cidade de teste', 'SP')`);
      const camping = randomUUID();
      await c.query(`insert into public.camping (id, name, name_normalized, city_ibge_code) values ($1, 'C', 'c', '3550308')`, [camping]);
      await c.query(`insert into public.trip_camping_snapshot (trip_id, camping_id) values ($1, $2)`, [v.trip, camping]);
      const r = await enviar(c, v.b, [
        alteracao('trip_camping_snapshot', 'PATCH', v.trip, { undone_adjustment_ids: JSON.stringify(['energia_tomada:longe:entra:extensao']) }),
        alteracao('trip_camping_snapshot', 'PATCH', v.trip, { undone_adjustment_ids: [1, 2] }),
      ]);
      expect(r.map((x) => x.reason ?? x.status)).toEqual(['applied', 'validation']);
      expect((await linha<{ undone_adjustment_ids: string[] }>(c, 'trip_camping_snapshot', v.trip, 'trip_id'))?.undone_adjustment_ids).toEqual([
        'energia_tomada:longe:entra:extensao',
      ]);
    });
  });
});
