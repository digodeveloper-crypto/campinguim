# F0-2 · tabelas de resultado (r1)

Gerado por `prova/e2e/sincronizacao/resumo.mjs` em 2026-11-25T07:23:41.906Z a partir de `execucoes.jsonl`.

Tentativas = todas as execuções, inclusive as refeitas por falha de roteiro. Válidas = tentativas menos as refeitas. Convergência = do momento em que o app do último aparelho reconectado volta a alcançar o servidor (registro "rede" do app) até servidor, A e B iguais e sem fila; no P10, do login. Limite do plano: 30 s (só o P7: 2 min). As três últimas colunas medem desde o (primeiro) comando que desliga o modo avião: incluem o tempo que o emulador leva para devolver a rede ao app e, no P8, o corte proposital da rede no meio do envio (ver resultado-F0-2.md).

| Cenário | Base | Tentativas | Válidas | Sem perda | Com falha | Refeitas | Convergência (mediana) | Pior caso | Acima do limite | Desde o modo avião (mediana) | Desde o modo avião (pior) | Acima do limite desde o modo avião |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | S1 | 10 | 10 | 10 | 0 | 0 | 1.1 s | 2.4 s | 0 | 3.1 s | 4.5 s | 0 |
| P2 | S2 | 10 | 10 | 10 | 0 | 0 | 0.9 s | 6.0 s | 0 | 4.7 s | 9.9 s | 0 |
| P3 | S3 | 10 | 10 | 10 | 0 | 0 | 0.7 s | 18.7 s | 0 | 3.2 s | 21.7 s | 0 |
| P3b | princípio 4 | 10 | 10 | 9 | 1 | 0 | 3.9 s | 61.6 s | 1 | 6.1 s | 63.4 s | 1 |
| P4 | S4 | 10 | 10 | 10 | 0 | 0 | 2.7 s | 7.0 s | 0 | 9.3 s | 15.9 s | 0 |
| P5 | S5 | 18 | 8 | 7 | 1 | 10 | 6.0 s | 38.0 s | 1 | 9.7 s | 41.5 s | 1 |
| P6 | seção 4, quantidade | 4 | 0 | 0 | 0 | 4 | — | — | 0 | — | — | 0 |

Total do plano (P1 a P10, sem P3b): **47 de 48** sem perda, sem duplicação e com os dois aparelhos iguais ao servidor.
Refeitas por falha de roteiro: **14 de 72** tentativas (19.4 %; limite do plano: 10 %).

## Execuções com falha

- P3b #6 (r1): convergência 61.6 s depois de o app reconectar, acima de 30 s
- P5 #7 (r1): convergência 38.0 s depois de o app reconectar, acima de 30 s

## Execuções refeitas (falha de roteiro)

- P5 #1 (r1): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #1 (r1): Maestro p5.yaml em B: Element not found: Id matching regex: novo-nome | Element with Id matching regex: novo-nome not found. Check the UI hierarchy in debug artifacts to verify if the element exists.
- P5 #2 (r1): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #6 (r1): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #6 (r1): Maestro p5.yaml em A: 
- P5 #6 (r1): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #8 (r1): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #10 (r1): Maestro p5.yaml em A: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #10 (r1): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P5 #10 (r1): Maestro p5.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P6 #1 (r1): Maestro p6-a.yaml em A: 
- P6 #1 (r1): Maestro p6-b.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P6 #1 (r1): Maestro p6-b.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.
- P6 #2 (r1): Maestro p6-b.yaml em B: Assert that id: lista-nome is visible... FAILED | Assertion 'id: lista-nome is visible' failed. Check the UI hierarchy in debug artifacts to verify the element state and properties.

## Com os dois online: tempo até a alteração aparecer no outro aparelho

| Medida | Alterações | Recebidas | Mediana | Pior caso | Acima de 5 s |
| --- | --- | --- | --- | --- | --- |
| medida-online-r3 | 20 | 20 | 0.1 s | 1.2 s | 0 |
