# F0-4 · App abrindo na viagem por link (item 3 da prova técnica)

25/11/2026 · tarefa F0-4 (pane-673, Sonnet 5.5) · ramo `feature/F0-4-link` (saiu de `feature/F0-3-lembrete`; a ponta do F0-3, commit `39aef77`, foi trazida por merge antes da rodada de fumaça).

Contrato: `docs/prova-tecnica/plano.md`, seção D, bloco F0-4; seções B6 e C; J3. SPEC, seções 2 (linha "App abrindo em uma viagem por link") e 14, e o "endereço provisório no desenvolvimento".

## Resultado

Emulador temporário **`campinguim-d`** (porta **5560**, Android 16, API 36, imagem "Google APIs" x86_64, Pixel 4a), app em build `release`. O `campinguim-c` (5558) estava em uso pelo teste do lembrete (F0-3) quando comecei; criei o meu com outro nome e porta, como o piloto confirmou. Rede ligada em todos os casos de link (os de lembrete da fumaça rodam em modo avião, como no F0-3).

| Caso | O que testa | Execuções | Viagem certa na tela | Quebrou | Tempo do toque até a tela da viagem |
| --- | --- | --- | --- | --- | --- |
| a | link `campinguim://viagem/<id>`, app fechado (abertura a frio) | 10 | **10 de 10** | 0 | mediana **721 ms**, pior **988 ms**, melhor 530 ms |
| b | mesmo link, app aberto em outra tela (início, links e lembretes, em rodízio) | 10 | **10 de 10** | 0 | mediana 51 ms, pior 82 ms |
| b (segundo plano) | mesmo link, app em segundo plano (tecla início) | 10 | **10 de 10** | 0 | mediana 169 ms, pior 232 ms |
| c | viagem que **não existe** no aparelho: 4 combinações (esquema e https × fechado e aberto), 10 execuções | 10 | mensagem "Esta viagem não está neste aparelho." em **10 de 10** | 0 | a frio 630 ms (mediana); com o app vivo 45 ms |
| c (id inválido) | `campinguim://viagem/isto-nao-e-uma-viagem` | 1 | mensagem "O link não traz uma viagem válida." | 0 | — |
| d | **link https** `https://campinguim.test/viagem/<id>` com o vínculo forçado (`pm set-app-links … 2`); o `am start` não diz o pacote, quem escolhe é o Android; 5 fechado + 5 aberto | 10 | **10 de 10** (sempre `com.campinguim.prova/.MainActivity`, sem pergunta) | 0 | a frio 626 ms (mediana), pior 755 ms; com o app vivo 46 ms |
| e | link https **sem** vínculo | 5 | o app **não** abre | 0 | — |

Aceite do plano: (a), (b) e (d) abrem a viagem certa em 10 de 10 → **cumprido**. (c) mostra mensagem clara sem quebrar → **cumprido**. Tempo do toque até a tela medido em (a) → **cumprido** (mediana 721 ms, pior 988 ms, em emulador). (e) registrado → **cumprido** (abaixo).

Tabela gerada por `node prova/links/resumo.mjs` (`resumo.md`) a partir dos `caso-*/resultados.json`. "Viagem certa" = o identificador e o nome na tela (lidos da árvore de telas do Android, `viagem-id` e `viagem-nome`) são os da viagem do link, medido nas 3 viagens de teste em rodízio; a execução só conta se o registro do aparelho também não mostra falha do app (`FATAL EXCEPTION`, ANR, processo morto).

### Como o tempo foi medido

No próprio aparelho, com o mesmo relógio: `t0=$(date +%s%3N)` na mesma linha de comando do `am start -W` (sem o atraso do adb); o app escreve `VIAGEM_TELA id=… epoch_ms=…` no registro quando a tela da viagem ficou pronta (viagem achada no banco do aparelho, ou a mensagem de "não encontrada"). Tempo = `epoch_ms` − `t0`. O `TotalTime` do próprio `am start -W` (a frio) fica em `resultados.json` (`am_start_total_ms`; casos (a): 384 a 741 ms). Emulador x86_64 com a tela ligada e outras cargas da máquina (dois outros emuladores, Docker e uma fábrica de vídeos): **em celular real o número será outro**.

