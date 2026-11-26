# F0-2 · Sincronização offline (item 1 da prova) · resultado

25/11/2026 · pane-661 (Opus 5.5) · ramo `feature/F0-2-sincronizacao` · plano: `docs/prova-tecnica/plano.md`, D, F0-2 · escopo reduzido H7 (S6 fora; S7 = token vencido durante o offline; telas de duplicado e de juntar fora).

## Resposta curta

- **93 de 93** execuções do plano (P1 a P10; P7 três vezes) **sem perda, sem duplicação e com os dois aparelhos iguais ao servidor** na rodada 3 (segunda rodada de correção). Mais 10 de 10 no P3b (relógios deslocados ±2 h).
- **Refeitas por falha de roteiro: 4 de 107 tentativas (3,7 %)**, abaixo do limite de 10 %.
- **Convergência** (de quando o app volta a alcançar o servidor até servidor, A e B iguais): limite do plano de **30 s para todos os cenários, menos o P7 (2 min)**. Mediana de 0,4 s a 1,9 s nos cenários curtos, pior caso 7,7 s; P7 (200 alterações, token vencido) 12 a 13 s; P8 (envio cortado no meio) 15,4 a 20,8 s. Todos dentro do limite.
- **P8 contado desde o comando que desliga o modo avião: passou de 30 s em 5 de 10 execuções da rodada 3** (30,2; 30,6; 33,1; 33,3 e 34,5 s; as outras 5 ficaram entre 28,6 e 29,9 s). Causa: nesse cenário a contagem começa no primeiro "desligar modo avião", e dentro dela há, de propósito, a espera pelo envio em andamento, o corte da rede no meio do envio (modo avião de novo por 6 s), uma segunda volta do Wi-Fi do emulador e o reenvio. O **atraso artificial de 4 s** do servidor (`private.prova_ajuste`) vale só para o envio que é cortado: ele é desligado logo depois do corte, antes de a rede voltar, então **o reenvio rodou sem atraso**. Contado de quando o app volta a alcançar o servidor, o pior caso do P8 é 20,8 s, dentro dos 30 s.
- **Com os dois online:** 20 de 20 alterações de A apareceram na tela de B; mediana **0,14 s**, pior **1,2 s** (premissa da SPEC: até 5 s).
- **Segunda barreira:** C não recebe nada da viagem de A e B pela sincronização (teste automático, com controle positivo).
- **Vídeos** do P1 e do P9 com os dois emuladores lado a lado, e capturas do estado final: `p1-dois-emuladores.mp4`, `p9-dois-emuladores.mp4`, `p1-*.png`, `p9-estado-final.png` (só a tela do app; como foram feitos e conferidos: `LEIA-ME.md`). As execuções filmadas passaram no verificador.
- O critério de "estável" do plano foi atingido na rodada 3. **Nenhum sinal de troca de tecnologia** (seção I): zero perda e zero duplicação em todas as execuções medidas das três rodadas. Houve convergência acima do limite, **sem perda**, em 2 execuções da rodada 1 (P5 #7 e P3b #6) e 1 da rodada 2 (P5 #5), antes das correções; nenhuma na rodada 3. Em nenhuma execução medida das três rodadas o verificador achou perda, duplicação, alteração fantasma ou diferença entre servidor e aparelhos.

## Tabela da rodada 3 (a que vale)

Arquivo completo: `tabelas-r3.md`.

| Cenário | Base | Tentativas | Válidas | Sem perda | Refeitas | Convergência mediana | Pior caso | Desde o modo avião (pior) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | S1 | 10 | 10 | 10 | 0 | 1,5 s | 2,0 s | 4,0 s |
| P2 | S2 | 10 | 10 | 10 | 0 | 0,5 s | 7,7 s | 12,3 s |
| P3 | S3 | 10 | 10 | 10 | 0 | 0,5 s | 0,7 s | 3,4 s |
| P3b | princípio 4 | 10 | 10 | 10 | 0 | 0,5 s | 1,6 s | 5,0 s |
| P4 | S4 | 13 | 10 | 10 | 3 | 0,5 s | 2,1 s | 7,3 s |
| P5 | S5 | 11 | 10 | 10 | 1 | 0,4 s | 0,9 s | 4,5 s |
| P6 | seção 4, quantidade | 10 | 10 | 10 | 0 | 0,5 s | 1,0 s | 7,5 s |
| P7 | S7 reduzido | 3 | 3 | 3 | 0 | 12,2 s | 13,0 s | 15,1 s |
| P8 | S8 | 10 | 10 | 10 | 0 | 15,9 s | 20,8 s | 34,5 s |
| P9 | S10 | 10 | 10 | 10 | 0 | 0,8 s | 2,1 s | 4,5 s |
| P10 | S9 | 10 | 10 | 10 | 0 | 1,9 s | 2,0 s | 2,0 s |

A execução nº 5 do P4 teve 3 falhas seguidas do Maestro no emulador A; foi refeita depois com `--a-partir 5` e passou (as 3 tentativas contam como refeitas).

### O que cada cenário conferiu, além do verificador

- **P1:** os 10 itens "no carro" no servidor; a fila mostrava 10 antes e **10 depois de fechar o app à força e reabrir** (a fila sobrevive a fechar o app: item 7 da lista de "não confirmado" do plano, agora **confirmado**).
- **P2:** duas linhas em `item_claim` no Item 01, uma de cada família; a família é sempre a de quem envia (o servidor ignora a que o aparelho manda).
- **P3 e P3b:** `in_car` no fim, com B marcando `set_aside` online depois; no P3b, com o relógio de A 2 h adiantado e o de B 2 h atrasado.
- **P4:** 4 execuções com a remoção chegando antes ao servidor e 6 com a edição antes (a ordem alterna pelo número da execução; a nº 5 refeita mudou a conta). Nos dois casos o item ficou removido no servidor, em A e em B, **a quantidade editada por B ficou guardada** e, depois de A restaurar, o item voltou nos dois aparelhos com essa quantidade.
- **P5:** dois itens "isqueiro" com identificadores diferentes.
- **P6:** quantidade final 3 (a de B, que chegou por último); o 2 de A está no histórico do item do grupo (1→2 de A, 2→3 de B).
- **P7:** 200 alterações (40 itens novos e 160 mudanças de separação, quantidade e nota), cada uma na sua transação; reconexão **depois de o token de acesso vencer** (emitido, venceu, reconectou: registrado em cada execução); 200 aplicadas; **nenhuma pausa da tela acima de 250 ms** durante o envio (critério: 1 s).
- **P8:** com um atraso artificial de 4 s no servidor (só da prova, desligado antes do reenvio), a rede de A foi cortada com o primeiro lote de 100 já gravado e a resposta a caminho. Ao reconectar, o app reenviou: **100 reconhecidas como repetidas e ignoradas, 100 aplicadas**, 200 no total, nenhuma duas vezes.
- **P9:** B saiu da viagem com 5 alterações na fila; as 5 foram **recusadas** (`not_member`), nada mudou no servidor, a viagem saiu do aparelho de B e **o aviso apareceu na tela** ("5 alterações suas não foram aceitas…").
- **P10:** sem login, A criou 2 viagens com 5 itens e estados; depois do login, as 2 subiram **com os mesmos identificadores**, A virou dona, itens e estados iguais.

## As três rodadas

| Rodada | O que era | Resultado |
| --- | --- | --- |
| r1 | Primeira medição | Interrompida em P6 porque as refeitas passaram de 10 % (19,4 %). Nenhuma perda nem duplicação; 47 de 48 válidas do plano dentro do critério: a que ficou fora foi de tempo (P5 #7, 38,0 s), e no P3b uma também de tempo (#6, 61,6 s). Causa das refeitas: a tela da lista aberta antes de a viagem chegar não se atualizava (defeito de tela, não de dado). |
| r2 (correção 1) | Tela que se atualiza quando a viagem chega; envio nunca sai sem sessão (achado do P3b) | Interrompida em P5 com 15,6 % de refeitas. 43 de 44 válidas sem perda; a única falha foi de tempo (P5 #5, 44,6 s), sem perda. Causa das refeitas: com o app aberto na lista de outra viagem, o link da viagem nova às vezes não trocava a tela. |
| r3 (correção 2) | Roteiro abre o app do zero pelo link em cada execução | **93 de 93**, 3,7 % de refeitas. |

Antes da medição houve um **ensaio** (rodada `ensaio` em `execucoes.jsonl`), em que foram achados e corrigidos os problemas listados em "Correções feitas no app". O registro bruto do ensaio tem 9 execuções marcadas como "falha"; cada uma está explicada abaixo.

### As 9 falhas do ensaio, uma a uma

Horas em UTC (campo `inicio` de `execucoes.jsonl`). Nenhuma delas foi perda de dado: em todas, a alteração estava guardada no aparelho e chegou ao servidor depois, ou estava no servidor e não chegou ao aparelho a tempo.

| Início | Cenário | O que o registro mostra | Causa | Correção que fechou |
| --- | --- | --- | --- | --- |
| 00:54 | P1 | "A: 10 na fila", não juntou em 30 s | O app de A foi reaberto em modo avião com o token vencido: ao abrir, a sincronização só ligava se a renovação do login desse certo, e offline ela falhava. Além disso, o limite de 30 s era contado desde o modo avião, e o Wi-Fi do emulador sozinho levou ~20 s para voltar. As 10 alterações ficaram na fila e subiram depois (são as 10 da linha seguinte). | Sincronização liga com a sessão guardada, sem depender de renovar antes (commit 3fe99d7); convergência medida de quando o app alcança o servidor. |
| 00:58 | P2 | 10 "FANTASMA trip_item PATCH" | São as 10 alterações do P1 anterior, que chegaram ao servidor durante o P2. Confirmação: o P2 só cria marcações de "assumir" (`item_claim PUT`); as 10 chegadas eram `trip_item PATCH`, exatamente o que o P1 deixou na fila. O verificador daquela versão ainda não filtrava as chegadas pela viagem da execução. | Verificador passou a contar só as chegadas da viagem da execução, e o roteiro passou a esperar a fila dos dois aparelhos esvaziar antes de cada execução (3fe99d7). |
| 01:00 | P3 | "A: 1 na fila", não juntou em 30 s | Mesma origem do P1 das 00:54 (app de A reaberto offline sem religar direito) e espera progressiva da biblioteca de login ao renovar offline (até ~30 s). | Teste rápido do servidor antes de renovar o login e de enviar; convergência medida de quando o app alcança o servidor (3fe99d7). |
| 01:08 | P1 | Juntou em 56,2 s depois da rede voltar | Um ensaio anterior, interrompido no meio do P3b, deixou os relógios dos emuladores deslocados (A +2 h, B −2 h). Com o relógio adiantado, a biblioteca de login achava o token sempre vencido e renovava a cada chamada. | Roteiro confere e corrige o relógio antes de toda execução (3fe99d7). O efeito do relógio no envio foi tratado depois (eb35b36). |
| 01:23 | P1 | Juntou em 56,6 s depois da rede voltar | Relógios já corrigidos; o registro do app mostra "Sync stream connection timed out after 30000ms": uma tentativa de conexão feita com a rede ainda voltando ficou pendurada até o limite de 30 s da biblioteca. | Prazo de conexão de 15 s e nova tentativa a cada 2 s (3fe99d7). |
| 02:12 | P1 | Juntou em 43,0 s depois da rede voltar | A rede voltou para o emulador, mas o app de A só conseguiu conectar ~42 s depois (registro do app: "Failed to connect" seguido). Emulador A ligado havia ~3 h com a máquina carregada (carga 18 dentro dele). | Convergência passou a ser medida de quando o app volta a alcançar o servidor (registro "rede" do app); os dois emuladores foram reiniciados a frio (ver `ambiente.md`). |
| 03:19 | P4 | "A: item qty 2 x 1" depois de 120 s | Depois do modo avião, a conexão de recebimento de A ficou "pendurada": A enviou a remoção, mas não recebeu mais a quantidade editada por B. | Vigia de rede no app, que refaz a conexão de recebimento quando a rede volta (3f558a7). |
| 03:30 | P8 | "A: 200 na fila" depois de 210 s | O vigia pediu para reconectar no meio do envio que tinha sido cortado; a reconexão ficou esperando esse envio, que não terminava, e a sincronização de A parou. | Vigia só reconecta quando não há envio em andamento; cada envio tem prazo de 25 s (reenviar é seguro) (3f558a7). |
| 03:42 | P8 | "A: historico 109 x 0" depois de 210 s | O reenvio já funcionava (100 repetidas ignoradas, 100 aplicadas), mas a reconexão adiada pelo vigia nunca era tentada de novo, e A não recebeu o histórico gerado no servidor. | Reconexão adiada fica pendente e é feita assim que o envio termina (3f558a7). Depois disso, P8 passou nas 10 da rodada 3. |

## Regras de conflito escritas no servidor

Migração `prova/servidor/supabase/migrations/20261125000000_f0_2_sincronizacao.sql` (RLS na mesma migração; o teste de RLS lista as tabelas novas). O app não escreve direto nas tabelas: o conector manda a fila para `public.sync_apply`, que:

1. **ignora repetição** pelo identificador gerado no aparelho (`change_id`, levado no `_metadata` de cada escrita);
2. **recusa** quem não é membro ativo da viagem, sem aplicar nada;
3. aplica a seção 4 da SPEC: `pack_state` concorrente fica com o mais avançado (concorrente = a pessoa mexeu sobre um valor que já tinha mudado no servidor; quem desmarca sobre o valor atual consegue desmarcar); `item_claim` soma; quantidade, nome e nota pela ordem de chegada, com histórico em item do grupo; **remoção vence edição** (`deleted_at` só volta a nulo por pedido explícito de restaurar; a edição fica guardada); itens com o mesmo nome ficam os dois; viagem criada no aparelho sobe com o mesmo identificador e quem envia vira dono e organizador;
4. `updated_at`, `updated_by` e a hora da remoção são sempre do servidor (o relógio do aparelho não decide).

A escrita direta em `trip_item` pela API foi fechada para `authenticated` (as políticas da migração base continuam lá, sem efeito). Testes automáticos: `testes-servidor.txt` (37 de 37, com o banco recriado do zero).

## Correções feitas no app durante a F0-2 (achados reais, não do roteiro)

| Achado | Efeito para quem usa | Correção |
| --- | --- | --- |
| Aberto sem internet e com o token vencido, o app não religava a sincronização sozinho | A fila só subiria ao reabrir o app com rede | Liga a sincronização se houver sessão guardada, sem depender de renovar o token antes |
| Renovação de login offline entrava na espera progressiva da biblioteca (até ~30 s) | Atraso para subir depois de a rede voltar | Teste rápido (2 s) do servidor antes de renovar e de enviar |
| Tentativa de conexão feita com a rede voltando ficava pendurada até 30 s | Atraso de até 30 s | Prazo de 15 s por tentativa e nova tentativa a cada 2 s |
| Depois do modo avião, a conexão de recebimento ficava "pendurada" (o app enviava, mas não recebia mais nada) | O aparelho parava de ver as mudanças dos outros | Vigia de rede: quando a rede volta, refaz a conexão de recebimento (só quando não há envio em andamento; reconectar no meio de um envio prendia tudo, visto no P8) |
| Envio sem resposta (rede cortada no meio) podia não terminar | A fila parava | Prazo de 25 s por envio e 20 s por chamada; reenviar é seguro |
| Com o relógio do aparelho 2 h adiantado, a biblioteca de login achava o token vencido, falhava ao renovar e mandava o envio **sem login** (recusado com "sem permissão") | Atraso; nenhuma perda | O envio nunca sai sem sessão válida; essa recusa é tratada como login vencido (renova e tenta de novo) |
| A lista aberta antes de a viagem chegar continuava dizendo "não está neste aparelho" com os dados já no banco | A pessoa acharia que a viagem sumiu | Enquanto a viagem não aparece, a tela consulta de novo a cada 1,5 s; ao aparecer, refaz as outras consultas. Causa na biblioteca: **não confirmada** |

Recomendação para a base (B1): trocar o vigia de rede por aviso de troca de rede do sistema (NetInfo), o que exige dependência nova (decisão do orquestrador).

## Não confirmado e pontos para o orquestrador

1. **Banco local cifrado (DEF-11):** a biblioteca aceita (opção `encryptionKey`, com SQLCipher no OP-SQLite), mas exige ligar `"op-sqlite": { "sqlcipher": true }` no `package.json` do app (arquivo do orquestrador) e gerar o app de novo. **Não testado no aparelho**: registro "suportado pela biblioteca, não confirmado em execução".
2. **Link com o app já aberto em outra viagem (para a F0-4):** na rodada 2, abrir `campinguim://lista/<outra viagem>` com o app já aberto na lista de uma viagem às vezes não trocou a tela. O roteiro da F0-2 passou a abrir o app do zero; a causa não foi investigada aqui.
3. **Rede do emulador:** depois de desligar o modo avião, o emulador leva de 11 a 24 s (às vezes mais) para devolver a rede ao app, e às vezes o Wi-Fi fica sem endereço (o roteiro religa). Por isso a convergência é medida a partir de quando o app volta a alcançar o servidor, com a medida desde o modo avião ao lado. **Em aparelho real: não confirmado** (validação humana).
4. **Viagem nova criada no servidor** chegou ao aparelho online em 9 a 15 s em medidas avulsas com a máquina carregada (a premissa de 5 s da SPEC é para alteração de membro, medida acima em 0,14 s). Não é critério do plano; fica registrado.
5. **Máquina carregada:** durante as rodadas havia 3 a 4 emuladores ligados (dois de outras tarefas), builds e a missão de vídeos (CPU do computador em ~85 %). As refeitas do Maestro no emulador A vêm disso (ver `ambiente.md`, F0-2).
6. **Ajuste só da prova:** `private.prova_ajuste` (atraso artificial do P8) e `private.sync_change` como registro técnico da ordem de chegada. O registro de chegada também é o que impede repetição (princípio 2), então a tabela tem papel no app; o atraso, não.
7. `auth.jwt_expiry` da prova em 180 s (`config.jsonc`), para o P7.
8. A tela de teste da lista tem botões só da prova ("Gerar 200 alterações", "Medir 20 alterações online", "Tocar") e o login por link `campinguim://entrar?t=<token de renovação>` usado pelos roteiros; nada disso deve ir para a base.
