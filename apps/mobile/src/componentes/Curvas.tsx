// Curvas de nível no fundo do topo (DESIGN.md 5): enfeite, nunca mapa. Traço de 1, `linha` a 35 %
// (60 % na abertura), sem toque e sem leitura de tela.
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { tokens, useTema } from '../tema';
import { caminhosDasCurvas, type OpcoesCurvas } from './geradorCurvas';

type Props = {
  opcoes?: Partial<OpcoesCurvas>;
  /** Abertura e site: 60 % de opacidade. */
  forte?: boolean;
};

export function Curvas({ opcoes, forte = false }: Props) {
  const { cores, fator } = useTema();
  const { largura, altura, caminhos } = caminhosDasCurvas(opcoes);
  const opacidade = forte ? tokens.transparencia.curvasAbertura : tokens.transparencia.curvas;
  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={[estilos.fundo, { height: 240 * fator }]}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${String(largura)} ${String(altura)}`} preserveAspectRatio="xMidYMid slice">
        {caminhos.map((d, i) => (
          <Path key={i} d={d} fill="none" stroke={cores.linha} strokeOpacity={opacidade} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
      </Svg>
    </View>
  );
}

const estilos = StyleSheet.create({
  fundo: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
});
