import Constants from 'expo-constants';

// Endereços do ambiente, lidos do único valor de configuração (config/enderecos.json), que o
// app.config.ts copia para `extra` na hora do build. Nenhum endereço é escrito em outro lugar.
// A B4 e a 2.1 passam a usar estes valores (banco local, sincronização e login).
//
// `ambiente` só é 'local' quando o build diz isso de propósito (`extra.ambiente`). Se o valor faltar,
// o padrão é 'producao': o ambiente FECHADO, sem a galeria de componentes nem o gancho de
// verificação do banco (B1-FIX-2). O nome é o da chave de config/enderecos.json.
export type Ambiente = 'local' | 'producao';

type Extra = {
  ambiente: Ambiente;
  servidor: string;
  portaApi: number;
  portaSincronizacao: number;
  site: string;
  supabaseChavePublica: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const config = {
  ambiente: extra.ambiente ?? 'producao',
  urlApi: `http://${extra.servidor ?? ''}:${String(extra.portaApi ?? '')}`,
  urlSincronizacao: `http://${extra.servidor ?? ''}:${String(extra.portaSincronizacao ?? '')}`,
  site: extra.site ?? '',
  supabaseChavePublica: extra.supabaseChavePublica ?? '',
} as const;
