// O mascote no app é o pacote final, sem redesenho (DESIGN.md 8 e 13): cada arte copiada é igual à de
// design/mascote/final/vetor/claro e o componente desenha exatamente esses bytes.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { ARTES } from '../componentes/mascote/artes';

const RAIZ = path.resolve(__dirname, '..', '..', '..', '..');
// O git guarda as artes com LF; no Windows a cópia de trabalho pode vir com CRLF.
const ler = (...partes: string[]) => fs.readFileSync(path.join(RAIZ, ...partes), 'utf8').replaceAll('\r\n', '\n');

describe('mascote: artes do pacote final, sem mudança', () => {
  it('só as artes que o Rumo usa (decisão sobre a pergunta 2): principal, ícone e as três poses', () => {
    expect(Object.keys(ARTES).sort()).toEqual(['icone', 'pose-alerta', 'pose-camping', 'pose-comemorando', 'principal']);
    const arquivos = fs.readdirSync(path.join(RAIZ, 'apps', 'mobile', 'assets', 'mascote')).filter((f) => f.endsWith('.svg'));
    expect(arquivos.sort()).toEqual(Object.keys(ARTES).map((n) => `${n}.svg`).sort());
  });

  for (const nome of ['principal', 'icone', 'pose-alerta', 'pose-camping', 'pose-comemorando'] as const) {
    it(`${nome}: cópia igual ao pacote final e desenhada sem mudança`, () => {
      const final = ler('design', 'mascote', 'final', 'vetor', 'claro', `${nome}.svg`);
      const copia = ler('apps', 'mobile', 'assets', 'mascote', `${nome}.svg`);
      expect(copia).toBe(final);
      expect(ARTES[nome]).toBe(copia);
    });
  }

  it('o gorro continua no verde-azulado fixo #3EA8AE (pergunta 1) e nenhuma arte usa cor da interface', () => {
    expect(ARTES.principal.toUpperCase()).toContain('#3EA8AE');
    for (const svg of Object.values(ARTES)) expect(svg).not.toMatch(/currentColor|var\(--/);
  });
});
