/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import type { ExpoConfig } from 'expo/config';

import enderecos from '../config/enderecos.json';

// Lê `prova/.env.local` (fora do git). Só a chave pública do Supabase local vai para o app;
// nenhuma chave de serviço ou senha entra aqui (DEF-09).
function lerEnvLocal(): Record<string, string> {
  const arquivo = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(arquivo)) return {};
  const valores: Record<string, string> = {};
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(linha);
    if (m) valores[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return valores;
}

const env = lerEnvLocal();
const hostDoSite = new URL(enderecos.site).host;

// PROVISÓRIO (decisão H6 pendente): o nome definitivo do pacote é decisão do responsável antes
// de F0-6. Este nome serve só para a prova local e nunca vai ao Google Play.
const PACOTE_PROVISORIO = 'com.campinguim.prova';

const config: ExpoConfig = {
  name: 'Campinguim prova',
  slug: 'campinguim-prova',
  version: '0.0.0',
  orientation: 'portrait',
  icon: './assets/icone.png',
  scheme: 'campinguim',
  android: {
    package: PACOTE_PROVISORIO,
    adaptiveIcon: {
      backgroundImage: './assets/icone-fundo.png',
      foregroundImage: './assets/icone-frente.png',
      monochromeImage: './assets/icone-uma-cor.png',
    },
    predictiveBackGestureEnabled: false,
    // Alarme exato para o lembrete local (F0-3): concedido pela pessoa numa tela do sistema.
    permissions: ['android.permission.SCHEDULE_EXACT_ALARM'],
    // USE_EXACT_ALARM não é usada (política do Google Play); localização nunca (PRV-02).
    blockedPermissions: [
      'android.permission.USE_EXACT_ALARM',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
    ],
    // Link https que abre a viagem (F0-4). O domínio vem do único valor de configuração.
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: hostDoSite, pathPrefix: '/viagem' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  plugins: [
    'expo-router',
    [
      'expo-notifications',
      {
        icon: './assets/icone-uma-cor.png',
        color: '#1F4B4D',
      },
    ],
    ['./plugins/trafego-local', { host: enderecos.servidor }],
    './plugins/cmake-caminho-longo',
  ],
  extra: {
    servidor: enderecos.servidor,
    portaApi: enderecos.portaApi,
    portaSincronizacao: enderecos.portaSincronizacao,
    site: enderecos.site,
    supabaseChavePublica: env.SUPABASE_CHAVE_PUBLICA ?? '',
    // Prova de desenvolvimento da verificação do aparelho (F0-5). Só no local.
    verificacaoDesenvolvimento: true,
  },
};

export default config;
