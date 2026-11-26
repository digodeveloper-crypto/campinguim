import { PowerSyncContext } from '@powersync/react-native';
import * as Linking from 'expo-linking';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { config } from '../config';
import { cores } from '../cores';
import { abrirBancoDoApp, resumir, verificarNoAparelho, type BancoAberto } from './banco';
import type { RelatorioDaVerificacao } from './verificacao';

// Abre o banco local cifrado quando o app começa e o entrega às telas:
//   - `useBanco()` devolve o estado (abrindo, pronto ou erro) e, pronto, o contexto da camada de
//     acesso (`banco.ctx`) para as funções de `src/dados/acesso`;
//   - o `PowerSyncContext` fica disponível para as consultas que se atualizam sozinhas
//     (`useQuery` do PowerSync).
// As telas aparecem desde o primeiro instante; cada feature decide o que mostrar enquanto o banco
// abre (normalmente, uma fração de segundo).
//
// Só no ambiente local (`config.ambiente`): o resumo técnico do banco vai para o registro do app
// (sem chave e sem dado da pessoa), e o link `campinguim://?verificar-banco=1` roda a verificação
// de fumaça da camada num banco separado e descartável (roteiro `e2e/jornadas/fumaca-banco`).

export type EstadoDoBanco =
  | { estado: 'abrindo' }
  | { estado: 'pronto'; banco: BancoAberto }
  | { estado: 'erro'; mensagem: string };

const ContextoDoBanco = createContext<EstadoDoBanco>({ estado: 'abrindo' });

export const useBanco = () => useContext(ContextoDoBanco);

const AMBIENTE_LOCAL = config.ambiente === 'local';
const ETIQUETA = '[campinguim:banco]';

export function ProvedorDoBanco({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoDoBanco>({ estado: 'abrindo' });

  useEffect(() => {
    let vivo = true;
    abrirBancoDoApp()
      .then(async (banco) => {
        if (AMBIENTE_LOCAL) console.info(`${ETIQUETA} pronto ${JSON.stringify(await resumir(banco))}`);
        if (vivo) setEstado({ estado: 'pronto', banco });
      })
      .catch((erro: unknown) => {
        const mensagem = erro instanceof Error ? erro.message : String(erro);
        console.error(`${ETIQUETA} erro ao abrir: ${mensagem}`);
        if (vivo) setEstado({ estado: 'erro', mensagem });
      });
    return () => {
      vivo = false;
    };
  }, []);

  const db = estado.estado === 'pronto' ? estado.banco.db : null;
  return (
    <ContextoDoBanco.Provider value={estado}>
      <PowerSyncContext.Provider value={db}>
        {children}
        {AMBIENTE_LOCAL && estado.estado === 'pronto' ? <VerificacaoPorLink /> : null}
      </PowerSyncContext.Provider>
    </ContextoDoBanco.Provider>
  );
}

// ---- Só no ambiente local: verificação de fumaça pedida por link -------------------------------

function pediuVerificacao(url: string | null): boolean {
  if (!url) return false;
  return Linking.parse(url).queryParams?.['verificar-banco'] === '1';
}

function VerificacaoPorLink() {
  const url = Linking.useLinkingURL();
  const [relatorio, setRelatorio] = useState<RelatorioDaVerificacao | null>(null);
  const pedida = pediuVerificacao(url);

  useEffect(() => {
    if (!pedida) return;
    let vivo = true;
    verificarNoAparelho()
      .then((r) => {
        console.info(`${ETIQUETA} verificacao ${JSON.stringify(r)}`);
        if (vivo) setRelatorio(r);
      })
      .catch((erro: unknown) => {
        const mensagem = erro instanceof Error ? erro.message : String(erro);
        console.error(`${ETIQUETA} verificacao falhou: ${mensagem}`);
        if (vivo) setRelatorio({ ok: false, versaoLocal: 0, tabelas: [], passos: [{ passo: 'abrir', ok: false, detalhe: mensagem }] });
      });
    return () => {
      vivo = false;
    };
  }, [pedida, url]);

  if (!pedida || !relatorio) return null;
  // Só números e nomes técnicos (tabelas): nenhuma frase da interface.
  const passos = `${relatorio.passos.filter((p) => p.ok).length}/${relatorio.passos.length}`;
  const versao = `v${relatorio.versaoLocal}`;
  const tabelas = relatorio.tabelas.map((t) => t.name).join(' · ');
  return (
    <View style={estilos.painel} testID={relatorio.ok ? 'verificacao-banco-ok' : 'verificacao-banco-falhou'}>
      <Text style={estilos.numero} testID="verificacao-banco-passos">
        {passos}
      </Text>
      <Text style={estilos.detalhe} testID="verificacao-banco-versao">
        {versao}
      </Text>
      <Text style={estilos.detalhe} testID="verificacao-banco-tabelas">
        {tabelas}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  painel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 48,
    padding: 16,
    gap: 8,
    borderRadius: 12,
    backgroundColor: cores.acento,
  },
  numero: { color: cores.fundo, fontSize: 28, fontWeight: '700' },
  detalhe: { color: cores.fundo, fontSize: 13, lineHeight: 18 },
});
