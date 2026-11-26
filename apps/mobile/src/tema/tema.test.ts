// Testes do tema (B2): contraste de cada par de DESIGN.md 3.2 contra o piso 4,5 (D-2), cores iguais às do
// protótipo, página web na mesma fonte de verdade, escala de letra e fontes embutidas.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { contraste, PARES, pisoDoPar, PISO_FORMA, PISO_TEXTO, type NomeTema, type PapelCor } from './contraste';
import { aplicarBloco, cssDosTokens, nomeVariavel } from './css';
import { COMBINACOES, estiloDoUso, faixaDaLetra, nomeDaFamilia, type UsoTexto } from './familias';
import tokens from './tokens.json';

const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
const ler = (...partes: string[]) => fs.readFileSync(path.join(RAIZ, ...partes), 'utf8');
const TEMAS: NomeTema[] = ['claro', 'escuro'];
const cor = (tema: NomeTema, papel: PapelCor) => tokens.cores[tema][papel];

describe('contraste: os 14 pares de DESIGN.md 3.2', () => {
  for (const tema of TEMAS) {
    for (const par of PARES) {
      it(`${tema}: ${par.frente} / ${par.fundo} ≥ ${String(pisoDoPar(par))} (${par.tipo})`, () => {
        const valor = contraste(cor(tema, par.frente), cor(tema, par.fundo));
        expect(valor).toBeGreaterThanOrEqual(pisoDoPar(par));
        // O cálculo bate com o valor publicado no DESIGN.md (duas casas).
        expect(Math.abs(valor - par.publicado[tema])).toBeLessThan(0.006);
      });
    }
  }

  it('todo par de texto respeita o piso 4,5 da decisão D-2 (botão inclusive)', () => {
    const textos = PARES.filter((p) => p.tipo === 'texto');
    expect(textos.length).toBe(11);
    for (const tema of TEMAS) {
      for (const p of textos) expect(contraste(cor(tema, p.frente), cor(tema, p.fundo))).toBeGreaterThanOrEqual(PISO_TEXTO);
    }
  });

  it('pares de forma (borda, linha, preenchimento) ficam em 3:1 ou mais; o mais apertado é linha/fundo no claro', () => {
    const formas = PARES.filter((p) => p.tipo === 'forma');
    expect(formas.map((p) => `${p.frente}/${p.fundo}`)).toEqual(['acento/fundo', 'linha/superficie', 'linha/fundo']);
    const menor = Math.min(...TEMAS.flatMap((t) => formas.map((p) => contraste(cor(t, p.frente), cor(t, p.fundo)))));
    expect(menor).toBeGreaterThanOrEqual(PISO_FORMA);
    expect(menor.toFixed(2)).toBe('3.24');
  });

  it('usos fora da tabela, conferidos no protótipo: alternado ligado e caixa marcada (fundo sobre texto)', () => {
    expect(contraste(cor('claro', 'fundo'), cor('claro', 'texto')).toFixed(2)).toBe('13.40');
    expect(contraste(cor('escuro', 'fundo'), cor('escuro', 'texto')).toFixed(2)).toBe('15.47');
  });

  it('mascote: corpo ardósia a 6,05 do fundo claro e a 6,40 do apoio escuro (mínimo 3:1)', () => {
    const corpo = tokens.mascote.ardosia;
    expect(contraste(corpo, cor('claro', 'fundo')).toFixed(2)).toBe('6.05');
    expect(contraste(corpo, cor('escuro', 'texto')).toFixed(2)).toBe('6.40');
    expect(tokens.mascote.gorro).toBe('#3EA8AE');
  });
});

describe('cores iguais às do protótipo Rumo, paleta Eucalipto (DSG-06)', () => {
  const css = ler('design', 'prototipos', 'rumo', 'estilo.css');
  function bloco(seletor: string): Record<string, string> {
    const inicio = css.indexOf(`${seletor} {`);
    expect(inicio).toBeGreaterThan(-1);
    const corpo = css.slice(inicio, css.indexOf('}', inicio));
    const valores: Record<string, string> = {};
    for (const m of corpo.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6});/g)) if (m[1] && m[2]) valores[m[1]] = m[2].toUpperCase();
    return valores;
  }
  const blocos: Record<NomeTema, Record<string, string>> = {
    claro: bloco(':root[data-paleta="eucalipto"]'),
    escuro: bloco(':root[data-paleta="eucalipto"][data-tema="escuro"]'),
  };
  for (const tema of TEMAS) {
    it(`${tema}: os 10 papéis, com os mesmos valores do estilo.css`, () => {
      const nossos = Object.fromEntries(Object.entries(tokens.cores[tema]).map(([p, v]) => [nomeVariavel(p), v]));
      expect(Object.keys(nossos)).toHaveLength(10);
      expect(nossos).toEqual(blocos[tema]);
    });
  }
});

