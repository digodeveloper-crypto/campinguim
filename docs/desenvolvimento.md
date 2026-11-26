# Desenvolvimento do Campinguim

Como preparar a máquina, subir o ambiente local, rodar os testes e gerar o app. Criado na feature **B1** (repositório, scripts locais de teste e ambiente em Docker; GIT-10 e GIT-11) em 26/11/2026.

Tudo aqui roda **na máquina local**, sem serviço externo (GIT-11). O GitHub só roda a esteira quando o orquestrador cria uma etiqueta de versão (GIT-05).

## 1. Preparar a máquina

A máquina de desenvolvimento já foi preparada na prova técnica; o passo a passo completo, com origem e conferência de cada download, está em `docs/prova-tecnica/ambiente.md`. Resumo do que precisa existir:

| Peça | Versão | Para quê |
| --- | --- | --- |
| Node | 24.19.0 (`C:\Program Files\nodejs`) | Scripts, testes, Expo. Veja a observação abaixo |
| Docker Desktop | 4.94.0, WSL 2 | Supabase local e PowerSync |
| JDK | Temurin 17 (`JAVA_HOME`) | Gerar o app Android |
| Android SDK | plataforma 36 e 37, build-tools 37.0.0, NDK 27.1.12297006, **CMake 3.31.6** (`sdkmanager "cmake;3.31.6"`) | Gerar o app e rodar os emuladores |
| Emuladores | `campinguim-a` (porta 5554, tela pequena) e `campinguim-b` (porta 5556, tela grande), Android 16 (API 36) Google APIs x86_64 | Jornadas e sincronização |
| Maestro | 2.12.1, telemetria desligada (`MAESTRO_CLI_NO_ANALYTICS=1`) | Jornadas no emulador |
| Navegadores do Playwright | Chromium e WebKit (`npx playwright install chromium webkit`) | Testes da página web |

**Node certo.** O terminal dos agentes do Overclock tem um Node 22 próprio na frente do `PATH`. O projeto pede Node 24 (`engines` no `package.json`). Antes de qualquer comando, ponha o Node do sistema na frente:

