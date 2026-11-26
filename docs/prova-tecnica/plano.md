# Plano da prova técnica (F0)

24/11/2026 · arquiteto da prova (pane-634) · versão para o QA (rodada 3: decisões H4 e H5 do responsável e conferência F0-P)

Este plano prepara a prova técnica da SPEC (seção 2, fim, e tabela "Prova técnica e base" da seção 14). Ele não instala nada e não escreve código. Tudo o que está marcado **PROPOSTA** espera decisão. O que está marcado **não confirmado** não foi achado em fonte oficial.

Documentos lidos: `CLAUDE.md`; `docs/SPEC.md` seções 1, 2, 4, 11, 13, 14 e 15; `docs/PRD.md` em GIT-01 a GIT-17, DEF-04, DEF-05, DEF-11, FRD-04, E1-08, NF-03, RET-01 e SQD-01 a SQD-12.

## Resumo

1. A máquina tem força de sobra (8 núcleos, 32 GB, 472 GB livres), mas **a virtualização está desligada na BIOS**. Sem ela não sobem nem o Docker nem os emuladores. Só o responsável resolve, na frente do computador (H1).
2. Faltam Android Studio e SDK, JDK 17, Maestro e Supabase CLI. Docker Desktop, Node, Git e `gh` já estão instalados.
3. **Decisão do responsável (24/11/2026):** ele ainda não tem conta de desenvolvedor no Google Play e deixou para depois. Os itens 1, 2 e 3 andam agora, só na máquina. O item 4 tem uma parte local que anda agora (F0-5) e uma parte que **fica pendente até a conta existir** (F0-6). **A prova só é dada como completa com o item 4.**
4. São 9 tarefas (F0-0 a F0-7 e F0-P). No pico, 4 rodam juntas.
5. A licença do PowerSync auto-hospedado mudou para Apache 2.0 em 03/11/2026: a dúvida de licença da SPEC (seção 15) diminuiu.
6. **Decisão do responsável (24/11/2026), H4:** repositório **público e gratuito** no GitHub. Ele foi avisado de que código, PRD e SPEC ficam abertos a qualquer pessoa. A proteção do ramo principal existe sem plano pago. Antes do primeiro envio, a conferência F0-P olha tudo o que fica público, no histórico inteiro, e o envio ainda espera o "pode" final do responsável.
7. **Decisão do responsável (24/11/2026), H5:** o código da prova mora na pasta separada `prova/` (E, opção 2).
8. A lista do que precisa do responsável está em H, na ordem em que vai ser preciso.

## A. Máquina

Conferida em 24/11/2026, só com comandos de leitura (`systeminfo`, `Get-CimInstance`, `--version`, `gh auth status`, registro de programas instalados). Nada foi instalado, ligado ou alterado.

| Item | Situação |
| --- | --- |
| Windows | Windows 11 Pro, versão 10.0.26300 |
| CPU | AMD Ryzen 7 5700X, 8 núcleos, 16 threads |
| Memória | 31,9 GB (16,2 GB livres no momento da leitura, com outros programas abertos) |
| Disco | C: 472 GB livres de 931 GB |
| Virtualização | **Desligada no firmware (BIOS).** `systeminfo`: "Virtualização Habilitada no Firmware: Não"; "Extensão de Modo de Monitor VM: Sim" (a CPU suporta). Hipervisor ausente. |
| Recursos do Windows (Hyper-V, Plataforma de Máquina Virtual, Plataforma do Hipervisor do Windows) | Não lidos: a consulta exige administrador. F0-0 confere. |
| Aceleração do emulador | Indisponível enquanto a virtualização estiver desligada. |
| WSL | Instalado, versão padrão 2, **nenhuma distribuição**. |
| Docker Desktop | Instalado, 4.94.0 (cliente 29.8.2). **Não está rodando.** Não vai subir sem a virtualização. |
| Node | 24.19.0 instalado em `C:\Program Files\nodejs`. Atenção: no terminal dos agentes, o primeiro `node` do caminho é um Node 22.16.0 interno do Overclock. Os scripts da prova devem chamar o Node do sistema. |
| npm | 11.17.0 |
| pnpm, yarn | Não instalados. `corepack` 0.35.0 disponível. |
| Java / JDK | Não instalado. Sem `JAVA_HOME`. |
| Android Studio, SDK, `adb`, `emulator` | Não instalados. Sem `ANDROID_HOME`. |
| Imagens de sistema e AVDs | Nenhuma. |
| `gh` | 2.102.0. Logado no github.com, conta `digodeveloper-crypto` (token não exibido). |
| Supabase CLI | Não instalado. |
| EAS CLI | Não instalado. |
| Maestro | Não instalado. |
| Git | 2.55.0 |

**O que falta instalar**

| Peça | De onde (oficial) | Tamanho aproximado | Aceite de licença ou termos? |
| --- | --- | --- | --- |
| Virtualização na BIOS (SVM) | Menu da BIOS da placa-mãe, na reinicialização | — | Não, mas é ação física do responsável (H1) |
| Plataforma do Hipervisor do Windows (WHPX) e Plataforma de Máquina Virtual | Recursos opcionais do Windows | pequeno | Não; exige janela de administrador (H2) |
| Android Studio Rabbit 2 (2026.2.2 Patch 2), com SDK, emulador e JDK embutido | developer.android.com/studio | instalador 1,5 GB; tamanho instalado não confirmado | **Sim**: Android SDK License Agreement antes do download (H3) |
| ou: só as ferramentas de linha de comando | developer.android.com/studio (fim da página) | não confirmado | **Sim**: o mesmo contrato, e `sdkmanager --licenses` (H3) |
| 2 imagens de sistema e 2 AVDs | pelo SDK | imagem Google Play x86_64: API 35 1,76 GB; API 36 1,92 GB; cada AVD até 6 GB a mais | Coberto pelo contrato do SDK |
| JDK 17 (se não usar o embutido do Studio) | adoptium.net (Temurin) ou Microsoft OpenJDK | não confirmado | Temurin: GPLv2 com exceção de classpath, sem clique de aceite |
| Maestro CLI 2.12.1 | github.com/mobile-dev-inc/maestro/releases (zip) | não confirmado | Apache 2.0, sem aceite |
| Supabase CLI 3.4.0 | npm, como dependência do projeto (supabase.com/docs/guides/local-development/cli/getting-started) | pequeno (não confirmado) | MIT, sem aceite |
| Docker Desktop (só ligar; atual 4.100.1, instalado 4.94.0) | já instalado | — | **Sim**: contrato de assinatura do Docker na primeira abertura (H3). Grátis só dentro das condições de B3. |
| Distribuição WSL | não é necessária para o Docker Desktop | — | — |
| EAS CLI | não é necessária se as versões forem geradas na máquina (ver B2) | — | Exigiria conta Expo (login do responsável) |

**Folga de memória.** Android Studio pede 16 GB para Studio e emulador e cerca de 4 GB por AVD. Dois emuladores (8 GB) mais o Docker com Supabase e PowerSync cabem em 32 GB, mas com pouca folga se o Studio e outros programas ficarem abertos. F0-0 mede a memória livre com tudo ligado.

Fontes da tabela: developer.android.com/studio, developer.android.com/studio/install, dl.google.com/android/repository/sys-img/google_apis_playstore/sys-img2-4.xml, docs.maestro.dev/getting-started/installing-maestro/windows, adoptium.net/docs/faq. Consultadas em 24/11/2026.

## B. Versões e licenças

Tudo conferido em **24/11/2026**, só em páginas oficiais. Onde a página não diz com todas as letras, está escrito **não confirmado**. Na hora de instalar, F0-0 e F0-1 conferem de novo e registram a versão usada.

### B1. Expo e React Native

| Peça | Versão estável | Licença e custo | Fonte |
| --- | --- | --- | --- |
| Expo SDK | 58 (lançado em 15/10/2026; pacote `expo` 58.0.26) | MIT, grátis | expo.dev/changelog; docs.expo.dev/versions/latest |
| React Native | 0.88 (0.88.1 no npm), com React 19.3.0 | MIT, grátis | expo.dev/changelog/sdk-58; reactnative.dev/docs/set-up-your-environment |
| Node exigido | 22.13+ na linha 22, 24.3+ na linha 24, ou 26+. A máquina tem 24.19.0: serve. | — | expo.dev/changelog/sdk-58 |
| JDK | 17 ("You may encounter problems using higher JDK versions") | Temurin: GPLv2 com exceção de classpath | reactnative.dev; docs.expo.dev/get-started/set-up-your-environment |
| Android | Android 7+; compileSdk 37; targetSdk 36 | — | docs.expo.dev/versions/latest |
| Plataforma do SDK a instalar | **Não confirmado**: a tabela do SDK 58 diz compileSdk 37; o guia do Expo pede a 36; o do React Native 0.88 pede a 35. F0-1 instala o que o primeiro build pedir. | — | as três acima |
| EAS CLI | 27.11.0 | MIT; plano grátis com 15 builds Android em fila de baixa prioridade; exige conta Expo | registry.npmjs.org; expo.dev/pricing |

**Build de desenvolvimento.** O PowerSync, o esquema próprio de link e os App Links exigem build de desenvolvimento; o Expo Go não serve. O build local no Windows funciona com `npx expo run:android` e **não precisa de conta Expo** ("No Expo account is needed", docs.expo.dev/develop/development-builds/introduction). Já o `eas build --local` **não é suportado no Windows** (docs.expo.dev/build-reference/local-builds). **PROPOSTA:** gerar tudo na máquina, sem EAS e sem conta Expo, na prova.

### B2. PowerSync

| Peça | Versão | Licença e custo | Fonte |
| --- | --- | --- | --- |
| SDK `@powersync/react-native` | 2.4.1 | Apache 2.0, grátis | github.com/powersync-ja/powersync-js (release 2.4.1) |
| Banco no aparelho | OP-SQLite (`@op-engineering/op-sqlite`), padrão desde a v2.0. A antiga `react-native-quick-sqlite` saiu. Versão exigida: `>=17.1.0 <19.0.0` pelo `package.json` do SDK (a doc diz "1.17.0", parece erro). | — | releases.powersync.com (v2.0); docs.powersync.com/client-sdks/reference/react-native-and-expo |
| Expo Go | **Não serve.** "Our native database adapter is not compatible with Expo Go's sandbox environment." | — | docs.powersync.com/client-sdks/frameworks/expo-go-support |
| Versões de Expo e RN suportadas | Só mínimos publicados (RN 0.72, Expo 49; "Expo 52+" sem ajuste). Compatibilidade com Expo 58 / RN 0.88: **não confirmado**; F0-1 confirma no build. | — | docs.powersync.com/resources/supported-platforms |
| Banco cifrado no aparelho (DEF-11) | Sim, por SQLCipher no OP-SQLite. Funcionar no Expo sem passo extra: não confirmado. | — | docs.powersync.com/usage/use-case-examples/data-encryption |
| Serviço auto-hospedado | Imagem Docker `journeyapps/powersync-service`, v1.29.1 (18/11/2026). No Docker Hub só aparece a etiqueta `latest`. | **Apache 2.0 desde 03/11/2026** (antes era FSL). Edição aberta grátis, sem aceite além da licença (aceite extra: não confirmado). | docs.powersync.com/self-hosting/getting-started; powersync.com/blog/moving-the-powersync-service-to-apache; powersync.com/legal/licensing-terms |
| Armazenamento interno do serviço | MongoDB (com um nó de "replica set") ou Postgres | — | docs.powersync.com/self-hosting/installation/powersync-service-setup |
| Exemplo oficial com Supabase local | `powersync-ja/self-host-demo/demos/supabase` (usa MongoDB; chaves de login lidas do Supabase local) | — | github.com/powersync-ja/self-host-demo |
| Regras de sincronização | O nome atual é "Sync Streams"; "Sync Rules" virou legado; chave `sync_config` | — | docs.powersync.com/sync/rules/overview |
| PowerSync Cloud (hospedado) | Plano grátis: 2 GB sincronizados por mês, 500 MB hospedados, 50 clientes simultâneos; projeto parado é desligado (1 ou 2 semanas: a página diverge). Pagos a partir de US$ 49/mês. Exige aceite do contrato comercial. | — | powersync.com/pricing |

