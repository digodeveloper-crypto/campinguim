import Constants from 'expo-constants';

// Endereços lidos do único valor de configuração (prova/config/enderecos.json), que o
// app.config.ts copia para `extra` na hora do build. Nenhum endereço é escrito em outro lugar.
type Extra = {
  servidor: string;
  portaApi: number;
  portaSincronizacao: number;
  site: string;
  supabaseChavePublica: string;
  verificacaoDesenvolvimento: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const config = {
  urlApi: `http://${extra.servidor}:${extra.portaApi}`,
  urlSincronizacao: `http://${extra.servidor}:${extra.portaSincronizacao}`,
  site: extra.site,
  supabaseChavePublica: extra.supabaseChavePublica,
  verificacaoDesenvolvimento: extra.verificacaoDesenvolvimento === true,
};
