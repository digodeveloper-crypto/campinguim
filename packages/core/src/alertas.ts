// Do resumo aos alertas e à lista (SPEC, seção 6, "Do resumo aos alertas e à lista"; seção 9, casos
// A1 a A6; PRD E3-05 a E3-08 e seção 10, "Da ficha do camping para a lista"). Funções puras: o
// servidor (etapa 3) monta o retrato com elas; o aparelho aplica os ajustes na lista.
//
// Regras de nível:
// - Um fato sem valor vigente (antigo) não gera alerta (E3-16).
// - Um fato não confirmado nunca gera atenção: vira informação com o aviso "não confirmado", e não
//   mexe na lista (A5: "`ducha` não entra por ajuste").
// - Todo ajuste tem identificador estável (fato, valor, efeito, item). Ajuste desfeito pela pessoa
//   fica desfeito, mesmo com um retrato novo igual (A6).

import type { Catalogo } from './catalogo';
import { compilar } from './expressao';
import type { Frescor } from './fatos';
import { alvos, montarItem, type ItemDaLista } from './lista';
import type { EntradaDaViagem } from './variaveis';

export type NivelDoAlerta = 'atencao' | 'ajuste' | 'informacao';

/** Um fato do retrato, como o servidor resume (seção 6). Chaves: `energia_voltagem`, `sinal_<operadora>`... */
export interface FatoDoRetrato {
  /** Nulo: "não sabemos ainda" (sem relato ou sem valor vigente). */
  readonly valor: string | null;
  readonly confirmado: boolean;
  readonly frescor: Frescor;
}

export type Retrato = Readonly<Record<string, FatoDoRetrato>>;

export interface Alerta {
  /** Chave do texto-base em `packages/content/catalogo/alertas.json`. */
  readonly texto: string;
  readonly fato: string;
  readonly nivel: NivelDoAlerta;
  /** Mostra o botão "ciente" (regras de som e piscina, E3-07). */
  readonly ciente: boolean;
  readonly naoConfirmado: boolean;
  readonly frescor: Frescor;
  readonly parametros: Readonly<Record<string, string | number>>;
}

/** Efeito de uma linha da tabela na lista. */
export type Efeito =
  | { readonly tipo: 'entra'; readonly item: string; readonly condicao?: string; readonly metros?: number }
  | { readonly tipo: 'sai'; readonly item: string }
  | { readonly tipo: 'soma'; readonly item: string; readonly delta: number }
  | { readonly tipo: 'tarefa'; readonly tarefa: string };

/** Efeito com identificador estável (fato, valor, efeito, alvo) e o motivo (chave do texto do alerta). */
export type Ajuste = Efeito & { readonly id: string; readonly motivo: string };

export interface AvaliacaoDoRetrato {
  readonly alertas: Alerta[];
  readonly ajustes: Ajuste[];
}

/** Premissas da seção 6 (vão para `config`). */
export const PREMISSAS_DOS_ALERTAS = {
  /** Barracas por chuveiro acima disto geram atenção. */
  barracasPorChuveiro: 15,
  /** Limite de cima de cada faixa de capacidade; "mais de 50" conta 60. */
  capacidade: { ate_10: 10, '11_a_25': 25, '26_a_50': 50, mais_de_50: 60 } as Record<string, number>,
  /** Chuveiros por opção; "5 ou mais" conta 5. */
  chuveiros: { '1': 1, '2': 2, '3': 3, '4': 4, '5_ou_mais': 5 } as Record<string, number>,
} as const;

const HORARIOS_DE_SOM = ['20h', '21h', '22h', '23h', 'meia_noite'];
const HORARIOS_DE_PISCINA = ['8h', '9h', '10h', '11h'];

interface Regra {
  readonly texto: string;
  readonly nivel: NivelDoAlerta;
  readonly ciente?: boolean;
  readonly parametros?: Record<string, string | number>;
  readonly efeitos: readonly Efeito[];
}

function valido(fato: FatoDoRetrato | undefined): fato is FatoDoRetrato & { valor: string } {
  return fato !== undefined && fato.valor !== null && fato.frescor !== 'sem_valor';
}

