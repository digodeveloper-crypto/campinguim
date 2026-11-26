import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cores } from '../src/cores';
import { chamarFuncaoProtegida, nomeDaVerificacao } from '../src/servidor/chamadaProtegida';
import type { ResultadoDaChamada } from '../src/servidor/chamadaProtegida';
import { textos } from '../src/textos';

// F0-5: tela de teste da chamada protegida pela verificação do aparelho. Abre pelo link
// campinguim://verificacao.
type Estado = { tipo: 'parado' } | { tipo: 'enviando' } | { tipo: 'pronto'; resultado: ResultadoDaChamada };

function mensagem(resultado: ResultadoDaChamada): { texto: string; codigo?: string } {
  switch (resultado.tipo) {
    case 'aceita':
      return { texto: textos.verificacao.aceita };
    case 'recusada':
      return { texto: textos.verificacao.recusada, codigo: resultado.codigo };
    case 'invalida':
      return { texto: textos.verificacao.invalida, codigo: resultado.codigo };
    case 'sem_conexao':
      return { texto: textos.verificacao.semConexao };
    case 'erro':
      return { texto: textos.verificacao.erro, codigo: String(resultado.status) };
  }
}

export default function Verificacao() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'parado' });

  async function chamar(comProva: boolean) {
    setEstado({ tipo: 'enviando' });
    const resultado = await chamarFuncaoProtegida(comProva).catch((): ResultadoDaChamada => ({ tipo: 'erro', status: 0 }));
    setEstado({ tipo: 'pronto', resultado });
  }

  const prova = nomeDaVerificacao === 'desenvolvimento' ? textos.verificacao.provaDesenvolvimento : textos.verificacao.provaPlay;
  const saida = estado.tipo === 'pronto' ? mensagem(estado.resultado) : null;
  const recusada = estado.tipo === 'pronto' && estado.resultado.tipo === 'recusada';

  return (
    <ScrollView contentContainerStyle={estilos.tela}>
      <Stack.Screen options={{ title: textos.verificacao.titulo }} />
      <Text style={estilos.texto}>{textos.verificacao.explicacao}</Text>

      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>{textos.verificacao.provaUsada}</Text>
        <Text style={estilos.texto}>{prova}</Text>
      </View>

      <Botao rotulo={textos.verificacao.chamarSemProva} onPress={() => chamar(false)} desligado={estado.tipo === 'enviando'} testID="chamar-sem-prova" />
      <Botao rotulo={textos.verificacao.chamarComProva} onPress={() => chamar(true)} desligado={estado.tipo === 'enviando'} testID="chamar-com-prova" />

      <View style={[estilos.cartao, recusada && estilos.cartaoRecusa]}>
        <Text style={estilos.rotulo}>{textos.verificacao.resposta}</Text>
        {estado.tipo === 'enviando' ? <Text style={estilos.texto}>{textos.verificacao.enviando}</Text> : null}
        {saida ? (
          <>
            <Text style={estilos.mensagem} testID="resposta-mensagem">
              {saida.texto}
            </Text>
            {saida.codigo ? (
              <Text style={estilos.codigo} testID="resposta-codigo">
                {textos.verificacao.codigo(saida.codigo)}
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Botao({ rotulo, onPress, desligado, testID }: { rotulo: string; onPress: () => void; desligado: boolean; testID: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desligado}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [estilos.botao, (pressed || desligado) && estilos.botaoApertado]}
    >
      <Text style={estilos.botaoTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: 16, gap: 12 },
  texto: { fontSize: 16, color: cores.texto },
  rotulo: { fontSize: 13, color: cores.textoSuave },
  cartao: {
    backgroundColor: cores.superficie,
    borderColor: cores.linha,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cartaoRecusa: { borderColor: cores.atencao, borderWidth: 2 },
  mensagem: { fontSize: 17, fontWeight: '600', color: cores.texto },
  codigo: { fontSize: 14, color: cores.textoSuave, fontFamily: 'monospace' },
  botao: { backgroundColor: cores.acento, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center' },
  botaoApertado: { opacity: 0.6 },
  botaoTexto: { fontSize: 16, fontWeight: '600', color: cores.sobreAcento },
});
