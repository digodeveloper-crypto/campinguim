# F0-DEC · registro das decisões do responsável · rodada 1 · REPROVADO (1 item: referência errada)

Data: 2026-11-26 · Entregue por: pane-685 · Conferido por: QA (pane-676)
Base: decisão do responsável de 26/11/2026 ("Aceito todas as sugestões"), comparada com a sugestão (b) de cada item do arquivo de sugestões da tarefa F0-DECISOES (D1, D2, D2b, D3, D4 e E1 a E5); pedido do piloto (cada decisão igual à sugestão aceita, nenhum número ou veredito mudado, checagem G, reels fora); `CLAUDE.md`.
Alvo: `C:\campinguim`, ramo `feature/F0-DEC-decisoes`, commit `c942323` sobre `main` `4b08f5a`. 5 arquivos, 93 linhas acrescentadas e 16 tiradas. Não enviado.

## Decisão por decisão

| Nº | Sugestão aceita (b) | Onde foi registrada | Confere |
| --- | --- | --- | --- |
| D1 | Opção B: provisório até a conta do Google Play e o domínio; definitivo = domínio ao contrário | resultado (D1), plano H6 e J12 | ok |
| D2 | Opção 3: pedir o alarme exato só com viagem datada e sem concessão, na tela do RET-03; recusou, segue aproximado e não pede de novo | resultado (D2), plano H8 e J7 | ok. Também registra que `SCHEDULE_EXACT_ALARM` fica na limpeza da B1, como a sugestão diz em (e) |
| D2b | Perda aceita na 0.1.0, sem aviso de atraso; rever com uso real (NF-09) | resultado, plano H8, J7 e nota da F0-3 | ok |
| D3 | Manter 5 min, 1 min e 24 h até a F0-6, em configuração do servidor na B5 | resultado (D3), plano (nota da F0-5), SPEC §15 (3 linhas novas na tabela de premissas, marcadas como provisórias, mais o parágrafo) | ok. O "para o orquestrador" da sugestão (os três valores na tabela de premissas) foi feito |
| D4 | Opção A: contar desde que o app alcança o servidor; repetir o P8 em celular físico na B1 | resultado (D4), plano (nota da F0-2 e tabela I) | ok no conteúdo. **Ver o item 1** |
| E1 | PowerSync auto-hospedado nas 0.x; produção com custo real antes da 1.0.0 | plano B2 e J6, SPEC §15 | ok. Registra que o aceite de contrato do serviço hospedado é do responsável |
| E2 | Celular físico até a 1.6; conta no começo da etapa 1 | plano H11 e J1, SPEC §15 | ok |
| E3 | Docker Desktop confirmado dentro da gratuidade | plano H3 e J13 | ok |
| E4 | O link vence, como foi medido | plano (nota da F0-4) | ok, com os números medidos (3 de 3 e 3 de 3) |
| E5 | RET-01 na feature 2.4 | plano (nota da F0-4) e J3 | ok |

## Conferências

- **Nenhum número nem veredito mudou.** No `resultado.md` só 3 linhas foram alteradas: a abertura (frase acrescentada), a célula do item 1 ("precisa da sua decisão" passou a "decisão D4 registrada") e o título da seção de decisões. O resto é linha nova. Os números citados nas linhas novas são os já aprovados: 11 a 24 s, 3 de 3, 5 min, 1 min e 24 h. Os vereditos do item 1 ("Sim"/"Segue") e a situação INCOMPLETA não mudaram.
- **SPEC:** só acréscimos na seção 15 (3 linhas na tabela de premissas e um parágrafo). Nada foi reescrito.
- **`infra.md`:** só a linha do envio, com o commit `4b08f5a` e o pedido de integração público. O `main` segue sendo o único ramo, o que o QA conferiu depois do envio.
- **`qa/F0-ENVIO-rodada-1.md`:** o blob é igual ao arquivo do QA no disco.
- **Checagem de G nas linhas acrescentadas:** 0 segredos, 0 e-mail pessoal, 0 usuário do Windows e 0 caminho de máquina. A única linha com `run.app`/`pages.dev` é o texto do relatório F0-ENVIO, que descreve a busca. A mensagem do commit está limpa. Autor e quem gravou: noreply.
- **Reels fora:** nem `docs/redes-sociais.md` nem `docs/evidencias/REELS-ep01/` estão no commit.

