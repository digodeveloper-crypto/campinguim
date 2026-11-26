// Peças comuns do roteiro da prova de sincronização (F0-2): servidor (Postgres local), aparelhos
// (adb), Maestro, registro do app pelo logcat e memória livre.
// Credenciais só de prova/.env.local (fora do git). Nada aqui imprime token, senha ou chave.
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const AQUI = path.dirname(fileURLToPath(import.meta.url));
export const RAIZ_PROVA = path.resolve(AQUI, '..', '..');
const SERVIDOR = path.join(RAIZ_PROVA, 'servidor');
const requireDoServidor = createRequire(path.join(SERVIDOR, 'package.json'));
const pg = requireDoServidor('pg');
const { createClient } = await import(pathToFileURL(requireDoServidor.resolve('@supabase/supabase-js')).href);
const { lerEnvLocal, USUARIOS, FAMILIAS, ENDERECOS_PROVA } = await import(pathToFileURL(path.join(SERVIDOR, 'scripts', 'comum.mjs')).href);

export { FAMILIAS };
export const env = lerEnvLocal();
export const PACOTE = 'com.campinguim.prova';
export const APARELHOS = { A: 'emulator-5554', B: 'emulator-5556' };
const SDK = process.env.ANDROID_HOME || path.join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk');
const ADB = path.join(SDK, 'platform-tools', 'adb.exe');
const MAESTRO = process.env.MAESTRO_BAT || 'C:\\Ferramentas\\maestro\\bin\\maestro.bat';
const BANCO_NO_APARELHO = `/data/data/${PACOTE}/databases/campinguim-prova.db`;

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
export const agora = () => Date.now();

