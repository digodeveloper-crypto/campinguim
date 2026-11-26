// Roteiro da prova de sincronização (F0-2): roda os cenários do plano (D, F0-2) nos dois
// emuladores, sem mão humana, e confere cada execução com o verificador de "sem perda".
//
// Uso (Node do sistema; a pilha da prova no ar: node prova/prova.mjs subir):
//   node prova/e2e/sincronizacao/rodar.mjs preparar [--apk <caminho>]   instala, limpa e faz login
//   node prova/e2e/sincronizacao/rodar.mjs cenarios [--so P1,P3] [--vezes N] [--rodada nome]
//   node prova/e2e/sincronizacao/rodar.mjs medir-online [--rodada nome]
//   node prova/e2e/sincronizacao/rodar.mjs resumo
//
// Cada execução vai para docs/prova-tecnica/evidencias/F0-2/execucoes.jsonl (uma linha por
// execução, inclusive as refeitas por falha de roteiro), ou na pasta de EVIDENCIAS_DIR, como nos
// roteiros de lembretes e links (a fumaça da junção não toca nas evidências aprovadas).
// Nada de token, senha ou chave.
import fs from 'node:fs';
import path from 'node:path';

import {
  abrirLink,
  adb,
  agora,
  ajusteDaProva,
  alteracoesNoServidor,
  diferencas,
  dormir,
  encerrarViagemDeTeste,
  entrarNoApp,
  esperarRede,
  fecharApp,
  estadoDoAparelho,
  estadoDoServidor,
  fecharServidor,
  criarViagemDeTeste,
  deslocarRelogio,
  horaDoAparelho,
  idDoUsuario,
  instalarApp,
  limparApp,
  log,
  maestro,
  memoriaLivreMb,
  modoAviao,
  prepararAparelho,
  RAIZ_PROVA,
  Registro,
  restaurarRelogio,
  shell,
  sql,
  tirarDaViagem,
  FAMILIAS,
} from './comum.mjs';
import { verificar } from './verificador.mjs';

const EVIDENCIAS =
  process.env.EVIDENCIAS_DIR ?? path.resolve(RAIZ_PROVA, '..', 'docs', 'prova-tecnica', 'evidencias', 'F0-2');
const EXECUCOES = path.join(EVIDENCIAS, 'execucoes.jsonl');
const MEMORIA_MINIMA_MB = 2048;
const JWT_EXPIRY_S = 180; // prova/servidor/supabase/config.jsonc (auth.jwt_expiry)

class FalhaDeRoteiro extends Error {}
let ultimaSaidaMaestro = '';
class ParadaPorMemoria extends Error {}

const lista = (trip) => `campinguim://lista/${trip}`;

function opcao(nome, padrao) {
  const i = process.argv.indexOf(`--${nome}`);
  return i > 0 ? process.argv[i + 1] : padrao;
}

async function rodarMaestro(aparelho, roteiro, variaveis) {
  const r = await maestro(aparelho, roteiro, variaveis);
  if (!r.ok) {
    ultimaSaidaMaestro = r.texto;
    const motivo = /device offline|host:transport/i.test(r.texto) ? 'device offline' : r.texto.split('\n').filter((l) => /fail|error|not found|timed out/i.test(l)).slice(-2).join(' | ');
    throw new FalhaDeRoteiro(`Maestro ${roteiro} em ${aparelho}: ${motivo.slice(0, 300)}`);
  }
  return r;
}

async function ambos(fn) {
  return Promise.all([fn('A'), fn('B')]);
}

// Estado combinado, até o servidor e os dois aparelhos ficarem iguais e sem fila.
async function esperarConvergencia(trips, { desde, limiteMs = 30_000, semViagem = [] }) {
  const fim = agora() + limiteMs;
  let ultimo = [];
  while (agora() < fim) {
    const s = await estadoDoServidor(trips);
    const ap = { A: estadoDoAparelho('A', trips), B: estadoDoAparelho('B', trips) };
    ultimo = [];
    for (const k of ['A', 'B']) {
      if (!ap[k]) {
        ultimo.push(`${k}: banco não lido`);
        continue;
      }
      if (ap[k].pendentes > 0) ultimo.push(`${k}: ${ap[k].pendentes} na fila`);
      const alvo = semViagem.includes(k) ? { itens: [], assuncoes: [], historico: [], viagens: [] } : s;
      const d = diferencas(alvo, ap[k]);
      if (d.length) ultimo.push(`${k}: ${d.length} diferenças (${d[0]})`);
    }
    if (ultimo.length === 0) return { ms: agora() - desde, servidor: s, aparelhos: ap };
    await dormir(400);
  }
  return { ms: null, pendencias: ultimo };
}

async function esperarChegadas(perfil, desde, quantas, limiteMs = 60_000) {
  const fim = agora() + limiteMs;
  const id = await idDoUsuario(perfil);
  while (agora() < fim) {
    const { rows } = await sql('select count(*)::int as n from private.sync_change where profile_id = $1 and received_at >= $2', [id, new Date(desde)]);
    if (rows[0].n >= quantas) return rows[0].n;
    await dormir(300);
  }
  throw new Error(`esperava ${quantas} alterações de ${perfil} no servidor`);
}

function local(aparelho, trips) {
  const e = estadoDoAparelho(aparelho, trips);
  if (!e) throw new FalhaDeRoteiro(`banco de ${aparelho} não lido`);
  return e;
}

// Quantas alterações desta viagem o aparelho registrou (para conferir que os toques aconteceram).
function registradas(e, trip) {
  const itens = new Set(e.itens.map((i) => i.id));
  return e.registro.filter((r) => r.dados?.trip_id === trip || itens.has(r.linha)).length;
}

