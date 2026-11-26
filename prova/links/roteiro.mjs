// Roteiro de links (F0-4). Uso, sempre com o Node do sistema e o emulador próprio da tarefa:
//   CAMPINGUIM_SERIAL=emulator-5560 node prova/links/roteiro.mjs <caso> [execucoes] [--sufixo=X]
// Casos:
//   semear  cria as viagens de teste no banco do aparelho
//   a       link com esquema próprio, app fechado (abertura a frio); mede o tempo até a tela
//   b       link com esquema próprio, app aberto em outra tela (início, links, lembretes)
//   b-fundo link com esquema próprio, app em segundo plano
//   c       viagem que não existe no aparelho (esquema e https, fechado e aberto) e id inválido
//   d       link https com o vínculo forçado (pm set-app-links), fechado e aberto
//   e       link https sem vínculo: registra o que o Android faz
// Fala só com o emulador de CAMPINGUIM_SERIAL (padrão emulator-5558). Nunca usa kill-server,
// start-server nem reconnect (o adb é dividido com outros testes). Resultados em
// docs/prova-tecnica/evidencias/F0-4/caso-<caso>/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as A from '../lembretes/aparelho.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVID = process.env.EVIDENCIAS_DIR ?? path.join(RAIZ, 'docs', 'prova-tecnica', 'evidencias', 'F0-4');
const enderecos = JSON.parse(fs.readFileSync(path.join(RAIZ, 'prova', 'config', 'enderecos.json'), 'utf8'));
const SITE = enderecos.site; // único valor de configuração do endereço https
const HOST = new URL(SITE).host;

// Viagens de teste: ids e nomes lidos do código do app (única fonte).
const fonteIds = fs.readFileSync(path.join(RAIZ, 'prova', 'app', 'src', 'links', 'viagensDeTeste.ts'), 'utf8');
const IDS = [...fonteIds.matchAll(/'([0-9a-f-]{36})'/g)].map((m) => m[1]);
const fonteTextos = fs.readFileSync(path.join(RAIZ, 'prova', 'app', 'src', 'textos.ts'), 'utf8');
const NOMES = [...(/viagens: \[(.*?)\]/s.exec(fonteTextos)?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
if (IDS.length !== 3 || NOMES.length !== 3) throw new Error('não achei as 3 viagens de teste no código do app');
const ID_INEXISTENTE = '1f0a0b00-0000-4000-8000-00000000f4ff';
const ID_INVALIDO = 'isto-nao-e-uma-viagem';

const [, , caso, nExec = '10', ...resto] = process.argv;
const opcoes = Object.fromEntries(
  resto.map((r) => r.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]),
);
const pasta = path.join(EVID, `caso-${caso}${opcoes.sufixo ? '-' + opcoes.sufixo : ''}`);
fs.mkdirSync(pasta, { recursive: true });

const log = (...m) => console.log(new Date().toISOString().slice(11, 19), ...m);
const gravar = (nome, texto) => fs.writeFileSync(path.join(pasta, nome), texto);
const captura = (nome) =>
  fs.writeFileSync(path.join(pasta, nome), A.adbBinario(['exec-out', 'screencap', '-p']));

const esquema = (id) => `campinguim://viagem/${id}`;
const https = (id) => `${SITE}/viagem/${id}`;

// --- ajudantes ---------------------------------------------------------------------------------
// Abre o link como o navegador ou outro app faria (VIEW + BROWSABLE), sem dizer o pacote: quem
// decide é o sistema. Mede dentro do próprio aparelho (mesmo relógio): T0 antes do `am start`.
function abrir(url) {
  A.sh('logcat -c');
  const saida = A.sh(
    `t0=$(date +%s%3N); am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${url}'; echo T0=$t0; echo T1=$(date +%s%3N)`,
    { tentativas: 2 },
  );
  const pega = (r) => (r.exec(saida) ?? [])[1];
  const t0 = Number(pega(/T0=(\d+)/));
  const t1 = Number(pega(/T1=(\d+)/));
  return {
    saida,
    t0,
    amStartMs: t1 - t0,
    estadoDaPartida: pega(/LaunchState: (\w+)/) ?? null,
    atividade: pega(/Activity: (\S+)/) ?? null,
    totalTimeMs: pega(/TotalTime: (\d+)/) ? Number(pega(/TotalTime: (\d+)/)) : null,
    waitTimeMs: pega(/WaitTime: (\d+)/) ? Number(pega(/WaitTime: (\d+)/)) : null,
    erro: /Error|unable to resolve/i.test(saida) ? saida.trim() : null,
  };
}

async function esperarLinhaDaTela(id, t0, ms = 20_000) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    const txt = A.sh('logcat -d -s ReactNativeJS', { tentativas: 2 });
    const achadas = [...txt.matchAll(/VIAGEM_TELA id=(\S+) achada=(\d) epoch_ms=(\d+)/g)].filter(
      (m) => m[1] === id && Number(m[3]) >= t0,
    );
    if (achadas.length) return { achada: achadas[0][2] === '1', epochMs: Number(achadas[0][3]) };
    await A.dormir(250);
  }
  return null;
}

