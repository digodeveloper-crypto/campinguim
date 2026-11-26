// Do relato ao resumo do fato (SPEC, seção 6, "Do relato ao resumo"; seção 9, casos F1 a F9; PRD
// seção 10, "Confiança no dado do camping", E3-16 e E3-17). Funções puras: o servidor (etapa 3) as
// usa para escrever `fact_summary`; aqui nascem com os testes.
//
// Meses são `AAAA-MM` (o relato guarda só ano e mês, E3-19). A idade é contada em meses entre o mês
// atual e o mês da visita.

import { ErroDeEntrada } from './variaveis';

export type Frescor = 'recente' | 'pode_ter_mudado' | 'sem_valor';
export type OrigemDoRelato = 'camper' | 'owner_via_camper';
export type Ocasiao = 'feriado' | 'ferias' | 'fim_de_semana';

/** Premissas da seção 6 (vão para `config`). */
export const PREMISSAS_DOS_RELATOS = {
  /** Até 6 meses: "recente". */
  mesesRecente: 6,
  /** Até 12 meses: entra na conta ("pode ter mudado" depois de 6). Acima, sem valor vigente. */
  mesesValidade: 12,
  /** Peso do relato de campista e do "informado pelo camping, via campista" (0,5), em meios. */
  pesoEmMeios: { camper: 2, owner_via_camper: 1 } satisfies Record<OrigemDoRelato, number>,
  /** Relatos que contam, por conta e por camping: 2 viagens por mês (seção 8, limites). */
  viagensQueContamPorMes: 2,
} as const;

export interface Relato {
  readonly id: string;
  /** Nulo depois da exclusão da conta (o relato fica anônimo, SPEC, seção 3). */
  readonly contaId: string | null;
  readonly viagemId: string;
  readonly valor: string;
  readonly origem: OrigemDoRelato;
  readonly mesVisita: string;
  readonly ocasiao: Ocasiao;
  /** Retido pela antifraude (seção 11): não entra na conta. */
  readonly retido: boolean;
  /** Conta para o limite (FRD-03): falso quando passou do limite por conta e mês (F8). */
  readonly conta: boolean;
}

function mesEmNumero(mes: string): number {
  const m = /^(\d{4})-(\d{2})$/.exec(mes);
  const mesDoAno = Number(m?.[2]);
  if (!m || mesDoAno < 1 || mesDoAno > 12) throw new ErroDeEntrada(`mês fora do formato AAAA-MM: ${mes}`);
  return Number(m[1]) * 12 + (mesDoAno - 1);
}

/** Idade do relato em meses, entre o mês atual e o mês da visita. */
export function idadeEmMeses(mesAtual: string, mesVisita: string): number {
  const idade = mesEmNumero(mesAtual) - mesEmNumero(mesVisita);
  if (idade < 0) throw new ErroDeEntrada(`mês da visita depois do mês atual: ${mesVisita}`);
  return idade;
}

/** Frescor pela idade do último relato (seção 6, item 4): até 6 recente; até 12 pode ter mudado; acima, sem valor. */
export function frescorPelaIdade(idadeMeses: number): Frescor {
  if (idadeMeses <= PREMISSAS_DOS_RELATOS.mesesRecente) return 'recente';
  if (idadeMeses <= PREMISSAS_DOS_RELATOS.mesesValidade) return 'pode_ter_mudado';
  return 'sem_valor';
}

export interface LadoDaDivergencia {
  readonly valor: string;
  readonly contagem: number;
  readonly ultimoMes: string;
  readonly ocasioes: Readonly<Partial<Record<Ocasiao, number>>>;
}

export interface ResumoDoFato {
  /** Nulo: sem valor vigente (nenhum relato válido nos últimos 12 meses). */
  readonly valorVigente: string | null;
  readonly frescor: Frescor;
  /** Ao menos 2 relatos de contas diferentes concordando com o valor vigente. */
  readonly confirmado: boolean;
  /** Relatos que entraram na conta. */
  readonly relatosConsiderados: number;
  /** Relatos que concordam com o valor vigente. */
  readonly concordam: number;
  /** Mês do último relato considerado. */
  readonly ultimoMes: string | null;
  /** Um lado por valor, quando os relatos considerados discordam; nulo quando todos concordam. */
  readonly divergencia: readonly LadoDaDivergencia[] | null;
}

/**
 * Resume os relatos de um fato (seção 6, passos 1 a 6): entram os dos últimos 12 meses, não retidos e
 * que contam; vale a maioria, com peso 1 para campista e 0,5 para "informado pelo camping"; no empate,
 * vale o mais recente (mês da visita; no mesmo mês, o que veio depois na lista).
 */
