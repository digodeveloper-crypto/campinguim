# B2 · componentes visuais · rodada 2 · APROVADO

- Data: 2026-11-26.
- Entregue por: pane-699. Conferido por: QA (pane-689).
- Base: a mesma da rodada 1 (cartão da B2, `docs/DESIGN.md` inteiro, SPEC §7, protótipo `design/prototipos/rumo/`, decisões D-2, D-5 e D-7, gorro fixo, só as 5 artes, sem 3D, aceites de DSG-06, NF-07 e NF-08) e os 3 itens de `docs/qa/B2-rodada-1.md`.
- Alvo: worktree `C:\campinguim-wt\B2`, ramo `feature/B2-componentes-visuais`, ponta `8b82ad0`, com 11 commits sobre o main `46a0346` (B4). Desde a rodada 1 entraram 3 commits: `33bfa41` e `44056f4` (código) e `8b82ad0` (evidências). O commit `9c8524f` é o relatório da rodada 1. A árvore está limpa e o rebase está em dia (o main não mudou).
- Ambiente: emulador e Docker livres para a B2, por ordem do orquestrador.
  - Liguei o `campinguim-a` (emulator-5554) e ao fim o desliguei, com tema, letra e tela de volta ao padrão: `night no`, `font_scale 1.0`, 1080x2340 e densidade 440.
  - Rodei `ambiente:zerar` antes da suíte e `ambiente:parar` ao fim: 0 contêineres no ar. O Docker Desktop já estava ligado e ficou ligado.

## Testes rodados pelo QA

| Comando (Node 24, no worktree da B2) | Resultado |
| --- | --- |
| `npm run app:gerar` (APK gerado pelo QA da ponta, com o mesmo código de `44056f4`) | exit 0 |
| `npm run ambiente:zerar` | exit 0 |
| `npm run testar -- --exigir-completa` (1ª) | **SUÍTE COMPLETA, 7 de 7 etapas**, exit 0: unitários **703/703**, servidor **109/109**, web **2/2**, tipos 5 de 5, nenhum pulo |
| `npm run testar -- --exigir-completa` (2ª) | **7 de 7**, exit 0, com os mesmos números |
| Defeito plantado: `escalaParaCaber` sempre devolvendo 1 (`metricas.ts`) | **pego**: 2 testes falham ("6 confirmações" no selo e "a palavra mais longa é a que manda"). O arquivo foi devolvido ao original e a árvore está limpa |
| `npm run testar:jornadas -- fumaca`, letra 200 %, tela padrão (393 dp) | **3 de 3**: tela provisória, galeria (267 s) e banco cifrado |
| `npm run testar:jornadas -- fumaca`, letra 200 %, tela de 5 polegadas (`wm size 720x1280`, `wm density 320`, 360 dp) | **3 de 3**: galeria em 290 s |
| `uiautomator dump` da galeria em 200 % na tela de 5 polegadas (6 telas, rolando) | **65 controles tocáveis, 0 sem nome, 0 abaixo de 44 dp** |

## Os 3 itens da rodada 1

| # | Item | Situação | Como o QA conferiu |
| --- | --- | --- | --- |
| 1 | Palavra partida em 200 % | **Corrigido** | Nas capturas do QA em 200 %, nas duas telas, aparecem inteiros: "Cozinha" (nome numa linha, a régua e "1 de 3 no carro" embaixo); "6 CONFIRMAÇÕES" nas três variantes do selo (na de 5 polegadas, o texto diminuiu só o necessário); "conferido", "compartilhar" e os demais nomes de ícone (a célula cresce com a letra); "nov/2026" sem quebra depois da barra. Também conferi tipografia, cores, cabeçalho, campos, legenda aberta (rola na de 5 polegadas) e vazios: nenhuma palavra partida. Como funciona: o `Texto` mede a largura que tem e, se a palavra mais longa não cabe, diminui a letra pela largura de cada caractere, lida da própria Archivo (`tema/metricas.json`, gerado das fontes e conferido no teste contra os `.ttf`). Isso segue a DESIGN 4.4 ("o texto encolhe até a palavra mais longa"). O título de painel ganhou a adaptação de 200 % (largura 100, +0,01 em), como o título de tela |
| 2 | Evidências com o APK final e barra de status | **Corrigido** | O `LEIA-ME.md` indica o APK (`44056f4`) e a rodada do roteiro de cada pasta. São 7 condições (claro, escuro, 130 %, 200 %, 5 polegadas, 5 polegadas com 200 % e 6,7 polegadas), 11 comparações e `conferencia-200.md`. Em `claro/galeria-item-1.jpg` e nas capturas do QA, o conteúdo rolado para abaixo da barra de status. A `Tela` agora usa a maior altura entre a área segura e `StatusBar.currentHeight` |
| 3 | Frase errada sobre `vitest.config.ts` | **Corrigido** | `docs/componentes.md` §7.2 diz agora que o projeto `core` já inclui `apps/*/src/**/*.test.ts` desde o main e que a B2 não muda a configuração. `git diff main...HEAD -- vitest.config.ts` continua vazio |

## Outras conferências

- Leitor de tela: o selo é lido como "6 confirmações. Última: Carla R., nov/2026". O sinal invisível U+2060, que impede a quebra depois da barra, fica só no texto desenhado e não no nome falado. A caixa alta continua só de estilo.
- `tokens.json`: o arquivo foi reformatado, mas, comparando valor a valor com a rodada 1, mudaram só `letraGrande.tituloPainel` (novo) e o `_leia`. Nenhuma cor, tamanho ou peso mudou.
- O app é só na vertical (`orientation: 'portrait'`), então a largura medida pelo `Texto` só crescer não causa problema ao girar a tela.
- Escopo: o ramo inteiro mexe só nas pastas do cartão e nos compartilhados previstos (`_layout.tsx`, `package.json`, `package-lock.json`, `pt-BR.json`, `cores.ts`, `estilos.css` da web e o roteiro `e2e/jornadas/fumaca/galeria.yaml`).
- Checagem G na árvore e no diff da rodada: nenhum segredo, e-mail pessoal, usuário do Windows nem caminho `C:\Users\...`. `run.app`, `pages.dev` e `workers.dev` não aparecem fora do valor de configuração. As capturas mostram só o app, e a única fonte é a Archivo, com a OFL.
- Valem as conferências da rodada 1 que o código novo não tocou: contraste dos 14 pares, tema escuro, ícones, mascote com hash igual ao pacote final, OFL idêntico, galeria bloqueada fora do ambiente `local` e manifesto sem permissão nova.

## Pendências aceitas (não bloqueiam)

- A galeria depende do padrão aberto de `config.ambiente`. Isso já está previsto para a B1-FIX-2 (fechado por padrão, com teste).
- `app/index.tsx`, a tela provisória da B1, usa só o tema claro e `borderRadius: 16`. Ela sai quando entrar a primeira tela de produto.
- Um link aberto com o app já aberto não troca de tela (só a frio). Está registrado em `docs/componentes.md` para a feature de links.
- O rodapé dos commits diz "Opus 5.5", não "Fable 5.1". Como o envio é squash, quem decide é o orquestrador.
- As evidências somam cerca de 19 MB (JPEG reduzido nas condições e PNG nas comparações).

## Limpeza

Apaguei os temporários do QA na pasta temporária do sistema. As capturas do QA ficaram em `test-results/jornadas/`, que o git ignora. O emulador está desligado e com as configurações de volta ao padrão. O ambiente local está parado.
