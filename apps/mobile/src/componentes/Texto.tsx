// Texto do Rumo: aplica a família, o tamanho e a cor de um uso da escala (DESIGN.md 4). Números sempre
// tabulares. A caixa alta é só de estilo: o leitor de tela recebe a frase normal do arquivo de textos (4.3).
// Respeita a letra do sistema até 200 % (NF-08): o React Native já amplia; aqui só entram as adaptações.
import type { ReactNode } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { estiloDoUso, useTema, type PapelCor, type UsoTexto } from '../tema';

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

export function Texto({ uso = 'corpo', cor = 'texto', children, style, titulo = false, falado, semLeitura = false, testID }: Props) {
  const tema = useTema();
  const e = estiloDoUso(uso, tema.fator, tema.simulacao);
  const caixaAlta = e.textTransform === 'uppercase';
  const nome = falado ?? (caixaAlta && typeof children === 'string' ? children : undefined);
  return (
    <Text
      testID={testID}
      accessibilityRole={titulo ? 'header' : 'text'}
      accessibilityLabel={nome}
      accessible={!semLeitura}
      importantForAccessibility={semLeitura ? 'no' : 'auto'}
      style={[
        {
          fontFamily: tema.fontes ? e.fontFamily : undefined,
          fontSize: e.fontSize,
          lineHeight: e.lineHeight,
          letterSpacing: e.letterSpacing,
          textTransform: e.textTransform,
          color: tema.cores[cor],
          fontVariant: ['tabular-nums'],
          // O peso já está no arquivo da família; sem isto o Android pode engrossar de novo.
          fontWeight: 'normal',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
