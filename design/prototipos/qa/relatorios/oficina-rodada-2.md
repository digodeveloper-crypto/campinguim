# Protótipo 3 · Oficina (DSG-01 a DSG-13) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: pane-598 · Base: `oficina-rodada-1.md` (1 item e 3 observações)

**Resumo:** nenhum nome se parte mais no meio da palavra, em nenhum tamanho de letra e com as divisórias dos dois lados. Quando falta espaço, a quantidade e os botões descem de linha. Na nova medição completa das 96 combinações, os dados e as ligações continuam certos e não houve regressão.

**Evidências** em `qa/relatorios/oficina-r2/`: `medicao/`, com `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `telas-claro-100.png`, `telas-claro-200.png`, `telas-escuro-130.png`.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| 1. Palavra partida no meio | ok: 0 palavra partida nas 15 telas do app, em 100, 130 e 200 %, nos dois temas. Ainda quebram só o e-mail do Pix (tela 12, em 200 %) e os caminhos de arquivo na identidade, que são cadeias sem espaço e podem quebrar | `medicao.txt`, linhas `partidas` |
| Observação: respiro do rótulo "Camping" | atendida em parte: o rótulo passou de 1 px para **3 px** da borda em 100 % e para 6 px em 200 %. Os outros rótulos têm de 8 a 17 px. Aceito | medição no DOM |
| Observação: dica da tela 4 em 200 % | atendida: legível na coluna estreita | `telas-claro-200.png` |
| Observação: `pose-alerta` na tela 13 | atendida: registrada na identidade | leitura |
| Sem regressão | ok: 0 erro, 0 pedido externo, 0 alvo pequeno e 0 texto abaixo do contraste nas 96 combinações; 68 de 68 itens iguais a `dados.js`; as ligações obrigatórias continuam chegando à tela certa (incluindo o fato aberto da 3, com voltar para a 3). Os vãos acusados são de conteúdo que passa por baixo do rodapé fixo, como na rodada 1 | `medicao.txt`, `qa/conferir_lista.py`, `qa/navegar.py` |

O resto continua como conferido na rodada 1 (`oficina-rodada-1.md`, tabela "O que passou").

Falta para a etapa 3: comparar a Oficina lado a lado com as outras quatro direções (3.16) quando todas estiverem aprovadas, e marcar `pronta: true` na ficha (`ficha.js`), que hoje ainda está `false`. Isso é com o construtor ou com o piloto.
