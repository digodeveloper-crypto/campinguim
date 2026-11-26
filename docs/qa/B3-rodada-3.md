# B3 · motor de regras e catálogo · rodada 3 · APROVADO

Data: 2026-11-26 · Entregue por: pane-700 · Conferido por: QA (pane-689)
Base: cartão da B3; SPEC, seções 5, 6 e 9; as 7 decisões do responsável e a regra final das sobras, decidida pelo orquestrador (26/11/2026); item 1 da `B3-rodada-2.md`; regras do piloto para B2–B6 (a B3 não toca `apps/mobile`, então só o manifesto do APK pode ficar PULADO).
Alvo: worktree `C:\campinguim-wt\B3`, ramo `feature/B3-motor-de-regras`, rebaseado sobre o main `8b97d5f` (que já tem a B6). 7 commits, só locais; autor e quem gravou: noreply.

**Resumo:** o item da rodada 2 foi corrigido: a extensão voltou com 20 m e 5 m. A regra final das sobras está implementada, com testes da sequência inteira. A SPEC teve só acréscimos nas §5 e §9, e o PRD só a linha E1-02. Com a vez do Docker, a suíte passou duas vezes sem falha.

## Suíte local (GIT-10)

| Execução | Comando | Resultado |
| --- | --- | --- |
| Ambiente | `npm run ambiente:zerar` a partir da B3 (veja a observação 1), Node 24.19.0 | banco com 1 migração (a da B1) e 0 tabelas, como deve ser para a B3; 7 contêineres, os de saúde "healthy" |
| 1ª | `npm run testar -- --exigir-servidor` | **0 falhas, exit 0.** Unitários 554 de 557, com 3 PULADOS: **só** o manifesto do APK ("APK ausente"), aceito porque a B3 não toca `apps/mobile`. Servidor 8 de 8; web 2 de 2; tipos 5 de 5; lint, segredos e endereços ok. **564 testes passaram, 0 falharam** |
| 2ª, sem derrubar | o mesmo | igual, exit 0 |

**A etapa pulada é só a do manifesto do APK**, pela regra do piloto: o diff da B3 não toca `apps/mobile`.

## Conferido nas rodadas 2 e 3 (leitura e testes do QA)

| Ponto | Resultado do QA |
| --- | --- |
| 35 casos da §9 | ok. Conferidos asserção por asserção na primeira entrega: L1–L8, C1–C7 ao centavo, A1–A6 contra a tabela da §6, F1–F9, D1–D5. Core 307 de 307 rodado pelo QA na rodada 3 |
| Item 1 da rodada 2 | ok. Extensão com `detalhe` de 20 m (tomada longe) e 5 m (tomada perto); A1 e o caso "perto" conferem. A frase da §5 diz "com o comprimento da seção 6" |
| Regra das sobras | ok. `reduzirQuantidade`: nova = teto(q × 0,75); se nova == q, nova = max(1, q − 1). Testes: 10 → 8, 6, 5, 4, 3, 2, 1, 1; 2 → 1 na segunda sobra; 1 fica 1; aviso "sobrou da última vez" em cada passo. **Defeitos plantados:** sem o "−1", 4 testes falham; com mínimo 0, 6 testes falham |
| 7 decisões | ok (rodada 2): consumíveis (exatamente 10), sinalização, acúmulo, tomada (entra e sai, com metros), não confirmado só informa, 11 categorias com a E1-02, motorhome |
| SPEC/PRD | ok. `--word-diff` contra o main mostra **só acréscimos** "Decidido…" nas §5 e §9 (com a subseção "Sobras") e a linha E1-02 do PRD |
| Catálogo fiel à SPEC | ok. **Defeitos plantados (primeira entrega):** fórmula da lanterna trocada faz 5 testes falharem; chave renomeada na SPEC faz o teste do catálogo falhar |
| Rebase sobre a B6 | ok. `range-diff`: o commit 1 muda só `docs/MUDANCAS.md` e a descrição do `packages/core/package.json`, mantendo os exports `./formato` e `./eventos` da B6 e acrescentando o `@vitest/coverage-v8`; os demais são idênticos, mais 1 commit só de evidência |
| Checagem G | ok. 0 achados no diff e nas mensagens |

## Observações (não reprovam; para o piloto)

1. **Defeito da B1 achado nesta rodada (vai para a B1-FIX-2):** `npm run ambiente:parar`/`zerar` a partir de um worktree **sem** `.env.local` não consegue parar a pilha de sincronização, porque o `docker compose down` exige `PS_DATA_SOURCE_URI` (`${...:?}`) e falha. A pilha de outro worktree (aqui, a da B4) fica no ar, e o `zerar` termina com "2 contêineres ainda rodando", exit 1. O QA contornou parando com a variável só no comando e subindo de novo. Correção sugerida: no `parar`, passar um valor qualquer para o `down`, ou usar `docker compose -p campinguim-sincronizacao down` sem interpolar o arquivo.
2. **Teste instável com a máquina carregada** (já combinado para a B1-FIX-2): `scripts/testes/enderecos.test.ts > endereços fora do arquivo de configuração > a árvore do repositório está limpa`, limite de 5 s do Vitest. Numa primeira tentativa do QA, com a máquina carregada, levou 15,8 s e falhou. Nas duas rodadas registradas acima, passou.
3. Dados para a B4 e a B5: os campos de `docs/regras.md` §6 (inclusive `learning_steps`) e as leituras literais da §4 (por exemplo, com dados e sem valor para o fato de tomada, extensão e adaptador ficam fora).
4. Coautoria "Fable 5.1" nos commits; o squash é do orquestrador.

## Limpeza

- Docker: vez dada pelo piloto, com a B4 e a B5 pausadas. Para a B3, `zerar` a partir da B3; depois, `zerar` a partir da B5 (veja o relatório dela) e `npm run ambiente:parar`: 0 contêineres `campinguim` no fim. O `.env.local` da B3 (ignorado) foi criado pelo `zerar`.
- O emulador não foi usado. Os rascunhos ficaram só na pasta temporária do sistema e foram apagados. O worktree não mudou, só ganhou este relatório.
