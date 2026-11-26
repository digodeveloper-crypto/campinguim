# F0-3 · lembrete local em modo avião · rodada 1 · REPROVADO (1 item, só de evidência)

Data: 2026-11-25 · Entregue por: pane-666 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, D, F0-3 (casos, aceite e evidência), B5 e G; SPEC, seção 10 ("Tocar no aviso abre a tela correspondente, não o início do app"); PRD E1-08 e RET-03; `CLAUDE.md`.
Alvo: worktree `C:\campinguim-wt\F0-3`, ramo `feature/F0-3-lembrete`, commit `2dfa308` (sobre `fb54ca9`), 64 arquivos. Só local.

As medições não precisam ser refeitas. O item que reprova é a evidência: as capturas chamadas `barra-de-avisos.png` não mostram a barra de avisos.

## Aceite do plano

| Critério | Resultado do QA |
| --- | --- |
| (a), (b) e (c): 10 de 10, aviso em até 60 s depois do relógio adiantado, modo avião ligado | ok. **Recalculado pelo QA direto dos `resultados.json`**, sem usar o `resumo.mjs`: (a) 10/10, atraso de 0,8 a 1,7 s, mediana 1,05 s; (b) 10/10, de 0,7 a 1,8 s, mediana 1,1 s; (c) 10/10, de 0,7 a 3,7 s, mediana 1,75 s. Em toda execução: `aviao_ligado` e `aviao_no_momento_do_aviso` verdadeiros, e relógio adiantado exatamente 60 s depois do horário. O atraso recalculado (`when` menos o relógio adiantado) bate com o registrado (uma diferença de 0,1 s é só de arredondamento). Em (c), o alarme voltou depois do boot nas 10 execuções, entre 17 e 30 s depois. Nenhuma execução foi refeita pelo roteiro nas rodadas finais |
| O `when` é a hora em que o aviso saiu, não a hora agendada | ok. Em (a), execução 1: agendado para `…707959`, relógio adiantado para `…767000` e `when=…768684`. Se o Expo gravasse o horário agendado, o atraso sairia −60 s |
| Alarme exato concedido em (a), (b) e (c) | ok. `alarme-agendado.txt` de (a), (b) e (c): `window=0 exactAllowReason=permission`, e o `origWhen` é o mesmo da execução 1. Em (e): sem `exactAllowReason`, com `window=+16m27s` e `+22m25s` |
| Tocar no aviso abre a tela da viagem, não o início | ok. Em (a), (b) e (c), `id_na_tela` é o id da viagem de teste nas 30 execuções. O vídeo mostra o toque abrindo "Viagem" com o identificador. A tela diz "Esta viagem não está neste aparelho" porque a prova não sincroniza; o que se prova aqui é a rota |
| (d) sem quebra | ok. 5/5, 0 quebras do app no registro. A 1ª execução negou pela tela real do sistema (captura com "Don't allow"), e as outras 4 usaram `pm revoke`. A tela mostra "Os avisos estão desligados neste aparelho…" |
| (e) atraso medido em 5 execuções, mediana e pior caso | ok. Com o relógio adiantado: 16,5 a 20,5 s, mediana 16,7 s. Em tempo real: 5,9 a 228,6 s, mediana 159,1 s. A entrega diz com clareza que o relógio adiantado não mede a espera real e que, para a véspera agendada dias antes, o teto é de cerca de 1 h. A opção H8 fica com o responsável, e a entrega não decide |
| (f) registrado | ok. 3/3: alarme presente antes e ausente depois de "forçar parada", e nenhum aviso |
| `USE_EXACT_ALARM` fora, sem localização | ok. Manifesto: `SCHEDULE_EXACT_ALARM` sim, `USE_EXACT_ALARM` não, localização não. Teste 4 de `configuracao.test.mjs` |
| Relógio adiantado por comando | ok, e registrado: `adb root` + `date -u @epoch`, na imagem "Google APIs" `userdebug`. O Maestro não foi preciso |

## Conferências do QA

- **Testes rodados pelo QA** (Node do sistema, v24.19.0): `tsc --noEmit` exit 0; `node --test prova/servidor/testes/configuracao.test.mjs`: 5 de 5, exit 0.
- **O APK testado é o do commit.** `app-release.apk` foi gerado às 23:08:20, depois da última mudança em `_layout.tsx` e `+native-intent.ts` (23:06:36), e antes das rodadas finais (a partir de 23:31). O pacote JS do APK contém `redirectSystemPath`, `getLastNotificationResponseAsync`, `useLastNotificationResponse` e o texto da véspera. `run.app`: 0. A única ocorrência de `sb_secret` é o prefixo literal de uma biblioteca, sem nenhuma chave depois.
- **Pastas:** só `prova/` e `docs/prova-tecnica/evidencias/F0-3/`. Nenhum arquivo fora delas.
- **Textos:** os novos ficam em `src/textos.ts`, e o do aviso é o da SPEC §10, linha "Véspera", palavra por palavra.
- **Checagem de G no commit:** autor e quem gravou só com o noreply. Nos arquivos do commit, 0 de cada: usuário do Windows, e-mail pessoal, `C:\Users`, `AppData`, caminho do worktree, `run.app`, JWT, `service_role`, chave privada e senha. Os PNG têm só os blocos `IHDR`, `sBIT`, `sRGB` e `IEND`, sem texto. O MP4 tem só a marca de tempo e `com.android.version=16`.
- **Limpeza:** o AVD `campinguim-c` foi apagado (só restam `campinguim-a` e `campinguim-b`). O `adb devices` mostra só 5554 e 5556, que são da F0-2.
- **Fechar o app em (a):** nas 10 execuções finais, o app foi fechado por `cmd activity stack remove`, e a entrega diz isso. A prova de que tirar o app da lista de recentes mantém o lembrete está nas rodadas anteriores com o deslize real, as únicas que o roteiro tinha naquela época. `build-2-listener/caso-a`: aviso em 10 de 10, toque 10 de 10; `tentativa-2-caso-a`: aviso em 10 de 10. O `+native-intent` age na abertura a frio, que é igual pelos dois caminhos. Aceito, com a observação 2.