**Como o PowerSync trata conflito** (docs.powersync.com/usage/lifecycle-maintenance/handling-update-conflicts e …/writing-client-changes):

- As alterações do aparelho ficam numa fila ordenada e vão ao servidor uma a uma, pela função `uploadData` do app. Em erro de rede, ficam na fila.
- Padrão: vence a última alteração **que chega ao servidor**, campo a campo. Exclusão tem prioridade.
- Regra diferente (como "`pack_state` mais avançado vence") é escrita no servidor. Se o servidor recusar ou mudar a alteração, o aparelho recebe a versão do servidor.
- A fila sobreviver a fechar o app: **não confirmado** em texto; a fila fica no SQLite, então é provável. P1 testa.

Isso combina com a SPEC (princípio 4 da seção 4). Duas ressalvas para F0-2: a SPEC usa `deleted_at` (exclusão lógica, restaurável), então a "remoção" da prova é uma atualização, e a regra "remoção vence" precisa ser escrita no servidor; e o padrão campo a campo do PowerSync precisa ser conferido contra cada linha da tabela de conflitos.

**Licença:** a preocupação da SPEC (seção 15) com a edição auto-hospedada mudou: desde 03/11/2026 o serviço é Apache 2.0. A decisão "hospedado ou auto-hospedado" em produção continua do responsável, depois da prova. **Decidido em 26/11/2026 (E1):** o PowerSync segue auto-hospedado nas versões 0.x, que é o que a prova mediu; a escolha para produção se faz com custo real antes da 1.0.0 e, de todo modo, antes de a 0.1.0 chegar a outras pessoas (aceite de contrato comercial, se o serviço hospedado for escolhido, é do responsável).

### B3. Supabase local e Docker

| Peça | Versão | Licença e custo | Fonte |
| --- | --- | --- | --- |
| Supabase CLI | v3.4.0 (24/11/2026) | **MIT** (não Apache) | github.com/supabase/cli |
| Instalação no Windows | `npm install supabase --save-dev` (usado com `npx supabase`) ou Scoop. **PROPOSTA:** como dependência do projeto, sem instalar nada global. | — | supabase.com/docs/guides/local-development/cli/getting-started |
| Serviços e portas | API 54321, Postgres 54322, Studio 54323, Mailpit 54324; 13 serviços sobem por padrão, cada um pode ser desligado com `-x` | — | supabase.com/docs/reference/cli/supabase-start |
| Memória | "at least 7GB of RAM to start all services" | — | mesma |
| Replicação lógica para o PowerSync | Imagem `supabase/postgres` vem com `wal_level = logical`. Que o CLI use essa mesma configuração: **não confirmado** (o exemplo oficial não mexe nisso, o que indica que vem ligada). A publicação `powersync` **não vem pronta**: é criada por migração, o que combina com a regra do projeto. | — | github.com/supabase/postgres; github.com/powersync-ja/self-host-demo |
| Docker Desktop | Atual 4.100.1 (23/11/2026). Instalado aqui: 4.94.0. Exige Windows 11 Pro 23H2+ (ok), WSL 2.1.5+, 8 GB de RAM e **virtualização ligada na BIOS**. | Grátis para uso pessoal, educação, open source não comercial e empresa com **menos de 250 funcionários e menos de US$ 10 milhões** de receita anual. **Aceite de termos na primeira abertura** ("Docker Desktop won't run if you do not agree"). | docs.docker.com/desktop/setup/install/windows-install; docker.com/legal/docker-subscription-service-agreement (atualizado em 26/08/2026) |

**Memória estimada com tudo ligado:** Supabase (7 GB recomendados) + 2 emuladores (cerca de 4 GB cada) + PowerSync e MongoDB (não confirmado; estimativa de 1 a 2 GB) = cerca de 17 GB. Cabe em 32 GB com o Android Studio fechado. **PROPOSTA:** desligar no Supabase local os serviços que a prova não usa (por exemplo `imgproxy`, `logflare`, `vector`, `studio` durante os roteiros).

### B4. Android, emulador e Maestro

| Peça | Versão | Licença e custo | Fonte |
| --- | --- | --- | --- |
| Android Studio | Rabbit 2, 2026.2.2 Patch 2; instalador de 1,5 GB; pede 16 GB de RAM para Studio e emulador, cerca de 4 GB por AVD | **Android SDK License Agreement (28/04/2026), aceite antes do download** | developer.android.com/studio; …/studio/install |
| Ferramentas de linha de comando | `commandlinetools-win-15859902_latest.zip`. O `sdkmanager` e o `emulator` estão marcados como obsoletos em favor do novo "Android CLI" (`android sdk`, `android emulator`); os antigos seguem documentados. Estado do Android CLI no Windows: não confirmado. | Mesmo contrato; `sdkmanager --licenses` | developer.android.com/tools/sdkmanager |
| Aceleração do emulador | **WHPX** (Plataforma do Hipervisor do Windows) é a recomendada e convive com Docker e WSL 2. O driver AEHD não convive com eles e **será descontinuado em 31/12/2026**. As duas exigem SVM ligado na BIOS. | — | developer.android.com/studio/run/emulator-acceleration |
| Duas instâncias | Sim. Portas de console 5554, 5556…; alvo com `adb -s emulator-5556` | — | developer.android.com/studio/run/emulator-console |
| Rede no emulador | Console: `network delay`, `network speed`, `gsm data off/on`. Desde o emulador 36.5 o Wi-Fi passa pelo "netsim", então `gsm data off` pode não cortar o Wi-Fi (não confirmado). Comando oficial de **modo avião: não documentado** (só aparece em teste do código do Android). | — | developer.android.com/studio/run/emulator-commandline |
| Relógio | **Comando oficial para adiantar a hora: não documentado.** Há indício, não confirmado, de que mudar a data por comando exige root, que as imagens com Google Play não dão. | — | developer.android.com/studio/run/emulator-commandline; source.android.com/docs/core/connect/time |
| Imagens de sistema | Com Google Play, x86_64: API 35 1,76 GB; API 36 1,92 GB; API 37 2,23 GB | Contrato do SDK | dl.google.com/…/google_apis_playstore/sys-img2-4.xml |
| Maestro CLI | 2.12.1. Roda nativo no Windows (zip + caminho no `PATH`), exige Java 17+. Dois aparelhos: `--device "emulator-5554,emulator-5556"` com `--shard-split` ou `--shard-all`. | **Apache 2.0**, CLI local sem conta. A nuvem e o Maestro Studio não são abertos e não são usados. `MAESTRO_CLI_NO_ANALYTICS` desliga a coleta de uso. | docs.maestro.dev/getting-started/installing-maestro/windows; github.com/mobile-dev-inc/maestro |

**PROPOSTA de emuladores para os itens 1 a 3:** dois AVDs com imagem **"Google APIs"** (sem Play Store), API 36, x86_64. Motivo: a imagem com Play Store não dá root, e adiantar o relógio por comando pode precisar dele. Se o relógio também puder ser mudado sem root, tanto faz. Reserva: mudar a hora pela tela de Configurações do Android, guiado pelo Maestro. A imagem com Play Store só é necessária no item 4, e lá o aparelho que importa é o real (B6).

### B5. Lembretes locais (`expo-notifications`)

| Ponto | O que a documentação diz | Fonte |
| --- | --- | --- |
| Versão | ~58.1.9 no SDK 58; MIT | docs.expo.dev/versions/latest/sdk/notifications |
| Lembrete por data | Gatilho de data; modo `bestEffort` (padrão, alarme exato quando permitido) ou `alarmClock` (novo no SDK 58; exige permissão de alarme exato) | mesma; expo.dev/changelog/sdk-58 |
| Sem permissão de alarme exato | "scheduled notifications arrive at an approximate time". No Android, alarme inexato chega **"within one hour"** do horário. | mesma; developer.android.com/develop/background-work/services/alarms/schedule |
| `SCHEDULE_EXACT_ALARM` | Não vem concedida em instalação nova com Android 13+; a pessoa concede numa tela do sistema; o Expo abre essa tela | developer.android.com (alarms) |
| `USE_EXACT_ALARM` | Concedida automaticamente, mas o Google Play só permite em app cuja função principal é despertador, timer ou calendário; exige declaração no Play Console | support.google.com/googleplay/android-developer/answer/16558241 |
| App fechado | O alarme do sistema acorda o app mesmo fechado (`RTC_WAKEUP`, relógio de parede) | developer.android.com/reference/android/app/AlarmManager |
| "Forçar parada" | No Android 15+, cancela tudo o que o app agendou | developer.android.com/about/versions/15/behavior-changes-all |
| Reinício do aparelho | O `expo-notifications` reagenda sozinho ao religar (`RECEIVE_BOOT_COMPLETED`) | docs.expo.dev/versions/latest/sdk/notifications |
| Permissão de aviso (Android 13+) | Avisos desligados por padrão até a pessoa permitir | developer.android.com/develop/ui/views/notifications/notification-permission |
| Sem internet | **Não confirmado em texto.** O alarme é do próprio aparelho, então é o esperado; F0-3 prova. | — |
| Adiantar o relógio dispara o já agendado | **Não confirmado.** O alarme usa o relógio de parede, o que indica que sim; F0-3 prova. | — |
| Fechar pela lista de recentes mantém o lembrete | **Não confirmado** em texto; F0-3 prova. | — |

### B6. Links que abrem o app

| Ponto | O que a documentação diz | Fonte |
| --- | --- | --- |
| Esquema próprio | `scheme` no `app.json`; exige build de desenvolvimento novo; o Expo Router abre a rota certa sozinho | docs.expo.dev/linking/into-your-app; …/linking/overview |
| App Links | `intentFilters` com `autoVerify: true`; arquivo `/.well-known/assetlinks.json` em `https`, tipo `application/json`, **sem redirecionamento**, com o SHA-256 do certificado (aceita mais de um: teste e produção) | docs.expo.dev/linking/android-app-links; developer.android.com/training/app-links/configure-assetlinks |
| Testar sem domínio | `adb shell am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "<link>"`; forçar o vínculo com `pm set-app-links --package <pacote> 2 <domínio>` (só para domínio declarado com `autoVerify`); a verificação real precisa de internet e do domínio publicado | developer.android.com/training/app-links/verify-android-applinks; developer.android.com/tools/adb |
| Domínio `*.run.app` servir o `assetlinks.json` | **Não confirmado** | — |
| Versões | `expo-router` 58.0.32, `expo-linking` 58.0.17; MIT | registry.npmjs.org |

### B7. Verificação do aparelho (Play Integrity)

