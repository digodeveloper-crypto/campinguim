// Apoio dos testes do servidor: credenciais locais (.env.local, fora do git) e cliente do Postgres.
import fs from 'node:fs';
import path from 'node:path';

import pg from 'pg';

import { CHAVES_ENV, ENDERECOS, lerEnv, RAIZ } from '../../scripts/ambiente/ambiente.mjs';

export { ENDERECOS, RAIZ };

export function envLocal(): Record<string, string> {
  const env = lerEnv() as Record<string, string>;
  const faltam = CHAVES_ENV.filter((k: string) => !env[k]);
  if (faltam.length) throw new Error(`falta ${faltam.join(', ')} em .env.local: rode "npm run ambiente:subir"`);
  return env;
}

/** Abre uma conexão com o Postgres local, roda `fn` e fecha. */
export async function comBanco<T>(fn: (cliente: pg.Client) => Promise<T>): Promise<T> {
  const cliente = new pg.Client({ connectionString: envLocal().SUPABASE_DB_URL_LOCAL });
  await cliente.connect();
  try {
    return await fn(cliente);
  } finally {
    await cliente.end();
  }
}

export function migracoesNoRepositorio(): string[] {
  return fs
    .readdirSync(path.join(RAIZ, 'supabase', 'migrations'))
    .filter((f) => f.endsWith('.sql'))
    .map((f) => f.split('_')[0] ?? '')
    .sort();
}
