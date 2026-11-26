// Validador pequeno de JSON Schema (draft 2020-12), só com as palavras que os esquemas de
// `packages/content/esquemas` usam. Serve aos testes; o app usa `validarCatalogo`, que confere mais
// (expressões, categorias, unidades).

type Esquema = Record<string, unknown>;

const PALAVRAS_CONHECIDAS = new Set([
  '$schema', 'title', '$defs', '$ref', 'type', 'enum', 'required', 'properties', 'additionalProperties',
  'propertyNames', 'items', 'minItems', 'minLength', 'pattern', 'minimum', 'anyOf',
]);

function tipoDoValor(valor: unknown): string {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  if (typeof valor === 'number') return Number.isInteger(valor) ? 'integer' : 'number';
  return typeof valor;
}

/** Devolve a lista de erros (vazia quando o dado segue o esquema). */
export function validarPeloEsquema(dado: unknown, raiz: unknown): string[] {
  const erros: string[] = [];
  const resolver = (ref: string): Esquema => {
    const caminho = ref.replace(/^#\//, '').split('/');
    let atual: unknown = raiz;
    for (const parte of caminho) atual = (atual as Record<string, unknown>)[parte];
    if (typeof atual !== 'object' || atual === null) throw new Error(`referência não encontrada: ${ref}`);
    return atual as Esquema;
  };

  const validar = (valor: unknown, esquema: Esquema, onde: string): void => {
    for (const palavra of Object.keys(esquema)) {
      if (!PALAVRAS_CONHECIDAS.has(palavra)) throw new Error(`palavra de esquema não suportada: ${palavra}`);
    }
    if (typeof esquema['$ref'] === 'string') validar(valor, resolver(esquema['$ref']), onde);
    const tipo = esquema['type'];
    if (typeof tipo === 'string') {
      const real = tipoDoValor(valor);
      if (!(real === tipo || (tipo === 'number' && real === 'integer'))) {
        erros.push(`${onde}: esperava ${tipo}, veio ${real}`);
        return;
      }
    }
    if (Array.isArray(esquema['enum']) && !esquema['enum'].includes(valor)) erros.push(`${onde}: valor fora da lista: ${JSON.stringify(valor)}`);
    if (Array.isArray(esquema['anyOf'])) {
      const algum = (esquema['anyOf'] as Esquema[]).some((alternativa) => {
        const antes = erros.length;
        validar(valor, alternativa, onde);
        const passou = erros.length === antes;
        erros.length = antes;
        return passou;
      });
      if (!algum) erros.push(`${onde}: não segue nenhuma das alternativas`);
    }
    if (typeof valor === 'string') {
      if (typeof esquema['minLength'] === 'number' && valor.length < esquema['minLength']) erros.push(`${onde}: texto curto demais`);
      if (typeof esquema['pattern'] === 'string' && !new RegExp(esquema['pattern'], 'u').test(valor)) erros.push(`${onde}: fora do padrão`);
    }
    if (typeof valor === 'number' && typeof esquema['minimum'] === 'number' && valor < esquema['minimum']) erros.push(`${onde}: abaixo do mínimo`);
    if (Array.isArray(valor)) {
      if (typeof esquema['minItems'] === 'number' && valor.length < esquema['minItems']) erros.push(`${onde}: itens de menos`);
      if (typeof esquema['items'] === 'object' && esquema['items'] !== null) {
        valor.forEach((v, i) => validar(v, esquema['items'] as Esquema, `${onde}[${i}]`));
      }
    }
    if (tipoDoValor(valor) === 'object') {
      const obj = valor as Record<string, unknown>;
      const propriedades = (esquema['properties'] ?? {}) as Record<string, Esquema>;
      for (const campo of (esquema['required'] ?? []) as string[]) {
        if (!(campo in obj)) erros.push(`${onde}: falta o campo ${campo}`);
      }
      for (const [campo, v] of Object.entries(obj)) {
        const nomes = esquema['propertyNames'] as Esquema | undefined;
        if (nomes) validar(campo, nomes, `${onde} (nome ${campo})`);
        const proprio = propriedades[campo];
        if (proprio) validar(v, proprio, `${onde}.${campo}`);
        else if (esquema['additionalProperties'] === false) erros.push(`${onde}: campo a mais: ${campo}`);
        else if (typeof esquema['additionalProperties'] === 'object') validar(v, esquema['additionalProperties'] as Esquema, `${onde}.${campo}`);
      }
    }
  };

  validar(dado, raiz as Esquema, '$');
  return erros;
}
