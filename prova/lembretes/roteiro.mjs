// Roteiro de lembretes (F0-3). Uso, sempre com o Node do sistema:
//   node prova/lembretes/roteiro.mjs <caso> [execucoes] [--minutos=N] [--video] [--espera=S] [--sufixo=X]
// Casos: a (app fechado pela lista de recentes), b (app em segundo plano), c (aparelho reiniciado),
//        d (permissão de aviso negada), e (sem alarme exato), f (forçar parada).
// Fala só com o emulador campinguim-c (emulator-5558). Resultados em
// docs/prova-tecnica/evidencias/F0-3/caso-<caso>/ (ou em EVIDENCIAS_DIR, como no roteiro de links;
// a fumaça da junção usa isso para não tocar nas evidências aprovadas).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as A from './aparelho.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = process.env.EVIDENCIAS_DIR ?? path.join(RAIZ, 'docs', 'prova-tecnica', 'evidencias', 'F0-3');
const VIAGEM = '1f0a0b00-0000-4000-8000-0000000000c3';
const ADIANTO_S = 60; // o relógio vai para 60 s depois do horário do lembrete
const LIMITE_S = 60; // aceite: aviso em até 60 s depois do relógio adiantado

const [, , caso, nExec = '10', ...resto] = process.argv;
const opcoes = Object.fromEntries(
  resto.map((r) => r.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]),
);
const minutos = Number(opcoes.minutos ?? 30);
const pasta = path.join(EVID, `caso-${caso}${opcoes.sufixo ? '-' + opcoes.sufixo : ''}`);
fs.mkdirSync(pasta, { recursive: true });

const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);
const gravar = (nome, texto) => fs.writeFileSync(path.join(pasta, nome), texto);
const captura = (nome) =>
  fs.writeFileSync(path.join(pasta, nome), A.adbBinario(['exec-out', 'screencap', '-p']));

// Tira as linhas binárias do pedido do Expo, que só poluem a evidência.
const limparDump = (txt) =>
  txt
    .split('\n')
    .filter((l) => !/^\s*\[\d+\]\s+-?\d+\s*$/.test(l))
    .join('\n');

// Estado limpo antes de cada execução: rede e relógio normais, nenhum lembrete velho guardado
// (execuções interrompidas deixam pedidos no armazenamento do Expo) e o app parado.
async function prepararBase() {
  A.modoAviao(false);
  A.sincronizarRelogioComComputador();
  A.abrirLink('campinguim://lembretes');
  const botao = await A.esperarNaTela((n) => n.id === 'cancelar', { ms: 20_000 });
  if (botao) {
    A.tocarNo(botao.no);
    await A.dormir(1200);
  }
  A.forcarParada();
  await A.dormir(500);
}

async function agendar(min = minutos) {
  A.sh('logcat -c');
  A.abrirLink(`campinguim://lembretes?agendar=1&minutos=${min}`);
  const fim = Date.now() + 25_000;
  while (Date.now() < fim) {
    const l = A.sh('logcat -d -s ReactNativeJS').match(/LEMBRETE_AGENDADO epoch_ms=(\d+)/);
    if (l) return Number(l[1]);
    await A.dormir(700);
  }
  // O registro do aparelho às vezes atrasa com a máquina ocupada: lê o horário no alarme do sistema.
  const horarios = [...trechoDoAlarme().matchAll(/origWhen (\d+)/g)].map((m) => Number(m[1]));
  if (horarios.length) return Math.max(...horarios);
  throw new Error('o app não registrou o agendamento');
}

function trechoDoAlarme() {
  const linhas = A.sh('dumpsys alarm', { tempoMax: 60_000 }).split('\n');
  const achadas = [];
  linhas.forEach((l, i) => {
    if (/Alarm\{[0-9a-f]+ type \d+ origWhen \d+ whenElapsed \d+ com\.campinguim\.prova\}/.test(l)) {
      achadas.push(linhas.slice(i, i + 6).join('\n'));
    }
  });
  return achadas.join('\n---\n');
}

