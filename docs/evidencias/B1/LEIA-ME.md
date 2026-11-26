# Evidências da B1 (rodada 1, 26/11/2026)

| Arquivo | O que mostra |
| --- | --- |
| `testar-suite-completa.txt` | `npm run testar` com o ambiente no ar: 7 de 7 etapas, 76 testes unitários e de travas, 8 do servidor, 2 da página web |
| `testar-ambiente-fora-do-ar.txt` | `npm run testar` com o ambiente parado: a etapa do servidor aparece como PULADO e o resumo diz "SUÍTE INCOMPLETA" |
| `tipos-e-lint.txt` | `npm run tipos` e `npm run lint` sem erro |
| `ambiente-subir.txt` | `npm run ambiente:subir` partindo do ambiente parado: 7 contêineres, os que têm verificação de saúde em "healthy" |
| `ambiente-zerar.txt` | `npm run ambiente:zerar`: apaga os dados, recria o banco pelas migrações e sobe de novo |
| `ambiente-parar.txt` | `npm run ambiente:parar`: nenhum contêiner do ambiente ficou rodando |
| `trava-de-segredos-commit-barrado.txt` | Commits de teste com chave falsa, dado pessoal e `.env` barrados pelo hook; desfeitos depois |
| `enderecos-run-app.txt` | A verificação de endereços passa na árvore e falha com `run.app` plantado num arquivo; desfeito depois |
| `manifesto-final-permissoes.txt` | Permissões do APK e do manifesto final mesclado; as 24 bloqueadas pelo `app.config.ts`; teste de lista fechada |
| `app-tela-provisoria-emulador-a.png` | O app instalado no `campinguim-a` (emulator-5554) com a tela provisória. Só a tela do app, sem as barras do sistema |
| `jornada-fumaca-emulador-a.txt` | `npm run testar:jornadas -- fumaca`: roteiro do Maestro passou no emulador |
| `web-pagina-provisoria-android-chromium.png`, `web-pagina-provisoria-iphone-webkit.png` | A página web provisória no navegador automático, tela de Pixel 7 (Chromium) e de iPhone 15 (WebKit) |
| `sincronizacao-executor.txt` | `npm run testar:sincronizacao`: a estrutura lista S1 a S10 como pendentes (feature 2.12) |
| `git-log-e-status.txt` | `git log --oneline` do ramo e `git status` limpo |
