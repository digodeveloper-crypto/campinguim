import type { Cofre } from './cofre';

// Chave do banco local cifrado (DEF-11; SPEC, seção 11, "No aparelho").
//
// - 32 bytes aleatórios do gerador seguro do sistema, criados no primeiro uso.
// - Guardada só no cofre do sistema, em hexadecimal. Nunca em arquivo, código ou registro.
// - Entregue ao SQLCipher como chave bruta (`x'<64 hex>'`): a chave já é aleatória, então o
//   SQLCipher pula a derivação por senha (PBKDF2), que custaria tempo em cada uma das 6 conexões
//   que o PowerSync abre.
//
// Este arquivo não importa nada nativo: os testes rodam no Node com um cofre em memória.

export const NOME_DA_CHAVE_NO_COFRE = 'campinguim.banco.chave.v1';
export const BYTES_DA_CHAVE = 32;

const HEX_DA_CHAVE = new RegExp(`^[0-9a-f]{${BYTES_DA_CHAVE * 2}}$`);

export type ChaveDoBanco = {
  /** 64 caracteres hexadecimais. Não registrar. */
  hex: string;
  /** true quando a chave acabou de ser criada (não havia chave legível no cofre). */
  nova: boolean;
};

export function bytesParaHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Forma que o SQLCipher entende como chave bruta, sem derivação por senha. */
export function chaveParaSqlcipher(hex: string): string {
  if (!HEX_DA_CHAVE.test(hex)) throw new Error('chave do banco em formato inválido');
  return `x'${hex}'`;
}

/**
 * Lê a chave do cofre; se não houver chave legível, cria uma nova e guarda antes de devolver.
 *
 * Valor ilegível ou fora do formato conta como ausente: sem a chave certa o banco antigo não abre
 * de jeito nenhum, e quem abre o banco (`banco.ts`) trata esse caso. Erro do próprio cofre (por
 * exemplo, Keystore indisponível) é repassado: nesse caso nada é criado nem apagado.
 */
export async function obterChaveDoBanco(cofre: Cofre, gerarBytes: (n: number) => Uint8Array): Promise<ChaveDoBanco> {
  const guardada = await cofre.ler(NOME_DA_CHAVE_NO_COFRE);
  if (guardada !== null && HEX_DA_CHAVE.test(guardada)) return { hex: guardada, nova: false };

  const bytes = gerarBytes(BYTES_DA_CHAVE);
  if (bytes.length !== BYTES_DA_CHAVE) throw new Error('gerador devolveu tamanho errado para a chave do banco');
  if (bytes.every((b) => b === 0)) throw new Error('gerador devolveu chave nula');
  const hex = bytesParaHex(bytes);
  await cofre.guardar(NOME_DA_CHAVE_NO_COFRE, hex);
  // Confere a gravação: se o cofre não devolver o mesmo valor, o banco criado com esta chave
  // ficaria ilegível no próximo início.
  if ((await cofre.ler(NOME_DA_CHAVE_NO_COFRE)) !== hex) throw new Error('o cofre não guardou a chave do banco');
  return { hex, nova: true };
}