// Fecha o app como uma pessoa: abre a lista de recentes e desliza o cartão para cima. Se o
// deslize não pegar em 2 tentativas (o emulador às vezes ignora o gesto na lista de recentes),
// remove a tarefa pelo sistema (`cmd activity stack remove`), que é a mesma operação que o
// deslize dispara: mata o app e mantém os alarmes. Nunca usa "forçar parada" nem "am kill".
// Devolve como fechou (ou null se não fechou); o método fica registrado em cada execução.
async function fecharPelaListaDeRecentes() {
  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    A.voltarParaInicio();
    await A.dormir(1500);
    A.sh('input keyevent KEYCODE_APP_SWITCH');
    await A.dormir(2500);
    A.sh('input swipe 540 1300 540 150 250');
    await A.dormir(2000);
    if (A.pidDoApp() === '') return 'deslizar o cartão na lista de recentes';
  }
  A.voltarParaInicio();
  await A.dormir(1500);
  const lista = A.sh('cmd activity stack list');
  const bloco = lista.split(/\n(?=RootTask)/).find((b) => b.includes('com.campinguim.prova'));
  const id = /RootTask id=(\d+)/.exec(bloco ?? '')?.[1];
  if (id) {
    A.sh(`cmd activity stack remove ${id}`);
    await A.dormir(2000);
    if (A.pidDoApp() === '') return 'remover a tarefa pelo sistema (mesma operação do deslize)';
  }
  return null;
}

async function esperarBoot() {
  A.adb(['wait-for-device'], { tentativas: 5, tempoMax: 240_000 });
  for (let i = 0; i < 90; i++) {
    try {
      if (A.sh('getprop sys.boot_completed', { tentativas: 1, tempoMax: 8000 }).trim() === '1') break;
    } catch {}
    await A.dormir(3000);
  }
  try {
    A.adb(['root'], { tentativas: 3 });
  } catch {}
  A.adb(['wait-for-device'], { tentativas: 5, tempoMax: 120_000 });
  await A.dormir(8000); // deixa o sistema assentar e o Expo reagendar
}

async function esperarAviso(maxS) {
  const fim = Date.now() + maxS * 1000;
  while (Date.now() < fim) {
    const dump = A.dumpAvisos();
    const bloco = A.avisoDoApp(dump);
    if (bloco) {
      const w = /when=(\d+)/.exec(bloco);
      return { dump, bloco, quando: w ? Number(w[1]) : null };
    }
    await A.dormir(1200);
  }
  return null;
}

