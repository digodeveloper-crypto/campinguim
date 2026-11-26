import * as Notifications from 'expo-notifications';

// Abertura a frio pelo toque num lembrete (F0-3): o app já nasce na tela do aviso, sem corrida
// com o roteador. Sem isso, o toque às vezes parava no início (1 de 10 depois de reiniciar).
// Em qualquer outra abertura, o caminho segue como veio.
export async function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    if (initial) {
      const resposta = await Notifications.getLastNotificationResponseAsync();
      const url = resposta?.notification.request.content.data?.url;
      if (typeof url === 'string') return url;
    }
  } catch {
    // Sem resposta legível, abre pelo caminho normal.
  }
  return path;
}
