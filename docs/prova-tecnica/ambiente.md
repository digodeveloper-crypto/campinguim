# Ambiente da prova técnica (F0-0)

24/11/2026 · tarefa F0-0 "Preparar a máquina" · executada por pane-645 (Sonnet 5.5)

Registro do que foi instalado e configurado na máquina de desenvolvimento. Nada aqui está dentro do repositório além deste arquivo e das evidências em `docs/prova-tecnica/evidencias/F0-0/`. Sem segredos, sem login em nenhum serviço, sem conta criada. Caminhos escritos com `%LOCALAPPDATA%` e `%USERPROFILE%`.

## Resumo

| Peça | Versão | Onde fica | Estado |
| --- | --- | --- | --- |
| Virtualização no firmware | ligada (H1, feita pelo responsável) | BIOS | OK |
| WHPX (Plataforma do Hipervisor do Windows) | `emulator -accel-check`: "WHPX(10.0.26300) is installed and usable" | Windows | OK, sem precisar ativar nada |
| Docker Desktop | 4.94.0 (cliente e servidor 29.8.2), WSL 2 | `C:\Program Files\Docker` | Rodando; `docker info` responde |
| JDK | Temurin 17.0.21.1+2 | `C:\Ferramentas\jdk-17` | OK |
| Android SDK | cmdline-tools 22.0 (`commandlinetools-win-15859902`), platform-tools 37.0.3, emulator 37.3.10, platform `android-36`, build-tools 36.0.0 | `%LOCALAPPDATA%\Android\Sdk` (5,7 GB) | OK |
| Imagem de sistema | `system-images;android-36;google_apis;x86_64` (Android 16, Google APIs, sem Play Store) | dentro do SDK | OK |
| AVDs | `campinguim-a` (Pixel 4a, 1080x2340) e `campinguim-b` (Pixel 9 Pro XL, 1344x2992) | `%USERPROFILE%\.android\avd\` | Criados; os dois ligam juntos |
| Maestro CLI | 2.12.1 | `C:\Ferramentas\maestro` | OK |
| Node do sistema | 24.19.0 | `C:\Program Files\nodejs\node.exe` | Já instalado |

## Passo a passo

### 1. Recursos do Windows (WHPX e Plataforma de Máquina Virtual)

- `VirtualizationFirmwareEnabled = True` e `HypervisorPresent = True` (evidência: `virtualizacao-firmware.txt`). O `systeminfo` já não mostra a linha "Virtualização Habilitada no Firmware" quando um hipervisor está rodando; ele diz "Hipervisor detectado. Recursos necessários para o Hyper-V não serão exibidos" (`systeminfo-virtualizacao.txt`). Por isso a leitura do firmware vem do `Get-CimInstance Win32_Processor`.
- **Não consegui listar os recursos opcionais do Windows** (`DISM`/`Get-WindowsOptionalFeature` exigem administrador: erro 740). Duas tentativas de abrir a janela de administrador foram canceladas (a janela não foi aprovada na hora). Segui sem elevação, porque o resultado prático já está provado: o emulador reconhece WHPX como instalado e usável, e o Docker Desktop sobe com WSL 2 (kernel `6.18.58.1-microsoft-standard-WSL2`). Isso só acontece com a Plataforma de Máquina Virtual e o hipervisor ativos. Nenhum recurso foi alterado, portanto nada pede reinicialização. Hyper-V completo não foi necessário (a documentação do emulador recomenda WHPX, que convive com Docker e WSL 2).
- Pendente, não bloqueia: se o QA quiser a lista literal dos recursos (`Get-WindowsOptionalFeature`), é preciso um terminal de administrador; fica como leitura opcional.

### 2. Docker Desktop

- Já estava instalado (4.94.0). Abri o Docker Desktop; subiu sem pedir novo aceite do contrato na janela (o responsável já o havia aceitado e autorizou em 24/11/2026, H3). Não atualizei: a versão instalada sobe e responde; a plano cita 4.100.1 como atual, mas não há necessidade.
- `docker info`: servidor 29.8.2, "Operating System: Docker Desktop", kernel WSL 2, 16 CPUs, **15,58 GiB** de memória para a máquina virtual do Docker (padrão: metade da RAM). Evidência: `docker-info.txt`, `docker-version.txt`.
- **Atenção para F0-1/F0-2:** o Supabase local e o PowerSync vão aumentar o uso de memória do WSL. Se a memória livre apertar com tudo ligado, limitar o WSL em `%USERPROFILE%\.wslconfig` (`memory=8GB`) é a saída; não foi feito agora.

### 3. JDK 17

- **Escolha:** Temurin 17 em zip, extraído em `C:\Ferramentas\jdk-17`. Motivo: o plano usa só linha de comando (sem Android Studio), o zip não exige administrador nem instalador, é repetível (mesmo link, mesmo hash) e o Expo/React Native pedem JDK 17.
- Origem: API oficial do Adoptium (`api.adoptium.net`), pacote `OpenJDK17U-jdk_x64_windows_hotspot_17.0.21.1_2.zip`. SHA-256 conferido contra o publicado: `eafba0944f777abdc74d5aad16049c9b5a1275b6ce99e2939ba9f7f3e6f08c87` (igual).
- Variáveis do **usuário** (permanentes): `JAVA_HOME=C:\Ferramentas\jdk-17`; `C:\Ferramentas\jdk-17\bin` no `PATH`.
- `java -version`: `openjdk version "17.0.21.1" 2026-11-17`, Temurin-17.0.21.1+2 (`java-version.txt`).

### 4. Android

- **Escolha:** só as ferramentas de linha de comando (sem Android Studio): menor, sem instalador, e a prova roda tudo por linha de comando. Estas ferramentas e o contrato são os mesmos do Studio.
- Origem: `https://dl.google.com/android/repository/commandlinetools-win-15859902_latest.zip` (link da página developer.android.com/studio). SHA-256 conferido contra o publicado na página: `90ae805d20434428bffcb699c290860f19bb5f66a67e6b330067e3de801fb04a` (igual). Extraído em `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest`.
- Licenças do SDK aceitas com `sdkmanager --licenses` (autorizado pelo responsável, H3): 8 licenças aceitas, arquivos em `%LOCALAPPDATA%\Android\Sdk\licenses`.
- Pacotes instalados: `platform-tools`, `emulator`, `platforms;android-36`, `build-tools;36.0.0`, `system-images;android-36;google_apis;x86_64`. A imagem API 36 "Google APIs" x86_64 existe (revisão 7), então não foi preciso usar API próxima. A plataforma exigida para o build do app (35, 36 ou 37) o F0-1 instala quando o primeiro build pedir (plano B1).
- Variáveis do **usuário**: `ANDROID_HOME` e `ANDROID_SDK_ROOT` = `%LOCALAPPDATA%\Android\Sdk`; no `PATH`: `platform-tools`, `emulator`, `cmdline-tools\latest\bin` (caminhos completos: o Windows não expande `%VAR%` dentro do `PATH` gravado dessa forma). Terminais abertos antes desta tarefa precisam ser reabertos.
- AVDs (imagem Google APIs, API 36, x86_64, aceleração WHPX, 2 GB de RAM, GPU ligada):
  - `campinguim-a`: dispositivo `pixel_4a`, tela pequena 1080x2340.
  - `campinguim-b`: dispositivo `pixel_9_pro_xl`, tela grande 1344x2992.
  - O `avdmanager` mostra o aviso "Could not load devices from …\google_apis\x86_64\devices.xml" ao criar; é inofensivo (os AVDs foram criados e ligam).
