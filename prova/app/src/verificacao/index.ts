import { config } from '../config';
import { VerificacaoDesenvolvimento } from './desenvolvimento';
import type { VerificacaoDoAparelho } from './interface';

export type { ProvaDeIntegridade, VerificacaoDoAparelho } from './interface';
export { resumoDoPedido } from './resumo';

// Escolhe a implementação. Sem a conta do Google Play (F0-6 pendente), a prova usa a de
// desenvolvimento. A real (`./expo`) é carregada só quando for ligada, para não entrar no
// caminho de quem não precisa dela.
export function criarVerificacao(numeroDoProjetoCloud?: string): VerificacaoDoAparelho {
  if (config.verificacaoDesenvolvimento || !numeroDoProjetoCloud) {
    return new VerificacaoDesenvolvimento();
  }
  const { VerificacaoPlayIntegrity } = require('./expo') as typeof import('./expo');
  return new VerificacaoPlayIntegrity(numeroDoProjetoCloud);
}
