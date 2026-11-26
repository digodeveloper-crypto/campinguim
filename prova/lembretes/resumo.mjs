// Resume os resultados da F0-3 em uma tabela. Uso: node prova/lembretes/resumo.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = path.join(RAIZ, 'docs', 'prova-tecnica', 'evidencias', 'F0-3');

const mediana = (v) => {
  const o = [...v].sort((x, y) => x - y);
  const m = Math.floor(o.length / 2);
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};
const fmt = (n) => (n === undefined || Number.isNaN(n) ? '—' : `${Math.round(n * 10) / 10} s`);

const casos = [
  ['a', 'app fechado pela lista de recentes'],
  ['b', 'app em segundo plano'],
  ['c', 'aparelho reiniciado entre o agendamento e o horário'],
  ['d', 'permissão de aviso negada'],
  ['e', 'sem alarme exato (relógio adiantado)'],
  ['e-real', 'sem alarme exato (tempo real)'],
  ['f', '"forçar parada"'],
];
const linhas = ['| Caso | O que testa | Execuções | Aviso chegou | Tocar abre a viagem | Atraso (mediana / pior) |', '| --- | --- | --- | --- | --- | --- |'];
for (const [id, nome] of casos) {
  const arq = path.join(EVID, `caso-${id}`, 'resultados.json');
  if (!fs.existsSync(arq)) continue;
  const r = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const atrasos = r.map((x) => x.atraso_s).filter((x) => typeof x === 'number');
  linhas.push(
    `| ${id} | ${nome} | ${r.length} | ${
      ['d', 'f'].includes(id) ? `não chegou em ${r.filter((x) => x.aviso_apareceu === false).length} de ${r.length} (esperado)` : `${r.filter((x) => x.aviso_chegou).length} de ${r.length}`
    } | ${
      id === 'd' ? `sem quebra em ${r.filter((x) => x.ok).length} de ${r.length}` : ['e-real', 'f'].includes(id) ? '—' : `${r.filter((x) => x.tocar_no_aviso_abre_a_viagem).length} de ${r.length}`
    } | ${
      atrasos.length ? `${fmt(mediana(atrasos))} / ${fmt(Math.max(...atrasos))}` : '—'
    } |`,
  );
}
console.log(linhas.join('\n'));
