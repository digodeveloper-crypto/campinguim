// Apoio dos testes da F0-5: vereditos de EXEMPLO e tokens do DUBLÊ DE TESTE.
// Os vereditos seguem o formato oficial da Play Integrity para o pedido padrão
// (developer.android.com/google/play/integrity/verdicts, conferido em 24/11/2026). Nenhum deles
// veio do Google: são montados aqui. O "veredito bom" serve só para mostrar que o servidor não
// recusa tudo; o controle positivo de verdade é o caso (d) da F0-6, em celular real.
import { createHmac } from 'node:crypto';

import { PREFIXO_DUBLE } from '../../supabase/functions/_verificacao/decodificador.ts';

export function vereditoBom({ pacote, resumo, certificado, agoraMs }) {
  return {
    requestDetails: {
      requestPackageName: pacote,
      requestHash: resumo,
      timestampMillis: String(agoraMs - 2000),
    },
    appIntegrity: {
      appRecognitionVerdict: 'PLAY_RECOGNIZED',
      packageName: pacote,
      certificateSha256Digest: [certificado],
      versionCode: '1',
    },
    deviceIntegrity: {
      deviceRecognitionVerdict: ['MEETS_DEVICE_INTEGRITY'],
    },
    accountDetails: {
      appLicensingVerdict: 'LICENSED',
    },
  };
}

/** Cópia do veredito com um campo trocado. `undefined` apaga o campo. */
export function alterado(veredito, caminho, valor) {
  const copia = structuredClone(veredito);
  const partes = caminho.split('.');
  let alvo = copia;
  for (const p of partes.slice(0, -1)) alvo = alvo[p];
  const ultimo = partes.at(-1);
  if (valor === undefined) delete alvo[ultimo];
  else alvo[ultimo] = valor;
  return copia;
}

/** Token do DUBLÊ LOCAL: o veredito dentro de `tokenPayloadExternal`, assinado com HMAC. */
export function tokenDuble(veredito, segredo) {
  const conteudo = Buffer.from(JSON.stringify({ tokenPayloadExternal: veredito })).toString('base64url');
  const assinatura = createHmac('sha256', segredo).update(conteudo).digest('base64url');
  return `${PREFIXO_DUBLE}.${conteudo}.${assinatura}`;
}

/**
 * Casos ruins, um por linha: [nome, como estragar o veredito bom, motivo esperado].
 * Cobrem a lista do plano (F0-5): UNRECOGNIZED_VERSION, UNEVALUATED, UNLICENSED, veredito do
 * aparelho vazio, pacote diferente, resumo diferente, token vencido; e mais alguns.
 */
export function casosRuins(base, { agoraMs }) {
  const dia = 24 * 3600 * 1000;
  return [
    ['pacote do pedido diferente', alterado(base, 'requestDetails.requestPackageName', 'com.outro.app'), 'pacote_do_pedido_diferente'],
    ['resumo do pedido diferente (prova de outro pedido)', alterado(base, 'requestDetails.requestHash', 'f'.repeat(64)), 'resumo_do_pedido_diferente'],
    ['token vencido (pedido há 1 dia)', alterado(base, 'requestDetails.timestampMillis', String(agoraMs - dia)), 'token_vencido'],
    ['horário no futuro', alterado(base, 'requestDetails.timestampMillis', String(agoraMs + dia)), 'token_do_futuro'],
    ['horário ilegível', alterado(base, 'requestDetails.timestampMillis', 'ontem'), 'veredito_malformado'],
    ['sem requestDetails', alterado(base, 'requestDetails', undefined), 'veredito_malformado'],
    ['app UNRECOGNIZED_VERSION', alterado(base, 'appIntegrity.appRecognitionVerdict', 'UNRECOGNIZED_VERSION'), 'app_versao_nao_reconhecida'],
    ['app UNEVALUATED', alterado(base, 'appIntegrity.appRecognitionVerdict', 'UNEVALUATED'), 'app_nao_avaliado'],
    ['app com veredito desconhecido', alterado(base, 'appIntegrity.appRecognitionVerdict', 'QUALQUER_OUTRO'), 'app_veredito_desconhecido'],
    ['pacote do app diferente', alterado(base, 'appIntegrity.packageName', 'com.outro.app'), 'pacote_do_app_diferente'],
    ['assinatura do app diferente (outro certificado)', alterado(base, 'appIntegrity.certificateSha256Digest', ['b3V0cm8tY2VydGlmaWNhZG8']), 'certificado_diferente'],
    ['certificado do app ausente', alterado(base, 'appIntegrity.certificateSha256Digest', []), 'certificado_diferente'],
    ['licença UNLICENSED (instalado por fora)', alterado(base, 'accountDetails.appLicensingVerdict', 'UNLICENSED'), 'licenca_ausente'],
    ['licença UNEVALUATED', alterado(base, 'accountDetails.appLicensingVerdict', 'UNEVALUATED'), 'licenca_nao_avaliada'],
    ['sem accountDetails', alterado(base, 'accountDetails', undefined), 'licenca_veredito_desconhecido'],
    ['veredito do aparelho vazio (campo ausente)', alterado(base, 'deviceIntegrity.deviceRecognitionVerdict', undefined), 'aparelho_sem_integridade'],
    ['veredito do aparelho lista vazia', alterado(base, 'deviceIntegrity.deviceRecognitionVerdict', []), 'aparelho_sem_integridade'],
    ['aparelho só MEETS_BASIC_INTEGRITY', alterado(base, 'deviceIntegrity.deviceRecognitionVerdict', ['MEETS_BASIC_INTEGRITY']), 'aparelho_sem_integridade'],
    ['aparelho MEETS_VIRTUAL_INTEGRITY (emulador)', alterado(base, 'deviceIntegrity.deviceRecognitionVerdict', ['MEETS_VIRTUAL_INTEGRITY']), 'aparelho_sem_integridade'],
    [
      'veredito limpo pelo Google ao decodificar o mesmo token de novo',
      alterado(
        alterado(alterado(base, 'deviceIntegrity', {}), 'appIntegrity.appRecognitionVerdict', 'UNEVALUATED'),
        'accountDetails.appLicensingVerdict',
        'UNEVALUATED',
      ),
      'app_nao_avaliado',
    ],
  ];
}
