// 7.2 Cabeçalho da etapa, o letreiro (DESIGN.md; estilo.css §7): "Voltar" nas telas internas, a marca
// da etapa em rótulo de carta com o traço de 18 antes, o título em caixa alta e o subtítulo.
// Às vezes, o mascote de 96 no apoio (alertas, aviso de saída, estadia, camping sem dados).
import { StyleSheet, View } from 'react-native';

import { tokens, useTema } from '../tema';
import { BotaoVoltar } from './Botoes';
import { Mascote } from './mascote/Mascote';
import type { NomeArte } from './mascote/artes';
import { Texto } from './Texto';

type Props = {
  marca: string;
  titulo: string;
  subtitulo?: string | undefined;
  aoVoltar?: (() => void) | undefined;
  mascote?: Extract<NomeArte, 'pose-alerta' | 'pose-camping' | 'pose-comemorando'> | undefined;
};

export function CabecalhoEtapa({ marca, titulo, subtitulo, aoVoltar, mascote }: Props) {
  const { cores } = useTema();
  return (
    <View>
      {aoVoltar ? <BotaoVoltar aoTocar={aoVoltar} testID="voltar" /> : null}
      <View style={estilos.etapa}>
        <View style={estilos.linha}>
          <View style={estilos.texto}>
            <View style={estilos.marca}>
              <View style={[estilos.traco, { backgroundColor: cores.textoSuave }]} />
              <Texto uso="rotulo" cor="textoSuave" style={estilos.encolhe}>
                {marca}
              </Texto>
            </View>
            <Texto uso="tituloTela" titulo style={estilos.titulo}>
              {titulo}
            </Texto>
            {subtitulo ? (
              <Texto cor="textoSuave" style={estilos.sub}>
                {subtitulo}
              </Texto>
            ) : null}
          </View>
          {mascote ? <Mascote arte={mascote} largura={96} /> : null}
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  etapa: { paddingTop: 16, paddingBottom: 8 },
  linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', columnGap: 16, rowGap: 8 },
  texto: { flexGrow: 1, flexShrink: 1, flexBasis: 192, minWidth: 0 },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  traco: { width: 18, height: tokens.borda.controle },
  encolhe: { flexShrink: 1 },
  titulo: { marginTop: 8 },
  sub: { marginTop: 8 },
});

export { marcaDaEtapa } from './estados';