## Item para corrigir

| # | Onde | Problema | O que fazer |
| --- | --- | --- | --- |
| 1 | `resultado.md`, linha "Decidido pelo responsável em 26/11/2026" da D4 ("…o P8 se repete em celular físico (J3 do plano)"); `plano.md`, linha J3, frase final "O P8 se repete em celular físico na B1 (D4)" | **Referência errada.** O J3 do plano é o ponto do RET-01 (link para quem ainda vai instalar). O P8 é sincronização e não tem relação com ele. Já a "jornada J3" da SPEC (seção 12) é a de lembretes. Do jeito que está, quem abrir o J3 para achar a repetição do P8 cai no RET-01, e a frase do P8 fica dentro da linha errada do plano. A sugestão de origem já trazia esse "(J3 do plano)" na D4, mas aqui ele vira texto de decisão no repositório público | No `resultado.md`, tirar "(J3 do plano)" da linha da D4, ou trocar por algo que exista. No `plano.md`, tirar da linha J3 a frase sobre o P8: ela já está na nota da F0-2 e na tabela I. Commit local no mesmo ramo, citando F0-DEC, e reentrega |

## Observação (não reprova)

- O texto já aprovado do `resultado.md` diz duas vezes "Repetir em celular físico fica para a B1 (jornada J3 do plano)" (em "O que falta", item 2, e em "Limites desta prova"). A "jornada J3" é da SPEC (lembretes), não do plano. O sentido para o lembrete se mantém, mas a origem está errada. Pode ser corrigido junto com o item 1, ou na segunda vez da F0-7.

---

# Rodada 2 · 2026-11-26 · REPROVADO (1 palavra, erro de origem do QA)

Alvo: commit `3a30fcf`, sobre `c942323`. Autor e quem gravou: noreply. São 2 arquivos e 4 linhas.

- **Item 1 corrigido:** "(J3 do plano)" saiu da D4 do `resultado.md`, e a frase do P8 saiu da linha J3 do `plano.md`. Nada mais mudou.
- **Opcional feito:** as duas frases "jornada J3 do plano" agora dizem "jornada J3 da SPEC, seção 12".

**Item que reprova, por erro do próprio QA na rodada 1.** A jornada "J3 Lembretes" está na **seção 13** da SPEC ("Estratégia de testes locais", tabela da linha 876), não na seção 12, que é "Eventos de medição". O relatório da rodada 1 deu "seção 12", e o agente copiou. O que fazer: em `resultado.md`, nas linhas 27 e 103, trocar "seção 12" por "seção 13". Commit local no mesmo ramo, citando F0-DEC.

Correção registrada no texto da rodada 1 deste relatório: onde está "seção 12" (item 1 e observação), leia-se **seção 13**.

---

# Rodada 3 · 2026-11-26 · APROVADO

- Commit `24db99a`, sobre `3a30fcf`, com autor e quem gravou no noreply. Muda só o `resultado.md`, em 2 linhas: "seção 12" passou a "seção 13" nas duas citações da jornada J3. A tabela "J3 Lembretes" fica mesmo na seção 13 da SPEC.
- Nada mais mudou. Os reels continuam fora do ramo (`docs/redes-sociais.md` modificado e `docs/evidencias/REELS-ep01/` não rastreado, os dois fora dos commits).
- **F0-DEC aprovada.** Ramo `feature/F0-DEC-decisoes`, commits `c942323`, `3a30fcf` e `24db99a`, mais o commit deste relatório. Integração por squash, com pedido de integração. Antes do push, a regra é a mesma: só o `main` recebe a integração.
