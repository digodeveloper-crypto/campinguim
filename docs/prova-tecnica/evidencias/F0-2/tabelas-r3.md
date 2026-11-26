# F0-2 · tabelas de resultado (r3)

Gerado por `prova/e2e/sincronizacao/resumo.mjs` em 2026-11-25T07:23:42.031Z a partir de `execucoes.jsonl`.

Tentativas = todas as execuções, inclusive as refeitas por falha de roteiro. Válidas = tentativas menos as refeitas. Convergência = do momento em que o app do último aparelho reconectado volta a alcançar o servidor (registro "rede" do app) até servidor, A e B iguais e sem fila; no P10, do login. Limite do plano: 30 s (só o P7: 2 min). As três últimas colunas medem desde o (primeiro) comando que desliga o modo avião: incluem o tempo que o emulador leva para devolver a rede ao app e, no P8, o corte proposital da rede no meio do envio (ver resultado-F0-2.md).

| Cenário | Base | Tentativas | Válidas | Sem perda | Com falha | Refeitas | Convergência (mediana) | Pior caso | Acima do limite | Desde o modo avião (mediana) | Desde o modo avião (pior) | Acima do limite desde o modo avião |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | S1 | 10 | 10 | 10 | 0 | 0 | 1.5 s | 2.0 s | 0 | 3.5 s | 4.0 s | 0 |
| P2 | S2 | 10 | 10 | 10 | 0 | 0 | 0.5 s | 7.7 s | 0 | 3.2 s | 12.3 s | 0 |
| P3 | S3 | 10 | 10 | 10 | 0 | 0 | 0.5 s | 0.7 s | 0 | 2.4 s | 3.4 s | 0 |
| P3b | princípio 4 | 10 | 10 | 10 | 0 | 0 | 0.5 s | 1.6 s | 0 | 3.9 s | 5.0 s | 0 |
| P4 | S4 | 13 | 10 | 10 | 0 | 3 | 0.5 s | 2.1 s | 0 | 5.3 s | 7.3 s | 0 |
| P5 | S5 | 11 | 10 | 10 | 0 | 1 | 0.4 s | 0.9 s | 0 | 3.8 s | 4.5 s | 0 |
| P6 | seção 4, quantidade | 10 | 10 | 10 | 0 | 0 | 0.5 s | 1.0 s | 0 | 6.4 s | 7.5 s | 0 |
| P7 | S7 reduzido (H7) | 3 | 3 | 3 | 0 | 0 | 12.2 s | 13.0 s | 0 | 15.0 s | 15.1 s | 0 |
| P8 | S8 | 10 | 10 | 10 | 0 | 0 | 15.9 s | 20.8 s | 0 | 29.9 s | 34.5 s | 5 |
| P9 | S10 | 10 | 10 | 10 | 0 | 0 | 0.8 s | 2.1 s | 0 | 3.9 s | 4.5 s | 0 |
| P10 | S9 | 10 | 10 | 10 | 0 | 0 | 1.9 s | 2.0 s | 0 | 1.9 s | 2.0 s | 0 |

Total do plano (P1 a P10, sem P3b): **93 de 93** sem perda, sem duplicação e com os dois aparelhos iguais ao servidor.
Refeitas por falha de roteiro: **4 de 107** tentativas (3.7 %; limite do plano: 10 %).

## Execuções refeitas (falha de roteiro)

- P4 #5 (r3): Maestro p4-restaurar.yaml em A: 
- P4 #5 (r3): Maestro p4-a.yaml em A: 
- P4 #5 (r3): Maestro p4-a.yaml em A: 
- P5 #10 (r3): Maestro p5.yaml em A: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.

## Com os dois online: tempo até a alteração aparecer no outro aparelho

| Medida | Alterações | Recebidas | Mediana | Pior caso | Acima de 5 s |
| --- | --- | --- | --- | --- | --- |
| medida-online-r3 | 20 | 20 | 0.1 s | 1.2 s | 0 |
