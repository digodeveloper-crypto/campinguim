import type { AbstractPowerSyncDatabase, PowerSyncBackendConnector, PowerSyncCredentials } from '@powersync/common';

import { config } from '../config';

// Conector do PowerSync: PREPARADO, mas DESLIGADO até a feature 2.2 (sincronização das viagens),
// que depende do login (2.1). Enquanto `SINCRONIZACAO_LIGADA` for false, `ligarSincronizacao`
// recusa, e nada sai do aparelho: as escritas esperam na fila local (`ps_crud`) com os mesmos
// identificadores (E1-14).
//
// O que a 2.2 completa aqui (referência: `prova/app/src/dados/banco.ts`, sem copiar o que os
// pontos J5 e J6 da prova proíbem):
//   - `fetchCredentials`: o token da sessão de login (2.1), guardado no cofre do sistema, nunca em
//     SQLite sem cifra (ponto J3);
//   - `uploadData`: envio da fila em lotes à função do servidor que aplica as regras de conflito
//     da seção 4, com o identificador da alteração tirado de `_metadata`; alteração recusada
//     (inválida ou sem permissão) sai da fila e vira aviso, em vez de travar a fila (ponto J1);
//   - vigia de rede pelo aviso de troca de rede do sistema (ponto J26), em vez de consulta a cada 5 s.

export const SINCRONIZACAO_LIGADA = false;

export class ConectorDoCampinguim implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    // Sem login ainda (2.1): sem credencial, o PowerSync não conecta.
    if (!SINCRONIZACAO_LIGADA) return null;
    throw new Error(`credencial para ${config.urlSincronizacao} ainda não implementada (features 2.1 e 2.2)`);
  }

  async uploadData(_db: AbstractPowerSyncDatabase): Promise<void> {
    // Não envia nem tira nada da fila: tudo fica guardado para a 2.2.
    if (!SINCRONIZACAO_LIGADA) return;
    throw new Error('envio da fila ainda não implementado (feature 2.2)');
  }
}

/** Liga a sincronização. Até a 2.2, recusa: nenhum dado sai do aparelho. */
export async function ligarSincronizacao(db: AbstractPowerSyncDatabase): Promise<void> {
  if (!SINCRONIZACAO_LIGADA) throw new Error('sincronização desligada até a feature 2.2');
  await db.connect(new ConectorDoCampinguim());
}
