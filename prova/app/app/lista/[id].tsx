import { useQuery } from '@powersync/react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { cores } from '../../src/cores';
import { registrar } from '../../src/dados/registro';
import type { Assuncao, Aviso, ItemDaViagem, Membro, Viagem } from '../../src/dados/esquema';
import {
  assumirItem,
  criarItem,
  gerarAlteracoes,
  marcarSeparacao,
  medirOnline,
  removerItem,
  restaurarItem,
  somarQuantidade,
} from '../../src/sincronizacao/escrita';
import { useFila, useMaiorPausa, useUsuario } from '../../src/sincronizacao/estado';
import { textosSinc } from '../../src/textos-sincronizacao';

// Tela da lista de uma viagem (prova F0-2). Abre por link: campinguim://lista/<id da viagem>.
// Os toques gravam no aparelho na hora; o envio acontece em segundo plano (SPEC, seção 4).
// Os identificadores de teste (testID) usam o nome do item, para os roteiros do Maestro.
const t = textosSinc.lista;

export default function TelaLista() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = typeof id === 'string' ? id : '';
  const usuario = useUsuario();
  const { pendentes, conectado } = useFila();
  const maiorPausa = useMaiorPausa();
  const [novoNome, setNovoNome] = useState('');
  const [toques, setToques] = useState(0);

  const { data: viagens, refresh: consultarViagemDeNovo } = useQuery<Viagem>('select * from trip where id = ?', [
    tripId,
  ]);
  const { data: itens, refresh: r1 } = useQuery<ItemDaViagem>(
    'select * from trip_item where trip_id = ? order by name, id',
    [tripId],
  );
  const { data: membros, refresh: r2 } = useQuery<Membro>('select * from trip_member where trip_id = ?', [tripId]);
  const { data: assuncoes, refresh: r3 } = useQuery<Assuncao>(
    'select * from item_claim where trip_id = ? and deleted_at is null',
    [tripId],
  );
  const { data: historico, refresh: r4 } = useQuery<{ item_id: string; n: number }>(
    'select item_id, count(*) as n from trip_item_history where trip_id = ? group by item_id',
    [tripId],
  );
  const { data: avisos } = useQuery<Aviso>('select * from aviso_local order by criado_em desc limit 1');

  const minhaFamilia = membros.find((m) => m.profile_id === usuario && !m.deleted_at)?.family_id ?? null;
  const nomeDaFamilia = useMemo(
    () => new Map(membros.map((m) => [m.family_id ?? '', m.display_name ?? ''])),
    [membros],
  );
  const ativos = itens.filter((i) => !i.deleted_at);
  const removidos = itens.filter((i) => i.deleted_at);

  // Registro "visto": cada mudança que chega à tela (para medir o tempo até o outro aparelho).
  const anterior = useRef(new Map<string, string>());
  useEffect(() => {
    const agora = new Map<string, string>();
    for (const i of itens) {
      const resumo = `${i.qty}|${i.pack_state}|${i.deleted_at ? 1 : 0}|${i.name}`;
      agora.set(i.id, resumo);
      if (anterior.current.size > 0 && anterior.current.get(i.id) !== resumo) {
        registrar('visto', { item: i.id, qty: i.qty, pack: i.pack_state, removido: i.deleted_at ? 1 : 0 });
      }
    }
    anterior.current = agora;
  }, [itens]);

  // Aviso de alterações recusadas (S10): aparece na tela da viagem que saiu do aparelho.
  const aviso =
    avisos[0]?.tipo === textosSinc.avisos.recusadas ? (
      <Text style={estilos.aviso} testID="aviso-recusadas">
        {t.avisoRecusadas(avisos[0].quantidade ?? 0)}
      </Text>
    ) : null;

  const viagem = viagens[0];

  // Medido em F0-2: aberta antes de a viagem chegar pela sincronização, a tela continuava dizendo
  // "não está neste aparelho" com os dados já no banco (a consulta observada não foi avisada; causa
  // na biblioteca não confirmada). Enquanto a viagem não aparece, consulta de novo a cada 1,5 s.
  useEffect(() => {
    const todas = [consultarViagemDeNovo, r1, r2, r3, r4];
    const deNovo = () => todas.forEach((r) => r?.().catch(() => undefined));
    if (viagem) {
      // A viagem acabou de aparecer: as outras consultas da tela também são refeitas.
      deNovo();
      return;
    }
    const t = setInterval(deNovo, 1500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viagem?.id]);

  if (!viagem) {
    return (
      <View style={estilos.tela}>
        <Stack.Screen options={{ title: t.titulo }} />
        <Text style={estilos.aviso} testID="lista-nao-encontrada">
          {t.naoEncontrada}
        </Text>
        {aviso}
      </View>
    );
  }

  const estadoSinc = usuario === null ? t.semLogin : conectado ? t.conectado : t.desconectado;

  return (
    <View style={estilos.raiz}>
      <Stack.Screen options={{ title: t.titulo }} />
      {/* Cabeçalho fixo: a contagem da fila fica sempre à vista (SPEC, seção 4). */}
      <View style={estilos.cabecalho}>
        <Text style={estilos.nome} testID="lista-nome">
          {viagem.name}
        </Text>
        <Text style={estilos.suave} testID="estado-sinc">
          {estadoSinc}
        </Text>
        <Text style={estilos.suave} testID="fila">
          {pendentes > 0 ? t.aguardando(pendentes) : t.tudoEnviado}
        </Text>
      </View>
      <ScrollView contentContainerStyle={estilos.tela} testID="lista">

        {ativos.map((item) => {
          const nome = item.name ?? '';
          const dele = assuncoes.filter((a) => a.item_id === item.id);
          const familias = [...new Set(dele.map((a) => a.family_id ?? ''))];
          const trocas = historico.find((h) => h.item_id === item.id)?.n ?? 0;
          return (
            <View key={item.id} style={estilos.item} testID={`item-${nome}`}>
              <Text style={estilos.itemNome}>
                {nome} · {t.quantidade(item.qty ?? 0)} · {t.estados[item.pack_state ?? 'todo']}
              </Text>
              {familias.length > 0 ? (
                <Text style={estilos.suave} testID={`assumido-${nome}`}>
                  {t.assumidoPor(familias.map((f) => nomeDaFamilia.get(f) ?? '?').join(', '))}
                </Text>
              ) : null}
              {familias.length > 1 ? <Text style={estilos.aviso}>{t.duplicado}</Text> : null}
              {trocas > 0 ? <Text style={estilos.suave}>{t.historico(trocas)}</Text> : null}
              <View style={estilos.botoes}>
                <Botao rotulo={t.separar} testID={`separar-${nome}`} onPress={() => marcarSeparacao(item.id, 'set_aside')} />
                <Botao rotulo={t.noCarro} testID={`carro-${nome}`} onPress={() => marcarSeparacao(item.id, 'in_car')} />
                <Botao rotulo={t.maisUm} testID={`mais-${nome}`} onPress={() => somarQuantidade(item.id, 1)} />
                {item.family_id == null && minhaFamilia ? (
                  <Botao
                    rotulo={t.assumir}
                    testID={`assumir-${nome}`}
                    onPress={() => assumirItem(tripId, item.id, minhaFamilia)}
                  />
                ) : null}
                <Botao rotulo={t.remover} testID={`remover-${nome}`} onPress={() => removerItem(item.id)} />
              </View>
            </View>
          );
        })}

        <View style={estilos.linhaNovo}>
          <TextInput
            style={estilos.entrada}
            placeholder={t.novoItem}
            value={novoNome}
            onChangeText={setNovoNome}
            testID="novo-nome"
          />
          <Botao
            rotulo={t.adicionar}
            testID="adicionar"
            onPress={() => {
              const nome = novoNome.trim();
              if (nome) criarItem(tripId, nome);
              setNovoNome('');
            }}
          />
        </View>

        {removidos.length > 0 ? <Text style={estilos.secao}>{t.removidos}</Text> : null}
        {removidos.map((item) => (
          <View key={item.id} style={estilos.item} testID={`removido-${item.name}`}>
            <Text style={estilos.itemNome}>
              {item.name} · {t.quantidade(item.qty ?? 0)}
            </Text>
            <Botao rotulo={t.restaurar} testID={`restaurar-${item.name}`} onPress={() => restaurarItem(item.id)} />
          </View>
        ))}

        <Text style={estilos.secao}>{t.teste}</Text>
        <Text style={estilos.suave} testID="maior-pausa">
          {t.maiorPausa(maiorPausa)}
        </Text>
        <View style={estilos.botoes}>
          <Botao rotulo={t.gerar200} testID="gerar-200" onPress={() => gerarAlteracoes(tripId)} />
          <Botao
            rotulo={t.medir20}
            testID="medir-20"
            onPress={() => ativos[0] && medirOnline(ativos[0].id)}
          />
          <Botao rotulo={`${t.tocar} · ${t.toques(toques)}`} testID="tocar" onPress={() => setToques((n) => n + 1)} />
        </View>
      </ScrollView>
    </View>
  );
}

