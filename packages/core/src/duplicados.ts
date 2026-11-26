// Campings duplicados (SPEC, seção 6, "Duplicados (E3-20 a E3-24)"; seção 9, casos D1 a D5; PRD
// E3-21 a E3-24). Funções puras: no servidor, a similaridade usa a função do próprio banco (pg_trgm,
// E3-21); esta é a mesma conta, em TypeScript, para os testes e para a tela "é este?".

/** Premissas da seção 6 (vão para `config`). */
export const PREMISSAS_DE_DUPLICADOS = {
  /** Similaridade a partir da qual o app pergunta "é este?". */
  parecido: 0.6,
  /** Similaridade a partir da qual o par entra na fila de fusão (até `parecido`). */
  filaDeFusao: 0.45,
} as const;

const PALAVRAS_GENERICAS = new Set(['camping', 'acampamento', 'de', 'do', 'da', 'dos', 'das', 'e']);

/**
 * Nome normalizado (seção 6): minúsculas, sem acento, sem pontuação, sem as palavras "camping",
 * "acampamento", "área de", "de", "do", "da", "dos", "das" e "e", com espaços reduzidos a um.
 */
export function normalizarNome(nome: string): string {
  const palavras = nome
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter((p) => p !== '');
  const saida: string[] = [];
  for (let i = 0; i < palavras.length; i += 1) {
    if (palavras[i] === 'area' && palavras[i + 1] === 'de') {
      i += 1;
      continue;
    }
    const palavra = palavras[i] as string;
    if (!PALAVRAS_GENERICAS.has(palavra)) saida.push(palavra);
  }
  return saida.join(' ');
}

/** Trigramas no formato do pg_trgm: cada palavra com dois espaços antes e um depois. */
export function trigramas(texto: string): Set<string> {
  const conjunto = new Set<string>();
  for (const palavra of texto.toLowerCase().split(/[^a-z0-9]+/).filter((p) => p !== '')) {
    const cheia = `  ${palavra} `;
    for (let i = 0; i + 3 <= cheia.length; i += 1) conjunto.add(cheia.slice(i, i + 3));
  }
  return conjunto;
}

/** Similaridade de trigramas (a do pg_trgm): trigramas em comum sobre o total de trigramas distintos. */
export function similaridade(a: string, b: string): number {
  const ta = trigramas(a);
  const tb = trigramas(b);
  let comuns = 0;
  for (const t of ta) if (tb.has(t)) comuns += 1;
  const total = ta.size + tb.size - comuns;
  return total === 0 ? 0 : comuns / total;
}

export type ParDeCampings = 'mesmo' | 'parecido' | 'fila_de_fusao' | 'distintos';

export interface NomeNaCidade {
  readonly nome: string;
  /** Código do município no IBGE (E3-20). */
  readonly cidade: string;
}

/**
 * Compara dois nomes (seção 6): na mesma cidade, nome normalizado igual é o mesmo camping; similaridade
 * de 0,6 ou mais é parecido ("é este?"); de 0,45 até 0,6 vai para a fila de fusão; o resto é distinto.
 * Em cidades diferentes, sempre distintos (D4).
 */
export function compararCampings(a: NomeNaCidade, b: NomeNaCidade): { readonly resultado: ParDeCampings; readonly similaridade: number } {
  if (a.cidade !== b.cidade) return { resultado: 'distintos', similaridade: 0 };
  const na = normalizarNome(a.nome);
  const nb = normalizarNome(b.nome);
  if (na === nb) return { resultado: 'mesmo', similaridade: 1 };
  const s = similaridade(na, nb);
  if (s >= PREMISSAS_DE_DUPLICADOS.parecido) return { resultado: 'parecido', similaridade: s };
  if (s >= PREMISSAS_DE_DUPLICADOS.filaDeFusao) return { resultado: 'fila_de_fusao', similaridade: s };
  return { resultado: 'distintos', similaridade: s };
}

export interface CampingConhecido {
  readonly id: string;
  readonly cidade: string;
  /** Nome principal e apelidos (E3-22): a comparação usa todos. */
  readonly nomes: readonly string[];
}

export interface AvaliacaoDaCriacao {
  /** Camping com o mesmo nome normalizado na mesma cidade: a criação devolve este (D1). */
  readonly existente: string | null;
  /** Parecidos, para a pergunta "é este?" (D2), do mais parecido para o menos. */
  readonly parecidos: readonly { readonly id: string; readonly similaridade: number }[];
  /** Pares para a fila de fusão (similaridade entre 0,45 e 0,6). */
  readonly filaDeFusao: readonly { readonly id: string; readonly similaridade: number }[];
}

/** O que `camping_create` faz antes de criar (seção 8): devolve o existente ou os parecidos. */
export function avaliarCriacao(conhecidos: readonly CampingConhecido[], novo: NomeNaCidade): AvaliacaoDaCriacao {
  const parecidos: { id: string; similaridade: number }[] = [];
  const fila: { id: string; similaridade: number }[] = [];
  for (const camping of conhecidos) {
    let melhor: { resultado: ParDeCampings; similaridade: number } = { resultado: 'distintos', similaridade: 0 };
    for (const nome of camping.nomes) {
      const r = compararCampings({ nome, cidade: camping.cidade }, novo);
      if (r.resultado === 'mesmo') return { existente: camping.id, parecidos: [], filaDeFusao: [] };
      if (r.similaridade > melhor.similaridade) melhor = r;
    }
    if (melhor.resultado === 'parecido') parecidos.push({ id: camping.id, similaridade: melhor.similaridade });
    else if (melhor.resultado === 'fila_de_fusao') fila.push({ id: camping.id, similaridade: melhor.similaridade });
  }
  const ordem = (x: { similaridade: number }, y: { similaridade: number }): number => y.similaridade - x.similaridade;
  return { existente: null, parecidos: parecidos.sort(ordem), filaDeFusao: fila.sort(ordem) };
}

