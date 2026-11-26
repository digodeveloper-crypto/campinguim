# Dados no aparelho

Como o app guarda os dados no celular: banco cifrado, chave no cofre do sistema, esquema das tabelas que sincronizam, tabelas só locais com migrações e a camada de acesso usada pelas features. Criado na feature **B4** (banco local cifrado e suas migrações; DEF-11, NF-03, DEF-09) em 26/11/2026.

Referências: `docs/SPEC.md`, seções 3, 4, 11 e 12; `docs/prova-tecnica/resultado.md`, pontos J1, J3, J15, J26 e J28.

## 1. Visão geral

```
apps/mobile/src/
  seguranca/
    cofre.ts            cofre do sistema (expo-secure-store: Keystore no Android, Keychain no iPhone)
    chaveDoBanco.ts     chave do banco: cria, guarda no cofre e entrega ao SQLCipher (puro, testado no Node)
  dados/
    esquema.ts          tabelas que sincronizam (SPEC, seção 3), no formato do PowerSync
    migracoes.ts        migrações versionadas das tabelas só locais
    banco.ts            abre o banco cifrado no aparelho (uma vez por processo)
    ProvedorDoBanco.tsx entrega o banco às telas (useBanco, PowerSyncContext)
    conector.ts         conector do PowerSync, preparado e DESLIGADO até a feature 2.2
    executor.ts         o mínimo de banco que a camada usa (o PowerSync e o SQLite do Node cabem nele)
    valores.ts          valores fechados da seção 3 e conferência dos campos
    acesso/             camada de acesso tipada (viagens, itens, estado local, eventos, Pix)
    verificacao.ts      roteiro que exercita a camada (no Node e no emulador)
    __testes__/         testes do Vitest (projeto "core" da suíte)
```

A tela não fala SQL. Cada feature chama as funções de `src/dados/acesso/` com o `ctx` que `useBanco()` entrega quando o banco está pronto (`estado === 'pronto'`, `banco.ctx`). Para listas que se atualizam sozinhas, o `useQuery` do PowerSync já está ligado ao mesmo banco pelo `PowerSyncContext`.

## 2. Banco cifrado (DEF-11)

| O quê | Como |
| --- | --- |
| Motor | SQLite pelo OP-SQLite 18.2.5, compilado com **SQLCipher**: `"op-sqlite": { "sqlcipher": true }` em `apps/mobile/package.json` (ponto J28). O build mostra `[OP-SQLITE] using sqlcipher.` |
| Arquivo | `campinguim.db`, na pasta de bancos do app (`/data/user/0/<pacote>/databases/`). Os arquivos `-wal` e `-shm` do SQLite também ficam cifrados |
| Abertura | PowerSync 2.4.1 com `sqliteOptions.encryptionKey`; as 6 conexões (1 de escrita e 5 de leitura) usam a mesma chave |
| Nunca sem cifra | `banco.ts` confere `isSQLCipher()` antes de abrir; um app gerado sem a opção falha na abertura em vez de gravar texto aberto |
| Prova | No emulador, os primeiros bytes do arquivo não são `SQLite format 3` (evidência em `docs/evidencias/B4/`) |

### Chave

- **32 bytes aleatórios** do gerador seguro do sistema (`expo-crypto`, `getRandomBytes`), criados no primeiro uso.
- Guardada **só no cofre do sistema** (`expo-secure-store`, nome `campinguim.banco.chave.v1`), em hexadecimal. No Android, o valor é cifrado por uma chave do Android Keystore, que não sai do aparelho. No iPhone (versão 1.0.0), fica no Keychain com `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`: legível depois do primeiro desbloqueio (lembretes e sincronização em segundo plano) e nunca copiada para backup ou outro aparelho.
- Entregue ao SQLCipher como **chave bruta** (`x'<64 hex>'`). Como a chave já é aleatória, não há senha a derivar: o SQLCipher pula o PBKDF2, que seria repetido em cada uma das 6 conexões a cada abertura.
- Nunca vai para arquivo, código, registro, tela, evidência ou commit. O registro técnico do app (só no ambiente local) mostra a versão da cifra e as tabelas, nunca a chave.
- **Sem backup automático do Android** (`android.allowBackup: false` em `app.config.ts`): o banco cifrado restaurado em outro aparelho seria ilegível, porque a chave do Keystore não vai junto. Quem tem conta recupera os dados pela sincronização.