- Teste de aceleração: `emulator -accel-check` → "WHPX(10.0.26300) is installed and usable." (`emulator-accel-check.txt`).
- Os dois ligados juntos (portas 5554 e 5556, `-no-snapshot -no-audio`, partida a frio): `adb devices -l` mostra `emulator-5554 device` e `emulator-5556 device` (`adb-devices.txt`). Ambos: Android 16, API 36.
- Para ligar de novo: `emulator -avd campinguim-a -port 5554 -no-snapshot -no-audio` e `emulator -avd campinguim-b -port 5556 -no-snapshot -no-audio` (cada um em um processo separado; esperar `adb -s <id> shell getprop sys.boot_completed` = 1).

### 5. Maestro CLI

- Origem: `github.com/mobile-dev-inc/Maestro/releases/download/cli-2.12.1/maestro.zip` (350 MB). SHA-256 conferido contra o publicado pelo GitHub (campo `digest` do asset): `54dbb0716425626604973cbb374c585ca30272375d9ce15177a1152765ddd9d7` (igual).
- Extraído em `C:\Ferramentas\maestro`; `C:\Ferramentas\maestro\bin` no `PATH` do usuário; `MAESTRO_CLI_NO_ANALYTICS=1` no usuário.
- `maestro --version` → `2.12.1` (`maestro-version.txt`; o programa imprime antes um aviso de divulgação de um recurso de IA, que foi cortado do arquivo).

