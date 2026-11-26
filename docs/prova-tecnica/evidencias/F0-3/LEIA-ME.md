# F0-3 · Lembrete local em modo avião (item 2 da prova técnica)

24 e 25/11/2026 · tarefa F0-3 (pane-666, Sonnet 5.5) · ramo `feature/F0-3-lembrete` (saiu de `feature/F0-1-base`, commit `fb54ca9`).

Contrato: `docs/prova-tecnica/plano.md`, seção D, bloco F0-3. SPEC, seção 10 ("Tocar no aviso abre a tela correspondente, não o início do app") e seção 14.

## Resultado

Versão final do app, emulador temporário `campinguim-c` (porta 5558), Android 16, imagem "Google APIs". **Os casos (a), (b) e (c) fecharam 10 de 10.** Tudo com o modo avião ligado, a permissão de aviso dada pela tela do sistema e o alarme exato concedido pela tela do sistema ("Alarms & reminders").

| Caso | O que testa | Execuções | Aviso chegou | Tocar no aviso abre a viagem | Atraso depois do relógio adiantado (mediana / pior) |
| --- | --- | --- | --- | --- | --- |
| a | app fechado (tirado da lista de recentes) | 10 | 10 de 10 | 10 de 10 | 1,1 s / 1,7 s |
| b | app em segundo plano | 10 | 10 de 10 | 10 de 10 | 1,1 s / 1,8 s |
| c | aparelho reiniciado entre o agendamento e o horário | 10 | 10 de 10 | 10 de 10 | 1,8 s / 3,7 s |
| d | permissão de aviso negada | 5 | não chegou em 5 de 5 (esperado) | — | app sem quebra em 5 de 5 |
| e | **sem** alarme exato, relógio adiantado | 5 | 5 de 5 | 2 de 5 (ver nota) | 16,7 s / 20,5 s |
| e (tempo real) | **sem** alarme exato, sem mexer no relógio | 5 | 5 de 5 | — | 159,1 s / 228,6 s |
| f | "forçar parada" | 3 | não chegou em 3 de 3 (esperado) | — | — |

Aceite do plano: (a), (b), (c) com aviso em até 60 s depois do relógio adiantado, modo avião ligado, tocar abre a viagem → **cumprido**. (d) sem quebra → **cumprido**. (e) atraso medido em 5 execuções, mediana e pior caso → **cumprido** (dois métodos, abaixo). (f) registrado → **cumprido**.

Tabela gerada por `node prova/lembretes/resumo.mjs` a partir dos `caso-*/resultados.json`.

### O que cada número quer dizer

- **Atraso** (a, b, c, e): horário em que o sistema registrou o aviso (`when` em `adb shell dumpsys notification`) menos o instante para o qual o relógio foi adiantado. O relógio vai para 60 s depois do horário do lembrete.
- **Aviso chegou, mas "tocar abre a viagem" 2 de 5 em (e)**: em 3 execuções meu roteiro não conseguiu abrir a barra de avisos do emulador depois de um reinício do sistema dele (a tela ficou no início, sem ícones; captura `caso-e/falha-sem-aviso-na-barra-*.png`). O aviso chegou nas 5. O toque no aviso já está provado em (a), (b) e (c). Em (e) o que se mede é o atraso.

## Achados que o responsável precisa conhecer

