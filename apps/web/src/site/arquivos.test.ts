// Arquivos e regras fixas da página (feature 1.12): cópias da arte do mascote e da fonte iguais às
// de origem; página fora dos buscadores enquanto o endereço é provisório; nada guardado no
// navegador; nenhum endereço escrito no código da página.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const ler = (rel: string) => fs.readFileSync(path.join(RAIZ, rel));

function arquivosDe(pasta: string): string[] {
  return fs.readdirSync(path.join(RAIZ, pasta), { withFileTypes: true }).flatMap((e) => {
    const rel = `${pasta}/${e.name}`;
    return e.isDirectory() ? arquivosDe(rel) : [rel];
  });
}

describe('cópias', () => {
  it('a arte do mascote é a mesma do app (pacote final, sem redesenho)', () => {
    expect(ler('apps/web/public/mascote/principal.svg').equals(ler('apps/mobile/assets/mascote/principal.svg'))).toBe(true);
  });

  it('a fonte Archivo e a licença OFL são as da pasta de origem', () => {
    const origem = 'design/prototipos/_compartilhado/fontes/archivo';
    expect(ler('apps/web/public/fontes/archivo/Archivo-variavel.ttf').equals(ler(`${origem}/Archivo-variavel.ttf`))).toBe(true);
    expect(ler('apps/web/public/fontes/archivo/OFL.txt').equals(ler(`${origem}/OFL.txt`))).toBe(true);
  });
});

describe('regras fixas da página', () => {
  it('fica fora dos buscadores (noindex, nofollow) e não tem mapa do site nem robots.txt (endereço provisório)', () => {
    const html = ler('apps/web/index.html').toString('utf8');
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow" \/>/);
    const publicos = arquivosDe('apps/web/public');
    expect(publicos.filter((a) => /sitemap|robots\.txt/i.test(a))).toEqual([]);
  });

  it('nada é guardado no navegador: nenhum localStorage, sessionStorage, IndexedDB nem cookie no código', () => {
    const codigo = arquivosDe('apps/web/src')
      .filter((a) => /\.tsx?$/.test(a) && !a.endsWith('.test.ts'))
      .map((a) => ler(a).toString('utf8'))
      .join('\n');
    expect(codigo).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
  });

  it('o código da página não traz endereço escrito: só monta a partir de config/enderecos.json', () => {
    for (const a of arquivosDe('apps/web/src').filter((x) => /\.tsx?$/.test(x) && !x.endsWith('.test.ts'))) {
      expect(ler(a).toString('utf8'), a).not.toMatch(/https?:\/\/[a-z0-9]|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|:543\d\d/i);
    }
  });
});
