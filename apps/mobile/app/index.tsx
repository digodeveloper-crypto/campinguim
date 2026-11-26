import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../src/cores';
import { textos } from '../src/textos';

// Tela provisória da B1: só prova que o app gera, instala e abre. As telas de verdade começam na
// etapa 1 (feature 1.1), com os componentes da B2.
export default function TelaProvisoria() {
  const t = textos.telaProvisoria;
  return (
    <SafeAreaView style={estilos.tela} testID="tela-provisoria">
      <View style={estilos.cartao}>
        <Text style={estilos.titulo} accessibilityRole="header">
          {t.titulo}
        </Text>
        <Text style={estilos.subtitulo}>{t.subtitulo}</Text>
        <Text style={estilos.detalhe}>{t.detalhe}</Text>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, justifyContent: 'center', padding: 24 },
  cartao: { backgroundColor: cores.superficie, borderRadius: 16, padding: 24, gap: 12 },
  titulo: { color: cores.acento, fontSize: 32, fontWeight: '700' },
  subtitulo: { color: cores.texto, fontSize: 20 },
  detalhe: { color: cores.textoSuave, fontSize: 16, lineHeight: 24 },
});
