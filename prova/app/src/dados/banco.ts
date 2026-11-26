import '@azure/core-asynciterator-polyfill';

import {
  PowerSyncDatabase,
  UpdateType,
  type AbstractPowerSyncDatabase,
  type CrudEntry,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
} from '@powersync/react-native';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { config } from '../config';
import { esquema } from './esquema';
import { registrar } from './registro';

// Banco no aparelho (SQLite pelo OP-SQLite) ligado ao serviço PowerSync local.
// A lista funciona só com o que está aqui; a rede é usada em segundo plano (SPEC, seção 4).
export const banco = new PowerSyncDatabase({
  schema: esquema,
  database: { dbFilename: 'campinguim-prova.db' },
});

// Sessão de login guardada no banco do aparelho (tabela só local), para continuar logado depois
// de fechar e reabrir o app.
const armazenamentoDaSessao = {
  async getItem(chave: string): Promise<string | null> {
    const linha = await banco.getOptional<{ valor: string }>('select valor from sessao_local where id = ?', [chave]);
    return linha?.valor ?? null;
  },
  async setItem(chave: string, valor: string): Promise<void> {
    await banco.execute('insert or replace into sessao_local (id, valor) values (?, ?)', [chave, valor]);
  },
  async removeItem(chave: string): Promise<void> {
    await banco.execute('delete from sessao_local where id = ?', [chave]);
  },
};

// Toda chamada ao servidor tem prazo (20 s): com a rede ainda voltando, uma conexão pode ficar
// pendurada sem resposta; com prazo, ela é abandonada e a fila tenta de novo.
const fetchComPrazo: typeof fetch = (entrada, opcoes) => {
  const controle = new AbortController();
  const prazo = setTimeout(() => controle.abort(), 20_000);
  opcoes?.signal?.addEventListener?.('abort', () => controle.abort());
  return fetch(entrada, { ...opcoes, signal: controle.signal }).finally(() => clearTimeout(prazo));
};

export const supabase: SupabaseClient = createClient(config.urlApi, config.supabaseChavePublica, {
  auth: { persistSession: true, storage: armazenamentoDaSessao, autoRefreshToken: true, detectSessionInUrl: false },
  global: { fetch: fetchComPrazo },
});

// Até quantas alterações vão juntas num envio.
const LOTE = 100;

type Resultado = { change_id: string; status: 'applied' | 'rejected' | 'duplicate'; reason?: string; first_status?: string };

function idDaAlteracao(op: CrudEntry): string {
  try {
    const meta = op.metadata ? (JSON.parse(op.metadata) as { c?: string }) : {};
    if (meta.c) return meta.c;
  } catch {
    // cai no erro abaixo
  }
  throw new Error(`alteração sem identificador (fila ${op.clientId})`);
}

// Teste rápido (2 s) de que o servidor responde. Sem ele, a renovação do login feita offline
// entra na espera progressiva da biblioteca de login (até ~30 s) e atrasa o envio mesmo depois
// de a rede voltar. Offline, o erro é imediato e o PowerSync tenta de novo em poucos segundos.
// O registro "rede" marca quando o app volta a alcançar o servidor (medida da prova).
let alcancavel: boolean | null = null;
async function servidorAlcancavel(): Promise<void> {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), 2000);
  try {
    await fetch(`${config.urlApi}/auth/v1/health`, { signal: controle.signal });
    if (alcancavel !== true) registrar('rede', { ok: true });
    alcancavel = true;
  } catch (erro) {
    if (alcancavel !== false) registrar('rede', { ok: false });
    alcancavel = false;
    throw erro;
  } finally {
    clearTimeout(limite);
  }
}

// Prazo de 25 s para um envio: se a resposta não vier (rede cortada no meio, S8), o envio falha e
// o PowerSync tenta de novo. Reenviar é seguro: o servidor ignora alteração repetida.
async function comPrazo<T>(promessa: PromiseLike<T>, ms = 25_000): Promise<T> {
  let prazo: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promessa),
      new Promise<never>((_, rejeitar) => {
        prazo = setTimeout(() => rejeitar(new Error('envio sem resposta no prazo')), ms);
      }),
    ]);
  } finally {
    clearTimeout(prazo);
  }
}

