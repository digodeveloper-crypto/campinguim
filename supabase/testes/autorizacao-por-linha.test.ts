// Grupo 3 (NF-10; SPEC, seção 11, "Autorização"): cada linha da tabela de autorização tem teste
// que tenta o acesso indevido e espera recusa, pelos dois caminhos que o app tem: a leitura direta
// pela API (RLS) e a escrita pela sincronização (public.sync_apply). A escrita direta pela API é
// sempre recusada nas tabelas sincronizadas (só a função escreve). Cada linha tem também um
// controle: quem tem direito consegue, para a recusa não passar por acaso.
import { randomUUID } from 'node:crypto';

import type pg from 'pg';
import { describe, expect, it } from 'vitest';

import { alteracao, criarViagem, enviar, entrarComo, naTransacao, tentar, voltarAoDono } from './apoio-banco';

async function contar(c: pg.Client, tabela: string, coluna: string, valor: string): Promise<number> {
  const r = await c.query(`select count(*)::int as n from public.${tabela} where ${coluna} = $1`, [valor]);
  return r.rows[0]?.n as number;
}

const VIAGEM = ['trip', 'trip_family', 'trip_person', 'trip_member', 'trip_item', 'item_claim', 'trip_camping_snapshot'];
const GASTOS = ['expense', 'expense_exclusion', 'expense_payment', 'expense_audit'];
const CAMPINGS = ['city', 'camping', 'camping_alias', 'fact_report', 'fact_summary', 'suggestion', 'list_feedback', 'invite'];
const INTERNAS = ['event', 'config', 'merge_candidate', 'device'];

