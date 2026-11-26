import { describe, expect, it } from 'vitest';

import { aplicarAprendizado, desfazerAprendizado, REDUCAO_POR_SOBRA_PERCENTUAL, repetirViagem, type ViagemAnterior } from './aprendizado';
import { carregarCatalogo } from './catalogo';
import { adicionarItemManual, editarQuantidade, ErroDeLista, gerarLista, recalcularLista, reduzirQuantidade, removerItem, type ItemDaLista } from './lista';
import { VIAGEM_DE_REFERENCIA } from './testes/referencia';

const catalogo = carregarCatalogo();
const FAM = 'familia-carla';
const lista = gerarLista(VIAGEM_DE_REFERENCIA, catalogo);

/** Marca itens da lista como "faltou" ou "sobrou", como a pessoa faz na volta (E1-09, E1-11). */
function marcar(itens: readonly ItemDaLista[], marca: 'missing' | 'leftover', refs: readonly string[]): ItemDaLista[] {
  return itens.map((i) => (refs.includes(i.ref) ? { ...i, estado: { ...i.estado, [marca]: true } } : i));
}
const viagem = (itens: readonly ItemDaLista[]): ViagemAnterior => ({ itens });
const item = (itens: readonly ItemDaLista[], ref: string): ItemDaLista | undefined => itens.find((i) => i.ref === ref);

