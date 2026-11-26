import { type ChavesDeTexto, textoDaChave, type ValoresDeTexto } from '@campinguim/core/formato';

import textosPtBr from './pt-BR.json';

// Único ponto de acesso aos textos da interface. As telas nunca escrevem frase solta no código (a
// regra de lint react/jsx-no-literals barra texto escrito no JSX, e o teste de chaves barra chave
// que não existe no arquivo).
//
// Dois jeitos de usar, os dois com chave conferida pelo TypeScript:
//   textos.lista.titulo                      texto fixo, direto da tela e da chave
//   t('lista.faltam', { n: 3 })              texto com {marcas}; com n, o plural sai sozinho
//                                            ("Falta 1 para o carro." / "Faltam 3 para o carro.")
export const textos = textosPtBr;

/** Qualquer chave de texto no formato "tela.chave". Erro de digitação não compila. */
export type ChaveDeTexto = ChavesDeTexto<typeof textosPtBr>;

/** O texto da chave, com as marcas trocadas e o plural resolvido. */
export function t(chave: ChaveDeTexto, valores?: ValoresDeTexto): string {
  return textoDaChave(textosPtBr, chave, valores);
}