async function reconectar(ctx, aparelho) {
  const t = agora();
  await modoAviao(aparelho, false);
  ctx.reconexoes[aparelho] = {
    desligouAviao: t,
    redeVoltou: await esperarRede(aparelho, 90_000, () => {
      ctx.notas.wifiReiniciado = [...(ctx.notas.wifiReiniciado ?? []), aparelho];
    }),
  };
  return t;
}

function item(estado, nome) {
  return estado.itens.find((i) => i.name === nome);
}

// ---------------------------------------------------------------------------------------------
// Cenários (plano, D, F0-2). `passos` monta a situação; `esperado` confere o resultado específico.

const CENARIOS = {
  P1: {
    base: 'S1',
    vezes: 10,
    async passos(ctx) {
      await modoAviao('A', true);
      await rodarMaestro('A', 'p1-a.yaml', { TRIP: ctx.trip });
      const a = local('A', ctx.trip);
      if (registradas(a, ctx.trip) !== 10 || a.pendentes !== 10) throw new FalhaDeRoteiro(`A: ${registradas(a, ctx.trip)} registradas, ${a.pendentes} na fila`);
      ctx.notas.filaDepoisDeReabrir = a.pendentes;
      ctx.inicioConvergencia = await reconectar(ctx, 'A');
    },
    esperado(ctx, f) {
      const p = [];
      const noCarro = f.servidor.itens.filter((i) => i.pack_state === 'in_car').length;
      if (noCarro !== 10) p.push(`esperava 10 itens no carro no servidor, há ${noCarro}`);
      if (f.chegadas.filter((c) => c.status === 'applied').length !== 10) p.push(`esperava 10 alterações aplicadas, há ${f.chegadas.length}`);
      return p;
    },
  },

  P2: {
    base: 'S2',
    vezes: 10,
    async passos(ctx) {
      await ambos((k) => modoAviao(k, true));
      await ambos((k) => rodarMaestro(k, 'p2.yaml', { TRIP: ctx.trip }));
      for (const k of ['A', 'B']) if (registradas(local(k, ctx.trip), ctx.trip) !== 1) throw new FalhaDeRoteiro(`${k}: toque de assumir não registrado`);
      ctx.inicioConvergencia = agora();
      await ambos((k) => reconectar(ctx, k));
    },
    esperado(ctx, f) {
      const i1 = item(f.servidor, 'Item 01');
      const familias = f.servidor.assuncoes.filter((c) => c.item_id === i1.id && !c.removido).map((c) => c.family_id).sort();
      return JSON.stringify(familias) === JSON.stringify([FAMILIAS.A, FAMILIAS.B].sort()) ? [] : [`item_claim do Item 01: ${familias.length} linhas`];
    },
  },

  P3: {
    base: 'S3',
    vezes: 10,
    async passos(ctx) {
      await modoAviao('A', true);
      await rodarMaestro('A', 'p3-a.yaml', { TRIP: ctx.trip });
      const t = agora();
      await rodarMaestro('B', 'p3-b.yaml', { TRIP: ctx.trip });
      await esperarChegadas('B', t, 1);
      if (registradas(local('A', ctx.trip), ctx.trip) !== 1) throw new FalhaDeRoteiro('A: toque não registrado');
      ctx.inicioConvergencia = await reconectar(ctx, 'A');
    },
    esperado(ctx, f) {
      return item(f.servidor, 'Item 01').pack_state === 'in_car' ? [] : [`Item 01 terminou ${item(f.servidor, 'Item 01').pack_state}`];
    },
  },

  P3b: {
    base: 'princípio 4',
    vezes: 10,
    async antes(ctx) {
      deslocarRelogio('A', +2);
      deslocarRelogio('B', -2);
      ctx.notas.relogio = {
        A_horas: Math.round((horaDoAparelho('A') - agora()) / 360_000) / 10,
        B_horas: Math.round((horaDoAparelho('B') - agora()) / 360_000) / 10,
      };
    },
    async passos(ctx) {
      await CENARIOS.P3.passos(ctx);
    },
    async depois() {
      restaurarRelogio('A');
      restaurarRelogio('B');
    },
    esperado: (ctx, f) => CENARIOS.P3.esperado(ctx, f),
  },

  P4: {
    base: 'S4',
    vezes: 10,
    async passos(ctx) {
      const removePrimeiro = ctx.n % 2 === 1;
      ctx.notas.ordem = removePrimeiro ? 'remoção chega antes' : 'edição chega antes';
      await ambos((k) => modoAviao(k, true));
      await rodarMaestro('A', 'p4-a.yaml', { TRIP: ctx.trip });
      await rodarMaestro('B', 'p4-b.yaml', { TRIP: ctx.trip });
      for (const k of ['A', 'B']) if (registradas(local(k, ctx.trip), ctx.trip) !== 1) throw new FalhaDeRoteiro(`${k}: toque não registrado`);
      const [primeiro, segundo] = removePrimeiro ? ['A', 'B'] : ['B', 'A'];
      ctx.inicioConvergencia = agora();
      const t = await reconectar(ctx, primeiro);
      await esperarChegadas(primeiro, t, 1);
      await reconectar(ctx, segundo);
    },
    // Depois de juntar: removido nos três, com a edição guardada; então A restaura.
    async depoisDeConvergir(ctx, f) {
      const i1 = item(f.servidor, 'Item 01');
      ctx.notas.removidoNosTres = ['servidor', 'A', 'B'].every((k) => item(k === 'servidor' ? f.servidor : f.aparelhos[k], 'Item 01')?.removido);
      ctx.notas.qtdGuardada = i1.qty;
      abrirLink('A', lista(ctx.trip));
      await rodarMaestro('A', 'p4-restaurar.yaml', { TRIP: ctx.trip });
      const c = await esperarConvergencia(ctx.trip, { desde: agora(), limiteMs: 30_000 });
      if (c.ms == null) return [`depois de restaurar, não convergiu: ${c.pendencias.join('; ')}`];
      ctx.notas.restauradoEmMs = c.ms;
      return [];
    },
    esperado(ctx, f) {
      const p = [];
      if (!ctx.notas.removidoNosTres) p.push('Item 01 não ficou removido nos três antes de restaurar');
      if (ctx.notas.qtdGuardada !== 2) p.push(`a edição de B não ficou guardada (qtd ${ctx.notas.qtdGuardada})`);
      const i1 = item(f.servidor, 'Item 01');
      if (i1.removido) p.push('Item 01 não voltou depois de restaurar');
      return p;
    },
  },

  P5: {
    base: 'S5',
    vezes: 10,
    async passos(ctx) {
      await ambos((k) => modoAviao(k, true));
      await ambos((k) => rodarMaestro(k, 'p5.yaml', { TRIP: ctx.trip }));
      for (const k of ['A', 'B']) if (registradas(local(k, ctx.trip), ctx.trip) !== 1) throw new FalhaDeRoteiro(`${k}: item novo não registrado`);
      ctx.inicioConvergencia = agora();
      await ambos((k) => reconectar(ctx, k));
    },
    esperado(ctx, f) {
      const iq = f.servidor.itens.filter((i) => i.name === 'isqueiro');
      return iq.length === 2 && iq[0].id !== iq[1].id ? [] : [`${iq.length} itens "isqueiro" no servidor`];
    },
  },

  P6: {
    base: 'seção 4, quantidade',
    vezes: 10,
    async passos(ctx) {
      await ambos((k) => modoAviao(k, true));
      await ambos((k) => rodarMaestro(k, k === 'A' ? 'p6-a.yaml' : 'p6-b.yaml', { TRIP: ctx.trip }));
      if (registradas(local('A', ctx.trip), ctx.trip) !== 1 || registradas(local('B', ctx.trip), ctx.trip) !== 2) throw new FalhaDeRoteiro('toques de quantidade não registrados');
      ctx.inicioConvergencia = agora();
      const t = await reconectar(ctx, 'A');
      await esperarChegadas('A', t, 1);
      await reconectar(ctx, 'B');
    },
    esperado(ctx, f) {
      const p = [];
      const i1 = item(f.servidor, 'Item 01');
      if (i1.qty !== 3) p.push(`quantidade final ${i1.qty}, esperava 3 (a de B, que chegou por último)`);
      const h = f.servidor.historico.filter((x) => x.item_id === i1.id && x.field === 'qty');
      if (!h.some((x) => x.new_value === '2') || !h.some((x) => x.old_value === '2')) p.push('o valor 2 de A não está no histórico como perdido');
      ctx.notas.historico = h.map((x) => `${x.old_value}→${x.new_value}`);
      return p;
    },
  },

  P7: {
    base: 'S7 reduzido (H7)',
    vezes: 3,
    limiteConvergenciaMs: 120_000,
    async passos(ctx) {
      const t = await desligarParaLote(ctx);
      // Espera o token de acesso de A vencer com o aparelho offline (S7 reduzido, decisão H7).
      const a = await idDoUsuario('A');
      const { rows } = await sql('select max(created_at) as em from auth.refresh_tokens where user_id = $1 and created_at <= $2', [a, new Date(t)]);
      const vence = new Date(rows[0].em).getTime() + JWT_EXPIRY_S * 1000;
      ctx.notas.token = { emitido: new Date(rows[0].em).toISOString(), vencia: new Date(vence).toISOString() };
      while (agora() < vence + 10_000) await dormir(2000);
      ctx.inicioConvergencia = await reconectar(ctx, 'A');
      ctx.notas.token.reconectou = new Date(ctx.inicioConvergencia).toISOString();
      ctx.notas.token.vencidoAoReconectar = ctx.inicioConvergencia > vence;
    },
    esperado(ctx, f) {
      const p = [];
      const aplicadas = f.chegadas.filter((c) => c.status === 'applied').length;
      if (aplicadas !== 200) p.push(`esperava 200 aplicadas, há ${aplicadas}`);
      const pausas = ctx.registros.A.desde(ctx.inicioConvergencia, 'pausa').filter((e) => e.t <= ctx.inicioConvergencia + f.convergenciaMs);
      ctx.notas.maiorPausaMs = Math.max(0, ...pausas.map((e) => e.ms));
      ctx.notas.pausasAcima250ms = pausas.length;
      if (ctx.notas.maiorPausaMs > 1000) p.push(`a tela travou ${ctx.notas.maiorPausaMs} ms durante o envio`);
      if (!ctx.notas.token.vencidoAoReconectar) p.push('o token não estava vencido ao reconectar');
      return p;
    },
  },

  P8: {
    base: 'S8',
    vezes: 10,
    limiteConvergenciaMs: 30_000,
    async passos(ctx) {
      await desligarParaLote(ctx);
      // Atraso só da prova no servidor: o lote é gravado e a resposta demora; corta-se a rede aí.
      await ajusteDaProva('atraso_envio_ms', 4000);
      try {
        ctx.inicioConvergencia = await reconectar(ctx, 'A');
        const fim = agora() + 60_000;
        let emVoo = false;
        while (!emVoo && agora() < fim) {
          const { rows } = await sql(
            "select count(*)::int as n from pg_stat_activity where state = 'active' and query ilike '%sync_apply%' and pid <> pg_backend_pid()",
          );
          emVoo = rows[0].n > 0;
          if (!emVoo) await dormir(100);
        }
        if (!emVoo) throw new FalhaDeRoteiro('o envio não começou em 60 s');
        await modoAviao('A', true);
        ctx.notas.cortadoEm = new Date().toISOString();
        await dormir(6000);
        const { rows } = await sql('select count(*)::int as n from private.sync_change where received_at >= $1', [new Date(ctx.t0)]);
        ctx.notas.gravadasAntesDoReenvio = rows[0].n;
      } finally {
        await ajusteDaProva('atraso_envio_ms', null);
      }
      await reconectar(ctx, 'A');
    },
    esperado(ctx, f) {
      const p = [];
      const aplicadas = f.chegadas.filter((c) => c.status === 'applied').length;
      if (aplicadas !== 200) p.push(`esperava 200 aplicadas uma vez, há ${aplicadas}`);
      const envios = ctx.registros.A.desde(ctx.t0, 'envio');
      ctx.notas.repetidasIgnoradas = envios.reduce((s, e) => s + (e.repetidas ?? 0), 0);
      ctx.notas.errosDeEnvio = envios.filter((e) => e.erro).length;
      return p;
    },
  },

  P9: {
    base: 'S10',
    vezes: 10,
    semViagem: ['B'],
    async passos(ctx) {
      ctx.notas.avisosAntes = local('B', ctx.trip).avisos.length;
      await modoAviao('B', true);
      await rodarMaestro('B', 'p9-b.yaml', { TRIP: ctx.trip });
      const b = local('B', ctx.trip);
      if (registradas(b, ctx.trip) !== 5 || b.pendentes !== 5) throw new FalhaDeRoteiro(`B: ${registradas(b, ctx.trip)} registradas, ${b.pendentes} na fila`);
      await tirarDaViagem(ctx.trip, 'B');
      ctx.inicioConvergencia = await reconectar(ctx, 'B');
    },
    async depoisDeConvergir(ctx) {
      await rodarMaestro('B', 'p9-aviso.yaml', { TRIP: ctx.trip });
      ctx.notas.avisoNaTela = true;
      return [];
    },
    esperado(ctx, f) {
      const p = [];
      const recusadas = f.chegadas.filter((c) => c.status === 'rejected' && c.reason === 'not_member').length;
      if (recusadas !== 5) p.push(`esperava 5 recusadas, há ${recusadas}`);
      if (f.servidor.itens.some((i) => i.pack_state !== 'todo')) p.push('alteração de B mudou o servidor');
      const avisos = f.aparelhos.B.avisos;
      if (avisos.length !== ctx.notas.avisosAntes + 1 || !avisos.some((a) => a.quantidade === 5)) p.push('B não recebeu o aviso das 5 recusadas');
      return p;
    },
  },

  P10: {
    base: 'S9',
    vezes: 10,
    semViagemDoServidor: true,
    semViagem: ['B'],
    async passos(ctx) {
      limparApp('A');
      await rodarMaestro('A', 'p10-a.yaml', {});
      const a = estadoDoAparelho('A', []);
      const viagens = [...new Set(a.registro.filter((r) => r.tabela === 'trip').map((r) => r.linha))];
      if (viagens.length !== 2 || a.registro.length !== 7) throw new FalhaDeRoteiro(`A sem conta: ${viagens.length} viagens, ${a.registro.length} alterações`);
      ctx.trips = viagens;
      ctx.notas.filaSemLogin = a.pendentes;
      ctx.inicioConvergencia = agora();
      await entrarNoApp('A', 'A');
    },
    esperado(ctx, f) {
      const p = [];
      const a = idsUsuarios.A;
      if (f.servidor.viagens.length !== 2) p.push(`${f.servidor.viagens.length} viagens no servidor`);
      if (f.servidor.viagens.some((v) => v.owner_profile_id !== a)) p.push('viagem sem a pessoa A como dona');
      if (f.servidor.itens.length !== 5) p.push(`${f.servidor.itens.length} itens no servidor, esperava 5`);
      return p;
    },
    async limpar(ctx) {
      for (const t of ctx.trips ?? []) await encerrarViagemDeTeste(t);
    },
  },
};

