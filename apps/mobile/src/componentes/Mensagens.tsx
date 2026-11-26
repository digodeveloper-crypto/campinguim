// 7.10 Vazios e mensagens (DESIGN.md; estilo.css §8): o vazio é um texto curto em `texto-suave`; a
// mensagem é uma frase em peso 600, numa região que o leitor de tela anuncia, e some quando está vazia.
// Erro (decisão D-5, provisória até a validação humana): o protótipo não tem forma própria, então o erro
// é uma folha com faixa de 4 `atencao`, o ícone de atenção cheio, a frase em `texto` e a ação que resolve
// (SPEC §7: "mensagem em português simples, com o que a pessoa pode fazer"). Nunca só cor.
import { StyleSheet, View } from 'react-native';

import { Icone } from '../icones/Icone';
import { textos } from '../textos';
import { tokens, useTema } from '../tema';
import { Botao } from './Botoes';
import { formatar } from './formatar';
import { Faixa } from './Lista';
import { Texto } from './Texto';

const t = textos.componentes;

export function Vazio({ texto, testID }: { texto: string; testID?: string | undefined }) {
  return (
    <View style={estilos.vazio} testID={testID}>
      <Texto cor="textoSuave">{texto}</Texto>
    </View>
  );
}

/** Mensagem anunciada (`aria-live="polite"`). Sem texto, não ocupa espaço. */
export function Mensagem({ texto, testID }: { texto: string | null | undefined; testID?: string | undefined }) {
  return (
    <View accessibilityLiveRegion="polite" testID={testID}>
      {texto ? (
        <Texto uso="linhaNome" style={estilos.mensagem}>
          {texto}
        </Texto>
      ) : null}
    </View>
  );
}

type PropsErro = {
  mensagem: string;
  /** Texto da ação que resolve, ex.: "Tentar de novo". */
  acao?: string | undefined;
  aoAgir?: (() => void) | undefined;
  testID?: string | undefined;
};

export function MensagemErro({ mensagem, acao, aoAgir, testID }: PropsErro) {
  const { cores } = useTema();
  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      style={[estilos.erro, { backgroundColor: cores.superficie, borderColor: cores.linha }]}
    >
      <Faixa cor="atencao" />
      <View style={estilos.erroLinha}>
        <Icone nome="atencao" ativo cor="atencao" />
        <Texto uso="linhaNome" falado={formatar(t.erro.falado, { mensagem })} style={estilos.encolhe}>
          {mensagem}
        </Texto>
      </View>
      {acao && aoAgir ? <Botao tipo="secundario" texto={acao} aoTocar={aoAgir} testID={testID ? `${testID}-acao` : undefined} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  encolhe: { flex: 1, minWidth: 0 },
  vazio: { paddingVertical: 16, paddingHorizontal: 12 },
  mensagem: { marginTop: 8 },
  erro: {
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    borderWidth: tokens.borda.folha,
    borderRadius: tokens.raio,
    overflow: 'hidden',
  },
  erroLinha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
