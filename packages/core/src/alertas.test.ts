import { describe, expect, it } from 'vitest';

import { aplicarAjustes, avaliarRetrato, type Alerta, type FatoDoRetrato, type Retrato } from './alertas';
import { carregarCatalogo } from './catalogo';
import { gerarLista, removerItem, editarQuantidade, type ItemDaLista } from './lista';
import { FAMILIA_DA_CARLA, VIAGEM_NO_RECANTO } from './testes/referencia';
import type { EntradaDaViagem } from './variaveis';

const catalogo = carregarCatalogo();
const ok = (valor: string): FatoDoRetrato => ({ valor, confirmado: true, frescor: 'recente' });

/**
 * Retrato de referência (SPEC, seção 9): 220 V, tomada longe, 1 chuveiro, capacidade de 11 a 25,
 * churrasco só em área comum, aceita pet, silêncio às 22h, piscina abre às 10h; todos confirmados e recentes.
 */
const RETRATO: Retrato = {
  energia_voltagem: ok('220v'),
  energia_tomada: ok('longe'),
  chuveiros_qtd: ok('1'),
  capacidade: ok('11_a_25'),
  churrasco: ok('area_comum'),
  pet: ok('aceita'),
  som_horario: ok('22h'),
  piscina: ok('10h'),
};

const resumo = (a: Alerta): string => `${a.nivel}:${a.texto}${a.ciente ? ':ciente' : ''}${a.naoConfirmado ? ':nao_confirmado' : ''}`;
const base = gerarLista(VIAGEM_NO_RECANTO, catalogo);
const daChave = (lista: readonly ItemDaLista[], chave: string): ItemDaLista[] => lista.filter((i) => i.catalogKey === chave);

function aplicar(retrato: Retrato, entrada: EntradaDaViagem = VIAGEM_NO_RECANTO, lista: readonly ItemDaLista[] = base, desfeitos: ReadonlySet<string> = new Set()) {
  const avaliacao = avaliarRetrato(retrato, entrada);
  return { ...avaliacao, ...aplicarAjustes(lista, avaliacao.ajustes, entrada, catalogo, desfeitos) };
}