const idsUsuarios = {};

async function desligarParaLote(ctx) {
  await modoAviao('A', true);
  const t = agora();
  await rodarMaestro('A', 'p7-a.yaml', { TRIP: ctx.trip });
  const a = local('A', ctx.trip);
  if (a.pendentes !== 200 || registradas(a, ctx.trip) !== 200) throw new FalhaDeRoteiro(`A: ${registradas(a, ctx.trip)} registradas, ${a.pendentes} na fila`);
  return t;
}

// ---------------------------------------------------------------------------------------------

// Antes de cada execução: os dois online, com a rede pronta para o app e sem fila pendente.
async function garantirOnline({ relogioCerto = true } = {}) {
  for (const k of ['A', 'B']) {
    // Relógio automático e certo (uma execução interrompida do P3b pode ter deixado deslocado).
    if (relogioCerto && Math.abs(horaDoAparelho(k) - agora()) > 60_000) restaurarRelogio(k);
    if (relogioCerto) shell(k, 'settings put global auto_time 1');
    if (shell(k, 'settings get global airplane_mode_on').trim() !== '0') await modoAviao(k, false);
    if (!(await esperarRede(k, 90_000))) throw new FalhaDeRoteiro(`${k}: a rede não voltou`);
  }
  const fim = agora() + 90_000;
  for (;;) {
    const filas = ['A', 'B'].map((k) => estadoDoAparelho(k, [])?.pendentes ?? -1);
    if (filas.every((n) => n === 0)) return;
    if (agora() > fim) throw new FalhaDeRoteiro(`fila de outra execução não esvaziou: A ${filas[0]}, B ${filas[1]}`);
    await dormir(1000);
  }
}

