import { banco } from '../dados/banco';
import { textos } from '../textos';

// Viagens de teste da prova F0-4. Identificadores fixos para o roteiro montar os links.
// IDS_DE_TESTE vem na mesma ordem de textos.links.viagens (nome de cada viagem).
export const IDS_DE_TESTE = [
  '1f0a0b00-0000-4000-8000-00000000f401',
  '1f0a0b00-0000-4000-8000-00000000f402',
  '1f0a0b00-0000-4000-8000-00000000f403',
] as const;

// Cria (ou recria) as viagens de teste no banco do aparelho. Não precisa de rede nem de login.
export async function semearViagens(): Promise<number> {
  const agora = new Date().toISOString();
  await banco.writeTransaction(async (tx) => {
    for (const [i, id] of IDS_DE_TESTE.entries()) {
      await tx.execute('delete from trip where id = ?', [id]);
      await tx.execute(
        'insert into trip (id, name, kind, status, created_at, updated_at) values (?, ?, ?, ?, ?, ?)',
        [id, textos.links.viagens[i], 'camping', 'planning', agora, agora],
      );
    }
  });
  return IDS_DE_TESTE.length;
}
