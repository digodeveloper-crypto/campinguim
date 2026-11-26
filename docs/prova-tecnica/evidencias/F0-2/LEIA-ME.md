# Evidências da F0-2 (sincronização offline, item 1 da prova)

25/11/2026 · pane-661 · plano: `docs/prova-tecnica/plano.md`, D, F0-2.

| Arquivo | O que é |
| --- | --- |
| `resultado-F0-2.md` | Resultado da F0-2: resposta curta, tabela final, o que cada cenário conferiu, regras no servidor, correções e o que ficou não confirmado. |
| `tabelas-r1.md`, `tabelas-r2.md`, `tabelas-r3.md` | Tabelas por rodada: por cenário, tentativas, válidas, sem perda, refeitas, convergência mediana e pior caso. **A r3 é a que vale**; r1 e r2 foram interrompidas por excesso de refeitas e levaram às correções. Geradas por `prova/e2e/sincronizacao/resumo.mjs`. |
| `execucoes.jsonl` | Uma linha por execução, **inclusive** as do ensaio (rodada `ensaio`, feitas durante a correção do roteiro e do app, antes da medição) e as refeitas. Cada linha traz o resultado do verificador (casos, alterações por aparelho, chegadas ao servidor, aparelhos iguais ao servidor), os tempos e os problemas encontrados. |
| `medida-online-r3.json` | Com os dois aparelhos online: tempo de 20 alterações de A até aparecerem na tela de B. |
| `p1-dois-emuladores.mp4` | Vídeo de uma execução do P1 (74 s), A à esquerda e B à direita: A em modo avião marca 10 itens, a fila mostra 10; **corte**: o app de A é fechado à força e reaberto pelo link, ainda em modo avião (a gravação fica pausada nesse intervalo, para a tela inicial do Android não aparecer); a fila continua com 10; o modo avião sai e os dois ficam com os 10 "no carro". Verificador da execução: ok. |
| `p9-dois-emuladores.mp4` | Vídeo de uma execução do P9 (53 s): B em modo avião marca 5 itens, o servidor tira B da viagem, B reconecta, as 5 são recusadas, a viagem sai do aparelho de B e o aviso aparece; A continua com a lista sem as marcações de B. Verificador da execução: ok (5 recusadas e avisadas). |
| `p1-1-antes.png`, `p1-2-a-offline-com-fila.png`, `p1-3-depois-de-juntar.png`, `p9-estado-final.png` | Capturas lado a lado (A à esquerda, B à direita) do P1 em três momentos e do estado final do P9, das mesmas execuções filmadas. |

**Como os vídeos e as capturas foram feitos e conferidos (repositório público).** Gravação só da tela dos emuladores (`screenrecord` e `screencap` do próprio Android); barra de status (5 % de cima) e barra de navegação (3 % de baixo) cortadas; avisos flutuantes do sistema desligados durante a gravação; gravação pausada enquanto o app está fechado. Conferência: folha de quadros (1 por segundo) olhada inteira, alguns quadros em tamanho real (início, emenda do P1 e fim) e o brilho médio de **todos** os quadros de cada lado (P1: 1.108 quadros por lado; P9: 792), todos na faixa clara das telas do app, sem nenhum quadro escuro de tela inicial ou de outro app. Metadados: só o nome do codificador; nenhum autor, caminho ou local. Nenhuma tela inicial, ícone ou nome de app de terceiro.
| `testes-servidor.txt` | Saída dos testes automáticos do servidor (regras de conflito, RLS, segunda barreira). |
| `rodada-r1.txt`, `rodada-r2.txt`, `rodada-r3.txt` | Saída do roteiro em cada rodada. |

## Como o verificador decide "sem perda"

`prova/e2e/sincronizacao/verificador.mjs`. Cada toque no app grava a alteração e, na mesma transação, uma linha no registro local do aparelho (`registro_local`, com o identificador da alteração). O servidor guarda cada alteração recebida em `private.sync_change`, com a ordem de chegada. Ao fim de cada execução, para cada alteração de cada aparelho:

1. está no servidor e nos dois aparelhos; ou
2. foi vencida por uma regra da seção 4 da SPEC e o estado final é o que a regra manda (estado de separação mais avançado; última a chegar, com o valor perdido no histórico do item do grupo; remoção vence edição); ou
3. foi recusada por permissão (só no P9) e a pessoa recebeu o aviso.

Fora disso é **perda**. Alteração com efeito duplo (histórico repetido, item repetido) é **duplicação**. Alteração no servidor sem registro em nenhum aparelho é **fantasma**. Por fim, servidor, A e B são comparados tabela por tabela, linha por linha, campo por campo (itens, quem assumiu, histórico, viagens).

## Como medir de novo

Com a pilha no ar (`node prova/prova.mjs subir`):

```
node prova/e2e/sincronizacao/rodar.mjs preparar
node prova/e2e/sincronizacao/rodar.mjs cenarios --rodada r3
node prova/e2e/sincronizacao/rodar.mjs medir-online --rodada r3
node prova/e2e/sincronizacao/rodar.mjs gravar-p1
node prova/e2e/sincronizacao/rodar.mjs gravar-p9
node prova/e2e/sincronizacao/resumo.mjs --rodada r3
```