### 6. Node do sistema

- `C:\Program Files\nodejs\node.exe` → `v24.19.0`. O `node` do PATH dos agentes é um Node 22 interno do Overclock: **os scripts da prova devem chamar o caminho completo** `C:\Program Files\nodejs\node.exe`.

### 7. Memória com tudo ligado

- Com os dois emuladores e o Docker Desktop ligados (Docker ocioso, sem contêineres): total 32.682 MB, **livre 10.339 MB (10,1 GB)**, acima dos 6 GB exigidos (`memoria-livre.txt`).
- Quem usa: `qemu-system-x86_64` (os dois emuladores juntos) ≈ 8,6 GB; Docker Desktop e WSL ≈ 1,6 GB (ocioso). Os 10 GB livres são **sem** o Supabase, o PowerSync e o app em execução; quando o Docker carregar esses serviços, a margem cai. A medição deve ser repetida em F0-1/F0-2 com tudo no ar; se ficar justa, reduzir `hw.ramSize` dos AVDs ou limitar o WSL.

## Evidências (`docs/prova-tecnica/evidencias/F0-0/`)

| Arquivo | O que mostra |
| --- | --- |
| `virtualizacao-firmware.txt` | `VirtualizationFirmwareEnabled: True`, `HypervisorPresent: True` |
| `systeminfo-virtualizacao.txt` | linhas de virtualização do `systeminfo` |
| `emulator-accel-check.txt` | WHPX instalado e usável |
| `adb-devices.txt` | os dois emuladores ligados juntos |
| `dois-emuladores.png` | tela dos dois emuladores lado a lado (montagem de duas capturas feitas pelo `adb`; só a tela dos aparelhos virtuais, sem nenhuma outra janela do computador) |
| `docker-info.txt`, `docker-version.txt` | Docker respondendo, WSL 2 |
| `java-version.txt`, `maestro-version.txt` | versões |
| `memoria-livre.txt`, `memoria-processos.txt` | memória livre com tudo ligado |

## Limpeza

Os instaladores baixados (JDK, ferramentas do SDK, Maestro) ficaram só na pasta temporária da sessão e foram apagados. As ferramentas ficam fora do repositório (`C:\Ferramentas`, `%LOCALAPPDATA%\Android\Sdk`). Os dois emuladores e o Docker Desktop continuam ligados para a conferência do QA; quem encerrar a missão deve desligá-los.

## F0-1 Base da prova

24/11/2026 · tarefa F0-1 "Base da prova" · executada por pane-657 (Opus 5.5)

Código em `prova/` (decisão H5). Como subir e derrubar: `prova/LEIA-ME.md`. Nada foi instalado de forma global além do que está na tabela abaixo.

### Instalado a mais na máquina

