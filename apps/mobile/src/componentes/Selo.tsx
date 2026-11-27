// 7.6 Selo (DESIGN.md; estilo.css §11): retângulo de canto cortado, traço de 2 `carro`, miolo `fundo`
// (ou `superficie` dentro de folha); texto grande em letreiro e linha de baixo, tudo na cor `carro`.
// Mostra que uma informação tem autor e data. Nunca redondo (DESIGN.md 13).
import { StyleSheet, View } from 'react-native';

import { tokens, useTema } from '../tema';
import { CantoCortado } from './CantoCortado';
import { Texto } from './Texto';

type Props = {
  /** Ex.: "6 confirmações". */
  grande: string;
  /** Ex.: "Última: Carla R., nov/2026". */
  linha: string;
  /** Dentro de folha: miolo `superficie`. */
  naFolha?: boolean;
  /** Tela do fato: respiro de 14/20. */
  largo?: boolean;
  testID?: string | undefined;
};

export function Selo({ grande, linha, naFolha = false, largo = false, testID }: Props) {
  const { cores } = useTema();
  return (
    <View testID={testID} accessible accessibilityLabel={`${grande}. ${linha}`} style={estilos.envolve}>
      <CantoCortado
        camadas={[
          { cor: cores.carro, chanfro: tokens.chanfro.selo },
          { cor: naFolha ? cores.superficie : cores.fundo, chanfro: tokens.chanfro.seloDentro, recuo: tokens.borda.selo },
        ]}
        style={largo ? estilos.largo : estilos.normal}
      >
        <Texto uso="tituloPainel" cor="carro" semLeitura>
          {grande}
        </Texto>
        <Texto uso="estado" cor="carro" semLeitura>
          {linha}
        </Texto>
      </CantoCortado>
    </View>
  );
}

const estilos = StyleSheet.create({
  envolve: { alignSelf: 'flex-start', maxWidth: '100%' },
  normal: { paddingVertical: 10, paddingHorizontal: 16, gap: 2 },
  largo: { paddingVertical: 14, paddingHorizontal: 20, gap: 2 },
});
