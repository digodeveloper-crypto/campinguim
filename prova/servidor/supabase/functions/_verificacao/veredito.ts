// Avaliação do veredito da Play Integrity (pedido padrão), escrita contra o formato oficial:
// developer.android.com/google/play/integrity/verdicts (conferido em 24/11/2026).
// Função pura: não chama rede nem banco. Recusa tudo o que não for, ao mesmo tempo, app
// reconhecido pela Play, licença válida e aparelho íntegro, para o pacote e o pedido esperados.

export type VereditoPlayIntegrity = {
  requestDetails?: {
    requestPackageName?: string;
    requestHash?: string;
    timestampMillis?: string | number;
  };
  appIntegrity?: {
    appRecognitionVerdict?: string;
    packageName?: string;
    certificateSha256Digest?: string[];
    versionCode?: string;
  };
  deviceIntegrity?: {
    deviceRecognitionVerdict?: string[];
  };
  accountDetails?: {
    appLicensingVerdict?: string;
  };
  environmentDetails?: unknown;
};

export type Esperado = {
  pacote: string;
  resumoDoPedido: string;
  /** Resumos SHA-256 dos certificados aceitos, em base64 URL (o formato do veredito). */
  certificados: string[];
  agoraMs: number;
  idadeMaximaMs: number;
  toleranciaFuturoMs: number;
};

export type MotivoDoVeredito =
  | 'veredito_malformado'
  | 'pacote_do_pedido_diferente'
  | 'resumo_do_pedido_diferente'
  | 'token_vencido'
  | 'token_do_futuro'
  | 'app_versao_nao_reconhecida'
  | 'app_nao_avaliado'
  | 'app_veredito_desconhecido'
  | 'pacote_do_app_diferente'
  | 'certificado_diferente'
  | 'licenca_ausente'
  | 'licenca_nao_avaliada'
  | 'licenca_veredito_desconhecido'
  | 'aparelho_sem_integridade';

export type ResultadoDoVeredito = { aceito: true } | { aceito: false; motivo: MotivoDoVeredito };

// Rótulos de aparelho que contam como "aparelho íntegro". MEETS_BASIC_INTEGRITY (carregador de
// inicialização pode estar aberto) e MEETS_VIRTUAL_INTEGRITY (emulador) não bastam (DEF-04:
// "aparelho real"). Sem rótulo nenhum, o campo vem ausente: recusa.
const ROTULOS_ACEITOS = new Set(['MEETS_DEVICE_INTEGRITY', 'MEETS_STRONG_INTEGRITY']);

function recusa(motivo: MotivoDoVeredito): ResultadoDoVeredito {
  return { aceito: false, motivo };
}

/** Tira o preenchimento "=" e troca o alfabeto comum pelo URL, para comparar resumos. */
export function normalizarBase64Url(valor: string): string {
  return valor.trim().replace(/=+$/, '').replaceAll('+', '-').replaceAll('/', '_');
}

/**
 * Aceita o resumo do certificado como a Play Console mostra (hexadecimal com dois-pontos,
 * "AB:CD:…") ou já em base64 URL, e devolve em base64 URL sem preenchimento.
 */
export function certificadoParaBase64Url(valor: string): string {
  const semSeparador = valor.trim().replaceAll(':', '');
  if (/^[0-9a-fA-F]{64}$/.test(semSeparador)) {
    let binario = '';
    for (let i = 0; i < 64; i += 2) binario += String.fromCharCode(parseInt(semSeparador.slice(i, i + 2), 16));
    return normalizarBase64Url(btoa(binario));
  }
  return normalizarBase64Url(valor);
}

export function avaliarVeredito(veredito: VereditoPlayIntegrity, esperado: Esperado): ResultadoDoVeredito {
  if (!veredito || typeof veredito !== 'object') return recusa('veredito_malformado');

  // 1. Primeiro o pedido: pacote, resumo e horário (a documentação manda conferir antes dos vereditos).
  const pedido = veredito.requestDetails;
  if (!pedido || typeof pedido !== 'object') return recusa('veredito_malformado');
  if (pedido.requestPackageName !== esperado.pacote) return recusa('pacote_do_pedido_diferente');
  if (typeof pedido.requestHash !== 'string' || pedido.requestHash !== esperado.resumoDoPedido) {
    return recusa('resumo_do_pedido_diferente');
  }
  const horario = Number(pedido.timestampMillis);
  if (pedido.timestampMillis === undefined || !Number.isFinite(horario)) return recusa('veredito_malformado');
  if (esperado.agoraMs - horario > esperado.idadeMaximaMs) return recusa('token_vencido');
  if (horario - esperado.agoraMs > esperado.toleranciaFuturoMs) return recusa('token_do_futuro');

  // 2. O app: reconhecido pela Play, com o nosso pacote e o nosso certificado.
  const app = veredito.appIntegrity;
  if (!app || typeof app !== 'object') return recusa('veredito_malformado');
  switch (app.appRecognitionVerdict) {
    case 'PLAY_RECOGNIZED':
      break;
    case 'UNRECOGNIZED_VERSION':
      return recusa('app_versao_nao_reconhecida');
    case 'UNEVALUATED':
      return recusa('app_nao_avaliado');
    default:
      return recusa('app_veredito_desconhecido');
  }
  if (app.packageName !== esperado.pacote) return recusa('pacote_do_app_diferente');
  const aceitos = new Set(esperado.certificados.map(normalizarBase64Url));
  const doToken = Array.isArray(app.certificateSha256Digest) ? app.certificateSha256Digest : [];
  if (
    aceitos.size === 0 ||
    doToken.length === 0 ||
    !doToken.every((c) => typeof c === 'string' && aceitos.has(normalizarBase64Url(c)))
  ) {
    return recusa('certificado_diferente');
  }

  // 3. A licença: instalado pela Play por quem tem direito ao app.
  switch (veredito.accountDetails?.appLicensingVerdict) {
    case 'LICENSED':
      break;
    case 'UNLICENSED':
      return recusa('licenca_ausente');
    case 'UNEVALUATED':
      return recusa('licenca_nao_avaliada');
    default:
      return recusa('licenca_veredito_desconhecido');
  }

  // 4. O aparelho: real e íntegro.
  const rotulos = veredito.deviceIntegrity?.deviceRecognitionVerdict;
  if (!Array.isArray(rotulos) || !rotulos.some((r) => ROTULOS_ACEITOS.has(r))) {
    return recusa('aparelho_sem_integridade');
  }

  return { aceito: true };
}