| Ponto | O que a documentação diz | Fonte |
| --- | --- | --- |
| Biblioteca do Expo | **`@expo/app-integrity`** 58.0.2, MIT, do próprio Expo. Usa o pedido **padrão** ("Standard request flow"); exige o número do projeto no Google Cloud. A página **não mostra selo de alfa nem de beta**: status formal não confirmado (a SPEC diz alfa; ver J). A página diz "Included in Expo Go". Suporte ao pedido "classic": não confirmado. | docs.expo.dev/versions/latest/sdk/app-integrity |
| Cuidado com o nome | `expo-app-integrity` (sem `@`) é de terceiro, parado desde 2023. Não usar. | registry.npmjs.org |
| O que é exigido | App no Play Console; projeto no Google Cloud **obrigatório**, vinculado pelo Play Console (o vínculo ativa a API e libera as respostas de teste) | developer.android.com/google/play/integrity/setup |
| Como o servidor confere | Conta de serviço do projeto Cloud vinculado chama `decodeIntegrityToken` do Google. O mesmo token decodificado duas vezes volta vazio. | developer.android.com/google/play/integrity/standard |
| Cota e custo | 10.000 pedidos por dia por padrão. **Preço: não confirmado** (nenhuma página diz grátis nem cobra). | …/integrity/setup |
| Emulador | O veredito do aparelho vem **vazio** em emulador que não passa nas checagens do Google Play | developer.android.com/google/play/integrity/verdicts |
| Instalado fora da Play | `UNRECOGNIZED_VERSION` (certificado ou pacote diferentes dos da Play) e `UNLICENSED` (instalado por fora) | mesma |
| Respostas de teste | O Play Console deixa escolher o veredito para e-mails de testadores; exige a versão publicada na faixa de teste | developer.android.com/google/play/integrity/additional-tools; support.google.com/googleplay/android-developer/answer/11395166 |
| Faturamento no Google Cloud | **Não confirmado** se a Play Integrity exige conta de faturamento ou cartão | docs.cloud.google.com/billing/docs/how-to/modify-project |

### B8. Google Play e verificação de desenvolvedor

| Ponto | O que a documentação diz | Fonte |
| --- | --- | --- |
| Conta de desenvolvedor | Taxa única de **US$ 25**; aceite do Contrato de distribuição; e-mail e telefone confirmados por código; documento oficial de identidade; confirmar acesso a um **celular Android físico, sem root, Android 10+**, no app Play Console | support.google.com/googleplay/android-developer/answer/6112435, …/13628312, …/10841920, …/14316361 |
| Prazo da verificação | Meio de pagamento: "up to five days". Identidade de conta nova: **não confirmado** | …/13628312 |
| Teste fechado (12 testadores por 14 dias) | Só para ir à **produção**, em conta pessoal criada depois de 13/11/2023. Não afeta o teste interno. | …/14151465 |
| Faixa de teste interno | Até 100 testadores; disponível "within minutes"; pode começar antes de terminar a configuração do app. Exigência de política de privacidade e classificação antes do teste interno: **não confirmado**. | …/9845334 |
| Formato e assinatura | AAB obrigatório; assinatura de apps pelo Play obrigatória para app novo | developer.android.com/guide/app-bundle; …/studio/publish/app-signing |
| Verificação de desenvolvedor do Android | Em vigor no Brasil desde **30/09/2026** para instalações por lojas participantes. **Instalação por `adb` não exige verificação.** Na Play, o nome do pacote é registrado sozinho ao criar o app; sem taxa extra. **Não trava a prova.** | developer.android.com/developer-verification; …/guides/faq; …/guides/google-play-console |

### B9. GitHub

| Ponto | O que a documentação diz | Fonte |
| --- | --- | --- |
| Proteger ramo em repositório **privado** | **Exige plano pago.** "Protected branches are available in public repositories with GitHub Free … also available in public and private repositories with GitHub Pro, GitHub Team…". Para "rulesets", a tabela de github.com/pricing mostra "Repository rules" só em repositórios públicos no plano Free; o trecho equivalente na página "About rulesets": **não confirmado**. | docs.github.com/…/about-protected-branches; docs.github.com/…/about-rulesets; github.com/pricing |
| Preço do GitHub Pro | **Não confirmado** hoje. Último valor oficial: US$ 4/mês (2020). Team: US$ 4 por usuário/mês. | docs.github.com/…/faq-about-changes-to-githubs-plans; github.com/pricing |
| Repositório público no Free | Proteção permitida. **Escolhido pelo responsável (H4).** | mesma |
| Esteira (Actions) em privado no Free | Equivale a cerca de 2.000 minutos Linux por mês (US$ 12 de uso incluído); sem cartão, para ao acabar. Sem efeito depois de H4 (público). Custo das Actions em repositório público: **não confirmado** hoje. | docs.github.com/en/billing/concepts/product-billing/github-actions |
| E-mail de autor nos commits | O GitHub dá um e-mail que não expõe o pessoal, no formato `ID+USUÁRIO@users.noreply.github.com` (contas criadas depois de 18/07/2017). Aparece ao marcar "Keep my email addresses private" em Settings > Emails. Em um só repositório: `git config user.email "<esse e-mail>"`. **Commits antigos continuam com o e-mail antigo** ("Any commits you made prior to changing your commit email address are still associated with your previous email address"). | docs.github.com/…/setting-your-commit-email-address; docs.github.com/…/email-addresses-reference |
| Bloquear envio que expõe e-mail | Opção "Block command line pushes that expose my email". **Confere só o commit mais recente** de cada envio ("we'll check the most recent commit"). Não substitui a conferência do histórico inteiro. | docs.github.com/…/blocking-command-line-pushes-that-expose-your-personal-email-address |
| Repositório público sem licença | "without a license, the default copyright laws apply, meaning that you retain all rights … no one may reproduce, distribute, or create derivative works". Pelos termos do GitHub, qualquer usuário pode ver e copiar (fork) o repositório público; se ele voltar a privado, as cópias já feitas continuam existindo. | docs.github.com/…/licensing-a-repository |

## C. O que dá para provar só na máquina

| Item | Só na máquina | Depende de serviço externo ou do responsável |
| --- | --- | --- |
| 1. Sincronização offline | Tudo: dois emuladores, Supabase e PowerSync em Docker, usuários de teste locais. | Nada externo. Depende da virtualização ligada na BIOS e do aceite das licenças do Docker Desktop e do Android SDK. |
| 2. Lembrete em modo avião | Tudo: build de desenvolvimento, modo avião e relógio adiantado por comando. | Nada externo. Mesmas dependências da máquina. Aparelho real fica para a validação humana (GIT-13). |
| 3. App abrindo pelo link | Link com esquema próprio, link `https` com o vínculo forçado no emulador (`pm set-app-links … 2 <domínio>`), abertura a frio e com o app aberto. | A verificação automática do App Link (`autoVerify`) exige um domínio `https` publicado com o arquivo `assetlinks.json` (B6). Fica fora da prova. O domínio provisório depende do Cloud Run, que pede projeto com faturamento no Google Cloud (parada do responsável); `run.app` servir esse arquivo é não confirmado. |
| 4. Chamada recusada sem verificação | **Anda agora (F0-5):** a interface própria que isola a biblioteca de verificação (SPEC, seção 2); a função de servidor local que devolve `integrity_required`; a avaliação do veredito escrita contra o formato oficial (B7) e testada com vereditos de exemplo; a prova de desenvolvimento desligada por configuração; os testes automáticos de recusa. | **Pendente até a conta existir (F0-6):** conta de desenvolvedor do Google Play (taxa, contrato, identidade, celular físico); app criado no Play Console; projeto no Google Cloud vinculado; conta de serviço para o servidor conferir a prova com o Google; versão enviada à faixa de teste interno; instalação pela Play. |

**Decisão do responsável (24/11/2026):** a conta de desenvolvedor do Google Play fica para depois. Este plano **não** inclui criar a conta.

- **Anda agora:** F0-0 a F0-5, inclusive a parte local do item 4. Faz sentido pela documentação: a biblioteca do Expo usa o pedido padrão da Play Integrity e o servidor só recebe um token para conferir com o Google (B7). A recusa por falta de prova, por prova de desenvolvimento desligada e por veredito ruim é lógica do nosso servidor, e pode ser escrita e testada antes. O SPEC já pede essa separação (seção 2: biblioteca atrás de interface própria; seção 11: prova de desenvolvimento só no local).
- **Só fecha com a conta:** obter um token real no app, conferir o token com o Google (`decodeIntegrityToken`, que exige o projeto Cloud vinculado e a conta de serviço) e instalar a versão pela faixa de teste. Isso é F0-6.
- **A prova só é dada como completa com o item 4.** Até lá, o resultado (F0-7) registra o item 4 como **pendente**, com o que já foi provado na parte local.
- O que a pendência trava: o veredito final da prova. **Decisão do responsável (24/11/2026, J1 e H9):** a base (B1) pode começar sem a conta do Google Play, com o item 4 pendente. Isso não dispensa os itens 1, 2 e 3 nem a validação humana deles ao fim da prova.

**Atenção ao "app fechado" do item 2.** No Android 15+, "forçar parada" (`am force-stop`) cancela tudo o que o app agendou (B5). É comportamento do sistema, não falha do app. O roteiro fecha o app como uma pessoa fecha: tirando da lista de recentes. O "forçar parada" entra só como caso documentado, não como critério.

## D. Divisão em tarefas

Visão geral:

```
F0-P conferência do que fica público ──> "pode" do responsável ──> envio e proteção do main (F) ──┐
F0-0 máquina ─────────────────────────────────────────────────────────────────────────────────────┴──> F0-1 base
F0-1 base ───────────────────┬─> F0-2 sincronização ──────────────┐
                             ├─> F0-3 lembrete ───────────────────┤
                             ├─> F0-4 link ───────────────────────┼─> F0-7 resultado
                             └─> F0-5 verificação (local) ─────┘
                                       └ ─ ─> F0-6 faixa de teste (PENDENTE: espera a conta do Google Play)
```

- No pico rodam 4 tarefas juntas (F0-2 a F0-5). Cabe no limite de 6 painéis além do orquestrador e do QA. Sobram 2 lugares. F0-P roda em paralelo com F0-0 (não depende da virtualização).
- Cada tarefa tem ramo e pasta de trabalho próprios (SQD-03), saindo do ramo da prova (ver F).
- Para as quatro paralelas não brigarem pelos mesmos arquivos: **F0-1 já instala todas as dependências e configura todos os plugins** (notificações, links, sincronização, verificação). Depois dela, só o orquestrador mexe em `package.json`, `app.json`/`app.config.ts` e na migração base. Se uma tarefa precisar mudar esses arquivos, ela pede ao orquestrador.
- As pastas abaixo seguem a decisão H5 do responsável: a prova mora em `prova/` (E, opção 2).
- O repositório é público (H4): tudo o que entra em commit enviado, inclusive capturas, vídeos e relatórios de `docs/prova-tecnica/evidencias/`, fica aberto. Vale a checagem de G antes de cada envio.
- Todo resultado numérico vai para `docs/prova-tecnica/resultado.md` (F0-7). Evidências pesadas (vídeos, capturas) ficam em `docs/prova-tecnica/evidencias/<tarefa>/`.

### F0-0 Preparar a máquina