export function log(msg) {
  console.log(`[sinc ${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

// ---------------------------------------------------------------------------------------------
// Memória livre (regra da tarefa: abaixo de 2 GB, parar e avisar).

export function memoriaLivreMb() {
  if (process.platform !== 'win32') return Math.round(os.freemem() / 1048576);
  const r = spawnSync(
    'powershell',
    ['-NoProfile', '-Command', '[int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)'],
    { encoding: 'utf8', windowsHide: true },
  );
  return Number(r.stdout.trim());
}

// ---------------------------------------------------------------------------------------------
// Servidor

let clientePg;
export async function bancoServidor() {
  if (!clientePg) {
    clientePg = new pg.Client({ connectionString: env.SUPABASE_DB_URL_LOCAL });
    await clientePg.connect();
  }
  return clientePg;
}

export async function sql(texto, valores = []) {
  return (await bancoServidor()).query(texto, valores);
}

export async function fecharServidor() {
  await clientePg?.end();
  clientePg = undefined;
}

const ids = {};
export async function idDoUsuario(chave) {
  if (!ids[chave]) {
    const { rows } = await sql('select id from auth.users where email = $1', [USUARIOS[chave].email]);
    ids[chave] = rows[0].id;
  }
  return ids[chave];
}

// Login feito no computador; o aparelho recebe só o token de renovação (uso único).
export async function tokenDeRenovacao(chave) {
  const cliente = createClient(env.SUPABASE_URL_LOCAL, env.SUPABASE_CHAVE_PUBLICA, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await cliente.auth.signInWithPassword({
    email: USUARIOS[chave].email,
    password: env[`SENHA_TESTE_${chave}`],
  });
  if (error) throw new Error(`login de ${chave} no computador falhou`);
  return data.session.refresh_token;
}

// Viagem nova de grupo, com A e B, e 10 itens do grupo "Item 01" a "Item 10".
export async function criarViagemDeTeste(nome, quantos = 10) {
  const trip = randomUUID();
  const a = await idDoUsuario('A');
  const b = await idDoUsuario('B');
  const c = await bancoServidor();
  await c.query('begin');
  try {
    await c.query('insert into public.trip (id, owner_profile_id, name, is_group, updated_by) values ($1, $2, $3, true, $2)', [trip, a, nome]);
    await c.query(
      `insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by) values
       ($1, $2, $3, 'Pessoa A', 'organizer', $3), ($1, $4, $5, 'Pessoa B', 'member', $3)`,
      [trip, FAMILIAS.A, a, FAMILIAS.B, b],
    );
    for (let n = 1; n <= quantos; n++) {
      await c.query('insert into public.trip_item (id, trip_id, name, qty, updated_by) values ($1, $2, $3, 1, $4)', [
        randomUUID(),
        trip,
        `Item ${String(n).padStart(2, '0')}`,
        a,
      ]);
    }
    await c.query('commit');
  } catch (e) {
    await c.query('rollback');
    throw e;
  }
  return trip;
}

// Tira A e B da viagem: ela sai dos aparelhos na próxima sincronização. Os dados ficam no servidor
// (auditoria da prova).
export async function encerrarViagemDeTeste(trip) {
  await sql('update public.trip_member set deleted_at = now() where trip_id = $1 and deleted_at is null', [trip]);
}

export async function tirarDaViagem(trip, chave) {
  await sql('update public.trip_member set deleted_at = now() where trip_id = $1 and profile_id = $2', [trip, await idDoUsuario(chave)]);
}

export async function ajusteDaProva(chave, valor) {
  if (valor == null) await sql('delete from private.prova_ajuste where chave = $1', [chave]);
  else
    await sql('insert into private.prova_ajuste (chave, valor) values ($1, $2) on conflict (chave) do update set valor = excluded.valor', [
      chave,
      String(valor),
    ]);
}

// Estado de uma viagem no servidor, no mesmo formato que o do aparelho (para comparar).
export async function estadoDoServidor(trips) {
  const lista = Array.isArray(trips) ? trips : [trips];
  const itens = await sql(
    `select id::text, trip_id::text, name, qty::float8 as qty, pack_state, deleted_at is not null as removido,
            family_id::text, note
       from public.trip_item where trip_id = any($1::uuid[]) order by id`,
    [lista],
  );
  const claims = await sql(
    `select id::text, item_id::text, family_id::text, deleted_at is not null as removido
       from public.item_claim where trip_id = any($1::uuid[]) order by id`,
    [lista],
  );
  const hist = await sql(
    `select id::text, item_id::text, field, old_value, new_value, change_id::text
       from public.trip_item_history where trip_id = any($1::uuid[]) order by id`,
    [lista],
  );
  const viagens = await sql('select id::text, name, owner_profile_id::text from public.trip where id = any($1::uuid[]) order by id', [lista]);
  return {
    viagens: viagens.rows,
    itens: itens.rows.map(normalizarItem),
    assuncoes: claims.rows.map((c) => ({ ...c, removido: !!c.removido })),
    historico: hist.rows,
  };
}

export async function alteracoesNoServidor(desde) {
  const { rows } = await sql(
    `select change_id::text, arrival::int, profile_id::text, table_name, row_id::text, op, payload, status, reason, outcome,
            received_at
       from private.sync_change where received_at >= $1 order by arrival`,
    [new Date(desde)],
  );
  return rows;
}

function normalizarItem(i) {
  return {
    id: i.id,
    trip_id: i.trip_id,
    name: i.name,
    qty: Number(i.qty),
    pack_state: i.pack_state,
    removido: !!i.removido,
    family_id: i.family_id ?? null,
    note: i.note ?? null,
  };
}

// ---------------------------------------------------------------------------------------------
// Aparelhos

export function adb(aparelho, args, { entrada, permitirFalha = false, timeout = 60_000 } = {}) {
  const r = spawnSync(ADB, ['-s', APARELHOS[aparelho] ?? aparelho, ...args], {
    encoding: 'utf8',
    input: entrada,
    windowsHide: true,
    timeout,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (!permitirFalha && (r.error || r.status !== 0)) {
    throw new Error(`adb ${args.slice(0, 3).join(' ')} (${aparelho}) falhou: ${(r.stderr || r.error?.message || '').trim().slice(0, 300)}`);
  }
  return r;
}

export function shell(aparelho, comando, opcoes) {
  return adb(aparelho, ['shell', comando], opcoes).stdout.replace(/\r/g, '');
}

export async function modoAviao(aparelho, ligado) {
  shell(aparelho, `cmd connectivity airplane-mode ${ligado ? 'enable' : 'disable'}`);
  for (let n = 0; n < 20; n++) {
    if (shell(aparelho, 'settings get global airplane_mode_on').trim() === (ligado ? '1' : '0')) return;
    await dormir(250);
  }
  throw new Error(`modo avião não mudou em ${aparelho}`);
}

// Espera a rede do emulador voltar depois de desligar o modo avião: o teste é uma conexão TCP à
// porta da API, feita de dentro do emulador. Medido em F0-2: o Wi-Fi do emulador leva de 11 a
// 24 s para voltar. (Testar com o usuário do app não serve: o Android corta a rede de app que não
// está em primeiro plano, e o teste dá "sem rede" com a rede de pé.)
export async function esperarRede(aparelho, limiteMs = 60_000, aoReiniciarWifi) {
  const inicio = agora();
  const fim = inicio + limiteMs;
  let reiniciou = false;
  while (agora() < fim) {
    const r = adb(
      aparelho,
      ['shell', `nc -z -w1 ${ENDERECOS_PROVA.servidor} ${ENDERECOS_PROVA.portaApi} >/dev/null 2>&1 && echo ok || echo nao`],
      { permitirFalha: true },
    );
    if (r.stdout?.trim() === 'ok') return agora();
    // O Wi-Fi do emulador às vezes fica associado sem endereço depois do modo avião. Depois de
    // 40 s sem rede, religa o Wi-Fi uma vez (registrado na execução).
    if (!reiniciou && agora() - inicio > 40_000) {
      reiniciou = true;
      shell(aparelho, 'svc wifi disable; sleep 1; svc wifi enable');
      aoReiniciarWifi?.();
    }
    await dormir(300);
  }
  return null;
}

export function abrirLink(aparelho, link) {
  return shell(aparelho, `am start -W -a android.intent.action.VIEW -d '${link}' ${PACOTE}`);
}

export function fecharApp(aparelho) {
  shell(aparelho, `am force-stop ${PACOTE}`);
}

// Lê o banco do app no aparelho (emulador "Google APIs": o adb tem root). Uma chamada do sqlite3,
// uma linha JSON por consulta.
export function estadoDoAparelho(aparelho, trips) {
  const lista = (Array.isArray(trips) ? trips : [trips]).map((t) => `'${t.replace(/[^0-9a-f-]/gi, '')}'`).join(',');
  const consultas = [
    `select coalesce(json_group_array(json_object('id', id, 'trip_id', trip_id, 'name', name, 'qty', qty, 'pack_state', pack_state,
       'removido', deleted_at is not null, 'family_id', family_id, 'note', note)), '[]') from (select * from trip_item where trip_id in (${lista}) order by id);`,
    `select coalesce(json_group_array(json_object('id', id, 'item_id', item_id, 'family_id', family_id, 'removido', deleted_at is not null)), '[]')
       from (select * from item_claim where trip_id in (${lista}) order by id);`,
    `select coalesce(json_group_array(json_object('id', id, 'item_id', item_id, 'field', field, 'old_value', old_value, 'new_value', new_value,
       'change_id', change_id)), '[]') from (select * from trip_item_history where trip_id in (${lista}) order by id);`,
    `select coalesce(json_group_array(json_object('id', id, 'name', name, 'owner_profile_id', owner_profile_id)), '[]')
       from (select * from trip where id in (${lista}) order by id);`,
    `select count(*) from ps_crud;`,
    `select coalesce(json_group_array(json_object('c', id, 'tabela', tabela, 'linha', linha_id, 'op', op, 'dados', json(dados), 'em', feito_em)), '[]')
       from (select * from registro_local order by feito_em, id);`,
    `select coalesce(json_group_array(json_object('tipo', tipo, 'quantidade', quantidade)), '[]') from aviso_local;`,
  ];
  const r = adb(aparelho, ['shell', `sqlite3 ${BANCO_NO_APARELHO}`], { entrada: consultas.join('\n') + '\n', permitirFalha: true, timeout: 20_000 });
  const linhas = (r.stdout ?? '').replace(/\r/g, '').split('\n').filter((l) => l.trim());
  if (r.status !== 0 || linhas.length < 7) return null;
  try {
    const [itens, assuncoes, historico, viagens, pendentes, registro, avisos] = linhas.map((l) => JSON.parse(l));
    return {
      viagens,
      itens: itens.map((i) => ({ ...i, qty: Number(i.qty), removido: !!i.removido, family_id: i.family_id ?? null, note: i.note ?? null })),
      assuncoes: assuncoes.map((c) => ({ ...c, family_id: c.family_id ?? null, removido: !!c.removido })),
      historico,
      pendentes: Number(pendentes),
      registro,
      avisos,
    };
  } catch {
    return null;
  }
}

// Compara as partes sincronizadas de dois estados. Devolve a lista de diferenças (vazia = iguais).
export function diferencas(x, y) {
  const saida = [];
  const comparar = (nome, a, b, campos) => {
    const mapa = new Map(b.map((l) => [l.id, l]));
    if (a.length !== b.length) saida.push(`${nome}: ${a.length} x ${b.length} linhas`);
    for (const l of a) {
      const o = mapa.get(l.id);
      if (!o) {
        saida.push(`${nome} ${l.id.slice(0, 8)}: falta`);
        continue;
      }
      for (const c of campos) {
        if ((l[c] ?? null) !== (o[c] ?? null)) saida.push(`${nome} ${l.id.slice(0, 8)}.${c}: ${l[c]} x ${o[c]}`);
      }
    }
  };
  comparar('item', x.itens, y.itens, ['name', 'qty', 'pack_state', 'removido', 'family_id', 'note']);
  comparar('assumido', x.assuncoes, y.assuncoes, ['item_id', 'family_id', 'removido']);
  comparar('historico', x.historico, y.historico, ['item_id', 'field', 'old_value', 'new_value']);
  comparar('viagem', x.viagens, y.viagens, ['name', 'owner_profile_id']);
  return saida;
}

// Prepara os emuladores: root, telas sem animação, tela sempre ligada, relógio automático.
export async function prepararAparelho(aparelho) {
  // `adb root` reinicia o adbd do aparelho: por instantes ele aparece como "offline". Só segue
  // depois de o aparelho voltar e responder ao gerenciador de pacotes (estabilização do Maestro).
  adb(aparelho, ['root'], { permitirFalha: true });
  await dormir(1500);
  adb(aparelho, ['wait-for-device'], { timeout: 120_000 });
  await esperarAparelhoPronto(aparelho);
  for (const cmd of [
    'settings put global window_animation_scale 0',
    'settings put global transition_animation_scale 0',
    'settings put global animator_duration_scale 0',
    'svc power stayon true',
    'settings put global auto_time 1',
    'input keyevent KEYCODE_WAKEUP',
    'wm dismiss-keyguard',
    // Buffer maior do registro (o diagnóstico lê o logcat).
    'logcat -G 16M',
  ]) {
    shell(aparelho, cmd);
  }
}

// Pronto de verdade: boot concluído, animação de boot parada e o gerenciador de pacotes respondendo.
export async function esperarAparelhoPronto(aparelho, limiteMs = 180_000) {
  const fim = agora() + limiteMs;
  while (agora() < fim) {
    const r = adb(aparelho, ['shell', 'getprop sys.boot_completed; getprop init.svc.bootanim; pm path android >/dev/null && echo pm_ok'], {
      permitirFalha: true,
      timeout: 15_000,
    });
    const t = (r.stdout ?? '').split(String.fromCharCode(13)).join('');
    if (r.status === 0 && t.startsWith('1') && !t.includes('running') && t.includes('pm_ok')) return;
    await dormir(1000);
  }
  throw new Error(`${aparelho} não ficou pronto`);
}

export function instalarApp(aparelho, apk) {
  adb(aparelho, ['install', '-r', apk], { timeout: 180_000 });
}

export function limparApp(aparelho) {
  shell(aparelho, `pm clear ${PACOTE}`);
  shell(aparelho, `pm grant ${PACOTE} android.permission.POST_NOTIFICATIONS`);
}

// Login do app pelo link com token de renovação (feito no computador).
export async function entrarNoApp(aparelho, chave) {
  const token = await tokenDeRenovacao(chave);
  abrirLink(aparelho, `campinguim://entrar?t=${token}`);
}

