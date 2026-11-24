# Registro da escolha do mascote (MSC-07) · rodada 2 · APROVADO

Data: 2026-11-24 · Entregue por: pane-567 · Base: `escolha-rodada-1.md` (1 item)

**Resumo:** o registro e a apresentação agora dizem a mesma verdade.
- A opção **03, Filhote de gorro**, foi escolhida.
- As opções 01 a 09 estão aprovadas em vetor, cada uma com estudo ilustrado aprovado.
- A 10 foi entregue e **não validada**, e aparece assim no índice, na página, na comparação e na avaliação. Não aparece mais como "em produção" nem como "não entregue". A arte continua na pasta, sem ser exibida.
- Console: 0 erro.

Saída: `qa/relatorios/escolha-r2/saida.txt` (20 capturas).

| Item | Resultado | Evidência |
| --- | --- | --- |
| Item 1 da rodada 1 (a 10 aparecia como "não entregue") | ok. Textos lidos pelo navegador: índice "10 · não validada · Entregue, mas não validada: a escolha do mascote foi feita antes."; página da 10 "Opção não validada · Entregue, mas não validada: a escolha do mascote foi feita antes."; avaliação "10 · não validada"; comparação com o selo "não validada" e nenhum "em produção" | leitura por script |
| Mecanismo | ok: `estado: "nao-validada"` no `dados.js` da 10, explicado no LEIA-ME (seção "3. Opção não validada"); sem `estado`, `pronta: false` continua sendo "em produção" | `apresentacao/LEIA-ME.md`, `opcoes/10/dados.js` |
| `ESCOLHA.md` | ok, sem mudança desde a rodada 1 | `design/mascote/ESCOLHA.md` |
| Console e leitura | ok: índice, páginas da 10 e da 09, comparação e avaliação com 0 erro, 0 pedido externo, 0 texto abaixo de AA, 0 alvo menor que 44 px, sem rolagem horizontal, em 390 e 1440, claro e escuro | `saida.txt` |
