// Permissões do app no manifesto final mesclado (ponto J9 da prova técnica; PRV-02; decisão D2).
// Lê o APK gerado por `npm run app:gerar`. APK ausente, ou mais velho que app.config.ts,
// package.json ou plugins do app, conta como ausente: o teste é pulado com o motivo no nome, e o
// `npm run testar` marca a etapa como PULADO (a suíte fica INCOMPLETA, nunca "completa").
import { describe, expect, it } from 'vitest';

import { estadoDoApk, permissoesDoApk } from '../app.mjs';

// Lista fechada: qualquer permissão nova no app faz este teste falhar até ser conferida e
// acrescentada aqui de propósito, com o motivo.
const PERMITIDAS = {
  'android.permission.INTERNET': 'sincronização e funções do servidor',
  'android.permission.SCHEDULE_EXACT_ALARM': 'lembrete na hora certa (decisão D2, feature 1.6)',
  'android.permission.VIBRATE': 'vem do modelo do Expo; não lê dado da pessoa. Fica fora da lista do ponto J9; a feature 1.6 confirma se o aviso vibra',
  'com.campinguim.prova.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION': 'interna do Android (receptores do próprio app)',
};

const PROIBIDAS = [
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.USE_EXACT_ALARM',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'com.google.android.c2dm.permission.RECEIVE',
  'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
];

const apk = estadoDoApk();
const titulo = apk.ok ? 'manifesto final do app (ponto J9)' : `manifesto final do app (ponto J9), PULADO: ${apk.motivo}`;

describe.skipIf(!apk.ok)(titulo, () => {
  const permissoes = apk.ok ? permissoesDoApk() : [];

  it('não pede nenhuma permissão proibida', () => {
    expect(permissoes.filter((p) => PROIBIDAS.includes(p))).toEqual([]);
  });

  it('não pede selo de ícone de fabricante', () => {
    expect(permissoes.filter((p) => /badge|launcher|badger/i.test(p))).toEqual([]);
  });

  it('pede só as permissões da lista conferida', () => {
    expect(permissoes).toEqual(Object.keys(PERMITIDAS).sort());
  });
});
