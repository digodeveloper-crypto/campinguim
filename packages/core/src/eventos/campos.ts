// Tipos de valor que uma propriedade de evento aceita. Nenhum deles é texto livre: cada propriedade
// é uma lista fechada de valores, um número inteiro, um verdadeiro ou falso, ou um identificador
// de formato fixo (chave do catálogo, id, código do IBGE, resumo). Nome, e-mail, texto digitado e
// nome de camping não cabem em nenhum (SPEC, seção 12).

export interface CampoEnum<V extends readonly string[] = readonly string[]> {
  readonly tipo: 'enum';
  readonly valores: V;
}
export interface CampoInteiro {
  readonly tipo: 'inteiro';
  readonly min: number;
  readonly max: number;
}
export interface CampoSimples {
  readonly tipo: 'booleano' | 'verdadeiro' | 'identificador' | 'uuid' | 'ibge' | 'resumo' | 'faixa' | 'canal';
}
export type CampoBase = CampoEnum | CampoInteiro | CampoSimples;
export type Campo = CampoBase & { readonly opcional?: true };

/** Valor que o TypeScript espera para um campo. */
export type ValorDe<C> = C extends { readonly tipo: 'enum'; readonly valores: infer V extends readonly string[] }
  ? V[number]
  : C extends { readonly tipo: 'inteiro' }
    ? number
    : C extends { readonly tipo: 'booleano' }
      ? boolean
      : C extends { readonly tipo: 'verdadeiro' }
        ? true
        : string;

/** Construtores dos campos, para o catálogo ficar legível e o TypeScript guardar os valores literais. */
export const campo = {
  enum: <const V extends readonly string[]>(valores: V) => ({ tipo: 'enum', valores }) as const,
  inteiro: (min = 0, max = 9999) => ({ tipo: 'inteiro', min, max }) as const,
  booleano: () => ({ tipo: 'booleano' }) as const,
  /** Só `true`: a propriedade existe para marcar um caso (por exemplo, item criado pela pessoa). */
  verdadeiro: () => ({ tipo: 'verdadeiro' }) as const,
  /** Chave do catálogo ou do fato: minúsculas, números e sublinhado (por exemplo, `bateria_portatil`). */
  identificador: () => ({ tipo: 'identificador' }) as const,
  uuid: () => ({ tipo: 'uuid' }) as const,
  /** Código de município do IBGE: 7 dígitos. */
  ibge: () => ({ tipo: 'ibge' }) as const,
  /** Resumo SHA-256 em 64 letras hexadecimais minúsculas. */
  resumo: () => ({ tipo: 'resumo' }) as const,
  /** Faixa de valor (`amount_band`): uma das faixas da configuração. */
  faixa: () => ({ tipo: 'faixa' }) as const,
  /** Canal de origem da instalação: um dos canais da configuração. */
  canal: () => ({ tipo: 'canal' }) as const,
  opcional: <const C extends CampoBase>(c: C) => ({ ...c, opcional: true }) as C & { readonly opcional: true },
};

const IDENTIFICADOR = /^[a-z][a-z0-9_]{0,63}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const IBGE = /^\d{7}$/;
const RESUMO = /^[0-9a-f]{64}$/;

export interface ContextoDeValidacao {
  readonly faixas: readonly string[];
  readonly canais: readonly string[];
}

/**
 * Confere um valor contra o campo. Devolve `null` quando serve, ou o motivo da recusa. O motivo
 * nunca repete o valor recebido: um valor recusado pode ser justamente um dado pessoal.
 */
export function motivoDaRecusa(c: Campo, valor: unknown, contexto: ContextoDeValidacao): string | null {
  switch (c.tipo) {
    case 'enum':
      return typeof valor === 'string' && c.valores.includes(valor) ? null : `precisa ser um destes valores: ${c.valores.join(', ')}`;
    case 'inteiro':
      return typeof valor === 'number' && Number.isSafeInteger(valor) && valor >= c.min && valor <= c.max
        ? null
        : `precisa ser um número inteiro de ${c.min} a ${c.max}`;
    case 'booleano':
      return typeof valor === 'boolean' ? null : 'precisa ser verdadeiro ou falso';
    case 'verdadeiro':
      return valor === true ? null : 'precisa ser verdadeiro';
    case 'identificador':
      return typeof valor === 'string' && IDENTIFICADOR.test(valor)
        ? null
        : 'precisa ser um identificador: minúsculas, números e sublinhado, até 64 caracteres, começando por letra';
    case 'uuid':
      return typeof valor === 'string' && UUID.test(valor) ? null : 'precisa ser um identificador no formato UUID, em minúsculas';
    case 'ibge':
      return typeof valor === 'string' && IBGE.test(valor) ? null : 'precisa ser o código do IBGE, 7 dígitos';
    case 'resumo':
      return typeof valor === 'string' && RESUMO.test(valor) ? null : 'precisa ser um resumo SHA-256 em 64 caracteres hexadecimais minúsculos';
    case 'faixa':
      return typeof valor === 'string' && contexto.faixas.includes(valor) ? null : `precisa ser uma das faixas: ${contexto.faixas.join(', ')}`;
    case 'canal':
      return typeof valor === 'string' && contexto.canais.includes(valor) ? null : `precisa ser um dos canais: ${contexto.canais.join(', ')}`;
  }
}