describe('página web: as mesmas cores, geradas da mesma fonte', () => {
  it('o bloco de apps/web/src/estilos.css está em dia com tokens.json (rode node apps/mobile/src/tema/gerar.mjs)', () => {
    const atual = ler('apps', 'web', 'src', 'estilos.css').replaceAll('\r\n', '\n');
    expect(aplicarBloco(atual, cssDosTokens(tokens))).toBe(atual);
  });
});

describe('tipografia (DESIGN.md 4)', () => {
  const usos = Object.keys(tokens.tipografia.escala) as UsoTexto[];

  it('nenhum texto abaixo de 15 e nenhum peso abaixo de 400; corpo de 17', () => {
    for (const u of usos) {
      const e = tokens.tipografia.escala[u];
      expect(e.tamanho, u).toBeGreaterThanOrEqual(tokens.tipografia.menorTamanho);
      expect(e.peso, u).toBeGreaterThanOrEqual(tokens.tipografia.menorPeso);
    }
    expect(tokens.tipografia.escala.corpo.tamanho).toBe(17);
  });

  it('toda família usada (inclusive em 130 % e 200 %) existe como arquivo embutido, com a licença OFL ao lado', () => {
    const pasta = path.join(RAIZ, 'apps', 'mobile', 'assets', 'fontes', 'archivo');
    const existentes = new Set(COMBINACOES.map(([l, p]) => nomeDaFamilia(l, p)));
    for (const [l, p] of COMBINACOES) expect(fs.existsSync(path.join(pasta, `${nomeDaFamilia(l, p)}.ttf`)), nomeDaFamilia(l, p)).toBe(true);
    for (const fator of [1, 1.3, 2]) {
      for (const u of usos) expect(existentes.has(estiloDoUso(u, fator).fontFamily), `${u} em ${String(fator)}`).toBe(true);
    }
    expect(fs.readFileSync(path.join(pasta, 'OFL.txt'), 'utf8')).toBe(ler('design', 'prototipos', '_compartilhado', 'fontes', 'archivo', 'OFL.txt'));
  });

  it('letreiro em caixa alta só de estilo, com espaço entre letras em em', () => {
    const titulo = estiloDoUso('tituloTela', 1);
    expect(titulo).toMatchObject({ fontFamily: 'Archivo-L125-P700', fontSize: 26, lineHeight: 30, textTransform: 'uppercase' });
    expect(titulo.letterSpacing).toBeCloseTo(26 * 0.04, 2);
    expect(estiloDoUso('corpo', 1).textTransform).toBe('none');
  });

  it('letra grande: 130 % e 200 % trocam a largura do letreiro, do título e dos rótulos (DESIGN.md 4.4)', () => {
    expect(faixaDaLetra(1)).toBe(100);
    expect(faixaDaLetra(1.3)).toBe(130);
    expect(faixaDaLetra(2)).toBe(200);
    expect(estiloDoUso('letreiro', 1.3).fontFamily).toBe('Archivo-L100-P800');
    expect(estiloDoUso('tituloTela', 1.3).fontFamily).toBe('Archivo-L125-P700');
    expect(estiloDoUso('tituloTela', 2).fontFamily).toBe('Archivo-L100-P700');
    expect(estiloDoUso('rotulo', 2).fontFamily).toBe('Archivo-L100-P600');
    expect(estiloDoUso('rotulo', 2).letterSpacing).toBeCloseTo(15 * 0.02, 2);
  });

  it('a simulação da galeria multiplica tamanho e entrelinha', () => {
    expect(estiloDoUso('corpo', 2, 2)).toMatchObject({ fontSize: 34, lineHeight: 52 });
  });
});

describe('medidas (DESIGN.md 5 e 9; D-7)', () => {
  it('alvos de toque de 44 dp ou mais; 48 nos médios; 56 no principal', () => {
    for (const [nome, valor] of Object.entries(tokens.alvo)) expect(valor, nome).toBeGreaterThanOrEqual(44);
    expect(tokens.alvo.medio).toBe(48);
    expect(tokens.alvo.principal).toBe(56);
  });

  it('raio de 2 em tudo e movimento até 200 ms', () => {
    expect(tokens.raio).toBe(2);
    expect(tokens.movimentoMs).toBeLessThanOrEqual(200);
  });
});
