// Varredura das chaves de texto usadas no código. SÓ PARA OS TESTES (textos.test.ts): o app não
// importa este arquivo. Acha, nos arquivos do app, da página e dos roteiros do Maestro, cada
// chave do arquivo de textos que o código usa, para o teste falhar se alguma não existir.
//
// Formas reconhecidas (a chave sempre escrita por extenso, nunca montada em tempo de execução):
//   textos.lista.titulo            acesso direto (também `textos.lista`, quando a tela guarda o grupo)
//   t('lista.faltam', { n })       função de texto, com aspas simples, duplas ou crase sem ${}
//   {{textos.lista.titulo}}        marcador nos roteiros do Maestro
// Chave montada por conta própria (`t(\`lista.${x}\`)`) não é reconhecida aqui: o TypeScript
// barra, porque `t` só aceita chave do arquivo.
import fs from 'node:fs';
import path from 'node:path';

export interface UsoDeChave {
  /** Caminho do arquivo, com barras normais, relativo à raiz do repositório. */
  readonly arquivo: string;
  readonly linha: number;
  /** A chave usada, no formato "tela.chave" (ou só "tela", se o código guarda o grupo inteiro). */
  readonly chave: string;
  readonly forma: 'textos' | 't' | 'roteiro';
}

const ACESSO_DIRETO = /\btextos((?:\.[A-Za-z_]\w*)+)/g;
const CHAMADA_T = /\bt\(\s*(['"`])([A-Za-z][\w.]*)\1/g;
const MARCADOR_MAESTRO = /\{\{\s*textos\.([A-Za-z][\w.]*)\s*\}\}/g;

function linhaDe(conteudo: string, indice: number): number {
  return conteudo.slice(0, indice).split('\n').length;
}

/** Acha as chaves usadas num arquivo. Arquivo `.yaml` usa só os marcadores do Maestro. */
export function extrairUsos(conteudo: string, arquivo: string): UsoDeChave[] {
  const usos: UsoDeChave[] = [];
  const registrar = (regex: RegExp, forma: UsoDeChave['forma'], grupo: number, tirar = 0) => {
    for (const m of conteudo.matchAll(regex)) {
      const bruto = m[grupo] ?? '';
      usos.push({ arquivo, linha: linhaDe(conteudo, m.index ?? 0), chave: bruto.slice(tirar), forma });
    }
  };
  if (/\.ya?ml$/.test(arquivo)) {
    registrar(MARCADOR_MAESTRO, 'roteiro', 1);
  } else {
    registrar(ACESSO_DIRETO, 'textos', 1, 1); // tira o ponto do começo
    registrar(CHAMADA_T, 't', 2);
  }
  return usos.sort((a, b) => a.linha - b.linha);
}

/**
 * Os usos cuja chave não existe no arquivo de textos. A chave vale se o caminho termina num texto
 * ou num grupo; se passa por um texto e continua (`textos.a.b.length`), vale também.
 */
export function chavesFaltantes(arvore: unknown, usos: readonly UsoDeChave[]): UsoDeChave[] {
  return usos.filter((uso) => !chaveExiste(arvore, uso.chave));
}

function chaveExiste(arvore: unknown, chave: string): boolean {
  let atual: unknown = arvore;
  for (const parte of chave.split('.')) {
    if (typeof atual === 'string') return true; // o resto é propriedade do texto (length, ...)
    if (typeof atual !== 'object' || atual === null || !Object.prototype.hasOwnProperty.call(atual, parte)) return false;
    atual = (atual as Record<string, unknown>)[parte];
  }
  return true;
}

const PASTAS_IGNORADAS = new Set(['node_modules', 'android', 'ios', 'dist', 'build', '.expo']);

/** Arquivos com uma das extensões, nas pastas dadas (recursivo), com barras normais. */
export function listarArquivos(raiz: string, pastas: readonly string[], extensoes: readonly string[]): string[] {
  const achados: string[] = [];
  const andar = (relativo: string) => {
    const completo = path.join(raiz, relativo);
    if (!fs.existsSync(completo)) return;
    for (const entrada of fs.readdirSync(completo, { withFileTypes: true })) {
      const filho = path.posix.join(relativo.split(path.sep).join('/'), entrada.name);
      if (entrada.isDirectory()) {
        if (!PASTAS_IGNORADAS.has(entrada.name)) andar(filho);
      } else if (extensoes.some((e) => entrada.name.endsWith(e))) {
        achados.push(filho);
      }
    }
  };
  pastas.forEach((p) => andar(p));
  return achados.sort();
}

/** Lê os arquivos e junta os usos de chave de todos. */
export function usosNosArquivos(raiz: string, arquivos: readonly string[]): UsoDeChave[] {
  return arquivos.flatMap((arquivo) => extrairUsos(fs.readFileSync(path.join(raiz, arquivo), 'utf8'), arquivo));
}
