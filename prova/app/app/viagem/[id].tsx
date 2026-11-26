import { useQuery } from '@powersync/react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cores } from '../../src/cores';
import type { Viagem } from '../../src/dados/esquema';
import { textos } from '../../src/textos';

// Tela "viagem": recebe o identificador pela rota. Abre por link com esquema próprio
// (campinguim://viagem/<id>) ou pelo link https do site configurado (F0-4).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function TelaViagem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const valido = typeof id === 'string' && UUID.test(id);

  const { data: viagens, isLoading } = useQuery<Viagem>(
    'select * from trip where id = ? and deleted_at is null',
    [valido ? id : ''],
  );
  const { data: contagem } = useQuery<{ n: number }>(
    'select count(*) as n from trip_item where trip_id = ? and deleted_at is null',
    [valido ? id : ''],
  );
  const viagem = viagens[0];

  // O roteiro da F0-4 lê esta linha no registro do aparelho: instante em que a tela da viagem
  // ficou pronta (viagem achada ou mensagem de não encontrada) e se achou a viagem.
  useEffect(() => {
    if (typeof id !== 'string' || (valido && isLoading)) return;
    console.log(`VIAGEM_TELA id=${id} achada=${viagem ? 1 : 0} epoch_ms=${Date.now()}`);
  }, [id, valido, isLoading, viagem]);

  return (
    <View style={estilos.tela}>
      <View style={estilos.cartao}>
        <Text style={estilos.rotulo}>{textos.viagem.identificador}</Text>
        <Text style={estilos.id} testID="viagem-id" selectable>
          {String(id ?? '')}
        </Text>
      </View>

      {!valido ? (
        <Text style={estilos.aviso} testID="viagem-invalida">
          {textos.viagem.identificadorInvalido}
        </Text>
      ) : isLoading ? null : viagem ? (
        <View style={estilos.cartao}>
          <Text style={estilos.nome} testID="viagem-nome">
            {viagem.name}
          </Text>
          <Text style={estilos.suave}>{textos.viagem.itens(contagem[0]?.n ?? 0)}</Text>
        </View>
      ) : (
        <View style={estilos.cartao}>
          <Text style={estilos.aviso} testID="viagem-nao-encontrada">
            {textos.viagem.naoEncontrada}
          </Text>
          <Text style={estilos.suave}>{textos.viagem.naoEncontradaDica}</Text>
        </View>
      )}

      <Link href="/" style={estilos.link}>
        {textos.viagem.voltar}
      </Link>
    </View>
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
    gap: 6,
  },
  rotulo: { fontSize: 13, color: cores.textoSuave },
  id: { fontSize: 15, color: cores.texto, fontFamily: 'monospace' },
  nome: { fontSize: 22, fontWeight: '700', color: cores.texto },
  suave: { fontSize: 16, color: cores.textoSuave },
  aviso: { fontSize: 16, color: cores.atencao, fontWeight: '600' },
  link: { fontSize: 16, color: cores.acento, fontWeight: '600', paddingVertical: 8 },
});
