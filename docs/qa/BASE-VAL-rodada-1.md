# BASE-VAL · rodada 1 · APROVADO

- Data: 2026-11-27. QA: pane-689. Ajudante: pane-737. Pedido do orquestrador (pane-547).
- Alvo: ramo `feature/BASE-VAL-validacao-da-base`, ponta `0ac3a63`, sobre `main` `675bcbe`. Dois commits locais (`0038698`, conteúdo; `0ac3a63`, evidências), sem push.
- O que a feature faz: registra a validação humana da Base e as decisões V1 a V11 do responsável (27/11/2026), copia a conferência final do QA e fixa os três valores decididos (faixas, canais e o botão do Google).

## 1. Testes (rodados por mim, Node 24.19.0)

| Comando | Resultado |
| --- | --- |
| `npm run ambiente:subir` | exit 0 |
| `npm run testar -- --exigir-completa` (1ª) | exit 1: **só** `apps/mobile/src/dados/__testes__/ferramentasDeDesenvolvimento.test.ts`, 4 testes com estouro do limite de 5 s. Rodada fria (229 s). O arquivo não foi tocado pela BASE-VAL. Sozinho, passa em 326 ms (observação 4) |
| `npm run testar -- --exigir-completa` (2ª) | **SUÍTE COMPLETA, 7 de 7**, exit 0 (107 s). Unitários com 713, servidor 109/109, web 2/2 e manifesto do APK sem pulo |
| Defeito plantado: `'other'` acrescentado a `CANAIS_PADRAO` | O teste novo da lista fechada falha (1 de 87). Restaurado |
| Defeito plantado: último limite das faixas trocado para 200000 | 6 testes da faixa falham. Restaurado |

- A fumaça não foi rodada. A BASE-VAL só troca o valor de uma chave de texto que nenhuma tela usa hoje, e o nome de uma constante. O APK foi gerado pelo ajudante, e o manifesto passou na suíte.
- Árvore limpa ao fim. Ambiente parado com 0 contêineres. Emulador não usado. Temporários apagados.

## 2. Conferências pedidas

| Ponto | Resultado |
| --- | --- |
| Relatório copiado idêntico | ok. O sha256 de `docs/qa/BASE-conferencia-final.md`, no disco e no commit, é igual ao do original (`5724de19…af1e`); `cmp` não acha diferença |
| Nenhum texto comum ou legal escrito (V5, V6) | ok. O `pt-BR.json` do app tem 1 linha alterada (`entrar.comGoogle`). O da web não mudou. Os legais continuam `[PENDENTE]` |
| Só as marcas decididas saíram (V3, V4, V10) | ok. `[PENDENTE]` no app: de 55 para 54 textos (mais a linha `_leia`, que explica a marca); na web, 6. `MARCA_PENDENTE`/`ehPendente` intactos. `_PADRAO_PENDENTE` sumiu do código; só aparece nos docs para registrar o nome antigo |
| Chaves de texto intactas | ok. As mesmas 420 chaves, com o mesmo resumo da lista antes e depois |
| Testes intactos | ok. Só `eventos.test.ts` mudou: troca de nome da constante e um teste a mais. A lista fechada vale exatamente, cada canal é aceito e `site_content` é recusado. O teste dos limites `[5000, 15000, 50000, 150000]` segue igual. Nenhum outro `*.test.*`, nada em `e2e/`, `supabase/` ou `apps/web/` |
| Comportamento dos eventos | ok. Fora da lista padrão de canais (o que a V4 pede), só mudaram nomes e comentários. `validarEvento` e `faixaDeValor` têm a mesma lógica, e a lista por configuração (`canais`) continua valendo |
| Frase do `regras.md` sobre a conciliação (V1) | ok. Em §3, §4 (linha 2 e 3) e "Dúvida resolvida": "proposta pelo orquestrador em 26/11/2026 e confirmada pelo responsável em 27/11/2026". A regra (`teto(qty × 0,75)`, `max(1, qty − 1)`) é idêntica. A decisão 26/11 dos consumíveis continua como estava |
| `SPEC.md` só com registro | ok. 1 linha (§9, "Sobras"): só a atribuição mudou, e a fórmula e a sequência são idênticas. Correção certa, porque a SPEC repetia a mesma frase do `regras.md` |
| V2, as 7 escolhas visuais | ok. Em `DESIGN.md`: §3.4 (gorro), §4.4 (palavra que não cabe), §14 linhas 1, 2 e 4, §15 D-2, D-5 e D-7. Em `componentes.md` §7.1: as 6 linhas (D-2, D-5, D-7, P-1, P-2 e P-4); a tabela só tem essas. Em §7.2: só "Erro (D-5)" e "Palavra que não cabe", e as demais linhas ficam sem marca, com nota explícita. **Correto**: nada foi marcado além das 7. As demais linhas da §14 e as linhas D-1, D-3, D-4 e D-6 da §15 seguem abertas |
| V7, V8, V9, V11 | ok. Em `resultado.md`, parágrafos acrescentados depois de D1, depois de D3 e no item 4, sem mexer no histórico; o item 4 segue INCOMPLETO. `servidor.md` §12 e `regras.md` §4 ganharam uma linha de confirmação cada. A V9 está só no `decisoes-da-base.md` |
| `decisoes-da-base.md` | ok. V1 a V11, cada uma "Decidido pelo responsável em 27/11/2026". T0 a T13 com a feature ou o momento de cada uma. Tabela de onde cada decisão foi registrada. Os R1 a R8 do meu relatório têm destino: R1 em V7; R2 em V9; R3 em V2; R4 em V5, V6 e V10; R5 em V3, V4 e na observação 1; R6 em V1; R7 em V11; R8 em V8 |
| Checagem G no diff inteiro | limpa. Nenhum segredo, e-mail, nome real, usuário do Windows nem `C:\Users`; `run.app`, `pages.dev` e `workers.dev` só aparecem no texto da checagem. `app-gerar.txt` foi reduzido às linhas finais, sem caminho da máquina. O pré-commit passou nos dois commits |