describe('Ficha, alertas e ajustes (SPEC, seção 9)', () => {
  it('A1: viagem de referência com o retrato de referência', () => {
    const r = aplicar(RETRATO);
    expect(r.alertas.map(resumo)).toEqual([
      'ajuste:voltagem_220',
      'ajuste:tomada_longe',
      'atencao:chuveiro',
      'informacao:churrasco_area_comum',
      'informacao:silencio:ciente',
      'informacao:piscina_horario:ciente',
    ]);
    // Atenção: só a do chuveiro, com 25 barracas por chuveiro
    expect(r.alertas.filter((a) => a.nivel === 'atencao')).toEqual([expect.objectContaining({ texto: 'chuveiro', parametros: { barracas: 25 } })]);
    expect(r.alertas.find((a) => a.texto === 'silencio')?.parametros).toEqual({ horario: '22h' });
    expect(r.alertas.find((a) => a.texto === 'piscina_horario')?.parametros).toEqual({ horario: '10h' });
    // Ajustes: tarefa de 220 V; extensão de 20 m; entra ducha; sai grelha, fica carvão; entram roupa de banho 4 e boia 2
    expect(r.tarefas).toEqual([{ ajusteId: 'energia_voltagem:220v:tarefa:confira_aparelhos', tarefa: 'confira_aparelhos', texto: 'confira seus aparelhos' }]);
    expect(daChave(r.lista, 'extensao')).toEqual([expect.objectContaining({ origem: 'camping_adjust', qty: 1, detalhe: { qty: 20, unidade: 'metro' } })]);
    expect(daChave(r.lista, 'ducha')).toEqual([expect.objectContaining({ origem: 'camping_adjust', qty: 1 })]);
    expect(daChave(r.lista, 'grelha')).toEqual([]);
    expect(daChave(r.lista, 'carvao')).toHaveLength(1);
    expect(daChave(r.lista, 'roupa_banho')).toEqual([expect.objectContaining({ qty: 4, porPessoa: 1, origem: 'camping_adjust' })]);
    expect(daChave(r.lista, 'boia')).toEqual([expect.objectContaining({ qty: 2, origem: 'camping_adjust' })]);
    expect(r.entraram.map((e) => e.ref)).toEqual([
      'ajuste:extensao@familia-carla',
      'ajuste:ducha@familia-carla',
      'ajuste:roupa_banho@familia-carla',
      'ajuste:boia@familia-carla',
    ]);
    expect(r.sairam).toEqual([{ ajusteId: 'churrasco:area_comum:sai:grelha', ref: 'grelha@grupo' }]);
    // Todo ajuste tem o motivo, para a tela mostrar "entrou" ou "saiu" com ele (E3-08)
    expect(r.ajustes.every((a) => catalogo.alertas.textos[a.motivo] !== undefined)).toBe(true);
  });

  it('A2: mesmo retrato com 2 chuveiros', () => {
    const r = aplicar({ ...RETRATO, chuveiros_qtd: ok('2') });
    expect(r.alertas.find((a) => a.texto === 'chuveiro')).toBeUndefined();
    expect(r.alertas.some((a) => a.nivel === 'atencao')).toBe(false);
    expect(daChave(r.lista, 'ducha')).toEqual([]);
  });

  it('A3: pet não aceito gera atenção; sem pet na viagem, nenhum alerta', () => {
    const comPet = aplicar({ ...RETRATO, pet: ok('nao_aceita') });
    expect(comPet.alertas.filter((a) => a.fato === 'pet').map(resumo)).toEqual(['atencao:pet_nao_aceita']);
    const semPet: EntradaDaViagem = { ...VIAGEM_NO_RECANTO, familias: [{ ...FAMILIA_DA_CARLA, pets: 0 }] };
    expect(avaliarRetrato({ ...RETRATO, pet: ok('nao_aceita') }, semPet).alertas.filter((a) => a.fato === 'pet')).toEqual([]);
  });

  it('A4: churrasco proibido gera atenção e tira carvão e grelha', () => {
    const r = aplicar({ ...RETRATO, churrasco: ok('proibido') });
    expect(r.alertas.filter((a) => a.fato === 'churrasco').map(resumo)).toEqual(['atencao:churrasco_proibido']);
    expect(daChave(r.lista, 'carvao')).toEqual([]);
    expect(daChave(r.lista, 'grelha')).toEqual([]);
    expect(r.sairam.map((s) => s.ref).sort()).toEqual(['carvao@grupo', 'grelha@grupo']);
  });

  it('A5: fato de chuveiro com um único relato aparece como informação "não confirmado", e a ducha não entra', () => {
    const r = aplicar({ ...RETRATO, chuveiros_qtd: { valor: '1', confirmado: false, frescor: 'recente' } });
    expect(r.alertas.find((a) => a.fato === 'chuveiros')).toMatchObject({ nivel: 'informacao', naoConfirmado: true, texto: 'chuveiro' });
    expect(daChave(r.lista, 'ducha')).toEqual([]);
    expect(r.ajustes.some((a) => a.id.startsWith('chuveiros:'))).toBe(false);
  });

  it('A6: desfazer o ajuste da extensão volta ao estado anterior, e um retrato novo não o reaplica', () => {
    const antes = aplicar(RETRATO);
    const id = 'energia_tomada:longe:entra:extensao';
    expect(antes.ajustes.map((a) => a.id)).toContain(id);
    const desfeitos = new Set([id]);
    // A lista guardada (com os itens que entraram por ajuste) passa de novo, sem o ajuste desfeito
    const depois = aplicar(RETRATO, VIAGEM_NO_RECANTO, antes.lista, desfeitos);
    expect(daChave(depois.lista, 'extensao')).toEqual([]);
    const semTomada = aplicar({ ...RETRATO, energia_tomada: { valor: null, confirmado: false, frescor: 'sem_valor' } });
    expect(depois.lista).toEqual(semTomada.lista);
    // Retrato novo, igual: o ajuste desfeito continua desfeito
    const novoRetrato = aplicar({ ...RETRATO }, VIAGEM_NO_RECANTO, depois.lista, desfeitos);
    expect(daChave(novoRetrato.lista, 'extensao')).toEqual([]);
    expect(novoRetrato.entraram.map((e) => e.ref)).not.toContain('ajuste:extensao@familia-carla');
    // Fato diferente (tomada perto) é outro ajuste, e vale
    const perto = aplicar({ ...RETRATO, energia_tomada: ok('perto') }, VIAGEM_NO_RECANTO, depois.lista, desfeitos);
    expect(daChave(perto.lista, 'extensao')).toEqual([expect.objectContaining({ detalhe: { qty: 5, unidade: 'metro' } })]);
  });
});

