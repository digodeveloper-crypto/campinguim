// Interpretador pequeno das expressões do catálogo (SPEC, seção 5, "Formato do arquivo"): `when` e
// `qty` são expressões sobre as variáveis da viagem, lidas por este interpretador, sem execução de
// código livre (nada de eval nem Function).
//
// Gramática, da menor para a maior precedência:
//   ou      := e ('ou' e)*
//   e       := nao ('e' nao)*
//   nao     := 'nao' nao | comp
//   comp    := soma (('==' | '!=' | '<' | '<=' | '>' | '>=') soma)?
//   soma    := produto (('+' | '-') produto)*
//   produto := unario (('*' | '/') unario)*
//   unario  := '-' unario | primario
//   primario:= número | 'texto' | 'sempre' | variável | função '(' args ')' | '(' ou ')'
//
// Funções: `teto(x)` arredonda para cima (o `teto` da SPEC) e `se(condição, a, b)`.
// Os tipos são conferidos antes de avaliar: uma expressão com variável desconhecida, função
// desconhecida ou mistura de tipos é recusada ao carregar o catálogo, não no meio da geração.

export type TipoDeValor = 'numero' | 'logico' | 'texto';
export type Valor = number | boolean | string;

export type No =
  | { tipo: 'numero'; valor: number }
  | { tipo: 'texto'; valor: string }
  | { tipo: 'logico'; valor: boolean }
  | { tipo: 'variavel'; nome: string }
  | { tipo: 'funcao'; nome: 'teto' | 'se'; argumentos: No[] }
  | { tipo: 'unario'; operador: '-' | 'nao'; operando: No }
  | { tipo: 'binario'; operador: Operador; esquerda: No; direita: No };

type Operador = '+' | '-' | '*' | '/' | '==' | '!=' | '<' | '<=' | '>' | '>=' | 'e' | 'ou';

export class ErroDeExpressao extends Error {
  override name = 'ErroDeExpressao';
}

type Simbolo =
  | { tipo: 'numero'; valor: number }
  | { tipo: 'texto'; valor: string }
  | { tipo: 'nome'; valor: string }
  | { tipo: 'sinal'; valor: string }
  | { tipo: 'fim' };

const SINAIS = ['==', '!=', '<=', '>=', '<', '>', '+', '-', '*', '/', '(', ')', ','];

function separar(fonte: string): Simbolo[] {
  const simbolos: Simbolo[] = [];
  let i = 0;
  while (i < fonte.length) {
    const c = fonte.charAt(i);
    if (c === ' ') {
      i += 1;
      continue;
    }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(fonte.slice(i));
      const texto = m?.[0] ?? c;
      simbolos.push({ tipo: 'numero', valor: Number(texto) });
      i += texto.length;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const texto = /^[A-Za-z_][A-Za-z0-9_]*/.exec(fonte.slice(i))?.[0] ?? c;
      simbolos.push({ tipo: 'nome', valor: texto });
      i += texto.length;
      continue;
    }
    if (c === "'") {
      const fim = fonte.indexOf("'", i + 1);
      if (fim < 0) throw new ErroDeExpressao(`texto sem aspa de fechamento em "${fonte}"`);
      simbolos.push({ tipo: 'texto', valor: fonte.slice(i + 1, fim) });
      i = fim + 1;
      continue;
    }
    const sinal = SINAIS.find((s) => fonte.startsWith(s, i));
    if (!sinal) throw new ErroDeExpressao(`caractere inesperado "${c}" em "${fonte}"`);
    simbolos.push({ tipo: 'sinal', valor: sinal });
    i += sinal.length;
  }
  simbolos.push({ tipo: 'fim' });
  return simbolos;
}

