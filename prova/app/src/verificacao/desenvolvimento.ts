import type { ProvaDeIntegridade, VerificacaoDoAparelho } from './interface';

// Prova FALSA, marcada como de desenvolvimento. O servidor só aceita esse tipo quando a
// configuração local liga essa aceitação (desligada por padrão; SPEC, seção 11).
export class VerificacaoDesenvolvimento implements VerificacaoDoAparelho {
  readonly nome = 'desenvolvimento';

  async preparar(): Promise<void> {}

  async obterProva(resumoDoPedido: string): Promise<ProvaDeIntegridade> {
    return { tipo: 'desenvolvimento', token: `dev-falsa:${resumoDoPedido}` };
  }
}
