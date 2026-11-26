// Interface do servidor para abrir o token da Play Integrity. Em produção, quem abre é o
// Google (`decodeIntegrityToken`, com a conta de serviço do projeto Cloud vinculado). Aqui ficam:
// - `DecodificadorGooglePendente`: o lugar da chamada real. Sem a conta do Google Play e sem o
//   projeto Cloud (F0-6, PENDENTE), ele recusa todo token. Falha fechado.
// - `DubleLocalDeTeste`: DUBLÊ DE TESTE, só no ambiente local, nunca em produção (ver
//   configuracao.ts). Abre tokens montados pelos testes e assinados com um segredo local.
//   Não é um token da Play e não prova nada sobre o Google: serve para exercitar o caminho
//   inteiro do servidor (banco, repetição, prazo) com vereditos no formato oficial.

import type { VereditoPlayIntegrity } from './veredito.ts';

export type FalhaDeDecodificacao = 'token_invalido' | 'assinatura_invalida' | 'decodificador_indisponivel';

export type ResultadoDaDecodificacao =
  | { ok: true; veredito: VereditoPlayIntegrity }
  | { ok: false; motivo: FalhaDeDecodificacao };

export interface DecodificadorDeToken {
  readonly nome: string;
  decodificar(token: string, pacote: string): Promise<ResultadoDaDecodificacao>;
}

export class DecodificadorGooglePendente implements DecodificadorDeToken {
  readonly nome = 'google_pendente_F0-6';

  // F0-6: POST https://playintegrity.googleapis.com/v1/<pacote>:decodeIntegrityToken
  // com { integrity_token } e o acesso da conta de serviço (escopo playintegrity).
  decodificar(_token: string, _pacote: string): Promise<ResultadoDaDecodificacao> {
    return Promise.resolve({ ok: false, motivo: 'decodificador_indisponivel' });
  }
}

export const PREFIXO_DUBLE = 'DUBLE_TESTE_LOCAL';

export function base64UrlParaBytes(texto: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(texto)) return null;
  const comum = texto.replaceAll('-', '+').replaceAll('_', '/');
  try {
    const binario = atob(comum + '='.repeat((4 - (comum.length % 4)) % 4));
    return Uint8Array.from(binario, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

export class DubleLocalDeTeste implements DecodificadorDeToken {
  readonly nome = 'duble_local_de_teste';
  private readonly segredo: string;

  constructor(segredo: string) {
    this.segredo = segredo;
  }

  async decodificar(token: string, _pacote: string): Promise<ResultadoDaDecodificacao> {
    const partes = token.split('.');
    if (partes.length !== 3 || partes[0] !== PREFIXO_DUBLE) return { ok: false, motivo: 'token_invalido' };
    const conteudo = base64UrlParaBytes(partes[1]);
    const assinatura = base64UrlParaBytes(partes[2]);
    if (!conteudo || !assinatura) return { ok: false, motivo: 'token_invalido' };

    const chave = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.segredo),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valida = await crypto.subtle.verify('HMAC', chave, assinatura, new TextEncoder().encode(partes[1]));
    if (!valida) return { ok: false, motivo: 'assinatura_invalida' };

    try {
      const corpo = JSON.parse(new TextDecoder().decode(conteudo));
      // O Google devolve o veredito dentro de `tokenPayloadExternal`.
      const veredito = corpo?.tokenPayloadExternal;
      if (!veredito || typeof veredito !== 'object') return { ok: false, motivo: 'token_invalido' };
      return { ok: true, veredito };
    } catch {
      return { ok: false, motivo: 'token_invalido' };
    }
  }
}
