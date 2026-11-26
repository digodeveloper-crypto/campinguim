// 7.9 Campos (DESIGN.md; estilo.css §12): campo de texto, opção, contador, caixa de marcar e resultado de
// busca. Alvos de 48 (campo, opção) e 44 (passos do contador, caixa de marcar); borda de controle de 1,5
// `linha`, que passa para `texto` quando ligado e para `atencao` no erro (forma do erro: docs/componentes.md).
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icone } from '../icones/Icone';
import { textos } from '../textos';
import { estiloDoUso, tokens, useTema } from '../tema';
import { formatar } from './formatar';
import { Faixa } from './Lista';
import { Texto } from './Texto';

const t = textos.componentes;

// ---------------------------------------------------------------------------------------------
// Campo de texto (.entrada): 48 no mínimo, 96 em texto longo; rótulo em cima, peso 600

type PropsCampo = {
  rotulo: string;
  valor: string;
  aoMudar?: (valor: string) => void;
  opcional?: boolean;
  longo?: boolean;
  /** Mensagem de erro do campo: borda `atencao`, ícone e texto abaixo (nunca só cor). */
  erro?: string | null | undefined;
  desativado?: boolean;
  tipo?: 'texto' | 'email';
  testID?: string | undefined;
};

export function CampoTexto({ rotulo, valor, aoMudar, opcional = false, longo = false, erro, desativado = false, tipo = 'texto', testID }: PropsCampo) {
  const tema = useTema();
  const { cores } = tema;
  const [focado, setFocado] = useState(false);
  const corpo = estiloDoUso('corpo', tema.fator, tema.simulacao);
  const borda = erro ? cores.atencao : focado ? cores.texto : cores.linha;
  const falado = [rotulo, opcional ? t.campo.opcional : null, erro ? formatar(t.erro.falado, { mensagem: erro }) : null].filter(Boolean).join(', ');
  return (
    <View style={estilos.campo}>
      <View style={estilos.rotulo} accessible={false} importantForAccessibility="no-hide-descendants">
        <Texto uso="linhaNome" semLeitura>
          {rotulo}
        </Texto>
        {opcional ? (
          <Texto uso="secundario" cor="textoSuave" semLeitura>
            {t.campo.opcional}
          </Texto>
        ) : null}
      </View>
      <TextInput
        testID={testID}
        value={valor}
        onChangeText={aoMudar}
        editable={!desativado}
        multiline={longo}
        keyboardType={tipo === 'email' ? 'email-address' : 'default'}
        autoCapitalize={tipo === 'email' ? 'none' : 'sentences'}
        accessibilityLabel={falado}
        accessibilityState={{ disabled: desativado }}
        onFocus={() => setFocado(true)}
        onBlur={() => setFocado(false)}
        style={[
          estilos.entrada,
          {
            minHeight: longo ? 96 : tokens.alvo.medio,
            textAlignVertical: longo ? 'top' : 'center',
            borderColor: borda,
            borderWidth: focado || erro ? 2 : tokens.borda.controle,
            backgroundColor: desativado ? cores.fundo : cores.superficie,
            color: desativado ? cores.textoSuave : cores.texto,
            fontFamily: tema.fontes ? corpo.fontFamily : undefined,
            fontSize: corpo.fontSize,
          },
        ]}
      />
      {erro ? <ErroDoCampo mensagem={erro} /> : null}
    </View>
  );
}

function ErroDoCampo({ mensagem }: { mensagem: string }) {
  return (
    <View style={estilos.erroCampo} accessibilityLiveRegion="polite">
      <Icone nome="atencao" ativo cor="atencao" recorte="fundo" tamanho={tokens.icone.bloco} />
      <Texto uso="estado" cor="atencao" falado={formatar(t.erro.falado, { mensagem })} style={estilos.encolhe}>
        {mensagem}
      </Texto>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Opção (.opcao): 48, bolinha de 12; escolhida: borda `texto`, peso 700, bolinha cheia

type PropsOpcao = { texto: string; escolhida: boolean; aoTocar?: () => void; desativado?: boolean; testID?: string | undefined };

export function Opcao({ texto, escolhida, aoTocar, desativado = false, testID }: PropsOpcao) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="radio"
      accessibilityLabel={texto}
      accessibilityState={{ checked: escolhida, disabled: desativado }}
      style={({ pressed }) => [
        estilos.opcao,
        {
          borderColor: escolhida && !desativado ? cores.texto : cores.linha,
          backgroundColor: pressed || desativado ? cores.fundo : cores.superficie,
        },
      ]}
    >
      <View
        style={[
          estilos.bolinha,
          { borderColor: desativado ? cores.textoSuave : cores.texto, backgroundColor: escolhida ? (desativado ? cores.textoSuave : cores.texto) : 'transparent' },
        ]}
      />
      <Texto uso={escolhida ? 'filtroLigado' : 'filtro'} cor={desativado ? 'textoSuave' : 'texto'} semLeitura style={estilos.corpo17}>
        {texto}
      </Texto>
    </Pressable>
  );
}

