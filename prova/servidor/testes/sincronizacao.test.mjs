// F0-2 · Regras de conflito no servidor (SPEC, seção 4) e segunda barreira (seção 11).
// Chama `sync_apply` como o app chama (API pública, login de cada pessoa), com alterações montadas
// à mão. Cada teste cria a sua própria viagem de grupo com duas pessoas (pela chave de serviço
// local). Para não misturar com a viagem de A e B dos outros testes, aqui "A" é a pessoa de teste
// D e "B" é a E; C é a mesma pessoa de fora.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, describe, test } from 'node:test';

import { createClient } from '@supabase/supabase-js';

import { ENDERECOS_PROVA, FAMILIAS, lerEnvLocal, USUARIOS, VIAGEM_AB, VIAGEM_C } from '../scripts/comum.mjs';

const env = lerEnvLocal();
const clientes = {};
const usuarios = {};
const PAPEL = { A: 'D', B: 'E', C: 'C' };
const admin = createClient(env.SUPABASE_URL_LOCAL, env.SUPABASE_CHAVE_SERVICO, {
  auth: { persistSession: false, autoRefreshToken: false },
});

before(async () => {
  for (const chave of ['D', 'E', 'C']) {
    const cliente = createClient(env.SUPABASE_URL_LOCAL, env.SUPABASE_CHAVE_PUBLICA, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await cliente.auth.signInWithPassword({
      email: USUARIOS[chave].email,
      password: env[`SENHA_TESTE_${chave}`],
    });
    assert.equal(error, null, `login de ${chave}`);
    const papel = Object.keys(PAPEL).find((k) => PAPEL[k] === chave);
    clientes[papel] = cliente;
    usuarios[papel] = data.user.id;
  }
});

after(async () => {
  for (const papel of ['A', 'B', 'C']) await clientes[papel]?.auth.signOut();
});

async function criarViagem() {
  const trip = randomUUID();
  const item = randomUUID();
  const itemFamilia = randomUUID();
  const r1 = await admin.from('trip').insert({ id: trip, owner_profile_id: usuarios.A, name: 'Teste F0-2', is_group: true });
  assert.equal(r1.error, null);
  const r2 = await admin.from('trip_member').insert([
    { trip_id: trip, profile_id: usuarios.A, family_id: FAMILIAS.D, display_name: 'Pessoa D', role: 'organizer' },
    { trip_id: trip, profile_id: usuarios.B, family_id: FAMILIAS.E, display_name: 'Pessoa E', role: 'member' },
  ]);
  assert.equal(r2.error, null);
  const r3 = await admin.from('trip_item').insert([
    { id: item, trip_id: trip, name: 'Fogareiro', qty: 1 },
    { id: itemFamilia, trip_id: trip, family_id: FAMILIAS.D, name: 'Toalha', qty: 1 },
  ]);
  assert.equal(r3.error, null);
  return { trip, item, itemFamilia };
}

function mudanca(table, op, id, data, prev) {
  return { change_id: randomUUID(), table, op, id, data, ...(prev ? { prev } : {}) };
}

async function enviar(pessoa, mudancas) {
  const { data, error } = await clientes[pessoa].rpc('sync_apply', { p_changes: mudancas });
  assert.equal(error, null, `sync_apply de ${pessoa}: ${error?.message}`);
  return data;
}

async function item(id) {
  const { data, error } = await admin.from('trip_item').select('*').eq('id', id).single();
  assert.equal(error, null);
  return data;
}

async function historico(id) {
  const { data, error } = await admin
    .from('trip_item_history')
    .select('field, old_value, new_value, changed_by')
    .eq('item_id', id)
    .order('created_at');
  assert.equal(error, null);
  return data;
}

describe('princípio 2: repetição é ignorada', () => {
  test('o mesmo change_id enviado duas vezes é aplicado uma vez só', async () => {
    const v = await criarViagem();
    const m = mudanca('trip_item', 'PATCH', v.item, { qty: 3 }, { pack_state: 'todo' });
    assert.equal((await enviar('A', [m]))[0].status, 'applied');
    const repetido = await enviar('A', [m, m]);
    assert.deepEqual(repetido.map((r) => r.status), ['duplicate', 'duplicate']);
    assert.equal(Number((await item(v.item)).qty), 3);
    assert.equal((await historico(v.item)).length, 1, 'uma linha de histórico, não duas');
  });

  test('item novo reenviado não duplica', async () => {
    const v = await criarViagem();
    const id = randomUUID();
    const m = mudanca('trip_item', 'PUT', id, { trip_id: v.trip, name: 'Isqueiro', qty: 1 });
    await enviar('A', [m]);
    await enviar('A', [m]);
    const { data } = await admin.from('trip_item').select('id').eq('trip_id', v.trip).eq('name', 'Isqueiro');
    assert.equal(data.length, 1);
  });
});

describe('S10: quem não é membro ativo tem a alteração recusada', () => {
  test('C não altera item da viagem de A e B', async () => {
    const v = await criarViagem();
    const r = await enviar('C', [mudanca('trip_item', 'PATCH', v.item, { qty: 99 })]);
    assert.equal(r[0].status, 'rejected');
    assert.equal(r[0].reason, 'not_member');
    assert.equal(Number((await item(v.item)).qty), 1);
  });

  test('B removido da viagem: 5 alterações recusadas, reenvio continua recusado', async () => {
    const v = await criarViagem();
    await admin.from('trip_member').update({ deleted_at: new Date().toISOString() }).eq('trip_id', v.trip).eq('profile_id', usuarios.B);
    const lote = [1, 2, 3, 4, 5].map((n) => mudanca('trip_item', 'PATCH', v.item, { qty: n }));
    const r = await enviar('B', lote);
    assert.deepEqual(r.map((x) => x.reason), Array(5).fill('not_member'));
    const de_novo = await enviar('B', lote);
    assert.deepEqual(de_novo.map((x) => x.first_status), Array(5).fill('rejected'));
    assert.equal(Number((await item(v.item)).qty), 1);
  });

  test('escrita direta em trip_item pela API é recusada (só pela função)', async () => {
    const v = await criarViagem();
    const { error } = await clientes.A.from('trip_item').update({ qty: 50 }).eq('id', v.item);
    assert.ok(error);
    assert.equal(error.code, '42501');
  });
});

describe('S3: pack_state mais avançado vence quando é concorrente', () => {
  test('B (online) marca set_aside, depois chega A (offline) com in_car: in_car', async () => {
    const v = await criarViagem();
    await enviar('B', [mudanca('trip_item', 'PATCH', v.item, { pack_state: 'set_aside' }, { pack_state: 'todo' })]);
    await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { pack_state: 'in_car' }, { pack_state: 'todo' })]);
    assert.equal((await item(v.item)).pack_state, 'in_car');
  });

  test('ordem inversa: in_car chega antes, set_aside concorrente depois: in_car', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { pack_state: 'in_car' }, { pack_state: 'todo' })]);
    await enviar('B', [mudanca('trip_item', 'PATCH', v.item, { pack_state: 'set_aside' }, { pack_state: 'todo' })]);
    assert.equal((await item(v.item)).pack_state, 'in_car');
  });

  test('desmarcar sobre o valor atual (não concorrente) é aplicado', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { pack_state: 'in_car' }, { pack_state: 'todo' })]);
    await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { pack_state: 'todo' }, { pack_state: 'in_car' })]);
    assert.equal((await item(v.item)).pack_state, 'todo');
  });
});

