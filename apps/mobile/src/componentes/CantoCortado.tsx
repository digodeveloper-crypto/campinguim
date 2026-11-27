// Fundo de canto cortado (o octógono alongado do selo e do apoio do mascote; DESIGN.md 5).
// Desenha atrás do conteúdo, no tamanho que o conteúdo ocupar. Selo redondo nunca (DESIGN.md 13).
import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { cantoCortado } from './formatar';

type Camada = { cor: string; chanfro: number; recuo?: number };

type Props = {
  camadas: Camada[];
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function CantoCortado({ camadas, style, children }: Props) {
  const [tamanho, setTamanho] = useState<{ w: number; h: number } | null>(null);
  const medir = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!tamanho || tamanho.w !== width || tamanho.h !== height) setTamanho({ w: width, h: height });
  };
  return (
    <View style={style} onLayout={medir}>
      {tamanho ? (
        <Svg style={StyleSheet.absoluteFill} width={tamanho.w} height={tamanho.h} pointerEvents="none">
          {camadas.map((c, i) => (
            <Polygon key={i} points={cantoCortado(tamanho.w, tamanho.h, c.chanfro, c.recuo ?? 0)} fill={c.cor} />
          ))}
        </Svg>
      ) : null}
      {children}
    </View>
  );
}