async function executar(id, n, rodada, registros) {
  const cen = CENARIOS[id];
  const memoria = memoriaLivreMb();
  if (memoria < MEMORIA_MINIMA_MB) throw new ParadaPorMemoria(`memória livre ${memoria} MB, abaixo de ${MEMORIA_MINIMA_MB} MB`);
  const ctx = { id, n, rodada, t0: agora(), notas: {}, reconexoes: {}, registros, memoriaMb: memoria };
  const registro = { cenario: id, base: cen.base, rodada, n, inicio: new Date(ctx.t0).toISOString(), memoriaLivreMb: memoria };
  try {
    await garantirOnline();
    ctx.t0 = agora();
    if (!cen.semViagemDoServidor) {
      ctx.trip = await criarViagemDeTeste(`${id} · ${rodada} · ${n}`);
      ctx.trips = [ctx.trip];
      // Abre o app do zero pelo link da viagem nova. Com o app já aberto na lista de outra viagem,
      // o link às vezes não trocava a tela (visto na rodada 2; observação para a F0-4).
      for (const k of ['A', 'B']) {
        fecharApp(k);
        abrirLink(k, lista(ctx.trip));
      }
      const pronta = await esperarConvergencia(ctx.trips, { desde: agora(), limiteMs: 60_000 });
      if (pronta.ms == null) throw new FalhaDeRoteiro(`a viagem nova não chegou aos aparelhos: ${pronta.pendencias.join('; ')}`);
      registro.preparoMs = pronta.ms;
    }
    if (cen.antes) await cen.antes(ctx);
    try {
      await cen.passos(ctx);
      const c = await esperarConvergencia(ctx.trips, {
        desde: ctx.inicioConvergencia,
        // Espera até o limite do plano depois de o app reconectar, mais a demora do emulador para
        // devolver a rede ao app (medida em F0-2: de 11 s a mais de 70 s).
        limiteMs: (cen.limiteConvergenciaMs ?? 30_000) + 90_000,
        semViagem: cen.semViagem ?? [],
      });
      registro.convergenciaMs = c.ms;
      // Também a partir de quando a rede voltou para o app no último aparelho reconectado: tira a
      // demora do Wi-Fi do emulador, que não é da sincronização.
      const voltas = Object.values(ctx.reconexoes).map((v) => v.redeVoltou).filter(Boolean);
      const fimConv = ctx.inicioConvergencia + (c.ms ?? 0);
      if (c.ms != null && voltas.length) registro.convergenciaDesdeRedeMs = Math.max(0, fimConv - Math.max(...voltas));
      // E a partir de quando o app de cada aparelho reconectado voltou a alcançar o servidor
      // (registro "rede" do próprio app): é o "depois de reconectar" do critério do plano.
      const alcances = Object.entries(ctx.reconexoes).map(
        ([k, v]) => registros[k].desde(v.desligouAviao, 'rede').find((e) => e.ok)?.t ?? null,
      );
      if (c.ms != null && alcances.length && alcances.every(Boolean)) {
        registro.convergenciaDesdeAppMs = Math.max(0, fimConv - Math.max(...alcances));
        registro.appAlcancouServidorEmMs = Object.fromEntries(
          Object.entries(ctx.reconexoes).map(([k, v], i) => [k, alcances[i] - v.desligouAviao]),
        );
      }
      registro.reconexoes = Object.fromEntries(
        Object.entries(ctx.reconexoes).map(([k, v]) => [k, { redeVoltouEmMs: v.redeVoltou ? v.redeVoltou - v.desligouAviao : null }]),
      );
      if (c.ms == null) {
        registro.resultado = 'falha';
        registro.problemas = [`não convergiu em ${((cen.limiteConvergenciaMs ?? 30_000) + 90_000) / 1000} s: ${c.pendencias.join('; ')}`];
      } else {
        const extras = cen.depoisDeConvergir ? await cen.depoisDeConvergir(ctx, c) : [];
        // Estado final (depois de passos extras, como restaurar no P4).
        const servidor = await estadoDoServidor(ctx.trips);
        const aparelhos = { A: local('A', ctx.trips), B: local('B', ctx.trips) };
        const chegadas = await alteracoesNoServidor(ctx.t0);
        const v = verificar({
          trips: ctx.trips,
          servidor,
          aparelhos,
          chegadas,
          recusaPermitida: id === 'P9' ? { B: true } : {},
          semViagem: cen.semViagem ?? [],
        });
        const f = { servidor, aparelhos, chegadas, convergenciaMs: c.ms };
        const especificos = cen.esperado ? cen.esperado(ctx, f) : [];
        registro.verificador = { casos: v.casos, alteracoes: v.alteracoes, chegadas: v.chegadas, iguais: v.iguais };
        const limite = cen.limiteConvergenciaMs ?? 30_000;
        const tempo = registro.convergenciaDesdeAppMs ?? registro.convergenciaDesdeRedeMs ?? registro.convergenciaMs;
        const lento = tempo > limite ? [`convergência ${(tempo / 1000).toFixed(1)} s depois de o app reconectar, acima de ${limite / 1000} s`] : [];
        registro.problemas = [...extras, ...v.problemas, ...especificos, ...lento];
        registro.resultado = registro.problemas.length === 0 ? 'ok' : 'falha';
      }
    } finally {
      if (cen.depois) await cen.depois(ctx);
    }
  } catch (e) {
    if (e instanceof ParadaPorMemoria) throw e;
    registro.resultado = e instanceof FalhaDeRoteiro ? 'refeita' : 'erro';
    registro.problemas = [String(e.message ?? e).slice(0, 500)];
    if (cen.depois) await cen.depois(ctx).catch(() => undefined);
  } finally {
    if (cen.limpar) await cen.limpar(ctx).catch(() => undefined);
    else if (ctx.trip) await encerrarViagemDeTeste(ctx.trip).catch(() => undefined);
    for (const k of ['A', 'B']) await modoAviao(k, false).catch(() => undefined);
  }
  registro.notas = ctx.notas;
  registro.fim = new Date().toISOString();
  // Diagnóstico de execução que não passou: o registro técnico do app (sem pausas), fora das
  // evidências, na pasta temporária do sistema.
  if (registro.resultado !== 'ok') {
    const diag = path.join((await import('node:os')).tmpdir(), 'campinguim-f0-2-diagnostico');
    fs.mkdirSync(diag, { recursive: true });
    const eventos = Object.fromEntries(['A', 'B'].map((k) => [k, registros[k].desde(ctx.t0).filter((e) => e.e !== 'pausa')]));
    fs.writeFileSync(path.join(diag, `${id}-${rodada}-${n}-${Date.now()}.json`), JSON.stringify({ registro, eventos, maestro: ultimaSaidaMaestro }, null, 1));
    ultimaSaidaMaestro = '';
  }
  fs.mkdirSync(EVIDENCIAS, { recursive: true });
  fs.appendFileSync(EXECUCOES, JSON.stringify(registro) + '\n', 'utf8');
  log(`${id} #${n}: ${registro.resultado}${registro.convergenciaMs != null ? ` em ${(registro.convergenciaMs / 1000).toFixed(1)} s` : ''}${registro.problemas?.length ? ` · ${registro.problemas[0]}` : ''}`);
  return registro;
}

