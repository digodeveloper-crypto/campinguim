# Resultado da prova técnica (F0)

25/11/2026 · tarefa F0-7, primeira vez · plano: `docs/prova-tecnica/plano.md` (seções D, G, I e J) · SPEC, seção 2 (fim) e tabela "Prova técnica e base" da seção 14.

**Situação da prova: INCOMPLETA.** Os itens 1, 2 e 3 estão medidos e conferidos pelo QA. O item 4 está **PENDENTE**: a parte local está provada (F0-5), a parte da faixa de teste (F0-6) espera a conta de desenvolvedor do Google Play, que o responsável deixou para depois (24/11/2026). A prova só será dada como completa depois da F0-6 e da segunda vez desta tarefa.

**Onde o trabalho está (26/11/2026):** a junção dos ramos da prova está pronta e aprovada pelo QA (ramo `feature/F0-integracao`, só local, seção "Junção dos trabalhos"). A prova continua INCOMPLETA só pelo item 4. **Os itens 1, 2 e 3 foram validados pelo responsável em 26/11/2026.** As decisões D1 a D4 e a do lembrete descartado estão registradas em 26/11/2026, na seção "Decisões do responsável".

Regra deste documento: só entra número que o QA conferiu. Onde não há número, está escrito "não medido". Os caminhos de evidência são relativos à raiz do repositório e valem no ramo `feature/F0-integracao` (conferência na seção "Junção dos trabalhos").

## Para o responsável

### O que foi provado

Tudo rodou em dois celulares virtuais (emuladores Android) e num servidor local, na máquina de desenvolvimento. Nenhum serviço externo foi criado para a prova.

| Item | O que se queria saber | Resposta | Conferido pelo QA |
| --- | --- | --- | --- |
| 1. Sincronização offline | Dois aparelhos mexem na mesma lista sem internet e, ao reconectar, ficam iguais, sem perder nem duplicar nada | **Sim.** 93 de 93 execuções do plano sem perda e sem duplicação, mais 10 de 10 com os relógios dos aparelhos errados em 2 horas. Uma contagem de tempo (P8): decisão D4 registrada em 26/11/2026 | sim, depois de uma reprovação e uma correção |
| 2. Lembrete em modo avião | O lembrete aparece sem internet, com o app fechado e com o relógio adiantado | **Sim**, desde que o app peça a permissão de "alarme exato". Com ela, o aviso aparece de 0,7 a 3,7 segundos depois da hora, em 30 de 30 vezes. Sem ela, atrasa (D2) | sim, depois de duas correções só de evidência |
| 3. App abrindo na viagem por link | Tocar num link abre o app direto na viagem certa | **Sim.** 10 de 10 nos três modos pedidos (app fechado, app aberto, link `https` com o vínculo forçado). Um limite importante: sem o arquivo de verificação do site, o link `https` abre o navegador | sim, de primeira |
| 4. Chamada recusada sem verificação do aparelho | O servidor recusa quem não prova que o aparelho e o app são de verdade | **Parte local provada, parte da loja pendente.** O servidor recusa tudo o que deve recusar (testes e mutações conferidos). Falta o teste com um app instalado pela faixa de teste do Google Play | parte local sim; parte da loja não existe ainda |

### O que falta

1. **Item 4, faixa de teste (F0-6).** Precisa da conta de desenvolvedor do Google Play (taxa, contrato, identidade, celular Android físico), do projeto no Google Cloud ligado à verificação e de um celular físico. Sem isso o item 4 não fecha e a prova não é completa.
2. **Celular de verdade.** Tudo foi medido só em emulador. Repetir em celular físico fica para a B1 (jornada J3 da SPEC, seção 13). Os números abaixo são de emulador com a máquina carregada; em celular real serão outros.
3. **Entrada no repositório público.** A junção dos ramos da prova (F0-2 a F0-5) está feita e aprovada, mas só existe na máquina; nada foi enviado ao GitHub. Ela entra no `main` só por squash, num único commit "F0: prova técnica", pela PROPOSTA 3 do plano (seção "Junção dos trabalhos"). Isso não depende de você agora.

### O que você precisa validar (itens 1, 2 e 3)

**Validados pelo responsável em 26/11/2026: itens 1, 2 e 3.** A tabela abaixo fica como registro do que foi olhado.

A decisão de 24/11/2026 diz que a base (B1) pode começar sem a conta do Google Play, com o item 4 pendente. Isso **não dispensa** a sua validação dos itens 1 a 3. O que olhar, em poucos minutos cada:

| Item | O que ver | Onde |
| --- | --- | --- |
| 1 | Os dois vídeos com os dois celulares lado a lado. No primeiro (P1), o celular da esquerda marca 10 itens sem internet, o app é fechado e reaberto, e depois os dois mostram os 10. No segundo (P9), o celular da direita é tirado da viagem enquanto está offline, e ao reconectar as 5 alterações dele são recusadas e ele recebe um aviso | `docs/prova-tecnica/evidencias/F0-2/p1-dois-emuladores.mp4`, `docs/prova-tecnica/evidencias/F0-2/p9-dois-emuladores.mp4` |
| 2 | O vídeo do lembrete: barra de avisos aberta, ícone de modo avião, o aviso "Amanhã é dia de camping" chega e, ao tocar, o app abre na tela da viagem. O vídeo prova o caminho (abrir a viagem e não o início), não o conteúdo da viagem: a prova não sincroniza, por isso a tela diz "Esta viagem não está neste aparelho" | `docs/prova-tecnica/evidencias/F0-3/caso-a/caso-a.mp4`, `docs/prova-tecnica/evidencias/F0-3/caso-a/barra-de-avisos.png` |
| 3 | As telas da viagem abertas por link e a tela de testes de links com as viagens de exemplo e os dois links de cada | `docs/prova-tecnica/evidencias/F0-4/caso-a/tela-da-viagem.png`, `docs/prova-tecnica/evidencias/F0-4/caso-semear/links-viagens-de-teste.png` |

Se algo não bater com o que você esperava de cada item, diga qual e eu volto ao caso. Se bater, a validação humana dos itens 1 a 3 fica registrada pelo piloto.

### Decisões do responsável (registradas em 26/11/2026)

**D1. Nome definitivo do pacote Android (H6).** Hoje o app da prova usa o nome provisório `com.campinguim.prova`. O nome que for usado quando o app for criado no Google Play fica preso a ele para sempre.

| Opção | Consequência |
| --- | --- |
| A. Escolher agora o nome definitivo (formato sugerido no plano: `br.com.<domínio>.campinguim`) | O formato do plano depende de um domínio, e o PRD diz que os domínios ainda não foram registrados |
| B. Manter o provisório até a F0-6 e a B1 | Nada trava agora. O definitivo é obrigatório antes de criar o app no Google Play (F0-6) |

**Decidido pelo responsável em 26/11/2026:** opção B. Fica o provisório `com.campinguim.prova` até existir a conta do Google Play e o domínio; a B1 usa um nome provisório marcado. O definitivo sai do domínio que ele registrar, escrito ao contrário (por exemplo, `campinguim.com.br` vira `br.com.campinguim`), e tem de estar fixado antes de criar o app no Google Play.

**Decidido pelo responsável em 27/11/2026 (V7, validação da Base):** a conta de desenvolvedor do Google Play só será aberta perto do lançamento 1.0.0. Por isso o nome definitivo do pacote (D1) fica adiado até lá e `com.campinguim.prova` segue como o nome provisório. Registro em `docs/decisoes-da-base.md`.

**D2. Alarme exato para o lembrete (H8).** Por padrão, o Android 13 ou mais novo **não** concede o "alarme exato" a um app novo. Com a permissão, o aviso sai na hora. Sem ela, o Android pode atrasar. Medi os dois casos (emulador, tela ligada, sem economia de bateria; **não medido em celular real**).

