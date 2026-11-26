// Ajudantes do roteiro de lembretes (F0-3). Falam SÓ com o emulador `campinguim-c` (porta 5558).
// Nunca chamam kill-server, start-server nem reconnect: o servidor do adb é compartilhado com
// outros testes (F0-2) e derrubá-lo os interromperia.
import { execFileSync, spawn } from 'node:child_process';

// Padrão: campinguim-c (5558), usado na F0-3. A F0-4 usa um emulador próprio e define CAMPINGUIM_SERIAL.
export const SERIAL = process.env.CAMPINGUIM_SERIAL ?? 'emulator-5558';
export const PACOTE = 'com.campinguim.prova';
const PROIBIDOS = new Set(['kill-server', 'start-server', 'reconnect', 'disconnect']);

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

export function adb(args, { tentativas = 5, tempoMax = 60_000 } = {}) {
  if (args.some((a) => PROIBIDOS.has(a))) throw new Error(`comando proibido: ${args.join(' ')}`);
  let erro;
  for (let i = 0; i < tentativas; i++) {
    try {
      return execFileSync('adb', ['-s', SERIAL, ...args], {
        encoding: 'utf8',
        timeout: tempoMax,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (e) {
      erro = e;
      // Se o servidor do adb perdeu o aparelho por instantes (outro teste na máquina), espera
      // o aparelho voltar e repete. Nunca reinicia o servidor.
      if (/offline|not found|no devices/i.test(String(e.stderr ?? e.message))) {
        try {
          execFileSync('adb', ['-s', SERIAL, 'wait-for-device'], { timeout: 90_000, windowsHide: true });
        } catch {}
      }
    }
  }
  throw erro;
}

export function adbBinario(args) {
  return execFileSync('adb', ['-s', SERIAL, ...args], {
    timeout: 60_000,
    windowsHide: true,
    maxBuffer: 64 * 1024 * 1024,
  });
}

export const sh = (comando, opcoes) => adb(['shell', comando], opcoes).replace(/\r/g, '');

// --- relógio do aparelho -----------------------------------------------------------------------
export const relogioDoAparelhoSeg = () => Number(sh('date +%s').trim());

// Garante que o adb do aparelho segue como root (some se o adbd reinicia).
export function garantirRoot() {
  if (sh('id -u').trim() !== '0') {
    adb(['root']);
    execFileSync('adb', ['-s', SERIAL, 'wait-for-device'], { timeout: 90_000, windowsHide: true });
  }
}

// Define o relógio (epoch em segundos). Exige `adb root` (imagem "Google APIs").
export function definirRelogio(epochSeg) {
  garantirRoot();
  sh('settings put global auto_time 0');
  sh('settings put global auto_time_zone 0');
  sh(`date -u @${Math.floor(epochSeg)} >/dev/null 2>&1; date +%s`);
  const agora = relogioDoAparelhoSeg();
  if (Math.abs(agora - epochSeg) > 5) {
    throw new Error(`relógio não mudou: pedido ${epochSeg}, aparelho ${agora}`);
  }
  // Avisa o sistema (o alarme de relógio de parede é reavaliado pela mudança de hora).
  sh('am broadcast -a android.intent.action.TIME_SET >/dev/null 2>&1');
}

export const sincronizarRelogioComComputador = () => definirRelogio(Math.floor(Date.now() / 1000));

// --- modo avião ------------------------------------------------------------------------------
export function modoAviao(ligado) {
  sh(`cmd connectivity airplane-mode ${ligado ? 'enable' : 'disable'}`);
}
export const modoAviaoLigado = () => sh('settings get global airplane_mode_on').trim() === '1';

// --- app ---------------------------------------------------------------------------------------
export const pidDoApp = () => sh(`pidof ${PACOTE} || true`).trim();
export const abrirLink = (url) =>
  sh(`am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${url}' ${PACOTE}`);
export const voltarParaInicio = () => sh('input keyevent KEYCODE_HOME');
export const forcarParada = () => sh(`am force-stop ${PACOTE}`);

// --- tela (uiautomator, sem Maestro) -----------------------------------------------------------
export function arvoreDaTela() {
  sh('uiautomator dump /sdcard/tela.xml >/dev/null 2>&1');
  return adb(['exec-out', 'cat', '/sdcard/tela.xml']).replace(/\r/g, '');
}
function nos(xml) {
  const lista = [];
  for (const m of xml.matchAll(/<node [^>]*>/g)) {
    const n = m[0];
    const pega = (k) => (new RegExp(`${k}="([^"]*)"`).exec(n) ?? [])[1] ?? '';
    const b = /bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/.exec(n);
    lista.push({
      texto: pega('text').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'"),
      id: pega('resource-id'),
      descricao: pega('content-desc'),
      caixa: b ? b.slice(1, 5).map(Number) : null,
    });
  }
  return lista;
}
export const achar = (xml, f) => nos(xml).find(f);
export function tocarNo(no) {
  if (!no?.caixa) throw new Error('nó sem posição');
  const [x1, y1, x2, y2] = no.caixa;
  sh(`input tap ${Math.round((x1 + x2) / 2)} ${Math.round((y1 + y2) / 2)}`);
}
export async function esperarNaTela(f, { ms = 15_000, passo = 700 } = {}) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    const xml = arvoreDaTela();
    const no = achar(xml, f);
    if (no) return { xml, no };
    await dormir(passo);
  }
  return null;
}

// --- avisos ------------------------------------------------------------------------------------
export const dumpAvisos = () => sh('dumpsys notification --noredact', { tempoMax: 90_000 });
export function avisoDoApp(dump) {
  // Um bloco "NotificationRecord(...pkg=com.campinguim.prova..." por aviso ativo.
  const blocos = dump.split(/\n(?=\s*NotificationRecord\()/).filter((b) => b.includes(`pkg=${PACOTE}`));
  return blocos.find((b) => b.includes('Campinguim') || b.includes('lanternas')) ?? null;
}

export function gravarTela(arquivoNoAparelho, segundos) {
  const p = spawn('adb', ['-s', SERIAL, 'shell', `screenrecord --time-limit ${segundos} --bit-rate 2000000 ${arquivoNoAparelho}`], {
    stdio: 'ignore',
    windowsHide: true,
  });
  return p;
}
