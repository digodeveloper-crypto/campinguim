// Validação em tempo de execução de um evento de medição. O TypeScript já barra o erro de quem
// escreve o código; esta validação barra o que o TypeScript não vê: dado vindo do armazenamento,
// de um lote recebido ou de um valor montado na hora. Regras (SPEC, seção 12):
//   - nome de evento e propriedades são fechados: o que não está no catálogo é recusado;
//   - nenhum texto livre: texto só entra em formato fixo (lista fechada, chave, id, código, resumo);
//   - dinheiro só como faixa; o valor exato nunca entra;
//   - nunca se repete na resposta o valor recusado (ele pode ser um dado pessoal).
import { type Campo, motivoDaRecusa } from './campos';
import {
  CANAIS_PADRAO,
  CATALOGO,
  type DefinicaoDeEvento,
  type EventoQualquer,
  type NomeDoEvento,
  type Variante,
} from './catalogo';
import { type ConfigDeFaixas, FAIXAS_PADRAO, rotulosDeFaixa } from './faixas';

export interface OpcoesDeValidacao {
  /** Limites das faixas de valor. Padrão: as faixas decididas de `faixas.ts`. */
  readonly faixas?: ConfigDeFaixas;
  /** Canais de origem aceitos. Padrão: a lista decidida de `catalogo.ts`. */
  readonly canais?: readonly string[];
}

export type ResultadoDaValidacao =
  | { readonly ok: true; readonly evento: EventoQualquer }
  | { readonly ok: false; readonly erros: readonly string[] };

/**
 * Nomes de propriedade que dizem "dado pessoal, texto livre ou dinheiro exato". Já seriam
 * recusados por não estarem no catálogo; a lista existe para a resposta dizer o motivo certo.
 */
const PROPRIEDADES_PROIBIDAS = new Set([
  'name',
  'nome',
  'display_name',
  'family_name',
  'email',
  'e_mail',
  'phone',
  'telefone',
  'cpf',
  'text',
  'texto',
  'note',
  'nota',
  'comment',
  'comentario',
  'suggestion',
  'sugestao',
  'camping_name',
  'nome_do_camping',
  'query',
  'busca',
  'pix',
  'pix_key',
  'chave_pix',
  'location',
  'localizacao',
  'latitude',
  'longitude',
  'amount',
  'amount_cents',
  'estimate_cents',
  'valor',
  'value',
  'invite_token',
  'token',
]);

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const ID_DO_EVENTO = /^[A-Za-z0-9_-]{8,64}$/;

function ehObjetoSimples(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function instanteValido(texto: string): boolean {
  const t = Date.parse(texto);
  return ISO_UTC.test(texto) && Number.isFinite(t) && new Date(t).toISOString() === texto;
}

/** Confere as propriedades contra uma variante. Devolve os erros (vazio quando serve). */
function errosDaVariante(
  variante: Variante,
  propriedades: Record<string, unknown>,
  contexto: { faixas: readonly string[]; canais: readonly string[] },
): string[] {
  const erros: string[] = [];
  for (const nome of Object.keys(propriedades)) {
    if (!(nome in variante)) {
      erros.push(
        PROPRIEDADES_PROIBIDAS.has(nome.toLowerCase())
          ? `propriedade "${nome}" proibida: dado pessoal, texto livre ou valor exato não entram em evento`
          : `propriedade "${nome}" não existe neste evento`,
      );
    }
  }
  for (const [nome, definicao] of Object.entries(variante) as [string, Campo][]) {
    const valor = propriedades[nome];
    if (valor === undefined) {
      if (!definicao.opcional) erros.push(`falta a propriedade "${nome}"`);
      continue;
    }
    const motivo = motivoDaRecusa(definicao, valor, contexto);
    if (motivo !== null) erros.push(`"${nome}" ${motivo}`);
  }
  return erros;
}

/** Regras que ligam duas propriedades do mesmo evento. */
function errosEntrePropriedades(nome: NomeDoEvento, propriedades: Record<string, unknown>): string[] {
  if (nome === 'return_questions_answered') {
    const { asked, answered } = propriedades;
    if (typeof asked === 'number' && typeof answered === 'number' && answered > asked) {
      return ['"answered" não pode passar de "asked"'];
    }
  }
  return [];
}

/** Valida um evento inteiro: nome, identificador, instante e propriedades. */
export function validarEvento(entrada: unknown, opcoes: OpcoesDeValidacao = {}): ResultadoDaValidacao {
  if (!ehObjetoSimples(entrada)) return { ok: false, erros: ['o evento precisa ser um objeto'] };

  const erros: string[] = [];
  for (const nome of Object.keys(entrada)) {
    if (!['id', 'nome', 'ocorridoEm', 'propriedades'].includes(nome)) erros.push(`campo "${nome}" não existe no evento`);
  }
  const { id, nome, ocorridoEm, propriedades } = entrada;
  if (typeof id !== 'string' || !ID_DO_EVENTO.test(id)) erros.push('"id" precisa ter de 8 a 64 letras, números, hífen ou sublinhado');
  if (typeof ocorridoEm !== 'string' || !instanteValido(ocorridoEm)) {
    erros.push('"ocorridoEm" precisa ser um instante ISO 8601 em UTC, com milissegundos (AAAA-MM-DDTHH:MM:SS.mmmZ)');
  }
  if (typeof nome !== 'string' || !Object.prototype.hasOwnProperty.call(CATALOGO, nome)) {
    erros.push('"nome" não é um evento do catálogo');
    return { ok: false, erros };
  }
  if (!ehObjetoSimples(propriedades)) {
    erros.push('"propriedades" precisa ser um objeto');
    return { ok: false, erros };
  }

  const nomeDoEvento = nome as NomeDoEvento;
  const definicao: DefinicaoDeEvento = CATALOGO[nomeDoEvento];
  const contexto = {
    faixas: rotulosDeFaixa(opcoes.faixas ?? FAIXAS_PADRAO),
    canais: opcoes.canais ?? CANAIS_PADRAO,
  };

  // O evento vale se bater com alguma variante. Com mais de uma, o erro mostrado é o da variante
  // que mais se aproxima (a de menos erros).
  const tentativas = definicao.variantes.map((v) => errosDaVariante(v, propriedades, contexto));
  if (!tentativas.some((e) => e.length === 0)) {
    const melhor = tentativas.reduce((a, b) => (b.length < a.length ? b : a));
    erros.push(...melhor);
    if (tentativas.length > 1) erros.push('o evento aceita só uma destas formas: com "catalog_key" ou com "is_custom"');
  } else {
    erros.push(...errosEntrePropriedades(nomeDoEvento, propriedades));
  }

  if (erros.length > 0) return { ok: false, erros };
  return { ok: true, evento: entrada as unknown as EventoQualquer };
}
