# Registro da escolha do mascote (MSC-07) · rodada 1 · REPROVADO

Data: 2026-11-24 · Entregue por: pane-567 · Alvo: `design/mascote/ESCOLHA.md` e o estado da opção 10 na apresentação.
Critério do piloto: o registro diz a verdade (01 a 09 aprovadas com estudo, 10 não validada, escolha = 03), e o índice e a página da 10 abrem com 0 erro no console.

**Resumo:**
- `ESCOLHA.md` está correto e completo.
- A apresentação, porém, **diz algo falso sobre a 10**:
  - no índice, o cartão da 10 mostra "em produção · Esta opção ainda não foi entregue.";
  - a página da 10 mostra o texto de "em produção" ("A arte e os textos desta opção ainda não foram entregues").
- A 10 foi entregue duas vezes; o certo é "entregue, não validada". O piloto pediu a 10 "marcada como não validada" e não "em produção".
- Console: 0 erro em todas as páginas conferidas.

Saída: `qa/relatorios/escolha-r1/saida.txt` (16 capturas).

## O que precisa mudar

1. **A 10 aparece como "não entregue".**
   - **Evidência:** texto do cartão da 10 no índice, lido pelo navegador: "10 | em produção | … | Esta opção ainda não foi entregue."
   - **Causa:** `pronta: false` usa o único estado que a estrutura conhece para opção não pronta, que é "em produção".
   - **Mudar:** criar um estado próprio, por exemplo `estado: "nao-validada"` no `dados.js` da 10, com textos novos em `textos.js`:
     - no índice: "não validada" e "Entregue, mas não validada: a escolha do mascote foi feita antes.";
     - na página da 10, a mesma frase, sem mostrar a arte como opção aprovada;
     - na comparação e na avaliação, o mesmo selo;
     - o LEIA-ME ganha uma linha explicando o estado.
   - A arte continua na pasta. As outras opções não mudam.

## Conferido e ok

| Item | Resultado | Evidência |
| --- | --- | --- |
| `ESCOLHA.md`: escolha = 03, Filhote de gorro; sem combinação; data e responsável | ok | `design/mascote/ESCOLHA.md` |
| Relatórios citados para a 03 (`03-rodada-1.md`, `03-rodada-2.md`, `03-estudo-rodada-1.md`, `03-estudo-rodada-2.md`) | ok: existem e são os de aprovação | `qa/relatorios/` |
| "01 a 09 aprovadas em vetor, cada uma com estudo aprovado" | ok: há relatórios de aprovação de vetor e de estudo de 01 a 09; `estudos.js` = `["01" … "09"]`; os 9 arquivos de estudo existem | `qa/relatorios/`, `_compartilhado/estudos.js` |
| "10 entregue em segunda rodada e não validada" | ok no `ESCOLHA.md`; **falha na apresentação** (item 1) | — |
| Comparação, recomendação e validação final "não produzidas" | ok, conforme a decisão do responsável | — |
| Console | ok: índice, página da 10, página da 03 e comparação com 0 erro, 0 pedido externo, sem rolagem horizontal, em 390 e 1440, claro e escuro | `escolha-r1/saida.txt` |