/** Lê a expressão e devolve a árvore. Não avalia nada. */
export function analisar(fonte: string): No {
  const simbolos = separar(fonte);
  let pos = 0;
  const atual = (): Simbolo => simbolos[pos] ?? { tipo: 'fim' };
  const ehSinal = (valor: string): boolean => {
    const s = atual();
    return s.tipo === 'sinal' && s.valor === valor;
  };
  const ehPalavra = (valor: string): boolean => {
    const s = atual();
    return s.tipo === 'nome' && s.valor === valor;
  };
  const esperarSinal = (valor: string): void => {
    if (!ehSinal(valor)) throw new ErroDeExpressao(`esperava "${valor}" em "${fonte}"`);
    pos += 1;
  };

  function ou(): No {
    let no = e();
    while (ehPalavra('ou')) {
      pos += 1;
      no = { tipo: 'binario', operador: 'ou', esquerda: no, direita: e() };
    }
    return no;
  }
  function e(): No {
    let no = nao();
    while (ehPalavra('e')) {
      pos += 1;
      no = { tipo: 'binario', operador: 'e', esquerda: no, direita: nao() };
    }
    return no;
  }
  function nao(): No {
    if (ehPalavra('nao')) {
      pos += 1;
      return { tipo: 'unario', operador: 'nao', operando: nao() };
    }
    return comp();
  }
  function comp(): No {
    const esquerda = soma();
    const s = atual();
    if (s.tipo === 'sinal' && ['==', '!=', '<', '<=', '>', '>='].includes(s.valor)) {
      pos += 1;
      return { tipo: 'binario', operador: s.valor as Operador, esquerda, direita: soma() };
    }
    return esquerda;
  }
  function soma(): No {
    let no = produto();
    for (;;) {
      const s = atual();
      if (s.tipo !== 'sinal' || (s.valor !== '+' && s.valor !== '-')) return no;
      pos += 1;
      no = { tipo: 'binario', operador: s.valor, esquerda: no, direita: produto() };
    }
  }
  function produto(): No {
    let no = unario();
    for (;;) {
      const s = atual();
      if (s.tipo !== 'sinal' || (s.valor !== '*' && s.valor !== '/')) return no;
      pos += 1;
      no = { tipo: 'binario', operador: s.valor, esquerda: no, direita: unario() };
    }
  }
  function unario(): No {
    if (ehSinal('-')) {
      pos += 1;
      return { tipo: 'unario', operador: '-', operando: unario() };
    }
    return primario();
  }
  function primario(): No {
    const s = atual();
    if (s.tipo === 'numero') {
      pos += 1;
      return { tipo: 'numero', valor: s.valor };
    }
    if (s.tipo === 'texto') {
      pos += 1;
      return { tipo: 'texto', valor: s.valor };
    }
    if (s.tipo === 'sinal' && s.valor === '(') {
      pos += 1;
      const no = ou();
      esperarSinal(')');
      return no;
    }
    if (s.tipo === 'nome') {
      pos += 1;
      if (s.valor === 'sempre') return { tipo: 'logico', valor: true };
      if (['e', 'ou', 'nao'].includes(s.valor)) {
        throw new ErroDeExpressao(`"${s.valor}" fora de lugar em "${fonte}"`);
      }
      if (ehSinal('(')) {
        if (s.valor !== 'teto' && s.valor !== 'se') {
          throw new ErroDeExpressao(`função desconhecida "${s.valor}" em "${fonte}"`);
        }
        pos += 1;
        const argumentos: No[] = [ou()];
        while (ehSinal(',')) {
          pos += 1;
          argumentos.push(ou());
        }
        esperarSinal(')');
        return { tipo: 'funcao', nome: s.valor, argumentos };
      }
      return { tipo: 'variavel', nome: s.valor };
    }
    throw new ErroDeExpressao(`expressão incompleta: "${fonte}"`);
  }

  const raiz = ou();
  if (atual().tipo !== 'fim') throw new ErroDeExpressao(`sobra texto depois da expressão em "${fonte}"`);
  return raiz;
}

