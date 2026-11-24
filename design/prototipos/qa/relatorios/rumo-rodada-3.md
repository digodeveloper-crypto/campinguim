# Protótipo 4 · Rumo (DSG-01 a DSG-13) · rodada 3 · APROVADO

Data: 2026-11-24 · Entregue por: pane-599 · Base: `rumo-rodada-2.md` (1 item, regressão)

**Resumo:** a página de identidade não rola mais para o lado. Só o caminho do arquivo de licença pode quebrar em qualquer ponto; o resto do texto continua sem partir palavra. A nova medição completa das 96 combinações está limpa.

**Evidências** em `qa/relatorios/rumo-r3/medicao/`: `prototipo.py` nas 16 páginas × 2 temas × 3 fontes, com `medicao.txt`.

| Item | Resultado | Como conferi |
| --- | --- | --- |
| 1. Rolagem horizontal na identidade | ok: `rolagem_horizontal=nao` nas 96 combinações, incluindo a identidade em 130 e 200 % nos dois temas. Em 200 %, o caminho "_compartilhado/fontes/archivo/OFL.txt" quebra em "fontes", o que é permitido por ser um caminho de arquivo | `medicao.txt` |
| Sem regressão | ok: 0 erro, 0 pedido externo, 0 alvo pequeno, 0 texto abaixo do contraste e 0 palavra partida nas 15 telas do app (só o e-mail do Pix quebra em 200 %); amostra de ligações certa (3 → fato → Voltar → 3; 1→2; Vou sair→6; Carne→12). Os vãos acusados continuam sendo contra a legenda fixa, aceitos na rodada 1 | `medicao.txt`, `qa/navegar.py` |

O resto continua como conferido nas rodadas 1 e 2 (`rumo-rodada-1.md`, `rumo-rodada-2.md`).

Falta: `pronta: true` em `rumo/ficha.js`, e, na etapa 3, a comparação lado a lado com as outras direções (3.16).