## 3. Observações (não impedem)

1. **Limites de sanidade e fila de eventos.** O `textos-e-eventos.md` §7 tinha estes itens como "confirmar" (4) e "decidir na 2.2" (6). Agora traz "Fica como está: decisão técnica da B6, registrada na validação da Base de 27/11/2026". O `decisoes-da-base.md` traz o mesmo parágrafo dentro da V4, numa seção que abre com "Todas decididas pelo responsável". Nenhuma das 11 decisões fala desses dois pontos. O texto diz "decisão técnica da B6", não do responsável, e não é regra de negócio. **Orquestrador: confirme que foi você quem mandou registrar assim.** Se não foi, os itens 4 e 6 voltam a pendentes, o que é uma frase em cada arquivo. O item 3 (códigos em inglês) segue como "confirmar ou trocar" no §7 e "seguem como a B6 deixou" no `decisoes-da-base.md`; as duas frases são coerentes.
2. Comentário em `packages/core/src/aprendizado.ts` linha 7: "Decidido em 26/11/2026 (regra final das sobras): a redução acumula…". Não diz quem decidiu e fala da acumulação, que foi do responsável (decisões 2 e 3). Pode ficar.
3. O README ganhou uma linha com o link para `decisoes-da-base.md`, e `MUDANCAS.md` ganhou a linha da BASE-VAL. Isso está certo.
4. **Pendência técnica nova (T14):** `ferramentasDeDesenvolvimento.test.ts` (da B1-FIX-2) estourou o limite padrão de 5 s nos 4 testes na primeira rodada fria da suíte, sob carga. Sozinho, leva 326 ms, e na rodada seguinte passou. É a mesma classe do teste de endereços que a B1-FIX-2 resolveu com limite próprio. Não vem desta feature. Para a manutenção da esteira: limite próprio nesses testes ou import aquecido.

## 4. Veredito

**APROVADO.** A feature registra as 11 decisões sem escrever texto comum ou legal e sem mexer em regra além da lista de canais que a V4 pede. Tira só as marcas decididas, mantém as chaves e reforça os testes. O relatório do QA está idêntico.
