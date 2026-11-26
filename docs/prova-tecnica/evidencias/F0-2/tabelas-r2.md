# F0-2 · tabelas de resultado (r2)

Gerado por `prova/e2e/sincronizacao/resumo.mjs` em 2026-11-25T07:23:41.967Z a partir de `execucoes.jsonl`.

Tentativas = todas as execuções, inclusive as refeitas por falha de roteiro. Válidas = tentativas menos as refeitas. Convergência = do momento em que o app do último aparelho reconectado volta a alcançar o servidor (registro "rede" do app) até servidor, A e B iguais e sem fila; no P10, do login. Limite do plano: 30 s (só o P7: 2 min). As três últimas colunas medem desde o (primeiro) comando que desliga o modo avião: incluem o tempo que o emulador leva para devolver a rede ao app e, no P8, o corte proposital da rede no meio do envio (ver resultado-F0-2.md).

| Cenário | Base | Tentativas | Válidas | Sem perda | Com falha | Refeitas | Convergência (mediana) | Pior caso | Acima do limite | Desde o modo avião (mediana) | Desde o modo avião (pior) | Acima do limite desde o modo avião |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | S1 | 13 | 9 | 9 | 0 | 4 | 1.8 s | 11.3 s | 0 | 4.4 s | 17.9 s | 0 |
| P2 | S2 | 10 | 10 | 10 | 0 | 0 | 1.3 s | 3.3 s | 0 | 5.0 s | 11.0 s | 0 |
| P3 | S3 | 10 | 10 | 10 | 0 | 0 | 0.5 s | 26.7 s | 0 | 3.7 s | 29.7 s | 0 |
| P3b | princípio 4 | 10 | 10 | 10 | 0 | 0 | 2.6 s | 8.9 s | 0 | 4.7 s | 11.3 s | 0 |
| P4 | S4 | 10 | 10 | 10 | 0 | 0 | 2.0 s | 18.5 s | 0 | 8.8 s | 24.7 s | 0 |
| P5 | S5 | 11 | 5 | 4 | 1 | 6 | 7.0 s | 44.6 s | 1 | 10.3 s | 47.8 s | 1 |

Total do plano (P1 a P10, sem P3b): **43 de 44** sem perda, sem duplicação e com os dois aparelhos iguais ao servidor.
Refeitas por falha de roteiro: **10 de 64** tentativas (15.6 %; limite do plano: 10 %).

## Execuções com falha

- P5 #5 (r2): convergência 44.6 s depois de o app reconectar, acima de 30 s

## Execuções refeitas (falha de roteiro)

- P1 #8 (r2): Maestro p1-a.yaml em A: 
- P1 #8 (r2): Maestro p1-a.yaml em A: 
- P1 #8 (r2): Maestro p1-a.yaml em A: 
- P1 #9 (r2): Maestro p1-a.yaml em A: 
- P5 #2 (r2): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #2 (r2): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #3 (r2): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #5 (r2): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #6 (r2): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #6 (r2): Maestro p5.yaml em A: 

## Com os dois online: tempo até a alteração aparecer no outro aparelho

| Medida | Alterações | Recebidas | Mediana | Pior caso | Acima de 5 s |
| --- | --- | --- | --- | --- | --- |
| medida-online-r3 | 20 | 20 | 0.1 s | 1.2 s | 0 |
