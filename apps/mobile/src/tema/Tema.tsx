// Provedor do tema: claro ou escuro (segue o aparelho, NF-07) e o tamanho da letra do sistema (NF-08).
// A galeria pode forçar o tema e simular a letra; as telas do app só leem `useTema()`.
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme, useWindowDimensions } from 'react-native';

import type { NomeTema, PapelCor } from './contraste';
import { faixaDaLetra } from './familias';
import tokens from './tokens.json';

export type Cores = Record<PapelCor, string>;

export type Tema = {
  nome: NomeTema;
  escuro: boolean;
  cores: Cores;
  /** Letra total: a do sistema vezes a simulada (1 fora da galeria). */
  fator: number;
  /** Multiplicador que só a galeria usa para simular 130 % e 200 % sem mexer no aparelho. */
  simulacao: number;
  /** 100, 130 ou 200: decide as adaptações de letra grande (DESIGN.md 4.4). */
  faixa: 100 | 130 | 200;
};

const Contexto = createContext<Tema | null>(null);

type Props = {
  children: ReactNode;
  /** Força um tema (galeria). Sem valor, segue o aparelho. */
  forcar?: NomeTema | null;
  /** Simula um tamanho de letra (galeria). */
  simulacao?: number;
};

export function TemaProvedor({ children, forcar = null, simulacao = 1 }: Props) {
  const aparelho = useColorScheme();
  const { fontScale } = useWindowDimensions();
  const nome: NomeTema = forcar ?? (aparelho === 'dark' ? 'escuro' : 'claro');
  const valor = useMemo<Tema>(() => {
    const fator = fontScale * simulacao;
    return {
      nome,
      escuro: nome === 'escuro',
      cores: tokens.cores[nome],
      fator,
      simulacao,
      faixa: faixaDaLetra(fator),
    };
  }, [nome, fontScale, simulacao]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useTema(): Tema {
  const tema = useContext(Contexto);
  if (!tema) throw new Error('useTema fora do TemaProvedor');
  return tema;
}

/** Cor com transparência a partir de um papel (DESIGN.md 3.1: transparência só sobre os 10 papéis). */
export function comOpacidade(hex: string, opacidade: number): string {
  const alfa = Math.round(opacidade * 255).toString(16).padStart(2, '0');
  return `${hex}${alfa}`;
}