function lerTela() {
  const xml = A.arvoreDaTela();
  const ler = (idNo) => A.achar(xml, (n) => n.id === idNo)?.texto ?? null;
  return {
    xml,
    idNaTela: ler('viagem-id'),
    nomeNaTela: ler('viagem-nome'),
    naoEncontrada: ler('viagem-nao-encontrada') !== null,
    invalida: ler('viagem-invalida') !== null,
  };
}

const teveFalha = () => /FATAL EXCEPTION|Process com\.campinguim\.prova .*has died|ANR in com\.campinguim\.prova/.test(A.sh('logcat -d -b crash,main -t 4000', { tentativas: 2 }));

// Fecha o app como uma pessoa: tira da lista de recentes. O deslize no emulador é instável
// (achado da F0-3); a remoção da tarefa pelo sistema é a mesma operação. Último recurso:
// "forçar parada". Devolve o método usado ou null.
async function fecharApp() {
  A.voltarParaInicio();
  await A.dormir(700);
  const lista = A.sh('cmd activity stack list');
  const bloco = lista.split(/\n(?=RootTask)/).find((b) => b.includes('com.campinguim.prova'));
  const id = /RootTask id=(\d+)/.exec(bloco ?? '')?.[1];
  if (id) {
    A.sh(`cmd activity stack remove ${id}`);
    await A.dormir(1500);
    if (A.pidDoApp() === '') return 'remover a tarefa pelo sistema (mesma operação de tirar da lista de recentes)';
  }
  A.forcarParada();
  await A.dormir(1000);
  return A.pidDoApp() === '' ? 'forçar parada (último recurso)' : null;
}

const TELAS = {
  inicio: { link: 'campinguim://', pronto: (n) => n.id === 'titulo' },
  links: { link: 'campinguim://links', pronto: (n) => n.id === 'links-titulo' },
  lembretes: { link: 'campinguim://lembretes', pronto: (n) => n.id === 'cancelar' },
};
async function colocarNaTela(nome) {
  const t = TELAS[nome];
  A.sh(`am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${t.link}' com.campinguim.prova`);
  const ok = await A.esperarNaTela(t.pronto, { ms: 25_000 });
  if (!ok) throw new Error(`a tela ${nome} não apareceu`);
  await A.dormir(600);
}

// Prepara o estado inicial pedido: fechado, aberto em outra tela ou em segundo plano.
async function prepararEstado(estado, indice) {
  if (estado === 'fechado') {
    const metodo = await fecharApp();
    if (metodo === null || A.pidDoApp() !== '') throw new Error('não consegui fechar o app');
    return { estado, como: metodo };
  }
  const tela = Object.keys(TELAS)[indice % 3];
  await colocarNaTela(tela);
  if (estado === 'fundo') {
    A.voltarParaInicio();
    await A.dormir(1500);
    if (A.pidDoApp() === '') throw new Error('o app morreu ao ir para segundo plano');
    return { estado, como: `app em segundo plano (tela de antes: ${tela})` };
  }
  return { estado, como: `app aberto na tela "${tela}"` };
}

// Uma execução: estado inicial, abrir o link, conferir a viagem na tela, medir.
async function execucao({ i, url, esperado, estado, tipo }) {
  const prep = await prepararEstado(estado, i);
  const r = abrir(url);
  const id = esperado.id;
  const linha = await esperarLinhaDaTela(id, r.t0);
  const tela = lerTela();
  const certo =
    esperado.achar === false
      ? tela.naoEncontrada && tela.idNaTela === id
      : esperado.invalido
        ? tela.invalida
        : tela.idNaTela === id && tela.nomeNaTela === esperado.nome;
  const falha = teveFalha();
  return {
    i,
    tipo,
    link: url,
    estado_inicial: prep.estado,
    como_preparou: prep.como,
    resolvido_para: r.atividade,
    partida: r.estadoDaPartida,
    am_start_total_ms: r.totalTimeMs,
    am_start_wait_ms: r.waitTimeMs,
    toque_ate_tela_ms: linha ? linha.epochMs - r.t0 : null,
    id_na_tela: tela.idNaTela,
    nome_na_tela: tela.nomeNaTela,
    mensagem_nao_encontrada: tela.naoEncontrada,
    mensagem_invalida: tela.invalida,
    certo: certo && !falha && !r.erro,
    quebrou: falha,
    erro_do_am: r.erro,
    _saida: r.saida,
    _xml: tela.xml,
  };
}