export function resumirFato(relatos: readonly Relato[], mesAtual: string): ResumoDoFato {
  const considerados = relatos
    .map((relato, posicao) => ({ relato, posicao, idade: idadeEmMeses(mesAtual, relato.mesVisita) }))
    .filter(({ relato, idade }) => !relato.retido && relato.conta && idade <= PREMISSAS_DOS_RELATOS.mesesValidade);

  if (considerados.length === 0) {
    return { valorVigente: null, frescor: 'sem_valor', confirmado: false, relatosConsiderados: 0, concordam: 0, ultimoMes: null, divergencia: null };
  }

  interface Lado {
    peso: number;
    contagem: number;
    ultimoMes: string;
    recencia: [number, number];
    contas: Set<string>;
    ocasioes: Partial<Record<Ocasiao, number>>;
  }
  const lados = new Map<string, Lado>();
  const maisRecente = (a: [number, number], b: [number, number]): boolean => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  for (const { relato, posicao } of considerados) {
    const recencia: [number, number] = [mesEmNumero(relato.mesVisita), posicao];
    const lado = lados.get(relato.valor) ?? { peso: 0, contagem: 0, ultimoMes: relato.mesVisita, recencia, contas: new Set<string>(), ocasioes: {} };
    lado.peso += PREMISSAS_DOS_RELATOS.pesoEmMeios[relato.origem];
    lado.contagem += 1;
    if (maisRecente(recencia, lado.recencia) || lado.contagem === 1) {
      lado.recencia = recencia;
      lado.ultimoMes = relato.mesVisita;
    }
    if (relato.contaId !== null) lado.contas.add(relato.contaId);
    lado.ocasioes[relato.ocasiao] = (lado.ocasioes[relato.ocasiao] ?? 0) + 1;
    lados.set(relato.valor, lado);
  }

  let vigente: [string, Lado] | null = null;
  for (const par of lados) {
    if (!vigente || par[1].peso > vigente[1].peso || (par[1].peso === vigente[1].peso && maisRecente(par[1].recencia, vigente[1].recencia))) {
      vigente = par;
    }
  }
  const [valorVigente, ladoVigente] = vigente as [string, Lado];
  const ultimo = considerados.reduce((a, b) => (mesEmNumero(b.relato.mesVisita) > mesEmNumero(a.relato.mesVisita) ? b : a));

  return {
    valorVigente,
    frescor: frescorPelaIdade(ultimo.idade),
    confirmado: ladoVigente.contas.size >= 2,
    relatosConsiderados: considerados.length,
    concordam: ladoVigente.contagem,
    ultimoMes: ultimo.relato.mesVisita,
    divergencia:
      lados.size > 1
        ? [...lados].map(([valor, lado]) => ({ valor, contagem: lado.contagem, ultimoMes: lado.ultimoMes, ocasioes: lado.ocasioes }))
        : null,
  };
}

/**
 * Se um relato novo conta para o limite (seção 8: 2 viagens por mês, por conta e por camping; F8).
 * `anteriores` são os relatos da mesma conta no mesmo camping. Relato que não conta é guardado assim mesmo.
 */
export function relatoContaNoLimite(anteriores: readonly Relato[], novo: { readonly viagemId: string; readonly mesVisita: string }): boolean {
  const viagensQueContam = new Set(
    anteriores.filter((r) => r.conta && r.mesVisita === novo.mesVisita && r.viagemId !== novo.viagemId).map((r) => r.viagemId),
  );
  if (anteriores.some((r) => r.viagemId === novo.viagemId && r.mesVisita === novo.mesVisita)) {
    // Outra resposta da mesma viagem segue o que a viagem já tem.
    return anteriores.some((r) => r.viagemId === novo.viagemId && r.conta);
  }
  return viagensQueContam.size < PREMISSAS_DOS_RELATOS.viagensQueContamPorMes;
}

export interface ViagemParaRelato {
  readonly campingId: string | null;
  /** Data local em que a viagem foi criada no app (`AAAA-MM-DD`). */
  readonly criadaEm: string;
  readonly dataIda: string | null;
  readonly dataVolta: string | null;
}

export type MotivoDeInelegibilidade = 'sem_conta' | 'outro_camping' | 'sem_datas' | 'volta_nao_passou' | 'criada_depois_da_ida';

export type Elegibilidade = { readonly ok: true } | { readonly ok: false; readonly code: 'not_eligible'; readonly motivo: MotivoDeInelegibilidade };

const DATA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Quem pode relatar (E3-17; F9): conta logada, viagem registrada para aquele camping, data de volta já
 * passada e viagem criada até a data de ida. Datas locais `AAAA-MM-DD` (comparação por texto).
 */
export function verificarElegibilidade(
  viagem: ViagemParaRelato,
  campingId: string,
  contexto: { readonly logado: boolean; readonly hoje: string },
): Elegibilidade {
  for (const data of [viagem.criadaEm, contexto.hoje, viagem.dataIda, viagem.dataVolta]) {
    if (data !== null && !DATA.test(data)) throw new ErroDeEntrada(`data fora do formato AAAA-MM-DD: ${data}`);
  }
  const nao = (motivo: MotivoDeInelegibilidade): Elegibilidade => ({ ok: false, code: 'not_eligible', motivo });
  if (!contexto.logado) return nao('sem_conta');
  if (viagem.campingId !== campingId) return nao('outro_camping');
  if (viagem.dataIda === null || viagem.dataVolta === null) return nao('sem_datas');
  if (viagem.criadaEm > viagem.dataIda) return nao('criada_depois_da_ida');
  if (viagem.dataVolta >= contexto.hoje) return nao('volta_nao_passou');
  return { ok: true };
}