describe('Aprendizado de "faltou e sobrou" (E1-11; SPEC, seção 5)', () => {
  it('item marcado como "faltou" entra na próxima lista daquela pessoa, com aviso', () => {
    const semLanterna = removerItem(lista, `lanterna@${FAM}`);
    const ultima = marcar(semLanterna, 'missing', [`lanterna@${FAM}`]);
    const r = aplicarAprendizado(semLanterna, [viagem(ultima)], catalogo);
    expect(item(r.lista, `lanterna@${FAM}`)).toMatchObject({ removido: false, aprendizado: { tipo: 'faltou' } });
    expect(r.avisos).toEqual([{ tipo: 'faltou_entrou', ref: `lanterna@${FAM}` }]);
  });

  it('"faltou" num item que não estava na lista (E1-09) entra como item da pessoa', () => {
    const comRede = adicionarItemManual(lista, { ref: 'rede-1', nome: 'rede de descanso', categoria: 'lazer_documentos', familiaId: FAM, qty: 1 });
    const ultima = marcar(comRede, 'missing', ['rede-1']);
    const r = aplicarAprendizado(lista, [viagem(ultima)], catalogo);
    expect(item(r.lista, 'rede-1')).toMatchObject({ origem: 'manual', nome: 'rede de descanso', aprendizado: { tipo: 'faltou' }, estado: { missing: false } });
  });

  it('"faltou" num item do catálogo que não está na lista nova entra como item da pessoa e o recálculo não o apaga', () => {
    const calor = gerarLista({ ...VIAGEM_DE_REFERENCIA, clima: 'hot' }, catalogo);
    const ultima = marcar(lista, 'missing', [`manta@${FAM}`]);
    const r = aplicarAprendizado(calor, [viagem(ultima)], catalogo);
    const manta = item(r.lista, `faltou:manta@${FAM}`);
    expect(manta).toMatchObject({ catalogKey: 'manta', origem: 'manual', qty: 4, aprendizado: { tipo: 'faltou' } });
    const recalculo = recalcularLista(r.lista, { ...VIAGEM_DE_REFERENCIA, clima: 'hot', noites: 3 }, catalogo);
    expect(item(recalculo.lista, `faltou:manta@${FAM}`)).toEqual(manta);
    // o frio voltou: a manta gerada não duplica a que a pessoa já tem
    const frio = recalcularLista(recalculo.lista, VIAGEM_DE_REFERENCIA, catalogo);
    expect(frio.lista.filter((i) => i.catalogKey === 'manta')).toEqual([manta]);
    expect(frio.entraram.map((i) => i.catalogKey)).not.toContain('manta');
  });

  it('"faltou" num item que já está na lista nova só gera aviso', () => {
    const r = aplicarAprendizado(lista, [viagem(marcar(lista, 'missing', ['gas@grupo']))], catalogo);
    expect(r.avisos).toEqual([{ tipo: 'faltou_ja_estava', ref: 'gas@grupo' }]);
    expect(r.lista).toEqual(lista);
  });

  it('consumível marcado como "sobrou" em duas viagens seguidas tem a quantidade reduzida em 25 %, com aviso', () => {
    const grande = gerarLista({ ...VIAGEM_DE_REFERENCIA, noites: 6 }, catalogo); // água: teto(3 × 4 × 7 / 5) = 17
    const sobras = marcar(grande, 'leftover', ['agua@grupo', 'gas@grupo']);
    const r = aplicarAprendizado(grande, [viagem(sobras), viagem(sobras)], catalogo);
    expect(item(r.lista, 'agua@grupo')).toMatchObject({ qty: 13, aprendizado: { tipo: 'reduzido', qtyAnterior: 17, percentual: 25 } });
    expect(item(r.lista, 'gas@grupo')).toMatchObject({ qty: 3, aprendizado: { tipo: 'reduzido', qtyAnterior: 4 } }); // gás teto(24 / 8) + 1 = 4; teto(4 × 0,75) = 3
    expect(r.avisos).toEqual([
      { tipo: 'reduzido', ref: 'gas@grupo', de: 4, para: 3 },
      { tipo: 'reduzido', ref: 'agua@grupo', de: 17, para: 13 },
    ]);
  });

  it('quando a redução arredondada para cima não muda a quantidade, o item vem sinalizado (E1-11)', () => {
    const sobras = marcar(lista, 'leftover', ['carvao@grupo']); // carvão 1: teto(0,75) = 1
    const r = aplicarAprendizado(lista, [viagem(sobras), viagem(sobras)], catalogo);
    expect(item(r.lista, 'carvao@grupo')).toMatchObject({ qty: 1, aprendizado: { tipo: 'sinalizado' } });
    expect(r.avisos).toEqual([{ tipo: 'sinalizado', ref: 'carvao@grupo' }]);
  });

  it('"sobrou" numa viagem só, ou em item que não é consumível, não reduz', () => {
    const sobras = marcar(lista, 'leftover', ['agua@grupo', 'sacos_lixo@grupo']);
    expect(aplicarAprendizado(lista, [viagem(sobras), viagem(lista)], catalogo).avisos).toEqual([]);
    expect(aplicarAprendizado(lista, [viagem(lista), viagem(sobras)], catalogo).avisos).toEqual([]);
    const r = aplicarAprendizado(lista, [viagem(sobras), viagem(sobras)], catalogo);
    expect(r.avisos.map((a) => a.ref)).toEqual(['agua@grupo']);
  });

  it('quantidade editada à mão não é reduzida', () => {
    const editada = editarQuantidade(lista, 'agua@grupo', 10);
    const sobras = marcar(lista, 'leftover', ['agua@grupo']);
    expect(item(aplicarAprendizado(editada, [viagem(sobras), viagem(sobras)], catalogo).lista, 'agua@grupo')?.qty).toBe(10);
  });

  it('o usuário pode desfazer a redução e a sinalização', () => {
    const sobras = marcar(lista, 'leftover', ['agua@grupo', 'carvao@grupo']);
    const r = aplicarAprendizado(lista, [viagem(sobras), viagem(sobras)], catalogo);
    expect(item(r.lista, 'agua@grupo')?.qty).toBe(6); // teto(8 × 0,75)
    const desfeita = desfazerAprendizado(desfazerAprendizado(r.lista, 'agua@grupo'), 'carvao@grupo');
    expect(item(desfeita, 'agua@grupo')).toMatchObject({ qty: 8, aprendizado: null });
    expect(item(desfeita, 'carvao@grupo')).toMatchObject({ qty: 1, aprendizado: null });
    expect(() => desfazerAprendizado(desfeita, 'agua@grupo')).toThrow(ErroDeLista);
    expect(() => desfazerAprendizado(desfeita, 'nada')).toThrow(/não está na lista/);
  });

  it('a redução continua valendo sobre a quantidade recalculada, até ser desfeita', () => {
    const sobras = marcar(lista, 'leftover', ['agua@grupo']);
    const r = aplicarAprendizado(lista, [viagem(sobras), viagem(sobras)], catalogo);
    const recalculo = recalcularLista(r.lista, { ...VIAGEM_DE_REFERENCIA, noites: 6 }, catalogo);
    expect(item(recalculo.lista, 'agua@grupo')).toMatchObject({ qty: 13, aprendizado: { tipo: 'reduzido', qtyAnterior: 17 } });
    expect(item(desfazerAprendizado(recalculo.lista, 'agua@grupo'), 'agua@grupo')?.qty).toBe(17);
  });

  it('percentual de redução fora do intervalo é recusado; a premissa padrão é 25 %', () => {
    expect(REDUCAO_POR_SOBRA_PERCENTUAL).toBe(25);
    expect(reduzirQuantidade(8, 25)).toBe(6);
    expect(() => aplicarAprendizado(lista, [], catalogo, 0)).toThrow(/percentual/);
    expect(() => aplicarAprendizado(lista, [], catalogo, 100)).toThrow(/percentual/);
  });

  it('sem histórico, nada muda', () => {
    expect(aplicarAprendizado(lista, [], catalogo)).toEqual({ lista, avisos: [] });
  });
});

