// O mínimo que a camada de acesso e as migrações precisam de um banco. O `PowerSyncDatabase` (no
// aparelho) e o banco dos testes (SQLite do Node) têm esta mesma forma, então o mesmo código roda
// nos dois.

export type Parametro = string | number | null;

export interface Consultas {
  execute(sql: string, parametros?: Parametro[]): Promise<unknown>;
  getAll<T>(sql: string, parametros?: Parametro[]): Promise<T[]>;
  getOptional<T>(sql: string, parametros?: Parametro[]): Promise<T | null>;
}

export interface Executor extends Consultas {
  /** Tudo dentro de `fn` é gravado junto ou nada é gravado. */
  writeTransaction<T>(fn: (tx: Consultas) => Promise<T>): Promise<T>;
}
