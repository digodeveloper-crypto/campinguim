# DSG-07 · escolha do responsável (opção 01) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: Cinema (pane-651) · Conferido por: QA (pane-646)
Alvo: mudanças no disco, sem commit, em `design/marca/`: o `LEIA-ME.md` ganhou a seção "Escolha do responsável", `textos.js` e `index.html` ganharam o selo "Escolhida", e a pasta `perfil/` é nova.

| Critério | Resultado | Como o QA conferiu |
| --- | --- | --- |
| Só `design/marca/`, sem tocar em `qa/` | ok. `git status`: 3 arquivos modificados e `perfil/` nova. `qa/` só tem os relatórios do QA | `git status`, `git diff --stat` |
| Cópias exatas | ok. `instagram-perfil.png` = `tiktok-perfil.png` = `01-claro-1024.png` (SHA-256 `2ded1b669ec24636…`); `perfil.svg` = `01-claro.svg` (`694908b85f451381…`) | `sha256sum` |
| Texto da interface fora do código | ok. "Escolhida" e o novo aviso estão em `textos.js`. O `index.html` só ganhou a regra de estilo e uma linha de lógica | `git diff` |
| Página | ok. Um selo só, na opção 01; o aviso novo aparece; 0 imagens quebradas, 0 erros, 0 pedidos externos; sem rolagem lateral em 1280 e 320 px. O selo usa `texto` sobre `superficie`, os mesmos papéis do corpo da página | Chrome pelo Playwright |
| LEIA-ME | ok. Traz a data, a opção, os arquivos, a variante clara e o motivo, as somas de conferência e as duas observações do QA, com fontes certas (o "disco azul" está no DESIGN.md, seção 13, "O que nunca fazer", e em `originalidade.md`) | leitura; seção do DESIGN.md conferida |
| Sem caminho de máquina nem segredo | ok. 0 resultados nos arquivos alterados e novos. A única menção a `render.py` é um caminho relativo do repositório | busca |

**Para a montagem (pane-649):** estas mudanças e este relatório precisam entrar no commit DSG-07 do `main` novo antes de Q1 a Q9 serem refeitos. Na rodada final, o QA confere que a árvore de `design/marca/` no `main` é igual ao disco.