### Chave perdida

Se o cofre não tem a chave (ou ela não pode mais ser lida, como depois de reinstalar o app) e existe um banco antigo, esse banco foi cifrado com uma chave que não existe mais: ninguém consegue lê-lo. A abertura então cria uma chave nova, confere que o banco antigo é ilegível e o descarta (arquivo principal, `-wal`, `-shm` e `-journal`), e o app segue com um banco novo. O resumo técnico marca `recriado: true`.

Isso só acontece quando a chave **acabou de ser criada**. Se o cofre devolve erro (por exemplo, Keystore indisponível), nada é criado nem apagado: a abertura falha e tenta de novo no próximo início.

## 3. Esquema das tabelas que sincronizam (SPEC, seção 3)

Todas as tabelas de "Viagem e lista" e de "Gastos", com os **mesmos nomes de tabela e de campo da SPEC** (o B5 cria o mesmo esquema no Postgres). Um teste (`__testes__/esquema.test.ts`) compara campo a campo com a lista copiada da SPEC.

| Tabela | Quem escreve no aparelho |
| --- | --- |
| `profile`, `trip`, `trip_family`, `trip_person`, `trip_member`, `trip_item`, `item_claim` | O app, pela fila da sincronização (2.2) |
| `trip_camping_snapshot`, `invite`, `expense`, `expense_exclusion`, `expense_payment`, `expense_audit`, `pix_key` | Só o servidor, pelas funções da seção 8; o app só lê |

Regras aplicadas a todas:

- `id` texto, UUID v4 aleatório (DEF-08), criado pelo PowerSync em toda tabela.
- `updated_at`, `updated_by` e `deleted_at` em todo registro (seção 3, "Regras gerais"; seção 4). Nada é apagado de verdade: a camada marca `deleted_at` e as leituras escondem a linha.
- `updated_at` é a hora do aparelho, só para mostrar; conflito quem decide é o servidor (seção 4, princípio 4). `updated_by` é o perfil logado, nulo sem conta.
- `trip.created_at` existe porque a seção 11 (FRD-02) o usa.
- Dinheiro em centavos (inteiro). Verdadeiro/falso como 0 ou 1 (o SQLite não tem tipo lógico). Datas da viagem como texto `AAAA-MM-DD`; carimbos de tempo em UTC (ISO 8601). `facts`, `alerts` e `adjustments` guardam o JSON do servidor, como texto. `qty` é número com casas (por exemplo, litros de água).
- Nas tabelas que o app escreve, cada escrita leva o identificador da alteração em `_metadata` (`{"c": "<uuid>"}`; seção 4, princípio 2) e escrita que não muda nada não é gravada nem entra na fila. Em `trip_item`, o valor anterior de `pack_state`, `removed` e `deleted_at` vai junto da alteração, para o servidor aplicar as regras de conflito sem usar o relógio do aparelho.

**Nunca no aparelho** (DEF-11; seção 3, "O que chega ao aparelho"): `city`, `camping`, `camping_alias`, `fact_report`, `fact_summary`, `suggestion`, `merge_candidate`, `list_feedback`, `device`, `event` e `config`. Um teste confere que nenhuma existe no esquema, e a verificação no emulador confere que nenhuma existe no banco. Do camping, o aparelho guarda só o retrato da viagem (`trip_camping_snapshot`).

**Chave Pix** (PRV-06): a única leitura é `acesso/pix.ts`, que repete a regra da SPEC (pessoa logada, membro da viagem, família compradora de um gasto da mesma viagem, dono membro dessa família). A barreira de verdade continua no servidor (regras de sincronização e `pix_key_get`, B5 e 2.9).

Mudança de esquema das tabelas sincronizadas **não precisa de migração no aparelho**: o PowerSync guarda cada linha como JSON e recria as vistas a partir de `esquema.ts` em toda abertura. Coluna nova aparece vazia; coluna retirada some da vista, mas o valor fica guardado. A mudança precisa vir antes na SPEC e no B5.

## 4. Tabelas só locais e migrações

Não sincronizam e não estão no esquema do PowerSync. São tabelas comuns do SQLite, no mesmo arquivo cifrado, criadas por migrações versionadas (`migracoes.ts`):

