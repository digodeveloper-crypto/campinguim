// Regras puras dos componentes (B2): ícones iguais aos do protótipo, curvas de nível, estados com ícone e
// texto, nomes falados, gesto da rota e o contraste de cada estado dos controles (pressão, desativado, ligado).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

import { ICONES, ORDEM } from '../icones/desenhos';
import { svgDoIcone, temAtivo } from '../icones/svg';
import { textos } from '../textos';
import { contraste, PISO_FORMA, PISO_TEXTO, type NomeTema, type PapelCor } from '../tema/contraste';
import tokens from '../tema/tokens.json';
import {
  COR_LIGADA,
  ESTADOS,
  marcaDaEtapa,
  nomeFaladoDaParada,
  nomeFaladoDoItem,
  papeisDaAlternancia,
  papeisDaMarca,
  papeisDoBotao,
  papeisDoFiltro,
  PARADAS,
  temFaixa,
  type EstadoToque,
  type IconeAlternancia,
  type Papeis,
} from './estados';
import { cantoCortado, direcaoDoGesto, formatar } from './formatar';
import { caminhosDasCurvas } from './geradorCurvas';

const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');

type Rumo = { icones: Record<string, { base: string; ativo?: string }>; ordem: string[]; curvas: (o?: object) => string };

function carregarRumo(): Rumo {
  const codigo = fs.readFileSync(path.join(RAIZ, 'design', 'prototipos', 'rumo', 'icones.js'), 'utf8');
  const janela: { RUMO?: Rumo } = {};
  vm.runInNewContext(codigo, { window: janela });
  if (!janela.RUMO) throw new Error('icones.js não publicou window.RUMO');
  return janela.RUMO;
}
const rumo = carregarRumo();