describe('S2: duas famílias assumem o mesmo item do grupo', () => {
  test('duas linhas em item_claim, cada uma com a família de quem enviou', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('item_claim', 'PUT', randomUUID(), { trip_id: v.trip, item_id: v.item, family_id: FAMILIAS.D })]);
    // B tenta mandar a família de A: o servidor usa a família de B.
    await enviar('B', [mudanca('item_claim', 'PUT', randomUUID(), { trip_id: v.trip, item_id: v.item, family_id: FAMILIAS.D })]);
    const { data } = await admin.from('item_claim').select('family_id').eq('item_id', v.item);
    assert.deepEqual(data.map((c) => c.family_id).sort(), [FAMILIAS.D, FAMILIAS.E].sort());
  });
});

describe('quantidade, nome e nota: vale a última a chegar', () => {
  test('item do grupo: o valor perdido fica no histórico', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { qty: 4 })]);
    await enviar('B', [mudanca('trip_item', 'PATCH', v.item, { qty: 7 })]);
    assert.equal(Number((await item(v.item)).qty), 7);
    const h = await historico(v.item);
    assert.deepEqual(
      h.map((x) => [x.field, x.old_value, x.new_value]),
      [
        ['qty', '1', '4'],
        ['qty', '4', '7'],
      ],
    );
    assert.deepEqual(h.map((x) => x.changed_by), [usuarios.A, usuarios.B]);
  });

  test('item de uma família: vale o último, sem histórico', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('trip_item', 'PATCH', v.itemFamilia, { name: 'Toalha grande' })]);
    await enviar('B', [mudanca('trip_item', 'PATCH', v.itemFamilia, { name: 'Toalha azul' })]);
    assert.equal((await item(v.itemFamilia)).name, 'Toalha azul');
    assert.equal((await historico(v.itemFamilia)).length, 0);
  });
});

describe('S4: remoção vence edição, e o item pode ser restaurado', () => {
  for (const ordem of ['remove-primeiro', 'edita-primeiro']) {
    test(`ordem de chegada: ${ordem}`, async () => {
      const v = await criarViagem();
      const remover = mudanca('trip_item', 'PATCH', v.item, { deleted_at: '2020-01-01T00:00:00Z' });
      const editar = mudanca('trip_item', 'PATCH', v.item, { qty: 5 });
      if (ordem === 'remove-primeiro') {
        await enviar('A', [remover]);
        await enviar('B', [editar]);
      } else {
        await enviar('B', [editar]);
        await enviar('A', [remover]);
      }
      const depois = await item(v.item);
      assert.ok(depois.deleted_at, 'continua removido');
      assert.notEqual(depois.deleted_at.slice(0, 4), '2020', 'a hora da remoção é do servidor, não do aparelho');
      assert.equal(Number(depois.qty), 5, 'a edição fica guardada para quando restaurar');
      await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { deleted_at: null })]);
      assert.equal((await item(v.item)).deleted_at, null, 'restaurado');
    });
  }
});

