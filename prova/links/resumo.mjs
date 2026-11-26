// Resumo das execuções de links (F0-4): lê caso-*/resultados.json e imprime a tabela.
//   node prova/links/resumo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = path.join(RAIZ, 'docs', 'prova-tecnica', 'evidencias', 'F0-4');
const med = (v) => {
  const o = [...v].sort((a, b) => a - b);
  return o.length ? (o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2) : null;
};
const fmt = (v) => (v.length ? `${Math.round(med(v))} / ${Math.max(...v)}` : '—');
console.log('| Caso | Execuções | Certas | Quebrou | A frio: tempo até a tela, mediana / pior (ms) | Com o app vivo: mediana / pior (ms) |');
console.log('| --- | --- | --- | --- | --- | --- |');
for (const pasta of fs.readdirSync(EVID).filter((p) => p.startsWith('caso-') && fs.existsSync(path.join(EVID, p, 'resultados.json'))).sort()) {
  const r = JSON.parse(fs.readFileSync(path.join(EVID, pasta, 'resultados.json'), 'utf8'));
  if (!r[0] || r[0].certo === undefined) continue;
  const frio = r.filter((x) => x.estado_inicial === 'fechado' && x.toque_ate_tela_ms != null).map((x) => x.toque_ate_tela_ms);
  const vivo = r.filter((x) => x.estado_inicial !== 'fechado' && x.toque_ate_tela_ms != null).map((x) => x.toque_ate_tela_ms);
  console.log(`| ${pasta.replace('caso-', '')} | ${r.length} | ${r.filter((x) => x.certo).length} | ${r.filter((x) => x.quebrou).length} | ${fmt(frio)} | ${fmt(vivo)} |`);
}