| Opção | O que a pessoa vê | Número medido | Custo |
| --- | --- | --- | --- |
| 1. Pedir o alarme exato | Uma tela do sistema a mais ("Alarmes e lembretes", uma chave para ligar), além da do aviso | Aviso de 0,7 a 3,7 s depois da hora, em 30 de 30 execuções, com o app fechado, em segundo plano e depois de reiniciar o aparelho | Um passo a mais no primeiro lembrete. Se o Google Play exige alguma declaração para o app usar essa permissão: não confirmado |
| 2. Aceitar o atraso | Nenhuma tela a mais | Em tempo real, com lembretes marcados 5 a 9 minutos à frente: de 5,9 s a 228,6 s depois da hora (mediana 159,1 s, pior 228,6 s). O atraso máximo é de 75% do tempo que falta. Pela documentação do Android, o teto é de cerca de 1 hora; a "véspera às 18h" agendada com dias de antecedência tende a esse teto | O lembrete da véspera pode chegar até cerca de 1 hora depois |
| 3. Pedir só em parte | Pedir o alarme exato só quando a viagem tem data e o aparelho ainda não o concedeu; deixar passar se a pessoa recusar | Igual à opção 1 para quem aceita e à 2 para quem recusa | Uma regra a mais de produto e de texto |

Junto com esta decisão: **se o aparelho estiver desligado na hora do lembrete, o lembrete é descartado**, não entregue atrasado (visto na primeira rodada do caso de reiniciar, quando o relógio foi adiantado antes de o app reagendar; o código do Expo confirma: "will not trigger in the future, removing"). Para o produto isso significa que um celular desligado às 18h da véspera não avisa. Decidir se o app reagenda ou avisa "você tem lembrete atrasado" ao abrir é regra de produto, fica com você.

**Decidido pelo responsável em 26/11/2026 (D2):** opção 3. O app pede o alarme exato só quando a viagem tem data e o aparelho ainda não o concedeu, dentro da tela explicativa que a SPEC já manda mostrar antes do pedido de notificação (RET-03). Se a pessoa recusar, o app segue com o lembrete aproximado e não pede de novo. Para a B1: a limpeza de permissões (ponto 9) mantém `SCHEDULE_EXACT_ALARM`; a regra e o texto novo entram na feature 1.6.

**Decidido pelo responsável em 26/11/2026 (lembrete descartado com o aparelho desligado):** aceitar a perda na primeira versão (0.1.0), sem aviso de atraso, e registrar como limite conhecido. Rever depois do primeiro uso real, com os eventos de medição (NF-09). Para a B1: nenhuma regra nova; a feature 1.6 documenta o limite.

**D3. Tempos da verificação do aparelho (item 4).** A SPEC diz só "por tempo limitado". Os três valores abaixo são **suposições da prova**, não decisões:

| Valor | Usado na prova | Para que serve |
| --- | --- | --- |
| Idade máxima do comprovante enviado pelo app | 5 minutos | Comprovante mais velho é recusado |
| Tolerância de relógio para o futuro | 1 minuto | Comprovante datado depois de agora, até esse limite, ainda vale |
| Validade da marca "aparelho verificado" | 24 horas | Dentro desse prazo o aparelho não precisa provar de novo |

Opções: manter os três valores até a F0-6 e decidir com o teste real, ou fixar já outros valores. Não há número medido que favoreça um valor: a prova só verificou que a recusa funciona com o prazo vencido.

**Decidido pelo responsável em 26/11/2026:** manter os três valores (5 minutos, 1 minuto e 24 horas) até a F0-6, como premissas numéricas provisórias, e decidir de novo com um token real. Para a B5: os três ficam em configuração do servidor, para mudar sem nova versão do app.

**Decidido pelo responsável em 27/11/2026 (V11, validação da Base):** os tempos definitivos da verificação do aparelho são decididos na feature 3.7, com proposta do ajudante; até lá valem os três valores acima, como premissas. Registro em `docs/decisoes-da-base.md`.

**D4. Como contar o tempo do cenário P8 (envio cortado no meio).** O plano diz que, depois de reconectar, os dois aparelhos devem ficar iguais ao servidor em até 30 segundos. O P8 corta a rede no meio de um envio e reenvia. Dois jeitos de contar dão respostas diferentes:

| Contagem | Resultado no P8 (10 execuções da rodada final) |
| --- | --- |
| Desde o comando que desliga o modo avião | **Passou de 30 s em 5 de 10** (30,2; 30,6; 33,1; 33,3 e 34,5 s). As outras 5 ficaram entre 28,6 e 29,9 s |
| Desde o momento em que o app volta a alcançar o servidor | Pior caso 20,8 s. **Todas dentro de 30 s** |

A diferença vem do emulador: depois do modo avião ele leva de 11 a 24 s para devolver a rede ao app, e o P8 ainda inclui, de propósito, o corte de 6 s no meio do envio. Em nenhuma execução houve perda ou duplicação. **Não confirmado em aparelho real.** Opções:

| Opção | Efeito |
| --- | --- |
| A. Valer a contagem "desde que o app alcança o servidor", e repetir o P8 em celular físico na B1 | O P8 passa. O tempo do emulador não fica como critério |
| B. Valer a contagem "desde o comando de modo avião" | O P8 falha em 5 de 10. O critério de troca da seção I do plano (convergência acima de 30 s de forma repetida) seria acionado, e a prova não consegue separar a tecnologia do emulador sem celular físico |

**Decidido pelo responsável em 26/11/2026:** opção A. Vale a contagem "desde que o app alcança o servidor"; o critério de troca da seção I do plano não é acionado e o PowerSync segue. Para a B1: o ambiente Docker com o PowerSync pode ser copiado, e o P8 se repete em celular físico.

### Resumo do que o QA aprovou e reprovou

Detalhe nos relatórios `docs/prova-tecnica/qa/F0-1-rodada-1.md`, `F0-2-rodada-1.md`, `F0-3-rodada-1.md`, `F0-4-rodada-1.md`, `F0-5-rodada-1.md` e `INF-01-rodada-1.md`. A F0-2 foi reprovada na rodada 1 (faltavam vídeos do P1 e do P9, o limite do P8 estava em 2 min em vez de 30 s e as falhas do ensaio não tinham explicação) e aprovada na rodada 2. A F0-3 foi reprovada duas vezes só por evidência (as capturas da barra de avisos não mostravam a barra; uma duração de vídeo errada) e aprovada na rodada 3, com uma conferência extra para tirar do vídeo e das imagens as telas com ícones de terceiros. F0-1, F0-4 e F0-5 foram aprovadas na primeira rodada.

## Limites desta prova

- **Tudo foi medido só em emulador.** Emulador Android 16 (API 36), imagem "Google APIs" x86_64, tela ligada, sem economia de bateria do fabricante e sem o modo de soneca do Android (Doze), com a máquina carregada por outros programas (segundo a entrega da F0-2, de 3 a 4 emuladores, builds e a missão de vídeos ao mesmo tempo). Repetir em celular físico fica para a B1 (jornada J3 da SPEC, seção 13).
- A imagem "Google APIs" é `userdebug`, não a imagem de loja. Isso permitiu adiantar o relógio por comando (`adb root` e `date`) e não é igual a um aparelho de fábrica.
- A prova não tem dado de camping nem tela de produto: as telas são de teste. O texto do aviso é o da véspera da SPEC, seção 10.
- Memória livre da máquina com tudo ligado, medida pelo QA na F0-1: 7.982 MB. A entrega registrou leituras de 5,6 e 3,7 GB com a missão de vídeos rodando junto.

## Item 1. Sincronização offline (F0-2)

Aposta: PowerSync (SDK `@powersync/react-native` 2.4.1 e serviço auto-hospedado 1.29.1) ligando o SQLite do aparelho ao Postgres do Supabase local. Escopo reduzido aceito pelo responsável (H7): gastos (S6) fora; S7 reduzido a "token de acesso vencido durante o período offline"; telas do aviso de duplicado e da sugestão de juntar fora (a prova confere a condição nos dados).