## Item que reprova

| # | Onde | Problema | O que fazer |
| --- | --- | --- | --- |
| 1 | `caso-a/`, `caso-b/`, `caso-c/` e `caso-e/barra-de-avisos.png`; tabela "Arquivos" do `LEIA-ME.md` da evidência | **Nenhuma das 4 capturas mostra a barra de avisos**, e o plano pede essa captura como evidência. (a) e (c) mostram a tela inicial do emulador. (b) mostra a tela inicial, com só o texto "Campinguim prova" pequeno na barra de status. (e) é uma tela preta. A causa está no roteiro (`roteiro.mjs`, linhas 235–237): a captura sai 1,2 s depois de `expand-notifications`, sem esperar o aviso aparecer na tela. Num repositório público, um arquivo chamado "barra de avisos" que não mostra a barra engana quem confere. O vídeo de (a) mostra a barra aberta com o aviso e o avião, então a prova existe, mas não nesses arquivos | (1) Trocar `caso-a/barra-de-avisos.png` por um quadro do `caso-a.mp4` com a barra aberta e o aviso à vista, entre 10 e 14 s (`ffmpeg -ss <s> -i caso-a.mp4 -frames:v 1 …`). (2) Em (b), (c) e (e): apagar as capturas ou trocar o nome para o que mostram. Não é preciso refazer as execuções. (3) No roteiro, capturar só depois de `esperarNaTela` achar o texto do aviso, para quem repetir sair com a captura certa. (4) Corrigir a tabela "Arquivos" do LEIA-ME da evidência e a duração do vídeo: são 19,3 s, não 16 s (`ffprobe`). Commit local no mesmo ramo, citando F0-3 |

## Observações (não reprovam)

1. **Marcas de terceiros nas capturas e no vídeo.** A tela inicial do emulador aparece com os ícones e nomes do Gmail, Photos, YouTube, Chrome e da busca do Google, além do papel de parede padrão. É tela do sistema, não uso no produto. Mas o repositório é público, e o plano, em G, cita "conteúdo de terceiros" como risco. As capturas novas do item 1 já resolvem as de (a), (b), (c) e (e), se enquadrarem a barra de avisos aberta. **Para o piloto:** decidir antes do envio se o vídeo fica como está ou se é cortado para começar na barra aberta.
2. **Deslize real contra remoção pelo sistema.** O roteiro final não prova o deslize, prova a remoção da tarefa. A frase "mesma operação do deslize" é afirmação do agente: não está confirmada em documento, e o QA não conferiu no código do Android. O efeito que importa foi conferido: processo morto sem a parada forçada e alarme mantido, e as rodadas anteriores com deslize real deram aviso 10 de 10. Na B1 ou na jornada J3, repetir com deslize real num celular físico.
3. **As rodadas finais de (a), (b) e (c) rodaram com uma versão anterior do `roteiro.mjs`.** Os `resultados.json` não têm `tipo_do_alarme` e `janela_do_alarme`, campos que o roteiro do commit grava. O critério é o mesmo, e o alarme exato está provado pelo `alarme-agendado.txt` da execução 1. Quem repetir vai ver campos a mais.
4. **Para o responsável (já está na entrega):** com o aparelho desligado no horário, o lembrete é descartado, não entregue atrasado. E o teto de cerca de 1 h sem alarme exato vale para a véspera. As duas coisas entram na decisão H8 e na B1, e os números servem para decidir. Medido só em emulador com a tela ligada, sem Doze.
5. **RET-03:** a tela da prova pede a permissão por botão. A regra "pedir só quando o primeiro lembrete é criado" fica para a feature 1.6.

---

# Rodada 2 · 2026-11-25 · REPROVADO (1 item, uma linha)

Alvo: commit `178e500`, sobre o `2dfa308`, com 10 arquivos. Autor e quem gravou: noreply.

