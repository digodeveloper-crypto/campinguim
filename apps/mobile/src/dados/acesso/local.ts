import type { Executor } from '../executor';
import { identificador, identificadorOpcional, textoObrigatorio, ValorInvalido } from '../valores';
import type { ContextoDeAcesso } from './contexto';

// Tabelas só do aparelho (criadas por `migracoes.ts`; nunca sincronizam): estado do app e fila de
// eventos de medição.

// ---- Estado do app ----------------------------------------------------------------------------

export async function lerEstado(ctx: ContextoDeAcesso, chave: string): Promise<string | null> {
  const linha = await ctx.db.getOptional<{ valor: string }>('select valor from estado_local where chave = ?', [chave]);
  return linha?.valor ?? null;
}

export async function gravarEstado(ctx: ContextoDeAcesso, chave: string, valor: string): Promise<void> {
  await ctx.db.execute(
    `insert into estado_local (chave, valor, atualizado_em) values (?, ?, ?)
     on conflict (chave) do update set valor = excluded.valor, atualizado_em = excluded.atualizado_em`,
    [textoObrigatorio('chave', chave), valor, ctx.agora()],
  );
}

export async function apagarEstado(ctx: ContextoDeAcesso, chave: string): Promise<void> {
  await ctx.db.execute('delete from estado_local where chave = ?', [chave]);
}

const CHAVE_DA_INSTALACAO = 'install_id';

/**
 * Identificador aleatório desta instalação (seção 11, "Verificação do aparelho", passo 1), criado
 * na primeira vez. Não identifica a pessoa; some ao desinstalar o app.
 */
export async function obterIdDaInstalacao(ctx: ContextoDeAcesso): Promise<string> {
  return ctx.db.writeTransaction(async (tx) => {
    const atual = await tx.getOptional<{ valor: string }>('select valor from estado_local where chave = ?', [CHAVE_DA_INSTALACAO]);
    if (atual) return atual.valor;
    const novo = ctx.gerarId();
    await tx.execute('insert into estado_local (chave, valor, atualizado_em) values (?, ?, ?)', [CHAVE_DA_INSTALACAO, novo, ctx.agora()]);
    return novo;
  });
}

// ---- Eventos de medição (seção 12) ------------------------------------------------------------

/**
 * Propriedades de um evento: só identificadores e valores fechados (seção 12). A lista de eventos
 * e de propriedades aceitas é da B6; aqui só se garante a forma (um nível, valores simples).
 */
export type PropriedadesDoEvento = Record<string, string | number | boolean | null>;

export type EventoGuardado = {
  id: string;
  name: string;
  props: string;
  at: string;
  install_id: string | null;
  profile_id: string | null;
};

const NOME_DE_EVENTO = /^[a-z][a-z0-9_]*$/;

function conferirPropriedades(props: PropriedadesDoEvento): string {
  for (const [chave, valor] of Object.entries(props)) {
    if (!NOME_DE_EVENTO.test(chave)) throw new ValorInvalido(`props.${chave}`, 'nome de propriedade inválido');
    const tipo = valor === null ? 'null' : typeof valor;
    if (!['string', 'number', 'boolean', 'null'].includes(tipo)) throw new ValorInvalido(`props.${chave}`, 'valor composto não é aceito');
    if (typeof valor === 'number' && !Number.isFinite(valor)) throw new ValorInvalido(`props.${chave}`, 'número inválido');
  }
  return JSON.stringify(props);
}

/** Guarda o evento no aparelho para o envio em lote. Devolve o `id`. */
export async function guardarEvento(
  ctx: ContextoDeAcesso,
  evento: {
    name: string;
    props?: PropriedadesDoEvento;
    installId?: string | null;
    /** Identificador vindo de quem registrou o evento (a porta da B6); o mesmo `id` não é guardado duas vezes. */
    id?: string;
    /** Hora do evento (UTC, ISO 8601), quando já vem de quem registrou. */
    at?: string;
  },
): Promise<string> {
  if (!NOME_DE_EVENTO.test(evento.name)) throw new ValorInvalido('name', 'nome de evento inválido');
  const id = evento.id === undefined ? ctx.gerarId() : identificador('id', evento.id);
  if (evento.at !== undefined && Number.isNaN(Date.parse(evento.at))) throw new ValorInvalido('at', 'esperado carimbo de tempo ISO 8601');
  await ctx.db.execute(
    'insert into evento_local (id, name, props, at, install_id, profile_id) values (?, ?, ?, ?, ?, ?) on conflict (id) do nothing',
    [
    id,
    evento.name,
    conferirPropriedades(evento.props ?? {}),
    evento.at ?? ctx.agora(),
    identificadorOpcional('install_id', evento.installId),
    ctx.perfilId,
  ]);
  return id;
}

/** Os eventos mais antigos primeiro, até `limite`, para um envio. */
export async function lerLoteDeEventos(ctx: ContextoDeAcesso, limite: number): Promise<EventoGuardado[]> {
  if (!Number.isInteger(limite) || limite < 1) throw new ValorInvalido('limite', 'esperado inteiro maior que zero');
  return ctx.db.getAll<EventoGuardado>('select * from evento_local order by at, rowid limit ?', [limite]);
}

/** Apaga os eventos que o servidor confirmou. */
export async function apagarEventos(ctx: ContextoDeAcesso, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  ids.forEach((id, i) => identificador(`ids[${i}]`, id));
  await ctx.db.writeTransaction(async (tx) => {
    for (const id of ids) await tx.execute('delete from evento_local where id = ?', [id]);
  });
}

export async function contarEventos(ctx: ContextoDeAcesso): Promise<number> {
  const linha = await ctx.db.getOptional<{ n: number }>('select count(*) as n from evento_local');
  return linha?.n ?? 0;
}

// ---- Inspeção ---------------------------------------------------------------------------------

export type TabelaDoBanco = { name: string; type: 'table' | 'view' };

/**
 * Tabelas e vistas do banco, sem as internas do SQLite e do PowerSync (`ps_*`). No aparelho, as
 * tabelas sincronizadas aparecem como vistas do PowerSync; as só locais, como tabelas.
 */
export function listarTabelas(db: Executor): Promise<TabelaDoBanco[]> {
  return db.getAll<TabelaDoBanco>(
    `select name, type from sqlite_master
      where type in ('table', 'view') and substr(name, 1, 3) <> 'ps_' and substr(name, 1, 7) <> 'sqlite_'
      order by name`,
  );
}
