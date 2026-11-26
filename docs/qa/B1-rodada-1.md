# B1 · repositório, scripts locais de teste e ambiente em Docker · rodada 1 · REPROVADO (1 item: a suíte diz "completa" com testes pulados)

Data: 2026-11-26 · Entregue por: pane-690 · Conferido por: QA (pane-689)
Base: cartão da tarefa B1 do orquestrador; SPEC, seções 2, 13 e 14 ("Endereço provisório", tabela da base, "Regras do ciclo"); PRD GIT-05, GIT-07, GIT-08, GIT-09, GIT-10 e GIT-11; `docs/prova-tecnica/resultado.md`, pontos J5, J6, J9, J14, J23, J24 e J28 e decisões D1, D2 e E1; `CLAUDE.md`.
Alvo: worktree `C:\campinguim-wt\B1`, ramo `feature/B1-base`, ponta `73d4358`, sobre `f1edb10` (ponta atual do `main`). 3 commits (`467e5d5`, `849abdb`, `73d4358`), só locais (`git ls-remote origin` não tem o ramo). Autor e quem gravou nos 3: noreply do GitHub.

**Resumo:** a base está bem construída, e quase tudo foi conferido rodando. O QA subiu o ambiente do zero e rodou a suíte completa duas vezes (86 de 86 nas duas). Plantou 9 defeitos, e a suíte ou o hook pegaram todos. Também rodou a jornada de fumaça no emulador A e leu o APK gerado. A reprovação é por um único ponto. Quando os testes do manifesto são pulados porque o APK não existe, a suíte ainda marca a etapa como "passou" e fecha com "SUÍTE COMPLETA". Nesse caso a aprovação, e a esteira da etiqueta de versão, passariam sem o ponto J9 ter sido conferido.

## Suíte local (GIT-10)

| Execução | Comando | Resultado |
| --- | --- | --- |
| Ambiente do zero | `npm run ambiente:zerar` (Node 24.19.0) | exit 0 em 59 s. 7 contêineres: `supabase_db`, `kong`, `auth` e `powersync` "healthy"; `rest`, `edge_runtime` e `mongo` "Up" |
| 1ª | `npm run testar -- --exigir-servidor` | **SUÍTE COMPLETA, 7 de 7 etapas, exit 0 (33,4 s).** Unitários 76 de 76; servidor 8 de 8; página web 2 de 2 (Chromium com Pixel 7 e WebKit com iPhone 15); tipos 5 de 5 projetos; lint e trava de segredos ok; endereços ok |
| 2ª, sem derrubar | o mesmo | igual: 7 de 7, 76 + 8 + 2 = **86 de 86**, exit 0 (28,6 s) |
| Sem APK (ver item 1) | `npm run testar -- --exigir-servidor --sem-web`, com o APK renomeado e depois devolvido | unitários "passou", com **73 de 76 (3 pulados)**. Os pulados são os 3 do `manifesto.test.ts`. A etapa não vira PULADO |

## Defeitos plantados pelo QA (a suíte pega erro?)

Cada defeito foi plantado sozinho e desfeito logo depois. Ao final, `git status` ficou vazio e a ponta continuou em `73d4358`.

| # | Defeito | Resultado |
| --- | --- | --- |
| M1 | Asserção errada em `packages/core/src/cotas.test.ts` | vitest exit 1, "1 failed" |
| M2 | Domínio do Cloud Run num `.ts` de `apps/web/src` | `verificar-enderecos` exit 1, arquivo e linha apontados |
| M2b | Endereço do servidor local visto do emulador escrito em código | exit 1 |
| M3 | Chave com formato de chave secreta do Supabase num arquivo novo | `verificar-segredos --tudo` exit 1, achado mascarado |
| M3b | E-mail de provedor público | exit 1; o achado aparece como `***` |
| M3c | Caminho de usuário do Windows com o nome real da máquina | exit 1; caminho e termo pessoal barrados, nada exibido |
| M4 | `git commit` de verdade com a chave falsa do M3 | **hook barrou**, exit 1, HEAD sem mudança |
| M4b | `git commit` de um `.env.producao` com senha (com `add -f`) | **hook barrou** pelo nome e pelo valor |
| M5 | Tabela sem RLS criada direto no Postgres local | servidor exit 1. O teste de RLS aponta `public.qa_sem_rls`. A tabela apagada, volta a 8 de 8 |
| M6 / M6b | Texto solto no JSX, como texto e como string entre chaves | lint exit 1 (`react/jsx-no-literals`) nas duas formas |