**1. Sem alarme exato, o atraso cresce com a antecedência (relevante para H8).**
- O app não pediu a permissão: o sistema agenda um alarme aproximado, com "janela" de 75% do tempo que falta. Para um lembrete 30 min à frente, o `dumpsys alarm` mostra `window=+22m29s` e nenhum `exactAllowReason` (com a permissão: `window=0` e `exactAllowReason=permission`; ver `caso-e/alarme-agendado.txt` e `caso-a/alarme-agendado.txt`).
- **Com o relógio adiantado** (método do plano), o aviso chegou 16,5 a 20,5 s depois (5 execuções; mediana 16,7 s, pior 20,5 s). Esse método não mede a espera real: o alarme já "venceu" quando o relógio pula.
- **Em tempo real** (complemento que fiz, `caso-e-real/`): 5 lembretes com 5, 6, 7, 8 e 9 min de antecedência, app fechado, modo avião ligado, sem mexer no relógio. Atrasos: **5,9 s, 132,5 s, 159,1 s, 200,3 s e 228,6 s** (mediana 159,1 s, pior 228,6 s; avisos e horários pareados pela ordem). Cada aviso saiu entre o horário e o fim da janela de 75% da antecedência (3,75 a 6,75 min).
- Leitura: o atraso máximo é 75% do tempo que falta, e a documentação do Android (plano, B5) diz "até 1 hora" em alarme aproximado. Um lembrete da véspera (18h) agendado dias antes tende ao teto de cerca de 1 hora. **Medi só em emulador com a tela ligada, sem economia de bateria; em celular real o atraso pode ser maior (Doze, economia de bateria). Não medi em aparelho real.**

**2. Aparelho reiniciado: o lembrete volta, mas só se o horário ainda não passou.**
- Depois do reinício o Expo reagenda sozinho. O alarme voltou entre 17 e 30 s depois do boot (10 execuções; medido a partir de uns 8 s depois do `sys.boot_completed`).
- Se o horário do lembrete já tiver passado quando o aparelho religa, **o aviso é descartado, não entregue atrasado**. Vi isso na primeira rodada de (c), em que o roteiro adiantava o relógio antes de o app reagendar: nenhum aviso em 120 s nas 2 execuções. O código do Expo confirma (`ExpoSchedulingDelegate`: "will not trigger in the future, removing"). Na vida real: celular desligado na hora do lembrete = lembrete perdido. Quem decide o que fazer (reagendar ao abrir o app, avisar "você tem lembrete atrasado") é o responsável; eu só registro.

**3. "Forçar parada" cancela tudo (f).** 3 de 3: o alarme do app some do sistema (`caso-f/alarme-antes-e-depois.txt`: antes sim, depois não) e o aviso não chega. É comportamento do Android, não falha do app. Tirar o app da lista de recentes **não** cancela (caso a).

**4. Permissão de aviso negada (d): o app não quebra.** 5 de 5: aparece "Os avisos estão desligados neste aparelho. O lembrete não vai aparecer.", agendar continua funcionando, o aviso não aparece, zero quebras do app no registro. A primeira execução usou a tela real do sistema ("Don't allow", `caso-d/pedido-do-sistema.png`); as outras quatro usaram `pm revoke`.

**5. O primeiro código do app perdia o toque no aviso.** Na primeira versão (ouvinte de toque simples), em duas rodadas de 10 execuções de (a) o toque não abriu a viagem em 2 casos de cada rodada; na segunda delas a captura mostra o app parado na tela inicial (rodadas anteriores, em `tentativas-anteriores/`). Corrigi o app em duas etapas: o gancho em `app/_layout.tsx` passou a navegar só depois de o navegador estar pronto (rodada seguinte: (a) 10 de 10, (b) 10 de 10, mas (c) 9 de 10, com 1 toque que parou no início logo depois do reinício) e `app/+native-intent.ts` passou a abrir a viagem já na partida quando o app estava fechado. Com as duas partes, (a), (b) e (c) fecharam 10 de 10 na versão final. Uma execução de (b), numa rodada intermediária, abriu a tela de lembretes e não a viagem; naquela rodada havia 21 lembretes velhos acumulados no app, e o roteiro passou a limpar tudo antes de cada execução. Não consegui provar a causa dessa única execução.

## Decisão H8 (alarme exato), sem decidir

Números acima. `USE_EXACT_ALARM` **não** é usada (política do Google Play); o app declara `SCHEDULE_EXACT_ALARM` (manifesto final em `manifesto-permissoes.txt`).

