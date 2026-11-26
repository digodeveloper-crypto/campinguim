import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buscarTexto,
  ehTextoPendente,
  listarChavesDeTexto,
  marcasDoTexto,
  SUFIXO_SINGULAR,
} from '@campinguim/core/formato';
import { describe, expect, it } from 'vitest';

import textosApp from './pt-BR.json';
import { t, textos } from './index';
import { chavesFaltantes, extrairUsos, listarArquivos, usosNosArquivos } from './varredura';
import textosWebJson from '../../../web/src/textos/pt-BR.json';
import { t as tWeb } from '../../../web/src/textos/index';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const DOC = fs.readFileSync(path.join(RAIZ, 'docs', 'textos-e-eventos.md'), 'utf8');

/** Código e roteiros que usam cada arquivo de textos. Os testes (`*.test.ts`) e a pasta de textos ficam de fora. */
const SUPERFICIES = [
  {
    nome: 'app',
    arvore: textosApp as unknown,
    pastas: ['apps/mobile/app', 'apps/mobile/src'],
    roteiros: ['e2e/jornadas'],
    specs: [] as string[],
    pastaDeTextos: 'apps/mobile/src/textos/',
  },
  {
    nome: 'página web',
    arvore: textosWebJson as unknown,
    pastas: ['apps/web/src'],
    roteiros: [] as string[],
    specs: ['e2e/web'],
    pastaDeTextos: 'apps/web/src/textos/',
  },
];

function arquivosDoCodigo(s: (typeof SUPERFICIES)[number]): string[] {
  return listarArquivos(RAIZ, [...s.pastas, ...s.specs], ['.ts', '.tsx'])
    .filter((a) => !a.startsWith(s.pastaDeTextos) && !/\.test\.tsx?$/.test(a));
}

describe.each(SUPERFICIES)('chaves usadas no código: $nome', (s) => {
  it('toda chave usada no código, nos roteiros e nos testes de tela existe no arquivo de textos', () => {
    const arquivos = [...arquivosDoCodigo(s), ...listarArquivos(RAIZ, s.roteiros, ['.yaml', '.yml'])];
    const usos = usosNosArquivos(RAIZ, arquivos);
    const faltando = chavesFaltantes(s.arvore, usos).map((u) => `${u.arquivo}:${u.linha} usa "${u.chave}", que não existe no arquivo de textos`);
    expect(faltando).toEqual([]);
  });

  it('a varredura de fato acha chaves (não passa por não ter olhado nada)', () => {
    const arquivos = [...arquivosDoCodigo(s), ...listarArquivos(RAIZ, s.roteiros, ['.yaml', '.yml'])];
    expect(usosNosArquivos(RAIZ, arquivos).length).toBeGreaterThan(0);
  });
});

describe('varredura: chave que falta é achada', () => {
  const arvore = { lista: { titulo: 'Lista', faltam: 'Faltam {n}' } };

  it('acha uma chave plantada que não existe, em cada forma de uso', () => {
    const codigo = [
      'const a = textos.lista.titulo;',
      'const b = textos.lista.inexistente;',
      "const c = t('lista.faltam', { n: 1 });",
      "const d = t('lista.plantada');",
      'const e = textos.naoExiste.chave;',
    ].join('\n');
    const faltando = chavesFaltantes(arvore, extrairUsos(codigo, 'apps/mobile/app/x.tsx'));
    expect(faltando.map((u) => [u.chave, u.linha])).toEqual([
      ['lista.inexistente', 2],
      ['lista.plantada', 4],
      ['naoExiste.chave', 5],
    ]);
  });

  it('acha marcador de roteiro do Maestro que não existe', () => {
    const yaml = 'appId: x\n---\n- assertVisible: "{{textos.lista.titulo}}"\n- assertVisible: "{{textos.lista.plantada}}"\n';
    const faltando = chavesFaltantes(arvore, extrairUsos(yaml, 'e2e/jornadas/j.yaml'));
    expect(faltando.map((u) => u.chave)).toEqual(['lista.plantada']);
  });

  it('chave que existe passa, inclusive o grupo inteiro e a propriedade do texto', () => {
    const codigo = "const g = textos.lista;\nconst n = textos.lista.titulo.length;\nconst x = t('lista.titulo');";
    expect(chavesFaltantes(arvore, extrairUsos(codigo, 'a.ts'))).toEqual([]);
  });

  it('não confunde com outras coisas: importação, caminho de arquivo e função que termina em t', () => {
    const codigo = "import { textos } from '../src/textos';\nimport j from './textos/pt-BR.json';\nassert('lista.nada');\nexpect(1).toBe(1);";
    expect(extrairUsos(codigo, 'a.ts')).toEqual([]);
  });
});