| Peça | Versão | Onde fica | Por quê |
| --- | --- | --- | --- |
| Plataforma Android | `platforms;android-37.0` | SDK | O build pede compileSdk 37 (baixada pelo Gradle; contrato do SDK já aceito em F0-0, H3) |
| Build-tools | 37.0.0 | SDK | idem |
| NDK | 27.1.12297006 | SDK | Código nativo (React Native, OP-SQLite, PowerSync); baixado pelo Gradle |
| CMake | 3.22.1 (baixado pelo Gradle) e **3.31.6** (instalado com `sdkmanager "cmake;3.31.6"`) | SDK | O 3.22.1 traz o ninja 1.10.2, que falha no Windows com caminho acima de 260 caracteres ("Filename longer than 260 characters", no código de gestos do `react-native-gesture-handler`, que vem com o `expo-router`; o caminho chegou a 344 caracteres). O 3.31.6 traz o ninja 1.12.1, que aceita caminho longo (`LongPathsEnabled` do Windows já estava em 1). O plugin `prova/app/plugins/cmake-caminho-longo.js` aponta o build para ele. |
| Gradle | 9.4.1 | `%USERPROFILE%\.gradle` | Baixado pelo `gradlew` do projeto |
| Imagens Docker | `supabase/postgres:17.12.0.002`, `gotrue:v2.198.0`, `postgrest:v16.6`, `kong:2.8.1`, `edge-runtime:v1.79.5` (e `realtime:v2.177.1`, `storage-api:v1.98.8`, usadas só na criação do esquema); `journeyapps/powersync-service:1.29.1`; `mongo:7.0` | Docker Desktop | Supabase local e serviço de sincronização |

Dependências de projeto (npm, dentro de `prova/`, nada global): Supabase CLI 3.4.0, `pg` 8.23.1 e `@supabase/supabase-js` 2.119.2 em `prova/servidor`; as do app abaixo.

### Versões reais usadas

| Peça | Versão | Plano (seção B) dizia |
| --- | --- | --- |
| Expo SDK (`expo`) | 58.0.26 | 58.0.26 |
| React Native / React | 0.88.1 / 19.3.0 | 0.88.1 / 19.3.0 |
| TypeScript | 6.0.3 | — |
| `expo-router` / `expo-linking` | 58.0.32 / 58.0.17 | igual |
| `expo-notifications` | 58.1.9 | igual |
| `@expo/app-integrity` | 58.0.2 | igual |
| `@powersync/react-native` | 2.4.1 (com `@powersync/common` 2.5.0); núcleo SQLite do PowerSync no aparelho 0.5.4 (lido no app com `powersync_rs_version()`) | 2.4.1 |
| `@op-engineering/op-sqlite` | 18.2.5 (o SDK exige `>=17.1.0 <19.0.0`; a 19.x é recusada pelo npm) | mesma faixa |
| `@supabase/supabase-js` (app) | 2.119.2 | — |
| Android do build | compileSdk 37, targetSdk 36, minSdk 24, build-tools 37.0.0, NDK 27.1.12297006, nova arquitetura e Hermes ligados | compileSdk 37 / targetSdk 36 |
| Supabase CLI | 3.4.0 | 3.4.0 |
| Postgres local | 17 (imagem `17.12.0.002`) | — |
| Serviço PowerSync | `journeyapps/powersync-service:1.29.1` | 1.29.1 |
| MongoDB (armazenamento do PowerSync) | 7.0 | — |
| Maestro | 2.12.1 | 2.12.1 |

### Itens "não confirmado" do plano que F0-1 confirmou

| Nº na lista do plano | Ponto | Resultado em F0-1 |
| --- | --- | --- |
| 2 (e J14) | Plataforma do SDK para o Expo 58 | **compileSdk 37** (o build baixou `android-37.0`), targetSdk 36 |
| 3 | PowerSync 2.4.1 com Expo 58 / RN 0.88 | **Compila e roda**: o build release passou e o app abre o banco do PowerSync nos dois emuladores (núcleo 0.5.4). A sincronização de ponta a ponta é de F0-2. |
| 5 | Etiqueta fixa da imagem do PowerSync | **Existe** `journeyapps/powersync-service:1.29.1` (sem o `v`). A prova usa essa, não `latest`. |
| 8 | `wal_level = logical` no Postgres do Supabase CLI | **Sim**: o PowerSync criou o slot de replicação e replicou `trip`, `trip_member` e `trip_item` sem nenhum ajuste no Postgres. |
| 20 (segundo da lista) | Memória do PowerSync e do MongoDB | Com os dados da prova, em três leituras de `docker stats`: PowerSync entre 93 e 283 MB, MongoDB entre 92 e 192 MB. Os 7 contêineres somam entre 560 e 800 MB. |
| — | Como o login local assina os tokens | Chave **ES256** (lista de chaves públicas em `/auth/v1/.well-known/jwks.json`); o PowerSync confere por essa lista, sem segredo compartilhado. |