/** Cruza o retrato do camping com a viagem e devolve alertas e ajustes, na ordem da tabela da seção 6. */
export function avaliarRetrato(retrato: Retrato, entrada: EntradaDaViagem): AvaliacaoDoRetrato {
  const alertas: Alerta[] = [];
  const ajustes: Ajuste[] = [];
  const pets = entrada.familias.reduce((soma, f) => soma + f.pets, 0);

  const registrar = (fatoChave: string, valor: string, fatos: readonly FatoDoRetrato[], regra: Regra): void => {
    const confirmado = fatos.every((f) => f.confirmado);
    const frescor: Frescor = fatos.some((f) => f.frescor === 'pode_ter_mudado') ? 'pode_ter_mudado' : 'recente';
    alertas.push({
      texto: regra.texto,
      fato: fatoChave,
      nivel: confirmado ? regra.nivel : 'informacao',
      ciente: regra.ciente ?? false,
      naoConfirmado: !confirmado,
      frescor,
      parametros: regra.parametros ?? {},
    });
    if (!confirmado) return;
    for (const efeito of regra.efeitos) {
      const alvo = efeito.tipo === 'tarefa' ? efeito.tarefa : efeito.item;
      ajustes.push({ ...efeito, id: `${fatoChave}:${valor}:${efeito.tipo}:${alvo}`, motivo: regra.texto });
    }
  };

  const voltagem = retrato['energia_voltagem'];
  if (valido(voltagem)) {
    if (voltagem.valor === '220v') {
      registrar('energia_voltagem', voltagem.valor, [voltagem], {
        texto: 'voltagem_220',
        nivel: 'ajuste',
        efeitos: [{ tipo: 'tarefa', tarefa: 'confira_aparelhos' }],
      });
    } else if (voltagem.valor === 'sem_energia') {
      registrar('energia_voltagem', voltagem.valor, [voltagem], {
        texto: 'sem_energia',
        nivel: 'atencao',
        efeitos: [
          { tipo: 'sai', item: 'extensao' },
          { tipo: 'sai', item: 'adaptador' },
          { tipo: 'soma', item: 'lanterna', delta: 1 },
          { tipo: 'soma', item: 'bateria_portatil', delta: 1 },
        ],
      });
    }
  }

  const tomada = retrato['energia_tomada'];
  if (valido(tomada)) {
    if (tomada.valor === 'longe') {
      registrar('energia_tomada', tomada.valor, [tomada], {
        texto: 'tomada_longe',
        nivel: 'ajuste',
        efeitos: [{ tipo: 'entra', item: 'extensao', metros: 20 }],
      });
    } else if (tomada.valor === 'perto') {
      registrar('energia_tomada', tomada.valor, [tomada], {
        texto: 'tomada_perto',
        nivel: 'ajuste',
        efeitos: [{ tipo: 'entra', item: 'extensao', metros: 5 }],
      });
    } else if (tomada.valor === 'sem_tomada') {
      registrar('energia_tomada', tomada.valor, [tomada], {
        texto: 'sem_tomada',
        nivel: 'atencao',
        efeitos: [
          { tipo: 'sai', item: 'extensao' },
          { tipo: 'soma', item: 'bateria_portatil', delta: 1 },
        ],
      });
    }
  }

  // Chuveiros e capacidade contam como um fato na interface (seção 6).
  const chuveiros = retrato['chuveiros_qtd'];
  const capacidade = retrato['capacidade'];
  if (valido(chuveiros) && valido(capacidade)) {
    const qtd = PREMISSAS_DOS_ALERTAS.chuveiros[chuveiros.valor];
    const barracas = PREMISSAS_DOS_ALERTAS.capacidade[capacidade.valor];
    if (qtd !== undefined && barracas !== undefined && barracas / qtd > PREMISSAS_DOS_ALERTAS.barracasPorChuveiro) {
      registrar('chuveiros', `${chuveiros.valor}/${capacidade.valor}`, [chuveiros, capacidade], {
        texto: 'chuveiro',
        nivel: 'atencao',
        parametros: { barracas: Math.round(barracas / qtd) },
        efeitos: [{ tipo: 'entra', item: 'ducha' }],
      });
    }
  }

  const aguaQuente = retrato['agua_quente'];
  if (valido(aguaQuente) && aguaQuente.valor === 'nao_tem') {
    registrar('agua_quente', aguaQuente.valor, [aguaQuente], {
      texto: 'sem_agua_quente',
      nivel: entrada.clima === 'cold' ? 'atencao' : 'informacao',
      efeitos: [],
    });
  }

  const churrasco = retrato['churrasco'];
  if (valido(churrasco)) {
    if (churrasco.valor === 'proibido') {
      registrar('churrasco', churrasco.valor, [churrasco], {
        texto: 'churrasco_proibido',
        nivel: 'atencao',
        efeitos: [
          { tipo: 'sai', item: 'carvao' },
          { tipo: 'sai', item: 'grelha' },
        ],
      });
    } else if (churrasco.valor === 'area_comum') {
      registrar('churrasco', churrasco.valor, [churrasco], {
        texto: 'churrasco_area_comum',
        nivel: 'informacao',
        efeitos: [{ tipo: 'sai', item: 'grelha' }],
      });
    }
  }

  const pet = retrato['pet'];
  if (valido(pet) && pets > 0) {
    if (pet.valor === 'nao_aceita') {
      registrar('pet', pet.valor, [pet], { texto: 'pet_nao_aceita', nivel: 'atencao', efeitos: [] });
    } else if (pet.valor === 'aceita_restricao') {
      registrar('pet', pet.valor, [pet], { texto: 'pet_restricao', nivel: 'informacao', efeitos: [] });
    }
  }

  const som = retrato['som_horario'];
  if (valido(som) && HORARIOS_DE_SOM.includes(som.valor)) {
    registrar('som_horario', som.valor, [som], {
      texto: 'silencio',
      nivel: 'informacao',
      ciente: true,
      parametros: { horario: som.valor },
      efeitos: [],
    });
  }

  const piscina = retrato['piscina'];
  const efeitosDaPiscina: Regra['efeitos'] = [
    { tipo: 'entra', item: 'roupa_banho' },
    { tipo: 'entra', item: 'boia', condicao: 'C + T > 0' },
  ];
  if (valido(piscina)) {
    if (HORARIOS_DE_PISCINA.includes(piscina.valor)) {
      registrar('piscina', piscina.valor, [piscina], {
        texto: 'piscina_horario',
        nivel: 'informacao',
        ciente: true,
        parametros: { horario: piscina.valor },
        efeitos: efeitosDaPiscina,
      });
    } else if (piscina.valor === 'sem_horario') {
      registrar('piscina', piscina.valor, [piscina], { texto: 'piscina', nivel: 'ajuste', efeitos: efeitosDaPiscina });
    }
  }

  // Sinal: uma resposta por operadora; basta uma "não pega" para o alerta (um só).
  const semSinal = Object.entries(retrato)
    .filter(([chave, fato]) => chave.startsWith('sinal_') && valido(fato) && fato.valor === 'nao_pega')
    .map(([, fato]) => fato);
  if (semSinal.length > 0) {
    registrar('sinal', 'nao_pega', semSinal, {
      texto: 'sinal_fraco',
      nivel: 'informacao',
      efeitos: [{ tipo: 'tarefa', tarefa: 'baixe_mapas' }],
    });
  }

  // Limpeza: o valor vigente já é a maioria dos relatos considerados (seção 6, passo 2).
  const limpeza = retrato['limpeza'];
  if (valido(limpeza) && limpeza.valor === 'sujo') {
    registrar('limpeza', limpeza.valor, [limpeza], { texto: 'limpeza_negativa', nivel: 'informacao', efeitos: [] });
  }

  return { alertas, ajustes };
}