describe.each([
  { nome: 'app', arvore: textosApp as unknown },
  { nome: 'página web', arvore: textosWebJson as unknown },
])('arquivo de textos: $nome', ({ arvore }) => {
  const chaves = listarChavesDeTexto(arvore);

  it('tem textos, e todo valor é texto não vazio, sem espaço sobrando nas pontas', () => {
    expect(chaves.length).toBeGreaterThan(20);
    for (const chave of chaves) {
      const valor = buscarTexto(arvore, chave) ?? '';
      expect(valor.length, chave).toBeGreaterThan(0);
      expect(valor, chave).toBe(valor.trim());
    }
  });

  it('tom do DESIGN, seção 10: sem exclamação nos textos definidos', () => {
    for (const chave of chaves) {
      const valor = buscarTexto(arvore, chave) ?? '';
      if (!ehTextoPendente(valor)) expect(valor, chave).not.toContain('!');
    }
  });

  it('marcas {nome} bem formadas, e o singular (_um) pede as mesmas marcas do plural', () => {
    for (const chave of chaves) {
      const valor = buscarTexto(arvore, chave) ?? '';
      expect(valor.replace(/\{[A-Za-z][A-Za-z0-9_]*\}/g, ''), `${chave} tem chave solta ou mal escrita`).not.toMatch(/[{}]/);
      if (chave.endsWith(SUFIXO_SINGULAR)) {
        const base = chave.slice(0, -SUFIXO_SINGULAR.length);
        expect(buscarTexto(arvore, base), `${chave} existe sem a chave do plural ${base}`).toBeDefined();
        expect(marcasDoTexto(valor).sort(), chave).toEqual(marcasDoTexto(buscarTexto(arvore, base) ?? '').sort());
      }
    }
  });

  it('nenhum texto definido traz endereço de serviço, e-mail ou caminho de máquina', () => {
    for (const chave of chaves) {
      const valor = buscarTexto(arvore, chave) ?? '';
      if (ehTextoPendente(valor)) continue;
      expect(valor, chave).not.toMatch(/run\.app|pages\.dev|workers\.dev|https?:\/\/|@[a-z0-9-]+\.[a-z]|[A-Z]:\\/i);
    }
  });

  it('texto legal nunca é escrito pelo desenvolvimento: consentimento e privacidade ficam pendentes', () => {
    for (const chave of chaves) {
      if (/consentimento|privacidade|termosdeuso/i.test(chave)) {
        expect(ehTextoPendente(buscarTexto(arvore, chave) ?? ''), chave).toBe(true);
      }
    }
  });
});

describe('textos pendentes × docs/textos-e-eventos.md', () => {
  const trecho = (de: string, ate: string) => {
    const inicio = DOC.indexOf(de);
    expect(inicio, `o documento precisa ter a seção "${de}"`).toBeGreaterThanOrEqual(0);
    const fim = DOC.indexOf(ate, inicio + de.length);
    return DOC.slice(inicio, fim === -1 ? undefined : fim);
  };

  it.each([
    { nome: 'app', arvore: textosApp as unknown, de: '### Pendentes do app', ate: '### Pendentes da página web' },
    { nome: 'página web', arvore: textosWebJson as unknown, de: '### Pendentes da página web', ate: '\n## ' },
  ])('toda chave pendente do $nome está listada no documento, e só elas', ({ arvore, de, ate }) => {
    const pendentes = listarChavesDeTexto(arvore).filter((c) => ehTextoPendente(buscarTexto(arvore, c) ?? '')).sort();
    const listadas = [...trecho(de, ate).matchAll(/^\| `([A-Za-z][\w.]*)` \|/gm)].map((m) => m[1] ?? '').sort();
    expect(listadas).toEqual(pendentes);
  });
});