describe('linha 1: viagem, famílias, pessoas e itens (lê e escreve: membros; dados da viagem e remoção de membro: organizador)', () => {
  it('quem não é membro não lê nada da viagem', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await entrarComo(c, v.fora);
      for (const t of VIAGEM) expect(await contar(c, t, t === 'trip' ? 'id' : 'trip_id', v.trip), t).toBe(0);
      // controle: o membro lê
      await entrarComo(c, v.b);
      for (const t of VIAGEM.filter((x) => x !== 'trip_camping_snapshot')) {
        expect(await contar(c, t, t === 'trip' ? 'id' : 'trip_id', v.trip), t).toBeGreaterThan(0);
      }
    });
  });

  it('sem login, nenhuma leitura: permissão negada', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await entrarComo(c, null);
      for (const t of VIAGEM) expect((await tentar(c, `select * from public.${t}`)).erro, t).toBe('42501');
      await voltarAoDono(c);
      expect(v.trip).toBeTruthy();
    });
  });

  it('quem não é membro não escreve: viagem, família, pessoa, membro, item e marcação recusados', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.fora, [
        alteracao('trip', 'PATCH', v.trip, { name: 'Invadida' }),
        alteracao('trip_family', 'PUT', randomUUID(), { trip_id: v.trip, name: 'Intrusos' }),
        alteracao('trip_family', 'PATCH', v.familiaA, { pets: 9 }),
        alteracao('trip_person', 'PUT', randomUUID(), { family_id: v.familiaA, age_band: 'adult' }),
        alteracao('trip_person', 'PATCH', v.pessoaA, { age_band: 'toddler' }),
        alteracao('trip_member', 'PUT', randomUUID(), { trip_id: v.trip, display_name: 'Eu entro' }),
        alteracao('trip_member', 'PATCH', v.membroB, { deleted_at: '2026-01-01T00:00:00Z' }),
        alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'Item intruso' }),
        alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: 99 }),
        alteracao('item_claim', 'PUT', randomUUID(), { item_id: v.itemGrupo }),
        alteracao('item_claim', 'PATCH', v.claimB, { deleted_at: '2026-01-01T00:00:00Z' }),
        alteracao('trip_camping_snapshot', 'PATCH', v.trip, { rules_ack_at: '{"som":"x"}' }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(Array(12).fill('not_member'));
      await voltarAoDono(c);
      expect(await contar(c, 'trip_family', 'trip_id', v.trip)).toBe(2);
      expect(await contar(c, 'trip_member', 'trip_id', v.trip)).toBe(3);
    });
  });

  it('membro que não é organizador não muda os dados da viagem nem remove membro', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.b, [
        alteracao('trip', 'PATCH', v.trip, { name: 'Outro nome', start_date: '2026-12-01' }),
        alteracao('trip', 'DELETE', v.trip),
        alteracao('trip_member', 'PATCH', v.membroOrg, { deleted_at: '2026-01-01T00:00:00Z' }),
        alteracao('trip_member', 'PATCH', v.membroB, { role: 'organizer' }),
        alteracao('trip_family', 'PATCH', v.familiaB, { is_organizer: true }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(Array(5).fill('not_allowed'));
      // controle: o organizador consegue
      const s = await enviar(c, v.org, [
        alteracao('trip', 'PATCH', v.trip, { name: 'Outro nome' }),
        alteracao('trip_member', 'PATCH', v.membroB, { deleted_at: '2026-01-01T00:00:00Z' }),
      ]);
      expect(s.map((x) => x.status)).toEqual(['applied', 'applied']);
    });
  });

  it('membro escreve família, pessoa e item do grupo (controle da linha)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.b, [
        alteracao('trip_family', 'PATCH', v.familiaB, { pets: 2 }),
        alteracao('trip_person', 'PUT', randomUUID(), { family_id: v.familiaB, age_band: 'child' }),
        alteracao('trip_item', 'PATCH', v.itemGrupo, { qty: 2 }),
        alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'Lona' }),
      ]);
      expect(r.map((x) => x.status)).toEqual(['applied', 'applied', 'applied', 'applied']);
    });
  });

  it('escrita direta pela API (fora da função) é recusada, mesmo para o organizador', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await entrarComo(c, v.org);
      expect((await tentar(c, 'update public.trip set name = $2 where id = $1', [v.trip, 'x'])).erro).toBe('42501');
      expect((await tentar(c, 'update public.trip_item set qty = 9 where id = $1', [v.itemGrupo])).erro).toBe('42501');
      expect((await tentar(c, 'insert into public.trip_family (trip_id) values ($1)', [v.trip])).erro).toBe('42501');
      expect((await tentar(c, 'delete from public.trip_member where trip_id = $1', [v.trip])).erro).toBe('42501');
      expect((await tentar(c, 'insert into public.trip_person (trip_id, family_id, age_band) values ($1, $2, $3)', [v.trip, v.familiaA, 'adult'])).erro).toBe('42501');
      expect((await tentar(c, 'delete from public.item_claim where id = $1', [v.claimB])).erro).toBe('42501');
      expect((await tentar(c, 'update public.profile set display_name = $2 where id = $1', [v.org, 'x'])).erro).toBe('42501');
    });
  });

  it('perfil: cada pessoa lê e muda só o próprio', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await entrarComo(c, v.b);
      expect(await contar(c, 'profile', 'id', v.org)).toBe(0);
      expect(await contar(c, 'profile', 'id', v.b)).toBe(1);
      const r = await enviar(c, v.b, [
        alteracao('profile', 'PATCH', v.org, { display_name: 'Trocado' }),
        alteracao('profile', 'PATCH', v.b, { display_name: 'Meu nome' }),
      ]);
      expect(r.map((x) => x.reason ?? x.status)).toEqual(['not_allowed', 'applied']);
    });
  });
});

describe('linha 2: itens pessoais de uma família (lê e escreve: membros daquela família)', () => {
  it('membro de outra família da mesma viagem não lê nem escreve o item pessoal', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await entrarComo(c, v.b);
      expect(await contar(c, 'trip_item', 'id', v.itemFamiliaA)).toBe(0);
      expect(await contar(c, 'trip_item', 'id', v.itemFamiliaB)).toBe(1);
      // nem o organizador, se é de outra família
      await entrarComo(c, v.org);
      expect(await contar(c, 'trip_item', 'id', v.itemFamiliaB)).toBe(0);
      const r = await enviar(c, v.org, [
        alteracao('trip_item', 'PATCH', v.itemFamiliaB, { qty: 1 }),
        alteracao('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, family_id: v.familiaB, name: 'Posto pelo outro' }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(['not_allowed', 'not_allowed']);
      // controle: o outro adulto da família A lê e escreve o item da família A
      await entrarComo(c, v.a2);
      expect(await contar(c, 'trip_item', 'id', v.itemFamiliaA)).toBe(1);
      expect((await enviar(c, v.a2, [alteracao('trip_item', 'PATCH', v.itemFamiliaA, { pack_state: 'in_car' })]))[0]?.status).toBe('applied');
    });
  });
});

