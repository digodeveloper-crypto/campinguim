import { PowerSyncContext } from '@powersync/react-native';
import * as Notifications from 'expo-notifications';
import { router, Stack, usePathname, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';

import { cores } from '../src/cores';
import { banco, iniciarSincronizacao } from '../src/dados/banco';
import { textos } from '../src/textos';

// Aviso que chega com o app aberto também aparece (F0-3).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Tocar no aviso abre a tela da viagem, não o início (SPEC, seção 10). App fechado: o
// +native-intent abre a tela já na partida. App em segundo plano ou aberto: este gancho recebe a
// resposta nova e navega, só depois de o navegador estar montado (achado da F0-3: sem isso o
// toque se perdia e o app ficava no início em 2 de 10 execuções da primeira versão).
function useAbrirTelaDoAviso() {
  const navegacao = useRootNavigationState();
  const caminho = usePathname();
  const resposta = Notifications.useLastNotificationResponse();
  const jaAbertas = useRef(new Set<string>());

  useEffect(() => {
    if (!navegacao?.key || !resposta) return;
    const id = `${resposta.notification.request.identifier}:${resposta.notification.date}`;
    if (jaAbertas.current.has(id)) return;
    const url = resposta.notification.request.content.data?.url;
    if (typeof url !== 'string') return;
    jaAbertas.current.add(id);
    // Na abertura a frio o +native-intent já abriu esta tela; não abre de novo.
    if (caminho !== url) router.navigate(url as never);
  }, [navegacao?.key, resposta, caminho]);
}

export default function Layout() {
  useAbrirTelaDoAviso();

  // F0-2: com sessão guardada, a sincronização liga ao abrir o app (a fila sobe sozinha).
  useEffect(() => {
    iniciarSincronizacao().catch(() => undefined);
  }, []);

  return (
    <PowerSyncContext.Provider value={banco}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.superficie },
          headerTintColor: cores.texto,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        <Stack.Screen name="index" options={{ title: textos.app.titulo }} />
        <Stack.Screen name="viagem/[id]" options={{ title: textos.viagem.titulo }} />
        <Stack.Screen name="lembretes" options={{ title: textos.lembretes.tela }} />
        <Stack.Screen name="links" options={{ title: textos.links.tela }} />
      </Stack>
    </PowerSyncContext.Provider>
  );
}