// Relógio do aparelho deslocado em horas (P3b). Exige root (emulador "Google APIs").
export function deslocarRelogio(aparelho, horas) {
  shell(aparelho, 'settings put global auto_time 0');
  const alvo = new Date(Date.now() + horas * 3600_000);
  const p = (n) => String(n).padStart(2, '0');
  // toybox date, em UTC: MMDDhhmmYYYY.ss
  const texto = `${p(alvo.getUTCMonth() + 1)}${p(alvo.getUTCDate())}${p(alvo.getUTCHours())}${p(alvo.getUTCMinutes())}${alvo.getUTCFullYear()}.${p(alvo.getUTCSeconds())}`;
  shell(aparelho, `TZ=UTC date ${texto} >/dev/null`);
}

export function horaDoAparelho(aparelho) {
  return Number(shell(aparelho, 'date +%s').trim()) * 1000;
}

export function restaurarRelogio(aparelho) {
  deslocarRelogio(aparelho, 0);
  shell(aparelho, 'settings put global auto_time 1');
}

// ---------------------------------------------------------------------------------------------
// Maestro

export function maestro(aparelho, roteiro, variaveis = {}, { saida } = {}) {
  const arquivo = path.join(AQUI, roteiro);
  const partes = [`"${MAESTRO}"`, '--device', APARELHOS[aparelho], 'test', `"${arquivo}"`];
  for (const [k, v] of Object.entries({ APARELHO: aparelho, ...variaveis })) partes.push('-e', `${k}=${v}`);
  if (saida) partes.push('--test-output-dir', `"${saida}"`);
  return new Promise((resolve) => {
    const inicio = agora();
    const p = spawn('cmd.exe', ['/d', '/s', '/c', `"${partes.join(' ')}"`], {
      windowsHide: true,
      windowsVerbatimArguments: true,
      // O driver do Maestro dentro do emulador demora a subir com a máquina carregada (outros
      // emuladores, builds, vídeo): o limite padrão estourava e a sessão não abria no A (F0-1).
      env: {
        ...process.env,
        MAESTRO_CLI_NO_ANALYTICS: '1',
        MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true',
        MAESTRO_DRIVER_STARTUP_TIMEOUT: '120000',
      },
    });
    let texto = '';
    p.stdout.on('data', (d) => (texto += d));
    p.stderr.on('data', (d) => (texto += d));
    p.on('close', (codigo) =>
      resolve({ ok: codigo === 0, codigo, ms: agora() - inicio, texto: texto.length > 6000 ? `${texto.slice(0, 3000)}
…
${texto.slice(-3000)}` : texto }),
    );
  });
}

// ---------------------------------------------------------------------------------------------
// Registro do app pelo logcat ([prova-sinc] {json}), com a hora de chegada no computador.

export class Registro {
  constructor(aparelho) {
    this.aparelho = aparelho;
    this.eventos = [];
    adb(aparelho, ['logcat', '-c'], { permitirFalha: true });
    this.proc = spawn(ADB, ['-s', APARELHOS[aparelho], 'logcat', '-v', 'raw', '-s', 'ReactNativeJS:I'], { windowsHide: true });
    let resto = '';
    this.proc.stdout.on('data', (d) => {
      const t = agora();
      const linhas = (resto + d.toString('utf8')).split(/\r?\n/);
      resto = linhas.pop();
      for (const l of linhas) {
        const i = l.indexOf('[prova-sinc] ');
        if (i < 0) continue;
        try {
          this.eventos.push({ t, ...JSON.parse(l.slice(i + 13)) });
        } catch {
          // linha cortada: ignora
        }
      }
    });
  }
  desde(t0, evento) {
    return this.eventos.filter((e) => e.t >= t0 && (!evento || e.e === evento));
  }
  parar() {
    this.proc.kill();
  }
}

export function gravarJson(arquivo, dados) {
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2) + '\n', 'utf8');
}
