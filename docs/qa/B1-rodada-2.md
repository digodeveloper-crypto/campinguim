# B1 · repositório, scripts locais de teste e ambiente em Docker · rodada 2 · APROVADO

Data: 2026-11-26 · Entregue por: pane-690 · Conferido por: QA (pane-689)
Base: item 1 de `docs/qa/B1-rodada-1.md`; cartão da tarefa B1; PRD GIT-10 e GIT-11; ponto J9.
Alvo: worktree `C:\campinguim-wt\B1`, ramo `feature/B1-base`, ponta `df62639`, sobre `73d4358`. Agora são 4 commits, só locais (`git ls-remote origin` não tem o ramo). Autor e quem gravou: noreply do GitHub. Mudam 13 arquivos: `scripts/suite.mjs` (novo), `scripts/testar.mjs`, `scripts/app.mjs`, `scripts/testes/manifesto.test.ts`, `scripts/testes/suite.test.ts` (novo), `.github/workflows/versao.yml`, `apps/mobile/plugins/cmake-caminho-longo.cjs`, `docs/desenvolvimento.md`, as evidências e o relatório da rodada 1, que é o mesmo arquivo escrito pelo QA.

**Resumo:** o item 1 foi corrigido e conferido rodando. Teste pulado agora faz a etapa sair PULADO, com o motivo, e a suíte nunca diz "completa" nesse caso. O APK mais velho que a configuração do app conta como ausente. A opção nova `--exigir-completa` faz qualquer pulo virar falha, e a esteira da versão gera o APK e usa essa opção.

## Suíte local (GIT-10)

| Execução | Comando | Resultado |
| --- | --- | --- |
| Ambiente | `npm run ambiente:subir` (Node 24.19.0) | exit 0; 7 contêineres; db, kong, auth e powersync "healthy" |
| 1ª | `npm run testar -- --exigir-completa` | **SUÍTE COMPLETA, 7 de 7 etapas, exit 0.** Unitários **88 de 88**, com os 3 do manifesto rodando; servidor 8 de 8; web 2 de 2; tipos 5 de 5; lint, segredos e endereços ok. **Total: 98 de 98** |
| 2ª, sem derrubar | o mesmo | igual, exit 0 |

## Item 1 da rodada 1

| Pedido | Resultado do QA |
| --- | --- |
| (a) Pulado vira PULADO e INCOMPLETA | ok. **Rodado pelo QA** com o APK renomeado. Com `--exigir-servidor`, os unitários saem "PULADO … 85 de 88 testes passaram; 3 pulado(s): manifesto final do app (ponto J9), PULADO: APK ausente: rode npm run app:gerar" e o resumo fica "SUÍTE INCOMPLETA … Não serve para aprovar", exit 0. Com `--exigir-completa`, o resumo é "SUÍTE INCOMPLETA, e --exigir-completa foi pedido …", **exit 1**. O APK foi devolvido com o mesmo tamanho. Por leitura: a mesma regra vale para o Playwright (`skipped` vira PULADO; `flaky` ou `unexpected` viram FALHOU), e teste `todo` também conta como pulado |
| (b) APK desatualizado | ok. **Rodado pelo QA:** com `touch apps/mobile/app.config.ts`, o resultado é "PULADO … APK desatualizado: rode npm run app:gerar (mudou depois dele: apps/mobile/app.config.ts)", exit 1 com `--exigir-completa`. A data original do arquivo foi devolvida, e a suíte voltou a COMPLETA. As fontes conferidas são `app.config.ts`, `package.json` e `plugins/*` do app |
| (c) Evidências | ok. Existem `testar-sem-apk-incompleta.txt`, `testar-apk-desatualizado-exigir-completa.txt` e `testar-suite-completa.txt` (98 de 98), todos citados no `LEIA-ME.md` da pasta. O QA refez os três casos e obteve o mesmo resultado |
| (d) Esteira e J9 | ok por leitura, como decisão registrada em `docs/desenvolvimento.md`, seções 4 e 9. O `versao.yml` instala o JDK 17 (Temurin), roda `npm run app:gerar` e depois `npm run testar -- --exigir-completa`. Continua disparando só com etiqueta `v*` (o teste `repositorio.test.ts` passa). **Não provado:** a esteira e o build em Linux nunca rodaram. A entrega diz isso, e o documento também |
| Os testes da regra pegam erro? | ok. **Defeito plantado pelo QA:** com `resumoVitest` ignorando os pulos, 2 testes de `suite.test.ts` falham (81 de 83). Desfeito em seguida |
| J9 no APK novo | ok. O APK foi regerado nesta rodada. `aapt dump permissions` mostra as mesmas 4 permissões: `INTERNET`, `SCHEDULE_EXACT_ALARM`, `VIBRATE` e `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` |
| Checagem G no commit novo | ok. No diff `73d4358..HEAD` e na mensagem do commit: 0 chave, 0 JWT, 0 usuário do Windows, 0 caminho de máquina e 0 e-mail pessoal. Os domínios proibidos só aparecem em `docs/` |

## Observações (não reprovam; para o piloto)

1. **Plugin do CMake fora do Windows:** `apps/mobile/plugins/cmake-caminho-longo.cjs` agora não faz nada fora do Windows, para o build da esteira em Linux. No Windows nada muda, e o APK regerado tem o mesmo manifesto. O build do APK em Linux só vai ser provado na primeira etiqueta de versão.
2. **A esteira ficou mais pesada:** JDK, build Android e timeout de 75 min. Isso só roda em etiqueta de versão (GIT-05). Se o build falhar em Linux, a versão não sai até corrigir, o que é o comportamento certo.
3. **Comando para aprovar:** o QA passa a aprovar com `npm run testar -- --exigir-completa`. O `npm run testar` sem opção continua saindo com 0 quando o resultado é INCOMPLETA, para o ciclo de edição. Isso resolve a observação 3 da rodada 1 para quem aprova.
4. **Continuam valendo, sem mudança**, as observações 1, 2 e 4 a 9 da rodada 1. As principais: `core.hooksPath` compartilhado com a pasta dos reels; `VIBRATE` mantido; `npm audit` com 3 vulnerabilidades moderadas; o P8 em celular físico pendente.
5. **Integração:** só por squash, num único commit com o ID B1 (GIT-03, J24). O orquestrador escreve a mensagem, inclusive a linha de coautoria.

## Limpeza

- Docker Desktop continua ligado. O QA subiu o ambiente e parou com `npm run ambiente:parar`: 0 contêineres `campinguim` no fim. O emulador não foi usado nesta rodada: 0 processos.
- O APK foi devolvido com o mesmo tamanho, e a data de `app.config.ts` voltou ao valor original. A suíte voltou a COMPLETA.
- Os rascunhos do QA ficaram só na pasta temporária do sistema e foram apagados. `test-results/` foi apagado.
- `git status`: só este relatório, novo. Ponta em `df62639`.
