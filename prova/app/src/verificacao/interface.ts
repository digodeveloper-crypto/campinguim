// Interface própria da verificação do aparelho (SPEC, seção 2; DEF-04, FRD-04).
// O resto do app só conhece este tipo. A biblioteca do Expo fica isolada em `expo.ts` e pode
// ser trocada por um módulo nativo direto sem tocar em mais nada.

export type ProvaDeIntegridade =
  | { tipo: 'play_integrity'; token: string }
  | { tipo: 'desenvolvimento'; token: string };

export interface VerificacaoDoAparelho {
  /** Nome curto da implementação, para registro (sem dado pessoal). */
  readonly nome: string;
  /** Prepara o provedor. Na Play Integrity, recebe o número do projeto no Google Cloud. */
  preparar(): Promise<void>;
  /** Pede uma prova ligada ao resumo do pedido que vai ao servidor. */
  obterProva(resumoDoPedido: string): Promise<ProvaDeIntegridade>;
}
