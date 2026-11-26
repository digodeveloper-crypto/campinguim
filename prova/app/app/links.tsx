import { useQuery } from '@powersync/react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { config } from '../src/config';
import { cores } from '../src/cores';
import type { Viagem } from '../src/dados/esquema';
import { semearViagens } from '../src/links/viagensDeTeste';
import { textos } from '../src/textos';

// Tela da prova F0-4. Serve de "outra tela" para o caso (b) e cria as viagens de teste:
// o link campinguim://links?semear=1 as cria sozinho, para o roteiro repetir 10 vezes.
// O endereço https dos links de exemplo vem do único valor de configuração (config.site).
export default function TelaLinks() {
  const { semear } = useLocalSearchParams<{ semear?: string }>();
  const { data: viagens } = useQuery<Viagem>(
    'select * from trip where deleted_at is null order by name',
  );
  const [erro, setErro] = useState(false);
  const jaSemeou = useRef(false);

  useEffect(() => {
    if (semear !== '1' || jaSemeou.current) return;
    jaSemeou.current = true;
    semearViagens()
      .then((n) => console.log(`VIAGENS_SEMEADAS n=${n}`))
      .catch(() => setErro(true));
  }, [semear]);

  const t = textos.links;
  return (
    <ScrollView contentContainerStyle={estilos.tela}>
      <Text style={estilos.titulo} testID="links-titulo">
        {t.tela}
      </Text>
      <Text style={estilos.suave}>{t.explicacao}</Text>
      {erro ? <Text style={estilos.aviso}>{t.erroSemear}</Text> : null}

      <Text style={estilos.secao}>{t.viagensNoAparelho}</Text>
      <View style={estilos.cartao}>
        {viagens.length === 0 ? (
          <Text style={estilos.suave}>{t.nenhuma}</Text>
        ) : (
          viagens.map((v) => (
            <View key={v.id} style={estilos.linha}>
              <Link href={`/viagem/${v.id}`} style={estilos.link}>
                {v.name}
              </Link>
              <Text style={estilos.suave} selectable>
                {`campinguim://viagem/${v.id}`}
              </Text>
              <Text style={estilos.suave} selectable>
                {`${config.site}/viagem/${v.id}`}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: 16, gap: 12 },
  titulo: { fontSize: 24, fontWeight: '700', color: cores.texto },
  secao: { fontSize: 18, fontWeight: '600', color: cores.texto, marginTop: 8 },
  cartao: {
    backgroundColor: cores.superficie,
    borderColor: cores.linha,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  linha: { gap: 2 },
  suave: { fontSize: 13, color: cores.textoSuave },
  aviso: { fontSize: 16, color: cores.atencao, fontWeight: '600' },
  link: { fontSize: 16, color: cores.acento, fontWeight: '600' },
});