**O que passou:**
- **As 4 imagens agora mostram a barra de avisos aberta.** O QA viu as 4 lado a lado: aparece o aviso "Campinguim · Amanhã é dia de camping…", o ícone do avião e o relógio adiantado (2:37 a 2:40). Não aparece nenhum ícone de aplicativo de terceiros, o que também resolve a observação 1 para as imagens.
- **As imagens vêm de 4 execuções novas, não das medidas, e a entrega diz isso.** Os resultados estão em `tentativas-anteriores/recaptura-das-imagens/`:
  - (a): 0,5 s, alarme exato, **fechado pelo deslize real** na lista de recentes, toque abre a viagem. Isso reforça a observação 2.
  - (b): 0,3 s.
  - (c): 3,1 s, com o alarme de volta 13 s depois do boot.
  - (e): 16,1 s, com janela de +22m29s.
  - As tabelas não mudaram.
- **Roteiro:** em `tocarNoAviso`, a captura só sai depois que o texto do aviso aparece na árvore da tela.
- **LEIA-ME:** o item novo em "Honestidade" reconhece o erro e explica a troca.
- **Checagem de G nos arquivos alterados:** 0 achados.
- **Limpeza da F0-3:** o AVD `campinguim-c` foi apagado. Sobrou um `campinguim-d` e um `emulator-5560` offline. Não são desta tarefa, porque a F0-3 só usa o `c` e a porta 5558. Ficam para o piloto conferir de quem são.

**Item que reprova:**

| # | Onde | Problema | O que fazer |
| --- | --- | --- | --- |
| 1 | `docs/prova-tecnica/evidencias/F0-3/LEIA-ME.md`, linha 84 | Diz "Vídeo de 16 s". O `ffprobe` dá **19,3 s**. Essa correção era a parte (4) do item 1 da rodada 1 e não foi feita | Trocar para "Vídeo de 19 s". Commit local no mesmo ramo, citando F0-3 |

**Observação nova, para o piloto (não reprova):** a entrega relata que, no primeiro agendamento logo depois de instalar o app do zero, o horário foi para o log, mas **o alarme não apareceu no sistema e o aviso não chegou** em 300 s. Na execução seguinte funcionou. É um lembrete perdido sem nenhum sinal para a pessoa, justo no momento em que ela cria a primeira viagem. A causa não foi investigada, e o resultado dessa execução não foi guardado (só o texto descreve). **Na B1 (feature 1.6):** conferir depois de agendar que o lembrete está mesmo na lista de agendados, e cobrir com teste o primeiro agendamento logo depois de instalar. Vale registrar como ponto J no `resultado.md`.

---

# Rodada 3 · 2026-11-25 · APROVADO

- Commit `8c1575b`, com autor e quem gravou no noreply. Muda só uma linha do `LEIA-ME.md` da evidência: "Vídeo de 19 s", que bate com o `ffprobe` (19,26 s). Nada mais mudou, e o worktree está limpo.
- **F0-3 aprovada.** Ramo `feature/F0-3-lembrete`, commits `2dfa308`, `178e500` e `8c1575b`, só locais.
- **Para o orquestrador:**
  - **Observação 1, marcas de terceiros no vídeo:** decidir antes do envio se o começo do vídeo é cortado. As imagens já estão limpas.
  - **Observação 2, deslize real:** já reforçada pela recaptura de (a), que fechou o app pelo deslize real.
  - **Observação 4, para H8 e B1:** o lembrete é descartado se o aparelho estiver desligado no horário, e sem alarme exato o teto é de cerca de 1 h.
  - **Observação nova da rodada 2:** o primeiro agendamento depois de uma instalação nova se perdeu sem sinal para a pessoa. Na B1, conferir depois de agendar e testar esse caso, como ponto J no `resultado.md`.
  - **Emuladores que não são da F0-3:** sobraram o AVD `campinguim-d` e o `emulator-5560` offline.

---

# Conferência extra (pedido do piloto: nenhuma marca de terceiro) · 2026-11-25 · APROVADO

- Commit `39aef77`, com autor e quem gravou no noreply. Mudam só `caso-a/caso-a.mp4` e o `LEIA-ME.md` da evidência. O worktree está limpo.
- **Vídeo:** o `ffprobe` dá 11,789 s, igual ao texto ("11,8 s"). Os metadados têm só o `encoder=Lavf`. O QA olhou o vídeo inteiro em 2 quadros por segundo, 24 quadros. Ele começa na barra de avisos aberta, com o avião. O aviso "Campinguim · Amanhã é dia de camping…" chega, um quadro de transição preto e outro claro abrem o app, e a tela "Viagem" aparece com o identificador. Nenhum quadro da tela inicial nem ícone de terceiro.
- **Imagens:** são 10 no git, e o QA olhou todas. As 4 da barra de avisos, as 3 da tela da viagem, as 2 do caso (d) e a `falha-sem-aviso-na-barra` do caso (e) não têm ícones nem nomes de aplicativos de terceiros. A de falha mostra só o papel de parede padrão do emulador e a barra de status. Em `tentativas-anteriores/` não há imagem nem vídeo.
- **Histórico:** o commit local `2dfa308` ainda guarda o vídeo original e as imagens antigas com os ícones. Como o plano manda (PROPOSTA 3), o `main` recebe um único commit `F0: prova técnica`, por squash. **Os ramos da F0 não devem ser enviados ao GitHub commit a commit.**
