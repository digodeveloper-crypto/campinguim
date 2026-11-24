# Protótipo 2 · Clareira (DSG-01 a DSG-13) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: pane-597 · Base: `clareira-rodada-1.md` (1 item e 2 observações)

**Resumo:** com letra em 200 %, "Campinguim" na abertura e "6 confirmações" no fato aparecem inteiros. O título usa o maior tamanho que cabe, e o "6" fica sobre "confirmações". As duas observações também foram atendidas. Na nova medição completa das 96 combinações, os dados e as ligações continuam certos e não houve regressão.

**Evidências** em `qa/relatorios/clareira-r2/medicao/`: `prototipo.py` nas 16 páginas × 2 temas × 3 fontes; `01-abertura-claro-200.png`; `10-fato-claro-200-inteira.png`.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| 1. Palavra partida no meio | ok: 0 palavra partida nas 15 telas do app, em 100, 130 e 200 %, nos dois temas. Ainda quebram só o e-mail do Pix (tela 12, em 200 %) e "figtree" num caminho de arquivo da identidade, que são cadeias sem espaço | `medicao.txt`, linhas `partidas`; capturas |
| Observação: `position` no mascote | atendida: `.cl-pose .cg-mascote` só tem `width` | `estilo.css` |
| Observação: frase repetida na tela 6 | atendida: com os 3 itens no carro, "Trilha completa" aparece 1 vez | teste no DOM |
| Sem regressão | ok: 0 erro, 0 pedido externo, 0 alvo pequeno e 0 texto abaixo do contraste nas 96 combinações; 68 de 68 itens iguais a `dados.js`; as ligações obrigatórias chegam à tela certa. Os vãos acusados são de conteúdo que passa por baixo da barra fixa, aceito na rodada 1 | `medicao.txt`, `qa/conferir_lista.py`, `qa/navegar.py` |

O resto continua como conferido na rodada 1 (`clareira-rodada-1.md`, tabela "O que passou").

Falta: trocar `pronta: false` para `pronta: true` em `clareira/ficha.js`, e, na etapa 3, comparar lado a lado com as outras direções (3.16).
