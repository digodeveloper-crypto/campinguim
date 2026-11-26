// Verificador automático de "sem perda" (plano da prova, D, F0-2).
//
// Entrada: o registro de alterações de cada aparelho (tabela só local `registro_local`, gravada na
// mesma transação de cada alteração), o registro técnico do servidor (`private.sync_change`, com a
// ordem de chegada) e o estado final do servidor e dos dois aparelhos.
//
// Cada alteração feita num aparelho tem de cair num destes casos:
//   1. está no servidor e nos dois aparelhos (valor final igual ao dela);
//   2. foi vencida por uma regra da seção 4, e o estado final é o que a regra manda:
//      - pack_state: o servidor marcou "concorrente, perdeu" e o estado final é mais avançado; ou
//        chegou depois outra alteração de pack_state no mesmo item;
//      - quantidade, nome, nota: chegou depois outra alteração do mesmo campo; em item do grupo, o
//        valor dela está no histórico do item;
//      - edição em item removido: o item continua removido (remoção vence) e restaurável;
//   3. foi recusada por permissão (só onde o cenário prevê, S10) e a pessoa foi avisada.
// Fora disso é perda. Alteração aplicada duas vezes é duplicação. Os dois aparelhos têm de ficar
// iguais ao servidor (tabela por tabela, linha por linha, campo por campo).
import { diferencas } from './comum.mjs';

const RANK = { todo: 0, set_aside: 1, in_car: 2 };

// Alterações de um aparelho que são desta execução (das viagens dela).
export function alteracoesDaExecucao(registro, trips, idsDeItens, idsDeAssuncoes) {
  const viagens = new Set(trips);
  return registro.filter((r) => {
    if (r.tabela === 'trip') return viagens.has(r.linha);
    if (r.tabela === 'trip_item') return idsDeItens.has(r.linha) || viagens.has(r.dados?.trip_id);
    if (r.tabela === 'item_claim') return idsDeAssuncoes.has(r.linha) || viagens.has(r.dados?.trip_id);
    return false;
  });
}