| Versão | Tabela | Para quê |
| --- | --- | --- |
| 1 | `estado_local (chave, valor, atualizado_em)` | Estado do app neste aparelho: `install_id` (seção 11), marcas de primeira vez. Nunca segredo (segredo vai para o cofre) |
| 2 | `evento_local (id, name, props, at, install_id, profile_id)` | Eventos de medição da seção 12, guardados até o envio em lote (`events_ingest`). Mesmos campos da tabela `event` do servidor, mais o `id` |

`migracao_local (versao, nome, aplicada_em)` registra o que já foi aplicado.

Regras (todas com teste em `__testes__/migracoes.test.ts`):

1. Migração publicada nunca muda. O teste guarda um resumo (SHA-256) de cada migração; mudar uma existente faz o teste falhar. Mudança de tabela é sempre uma migração nova, com o número seguinte, e a sua linha no teste.
2. Cada migração roda numa transação, junto com a sua linha em `migracao_local`: entra inteira ou não entra nada.
3. As migrações rodam a cada abertura; as já aplicadas são puladas. Um aparelho que parou numa versão antiga chega ao mesmo banco de quem instalou agora (o teste compara a estrutura dos dois).
4. Banco com versão mais nova que a do app (app voltou de versão) não é tocado: a abertura falha com mensagem clara.
5. Tabelas criadas com `strict` (o SQLite recusa tipo errado). Nenhum nome começa com `ps_` (reservado ao PowerSync) nem repete uma tabela do esquema.

## 5. Camada de acesso (`src/dados/acesso/`)

Funções com tipos, usadas pelas features da etapa 1:

| Arquivo | Funções |
| --- | --- |
| `viagens.ts` | `criarViagem` (viagem, família organizadora e pessoas numa transação; com ou sem data), `listarViagens`, `obterViagem`, `alterarViagem`, `apagarViagem`, `listarFamilias`, `alterarFamilia`, `listarPessoas`, `adicionarPessoa`, `alterarPessoa`, `removerPessoa`, `contarPorFaixa` |
| `itens.ts` | `inserirItens` (a lista inteira numa transação), `listarItens` (por família, do grupo, com ou sem removidos), `obterItem`, `alterarItem`, `marcarSeparacao`, `removerItem` e `restaurarItem` (E1-04) |
| `local.ts` | `lerEstado`, `gravarEstado`, `apagarEstado`, `obterIdDaInstalacao`, `guardarEvento`, `lerLoteDeEventos`, `apagarEventos`, `contarEventos`, `listarTabelas` |
| `pix.ts` | `lerChavesPixDoComprador` |

- **Valores conferidos antes de gravar** (`valores.ts`): listas fechadas da seção 3 (`kind`, `climate`, `status`, `age_band`, `origin`, `pack_state`, `return_state`...), datas `AAAA-MM-DD` que existem, volta não antes da ida, inteiros não negativos, UUID v4. Valor inválido gera `ValorInvalido` e nada é gravado. Motivo: um valor fora da lista seria recusado pelo servidor e travaria a fila do aparelho (ponto J1 da prova).
- **Regras de negócio ficam fora**: quantas noites, quem entra na lista, quantidades e alertas são das features e de `packages/core`. A camada só grava e lê.
- **Sem conta** (E1-14): `owner_profile_id` e `updated_by` nulos; `trip_member` não é criado pela camada (o vínculo com a conta é da 2.1 e o grupo, da 2.3).
- **Eventos**: a camada só garante a forma (nome `snake_case`, propriedades de um nível com valores simples). A lista de eventos e de propriedades aceitas é da B6.
- **Escritas só pelas funções da camada**: ela é quem põe `updated_at`, `updated_by` e `_metadata`. Os tipos não deixam a camada escrever numa tabela que vem só do servidor.

## 6. Sincronização: preparada, desligada (até a 2.2)

`conector.ts` tem o conector do PowerSync com `SINCRONIZACAO_LIGADA = false`. Ninguém chama `connect`; `ligarSincronizacao` recusa. Até a 2.2:

- todas as escritas ficam na fila local do PowerSync (`ps_crud`), cifrada, com os mesmos identificadores, e sobem no primeiro login (E1-14, cenário S9);
- nenhum dado sai do aparelho e nenhuma credencial existe no app (DEF-09).

O que a 2.1 e a 2.2 completam (está escrito no próprio `conector.ts`):

