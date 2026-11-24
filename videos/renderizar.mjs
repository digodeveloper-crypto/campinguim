// composição: variável COMP (padrão Prova; ProvaMascote para o plano com o mascote)
// uso: node renderizar.mjs quadros <pasta> <frame...>   |   node renderizar.mjs video <arquivo.mp4> [escala]
// Empacota uma vez só e renderiza com o renderizador gráfico "angle" (TECNICA-3D.md, seções 3 e 11).
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [modo, destino, ...resto] = process.argv.slice(2);
// O GLB do mascote vem SEMPRE da fonte aprovada (design/ é só leitura), copiado no início de cada render:
// public/modelos/ não é versionado, e uma cópia velha nunca entra no vídeo. O SHA-256 usado sai na tela.
const glbFonte = path.resolve('../design/mascote/3d/campinguim.glb');
const glbCopia = path.resolve('public/modelos/campinguim.glb');
fs.mkdirSync(path.dirname(glbCopia), {recursive: true});
fs.copyFileSync(glbFonte, glbCopia);
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const [shaFonte, shaCopia] = [sha(glbFonte), sha(glbCopia)];
if (shaFonte !== shaCopia) throw new Error(`cópia do GLB difere da fonte: ${shaCopia} != ${shaFonte}`);
console.log(`GLB do mascote: ${glbCopia} <- ${glbFonte} (${fs.statSync(glbCopia).size} bytes) SHA-256 ${shaCopia}`);
const chromiumOptions = {gl: 'angle'};
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
try {
  const comp = await selectComposition({serveUrl, id: process.env.COMP ?? 'Prova', chromiumOptions});
  if (modo === 'quadros') {
    fs.mkdirSync(destino, {recursive: true});
    for (const f of resto) {
      await renderStill({serveUrl, composition: comp, frame: Number(f), output: path.join(destino, `q${String(f).padStart(3, '0')}.png`), chromiumOptions});
      console.log('ok', f);
    }
  } else {
    const scale = Number(resto[0] ?? 1);
    fs.mkdirSync(path.dirname(destino), {recursive: true});
    await renderMedia({serveUrl, composition: comp, codec: 'h264', outputLocation: destino, chromiumOptions, scale, crf: scale < 1 ? 28 : 16, audioCodec: 'aac', pixelFormat: 'yuv420p'});
    console.log('video ok', destino);
  }
} finally {
  fs.rmSync(serveUrl, {recursive: true, force: true});
}
