// Carregamento e validação do catálogo de `packages/content` (SPEC, seção 5). O catálogo é a fonte
// única do que a lista gera: este arquivo só lê, confere e tipa; nenhuma regra de conteúdo mora aqui.
//
// Tudo é conferido ao carregar: campos, categorias, unidades, chaves repetidas e as expressões
// `when` e `qty` (variável e função conhecidas, tipos certos). Um catálogo com erro não carrega.

import alertasJson from '../../content/catalogo/alertas.json';
import itensJson from '../../content/catalogo/itens.json';
import tarefasJson from '../../content/catalogo/tarefas.json';

import { compilar, visitar, type ExpressaoCompilada, type TipoDeValor } from './expressao';

export type Escopo = 'pessoa' | 'familia' | 'grupo';
export type TipoDeTarefa = 'conferir' | 'planejar_refeicoes';
export type TipoDaViagemNoCatalogo = 'barraca_carro' | 'mochila' | 'motorhome';

export interface ItemDoCatalogo {
  readonly key: string;
  readonly name: string;
  readonly category: string;
  readonly scope: Escopo;
  readonly when: ExpressaoCompilada;
  /** Nulo quando o item é uma tarefa ("Tarefa: conferir"). */
  readonly qty: ExpressaoCompilada | null;
  readonly unit: string | null;
  /** Quantidade secundária mostrada junto (a água: litros além dos galões). */
  readonly detalhe: { readonly qty: ExpressaoCompilada; readonly unit: string } | null;
  readonly tarefa: { readonly tipo: TipoDeTarefa; readonly partes: Readonly<Record<string, ExpressaoCompilada>> } | null;
  readonly dependsOnCamping: boolean;
  /** Consumível (acaba e não volta para casa): só ele tem a quantidade reduzida por "sobrou" (E1-11). */
  readonly consumivel: boolean;
  /** Decisão do responsável que mudou a regra do item em relação à tabela da SPEC, quando houver. */
  readonly decisao: string | null;
  /** Texto da coluna "Entra quando" da SPEC, guardado para conferir a transcrição. */
  readonly entraQuandoSpec: string;
  /** Texto da coluna "Quantidade" da SPEC, guardado para conferir a transcrição. */
  readonly quantidadeSpec: string;
}

export interface Tarefa {
  readonly key: string;
  readonly texto: string;
  readonly emCasa?: boolean;
}

export interface Catalogo {
  readonly versao: number;
  readonly variaveis: Readonly<Record<string, TipoDeValor>>;
  readonly valoresPermitidos: Readonly<Record<string, readonly string[]>>;
  readonly unidades: Readonly<Record<string, { readonly singular: string; readonly plural: string }>>;
  readonly categorias: readonly { readonly key: string; readonly nome: string }[];
  readonly exclusoesPorTipo: Readonly<Record<'mochila' | 'motorhome', readonly string[]>>;
  readonly itens: readonly ItemDoCatalogo[];
  readonly porChave: ReadonlyMap<string, ItemDoCatalogo>;
  readonly tarefas: { readonly vespera: readonly Tarefa[]; readonly volta: readonly Tarefa[] };
  readonly alertas: {
    readonly textos: Readonly<Record<string, string>>;
    readonly tarefas: Readonly<Record<string, string>>;
    readonly avisos: Readonly<Record<string, string>>;
    readonly horarios: Readonly<Record<string, string>>;
  };
}

export class ErroDeCatalogo extends Error {
  override name = 'ErroDeCatalogo';
}

type Objeto = Record<string, unknown>;

const CHAVE = /^[a-z][a-z0-9_]*$/;

function objeto(valor: unknown, onde: string): Objeto {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
    throw new ErroDeCatalogo(`${onde}: esperava um objeto`);
  }
  return valor as Objeto;
}

function lista(valor: unknown, onde: string): unknown[] {
  if (!Array.isArray(valor)) throw new ErroDeCatalogo(`${onde}: esperava uma lista`);
  return valor;
}

function texto(valor: unknown, onde: string): string {
  if (typeof valor !== 'string' || valor.length === 0) throw new ErroDeCatalogo(`${onde}: esperava um texto`);
  return valor;
}