| Critério do plano | Número medido (conferido pelo QA) | Evidência | Veredito |
| --- | --- | --- | --- |
| 93 de 93 execuções sem perda, sem duplicação e com A e B iguais ao servidor | **93 de 93** (P1 10, P2 10, P3 10, P4 10, P5 10, P6 10, P7 3, P8 10, P9 10, P10 10). O QA recalculou a partir do registro bruto, sem usar o resumo da entrega | `docs/prova-tecnica/evidencias/F0-2/execucoes.jsonl`, `tabelas-r3.md`, `resultado-F0-2.md` | Cumprido |
| P3b: relógios de A e B errados em 2 horas | 10 de 10, mesmo resultado do P3 | `execucoes.jsonl` | Cumprido |
| Execuções refeitas por falha de roteiro até 10% | **4 de 107 (3,7%)** na rodada 3. As rodadas 1 (19,4%) e 2 (15,6%) foram interrompidas, como o plano manda, e levaram às correções | `rodada-r1.txt`, `rodada-r2.txt`, `rodada-r3.txt`, `tabelas-r1.md`, `tabelas-r2.md` | Cumprido |
| Convergência em até 30 s (P7: 2 min), contada desde que o app alcança o servidor | Pior caso 7,7 s nos cenários curtos, 13,0 s no P7 e 20,8 s no P8 | `tabelas-r3.md` | Cumprido (ver D4) |
| Convergência contada desde o comando de modo avião | **P8 passou de 30 s em 5 das 10** (30,2 a 34,5 s). Os outros cenários ficam dentro do limite | `tabelas-r3.md`, `resultado-F0-2.md` | **Decisão do responsável (D4)** |
| Com os dois online, a alteração de um aparece no outro em até 5 s (20 medidas) | 20 de 20, mediana 0,14 s, pior 1,2 s | `medida-online-r3.json` | Cumprido |
| Segunda barreira: C não recebe nada da viagem de A e B | Testes do servidor **37 de 37**, rodados pelo QA com o banco recriado do zero. O teste lê o canal de sincronização como C e exige receber só a viagem de C (controle positivo incluído) | `testes-servidor.txt` | Cumprido |
| Tela responde durante o envio de 200 alterações (sem travar mais de 1 s) | Nenhuma pausa acima de 250 ms. **Medido só no JavaScript**, não na camada nativa | `resultado-F0-2.md` | Cumprido, com o limite dito |
| Vídeos de P1 e P9 lado a lado e capturas do estado final | `p1-dois-emuladores.mp4` (73,9 s) e `p9-dois-emuladores.mp4` (52,8 s), mais 4 capturas. O QA conferiu o brilho de todos os quadros e viu só telas do Campinguim | `docs/prova-tecnica/evidencias/F0-2/` | Cumprido |
| Banco local cifrado (DEF-11), só registrar | A biblioteca aceita (SQLCipher no OP-SQLite), mas exige ligar uma opção no `package.json` do app. **Não testado no aparelho**: "suportado pela biblioteca, não confirmado em execução" | `resultado-F0-2.md` | Registrado, não critério |

**Veredito da aposta: PowerSync SEGUE.** Zero perda e zero duplicação em todas as execuções medidas das três rodadas, e 93 de 93 na rodada final. Nenhum sinal de troca da seção I (perda ou duplicação que continue depois de duas correções), a não ser pela contagem alternativa do P8, que é a decisão D4. A fila de alterações sobrevive a fechar o app (P1: a fila mostrava 10 antes e 10 depois de fechar à força e reabrir), o que era "não confirmado" no plano.

Tabela da rodada 3 (a que vale). Convergência medida desde que o app alcança o servidor; a última coluna, desde o comando de modo avião:

| Cenário | O que testa | Válidas | Sem perda | Refeitas | Mediana | Pior caso | Desde o modo avião (pior) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | A marca 10 itens offline, fecha e reabre o app, reconecta | 10 | 10 | 0 | 1,5 s | 2,0 s | 4,0 s |
| P2 | A e B assumem o mesmo item do grupo offline | 10 | 10 | 0 | 0,5 s | 7,7 s | 12,3 s |
| P3 | A marca `in_car` offline, B marca `set_aside` depois | 10 | 10 | 0 | 0,5 s | 0,7 s | 3,4 s |
| P3b | Igual a P3, relógios deslocados em 2 horas | 10 | 10 | 0 | 0,5 s | 1,6 s | 5,0 s |
| P4 | A remove, B edita a quantidade, nas duas ordens | 10 | 10 | 3 | 0,5 s | 2,1 s | 7,3 s |
| P5 | A e B criam "isqueiro" offline | 10 | 10 | 1 | 0,4 s | 0,9 s | 4,5 s |
| P6 | Mesma quantidade de item do grupo, nos dois offline | 10 | 10 | 0 | 0,5 s | 1,0 s | 7,5 s |
| P7 | 200 alterações offline, com o token vencido no período | 3 | 3 | 0 | 12,2 s | 13,0 s | 15,1 s |
| P8 | Envio cortado no meio e repetido | 10 | 10 | 0 | 15,9 s | 20,8 s | 34,5 s |
| P9 | B removido da viagem enquanto offline com 5 alterações | 10 | 10 | 0 | 0,8 s | 2,1 s | 4,5 s |
| P10 | Sem login, A cria 2 viagens; depois entra | 10 | 10 | 0 | 1,9 s | 2,0 s | 2,0 s |

Os resultados do QA para as regras da SPEC, seção 4: P3, `in_car` fica nos dois e no servidor; P4, o item fica removido e restaurável, com a quantidade editada por B guardada; P6, vale a última a chegar e o valor perdido fica no histórico do item do grupo; P8, 100 reenviadas reconhecidas como repetidas e ignoradas, 100 aplicadas, nenhuma duas vezes; P9, as 5 alterações recusadas e o aviso mostrado.

O atraso artificial de 4 s do servidor no P8 (`private.prova_ajuste`) vale só para o envio que é cortado e é desligado logo depois do corte, antes de a rede voltar: o reenvio rodou sem atraso (o QA conferiu no código).

As 9 falhas do ensaio (antes da medição) estão explicadas uma a uma em `docs/prova-tecnica/evidencias/F0-2/resultado-F0-2.md`, com a causa e a correção; nenhuma foi perda de dado. Exemplo: as 10 "alterações fantasma" do P2 eram as 10 do P1 anterior, que ficaram na fila e chegaram durante o P2.

## Item 2. Lembrete local em modo avião (F0-3)

Aposta: `expo-notifications` 58.1.9, lembrete agendado no próprio aparelho (a SPEC não define alternativa para este item, J2). Emulador temporário com Android 16, modo avião ligado, permissão de aviso e alarme exato concedidos nos casos (a), (b) e (c) (o QA conferiu o alarme exato no registro do alarme: `exactAllowReason=permission` em `alarme-agendado.txt`; a entrega diz que a concessão foi pelas telas do sistema, o que o QA não conferiu). `USE_EXACT_ALARM` não é usada, pela política do Google Play. O relógio foi adiantado por comando (`adb root` e `date`); o Maestro não foi preciso.

