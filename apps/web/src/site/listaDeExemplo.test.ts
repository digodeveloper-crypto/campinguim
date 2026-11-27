// Lista de exemplo do site (feature 1.12): sai do motor do core com a viagem de referência, sem
// conteúdo do catálogo copiado à mão, e mostra as quantidades como a pessoa lê.
import { carregarCatalogo, gerarLista } from '@campinguim/core';
import { describe, expect, it } from 'vitest';

import { VIAGEM_DE_REFERENCIA } from '../../../../packages/core/src/testes/referencia';
import { listaDeExemplo, quantidadeDoItem, VIAGEM_DO_SITE } from './listaDeExemplo';

const catalogo = carregarCatalogo();

describe('lista de exemplo', () => {
  it('a viagem do site é a viagem de referência da SPEC, seção 9 (só os identificadores mudam)', () => {
    const semIds = (v: typeof VIAGEM_DO_SITE) => ({
      ...v,
      familias: v.familias.map((f) => ({ pets: f.pets, faixas: f.pessoas.map((p) => p.faixa) })),
    });
    expect(semIds(VIAGEM_DO_SITE)).toEqual(semIds(VIAGEM_DE_REFERENCIA));
  });

  it('é a lista que o gerarLista do core monta para essa viagem: mesmos itens, mesma ordem, nada à mão', () => {
    const doCore = gerarLista(VIAGEM_DE_REFERENCIA, catalogo);
    const doSite = listaDeExemplo(catalogo).flatMap((c) => c.linhas.map((l) => l.nome));
    expect(doSite.sort()).toEqual(doCore.map((i) => i.nome).sort());
    const porCategoria = listaDeExemplo(catalogo).map((c) => [c.chave, c.linhas.length]);
    const esperado = catalogo.categorias
      .map((c) => [c.key, doCore.filter((i) => i.categoria === c.key).length])
      .filter(([, n]) => Number(n) > 0);
    expect(porCategoria).toEqual(esperado);
  });

  it('tem as 11 categorias do catálogo, na ordem do catálogo, com o nome do catálogo', () => {
    const lista = listaDeExemplo(catalogo);
    expect(lista.map((c) => c.chave)).toEqual(catalogo.categorias.map((c) => c.key));
    expect(lista.map((c) => c.nome)).toEqual(catalogo.categorias.map((c) => c.nome));
  });

  it('cada linha tem uma chave única (para a tela) e só nome e quantidade: nenhum estado de marcação', () => {
    const linhas = listaDeExemplo(catalogo).flatMap((c) => c.linhas);
    expect(new Set(linhas.map((l) => l.chave)).size).toBe(linhas.length);
    for (const l of linhas) expect(Object.keys(l).sort()).toEqual(['chave', 'nome', 'quantidade']);
  });
});

describe('quantidade como a pessoa lê', () => {
  const lista = gerarLista(VIAGEM_DE_REFERENCIA, catalogo);
  const qtd = (chave: string) => {
    const item = lista.find((i) => i.catalogKey === chave);
    if (!item) throw new Error(`sem o item ${chave}`);
    return quantidadeDoItem(item, catalogo);
  };

  it('número sozinho, com unidade no singular e no plural', () => {
    expect(qtd('barraca')).toBe('1');
    expect(qtd('espeques')).toBe('1 jogo');
    expect(qtd('papel_hig')).toMatch(/^\d+ rolos?$/);
  });

  it('a água: litros e galões, como no protótipo ("36 L em 8 galões de 5 L")', () => {
    expect(qtd('agua')).toBe('36 L em 8 galões de 5 L');
  });

  it('item por pessoa mostra a conta ("12 (3 por pessoa)")', () => {
    expect(qtd('mudas')).toBe('12 (3 por pessoa)');
  });

  it('tarefa (sem quantidade) fica sem número', () => {
    const tarefa = lista.find((i) => i.qty === null);
    expect(tarefa).toBeDefined();
    if (tarefa) expect(quantidadeDoItem(tarefa, catalogo)).toBe('');
  });
});
