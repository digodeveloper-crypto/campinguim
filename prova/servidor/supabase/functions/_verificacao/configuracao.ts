// Configuração da verificação do aparelho, lida do ambiente do servidor.
// Tudo falha fechado: sem valor, o servidor se comporta como produção e recusa.
// - A prova de desenvolvimento só é aceita com AMBIENTE=local E a chave ligada (SPEC, seção 11).
// - O dublê de teste do Google só existe com AMBIENTE=local E a chave ligada E um segredo local.
// Em produção (AMBIENTE diferente de "local", ou ausente), as duas ficam desligadas mesmo que
// alguém ligue a chave por engano. Um teste automático garante isso.

import { certificadoParaBase64Url } from './veredito.ts';

export type Ambiente = 'local' | 'producao';

export type ConfiguracaoVerificacao = {
  ambiente: Ambiente;
  aceitarProvaDesenvolvimento: boolean;
  usarDubleLocal: boolean;
  segredoDuble: string | null;
  /** Nome do pacote Android esperado no veredito. Sem ele, toda prova da Play é recusada. */
  pacote: string | null;
  /** Certificados aceitos (base64 URL). Sem nenhum, toda prova da Play é recusada. */
  certificados: string[];
  idadeMaximaTokenMs: number;
  toleranciaFuturoMs: number;
  validadeAparelhoMs: number;
};

type LerVariavel = (nome: string) => string | undefined;

// PREMISSAS da prova (a SPEC diz só "tempo limitado"). Valor final é decisão do responsável.
const PADRAO = {
  idadeMaximaTokenS: 300,
  toleranciaFuturoS: 60,
  validadeAparelhoH: 24,
};

function inteiroPositivo(valor: string | undefined, padrao: number): number {
  if (valor === undefined || valor.trim() === '') return padrao;
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : padrao;
}

export function lerConfiguracao(ler: LerVariavel): ConfiguracaoVerificacao {
  const ambiente: Ambiente = ler('AMBIENTE') === 'local' ? 'local' : 'producao';
  const local = ambiente === 'local';
  const segredo = ler('VERIFICACAO_DUBLE_SEGREDO') ?? '';
  const usarDubleLocal = local && ler('VERIFICACAO_DUBLE_LOCAL') === 'sim' && segredo.length >= 32;
  const pacote = (ler('VERIFICACAO_PACOTE') ?? '').trim();
  const certificados = (ler('VERIFICACAO_CERTIFICADOS_SHA256') ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .map(certificadoParaBase64Url);

  return {
    ambiente,
    aceitarProvaDesenvolvimento: local && ler('VERIFICACAO_ACEITAR_DESENVOLVIMENTO') === 'sim',
    usarDubleLocal,
    segredoDuble: usarDubleLocal ? segredo : null,
    pacote: pacote === '' ? null : pacote,
    certificados,
    idadeMaximaTokenMs: inteiroPositivo(ler('VERIFICACAO_IDADE_MAXIMA_TOKEN_S'), PADRAO.idadeMaximaTokenS) * 1000,
    toleranciaFuturoMs: inteiroPositivo(ler('VERIFICACAO_TOLERANCIA_FUTURO_S'), PADRAO.toleranciaFuturoS) * 1000,
    validadeAparelhoMs:
      inteiroPositivo(ler('VERIFICACAO_VALIDADE_APARELHO_H'), PADRAO.validadeAparelhoH) * 3600 * 1000,
  };
}