### Comandos usados (exemplos reais)

```
# (a) esquema próprio, a frio (am-start-1.txt de cada caso tem a saída completa)
adb -s emulator-5560 shell "t0=$(date +%s%3N); am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d 'campinguim://viagem/1f0a0b00-0000-4000-8000-00000000f401'; echo T0=$t0; echo T1=$(date +%s%3N)"
  -> Status: ok · LaunchState: COLD · Activity: com.campinguim.prova/.MainActivity · TotalTime: 402 (execução 1)

# (d) https, sem dizer o pacote
adb -s emulator-5560 shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d 'https://campinguim.test/viagem/1f0a0b00-0000-4000-8000-00000000f401'
  -> Status: ok · LaunchState: COLD · Activity: com.campinguim.prova/.MainActivity · TotalTime: 523  (caso-d/am-start-1.txt)
```

## Caso (d): o vínculo forçado

`caso-d/pm-get-app-links.txt` (saída de `adb shell pm get-app-links com.campinguim.prova`):

| Momento | Estado do domínio `campinguim.test` |
| --- | --- |
| Logo depois de instalar (o Android tentou verificar sozinho, `autoVerify`) | `1024` — a verificação não terminou com sucesso (o domínio não existe nem serve `assetlinks.json`; é o esperado, o domínio é de teste). Leitura minha do código: faixa de erro do verificador, não conferi o significado na documentação. |
| Depois de `pm set-app-links --package com.campinguim.prova 2 campinguim.test` e `pm set-app-links-user-selection --user 0 --package com.campinguim.prova true campinguim.test` | `approved` |

Com o vínculo aprovado, o link https abriu o app direto, sem pergunta, em 10 de 10. O arquivo do app que declara o filtro: `manifesto-links.txt` (filtro `https` · `campinguim.test` · `/viagem`, com `autoVerify="true"`, gerado do `app.config.ts` da F0-1; o endereço vem do único valor de configuração, `prova/config/enderecos.json`).

**Ponto de atenção.** `cmd package resolve-activity --brief` (em `caso-d/resolucao.txt`) devolveu `ResolverActivity`, enquanto o `am start` real abriu o app direto nas 10 execuções. Não investiguei a diferença (o comando de consulta pode não aplicar a regra de "link aprovado pelo usuário"); o que vale é o que o `am start` fez.

## Caso (e): link https sem vínculo — o que o Android faz

Antes (`caso-e/antes.txt`): vínculo zerado (`pm set-app-links … 0`, `pm reset-app-links`), estado do domínio `none`. Depois, `am start` do mesmo link https, 5 vezes, com o app fechado antes de cada uma:

- **Abriu o navegador do emulador (Chrome) direto, sem perguntar com qual app abrir, em 5 de 5.** O app do Campinguim **não** abriu e não ficou na frente (`app_ficou_na_frente: false`, 5 de 5). Saída: `Activity: com.android.chrome/…FirstRunActivity` (primeira abertura do Chrome do emulador), foco da janela em `foco-1.txt`.
- `pm query-activities` (`caso-e/resolucao.txt`) lista as duas atividades que declaram o link: o app e o navegador. Mesmo assim o Android mandou para o navegador, porque o vínculo do app não estava aprovado. É o comportamento esperado do Android recente para link https não verificado (vai ao navegador padrão); não conferi o trecho exato na documentação nesta tarefa.
- Consequência para o produto: **sem o `assetlinks.json` publicado e verificado (ou o usuário aprovar o link nas configurações do app), o link https da viagem abre no navegador**, não no app. Isso é a parte que fica fora desta prova (abaixo) e precisa de decisão de como o site trata esse caso (página do convidado, SPEC seção 14 e feature 2.4).
- Por regra do repositório público, **não guardei imagem** deste caso (a tela do navegador do emulador mostra a marca de outro app). A evidência é a saída dos comandos e a árvore de telas em texto (`tela-1.xml`).

