/// <reference types="node" />
// O catálogo de `packages/content` contra a SPEC: todo item da seção 5 está no arquivo, com chave,
// nome, categoria, escopo, condição e quantidade iguais aos da tabela, e nada a mais. O mesmo para as
// exclusões por tipo, as tarefas de véspera e da volta e os textos-base dos alertas (seção 6).

import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import alertasJson from '../../content/catalogo/alertas.json';
import itensJson from '../../content/catalogo/itens.json';
import tarefasJson from '../../content/catalogo/tarefas.json';
import alertasEsquema from '../../content/esquemas/alertas.schema.json';
import itensEsquema from '../../content/esquemas/itens.schema.json';
import tarefasEsquema from '../../content/esquemas/tarefas.schema.json';

import { carregarCatalogo, ErroDeCatalogo, validarCatalogo } from './catalogo';
import { validarPeloEsquema } from './testes/esquema-json';

// Fim de linha do Windows (git com autocrlf) vira só "\n" antes de ler as tabelas.
const SPEC = readFileSync(new URL('../../../docs/SPEC.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

function secao(numero: number): string {
  const inicio = SPEC.indexOf(`\n## ${numero}. `);
  const fim = SPEC.indexOf(`\n## ${numero + 1}. `);
  if (inicio < 0 || fim < 0) throw new Error(`seção ${numero} não encontrada na SPEC`);
  return SPEC.slice(inicio, fim);
}

const celulas = (linha: string): string[] => linha.split('|').slice(1, -1).map((c) => c.trim());

interface LinhaDaSpec {
  categoria: string;
  chave: string;
  item: string;
  entraQuando: string;
  quantidade: string;
  escopo: string;
}

/** Lê as tabelas "Chave | Item | Entra quando | Quantidade | Escopo" da seção 5, com o título de cada uma. */
function itensDaSpec(): LinhaDaSpec[] {
  const linhas = secao(5).split('\n');
  const saida: LinhaDaSpec[] = [];
  let categoria = '';
  for (let i = 0; i < linhas.length; i += 1) {
    const linha = linhas[i] ?? '';
    const titulo = /^\*\*(.+)\*\*$/.exec(linha);
    if (titulo) categoria = titulo[1] ?? '';
    if (linha.startsWith('| Chave | Item | Entra quando | Quantidade | Escopo |')) {
      for (let j = i + 2; (linhas[j] ?? '').startsWith('|'); j += 1) {
        const [chave = '', item = '', entraQuando = '', quantidade = '', escopo = ''] = celulas(linhas[j] ?? '');
        saida.push({ categoria, chave: chave.replace(/`/g, ''), item, entraQuando, quantidade, escopo });
      }
    }
  }
  return saida;
}

const ESCOPO: Record<string, string> = { Pessoa: 'pessoa', 'Família': 'familia', Grupo: 'grupo' };

describe('catálogo × SPEC, seção 5', () => {
  const catalogo = carregarCatalogo();
  const spec = itensDaSpec();

  it('a SPEC tem as 11 tabelas de itens e o arquivo as mesmas categorias, na mesma ordem', () => {
    const titulos = [...new Set(spec.map((l) => l.categoria))];
    expect(titulos).toHaveLength(11);
    expect(catalogo.categorias.map((c) => c.nome)).toEqual(titulos);
  });

  it('todo item da SPEC está no arquivo, e nada a mais, na mesma ordem', () => {
    expect(spec.length).toBeGreaterThan(70);
    expect(catalogo.itens.map((i) => i.key)).toEqual(spec.map((l) => l.chave));
  });

  it.each(itensDaSpec().map((l) => [l.chave, l] as const))('item %s: nome, categoria, escopo, condição e quantidade iguais aos da SPEC', (chave, linha) => {
    const item = catalogo.porChave.get(chave);
    expect(item).toBeDefined();
    if (!item) return;
    expect(item.name).toBe(linha.item);
    expect(catalogo.categorias.find((c) => c.key === item.category)?.nome).toBe(linha.categoria);
    expect(item.scope).toBe(ESCOPO[linha.escopo]);
    expect(item.entraQuandoSpec).toBe(linha.entraQuando);
    expect(item.quantidadeSpec).toBe(linha.quantidade);
    // "Depende do camping" na coluna "Entra quando" é a marca dependsOnCamping.
    expect(item.dependsOnCamping).toBe(/depende do camping/i.test(linha.entraQuando));
    // Tarefa na SPEC é tarefa no arquivo, sem quantidade.
    expect(item.qty === null).toBe(linha.quantidade.startsWith('Tarefa:'));
  });

  it('as exclusões por tipo de viagem são as da SPEC ("Regras de geração")', () => {
    const regra = (tipo: string): string[] => {
      const frase = new RegExp(`${tipo} exclui ([^.]+)\\.`).exec(secao(5))?.[1] ?? '';
      return [...frase.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] as string);
    };
    expect(catalogo.exclusoesPorTipo.mochila).toEqual(regra('Trilha com mochila'));
    expect(catalogo.exclusoesPorTipo.motorhome).toEqual(regra('Motorhome'));
  });

  it('as tarefas de véspera e da volta são as da SPEC, na ordem', () => {
    const numeradas = (titulo: string): string[] => {
      const trecho = secao(5).split(`**${titulo}**`)[1] ?? '';
      return trecho.split('\n\n')[1]?.split('\n').map((l) => l.replace(/^\d+\. /, '')) ?? [];
    };
    expect(catalogo.tarefas.vespera.map((t) => t.texto)).toEqual(numeradas('Tarefas de véspera (E1-08)'));
    expect(catalogo.tarefas.volta.map((t) => t.texto)).toEqual(numeradas('Tarefas da volta (E1-10)'));
    expect(catalogo.tarefas.volta.filter((t) => t.emCasa).map((t) => t.key)).toEqual(['secar_barraca', 'saco_dormir']);
  });

  it('consumíveis marcados são exatamente os da decisão do responsável de 26/11/2026 na SPEC', () => {
    const paragrafo = /^\*\*Consumíveis\.\*\* \*\*Decidido pelo responsável em 26\/11\/2026:\*\* (.+)$/m.exec(secao(5))?.[1] ?? '';
    const daSpec = [...(paragrafo.split('Alimentos')[0] ?? '').matchAll(/`([a-z_]+)`/g)].map((m) => m[1] as string);
    expect(daSpec).toHaveLength(10);
    expect(catalogo.itens.filter((i) => i.consumivel).map((i) => i.key).sort()).toEqual([...daSpec].sort());
    // alimentos e básicos de cozinha não são consumíveis
    for (const chave of ['refeicoes', 'basicos', 'lanches']) expect(catalogo.porChave.get(chave)?.consumivel, chave).toBe(false);
  });

  it('itens com decisão do responsável: o motorhome leva mesa, cadeiras, grelha e carvão (SPEC, "Tipos de viagem")', () => {
    const frase = /o motorhome também leva ([^;]+);/.exec(secao(5))?.[1] ?? '';
    const daSpec = [...frase.matchAll(/`([a-z_]+)`/g)].map((m) => m[1] as string);
    expect(daSpec).toEqual(['mesa', 'cadeiras', 'grelha', 'carvao']);
    expect(catalogo.itens.filter((i) => i.decisao !== null).map((i) => i.key).sort()).toEqual([...daSpec].sort());
    for (const chave of daSpec) expect(catalogo.porChave.get(chave)?.decisao).toMatch(/^Decidido pelo responsável em 26\/11\/2026: /);
  });
});

describe('textos-base dos alertas × SPEC, seção 6', () => {
  it('os textos do arquivo são os da coluna "Texto-base", nem mais nem menos', () => {
    const linhas = secao(6).split('\n');
    const inicio = linhas.findIndex((l) => l.startsWith('| Condição | Nível | Efeito na lista | Texto-base |'));
    const daSpec = new Set<string>();
    for (let j = inicio + 2; (linhas[j] ?? '').startsWith('|'); j += 1) {
      daSpec.add((celulas(linhas[j] ?? '')[3] ?? '').replace(/^"|"$/g, ''));
    }
    const doArquivo = new Set(Object.values(carregarCatalogo().alertas.textos).map((t) => t.replace(/\{[a-z]+\}/g, 'X')));
    expect(doArquivo).toEqual(daSpec);
  });
});

describe('esquemas JSON de packages/content/esquemas', () => {
  it.each([
    ['itens.json', itensJson, itensEsquema],
    ['tarefas.json', tarefasJson, tarefasEsquema],
    ['alertas.json', alertasJson, alertasEsquema],
  ] as const)('%s segue o esquema', (_nome, dados, esquema) => {
    expect(validarPeloEsquema(dados, esquema)).toEqual([]);
  });

  it('o esquema pega item sem campo obrigatório, campo a mais e escopo desconhecido', () => {
    const item = { ...itensJson.itens[0] } as Record<string, unknown>;
    delete item['qty'];
    const ruim = { ...itensJson, itens: [item, { ...itensJson.itens[1], cor: 'azul' }, { ...itensJson.itens[2], scope: 'casal' }] };
    const erros = validarPeloEsquema(ruim, itensEsquema);
    expect(erros.some((e) => e.includes('qty'))).toBe(true);
    expect(erros.some((e) => e.includes('cor'))).toBe(true);
    expect(erros.some((e) => e.includes('scope'))).toBe(true);
  });
});

describe('validarCatalogo recusa catálogo com erro', () => {
  const comItem = (mudanca: Record<string, unknown>): unknown => ({ ...itensJson, itens: [{ ...itensJson.itens[0], ...mudanca }] });
  const validar = (itens: unknown): unknown => validarCatalogo(itens, tarefasJson, alertasJson);

  it.each([
    ['variável desconhecida', { qty: 'pessoas + 1' }, /variável desconhecida/],
    ['função desconhecida', { qty: 'piso(P / 2)' }, /função desconhecida/],
    ['condição que não é verdadeiro ou falso', { when: 'P + 1' }, /esperava logico/],
    ['quantidade que não é número', { qty: "clima == 'frio'" }, /esperava numero/],
    ['texto fora dos valores da variável', { when: "clima == 'gelado'" }, /não é valor de clima/],
    ['categoria desconhecida', { category: 'cozinha_externa' }, /categoria desconhecida/],
    ['unidade desconhecida', { unit: 'caixa' }, /unidade desconhecida/],
    ['escopo desconhecido', { scope: 'casal' }, /escopo desconhecido/],
    ['campo a mais', { cor: 'azul' }, /campo desconhecido/],
    ['sem quantidade e sem tarefa', { qty: null }, /quantidade ou é tarefa/],
    ['chave fora do formato', { key: 'Barraca' }, /snake_case/],
    ['expressão quebrada', { qty: '(P + 1' }, /esperava "\)"/],
    ['marca que não é verdadeiro ou falso', { consumivel: 'sim' }, /verdadeiro ou falso/],
    ['decisão vazia', { decisao: '' }, /esperava um texto/],
  ])('%s', (_caso, mudanca, erro) => {
    expect(() => validar(comItem(mudanca))).toThrow(erro);
  });

  it('chave repetida', () => {
    expect(() => validar({ ...itensJson, itens: [itensJson.itens[0], itensJson.itens[0]] })).toThrow(/chave repetida/);
  });

  it('exclusão de item que não existe', () => {
    expect(() => validar({ ...itensJson, exclusoesPorTipo: { mochila: ['fogueira'], motorhome: [] } })).toThrow(/item desconhecido/);
  });

  it('arquivo que não é objeto, lista que não é lista e versão inválida', () => {
    expect(() => validar([])).toThrow(ErroDeCatalogo);
    expect(() => validar({ ...itensJson, itens: {} })).toThrow(/esperava uma lista/);
    expect(() => validarCatalogo({ ...itensJson, versao: 0 }, tarefasJson, alertasJson)).toThrow(/versão/);
    expect(() => validarCatalogo(itensJson, { ...tarefasJson, versao: 'um' }, alertasJson)).toThrow(/versão/);
    expect(() => validarCatalogo(itensJson, tarefasJson, { ...alertasJson, textos: { a: '' } })).toThrow(/esperava um texto/);
  });

  it('tarefa com tipo desconhecido ou parte que não é número', () => {
    expect(() => validar(comItem({ qty: null, tarefa: { tipo: 'lembrar' } }))).toThrow(/tipo de tarefa/);
    expect(() => validar(comItem({ qty: null, tarefa: { tipo: 'planejar_refeicoes', partes: { cafes: 'chuva' } } }))).toThrow(/esperava numero/);
  });

  it('o catálogo carregado é o mesmo objeto nas chamadas seguintes', () => {
    expect(carregarCatalogo()).toBe(carregarCatalogo());
  });
});