- **Objetivo:** deixar a máquina pronta para dois emuladores e o Docker ao mesmo tempo.
- **Antes:** o responsável liga a virtualização na BIOS (H1) e aprova as janelas de administrador (H2).
- **Faz:** ativa a Plataforma do Hipervisor do Windows (WHPX) e a Plataforma de Máquina Virtual; instala Android Studio (ou só as ferramentas de linha de comando), SDK, JDK, Maestro; cria dois emuladores (AVD) com imagem "Google APIs", API 36, x86_64 (PROPOSTA de B4), um de tela pequena e outro de tela grande; liga o Docker Desktop e confere o WSL 2; Supabase CLI fica como dependência do projeto (F0-1), não global.
- **Pastas:** nenhuma do repositório. Registra o que fez em `docs/prova-tecnica/ambiente.md`.
- **Depende de:** H1, H2, H3 (aceites de licença).
- **Paralelo:** nada; é a primeira.
- **Aceite:** leitura de `Win32_Processor.VirtualizationFirmwareEnabled` = True (com hipervisor ativo, o `systeminfo` esconde essa linha); `emulator -accel-check` mostra WHPX disponível; os dois emuladores ligados juntos aparecem em `adb devices`; `docker info` responde; `java -version` mostra a versão exigida em B; `maestro --version` responde; memória livre com tudo ligado acima de 6 GB.
- **Evidência ao QA:** saída de cada comando acima; captura da tela com os dois emuladores abertos.
- **Modelo:** Sonnet 5.5 (instalação com diagnóstico, sem regra de negócio).

### F0-P Conferência do que fica público (obrigatória antes do primeiro envio)

- **Objetivo:** achar e corrigir, antes de enviar, tudo o que não pode ficar aberto no repositório público (H4). Nada é enviado nesta tarefa.
- **O que confere:** o `main` montado pela PROPOSTA 1 de F, **commit por commit** (todos os de `git rev-list main`: arquivos, mensagens, autor e quem gravou), não só a árvore final. Só o `main` é enviado; o ramo `feature/MSC-01-opcoes-de-mascote` e as etiquetas ficam só locais.
- **Faz, por categoria:**
  1. **Segredos e chaves:** busca por padrões de chave, token, senha e chave privada em todas as versões de todos os arquivos (`git log -p main`; `git grep -E <padrões> $(git rev-list main)`); busca por nomes de arquivo sensíveis em todo o histórico (`git log main --name-only`: `.env*`, `*.jks`, `*.keystore`, `*.pem`, `*.key`, `*.p12`, `google-services.json`, credenciais de conta de serviço).
  2. **Dados pessoais:** nome e e-mail de autor e de quem gravou, em todos os commits (`git log main --format='%an <%ae>|%cn <%ce>' | sort -u`); e-mails, telefones e nomes de pessoas nos textos; dados pessoais em capturas de tela e vídeos; metadados de imagens, vídeos e PDFs (autor, programa, caminho, localização).
  3. **Caminhos da máquina e nome de usuário do Windows:** busca por `C:\Users`, `C:/Users`, o nome de usuário do Windows, `AppData`, `.claude` e `.overclock` em arquivos e mensagens de commit.
  4. **Terceiros e licenças:** cada fonte em `design/prototipos/_compartilhado/fontes/` tem o seu `OFL.txt` junto dos arquivos da fonte e nenhum nome reservado foi usado em fonte modificada; licenças das dependências declaradas em `videos/package.json` e `videos/package-lock.json` (inclusive a do Remotion, que não é de código aberto: **não confirmado** se a publicação do código de vídeo pede algo); nenhuma marca, personagem ou imagem de terceiros (regra 6 do `CLAUDE.md`).
  5. **Arquivos que não deveriam ir:** temporários, saídas de ferramenta, arquivos de trabalho grandes (por exemplo `.blend`), relatórios de QA com dado local, pastas de ferramenta (`.claude`, `.overclock`).
  6. **Licença do repositório:** registra que hoje não há arquivo de licença. Não escolhe: é ponto para o responsável (H4b).
- **Já visto nesta revisão (só leitura, 24/11/2026):**
  - Todos os commits de todos os ramos, inclusive o único commit do `main` atual (`f1ed7d7`), têm como autor e como quem gravou um **e-mail pessoal do Gmail**. O endereço não vai neste plano.
  - Três arquivos rastreados têm caminho local com o nome de usuário do Windows: dois relatórios em `design/mascote/qa/relatorios/` (`estrutura-r1` e `estrutura-r2`, `saida-teste-leiame.txt`) e `design/mascote/evidencias/estrutura/auditoria-qa-r2.txt`.
  - Há 8 fontes, cada uma com `OFL.txt`. Há `videos/package.json` com dependências do Remotion. Há um arquivo `.blend` (o modelo 3D do mascote).
- **PROPOSTA para o e-mail (sem alterar nada agora):** usar o e-mail que o GitHub dá para não expor o pessoal (`ID+USUÁRIO@users.noreply.github.com`; B9). Passos, todos depois do "pode" do responsável:
  1. Na conta do GitHub, marcar "Keep my email addresses private" e "Block command line pushes that expose my email" (H4a).
  2. Gravar esse e-mail só neste repositório (`git config user.email`), sem mudar a configuração global.
  3. Como os commits antigos continuam com o e-mail antigo (B9), o `main` da PROPOSTA 1 é montado **do zero**, a partir de um primeiro commit novo com o mesmo conteúdo do `f1ed7d7`, já com o e-mail do GitHub. O `main` antigo fica guardado num ramo local de reserva, que nunca é enviado. Isso reescreve o histórico local do `main`: só com o "pode" do responsável.
  4. A opção de bloqueio confere só o último commit do envio. Por isso a busca do item 2 acima roda no histórico inteiro antes de cada envio, não só no primeiro (G).
- **Correções:** o que é só texto local (caminho, nome de usuário) é corrigido nos arquivos durante a montagem do `main`. Apagar arquivo, trocar ou incluir licença e reescrever histórico vão para decisão do responsável.
- **Pastas:** leitura do repositório inteiro; escreve só `docs/prova-tecnica/conferencia-publica.md`. As correções entram nos commits da PROPOSTA 1, feitas pelo orquestrador ou por quem ele indicar no cartão.
- **Depende de:** PROPOSTA 1 de F montada no `main` local (e aprovada pelo responsável). Roda em paralelo com F0-0.
- **Aceite:**
  - As 6 categorias com resultado, cada uma com o comando usado, o código de saída e a contagem de achados.
  - Zero achados abertos nas categorias 1, 2 e 3 em **todos** os commits do `main` a enviar.
  - A lista de autores e de quem gravou do `main` tem só o e-mail do GitHub (nenhum endereço pessoal).
  - Cada fonte e cada dependência com a sua licença listada; o que não foi confirmado aparece como "não confirmado".
  - A lista do que vai ser enviado tem só o ramo `main` (nenhum outro ramo, nenhuma etiqueta).
- **Evidência ao QA:** `docs/prova-tecnica/conferencia-publica.md`, sem segredos, sem e-mail pessoal e sem nome de usuário do Windows; saídas dos comandos, com o que for sensível mascarado (`***`). O QA repete por amostra duas buscas (e-mail de autor e caminhos locais).
- **Modelo:** Opus 5.5, esforço alto. Motivo: o que ficar público não tem volta (cópias de terceiros continuam existindo, B9).
- **Depois:** o envio ainda espera o **"pode" final do responsável** (H4c), que o piloto pede depois do aprovado do QA.

### F0-1 Base da prova

- **Objetivo:** um app mínimo e um servidor local mínimos, prontos para as quatro provas.
- **Faz:**
  - App Expo em TypeScript, em build de desenvolvimento, instalado nos dois emuladores.
  - Todas as dependências e plugins das provas já declarados (ver acima). Uma tela "viagem" que recebe um identificador.
  - Supabase local em Docker. Uma migração cria as tabelas mínimas `trip`, `trip_member` e `trip_item` (campos da SPEC, seção 3, só os necessários), **com RLS ativo na mesma migração** e políticas por membro.
  - Dois usuários de teste locais (A e B), membros da mesma viagem, e um terceiro (C) de outra viagem. Senhas de teste só em arquivo local fora do git.
  - Endereço do servidor em um único valor de configuração.
  - Teste automático que lista todas as tabelas e falha se alguma estiver sem RLS (SPEC, seção 11).
  - Script único que sobe e derruba tudo (servidor, emuladores) para não sobrar processo (SQD-09).
- **Pastas:** `prova/` e `docs/prova-tecnica/`.
- **Depende de:** F0-0; repositório público criado com o `main` protegido (F, PROPOSTA 2, depois de F0-P e do "pode" do responsável); decisão H6 (nome do pacote Android). H4 e H5 já decididas.
- **Paralelo:** nada; as quatro seguintes dependem dela.
- **Aceite:** `supabase start` sobe sem erro; teste de RLS passa (e falha de propósito numa tabela sem RLS, mostrado uma vez); app abre nos dois emuladores; A não lê nada da viagem de C pela API.
- **Evidência ao QA:** saída dos testes; saída de `supabase status` sem chaves (mascaradas); captura do app nos dois emuladores; `git status` mostrando que nenhum arquivo de segredo está rastreado.
- **Modelo:** Sonnet 5.5. Motivo: estrutura conhecida; a parte de autorização é pequena e o QA confere com teste.

### F0-2 Sincronização offline (item 1)

- **Objetivo:** provar que dois aparelhos editando a mesma lista offline se juntam sem perda e sem duplicar.
- **Faz:**
  - PowerSync auto-hospedado em Docker ligado ao Supabase local; SDK no app.
  - Regras de sincronização: cada aparelho recebe só as viagens de que a pessoa é membro.
  - Envio das alterações locais ao servidor com identificador gerado no aparelho; o servidor ignora repetição.
  - Regras de conflito da SPEC, seção 4, aplicadas no servidor para os dados da prova: `pack_state` mais avançado vence; `item_claim` soma; quantidade, nome e nota pela ordem de chegada, com o valor perdido no histórico do item quando o item é do grupo (SPEC, seção 4); remoção vence edição, e o item pode ser restaurado; dois itens novos com o mesmo nome ficam os dois.
  - Roteiros automáticos que rodam os cenários abaixo nos dois emuladores, com modo avião ligado e desligado por comando.
  - Teste "segunda barreira": C não recebe nada da viagem de A e B pela sincronização (SPEC, seção 11).
  - Checagem rápida, sem ser critério da prova: o SDK aceita banco local cifrado (DEF-11)? Só registrar sim, não ou "não confirmado".
- **Pastas:** `prova/` (subpastas de sincronização, regras de sincronização, roteiros `e2e`) e `docs/prova-tecnica/evidencias/F0-2/`.
- **Depende de:** F0-1.
- **Paralelo:** com F0-3, F0-4 e F0-5.
- **Modelo:** Opus 5.5, esforço alto. Motivo: a parte de maior risco técnico do projeto (SPEC, seção 4).

**Cenários a testar.** Todos com A e B na mesma viagem de grupo, partindo de um estado limpo e conhecido.

| Nº | Base | Cenário na prova | Esperado |
| --- | --- | --- | --- |
| P1 | S1 | A, em modo avião, marca 10 itens; fecha o app; reabre; reconecta | Os 10 no servidor e em B; nenhum duplicado |
| P2 | S2 | A e B, offline, assumem o mesmo item do grupo; reconectam | Duas linhas em `item_claim`; os dois aparelhos mostram as duas famílias. O aviso de duplicado na tela: ver PROPOSTA abaixo. |
| P3 | S3 | A marca `in_car` offline; B, online, marca `set_aside` depois; A reconecta | `in_car` nos dois e no servidor |
| P3b | Princípio 4 | Igual a P3, com o relógio de B 2 horas atrasado e o de A 2 horas adiantado | Mesmo resultado de P3: o relógio não decide |
| P4 | S4 | A remove um item offline; B edita a quantidade do mesmo item; os dois reconectam, nas duas ordens | Removido nos dois e restaurável |
| P5 | S5 | A e B criam offline um item "isqueiro"; reconectam | Dois itens na lista, com identificadores diferentes. A sugestão de juntar na tela: ver PROPOSTA abaixo. |
| P6 | Seção 4, "quantidade" | A e B mudam a quantidade do mesmo **item do grupo** offline; reconectam em ordem conhecida | Vale a última a chegar ao servidor; o valor perdido aparece no histórico do item (SPEC, seção 4, regra de item do grupo) |
| P7 | S7, reduzido | A fica offline com 200 alterações; reconecta | Tudo no servidor e em B; a tela responde durante o envio (sem travar mais de 1 s, medido) |
| P8 | S8 | O envio é cortado no meio (modo avião ligado durante o envio) e repetido | Nenhuma alteração aplicada duas vezes |
| P9 | S10 | B é removido da viagem enquanto está offline com 5 alterações pendentes; reconecta | As 5 são recusadas pelo servidor; B desfaz localmente e recebe aviso |
| P10 | S9 | Sem login, A cria 2 viagens; depois entra com o usuário de teste | As 2 viagens aparecem no servidor com os mesmos identificadores, itens e estados |

