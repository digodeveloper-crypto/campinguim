# Protótipo 4 · Rumo (DSG-01 a DSG-13) · rodada 2 · REPROVADO (1 item, regressão)

Data: 2026-11-24 · Entregue por: pane-599 · Base: `rumo-rodada-1.md` (3 itens e 2 observações)

**Resumo:** os três itens da rodada 1 e as duas observações foram corrigidos. A correção das palavras partidas, porém, criou **rolagem lateral na página de identidade** com letra em 130 e 200 %. O caminho do arquivo de licença deixou de quebrar e passou a vazar da tela.

**Evidências** em `qa/relatorios/rumo-r2/`: `medicao/`, com `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `telas-claro-200.png`.

## Item que reprova

| # | Item (roteiro) | Onde | O que fazer |
| --- | --- | --- | --- |
| 1 | **Rolagem horizontal (3.10), regressão** | `identidade.html`, nos dois temas: em 130 %, a página fica com 454 px de largura numa tela de 390; em 200 %, com 666 px. Quem vaza é o link `a.linha-ligacao.ligacao-solta`, com o texto "_compartilhado/fontes/archivo/OFL.txt", que não quebra mais. Na rodada 1 ele quebrava, e isso era aceito por ser um caminho de arquivo. As curvas de nível de fundo também passam da borda, mas estão recortadas e não contam | Deixar só esse caminho quebrar: por exemplo, `overflow-wrap: anywhere` apenas no link do caminho, ou `<wbr>` depois de cada "/". O resto do texto continua sem partir palavra. Conferir com `prototipo.py` que `rolagem_horizontal=nao` em todas as 96 combinações |

## Itens da rodada 1

| # | Item | Resultado | Como conferi |
| --- | --- | --- | --- |
| 1 | Palavra partida em 200 % | ok: 0 palavra partida nas 15 telas do app, em 100, 130 e 200 %. Só o e-mail do Pix quebra (tela 12, em 200 %), o que é aceito | `medicao.txt`, linhas `partidas` |
| 2 | "1 itens" | ok: "Lazer · 1 item" | leitura da tela 15 |
| 3 | Voltar do fato | ok: 3 → fato → Voltar leva à 3; 7 → fato → Voltar leva à 7; legenda → fato → Voltar volta à tela de origem | `qa/navegar.py` |
| Obs. | Legenda em 200 % e `position` no mascote | ok: a legenda fica só com o rótulo curto quando a letra cresce; as regras de `.cg-mascote` só têm `width` e o `fill` da `uma-cor` | capturas, `estilo.css` |

## Sem regressão nas telas do app

0 erro, 0 pedido externo, 0 alvo pequeno e 0 texto abaixo do contraste nas 96 combinações. Os 68 itens continuam iguais a `dados.js` (o nome acessível só acrescenta ". Abrir o item"). Os vãos acusados continuam sendo de conteúdo que passa por baixo da legenda fixa, como aceito na rodada 1.