function salvar(resultados) {
  const limpo = resultados.map(({ _saida, _xml, ...resto }) => resto);
  gravar('resultados.json', JSON.stringify(limpo, null, 2));
  return limpo;
}

const mediana = (v) => {
  const o = [...v].sort((a, b) => a - b);
  return o.length ? (o.length % 2 ? o[(o.length - 1) / 2] : (o[o.length / 2 - 1] + o[o.length / 2]) / 2) : null;
};

async function rodar(planejar, rotulo) {
  const n = Number(nExec);
  const resultados = [];
  for (let i = 1; i <= n; i++) {
    const pl = planejar(i);
    let r;
    for (let tentativa = 1; tentativa <= 2; tentativa++) {
      try {
        r = await execucao({ i, ...pl });
        break;
      } catch (e) {
        log(`execução ${i}: falha de roteiro (${e.message})${tentativa < 2 ? '; repete' : ''}`);
        r = { i, ...pl, certo: false, erro_de_roteiro: e.message };
      }
    }
    if (i === 1 || !r.certo) {
      try {
        captura(r.certo ? 'tela-da-viagem.png' : `falha-${i}.png`);
      } catch {}
    }
    if (i === 1) gravar('am-start-1.txt', `$ am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${pl.url}'\n${r._saida ?? ''}`);
    if (r._xml && (i === 1 || !r.certo)) gravar(i === 1 ? 'tela-1.xml' : `tela-falha-${i}.xml`, r._xml);
    resultados.push(r);
    log(`${rotulo} ${i}/${n}`, r.certo ? 'OK' : 'FALHOU', r.estado_inicial, r.partida ?? '', r.toque_ate_tela_ms ?? '', 'ms', r.resolvido_para ?? '');
    salvar(resultados);
  }
  const limpo = salvar(resultados);
  const certos = limpo.filter((r) => r.certo).length;
  const tempos = limpo.filter((r) => r.estado_inicial === 'fechado' && r.toque_ate_tela_ms).map((r) => r.toque_ate_tela_ms);
  const resumo = { caso, execucoes: n, certas: certos, tempoFechado: tempos.length ? { n: tempos.length, mediana_ms: mediana(tempos), pior_ms: Math.max(...tempos), melhor_ms: Math.min(...tempos) } : null };
  gravar('resumo.json', JSON.stringify(resumo, null, 2));
  log('RESUMO', JSON.stringify(resumo));
  return resumo;
}

const alvo = (i) => {
  const k = (i - 1) % 3;
  return { id: IDS[k], nome: NOMES[k] };
};

const PACOTE = A.PACOTE;
function forcarVinculo() {
  const saidas = [];
  const roda = (c) => {
    const o = A.sh(c, { tentativas: 2 });
    saidas.push(`$ ${c}\n${o}`);
  };
  roda(`pm get-app-links ${PACOTE}`);
  roda(`pm set-app-links --package ${PACOTE} 2 ${HOST}`);
  roda(`pm set-app-links-user-selection --user 0 --package ${PACOTE} true ${HOST}`);
  roda(`pm get-app-links ${PACOTE}`);
  return saidas.join('\n');
}
function zerarVinculo() {
  const saidas = [];
  const roda = (c) => saidas.push(`$ ${c}\n${A.sh(c, { tentativas: 2 })}`);
  roda(`pm set-app-links-user-selection --user 0 --package ${PACOTE} false ${HOST}`);
  roda(`pm set-app-links --package ${PACOTE} 0 ${HOST}`);
  roda(`pm reset-app-links ${PACOTE}`);
  roda(`pm get-app-links ${PACOTE}`);
  return saidas.join('\n');
}

