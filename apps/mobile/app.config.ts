/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
import type { ExpoConfig } from 'expo/config';

import enderecos from '../../config/enderecos.json';

// Lê a chave PÚBLICA do Supabase local de `.env.local` na raiz do repositório (fora do git; criado
// por `npm run ambiente:subir`). Nenhuma chave de serviço ou senha entra no app (DEF-09).
function chavePublicaLocal(): string {
  const arquivo = path.resolve(__dirname, '..', '..', '.env.local');
  if (!fs.existsSync(arquivo)) return '';
  for (const linha of fs.readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const m = /^\s*SUPABASE_CHAVE_PUBLICA\s*=\s*(.*)\s*$/.exec(linha);
    if (m?.[1]) return m[1].replace(/^["']|["']$/g, '');
  }
  return '';
}

const local = enderecos.local;
const hostDoSite = new URL(local.site).host;

// PROVISÓRIO (decisão D1 do responsável, 26/11/2026): fica `com.campinguim.prova` até existir a
// conta do Google Play e o domínio. O definitivo sai do domínio escrito ao contrário (por exemplo
// `br.com.campinguim`) e tem de estar fixado antes de criar o app no Google Play.
const PACOTE_PROVISORIO = 'com.campinguim.prova';

const config: ExpoConfig = {
  name: 'Campinguim',
  slug: 'campinguim',
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
    // Alarme exato para o lembrete local: mantido pela decisão D2 (26/11/2026). A regra de quando
    // pedir e o texto entram na feature 1.6.
    permissions: ['android.permission.SCHEDULE_EXACT_ALARM'],
    // Permissões que o modelo do Expo e as bibliotecas trazem e o app não usa (ponto J9 da prova):
    // saem do manifesto final mesclado. Localização nunca (PRV-02); USE_EXACT_ALARM não (política
    // do Google Play). A do c2dm é a dos avisos por servidor: volta só na feature que os criar.
    blockedPermissions: [
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.USE_EXACT_ALARM',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'com.google.android.c2dm.permission.RECEIVE',
      'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
      // Selos de ícone de fabricantes (ShortcutBadger)
      'com.anddoes.launcher.permission.UPDATE_COUNT',
      'com.htc.launcher.permission.READ_SETTINGS',
      'com.htc.launcher.permission.UPDATE_SHORTCUT',
      'com.huawei.android.launcher.permission.CHANGE_BADGE',
      'com.huawei.android.launcher.permission.READ_SETTINGS',
      'com.huawei.android.launcher.permission.WRITE_SETTINGS',
      'com.majeur.launcher.permission.UPDATE_BADGE',
      'com.oppo.launcher.permission.READ_SETTINGS',
      'com.oppo.launcher.permission.WRITE_SETTINGS',
      'com.sec.android.provider.badge.permission.READ',
      'com.sec.android.provider.badge.permission.WRITE',
      'com.sonyericsson.home.permission.BROADCAST_BADGE',
      'com.sonymobile.home.permission.PROVIDER_INSERT_BADGE',
      'me.everything.badger.permission.BADGE_COUNT_READ',
      'me.everything.badger.permission.BADGE_COUNT_WRITE',
    ],
    // Link https que abre o app (SPEC, seção 7). O domínio vem do único valor de configuração.
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
    ['./plugins/trafego-local.cjs', { host: local.servidorNoEmulador }],
    './plugins/cmake-caminho-longo.cjs',
  ],
  extra: {
    ambiente: 'local',
    servidor: local.servidorNoEmulador,
    portaApi: local.portaApi,
    portaSincronizacao: local.portaSincronizacao,
    site: local.site,
    supabaseChavePublica: chavePublicaLocal(),
  },
};

export default config;
