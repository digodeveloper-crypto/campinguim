# Estrutura da apresentação · rodada 3 (ajustes A, B e C) · REPROVADA

Data: 2026-11-24 · Entregue por: pane-567 · Alvo: `_compartilhado/` (estilo, página da opção, comparação, textos), `LEIA-ME.md`, `direcao/originalidade.md`

**Resumo:** dois dos três ajustes estão certos e vistos funcionando.
- A versão em uma cor aparece clara sobre o fundo escuro, na página da opção e na comparação.
- O bloco "Estudo ilustrado" aparece rotulado como IA e só quando o estudo existe.
- As referências novas entraram em `originalidade.md`.

Reprova por **um ponto**: nas páginas de opção sem estudo, a sondagem do arquivo gera erro de console (`ERR_FILE_NOT_FOUND`). "Zero erro de console" é critério da estrutura desde a rodada 1. O piloto já orientou a correção: uma lista declarada em `_compartilhado/` com as opções de estudo aprovado, começando só com "01".

Capturas e saída: `qa/relatorios/estrutura-r3/` (`saida.txt`, `comparacao-escuro.png`, `uma-cor-escuro-01.png`, `uma-cor-escuro-05.png`, `estudo-01.png`).

## O que precisa mudar

1. **Erro de console nas opções sem estudo.** Evidência: `saida.txt`.
   - Na página da 02: `falhou: …/opcoes/02/estudo/estudo-ilustrado.png` e `Failed to load resource: net::ERR_FILE_NOT_FOUND`.
   - Vale para toda opção sem estudo; a 01, que tem estudo, sai com erros = 0.
   - **Mudar** conforme a orientação do piloto:
     - lista declarada (por exemplo, `_compartilhado/estudos-dados.js`, com `["01"]`);
     - a página só pede o arquivo das opções listadas;
     - LEIA-ME atualizado dizendo que quem inclui um número na lista é o piloto, depois da aprovação do QA.

## Resultado por item

| Item | Resultado | Evidência |
| --- | --- | --- |
| A. Versão em uma cor no escuro | ok: invertida para claro só nas imagens de uma cor (bloco da opção, uso "Versão em uma cor só" e grade da comparação); os ícones de 48 px e as outras artes não invertem; os recortes transparentes continuam transparentes | `comparacao-escuro.png`, `uma-cor-escuro-01.png` |
| B. Bloco "Estudo ilustrado" | ok na exibição: aparece no fim da página da 01, com rótulo "Estudo gerado por IA a partir do desenho aprovado. A arte oficial é o vetor…" e legenda; não aparece na 05 (sem estudo); claro e escuro, 390 e 1440 sem rolagem horizontal. **Falha no console** (item 1) | `estudo-01.png`, `saida.txt` |
| C. Referências novas | ok: Penguin (freeride, Suíça) na tabela de marcas, com as fontes; Pengu e Penguru/Coach na de jogos, marcados como não confirmados | `direcao/originalidade.md` linhas 44, 75 e 76 |
| Regressão | ok: inicial, comparação e avaliação com 0 erro, 0 pedido externo, 0 texto abaixo de AA, 0 alvo menor que 44 px, sem rolagem horizontal | `saida.txt` |