async function cenarios() {
  const so = opcao('so', null)?.split(',') ?? Object.keys(CENARIOS);
  const vezes = opcao('vezes', null);
  const rodada = opcao('rodada', 'r1');
  idsUsuarios.A = await idDoUsuario('A');
  // Viagens de execuções anteriores interrompidas saem dos aparelhos antes de começar.
  await sql(
    `update public.trip_member set deleted_at = now()
      where deleted_at is null and trip_id in (select id from public.trip where name like 'P% · %' or name like 'medida online%' or name like 'Viagem sem conta%')`,
  );
  const registros = { A: new Registro('A'), B: new Registro('B') };
  const resumo = {};
  try {
    for (const id of so) {
      const cen = CENARIOS[id];
      if (!cen) throw new Error(`cenário desconhecido: ${id}`);
      const total = vezes ? Number(vezes) : cen.vezes;
      resumo[id] = { ok: 0, falha: 0, refeitas: 0 };
      // --a-partir N: completa uma rodada a partir da execução N (por exemplo, a que ficou sem
      // tentativa válida depois de 3 falhas de roteiro).
      const primeira = Number(opcao('a-partir', 1));
      for (let n = primeira; n < primeira + total; n++) {
        let tentativas = 0;
        for (;;) {
          const r = await executar(id, n, rodada, registros);
          if (r.resultado !== 'refeita' || ++tentativas >= 3) {
            resumo[id][r.resultado === 'ok' ? 'ok' : 'falha']++;
            break;
          }
          resumo[id].refeitas++;
          // Falha de roteiro: o aparelho volta para a lista e a execução é refeita.
          await dormir(2000);
        }
      }
    }
  } finally {
    registros.A.parar();
    registros.B.parar();
    await fecharServidor();
  }
  console.log(JSON.stringify(resumo));
}

