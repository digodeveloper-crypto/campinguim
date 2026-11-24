# Estrutura da apresentação · rodada 4 · APROVADA

Data: 2026-11-24 · Entregue por: pane-567 · Base: `estrutura-rodada-3.md` (1 item)

**Resumo:**
- O estudo ilustrado agora é pedido só para as opções da lista `_compartilhado/estudos.js` (hoje `["01"]`), que o piloto atualiza quando o QA aprova um estudo. Opção fora da lista não pede nada: zero erro de console.
- Continuam valendo os ajustes A e C da rodada 3: versão em uma cor clara no fundo escuro e referências novas em `originalidade.md`.
- O LEIA-ME explica a lista e quem a mantém.

Capturas e saída: `qa/relatorios/estrutura-r4/saida.txt` (20 capturas).

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Item 1 da rodada 3 (erro de console sem estudo) | ok: as opções 02 e 05 (sem estudo) saem com 0 erro nas 4 capturas cada | `saida.txt` |
| Estudo na opção listada | ok: a 01 mostra a seção "Estudo ilustrado"; 02 e 03 (fora da lista, a 03 ainda em avaliação) não mostram nada | conferência por script (`.estudo-fig`: 01 = 1; 02 = 0; 03 = 0) |
| LEIA-ME | ok: seção "3. Estudo ilustrado (opcional)" com o arquivo, a lista, quem a atualiza e a garantia de zero erro | `apresentacao/LEIA-ME.md` linhas 80 a 84 |
| Regressão | ok: inicial e comparação com 0 erro, 0 pedido externo, 0 texto abaixo de AA, 0 alvo menor que 44 px, sem rolagem horizontal em 390 e 1440 | `saida.txt` |

Processo: quando o QA aprovar o estudo de uma opção, o piloto inclui o número dela em `estudos.js`.