| Ponto | O que fazer |
| --- | --- |
| J3 | Sessão de login (token de renovação) no cofre do sistema (`src/seguranca/cofre.ts`) ou no banco cifrado, nunca em SQLite sem cifra. Atenção: o cofre do iPhone aceita valores pequenos; uma sessão grande vai para o banco cifrado (tabela só local nova, com migração) |
| J1 | Alteração recusada pelo servidor (inválida ou sem permissão) sai da fila e vira aviso, em vez de travar a fila |
| J26 | Vigia de rede pelo aviso de troca de rede do sistema, em vez de consulta a cada 5 s |
| Seção 4 | Histórico do valor perdido em item do grupo: a SPEC cita o histórico mas não define tabela; a 2.2 define (na SPEC antes) |
| J15 | O modelo completo da seção 3 já está aqui (`profile`, `trip_family`, `trip_member` com `profile_id` de perfil) |

## 7. Testes

| Onde | O que | Como roda |
| --- | --- | --- |
| `src/seguranca/__testes__/chaveDoBanco.test.ts` | Chave: criação, reuso, valor ilegível, erro do cofre, formato bruto, chave fora de mensagem de erro | Vitest, projeto `core`, dentro do `npm run testar` |
| `src/dados/__testes__/esquema.test.ts` | Esquema = SPEC, campo a campo; tabelas proibidas; tipos; quem escreve | idem |
| `src/dados/__testes__/migracoes.test.ts` | Migrações em sequência, repetidas, de versão antiga, com erro, de versão futura; migração publicada não muda | idem, contra o SQLite do Node |
| `src/dados/__testes__/acesso.test.ts` | Camada de acesso: viagens, pessoas, itens, estados, removidos, estado local, eventos, Pix | idem |
| `src/dados/__testes__/verificacao.test.ts` | O roteiro de `verificacao.ts` inteiro | idem |
| `e2e/jornadas/fumaca-banco/banco-cifrado.yaml` | **Teste instrumentado no emulador**: abre o app a frio (cria chave e banco cifrado), roda a verificação da camada num banco cifrado descartável, fecha e reabre | `npm run testar:jornadas -- fumaca` |

Nos testes do computador, as tabelas sincronizadas são tabelas comuns do SQLite do Node com as mesmas colunas (no aparelho são vistas do PowerSync); o comportamento no aparelho, com SQLCipher e PowerSync, é o que a fumaça no emulador confere.

A verificação no emulador só existe no ambiente local (`config.ambiente`): o link `campinguim://?verificar-banco=1` abre um banco **separado** (`campinguim-verificacao.db`), com a mesma chave, roda `verificarCamada`, fecha e apaga o arquivo. O banco da pessoa não é tocado. O resultado vai para o registro do app (`adb -s emulator-5554 logcat -s ReactNativeJS`, etiqueta `[campinguim:banco]`).

## 8. Decisões técnicas da B4

| Decisão | Por quê |
| --- | --- |
| SQLCipher pelo OP-SQLite (opção do `package.json`), aberto pelo PowerSync com `encryptionKey` | Caminho suportado pelas duas bibliotecas nas versões da prova; não pede biblioteca nova |
| Chave aleatória de 32 bytes no cofre, entregue como chave bruta | Nenhuma senha a lembrar ou derivar; abre rápido nas 6 conexões |
| `expo-secure-store` 58.0.3 e `expo-crypto` 58.0.8 (publicadas até 12/11/2026, versão fixa) | Cofre do sistema e gerador seguro do próprio Expo, sem módulo nativo próprio |
| `@powersync/common` 2.5.0 declarado no app (mesma versão que o PowerSync 2.4.1 usa) | O esquema importa dele para os testes rodarem no Node sem React Native |
| `android.allowBackup: false` | Backup do banco cifrado é inútil fora do aparelho e criaria o caso de chave perdida |
| Tabelas só locais como tabelas comuns com migração, e não como tabelas "só locais" do PowerSync | O cartão pede migrações versionadas; tabela comum aceita índice, `strict` e `on conflict`, e não some ao sair da conta |
| Banco descartável na verificação do emulador | O teste instrumentado não pode deixar dado de teste no banco da pessoa (ponto J1) |
| Testes do app no projeto `core` do Vitest (mudança de uma linha em `vitest.config.ts`) | Assim rodam dentro do `npm run testar` sem mexer em `scripts/` (fora da pasta da B4). Se o orquestrador preferir um projeto `app` separado, é preciso acrescentá-lo em `scripts/testar.mjs` |