describe('palavras comuns ao app e à página (NF-09: um texto só)', () => {
  it('estados, categorias e nome do app são os mesmos nos dois arquivos', () => {
    for (const grupo of ['estados', 'categorias', 'app', 'mascote']) {
      const doApp = textosApp as unknown as Record<string, Record<string, string>>;
      const daWeb = textosWebJson as unknown as Record<string, Record<string, string>>;
      for (const [chave, valor] of Object.entries(daWeb[grupo] ?? {})) {
        expect(doApp[grupo]?.[chave], `${grupo}.${chave}`).toBe(valor);
      }
    }
  });
});

describe('acesso aos textos: t() do app e da página', () => {
  it('acesso direto e interpolação', () => {
    expect(textos.lista.titulo).toBe('Lista da viagem');
    expect(t('lista.titulo')).toBe('Lista da viagem');
    expect(t('estados.falado', { nome: 'Lanterna', quantidade: '2', estado: 'separei, fora do carro' })).toBe(
      'Lanterna, 2, separei, fora do carro',
    );
  });

  it('plural pela chave _um: 1 vai no singular, 0 e os demais no plural', () => {
    expect(t('lista.faltam', { n: 1 })).toBe('Falta 1 para o carro.');
    expect(t('lista.faltam', { n: 0 })).toBe('Faltam 0 para o carro.');
    expect(t('lista.faltam', { n: 5 })).toBe('Faltam 5 para o carro.');
    expect(t('avisoDeSaida.faltam', { n: 1 })).toBe('1 item separado ainda fora do carro.');
    expect(t('avisoDeSaida.faltam', { n: 3 })).toBe('3 itens separados ainda fora do carro.');
    expect(t('fato.confirmacoes', { n: 1 })).toBe('1 confirmação');
    expect(t('fato.confirmacoes', { n: 7 })).toBe('7 confirmações');
    expect(tWeb('site.itens', { n: 1 })).toBe('1 item');
    expect(tWeb('site.itens', { n: 12 })).toBe('12 itens');
  });

  it('chave sem plural próprio ignora o n; marca sem valor é erro', () => {
    expect(t('lista.filtro', { filtro: 'a separar', n: 1 })).toBe('a separar · 1');
    expect(t('gastos.cotas', { n: 1 })).toBe('1 cota');
    expect(() => t('lista.faltam')).toThrow(/sem valor para \{n\}/);
    expect(() => t('lista.faltam', { x: 1 })).toThrow(/sem valor para \{n\}/);
  });

  it('chave que não existe é erro (para quem passar por cima do TypeScript)', () => {
    // @ts-expect-error chave que não existe no arquivo de textos
    expect(() => t('lista.plantada')).toThrow(/sem chave no arquivo de textos: lista\.plantada/);
    // @ts-expect-error grupo não é texto
    expect(() => t('lista')).toThrow(/sem chave/);
  });

  it('a tela provisória da B1 continua com os mesmos textos (roteiro de fumaça do Maestro)', () => {
    expect(textos.telaProvisoria.titulo).toBe('Campinguim');
    expect(textos.telaProvisoria.subtitulo).toBe('O app está em construção.');
  });

  it('a regra de grupo do SPEC, seção 7: "N entraram, M saíram"', () => {
    expect(t('lista.mudancaDaResposta', { entraram: 3, sairam: 2 })).toBe('3 entraram, 2 saíram');
  });
});