export interface MudancaPorAjuste {
  readonly ajusteId: string;
  readonly ref: string;
}

export interface ResultadoDosAjustes {
  /** A lista que a pessoa vê, com os ajustes ativos aplicados. */
  readonly lista: ItemDaLista[];
  readonly entraram: MudancaPorAjuste[];
  readonly sairam: MudancaPorAjuste[];
  readonly somados: (MudancaPorAjuste & { readonly de: number; readonly para: number })[];
  readonly tarefas: { readonly ajusteId: string; readonly tarefa: string; readonly texto: string }[];
}

/** Referência dos itens que entram por ajuste: separada da dos gerados, para nunca colidir. */
export function refDeAjuste(chave: string, familiaId: string | null): string {
  return `ajuste:${chave}@${familiaId ?? 'grupo'}`;
}

/**
 * Aplica os ajustes ativos (os que a pessoa não desfez) na lista base: a saída da geração e do
 * recálculo, mais os itens manuais e os itens que já entraram por ajuste antes (com seus estados).
 * A lista de entrada nunca leva o efeito de "sai" nem de "soma": a saída é derivada, então desfazer
 * um ajuste é aplicar de novo sem ele (A6).
 *
 * - "entra": o item entra com origem `camping_adjust`, a não ser que já esteja na lista; item
 *   removido pela pessoa não volta por ajuste (seção 6).
 * - "sai": o item sai da lista mostrada.
 * - "soma": a quantidade ganha o acréscimo, a não ser que a pessoa a tenha editado à mão.
 * - "tarefa": volta à parte, com o texto de `alertas.json`.
 */