- S6 (gastos) fica fora da prova: **PROPOSTA**. Gastos usam o mesmo caminho de envio de P6, e a regra de rastro vai para a feature 2.8. O responsável pode pedir para incluir.
- P7 reduz "7 dias offline" para "token de acesso vencido durante o período offline": é isso que 7 dias mudam na técnica. **PROPOSTA**.
- P2 e P5 conferem a condição nos dados (duas famílias no mesmo item; dois itens com o mesmo nome) e não a tela do aviso de duplicado (S2) nem a da sugestão de juntar (S5). Essas telas são das features 2.5 e 2.12 e não testam a sincronização. **PROPOSTA**. O responsável pode pedir para incluir (H7).

**O que conta como "sem perda".** Cada roteiro grava um registro das alterações feitas em cada aparelho, com o identificador de cada uma. Ao final, um verificador automático confere, alteração por alteração:

- ou ela está no servidor e nos dois aparelhos;
- ou ela foi vencida por uma regra da seção 4, e o estado final é o que a seção 4 manda: P3, `in_car`; P4, item removido e restaurável; P6, o último valor a chegar, com o valor perdido no histórico do item, porque o item é do grupo;
- ou ela foi recusada por permissão (P9) e a pessoa foi avisada.

Para saber quais alterações foram vencidas, o verificador usa um **registro técnico da prova**: a ordem em que cada alteração chegou ao servidor. **Ele não é regra do app** e não vai para a base (PROPOSTA).

Qualquer alteração fora desses três casos é perda. Uma alteração aplicada duas vezes é duplicação. A meta é **zero perda e zero duplicação**.

**O que conta como "estável".**

- Cada cenário de P1 a P10 roda **10 vezes seguidas**, por roteiro, sem mão humana. P7 roda 3 vezes (é longo). Total: 93 execuções.
- Estável = 93 de 93 sem perda, sem duplicação e com os dois aparelhos iguais ao servidor ao final (comparação por resumo do estado de cada tabela).
- Convergência: depois de reconectar, os dois aparelhos ficam iguais ao servidor em até 30 segundos (P7: até 2 minutos). Com os dois online, uma alteração aparece no outro em até 5 segundos (premissa da SPEC, seção 4), medido em 20 alterações; registrar mediana e pior caso.
- **Decidido em 26/11/2026 (D4): contagem do P8.** A convergência do P8 vale contada desde que o app alcança o servidor, não desde o comando de modo avião (o emulador leva de 11 a 24 s para devolver a rede ao app). Com essa contagem o P8 passa e o critério de troca da seção I não é acionado. O P8 se repete em celular físico na B1.
- Falha de roteiro (toque que não aconteceu, emulador travado) não conta como falha de sincronização, mas é registrada e a execução é refeita. Mais de 10% de execuções refeitas é sinal de roteiro instável e volta para F0-2.

**Aceite de F0-2:** os 93 de 93 acima, mais o teste de "segunda barreira" passando.
**Evidência ao QA:** tabela com as 93 execuções (cenário, rodada, resultado, tempo de convergência); saída do verificador; vídeo curto de P1 e de P9 com os dois emuladores lado a lado; capturas do estado final.

### F0-3 Lembrete local em modo avião (item 2)

- **Objetivo:** provar que o lembrete agendado no aparelho chega sem internet e com o app fechado.
- **Faz:** agenda um lembrete local para uma data e hora futura (como o da véspera, SPEC seção 10, texto de teste); pede a permissão de notificação; fecha o app pela lista de recentes; liga o modo avião; desliga a hora automática; adianta o relógio para depois do horário; confere que o aviso apareceu.
- **Casos:** (a) app fechado pela lista de recentes; (b) app em segundo plano; (c) emulador reiniciado entre o agendamento e o horário; (d) permissão de notificação negada: o app não quebra; (e) **sem** a permissão de alarme exato (`SCHEDULE_EXACT_ALARM` não concedida, o padrão em instalação nova): medir o atraso, que pela documentação pode chegar a 1 hora (B5); (f) caso documentado: "forçar parada" cancela.
- Os casos (a), (b) e (c) rodam **com** a permissão de alarme exato concedida pela tela do sistema. `USE_EXACT_ALARM` **não** é usada: a política do Google Play a limita a despertador, timer e calendário (B5).
- Como adiantar o relógio: primeiro por comando no emulador "Google APIs"; se o comando for recusado, pela tela de Configurações, guiada pelo Maestro. Registrar qual funcionou.
- **Pastas:** `prova/` (subpasta de lembretes e roteiros) e `docs/prova-tecnica/evidencias/F0-3/`.
- **Depende de:** F0-1.
- **Paralelo:** com F0-2, F0-4 e F0-5.
- **Decidido em 26/11/2026 (D2b): lembrete com o aparelho desligado na hora.** Se o aparelho estiver desligado no horário e ligar depois, o lembrete é descartado, não entregue atrasado. A regra é perda aceita na 0.1.0, sem aviso de atraso, registrada como limite conhecido e a rever depois do primeiro uso real, com os eventos de medição (NF-09).
- **Aceite:** casos (a), (b) e (c) disparam em **10 de 10** execuções cada, com o aviso aparecendo em até 60 segundos depois do horário adiantado, com modo avião ligado; tocar no aviso abre a tela da viagem, não o início (SPEC, seção 10); (d) sem quebra; (e) atraso medido em 5 execuções (mediana e pior caso); (f) registrado.
- **Evidência ao QA:** saída de `adb shell dumpsys notification` com o aviso; estado do modo avião no mesmo momento; captura da barra de avisos; vídeo curto do caso (a).
- **Modelo:** Sonnet 5.5.

### F0-4 Abrir o app por link (item 3)

- **Objetivo:** provar que um link abre o app direto na viagem.
- **Faz:** link com esquema próprio e link `https` no endereço que vem do único valor de configuração; abre a tela da viagem pelo identificador do link.
- **Casos:** (a) app fechado (abertura a frio); (b) app aberto em outra tela; (c) link com viagem que não existe no aparelho: mensagem clara, sem quebrar; (d) link `https` com o vínculo forçado no emulador; (e) link `https` sem vínculo: registrar o que o Android faz (abre o navegador ou pergunta).
- **Pastas:** `prova/` (subpasta de links e roteiros) e `docs/prova-tecnica/evidencias/F0-4/`.
- **Depende de:** F0-1.
- **Paralelo:** com F0-2, F0-3 e F0-5.
- **Aceite:** (a), (b) e (d) abrem a viagem certa em **10 de 10**; (c) mostra a mensagem; tempo do toque até a tela da viagem medido em (a).
- **Evidência ao QA:** comando `adb shell am start` usado e a saída com o tempo; captura da tela da viagem; saída de `adb shell pm get-app-links` para o caso (d).
- **Fora da prova:** a verificação automática do domínio (precisa de domínio publicado) e o link que abre a viagem depois de instalar o app pela loja (RET-01; ver J3). **Decidido em 26/11/2026 (E5):** o RET-01 fica para a feature 2.4.
- **Decidido em 26/11/2026 (E4): aviso e link ao mesmo tempo.** Se a pessoa tocar num link e houver um aviso de lembrete na mesma hora, o link vence, como foi medido (3 de 3 a frio e 3 de 3 com o app vivo). Mudar isso exigiria alterar o roteamento do app e repetir os testes de link e de lembrete.
- **Modelo:** Sonnet 5.5.

### F0-5 Verificação do aparelho, parte local (item 4, anda agora)

- **Objetivo:** adiantar tudo do item 4 que não depende da conta do Google Play, e provar no servidor local que a chamada sem verificação válida é recusada.
- **Faz:**
  - No app, a biblioteca `@expo/app-integrity` fica atrás de uma interface própria (SPEC, seção 2), para poder trocar pelo módulo nativo sem tocar no resto. Sem a conta, a interface roda com uma implementação de desenvolvimento que gera uma prova falsa marcada como tal.
  - Uma função de servidor de teste, protegida como serão `trip_set_camping` e `submit_fact_reports` (SPEC, seção 11). Sem verificação válida, ela devolve `integrity_required`.
  - A avaliação do veredito escrita contra o formato oficial (B7): aceita só com app reconhecido pela Play (`PLAY_RECOGNIZED`), licença válida e integridade do aparelho; recusa `UNRECOGNIZED_VERSION`, `UNEVALUATED`, `UNLICENSED`, veredito do aparelho vazio, pacote diferente, pedido com resumo diferente do enviado e token já usado.
  - A chamada ao Google (`decodeIntegrityToken`) fica atrás de uma interface no servidor. Nos testes, ela é substituída por vereditos de exemplo montados a partir da documentação oficial. A chamada real só roda em F0-6.
  - Prova de desenvolvimento aceita só quando uma configuração do servidor liga essa aceitação. Desligada por padrão.
- **Testes automáticos:** sem prova → recusa; prova inválida ou de outro app → recusa; cada veredito ruim da lista acima → recusa; veredito bom de exemplo → aceita; prova de desenvolvimento com a aceitação desligada → recusa; prova de desenvolvimento com a aceitação ligada, só no local → aceita; aparelho marcado como verificado com prazo vencido → recusa; teste que garante a aceitação de desenvolvimento desligada na configuração de produção.
- **Pastas:** `prova/` (subpasta do servidor e da interface de verificação) e `docs/prova-tecnica/evidencias/F0-5/`.
- **Depende de:** F0-1. **Não** depende da conta do Google Play.
- **Paralelo:** com F0-2, F0-3 e F0-4.
- **Aceite:** todos os testes acima passam; o app no emulador recebe `integrity_required` e mostra uma mensagem; o resto do app não importa a biblioteca direto (busca no código mostra que só a interface a usa).
- **Evidência ao QA:** saída dos testes com contagem; captura do app recebendo a recusa; resultado da busca pelo nome da biblioteca no código.
- **Decidido em 26/11/2026 (D3): tempos da verificação do aparelho.** Ficam como premissas numéricas provisórias os três valores da prova: 5 minutos (idade máxima do comprovante), 1 minuto (tolerância de relógio) e 24 horas (validade da marca "aparelho verificado"). Valem até a F0-6, quando se decide de novo com um token real. Na B5 ficam em configuração do servidor, para mudar sem nova versão do app.
- **Limite do que F0-5 prova:** a lógica de recusa e a separação da biblioteca. **Não** prova que um token real do Google chega e é conferido. Por isso o item 4 continua **pendente** depois de F0-5.
- **Modelo:** Opus 5.5, esforço alto. Motivo: segurança e antifraude (SPEC, seção 14, "Escolha de modelo").

### F0-6 Versão pela faixa de teste interno (item 4, PENDENTE)