| Opção | O que o usuário vê | Resultado medido | Custo |
| --- | --- | --- | --- |
| 1. Pedir o alarme exato | Uma tela do sistema a mais ("Alarms & reminders", uma chave para ligar), além da do aviso (RET-03) | Aviso no horário (atraso de 0,4 a 3,7 s nas 30 execuções de (a), (b) e (c), em emulador) | Fricção a mais no primeiro lembrete; quem recusa cai na opção 2. Exigência do Google Play para declarar `SCHEDULE_EXACT_ALARM`: não confirmado. |
| 2. Aceitar o atraso | Nenhuma tela a mais | Aviso entre o horário e até 75% da antecedência (teto de cerca de 1 h pela documentação); 5,9 a 228,6 s com 5 a 9 min de antecedência; sem medida em celular real | A "véspera às 18h" pode chegar até cerca de 1 h depois |
| 3. Pedir só em parte | Pedir o alarme exato só quando a viagem tem data e o aparelho ainda não concedeu, e deixar passar se a pessoa recusar | Igual à opção 1 para quem aceita e à 2 para quem recusa | Uma regra a mais de produto e de texto |

## Como o relógio foi adiantado

Funcionou **por comando**, sem precisar da tela de Configurações: `adb -s emulator-5558 root` e depois `adb shell date -u @<epoch>` (com `auto_time` desligado por `settings put global auto_time 0`). Funciona porque a imagem "Google APIs" é `userdebug` e permite `adb root` só no emulador `campinguim-c`. O Maestro não foi necessário.

Modo avião: `adb shell cmd connectivity airplane-mode enable` (sem root). O estado é lido com `settings get global airplane_mode_on`.

## Honestidade sobre o caminho

- **Fechar o app em (a).** Nas rodadas anteriores o deslize real do cartão na lista de recentes fechou o app em todas as execuções (a maioria na primeira tentativa, algumas na segunda ou terceira; o roteiro tenta de novo). No fim, o deslize deixou de pegar no emulador (depois dos reinícios dele). Nas 10 execuções finais de (a), o app foi fechado pela remoção da tarefa pelo sistema (`cmd activity stack remove`, a mesma operação que o deslize dispara: mata o app e mantém os alarmes). Cada execução registra o método em `como_fechou`. Conferi que o processo morreu (`pidof` vazio) e que o alarme continuou (`dumpsys alarm`). Não usei "forçar parada" nem `am kill` em (a).
- **Rodadas anteriores** (`tentativas-anteriores/`, só os `resultados.json` e os registros): versões anteriores do app (ouvinte simples; ouvinte com navegador pronto) e do roteiro. Motivos para refazer: perda do toque no aviso (achado 5); o roteiro adiantava o relógio antes do reagendamento depois do reinício (achado 2); o roteiro tocando cedo demais, e a barra de avisos não abrindo; o adb perdendo o aparelho por instantes; o sistema do emulador `campinguim-c` reiniciando sozinho no meio de (e); e o comando que usei primeiro para negar o alarme exato (`appops set` por pacote) não pegar: a primeira rodada de (e) foi inválida (o alarme continuou exato; o certo é `cmd appops set --uid`). Nenhum número dessas rodadas entrou na tabela.
- **Imagens da barra de avisos (rodada 1 do QA).** As quatro `barra-de-avisos.png` das medições mostravam a tela inicial ou uma tela preta: o roteiro fotografava antes de a barra terminar de abrir (o texto das medições dizia que a captura mostrava o aviso; não mostrava). Corrigi o roteiro (`tocarNoAviso`): agora só fotografa depois de ver o texto do aviso na árvore da tela. Troquei as imagens de (a), (b), (c) e (e) por capturas de **uma execução nova de cada caso**, feita com o roteiro corrigido (mesma versão do app, AVD `campinguim-c` recriado igual; permissão de aviso por `pm grant` e alarme exato por `cmd appops set --uid ... allow` nessas execuções extras). As medições das tabelas não foram refeitas e não mudaram; os resultados das 4 execuções extras estão em `tentativas-anteriores/recaptura-das-imagens/` (todas com aviso na barra, modo avião ligado; (a) fechada pelo deslize na lista de recentes). Na primeira dessas execuções extras de (a), logo depois de instalar o app do zero, o horário foi registrado no log do app, mas o alarme não apareceu no sistema e nenhum aviso chegou em 300 s; não se repetiu na execução seguinte e **não investiguei a causa** (fica como observação: primeiro agendamento logo depois de uma instalação nova).
- **Conferência das imagens e do vídeo (repositório público).** Olhei quadro a quadro o vídeo (2 por segundo; e 10 por segundo no ponto do corte) e cada imagem da pasta. Só o início do vídeo tinha tela inicial com ícones de terceiros; foi cortado. As imagens (barras de avisos, telas da viagem, pedido de permissão do sistema, tela de avisos desligados e a captura `falha-sem-aviso-na-barra` do caso (e), que mostra só o papel de parede do emulador, sem ícones) não têm ícone de terceiro. Resta o rótulo "Android System" do próprio Android em avisos do emulador, sem marca de terceiros.
- **Execuções refeitas pelo roteiro** (falha de roteiro, não do app): nenhuma nas rodadas finais de (a), (b) e (c).
- **Uma medida fora do padrão**: na primeira rodada de (b) (app antigo, descartada) uma execução teve atraso de 48,1 s, dentro do limite de 60 s e sem causa conhecida. Não se repetiu nas rodadas finais (todas abaixo de 4 s).

