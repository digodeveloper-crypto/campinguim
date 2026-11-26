// 7.3 Botões (DESIGN.md). Medidas de design/prototipos/rumo/estilo.css (.botao, .marca, .alt, .filtro,
// .discreto, .painel-fechar, .voltar). Alvo mínimo de 44 dp (D-7); 48 no fechar e no voltar; 56 no principal.
// Estados: normal, pressão, desativado e ligado. O protótipo não desenha pressão nem desativado; a forma
// escolhida aqui é provisória e está em docs/componentes.md ("Decisões"): sempre dentro dos 10 papéis,
// sem opacidade, sem sombra e com o texto legível (contraste ≥ 4,5 em todos os casos).
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icone, type NomeIcone } from '../icones/Icone';
import { textos } from '../textos';
import { tokens, useTema } from '../tema';
import { estadoDoToque, papeisDaAlternancia, papeisDaMarca, papeisDoBotao, papeisDoFiltro, type IconeAlternancia } from './estados';
import { Texto } from './Texto';

const t = { acao: textos.acoes };
const BORDA = tokens.borda.controle;

type Base = {
  /** Nome falado; por padrão, o texto visível. */
  falado?: string | undefined;
  desativado?: boolean;
  aoTocar?: (() => void) | undefined;
  testID?: string | undefined;
  style?: StyleProp<ViewStyle>;
};

// ---------------------------------------------------------------------------------------------
// Principal e secundário

type PropsBotao = Base & {
  texto: string;
  tipo?: 'principal' | 'secundario';
  icone?: NomeIcone | undefined;
};

export function Botao({ texto, tipo = 'principal', icone, falado, desativado = false, aoTocar, testID, style }: PropsBotao) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="button"
      accessibilityLabel={falado ?? texto}
      accessibilityState={{ disabled: desativado }}
      style={({ pressed }) => {
        const c = papeisDoBotao(tipo, estadoDoToque(pressed, desativado));
        return [
          estilos.botao,
          { flexGrow: tipo === 'principal' ? 2 : 1, backgroundColor: cores[c.fundo], borderColor: cores[c.borda] },
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const c = papeisDoBotao(tipo, estadoDoToque(pressed, desativado));
        return (
          <>
            {icone ? <Icone nome={icone} cor={c.letra} recorte={c.fundo} /> : null}
            <Texto uso="botao" cor={c.letra} semLeitura style={estilos.centro}>
              {texto}
            </Texto>
          </>
        );
      }}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------
// Alternado de texto (.marca): ciente, feito, eu levo, paguei, está no carro

type PropsMarca = Base & {
  texto: string;
  ligado: boolean;
  icone?: NomeIcone | undefined;
  /** "Está no carro" ligado: borda e letra `carro` sobre `superficie`. */
  carro?: boolean;
  /** 48 em "eu levo" na página do convidado. */
  alvo?: number;
};

export function BotaoMarca({ texto, ligado, icone, carro = false, alvo = tokens.alvo.minimo, falado, desativado = false, aoTocar, testID, style }: PropsMarca) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="togglebutton"
      accessibilityLabel={falado ?? texto}
      accessibilityState={{ checked: ligado, disabled: desativado }}
      style={({ pressed }) => {
        const c = papeisDaMarca(ligado, carro, estadoDoToque(pressed, desativado));
        return [estilos.marca, { minHeight: alvo, minWidth: alvo, backgroundColor: cores[c.fundo], borderColor: cores[c.borda] }, style];
      }}
    >
      {({ pressed }) => {
        const c = papeisDaMarca(ligado, carro, estadoDoToque(pressed, desativado));
        return (
          <>
            {icone ? <Icone nome={icone} cor={c.letra} recorte={c.fundo} tamanho={tokens.icone.bloco} /> : null}
            <Texto uso="estado" cor={c.letra} semLeitura style={estilos.centro}>
              {texto}
            </Texto>
          </>
        );
      }}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------
// Alternância de símbolo (.alt): separei, carro, conferido, secar, ciente

type PropsAlternancia = Omit<Base, 'falado'> & {
  icone: IconeAlternancia;
  ligado: boolean;
  /** Obrigatório: o símbolo sozinho não tem nome. Ex.: "Lanterna: está no carro". */
  falado: string;
};

export function Alternancia({ icone, ligado, falado, desativado = false, aoTocar, testID, style }: PropsAlternancia) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="togglebutton"
      accessibilityLabel={falado}
      accessibilityState={{ checked: ligado, disabled: desativado }}
      style={({ pressed }) => {
        const c = papeisDaAlternancia(icone, ligado, estadoDoToque(pressed, desativado));
        return [estilos.alt, { backgroundColor: cores[c.fundo], borderColor: cores[c.borda] }, style];
      }}
    >
      {({ pressed }) => {
        const c = papeisDaAlternancia(icone, ligado, estadoDoToque(pressed, desativado));
        return <Icone nome={icone} ativo={ligado} cor={c.letra} recorte={c.fundo} />;
      }}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------
// Filtro (.filtro)

type PropsFiltro = Base & { texto: string; ligado: boolean; icone?: NomeIcone };

export function Filtro({ texto, ligado, icone, falado, desativado = false, aoTocar, testID, style }: PropsFiltro) {
  const { cores } = useTema();
  const papel = (pressed: boolean) => papeisDoFiltro(ligado, estadoDoToque(pressed, desativado));
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="togglebutton"
      accessibilityLabel={falado ?? texto}
      accessibilityState={{ checked: ligado, disabled: desativado }}
      style={({ pressed }) => {
        const c = papel(pressed);
        return [estilos.filtro, { backgroundColor: cores[c.fundo], borderColor: cores[c.borda] }, style];
      }}
    >
      {({ pressed }) => {
        const c = papel(pressed);
        return (
          <>
            {icone ? <Icone nome={icone} cor={c.letra} recorte={c.fundo} tamanho={tokens.icone.bloco} /> : null}
            <Texto uso={ligado ? 'filtroLigado' : 'filtro'} cor={c.letra} semLeitura>
              {texto}
            </Texto>
          </>
        );
      }}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------
// Discreto (.discreto): ligação de texto sublinhada, 44 de altura

type PropsDiscreto = Base & { texto: string };

export function Discreto({ texto, falado, desativado = false, aoTocar, testID, style }: PropsDiscreto) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="link"
      accessibilityLabel={falado ?? texto}
      accessibilityState={{ disabled: desativado }}
      style={({ pressed }) => [estilos.discreto, pressed ? { backgroundColor: cores.superficie } : null, style]}
    >
      <Texto uso="secundario" cor="textoSuave" semLeitura style={estilos.sublinhado}>
        {texto}
      </Texto>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------------------------
// Fechar painel (48 × 48, borda `linha`) e Voltar (48, ícone e texto)

type PropsFechar = Omit<Base, 'falado'> & { falado?: string };

export function BotaoFechar({ falado = t.acao.fechar, aoTocar, testID, style }: PropsFechar) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={falado}
      style={({ pressed }) => [estilos.fechar, { borderColor: cores.linha, backgroundColor: pressed ? cores.fundo : 'transparent' }, style]}
    >
      {({ pressed }) => <Icone nome="fechar" recorte={pressed ? 'fundo' : 'superficie'} />}
    </Pressable>
  );
}