| Caso e critério do plano | Número medido (conferido pelo QA) | Evidência | Veredito |
| --- | --- | --- | --- |
| (a) app fechado: 10 de 10, aviso em até 60 s depois do relógio adiantado. Nas 10 execuções finais o app foi fechado pela remoção da tarefa (`cmd activity stack remove`, processo morto, alarme mantido), não pelo deslize real na lista de recentes; o deslize real foi usado só nas rodadas anteriores e na recaptura da imagem (ponto 16) | 10 de 10; atraso de 0,8 a 1,7 s, mediana 1,05 s; modo avião ligado em todas | `docs/prova-tecnica/evidencias/F0-3/caso-a/` | Cumprido |
| (b) app em segundo plano | 10 de 10; atraso de 0,7 a 1,8 s, mediana 1,1 s | `docs/prova-tecnica/evidencias/F0-3/caso-b/` | Cumprido |
| (c) aparelho reiniciado entre o agendamento e o horário | 10 de 10; atraso de 0,7 a 3,7 s, mediana 1,75 s; o alarme voltou sozinho depois do boot nas 10, entre 17 e 30 s depois | `docs/prova-tecnica/evidencias/F0-3/caso-c/` | Cumprido |
| Tocar no aviso abre a tela da viagem, não o início (SPEC, seção 10) | 30 de 30 em (a), (b) e (c). A tela diz "Esta viagem não está neste aparelho" porque a prova não sincroniza: o que se prova é a rota | `docs/prova-tecnica/evidencias/F0-3/caso-a/caso-a.mp4` (11,8 s, só telas do Campinguim) | Cumprido |
| (d) permissão de aviso negada: o app não quebra | 5 de 5, 0 quebras; a tela avisa "Os avisos estão desligados neste aparelho. O lembrete não vai aparecer." A 1ª execução usou a tela real do sistema | `docs/prova-tecnica/evidencias/F0-3/caso-d/` | Cumprido |
| (e) sem alarme exato: atraso medido em 5 execuções, mediana e pior caso | Com o relógio adiantado: 16,5 a 20,5 s, mediana 16,7 s. **Em tempo real**: 5,9 a 228,6 s, mediana 159,1 s, pior 228,6 s | `docs/prova-tecnica/evidencias/F0-3/caso-e/`, `caso-e-real/` | Cumprido; a escolha é a D2 |
| (f) "forçar parada" cancela | 3 de 3: o alarme some do sistema e o aviso não chega. Tirar o app da lista de recentes não cancela | `docs/prova-tecnica/evidencias/F0-3/caso-f/alarme-antes-e-depois.txt` | Registrado |
| Manifesto: sem `USE_EXACT_ALARM`, sem localização | Confere (teste automático e leitura do manifesto) | `docs/prova-tecnica/evidencias/F0-3/manifesto-permissoes.txt` | Cumprido |

**Veredito da aposta: lembrete local SEGUE**, com a decisão D2 aberta. O relógio adiantado não mede a espera real de um alarme aproximado; por isso o complemento em tempo real. Para o lembrete da véspera o teto sem alarme exato é de cerca de 1 hora (documentação do Android, não medido em aparelho real).

## Item 3. App abrindo na viagem por link (F0-4)

Aposta: `expo-router` 58.0.32 e `expo-linking` 58.0.17, com esquema próprio `campinguim://` e link `https` num endereço de teste (`campinguim.test`, domínio reservado que não existe), vindo de um único valor de configuração. O QA conferiu cada execução comparando o identificador e o nome na tela com o do link.

| Caso e critério do plano | Número medido (conferido pelo QA) | Evidência | Veredito |
| --- | --- | --- | --- |
| (a) app fechado (abertura a frio): viagem certa em 10 de 10, tempo do toque até a tela medido | 10 de 10, 0 quebras. Mediana **721 ms**, pior **988 ms** (medido no próprio aparelho, da linha do `am start` até o registro que a tela da viagem escreve ao ficar pronta) | `docs/prova-tecnica/evidencias/F0-4/caso-a/`, `docs/prova-tecnica/evidencias/F0-4/resumo.md` | Cumprido |
| (b) app aberto em outra tela (início, links e lembretes, em rodízio) | 10 de 10; e mais 10 de 10 com o app em segundo plano | `docs/prova-tecnica/evidencias/F0-4/caso-b/`, `caso-b-fundo/` | Cumprido |
| (c) viagem que não existe no aparelho: mensagem clara, sem quebrar | 10 de 10 com "Esta viagem não está neste aparelho.", pelos dois tipos de link, com o app fechado e aberto. Identificador inválido: "O link não traz uma viagem válida." | `docs/prova-tecnica/evidencias/F0-4/caso-c/` | Cumprido |
| (d) link `https` com o vínculo forçado no emulador: 10 de 10 | 10 de 10 (5 com o app fechado, 5 aberto), sempre direto no app, sem pergunta. `pm get-app-links`: `1024` depois de instalar (a verificação automática não termina, o domínio não existe) e `approved` depois de forçar | `docs/prova-tecnica/evidencias/F0-4/caso-d/pm-get-app-links.txt`, `docs/prova-tecnica/evidencias/F0-4/manifesto-links.txt` | Cumprido |
| (e) link `https` sem vínculo: registrar o que o Android faz | 5 de 5 abriram o **navegador** do emulador; o app não abriu nem ficou na frente. Sem imagem, para não mostrar marca de terceiro | `docs/prova-tecnica/evidencias/F0-4/caso-e/` | Registrado |
| Teste de que o lembrete ainda abre a viagem depois dos links | Aviso com avião e toque abrindo a viagem: (a) 5 de 5 e (b) 5 de 5. No encontro de aviso e link, **o link prevalece**: 3 de 3 a frio e 3 de 3 com o app vivo | `docs/prova-tecnica/evidencias/F0-4/fumaca-lembrete/`, `caso-a-depois-da-fumaca-a/`, `caso-b-depois-da-fumaca-b/` | Cumprido |

**Veredito da aposta: link SEGUE**, com a ressalva a seguir. **Sem o arquivo `assetlinks.json` publicado e verificado no site, o link `https` da viagem abre no navegador, não no app** (caso e). A verificação automática do domínio exige um domínio publicado e fica **fora da prova**, assim como o link que abre a viagem depois de instalar o app pela loja (RET-01, J3). O site precisa tratar esse caso (página do convidado, feature 2.4).

## Item 4. Verificação do aparelho: PENDENTE (parte local, F0-5)

Aposta: `@expo/app-integrity` 58.0.2 atrás de interface própria no app (SPEC, seção 2), conferência no servidor. **A prova do item 4 é INCOMPLETA.**

**Decidido pelo responsável em 27/11/2026 (V7, validação da Base):** a conta de desenvolvedor do Google Play só será aberta perto do lançamento 1.0.0. Consequência: o item 4 da prova (F0-6, versão pela faixa de teste interno) fica adiado até lá e a prova segue INCOMPLETA só por ele. O conteúdo desta seção continua como foi escrito em 26/11/2026. Registro em `docs/decisoes-da-base.md`.

| Critério do plano (F0-5) | Número medido (conferido pelo QA) | Evidência | Veredito |
| --- | --- | --- | --- |
| Todos os testes exigidos passam | Unidade e app, **54 de 54**, sem pilha. Suíte inteira, **89 de 89**, com a pilha isolada (inclui os 19 da F0-1). Cobrem: sem prova, prova inválida ou de outro app, `UNRECOGNIZED_VERSION`, `UNEVALUATED`, `UNLICENSED`, veredito do aparelho vazio, pacote diferente, resumo do pedido diferente, token repetido, veredito bom de exemplo aceito, prova de desenvolvimento desligada recusada e ligada só no local aceita, marca de aparelho vencida recusada e configuração de produção com a prova de desenvolvimento desligada | `docs/prova-tecnica/evidencias/F0-5/testes.txt`, `LEIA-ME.md` | Cumprido |
| Os testes pegam regra quebrada | O QA quebrou 4 regras de propósito, uma por vez (aceitar `MEETS_BASIC_INTEGRITY`; aceitar prova de desenvolvimento sem `AMBIENTE=local`; tirar a proteção contra repetição; não conferir o resumo do pedido): cada uma derrubou de 1 a 3 testes. O código original voltou a passar | `docs/prova-tecnica/qa/F0-5-rodada-1.md` | Cumprido |
| O app no emulador recebe `integrity_required` e mostra a mensagem | Captura com a tela "Verificação do aparelho", a prova "de desenvolvimento (falsa, só para teste local)" e "Código: integrity_required". Chamada HTTP direta do QA: sem prova, desenvolvimento qualquer, token da Play inválido e dublê forjado dão todos **403** com o mesmo corpo `{"code":"integrity_required",...}`; o motivo real fica só no registro interno | `docs/prova-tecnica/evidencias/F0-5/captura-recusa.png`, `captura.txt` | Cumprido |
| O resto do app não importa a biblioteca direto | Só `src/verificacao/expo.ts` importa `@expo/app-integrity`, e só `src/verificacao/index.ts` carrega esse arquivo. Busca repetida pelo QA | `docs/prova-tecnica/evidencias/F0-5/busca-biblioteca.txt` | Cumprido |