## Aceite

| Critério (cartão / PRD) | Resultado do QA |
| --- | --- |
| 1. Estrutura do monorepo (SPEC §2) | ok. Workspaces `apps/mobile`, `apps/web`, `packages/core` e `packages/content`, mais `supabase/`, `e2e/`, `scripts/` e `config/`. Expo 58.0.26, RN 0.88.1, React 19.3.0, PowerSync 2.4.1 e OP-SQLite 18.2.5, as versões da prova, sem esquema. TS estrito em 5 projetos. `packages/core` tem regra real: `valorDaMeiaCota` **confere com a SPEC §9, passo 3, e com os casos C1, C2 e C3** (H = 14 → 3000; H = 6 → 1666; H = 13 → 3230 centavos). `packages/content` está vazio, com o formato descrito. `e2e/jornadas` tem J1 a J9 e a fumaça |
| 2. Ambiente em Docker (GIT-11) | ok. **Rodado pelo QA:** `zerar` → `subir` sobe Supabase e PowerSync `journeyapps/powersync-service:1.29.1` com MongoDB 7.0, etiquetas fixas e nada hospedado (E1). `parar` deixa 0 contêineres do projeto. O script recusa subir se outra pilha usa as portas, e não derruba nada alheio (obs. 2 da F0-INT). Credenciais só no `.env.local` ignorado; o modelo `.env.local.exemplo` não tem valores. Sem serviço externo: `config/enderecos.json` só tem local, e produção está `null` |
| 3. Suíte com um comando | **falha no item 1.** O resto está ok: as 7 etapas rodam e, sem o ambiente, o servidor sai PULADO com "SUÍTE INCOMPLETA … Não serve para aprovar". `--exigir-servidor` transforma isso em falha. `testar:jornadas` e `testar:sincronizacao` ficam separados; o segundo lista S1 a S10 como "pendente (feature 2.12)" e diz "0 de 10 … não é aprovação" |
| 4. Trava de segredos (GIT-08) | ok. Script próprio em Node, no pré-commit (`--preparados`, lê o índice) e na suíte (`--tudo`). Ver M3 a M4b. Nunca imprime dado pessoal; lê o usuário do Windows e o e-mail global do git em tempo de execução. `.gitignore` cobre `.env*`, keystores, `android/`, `ios/`, builds, `test-results` e rascunhos (teste `repositorio.test.ts`) |
| 5. Esteira só em etiqueta (GIT-05) | ok por leitura e por teste local. Um único `versao.yml`, com `on: push: tags: ['v*']` e `permissions: contents: read`. Roda `npm ci`, `ambiente:subir`, `testar --exigir-servidor` e `parar`, e marca em comentário o lugar da geração e do envio às lojas. Não foi executado no GitHub (sem etiqueta), o que está certo |
| GIT-07 / GIT-09 | ok. `docs/MUDANCAS.md` iniciado, por versão e com IDs. PRD, SPEC e conteúdo no mesmo repositório |
| D1 pacote provisório | ok. `com.campinguim.prova` num único lugar do `app.config.ts`, marcado como PROVISÓRIO com a regra do definitivo. O `scripts/android.mjs` repete o nome para o adb (ver obs. 6) |
| J9 permissões | ok **neste APK**. `aapt dump permissions` no `app-release.apk` (gerado às 14:34, depois da última mudança em `app.config.ts`, `package.json` e plugins do app) dá `INTERNET`, `SCHEDULE_EXACT_ALARM` (D2), `VIBRATE` e `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. Nenhuma de localização, armazenamento, sobreposição, c2dm, install referrer, selo de ícone nem `USE_EXACT_ALARM`. `targetSdk` 36, `minSdk` 24. **O teste automático só confere isso quando o APK existe: item 1** |
| J14 `"type"` | ok. Os 5 `package.json` declaram `"module"` (teste `repositorio.test.ts`) |
| J23 adb | ok. `git grep` de kill-server, start-server e taskkill fora de `prova/` e `docs/` dá 0. O adb só é chamado em `scripts/android.mjs`, sempre com `['-s', serial, …]` e serial validado como `emulator-\d{4}`. O desligamento é `emu kill` no emulador certo. Um teste falha se outro arquivo chamar o adb direto |
| J5 / J6 | ok. 0 ocorrências de login por link com token, `prova_ajuste`, botões de teste, `semear=1` e `sync_apply` fora de `prova/` e `docs/`. `jwt_expiry` 3600, com teste |
| J24 | ok. Nada enviado. A integração fica para o orquestrador, por squash |
| J28 | ok. Anotado em `docs/desenvolvimento.md`, linha 182, para a B4 |
| RLS e banco por migração | ok. Uma migração só, que cria a publicação `powersync` **vazia**, sem `for all tables` e sem nenhuma tabela. O QA aceita a decisão: sem a publicação a replicação fica parada, e o ambiente não estaria inteiro (GIT-11). O teste de RLS cobre os esquemas `public` e `private` e foi provado no M5 |
| Endereço num único valor (SPEC §14) | ok. Ver M2 e M2b. App, web e servidor leem de `config/enderecos.json`. O `site_url` do Supabase vem por `env(CAMPINGUIM_SITE)`, preenchido pelo script a partir do mesmo arquivo. Fica de fora só a documentação (`docs/` e `*.md`), o que é necessário, porque a SPEC cita os domínios |
| App no emulador A (GIT-12) | ok. **Rodado pelo QA:** `campinguim-a` ligado na porta 5554 (boot em cerca de 30 s), `npm run app:instalar` com "Success", e `npm run testar:jornadas -- fumaca` **1 de 1, de primeira** (24,4 s). A captura do QA mostra só o app e a barra do sistema, sem ícone de outro app. O emulador foi desligado com `adb -s emulator-5554 emu kill`; restaram 0 processos e 0 aparelhos |
| APK sem segredo (DEF-09) | ok. **Lido pelo QA:** o pacote JS (Hermes) tem os textos da tela provisória em UTF-16. Chave secreta, `service_role`, JWT e os três domínios proibidos: 0 ocorrências. O `assets/app.config` traz só a chave **pública** local, o endereço do servidor local e o site `.test` |
| Textos em arquivo (NF-09 provisório) | ok. `apps/mobile/src/textos/pt-BR.json` e o equivalente da web. O roteiro do Maestro lê os textos por marcador. O lint barra texto solto (M6) |
| Evidências | ok. As 3 PNG foram vistas pelo QA: tela do app sem as barras do sistema, e a página web no Chromium e no WebKit. Nenhum ícone, marca ou tela inicial de terceiro. Os ícones do app são o mascote do próprio repositório (mesmo hash de `design/mascote/final/…`). Os `.txt` foram conferidos |
| Escopo | ok. 109 arquivos, só nas pastas do cartão. `docs/infra.md` ganha só a seção "Ambiente local (B1)" (+17 linhas, sem segredo). Nada mudou em `prova/`, `design/`, `roteiros/`, `videos/`, `docs/prova-tecnica/`, PRD, SPEC ou `CLAUDE.md`. A pasta principal `C:\campinguim` continua só com os 2 itens dos reels |
| Checagem G | ok. Diff `main..HEAD`, mensagens dos 3 commits e evidências: 0 chave com valor, 0 JWT, 0 usuário do Windows, 0 caminho de máquina, 0 e-mail pessoal (só noreply e domínios `.test`). Os domínios proibidos aparecem só em `docs/`: na descrição da regra, numa evidência com um endereço inventado e no `pages.dev` que já estava em `docs/infra.md` no `main`. Único `.env*` rastreado: o `.exemplo` vazio |

## Item para corrigir

| # | Onde | Problema | Como reproduzir | O que fazer |
| --- | --- | --- | --- | --- |
| 1 | `scripts/testar.mjs` (`contagemVitest` e a etapa da página web) e `scripts/testes/manifesto.test.ts` | Teste pulado dentro de uma etapa não aparece no resumo como PULADO. Sem o APK, os 3 testes do manifesto (ponto J9) são pulados por `describe.skipIf`, e a etapa fica "passou" com "73 de 76 testes passaram (3 pulados)". Com a web e o servidor no ar, o resumo final diz **"SUÍTE COMPLETA"**. Isso contradiz a regra da própria suíte ("pulado … não serve para aprovar") e o cartão ("o comando diz claramente o que pulou"). Na esteira da etiqueta (`versao.yml`) nunca há APK, então a esteira daria "completa" sem conferir J9. Além disso, o teste lê qualquer APK que estiver na pasta, mesmo um mais velho que o `app.config.ts`, e pode aprovar um manifesto que não é o do código atual | Renomear `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`, rodar `npm run testar -- --exigir-servidor` e ler o resumo. Devolver o APK depois | (a) Se o vitest informar `numPendingTests > 0` (ou o Playwright `skipped > 0`), a etapa vira **PULADO**, com o motivo, e o resumo final fica **SUÍTE INCOMPLETA**. (b) No teste do manifesto, tratar o APK mais velho que `apps/mobile/app.config.ts`, `apps/mobile/package.json` ou `apps/mobile/plugins/*` como ausente, com o motivo "APK desatualizado: rode npm run app:gerar". (c) Gravar como evidência a saída da suíte sem o APK, mostrando INCOMPLETA, e a saída com o APK, mostrando COMPLETA. (d) Decidir e registrar em `docs/desenvolvimento.md` o que a esteira faz com o J9: gera o APK, ou aceita a etapa como PULADO e por isso não fecha "completa". Commit local no mesmo ramo, citando B1 |

## Observações (não reprovam; para o piloto)

1. **`core.hooksPath = .githooks` fica no `.git/config` compartilhado** por `C:\campinguim`, `C:\campinguim-reels` e os worktrees. Hoje só a B1 tem `.githooks`, então nada muda para os reels. **Depois que a B1 entrar no `main` e a pasta principal for atualizada, a trava de segredos passa a valer também nos commits dos reels.** Isso é desejável, mas ela pode barrar evidência com caminho de usuário ou e-mail, e é bom avisar a missão dos reels.
2. **`VIBRATE`** vem do modelo do Expo e não estava na lista do J9. Ficou na lista fechada, com a nota de que a 1.6 confirma. Se o piloto quiser fora agora, é uma linha em `blockedPermissions`.
3. **`npm run testar` sai com 0 quando o resultado é INCOMPLETA.** Está escrito com clareza, e a esteira usa `--exigir-servidor`, mas um código de saída diferente de 0 seria mais seguro. Fica a critério do piloto.
4. **`npm audit`: 3 vulnerabilidades moderadas**, não investigadas (relato da entrega; o QA não rodou o audit).
5. **Esteira:** `actions/checkout@v4` e `actions/setup-node@v4` estão por etiqueta, não por hash de commit. Basta para as 0.x. Fixar por hash pode ficar para a rodada de lançamento.
6. **O nome do pacote aparece em dois lugares:** `app.config.ts` e `scripts/android.mjs`. Quando o nome definitivo vier (D1), os dois mudam juntos. Um teste que compare os dois evitaria esquecer um.
7. **Linha de coautoria:** os commits dizem "Claude Opus 5.5", o modelo que de fato fez o trabalho; o cartão pedia "Fable 5.1". A mensagem final é do squash do orquestrador.
8. **P8 em celular físico (D4)** não está na B1: não há celular físico até a feature 1.6 (E2). Fica como pendência registrada, não como feito.
9. A primeira fumaça do ajudante falhou por "System UI isn't responding" no primeiro boot a frio. Na rodada do QA, com um boot novo, passou de primeira.

## Limpeza

- Docker Desktop já estava ligado e continua ligado. O QA subiu os 7 contêineres do projeto (`zerar`) e parou com `npm run ambiente:parar`: 0 contêineres `campinguim` no fim. Os volumes do projeto ficam, como antes. A pilha da prova não foi tocada.
- Emulador `campinguim-a` ligado pelo QA e desligado com `adb -s emulator-5554 emu kill`: 0 processos de emulador e `adb devices` vazio. Não houve `kill-server` nem `start-server`.
- O APK do ajudante foi renomeado só durante o teste e devolvido, com o mesmo tamanho (31.898.667 bytes). A captura da fumaça do QA, em `test-results/` (ignorado), foi apagada. Os rascunhos do QA ficaram só na pasta temporária do sistema e foram apagados.
- O `.env.local` (ignorado) foi regerado pelo `zerar` do QA, com as credenciais locais novas do Supabase local.
- `git status` do worktree: só este relatório, novo. Ponta em `73d4358`.
