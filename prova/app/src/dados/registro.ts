// Linhas de registro técnico da prova (F0-2), lidas pelo roteiro no computador pelo logcat
// (etiqueta ReactNativeJS). Nunca levam token, senha ou texto livre da pessoa.
export function registrar(evento: string, dados: Record<string, unknown> = {}): void {
  console.log(`[prova-sinc] ${JSON.stringify({ e: evento, ...dados })}`);
}
