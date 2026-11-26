// Autorização pela API (SPEC, seção 11): cada pessoa só lê e escreve as viagens de que é membro.
// A e B são membros da viagem de grupo; C só da própria viagem. Tudo pela API pública do
// Supabase local, com a chave pública e o login de cada um (o mesmo caminho do app).
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import { createClient } from '@supabase/supabase-js';

import { lerEnvLocal, USUARIOS, VIAGEM_AB, VIAGEM_C } from '../scripts/comum.mjs';

const env = lerEnvLocal();
const clientes = {};

function novoCliente() {
  return createClient(env.SUPABASE_URL_LOCAL, env.SUPABASE_CHAVE_PUBLICA, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

before(async () => {
  for (const chave of ['A', 'B', 'C']) {
    const cliente = novoCliente();
    const { error } = await cliente.auth.signInWithPassword({
      email: USUARIOS[chave].email,
      password: env[`SENHA_TESTE_${chave}`],
    });
    assert.equal(error, null, `login de ${chave}`);
    clientes[chave] = cliente;
  }
  clientes.anonimo = novoCliente();
});

after(async () => {
  for (const chave of ['A', 'B', 'C']) await clientes[chave].auth.signOut();
});

async function ids(cliente, tabela, filtro) {
  let consulta = cliente.from(tabela).select('id, trip_id');
  if (tabela === 'trip') consulta = cliente.from('trip').select('id');
  if (filtro) consulta = consulta.eq(filtro[0], filtro[1]);
  const { data, error } = await consulta;
  assert.equal(error, null, `${tabela}: ${error?.message}`);
  return data;
}

describe('A não lê nada da viagem de C pela API', () => {
  test('trip: A vê só a viagem de grupo', async () => {
    const linhas = await ids(clientes.A, 'trip');
    assert.deepEqual(linhas.map((l) => l.id), [VIAGEM_AB]);
  });

  test('trip: A pedindo a viagem de C pelo identificador recebe nada', async () => {
    assert.deepEqual(await ids(clientes.A, 'trip', ['id', VIAGEM_C]), []);
  });

  test('trip_member: A pedindo os membros da viagem de C recebe nada', async () => {
    assert.deepEqual(await ids(clientes.A, 'trip_member', ['trip_id', VIAGEM_C]), []);
  });

  test('trip_item: A pedindo os itens da viagem de C recebe nada', async () => {
    assert.deepEqual(await ids(clientes.A, 'trip_item', ['trip_id', VIAGEM_C]), []);
  });

  test('trip_item: tudo o que A vê é da viagem de grupo', async () => {
    const linhas = await ids(clientes.A, 'trip_item');
    assert.ok(linhas.length > 0);
    assert.ok(linhas.every((l) => l.trip_id === VIAGEM_AB));
  });
});

describe('escritas fora da própria viagem são recusadas', () => {
  test('A não cria item na viagem de C', async () => {
    const { error } = await clientes.A.from('trip_item').insert({ trip_id: VIAGEM_C, name: 'Intruso' });
    assert.ok(error, 'esperava recusa');
    assert.equal(error.code, '42501'); // violação de política de RLS
  });

  test('A não altera a viagem de C', async () => {
    const { data, error } = await clientes.A.from('trip').update({ name: 'Mudado por A' }).eq('id', VIAGEM_C).select('id');
    assert.equal(error, null);
    assert.deepEqual(data, []);
  });

  test('A não se coloca como membro da viagem de C', async () => {
    const { data: sessao } = await clientes.A.auth.getUser();
    const { error } = await clientes.A
      .from('trip_member')
      .insert({ trip_id: VIAGEM_C, profile_id: sessao.user.id, display_name: 'A', role: 'organizer' });
    assert.ok(error, 'esperava recusa');
  });

  test('B (membro, não organizador) não altera os dados da viagem de grupo', async () => {
    const { data, error } = await clientes.B.from('trip').update({ name: 'Mudado por B' }).eq('id', VIAGEM_AB).select('id');
    assert.equal(error, null);
    assert.deepEqual(data, []);
  });
});

describe('membros da mesma viagem e sem login', () => {
  test('B lê a viagem de grupo e os seus itens', async () => {
    assert.deepEqual((await ids(clientes.B, 'trip')).map((l) => l.id), [VIAGEM_AB]);
    assert.ok((await ids(clientes.B, 'trip_item', ['trip_id', VIAGEM_AB])).length > 0);
  });

  test('C não lê nada da viagem de grupo', async () => {
    assert.deepEqual(await ids(clientes.C, 'trip', ['id', VIAGEM_AB]), []);
    assert.deepEqual(await ids(clientes.C, 'trip_item', ['trip_id', VIAGEM_AB]), []);
  });

  test('sem login não se lê nenhuma tabela', async () => {
    for (const tabela of ['trip', 'trip_member', 'trip_item']) {
      const { data, error } = await clientes.anonimo.from(tabela).select('id');
      assert.ok(error || data.length === 0, `${tabela} aberta sem login`);
    }
  });
});