async function tocarNoAviso(arquivoDaBarra = null) {
  // A barra de avisos às vezes não abre se o pedido vem enquanto outra animação roda: tenta de novo.
  let r = null;
  for (let tentativa = 1; tentativa <= 4 && !r; tentativa++) {
    A.sh('cmd statusbar expand-notifications');
    await A.dormir(1800);
    r = await A.esperarNaTela((n) => n.texto.includes('lanternas'), { ms: 4_000 });
    if (!r) {
      A.sh('cmd statusbar collapse');
      await A.dormir(1500);
    }
  }
  if (!r) {
    captura(`falha-sem-aviso-na-barra-${Date.now()}.png`);
    return { achou: false, abriu: false };
  }
  // Só fotografa a barra depois de ver o aviso nela (a árvore da tela já tem o texto do aviso).
  if (arquivoDaBarra) {
    await A.dormir(600);
    captura(arquivoDaBarra);
  }
  A.tocarNo(r.no);
  const tela = await A.esperarNaTela((n) => n.id === 'viagem-id', { ms: 15_000 });
  const idNaTela = tela ? A.achar(tela.xml, (n) => n.id === 'viagem-id')?.texto : null;
  if (!tela) {
    captura(`falha-toque-nao-abriu-${Date.now()}.png`);
    const textos = (A.arvoreDaTela().match(/text="[^"]+"/g) ?? []).slice(0, 12).join(' | ');
    return { achou: true, abriu: false, idNaTela, tela_no_lugar: textos };
  }
  return { achou: true, abriu: idNaTela === VIAGEM, idNaTela };
}

// ------------------------------------------------------------------------------------------------
async function execucaoComAviso(i, variante) {
  const r = { caso, execucao: i, minutos };
  await prepararBase();
  const trigger = await agendar();
  r.horario_do_lembrete = new Date(trigger).toISOString();
  r.trigger_ms = trigger;
  const alarme = trechoDoAlarme();
  if (i === 1) gravar('alarme-agendado.txt', alarme);
  r.tipo_do_alarme = /exactAllowReason=(\S+)/.exec(alarme)?.[1] ?? null;
  r.janela_do_alarme = /window=(\S+)/.exec(alarme)?.[1] ?? null;

  if (variante === 'a') {
    const comoFechou = await fecharPelaListaDeRecentes();
    r.app_fechado = comoFechou !== null;
    r.como_fechou = comoFechou;
    if (!r.app_fechado) throw new Error('o app não fechou pela lista de recentes');
  } else if (variante === 'b') {
    A.voltarParaInicio();
    await A.dormir(1500);
    r.app_em_segundo_plano = A.pidDoApp() !== '';
  } else if (variante === 'c') {
    A.voltarParaInicio();
    await A.dormir(1000);
    A.modoAviao(true);
    A.adb(['reboot']);
    await A.dormir(10_000);
    await esperarBoot();
    r.reiniciou = true;
    // O Expo reagenda os lembretes quando o sistema avisa que ligou (BOOT_COMPLETED). Isso leva
    // dezenas de segundos depois do boot. O relógio só adianta depois, como no uso real, em que
    // o horário do lembrete vem horas depois de o aparelho ligar.
    const inicio = Date.now();
    let depois = '';
    while (Date.now() - inicio < 240_000) {
      depois = trechoDoAlarme();
      if (depois.includes('com.campinguim.prova')) break;
      await A.dormir(4000);
    }
    r.alarme_depois_do_boot = depois.includes('com.campinguim.prova');
    r.segundos_ate_o_alarme_voltar = Math.round((Date.now() - inicio) / 1000);
    if (i === 1) gravar('alarme-depois-do-reinicio.txt', depois);
    if (!r.alarme_depois_do_boot) {
      r.ok = false;
      r.observacao = 'o alarme não voltou em 240 s depois do reinício';
      return r;
    }
  }

  const gravacao = opcoes.video && i === 1 ? A.gravarTela('/sdcard/caso-a.mp4', 150) : null;
  A.modoAviao(true);
  await A.dormir(1200);
  r.aviao_ligado = A.modoAviaoLigado();
  const t0 = Math.floor(trigger / 1000) + ADIANTO_S;
  A.definirRelogio(t0);
  r.relogio_adiantado_para_ms = t0 * 1000;

  const aviso = await esperarAviso(Number(opcoes.espera ?? 120));
  if (!aviso) {
    r.aviso_chegou = false;
    r.ok = false;
    r.observacao = `nenhum aviso em ${opcoes.espera ?? 120} s`;
  } else {
    r.aviso_chegou = true;
    r.aviso_postado_ms = aviso.quando;
    r.atraso_s = Math.round(((aviso.quando - t0 * 1000) / 1000) * 10) / 10;
    r.aviao_no_momento_do_aviso = A.modoAviaoLigado();
    if (i === 1) {
      gravar('dumpsys-notification.txt', limparDump(aviso.bloco));
      gravar('modo-aviao.txt', `airplane_mode_on=${A.sh('settings get global airplane_mode_on').trim()}\n`);
    }
    const toque = await tocarNoAviso(i === 1 ? 'barra-de-avisos.png' : null);
    r.aviso_achado_na_barra = toque.achou;
    r.tela_no_lugar_da_viagem = toque.tela_no_lugar;
    r.tocar_no_aviso_abre_a_viagem = toque.abriu;
    r.id_na_tela = toque.idNaTela;
    if (i === 1 && toque.abriu) captura('tela-da-viagem.png');
    r.ok =
      r.atraso_s <= LIMITE_S &&
      r.aviao_ligado &&
      r.aviao_no_momento_do_aviso &&
      toque.abriu &&
      (variante !== 'a' || r.app_fechado) &&
      (variante !== 'b' || r.app_em_segundo_plano) &&
      (variante !== 'c' || r.alarme_depois_do_boot);
  }
  if (gravacao) {
    await A.dormir(1500);
    A.sh('pkill -2 screenrecord || true');
    await A.dormir(2500);
    gravacao.kill();
    fs.writeFileSync(path.join(pasta, 'caso-a.mp4'), A.adbBinario(['exec-out', 'cat', '/sdcard/caso-a.mp4']));
    A.sh('rm -f /sdcard/caso-a.mp4');
  }
  A.voltarParaInicio();
  return r;
}

// Quebras do próprio app no registro do aparelho (não conta erros de outros processos).
function quebrasDoApp() {
  const t = A.sh('logcat -d -b crash,main -v brief');
  const quebras = t.match(/FATAL EXCEPTION[^\n]*\n[^\n]*Process: com\.campinguim\.prova/g) ?? [];
  const anr = t.match(/ANR in com\.campinguim\.prova/g) ?? [];
  return quebras.length + anr.length;
}

// Toca num botão do app e repete se o app ainda não estava pronto para o toque.
async function tocarBotao(id, deuCerto, tentativas = 4) {
  for (let i = 0; i < tentativas; i++) {
    const n = A.achar(A.arvoreDaTela(), (x) => x.id === id);
    if (n) A.tocarNo(n);
    if (await deuCerto()) return true;
  }
  return false;
}

async function casoD(i) {
  const r = { caso: 'd', execucao: i, minutos };
  await prepararBase();
  if (i === 1) {
    A.sh(`pm clear ${A.PACOTE}`);
    r.como_negou = 'tela do sistema (Não permitir), primeira vez';
    A.abrirLink('campinguim://lembretes');
    await A.esperarNaTela((n) => n.id === 'pedir-aviso', { ms: 20_000 });
    await A.dormir(4000); // o app precisa assentar antes de aceitar o toque
    let d = null;
    const abriu = await tocarBotao('pedir-aviso', async () => {
      d = await A.esperarNaTela((n) => n.id.endsWith('permission_deny_button'), { ms: 8_000 });
      return Boolean(d);
    });
    if (!abriu) throw new Error('o pedido do sistema não apareceu');
    captura('pedido-do-sistema.png');
    A.tocarNo(d.no);
    await A.dormir(1500);
  } else {
    A.sh(`pm revoke ${A.PACOTE} android.permission.POST_NOTIFICATIONS`);
    r.como_negou = 'pm revoke (permissão negada)';
    A.abrirLink('campinguim://lembretes');
    await A.dormir(2500);
  }
  const tela1 = await A.esperarNaTela((n) => n.id === 'avisos-desligados', { ms: 15_000 });
  r.mensagem_de_avisos_desligados = Boolean(tela1);
  await A.dormir(3000);
  A.sh('logcat -c');
  const agendou = await tocarBotao('agendar', async () => {
    await A.dormir(2500);
    return A.achar(A.arvoreDaTela(), (n) => n.id === 'agendados')?.texto === '1';
  });
  const t = A.arvoreDaTela();
  r.agendados_na_tela = A.achar(t, (n) => n.id === 'agendados')?.texto;
  r.agendou_com_a_permissao_negada = agendou;
  r.app_respondendo = Boolean(A.achar(t, (n) => n.id === 'cancelar'));
  r.quebras_no_registro = quebrasDoApp();
  if (i === 1) captura('tela-avisos-desligados.png');
  const gatilho = Number(/LEMBRETE_AGENDADO epoch_ms=(\d+)/.exec(A.sh('logcat -d -s ReactNativeJS'))?.[1] ?? 0);
  if (gatilho) {
    A.modoAviao(true);
    A.definirRelogio(Math.floor(gatilho / 1000) + ADIANTO_S);
    await A.dormir(15_000);
    r.aviso_apareceu = A.avisoDoApp(A.dumpAvisos()) !== null;
    r.app_ainda_respondendo = Boolean(A.achar(A.arvoreDaTela(), (n) => n.id === 'cancelar'));
    r.quebras_no_registro += quebrasDoApp();
  } else {
    r.observacao = 'o app não registrou o horário do agendamento';
  }
  r.ok =
    r.quebras_no_registro === 0 &&
    r.app_respondendo &&
    r.mensagem_de_avisos_desligados &&
    agendou &&
    r.aviso_apareceu === false &&
    r.app_ainda_respondendo;
  A.voltarParaInicio();
  return r;
}

async function casoF(i) {
  const r = { caso: 'f', execucao: i, minutos };
  await prepararBase();
  const trigger = await agendar();
  r.alarme_antes = trechoDoAlarme().includes('com.campinguim.prova');
  A.forcarParada();
  await A.dormir(1500);
  r.alarme_depois_de_forcar_parada = trechoDoAlarme().includes('com.campinguim.prova');
  if (i === 1) {
    gravar(
      'alarme-antes-e-depois.txt',
      `alarme do app antes de forcar parada: ${r.alarme_antes}\nalarme do app depois: ${r.alarme_depois_de_forcar_parada}\n`,
    );
  }
  A.modoAviao(true);
  A.definirRelogio(Math.floor(trigger / 1000) + ADIANTO_S);
  await A.dormir(20_000);
  r.aviso_apareceu = A.avisoDoApp(A.dumpAvisos()) !== null;
  r.ok = r.aviso_apareceu === false; // esperado do sistema: a parada forçada cancelou o lembrete
  return r;
}

// Medição complementar do caso (e), em tempo real e sem mexer no relógio: 5 lembretes com
// antecedências de 5 a 9 minutos, sem alarme exato, app fechado, modo avião ligado. O atraso de
// cada um é o horário em que o aviso apareceu menos o horário agendado.
async function casoEmTempoReal() {
  const resultados = [];
  A.sh(`cmd appops set --uid ${A.PACOTE} SCHEDULE_EXACT_ALARM deny`);
  try {
    await prepararBase();
    for (const lead of [5, 6, 7, 8, 9]) {
      await agendar(lead);
      await fecharPelaListaDeRecentes(); // app fechado de verdade entre um agendamento e o outro
    }
    const alarmes = trechoDoAlarme();
    gravar('alarmes-agendados.txt', alarmes);
    const gatilhos = [...alarmes.matchAll(/origWhen (\d+)/g)].map((m) => Number(m[1]));
    if (gatilhos.length !== 5) throw new Error(`esperava 5 alarmes, achei ${gatilhos.length}`);
    const fechou = await fecharPelaListaDeRecentes();
    A.modoAviao(true);
    const inicio = Date.now();
    const vistos = new Map();
    while (Date.now() - inicio < 1500_000 && vistos.size < 5) {
      const dump = A.dumpAvisos();
      for (const b of dump.split(/\n(?=\s*NotificationRecord\()/)) {
        if (!b.includes(`pkg=${A.PACOTE}`) || !b.includes('lanternas')) continue;
        const chave = /key=(\S+)/.exec(b)?.[1];
        const w = Number(/when=(\d+)/.exec(b)?.[1]);
        if (chave && w && !vistos.has(chave)) vistos.set(chave, w);
      }
      await A.dormir(10_000);
    }
    const postados = [...vistos.values()].sort((x, y) => x - y);
    gatilhos.sort((x, y) => x - y);
    gatilhos.forEach((g, i) => {
      resultados.push({
        caso: 'e-tempo-real',
        execucao: i + 1,
        antecedencia_min: [5, 6, 7, 8, 9][i],
        horario_do_lembrete: new Date(g).toISOString(),
        aviso_chegou: postados[i] !== undefined,
        atraso_s: postados[i] !== undefined ? Math.round((postados[i] - g) / 100) / 10 : null,
        app_fechado: fechou !== null,
        aviao_ligado: A.modoAviaoLigado(),
      });
    });
    const linhas = limparDump(A.dumpAvisos()).split('\n');
    gravar(
      'dumpsys-notification.txt',
      linhas.filter((l) => /NotificationRecord|when=|android.title|android.text/.test(l)).join('\n'),
    );
    fs.writeFileSync(path.join(pasta, 'resultados.json'), JSON.stringify(resultados, null, 2));
    log(JSON.stringify(resultados));
  } finally {
    A.sh(`cmd appops set --uid ${A.PACOTE} SCHEDULE_EXACT_ALARM allow`);
    A.modoAviao(false);
  }
}
if (caso === 'e-real') {
  await casoEmTempoReal();
  process.exit(0);
}

// ------------------------------------------------------------------------------------------------
const resultados = [];
const arquivoResultados = path.join(pasta, 'resultados.json');
log(`caso ${caso}: ${nExec} execuções`);
if (caso === 'e') {
  A.sh(`cmd appops set --uid ${A.PACOTE} SCHEDULE_EXACT_ALARM deny`);
  await A.dormir(1500);
}
try {
  for (let i = 1; i <= Number(nExec); i++) {
    let r;
    for (let tent = 1; tent <= 2; tent++) {
      try {
        if (['a', 'b', 'c', 'e'].includes(caso)) r = await execucaoComAviso(i, caso === 'e' ? 'a' : caso);
        else if (caso === 'd') r = await casoD(i);
        else if (caso === 'f') r = await casoF(i);
        else throw new Error('caso desconhecido');
        if (tent === 2) r.roteiro_refeito = true;
        break;
      } catch (e) {
        log(`execução ${i}: falha de roteiro (${e.message}); tentativa ${tent}`);
        r = { caso, execucao: i, ok: false, falha_de_roteiro: e.message };
      }
    }
    resultados.push(r);
    log(JSON.stringify(r));
    fs.writeFileSync(arquivoResultados, JSON.stringify(resultados, null, 2));
  }
} finally {
  if (caso === 'e') A.sh(`cmd appops set --uid ${A.PACOTE} SCHEDULE_EXACT_ALARM allow`);
  A.modoAviao(false);
  A.sincronizarRelogioComComputador();
}
log(`caso ${caso}: ${resultados.filter((r) => r.ok).length} de ${resultados.length} ok`);
if (caso === 'e') {
  const atrasos = resultados.map((r) => r.atraso_s).filter((x) => typeof x === 'number').sort((x, y) => x - y);
  log('atrasos (s):', atrasos.join(', '));
}
