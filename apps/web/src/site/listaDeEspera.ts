// Lista de espera do site (feature 1.12; SPEC, seção 8, `waitlist_join`; decisão R3 do responsável):
// validação do formulário e envio ao servidor. Arquivo sem tela: o componente só mostra o resultado.
// A mesma regra de e-mail está no servidor (supabase/migrations/20261127120000_1_12_lista_de_espera.sql,
// `private.waitlist_email_is_valid`), que confere de novo: a página não é a única barreira.
import { ehTextoPendente } from '@campinguim/core/formato';

/** Sem espaço nas pontas e em minúsculas: como o servidor guarda. */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Uma arroba, nada de espaço, algo antes, domínio com ponto; até 254 caracteres e 64 antes da arroba. */
export function emailValido(email: string): boolean {
  const e = normalizarEmail(email);
  if (e.length > 254) return false;
  if (!/^[^\s@]{1,64}@[^\s@]+\.[^\s@.]+$/.test(e)) return false;
  const dominio = e.slice(e.indexOf('@') + 1);
  return !dominio.startsWith('.') && !dominio.includes('..');
}

export type ErroDoFormulario = 'emailVazio' | 'emailInvalido' | 'semAceite';

/** O que falta no formulário, na ordem em que a pessoa preenche. Nulo: pode enviar. */
export function validarFormulario(email: string, aceite: boolean): ErroDoFormulario | null {
  if (normalizarEmail(email) === '') return 'emailVazio';
  if (!emailValido(email)) return 'emailInvalido';
  if (!aceite) return 'semAceite';
  return null;
}

/**
 * O formulário só funciona fora do ambiente local quando o texto de consentimento deixar de ser
 * rascunho (V6; decisão R3: "o site não é divulgado até lá"). No ambiente local ele funciona com o
 * rascunho, para ser testado.
 */
export function formularioLiberado(textoDoConsentimento: string, ambienteLocal: boolean): boolean {
  return ambienteLocal || !ehTextoPendente(textoDoConsentimento);
}

export type ResultadoDoEnvio = 'ok' | 'invalido' | 'muitasTentativas' | 'falhou';

export type Envio = { servidor: string; chavePublica: string; email: string; buscar?: typeof fetch };

/** Endereço da função no servidor, a partir do endereço da API vindo da configuração. */
export function enderecoDaFuncao(servidor: string): string {
  return `${servidor.replace(/\/+$/, '')}/rest/v1/rpc/waitlist_join`;
}

/**
 * Manda o e-mail e o consentimento a `waitlist_join`. Só é chamada com o consentimento marcado.
 * Nunca lança erro: falha de rede ou resposta inesperada vira 'falhou' (a pessoa tenta de novo).
 */
export async function entrarNaListaDeEspera({ servidor, chavePublica, email, buscar = fetch }: Envio): Promise<ResultadoDoEnvio> {
  try {
    const resposta = await buscar(enderecoDaFuncao(servidor), {
      method: 'POST',
      headers: { apikey: chavePublica, 'content-type': 'application/json' },
      // Sem `p_request_id`: repetir o envio já é inofensivo (o e-mail é único no servidor).
      body: JSON.stringify({ p_email: normalizarEmail(email), p_consent: true }),
    });
    if (!resposta.ok) return 'falhou';
    const corpo = (await resposta.json()) as { ok?: unknown; code?: unknown };
    if (corpo.ok === true) return 'ok';
    if (corpo.code === 'validation') return 'invalido';
    if (corpo.code === 'rate_limited') return 'muitasTentativas';
    return 'falhou';
  } catch {
    return 'falhou';
  }
}
