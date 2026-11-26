import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it } from 'vitest';

import { aplicarMigracoes, conferirSequencia, MIGRACOES, VERSAO_LOCAL_ATUAL, versaoLocal, type Migracao } from '../migracoes';
import { agoraDeTeste, criarTabelasDoEsquema, executorDoNode } from './bancoDeTeste';

// Migração publicada nunca muda (regra 1 de migracoes.ts). Cada migração nova acrescenta a sua
// linha aqui; mudar uma linha existente quer dizer que uma migração já aplicada nos aparelhos foi
// alterada, e o teste falha.
const PUBLICADAS: Record<number, string> = {
  1: '196eed410861',
  2: 'c455f3f21dbd',
};

const resumo = (m: Migracao) => createHash('sha256').update(JSON.stringify([m.versao, m.nome, m.comandos])).digest('hex').slice(0, 12);

function novoBanco() {
  const sqlite = new DatabaseSync(':memory:');
  criarTabelasDoEsquema(sqlite);
  return { sqlite, db: executorDoNode(sqlite) };
}

/** Estrutura do banco (tabelas e índices, com o SQL de cada um), para comparar dois bancos. */
function estrutura(sqlite: DatabaseSync) {
  return sqlite
    .prepare("select type, name, sql from sqlite_master where name not like 'sqlite_%' order by type, name")
    .all()
    .map((l) => ({ ...l }));
}

describe('migrações das tabelas só locais', () => {
  it('as migrações publicadas não mudaram, e toda migração está registrada aqui', () => {
    expect(Object.fromEntries(MIGRACOES.map((m) => [m.versao, resumo(m)]))).toEqual(PUBLICADAS);
  });

  it('aplicam em sequência num banco novo, até a versão atual', async () => {
    const { sqlite, db } = novoBanco();
    const r = await aplicarMigracoes(db, agoraDeTeste);
    expect(r).toEqual({ antes: 0, depois: VERSAO_LOCAL_ATUAL, aplicadas: MIGRACOES.map((m) => m.versao) });
    const registro = sqlite.prepare('select versao, nome from migracao_local order by versao').all();
    expect(registro.map((l) => ({ ...l }))).toEqual(MIGRACOES.map((m) => ({ versao: m.versao, nome: m.nome })));
    const colunas = (t: string) => sqlite.prepare(`pragma table_info(${t})`).all().map((c) => c.name);
    expect(colunas('estado_local')).toEqual(['chave', 'valor', 'atualizado_em']);
    expect(colunas('evento_local')).toEqual(['id', 'name', 'props', 'at', 'install_id', 'profile_id']);
  });

  it('rodar de novo não muda nada (toda abertura do app chama)', async () => {
    const { sqlite, db } = novoBanco();
    await aplicarMigracoes(db, agoraDeTeste);
    const antes = estrutura(sqlite);
    const r = await aplicarMigracoes(db, agoraDeTeste);
    expect(r).toEqual({ antes: VERSAO_LOCAL_ATUAL, depois: VERSAO_LOCAL_ATUAL, aplicadas: [] });
    expect(estrutura(sqlite)).toEqual(antes);
  });

  it('um aparelho que parou numa versão antiga chega ao mesmo banco de quem instalou agora', async () => {
    const velho = novoBanco();
    for (let v = 1; v <= VERSAO_LOCAL_ATUAL; v += 1) {
      const r = await aplicarMigracoes(velho.db, agoraDeTeste, MIGRACOES.slice(0, v));
      expect(r.aplicadas).toEqual([v]);
    }
    const novo = novoBanco();
    await aplicarMigracoes(novo.db, agoraDeTeste);
    expect(estrutura(velho.sqlite)).toEqual(estrutura(novo.sqlite));
  });

  it('dados gravados numa versão continuam depois das migrações seguintes', async () => {
    const { sqlite, db } = novoBanco();
    await aplicarMigracoes(db, agoraDeTeste, MIGRACOES.slice(0, 1));
    sqlite.prepare("insert into estado_local values ('install_id', 'abc', '2026-11-26T00:00:00.000Z')").run();
    await aplicarMigracoes(db, agoraDeTeste);
    expect({ ...sqlite.prepare("select valor from estado_local where chave = 'install_id'").get() }).toEqual({ valor: 'abc' });
  });

  it('migração com erro não deixa nada pela metade, e a versão não avança', async () => {
    const { sqlite, db } = novoBanco();
    const quebrada: Migracao = { versao: VERSAO_LOCAL_ATUAL + 1, nome: 'quebrada', comandos: ['create table nova (a text)', 'isto não é sql'] };
    await expect(aplicarMigracoes(db, agoraDeTeste, [...MIGRACOES, quebrada])).rejects.toThrow();
    expect(await versaoLocal(db)).toBe(VERSAO_LOCAL_ATUAL);
    expect(sqlite.prepare("select name from sqlite_master where name = 'nova'").get()).toBeUndefined();
    // Corrigida, aplica normalmente na próxima abertura.
    const corrigida: Migracao = { ...quebrada, comandos: ['create table nova (a text)'] };
    const r = await aplicarMigracoes(db, agoraDeTeste, [...MIGRACOES, corrigida]);
    expect(r.aplicadas).toEqual([VERSAO_LOCAL_ATUAL + 1]);
  });

  it('banco de uma versão mais nova do app não é tocado', async () => {
    const { db } = novoBanco();
    const futura: Migracao = { versao: VERSAO_LOCAL_ATUAL + 1, nome: 'futura', comandos: ['create table futura (a text)'] };
    await aplicarMigracoes(db, agoraDeTeste, [...MIGRACOES, futura]);
    await expect(aplicarMigracoes(db, agoraDeTeste)).rejects.toThrow(/mais nova que a deste app/);
  });

  it('a lista de migrações não aceita buraco, repetição nem migração vazia', () => {
    const m = (versao: number, nome = `m${versao}`, comandos = ['select 1']): Migracao => ({ versao, nome, comandos });
    expect(() => conferirSequencia([m(1), m(2)])).not.toThrow();
    expect(() => conferirSequencia([m(1), m(3)])).toThrow(/fora de sequência/);
    expect(() => conferirSequencia([m(2)])).toThrow(/fora de sequência/);
    expect(() => conferirSequencia([m(1), m(1)])).toThrow(/fora de sequência/);
    expect(() => conferirSequencia([m(1, 'a'), m(2, 'a')])).toThrow(/repetido/);
    expect(() => conferirSequencia([m(1, 'a', [])])).toThrow(/sem comando/);
  });
});
