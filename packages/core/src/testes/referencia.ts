// Dados de referência dos testes (SPEC, seções 9 e 13): a família da Carla e o grupo de três famílias.
// Os mesmos dados dos protótipos e do ambiente local.

import type { FamiliaNoGasto } from '../cotas';
import type { EntradaDaViagem, FamiliaDaViagem } from '../variaveis';

/** Carla e Rafael, com Lucas (9) e Bia (5), e um pet. */
export const FAMILIA_DA_CARLA: FamiliaDaViagem = {
  id: 'familia-carla',
  pets: 1,
  pessoas: [
    { id: 'carla', faixa: 'adult' },
    { id: 'rafael', faixa: 'adult' },
    { id: 'lucas', faixa: 'child' },
    { id: 'bia', faixa: 'child' },
  ],
};

/**
 * Viagem de referência (SPEC, seção 9): barraca com carro, 2 noites, 2 adultos, 2 crianças (9 e 5),
 * 1 pet, clima frio, sem chuva, uma família. Sem destino.
 */
export const VIAGEM_DE_REFERENCIA: EntradaDaViagem = {
  tipo: 'tent_car',
  noites: 2,
  clima: 'cold',
  chuva: false,
  familias: [FAMILIA_DA_CARLA],
  destino: false,
  dadosDoCamping: false,
};

/** A mesma viagem, com o Camping Recanto das Águas escolhido e o retrato com dados (casos A1 a A6). */
export const VIAGEM_NO_RECANTO: EntradaDaViagem = { ...VIAGEM_DE_REFERENCIA, destino: true, dadosDoCamping: true };

/** Grupo da seção 9 (C1): Carla e Rafael com Lucas e Bia; Bruno e Paula com bebê, compradores; Diego e Lívia. */
export const GRUPO_DO_C1: readonly FamiliaNoGasto[] = [
  { id: 'carla-rafael', pessoas: [{ id: 'carla', faixa: 'adult' }, { id: 'rafael', faixa: 'adult' }, { id: 'lucas', faixa: 'child' }, { id: 'bia', faixa: 'child' }] },
  { id: 'bruno-paula', pessoas: [{ id: 'bruno', faixa: 'adult' }, { id: 'paula', faixa: 'adult' }, { id: 'bebe', faixa: 'toddler' }] },
  { id: 'diego-livia', pessoas: [{ id: 'diego', faixa: 'adult' }, { id: 'livia', faixa: 'adult' }] },
];
