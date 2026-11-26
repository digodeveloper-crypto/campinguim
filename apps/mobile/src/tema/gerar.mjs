// Gera os derivados da identidade a partir das fontes únicas (B2):
//   1. o bloco de cores de apps/web/src/estilos.css, a partir de src/tema/tokens.json;
//   2. src/componentes/mascote/artes.ts, com o texto exato das artes de assets/mascote/*.svg.
// Uso, na raiz:  node apps/mobile/src/tema/gerar.mjs            (grava)
//                node apps/mobile/src/tema/gerar.mjs --conferir (só confere; sai com 1 se algo estiver velho)
// O teste do tema faz a mesma conferência dentro do `npm run testar`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { aplicarBloco, cssDosTokens } from './css.ts';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(AQUI, '..', '..');
const RAIZ = path.resolve(APP, '..', '..');
const CSS_WEB = path.join(RAIZ, 'apps', 'web', 'src', 'estilos.css');
const PASTA_MASCOTE = path.join(APP, 'assets', 'mascote');
const ARTES = path.join(APP, 'src', 'componentes', 'mascote', 'artes.ts');

export const NOMES_ARTES = ['principal', 'icone', 'pose-alerta', 'pose-camping', 'pose-comemorando'];

export function artesTs() {
  const linhas = NOMES_ARTES.map((nome) => {
    // O git guarda as artes com LF; no Windows a cópia de trabalho pode vir com CRLF.
    const svg = fs.readFileSync(path.join(PASTA_MASCOTE, `${nome}.svg`), 'utf8').replaceAll('\r\n', '\n');
    return `  '${nome}': ${JSON.stringify(svg)},`;
  });
  return [
    '// GERADO por apps/mobile/src/tema/gerar.mjs a partir de apps/mobile/assets/mascote/*.svg. Não edite à mão.',
    '// Texto exato de cada arte do pacote final do mascote (sem redesenho; o teste do tema confere os bytes).',
    'export const ARTES = {',
    ...linhas,
    '} as const;',
    '',
    'export type NomeArte = keyof typeof ARTES;',
    '',
  ].join('\n');
}

const conferir = process.argv.includes('--conferir');
const tokens = JSON.parse(fs.readFileSync(path.join(AQUI, 'tokens.json'), 'utf8'));
const saidas = [
  [CSS_WEB, aplicarBloco(fs.readFileSync(CSS_WEB, 'utf8'), cssDosTokens(tokens))],
  [ARTES, artesTs()],
];

let velhos = 0;
for (const [arquivo, conteudo] of saidas) {
  const atual = fs.existsSync(arquivo) ? fs.readFileSync(arquivo, 'utf8') : null;
  const relativo = path.relative(RAIZ, arquivo).replaceAll('\\', '/');
  if (atual === conteudo) {
    console.log(`em dia: ${relativo}`);
  } else if (conferir) {
    velhos += 1;
    console.log(`DESATUALIZADO: ${relativo}`);
  } else {
    fs.mkdirSync(path.dirname(arquivo), { recursive: true });
    fs.writeFileSync(arquivo, conteudo);
    console.log(`gravado: ${relativo}`);
  }
}
process.exitCode = velhos ? 1 : 0;