Continuam **não confirmados** (não eram de F0-1): SQLCipher no Expo (checagem rápida de F0-2; o banco da prova **não** está cifrado), a fila do PowerSync sobreviver a fechar o app (F0-2), comandos de modo avião e de relógio (F0-3), `@expo/app-integrity` com token real (F0-6).

### Decisões técnicas desta tarefa

- **Pacote Android provisório** `com.campinguim.prova` (H6 pendente), marcado em comentário no `app.config.ts`. O definitivo é decisão do responsável antes de F0-6.
- **Build sem EAS e sem conta Expo**: `expo prebuild` gera `prova/app/android` (não versionada) e `gradlew assembleRelease -PreactNativeArchitectures=x86_64` gera o APK para os emuladores. A variante release leva o JavaScript dentro do app e é assinada com a chave de depuração do modelo do Expo: não depende do Metro, o que permite os testes com modo avião (F0-2, F0-3). Para desenvolver com recarga: `npm run android` (variante de depuração, com Metro).
- **HTTP sem cifra só para o servidor local**: o plugin `prova/app/plugins/trafego-local.js` libera texto aberto só para o endereço do computador visto do emulador; todo o resto exige HTTPS.
- **Endereços num único valor**: `prova/config/enderecos.json` (servidor e site de teste `.test`). Teste automático falha se o endereço do servidor ou do site aparecer em outro arquivo, ou se o domínio do Cloud Run aparecer em qualquer arquivo da prova.
- **Serviços do Supabase local desligados** na prova: imgproxy, logflare, vector, studio, realtime, mailpit, postgres-meta, storage-api, supavisor. Sobem: Postgres, login, API, portão (kong) e funções (para F0-5).
- **Cadastro aberto desligado** no Supabase local (`enable_signup: false`): os usuários de teste são criados pelo script com a chave de serviço local.
- **Simplificação do modelo**: sem `profile` e sem `trip_family`; `trip_member.profile_id` aponta para `auth.users` e `family_id` é só um identificador. Exclusão sempre lógica (`deleted_at`), sem política de DELETE.
- **Telemetria do PowerSync desligada** (`disable_telemetry_sharing: true`); MongoDB sem porta aberta no computador.
- O modelo do Expo trazia `LICENSE` (MIT), `AGENTS.md`, pasta `.claude/` e ícones do Expo: apagados (repositório sem licença, sem pasta de ferramenta, sem imagem de terceiros). Os ícones do app vêm do pacote final do mascote (`design/mascote/final`).

### Credenciais locais

- `prova/.env.local` (fora do git pelo `.env.*` do `.gitignore`): senhas dos usuários A, B e C (aleatórias, geradas pelo script), chaves do Supabase local e a ligação do PowerSync com o Postgres. Nunca exibido: o script mascara chaves e senhas na saída.
- Usuários de teste: `a@`, `b@` e `c@usuarios-prova.test` (domínio reservado para teste). A e B são membros da viagem de grupo; C só da própria viagem.
- O app leva só a chave **pública** do Supabase local. Conferido no APK: a chave de serviço e a senha de teste aparecem 0 vezes; nenhum arquivo `.map`.

### Observação para F0-2

