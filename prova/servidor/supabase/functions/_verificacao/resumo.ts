// Resumo do pedido (o `requestHash` da Play Integrity): SHA-256 de uma serialização estável
// do pedido, calculado do mesmo jeito no app e no servidor. Se os dois não batem, a prova é de
// outro pedido. O app tem a sua cópia em `prova/app/src/verificacao/resumo.ts`; um teste
// automático confere que as duas dão o mesmo resultado.

const VERSAO = 'campinguim-resumo-v1';

/** JSON com as chaves dos objetos em ordem, sem espaços. */
export function canonico(valor: unknown): string {
  if (valor === null || typeof valor !== 'object') return JSON.stringify(valor ?? null);
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`;
  const objeto = valor as Record<string, unknown>;
  const chaves = Object.keys(objeto)
    .filter((k) => objeto[k] !== undefined)
    .sort();
  return `{${chaves.map((k) => `${JSON.stringify(k)}:${canonico(objeto[k])}`).join(',')}}`;
}

export function textoDoPedido(funcao: string, installId: string, requestId: string, dados: unknown): string {
  return [VERSAO, funcao, installId, requestId, canonico(dados)].join('|');
}

export async function sha256Hex(texto: string): Promise<string> {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function resumoDoPedido(funcao: string, installId: string, requestId: string, dados: unknown): Promise<string> {
  return sha256Hex(textoDoPedido(funcao, installId, requestId, dados));
}
