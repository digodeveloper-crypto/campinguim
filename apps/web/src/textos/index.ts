import { type ChavesDeTexto, textoDaChave, type ValoresDeTexto } from '@campinguim/core/formato';

import textosPtBr from './pt-BR.json';

// Único ponto de acesso aos textos da página. Nenhuma frase solta no código. Mesmo uso do arquivo
// do app (veja apps/mobile/src/textos/index.ts):
//   textos.convite.entrar                    texto fixo
//   t('site.itens', { n: 1 })                texto com {marcas}; com n, o plural sai sozinho
export const textos = textosPtBr;

/** Qualquer chave de texto no formato "tela.chave". Erro de digitação não compila. */
export type ChaveDeTexto = ChavesDeTexto<typeof textosPtBr>;

/** O texto da chave, com as marcas trocadas e o plural resolvido. */
export function t(chave: ChaveDeTexto, valores?: ValoresDeTexto): string {
  return textoDaChave(textosPtBr, chave, valores);
}