**O que a F0-5 NÃO prova.** Nenhum token real do Google chegou ao servidor, e a chamada real ao Google (`decodeIntegrityToken`) não existe ainda: o decodificador de produção **recusa tudo** até a F0-6. Os casos "aceito" dos testes usam um **dublê de teste** e vereditos de exemplo montados a partir da documentação oficial: nada disso prova algo sobre o Google. O controle positivo de verdade (versão instalada pela Play num celular físico, aceita) é o caso (d) da F0-6.

**F0-6 (versão pela faixa de teste interno): PENDENTE, não medido.** Critérios do plano: (a) instalada por `adb`, recusada; (b) sem prova, recusada; (c) instalada pela Play num emulador com Play Store, recusada; (d) instalada pela Play num celular físico, aceita; todos em 5 de 5, com a origem da instalação comprovada. Falta, do lado do responsável (plano, seção H): H11 conta de desenvolvedor do Google Play; H12 projeto no Google Cloud e conta de serviço para o servidor; H13 conta de testador; H14 e J4 como o celular físico alcança o servidor. Também fica para a F0-6 conferir num token real o formato de `certificateSha256Digest` (a página oficial diz "base64 URL-safe", mas o exemplo tem só hexadecimais; a comparação da F0-5 usa base64 URL sem preenchimento).

**Veredito da aposta (parcial):** a lógica de recusa e o isolamento da biblioteca **SEGUEM**. A biblioteca do Expo em si **não tem veredito**: "segue ou troca pelo módulo nativo" só se decide com um token real, na F0-6. Hoje a recusa depende de a verificação ser decidida no servidor, que está feito e testado.

## Aposta por aposta

| Aposta (SPEC, seção 2) | Veredito | Por quê |
| --- | --- | --- |
| App em React Native com Expo, TypeScript | **Segue** | Expo 58, React Native 0.88.1 e o conjunto (PowerSync, notificações, links, verificação) compilam e rodam em build local no Windows, sem EAS e sem conta Expo, nos dois emuladores (F0-1) |
| SQLite no aparelho, sincronização com PowerSync | **Segue** (decisão D4 aberta) | Item 1 |
| Servidor Supabase, rodando local em Docker | **Segue** | Sobe sem erro, RLS testado (19 de 19; falha de propósito conferida), A não lê nada da viagem de C pela API (conferência independente do QA) e o PowerSync replica sem ajuste no Postgres |
| Notificações locais para lembretes | **Segue** (decisão D2 aberta) | Item 2. A SPEC não define alternativa; não foi preciso usar |
| Link que abre o app na viagem | **Segue**, com a ressalva do `assetlinks.json` | Item 3. A SPEC não define alternativa; não foi preciso usar |
| Verificação do aparelho: Play Integrity, biblioteca do Expo atrás de interface própria | **Pendente** | Item 4. Parte local provada; biblioteca sem veredito até a F0-6 |
| Testes de tela com Maestro | **Segue**, com ressalva | O Maestro 2.12.1 ficou instável no emulador A na F0-1 ("device offline" na primeira execução de cada série; só 4 de 6 passaram de primeira); a F0-2 tratou como execução refeita (3,7% do total). Na F0-3 o Maestro não foi usado (`adb` e `uiautomator`) |
| Emulador com aceleração (WHPX) e Docker juntos | **Segue** | `emulator -accel-check`: WHPX usável; Docker Desktop em WSL 2 convive com os dois emuladores |

## Versões efetivamente usadas e licenças

Fonte das versões: `docs/prova-tecnica/ambiente.md` e os `package.json` do app e do servidor da prova. Licenças dos pacotes npm: campo `license` de cada pacote instalado, lido nesta tarefa.

| Peça | Versão usada | Licença |
| --- | --- | --- |
| Expo SDK (`expo`) | 58.0.26 | MIT |
| React Native / React | 0.88.1 / 19.3.0 | MIT / MIT |
| TypeScript | 6.0.3 | Apache 2.0 |
| `expo-router`, `expo-linking`, `expo-notifications` | 58.0.32, 58.0.17, 58.1.9 | MIT |
| `@expo/app-integrity` | 58.0.2 | MIT |
| `@powersync/react-native` / `@powersync/common` | 2.4.1 / 2.5.0 | Apache 2.0 |
| `@op-engineering/op-sqlite` | 18.2.5 (o SDK exige `>=17.1.0 <19.0.0`) | MIT |
| `@supabase/supabase-js` | 2.119.2 | MIT |
| Supabase CLI (dependência do projeto) | 3.4.0 | MIT |
| `pg` (servidor da prova) | 8.23.1 | MIT |
| Núcleo SQLite do PowerSync no aparelho | 0.5.4 (lido no app) | não conferida nesta tarefa |
| Serviço PowerSync (imagem Docker) | `journeyapps/powersync-service:1.29.1` | Apache 2.0 desde 03/11/2026 (plano, B2, fonte oficial); resolve a dúvida de licença da SPEC, seção 15 (J6) |
| Postgres local (imagem `supabase/postgres`) | 17.12.0.002 | não conferida nesta tarefa |
| Armazenamento do PowerSync (MongoDB) | 7.0 | não conferida nesta tarefa. O plano (B2) aceita Postgres no lugar do MongoDB para este armazenamento |
| Docker Desktop | 4.94.0 (cliente e servidor 29.8.2), WSL 2 | Gratuito só dentro das condições do contrato (uso pessoal, educação, código aberto não comercial, empresa com menos de 250 funcionários e menos de US$ 10 milhões de receita). O aceite foi feito pelo responsável (H3). Como o Campinguim prevê receita, a conferência de que o uso cabe na gratuidade continua sendo dele (J13) |
| Android SDK: ferramentas de linha de comando 22.0, platform-tools 37.0.3, emulador 37.3.10, plataforma 36 e 37, build-tools 36.0.0 e 37.0.0 | conforme `ambiente.md` | Android SDK License Agreement, aceito pelo responsável (H3) |
| Imagem do emulador | `system-images;android-36;google_apis;x86_64` (Android 16, `userdebug`, sem Play Store) | Coberta pelo contrato do SDK |
| NDK / CMake / Gradle | 27.1.12297006 / 3.31.6 / 9.4.1 | não conferida nesta tarefa |
| JDK | Temurin 17.0.21.1+2 | GPLv2 com exceção de classpath (plano, B1) |
| Maestro CLI | 2.12.1 (telemetria desligada) | Apache 2.0 (plano, B4) |
| Node do sistema (scripts da prova) | 24.19.0 | não conferida nesta tarefa |
| Android do build | compileSdk 37, targetSdk 36, minSdk 24, nova arquitetura e Hermes ligados | n/a |

Itens do plano que eram "não confirmado" e foram confirmados: plataforma do Android SDK para o Expo 58 (compileSdk 37); PowerSync 2.4.1 com Expo 58 e React Native 0.88 (compila e roda); etiqueta fixa da imagem do PowerSync (`1.29.1`); `wal_level = logical` no Postgres do Supabase local (sim, sem ajuste); fila do PowerSync sobreviver a fechar o app (sim); comandos de modo avião (`cmd connectivity airplane-mode`) e de adiantar o relógio (`adb root` e `date`, só na imagem `userdebug`); lembrete disparar sem internet, depois de adiantar o relógio e depois de fechar pela lista de recentes (sim). Memória do PowerSync e do MongoDB em Docker: de 93 a 283 MB e de 92 a 192 MB em três leituras (F0-1, entrega).

