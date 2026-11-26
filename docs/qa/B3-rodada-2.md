# B3 · motor de regras e catálogo · rodada 2 · REPROVADO (1 item: a extensão perdeu o comprimento de 20 m / 5 m)

Data: 2026-11-26 · Entregue por: pane-700 · Conferido por: QA (pane-689)
Base: cartão da B3; SPEC, seções 5, 6 e 9; as 7 decisões do responsável de 26/11/2026, repassadas pelo orquestrador; limite de edição dado pelo orquestrador (SPEC só nas seções 5 e 9, com frases "Decidido pelo responsável em 26/11/2026"; PRD só na linha E1-02).
Alvo: worktree `C:\campinguim-wt\B3`, ramo `feature/B3-motor-de-regras`, ponta `bc15670` (commits `e90b74a`, `860d4da`, `84760ba` e `bc15670`), sobre `9138aa1`. Só local; autor e quem gravou: noreply. **Ainda não rebaseado** sobre o main `87d5c1b`, que já tem a B1-FIX.

Primeira entrega (`e90b74a`): o QA conferiu o conteúdo e não deu veredito, porque faltava o ambiente (B1-FIX e a vez do Docker). Os 35 casos da §9 batiam asserção por asserção com a SPEC, e os defeitos plantados (fórmula da lanterna, chave da SPEC) foram pegos. Esta rodada confere as 7 decisões.

## Testes rodados pelo QA

| Comando | Resultado |
| --- | --- |
| `vitest run --project core` (Node 24.19.0) | **305 de 305**, 9 arquivos, exit 0 |
| Suíte completa (`npm run testar -- --exigir-completa`) | **não rodada nesta rodada:** falta o rebase sobre `87d5c1b` e a vez do Docker. Fica para a rodada de aprovação |

## As 7 decisões

| # | Decisão | Resultado do QA |
| --- | --- | --- |
| 1 | Consumíveis | ok. `consumivel=true` em exatamente 10 itens: `agua`, `gas`, `gelo`, `carvao`, `sacos_lixo`, `papel_hig`, `papel_toalha`, `fraldas`, `lencos` (lenços umedecidos) e `racao`. Um teste compara com a frase da SPEC |
| 2 | Redução de 25% com teto; sinaliza quando não muda | ok. Há teste, e o aviso "sobrou da última vez" está no catálogo de textos |
| 3 | Acumula até o mínimo de 1 | ok ao pé da letra, com teste. **Conflito entre as decisões 2 e 3, enviado ao orquestrador:** com teto, `teto(3 × 0,75) = 3` e `teto(2 × 0,75) = 2`, então a quantidade nunca passa de 3 para baixo, e o "mínimo de 1" só vale para o que já é 1. O ajudante implementou a leitura literal (o item fica sinalizado) e registrou a dúvida em `docs/regras.md` §4. **Não é falha do ajudante** |
| 4 | Com dados: tomada presente → entram extensão e adaptador; ausente → saem | **falha no item 1.** A entrada e a saída estão certas, com teste para perto e longe em qualquer tensão, sem tomada, sem energia e fato não confirmado. Mas o comprimento da extensão foi retirado |
| 5 | Fato não confirmado de nível ajuste só informa | ok. Teste com tomada e piscina não confirmadas: nada entra |
| 6 | 11 categorias; PRD E1-02 | ok. Só a linha E1-02 do PRD mudou, com a marca da decisão |
| 7 | Motorhome leva mesa, cadeiras, grelha e carvão | ok. `when` desses 4 inclui `motorhome`; `balde` e `cintas` continuam só em barraca com carro; a mochila (L8) não mudou. Há teste |

## Limite das edições em SPEC e PRD

ok. `git diff main...HEAD -- docs/SPEC.md docs/PRD.md`:
- SPEC: 4 trechos, todos na §5 (Categorias, Consumíveis, Tipos de viagem, Depende do camping, Aprendizado) e na §9 (depois da tabela A). Todos são acréscimos "Decidido pelo responsável em 26/11/2026", e nenhuma frase anterior foi reescrita.
- PRD: só a linha E1-02.
- As tabelas da §6 e a linha A1 da §9 **não mudaram**.

## Item para corrigir

| # | Onde | Problema | Evidência | O que fazer |
| --- | --- | --- | --- | --- |
| 1 | `packages/core/src/alertas.ts` (efeito `metros` retirado), `packages/core/src/alertas.test.ts` (A1 e A6) e a frase nova da §5 da SPEC ("Depende do camping") | A extensão que entra por ajuste perdeu o comprimento. A SPEC continua dizendo `extensao` de 20 m com tomada longe e de 5 m com tomada perto (§6, linhas `energia_tomada`), e a A1 da §9 diz "`extensao` de 20 m". Nenhuma das 7 decisões tira o comprimento: a decisão 4 só diz quando a extensão e o adaptador entram ou saem. O teste A1 agora **exige** `detalhe: null`, o oposto da tabela da A1. A frase "Decidido" acrescentada na §5 ("'Tomada longe' é o alerta sobre a extensão e não muda a entrada") atribui ao responsável algo que ele não decidiu, e pode ser lida como "sem comprimento" | `git diff e90b74a HEAD -- packages/core/src/alertas.test.ts`: a linha com `detalhe: { qty: 20, unidade: 'metro' }` virou `detalhe: null`, e no caso "perto" o `{ qty: 5, unidade: 'metro' }` saiu. Em `alertas.ts` saíram `metros: 20` e `metros: 5` | Voltar o comprimento: com tomada longe, a extensão entra com 20 m; com tomada perto, com 5 m (`detalhe` em metros, como na rodada 1). O adaptador entra como está. A1 e o caso "perto" voltam a conferir 20 m e 5 m. Na frase da §5, ficar só com o que foi decidido, por exemplo: "com dados, camping com tomada (perto ou longe da barraca, qualquer tensão) faz entrar `extensao` (com o comprimento da seção 6) e `adaptador`; sem tomada na área de barracas, os dois saem". Se o orquestrador decidir que o comprimento deve sair, a reprovação cai, mas a decisão tem de vir dele |

## Observações (não reprovam)

1. **Rebase:** a rodada de aprovação precisa da ponta rebaseada sobre `87d5c1b`. Depois, o QA pede a vez do Docker e roda `npm run testar -- --exigir-completa`; só o manifesto pode ficar PULADO, porque a B3 não toca `apps/mobile`.
2. **Conflito com a B6 no rebase:** as duas mexem em `packages/core/package.json`, e a B3 também em `packages/core/src/index.ts`.
3. **Dados para a B4 e a B5:** o modelo de dados ganha `trip_item.learning_steps` e os campos de `docs/regras.md` §6.
4. **Leitura literal com dados e sem valor para o fato de tomada:** a extensão e o adaptador ficam fora. Fica registrado na §4 de `docs/regras.md`, para o orquestrador.

## Limpeza

O QA não usou Docker nem emulador e não deixou arquivo temporário. O worktree não mudou, só ganhou este relatório.
