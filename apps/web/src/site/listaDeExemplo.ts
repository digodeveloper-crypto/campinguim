// Lista de exemplo do site (feature 1.12; SPEC, seção 7, "Página inicial do site"; PRD, seção 18,
// "listas prontas por tipo de viagem"): a lista da viagem de referência da SPEC, seção 9, gerada
// pelo mesmo motor do app (`gerarLista` do core) a partir do catálogo. Nada do catálogo é copiado à
// mão. Só leitura: sem estados de marcação, sem etiqueta "depende do camping" (P9) e sem dado de
// camping (DEF-02).
import { carregarCatalogo, type Catalogo, type EntradaDaViagem, gerarLista, type ItemDaLista } from '@campinguim/core';
import { formatarNumero } from '@campinguim/core/formato';

import { t } from '../textos';

/**
 * Viagem de referência (SPEC, seção 9; a mesma de packages/core/src/testes/referencia.ts e dos
 * protótipos): barraca com carro, 2 noites, 2 adultos, 2 crianças, 1 pet, frio, sem chuva, uma
 * família, sem destino.
 */
export const VIAGEM_DO_SITE: EntradaDaViagem = {
  tipo: 'tent_car',
  noites: 2,
  clima: 'cold',
  chuva: false,
  familias: [
    {
      id: 'familia',
      pets: 1,
      pessoas: [
        { id: 'adulto-1', faixa: 'adult' },
        { id: 'adulto-2', faixa: 'adult' },
        { id: 'crianca-1', faixa: 'child' },
        { id: 'crianca-2', faixa: 'child' },
      ],
    },
  ],
  destino: false,
  dadosDoCamping: false,
};

export type LinhaDeExemplo = { chave: string; nome: string; quantidade: string };
export type CategoriaDeExemplo = { chave: string; nome: string; linhas: LinhaDeExemplo[] };

function unidade(catalogo: Catalogo, chave: string, n: number): string {
  const u = catalogo.unidades[chave];
  if (!u) return chave;
  return n === 1 ? u.singular : u.plural;
}

/** Quantidade como a pessoa lê: "2", "1 jogo", "8 galões de 5 L", "36 L em 8 galões de 5 L", "12 (3 por pessoa)". */
export function quantidadeDoItem(item: ItemDaLista, catalogo: Catalogo): string {
  if (item.qty === null) return '';
  const numero = formatarNumero(item.qty);
  const base = item.unidade ? t('site.quantidadeComUnidade', { n: numero, unidade: unidade(catalogo, item.unidade, item.qty) }) : numero;
  if (item.detalhe) {
    const detalhe = t('site.quantidadeComUnidade', {
      n: formatarNumero(item.detalhe.qty),
      unidade: unidade(catalogo, item.detalhe.unidade, item.detalhe.qty),
    });
    return t('site.quantidadeComDetalhe', { detalhe, quantidade: base });
  }
  if (item.porPessoa !== null && item.porPessoa !== item.qty) {
    return t('site.quantidadePorPessoa', { quantidade: base, porPessoa: formatarNumero(item.porPessoa) });
  }
  return base;
}

/** As categorias da lista de exemplo, na ordem do catálogo, com as linhas na ordem da lista. */
export function listaDeExemplo(catalogo: Catalogo = carregarCatalogo()): CategoriaDeExemplo[] {
  const lista = gerarLista(VIAGEM_DO_SITE, catalogo);
  return catalogo.categorias
    .map((c) => ({
      chave: c.key,
      nome: c.nome,
      linhas: lista
        .filter((i) => i.categoria === c.key && !i.removido)
        .map((i) => ({ chave: i.ref, nome: i.nome, quantidade: quantidadeDoItem(i, catalogo) })),
    }))
    .filter((c) => c.linhas.length > 0);
}
