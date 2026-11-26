// Ícone do Rumo. Sozinho não carrega significado: fica fora da árvore de acessibilidade e o nome
// falado vem do controle ou do texto ao lado (DESIGN.md, seção 6).
import { memo } from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { tokens, useTema, type PapelCor } from '../tema';
import type { NomeIcone } from './desenhos';
import { svgDoIcone } from './svg';

type Props = {
  nome: NomeIcone;
  /** Símbolo cheio do estado ativo (só os 7 ícones de estado têm). */
  ativo?: boolean;
  /** Papel da cor do ícone; padrão `texto`. */
  cor?: PapelCor;
  /** Papel do fundo onde o ícone está, para o recorte; padrão `superficie`. */
  recorte?: PapelCor;
  /** 24 (padrão), 20 em título de bloco e alternado de texto, 18 na linha de estado. */
  tamanho?: number;
};

export const Icone = memo(function Icone({ nome, ativo = false, cor = 'texto', recorte = 'superficie', tamanho = tokens.icone.padrao }: Props) {
  const { cores } = useTema();
  return (
    <View
      style={{ width: tamanho, height: tamanho }}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <SvgXml xml={svgDoIcone(nome, ativo, cores[cor], cores[recorte])} width={tamanho} height={tamanho} />
    </View>
  );
});

export type { NomeIcone } from './desenhos';
export { ORDEM as ORDEM_ICONES } from './desenhos';
