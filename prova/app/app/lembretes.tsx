import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cores } from '../src/cores';
import {
  agendarLembrete,
  cancelarLembretes,
  contarAgendados,
  type EstadoPermissoes,
  lerPermissoes,
  pedirAlarmeExato,
  pedirPermissaoDeAviso,
} from '../src/lembretes/lembretes';
import { textos } from '../src/textos';

// Tela da prova F0-3. Os botões fazem o que o app real fará; o link
// campinguim://lembretes?minutos=N&agendar=1 agenda sozinho, para os roteiros repetirem 10 vezes.
export default function TelaLembretes() {
  const { minutos, agendar } = useLocalSearchParams<{ minutos?: string; agendar?: string }>();
  const [permissoes, setPermissoes] = useState<EstadoPermissoes | null>(null);
  const [agendados, setAgendados] = useState(0);
  const [ultimo, setUltimo] = useState<string | null>(null);
  const [erro, setErro] = useState(false);
  const jaAgendou = useRef(false);

  const atualizar = useCallback(async () => {
    setPermissoes(await lerPermissoes());
    setAgendados(await contarAgendados());
  }, []);

  const agendarAgora = useCallback(
    async (min: number) => {
      try {
        const quando = await agendarLembrete(min);
        setErro(false);
        setUltimo(quando.toLocaleTimeString('pt-BR'));
        // O roteiro lê esta linha no registro do aparelho para saber o horário exato.
        console.log(`LEMBRETE_AGENDADO epoch_ms=${quando.getTime()}`);
      } catch {
        setErro(true);
      }
      await atualizar();
    },
    [atualizar],
  );

  useEffect(() => {
    atualizar().catch(() => setErro(true));
  }, [atualizar]);

  useEffect(() => {
    if (agendar === '1' && !jaAgendou.current) {
      jaAgendou.current = true;
      agendarAgora(Number(minutos ?? '30'));
    }
  }, [agendar, minutos, agendarAgora]);

  const t = textos.lembretes;
  const rotuloAviso =
    permissoes?.aviso === 'permitido' ? t.permitido : permissoes?.aviso === 'negado' ? t.negado : t.naoPedido;

  return (
    <ScrollView contentContainerStyle={estilos.tela}>
      <View style={estilos.cartao}>
        <Linha rotulo={t.aviso} valor={permissoes ? rotuloAviso : '…'} testID="perm-aviso" />
        <Linha
          rotulo={t.alarmeExato}
          valor={permissoes ? (permissoes.alarmeExato === 'permitido' ? t.permitido : t.negado) : '…'}
          testID="perm-exato"
        />
        <Linha rotulo={t.agendados} valor={String(agendados)} testID="agendados" />
        <Linha rotulo={t.ultimo} valor={ultimo ?? t.nenhumAgendamento} testID="ultimo" />
      </View>

      {permissoes && permissoes.aviso !== 'permitido' ? (
        <Text style={estilos.aviso} testID="avisos-desligados">
          {t.avisosDesligados}
        </Text>
      ) : null}
      {erro ? (
        <Text style={estilos.aviso} testID="erro-agendar">
          {t.erroAgendar}
        </Text>
      ) : null}

      <Botao rotulo={t.pedirAviso} id="pedir-aviso" aoTocar={() => pedirPermissaoDeAviso().then(atualizar)} />
      <Botao rotulo={t.pedirAlarmeExato} id="pedir-exato" aoTocar={() => pedirAlarmeExato().then(atualizar)} />
      <Botao rotulo={t.agendar} id="agendar" aoTocar={() => agendarAgora(30)} />
      <Botao rotulo={t.cancelar} id="cancelar" aoTocar={() => cancelarLembretes().then(atualizar)} />

      <Link href="/" style={estilos.link}>
        {textos.viagem.voltar}
      </Link>
    </ScrollView>
  );
}

function Linha({ rotulo, valor, testID }: { rotulo: string; valor: string; testID: string }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor} testID={testID}>
        {valor}
      </Text>
    </View>
  );
}

function Botao({ rotulo, id, aoTocar }: { rotulo: string; id: string; aoTocar: () => void }) {
  return (
    <Pressable style={estilos.botao} testID={id} onPress={aoTocar} accessibilityRole="button">
      <Text style={estilos.botaoTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: 16, gap: 12 },
  cartao: {
    backgroundColor: cores.superficie,
    borderColor: cores.linha,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  linha: { gap: 2 },
  rotulo: { fontSize: 13, color: cores.textoSuave },
  valor: { fontSize: 16, color: cores.texto },
  aviso: { fontSize: 16, color: cores.atencao, fontWeight: '600' },
  botao: { backgroundColor: cores.acento, borderRadius: 12, padding: 14, alignItems: 'center' },
  botaoTexto: { color: cores.sobreAcento, fontSize: 16, fontWeight: '600' },
  link: { fontSize: 16, color: cores.acento, fontWeight: '600', paddingVertical: 8 },
});