// Medida online: com os dois conectados, quanto tempo uma alteração leva de A até a tela de B.
async function medirOnline() {
  const rodada = opcao('rodada', 'r1');
  const registros = { A: new Registro('A'), B: new Registro('B') };
  try {
    await garantirOnline();
    const trip = await criarViagemDeTeste(`medida online · ${rodada}`);
    for (const k of ['A', 'B']) abrirLink(k, lista(trip));
    const pronta = await esperarConvergencia([trip], { desde: agora(), limiteMs: 60_000 });
    if (pronta.ms == null) throw new Error('viagem não chegou aos aparelhos');
    const t0 = agora();
    await rodarMaestro('A', 'medir-a.yaml', { TRIP: trip });
    const fim = agora() + 90_000;
    while (agora() < fim && registros.A.desde(t0, 'medida').length === 0) await dormir(1000);
    await dormir(8000);
    const escritos = registros.A.desde(t0, 'escrito');
    const vistos = registros.B.desde(t0, 'visto');
    const amostras = escritos.map((e) => {
      const v = vistos.find((x) => x.item === e.item && Number(x.qty) === Number(e.qty) && x.t >= e.t);
      return { qty: e.qty, ms: v ? v.t - e.t : null };
    });
    const tempos = amostras.map((a) => a.ms).filter((x) => x != null).sort((a, b) => a - b);
    const resultado = {
      medida: 'online A→B',
      rodada,
      amostras: amostras.length,
      recebidas: tempos.length,
      medianaMs: tempos[Math.floor(tempos.length / 2)] ?? null,
      piorMs: tempos.at(-1) ?? null,
      acimaDe5s: tempos.filter((x) => x > 5000).length,
      tempos: amostras,
      memoriaLivreMb: memoriaLivreMb(),
      em: new Date().toISOString(),
    };
    await encerrarViagemDeTeste(trip);
    fs.mkdirSync(EVIDENCIAS, { recursive: true });
    fs.writeFileSync(path.join(EVIDENCIAS, `medida-online-${rodada}.json`), JSON.stringify(resultado, null, 2) + '\n', 'utf8');
    log(`medida online: ${resultado.recebidas}/${resultado.amostras}, mediana ${resultado.medianaMs} ms, pior ${resultado.piorMs} ms`);
  } finally {
    registros.A.parar();
    registros.B.parar();
    await fecharServidor();
  }
}