export function verificar({ trips, servidor, aparelhos, chegadas: todas, recusaPermitida = {}, semViagem = [] }) {
  const problemas = [];
  // Só as chegadas desta execução (das viagens dela). Uma alteração atrasada de outra execução não
  // entra na conta desta.
  const linhasDaExecucao = new Set([...trips, ...servidor.itens.map((i) => i.id), ...servidor.assuncoes.map((a) => a.id)]);
  const chegadas = todas.filter((c) => linhasDaExecucao.has(c.row_id) || trips.includes(c.payload?.data?.trip_id));
  const casos = { aplicada: 0, vencidaPorRegra: 0, recusadaEAvisada: 0 };
  const porId = new Map(chegadas.map((c) => [c.change_id, c]));
  const itemServidor = new Map(servidor.itens.map((i) => [i.id, i]));
  const assuncaoServidor = new Map(servidor.assuncoes.map((a) => [a.id, a]));
  const viagemServidor = new Map(servidor.viagens.map((v) => [v.id, v]));
  const idsDeItens = new Set(servidor.itens.map((i) => i.id));
  const idsDeAssuncoes = new Set(servidor.assuncoes.map((a) => a.id));
  const daExecucao = {};
  const vistas = new Set();

  // Alterações aplicadas depois desta, no mesmo item e campo (ordem de chegada no servidor).
  const depois = (chegada, linha, campo) =>
    chegadas.filter(
      (c) => c.arrival > chegada.arrival && c.status === 'applied' && c.row_id === linha && c.payload?.data && campo in c.payload.data,
    );

  for (const [nome, estado] of Object.entries(aparelhos)) {
    const minhas = alteracoesDaExecucao(estado.registro, trips, idsDeItens, idsDeAssuncoes);
    daExecucao[nome] = minhas.length;
    for (const r of minhas) {
      const quem = `${nome}:${r.c.slice(0, 8)} ${r.tabela} ${r.op} ${JSON.stringify(r.dados)}`;
      const s = porId.get(r.c);
      vistas.add(r.c);
      if (!s) {
        problemas.push(`PERDA ${quem}: não chegou ao servidor`);
        continue;
      }
      if (s.status === 'rejected') {
        const avisado = (estado.avisos ?? []).some((a) => a.tipo === 'recusadas' && a.quantidade > 0);
        if (recusaPermitida[nome] && s.reason === 'not_member' && avisado) casos.recusadaEAvisada++;
        else problemas.push(`PERDA ${quem}: recusada (${s.reason})${avisado ? '' : ' sem aviso'}`);
        continue;
      }
      if (r.tabela === 'trip') {
        if (!viagemServidor.has(r.linha)) problemas.push(`PERDA ${quem}: viagem não está no servidor`);
        else casos.aplicada++;
        continue;
      }
      if (r.tabela === 'item_claim') {
        if (!assuncaoServidor.has(r.linha)) problemas.push(`PERDA ${quem}: marcação não está no servidor`);
        else casos.aplicada++;
        continue;
      }
      const item = itemServidor.get(r.linha);
      if (!item) {
        problemas.push(`PERDA ${quem}: item não está no servidor`);
        continue;
      }
      if (r.op === 'PUT') {
        casos.aplicada++;
        continue;
      }
      let vencida = false;
      for (const [campo, valor] of Object.entries(r.dados ?? {})) {
        if (campo === 'deleted_at') {
          const querRemover = valor != null;
          const ultima = depois(s, r.linha, 'deleted_at').at(-1);
          const esperado = ultima ? ultima.payload.data.deleted_at != null : querRemover;
          if (item.removido !== esperado) problemas.push(`PERDA ${quem}: removido=${item.removido}, esperado ${esperado}`);
          if (ultima) vencida = true;
          continue;
        }
        const final = campo === 'qty' ? Number(item.qty) : item[campo];
        const meu = campo === 'qty' ? Number(valor) : valor;
        if (final === meu) continue;
        if (campo === 'pack_state') {
          if (s.outcome?.pack_state === 'concurrent_lost' && RANK[final] >= RANK[meu]) {
            vencida = true;
            continue;
          }
          if (depois(s, r.linha, 'pack_state').length > 0) {
            vencida = true;
            continue;
          }
          problemas.push(`PERDA ${quem}: pack_state final ${final}, sem regra que explique`);
          continue;
        }
        // qty, name, note: vale a última a chegar; em item do grupo, o valor perdido no histórico.
        if (depois(s, r.linha, campo).length === 0) {
          problemas.push(`PERDA ${quem}: ${campo} final ${final}, e nenhuma alteração chegou depois`);
          continue;
        }
        if (item.family_id == null) {
          const noHistorico = servidor.historico.some(
            (h) => h.item_id === r.linha && h.field === campo && (String(h.new_value) === String(meu) || String(h.old_value) === String(meu)),
          );
          if (!noHistorico) {
            problemas.push(`PERDA ${quem}: valor ${meu} de ${campo} não está no histórico do item do grupo`);
            continue;
          }
        }
        vencida = true;
      }
      if (vencida || item.removido) casos.vencidaPorRegra++;
      else casos.aplicada++;
    }
  }

  // Alterações que o servidor recebeu e nenhum aparelho registrou (não deveria existir).
  for (const c of chegadas) {
    if (!vistas.has(c.change_id)) problemas.push(`FANTASMA ${c.change_id.slice(0, 8)} ${c.table_name} ${c.op}: no servidor, sem registro em aparelho`);
  }

  // Duplicação: a mesma alteração com efeito duas vezes (histórico repetido) ou o mesmo id duas vezes.
  const hist = new Map();
  for (const h of servidor.historico) {
    const k = `${h.change_id}|${h.field}`;
    if (hist.has(k)) problemas.push(`DUPLICAÇÃO histórico ${k}`);
    hist.set(k, true);
  }
  const ids = new Set();
  for (const i of servidor.itens) {
    if (ids.has(i.id)) problemas.push(`DUPLICAÇÃO item ${i.id}`);
    ids.add(i.id);
  }

  // Os aparelhos iguais ao servidor (ou sem nada da viagem, quando saíram dela).
  const iguais = {};
  for (const [nome, estado] of Object.entries(aparelhos)) {
    const alvo = semViagem.includes(nome) ? { itens: [], assuncoes: [], historico: [], viagens: [] } : servidor;
    const d = diferencas(alvo, estado);
    iguais[nome] = d.length === 0;
    for (const x of d.slice(0, 10)) problemas.push(`DIFERENÇA servidor x ${nome}: ${x}`);
  }

  return { ok: problemas.length === 0, problemas, casos, alteracoes: daExecucao, chegadas: chegadas.length, iguais };
}
