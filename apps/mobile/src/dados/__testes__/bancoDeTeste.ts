import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

import type { ContextoDeAcesso } from '../acesso/contexto';
import { esquema } from '../esquema';
import type { Consultas, Executor, Parametro } from '../executor';
import { aplicarMigracoes } from '../migracoes';

// Banco dos testes do computador: SQLite do Node, em memória, sem cifra. As tabelas sincronizadas
// são criadas como tabelas comuns, com as mesmas colunas do esquema do PowerSync (no aparelho elas
// são vistas do PowerSync; o comportamento delas lá é conferido pela verificação no emulador).

type TipoSqlite = 'TEXT' | 'INTEGER' | 'REAL';

export function criarTabelasDoEsquema(db: DatabaseSync): void {
  for (const tabela of esquema.tables) {
    const colunas = tabela.columns.map((c) => `${c.name} ${c.type as TipoSqlite}`);
    if (tabela.trackMetadata) colunas.push('_metadata TEXT');
    db.exec(`create table ${tabela.name} (id TEXT primary key not null, ${colunas.join(', ')})`);
  }
}

export function executorDoNode(db: DatabaseSync): Executor {
  const consultas: Consultas = {
    async execute(sql: string, parametros: Parametro[] = []) {
      return db.prepare(sql).run(...parametros);
    },
    async getAll<T>(sql: string, parametros: Parametro[] = []) {
      return db.prepare(sql).all(...parametros).map((linha) => ({ ...linha })) as T[];
    },
    async getOptional<T>(sql: string, parametros: Parametro[] = []) {
      const linha = db.prepare(sql).get(...parametros);
      return linha ? ({ ...linha } as T) : null;
    },
  };
  let emTransacao = false;
  return {
    ...consultas,
    async writeTransaction<T>(fn: (tx: Consultas) => Promise<T>): Promise<T> {
      if (emTransacao) throw new Error('transação dentro de transação');
      emTransacao = true;
      db.exec('begin immediate');
      try {
        const r = await fn(consultas);
        db.exec('commit');
        return r;
      } catch (e) {
        db.exec('rollback');
        throw e;
      } finally {
        emTransacao = false;
      }
    },
  };
}

let relogio = Date.UTC(2026, 10, 26, 12, 0, 0);
/** Relógio que anda 1 ms a cada leitura: ordem estável nos testes. */
export const agoraDeTeste = () => new Date(relogio++).toISOString();

export async function novoBancoDeTeste(perfilId: string | null = null): Promise<{ sqlite: DatabaseSync; ctx: ContextoDeAcesso }> {
  const sqlite = new DatabaseSync(':memory:');
  criarTabelasDoEsquema(sqlite);
  const db = executorDoNode(sqlite);
  await aplicarMigracoes(db, agoraDeTeste);
  return { sqlite, ctx: { db, gerarId: randomUUID, agora: agoraDeTeste, perfilId } };
}