async function preparar() {
  const apk = opcao('apk', path.join(RAIZ_PROVA, 'app', 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'));
  for (const k of ['A', 'B']) {
    log(`preparando ${k}`);
    await prepararAparelho(k);
    instalarApp(k, apk);
    limparApp(k);
    await modoAviao(k, false);
    await entrarNoApp(k, k);
  }
  for (const k of ['A', 'B']) {
    const fim = agora() + 30_000;
    let ok = false;
    while (!ok && agora() < fim) {
      const r = adb(k, ['shell', `sqlite3 /data/data/com.campinguim.prova/databases/campinguim-prova.db "select count(*) from sessao_local"`], { permitirFalha: true });
      ok = r.stdout?.trim() === '1';
      if (!ok) await dormir(1000);
    }
    log(`${k}: ${ok ? 'logado' : 'SEM LOGIN'}`);
    if (!ok) process.exitCode = 1;
  }
  await fecharServidor();
}

// ---------------------------------------------------------------------------------------------
// Evidência visual (repositório público): só a tela do app. A barra de status (topo, 5 %) e a de
// navegação (base, 3 %) do Android são cortadas; os avisos flutuantes do sistema ficam desligados
// durante a gravação; quando o app é fechado (P1), a gravação é pausada, para a tela inicial do
// Android nunca entrar. Cada vídeo é conferido depois numa folha de quadros (1 por segundo).

const ADB_EXE = () => path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const SERIAL = { A: 'emulator-5554', B: 'emulator-5556' };
const CORTE = 'crop=iw:ih*0.92:0:ih*0.05,scale=-2:1100,setsar=1';

async function ffmpeg(args) {
  const { spawnSync } = await import('node:child_process');
  const f = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (f.status !== 0) throw new Error(`ffmpeg: ${f.stderr}`);
}

async function capturarLadoALado(tmp, nome, destino) {
  const { spawnSync } = await import('node:child_process');
  for (const k of ['A', 'B']) {
    const r = spawnSync(ADB_EXE(), ['-s', SERIAL[k], 'exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(path.join(tmp, `${nome}-${k}.png`), r.stdout);
  }
  await ffmpeg([
    '-i', path.join(tmp, `${nome}-A.png`), '-i', path.join(tmp, `${nome}-B.png`),
    '-filter_complex', `[0:v]${CORTE}[a];[1:v]${CORTE}[b];[a]pad=iw+24:ih:0:0:color=white[a2];[a2][b]hstack=inputs=2`,
    '-frames:v', '1', destino,
  ]);
}

class Gravacao {
  constructor(tmp) {
    this.tmp = tmp;
    this.segmentos = 0;
    this.proc = {};
  }

  async iniciar() {
    const { spawn } = await import('node:child_process');
    this.segmentos++;
    for (const k of ['A', 'B']) {
      shell(k, 'rm -f /sdcard/f02.mp4');
      this.proc[k] = spawn(ADB_EXE(), ['-s', SERIAL[k], 'shell', 'screenrecord', '--bit-rate', '4000000', '/sdcard/f02.mp4'], {
        windowsHide: true,
      });
    }
    await dormir(1200);
  }

  async parar() {
    for (const k of ['A', 'B']) shell(k, 'pkill -INT screenrecord; true');
    await dormir(3000);
    for (const k of ['A', 'B']) {
      this.proc[k]?.kill();
      adb(k, ['pull', '/sdcard/f02.mp4', path.join(this.tmp, `seg${this.segmentos}-${k}.mp4`)]);
      shell(k, 'rm -f /sdcard/f02.mp4');
    }
  }

  // Em cada segmento, A à esquerda e B à direita; depois, um segmento após o outro.
  async montar(destino) {
    const { spawnSync } = await import('node:child_process');
    for (let i = 1; i <= this.segmentos; i++) {
      for (const k of ['A', 'B']) {
        const d = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(this.tmp, `seg${i}-${k}.mp4`)], { encoding: 'utf8' });
        log(`segmento ${i} de ${k}: ${Number(d.stdout).toFixed(1)} s`);
      }
    }
    const entradas = [];
    const filtros = [];
    for (let i = 1; i <= this.segmentos; i++) {
      entradas.push('-i', path.join(this.tmp, `seg${i}-A.mp4`), '-i', path.join(this.tmp, `seg${i}-B.mp4`));
      const a = 2 * (i - 1);
      filtros.push(
        `[${a}:v]${CORTE},fps=15[a${i}]`,
        `[${a + 1}:v]${CORTE},fps=15[b${i}]`,
        `[a${i}]pad=iw+24:ih:0:0:color=white[p${i}]`,
        `[p${i}][b${i}]hstack=inputs=2:shortest=1[s${i}]`,
      );
    }
    const juntar = `${Array.from({ length: this.segmentos }, (_, i) => `[s${i + 1}]`).join('')}concat=n=${this.segmentos}:v=1:a=0[saida]`;
    await ffmpeg([
      ...entradas,
      '-filter_complex', [...filtros, juntar].join(';'),
      '-map', '[saida]', '-map_metadata', '-1', '-an',
      '-c:v', 'libx264', '-crf', '30', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      destino,
    ]);
  }
}

// Folha de quadros (1 por segundo) para conferir o vídeo quadro a quadro. Fica fora do repositório.
async function folhaDeQuadros(video, destino) {
  await ffmpeg(['-i', video, '-vf', 'fps=1,scale=-2:300,tile=10x10:padding=4:color=white', '-frames:v', '1', destino]);
}

function avisosFlutuantes(ligados) {
  for (const k of ['A', 'B']) shell(k, `settings put global heads_up_notifications_enabled ${ligados ? 1 : 0}`);
}

async function prepararViagemFilmada(nome) {
  await garantirOnline();
  const trip = await criarViagemDeTeste(nome);
  for (const k of ['A', 'B']) {
    fecharApp(k);
    abrirLink(k, lista(trip));
  }
  const pronta = await esperarConvergencia([trip], { desde: agora(), limiteMs: 60_000 });
  if (pronta.ms == null) throw new Error('viagem não chegou aos aparelhos');
  await dormir(3000);
  return trip;
}

async function conferirFilmado(trip, semViagem, desde, recusaPermitida = {}) {
  const servidor = await estadoDoServidor([trip]);
  const aparelhos = { A: local('A', [trip]), B: local('B', [trip]) };
  const chegadas = await alteracoesNoServidor(desde);
  return verificar({ trips: [trip], servidor, aparelhos, chegadas, recusaPermitida, semViagem });
}

// P1 filmado, com as capturas do antes, do A offline com a fila e do estado final.
async function gravarP1() {
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'f02-p1-'));
  const g = new Gravacao(tmp);
  idsUsuarios.A = await idDoUsuario('A');
  try {
    const t0 = agora();
    const trip = await prepararViagemFilmada('P1 · vídeo');
    await capturarLadoALado(tmp, '1', path.join(EVIDENCIAS, 'p1-1-antes.png'));
    avisosFlutuantes(false);
    await g.iniciar();
    await dormir(2000);
    await modoAviao('A', true);
    await dormir(2000);
    await rodarMaestro('A', 'p1-a-marcar.yaml', { TRIP: trip });
    await dormir(2000);
    await g.parar();
    // App de A fechado à força e reaberto pelo link, ainda em modo avião (gravação pausada).
    fecharApp('A');
    abrirLink('A', lista(trip));
    await dormir(4000);
    await g.iniciar();
    await rodarMaestro('A', 'p1-reaberto.yaml', { TRIP: trip });
    await capturarLadoALado(tmp, '2', path.join(EVIDENCIAS, 'p1-2-a-offline-com-fila.png'));
    await dormir(1500);
    const t = agora();
    await modoAviao('A', false);
    await esperarRede('A', 90_000);
    const c = await esperarConvergencia([trip], { desde: t, limiteMs: 120_000 });
    if (c.ms == null) throw new Error('não convergiu');
    await dormir(4000);
    await capturarLadoALado(tmp, '3', path.join(EVIDENCIAS, 'p1-3-depois-de-juntar.png'));
    await g.parar();
    const v = await conferirFilmado(trip, [], t0);
    const destino = path.join(EVIDENCIAS, 'p1-dois-emuladores.mp4');
    await g.montar(destino);
    await folhaDeQuadros(destino, path.join(os.tmpdir(), 'f02-folha-p1.png'));
    await encerrarViagemDeTeste(trip);
    log(`P1 filmado: verificador ${v.ok ? 'ok' : v.problemas.join(' / ')}; juntou em ${(c.ms / 1000).toFixed(1)} s desde o modo avião`);
  } finally {
    avisosFlutuantes(true);
    fs.rmSync(tmp, { recursive: true, force: true });
    await modoAviao('A', false).catch(() => undefined);
    await fecharServidor();
  }
}