## O que o roteador fez sozinho

O Expo Router abriu a rota `/viagem/<id>` tanto para o esquema próprio quanto para o https sem eu escrever código de tratamento de link: ele pega só o caminho da URL (`extractExpoPathFromURL` em `expo-router/build/fork/extractPathFromURL.js`). O `+native-intent.ts` do F0-3 (abre a viagem do aviso na partida a frio) **não foi alterado**. Testei o encontro dos dois caminhos (abaixo) e nenhuma mudança foi necessária.

## Fumaça do lembrete (tocar no aviso ainda abre a viagem)

Depois de trazer a ponta do F0-3 para este ramo, com o app da F0-4 e o roteiro do F0-3 sem mudança (`node prova/lembretes/roteiro.mjs`, só com o emulador trocado por `CAMPINGUIM_SERIAL`), permissões de aviso e de alarme exato dadas por comando no `campinguim-d` (`pm grant` e `appops set --uid`; no F0-3 foram pelas telas do sistema; aqui o objetivo é só a fumaça):

| Caso | Execuções | Aviso chegou (modo avião ligado) | Tocar no aviso abre a tela da viagem | Atraso depois do relógio adiantado |
| --- | --- | --- | --- | --- |
| a (app fechado pela lista de recentes) | 5 | 5 de 5 | **5 de 5** | 0,3 a 0,4 s |
| b (app em segundo plano) | 5 | 5 de 5 | **5 de 5** | 0,2 a 0,3 s |

Saídas em `fumaca-lembrete/caso-a/` e `caso-b/` (alarme, `dumpsys notification`, modo avião, barra de avisos, tela da viagem) e `logs/fumaca-lembrete-*.log`. A tela aberta pelo aviso é a da viagem de teste do F0-3 (`…0000c3`), que não existe neste aparelho, por isso a mensagem de "não encontrada" aparece junto: o que se prova é que abriu a **tela da viagem** e não o início. O caso (c) do lembrete (reiniciar o aparelho), de 5 a 25 minutos por rodada, **não foi repetido** nesta fumaça.

**Encontro entre aviso e link** (os dois entram pelos mesmos pontos do app):

- Depois da fumaça (a), com o processo do app morto, link a frio: `caso-a-depois-da-fumaca-a`, **3 de 3** na viagem do link (não na do aviso).
- Depois da fumaça (b), com o app vivo e a resposta do aviso ainda guardada na memória: link com o app aberto, `caso-b-depois-da-fumaca-b`, **3 de 3** na viagem do link (o ouvinte do aviso não puxa de volta para a viagem do aviso).

## Achados e tentativas que falharam

1. **Emulador.** `campinguim-c` (5558) estava em uso pelo F0-3. Criei `campinguim-d` (5560; mesma imagem, Pixel 4a, 2 GB de RAM, GPU ligada). Memória livre antes de compilar: 4,9 GB; antes de subir o emulador: 11,8 GB. Nunca rodei `kill-server` nem `start-server`; todos os comandos usam `-s emulator-5560`. Ao terminar, o emulador é desligado e o AVD apagado.
2. **Primeiro build falhou:** `SDK location not found` (a pasta `android` nova não tinha `local.properties`, que não é versionado). Copiei o do F0-3 e refiz.
3. **Primeiro app instalado abriu quebrado** (`supabaseKey is required`, erro do cliente do Supabase na partida): o worktree novo não tinha `prova/.env.local` (não versionado, só a chave pública do Supabase local) e o `app.config.ts` leva a chave para dentro do build. Copiei o arquivo do F0-3 e refiz o build; a primeira tentativa de criar as viagens de teste falhou por isso. Nenhuma rodada numerada foi feita com o app quebrado.
4. **Rodada de teste do roteiro** (3 execuções do caso (a), antes das rodadas finais) passou 3 de 3 e foi apagada; as rodadas finais são as da tabela, sem execução refeita por falha de roteiro (nenhuma execução foi repetida).
5. **Fechar o app.** Nos casos de link, "app fechado" = tarefa removida pelo sistema (`cmd activity stack remove`, a mesma operação do deslize na lista de recentes; o deslize no emulador foi instável no F0-3), com "forçar parada" só como último recurso. Conferido por `pidof` vazio antes de cada abertura. O método usado em cada execução está em `como_preparou` (`resultados.json`); nas rodadas finais foi sempre a remoção da tarefa.
6. **Caso (e) sem imagem** (regra de evidência do repositório público).

