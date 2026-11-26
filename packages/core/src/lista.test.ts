import { describe, expect, it } from 'vitest';

import { carregarCatalogo } from './catalogo';
import {
  adicionarItemManual,
  categoriasVisiveis,
  editarItem,
  editarQuantidade,
  ErroDeLista,
  gerarLista,
  recalcularLista,
  removerItem,
  restaurarItem,
  type ItemDaLista,
} from './lista';
import { FAMILIA_DA_CARLA, VIAGEM_DE_REFERENCIA } from './testes/referencia';
import { ErroDeEntrada, noitesEntre, type EntradaDaViagem } from './variaveis';

const catalogo = carregarCatalogo();
const FAM = FAMILIA_DA_CARLA.id;

const porChave = (lista: readonly ItemDaLista[], chave: string): ItemDaLista | undefined => lista.find((i) => i.catalogKey === chave);
const qty = (lista: readonly ItemDaLista[], chave: string): number | null | undefined => porChave(lista, chave)?.qty;
const chaves = (itens: readonly ItemDaLista[]): string[] => itens.map((i) => i.catalogKey ?? i.nome).sort();

describe('Geração da lista: viagem de referência (SPEC, seção 9)', () => {
  const lista = gerarLista(VIAGEM_DE_REFERENCIA, catalogo);

  it('L1: quantidades', () => {
    expect(qty(lista, 'gas')).toBe(2);
    expect(qty(lista, 'gelo')).toBe(2);
    expect(porChave(lista, 'gelo')?.unidade).toBe('saco_5kg');
    expect(qty(lista, 'agua')).toBe(8);
    expect(porChave(lista, 'agua')?.unidade).toBe('galao_5l');
    expect(porChave(lista, 'agua')?.detalhe).toEqual({ qty: 36, unidade: 'litro' });
    expect(qty(lista, 'sacos_lixo')).toBe(6);
    expect(qty(lista, 'papel_hig')).toBe(2);
    expect(qty(lista, 'cadeiras')).toBe(4);
    expect(qty(lista, 'lanterna')).toBe(2);
    expect(porChave(lista, 'mudas')?.porPessoa).toBe(3);
    expect(qty(lista, 'mudas')).toBe(12);
    expect(qty(lista, 'manta')).toBe(4);
    expect(qty(lista, 'muda_crianca')).toBe(2);
    expect(qty(lista, 'carvao')).toBe(1);
    expect(porChave(lista, 'carvao')?.unidade).toBe('saco_4kg');
  });

  it('L2: itens presentes por condição', () => {
    for (const chave of ['manta', 'gorro', 'agasalho', 'lencos', 'brinquedos', 'racao', 'potes', 'guia', 'vacina', 'saquinhos', 'cama_pet']) {
      expect(porChave(lista, chave), chave).toBeDefined();
    }
    expect(porChave(lista, 'agasalho')?.porPessoa).toBe(2);
    // "todos os itens de pet": a categoria inteira
    expect(lista.filter((i) => i.categoria === 'pet').map((i) => i.catalogKey)).toEqual(
      catalogo.itens.filter((i) => i.category === 'pet').map((i) => i.key),
    );
  });

  it('L3: itens ausentes por condição', () => {
    for (const chave of ['lencol', 'capa_chuva', 'muda_seca', 'tapete', 'lona_sombra', 'roupa_banho', 'chapeu', 'boia', 'fraldas', 'comida_bebe']) {
      expect(porChave(lista, chave), chave).toBeUndefined();
    }
  });

  it('L4: mudar o clima para calor mostra as entradas e saídas', () => {
    const r = recalcularLista(lista, { ...VIAGEM_DE_REFERENCIA, clima: 'hot' }, catalogo);
    expect(chaves(r.sairam)).toEqual(['agasalho', 'gorro', 'manta']);
    expect(chaves(r.entraram)).toEqual(['boia', 'chapeu', 'lencol', 'lona_sombra', 'roupa_banho']);
    expect({ entraram: r.entraram.length, sairam: r.sairam.length }).toEqual({ entraram: 5, sairam: 3 });
  });

  it('L5: remover a grelha e depois mudar as noites para 3', () => {
    const semGrelha = removerItem(lista, `grelha@grupo`);
    const r = recalcularLista(semGrelha, { ...VIAGEM_DE_REFERENCIA, noites: 3 }, catalogo);
    expect(porChave(r.lista, 'grelha')?.removido).toBe(true);
    expect(r.entraram.map((i) => i.catalogKey)).not.toContain('grelha');
    expect(qty(r.lista, 'gas')).toBe(3);
    expect(qty(r.lista, 'sacos_lixo')).toBe(8);
    expect(porChave(r.lista, 'mudas')?.porPessoa).toBe(4);
    expect(qty(r.lista, 'mudas')).toBe(16);
  });

  it('L6: item adicionado à mão continua na lista, sem alteração, depois do recálculo', () => {
    const comRede = adicionarItemManual(lista, { ref: 'manual-1', nome: 'rede de descanso', categoria: 'lazer_documentos', familiaId: FAM, qty: 1 });
    const manual = comRede.find((i) => i.ref === 'manual-1');
    const r = recalcularLista(comRede, { ...VIAGEM_DE_REFERENCIA, noites: 3, clima: 'hot', tipo: 'backpack' }, catalogo);
    expect(r.lista.find((i) => i.ref === 'manual-1')).toEqual(manual);
    expect(manual?.origem).toBe('manual');
  });

  it('L7: a quantidade da água editada para 4 galões é preservada no recálculo', () => {
    const editada = editarQuantidade(lista, 'agua@grupo', 4);
    const r = recalcularLista(editada, { ...VIAGEM_DE_REFERENCIA, noites: 3 }, catalogo);
    expect(qty(r.lista, 'agua')).toBe(4);
    expect(porChave(r.lista, 'agua')?.qtyEditada).toBe(true);
    expect(r.quantidadesAlteradas.map((m) => m.ref)).not.toContain('agua@grupo');
  });

  it('L8: trocar para trilha com mochila', () => {
    const r = recalcularLista(lista, { ...VIAGEM_DE_REFERENCIA, tipo: 'backpack' }, catalogo);
    expect(chaves(r.sairam)).toEqual(['balde', 'cadeiras', 'carvao', 'cintas', 'cooler', 'grelha', 'mesa']);
    expect(r.entraram).toEqual([]);
  });
});

