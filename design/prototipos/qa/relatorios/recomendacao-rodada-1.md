# Etapa 3 · recomendação da Cinema · rodada 1 · REPROVADA (1 item)

Data: 2026-11-24 · Entregue por: pane-613 · Alvo: `design/prototipos/recomendacao-dados.js`, exibido em `recomendacao.html`
Base: `qa/roteiro.md`, seções 2 e 4; pedido do piloto (cada motivo apoiado no que existe no protótipo; sem dado inventado, pesquisa alegada, marca de terceiro nem jargão; alcançável só no fim).

**Resumo:** a recomendação é o **Rumo**, com 6 motivos e 4 riscos.
- Cinco motivos e os quatro riscos se apoiam no que existe de fato no protótipo, ou no PRD. Não há pesquisa alegada, marca de terceiro nem jargão.
- A página abre sem erro, em 390 e 1440, nos dois temas e nas três fontes, e só se chega a ela pelo link do fim da página inicial.
- **Uma afirmação não se sustenta:** "a leitura mais firme das cinco ao sol", no motivo 2 e repetida no resumo. Pelos números, o texto do Rumo tem o **menor** contraste das cinco.

**Evidências** em `qa/relatorios/recomendacao-r1/`: `recomendacao-*.png` e `saida.txt`.

## Item que reprova

| # | Onde | O que diz | O que os números mostram | O que fazer |
| --- | --- | --- | --- | --- |
| 1 | `resumo` ("a que melhor se lê ao sol") e `motivos[1]` ("Papel claro com tinta quase preta dá a leitura mais firme das cinco ao sol") | O Rumo seria o de melhor leitura ao sol entre os cinco | Contraste no tema claro, recalculado de cada `estilo.css`. **Texto sobre fundo:** Roda 15,53; Brasa 15,23; Clareira 13,93; Oficina 13,70; **Rumo 13,25** (o menor). **Texto secundário sobre fundo:** Roda 7,28; Oficina 6,57; Brasa 6,54; Clareira 6,33; **Rumo 6,17** (o menor). O Rumo lidera em outra coisa: **o botão principal** (sobre-acento/acento 14,46 e acento/fundo 13,25, os maiores das cinco). Todas passam com folga do 7:1 | Trocar a afirmação por uma verdadeira e verificável. Por exemplo: "o botão principal mais contrastado das cinco (14,5:1), escuro e largo, e números alinhados". No resumo, tirar "a que melhor se lê ao sol" ou dizer "boa leitura ao sol, com o botão principal mais forte das cinco". Não dizer que o texto é o mais legível |

## O que passou

| Ponto | Resultado | Onde se apoia |
| --- | --- | --- |
| Motivo 1: rota e "você está aqui" | ok | rota de 5 paradas em todas as telas; ícone de 24 px na parada atual (`rumo-rodada-1.md`, `rota-icone.png`) |
| Motivo 3: faixa na borda e "separei · fora do carro" | ok | itens fora do carro com a faixa de 4 px em `separei` e o texto do estado (telas 4 e 6) |
| Motivo 4: selo com quantos confirmaram e quando | ok | fato com "6 confirmações · nov/2026" no selo; o PRD, princípio 6, diz "Dado tem data e autor" |
| Motivo 5: ação no rodapé e legenda que abre de baixo | ok | ação principal no rodapé; o painel da legenda abre na parte de baixo da tela (`rumo-r1/legenda.png`) |
| Motivo 6: em 200 %, a rota vira números e a legenda encolhe | ok | rodada 2 do Rumo, com 0 corte, 0 palavra partida e 0 rolagem nas 96 combinações |
| Riscos | ok, honestos e verificáveis: rota no alto (o deslizar existe, com `pointerdown` em `icones.js`, e as paradas são botões); grupo e gastos na legenda; topo alto na lista; manutenção trabalhosa | protótipo |
| Sem dado inventado, pesquisa, marca ou jargão | ok: nenhum número do cenário, nenhuma menção a teste com usuários, nenhuma marca | leitura |
| Alcançável só no fim | ok: a página inicial leva a ela por um link discreto no fim; a página traz "Abrir o protótipo recomendado" (→ `rumo/01-abertura.html`) e a volta para as outras páginas | links |
| Página | ok: 0 erro, 0 pedido externo, 0 alvo menor que 44, 0 texto abaixo do AA, sem rolagem lateral (390 e 1440, claro e escuro; 130 e 200 % conferidos depois do ajuste do título) | `saida.txt`, `apresentacao-rodada-1.md` |

---

# Rodada 2 · 2026-11-24 · pane-613 · APROVADA

- **Resumo:** "É a que mais parece feita por quem acampa, com a viagem inteira desenhada como uma rota de cinco paradas, da sala de casa até a volta, e com o botão principal mais forte das cinco." É verdadeiro: o botão principal (sobre-acento/acento) tem 14,46:1, o maior das cinco.
- **Motivo 2:** "O botão principal é o mais contrastado das cinco [...]; o texto lê bem ao sol, com folga sobre o mínimo [...]". É verdadeiro: o texto tem 13,25:1, contra o mínimo de 7:1. A frase não diz mais que o texto é o mais legível das cinco.
- O resto ficou igual ao da rodada 1, já conferido.
- **Página:** 390 e 1440 × claro e escuro × fonte 100, 130 e 200 (12 combinações): 0 rolagem lateral, 0 erro de console.
- **Escolha da Cinema: Rumo.** Etapa 3 do QA concluída: apresentação, título em 200 % e recomendação aprovados.
