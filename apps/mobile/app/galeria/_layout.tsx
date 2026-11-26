import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { config } from '../../src/config';
import { Texto } from '../../src/componentes';
import { textos } from '../../src/textos';
import { useTema } from '../../src/tema';

// A galeria é ferramenta de desenvolvimento (B2): abre só no ambiente local, nunca num app de loja.
export default function LayoutGaleria() {
  const { cores } = useTema();
  if (config.ambiente !== 'local') {
    return (
      <View style={[estilos.fora, { backgroundColor: cores.fundo }]}>
        <Texto>{textos.galeria.indisponivel}</Texto>
      </View>
    );
  }
  return <Slot />;
}

const estilos = StyleSheet.create({
  fora: { flex: 1, justifyContent: 'center', padding: 24 },
});