describe('ícones próprios do Rumo (DESIGN.md 6)', () => {
  it('os 30 ícones e a ordem são os do protótipo, sem mudança', () => {
    expect(ORDEM).toHaveLength(30);
    expect([...ORDEM]).toEqual(rumo.ordem);
    expect(ICONES).toEqual(rumo.icones);
  });

  it('os sete de estado têm repouso e ativo', () => {
    expect(ORDEM.filter((n) => temAtivo(n))).toEqual(['separei', 'carro', 'comprar', 'atencao', 'faltou', 'conferido', 'secar']);
  });

  it('o SVG montado aplica traço de 1,5, pontas retas e as cores, sem classe sobrando', () => {
    for (const nome of ORDEM) {
      for (const ativo of [false, true]) {
        const svg = svgDoIcone(nome, ativo, '#111111', '#EEEEEE');
        expect(svg).not.toContain('class=');
        expect(svg).toContain('viewBox="0 0 24 24"');
        expect(svg).toContain('stroke-width="1.5"');
        expect(svg).toContain('stroke-linecap="butt"');
        expect(svg).toContain('stroke-linejoin="miter"');
        expect(svg).not.toMatch(/#(?!111111|EEEEEE)[0-9A-Fa-f]{6}/);
      }
    }
    expect(svgDoIcone('separei', true, '#111111', '#EEEEEE')).toContain('fill="#111111" stroke="none"');
    expect(svgDoIcone('separei', true, '#111111', '#EEEEEE')).toContain('stroke="#EEEEEE" stroke-width="2"');
    expect(svgDoIcone('sem_dono', false, '#111111', '#EEEEEE')).toContain('stroke-dasharray="2 2"');
  });

  it('nada de bússola, rosa dos ventos ou pino (DESIGN.md 13)', () => {
    expect(ORDEM.join(' ')).not.toMatch(/bussola|rosa|pino|mapa/);
  });
});

describe('curvas de nível', () => {
  it('o gerador desenha os mesmos caminhos da função curvas do protótipo', () => {
    for (const opcoes of [undefined, { aneis: 5, fase: 1.2, cx: 120 }]) {
      const svg = rumo.curvas(opcoes);
      const doPrototipo = [...svg.matchAll(/d="([^"]+)"/g)].map((m) => m[1]);
      expect(caminhosDasCurvas(opcoes).caminhos).toEqual(doPrototipo);
    }
  });
});

describe('canto cortado', () => {
  it('octógono com o corte em cada canto; o corte nunca passa da metade', () => {
    expect(cantoCortado(100, 40, 8)).toBe('8,0 92,0 100,8 100,32 92,40 8,40 0,32 0,8');
    expect(cantoCortado(100, 40, 7, 2)).toBe('9,2 91,2 98,9 98,31 91,38 9,38 2,31 2,9');
    expect(cantoCortado(10, 10, 20)).toBe('5,0 5,0 10,5 10,5 5,10 5,10 0,5 0,5');
  });
});

describe('estados: sempre ícone e texto, nunca só cor (DESIGN.md 3.3; DSG-10)', () => {
  const t = textos.componentes;

  it('cada estado tem ícone, texto do arquivo de textos e a cor da tabela', () => {
    expect(ESTADOS.aSeparar).toMatchObject({ cor: 'textoSuave', icone: 'separei', ativo: false, texto: 'a separar' });
    expect(ESTADOS.separei).toMatchObject({ cor: 'separei', icone: 'separei', ativo: true, texto: 'separei · fora do carro', falado: 'separei, fora do carro' });
    expect(ESTADOS.carro).toMatchObject({ cor: 'carro', icone: 'carro', ativo: true, texto: 'está no carro' });
    expect(ESTADOS.comprar).toMatchObject({ cor: 'texto', icone: 'comprar' });
    expect(ESTADOS.faltou).toMatchObject({ cor: 'atencao', icone: 'faltou' });
    expect(ESTADOS.conferido).toMatchObject({ cor: 'texto', icone: 'conferido', ativo: true });
    expect(ESTADOS.naoConferido).toMatchObject({ cor: 'textoSuave', icone: 'conferido', ativo: false });
    expect(ESTADOS.secar).toMatchObject({ cor: 'carro', icone: 'secar' });
    for (const e of Object.values(ESTADOS)) {
      expect(e.texto.length).toBeGreaterThan(0);
      expect(Object.values(t.estado)).toContain(e.texto);
    }
  });

  it('dois estados com a mesma cor nunca têm o mesmo ícone e o mesmo texto', () => {
    const chaves = Object.values(ESTADOS).map((e) => `${e.icone}/${String(e.ativo)}/${e.texto}`);
    expect(new Set(chaves).size).toBe(chaves.length);
  });

  it('a faixa de 4 à esquerda marca o item fora do carro', () => {
    expect(temFaixa('aSeparar')).toBe(true);
    expect(temFaixa('separei')).toBe(true);
    expect(temFaixa('carro')).toBe(false);
  });

  it('todos os estados contrastam com folha e fundo (4,5 ou mais), nos dois temas', () => {
    for (const tema of ['claro', 'escuro'] as NomeTema[]) {
      for (const e of Object.values(ESTADOS)) {
        for (const fundo of ['superficie', 'fundo'] as PapelCor[]) {
          expect(contraste(tokens.cores[tema][e.cor], tokens.cores[tema][fundo])).toBeGreaterThanOrEqual(PISO_TEXTO);
        }
      }
    }
  });
});

describe('nomes falados (NF-08)', () => {
  it('rota: "Parada 2 de 5: Carregar. Você está aqui"', () => {
    expect(PARADAS).toEqual(['preparar', 'carregar', 'camping', 'volta', 'casa']);
    expect(nomeFaladoDaParada('carregar', true)).toBe('Parada 2 de 5: Carregar. Você está aqui');
    expect(nomeFaladoDaParada('casa', false)).toBe('Parada 5 de 5: Em casa');
  });

  it('marca da etapa: "Parada 2 de 5 · Carregar" e "Legenda · Grupo"', () => {
    expect(marcaDaEtapa({ parada: 'carregar' })).toBe('Parada 2 de 5 · Carregar');
    expect(marcaDaEtapa({ area: 'Grupo' })).toBe('Legenda · Grupo');
  });

  it('item: "{nome}, {quantidade}, {estado}. Abrir o item", com o estado por extenso', () => {
    expect(nomeFaladoDoItem('Lanterna', '4', 'separei')).toBe('Lanterna, 4, separei, fora do carro. Abrir o item');
    expect(nomeFaladoDoItem('Lanterna', '4', 'carro')).toBe('Lanterna, 4, está no carro. Abrir o item');
    expect(formatar(textos.componentes.item.alternarCarro, { nome: 'Lanterna' })).toBe('Lanterna: está no carro');
  });

  it('legenda: nome acessível e anúncio de abertura', () => {
    expect(textos.componentes.legenda.falado).toBe('Legenda: camping, grupo, gastos');
    expect(textos.componentes.legenda.aberta).toBe('Legenda aberta. Camping, grupo e gastos.');
  });

  it('formatar recusa texto sem valor (nunca mostra {marcador} na tela)', () => {
    expect(() => formatar('Parada {n}', {})).toThrow();
  });
});

describe('textos dos componentes (CLAUDE.md, regra 5)', () => {
  function folhas(o: unknown, caminho = ''): [string, string][] {
    if (typeof o === 'string') return [[caminho, o]];
    if (o && typeof o === 'object') return Object.entries(o).flatMap(([k, v]) => folhas(v, caminho ? `${caminho}.${k}` : k));
    return [];
  }
  it('nenhum texto vazio, sem exclamação (tom de diário de expedição, DESIGN.md 10)', () => {
    for (const [caminho, valor] of folhas(textos.componentes)) {
      expect(valor.trim().length, caminho).toBeGreaterThan(0);
      expect(valor, caminho).not.toContain('!');
    }
  });
});

describe('gesto da rota (DESIGN.md 7.1)', () => {
  it('troca de parada com 70 ou mais na horizontal, menos de 45 na vertical, em até 700 ms', () => {
    expect(direcaoDoGesto(-80, 10, 300)).toBe(1);
    expect(direcaoDoGesto(80, 10, 300)).toBe(-1);
    expect(direcaoDoGesto(60, 0, 300)).toBe(0);
    expect(direcaoDoGesto(90, 50, 300)).toBe(0);
    expect(direcaoDoGesto(90, 0, 800)).toBe(0);
  });
});

describe('contraste de cada estado dos controles (D-2; pressão e desativado são decisão provisória)', () => {
  const TOQUES: EstadoToque[] = ['normal', 'pressao', 'desativado'];
  const casos: [string, Papeis][] = [];
  for (const toque of TOQUES) {
    for (const tipo of ['principal', 'secundario'] as const) casos.push([`botão ${tipo} ${toque}`, papeisDoBotao(tipo, toque)]);
    for (const ligado of [false, true]) {
      for (const carro of [false, true]) casos.push([`marca ${ligado ? 'ligada' : 'desligada'}${carro ? ' carro' : ''} ${toque}`, papeisDaMarca(ligado, carro, toque)]);
      casos.push([`filtro ${ligado ? 'ligado' : 'desligado'} ${toque}`, papeisDoFiltro(ligado, toque)]);
      for (const icone of Object.keys(COR_LIGADA) as IconeAlternancia[]) {
        casos.push([`alternância ${icone} ${ligado ? 'ligada' : 'desligada'} ${toque}`, papeisDaAlternancia(icone, ligado, toque)]);
      }
    }
  }

  for (const tema of ['claro', 'escuro'] as NomeTema[]) {
    const c = tokens.cores[tema];
    it(`${tema}: letra ≥ 4,5 sobre o fundo do controle; borda ≥ 3 contra a folha ou contra o próprio fundo`, () => {
      for (const [nome, p] of casos) {
        expect(contraste(c[p.letra], c[p.fundo]), `${nome}: letra`).toBeGreaterThanOrEqual(PISO_TEXTO);
        const borda = Math.max(contraste(c[p.borda], c.superficie), contraste(c[p.borda], c.fundo));
        expect(borda, `${nome}: borda`).toBeGreaterThanOrEqual(PISO_FORMA);
      }
    });
  }

  it('o estado ligado muda mais do que a cor: a alternância troca o ícone (repouso → cheio)', () => {
    for (const icone of Object.keys(COR_LIGADA) as IconeAlternancia[]) {
      if (icone === 'ciente') continue;
      expect(temAtivo(icone)).toBe(true);
    }
  });
});
