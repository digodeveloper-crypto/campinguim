import * as AppIntegrity from '@expo/app-integrity';

import type { ProvaDeIntegridade, VerificacaoDoAparelho } from './interface';

// Único arquivo do app que importa a biblioteca do Expo (pedido padrão da Play Integrity).
// Só funciona com o app instalado pela Play e o projeto Cloud vinculado (F0-6, pendente).
export class VerificacaoPlayIntegrity implements VerificacaoDoAparelho {
  readonly nome = 'play_integrity';

  constructor(private readonly numeroDoProjetoCloud: string) {}

  async preparar(): Promise<void> {
    await AppIntegrity.prepareIntegrityTokenProviderAsync(this.numeroDoProjetoCloud);
  }

  async obterProva(resumoDoPedido: string): Promise<ProvaDeIntegridade> {
    const token = await AppIntegrity.requestIntegrityCheckAsync(resumoDoPedido);
    return { tipo: 'play_integrity', token };
  }
}
