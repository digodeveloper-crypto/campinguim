// Regra da chamada protegida (SPEC, seções 8 e 11; DEF-04, FRD-04): sem verificação válida do
// aparelho, a resposta é `integrity_required`. É a mesma proteção que `trip_set_camping` e
// `submit_fact_reports` vão usar. Não depende de Deno nem de Node: rede, banco e relógio
// chegam por `Dependencias`, e os testes trocam cada um.

import type { ConfiguracaoVerificacao } from './configuracao.ts';
import type { DecodificadorDeToken } from './decodificador.ts';
import { resumoDoPedido, sha256Hex } from './resumo.ts';
import { avaliarVeredito } from './veredito.ts';

export const FUNCAO = 'prova_chamada_protegida';

export type Prova = { tipo: 'play_integrity' | 'desenvolvimento'; token: string };

export type Entrada = {
  install_id: string;
  request_id: string;
  dados: unknown;
  prova?: Prova;
};

export type Tentativa = {
  installId: string;
  resultado: 'accepted' | 'refused';
  motivo: string;
};

export interface Repositorio {
  /** Quando o aparelho foi verificado pela última vez (ms), ou null. */
  verificadoEm(installId: string): Promise<number | null>;
  marcarVerificado(installId: string, quandoMs: number): Promise<void>;
  /** Grava o resumo do token. Devolve false se ele já tinha sido usado. */
  registrarTokenUsado(resumoDoToken: string): Promise<boolean>;
  registrarTentativa(tentativa: Tentativa): Promise<void>;
}

export type Dependencias = {
  config: ConfiguracaoVerificacao;
  decodificador: DecodificadorDeToken;
  repositorio: Repositorio;
  agora: () => number;
};

export type Resposta = { status: number; corpo: Record<string, unknown> };

const ID = /^[A-Za-z0-9-]{16,64}$/;
const TAMANHO_MAXIMO_DADOS = 4096;
const TAMANHO_MAXIMO_TOKEN = 16384;

export const RESPOSTA_VALIDACAO: Resposta = {
  status: 400,
  corpo: { code: 'validation', message: 'Pedido inválido.' },
};

// A resposta de recusa é sempre a mesma: o motivo fica só no registro interno, para não
// ensinar a quem tenta burlar o que faltou.
export const RESPOSTA_RECUSA: Resposta = {
  status: 403,
  corpo: { code: 'integrity_required', message: 'Verificação do aparelho necessária.' },
};

export function validarEntrada(bruta: unknown): Entrada | null {
  if (!bruta || typeof bruta !== 'object' || Array.isArray(bruta)) return null;
  const e = bruta as Record<string, unknown>;
  if (typeof e.install_id !== 'string' || !ID.test(e.install_id)) return null;
  if (typeof e.request_id !== 'string' || !ID.test(e.request_id)) return null;
  if (JSON.stringify(e.dados ?? null).length > TAMANHO_MAXIMO_DADOS) return null;
  let prova: Prova | undefined;
  if (e.prova !== undefined && e.prova !== null) {
    const p = e.prova as Record<string, unknown>;
    if (typeof p !== 'object' || (p.tipo !== 'play_integrity' && p.tipo !== 'desenvolvimento')) return null;
    if (typeof p.token !== 'string' || p.token.length === 0 || p.token.length > TAMANHO_MAXIMO_TOKEN) return null;
    prova = { tipo: p.tipo, token: p.token };
  }
  return { install_id: e.install_id, request_id: e.request_id, dados: e.dados ?? null, prova };
}

async function avaliarProva(
  entrada: Entrada & { prova: Prova },
  deps: Dependencias,
): Promise<{ aceito: true } | { aceito: false; motivo: string }> {
  const { config, decodificador, repositorio } = deps;
  const resumo = await resumoDoPedido(FUNCAO, entrada.install_id, entrada.request_id, entrada.dados);
  const { prova } = entrada;

  if (prova.tipo === 'desenvolvimento') {
    if (!config.aceitarProvaDesenvolvimento) return { aceito: false, motivo: 'prova_desenvolvimento_desligada' };
    if (prova.token !== `dev-falsa:${resumo}`) return { aceito: false, motivo: 'prova_desenvolvimento_invalida' };
  } else if (!config.pacote || config.certificados.length === 0) {
    return { aceito: false, motivo: 'verificacao_nao_configurada' };
  }

  // Cada token vale uma vez só. O registro vem antes de abrir o token: quem repete não chega
  // nem a gastar uma chamada ao Google.
  if (!(await repositorio.registrarTokenUsado(await sha256Hex(prova.token)))) {
    return { aceito: false, motivo: 'token_repetido' };
  }
  if (prova.tipo === 'desenvolvimento') return { aceito: true };

  const aberto = await decodificador.decodificar(prova.token, config.pacote as string);
  if (!aberto.ok) return { aceito: false, motivo: aberto.motivo };

  const avaliado = avaliarVeredito(aberto.veredito, {
    pacote: config.pacote as string,
    resumoDoPedido: resumo,
    certificados: config.certificados,
    agoraMs: deps.agora(),
    idadeMaximaMs: config.idadeMaximaTokenMs,
    toleranciaFuturoMs: config.toleranciaFuturoMs,
  });
  return avaliado.aceito ? { aceito: true } : { aceito: false, motivo: avaliado.motivo };
}

export async function chamadaProtegida(bruta: unknown, deps: Dependencias): Promise<Resposta> {
  const entrada = validarEntrada(bruta);
  if (!entrada) return RESPOSTA_VALIDACAO;
  const { repositorio } = deps;

  let verificadoPor: string;
  if (entrada.prova) {
    const resultado = await avaliarProva(entrada as Entrada & { prova: Prova }, deps);
    if (!resultado.aceito) {
      await repositorio.registrarTentativa({ installId: entrada.install_id, resultado: 'refused', motivo: resultado.motivo });
      return RESPOSTA_RECUSA;
    }
    await repositorio.marcarVerificado(entrada.install_id, deps.agora());
    verificadoPor = entrada.prova.tipo;
  } else {
    // Sem prova nesta chamada: vale a marca de aparelho verificado, se ainda estiver no prazo.
    const verificadoEm = await repositorio.verificadoEm(entrada.install_id);
    const motivo =
      verificadoEm === null
        ? 'sem_prova'
        : deps.agora() - verificadoEm > deps.config.validadeAparelhoMs
          ? 'marca_do_aparelho_vencida'
          : null;
    if (motivo) {
      await repositorio.registrarTentativa({ installId: entrada.install_id, resultado: 'refused', motivo });
      return RESPOSTA_RECUSA;
    }
    verificadoPor = 'marca_do_aparelho';
  }

  await repositorio.registrarTentativa({ installId: entrada.install_id, resultado: 'accepted', motivo: verificadoPor });
  return {
    status: 200,
    corpo: { ok: true, verificado_por: verificadoPor, resultado: 'Chamada protegida executada.' },
  };
}