describe('linha 3: gastos (lê: membros da viagem; escreve: comprador e organizador)', () => {
  it('quem não é membro não lê gastos, exclusões, pagamentos nem histórico', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await enviar(c, v.org, [alteracao('expense', 'PATCH', v.gasto, { amount_cents: 20000 })]);
      await entrarComo(c, v.fora);
      for (const t of GASTOS) expect(await contar(c, t, 'trip_id', v.trip), t).toBe(0);
      await entrarComo(c, v.b);
      expect(await contar(c, 'expense', 'trip_id', v.trip)).toBe(1);
      expect(await contar(c, 'expense_audit', 'trip_id', v.trip)).toBe(1);
    });
  });

  it('membro que não é comprador nem organizador não muda valor, regra nem participantes', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.b, [
        alteracao('expense', 'PATCH', v.gasto, { amount_cents: 1 }),
        alteracao('expense', 'PATCH', v.gasto, { split_rule: 'per_family' }),
        alteracao('expense', 'DELETE', v.gasto),
        alteracao('expense', 'PUT', randomUUID(), { trip_id: v.trip, item_id: v.itemGrupo, buyer_family_id: v.familiaA, amount_cents: 5 }),
        alteracao('expense_exclusion', 'PUT', randomUUID(), { expense_id: v.gasto, person_id: v.pessoaB }),
      ]);
      expect(r.map((x) => x.reason)).toEqual(Array(5).fill('not_allowed'));
      // controle: o comprador (outro adulto da família A) muda o valor
      expect((await enviar(c, v.a2, [alteracao('expense', 'PATCH', v.gasto, { amount_cents: 15000 })]))[0]?.status).toBe('applied');
    });
  });

  it('"paguei" só pela família devedora: ninguém marca pela família dos outros', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, [
        alteracao('expense_payment', 'PUT', randomUUID(), { expense_id: v.gasto, family_id: v.familiaB, paid_marked_at: '2026-11-26T10:00:00Z' }),
      ]);
      expect(r[0]?.reason).toBe('not_allowed');
      const s = await enviar(c, v.b, [
        alteracao('expense_payment', 'PUT', randomUUID(), { expense_id: v.gasto, family_id: v.familiaB, paid_marked_at: '1999-01-01T00:00:00Z' }),
      ]);
      expect(s[0]?.status).toBe('applied');
      await voltarAoDono(c);
      const p = await c.query('select paid_marked_at > now() - interval \'1 minute\' as do_servidor from public.expense_payment where expense_id = $1', [v.gasto]);
      expect(p.rows).toEqual([{ do_servidor: true }]);
    });
  });

  it('escrita direta pela API em gastos é recusada', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await entrarComo(c, v.org);
      for (const sql of [
        'update public.expense set amount_cents = 1 where id = $1',
        'delete from public.expense_audit where expense_id = $1',
        'insert into public.expense_payment (trip_id, expense_id, family_id) select trip_id, id, buyer_family_id from public.expense where id = $1',
        'insert into public.expense_audit (trip_id, expense_id, field) select trip_id, id, \'amount_cents\' from public.expense where id = $1',
      ]) {
        expect((await tentar(c, sql, [v.gasto])).erro, sql).toBe('42501');
      }
    });
  });
});