describe('Lista esperada da família da Carla (SPEC, seção 13: viagem de referência)', () => {
  // [chave, quantidade total (ou "tarefa"), quantidade por pessoa (escopo pessoa), família (nulo = grupo), "depende do camping"]
  type Esperado = [string, number | 'tarefa', number | null, string | null, boolean];
  const esperado: Esperado[] = [
    ['barraca', 1, null, FAM, false], ['lona_chao', 1, null, FAM, false], ['espeques', 1, null, FAM, false],
    ['martelo', 1, null, null, false], ['kit_reparo', 1, null, null, false], ['vassourinha', 1, null, FAM, false],
    ['saco_dormir', 4, 1, FAM, false], ['isolante', 4, 1, FAM, false], ['travesseiro', 4, 1, FAM, false], ['manta', 4, 1, FAM, false],
    ['fogareiro', 1, null, null, false], ['gas', 2, null, null, false], ['isqueiro', 2, null, null, false], ['para_vento', 1, null, null, false],
    ['panelas', 1, null, null, false], ['utensilios', 1, null, null, false], ['tabua', 1, null, null, false], ['pratos', 4, 1, FAM, false],
    ['cooler', 1, null, FAM, false], ['louca', 1, null, null, false], ['sacos_lixo', 6, null, null, false], ['papel_toalha', 1, null, null, false],
    ['mesa', 1, null, FAM, false], ['cadeiras', 4, null, FAM, false], ['carvao', 1, null, null, false], ['grelha', 1, null, null, false],
    ['agua', 8, null, null, true], ['gelo', 2, null, null, false], ['refeicoes', 'tarefa', null, null, false], ['basicos', 1, null, null, false],
    ['lanches', 4, 1, FAM, false],
    ['mudas', 12, 3, FAM, false], ['roupa_dormir', 4, 1, FAM, false], ['agasalho', 8, 2, FAM, false], ['gorro', 4, 1, FAM, false],
    ['calcado', 4, 1, FAM, false], ['chinelo', 4, 1, FAM, false],
    ['toalha', 4, 1, FAM, false], ['kit_higiene', 1, null, FAM, false], ['papel_hig', 2, null, FAM, false], ['protetor', 1, null, FAM, false],
    ['repelente', 1, null, FAM, false], ['lencos', 1, null, FAM, false], ['ducha', 1, null, FAM, true],
    ['kit_socorros', 1, null, FAM, false], ['remedios', 'tarefa', null, FAM, false], ['lanterna', 2, null, FAM, false], ['lampiao', 1, null, FAM, false],
    ['pilhas', 1, null, FAM, false], ['bateria_portatil', 1, null, FAM, false], ['balde', 1, null, null, false],
    ['canivete', 1, null, FAM, false], ['varal', 1, null, null, false], ['fita', 1, null, null, false], ['extensao', 1, null, FAM, true],
    ['adaptador', 1, null, FAM, true], ['carregadores', 1, null, FAM, false], ['cintas', 1, null, FAM, false],
    ['jogos', 1, null, FAM, false], ['documentos', 'tarefa', null, FAM, false], ['dinheiro', 'tarefa', null, FAM, false],
    ['muda_crianca', 2, null, FAM, false], ['brinquedos', 1, null, FAM, false],
    ['racao', 4, null, FAM, false], ['potes', 1, null, FAM, false], ['guia', 1, null, FAM, false], ['vacina', 1, null, FAM, false],
    ['saquinhos', 1, null, FAM, false], ['cama_pet', 1, null, FAM, false],
  ];

  it('gera exatamente estes itens, nesta ordem, com estas quantidades', () => {
    const lista = gerarLista(VIAGEM_DE_REFERENCIA, catalogo);
    const real: Esperado[] = lista.map((i) => [i.catalogKey ?? '', i.tarefa ? 'tarefa' : (i.qty as number), i.porPessoa, i.familiaId, i.dependeDoCamping]);
    expect(real).toEqual(esperado);
  });

  it('todos os itens nascem gerados, não removidos, sem edição e com estados zerados', () => {
    for (const item of gerarLista(VIAGEM_DE_REFERENCIA, catalogo)) {
      expect(item).toMatchObject({ origem: 'generated', removido: false, qtyEditada: false, nota: null, aprendizado: null });
      expect(item.estado).toEqual({ packState: 'todo', needBuy: false, returnState: 'unchecked', missing: false, leftover: false });
      expect(item.ref).toBe(`${item.catalogKey}@${item.familiaId ?? 'grupo'}`);
    }
  });

  it('a tarefa das refeições planeja D cafés, D almoços e N jantares', () => {
    expect(porChave(gerarLista(VIAGEM_DE_REFERENCIA, catalogo), 'refeicoes')?.tarefa).toEqual({
      tipo: 'planejar_refeicoes',
      partes: { cafes: 3, almocos: 3, jantares: 2 },
    });
  });

  it('E1-02: todas as categorias aparecem; sem crianças e sem pet, essas duas somem', () => {
    const todas = catalogo.categorias.map((c) => c.key);
    expect(categoriasVisiveis(gerarLista(VIAGEM_DE_REFERENCIA, catalogo), catalogo)).toEqual(todas);
    const casal: EntradaDaViagem = {
      ...VIAGEM_DE_REFERENCIA,
      familias: [{ id: 'casal', pets: 0, pessoas: [{ id: 'a', faixa: 'adult' }, { id: 'b', faixa: 'adult' }] }],
    };
    expect(categoriasVisiveis(gerarLista(casal, catalogo), catalogo)).toEqual(todas.filter((c) => c !== 'criancas' && c !== 'pet'));
  });

  it('E1-02: categoria com todos os itens removidos some', () => {
    let lista = gerarLista(VIAGEM_DE_REFERENCIA, catalogo);
    for (const item of lista.filter((i) => i.categoria === 'pet')) lista = removerItem(lista, item.ref);
    expect(categoriasVisiveis(lista, catalogo)).not.toContain('pet');
  });
});