describe('Repetir a viagem (E1-12)', () => {
  it('cria a lista nova em um passo, com o que a pessoa fez na anterior e o aprendizado aplicado', () => {
    let anterior = removerItem(lista, 'grelha@grupo');
    anterior = editarQuantidade(anterior, `cadeiras@${FAM}`, 2);
    anterior = adicionarItemManual(anterior, { ref: 'rede-1', nome: 'rede de descanso', categoria: 'lazer_documentos', familiaId: FAM, qty: 1 });
    anterior = adicionarItemManual(anterior, { ref: 'boia-velha', nome: 'boia furada', categoria: 'criancas', familiaId: FAM, qty: 1 });
    anterior = removerItem(anterior, 'boia-velha');
    anterior = anterior.map((i) => ({ ...i, estado: { ...i.estado, packState: 'in_car' as const, returnState: 'checked' as const } }));
    anterior = marcar(anterior, 'missing', [`lanterna@${FAM}`]);
    anterior = marcar(anterior, 'leftover', ['agua@grupo']);
    const penultima = marcar(lista, 'leftover', ['agua@grupo']);

    const r = repetirViagem(VIAGEM_DE_REFERENCIA, anterior, [viagem(anterior), viagem(penultima)], catalogo);
    expect(item(r.lista, 'grelha@grupo')?.removido).toBe(true);
    expect(item(r.lista, `cadeiras@${FAM}`)).toMatchObject({ qty: 2, qtyEditada: true });
    expect(item(r.lista, 'rede-1')).toMatchObject({ origem: 'manual', estado: { packState: 'todo' } });
    expect(item(r.lista, 'boia-velha')).toBeUndefined();
    expect(item(r.lista, 'agua@grupo')).toMatchObject({ qty: 6, aprendizado: { tipo: 'reduzido' } });
    expect(r.avisos).toContainEqual({ tipo: 'faltou_ja_estava', ref: `lanterna@${FAM}` });
    expect(r.avisos).toContainEqual({ tipo: 'reduzido', ref: 'agua@grupo', de: 8, para: 6 });
    // estados zerados na viagem nova
    expect(r.lista.every((i) => i.estado.packState === 'todo' && i.estado.returnState === 'unchecked' && !i.estado.missing && !i.estado.leftover)).toBe(true);
  });

  it('itens que entraram por ajuste do camping não são levados: o retrato é da viagem', () => {
    const ajuste: ItemDaLista = { ...(item(lista, 'gas@grupo') as ItemDaLista), ref: 'ajuste:ducha@familia-carla', catalogKey: 'ducha', origem: 'camping_adjust' };
    const r = repetirViagem(VIAGEM_DE_REFERENCIA, [...lista, ajuste], [], catalogo);
    expect(item(r.lista, ajuste.ref)).toBeUndefined();
  });
});