Continuam não confirmados: SQLCipher no Expo em execução no aparelho (DEF-11); `@expo/app-integrity` com token real; Play Integrity em emulador e respostas de teste; custo da Play Integrity e se pede faturamento no Google Cloud; exigência de política de privacidade e classificação antes do teste interno; o domínio provisório servir o `assetlinks.json`; se a Google Play exige declaração para `SCHEDULE_EXACT_ALARM`.

## Junção dos trabalhos

**Feita e aprovada pelo QA** (F0-INT, rodada 2, em 26/11/2026). Fontes: `docs/prova-tecnica/evidencias/F0-integracao/LEIA-ME.md` e `docs/prova-tecnica/qa/F0-INT-rodada-1.md` (a rodada 2 está no fim do mesmo arquivo).

**Regra mantida.** A integração no `main` é **só por squash**, num único commit "F0: prova técnica" (PROPOSTA 3 do plano), porque os commits locais da F0-3 ainda guardam o vídeo e as imagens antigas com ícones de terceiros. **Nenhum ramo da F0 é enviado ao GitHub commit a commit**, e o ramo da junção também não.

### Ramo e commits

Ramo `feature/F0-integracao`, ponta **`806b938`**, saído de `fb54ca9`. **Só local.** Autor e quem gravou os commits: o e-mail noreply do GitHub.

| Commit | O que é |
| --- | --- |
| `cfcf47c` | Junta a F0-5 (verificação do aparelho, ponta `01fa6de`) |
| `81dcad8` | Junta a F0-4 (link, ponta `88015ad`), com a F0-3 (lembrete, ponta `39aef77`) dentro |
| `b0aa168` | Junta a F0-2 (sincronização, ponta `7f78a41`) |
| `55d1d18` | Ajuste de convivência: a pilha paralela da F0-5 passa a gerar também as senhas dos usuários D e E, que o `semear.mjs` da F0-2 exige (3 linhas, sem mudar regra) |
| `bc1a8fe` | Ajuste de convivência: `rodar.mjs` (F0-2) e `lembretes/roteiro.mjs` (F0-3) aceitam `EVIDENCIAS_DIR`, para a fumaça da junção gravar fora das evidências aprovadas. Sem a variável, o caminho é o de antes. Traz também o registro `F0-integracao/LEIA-ME.md` |
| `806b938` | Correção só do registro, pedida pelo QA na rodada 1: contagem de arquivos idênticos (214 em `b0aa168`, 211 em `HEAD`) e registros das fumaças versionados como `.txt` |

Fora dos merges, só os dois ajustes de convivência mexem em código. O app (`prova/app`) não mudou depois do último merge (`git diff 55d1d18 HEAD -- prova/app` vazio).

### Conflitos e como foram resolvidos

Entre `fb54ca9` e `b0aa168` mudam 218 arquivos. Só 4 foram mudados por mais de um ramo. Em todos, a resolução é a **soma dos dois lados**, sem mudar linha que veio de um ramo. O QA conferiu arquivo por arquivo.

| Arquivo | Ramos | Como ficou |
| --- | --- | --- |
| `prova/app/app/_layout.tsx` | F0-3/F0-4 e F0-2 | Conflito de verdade, no merge da F0-2. Ficam os dois: o gancho que abre a tela da viagem ao tocar no aviso (F0-3) e o início da sincronização com sessão guardada (F0-2), nessa ordem. O import de `react` traz `useEffect` e `useRef` |
| `prova/app/src/textos.ts` | F0-5 e F0-3/F0-4 | Conflito de verdade, no merge da F0-4. Os blocos `verificacao` (F0-5), `lembretes` e `links` (F0-3/F0-4) ficam os três |
| `prova/LEIA-ME.md` | F0-5 e F0-3/F0-4 | Juntou sozinho |
| `prova/servidor/supabase/config.jsonc` | F0-5 e F0-2 | Juntou sozinho: `jwt_expiry` de 180 s (F0-2) e o bloco `functions` (F0-5) |

Os outros 214 arquivos, em `b0aa168`, são idênticos à única ponta que os mudou. Em `HEAD`, 211 continuam idênticos; os 3 que diferem (`pilha-paralela.mjs`, `rodar.mjs` e `lembretes/roteiro.mjs`) mudam só pelos dois ajustes acima. As evidências aprovadas das quatro tarefas ficaram sem nenhuma diferença em relação às suas pontas. O `jwt_expiry` de 180 s da F0-2 passou a valer na árvore inteira da prova (a suíte da F0-5 passa com ele); já é o ponto 6 de "Pontos para a B1".

### Fumaça na árvore juntada

Rodada na retomada, em 26/11/2026, com o Node do sistema 24.19.0, os dois emuladores e as duas pilhas (padrão e paralela da F0-5). O QA recalculou a partir dos registros brutos e rodou de novo o tsc, os testes de configuração, o banco do zero e as duas suítes do servidor.

| Item | Resultado | Arquivo (em `docs/prova-tecnica/evidencias/F0-integracao/`) |
| --- | --- | --- |
| tsc do app | saída 0 | `tsc.txt` |
| Testes de configuração | 5 de 5 | `testes-configuracao.txt` |
| Banco do zero | 3 migrações aplicadas; usuários A a E criados | `db-reset.txt` |
| Testes do servidor, pilha padrão | 107 testes: **96 ok, 0 falhas, 11 pulados** (os que precisam do dublê de teste) | `testes-servidor-pilha-padrao.txt` |
| Testes do servidor, pilha paralela (dublê da F0-5) | 89 testes: **89 ok, 0 falhas, 0 pulados** | `testes-servidor-pilha-paralela.txt` |
| Build Android | gerado em 25/11, reaproveitado (o app não mudou; SHA-256 começa por `0e55876efb72e2f2`). O QA leu o pacote JS e viu as 4 tarefas dentro | `build-android.txt` |
| Sincronização P1, 3 vezes | **3 de 3**: 10 alterações aplicadas em cada, sem perda nem duplicação, A e B iguais ao servidor. Convergência 3,8, 4,2 e 4,3 s desde o modo avião (0,6, 1,8 e 1,9 s desde o app alcançar o servidor) | `fumaca-sincronizacao.txt`, `sincronizacao/execucoes.jsonl` |
| Sincronização P9, 1 vez | **1 de 1**: 5 alterações recusadas e avisadas. Convergência 4,8 s | idem |
| Lembrete (a), 3 vezes | **3 de 3**: alarme exato, deslize real na lista de recentes, modo avião no aviso, atraso 0,5, 0,3 e 0,3 s, toque abrindo a viagem | `fumaca-lembrete-a.txt`, `lembrete/caso-a/` |
| Link (a), app fechado, 3 vezes | **3 de 3** na viagem certa. 719, 656 e 751 ms (mediana 719 ms) | `fumaca-links.txt`, `links/caso-a/` |
| Link (b), (d) e (c) | (b) 3 de 3; (d) 3 de 3; (c) 1 de 1 e identificador inválido com a mensagem certa | `links/caso-b/`, `links/caso-d/`, `links/caso-c/` |
| Item 4, parte local | coberta pelas duas suítes do servidor acima | `testes-servidor-*.txt` |

Limites da fumaça: as permissões do lembrete foram dadas por comando (`pm grant` e `appops`), não pelas telas do sistema, e a fumaça **não substitui** as medições das tarefas F0-2 a F0-5. As falhas vistas na retomada (Node 22 no terminal em vez do 24; servidor de funções parado depois do desligamento do Docker) não vêm da junção e estão no LEIA-ME da junção. A checagem de segredos (regra G) deu 0 achados.

