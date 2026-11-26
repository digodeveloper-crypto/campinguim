import { describe, expect, it } from 'vitest';

import { verificarCamada } from '../verificacao';
import { novoBancoDeTeste } from './bancoDeTeste';

// O mesmo roteiro que roda no emulador (fumaça `e2e/jornadas/fumaca-banco`), aqui no computador.
describe('verificação da camada de acesso', () => {
  it('todos os passos passam num banco novo', async () => {
    const { ctx } = await novoBancoDeTeste();
    const r = await verificarCamada(ctx);
    expect(r.passos.filter((p) => !p.ok)).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.passos.length).toBeGreaterThanOrEqual(10);
    expect(r.versaoLocal).toBe(2);
  });

  it('acusa tabela proibida no aparelho', async () => {
    const { ctx, sqlite } = await novoBancoDeTeste();
    sqlite.exec('create table fact_summary (id text)');
    const r = await verificarCamada(ctx);
    expect(r.ok).toBe(false);
    expect(r.passos.find((p) => !p.ok)?.detalhe).toContain('fact_summary');
  });
});