Na primeira execução de cada série do Maestro, o `campinguim-a` falhou 2 vezes no passo de abrir o app com "device offline" (o adb perdeu o aparelho por instantes); as execuções seguintes passaram (A: 4 de 6, B: 4 de 4 nesta sessão). É falha de roteiro, não do app: em F0-2 conta como execução refeita.

### Memória com tudo ligado

Dois emuladores, Supabase e PowerSync ligados, sem o Gradle: **5,6 GB livres** de 31,9 GB (uma leitura minutos antes deu 3,7 GB). Fica **abaixo dos 6 GB** que F0-0 usou como critério. Quem mais usa: os dois emuladores (4,6 e 3,4 GB), a máquina virtual do Docker (3,3 GB, inclui o cache das imagens) e programas da missão de vídeos que roda junto (ffmpeg 0,9 GB, navegador sem tela 0,5 GB). Para F0-2, se apertar: limitar o WSL em `%USERPROFILE%\.wslconfig` (`memory=6GB`) ou baixar a RAM dos AVDs (`hw.ramSize`), como F0-0 já sugeria. Nada disso foi mudado agora.

### Evidências (`docs/prova-tecnica/evidencias/F0-1/`)

| Arquivo | O que mostra |
| --- | --- |
| `testes-servidor.txt` | Os 19 testes do servidor (RLS, acesso entre viagens, configuração) |
| `teste-rls-falha-de-proposito.txt` | O teste de RLS falhando com uma tabela sem RLS, criada numa transação desfeita |
| `supabase-status.txt` | `supabase status` com chaves e senha mascaradas |
| `maestro-abre-app.txt` | O roteiro que abre o app e a tela da viagem nos dois emuladores |
| `app-emulador-a-*.png`, `app-emulador-b-*.png` | Tela inicial e tela da viagem nos dois emuladores (só a tela do app) |
| `script-subir.txt`, `script-derrubar.txt` | O script único subindo e derrubando tudo, sem processo sobrando |
| `apk-sem-segredo.txt` | Busca da chave de serviço e da senha de teste dentro do APK |
| `memoria-livre.txt` | Memória livre com tudo ligado |
| `git-status.txt`, `git-log.txt` | Nada de credencial rastreado; commits do ramo |

## F0-2 Sincronização offline

25/11/2026 · tarefa F0-2 "Sincronização offline (item 1 da prova)" · executada por pane-661 (Opus 5.5)

Pasta de trabalho própria (`git worktree`, ramo `feature/F0-2-sincronizacao`). Nada novo instalado na máquina: usa o SDK, o Maestro, o JDK e o Docker de F0-0 e F0-1. Como rodar: `prova/e2e/sincronizacao/rodar.mjs` (cabeçalho do arquivo).

### Maestro instável no emulador A ("device offline")

- **Tentativa de reproduzir** (24/11/2026, emuladores recém-ligados): 3 execuções seguidas no A, 2 rodadas em paralelo no A e no B com o driver do Maestro apagado antes, e 3 execuções logo depois de `adb kill-server`: **8 de 8 passaram**. O "device offline" de F0-1 não se repetiu nessas condições.
- **O que apareceu durante a F0-2**, com a máquina carregada (três emuladores ligados, dois de outra tarefa e o `campinguim-c`, builds do Gradle e a missão de vídeos; CPU do computador em 85 %, carga dentro do emulador A em 18): o Maestro não conseguia abrir a sessão no A (`MaestroDriverStartupException: Maestro instrumentation could not be initialized`). É o mesmo sintoma de F0-1 com outro texto: o driver do Maestro dentro do emulador demora a subir e estoura o limite.
- **Estabilização** (no roteiro, `prova/e2e/sincronizacao/comum.mjs`):
  1. `MAESTRO_DRIVER_STARTUP_TIMEOUT=120000` em toda chamada do Maestro;
  2. depois de `adb root` (que reinicia o `adbd` e deixa o aparelho "offline" por instantes), espera `wait-for-device`, `sys.boot_completed = 1`, animação de boot parada e o gerenciador de pacotes respondendo, antes de qualquer roteiro;
  3. animações do Android desligadas, tela sempre ligada, buffer do logcat em 16 MB;
  4. nunca rodar duas coisas nos mesmos emuladores ao mesmo tempo (uma medida feita em paralelo com um ensaio contaminou os dois; foi descartada);
  5. falha de roteiro vira execução **refeita** (até 3 vezes), registrada em `execucoes.jsonl` com o motivo; a conta das refeitas vai para as tabelas (limite do plano: 10 %);
  6. depois de cerca de 3 horas ligado com a máquina carregada, o emulador A não abria mais a sessão do Maestro nem recuperava a rede: os dois emuladores foram **reiniciados a frio** (`emu kill` e `emulator -avd ... -no-snapshot -no-audio -no-boot-anim`). Depois disso, P1 a P3b passaram de primeira.

