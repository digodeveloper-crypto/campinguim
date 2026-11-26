# B4 · banco local cifrado e suas migrações · rodada 1 · APROVADO

Data: 2026-11-26 · Entregue por: pane-701 · Conferido por: QA (pane-689)
Base: cartão da B4; SPEC, seções 3, 4, 11 ("No aparelho") e 12; PRD DEF-11, DEF-09 e NF-03 (base local); pontos J3, J15, J26 e J28; regras do piloto (a B4 toca o app, então nenhum pulo é aceito; vez do Docker e do emulador coordenada); decisão do piloto no h-18f (`invite` e `pix_key` fora do aparelho).
Alvo: worktree `C:\campinguim-wt\B4`, ramo `feature/B4-banco-local`, ponta `ec0dfa9`, sobre o main `730cdc4` (que já tem B1-FIX, B6, B3 e B5). 11 commits, só locais; autor e quem gravou: noreply.

**Resumo:** as viagens e listas ficam no aparelho num banco SQLCipher, com a chave gerada no aparelho e guardada só no cofre do sistema. O esquema local é o mesmo da B5, coluna a coluna. A suíte completa passou duas vezes. No emulador, o QA rodou as duas fumaças e conferiu ele mesmo a cifra do arquivo e a ausência da chave fora do cofre.

## Suíte local (GIT-10)

| Execução | Comando | Resultado |
| --- | --- | --- |
| Ambiente | `npm run ambiente:zerar` a partir da B4 (Node 24.19.0), com a vez do Docker dada pelo piloto | exit 0, 7 contêineres |
| 1ª | `npm run testar -- --exigir-completa` | **SUÍTE COMPLETA, 7 de 7 etapas, exit 0.** Unitários 629 de 629, com os 3 do manifesto contra o APK das 18:40, mais novo que as fontes do manifesto. Servidor 109 de 109; web 2 de 2; tipos 5 de 5; lint, segredos e endereços ok. **740 de 740**, nenhum pulo |
| 2ª, sem derrubar | o mesmo | igual, exit 0 |

## Jornadas e provas no emulador, rodadas pelo QA

Vez do emulador dada pelo piloto, com a B2 pausada. `campinguim-a` (5554) já estava ligado.

| Conferência | Resultado |
| --- | --- |
| Instalação | `npm run app:instalar`: "Success em emulator-5554" (APK da B4) |
| Fumaça | `npm run testar:jornadas -- fumaca`: **2 de 2**, de primeira (`fumaca/abre-tela-provisoria` 16,5 s; `fumaca-banco/banco-cifrado` 20,6 s) |
| Cabeçalho do banco | `adb -s emulator-5554 exec-out su 0 cat …/databases/campinguim.db \| head -c 32`: bytes aleatórios (`92 df 6e 9a …`), **não** `SQLite format 3`. O APK release não é debuggable, por isso `su 0` (imagem userdebug), como na evidência |
| Texto aberto | 0 ocorrências de `SQLite format 3`, `CREATE TABLE`, `trip_item`, `pack_state` e `estado_local` em `campinguim.db` e em `campinguim.db-wal` (este com 400 KB de escritas). Controle: com o mesmo método, um arquivo comum do app (`shared_prefs/…PersistentDataManager.xml`) sai legível |
| Chave fora do cofre | 0 arquivos do app com 64 caracteres hexadecimais. `SecureStore.xml` tem a entrada `campinguim.banco.chave.v1`, com o valor cifrado pelo Keystore (nem o valor nem o tamanho foram lidos) |

## Aceite

| Critério | Resultado do QA |
| --- | --- |
| DEF-11, banco cifrado | ok. **APK lido pelo QA:** `libop-sqlite.so` tem os símbolos do SQLCipher (`sqlcipherPagerSetCodec`, `sqlcipher_extra_init`); `"op-sqlite": { "sqlcipher": true }` no `package.json` do app (J28); o banco se recusa a abrir sem `isSQLCipher()`. No aparelho: veja a tabela acima |
| DEF-11, só os dados do próprio usuário | ok. Só as 12 tabelas que a B5 sincroniza e 3 só locais. `invite`, `pix_key` e camping, relato, resumo e sugestão estão na lista do que nunca pode estar no aparelho. **A retirada de `invite` e `pix_key` foi confirmada pelo piloto** (h-18f: o cartão estava errado; vale a SPEC §3, "O que chega ao aparelho") |
| DEF-09, chave | ok. 32 bytes do gerador seguro, guardados só no cofre (expo-secure-store), com a gravação conferida em seguida. Erro do cofre é repassado sem apagar nada. O banco antigo só é descartado quando não havia chave no cofre (nesse caso ele é ilegível de qualquer jeito) |
| Backup | ok. `android:allowBackup=false` no manifesto do APK |
| Permissões (J9) | ok. As mesmas 4 de antes; `USE_BIOMETRIC` e `USE_FINGERPRINT`, que o expo-secure-store traz, estão bloqueadas, e o teste J9 as pegou |
| Esquema igual ao da B5 e ao da B3 (J15) | ok. Testes de esquema mais a comparação coluna a coluna com as migrações da B5 (0 diferenças); campos da B3 incluídos |
| Migrações locais | ok. Versões 1 e 2 em transação; banco de versão mais nova é recusado; trava por SHA-256 contra mudar migração publicada. No aparelho: primeira abertura aplica [1, 2], reabertura não aplica nada |
| Camada de acesso | ok. Testes puros, mais a verificação de 11 passos no emulador (11/11 na captura) |
| Escopo e arquivos compartilhados | ok. Só as pastas do cartão; mudanças mínimas e justificadas em `_layout.tsx`, `app.config.ts`, `package.json` do app e lockfile |
| Evidências | ok. As capturas mostram só a tela do app; os `.txt` batem com o que o QA rodou. Checagem G: 0 achados |

## Observações (não reprovam; já combinadas com o piloto)

1. **Gancho de verificação no app** (`campinguim://?verificar-banco=1`): só funciona com `config.ambiente === 'local'`, mas o `src/config.ts` usa `extra.ambiente ?? 'local'`, um padrão aberto. Vai para a B1-FIX-2: padrão fechado e um teste de que o gancho não existe fora do local.
2. O caso "chave perdida" não foi provado no aparelho (o cartão não exigia). Há código e documentação.
3. O `undone_adjustment_ids` não está no `sync-config` da B5: fica registrado para a feature 3.3.
4. Coordenação: a B4 subiu o Docker durante a pausa e dividiu o emulador com a B2 ao mesmo tempo, o que fez a fumaça falhar e invalidou uma rodada. A partir de agora, o emulador também segue a regra de vez.
5. Coautoria "Claude Opus 5.5" nos commits; resolve-se no squash.

## Limpeza

- Docker: zerado a partir da B4, suíte, e `npm run ambiente:parar`: 0 contêineres `campinguim`.
- Emulador: já estava ligado, e o QA **não** o desligou. Ficou instalado o APK da B4; a B2 reinstala o dela quando voltar. Não houve `kill-server` nem `start-server`.
- As saídas do QA (`test-results/jornadas/…` e a pasta temporária) foram apagadas. O worktree não mudou, só ganhou este relatório.