function Botao({ rotulo, testID, onPress }: { rotulo: string; testID: string; onPress: () => void }) {
  return (
    <Pressable style={estilos.botao} onPress={onPress} testID={testID} accessibilityRole="button">
      <Text style={estilos.botaoTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  cabecalho: { paddingHorizontal: 12, paddingVertical: 8, gap: 2, borderBottomWidth: 1, borderColor: cores.linha },
  // Folga no fim para os últimos itens poderem subir até o meio da tela (roteiros do Maestro).
  tela: { padding: 12, gap: 8, paddingBottom: 320 },
  nome: { fontSize: 20, fontWeight: '700', color: cores.texto },
  suave: { fontSize: 13, color: cores.textoSuave },
  aviso: { fontSize: 14, color: cores.atencao, fontWeight: '600' },
  secao: { fontSize: 16, fontWeight: '600', color: cores.texto, marginTop: 8 },
  item: {
    backgroundColor: cores.superficie,
    borderColor: cores.linha,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  itemNome: { fontSize: 15, color: cores.texto, fontWeight: '600' },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  botao: { backgroundColor: cores.acento, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  botaoTexto: { color: cores.sobreAcento, fontSize: 13, fontWeight: '600' },
  linhaNovo: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  entrada: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderColor: cores.linha,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: cores.texto,
  },
});
