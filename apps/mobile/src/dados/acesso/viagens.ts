import type { TiposDoBanco } from '../esquema';
import {
  CLIMAS,
  dataOpcional,
  FAIXAS_DE_IDADE,
  identificadorOpcional,
  inteiroNaoNegativo,
  logico,
  SITUACOES_DA_VIAGEM,
  textoObrigatorio,
  textoOpcional,
  TIPOS_DE_VIAGEM,
  umDe,
  ValorInvalido,
  type Clima,
  type FaixaDeIdade,
  type SituacaoDaViagem,
  type TipoDeViagem,
} from '../valores';
import { alterar, inserir, marcarApagado, type ContextoDeAcesso } from './contexto';

// Viagem, família e pessoas (SPEC, seção 3). Usada pela feature 1.1 (criar viagem, com e sem
// data) e pelas seguintes. As regras de negócio (quantas noites, quem entra na lista) ficam nas
// features e em `packages/core`; aqui só se grava e lê, com os valores conferidos.

export type Viagem = TiposDoBanco['trip'];
export type Familia = TiposDoBanco['trip_family'];
export type Pessoa = TiposDoBanco['trip_person'];

export type NovaPessoa = { age_band: FaixaDeIdade; label?: string | null };

export type NovaViagem = {
  name: string;
  kind: TipoDeViagem;
  start_date?: string | null;
  end_date?: string | null;
  nights: number;
  climate?: Clima | null;
  rain?: boolean | null;
  is_group?: boolean;
  source_trip_id?: string | null;
  /** A família de quem cria a viagem (a organizadora). */
  familia: { name: string; pets: number };
  pessoas: NovaPessoa[];
};

export type ViagemCriada = { tripId: string; familyId: string; personIds: string[] };

function conferirDatas(inicio: string | null, fim: string | null) {
  if (inicio && fim && fim < inicio) throw new ValorInvalido('end_date', 'antes de start_date');
}

/** Cria a viagem com a família organizadora e as pessoas, numa transação só. */
export async function criarViagem(ctx: ContextoDeAcesso, entrada: NovaViagem): Promise<ViagemCriada> {
  const inicio = dataOpcional('start_date', entrada.start_date);
  const fim = dataOpcional('end_date', entrada.end_date);
  conferirDatas(inicio, fim);
  const viagem = {
    owner_profile_id: ctx.perfilId,
    name: textoObrigatorio('name', entrada.name),
    kind: umDe('kind', entrada.kind, TIPOS_DE_VIAGEM),
    start_date: inicio,
    end_date: fim,
    nights: inteiroNaoNegativo('nights', entrada.nights),
    climate: entrada.climate === null || entrada.climate === undefined ? null : umDe('climate', entrada.climate, CLIMAS),
    rain: entrada.rain === null || entrada.rain === undefined ? null : logico('rain', entrada.rain),
    camping_id: null,
    is_group: logico('is_group', entrada.is_group ?? false),
    status: 'planning' satisfies SituacaoDaViagem,
    source_trip_id: identificadorOpcional('source_trip_id', entrada.source_trip_id),
    created_at: ctx.agora(),
  };
  const familia = {
    name: textoObrigatorio('familia.name', entrada.familia.name),
    pets: inteiroNaoNegativo('familia.pets', entrada.familia.pets),
    is_organizer: 1,
  };
  const pessoas = entrada.pessoas.map((p, i) => ({
    age_band: umDe(`pessoas[${i}].age_band`, p.age_band, FAIXAS_DE_IDADE),
    label: textoOpcional(`pessoas[${i}].label`, p.label),
  }));

  return ctx.db.writeTransaction(async (tx) => {
    const tripId = await inserir(tx, ctx, 'trip', viagem);
    const familyId = await inserir(tx, ctx, 'trip_family', { ...familia, trip_id: tripId });
    const personIds: string[] = [];
    for (const p of pessoas) personIds.push(await inserir(tx, ctx, 'trip_person', { ...p, family_id: familyId }));
    return { tripId, familyId, personIds };
  });
}

/** Viagens guardadas no aparelho (não apagadas), da mais nova para a mais antiga. */
export function listarViagens(ctx: ContextoDeAcesso): Promise<Viagem[]> {
  return ctx.db.getAll<Viagem>('select * from trip where deleted_at is null order by created_at desc, id');
}

export function obterViagem(ctx: ContextoDeAcesso, tripId: string): Promise<Viagem | null> {
  return ctx.db.getOptional<Viagem>('select * from trip where id = ? and deleted_at is null', [tripId]);
}

export type AlteracaoDaViagem = Partial<{
  name: string;
  kind: TipoDeViagem;
  start_date: string | null;
  end_date: string | null;
  nights: number;
  climate: Clima | null;
  rain: boolean | null;
  status: SituacaoDaViagem;
}>;