describe('S5: dois itens novos com o mesmo nome ficam os dois', () => {
  test('A e B criam "isqueiro"', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'isqueiro', qty: 1 })]);
    await enviar('B', [mudanca('trip_item', 'PUT', randomUUID(), { trip_id: v.trip, name: 'isqueiro', qty: 1 })]);
    const { data } = await admin.from('trip_item').select('id').eq('trip_id', v.trip).eq('name', 'isqueiro');
    assert.equal(data.length, 2);
  });
});

describe('S9: viagem criada no aparelho sobe com o mesmo identificador', () => {
  test('A envia a viagem e os itens; vira dona e organizadora', async () => {
    const trip = randomUUID();
    const it = randomUUID();
    const r = await enviar('A', [
      mudanca('trip', 'PUT', trip, { name: 'Feita sem conta', owner_profile_id: null, is_group: 0 }),
      mudanca('trip_item', 'PUT', it, { trip_id: trip, name: 'Barraca', qty: 1, pack_state: 'set_aside' }),
    ]);
    assert.deepEqual(r.map((x) => x.status), ['applied', 'applied']);
    const { data: t } = await admin.from('trip').select('owner_profile_id').eq('id', trip).single();
    assert.equal(t.owner_profile_id, usuarios.A);
    assert.equal((await item(it)).pack_state, 'set_aside');
  });
});

describe('o relógio do aparelho não decide', () => {
  test('updated_at é do servidor, mesmo com relógio do aparelho errado', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { qty: 2, updated_at: '2099-01-01T00:00:00Z' })]);
    const depois = await item(v.item);
    assert.notEqual(depois.updated_at.slice(0, 4), '2099');
    assert.equal(depois.updated_by, usuarios.A);
  });
});

// Segunda barreira (SPEC, seção 11): o serviço de sincronização lê o banco sem RLS; as regras de
// sincronização é que impedem C de receber a viagem de A e B.
async function lerSincronizacao(pessoa) {
  const { data } = await clientes[pessoa].auth.getSession();
  const resposta = await fetch(`http://127.0.0.1:${ENDERECOS_PROVA.portaSincronizacao}/sync/stream`, {
    method: 'POST',
    headers: { authorization: `Token ${data.session.access_token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      buckets: [],
      include_checksum: true,
      raw_data: true,
      client_id: `teste-${pessoa}`,
      streams: { include_defaults: true, subscriptions: [] },
    }),
  });
  assert.equal(resposta.status, 200);
  const leitor = resposta.body.getReader();
  let texto = '';
  const limite = Date.now() + 15_000;
  while (!texto.includes('checkpoint_complete') && Date.now() < limite) {
    const { value, done } = await leitor.read();
    if (done) break;
    texto += new TextDecoder().decode(value);
  }
  await leitor.cancel();
  assert.ok(texto.includes('checkpoint_complete'), 'a sincronização terminou o primeiro ciclo');
  const linhas = [];
  for (const l of texto.split('\n').filter(Boolean)) {
    const m = JSON.parse(l);
    for (const op of m.data?.data ?? []) {
      if (op.op === 'PUT') linhas.push({ tabela: op.object_type, ...JSON.parse(op.data) });
    }
  }
  return linhas;
}

describe('segunda barreira: C não recebe nada da viagem de A e B pela sincronização', () => {
  test('C recebe só a própria viagem', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('item_claim', 'PUT', randomUUID(), { trip_id: v.trip, item_id: v.item })]);
    await enviar('A', [mudanca('trip_item', 'PATCH', v.item, { qty: 2 })]);
    await new Promise((r) => setTimeout(r, 1500));
    const deC = await lerSincronizacao('C');
    const viagensDeC = new Set(deC.map((l) => (l.tabela === 'trip' ? l.id : l.trip_id)));
    assert.deepEqual([...viagensDeC], [VIAGEM_C]);
    assert.ok(!deC.some((l) => l.trip_id === VIAGEM_AB || l.trip_id === v.trip || l.id === VIAGEM_AB));
  });

  test('controle: A recebe a viagem de grupo, os itens, quem assumiu e o histórico', async () => {
    const v = await criarViagem();
    await enviar('A', [mudanca('item_claim', 'PUT', randomUUID(), { trip_id: v.trip, item_id: v.item })]);
    await enviar('B', [mudanca('trip_item', 'PATCH', v.item, { qty: 2 })]);
    await new Promise((r) => setTimeout(r, 1500));
    const deA = await lerSincronizacao('A');
    const tabelas = new Set(deA.filter((l) => l.trip_id === v.trip || l.id === v.trip).map((l) => l.tabela));
    assert.deepEqual([...tabelas].sort(), ['item_claim', 'trip', 'trip_item', 'trip_item_history', 'trip_member']);
    assert.ok(!deA.some((l) => l.trip_id === VIAGEM_C || l.id === VIAGEM_C), 'e nada da viagem de C');
  });
});
