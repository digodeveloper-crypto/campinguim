// 7.8 Rodapé de ação (DESIGN.md; estilo.css §13): faixa fixa embaixo, fundo `fundo`, linha de 1 em cima,
// respiro de 12/16 mais a área segura. A ação principal (e a secundária) em cima, ao alcance do polegar
// (NF-07); o botão da legenda embaixo, à direita. A tela põe o rodapé fora da rolagem, então o conteúdo
// termina sempre acima dele, em qualquer tamanho de letra.
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens, useTema } from '../tema';

type Props = {
  /** Ações (Botao principal e secundário). */
  acoes?: ReactNode;
  /** Ligação discreta abaixo das ações (tela 1). */
  discreto?: ReactNode;
  /** Botão da legenda (componente Legenda). */
  legenda?: ReactNode;
  testID?: string | undefined;
};

export function Rodape({ acoes, discreto, legenda, testID = 'rodape' }: Props) {
  const { cores } = useTema();
  const margens = useSafeAreaInsets();
  return (
    <View
      testID={testID}
      style={[estilos.rodape, { backgroundColor: cores.fundo, borderTopColor: cores.linha, paddingBottom: 12 + margens.bottom }]}
    >
      {acoes ? <View style={estilos.acoes}>{acoes}</View> : null}
      {discreto}
      {legenda}
    </View>
  );
}

const estilos = StyleSheet.create({
  rodape: {
    gap: 8,
    paddingTop: 12,
    paddingHorizontal: tokens.espaco.margemTela,
    borderTopWidth: tokens.borda.folha,
  },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.espaco.entreBotoes },
});
