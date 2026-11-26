import * as SecureStore from 'expo-secure-store';

// Cofre do sistema (Android Keystore; no iPhone, Keychain) pelo expo-secure-store. Guarda segredos
// pequenos do aparelho: a chave do banco local (DEF-11) e, a partir da 2.1, a sessão de login
// (ponto J3 da prova: o token de renovação nunca fica em SQLite sem cifra).
//
// Nada daqui é escrito em registro, arquivo ou tela.

/** O que o resto do app precisa do cofre. Os testes usam um cofre em memória com a mesma forma. */
export interface Cofre {
  ler(nome: string): Promise<string | null>;
  guardar(nome: string, valor: string): Promise<void>;
  apagar(nome: string): Promise<void>;
}

// Nomes aceitos pelo expo-secure-store: letras, números, ".", "-" e "_".
const NOME_VALIDO = /^[A-Za-z0-9._-]+$/;

// iPhone: legível depois do primeiro desbloqueio (para lembretes e sincronização em segundo
// plano) e nunca copiado para backup ou para outro aparelho. No Android a opção não se aplica:
// a chave do Keystore já não sai do aparelho.
const OPCOES: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

function conferirNome(nome: string): string {
  if (!NOME_VALIDO.test(nome)) throw new Error(`nome inválido para o cofre: ${nome}`);
  return nome;
}

export const cofreDoSistema: Cofre = {
  // Devolve null se não há valor ou se ele não pode mais ser lido (por exemplo, depois de
  // reinstalar o app: a chave do Keystore que o protegia não existe mais).
  ler: (nome) => SecureStore.getItemAsync(conferirNome(nome), OPCOES),
  guardar: (nome, valor) => SecureStore.setItemAsync(conferirNome(nome), valor, OPCOES),
  apagar: (nome) => SecureStore.deleteItemAsync(conferirNome(nome), OPCOES),
};