// ---- Fusão (D5; E3-24) ----

export interface CampingNaBase {
  readonly id: string;
  readonly nome: string;
  readonly cidade: string;
  readonly mergedIntoId: string | null;
}

export interface Apelido {
  readonly campingId: string;
  readonly nome: string;
  readonly nomeNormalizado: string;
}

/** Registro que aponta para um camping: relato, sugestão ou viagem. */
export interface Vinculo {
  readonly id: string;
  readonly campingId: string;
}

export interface BaseDeCampings {
  readonly campings: readonly CampingNaBase[];
  readonly apelidos: readonly Apelido[];
  readonly relatos: readonly Vinculo[];
  readonly sugestoes: readonly Vinculo[];
  readonly viagens: readonly Vinculo[];
}

/** O registro da fusão guarda o que mudou, para desfazer sem perda. */
export interface RegistroDeFusao {
  readonly ficaId: string;
  readonly saiId: string;
  readonly relatos: readonly string[];
  readonly sugestoes: readonly string[];
  readonly viagens: readonly string[];
  /** Apelidos que eram do camping que saiu e passaram ao que fica. */
  readonly apelidosMovidos: readonly string[];
  /** Apelido criado com o nome principal do camping que saiu. */
  readonly apelidoCriado: string;
}

export class ErroDeFusao extends Error {
  override name = 'ErroDeFusao';
}

/**
 * Funde dois campings (seção 6): relatos, sugestões e viagens passam ao que fica; o nome do outro e os
 * apelidos dele viram apelidos do que fica; `merged_into_id` aponta o destino.
 */
export function fundirCampings(base: BaseDeCampings, ficaId: string, saiId: string): { readonly base: BaseDeCampings; readonly registro: RegistroDeFusao } {
  if (ficaId === saiId) throw new ErroDeFusao('um camping não se funde com ele mesmo');
  const fica = base.campings.find((c) => c.id === ficaId);
  const sai = base.campings.find((c) => c.id === saiId);
  if (!fica || !sai) throw new ErroDeFusao('camping não encontrado');
  if (fica.mergedIntoId !== null || sai.mergedIntoId !== null) throw new ErroDeFusao('camping já fundido');

  const mover = (vinculos: readonly Vinculo[]): { lista: Vinculo[]; movidos: string[] } => {
    const movidos: string[] = [];
    const lista = vinculos.map((v) => {
      if (v.campingId !== saiId) return v;
      movidos.push(v.id);
      return { ...v, campingId: ficaId };
    });
    return { lista, movidos };
  };
  const relatos = mover(base.relatos);
  const sugestoes = mover(base.sugestoes);
  const viagens = mover(base.viagens);
  const apelidosMovidos = base.apelidos.filter((a) => a.campingId === saiId).map((a) => a.nome);

  return {
    base: {
      campings: base.campings.map((c) => (c.id === saiId ? { ...c, mergedIntoId: ficaId } : c)),
      apelidos: [
        ...base.apelidos.map((a) => (a.campingId === saiId ? { ...a, campingId: ficaId } : a)),
        { campingId: ficaId, nome: sai.nome, nomeNormalizado: normalizarNome(sai.nome) },
      ],
      relatos: relatos.lista,
      sugestoes: sugestoes.lista,
      viagens: viagens.lista,
    },
    registro: {
      ficaId,
      saiId,
      relatos: relatos.movidos,
      sugestoes: sugestoes.movidos,
      viagens: viagens.movidos,
      apelidosMovidos,
      apelidoCriado: sai.nome,
    },
  };
}

/** Desfaz uma fusão pelo registro (seção 6): cada coisa volta ao camping de antes. */
export function desfazerFusao(base: BaseDeCampings, registro: RegistroDeFusao): BaseDeCampings {
  const voltar = (vinculos: readonly Vinculo[], ids: readonly string[]): Vinculo[] =>
    vinculos.map((v) => (ids.includes(v.id) && v.campingId === registro.ficaId ? { ...v, campingId: registro.saiId } : v));
  // O apelido criado foi o último com aquele nome no camping que fica; os movidos voltam, um por nome registrado.
  const criado = base.apelidos.findLastIndex((a) => a.campingId === registro.ficaId && a.nome === registro.apelidoCriado);
  const aVoltar = [...registro.apelidosMovidos];
  const apelidos: Apelido[] = [];
  base.apelidos.forEach((a, i) => {
    if (i === criado) return;
    const k = a.campingId === registro.ficaId ? aVoltar.indexOf(a.nome) : -1;
    if (k < 0) {
      apelidos.push(a);
      return;
    }
    aVoltar.splice(k, 1);
    apelidos.push({ ...a, campingId: registro.saiId });
  });
  return {
    campings: base.campings.map((c) => (c.id === registro.saiId ? { ...c, mergedIntoId: null } : c)),
    apelidos,
    relatos: voltar(base.relatos, registro.relatos),
    sugestoes: voltar(base.sugestoes, registro.sugestoes),
    viagens: voltar(base.viagens, registro.viagens),
  };
}
