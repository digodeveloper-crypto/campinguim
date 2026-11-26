import enderecos from '../../../config/enderecos.json';

// Endereços lidos do único valor de configuração (config/enderecos.json). Nas versões 0.x o site
// de produção ainda não tem endereço decidido; até lá a página usa o ambiente local.
export const config = {
  site: enderecos.producao.site ?? enderecos.local.site,
} as const;