/** Confere os tipos da árvore contra as variáveis conhecidas e devolve o tipo do resultado. */
export function tipoDe(no: No, variaveis: Readonly<Record<string, TipoDeValor>>): TipoDeValor {
  const exigir = (filho: No, esperado: TipoDeValor, onde: string): void => {
    const t = tipoDe(filho, variaveis);
    if (t !== esperado) throw new ErroDeExpressao(`${onde} espera ${esperado}, recebeu ${t}`);
  };
  switch (no.tipo) {
    case 'numero':
    case 'texto':
    case 'logico':
      return no.tipo;
    case 'variavel': {
      const t = variaveis[no.nome];
      if (!t) throw new ErroDeExpressao(`variável desconhecida "${no.nome}"`);
      return t;
    }
    case 'funcao':
      if (no.nome === 'teto') {
        if (no.argumentos.length !== 1) throw new ErroDeExpressao('teto() recebe um argumento');
        exigir(no.argumentos[0] as No, 'numero', 'teto()');
        return 'numero';
      } else {
        const [condicao, entao, senao] = no.argumentos;
        if (no.argumentos.length !== 3 || !condicao || !entao || !senao) {
          throw new ErroDeExpressao('se() recebe três argumentos');
        }
        exigir(condicao, 'logico', 'se()');
        const t = tipoDe(entao, variaveis);
        exigir(senao, t, 'se()');
        return t;
      }
    case 'unario':
      exigir(no.operando, no.operador === 'nao' ? 'logico' : 'numero', no.operador);
      return no.operador === 'nao' ? 'logico' : 'numero';
    case 'binario': {
      const op = no.operador;
      if (op === 'e' || op === 'ou') {
        exigir(no.esquerda, 'logico', op);
        exigir(no.direita, 'logico', op);
        return 'logico';
      }
      if (op === '==' || op === '!=') {
        const t = tipoDe(no.esquerda, variaveis);
        exigir(no.direita, t, op);
        return 'logico';
      }
      exigir(no.esquerda, 'numero', op);
      exigir(no.direita, 'numero', op);
      return op === '<' || op === '<=' || op === '>' || op === '>=' ? 'logico' : 'numero';
    }
  }
}

/** Avalia a árvore com os valores das variáveis. Supõe que `tipoDe` já aceitou a árvore. */
export function avaliar(no: No, valores: Readonly<Record<string, Valor>>): Valor {
  const num = (filho: No): number => avaliar(filho, valores) as number;
  const log = (filho: No): boolean => avaliar(filho, valores) as boolean;
  switch (no.tipo) {
    case 'numero':
    case 'texto':
    case 'logico':
      return no.valor;
    case 'variavel': {
      const v = valores[no.nome];
      if (v === undefined) throw new ErroDeExpressao(`variável sem valor: "${no.nome}"`);
      return v;
    }
    case 'funcao':
      if (no.nome === 'teto') return Math.ceil(num(no.argumentos[0] as No));
      return log(no.argumentos[0] as No) ? avaliar(no.argumentos[1] as No, valores) : avaliar(no.argumentos[2] as No, valores);
    case 'unario':
      return no.operador === 'nao' ? !log(no.operando) : -num(no.operando);
    case 'binario':
      switch (no.operador) {
        case 'e':
          return log(no.esquerda) && log(no.direita);
        case 'ou':
          return log(no.esquerda) || log(no.direita);
        case '==':
          return avaliar(no.esquerda, valores) === avaliar(no.direita, valores);
        case '!=':
          return avaliar(no.esquerda, valores) !== avaliar(no.direita, valores);
        case '<':
          return num(no.esquerda) < num(no.direita);
        case '<=':
          return num(no.esquerda) <= num(no.direita);
        case '>':
          return num(no.esquerda) > num(no.direita);
        case '>=':
          return num(no.esquerda) >= num(no.direita);
        case '+':
          return num(no.esquerda) + num(no.direita);
        case '-':
          return num(no.esquerda) - num(no.direita);
        case '*':
          return num(no.esquerda) * num(no.direita);
        case '/': {
          const divisor = num(no.direita);
          if (divisor === 0) throw new ErroDeExpressao('divisão por zero');
          return num(no.esquerda) / divisor;
        }
      }
  }
}

/** Visita todos os nós da árvore (para conferências extras, como os textos comparados). */
export function visitar(no: No, visita: (no: No) => void): void {
  visita(no);
  if (no.tipo === 'funcao') no.argumentos.forEach((a) => visitar(a, visita));
  else if (no.tipo === 'unario') visitar(no.operando, visita);
  else if (no.tipo === 'binario') {
    visitar(no.esquerda, visita);
    visitar(no.direita, visita);
  }
}

/** Expressão lida e conferida, pronta para avaliar muitas vezes. */
export interface ExpressaoCompilada {
  readonly fonte: string;
  readonly tipo: TipoDeValor;
  readonly arvore: No;
  avaliar(valores: Readonly<Record<string, Valor>>): Valor;
}

export function compilar(fonte: string, variaveis: Readonly<Record<string, TipoDeValor>>): ExpressaoCompilada {
  const arvore = analisar(fonte);
  const tipo = tipoDe(arvore, variaveis);
  return { fonte, tipo, arvore, avaliar: (valores) => avaliar(arvore, valores) };
}