describe('Regras de geração (SPEC, seção 5)', () => {
  it('E1-03: as quantidades mudam com pessoas e noites', () => {
    const grande: EntradaDaViagem = {
      ...VIAGEM_DE_REFERENCIA,
      noites: 4,
      familias: [{ ...FAMILIA_DA_CARLA, pessoas: [...FAMILIA_DA_CARLA.pessoas, ...Array.from({ length: 6 }, (_, i) => ({ id: `extra-${i}`, faixa: 'adult' as const }))] }],
    };
    const lista = gerarLista(grande, catalogo);
    // P = 10, N = 4, D = 5
    expect(qty(lista, 'gas')).toBe(6); // teto(40 / 8) + 1
    expect(qty(lista, 'gelo')).toBe(9); // teto(5 / 2) × teto(10 / 4) = 3 × 3
    expect(qty(lista, 'agua')).toBe(30); // teto(3 × 10 × 5 / 5)
    expect(porChave(lista, 'agua')?.detalhe?.qty).toBe(150);
    expect(qty(lista, 'carvao')).toBe(2); // teto(10 / 8)
    expect(qty(lista, 'fogareiro')).toBe(2); // acima de 8 pessoas
    expect(qty(lista, 'papel_hig')).toBe(10); // teto(10 × 4 / 4)
  });

  it('chuva, clima ameno, bebê e destino: as condições restantes', () => {
    const entrada: EntradaDaViagem = {
      ...VIAGEM_DE_REFERENCIA,
      clima: 'mild',
      chuva: true,
      destino: true,
      noites: 1,
      familias: [{ id: 'f', pets: 2, pessoas: [{ id: 'a', faixa: 'adult' }, { id: 't', faixa: 'teen' }, { id: 'b', faixa: 'toddler' }] }],
    };
    const lista = gerarLista(entrada, catalogo);
    for (const chave of ['tapete', 'capa_chuva', 'muda_seca', 'lona_sombra', 'chapeu', 'agasalho', 'reserva', 'fraldas', 'comida_bebe', 'lencos']) {
      expect(porChave(lista, chave), chave).toBeDefined();
    }
    expect(porChave(lista, 'agasalho')?.porPessoa).toBe(1); // 1 no ameno
    expect(qty(lista, 'fraldas')).toBe(12); // 6 × T × D = 6 × 1 × 2
    expect(qty(lista, 'guia')).toBe(2);
    expect(qty(lista, 'cama_pet')).toBe(2);
    expect(qty(lista, 'cadeiras')).toBe(2); // A + C: o bebê não conta
    expect(qty(lista, 'lanterna')).toBe(2); // A: adulto e adolescente
    expect(porChave(lista, 'vassourinha')).toBeUndefined(); // N = 1
    expect(porChave(lista, 'manta')).toBeUndefined();
  });

  it('motorhome exclui barraca, lona de chão, espeques, martelo e isolante', () => {
    const lista = gerarLista({ ...VIAGEM_DE_REFERENCIA, tipo: 'motorhome' }, catalogo);
    for (const chave of ['barraca', 'lona_chao', 'espeques', 'martelo', 'isolante']) expect(porChave(lista, chave), chave).toBeUndefined();
    expect(porChave(lista, 'cooler')).toBeDefined();
  });

  it('decisão de 26/11/2026: motorhome leva mesa, cadeiras, grelha e carvão; não leva balde nem cintas', () => {
    const lista = gerarLista({ ...VIAGEM_DE_REFERENCIA, tipo: 'motorhome' }, catalogo);
    expect(qty(lista, 'mesa')).toBe(1);
    expect(qty(lista, 'cadeiras')).toBe(4);
    expect(qty(lista, 'grelha')).toBe(1);
    expect(qty(lista, 'carvao')).toBe(1);
    expect(porChave(lista, 'balde')).toBeUndefined();
    expect(porChave(lista, 'cintas')).toBeUndefined();
    // trocar de barraca com carro para motorhome: saem só os itens de barraca, balde e cintas
    const r = recalcularLista(gerarLista(VIAGEM_DE_REFERENCIA, catalogo), { ...VIAGEM_DE_REFERENCIA, tipo: 'motorhome' }, catalogo);
    expect(chaves(r.sairam)).toEqual(['balde', 'barraca', 'cintas', 'espeques', 'isolante', 'lona_chao', 'martelo']);
    expect(r.entraram).toEqual([]);
  });

  it('trilha com mochila exclui também a lona de sombra, mesmo com chuva', () => {
    const lista = gerarLista({ ...VIAGEM_DE_REFERENCIA, tipo: 'backpack', chuva: true }, catalogo);
    expect(porChave(lista, 'lona_sombra')).toBeUndefined();
    expect(porChave(lista, 'tapete')).toBeDefined();
  });

  it('E3-09: sem destino ou sem dados, os itens que dependem do camping entram com a etiqueta', () => {
    const semDados = gerarLista({ ...VIAGEM_DE_REFERENCIA, destino: true, dadosDoCamping: false }, catalogo);
    expect(semDados.filter((i) => i.dependeDoCamping).map((i) => i.catalogKey)).toEqual(['agua', 'ducha', 'extensao', 'adaptador']);
  });

  it('com dados do camping, a ficha decide: ducha, extensão e adaptador só entram por ajuste; a água entra cheia e sem etiqueta', () => {
    const comDados = gerarLista({ ...VIAGEM_DE_REFERENCIA, destino: true, dadosDoCamping: true }, catalogo);
    expect(comDados.filter((i) => i.dependeDoCamping)).toEqual([]);
    for (const chave of ['ducha', 'extensao', 'adaptador']) expect(porChave(comDados, chave), chave).toBeUndefined();
    expect(qty(comDados, 'agua')).toBe(8);
  });

  it('E2-06: em grupo, itens do grupo somam todas as famílias; itens de família e pessoa usam a própria família', () => {
    const grupo: EntradaDaViagem = {
      ...VIAGEM_DE_REFERENCIA,
      familias: [
        FAMILIA_DA_CARLA,
        { id: 'bruno-paula', pets: 0, pessoas: [{ id: 'bruno', faixa: 'adult' }, { id: 'paula', faixa: 'adult' }, { id: 'bebe', faixa: 'toddler' }] },
        { id: 'diego-livia', pets: 0, pessoas: [{ id: 'diego', faixa: 'adult' }, { id: 'livia', faixa: 'adult' }] },
      ],
    };
    const lista = gerarLista(grupo, catalogo);
    // P = 9, N = 2, D = 3
    expect(lista.filter((i) => i.catalogKey === 'gas')).toHaveLength(1);
    expect(qty(lista, 'gas')).toBe(4); // teto(18 / 8) + 1
    expect(qty(lista, 'agua')).toBe(17); // teto(81 / 5)
    expect(qty(lista, 'carvao')).toBe(2);
    expect(qty(lista, 'fogareiro')).toBe(2);
    const daFamilia = (chave: string, familia: string): number | null | undefined =>
      lista.find((i) => i.catalogKey === chave && i.familiaId === familia)?.qty;
    expect(daFamilia('barraca', 'bruno-paula')).toBe(1);
    expect(daFamilia('cadeiras', 'bruno-paula')).toBe(2);
    expect(daFamilia('fraldas', 'bruno-paula')).toBe(18); // 6 × 1 × 3
    expect(daFamilia('fraldas', 'familia-carla')).toBeUndefined();
    expect(daFamilia('racao', 'diego-livia')).toBeUndefined(); // sem pet
    expect(daFamilia('mudas', 'diego-livia')).toBe(6);
    expect(daFamilia('muda_crianca', 'familia-carla')).toBe(2);
    // Sair uma família recalcula os itens do grupo
    const r = recalcularLista(lista, { ...grupo, familias: grupo.familias.slice(0, 2) }, catalogo);
    expect(qty(r.lista, 'agua')).toBe(13); // P = 7: teto(63 / 5)
    expect(r.sairam.every((i) => i.familiaId === 'diego-livia')).toBe(true);
  });

  it('linha com quantidade zero não entra (cadeiras numa família só de bebês)', () => {
    const entrada: EntradaDaViagem = {
      ...VIAGEM_DE_REFERENCIA,
      familias: [FAMILIA_DA_CARLA, { id: 'bebes', pets: 0, pessoas: [{ id: 'b', faixa: 'toddler' }] }],
    };
    const lista = gerarLista(entrada, catalogo);
    expect(lista.find((i) => i.catalogKey === 'cadeiras' && i.familiaId === 'bebes')).toBeUndefined();
    expect(lista.find((i) => i.catalogKey === 'lanterna' && i.familiaId === 'bebes')).toBeUndefined();
    expect(lista.find((i) => i.catalogKey === 'barraca' && i.familiaId === 'bebes')).toBeDefined();
  });
});

