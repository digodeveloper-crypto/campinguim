import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { cores } from '../src/cores';
import { ProvedorDoBanco } from '../src/dados/ProvedorDoBanco';

export default function Layout() {
  return (
    <ProvedorDoBanco>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} />
    </ProvedorDoBanco>
  );
}