// --- casos -------------------------------------------------------------------------------------
async function main() {
  if (!A.adb(['get-state']).includes('device')) throw new Error('aparelho não está pronto');
  log('aparelho', A.SERIAL, 'site', SITE);

  if (caso === 'semear') {
    A.sh('logcat -c');
    A.sh(`am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d 'campinguim://links?semear=1' ${PACOTE}`);
    for (let k = 0; k < 40; k++) {
      if (/VIAGENS_SEMEADAS n=3/.test(A.sh('logcat -d -s ReactNativeJS'))) {
        log('viagens semeadas');
        captura('links-viagens-de-teste.png');
        return;
      }
      await A.dormir(500);
    }
    throw new Error('as viagens não foram criadas');
  }

  if (caso === 'a') {
    // cada execução: app fechado; esquema próprio
    await rodar((i) => ({ url: esquema(alvo(i).id), esperado: alvo(i), estado: 'fechado', tipo: 'esquema' }), 'a');
  } else if (caso === 'b') {
    await rodar((i) => ({ url: esquema(alvo(i).id), esperado: alvo(i), estado: 'aberto', tipo: 'esquema' }), 'b');
  } else if (caso === 'b-fundo') {
    await rodar((i) => ({ url: esquema(alvo(i).id), esperado: alvo(i), estado: 'fundo', tipo: 'esquema' }), 'b-fundo');
  } else if (caso === 'd') {
    gravar('pm-get-app-links.txt', forcarVinculo());
    // metade fechado, metade aberto em outra tela; o link é https e o intent não diz o pacote
    await rodar(
      (i) => ({ url: https(alvo(i).id), esperado: alvo(i), estado: i % 2 ? 'fechado' : 'aberto', tipo: 'https' }),
      'd',
    );
    // O Android confirma o vínculo ao resolver o link: quem resolve é o app?
    gravar(
      'resolucao.txt',
      A.sh(`cmd package resolve-activity --brief -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${https(IDS[0])}'`),
    );
  } else if (caso === 'c') {
    // 4 combinações (esquema/https × fechado/aberto) para a viagem que não existe no aparelho
    gravar('pm-get-app-links.txt', forcarVinculo());
    const combos = [
      ['esquema', 'fechado'],
      ['esquema', 'aberto'],
      ['https', 'fechado'],
      ['https', 'aberto'],
    ];
    await rodar((i) => {
      const [tipo, estado] = combos[(i - 1) % 4];
      return {
        url: (tipo === 'esquema' ? esquema : https)(ID_INEXISTENTE),
        esperado: { id: ID_INEXISTENTE, achar: false },
        estado,
        tipo,
      };
    }, 'c');
    // link com identificador que nem parece uma viagem
    fs.mkdirSync(path.join(pasta, 'id-invalido'), { recursive: true });
    const r = await execucao({
      i: 1,
      url: esquema(ID_INVALIDO),
      esperado: { id: ID_INVALIDO, invalido: true },
      estado: 'aberto',
      tipo: 'esquema',
    });
    fs.writeFileSync(path.join(pasta, 'id-invalido', 'resultado.json'), JSON.stringify((({ _saida, _xml, ...x }) => x)(r), null, 2));
    captura('id-invalido/tela.png');
    log('id inválido:', r.certo ? 'OK' : 'FALHOU');
  } else if (caso === 'e') {
    // sem vínculo: o app declara o filtro https com autoVerify, mas o domínio não existe
    gravar('antes.txt', zerarVinculo());
    const n = Number(nExec);
    const resultados = [];
    for (let i = 1; i <= n; i++) {
      const metodo = await fecharApp();
      const r = abrir(https(IDS[0]));
      await A.dormir(3500);
      const foco = A.sh('dumpsys window', { tempoMax: 60_000 })
        .split('\n')
        .filter((l) => /mCurrentFocus|mFocusedApp/.test(l))
        .join('\n');
      const topo = A.sh('dumpsys activity activities', { tempoMax: 60_000 })
        .split('\n')
        .filter((l) => /topResumedActivity|ResumedActivity/.test(l))
        .join('\n');
      if (i === 1) {
        gravar('am-start-1.txt', r.saida);
        gravar('foco-1.txt', `${foco}\n${topo}\n`);
        gravar('tela-1.xml', A.arvoreDaTela());
        gravar(
          'resolucao.txt',
          [
            `$ cmd package resolve-activity --brief ... ${https(IDS[0])}`,
            A.sh(`cmd package resolve-activity --brief -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${https(IDS[0])}'`),
            '$ pm query-activities --brief ... (quem pode abrir o link)',
            A.sh(`pm query-activities --brief -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d '${https(IDS[0])}'`),
          ].join('\n'),
        );
      }
      resultados.push({
        i,
        link: https(IDS[0]),
        como_fechou: metodo,
        resolvido_para: r.atividade,
        erro_do_am: r.erro,
        foco: foco.trim(),
        app_ficou_na_frente: /com\.campinguim\.prova/.test(foco + topo),
        app_vivo: A.pidDoApp() !== '',
      });
      log(`e ${i}/${n}`, r.atividade ?? r.erro ?? '', foco.split('\n')[0]);
      A.voltarParaInicio();
      await A.dormir(800);
    }
    gravar('resultados.json', JSON.stringify(resultados, null, 2));
  } else {
    throw new Error(`caso desconhecido: ${caso}`);
  }
}

main().catch((e) => {
  console.error('ERRO', e.message);
  process.exit(1);
});
