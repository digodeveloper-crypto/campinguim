import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { ProvedorDoBanco } from '../src/dados/ProvedorDoBanco';
import { FONTES, TemaProvedor, useTema } from '../src/tema';

function Pilha({ pronta }: { pronta: boolean }) {
  const { cores } = useTema();
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
      {/* Até a fonte chegar, só o fundo. A navegação já fica montada para o link de abertura achar a tela. */}
      {pronta ? null : <View style={[StyleSheet.absoluteFill, { backgroundColor: cores.fundo }]} />}
    </>
  );
}

export default function Layout() {
  // Archivo embutida (DESIGN.md 4.1). Se a fonte falhar, o app abre com a fonte do sistema.
  const [carregadas, erro] = useFonts(FONTES);
  return (
    <ProvedorDoBanco>
      <TemaProvedor fontesProntas={carregadas}>
        <Pilha pronta={carregadas || Boolean(erro)} />
      </TemaProvedor>
    </ProvedorDoBanco>
  );
}
