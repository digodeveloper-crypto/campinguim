// Texto do Rumo: aplica a família, o tamanho e a cor de um uso da escala (DESIGN.md 4). Números sempre
// tabulares. A caixa alta é só de estilo: o leitor de tela recebe a frase normal do arquivo de textos (4.3).
// Respeita a letra do sistema até 200 % (NF-08): o React Native já amplia; aqui só entram as adaptações.
// Nenhuma palavra parte no meio (DESIGN.md 4.4): o texto mede a largura que tem e, se a palavra mais longa
// não cabe nela, diminui só o necessário (pelas métricas da própria fonte, tema/metricas.ts). Sem isso, o
// Android quebra a palavra letra a letra ("Co/zin/ha"). O Android também quebra depois de "/" ("nov/ 2026");
// um sinal invisível que junta palavras (U+2060) depois da barra impede isso, como no navegador.
import { useState, type ReactNode } from 'react';
import { Text, useWindowDimensions, type LayoutChangeEvent, type StyleProp, type TextStyle } from 'react-native';

import { escalaParaCaber, estiloDoUso, useTema, type PapelCor, type UsoTexto } from '../tema';

type Props = {
  uso?: UsoTexto;
  cor?: PapelCor;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  /** Marca o texto como título para o leitor de tela. */
  titulo?: boolean;
  /** Nome falado, quando o texto visível não basta (por padrão, o próprio texto em caixa normal). */
  falado?: string | undefined;
  /** Esconde do leitor (o nome já está no controle que contém o texto). */
  semLeitura?: boolean;
  testID?: string | undefined;
};

/** Depois da barra, o sinal invisível que impede a quebra de linha ali (U+2060, WORD JOINER). */
const SEM_QUEBRA_NA_BARRA = /\//g;
const BARRA_JUNTA = '/' + String.fromCharCode(0x2060);

/** O texto visível, quando é só texto (é o que pode partir). */
function textoDe(children: ReactNode): string | null {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children) && children.every((c) => typeof c === 'string' || typeof c === 'number')) return children.join('');
  return null;
}

export function Texto({ uso = 'corpo', cor = 'texto', children, style, titulo = false, falado, semLeitura = false, testID }: Props) {
  const tema = useTema();
  const { fontScale } = useWindowDimensions();
  // A maior largura que o texto já ocupou: quando uma palavra não cabe, o texto quebra e ocupa toda a
  // largura que tem; depois de diminuir, ele pode ficar mais estreito, mas a largura disponível continua.
  const [largura, setLargura] = useState(0);
  const e = estiloDoUso(uso, tema.fator, tema.simulacao);
  const caixaAlta = e.textTransform === 'uppercase';
  const texto = textoDe(children);
  // O leitor de tela recebe a frase como está no arquivo de textos (caixa normal, sem o sinal invisível).
  const nome = falado ?? (texto !== null && (caixaAlta || texto.includes('/')) ? texto : undefined);
  const escala =
    tema.fontes && texto !== null && largura > 0
      ? escalaParaCaber(
          texto,
          // A letra do sistema o Android aplica por cima do tamanho: a conta usa o tamanho que aparece.
          { familia: e.fontFamily, tamanho: e.fontSize * fontScale, espacoLetras: e.letterSpacing * fontScale, caixaAlta },
          largura,
        )
      : 1;
  const medir = (ev: LayoutChangeEvent) => {
    const w = ev.nativeEvent.layout.width;
    setLargura((anterior) => (w > anterior + 0.5 ? w : anterior));
  };
  return (
    <Text
      testID={testID}
      onLayout={texto === null ? undefined : medir}
      accessibilityRole={titulo ? 'header' : 'text'}
      accessibilityLabel={nome}
      accessible={!semLeitura}
      importantForAccessibility={semLeitura ? 'no' : 'auto'}
      style={[
        {
          fontFamily: tema.fontes ? e.fontFamily : undefined,
          fontSize: e.fontSize * escala,
          lineHeight: e.lineHeight * escala,
          letterSpacing: e.letterSpacing * escala,
          textTransform: e.textTransform,
          color: tema.cores[cor],
          fontVariant: ['tabular-nums'],
          // O peso já está no arquivo da família; sem isto o Android pode engrossar de novo.
          fontWeight: 'normal',
        },
        style,
      ]}
    >
      {texto === null ? children : texto.replace(SEM_QUEBRA_NA_BARRA, BARRA_JUNTA)}
    </Text>
  );
}
