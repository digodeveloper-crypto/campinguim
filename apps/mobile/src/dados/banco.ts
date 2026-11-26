import '@azure/core-asynciterator-polyfill';

import { isSQLCipher, open } from '@op-engineering/op-sqlite';
import { PowerSyncDatabase } from '@powersync/react-native';
import { getRandomBytes, randomUUID } from 'expo-crypto';

import { chaveParaSqlcipher, obterChaveDoBanco } from '../seguranca/chaveDoBanco';
import { cofreDoSistema } from '../seguranca/cofre';
import type { ContextoDeAcesso } from './acesso/contexto';
import { listarTabelas, type TabelaDoBanco } from './acesso/local';
import { esquema } from './esquema';
import { aplicarMigracoes, type ResultadoDasMigracoes } from './migracoes';
import { verificarCamada, type RelatorioDaVerificacao } from './verificacao';

// Banco local do aparelho (DEF-11, NF-03): SQLite cifrado pelo SQLCipher (OP-SQLite com
// `"op-sqlite": { "sqlcipher": true }` no package.json do app; ponto J28 da prova), aberto pelo
// PowerSync com o esquema da seção 3 e as migrações das tabelas só locais.
//
// A chave fica só no cofre do sistema (`src/seguranca`). Nada aqui escreve a chave em registro,
// arquivo ou tela.
//
// A sincronização fica DESLIGADA até a feature 2.2: ninguém chama `connect` (veja `conector.ts`).
// Até lá, as escritas ficam na fila do aparelho, com os mesmos identificadores, e sobem no
// primeiro login (E1-14).

export const ARQUIVO_DO_BANCO = 'campinguim.db';
// Banco descartável da verificação de fumaça (`verificarNoAparelho`); nunca guarda dado da pessoa.
const ARQUIVO_DA_VERIFICACAO = 'campinguim-verificacao.db';
const SUFIXOS_DO_SQLITE = ['-wal', '-shm', '-journal'];

export type BancoAberto = {
  db: PowerSyncDatabase;
  ctx: ContextoDeAcesso;
  migracoes: ResultadoDasMigracoes;
  /** true quando a chave foi criada agora e havia um banco antigo ilegível, que foi descartado. */
  recriado: boolean;
};

export const agoraUtc = () => new Date().toISOString();

function contextoDe(db: PowerSyncDatabase): ContextoDeAcesso {
  // Sem conta até a feature 2.1: perfil nulo (E1-14).
  return { db, gerarId: randomUUID, agora: agoraUtc, perfilId: null };
}

/** Remove o arquivo do banco e os auxiliares do SQLite. Só para banco que ninguém consegue ler. */
function apagarArquivos(arquivo: string, chave: string) {
  for (const nome of [arquivo, ...SUFIXOS_DO_SQLITE.map((s) => arquivo + s)]) {
    try {
      // O OP-SQLite só apaga pelo objeto aberto; abrir não lê o arquivo, só o localiza.
      open({ name: nome, encryptionKey: chave }).delete();
    } catch {
      // arquivo não existia
    }
  }
}

/**
 * Chave recém-criada e banco antigo no lugar: o banco foi cifrado com uma chave que não existe
 * mais (por exemplo, o cofre foi limpo). Sem ela, os dados não podem ser lidos por ninguém; o
 * arquivo é descartado para o app voltar a funcionar. Com a chave antiga ainda no cofre, isto
 * nunca roda: erro de abertura nesse caso é repassado, e nada é apagado.
 */
async function descartarSeIlegivel(arquivo: string, chave: string): Promise<boolean> {
  const sonda = open({ name: arquivo, encryptionKey: chave });
  try {
    await sonda.execute('select count(*) from sqlite_master');
    sonda.close();
    return false;
  } catch {
    sonda.close();
    apagarArquivos(arquivo, chave);
    return true;
  }
}

async function abrirCifrado(arquivo: string): Promise<BancoAberto> {
  // Nunca abre sem cifra: um app gerado sem o SQLCipher gravaria tudo em texto aberto.
  if (!isSQLCipher()) throw new Error('app gerado sem SQLCipher: confira "op-sqlite" no package.json do app');
  const chave = await obterChaveDoBanco(cofreDoSistema, getRandomBytes);
  const chaveSqlcipher = chaveParaSqlcipher(chave.hex);
  const recriado = chave.nova ? await descartarSeIlegivel(arquivo, chaveSqlcipher) : false;

  const db = new PowerSyncDatabase({
    schema: esquema,
    database: { dbFilename: arquivo, sqliteOptions: { encryptionKey: chaveSqlcipher } },
  });
  await db.waitForReady();
  const migracoes = await aplicarMigracoes(db, agoraUtc);
  return { db, ctx: contextoDe(db), migracoes, recriado };
}

let aberto: Promise<BancoAberto> | null = null;

/** O banco do app (um só por processo). */
export function abrirBancoDoApp(): Promise<BancoAberto> {
  aberto ??= abrirCifrado(ARQUIVO_DO_BANCO).catch((erro: unknown) => {
    aberto = null; // permite tentar de novo
    throw erro;
  });
  return aberto;
}

export type ResumoDoBanco = {
  arquivo: string;
  sqlcipher: boolean;
  versaoDaCifra: string | null;
  versaoLocal: number;
  migracoesAplicadasAgora: number[];
  recriado: boolean;
  tabelas: TabelaDoBanco[];
};

/** Resumo técnico para o registro do app no ambiente local. Sem chave e sem dado da pessoa. */
export async function resumir(banco: BancoAberto): Promise<ResumoDoBanco> {
  const cifra = await banco.db.getOptional<{ cipher_version: string }>('pragma cipher_version');
  return {
    arquivo: ARQUIVO_DO_BANCO,
    sqlcipher: isSQLCipher(),
    versaoDaCifra: cifra?.cipher_version ?? null,
    versaoLocal: banco.migracoes.depois,
    migracoesAplicadasAgora: banco.migracoes.aplicadas,
    recriado: banco.recriado,
    tabelas: await listarTabelas(banco.db),
  };
}

/**
 * Verificação de fumaça da camada de acesso no aparelho: abre um banco cifrado separado, com a
 * mesma chave e o mesmo esquema, roda `verificarCamada`, fecha e apaga o arquivo. O banco da
 * pessoa não é tocado.
 */
export async function verificarNoAparelho(): Promise<RelatorioDaVerificacao & { versaoDaCifra: string | null }> {
  const chave = chaveParaSqlcipher((await obterChaveDoBanco(cofreDoSistema, getRandomBytes)).hex);
  apagarArquivos(ARQUIVO_DA_VERIFICACAO, chave);
  const banco = await abrirCifrado(ARQUIVO_DA_VERIFICACAO);
  try {
    const cifra = await banco.db.getOptional<{ cipher_version: string }>('pragma cipher_version');
    const relatorio = await verificarCamada(banco.ctx);
    return { ...relatorio, versaoDaCifra: cifra?.cipher_version ?? null };
  } finally {
    await banco.db.close();
    apagarArquivos(ARQUIVO_DA_VERIFICACAO, chave);
  }
}
