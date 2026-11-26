import { useQuery } from '@powersync/react-native';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { config } from '../src/config';
import { cores } from '../src/cores';
import { versaoDoMotor } from '../src/dados/banco';
import type { Viagem } from '../src/dados/esquema';
import { textos } from '../src/textos';

type EstadoBanco = { tipo: 'abrindo' } | { tipo: 'pronto'; versao: string } | { tipo: 'erro' };

export default function Inicio() {
  const [estado, setEstado] = useState<EstadoBanco>({ tipo: 'abrindo' });
  const { data: viagens } = useQuery<Viagem>(
    'select * from trip where deleted_at is null order by name',
  );

  useEffect(() => {
    versaoDoMotor()
      .then((versao) => setEstado({ tipo: 'pronto', versao }))
      .catch(() => setEstado({ tipo: 'erro' }));
  }, []);

  const textoBanco =
    estado.tipo === 'pronto'
      ? textos.inicio.bancoPronto(estado.versao)
      : estado.tipo === 'erro'
        ? textos.inicio.bancoErro
        : textos.inicio.bancoAbrindo;

  return (
    <ScrollView contentContainerStyle={estilos.tela}>
      <Text style={estilos.titulo} testID="titulo">
        {textos.app.titulo}
      </Text>
      <Text style={estilos.subtitulo}>{textos.app.subtitulo}</Text>

      <View style={estilos.cartao}>
        <Linha rotulo={textos.inicio.bancoLocal} valor={textoBanco} testID="estado-banco" />
        <Linha rotulo={textos.inicio.servidor} valor={config.urlApi} />
        <Linha rotulo={textos.inicio.sincronizacao} valor={textos.inicio.semSessao} />
      </View>

      <Link href="/lembretes" style={estilos.link} testID="abrir-lembretes">
        {textos.lembretes.abrirTela}
      </Link>

      <Link href="/links" style={estilos.link} testID="abrir-links">
        {textos.links.abrirTela}
      </Link>

      <Text style={estilos.secao}>{textos.inicio.viagensNoAparelho}</Text>
      <View style={estilos.cartao}>
        {viagens.length === 0 ? (
          <Text style={estilos.suave}>{textos.inicio.nenhumaViagem}</Text>
        ) : (
          viagens.map((v) => (
            <Link key={v.id} href={`/viagem/${v.id}`} style={estilos.link}>
              {v.name}
            </Link>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function Linha({ rotulo, valor, testID }: { rotulo: string; valor: string; testID?: string }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <Text style={estilos.valor} testID={testID}>
        {valor}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: 16, gap: 12 },
  titulo: { fontSize: 28, fontWeight: '700', color: cores.texto },
  subtitulo: { fontSize: 16, color: cores.textoSuave },
  secao: { fontSize: 18, fontWeight: '600', color: cores.texto, marginTop: 8 },
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
  suave: { fontSize: 16, color: cores.textoSuave },
  link: { fontSize: 16, color: cores.acento, fontWeight: '600', paddingVertical: 4 },
});