### Rede do emulador depois do modo avião

- Modo avião por comando: `adb shell cmd connectivity airplane-mode enable|disable` (sem root). Corta tudo, inclusive o endereço do computador (`10.0.2.2`).
- Medido: depois de desligar o modo avião, o Wi-Fi do emulador leva **de 11 a 24 s** para voltar (teste de conexão TCP à porta da API, de dentro do emulador). Às vezes fica associado sem endereço: o roteiro religa o Wi-Fi (`svc wifi disable/enable`) depois de 40 s sem rede e registra isso na execução.
- O app volta a alcançar o servidor um pouco depois disso (registro "rede" do próprio app). Testar "como o app" com `su <uid do app> nc` **não serve**: o Android corta a rede de app que não está em primeiro plano, e o teste diz "sem rede" com a rede de pé.
- Por isso as tabelas medem a convergência **a partir de quando o app volta a alcançar o servidor** (critério do plano: "depois de reconectar") e mostram também o tempo **desde o comando que desliga o modo avião**.

### Relógio (P3b)

- O emulador "Google APIs" aceita `adb root`; o relógio muda com `settings put global auto_time 0` e `date MMDDhhmmYYYY.ss` (toybox, em UTC). Volta com o mesmo comando na hora do computador e `auto_time 1`. Um ensaio interrompido no meio do P3b deixou os relógios deslocados: o roteiro agora confere e corrige o relógio antes de toda execução.

### Leitura do banco do app

- Com `adb root`, o roteiro lê o banco do app direto (`/system/bin/sqlite3` existe na imagem): viagens, itens, quem assumiu, histórico, fila (`ps_crud`), o registro de alterações e os avisos. É assim que o verificador compara servidor, A e B.

### Servidor

- `prova/servidor/supabase/config.jsonc`: `auth.jwt_expiry` = **180 s** (era 3600), para o token vencer durante o período offline do P7 (S7 reduzido, H7) e para todos os cenários rodarem com renovação frequente.
- Migração nova `20261125000000_f0_2_sincronizacao.sql` (RLS na mesma migração). Aplicada com `supabase db reset` (o banco local de F0-1 existia no volume do Docker e não recebe migração nova sozinho); depois do reset, `semear.mjs` e reinício do contêiner do PowerSync.
- Usuários de teste novos D e E (`d@` e `e@usuarios-prova.test`), só para os testes automáticos das regras; senhas geradas em `prova/.env.local`, fora do git.

### Durante as rodadas

- Outras tarefas ligaram emuladores próprios ao mesmo tempo (`emulator-5558`, `campinguim-c`, e depois `emulator-5560`). O roteiro da F0-2 só fala com `emulator-5554` e `emulator-5556` e nunca derruba o servidor do adb (a derrubada da F0-2 desliga só os dois emuladores dela).
- Memória livre medida antes de cada execução (registrada em `execucoes.jsonl`): nunca abaixo de 2 GB; a menor leitura das rodadas ficou perto de 5 GB.
- Evidência visual do P1: capturas só da tela do app (`adb exec-out screencap`), com a barra de status e a de navegação do Android cortadas. Nenhuma tela inicial do Android nem ícone de outro app (regra do repositório público).
- Resultado e correções: `docs/prova-tecnica/evidencias/F0-2/resultado-F0-2.md`.