**Esta tarefa não abre agora.** Por decisão do responsável (24/11/2026), espera a conta de desenvolvedor do Google Play existir. O plano não cria a conta. Quando a conta existir, o orquestrador abre esta tarefa.

- **Objetivo:** provar a recusa numa versão instalada pela faixa de teste interno do Google Play, e fechar o item 4.
- **Antes (tudo do responsável, ver H, bloco "quando a conta existir"):** conta criada e verificada; app criado no Play Console com o nome do pacote decidido; projeto no Google Cloud vinculado à Play Integrity; conta de serviço criada, com a chave guardada fora do git; um celular Android físico para o controle positivo.
- **Faz:**
  - Gera a versão assinada (AAB) na máquina, sem EAS; a chave de envio fica fora do git (ver G); assinatura de apps pelo Play (obrigatória para app novo, B8).
  - Envia à faixa de teste interno pelo Play Console, no Chrome do responsável.
  - Liga a implementação real da interface de F0-5 e a conferência real com o Google no servidor.
- **Casos:**
  - (a) versão de desenvolvimento instalada por `adb` no emulador: recusada (esperado `UNRECOGNIZED_VERSION` ou veredito vazio);
  - (b) chamada sem prova: recusada;
  - (c) versão da faixa de teste instalada pela Play num emulador com Play Store: recusada (veredito do aparelho vazio em emulador, B7);
  - (d) **controle positivo:** versão da faixa de teste instalada pela Play num celular físico: aceita. Sem esse caso, um servidor que recusa tudo passaria na prova. É também validação humana (GIT-13). Exige que o servidor seja alcançável pelo celular: ver J4.
  - (e) opcional: respostas de teste do Play Console para o e-mail do testador, para cobrir vereditos raros (funcionar no emulador: não confirmado).
- **Pastas:** `prova/` (só configuração de versão) e `docs/prova-tecnica/evidencias/F0-6/`. Registro dos serviços em `docs/infra.md`, sem segredos.
- **Depende de:** F0-5 e da conta do Google Play com os passos acima.
- **Aceite:** (a), (b) e (c) recusados em 5 de 5 chamadas cada; (d) aceito em 5 de 5; origem da instalação pela Play Store comprovada (`adb shell pm get-install-source` ou equivalente); veredito registrado em cada caso, sem identificadores pessoais.
- **Evidência ao QA:** captura da faixa de teste interno no Play Console sem dados pessoais; saída do comando de origem da instalação; respostas do servidor; trecho do veredito sem identificadores.
- **Modelo:** Sonnet 5.5.

### F0-7 Resultado da prova

- **Objetivo:** juntar os números e dizer, para cada aposta, "segue" ou "troca".
- **Faz:** escreve `docs/prova-tecnica/resultado.md`: um quadro por item com critério, número medido, evidência e veredito; versões efetivamente usadas; licenças; o que ficou para validação humana. **Roda em duas vezes:** primeiro com os itens 1, 2 e 3 e a parte local do item 4, marcando o item 4 como **pendente** e a prova como **incompleta**; depois de F0-6, completa o item 4 e só então declara a prova completa. Conclui o registro em `docs/infra.md` (sem segredos). Encerra emuladores e servidores locais (SQD-09).
- **Pastas:** `docs/`.
- **Depende de:** F0-2 a F0-5 (primeira vez); F0-6 (segunda vez).
- **Aceite:** cada item fechado tem número, evidência conferida pelo QA e veredito; o item 4 aparece como pendente até F0-6, com o que F0-5 já provou. Nenhum segredo no texto. Nenhum processo da prova rodando.
- **Evidência ao QA:** o próprio arquivo; saída de busca por padrões de segredo nos arquivos de `docs/`; lista de processos sem emulador nem container da prova.
- **Modelo:** Sonnet 5.5.

Depois da primeira vez de F0-7 o trabalho **para** e espera a validação humana dos itens 1 a 3. A prova só é dada como completa depois de F0-6 e da segunda vez de F0-7.

## E. Onde o código da prova mora

**Opção 1. A prova já na estrutura final** (`apps/mobile`, `supabase/`, `e2e/`), e vira o começo da base B1.

- Prós: nada é refeito; o ambiente Docker, as regras de sincronização e os roteiros dos dois emuladores já nascem onde vão ficar; B1 começa adiantada.
- Contras: código feito para testar hipótese vira fundação sem ter sido desenhado para isso; se a prova mandar trocar uma tecnologia (por exemplo, sair do PowerSync), a estrutura final nasce suja; tabelas mínimas da prova podem conflitar com o esquema completo da feature B5.

**Opção 2. A prova numa pasta separada** (`prova/`), fora da estrutura da SPEC.

- Prós: a base B1 começa limpa e desenhada; trocar uma tecnologia não deixa resto; fica claro o que é teste de hipótese.
- Contras: parte do trabalho é refeita em B1 (ambiente Docker, scripts dos emuladores, roteiros de sincronização); duas cópias parecidas por um tempo.

**Decisão do responsável (24/11/2026, H5): opção 2, com reaproveitamento explícito.** A prova fica em `prova/` e entra no ramo principal num commit F0, como registro que dá para rodar de novo. B1 cria a estrutura final e copia, de forma declarada no cartão da tarefa, só o que a prova aprovou: o ambiente Docker, os scripts de emulador e o verificador de "sem perda". A pasta `prova/` sai do ramo principal quando a feature 2.12 (cenários S1 a S10) estiver aprovada.

## F. Git e GitHub

**Situação hoje (lida com `git log`, sem alterar nada):**

- Repositório só local, sem remoto.
- `main` em `f1ed7d7` (PRD, spec, pedidos da Cinema e regras).
- `feature/MSC-01-opcoes-de-mascote` tem 18 commits acima do `main`, de várias features: MSC-01 a MSC-14, DSG-01, DSG-05, DSG-06, VID-01 e um de documentos. Tamanho do pacote: 43 MiB; maior arquivo: 1,9 MB (abaixo dos limites do GitHub).
- Os commits já se separam por pasta: `design/mascote` (mascote), `design/prototipos` e `docs/DESIGN.md` (protótipo), `videos/` (vídeo), `docs/TECNICA-3D.md` e `roteiros/` (documentos). Exceção: um commit DSG-01 também mexe em `design/mascote` (a recomendação da Cinema).

**PROPOSTA 1. Como o trabalho aprovado entra no principal (GIT-03, GIT-04).** O orquestrador monta, no `main` local, um commit por feature aprovada, separando por pasta:

1. `MSC-01 a MSC-14: mascote 03 (Filhote de gorro) e pacote final` — `design/mascote`.
2. `DSG-01, DSG-05, DSG-06: protótipo Rumo, paleta Eucalipto e DESIGN.md` — `design/prototipos`, `docs/DESIGN.md`.
3. `VID-01, MSC-14: vídeo do mascote 3D` — `videos/`.
4. `docs: técnica 3D e roteiros` — `docs/TECNICA-3D.md`, `roteiros/`, e `.gitignore`.

Como o repositório é público (H4), o `main` é montado do zero, a partir de um primeiro commit novo com o conteúdo do `f1ed7d7`, com o e-mail do GitHub como autor (F0-P). Antes de enviar: o QA confere que a árvore final do `main` é idêntica à do ramo `feature/MSC-01-opcoes-de-mascote`, exceto pelas correções listadas na conferência F0-P (a diferença mostra só essas). O ramo antigo só é apagado depois do envio confirmado (SQD-08). Alternativa mais simples: um único commit para toda a fase de design. Ela cumpre "um commit aprovado sobe" do `CLAUDE.md`, mas não "um commit por feature" do GIT-03.

**PROPOSTA 2. Ordem no GitHub.**

1. Montar o `main` local (PROPOSTA 1), do zero, com o e-mail do GitHub como autor (F0-P).
2. Rodar a conferência F0-P; o QA aprova.
3. O piloto pede ao responsável o **"pode" final do envio** (H4c).
4. Criar o repositório **público** na conta já logada no `gh` (ver A).
5. Enviar só o `main` (`git push origin main`; nunca `--all`, `--mirror` nem `--tags`). Primeiro envio, antes da proteção.
6. Proteger o `main`: entrada só por pedido de integração (pull request), sem envio direto, sem reescrever histórico, sem apagar o ramo, integração só por "squash". Sem exigir aprovação de outra pessoa: com uma conta só, ninguém consegue aprovar o próprio pedido.
7. Nenhuma esteira (workflow) em envio nem em pedido de integração; só em etiqueta de versão `v*` (GIT-05).
8. Cada feature aprovada entra por um pedido de integração com o ID no título, integrado em "squash" pelo orquestrador (GIT-03, GIT-04).

**PROPOSTA 3. Ramo da prova (GIT-01).** `feature/F0-prova-tecnica`, saindo do `main` depois da PROPOSTA 1. Cada tarefa trabalha num ramo próprio saindo dele: `feature/F0-1-base`, `feature/F0-2-sincronizacao`, `feature/F0-3-lembrete`, `feature/F0-4-link`, `feature/F0-5-verificacao`, `feature/F0-6-faixa-de-teste`, `feature/F0-7-resultado`. Cada um volta ao ramo da prova depois do aprovado do QA, só localmente. No fim, um único commit `F0: prova técnica` entra no `main` pelo GitHub.

**Proteção do ramo principal e custo (conferido em 24/11/2026).** Em conta pessoal no plano GitHub Free, a proteção de ramo e as "rulesets" só existem em repositório **público**. Em repositório **privado**, exigem GitHub Pro, Team ou Enterprise (docs.github.com, "About protected branches"; github.com/pricing; para "rulesets", ver B9). As opções apresentadas foram (a) privado com GitHub Pro pago, (b) público no Free e (c) privado sem proteção até decidir.

**Decisão do responsável (24/11/2026, H4): (b), repositório público e gratuito.** Ele foi avisado de que o código, o PRD e a SPEC ficam abertos a qualquer pessoa. A proteção do `main` passa a existir sem plano pago, e a divergência J8 se resolve. Consequências: a conferência F0-P antes do primeiro envio; o "pode" final do responsável (H4c); a checagem de G antes de cada envio seguinte; a licença do repositório como ponto aberto (H4b).

## G. Segurança já na prova