## Limites desta prova

- Emulador x86_64, imagem "Google APIs" `userdebug` com Chrome. Não foi testado em celular real (GIT-13) nem com outros navegadores ou "abrir com…" de fabricantes.
- O vínculo do caso (d) foi **forçado por comando**. A verificação automática (`autoVerify`) do domínio **não** foi provada: precisa de domínio publicado com `/.well-known/assetlinks.json` (B6, C). O domínio de teste `campinguim.test` não existe. Fora da prova, como o plano diz.
- O link que abre a viagem depois de **instalar o app pela loja** (RET-01, parte "para quem ainda vai instalar") continua fora (J3, proposta: feature 2.4). A prova cobre RET-01 só na parte "app já instalado".
- As viagens de teste vêm de uma tela da prova (`campinguim://links?semear=1`) que grava no banco local do aparelho; não passam pela sincronização nem pelo servidor. O que se prova é abrir a viagem certa do banco do aparelho pelo identificador do link.
- Tempos em ms são de emulador com carga de outros testes.

## Arquivos

| Pasta ou arquivo | O que tem |
| --- | --- |
| `caso-a/`, `caso-b/`, `caso-b-fundo/`, `caso-c/`, `caso-d/`, `caso-e/` | `resultados.json` (uma entrada por execução); `resumo.json`; `am-start-1.txt` (primeira saída completa do `am start -W`); `tela-1.xml` (árvore de telas da primeira execução); `tela-da-viagem.png` (primeira execução; só tela do app); `caso-c/id-invalido/`; `caso-d/pm-get-app-links.txt` e `resolucao.txt`; `caso-e/antes.txt`, `foco-1.txt`, `resolucao.txt` |
| `caso-a-depois-da-fumaca-a/`, `caso-b-depois-da-fumaca-b/` | encontro entre aviso e link (acima) |
| `caso-semear/links-viagens-de-teste.png` | tela da prova com as 3 viagens de teste e os dois links de cada |
| `fumaca-lembrete/` | fumaça do lembrete (acima) |
| `resumo.md` | tabela por caso |
| `manifesto-links.txt` | filtros de link do app e estado de verificação do domínio |
| `versoes.txt`, `testes.txt` | versões; tipos do app (`tsc`, saída 0), busca de endereço fora da configuração e de texto solto |
| `logs/` | saída dos roteiros |

## Como o QA repete

`prova/links/LEIA-ME.md`. Resumo: criar um AVD próprio (nunca `campinguim-a`, `-b` nem o `-c` do F0-3), instalar o app, `node prova/links/roteiro.mjs semear`, depois `a`, `b`, `b-fundo`, `d`, `c` e `e` com `CAMPINGUIM_SERIAL=<serial>`.

## Imagens e vídeos: conferência

Todas as imagens desta pasta foram abertas e conferidas uma a uma: são telas do app (viagem, links) e duas barras de avisos que mostram só o aviso do Campinguim e avisos do próprio sistema Android; nenhuma mostra a tela inicial do emulador, ícone ou marca de app de terceiros. Não há vídeo.