/** Grupo de opções (uma escolhida). */
export function Opcoes({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <View style={estilos.campo}>
      <Texto uso="linhaNome" titulo>
        {rotulo}
      </Texto>
      <View accessibilityRole="radiogroup" accessibilityLabel={rotulo} style={estilos.opcoes}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Contador (.contador): linha de 56, "menos" e "mais" de 44, valor de 19 com peso 700

type PropsContador = { campo: string; valor: number; minimo?: number; maximo?: number; aoMudar?: (valor: number) => void; testID?: string | undefined };

function Passo({ icone, falado, desativado, aoTocar, testID }: { icone: 'mais' | 'menos'; falado: string; desativado: boolean; aoTocar: () => void; testID?: string | undefined }) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="button"
      accessibilityLabel={falado}
      accessibilityState={{ disabled: desativado }}
      style={({ pressed }) => [estilos.passo, { borderColor: cores.linha, backgroundColor: pressed || desativado ? cores.fundo : cores.superficie }]}
    >
      <Icone nome={icone} cor={desativado ? 'textoSuave' : 'texto'} />
    </Pressable>
  );
}

export function Contador({ campo, valor, minimo = 0, maximo = 99, aoMudar, testID }: PropsContador) {
  return (
    <View style={estilos.contador} testID={testID}>
      <Texto uso="linhaNome" style={estilos.contadorNome} falado={formatar(t.contador.valor, { campo, n: valor })}>
        {campo}
      </Texto>
      <View style={estilos.contadorControle}>
        <Passo
          icone="menos"
          falado={formatar(t.contador.menos, { campo })}
          desativado={valor <= minimo}
          aoTocar={() => aoMudar?.(Math.max(minimo, valor - 1))}
          testID={testID ? `${testID}-menos` : undefined}
        />
        <View accessibilityLiveRegion="polite" style={estilos.contadorValor}>
          <Texto uso="contadorValor" falado={formatar(t.contador.valor, { campo, n: valor })} style={estilos.centro}>
            {String(valor)}
          </Texto>
        </View>
        <Passo
          icone="mais"
          falado={formatar(t.contador.mais, { campo })}
          desativado={valor >= maximo}
          aoTocar={() => aoMudar?.(Math.min(maximo, valor + 1))}
          testID={testID ? `${testID}-mais` : undefined}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------------
// Caixa de marcar (.check): 44 com borda de 1,5 `texto`; marcada: fundo `texto`, visto `fundo`

type PropsCaixa = { texto: string; marcada: boolean; aoMudar?: (marcada: boolean) => void; desativado?: boolean; testID?: string | undefined };

export function CaixaMarcar({ texto, marcada, aoMudar, desativado = false, testID }: PropsCaixa) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={() => aoMudar?.(!marcada)}
      disabled={desativado}
      accessibilityRole="checkbox"
      accessibilityLabel={texto}
      accessibilityState={{ checked: marcada, disabled: desativado }}
      style={estilos.caixaLinha}
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              estilos.caixa,
              {
                borderColor: desativado ? cores.linha : cores.texto,
                backgroundColor: marcada ? cores.texto : pressed ? cores.fundo : cores.superficie,
              },
            ]}
          >
            {marcada ? <Icone nome="ciente" cor="fundo" recorte="texto" /> : null}
          </View>
          <Texto cor={desativado ? 'textoSuave' : 'texto'} semLeitura style={estilos.encolhe}>
            {texto}
          </Texto>
        </>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------
// Resultado de busca (.resultado): linha de 56; escolhido: faixa de 4 `texto` e a palavra "escolhido"

type PropsResultado = { nome: string; detalhe?: string | undefined; escolhido: boolean; aoTocar?: () => void; testID?: string | undefined };

export function Resultado({ nome, detalhe, escolhido, aoTocar, testID }: PropsResultado) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      accessibilityRole="radio"
      accessibilityLabel={[nome, detalhe, escolhido ? t.resultado.escolhido : null].filter(Boolean).join(', ')}
      accessibilityState={{ checked: escolhido }}
      style={({ pressed }) => [estilos.resultado, { backgroundColor: pressed ? cores.fundo : cores.superficie }]}
    >
      {escolhido ? <Faixa cor="texto" /> : null}
      <View style={estilos.encolhe}>
        <Texto uso="linhaNome" semLeitura>
          {nome}
        </Texto>
        {detalhe ? (
          <Texto uso="secundario" cor="textoSuave" semLeitura>
            {detalhe}
          </Texto>
        ) : null}
      </View>
      {escolhido ? (
        <Texto uso="estado" semLeitura>
          {t.resultado.escolhido}
        </Texto>
      ) : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  encolhe: { flex: 1, minWidth: 0 },
  centro: { textAlign: 'center' },
  corpo17: { flexShrink: 1 },
  campo: { marginTop: 16 },
  rotulo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 8, rowGap: 4, marginBottom: 6 },
  entrada: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: tokens.raio },
  erroCampo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: tokens.alvo.medio,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: tokens.borda.controle,
    borderRadius: tokens.raio,
  },
  bolinha: { width: 12, height: 12, borderRadius: 6, borderWidth: tokens.borda.controle },
  contador: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, minHeight: tokens.alvo.linha, paddingVertical: 4, paddingHorizontal: 12 },
  contadorNome: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 96 },
  contadorControle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  contadorValor: { minWidth: 28, alignItems: 'center' },
  passo: { width: tokens.alvo.minimo, height: tokens.alvo.minimo, alignItems: 'center', justifyContent: 'center', borderWidth: tokens.borda.controle, borderRadius: tokens.raio },
  caixaLinha: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: tokens.alvo.medio },
  caixa: { width: tokens.alvo.minimo, height: tokens.alvo.minimo, alignItems: 'center', justifyContent: 'center', borderWidth: tokens.borda.controle, borderRadius: tokens.raio },
  resultado: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: tokens.alvo.linha, paddingVertical: 6, paddingHorizontal: 12 },
});
