// Esqueleto de uma tela do Rumo: fundo `fundo`, curvas de nível no topo, conteúdo rolável com a margem
// lateral de 16 mais a área segura, e o rodapé fixo fora da rolagem (o conteúdo termina sempre acima dele).
import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StatusBar as BarraDoSistema, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens, useTema } from '../tema';
import { Curvas } from './Curvas';

type Props = {
  children: ReactNode;
  rodape?: ReactNode;
  /** Curvas de nível no fundo do topo (padrão: sim). `forte` na abertura. */
  curvas?: boolean | 'forte';
  testID?: string | undefined;
};

export function Tela({ children, rodape, curvas = true, testID }: Props) {
  const { cores, escuro } = useTema();
  const margens = useSafeAreaInsets();
  // Na abertura a frio a área segura pode chegar zerada; no Android, a altura da barra de status já vem
  // pronta do sistema (QA B2, rodada 1: conteúdo rolado aparecia sob o relógio).
  const topo = Math.max(margens.top, Platform.OS === 'android' ? (BarraDoSistema.currentHeight ?? 0) : 0);
  return (
    // A rolagem começa abaixo da barra de status: o conteúdo nunca passa por baixo dos ícones do sistema.
    <View testID={testID} style={[estilos.tela, { backgroundColor: cores.fundo, paddingTop: topo }]}>
      {/* Ícones da barra de status legíveis no tema da tela. */}
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: rodape ? 24 : 32 + margens.bottom,
          paddingLeft: tokens.espaco.margemTela + margens.left,
          paddingRight: tokens.espaco.margemTela + margens.right,
        }}
      >
        {curvas ? <Curvas forte={curvas === 'forte'} /> : null}
        {children}
      </ScrollView>
      {rodape}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
});
