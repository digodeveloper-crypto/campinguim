import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { cores } from '../src/cores';
import { iniciarSincronizacao, supabase } from '../src/dados/banco';
import { registrar } from '../src/dados/registro';
import { textosSinc } from '../src/textos-sincronizacao';

// Login da prova (F0-2) com os usuários de teste locais. Para os roteiros automáticos, o
// computador faz o login e abre campinguim://entrar?t=<token de renovação>: assim a senha nunca
// é digitada por roteiro nem aparece em registro. O token de renovação é de uso único e local.
const t = textosSinc.entrar;

type Estado = 'parado' | 'entrando' | 'pronto' | 'erro';

export default function TelaEntrar() {
  const params = useLocalSearchParams<{ t?: string }>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [estado, setEstado] = useState<Estado>('parado');

  async function concluir(ok: boolean) {
    if (!ok) {
      setEstado('erro');
      registrar('login', { ok: false });
      return;
    }
    await iniciarSincronizacao();
    setEstado('pronto');
    registrar('login', { ok: true });
  }

  useEffect(() => {
    if (typeof params.t !== 'string' || !params.t) return;
    setEstado('entrando');
    supabase.auth
      .refreshSession({ refresh_token: params.t })
      .then(({ data, error }) => concluir(!error && !!data.session))
      .catch(() => concluir(false));
    // Só no primeiro carregamento com o parâmetro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.t]);

  async function entrar() {
    setEstado('entrando');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setSenha('');
    await concluir(!error);
  }

  return (
    <View style={estilos.tela}>
      <Stack.Screen options={{ title: t.titulo }} />
      <TextInput
        style={estilos.entrada}
        placeholder={t.email}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        testID="email"
      />
      <TextInput
        style={estilos.entrada}
        placeholder={t.senha}
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
        testID="senha"
      />
      <Pressable style={estilos.botao} onPress={entrar} testID="entrar">
        <Text style={estilos.botaoTexto}>{estado === 'entrando' ? t.entrando : t.botao}</Text>
      </Pressable>
      {estado === 'erro' ? (
        <Text style={estilos.aviso} testID="entrar-erro">
          {t.erro}
        </Text>
      ) : null}
      {estado === 'pronto' ? (
        <Text style={estilos.ok} testID="entrar-pronto">
          {t.pronto}
        </Text>
      ) : null}
      <Pressable onPress={() => router.push('/sem-conta')} testID="sem-conta">
        <Text style={estilos.link}>{t.semConta}</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { padding: 16, gap: 12 },
  entrada: {
    backgroundColor: cores.superficie,
    borderColor: cores.linha,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: cores.texto,
  },
  botao: { backgroundColor: cores.acento, borderRadius: 8, padding: 12, alignItems: 'center' },
  botaoTexto: { color: cores.sobreAcento, fontSize: 16, fontWeight: '600' },
  aviso: { fontSize: 15, color: cores.atencao, fontWeight: '600' },
  ok: { fontSize: 15, color: cores.texto },
  link: { fontSize: 15, color: cores.acento, fontWeight: '600', paddingVertical: 8 },
});