| Regra do `CLAUDE.md` | Como vale na prova | Como o QA confere |
| --- | --- | --- |
| Toda tabela com RLS na mesma migração que a cria | As tabelas `trip`, `trip_member`, `trip_item` e as de apoio da prova nascem com RLS e políticas na mesma migração. As tabelas internas do PowerSync e da verificação também. | Teste que lista as tabelas e falha se alguma estiver sem RLS (F0-1); leitura das migrações. |
| Dados de camping nunca vão em lote ao aparelho | A prova não tem dado de camping. As regras de sincronização entregam só viagens de que a pessoa é membro. | Teste da "segunda barreira" (F0-2): C não recebe nada de A e B. |
| Nenhum segredo em arquivo versionado, conversa, registro, captura ou commit | Senhas de teste, chave de serviço do Supabase local, segredo de assinatura de token do PowerSync, chave de envio do Android e credencial do Google Cloud ficam em arquivos `.env.local` e numa pasta de chaves **fora do repositório** (por exemplo `C:\Users\<usuário>\.campinguim\chaves\`). No repositório, só `.env.example` com nomes, sem valores. Capturas e vídeos com as chaves fora da tela. | O `.gitignore` atual já cobre `.env*`, `*.jks`, `*.keystore`, `*.pem`, `*.key`. Antes de cada commit, busca por padrões de segredo nos arquivos alterados (GIT-08). Revisão das capturas. |
| Banco só muda por migração versionada | Toda mudança, até na prova, é arquivo de migração em `prova/`. Nada pelo painel local do Supabase. | `supabase db reset` recria tudo do zero e os testes passam. |
| `run.app` só no arquivo de configuração | O endereço do servidor e o do link `https` vêm de um único valor de configuração. Na prova local ele aponta para o emulador (`10.0.2.2`) e para um domínio de teste. | Teste que falha se `run.app` aparecer fora do arquivo de configuração (SPEC, seção 14). |
| Sem CPF, telefone ou localização | Nenhum campo desses nas tabelas da prova; o app não declara permissão de localização. | Leitura do manifesto Android gerado: sem `ACCESS_FINE_LOCATION` nem `ACCESS_COARSE_LOCATION`. |
| Chave de serviço só no servidor (DEF-09) | O app carrega só a chave pública do Supabase local. | Busca da chave de serviço no pacote do app gerado. |
| Verificação do aparelho (DEF-04, FRD-04) | Aceitação de prova de desenvolvimento desligada por padrão. | Teste de F0-5. |
| Repositório público (H4) | Tudo o que é enviado fica aberto, inclusive `docs/infra.md`, capturas, vídeos e relatórios. Commits com o e-mail do GitHub, nunca o pessoal. Capturas sem e-mail, nome de conta pessoal nem nome de usuário do Windows. Relatórios sem caminho da máquina. | F0-P antes do primeiro envio. Antes de cada envio seguinte: lista de autores dos commits novos, busca por padrões de segredo e por caminhos locais nos arquivos alterados. |

## H. O que precisa do responsável

Na ordem em que vai ser preciso. "Trava" é o que para se demorar.

**Agora, antes de qualquer tarefa**

| Nº | O quê | Tipo | Por quê | Quando | O que trava se demorar |
| --- | --- | --- | --- | --- | --- |
| H1 | Ligar a virtualização da CPU (SVM / AMD-V) na BIOS da placa-mãe e reiniciar | Ação física na máquina | Docker Desktop, WSL 2 e emulador com aceleração exigem (B3, B4). Hoje está desligada. | Antes de F0-0 | **Tudo.** Nenhuma das quatro provas anda sem isso. |
| H2 | Aprovar as janelas de administrador do Windows (ativar WHPX e Plataforma de Máquina Virtual; instaladores) | Ação na máquina | O agente não pode aprovar elevação | Durante F0-0 | F0-0 e, por consequência, tudo |
| H3 | Aceitar o Android SDK License Agreement e o contrato de assinatura do Docker Desktop; confirmar que o uso cabe na gratuidade do Docker (B3) | Aceite de termos (**26/11/2026, E3: o responsável confirmou que o Docker Desktop cabe na gratuidade**) | Regra do `CLAUDE.md`: aceite de termos é do responsável | Durante F0-0 | F0-0 e tudo depois |
| H4 | GitHub: **decidido em 24/11/2026: repositório público e gratuito (b)** | Decisão (feita) | SPEC, seção 14 | — | — |
| H5 | Onde mora o código da prova: **decidido em 24/11/2026: pasta separada `prova/` (E, opção 2)** | Decisão (feita) | — | — | — |
| H4a | Aprovar a montagem do `main` do zero com o e-mail do GitHub (F, PROPOSTA 1; F0-P) e marcar na conta do GitHub "Keep my email addresses private" e "Block command line pushes that expose my email" | Decisão; mudança de configuração da conta; login se a sessão não servir | O e-mail pessoal está em todos os commits atuais e não pode ir ao repositório público | Antes de F0-P (a montagem vem antes da conferência) | F0-P, o envio e F0-1 em diante |
| H4b | Escolher se o repositório tem licença, e qual. Sem licença, vale "todos os direitos reservados", mas qualquer pessoa pode ver e copiar pelo GitHub (B9). O agente não decide. | Decisão | Ponto aberto pela decisão H4 | Antes do "pode" final (H4c) | Só o envio |
| H4c | **"Pode" final do envio**, pedido pelo piloto depois de F0-P aprovada pelo QA: criar o repositório público e enviar o `main` | Autorização (ação sem volta: o que é publicado pode ser copiado) | Regra do `CLAUDE.md`: ação sem volta | Depois de F0-P | Repositório protegido e, pela SPEC, F0-1 em diante |
| H6 | Nome do pacote Android (por exemplo, no formato `br.com.<domínio>.campinguim`) | Decisão (**decidido em 26/11/2026, D1: manter o provisório até existir a conta do Google Play e o domínio; o definitivo sai do domínio registrado, escrito ao contrário, e é fixado antes de criar o app no Google Play**) | Fica preso para sempre ao app quando ele for criado no Google Play. O PRD diz que os domínios ainda não foram registrados. | Antes de F0-1 (F0-1 pode usar um nome provisório marcado; o definitivo é obrigatório antes de F0-6) | Nada agora, se o provisório for aceito; F0-6 depois |
| H7 | Escopo de F0-2: S6 (gastos) fora; S7 reduzido a "token vencido durante o período offline"; telas do aviso de duplicado (S2) e da sugestão de juntar (S5) fora (D, PROPOSTAS) | Decisão | Não inventar escopo | Antes de F0-2 | F0-2 |

**Depois da primeira rodada de resultados**

| Nº | O quê | Tipo | Por quê | Quando | O que trava se demorar |
| --- | --- | --- | --- | --- | --- |
| H8 | Lembrete sem alarme exato pode chegar até 1 hora atrasado; decidir se o app pede a permissão de alarme exato (uma tela a mais) ou aceita o atraso (J7) | Decisão de produto (**decidido em 26/11/2026, D2: o app pede o alarme exato só quando a viagem tem data e o aparelho ainda não o concedeu, na tela explicativa do RET-03; se a pessoa recusar, segue com o lembrete aproximado e não pede de novo. D2b: lembrete descartado com o aparelho desligado na hora é perda aceita na 0.1.0, sem aviso de atraso, a rever com uso real**) | Regra de negócio; o agente não decide | Depois de F0-3 | A feature 1.6 da etapa 1, não a prova |
| H9 | Validar os itens 1, 2 e 3 (continua valendo, ao fim da prova): **validação dos itens 1 a 3 feita pelo responsável em 26/11/2026.** Se a base (B1) pode começar com o item 4 pendente (J1): **decidido em 24/11/2026: sim, a base pode começar sem a conta do Google Play.** F0-6 e a segunda vez de F0-7 continuam pendentes até a conta existir; o item 4 segue "parte local aprovada, parte da loja pendente". | Validação humana (feita em 26/11/2026) e decisão (feita) | A SPEC põe B1 depois de F0; o responsável disse que a prova só é completa com o item 4 | Depois da primeira vez de F0-7 | Todo o desenvolvimento seguinte |
| H10 | Se a sincronização falhar: aceitar a troca para a fila própria (I) | Decisão | Troca de tecnologia é decisão humana (SPEC, seção 1) | Só se F0-2 falhar | Etapa 1 |

**Quando a conta do Google Play existir (não planejado agora; o responsável deixou para depois)**

| Nº | O quê | Tipo | Por quê | O que trava se demorar |
| --- | --- | --- | --- | --- |
| H11 | Criar a conta de desenvolvedor: login Google; taxa única de US$ 25; aceite do Contrato de distribuição; e-mail e telefone por código; documento oficial; confirmar um celular Android físico, sem root, Android 10+ (B8). **Decidido em 26/11/2026 (E2): abrir a conta no começo da etapa 1, para a verificação de identidade andar em paralelo, e ter o celular Android físico à mão até a feature 1.6.** | Login, pagamento, termos, identidade | Sem conta não há faixa de teste nem Play Integrity | Item 4 e, com ele, a prova completa |
| H12 | Projeto no Google Cloud vinculado à Play Integrity; conta de serviço para o servidor; possível conta de faturamento (não confirmado) | Login, termos do Google Cloud, talvez pagamento | O servidor precisa conferir a prova com o Google (B7) | F0-6 |
| H13 | Conta Google de testador na faixa de teste interno, logada no celular físico e no emulador com Play Store | Login | Instalar a versão pela Play | F0-6 |
| H14 | Como o celular físico alcança o servidor no controle positivo (J4) | Decisão; talvez pagamento | O servidor local não é alcançável de fora da máquina | Caso (d) de F0-6 |

## I. Riscos e plano B

| Aposta | Risco | Plano B (tabela da SPEC, seção 2) | Sinal que dispara a troca |
| --- | --- | --- | --- |
| Sincronização com PowerSync | Perda, duplicação ou estado diferente entre aparelhos; licença da edição auto-hospedada que não sirva para produção; banco local cifrado sem suporte | Fila própria de alterações com leitura incremental | Qualquer perda ou duplicação em P1 a P10 que continue depois de 2 rodadas de correção em F0-2; convergência acima de 30 s (2 min em P7) de forma repetida; licença ou custo recusados pelo responsável. A troca acontece antes da etapa 1 (SPEC, seção 2). **Decidido em 26/11/2026 (D4):** a convergência conta desde que o app alcança o servidor, então o sinal do P8 não foi acionado e o PowerSync segue; o P8 se repete em celular físico na B1. |
| Lembrete local | O aviso não chega com o app fechado, depois de reiniciar, ou chega muito atrasado sem alarme exato | **A SPEC não define alternativa** ("—"). Ver J2. | Menos de 10 de 10 nos casos (a), (b) ou (c) de F0-3 |
| Link que abre o app | O link `https` não abre o app sem domínio verificado | **A SPEC não define alternativa** ("—"). Ver J2. | Casos (a), (b) ou (d) de F0-4 abaixo de 10 de 10 |
| Verificação do aparelho | A biblioteca do Expo (em fase inicial) não funciona, muda de interface ou não atende o pedido padrão | Módulo nativo direto, atrás da mesma interface própria | F0-5 ou F0-6 não conseguem obter a prova pela biblioteca, ou a biblioteca não compila no SDK escolhido |
| App em Expo e React Native | O conjunto (Expo, PowerSync, notificações, verificação) não compila junto ou não roda em build de desenvolvimento no Windows | Flutter | Falha geral em F0-1 que não se resolve com as versões indicadas em B |
| Servidor Supabase | O Supabase local não sobe ou não convive com o PowerSync no Docker | Postgres com servidor próprio em Node | F0-1 ou F0-2 travadas pelo Supabase local |
| Repositório público (H4) | Algo sensível (segredo, e-mail pessoal, caminho da máquina, conteúdo de terceiros) chega ao GitHub. Apagar depois não desfaz cópias já feitas. | Prevenção: F0-P antes do primeiro envio e checagem de G antes de cada envio. Se escapar: trocar na hora a chave exposta, corrigir o arquivo e avisar o responsável; reescrever o histórico publicado só com o "pode" dele. | Qualquer achado de F0-P ou da checagem de G em commit já enviado |
| Máquina | A virtualização não liga na BIOS, ou o WHPX não convive com o Docker | Outra máquina para emuladores; sem plano B na SPEC | F0-0 sem aceite |
| Relógio no emulador | Adiantar o relógio por comando pode exigir permissão de administrador do Android (root), que as imagens com Google Play não dão (não confirmado) | Adiantar pela tela de Configurações do emulador, por roteiro do Maestro; ou usar imagem "Google APIs" para F0-3 | Comando recusado em F0-3 |
| Play Integrity no emulador | O veredito vem em branco em emulador; a prova "aceita" nunca acontece no emulador | Respostas de teste do Play Console para o emulador; aceite real só em aparelho real (validação humana) | Já esperado; não troca tecnologia |

## J. Dúvidas e divergências

**Divergência entre PRD e SPEC:** nenhuma encontrada nos requisitos lidos que mude a prova. Os pontos abaixo são dúvidas, lacunas e diferenças entre os documentos e a documentação oficial de hoje.

| Nº | Ponto | Onde | O que precisa |
| --- | --- | --- | --- |
| J1 | A SPEC põe B1 depois de F0. O responsável decidiu que o item 4 fica pendente e que a prova só é completa com ele. Pode B1 começar com os itens 1 a 3 aprovados e o item 4 pendente? | SPEC, seção 14; decisão de 24/11/2026 | **Resolvida** pela decisão do responsável (24/11/2026, H9): "deixa google play para depois, primeiro vamos desenvolver." Sim, a base pode começar sem a conta do Google Play. F0-6 e a segunda vez de F0-7 continuam pendentes até a conta existir. Não dispensa os itens 1, 2 e 3 nem a validação humana deles ao fim da prova. **Quando (decidido em 26/11/2026, E2):** a conta de desenvolvedor abre no começo da etapa 1 e o celular Android físico fica à mão até a feature 1.6. |
| J2 | A tabela da SPEC não tem plano B para lembretes nem para links ("—"). Se F0-3 ou F0-4 falharem, não há alternativa definida. | SPEC, seção 2 | Decisão do responsável só se falharem; o agente não escolhe outra tecnologia |
| J3 | O RET-01 pede que o link abra a viagem "inclusive para quem ainda vai instalar o app" (abrir na viagem depois de instalar pela loja). A prova (item 3) cobre só o app já instalado. | PRD, RET-01; SPEC, seção 2 | Saber se isso entra na prova ou fica para a feature 2.4. **PROPOSTA:** fica para 2.4. **Decidido em 26/11/2026 (E5):** fica para a feature 2.4 (RET-01); a prova cobre só o app já instalado. |
| J4 | O controle positivo do item 4 (aceitar com prova válida) só acontece em celular físico instalado pela Play. O celular precisa alcançar o servidor, que na prova é local. Opções: servidor no Cloud Run (exige projeto com faturamento), túnel temporário (serviço externo novo) ou rede local com exceção de tráfego sem cifra (fraco em segurança). | SPEC, seções 11 e 13; GIT-13 | Decisão do responsável quando a conta existir (H14). **PROPOSTA:** Cloud Run, que já é o serviço previsto na SPEC. |
| J5 | A SPEC diz que a biblioteca do Expo para verificação está em versão alfa. A página oficial de hoje (`@expo/app-integrity` 58.0.2) não mostra selo de alfa nem de beta e diz "Included in Expo Go". | SPEC, seções 2 e 15; docs.expo.dev | Só registro. O isolamento atrás de interface própria continua valendo. |
| J6 | A SPEC (seção 15) trata a licença da edição auto-hospedada do PowerSync como ponto de decisão. Desde 03/11/2026 o serviço é Apache 2.0. | SPEC, seção 15; powersync.com | Só registro; atualizar a SPEC é decisão do orquestrador. **Decidido em 26/11/2026 (E1):** seguir com o PowerSync auto-hospedado nas versões 0.x, que é o que a prova mediu; a escolha entre hospedado e auto-hospedado em produção se decide com custo real antes da 1.0.0 e, de todo modo, antes de a 0.1.0 chegar a outras pessoas. |
| J7 | E1-08 pede o lembrete "no dia anterior" e "chega sem internet"; a SPEC (seção 10) fixa 18h. Sem a permissão de alarme exato (não concedida por padrão no Android 13+), o Android pode atrasar até 1 hora. Pedir a permissão é uma tela a mais, além da do RET-03. `USE_EXACT_ALARM` não serve pela política do Google Play. | PRD, E1-08, RET-03; SPEC, seção 10; B5 | Decisão de produto (H8). A prova mede os dois casos. **Decidido em 26/11/2026 (D2):** pedir só quando a viagem tem data e o aparelho ainda não concedeu, dentro da tela do RET-03; recusado, segue com o aproximado e não pede de novo. **D2b:** aparelho desligado na hora do lembrete, perda aceita na 0.1.0, sem aviso de atraso, a rever com uso real (NF-09). |
| J8 | A SPEC exige repositório com o ramo principal protegido antes de qualquer agente de desenvolvimento. Em repositório privado, isso exige plano pago. | SPEC, seção 14; GIT-04; B9 | **Resolvida** pela decisão H4 (público, 24/11/2026). |
| J16 | O repositório não tem arquivo de licença. Público sem licença significa "todos os direitos reservados". PRD e SPEC não falam de licença. | B9; F0-P | Decisão do responsável (H4b) |
| J9 | O GIT-03 pede um commit por feature aprovada no principal. O ramo atual junta 18 commits de várias features (MSC, DSG, VID). | GIT-03; `CLAUDE.md` | PROPOSTA 1 de F |
| J10 | O GIT-04 diz "ninguém envia direto" e "a entrada é feita pelo orquestrador". Com uma conta só, o GitHub não deixa exigir aprovação de outra pessoa no pedido de integração. A aprovação do QA fica registrada no texto do pedido. | GIT-04 | Confirmar que isso atende |
| J11 | S7 fala em "7 dias offline". Para a técnica, o que 7 dias mudam é o token de acesso vencido. A SPEC usa exclusão lógica (`deleted_at`); o PowerSync dá prioridade a exclusão de linha, e "remoção vence, mas pode ser restaurada" precisa de regra própria no servidor. | SPEC, seções 3 e 4; B2 | PROPOSTA em D (H7) |
| J12 | O nome do pacote Android não está definido no PRD nem na SPEC, e não muda depois de criado no Google Play. | — | Decisão do responsável (H6). **Decidido em 26/11/2026 (D1):** provisório até existir a conta do Google Play e o domínio; o definitivo sai do domínio ao contrário. |
| J13 | A gratuidade do Docker Desktop depende do porte da empresa e do uso comercial. O Campinguim prevê receita (afiliados, oferta paga). | B3 | Confirmação do responsável (H3). **Decidido em 26/11/2026 (E3):** confirmado, o Docker Desktop cabe na gratuidade. |
| J14 | As páginas oficiais divergem na plataforma do Android SDK para o Expo SDK 58 (35, 36 ou 37). | B1 | Técnico; F0-1 resolve com o primeiro build e registra |
| J15 | O `CLAUDE.md` lista a "sincronização" entre os serviços configurados pelo Chrome. Na prova, a sincronização roda só local, em Docker. Nenhum serviço externo de sincronização é criado. | `CLAUDE.md`; SPEC, seção 15 | Só registro; produção decide depois da prova |

## Fontes consultadas

Todas oficiais, consultadas em 24/11/2026:

- Expo: expo.dev/changelog, expo.dev/changelog/sdk-58, expo.dev/pricing, docs.expo.dev (versions/latest; develop/development-builds/introduction; build-reference/local-builds; get-started/set-up-your-environment; workflow/prebuild; versions/latest/sdk/notifications; versions/latest/sdk/app-integrity; linking/into-your-app; linking/overview; linking/android-app-links), registry.npmjs.org.
- React Native: reactnative.dev/docs/set-up-your-environment.
- PowerSync: docs.powersync.com (client-sdks/reference/react-native-and-expo; client-sdks/frameworks/expo-go-support; resources/supported-platforms; usage/use-case-examples/data-encryption; self-hosting/getting-started; self-hosting/installation/powersync-service-setup; installation/database-setup; sync/rules/overview; usage/lifecycle-maintenance/handling-update-conflicts; installation/app-backend-setup/writing-client-changes; architecture/client-architecture), powersync.com/pricing, powersync.com/legal/licensing-terms, powersync.com/blog/moving-the-powersync-service-to-apache, releases.powersync.com, github.com/powersync-ja (powersync-js, powersync-service, self-host-demo), hub.docker.com/r/journeyapps/powersync-service.
- Supabase: supabase.com/docs/guides/local-development/cli/getting-started, supabase.com/docs/reference/cli/supabase-start, github.com/supabase/cli, github.com/supabase/postgres.
- Docker: docs.docker.com/desktop/release-notes, docs.docker.com/desktop/setup/install/windows-install, docs.docker.com/subscription/desktop-license, docker.com/legal/docker-subscription-service-agreement.
- Android: developer.android.com (studio; studio/install; tools/sdkmanager; studio/run/emulator-acceleration; studio/run/managing-avds; studio/run/emulator-console; studio/run/emulator-commandline; build/jdks; build/releases/gradle-plugin; develop/background-work/services/alarms/schedule; reference/android/app/AlarmManager; about/versions/15/behavior-changes-all; develop/ui/views/notifications/notification-permission; training/app-links/configure-assetlinks; training/app-links/verify-android-applinks; tools/adb; guide/app-bundle; studio/publish/app-signing; developer-verification e guias), dl.google.com (manifesto das imagens de sistema), source.android.com/docs/core/connect/time.
- Play Integrity: developer.android.com/google/play/integrity (overview, setup, standard, verdicts, additional-tools).
- Google Play: support.google.com/googleplay/android-developer (respostas 6112435, 13628312, 10841920, 14316361, 14151465, 9845334, 11395166, 16558241).
- Google Cloud: docs.cloud.google.com/billing/docs/how-to/modify-project, docs.cloud.google.com/resource-manager/docs/creating-managing-projects.
- GitHub: docs.github.com (about-protected-branches, about-rulesets, githubs-plans, faq-about-changes-to-githubs-plans, billing/concepts/product-billing/github-actions, setting-your-commit-email-address, email-addresses-reference, blocking-command-line-pushes-that-expose-your-personal-email-address, licensing-a-repository), github.com/pricing.
- Maestro: docs.maestro.dev (installing-maestro/windows, maestro-cli/environment-variables, specify-and-start-devices), github.com/mobile-dev-inc/maestro.
- Java: adoptium.net/docs/faq.
- Microsoft: learn.microsoft.com/windows/wsl/faq.

## Não confirmado (lista única)

1. Tamanho instalado do Android Studio e das ferramentas de linha de comando.
2. Plataforma do Android SDK exigida pelo Expo SDK 58 (35, 36 ou 37).
3. Compatibilidade do PowerSync 2.4.1 com Expo 58 / React Native 0.88 (só há mínimos publicados).
4. SQLCipher no Expo sem passo extra.
5. Etiquetas de versão fixa da imagem do PowerSync no Docker Hub.
6. Aceite de termos além da Apache 2.0 na edição aberta do PowerSync.
7. A fila de envio do PowerSync sobreviver a fechar o app (provável; P1 testa).
8. `wal_level = logical` no Postgres do Supabase CLI local.
9. Comando oficial de modo avião e de adiantar o relógio no emulador; se exige root.
10. `gsm data off` cortar também o Wi-Fi do emulador.
11. Lembrete local disparar sem internet, ao adiantar o relógio e depois de fechar pela lista de recentes (F0-3 prova).
12. O domínio `*.run.app` servir o `assetlinks.json`.
13. Status formal (alfa, beta, estável) do `@expo/app-integrity` e suporte ao pedido "classic".
14. Custo da Play Integrity API e exigência de faturamento no Google Cloud.
15. Respostas de teste da Play Integrity funcionarem no emulador.
16. Política de privacidade e classificação exigidas antes do teste interno.
17. Prazo de verificação de identidade de conta pessoal nova no Google Play.
18. Preço atual do GitHub Pro (sem efeito depois de H4: repositório público).
19. Custo das Actions em repositório público.
20. Se publicar o código de vídeo que usa o Remotion pede algo pela licença dele (F0-P confere).
19. Versão do JDK embutido no Android Studio.
20. Memória usada pelo PowerSync e pelo MongoDB em Docker.
