import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { textos } from '../textos';

// Lembrete local da prova F0-3 (SPEC, seção 10): agendado no próprio aparelho, chega sem internet.
// O aviso carrega o endereço da tela da viagem; tocar nele abre essa tela, não o início.
export const CANAL_LEMBRETES = 'lembretes';

// Viagem fixa de teste (só o identificador; a prova não usa sincronização).
export const VIAGEM_DE_TESTE = '1f0a0b00-0000-4000-8000-0000000000c3';

export type EstadoPermissoes = {
  aviso: 'permitido' | 'negado' | 'nao-pedido';
  alarmeExato: 'permitido' | 'negado';
};

export async function prepararCanal(): Promise<void> {
  await Notifications.setNotificationChannelAsync(CANAL_LEMBRETES, {
    name: textos.lembretes.canal,
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function lerPermissoes(): Promise<EstadoPermissoes> {
  const aviso = await Notifications.getPermissionsAsync();
  const exato = await Notifications.getExactAlarmPermissionsAsync();
  return {
    aviso: aviso.granted ? 'permitido' : aviso.canAskAgain ? 'nao-pedido' : 'negado',
    alarmeExato: exato.granted ? 'permitido' : 'negado',
  };
}

export async function pedirPermissaoDeAviso(): Promise<void> {
  await prepararCanal();
  await Notifications.requestPermissionsAsync();
}

// Abre a tela do sistema onde a pessoa concede o alarme exato.
export async function pedirAlarmeExato(): Promise<void> {
  await Notifications.requestExactAlarmPermissionsAsync();
}

// Agenda o lembrete para `minutos` a partir do relógio do aparelho. Devolve o horário agendado.
export async function agendarLembrete(minutos: number, viagemId = VIAGEM_DE_TESTE): Promise<Date> {
  await prepararCanal();
  const quando = new Date(Date.now() + minutos * 60_000);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: textos.lembretes.titulo,
      body: textos.lembretes.vespera,
      data: { url: `/viagem/${viagemId}` },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: quando,
      channelId: CANAL_LEMBRETES,
    },
  });
  return quando;
}

export async function cancelarLembretes(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function contarAgendados(): Promise<number> {
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}
