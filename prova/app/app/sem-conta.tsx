import { useQuery } from '@powersync/react-native';
import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../src/cores';
import type { Viagem } from '../src/dados/esquema';
import { criarViagem } from '../src/sincronizacao/escrita';
import { textosSinc } from '../src/textos-sincronizacao';

// Uso sem conta (S9, cenário P10): as viagens ficam só no aparelho e sobem no primeiro login, com
// os mesmos identificadores, itens e estados.
const t = textosSinc.semConta;

async function criarDuas() {
  await criarViagem(t.viagem(1), [
    { nome: 'Barraca', estado: 'in_car' },
    { nome: 'Lanterna', estado: 'set_aside' },
    { nome: 'Fogareiro', estado: 'todo' },
  ]);
  await criarViagem(t.viagem(2), [
    { nome: 'Saco de dormir', estado: 'set_aside' },
    { nome: 'Isqueiro', estado: 'in_car' },
  ]);
}

export default function TelaSemConta() {
  const { data: viagens } = useQuery<Viagem>('select * from trip where deleted_at is null order by name');
  return (
    <View style={estilos.tela}>
      <Stack.Screen options={{ title: t.titulo }} />
      <Text style={estilos.suave}>{t.explicacao}</Text>
      <Pressable style={estilos.botao} onPress={criarDuas} testID="criar-duas">
        <Text style={estilos.botaoTexto}>{t.criar}</Text>
      </Pressable>
      <Text style={estilos.suave} testID="viagens-sem-conta">
        {t.criadas(viagens.length)}
      </Text>
      {viagens.map((v) => (
        <Link key={v.id} href={`/lista/${v.id}`} style={estilos.link}>
          {v.name}
        </Link>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: 16, gap: 12 },
  suave: { fontSize: 15, color: cores.textoSuave },
  botao: { backgroundColor: cores.acento, borderRadius: 8, padding: 12, alignItems: 'center' },
  botaoTexto: { color: cores.sobreAcento, fontSize: 16, fontWeight: '600' },
  link: { fontSize: 16, color: cores.acento, fontWeight: '600', paddingVertical: 4 },
});
