import enderecos from '../../../config/enderecos.json';

declare const __CHAVE_PUBLICA__: string;

const { local, producao } = enderecos as {
  local: typeof enderecos.local;
  producao: { servidor: string | null; site: string | null };
};

// Endereços lidos do único valor de configuração (config/enderecos.json; SPEC, seção 14). Nas
// versões 0.x o site e o servidor de produção ainda não têm endereço (tarefa C da 1.12); até lá a
// página usa o ambiente local em Docker.
export const config = {
  site: producao.site ?? local.site,
  /** Endereço da API do Supabase, para onde vai a lista de espera (`waitlist_join`). */
  servidor: producao.servidor ?? `http://${local.servidorNoComputador}:${String(local.portaApi)}`,
  /** Sem servidor de produção configurado, a página está no ambiente local. */
  ambienteLocal: producao.servidor === null,
  /** Chave pública do Supabase (nunca a de serviço). Vem da geração da página (vite.config.ts). */
  chavePublica: typeof __CHAVE_PUBLICA__ === 'string' ? __CHAVE_PUBLICA__ : '',
} as const;
