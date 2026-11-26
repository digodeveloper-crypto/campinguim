import type { NomeDeTabelaSincronizada, TABELAS_SO_DO_SERVIDOR, TiposDoBanco } from '../esquema';
import type { Consultas, Executor, Parametro } from '../executor';

// O que toda função da camada de acesso recebe. No app vem de `banco.ts`; nos testes, do banco
// SQLite do Node. Nada aqui depende de tela ou de rede.
export type ContextoDeAcesso = {
  db: Executor;
  /** UUID v4 aleatório (DEF-08). */
  gerarId: () => string;
  /** Agora, em UTC, ISO 8601. Só local: o servidor usa a própria hora (seção 4, princípio 4). */
  agora: () => string;
  /** Perfil da pessoa logada; nulo sem conta (E1-14). Vai em `updated_by`. */
  perfilId: string | null;
};

/** Tabelas em que o app escreve (as outras vêm só do servidor e só são lidas). */
export type TabelaEscritaPeloApp = Exclude<NomeDeTabelaSincronizada, (typeof TABELAS_SO_DO_SERVIDOR)[number]>;

type Linha<T extends TabelaEscritaPeloApp> = Omit<TiposDoBanco[T], 'id'>;

/** Identificador da alteração, que acompanha a escrita na fila (seção 4, princípio 2). */
function metadado(ctx: ContextoDeAcesso): string {
  return JSON.stringify({ c: ctx.gerarId() });
}

/** Insere uma linha numa tabela sincronizada, com as marcas de controle. Devolve o `id`. */
export async function inserir<T extends TabelaEscritaPeloApp>(
  tx: Consultas,
  ctx: ContextoDeAcesso,
  tabela: T,
  campos: Partial<Linha<T>>,
  id: string = ctx.gerarId(),
): Promise<string> {
  const agora = ctx.agora();
  const linha: Record<string, Parametro> = {
    created_at: agora,
    ...(campos as Record<string, Parametro>),
    id,
    updated_at: agora,
    updated_by: ctx.perfilId,
    _metadata: metadado(ctx),
  };
  const colunas = Object.keys(linha);
  await tx.execute(
    `insert into ${tabela} (${colunas.join(', ')}) values (${colunas.map(() => '?').join(', ')})`,
    colunas.map((c) => linha[c] ?? null),
  );
  return id;
}

/**
 * Altera só os campos que mudaram. Se nada muda, não grava (nem entra na fila) e devolve false.
 * Linha apagada (`deleted_at`) ou inexistente: devolve false.
 */
export async function alterar<T extends TabelaEscritaPeloApp>(
  tx: Consultas,
  ctx: ContextoDeAcesso,
  tabela: T,
  id: string,
  campos: Partial<Linha<T>>,
): Promise<boolean> {
  const atual = await tx.getOptional<Record<string, Parametro>>(`select * from ${tabela} where id = ? and deleted_at is null`, [id]);
  if (!atual) return false;
  const novos = campos as Record<string, Parametro | undefined>;
  const mudou = Object.keys(novos).filter((c) => novos[c] !== undefined && atual[c] !== novos[c]);
  if (mudou.length === 0) return false;
  const valores = mudou.map((c) => novos[c] ?? null);
  await tx.execute(
    `update ${tabela} set ${mudou.map((c) => `${c} = ?`).join(', ')}, updated_at = ?, updated_by = ?, _metadata = ? where id = ?`,
    [...valores, ctx.agora(), ctx.perfilId, metadado(ctx), id],
  );
  return true;
}

/** Apaga sem apagar: marca `deleted_at` (seção 3; nada some de verdade numa tabela sincronizada). */
export async function marcarApagado(tx: Consultas, ctx: ContextoDeAcesso, tabela: TabelaEscritaPeloApp, id: string): Promise<boolean> {
  const atual = await tx.getOptional<{ id: string }>(`select id from ${tabela} where id = ? and deleted_at is null`, [id]);
  if (!atual) return false;
  const agora = ctx.agora();
  await tx.execute(`update ${tabela} set deleted_at = ?, updated_at = ?, updated_by = ?, _metadata = ? where id = ?`, [
    agora,
    agora,
    ctx.perfilId,
    metadado(ctx),
    id,
  ]);
  return true;
}