## Limites desta prova

- Emulador x86_64 com tela ligada, sem Doze, com carga de outros testes na máquina. Aparelho real fica para a validação humana (GIT-13).
- Imagem `userdebug` ("Google APIs"), não a imagem de loja. O comportamento de alarmes e avisos é o do Android 16 padrão, mas a economia de bateria de fabricantes (Samsung, Xiaomi) não é coberta.
- Os horários de teste usam o texto da véspera da SPEC e um lembrete 30 min à frente (relógio do aparelho), não o horário real das 18h.
- O banco, a sincronização e o Supabase não entram: o lembrete é local.

## Arquivos

| Pasta ou arquivo | O que tem |
| --- | --- |
| `caso-a/` a `caso-f/`, `caso-e-real/` | `resultados.json` (uma entrada por execução); `alarme-agendado.txt` (alarme no sistema, com `exactAllowReason`); `dumpsys-notification.txt` (registro do aviso, com `when`); `modo-aviao.txt`; `barra-de-avisos.png` (barra de avisos aberta, com o aviso e o ícone de modo avião); `tela-da-viagem.png` |
| `caso-a/caso-a.mp4` | Vídeo de 11,8 s (ffprobe: 11,789 s): barra de avisos aberta, com o ícone de modo avião; o aviso chega e, ao tocar, abre a tela da viagem (execução 1 de (a)). Cortado do original de 19,3 s para começar já na barra de avisos: os primeiros 7,4 s mostravam a tela inicial do emulador com ícones de apps de terceiros (repositório público, sem marcas de terceiros) e foram retirados. |
| `caso-c/alarme-depois-do-reinicio.txt` | O alarme de volta depois do reinício |
| `caso-d/` | Pedido real do sistema (Não permitir) e a tela com a mensagem de avisos desligados |
| `caso-f/alarme-antes-e-depois.txt` | O alarme some depois de "forçar parada" |
| `logs/` | Saída dos roteiros |
| `manifesto-permissoes.txt` | Permissões do app final: sem `USE_EXACT_ALARM`, sem localização |
| `versoes.txt` | Versões usadas |
| `testes.txt` | Saída dos testes (tipos do app e busca por textos soltos) |
| `tentativas-anteriores/` | Rodadas descartadas (acima) |

## Como o QA repete

Passo a passo em `prova/lembretes/LEIA-ME.md` (cria o AVD `campinguim-c`, instala o app, concede as duas permissões pelas telas do sistema e roda `node prova/lembretes/roteiro.mjs <caso> <n>`). Cada caso leva de 5 a 25 minutos; (c) é o mais longo por causa dos reinícios. Use sempre `adb -s emulator-5558` e **nunca** `adb kill-server`, `start-server` nem `reconnect`: o servidor do adb é dividido com o teste de sincronização.