export function aplicarAjustes(
  base: readonly ItemDaLista[],
  ajustes: readonly Ajuste[],
  entrada: EntradaDaViagem,
  catalogo: Catalogo,
  desfeitos: ReadonlySet<string> = new Set(),
): ResultadoDosAjustes {
  const ativos = ajustes.filter((a) => !desfeitos.has(a.id));
  const anterioresPorAjuste = new Map(base.filter((i) => i.origem === 'camping_adjust').map((i) => [i.ref, i]));
  let lista: ItemDaLista[] = base.filter((i) => i.origem !== 'camping_adjust');
  const entraram: MudancaPorAjuste[] = [];
  const sairam: MudancaPorAjuste[] = [];
  const somados: ResultadoDosAjustes['somados'] = [];
  const tarefas: ResultadoDosAjustes['tarefas'] = [];

  for (const ajuste of ativos) {
    if (ajuste.tipo === 'tarefa') {
      tarefas.push({ ajusteId: ajuste.id, tarefa: ajuste.tarefa, texto: catalogo.alertas.tarefas[ajuste.tarefa] ?? ajuste.tarefa });
      continue;
    }
    if (ajuste.tipo === 'sai') {
      const fica = lista.filter((i) => i.catalogKey !== ajuste.item || i.origem === 'manual' || i.removido);
      for (const i of lista) if (!fica.includes(i)) sairam.push({ ajusteId: ajuste.id, ref: i.ref });
      lista = fica;
      continue;
    }
    if (ajuste.tipo === 'soma') {
      lista = lista.map((i) => {
        if (i.catalogKey !== ajuste.item || i.removido || i.qtyEditada || i.qty === null) return i;
        somados.push({ ajusteId: ajuste.id, ref: i.ref, de: i.qty, para: i.qty + ajuste.delta });
        return { ...i, qty: i.qty + ajuste.delta };
      });
      continue;
    }
    const item = catalogo.porChave.get(ajuste.item);
    if (!item) throw new Error(`ajuste ${ajuste.id}: item fora do catálogo`);
    const condicao = ajuste.condicao ? compilar(ajuste.condicao, catalogo.variaveis) : null;
    for (const { familia, variaveis } of alvos(item, entrada)) {
      if (condicao && condicao.avaliar(variaveis) !== true) continue;
      const familiaId = item.scope === 'grupo' ? null : (familia?.id ?? null);
      if (lista.some((i) => i.catalogKey === item.key && i.familiaId === familiaId && i.origem !== 'camping_adjust')) continue;
      const ref = refDeAjuste(item.key, familiaId);
      const anterior = anterioresPorAjuste.get(ref);
      if (anterior) {
        lista.push(anterior);
        continue;
      }
      const montado = montarItem(item, variaveis, familia, 'camping_adjust', false);
      if (!montado) continue;
      const novo: ItemDaLista = {
        ...montado,
        ref,
        detalhe: ajuste.metros !== undefined ? { qty: ajuste.metros, unidade: 'metro' } : montado.detalhe,
      };
      lista.push(novo);
      entraram.push({ ajusteId: ajuste.id, ref });
    }
  }
  return { lista, entraram, sairam, somados, tarefas };
}