function chave(valor: unknown, onde: string): string {
  const t = texto(valor, onde);
  if (!CHAVE.test(t)) throw new ErroDeCatalogo(`${onde}: chave fora do formato snake_case: "${t}"`);
  return t;
}

function logico(valor: unknown, onde: string): boolean {
  if (typeof valor !== 'boolean') throw new ErroDeCatalogo(`${onde}: esperava verdadeiro ou falso`);
  return valor;
}

function versao(valor: unknown, onde: string): number {
  if (!Number.isInteger(valor) || (valor as number) < 1) throw new ErroDeCatalogo(`${onde}: versão inteira, a partir de 1`);
  return valor as number;
}

function semCamposAMais(obj: Objeto, permitidos: readonly string[], onde: string): void {
  const sobra = Object.keys(obj).filter((k) => !permitidos.includes(k));
  if (sobra.length > 0) throw new ErroDeCatalogo(`${onde}: campo desconhecido ${sobra.join(', ')}`);
}

function mapaDeTextos(valor: unknown, onde: string): Record<string, string> {
  const obj = objeto(valor, onde);
  const saida: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) saida[k] = texto(v, `${onde}.${k}`);
  return saida;
}

function compilarComo(
  fonte: unknown,
  esperado: TipoDeValor,
  variaveis: Record<string, TipoDeValor>,
  onde: string,
  valoresPermitidos: Record<string, readonly string[]> = {},
): ExpressaoCompilada {
  const t = texto(fonte, onde);
  let expressao: ExpressaoCompilada;
  try {
    expressao = compilar(t, variaveis);
  } catch (e) {
    throw new ErroDeCatalogo(`${onde}: ${(e as Error).message}`);
  }
  if (expressao.tipo !== esperado) {
    throw new ErroDeCatalogo(`${onde}: a expressão "${t}" dá ${expressao.tipo}, esperava ${esperado}`);
  }
  // Texto comparado com variável de valores fechados precisa ser um dos valores (pega erro de digitação).
  visitar(expressao.arvore, (no) => {
    if (no.tipo !== 'binario' || (no.operador !== '==' && no.operador !== '!=')) return;
    const [variavel, literal] = no.esquerda.tipo === 'variavel' ? [no.esquerda, no.direita] : [no.direita, no.esquerda];
    if (variavel.tipo !== 'variavel' || literal.tipo !== 'texto') return;
    const permitidos = valoresPermitidos[variavel.nome];
    if (permitidos && !permitidos.includes(literal.valor)) {
      throw new ErroDeCatalogo(`${onde}: "${literal.valor}" não é valor de ${variavel.nome}`);
    }
  });
  return expressao;
}

const CAMPOS_DO_ITEM = [
  'key', 'name', 'category', 'scope', 'when', 'qty', 'unit', 'detalhe', 'tarefa',
  'dependsOnCamping', 'consumivel', 'decisao', 'entraQuandoSpec', 'quantidadeSpec',
];

