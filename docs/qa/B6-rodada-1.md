# B6 · arquivo de textos e eventos de medição · rodada 1 · APROVADO

Data: 2026-11-26 · Entregue por: pane-703 · Conferido por: QA (pane-689)
Base: cartão da B6; SPEC, seção 12 (eventos) e seção 3 (listas fechadas); PRD NF-09, DAT-04, DAT-05, RET-09 e RET-10; regras do piloto para B2–B6 (aprovação com `--exigir-completa`; a B6 toca o app, então nenhum pulo é aceito); decisões do piloto sobre o h-16i (B1-FIX antes; vez do Docker coordenada).
Alvo: worktree `C:\campinguim-wt\B6`, ramo `feature/B6-textos-e-eventos`, ponta `09f8d46`, rebaseada sobre o main `87d5c1b` (que já tem a B1-FIX). 3 commits, só locais; autor e quem gravou: noreply.

**Resumo:** a primeira conferência (ponta `f8b8338`) achou o conteúdo certo, mas não pôde aprovar por dois problemas de ambiente que não eram da B6: o CRLF da B1, já corrigido pela B1-FIX, e o banco local compartilhado com a B5. Depois do rebase e com a vez do Docker dada pelo piloto, a suíte completa passou duas vezes.

## Suíte local (GIT-10)

| Execução | Comando | Resultado |
| --- | --- | --- |
| Ambiente | `npm run ambiente:zerar` a partir do worktree da B6 (Node 24.19.0), com a vez do Docker liberada pelo piloto e a B5 pausada | exit 0 em 71 s; 7 contêineres; db, kong, auth e powersync "healthy" |
| 1ª | `npm run testar -- --exigir-completa` | **SUÍTE COMPLETA, 7 de 7 etapas, exit 0.** Unitários 255 de 255, com os 3 do manifesto (J9) rodando contra o APK de 16:03, mais novo que as fontes do manifesto. Servidor 8 de 8; web 2 de 2 (Chromium e WebKit); tipos 5 de 5; lint, segredos e endereços ok. **Total: 265 de 265** |
| 2ª, sem derrubar | o mesmo | igual, exit 0 |

## Rebase

`git range-diff 9138aa1..f8b8338 87d5c1b..HEAD`: o commit do código é idêntico (`=`); o de registro muda só o contexto de `docs/MUDANCAS.md` (a linha da B1-FIX); o terceiro commit é novo, só com evidência. O código não mudou desde a conferência de conteúdo.

## Aceite

| Critério | Resultado do QA |
| --- | --- |
| Escopo | ok. 36 arquivos nas pastas da B6. Os compartilhados são mínimos e justificados: `vitest.config.ts` (o projeto `core` inclui `apps/*/src/**/*.test.ts`); `packages/core/package.json` (exports `./formato` e `./eventos`); a dependência da web em `@campinguim/core`; o lockfile. Não toca `supabase/`, `scripts/`, `e2e/`, `app.config.ts` nem `packages/core/src/index.ts` |
| SPEC §12, catálogo de eventos | ok. 28 eventos, com as propriedades exatas da tabela; um teste lê a tabela da própria SPEC. **Defeito plantado pelo QA:** uma propriedade a mais na tabela da SPEC faz o teste falhar. As listas fechadas batem com a §3 (`kind`: `tent_car`, `backpack`, `motorhome`; `pack_state`: `todo`, `set_aside`, `in_car`; `split_rule`: `shares`, `per_family`, `adults_teens`) |
| "Nenhum evento leva nome, e-mail, texto digitado ou nome de camping" | ok. **Testado pelo QA com entradas ruins:** "Fulano de Tal" em `origin` é recusado; a propriedade `email` é recusada como dado pessoal; `amount_band` = "R$ 420,00" (valor exato) é recusado; `has_text` com texto é recusado; o evento válido passa. As mensagens de erro nunca repetem o valor recusado |
| `amount_band` e `invite_token_hash` | ok. A faixa vem de configuração (o padrão está marcado PENDENTE); o resumo é SHA-256, comparado com o `crypto` do Node |
| RET-09, usuário ativo | ok. `trip_created` ou `item_state_changed` nos últimos 12 meses, com testes de borda (29 de fevereiro, evento futuro) |
| NF-09, textos | ok. Arquivo de textos por tela no app (322 chaves) e na página, com acesso tipado. Um teste falha se uma chave usada no código, nos roteiros do Maestro ou nos testes da web não existe (evidência de falha e de aprovação). Textos legais ficam obrigatoriamente `[PENDENTE]`. O lint de texto solto vem da B1 |
| NF-09, formato brasileiro | ok. Reais em centavos ("R$ 1.234,56"), datas e números, com testes; a data não depende do fuso |
| Registro no aparelho | ok. Porta `ArmazenamentoDeEventos` com implementação em memória e testes; valida antes de guardar e nunca lança. O SQLite fica para a B4 e o envio em lote para a 2.2 |
| Checagem G | ok. 0 chave, JWT, usuário do Windows, caminho de máquina ou e-mail pessoal no diff, nas mensagens e nas evidências. O ajudante deixou de fora o log completo do Gradle (tinha caminhos da máquina) |

## Observações (não reprovam; o piloto já tem as pendências 1 a 4)

1. Faixas de `amount_band`, canais de `install_attributed`, códigos em inglês das listas, limites de sanidade e tamanho da fila: decisão do piloto e do responsável.
2. 61 textos `[PENDENTE]` (55 no app, 6 na página), inclusive os textos legais (PRV-04) e o rótulo do botão de login com Google.
3. `invite_token_hash` é SHA-256 sem sal: só é irreversível se o código do convite tiver entropia alta. A feature 2.4 tem de garantir isso.
4. Coautoria "Claude Sonnet 5.5" nos commits; resolve-se no squash.
5. **Integração:** a B6 e a B3 mexem as duas em `packages/core/package.json`. Quem rebasear depois resolve o conflito, e o QA confere.
6. O ajudante copiou o `.env.local` do worktree da B5 para rodar o servidor antes da vez do Docker. O arquivo é ignorado pelo git e foi regerado pelo `zerar` do QA.

## Limpeza

- Docker: na hora da liberação havia uma pilha no ar (subida cerca de 1 minuto antes). O QA zerou e subiu a partir da B6 e parou com `npm run ambiente:parar`: 0 contêineres `campinguim` no fim. A vez foi devolvida ao piloto. A B5 precisa de `npm run ambiente:zerar` a partir do worktree dela para ter as migrações de volta.
- O emulador não foi usado: a B6 não muda tela, e o roteiro de fumaça não mudou.
- Os rascunhos do QA ficaram só na pasta temporária do sistema e foram apagados. O worktree não mudou, só ganhou este relatório.