// Recusa por login: token vencido (401, PGRST301/303) ou chamada que chegou sem login (42501 na
// função, que só aceita quem está logado). Medido em F0-2 (P3b): com o relógio do aparelho 2 h
// adiantado, a biblioteca de login acha que o token venceu, tenta renovar e, se a renovação falha
// naquele instante, manda a chamada sem login.
function erroDeLogin(erro: { code?: string; message?: string; status?: number } | null): boolean {
  if (!erro) return false;
  return (
    erro.status === 401 ||
    /jwt|token/i.test(erro.message ?? '') ||
    erro.code === 'PGRST301' ||
    erro.code === 'PGRST303' ||
    (erro.code === '42501' && /sync_apply/.test(erro.message ?? ''))
  );
}

// Conector: credenciais da sessão para o PowerSync, e envio da fila do aparelho para a função do
// servidor que aplica as regras de conflito (`sync_apply`). Cada alteração leva o identificador
// gerado no aparelho; reenviar é sempre seguro (princípio 2).
export class ConectorSupabase implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    await servidorAlcancavel();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) return null;
    // Credencial sempre nova (orientação do PowerSync). Não depende do relógio do aparelho: se o
    // aparelho estiver com a hora errada, o token renovado continua válido para o servidor.
    const renovada = await supabase.auth.refreshSession();
    if (renovada.error || !renovada.data.session) throw renovada.error ?? new Error('sem sessão');
    return { endpoint: config.urlSincronizacao, token: renovada.data.session.access_token };
  }

  async uploadData(db: AbstractPowerSyncDatabase): Promise<void> {
    const lote = await db.getCrudBatch(LOTE);
    if (!lote) return;
    await servidorAlcancavel();
    // Nunca envia sem sessão válida (sem ela, a chamada sairia sem login e seria recusada).
    const sessao = await supabase.auth.getSession();
    if (!sessao.data.session) throw sessao.error ?? new Error('sem sessão válida para enviar');
    const alteracoes = lote.crud.map((op) => ({
      change_id: idDaAlteracao(op),
      table: op.table,
      op: op.op === UpdateType.PUT ? 'PUT' : op.op === UpdateType.PATCH ? 'PATCH' : 'DELETE',
      id: op.id,
      data: op.opData ?? {},
      prev: op.previousValues ?? undefined,
    }));
    const inicio = Date.now();
    let { data, error } = await comPrazo(supabase.rpc('sync_apply', { p_changes: alteracoes }));
    if (erroDeLogin(error)) {
      // Token vencido (por exemplo, depois de muito tempo offline, S7): renova e tenta de novo.
      registrar('envio', { token: 'vencido' });
      const renovada = await supabase.auth.refreshSession();
      if (renovada.error) throw renovada.error;
      ({ data, error } = await comPrazo(supabase.rpc('sync_apply', { p_changes: alteracoes })));
    }
    if (error) {
      registrar('envio', { erro: error.code ?? error.message });
      throw error;
    }
    const resultados = (data ?? []) as Resultado[];
    const recusadas = resultados.filter(
      (r) => r.status === 'rejected' || (r.status === 'duplicate' && r.first_status === 'rejected'),
    );
    if (recusadas.length > 0) {
      // Escrita recusada (por exemplo, a pessoa saiu da viagem; S10): a alteração sai da fila, o
      // servidor manda de volta o estado certo e a pessoa é avisada.
      await db.execute(
        "insert into aviso_local (id, tipo, quantidade, criado_em) values (uuid(), 'recusadas', ?, datetime('now'))",
        [recusadas.length],
      );
    }
    await lote.complete();
    registrar('envio', {
      n: alteracoes.length,
      aplicadas: resultados.filter((r) => r.status === 'applied').length,
      repetidas: resultados.filter((r) => r.status === 'duplicate').length,
      recusadas: recusadas.length,
      ms: Date.now() - inicio,
      resta: lote.haveMore,
    });
  }
}