describe('linha 4: chave Pix (lê: membros logados de viagem em que o dono é comprador; escreve: o dono)', () => {
  it('quem não divide viagem com o comprador não lê a chave; o membro da viagem lê (PRV-06)', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await c.query(`insert into public.pix_key (profile_id, key, key_type) values ($1, 'chave-do-org@example.com', 'e-mail'), ($2, 'chave-do-b@example.com', 'e-mail')`, [v.org, v.b]);
      await entrarComo(c, v.fora);
      expect(await contar(c, 'pix_key', 'profile_id', v.org)).toBe(0);
      // B não é comprador em nenhuma viagem: ninguém além dele lê a chave dele
      await entrarComo(c, v.org);
      expect(await contar(c, 'pix_key', 'profile_id', v.b)).toBe(0);
      // controle: B divide a viagem em que a família do org comprou
      await entrarComo(c, v.b);
      expect(await contar(c, 'pix_key', 'profile_id', v.org)).toBe(1);
      // membro removido deixa de ler
      await voltarAoDono(c);
      await c.query('update public.trip_member set deleted_at = now() where trip_id = $1 and profile_id = $2', [v.trip, v.b]);
      await entrarComo(c, v.b);
      expect(await contar(c, 'pix_key', 'profile_id', v.org)).toBe(0);
      await entrarComo(c, null);
      expect((await tentar(c, 'select * from public.pix_key')).erro).toBe('42501');
    });
  });

  it('ninguém cria, muda ou apaga a chave de outra pessoa; o dono consegue', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      await c.query(`insert into public.pix_key (profile_id, key, key_type) values ($1, 'chave-do-org@example.com', 'e-mail')`, [v.org]);
      await entrarComo(c, v.b);
      expect((await tentar(c, `insert into public.pix_key (profile_id, key, key_type) values ($1, 'x', 'y')`, [v.a2])).erro).toBe('42501');
      expect(await tentar(c, `update public.pix_key set key = 'roubada' where profile_id = $1`, [v.org])).toEqual({ erro: null, linhas: 0 });
      expect(await tentar(c, 'delete from public.pix_key where profile_id = $1', [v.org])).toEqual({ erro: null, linhas: 0 });
      await entrarComo(c, v.org);
      expect(await tentar(c, `update public.pix_key set key = 'nova@example.com' where profile_id = $1`, [v.org])).toEqual({ erro: null, linhas: 1 });
    });
  });
});

describe('linha 5: campings, relatos, resumos e sugestões (ninguém diretamente; só as funções da seção 8)', () => {
  it('nem com login nem sem login: ler ou escrever direto é recusado', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      for (const uid of [v.org, null]) {
        await entrarComo(c, uid);
        for (const t of CAMPINGS) {
          expect((await tentar(c, `select * from public.${t} limit 1`)).erro, `${t} select`).toBe('42501');
          expect((await tentar(c, `delete from public.${t}`)).erro, `${t} delete`).toBe('42501');
        }
        expect((await tentar(c, `insert into public.city values ('3550308', 'x', 'SP')`)).erro).toBe('42501');
        expect((await tentar(c, `insert into public.fact_report (camping_id, fact_key, value, visited_month) values (gen_random_uuid(), 'pet', 'x', '2026-11-01')`)).erro).toBe('42501');
      }
    });
  });

  it('a sincronização não aceita escrita nessas tabelas', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      const r = await enviar(c, v.org, CAMPINGS.map((t) => alteracao(t, 'PUT', randomUUID(), { trip_id: v.trip })));
      expect(r.every((x) => x.status === 'rejected')).toBe(true);
    });
  });
});

describe('linha 6: eventos, config e fila de fusão (só operação interna)', () => {
  it('nem com login nem sem login: ler ou escrever direto é recusado', async () => {
    await naTransacao(async (c) => {
      const v = await criarViagem(c);
      for (const uid of [v.org, null]) {
        await entrarComo(c, uid);
        for (const t of INTERNAS) {
          expect((await tentar(c, `select * from public.${t} limit 1`)).erro, `${t} select`).toBe('42501');
          expect((await tentar(c, `delete from public.${t}`)).erro, `${t} delete`).toBe('42501');
        }
        expect((await tentar(c, `insert into public.event (name, at) values ('app_opened', now())`)).erro).toBe('42501');
        expect((await tentar(c, `update public.config set value = '0'`)).erro).toBe('42501');
        for (const t of ['private.sync_change', 'private.server_setting']) {
          expect((await tentar(c, `select * from ${t} limit 1`)).erro, t).toBe('42501');
        }
      }
    });
  });
});