/** Altera só o que mudou. Devolve false se nada mudou ou a viagem não existe. */
export async function alterarViagem(ctx: ContextoDeAcesso, tripId: string, campos: AlteracaoDaViagem): Promise<boolean> {
  const c: Partial<Viagem> = {};
  if (campos.name !== undefined) c.name = textoObrigatorio('name', campos.name);
  if (campos.kind !== undefined) c.kind = umDe('kind', campos.kind, TIPOS_DE_VIAGEM);
  if (campos.start_date !== undefined) c.start_date = dataOpcional('start_date', campos.start_date);
  if (campos.end_date !== undefined) c.end_date = dataOpcional('end_date', campos.end_date);
  if (campos.nights !== undefined) c.nights = inteiroNaoNegativo('nights', campos.nights);
  if (campos.climate !== undefined) c.climate = campos.climate === null ? null : umDe('climate', campos.climate, CLIMAS);
  if (campos.rain !== undefined) c.rain = campos.rain === null ? null : logico('rain', campos.rain);
  if (campos.status !== undefined) c.status = umDe('status', campos.status, SITUACOES_DA_VIAGEM);
  return ctx.db.writeTransaction(async (tx) => {
    if (c.start_date !== undefined || c.end_date !== undefined) {
      const atual = await tx.getOptional<Viagem>('select * from trip where id = ?', [tripId]);
      conferirDatas(c.start_date !== undefined ? c.start_date : (atual?.start_date ?? null), c.end_date !== undefined ? c.end_date : (atual?.end_date ?? null));
    }
    return alterar(tx, ctx, 'trip', tripId, c);
  });
}

export function apagarViagem(ctx: ContextoDeAcesso, tripId: string): Promise<boolean> {
  return ctx.db.writeTransaction((tx) => marcarApagado(tx, ctx, 'trip', tripId));
}

// ---- Famílias e pessoas -----------------------------------------------------------------------

export function listarFamilias(ctx: ContextoDeAcesso, tripId: string): Promise<Familia[]> {
  return ctx.db.getAll<Familia>(
    'select * from trip_family where trip_id = ? and deleted_at is null order by is_organizer desc, name, id',
    [tripId],
  );
}

export async function alterarFamilia(ctx: ContextoDeAcesso, familyId: string, campos: Partial<{ name: string; pets: number }>): Promise<boolean> {
  const c: Partial<Familia> = {};
  if (campos.name !== undefined) c.name = textoObrigatorio('name', campos.name);
  if (campos.pets !== undefined) c.pets = inteiroNaoNegativo('pets', campos.pets);
  return ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_family', familyId, c));
}

/** Pessoas da viagem (de todas as famílias não apagadas). */
export function listarPessoas(ctx: ContextoDeAcesso, tripId: string): Promise<Pessoa[]> {
  return ctx.db.getAll<Pessoa>(
    `select p.* from trip_person p
       join trip_family f on f.id = p.family_id and f.deleted_at is null
      where f.trip_id = ? and p.deleted_at is null
      order by f.is_organizer desc, f.name, p.id`,
    [tripId],
  );
}

export async function adicionarPessoa(ctx: ContextoDeAcesso, familyId: string, pessoa: NovaPessoa): Promise<string> {
  const linha = {
    family_id: familyId,
    age_band: umDe('age_band', pessoa.age_band, FAIXAS_DE_IDADE),
    label: textoOpcional('label', pessoa.label),
  };
  return ctx.db.writeTransaction(async (tx) => {
    const familia = await tx.getOptional<{ id: string }>('select id from trip_family where id = ? and deleted_at is null', [familyId]);
    if (!familia) throw new ValorInvalido('family_id', 'família inexistente');
    return inserir(tx, ctx, 'trip_person', linha);
  });
}

export async function alterarPessoa(ctx: ContextoDeAcesso, personId: string, campos: Partial<NovaPessoa>): Promise<boolean> {
  const c: Partial<Pessoa> = {};
  if (campos.age_band !== undefined) c.age_band = umDe('age_band', campos.age_band, FAIXAS_DE_IDADE);
  if (campos.label !== undefined) c.label = textoOpcional('label', campos.label);
  return ctx.db.writeTransaction((tx) => alterar(tx, ctx, 'trip_person', personId, c));
}

export function removerPessoa(ctx: ContextoDeAcesso, personId: string): Promise<boolean> {
  return ctx.db.writeTransaction((tx) => marcarApagado(tx, ctx, 'trip_person', personId));
}

/** Contagem por faixa de idade, derivada das pessoas (seção 3, `trip_person`). */
export async function contarPorFaixa(ctx: ContextoDeAcesso, tripId: string): Promise<Record<FaixaDeIdade, number>> {
  const contagem = Object.fromEntries(FAIXAS_DE_IDADE.map((f) => [f, 0])) as Record<FaixaDeIdade, number>;
  for (const p of await listarPessoas(ctx, tripId)) {
    if (p.age_band && (FAIXAS_DE_IDADE as readonly string[]).includes(p.age_band)) contagem[p.age_band as FaixaDeIdade] += 1;
  }
  return contagem;
}
