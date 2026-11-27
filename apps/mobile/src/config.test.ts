// O ambiente do app (B1-FIX-2): sem `extra.ambiente` o padrão é FECHADO ('producao'); só o valor
// explícito 'local' abre o ambiente de desenvolvimento.
import { beforeEach, describe, expect, it, vi } from 'vitest';

import enderecos from '../../../config/enderecos.json';

const configuracao = vi.hoisted(() => ({ extra: undefined as Record<string, unknown> | undefined }));

vi.mock('expo-constants', () => ({
  default: {
    get expoConfig() {
      return configuracao.extra === undefined ? null : { extra: configuracao.extra };
    },
  },
}));

async function carregar(extra: Record<string, unknown> | undefined) {
  configuracao.extra = extra;
  vi.resetModules();
  return (await import('./config')).config;
}

describe('config.ambiente', () => {
  beforeEach(() => {
    configuracao.extra = undefined;
  });

  it('o nome do ambiente fechado é uma chave de config/enderecos.json', async () => {
    const { ambiente } = await carregar(undefined);
    expect(Object.keys(enderecos)).toContain(ambiente);
  });

  it('sem configuração nenhuma, o ambiente é o fechado, não o local', async () => {
    expect((await carregar(undefined)).ambiente).toBe('producao');
  });

  it('com `extra` sem o campo `ambiente`, o ambiente é o fechado', async () => {
    expect((await carregar({ servidor: 'x', portaApi: 1 })).ambiente).toBe('producao');
  });

  it('só o valor explícito "local" abre o ambiente local', async () => {
    expect((await carregar({ ambiente: 'local' })).ambiente).toBe('local');
  });

  it('o valor "producao" explícito continua fechado', async () => {
    expect((await carregar({ ambiente: 'producao' })).ambiente).toBe('producao');
  });
});
