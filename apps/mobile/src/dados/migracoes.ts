import type { Executor } from './executor';

// Migrações das tabelas SÓ do aparelho (não sincronizadas). As tabelas que sincronizam não têm
// migração aqui: são as do esquema do PowerSync (`esquema.ts`), que ele mesmo recria a cada
// abertura a partir da definição, sem perder dado (coluna nova aparece vazia; coluna retirada
// some da vista, mas o valor fica guardado).
//
// Regras:
//   1. Migração publicada nunca muda. Mudança de tabela é sempre uma migração nova, com o número
//      seguinte (o teste confere a sequência e a forma de cada uma).
//   2. Cada migração roda numa transação, junto com a linha em `migracao_local`: ou entra
//      inteira, ou não entra nada.
//   3. Banco com migração mais nova do que o app conhece (app voltou de versão) não é tocado: a
//      abertura falha com mensagem clara, em vez de seguir com tabelas que o app não entende.
//   4. Nada de nome começando por `ps_` (reservado ao PowerSync) nem igual a uma tabela do esquema.

export type Migracao = {
  versao: number;
  nome: string;
  comandos: readonly string[];
};

export const MIGRACOES: readonly Migracao[] = [
  {
    versao: 1,
    nome: 'estado_local',
    comandos: [
      // Estado do app neste aparelho, chave e valor: identificador da instalação (seção 11,
      // `install_id`), marcas de primeira vez e o que mais for só do aparelho. Nunca segredo:
      // segredo vai para o cofre do sistema (`src/seguranca`).
      `create table estado_local (
        chave text primary key not null,
        valor text not null,
        atualizado_em text not null
      ) strict`,
    ],
  },
  {
    versao: 2,
    nome: 'evento_local',
    comandos: [
      // Eventos de medição da seção 12, guardados até o envio em lote (`events_ingest`). Mesmos
      // campos da tabela `event` do servidor, mais o `id` para apagar o que já foi enviado.
      // `props` é JSON só com identificadores e valores fechados (nunca texto digitado).
      `create table evento_local (
        id text primary key not null,
        name text not null,
        props text not null default '{}',
        at text not null,
        install_id text,
        profile_id text
      ) strict`,
      'create index evento_local_at on evento_local (at)',
    ],
  },
];

export const VERSAO_LOCAL_ATUAL = MIGRACOES.reduce((maior, m) => Math.max(maior, m.versao), 0);

const TABELA_DE_CONTROLE = `create table if not exists migracao_local (
  versao integer primary key not null,
  nome text not null,
  aplicada_em text not null
) strict`;

export type ResultadoDasMigracoes = { antes: number; depois: number; aplicadas: number[] };

export async function versaoLocal(db: Executor): Promise<number> {
  await db.execute(TABELA_DE_CONTROLE);
  const linha = await db.getOptional<{ v: number | null }>('select max(versao) as v from migracao_local');
  return linha?.v ?? 0;
}

/** Aplica, em ordem, as migrações que faltam. Pode ser chamada a cada abertura. */
export async function aplicarMigracoes(
  db: Executor,
  agora: () => string,
  migracoes: readonly Migracao[] = MIGRACOES,
): Promise<ResultadoDasMigracoes> {
  conferirSequencia(migracoes);
  const antes = await versaoLocal(db);
  const conhecida = migracoes.at(-1)?.versao ?? 0;
  if (antes > conhecida) {
    throw new Error(`banco local na versão ${antes}, mais nova que a deste app (${conhecida})`);
  }
  const aplicadas: number[] = [];
  for (const m of migracoes.filter((x) => x.versao > antes)) {
    await db.writeTransaction(async (tx) => {
      // Confere de novo dentro da transação: duas aberturas ao mesmo tempo não aplicam duas vezes.
      const ja = await tx.getOptional<{ versao: number }>('select versao from migracao_local where versao = ?', [m.versao]);
      if (ja) return;
      for (const comando of m.comandos) await tx.execute(comando);
      await tx.execute('insert into migracao_local (versao, nome, aplicada_em) values (?, ?, ?)', [m.versao, m.nome, agora()]);
      aplicadas.push(m.versao);
    });
  }
  return { antes, depois: await versaoLocal(db), aplicadas };
}

/** Versões 1, 2, 3... sem buraco nem repetição; nomes únicos. */
export function conferirSequencia(migracoes: readonly Migracao[]): void {
  migracoes.forEach((m, i) => {
    if (m.versao !== i + 1) throw new Error(`migração fora de sequência: posição ${i + 1} tem a versão ${m.versao}`);
    if (m.comandos.length === 0) throw new Error(`migração ${m.versao} sem comando`);
  });
  const nomes = new Set(migracoes.map((m) => m.nome));
  if (nomes.size !== migracoes.length) throw new Error('nome de migração repetido');
}