**Tarefa retomada depois de um reinício do app.** O primeiro ajudante da junção foi derrubado por um reinício do app em 25/11, no meio da fumaça. Outro ajudante retomou em 26/11: conferiu de novo os commits, desfez a linha que a primeira fumaça tinha acrescentado ao `execucoes.jsonl` da F0-2 (evidência aprovada), reaproveitou só o build e rodou de novo todo o resto. Os registros da primeira tentativa ficaram em `antes-do-reinicio/`, só como histórico.

### Conferência dos caminhos de evidência

Conferida em 26/11/2026 por `git ls-tree -r --name-only HEAD` no worktree da junção (`feature/F0-integracao`, `806b938`, 1.261 arquivos), contra todo caminho citado neste documento. Não se copiou nem moveu arquivo.

| Pasta ou arquivo citado | Arquivos no ramo |
| --- | --- |
| `docs/prova-tecnica/evidencias/F0-0/` | 11 |
| `docs/prova-tecnica/evidencias/F0-1/` | 14 |
| `docs/prova-tecnica/evidencias/F0-2/` | 17 (inclui `execucoes.jsonl`, `tabelas-r1` a `r3.md`, `rodada-r1` a `r3.txt`, `medida-online-r3.json`, `testes-servidor.txt`, `resultado-F0-2.md` e os dois vídeos) |
| `docs/prova-tecnica/evidencias/F0-3/` | 57 (`caso-a` 7, `caso-b` 6, `caso-c` 7, `caso-d` 3, `caso-e` 6, `caso-e-real` 3, `caso-f/alarme-antes-e-depois.txt`, `manifesto-permissoes.txt`) |
| `docs/prova-tecnica/evidencias/F0-4/` | 64 (`caso-a` 5, `caso-b` 5, `caso-b-fundo` 5, `caso-a-depois-da-fumaca-a` 5, `caso-b-depois-da-fumaca-b` 5, `caso-c` 8, `caso-e` 6, `fumaca-lembrete` 12, `resumo.md`, `manifesto-links.txt`, `caso-d/pm-get-app-links.txt`, `caso-semear/links-viagens-de-teste.png`) |
| `docs/prova-tecnica/evidencias/F0-5/` | 5 (`testes.txt`, `LEIA-ME.md`, `captura-recusa.png`, `captura.txt`, `busca-biblioteca.txt`) |
| `docs/prova-tecnica/evidencias/F0-integracao/` | 54 |
| `docs/infra.md`, `docs/prova-tecnica/plano.md` | existem, mas na versão anterior; a versão citada está só na árvore principal, sem commit |
| `docs/prova-tecnica/ambiente.md` | existe |
| `docs/prova-tecnica/qa/F0-0-rodada-1.md`, `F0-G-rodada-1.md` | existem |
| `prova/app/src/verificacao/expo.ts` e `index.ts`, `prova/lembretes/aparelho.mjs`, `prova/app/package.json`, `prova/app/app.config.ts` | existem |

Resultado: **todos os caminhos de evidência existem no ramo**, com duas correções de texto e uma ressalva.

1. **Corrigido no texto:** na tabela do item 3, `manifesto-links.txt` estava sem a pasta e foi lido como `F0-4/caso-d/`, onde não existe. O arquivo está em `docs/prova-tecnica/evidencias/F0-4/manifesto-links.txt`. O mesmo vale para `resumo.md`, que está em `docs/prova-tecnica/evidencias/F0-4/resumo.md`. Os dois caminhos foram escritos por inteiro.
2. **Ressalva, não é falha de caminho:** os arquivos abaixo **não estão no ramo `feature/F0-integracao`**, ou estão só em versão anterior. A versão citada existe na árvore principal, no ramo `feature/F0-prova-tecnica`, ainda sem commit. Os caminhos do texto estão certos, mas só passam a valer no repositório se estes arquivos entrarem no mesmo squash "F0: prova técnica". Isso fica com o piloto.
   - Ausentes do ramo: este `docs/prova-tecnica/resultado.md`; os relatórios do QA `docs/prova-tecnica/qa/F0-1-rodada-1.md`, `F0-2-rodada-1.md`, `F0-3-rodada-1.md`, `F0-4-rodada-1.md`, `F0-5-rodada-1.md`, `INF-01-rodada-1.md` e `F0-INT-rodada-1.md` (esta última é a fonte citada no começo da seção "Junção dos trabalhos"); e o relatório `docs/prova-tecnica/qa/F0-7-rodada-1.md`, que ainda não é citado neste texto, mas deve entrar no mesmo squash para ele ficar inteiro.
   - Em versão anterior no ramo: `docs/infra.md`, sem a seção Cloudflare e sem a seção "Prova técnica F0: serviços locais" (diferença de 109 linhas para a árvore principal); e `docs/prova-tecnica/plano.md`, sem a decisão de 24/11 em H9 e J1 (diferença de 12 linhas).

## Encerramento dos processos locais

A junção encerrou o que ligou: emuladores por `adb -s emulator-<porta> emu kill`, pilha padrão por `docker compose ... down` e `npx supabase stop`, pilha paralela pelo `derrubar` dela (LEIA-ME da junção, seção "Limpeza"). Esta tarefa **não ligou nada e não rodou `prova.mjs derrubar`**; só conferiu, em 26/11/2026, às 11:32:

| Conferência | Resultado |
| --- | --- |
| `docker ps` | lista vazia (0 contêineres em execução) |
| `docker ps -a` | lista vazia (0 contêineres, nem parados). O Docker Desktop está ligado; só não há contêiner da prova |
| `tasklist` filtrando `qemu-system-x86_64.exe` | nenhuma tarefa correspondente (0 emuladores) |
| `tasklist` filtrando `emulator.exe` | nenhuma tarefa correspondente |
| `adb devices` | "List of devices attached" e mais nada (0 aparelhos) |

**Nenhum processo da prova está rodando** (SQD-09). Os volumes da pilha padrão ficam guardados, como estavam antes da junção. Atenção: o comando `node prova/prova.mjs derrubar` roda `adb kill-server` e encerra à força **todo** processo de emulador da máquina, não só os da prova (ponto 23 da B1 abaixo).

## Pontos para a B1 (seção J)

Cada ponto foi conferido nos relatórios do QA. Nenhum impede o início da B1; todos precisam de decisão ou de código na B1.

### Segurança e dados

1. **Um dado inválido trava a fila inteira do aparelho.** Um erro de dado dentro de `sync_apply` aborta o lote todo, e o `uploadData` relança o erro sem descartar nada. Exemplos: `kind` fora do `check`, `name` com mais de 120 caracteres, uuid inválido. A fila fica parada para sempre. Isso inclui as viagens de teste da F0-4 (`kind = 'camping'`), semeadas por link (`campinguim://links?semear=1`): num aparelho com login, o envio dessas linhas falha sempre e trava a fila dele. Nunca abrir esse link em aparelho com login. Na B1, a função deve devolver "recusada (inválida)" por alteração, e o app deve tirá-la da fila e avisar, como já faz com `not_member`. Dados de teste do aparelho devem ir em tabela só local ou passar pelo servidor. (F0-2 obs. 1; F0-4 obs. 1)
2. **`sync_apply` é `security definer`, então o RLS não vale nas escritas.** Toda a autorização está dentro da função. Hoje ela não confere o `family_id` de um item novo (vem do aparelho), e qualquer membro edita item de outra família e apaga marcação de outra família. Na B1, as regras por família da SPEC precisam ser escritas na função, com teste. (F0-2 obs. 2)
3. **Token de renovação do login no SQLite do aparelho, sem cifra** (`sessao_local`). Na B1, vai para armazenamento seguro ou para o banco cifrado. DEF-11 está "suportado pela biblioteca, não confirmado no aparelho". (F0-2 obs. 3)
4. **A marca de "aparelho verificado" funciona como senha do portador.** Na prova ela está presa só ao `install_id`, que o app manda em todo pedido, e a função não exige login (`verify_jwt = false`): quem souber o `install_id` de um aparelho verificado chama sem prova por 24 h. Na B1, ligar a marca a `profile_id` e `install_id` e não copiar esta função como está. (F0-5 obs. 1)
5. **O login por link `campinguim://entrar?t=<token de renovação>` e os botões de teste** ("Gerar 200 alterações", "Medir 20 alterações online", "Tocar") **são só da prova** e não vão para a base. O token passa pelo `am start` e pelo registro do emulador. (F0-2 obs. 4 e item 8)
6. **`jwt_expiry` de 180 s e o atraso artificial de 4 s do P8** (`private.prova_ajuste`) são só da prova, para os cenários P7 e P8. Não copiar para a base. (F0-2)
7. **Premissas de tempo da verificação** (5 min, 1 min, 24 h): decisão D3. (F0-5 obs. 2)
8. **Formato de `certificateSha256Digest`** a conferir na F0-6 com um token real. (F0-5)

