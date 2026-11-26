// Gera as tabelas de resultado da F0-2 a partir de docs/prova-tecnica/evidencias/F0-2/execucoes.jsonl
// (e das medidas online). Uso: node prova/e2e/sincronizacao/resumo.mjs [--rodada r1]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCIAS = path.resolve(AQUI, '..', '..', '..', 'docs', 'prova-tecnica', 'evidencias', 'F0-2');
const i = process.argv.indexOf('--rodada');
const rodada = i > 0 ? process.argv[i + 1] : null;

const execucoes = fs
  .readFileSync(path.join(EVIDENCIAS, 'execucoes.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => JSON.parse(l))
  .filter((e) => !rodada || e.rodada === rodada);

const ORDEM = ['P1', 'P2', 'P3', 'P3b', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'];
const s = (ms) => (ms == null ? '—' : `${(ms / 1000).toFixed(1)} s`);
const mediana = (xs) => {
  const v = [...xs].sort((a, b) => a - b);
  return v.length ? v[Math.floor((v.length - 1) / 2)] : null;
};

const linhas = [];
let totalValidas = 0;
let totalOk = 0;
let totalRefeitas = 0;
let totalTentativas = 0;
for (const id of ORDEM) {
  const doCenario = execucoes.filter((e) => e.cenario === id);
  if (!doCenario.length) continue;
  const validas = doCenario.filter((e) => e.resultado !== 'refeita');
  const ok = validas.filter((e) => e.resultado === 'ok');
  const refeitas = doCenario.length - validas.length;
  const tempos = validas.map((e) => e.convergenciaDesdeAppMs ?? e.convergenciaDesdeRedeMs ?? e.convergenciaMs).filter((x) => x != null);
  const desdeAviao = validas.map((e) => e.convergenciaMs).filter((x) => x != null);
  // Plano, D, F0-2: 2 min só para o P7; todos os outros (inclusive o P8), 30 s.
  const limite = id === 'P7' ? 120_000 : 30_000;
  const acima = tempos.filter((x) => x > limite).length;
  const acimaDesdeAviao = desdeAviao.filter((x) => x > limite).length;
  totalTentativas += doCenario.length;
  totalRefeitas += refeitas;
  if (id !== 'P3b') {
    totalValidas += validas.length;
    totalOk += ok.length;
  }
  linhas.push(
    `| ${id} | ${doCenario[0].base} | ${doCenario.length} | ${validas.length} | ${ok.length} | ${validas.length - ok.length} | ${refeitas} | ${s(mediana(tempos))} | ${s(tempos.length ? Math.max(...tempos) : null)} | ${acima} | ${s(mediana(desdeAviao))} | ${s(desdeAviao.length ? Math.max(...desdeAviao) : null)} | ${acimaDesdeAviao} |`,
  );
}

const saida = [];
saida.push(`# F0-2 · tabelas de resultado${rodada ? ` (${rodada})` : ''}`);
saida.push('');
saida.push(`Gerado por \`prova/e2e/sincronizacao/resumo.mjs\` em ${new Date().toISOString()} a partir de \`execucoes.jsonl\`.`);
saida.push('');
saida.push('Tentativas = todas as execuções, inclusive as refeitas por falha de roteiro. Válidas = tentativas menos as refeitas. Convergência = do momento em que o app do último aparelho reconectado volta a alcançar o servidor (registro "rede" do app) até servidor, A e B iguais e sem fila; no P10, do login. Limite do plano: 30 s (só o P7: 2 min). As três últimas colunas medem desde o (primeiro) comando que desliga o modo avião: incluem o tempo que o emulador leva para devolver a rede ao app e, no P8, o corte proposital da rede no meio do envio (ver resultado-F0-2.md).');
saida.push('');
saida.push('| Cenário | Base | Tentativas | Válidas | Sem perda | Com falha | Refeitas | Convergência (mediana) | Pior caso | Acima do limite | Desde o modo avião (mediana) | Desde o modo avião (pior) | Acima do limite desde o modo avião |');
saida.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
saida.push(...linhas);
saida.push('');
saida.push(`Total do plano (P1 a P10, sem P3b): **${totalOk} de ${totalValidas}** sem perda, sem duplicação e com os dois aparelhos iguais ao servidor.`);
saida.push(`Refeitas por falha de roteiro: **${totalRefeitas} de ${totalTentativas}** tentativas (${totalTentativas ? ((100 * totalRefeitas) / totalTentativas).toFixed(1) : 0} %; limite do plano: 10 %).`);
saida.push('');

const falhas = execucoes.filter((e) => e.resultado === 'falha' || e.resultado === 'erro');
if (falhas.length) {
  saida.push('## Execuções com falha');
  saida.push('');
  for (const f of falhas) saida.push(`- ${f.cenario} #${f.n} (${f.rodada}): ${(f.problemas ?? []).slice(0, 3).join(' / ')}`);
  saida.push('');
}
const refeitas = execucoes.filter((e) => e.resultado === 'refeita');
if (refeitas.length) {
  saida.push('## Execuções refeitas (falha de roteiro)');
  saida.push('');
  for (const f of refeitas) saida.push(`- ${f.cenario} #${f.n} (${f.rodada}): ${(f.problemas ?? [])[0]}`);
  saida.push('');
}

const medidas = fs.readdirSync(EVIDENCIAS).filter((f) => /^medida-online-.*\.json$/.test(f));
if (medidas.length) {
  saida.push('## Com os dois online: tempo até a alteração aparecer no outro aparelho');
  saida.push('');
  saida.push('| Medida | Alterações | Recebidas | Mediana | Pior caso | Acima de 5 s |');
  saida.push('| --- | --- | --- | --- | --- | --- |');
  for (const f of medidas) {
    const m = JSON.parse(fs.readFileSync(path.join(EVIDENCIAS, f), 'utf8'));
    saida.push(`| ${f.replace('.json', '')} | ${m.amostras} | ${m.recebidas} | ${s(m.medianaMs)} | ${s(m.piorMs)} | ${m.acimaDe5s} |`);
  }
  saida.push('');
}

const destino = path.join(EVIDENCIAS, `tabelas${rodada ? `-${rodada}` : ''}.md`);
fs.writeFileSync(destino, saida.join('\n'), 'utf8');
console.log(saida.join('\n'));