```
# Git Bash
export PATH="/c/Program Files/nodejs:$PATH"
# PowerShell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

O hook de pré-commit funciona com qualquer Node a partir do 22 (o script dele é JavaScript puro).

## 2. Primeira vez no repositório

```
npm install                       # instala tudo e liga o hook de pré-commit (core.hooksPath = .githooks)
npx playwright install chromium webkit
```

Opcional, recomendado: criar `.segredos-locais` na raiz (ignorado pelo git) com termos pessoais que nunca podem entrar num commit, um por linha (nome real, e-mail pessoal). A trava de segredos procura esses termos, além do nome do usuário do Windows e do e-mail global do git, que ela lê sozinha.

## 3. Ambiente local em Docker (GIT-11)

```
npm run ambiente:subir     # Supabase local + PowerSync; espera tudo ficar saudável
npm run ambiente:estado    # lista os contêineres do ambiente
npm run ambiente:parar     # para tudo; os dados do banco ficam guardados
npm run ambiente:zerar     # apaga os dados, recria o banco pelas migrações e dados de exemplo, e sobe
```

O que sobe (7 contêineres):

| Contêiner | O que é | Porta no computador |
| --- | --- | --- |
| `supabase_db_campinguim` | Postgres 17 | 54322 |
| `supabase_kong_campinguim` | Portão da API (login, dados, funções) | 54321 |
| `supabase_auth_campinguim`, `supabase_rest_campinguim`, `supabase_edge_runtime_campinguim` | Login, API de dados e funções do servidor | pela 54321 |
| `campinguim-sincronizacao-powersync-1` | Serviço PowerSync 1.29.1, auto-hospedado (decisão E1) | 8080 |
| `campinguim-sincronizacao-mongo-1` | Armazenamento interno do PowerSync (MongoDB 7.0) | nenhuma |

- **Portas e endereços** vêm de `config/enderecos.json` (único lugar com endereço; veja a seção 6). O script confere que a API do Supabase ficou na porta do arquivo.
- **Credenciais locais** (chaves do Supabase local, ligação do PowerSync com o Postgres) ficam só em `.env.local` na raiz, criado pelo `ambiente:subir` e ignorado pelo git. O modelo sem valores é `.env.local.exemplo`. O script nunca imprime os valores.
- **Serviços do Supabase desligados** (não usados ainda): imgproxy, logflare, vector, studio, realtime, mailpit, postgres-meta, storage-api, supavisor. Quem precisar de um deles tira da lista em `scripts/ambiente/ambiente.mjs` e registra aqui.
- **Conflito de portas.** Se outra pilha (por exemplo, a da prova técnica, `campinguim-prova`) estiver usando as portas 54321, 54322 ou 8080, o `ambiente:subir` para com uma mensagem e não derruba nada de ninguém.
- **Banco só muda por migração** (`supabase/migrations/`). Para aplicar uma migração nova sem apagar os dados: `npx supabase migration up` (com o ambiente no ar). Para recomeçar do zero: `npm run ambiente:zerar`.
- **Regras de sincronização** (`supabase/sincronizacao/powersync/sync-config.yaml`): o PowerSync só lê mudanças nesse arquivo ao reiniciar (`ambiente:parar` e `ambiente:subir`).

## 4. Testes

| Comando | O que roda | Precisa de |
| --- | --- | --- |
| `npm run testar` | **Suíte local completa (GIT-10)**: trava de segredos, endereços fora da configuração, tipos, lint, testes unitários, testes do servidor e página web | Docker com o ambiente no ar, para não pular o servidor |
| `npm run testar -- --exigir-servidor` | O mesmo, mas falha se o ambiente estiver fora do ar (usado na esteira de versão) | ambiente no ar |
| `npm run testar:rapido` | Sem servidor e sem navegador, para o ciclo de edição | nada |
| `npm run testar:jornadas` | Roteiros do Maestro de `e2e/jornadas/` no `campinguim-a` | emulador ligado e app instalado |
| `npm run testar:sincronizacao` | Cenários S1 a S10 (`e2e/sincronizacao/`) | ambiente no ar e os dois emuladores |
| `npm run tipos` / `npm run lint` | Só tipos / só lint | nada |
| `npm run unitarios` | Todos os testes do Vitest (core, scripts e servidor) | ambiente no ar, para o servidor |
| `npm run segredos` / `npm run enderecos` | Só as duas travas | nada |

O resumo do fim do `npm run testar` diz, por etapa, `passou`, `FALHOU` ou `PULADO`, com quantos testes passaram. **"SUÍTE INCOMPLETA"** quer dizer que alguma etapa foi pulada (por exemplo, o ambiente estava fora do ar): não serve para aprovar uma feature.

Camadas (SPEC, seção 13) e onde ficam:

| Camada | Pasta | Executor |
| --- | --- | --- |
| Regras puras | `packages/core/src/**/*.test.ts` | Vitest, projeto `core` |
| Travas do repositório | `scripts/testes/*.test.ts` | Vitest, projeto `scripts` |
| Servidor (autorização, RLS, migrações, sincronização) | `supabase/testes/*.test.ts` | Vitest, projeto `servidor`, contra o Docker |
| Página web | `e2e/web/*.spec.ts` | Playwright: Chromium com tela de Pixel 7 e WebKit com tela de iPhone 15 |
| Jornadas J1 a J9 | `e2e/jornadas/<jornada>/*.yaml` | Maestro, no emulador |
| Sincronização S1 a S10 | `e2e/sincronizacao/cenarios/<id>.mjs` | `e2e/sincronizacao/rodar.mjs`, dois emuladores |

## 5. App no emulador

```
emulator -avd campinguim-a -port 5554 -no-snapshot -no-audio -no-boot-anim    # ligar (outro terminal)
npm run app:gerar                       # expo prebuild + gradlew assembleRelease (x86_64), sem conta Expo
npm run app:instalar                    # instala no emulator-5554 (ou: -- --serial emulator-5556)
npm run testar:jornadas -- fumaca       # abre o app e confere a tela provisória
node scripts/app.mjs permissoes         # permissões do APK gerado (manifesto final mesclado)
adb -s emulator-5554 emu kill           # desligar só este emulador
```

- A variante **release** leva o JavaScript dentro do app (não depende do Metro) e é assinada com a chave de depuração do modelo do Expo. Serve para emulador e testes com modo avião; nunca vai para a loja.
- Para desenvolver com recarga: `npm run android --workspace apps/mobile` (variante de depuração, com o Metro).
- A pasta `apps/mobile/android/` é gerada e fica fora do git. O plugin `plugins/cmake-caminho-longo.cjs` aponta o build para o CMake 3.31.6, que aceita caminhos acima de 260 caracteres no Windows (problema achado na prova, F0-1).
- **Regras do adb (ponto J23):** todo comando leva `-s emulator-<porta>`, e nenhum script derruba ou reinicia o servidor do adb, porque outras tarefas usam emuladores ao mesmo tempo. Os scripts só chamam o adb por `scripts/android.mjs`; um teste falha se outro arquivo chamar o adb direto ou tiver o comando de derrubar o servidor. **Não use** `prova/prova.mjs derrubar`: ele derruba o servidor do adb e todos os emuladores da máquina.
- Capturas para o QA: só a tela do app, nunca a tela inicial do Android com ícones de outros apps.

## 6. Endereços: um único valor de configuração

`config/enderecos.json` é o único arquivo com endereço (SPEC, seção 14; CLAUDE.md). O app (`apps/mobile/app.config.ts`), a página web (`apps/web/src/config.ts` e `vite.config.ts`), o servidor (o `site_url` do login, passado pelo script do ambiente) e os testes leem dali.

- `local`: o ambiente em Docker. `10.0.2.2` é o computador visto de dentro do emulador; o site é `campinguim.test`, domínio reservado para teste que não existe.
- `producao`: vazio até o orquestrador decidir o endereço provisório do site (proposta em `docs/infra.md`, seção Cloudflare) e criar o servidor hospedado.

A verificação `npm run enderecos` (também dentro do `npm run testar`) falha se `run.app`, `pages.dev` ou `workers.dev` aparecerem em qualquer arquivo do repositório fora de `config/enderecos.json`, ou se o endereço local do servidor ou o domínio do site aparecerem em código. Só a documentação (pasta `docs/` e arquivos `.md`) fica de fora, porque a SPEC e o registro de infraestrutura precisam citar esses domínios por nome.

## 7. Trava de segredos (GIT-08)

`scripts/seguranca/verificar-segredos.mjs`, em Node puro, sem binário externo:

- **No pré-commit** (`.githooks/pre-commit`): confere o conteúdo **preparado** para o commit (o que o git vai gravar).
- **No `npm run testar`**: confere todo arquivo rastreado ou novo.

Barra: chave privada PEM, JWT, chaves do Supabase (`sb_secret_`, `sb_publishable_`), `service_role` com valor, chaves `sk-`, de nuvem, do GitHub, do Google, do Slack e do npm, endereço de banco com senha, senha ou chave escrita em arquivo de configuração, `.env` com valor (só o modelo `.exemplo` entra, e vazio), keystores e certificados, e-mail pessoal (só passam domínios de exemplo e teste, o `noreply` do GitHub e o da Anthropic), caminhos `C:\Users\<nome>` e termos pessoais da máquina. Nunca mostra o segredo achado: só o começo, mascarado.

## 8. Estrutura das pastas

```
apps/mobile          app Expo (React Native, TypeScript, expo-router); pacote provisório com.campinguim.prova
  app/               telas (expo-router); na B1, só a tela provisória
  src/textos/        textos da interface (pt-BR.json); nada de frase solta no código
  plugins/           plugins locais do Expo (tráfego local sem cifra só para o servidor local; CMake)
apps/web             página do convidado e site (React, TypeScript, Vite); na B1, página provisória
packages/core        regras puras (sem tela, sem rede), com os testes da SPEC, seção 9
packages/content     catálogos em arquivos de dados (vazio na B1; formato no LEIA-ME)
supabase/            config.jsonc, migrations/, functions/, dados-de-exemplo/, sincronizacao/ (PowerSync), testes/
e2e/jornadas/        roteiros do Maestro: fumaca/ e J1 a J9
e2e/sincronizacao/   executor dos cenários S1 a S10
e2e/web/             testes da página web (Playwright)
config/enderecos.json único valor de configuração dos endereços
scripts/             ambiente, suíte local, app, adb, Maestro, travas de segredo e de endereço, testes das travas
.githooks/           hook de pré-commit
.github/workflows/   esteira só em etiqueta de versão (versao.yml)
docs/                PRD, SPEC, DESIGN, infra, este arquivo, MUDANCAS.md, evidências
prova/               código da prova técnica (registro histórico, não muda)
```

## 9. Decisões técnicas da B1

| Decisão | Por quê |
| --- | --- |
| **npm workspaces** (`apps/mobile`, `apps/web`, `packages/core`, `packages/content`) | O mesmo gerenciador da prova técnica; não pede ferramenta nova. O Expo 58 reconhece o monorepo sozinho |
| **Versões da prova** (Expo 58.0.26, React Native 0.88.1, React 19.3.0, PowerSync 2.4.1, OP-SQLite 18.2.5, Supabase CLI 3.4.0, PowerSync 1.29.1, TypeScript 6.0.3), fixas, sem `^` nem `~` | São as que a prova provou juntas; versão fixa evita mudança silenciosa |
| **Ferramentas novas instaladas só com versões publicadas até 12/11/2026** (`npm install --before`) e fixas: Vitest 5.1.0, ESLint 9.39.5, typescript-eslint 8.72.2, eslint-plugin-react 7.37.5, eslint-plugin-react-hooks 7.1.1, Playwright 1.65.0, Vite 8.3.8 | Evitar pacote publicado há poucos dias (risco de pacote adulterado). ESLint 9 e não 10 porque o plugin de React ainda não aceita o 10 |
| **Vitest** como executor de testes em TypeScript (regras puras, travas e servidor), em três projetos (`core`, `scripts`, `servidor`) | Roda TypeScript direto, sem passo de compilação, e permite rodar ou pular cada camada. Um executor só para as três camadas |
| **Playwright** para a página web, com Chromium (perfil Pixel 7) e WebKit (perfil iPhone 15) | É o motor do Android e o do iPhone (GIT-17), em tela de celular, sem Mac |
| **ESLint** com `typescript-eslint` estrito, regras de React e de hooks, e `react/jsx-no-literals` nas telas | O lint barra frase escrita direto no JSX: os textos ficam no arquivo de textos (CLAUDE.md, regra 5) |
| **TypeScript estrito** em tudo (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`); os scripts em `.mjs` também passam pelo verificador de tipos (`tsconfig.scripts.json`, sem exigir tipo em todo parâmetro) | Erro de tipo pego antes do teste. Os scripts ficam em JavaScript para rodar com qualquer Node 22 ou 24 sem passo de compilação (o hook roda com o Node que estiver no PATH) |
| **`"type": "module"` em todos os `package.json`**, inclusive no app; os plugins do Expo ficam em `.cjs` | Ponto J14 da prova. O `app.config.ts` funciona com o app em módulo (conferido com `expo config` e `expo prebuild`) |
| **Textos em JSON** (`apps/mobile/src/textos/pt-BR.json`, `apps/web/src/textos/pt-BR.json`) | O mesmo arquivo serve ao app, à página, aos roteiros do Maestro (marcadores `{{textos.…}}`) e aos testes da página, sem copiar texto. Provisório: a B6 define o arquivo de textos definitivo |
| **Migração `20261126180000_b1_publicacao_sincronizacao.sql`**: só a publicação `powersync`, vazia | Sem ela o PowerSync sobe mas a replicação fica parada com erro (`PSYNC_S1141`). Nenhuma tabela é criada; a B5 acrescenta cada tabela sincronizada à publicação na migração que a cria. Nunca `for all tables` |
| **`supabase/config.jsonc`** derivado da prova: `project_id` `campinguim`, `jwt_expiry` 3600, sem a função da prova, `site_url` vindo de `config/enderecos.json` (variável `CAMPINGUIM_SITE`), cadastro aberto desligado, dados de exemplo em `supabase/dados-de-exemplo/*.sql` | Pontos J5 e J6; endereço num único valor |
| **Hook por `core.hooksPath = .githooks`**, ligado no `npm install` (script `prepare`) | Funciona em todo clone e em todo worktree sem instalar nada. A configuração fica no `.git/config` do clone; em pasta sem `.githooks` (ramos antigos) o git simplesmente não acha hook |
| **Esteira** `.github/workflows/versao.yml` só em etiqueta `v*`: instala, sobe o ambiente em Docker e roda `npm run testar -- --exigir-servidor` | GIT-05. Geração dos apps e envio às lojas ficam para a rodada de lançamento (comentário no arquivo). **Não foi executada no GitHub** na B1 (nenhuma etiqueta foi criada) |
| **Lista fechada de permissões do app** (`scripts/testes/manifesto.test.ts`), lida do APK gerado | Ponto J9: qualquer permissão nova faz o teste falhar até ser conferida e acrescentada de propósito |
| **Sem `expo-notifications` na B1** | O app da base não tem lembrete ainda; a dependência entra na feature 1.6. As permissões que ela traz (c2dm, selos de ícone) já ficam bloqueadas no `app.config.ts` |

## 10. Pontos da prova técnica tratados na B1

Referência: `docs/prova-tecnica/resultado.md`, seção "Pontos para a B1 (seção J)".

| Ponto | O que foi feito |
| --- | --- |
| J5 | Não vieram para a base o login por link com token (`campinguim://entrar?t=`), os botões de teste nem o roteiro que semeia viagens por link. Um teste do repositório falha se esses trechos aparecerem no código |
| J6 | `jwt_expiry` volta a 3600 s (teste confere); o atraso artificial do P8 (`private.prova_ajuste`) não existe na base |
| J9 | O `app.config.ts` bloqueia `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE`, a do c2dm, a do install referrer, as 14 de selo de ícone de fabricantes, as de localização e `USE_EXACT_ALARM`; mantém `SCHEDULE_EXACT_ALARM` (decisão D2). Manifesto final mesclado: `INTERNET`, `SCHEDULE_EXACT_ALARM`, `VIBRATE` e a interna `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`, conferido pelo teste de lista fechada. `VIBRATE` vem do modelo do Expo, não estava na lista do ponto J9 e não lê dado da pessoa; a feature 1.6 confirma se o aviso vibra ou se ela sai |
| J14 | Todo `package.json` declara `"type"`; um teste confere |
| J23 | Nenhum script derruba ou reinicia o servidor do adb; todo adb passa por `scripts/android.mjs` com `-s emulator-<porta>`; um teste confere |
| J24 | Integração só por squash, feita pelo orquestrador depois da aprovação do QA |
| **J28 (para a B4)** | **A B4 liga `"op-sqlite": { "sqlcipher": true }` no `apps/mobile/package.json` e gera o app de novo** (`npm run app:gerar`), para o banco local cifrado (DEF-11). Na B1 o OP-SQLite está instalado sem cifra e sem esquema |

## 11. O que fica para as próximas features da base

| Feature | O que entra |
| --- | --- |
| B2 | Componentes visuais a partir do protótipo (tema claro e escuro, tipografia, ícones); substitui `src/cores.ts` e `estilos.css` provisórios |
| B3 | Motor de regras em `packages/core` e catálogo em `packages/content` (seções 5 e 9), com os casos L1 a L8, C1 a C7, A1 a A6, F1 a F9 e D1 a D5 |
| B4 | Banco local cifrado (SQLCipher, ponto J28), esquema local do PowerSync e migrações do aparelho (seção 3, DEF-11) |
| B5 | Esquema do servidor com RLS na mesma migração, funções, autorização por família (pontos J1, J2, J4 da prova), tabelas na publicação `powersync`, regras de sincronização e dados de exemplo |
| B6 | Arquivo de textos definitivo e eventos de medição (NF-09, seção 12) |
