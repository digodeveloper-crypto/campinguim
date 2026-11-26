// Mascote na interface (DESIGN.md 8). Desenha os bytes exatos do pacote final (artes.ts): só a largura
// muda, a altura acompanha. Sem girar, espelhar, recortar, filtrar, mudar opacidade ou animar.
// No tema claro, sem apoio. No escuro, a arte colorida fica sobre o papel na cor `texto`, de canto cortado.
// Regra da tela: no máximo um mascote, e nunca em linha de lista, tabela de gastos ou campo.
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { tokens, useTema } from '../../tema';
import { CantoCortado } from '../CantoCortado';
import { ARTES, type NomeArte } from './artes';

/** Apoio por tamanho (DESIGN.md 8): chanfro e respiro do papel no escuro. */
export function apoioDoTamanho(largura: number): { chanfro: number; respiro: number } {
  if (largura >= 136) return { chanfro: tokens.chanfro.abertura, respiro: 8 };
  if (largura >= 96) return { chanfro: tokens.chanfro.cabeca, respiro: 6 };
  if (largura >= 32) return { chanfro: tokens.chanfro.rota, respiro: 3 };
  return { chanfro: tokens.chanfro.rota, respiro: 4 };
}

/** Proporção da arte pelo viewBox do próprio arquivo. */
export function proporcao(arte: NomeArte): number {
  const m = /viewBox="([\d.\s-]+)"/.exec(ARTES[arte]);
  const partes = m?.[1]?.trim().split(/\s+/).map(Number) ?? [];
  const [, , w, h] = partes;
  return w && h ? h / w : 1;
}

/** O ícone de 24 é o mínimo medido para a marca pequena (guia do mascote, seção 6). */
export const MENOR_LARGURA = 24;

type Props = {
  arte: NomeArte;
  /** Largura em dp: 176 (abertura), 136 (site), 96 (cabeçalho), 32 (convidado), 24 (rota). */
  largura: number;
  testID?: string | undefined;
};

export function Mascote({ arte, largura, testID }: Props) {
  const { escuro, cores } = useTema();
  const w = Math.max(MENOR_LARGURA, largura);
  const figura = <SvgXml xml={ARTES[arte]} width={w} height={w * proporcao(arte)} />;
  const oculto = { accessible: false, importantForAccessibility: 'no-hide-descendants' as const, accessibilityElementsHidden: true };
  if (!escuro) {
    return (
      <View testID={testID} {...oculto}>
        {figura}
      </View>
    );
  }
  const { chanfro, respiro } = apoioDoTamanho(w);
  return (
    <View testID={testID} {...oculto} style={{ alignSelf: 'flex-start' }}>
      <CantoCortado camadas={[{ cor: cores.texto, chanfro }]} style={{ padding: respiro }}>
        {figura}
      </CantoCortado>
    </View>
  );
}