/** Confere os três arquivos do catálogo e devolve o catálogo tipado, com as expressões prontas. */
export function validarCatalogo(itensDados: unknown, tarefasDados: unknown, alertasDados: unknown): Catalogo {
  const raiz = objeto(itensDados, 'itens.json');
  semCamposAMais(raiz, ['versao', 'fonte', 'variaveis', 'unidades', 'categorias', 'exclusoesPorTipo', 'itens'], 'itens.json');
  texto(raiz['fonte'], 'itens.json fonte');

  const variaveis: Record<string, TipoDeValor> = {};
  const valoresPermitidos: Record<string, string[]> = {};
  for (const [nome, def] of Object.entries(objeto(raiz['variaveis'], 'variaveis'))) {
    const d = objeto(def, `variaveis.${nome}`);
    semCamposAMais(d, ['tipo', 'valores', 'descricao'], `variaveis.${nome}`);
    const tipo = d['tipo'];
    if (tipo !== 'numero' && tipo !== 'logico' && tipo !== 'texto') {
      throw new ErroDeCatalogo(`variaveis.${nome}: tipo desconhecido`);
    }
    texto(d['descricao'], `variaveis.${nome}.descricao`);
    variaveis[nome] = tipo;
    if (d['valores'] !== undefined) {
      valoresPermitidos[nome] = lista(d['valores'], `variaveis.${nome}.valores`).map((v, i) => chave(v, `variaveis.${nome}.valores[${i}]`));
    }
  }

  const unidades: Record<string, { singular: string; plural: string }> = {};
  for (const [nome, def] of Object.entries(objeto(raiz['unidades'], 'unidades'))) {
    chave(nome, 'unidades');
    const d = objeto(def, `unidades.${nome}`);
    semCamposAMais(d, ['singular', 'plural'], `unidades.${nome}`);
    unidades[nome] = { singular: texto(d['singular'], `unidades.${nome}`), plural: texto(d['plural'], `unidades.${nome}`) };
  }

  const categorias = lista(raiz['categorias'], 'categorias').map((c, i) => {
    const d = objeto(c, `categorias[${i}]`);
    semCamposAMais(d, ['key', 'nome'], `categorias[${i}]`);
    return { key: chave(d['key'], `categorias[${i}].key`), nome: texto(d['nome'], `categorias[${i}].nome`) };
  });
  const chavesDeCategoria = new Set(categorias.map((c) => c.key));
  if (chavesDeCategoria.size !== categorias.length) throw new ErroDeCatalogo('categorias: chave repetida');

  const unidade = (valor: unknown, onde: string): string => {
    const u = chave(valor, onde);
    if (!unidades[u]) throw new ErroDeCatalogo(`${onde}: unidade desconhecida "${u}"`);
    return u;
  };

  const itens: ItemDoCatalogo[] = lista(raiz['itens'], 'itens').map((bruto, i) => {
    const d = objeto(bruto, `itens[${i}]`);
    const key = chave(d['key'], `itens[${i}].key`);
    const onde = `item ${key}`;
    semCamposAMais(d, CAMPOS_DO_ITEM, onde);
    const category = chave(d['category'], `${onde}.category`);
    if (!chavesDeCategoria.has(category)) throw new ErroDeCatalogo(`${onde}: categoria desconhecida "${category}"`);
    const scope = d['scope'];
    if (scope !== 'pessoa' && scope !== 'familia' && scope !== 'grupo') throw new ErroDeCatalogo(`${onde}: escopo desconhecido`);

    let tarefa: ItemDoCatalogo['tarefa'] = null;
    if (d['tarefa'] !== undefined) {
      const t = objeto(d['tarefa'], `${onde}.tarefa`);
      semCamposAMais(t, ['tipo', 'partes'], `${onde}.tarefa`);
      const tipo = t['tipo'];
      if (tipo !== 'conferir' && tipo !== 'planejar_refeicoes') throw new ErroDeCatalogo(`${onde}: tipo de tarefa desconhecido`);
      const partes: Record<string, ExpressaoCompilada> = {};
      if (t['partes'] !== undefined) {
        for (const [nome, fonte] of Object.entries(objeto(t['partes'], `${onde}.tarefa.partes`))) {
          partes[nome] = compilarComo(fonte, 'numero', variaveis, `${onde}.tarefa.partes.${nome}`, valoresPermitidos);
        }
      }
      tarefa = { tipo, partes };
    }

    const qty = d['qty'] === null ? null : compilarComo(d['qty'], 'numero', variaveis, `${onde}.qty`, valoresPermitidos);
    if ((qty === null) === (tarefa === null)) {
      throw new ErroDeCatalogo(`${onde}: o item tem quantidade ou é tarefa, uma das duas`);
    }

    let detalhe: ItemDoCatalogo['detalhe'] = null;
    if (d['detalhe'] !== undefined) {
      const det = objeto(d['detalhe'], `${onde}.detalhe`);
      semCamposAMais(det, ['qty', 'unit'], `${onde}.detalhe`);
      detalhe = { qty: compilarComo(det['qty'], 'numero', variaveis, `${onde}.detalhe.qty`, valoresPermitidos), unit: unidade(det['unit'], `${onde}.detalhe.unit`) };
    }

    return {
      key,
      name: texto(d['name'], `${onde}.name`),
      category,
      scope,
      when: compilarComo(d['when'], 'logico', variaveis, `${onde}.when`, valoresPermitidos),
      qty,
      unit: d['unit'] === null ? null : unidade(d['unit'], `${onde}.unit`),
      detalhe,
      tarefa,
      dependsOnCamping: logico(d['dependsOnCamping'], `${onde}.dependsOnCamping`),
      consumivel: logico(d['consumivel'], `${onde}.consumivel`),
      decisao: d['decisao'] === undefined ? null : texto(d['decisao'], `${onde}.decisao`),
      entraQuandoSpec: texto(d['entraQuandoSpec'], `${onde}.entraQuandoSpec`),
      quantidadeSpec: texto(d['quantidadeSpec'], `${onde}.quantidadeSpec`),
    };
  });

  const porChave = new Map<string, ItemDoCatalogo>();
  for (const item of itens) {
    if (porChave.has(item.key)) throw new ErroDeCatalogo(`item ${item.key}: chave repetida`);
    porChave.set(item.key, item);
  }

  const exclusoes = objeto(raiz['exclusoesPorTipo'], 'exclusoesPorTipo');
  semCamposAMais(exclusoes, ['mochila', 'motorhome'], 'exclusoesPorTipo');
  const exclusao = (tipo: 'mochila' | 'motorhome'): string[] =>
    lista(exclusoes[tipo], `exclusoesPorTipo.${tipo}`).map((k, i) => {
      const c = chave(k, `exclusoesPorTipo.${tipo}[${i}]`);
      if (!porChave.has(c)) throw new ErroDeCatalogo(`exclusoesPorTipo.${tipo}: item desconhecido "${c}"`);
      return c;
    });

  const tarefasRaiz = objeto(tarefasDados, 'tarefas.json');
  semCamposAMais(tarefasRaiz, ['versao', 'fonte', 'vespera', 'volta'], 'tarefas.json');
  versao(tarefasRaiz['versao'], 'tarefas.json versao');
  const listaDeTarefas = (nome: 'vespera' | 'volta'): Tarefa[] =>
    lista(tarefasRaiz[nome], `tarefas.${nome}`).map((t, i) => {
      const d = objeto(t, `tarefas.${nome}[${i}]`);
      semCamposAMais(d, ['key', 'texto', 'emCasa'], `tarefas.${nome}[${i}]`);
      const base = { key: chave(d['key'], `tarefas.${nome}[${i}].key`), texto: texto(d['texto'], `tarefas.${nome}[${i}].texto`) };
      return d['emCasa'] === undefined ? base : { ...base, emCasa: logico(d['emCasa'], `tarefas.${nome}[${i}].emCasa`) };
    });

  const alertasRaiz = objeto(alertasDados, 'alertas.json');
  semCamposAMais(alertasRaiz, ['versao', 'fonte', 'textos', 'tarefas', 'avisos', 'horarios'], 'alertas.json');
  versao(alertasRaiz['versao'], 'alertas.json versao');

  return {
    versao: versao(raiz['versao'], 'itens.json versao'),
    variaveis,
    valoresPermitidos,
    unidades,
    categorias,
    exclusoesPorTipo: { mochila: exclusao('mochila'), motorhome: exclusao('motorhome') },
    itens,
    porChave,
    tarefas: { vespera: listaDeTarefas('vespera'), volta: listaDeTarefas('volta') },
    alertas: {
      textos: mapaDeTextos(alertasRaiz['textos'], 'alertas.textos'),
      tarefas: mapaDeTextos(alertasRaiz['tarefas'], 'alertas.tarefas'),
      avisos: mapaDeTextos(alertasRaiz['avisos'], 'alertas.avisos'),
      horarios: mapaDeTextos(alertasRaiz['horarios'], 'alertas.horarios'),
    },
  };
}

let emCache: Catalogo | null = null;

/** Catálogo de `packages/content`, conferido na primeira chamada e guardado. */
export function carregarCatalogo(): Catalogo {
  emCache ??= validarCatalogo(itensJson, tarefasJson, alertasJson);
  return emCache;
}