describe('Editar a lista (E1-04)', () => {
  const lista = gerarLista(VIAGEM_DE_REFERENCIA, catalogo);

  it('item removido pode ser restaurado, e o recálculo volta a cuidar dele', () => {
    const restaurada = restaurarItem(removerItem(lista, 'gas@grupo'), 'gas@grupo');
    const r = recalcularLista(restaurada, { ...VIAGEM_DE_REFERENCIA, noites: 3 }, catalogo);
    expect(porChave(r.lista, 'gas')).toMatchObject({ removido: false, qty: 3 });
  });

  it('item removido que deixa de valer continua guardado como removido, sem contar como saída', () => {
    const r = recalcularLista(removerItem(lista, 'manta@familia-carla'), { ...VIAGEM_DE_REFERENCIA, clima: 'hot' }, catalogo);
    expect(porChave(r.lista, 'manta')?.removido).toBe(true);
    expect(r.sairam.map((i) => i.catalogKey)).not.toContain('manta');
    // e não volta quando o frio volta
    const volta = recalcularLista(r.lista, VIAGEM_DE_REFERENCIA, catalogo);
    expect(porChave(volta.lista, 'manta')?.removido).toBe(true);
    expect(volta.entraram.map((i) => i.catalogKey)).not.toContain('manta');
  });

  it('o recálculo guarda os estados (separei, está no carro) dos itens que ficam', () => {
    const marcada = lista.map((i) => (i.catalogKey === 'gas' ? { ...i, estado: { ...i.estado, packState: 'in_car' as const } } : i));
    const r = recalcularLista(marcada, { ...VIAGEM_DE_REFERENCIA, noites: 3 }, catalogo);
    expect(porChave(r.lista, 'gas')).toMatchObject({ qty: 3, estado: { packState: 'in_car' } });
    expect(r.quantidadesAlteradas).toContainEqual({ ref: 'gas@grupo', de: 2, para: 3 });
  });

  it('itens de ajuste do camping não são tocados pelo recálculo', () => {
    const ajuste: ItemDaLista = { ...(porChave(lista, 'ducha') as ItemDaLista), ref: 'ajuste:ducha@familia-carla', origem: 'camping_adjust' };
    const r = recalcularLista([...lista, ajuste], { ...VIAGEM_DE_REFERENCIA, noites: 5 }, catalogo);
    expect(r.lista.find((i) => i.ref === ajuste.ref)).toEqual(ajuste);
  });

  it('renomear e anotar', () => {
    const editada = editarItem(lista, 'gas@grupo', { nome: 'Gás do fogareiro', nota: 'o de rosca' });
    expect(porChave(editada, 'gas')).toMatchObject({ nome: 'Gás do fogareiro', nota: 'o de rosca' });
  });

  it('recusa edições inválidas', () => {
    expect(() => removerItem(lista, 'nao-existe')).toThrow(ErroDeLista);
    expect(() => editarQuantidade(lista, 'gas@grupo', -1)).toThrow(/inteiro/);
    expect(() => editarQuantidade(lista, 'gas@grupo', 1.5)).toThrow(/inteiro/);
    expect(() => editarItem(lista, 'gas@grupo', { nome: '  ' })).toThrow(/vazio/);
    const novo = { ref: 'm', nome: 'rede', categoria: 'lazer_documentos', familiaId: FAM, qty: 1 };
    expect(() => adicionarItemManual(adicionarItemManual(lista, novo), novo)).toThrow(/repetida/);
    expect(() => adicionarItemManual(lista, { ...novo, nome: '' })).toThrow(/vazio/);
    expect(() => adicionarItemManual(lista, { ...novo, qty: -2 })).toThrow(/inteiro/);
  });
});