describe('Demais linhas da tabela da seção 6', () => {
  it('sem energia: atenção; saem extensão e adaptador; lanterna e bateria portátil ganham 1', () => {
    const semDados = gerarLista({ ...VIAGEM_NO_RECANTO, dadosDoCamping: false }, catalogo);
    const r = aplicar({ energia_voltagem: ok('sem_energia') }, VIAGEM_NO_RECANTO, semDados);
    expect(r.alertas.map(resumo)).toEqual(['atencao:sem_energia']);
    expect(daChave(r.lista, 'extensao')).toEqual([]);
    expect(daChave(r.lista, 'adaptador')).toEqual([]);
    expect(daChave(r.lista, 'lanterna')[0]?.qty).toBe(3);
    expect(daChave(r.lista, 'bateria_portatil')[0]?.qty).toBe(2);
    expect(r.somados).toEqual([
      { ajusteId: 'energia_voltagem:sem_energia:soma:lanterna', ref: 'lanterna@familia-carla', de: 2, para: 3 },
      { ajusteId: 'energia_voltagem:sem_energia:soma:bateria_portatil', ref: 'bateria_portatil@familia-carla', de: 1, para: 2 },
    ]);
  });

  it('sem tomada: atenção; sai extensão; bateria portátil ganha 1; quantidade editada à mão não muda', () => {
    const semDados = gerarLista({ ...VIAGEM_NO_RECANTO, dadosDoCamping: false }, catalogo);
    const r = aplicar({ energia_tomada: ok('sem_tomada') }, VIAGEM_NO_RECANTO, semDados);
    expect(r.alertas.map(resumo)).toEqual(['atencao:sem_tomada']);
    expect(daChave(r.lista, 'extensao')).toEqual([]);
    expect(daChave(r.lista, 'bateria_portatil')[0]?.qty).toBe(2);
    const editada = editarQuantidade(semDados, 'bateria_portatil@familia-carla', 3);
    expect(daChave(aplicar({ energia_tomada: ok('sem_tomada') }, VIAGEM_NO_RECANTO, editada).lista, 'bateria_portatil')[0]?.qty).toBe(3);
  });

  it('água quente: atenção no frio, informação nos demais climas', () => {
    expect(avaliarRetrato({ agua_quente: ok('nao_tem') }, VIAGEM_NO_RECANTO).alertas.map(resumo)).toEqual(['atencao:sem_agua_quente']);
    expect(avaliarRetrato({ agua_quente: ok('nao_tem') }, { ...VIAGEM_NO_RECANTO, clima: 'hot' }).alertas.map(resumo)).toEqual([
      'informacao:sem_agua_quente',
    ]);
    expect(avaliarRetrato({ agua_quente: ok('solar') }, VIAGEM_NO_RECANTO).alertas).toEqual([]);
  });

  it('pet com restrição: informação, só com pet na viagem', () => {
    expect(avaliarRetrato({ pet: ok('aceita_restricao') }, VIAGEM_NO_RECANTO).alertas.map(resumo)).toEqual(['informacao:pet_restricao']);
  });

  it('piscina sem horário: ajuste; roupa de banho entra; boia só com crianças', () => {
    const r = aplicar({ piscina: ok('sem_horario') });
    expect(r.alertas.map(resumo)).toEqual(['ajuste:piscina']);
    expect(daChave(r.lista, 'boia')).toHaveLength(1);
    const casal: EntradaDaViagem = { ...VIAGEM_NO_RECANTO, familias: [{ id: 'casal', pets: 0, pessoas: [{ id: 'a', faixa: 'adult' }] }] };
    const s = aplicar({ piscina: ok('sem_horario') }, casal, gerarLista(casal, catalogo));
    expect(daChave(s.lista, 'roupa_banho')).toHaveLength(1);
    expect(daChave(s.lista, 'boia')).toEqual([]);
  });

  it('piscina com clima calor: roupa de banho e boia já estão na lista e não duplicam', () => {
    const calor: EntradaDaViagem = { ...VIAGEM_NO_RECANTO, clima: 'hot' };
    const r = aplicar({ piscina: ok('9h') }, calor, gerarLista(calor, catalogo));
    expect(daChave(r.lista, 'roupa_banho')).toEqual([expect.objectContaining({ origem: 'generated' })]);
    expect(daChave(r.lista, 'boia')).toEqual([expect.objectContaining({ origem: 'generated' })]);
    expect(r.entraram).toEqual([]);
  });

  it('item removido pela pessoa não volta por ajuste', () => {
    const calor: EntradaDaViagem = { ...VIAGEM_NO_RECANTO, clima: 'hot' };
    const semBoia = removerItem(gerarLista(calor, catalogo), 'boia@familia-carla');
    const r = aplicar({ piscina: ok('sem_horario') }, calor, semBoia);
    expect(daChave(r.lista, 'boia')).toEqual([expect.objectContaining({ removido: true, origem: 'generated' })]);
    expect(r.entraram.map((e) => e.ref)).not.toContain('ajuste:boia@familia-carla');
  });

  it('item que entrou por ajuste guarda o estado entre uma aplicação e outra; removido pela pessoa, fica removido', () => {
    const primeira = aplicar(RETRATO);
    const marcada = primeira.lista.map((i) => (i.ref === 'ajuste:ducha@familia-carla' ? { ...i, estado: { ...i.estado, packState: 'in_car' as const } } : i));
    const segunda = aplicar(RETRATO, VIAGEM_NO_RECANTO, marcada);
    expect(segunda.lista.find((i) => i.ref === 'ajuste:ducha@familia-carla')?.estado.packState).toBe('in_car');
    const removida = removerItem(segunda.lista, 'ajuste:extensao@familia-carla');
    expect(aplicar(RETRATO, VIAGEM_NO_RECANTO, removida).lista.find((i) => i.ref === 'ajuste:extensao@familia-carla')?.removido).toBe(true);
  });

  it('som com horário: informação com "ciente"; sem regra, nada', () => {
    expect(avaliarRetrato({ som_horario: ok('meia_noite') }, VIAGEM_NO_RECANTO).alertas).toEqual([
      expect.objectContaining({ texto: 'silencio', ciente: true, parametros: { horario: 'meia_noite' } }),
    ]);
    expect(avaliarRetrato({ som_horario: ok('sem_regra') }, VIAGEM_NO_RECANTO).alertas).toEqual([]);
  });

  it('sinal: uma operadora que não pega gera uma informação e a tarefa de baixar os mapas', () => {
    const r = aplicar({ sinal_a: ok('nao_pega'), sinal_b: ok('nao_pega'), sinal_c: ok('pega_bem') });
    expect(r.alertas.map(resumo)).toEqual(['informacao:sinal_fraco']);
    expect(r.tarefas.map((t) => t.texto)).toEqual(['baixe os mapas e avise a família']);
    expect(avaliarRetrato({ sinal_a: ok('pega_mal') }, VIAGEM_NO_RECANTO).alertas).toEqual([]);
  });

  it('limpeza: "sujo" na maioria dos relatos recentes vira informação', () => {
    expect(avaliarRetrato({ limpeza: ok('sujo') }, VIAGEM_NO_RECANTO).alertas.map(resumo)).toEqual(['informacao:limpeza_negativa']);
    expect(avaliarRetrato({ limpeza: ok('razoavel') }, VIAGEM_NO_RECANTO).alertas).toEqual([]);
  });

  it('capacidade "mais de 50" conta 60 barracas; "5 ou mais" chuveiros conta 5', () => {
    const r = avaliarRetrato({ chuveiros_qtd: ok('5_ou_mais'), capacidade: ok('mais_de_50') }, VIAGEM_NO_RECANTO);
    expect(r.alertas).toEqual([]); // 60 / 5 = 12
    const s = avaliarRetrato({ chuveiros_qtd: ok('3'), capacidade: ok('26_a_50') }, VIAGEM_NO_RECANTO);
    expect(s.alertas[0]?.parametros).toEqual({ barracas: 17 }); // 50 / 3 = 16,7: "cerca de 17"
  });

  it('fato antigo (sem valor vigente) não gera alerta; "pode ter mudado" gera, com o frescor', () => {
    expect(avaliarRetrato({ churrasco: { valor: 'proibido', confirmado: true, frescor: 'sem_valor' } }, VIAGEM_NO_RECANTO).alertas).toEqual([]);
    expect(avaliarRetrato({ churrasco: { valor: null, confirmado: false, frescor: 'sem_valor' } }, VIAGEM_NO_RECANTO).alertas).toEqual([]);
    const velho = avaliarRetrato({ churrasco: { valor: 'proibido', confirmado: true, frescor: 'pode_ter_mudado' } }, VIAGEM_NO_RECANTO);
    expect(velho.alertas).toEqual([expect.objectContaining({ nivel: 'atencao', frescor: 'pode_ter_mudado' })]);
  });

  it('valores sem linha na tabela não geram nada', () => {
    const r = avaliarRetrato(
      { energia_voltagem: ok('127v'), energia_tomada: ok('outra'), churrasco: ok('liberado'), pet: ok('aceita'), piscina: ok('nao_tem') },
      VIAGEM_NO_RECANTO,
    );
    expect(r).toEqual({ alertas: [], ajustes: [] });
  });

  it('ajuste que cita item fora do catálogo é erro', () => {
    expect(() =>
      aplicarAjustes(base, [{ id: 'x', motivo: 'piscina', tipo: 'entra', item: 'fogueira' }], VIAGEM_NO_RECANTO, catalogo),
    ).toThrow(/fora do catálogo/);
  });

  it('todo item citado nos ajustes existe no catálogo e todo texto citado existe em alertas.json', () => {
    const tudo: Retrato = {
      energia_voltagem: ok('sem_energia'),
      energia_tomada: ok('longe'),
      chuveiros_qtd: ok('1'),
      capacidade: ok('mais_de_50'),
      agua_quente: ok('nao_tem'),
      churrasco: ok('proibido'),
      pet: ok('nao_aceita'),
      som_horario: ok('20h'),
      piscina: ok('8h'),
      sinal_x: ok('nao_pega'),
      limpeza: ok('sujo'),
    };
    const r = avaliarRetrato(tudo, VIAGEM_NO_RECANTO);
    for (const a of r.ajustes) {
      if (a.tipo === 'tarefa') expect(catalogo.alertas.tarefas[a.tarefa]).toBeDefined();
      else expect(catalogo.porChave.has(a.item), a.item).toBe(true);
    }
    for (const a of r.alertas) expect(catalogo.alertas.textos[a.texto], a.texto).toBeDefined();
    for (const a of r.alertas) {
      const horario = a.parametros['horario'];
      if (typeof horario === 'string') expect(catalogo.alertas.horarios[horario]).toBeDefined();
    }
  });
});