// P9 filmado, com a captura do estado final (B com o aviso e sem a viagem; A com a lista).
async function gravarP9() {
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'f02-p9-'));
  const g = new Gravacao(tmp);
  try {
    const t0 = agora();
    const trip = await prepararViagemFilmada('P9 · vídeo');
    avisosFlutuantes(false);
    await g.iniciar();
    await dormir(2000);
    await modoAviao('B', true);
    await dormir(2000);
    await rodarMaestro('B', 'p9-b.yaml', { TRIP: trip });
    await tirarDaViagem(trip, 'B');
    await dormir(2000);
    const t = agora();
    await modoAviao('B', false);
    await esperarRede('B', 90_000);
    const c = await esperarConvergencia([trip], { desde: t, limiteMs: 120_000, semViagem: ['B'] });
    if (c.ms == null) throw new Error('não convergiu');
    await rodarMaestro('B', 'p9-aviso.yaml', { TRIP: trip });
    await dormir(4000);
    await capturarLadoALado(tmp, '9', path.join(EVIDENCIAS, 'p9-estado-final.png'));
    await g.parar();
    const v = await conferirFilmado(trip, ['B'], t0, { B: true });
    const destino = path.join(EVIDENCIAS, 'p9-dois-emuladores.mp4');
    await g.montar(destino);
    await folhaDeQuadros(destino, path.join(os.tmpdir(), 'f02-folha-p9.png'));
    await encerrarViagemDeTeste(trip);
    log(`P9 filmado: verificador ${v.ok ? 'ok' : v.problemas.join(' / ')}; recusadas e avisadas: ${v.casos.recusadaEAvisada}`);
  } finally {
    avisosFlutuantes(true);
    fs.rmSync(tmp, { recursive: true, force: true });
    await modoAviao('B', false).catch(() => undefined);
    await fecharServidor();
  }
}

const acoes = { preparar, cenarios, 'medir-online': medirOnline, 'gravar-p1': gravarP1, 'gravar-p9': gravarP9 };
const acao = acoes[process.argv[2]];
if (!acao) {
  console.error('uso: rodar.mjs preparar | cenarios [--so P1,P2] [--vezes N] [--rodada r1] | medir-online');
  process.exit(2);
}
acao().catch(async (e) => {
  console.error(`[sinc] parada: ${e.message}`);
  await fecharServidor().catch(() => undefined);
  process.exit(e instanceof ParadaPorMemoria ? 3 : 1);
});
