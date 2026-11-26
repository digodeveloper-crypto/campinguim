// Cria (ou atualiza) os dados de teste da prova no Supabase local:
//   A e B: membros da viagem de grupo VIAGEM_AB; C: membro só da VIAGEM_C.
// Usa a chave de serviço local, lida de prova/.env.local. Pode rodar quantas vezes quiser.
import { createClient } from '@supabase/supabase-js';

import { FAMILIAS, lerEnvLocal, USUARIOS, VIAGEM_AB, VIAGEM_C } from './comum.mjs';

const env = lerEnvLocal();
const admin = createClient(env.SUPABASE_URL_LOCAL, env.SUPABASE_CHAVE_SERVICO, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function garantirUsuario(chave) {
  const { email, nome } = USUARIOS[chave];
  const senha = env[`SENHA_TESTE_${chave}`];
  if (!senha) throw new Error(`falta SENHA_TESTE_${chave} em prova/.env.local`);

  const { data: lista, error: erroLista } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (erroLista) throw erroLista;
  const existente = lista.users.find((u) => u.email === email);
  if (existente) {
    const { error } = await admin.auth.admin.updateUserById(existente.id, { password: senha });
    if (error) throw error;
    return { id: existente.id, nome };
  }
  const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true });
  if (error) throw error;
  return { id: data.user.id, nome };
}

async function upsert(tabela, linhas) {
  const { error } = await admin.from(tabela).upsert(linhas, { onConflict: 'id' });
  if (error) throw new Error(`${tabela}: ${error.message}`);
}

const a = await garantirUsuario('A');
const b = await garantirUsuario('B');
const c = await garantirUsuario('C');
await garantirUsuario('D');
await garantirUsuario('E');

await upsert('trip', [
  { id: VIAGEM_AB, owner_profile_id: a.id, name: 'Viagem de grupo A e B', is_group: true, nights: 2, updated_by: a.id },
  { id: VIAGEM_C, owner_profile_id: c.id, name: 'Viagem da pessoa C', is_group: false, nights: 1, updated_by: c.id },
]);

await upsert('trip_member', [
  { id: '1f0a0b00-0000-4000-8000-00000000a001', trip_id: VIAGEM_AB, family_id: FAMILIAS.A, profile_id: a.id, display_name: a.nome, role: 'organizer' },
  { id: '1f0a0b00-0000-4000-8000-00000000b001', trip_id: VIAGEM_AB, family_id: FAMILIAS.B, profile_id: b.id, display_name: b.nome, role: 'member' },
  { id: '1f0a0c00-0000-4000-8000-00000000c001', trip_id: VIAGEM_C, family_id: FAMILIAS.C, profile_id: c.id, display_name: c.nome, role: 'organizer' },
]);

await upsert('trip_item', [
  { id: '1f0a0b00-0000-4000-8000-0000000001a1', trip_id: VIAGEM_AB, name: 'Barraca', qty: 1, catalog_key: 'barraca' },
  { id: '1f0a0b00-0000-4000-8000-0000000001a2', trip_id: VIAGEM_AB, name: 'Isqueiro', qty: 2, catalog_key: 'isqueiro' },
  { id: '1f0a0b00-0000-4000-8000-0000000001a3', trip_id: VIAGEM_AB, name: 'Lanterna', qty: 3, catalog_key: 'lanterna' },
  { id: '1f0a0c00-0000-4000-8000-0000000001c1', trip_id: VIAGEM_C, name: 'Saco de dormir', qty: 1, catalog_key: 'saco_de_dormir' },
]);

console.log('[semear] usuários A, B, C, D e E prontos; viagem de grupo (A e B) e viagem de C com itens');