### App e permissões

9. **Permissões Android sem uso a retirar.** O modelo do Expo e as bibliotecas trazem `SYSTEM_ALERT_WINDOW`, `READ/WRITE_EXTERNAL_STORAGE` (até a API 32), a do `c2dm`, a do install referrer e 14 permissões de selo de ícone de fabricantes. Nenhuma é de localização; o PRD pede o mínimo de dados. Mexe em `package.json` e `app.config.ts`. (F0-1 obs. 1; decisão do piloto: B1)
10. **Primeiro agendamento logo depois de instalação nova se perdeu uma vez, sem sinal para a pessoa.** O horário foi para o registro, mas o alarme não apareceu no sistema e o aviso não chegou em 300 s; na execução seguinte funcionou. Causa **não investigada**, e o resultado dessa execução não foi guardado. Na feature 1.6: conferir, depois de agendar, que o lembrete está na lista de agendados, e cobrir esse caso com teste. (F0-3 rodada 2)
11. **"Forçar parada" cancela o lembrete.** É comportamento do Android 15 ou mais novo, medido 3 de 3, não falha do app. Documentar para a pessoa que usa. (F0-3 (f))
12. **Lembrete descartado com o aparelho desligado na hora**, e **teto de cerca de 1 h sem alarme exato**: decisão D2. (F0-3 obs. 4)
13. **RET-03:** a tela da prova pede a permissão de aviso por botão. A regra "pedir só quando o primeiro lembrete é criado" fica para a feature 1.6. (F0-3 obs. 5)
14. **Aviso `MODULE_TYPELESS_PACKAGE_JSON` do Node**: o `package.json` do app não declara `"type"`. Não muda o resultado; arquivo do orquestrador. (F0-5 obs. 3)
15. **O modelo de dados da prova é simplificado**: sem `profile` e sem `trip_family`, com `trip_member.profile_id` apontando para o usuário do login e `family_id` como simples identificador. As regras por família (ponto 2) e a marca do aparelho (ponto 4) precisam do modelo completo da SPEC, seção 3. (`docs/prova-tecnica/ambiente.md`, F0-1)

### Limites das medições

16. **"Fechar o app" nas rodadas finais foi a remoção da tarefa** (`cmd activity stack remove`), não o deslize real na lista de recentes, nos casos de lembrete e de link. O processo morreu (`pidof` vazio) e o alarme foi mantido; a abertura a frio está provada. As rodadas anteriores da F0-3 e a recaptura da imagem de (a) usaram o deslize real, com aviso 10 de 10. O deslize real em celular físico fica para a B1 ou a J3. (F0-3 obs. 2; F0-4 obs. 3)
17. **O vídeo do lembrete prova a rota, não o conteúdo da viagem**: a tela diz "Esta viagem não está neste aparelho" porque a prova não sincroniza. (F0-3)
18. **Pausa da tela no P7 medida só no JavaScript** (0 pausas acima de 250 ms); não mede travamento da camada nativa. (F0-2 obs. 7)
19. **Convergência medida desde que o app alcança o servidor**: o emulador leva de 11 a 24 s para devolver a rede depois do modo avião. Em aparelho real: não medido. Decisão D4. (F0-2 obs. 6)
20. **No encontro entre aviso e link, o link prevalece** (3 de 3 a frio e 3 de 3 com o app vivo). Confirmar que é o desejado para o produto. (F0-4)
21. **Divergência não investigada no caso (d) do link:** `resolve-activity` devolveu o `ResolverActivity`, mas o `am start` real abriu o app direto nas 10 execuções. Vale o comportamento real. O significado do estado `1024` está como leitura do código, sem confirmação em documento. (F0-4 obs. 4)
22. **Sem `assetlinks.json` verificado, o link `https` abre o navegador.** O site precisa tratar (feature 2.4), e o RET-01 depois de instalar pela loja ficou fora da prova (J3). (F0-4 obs. 5)

### Ferramentas e integração

23. **`prova.mjs derrubar` roda `adb kill-server`** e encerra à força todo processo de emulador da máquina, não só A e B. Não usar enquanto outra tarefa tiver emulador ligado. Corrigir na base. (F0-2 obs. 5)
24. **Integrar só por squash.** Os ramos da F0-3 e da F0-4 têm no histórico local o vídeo e as imagens antigas com ícones de terceiros; a F0-4 ainda trouxe a ponta da F0-3 por merge e mudou um arquivo da F0-3 (`prova/lembretes/aparelho.mjs`, serial por `CAMPINGUIM_SERIAL`, padrão inalterado). (F0-3, F0-4 obs. 2)

### Outros pontos registrados nas entregas (não estavam na lista do piloto)

25. **Link com o app já aberto na lista de outra viagem** às vezes não trocou a tela na rodada 2 da F0-2; a causa não foi investigada. A F0-4 testou o app aberto em início, links e lembretes (10 de 10), mas não esse caso específico. Conferir na B1. (`resultado-F0-2.md`, não confirmado nº 2)
26. **Vigia de rede do app**: a F0-2 recomenda trocar por aviso de troca de rede do sistema (NetInfo), o que exige dependência nova (decisão do orquestrador). A tela da lista consulta de novo a cada 1,5 s enquanto a viagem não chega; a causa na biblioteca não foi confirmada. (`resultado-F0-2.md`)
27. **Viagem nova criada no servidor** chegou ao aparelho online em 9 a 15 s em medidas avulsas, com a máquina carregada. Não é critério do plano (a premissa de 5 s é para alteração de membro, medida em 0,14 s). (`resultado-F0-2.md`)
28. **Banco local cifrado** exige ligar `"op-sqlite": { "sqlcipher": true }` no `package.json` e gerar o app de novo. (`resultado-F0-2.md`)

## Evidências por item

| Item | Pasta (depois da junção) | Relatório do QA |
| --- | --- | --- |
| Máquina (F0-0) | `docs/prova-tecnica/evidencias/F0-0/`, `docs/prova-tecnica/ambiente.md` | `docs/prova-tecnica/qa/F0-0-rodada-1.md` |
| Base (F0-1) | `docs/prova-tecnica/evidencias/F0-1/` | `docs/prova-tecnica/qa/F0-1-rodada-1.md` |
| 1. Sincronização (F0-2) | `docs/prova-tecnica/evidencias/F0-2/` | `docs/prova-tecnica/qa/F0-2-rodada-1.md` |
| 2. Lembrete (F0-3) | `docs/prova-tecnica/evidencias/F0-3/` | `docs/prova-tecnica/qa/F0-3-rodada-1.md` |
| 3. Link (F0-4) | `docs/prova-tecnica/evidencias/F0-4/` | `docs/prova-tecnica/qa/F0-4-rodada-1.md` |
| 4. Verificação, parte local (F0-5) | `docs/prova-tecnica/evidencias/F0-5/` | `docs/prova-tecnica/qa/F0-5-rodada-1.md` |
| Serviços registrados | `docs/infra.md` (sem segredos) | `docs/prova-tecnica/qa/INF-01-rodada-1.md`, `F0-G-rodada-1.md` |
