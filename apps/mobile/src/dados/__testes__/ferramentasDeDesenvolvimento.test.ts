// B1-FIX-2: o gancho `campinguim://?verificar-banco=1` (B4, ProvedorDoBanco) e a galeria de
// componentes (B2, app/galeria) só existem com `config.ambiente === 'local'`. Com `extra.ambiente`
// ausente, os dois ficam desligados. O teste usa o `config` de verdade (com o `expo-constants`
// trocado por um valor de teste), chama o componente e olha a árvore que ele devolve. Sem tela.
import type { ReactElement, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const configuracao = vi.hoisted(() => ({ extra: undefined as Record<string, unknown> | undefined }));

vi.mock('expo-constants', () => ({
  default: {
    get expoConfig() {
      return configuracao.extra === undefined ? null : { extra: configuracao.extra };
    },
  },
}));

// Camada nativa e telas: troca por marcadores simples, porque o teste roda no Node, sem celular.
vi.mock('react-native', () => ({ StyleSheet: { create: <T>(estilos: T) => estilos }, Text: 'Text', View: 'View' }));
vi.mock('expo-router', () => ({ Slot: function Slot() { return null; } }));
vi.mock('expo-linking', () => ({ parse: () => ({ queryParams: {} }), useLinkingURL: () => null }));
vi.mock('@powersync/react-native', () => ({ PowerSyncContext: { Provider: function PowerSyncContextProvider() { return null; } } }));
vi.mock('../banco', () => ({ abrirBancoDoApp: () => new Promise(() => undefined), resumir: vi.fn(), verificarNoAparelho: vi.fn() }));
vi.mock('../../componentes', () => ({ Texto: function Texto() { return null; } }));
vi.mock('../../cores', () => ({ cores: {} }));
vi.mock('../../tema', () => ({ useTema: () => ({ cores: { fundo: '#ffffff' } }) }));
// O provedor abre o banco num efeito e guarda o estado: aqui o banco já está "pronto" e nenhum efeito roda.
vi.mock('react', async (original) => ({
  ...(await original<typeof import('react')>()),
  useState: (inicial: unknown) => [typeof inicial === 'object' ? { estado: 'pronto', banco: { db: null } } : inicial, vi.fn()],
  useEffect: vi.fn(),
}));

type No = ReactElement<{ children?: ReactNode }>;

/** Nomes de todos os componentes (função) que aparecem na árvore devolvida. */
function nomesNaArvore(no: ReactNode): string[] {
  if (Array.isArray(no)) return no.flatMap(nomesNaArvore);
  if (!no || typeof no !== 'object') return [];
  const elemento = no as No;
  const proprio = typeof elemento.type === 'function' ? [elemento.type.name] : [];
  return [...proprio, ...nomesNaArvore(elemento.props.children)];
}

async function carregar(extra: Record<string, unknown> | undefined) {
  configuracao.extra = extra;
  vi.resetModules();
  const { ProvedorDoBanco } = await import('../ProvedorDoBanco');
  const { default: LayoutGaleria } = await import('../../../app/galeria/_layout');
  return {
    gancho: nomesNaArvore(ProvedorDoBanco({ children: null })),
    galeria: nomesNaArvore(LayoutGaleria()),
  };
}

describe('ferramentas de desenvolvimento só no ambiente local', () => {
  beforeEach(() => {
    configuracao.extra = undefined;
  });

  it('com ambiente "local": o gancho de verificação do banco e a galeria existem', async () => {
    const { gancho, galeria } = await carregar({ ambiente: 'local' });
    expect(gancho).toContain('VerificacaoPorLink');
    expect(galeria).toContain('Slot');
    expect(galeria).not.toContain('Texto');
  });

  it('com `extra.ambiente` ausente: o gancho some e a galeria mostra só o aviso de indisponível', async () => {
    const { gancho, galeria } = await carregar({});
    expect(gancho).not.toContain('VerificacaoPorLink');
    expect(galeria).not.toContain('Slot');
    expect(galeria).toContain('Texto');
  });

  it('sem nenhuma configuração do Expo: o mesmo, tudo desligado', async () => {
    const { gancho, galeria } = await carregar(undefined);
    expect(gancho).not.toContain('VerificacaoPorLink');
    expect(galeria).not.toContain('Slot');
  });

  it('com ambiente "producao" explícito: tudo desligado', async () => {
    const { gancho, galeria } = await carregar({ ambiente: 'producao' });
    expect(gancho).not.toContain('VerificacaoPorLink');
    expect(galeria).not.toContain('Slot');
  });
});