describe('Entrada da viagem', () => {
  it('recusa entrada inválida', () => {
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, noites: -1 }, catalogo)).toThrow(ErroDeEntrada);
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, noites: 1.5 }, catalogo)).toThrow(ErroDeEntrada);
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, familias: [] }, catalogo)).toThrow(/família/);
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, familias: [{ id: 'f', pets: 0, pessoas: [] }] }, catalogo)).toThrow(/pessoa/);
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, familias: [FAMILIA_DA_CARLA, FAMILIA_DA_CARLA] }, catalogo)).toThrow(/repetida/);
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, familias: [{ ...FAMILIA_DA_CARLA, pets: -1 }] }, catalogo)).toThrow(/pets/);
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, tipo: 'barco' as never }, catalogo)).toThrow(/tipo/);
    expect(() => gerarLista({ ...VIAGEM_DE_REFERENCIA, clima: 'gelado' as never }, catalogo)).toThrow(/clima/);
  });

  it('E1-01: noites a partir das datas', () => {
    expect(noitesEntre('2026-11-27', '2026-11-29')).toBe(2);
    expect(noitesEntre('2026-12-31', '2027-01-02')).toBe(2);
    expect(noitesEntre('2026-11-27', '2026-11-27')).toBe(0);
    expect(() => noitesEntre('2026-11-29', '2026-11-27')).toThrow(/antes/);
    expect(() => noitesEntre('27/11/2026', '2026-11-29')).toThrow(/formato/);
    expect(() => noitesEntre('2026-02-30', '2026-03-02')).toThrow(/inexistente/);
  });
});