export function BotaoVoltar({ aoTocar, testID, style }: Omit<Base, 'falado' | 'desativado'>) {
  const { cores } = useTema();
  return (
    <Pressable
      testID={testID}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={t.acao.voltar}
      style={({ pressed }) => [estilos.voltar, pressed ? { backgroundColor: cores.superficie } : null, style]}
    >
      <Icone nome="voltar" recorte="fundo" />
      <Texto uso="linhaNome" semLeitura>
        {t.acao.voltar}
      </Texto>
    </Pressable>
  );
}

/** Linha de botões do rodapé: o principal ocupa o dobro do secundário e desce de linha se não couber. */
export function LinhaDeBotoes({ children }: { children: ReactNode }) {
  return <View style={estilos.linhaBotoes}>{children}</View>;
}

const estilos = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexShrink: 1,
    flexBasis: 128,
    minHeight: tokens.alvo.principal,
    minWidth: tokens.alvo.minimo,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: tokens.raio,
    borderWidth: BORDA,
  },
  centro: { textAlign: 'center', flexShrink: 1 },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: BORDA,
    borderRadius: tokens.raio,
    flexShrink: 1,
  },
  alt: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tokens.alvo.minimo,
    height: tokens.alvo.minimo,
    borderWidth: BORDA,
    borderRadius: tokens.raio,
  },
  filtro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: tokens.alvo.minimo,
    minWidth: tokens.alvo.minimo,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: BORDA,
    borderRadius: tokens.raio,
  },
  discreto: { alignSelf: 'center', justifyContent: 'center', minHeight: tokens.alvo.minimo, minWidth: tokens.alvo.minimo, paddingHorizontal: 12 },
  sublinhado: { textDecorationLine: 'underline' },
  fechar: {
    alignItems: 'center',
    justifyContent: 'center',
    width: tokens.alvo.medio,
    height: tokens.alvo.medio,
    borderWidth: BORDA,
    borderRadius: tokens.raio,
  },
  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    minHeight: tokens.alvo.medio,
    minWidth: tokens.alvo.medio,
    marginTop: 8,
    paddingRight: 8,
  },
  linhaBotoes: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.espaco.entreBotoes },
});
