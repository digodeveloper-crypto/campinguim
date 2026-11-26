import Constants from 'expo-constants';

// Endereços do ambiente, lidos do único valor de configuração (config/enderecos.json), que o
// app.config.ts copia para `extra` na hora do build. Nenhum endereço é escrito em outro lugar.
// A B4 e a 2.1 passam a usar estes valores (banco local, sincronização e login).
type Extra = {
  ambiente: 'local';
  servidor: string;
  portaApi: number;
  portaSincronizacao: number;
  site: string;
  supabaseChavePublica: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const config = {
  ambiente: extra.ambiente ?? 'local',
  urlApi: `http://${extra.servidor ?? ''}:${String(extra.portaApi ?? '')}`,
  urlSincronizacao: `http://${extra.servidor ?? ''}:${String(extra.portaSincronizacao ?? '')}`,
  site: extra.site ?? '',
  supabaseChavePublica: extra.supabaseChavePublica ?? '',
} as const;