export const conector = new ConectorSupabase();

let ouvindo = false;
let ultimoEstado = '';
let vigia: ReturnType<typeof setInterval> | null = null;
const OPCOES_DE_CONEXAO = { retryDelayMs: 2000, connectTimeoutMs: 15000 };

// Vigia de rede: a cada 5 s, um teste rápido do servidor. Quando a rede volta depois de cair, a
// conexão de recebimento é refeita. Medido em F0-2: depois do modo avião, o canal de recebimento
// podia ficar "pendurado" (o app enviava a fila, mas não recebia mais nada do servidor), porque a
// conexão antiga morreu sem aviso. No app de verdade, a troca de rede viria do sistema (NetInfo).
function ligarVigia() {
  if (vigia) return;
  let estavaFora = false;
  let reconectarPendente = false;
  vigia = setInterval(() => {
    servidorAlcancavel()
      .then(() => {
        if (estavaFora) {
          estavaFora = false;
          reconectarPendente = true;
        }
        // Só refaz a conexão quando ela parece de pé ("conectado") mas pode estar morta, e
        // nenhum envio está em andamento: reconectar no meio de um envio prendia a
        // sincronização (P8). Com envio em andamento, espera ele terminar. Se a conexão já
        // está caída, o PowerSync tenta de novo sozinho.
        const st = banco.currentStatus;
        if (!reconectarPendente || st.dataFlowStatus?.uploading) return;
        reconectarPendente = false;
        if (st.connected) {
          registrar('reconectar', {});
          banco.connect(conector, OPCOES_DE_CONEXAO).catch(() => undefined);
        }
      })
      .catch(() => {
        estavaFora = true;
      });
  }, 5000);
}

// Liga a sincronização se houver sessão guardada. Pode ser chamada mais de uma vez.
// Olha a sessão guardada, e não `getSession()`: aberto sem internet e com o token vencido, o
// `getSession()` tenta renovar, falha e devolve "sem sessão", e a sincronização nunca ligaria.
// Ligada, ela tenta de novo sozinha até a rede voltar (fetchCredentials lança erro offline).
export async function iniciarSincronizacao(): Promise<boolean> {
  const guardada = await banco.getOptional<{ n: number }>('select count(*) as n from sessao_local');
  if (!guardada?.n) return false;
  if (!ouvindo) {
    ouvindo = true;
    // Mudanças de estado da conexão vão para o registro técnico da prova.
    banco.registerListener({
      statusChanged: (st) => {
        const erro = st.dataFlowStatus?.downloadError ?? st.dataFlowStatus?.uploadError;
        const resumo = `${st.connected}|${st.connecting}|${erro?.message ?? ''}`;
        if (resumo === ultimoEstado) return;
        ultimoEstado = resumo;
        registrar('conexao', { conectado: st.connected, conectando: st.connecting, erro: erro?.message?.slice(0, 90) });
      },
    });
  }
  // Nova tentativa a cada 2 s quando a conexão cai (padrão do PowerSync: 5 s). Tentativa de
  // conexão que não responde em 15 s é abandonada e refeita (padrão: 30 s). Medido em F0-2: logo
  // depois de sair do modo avião, uma tentativa feita com a rede ainda voltando pode ficar
  // pendurada até o limite. Com 8 s, o pedido de ponto de confirmação ao servidor estourava com
  // a máquina carregada; 15 s cobre os dois casos.
  ligarVigia();
  await banco.connect(conector, OPCOES_DE_CONEXAO);
  return true;
}

export async function versaoDoMotor(): Promise<string> {
  const linha = await banco.get<{ v: string }>('select powersync_rs_version() as v');
  return linha.v;
}
