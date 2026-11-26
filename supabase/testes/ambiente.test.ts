// O ambiente local inteiro responde na máquina, sem serviço externo (GIT-11).
import { describe, expect, it } from 'vitest';

import { comBanco, ENDERECOS, envLocal, migracoesNoRepositorio } from './apoio';

describe('ambiente local (GIT-11)', () => {
  it('a API do Supabase local responde na porta do arquivo de configuração', async () => {
    const env = envLocal();
    expect(new URL(env.SUPABASE_URL_LOCAL ?? '').port).toBe(String(ENDERECOS.portaApi));
    const r = await fetch(`${env.SUPABASE_URL_LOCAL}/auth/v1/health`, { headers: { apikey: env.SUPABASE_CHAVE_PUBLICA ?? '' } });
    expect(r.status).toBe(200);
  });

  it('o serviço PowerSync responde', async () => {
    const r = await fetch(`http://${ENDERECOS.servidorNoComputador}:${ENDERECOS.portaSincronizacao}/probes/liveness`);
    expect(r.status).toBe(200);
  });

  it('o banco tem todas as migrações do repositório, na ordem', async () => {
    const aplicadas = await comBanco(async (c) => {
      const { rows } = await c.query<{ version: string }>('select version from supabase_migrations.schema_migrations order by version');
      return rows.map((r) => r.version);
    });
    expect(aplicadas).toEqual(migracoesNoRepositorio());
  });

  it('a publicação do PowerSync existe e a replicação está ativa', async () => {
    const { publicacao, slots } = await comBanco(async (c) => {
      const pub = await c.query("select puballtables from pg_publication where pubname = 'powersync'");
      const sl = await c.query("select slot_name from pg_replication_slots where slot_name like 'powersync%' and active");
      return { publicacao: pub.rows, slots: sl.rows };
    });
    // Publicação criada sem "for all tables": cada tabela sincronizada entra por migração (B5).
    expect(publicacao).toEqual([{ puballtables: false }]);
    expect(slots.length).toBeGreaterThanOrEqual(1);
  });
});
