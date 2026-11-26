# F0-7 · resultado da prova, primeira vez · rodada 1 · REPROVADO (3 ajustes de texto)

Data: 2026-11-25 · Entregue por: pane-675 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, D, F0-7 (aceite e evidência); relatórios do QA de F0-0 a F0-5, F0-G e INF-01; `CLAUDE.md`; pedido do piloto: cada número conferido contra os relatórios do QA, item 4 pendente, prova incompleta, nenhum segredo nem dado pessoal.
Alvo: `docs/prova-tecnica/resultado.md` (novo, 295 linhas) e `docs/infra.md` (seção "Prova técnica F0: serviços locais e serviços ainda não criados", mais a nota de estado do GitHub), em `C:\campinguim`, sem commit.

## O que está certo

- **Situação:** "INCOMPLETA", com o item 4 "PENDENTE", no topo, na tabela do responsável, na seção do item 4 e na tabela "Aposta por aposta". O plano manda isso na primeira vez. A "Junção dos trabalhos" está pendente, como pediu o piloto.
- **Números conferidos um a um contra os relatórios do QA:**
  - Item 1 (F0-2): 93 de 93; P3b 10/10; 4 de 107 refeitas; P8 com 5 de 10 acima de 30 s desde o modo avião (30,2 a 34,5 s) e pior de 20,8 s desde que o app alcança o servidor; online 20/20, mediana de 0,14 s e pior de 1,2 s; 37 de 37; vídeos de 73,9 s e 52,8 s; tabela da r3 linha por linha.
  - Item 2 (F0-3): (a) 0,8 a 1,7 s, mediana 1,05 s; (b) 0,7 a 1,8 s, mediana 1,1 s; (c) 0,7 a 3,7 s, mediana 1,75 s, com o boot entre 17 e 30 s; (d) 5/5; (e) 16,5 a 20,5 s, mediana 16,7 s, e em tempo real 5,9 a 228,6 s, mediana 159,1 s; (f) 3/3; vídeo de 11,8 s; primeiro agendamento perdido em 300 s.
  - Item 3 (F0-4): 10/10 em cada caso; mediana de 721 ms e pior de 988 ms; `1024` e `approved`; (e) 5/5 no navegador; fumaça 5/5 e 5/5; link prevalece 3/3 e 3/3.
  - Item 4 (F0-5): 54/54 e 89/89; 4 mutações; 403 com o mesmo corpo.
  - Base: RLS 19/19; Maestro 4 de 6; 7.982 MB, mais 5,6 GB e 3,7 GB.
- **Rodadas do QA:** F0-2 reprovada 1 vez, F0-3 2 vezes por evidência, F0-1, F0-4 e F0-5 de primeira. Confere.
- **Pontos J 1 a 28:** cada um bate com a observação citada, F0-2 obs. 1 a 8, F0-3, F0-4 e F0-5. Os quatro pontos novos do piloto estão lá: 1 (fila travada pelas viagens de teste), 4 (marca do aparelho ligada ao login), 9 (permissões sem uso na B1) e 10 (primeiro lembrete perdido).
- **Licença do PowerSync:** Apache 2.0 desde 03/11/2026, igual ao plano, B2. Cadastro aberto desligado, telemetria desligada e MongoDB sem porta: igual a `ambiente.md`.
- **Checagem de G nos dois arquivos, feita pelo QA:** 0 ocorrências de `ghp_`, `github_pat_`, `sk-`, `sb_secret_`/`sb_publishable_` com valor, JWT, `AKIA`, `AIza`, chave privada, usuário do Windows, `C:\Users`, `AppData`, `.claude`, `.overclock`, `campinguim-wt` e endereço de e-mail. O único "digo." encontrado é de "código.". Não há travessão em `resultado.md`. `run.app` aparece em `infra.md` só no texto da divergência da INF-01, que já foi aprovado.
- **Escopo:** nenhum commit, e nada fora de `docs/`.

## Itens para corrigir

1. **`resultado.md`, item 2, linha do caso (a):** o texto diz "app fechado pela lista de recentes: 10 de 10". Os números (0,8 a 1,7 s) são das rodadas finais, em que o app foi fechado pela **remoção da tarefa** (`cmd activity stack remove`), não pelo deslize. O ponto 16 já diz isso, mas a linha do quadro, sozinha, afirma um modo que não foi o medido. Escreva na própria linha algo como "app fechado (remoção da tarefa, processo morto; deslize real só nas rodadas anteriores e na recaptura, ver ponto 16)".
2. **`resultado.md`, item 2, parágrafo de abertura:** "permissão de aviso e alarme exato concedidos pelas telas do sistema nos casos (a), (b) e (c)". O QA conferiu que o alarme exato estava **concedido** (`exactAllowReason=permission` em `alarme-agendado.txt`), mas não **como** foi concedido. No caso (d), só a 1ª execução usou a tela real, e as outras usaram `pm revoke`. Cite a evidência de que foi pela tela do sistema ou troque por "concedidos (conferido no registro do alarme: `exactAllowReason=permission`)".
3. **`infra.md`, tabela "O que roda na máquina", linha dos emuladores:** "Os AVDs temporários da F0-3, F0-4 e F0-5 foram apagados e conferidos pelo QA". O QA conferiu a remoção do `campinguim-c` (F0-3) e do `campinguim-d` (F0-4). O relatório da F0-5 registra a derrubada da pilha isolada (0 contêineres, 0 volumes), e nenhum AVD dela. Tire a F0-5 da frase ou cite onde está a remoção do AVD da F0-5.

## Observações (não reprovam)

1. **Caminho do worktree nos relatórios do QA** (`C:\campinguim-wt\...`), como a entrega avisou. Não tem usuário do Windows, mas mostra a organização da máquina. A decisão de mascarar antes do envio é do piloto, e os relatórios são do QA: se ele pedir, o QA troca por `<worktree F0-x>`.
2. **"Encerramento dos processos locais"** fica pendente até a F0-INT fechar, por decisão do piloto. O aceite da F0-7 ("nenhum processo da prova rodando") só se cumpre na segunda vez, ou quando o piloto registrar o encerramento.

---

# Rodada 2 · 2026-11-26 · APROVADO

Entregue por: pane-675 (caiu com o reinício do app, antes da conferência) · Conferido por: QA (pane-676, assumiu o papel do pane-646 com o mesmo padrão).
Alvo: `docs/prova-tecnica/resultado.md` (295 linhas) e `docs/infra.md`, em `C:\campinguim`, sem commit. Os dois arquivos foram gravados em 25/11 às 04:45, depois do relatório da rodada 1 (04:44).

## Os 3 ajustes da rodada 1

| # | Resultado do QA |
| --- | --- |
| 1. Linha do caso (a) do item 2 | ok. A própria linha diz agora que, nas 10 execuções finais, o app foi fechado pela remoção da tarefa (`cmd activity stack remove`, processo morto, alarme mantido), e que o deslize real foi usado só nas rodadas anteriores e na recaptura da imagem (ponto 16). Bate com o `resultados.json` de (a): o campo `como_fechou` é o mesmo nas 10, "remover a tarefa pelo sistema" |
| 2. Abertura do item 2 ("pelas telas do sistema") | ok. O texto diz que o QA conferiu o alarme exato no registro (`exactAllowReason=permission` em `alarme-agendado.txt`) e que a concessão pelas telas do sistema é afirmação da entrega, não conferida pelo QA |
| 3. `infra.md`, linha dos emuladores | ok. A frase separa o que o QA conferiu (`campinguim-c` da F0-3 e `campinguim-d` da F0-4) do que só a entrega da F0-5 afirma (o AVD de captura dela, "não conferido pelo QA"). **Conferido agora pelo QA:** `emulator -list-avds` em 26/11 lista só `campinguim-a` e `campinguim-b`. O AVD de captura da F0-5 (que também se chamava `campinguim-c`, segundo o LEIA-ME dela) não existe mais |

## Números recalculados pelo QA a partir dos dados brutos

Nada foi aceito só do texto. Fontes: os worktrees `C:\campinguim-wt\F0-2`, `F0-4` (que contém a F0-3) e `F0-5`, sem nada alterado neles.

- **Item 1 (F0-2), `execucoes.jsonl`, rodada r3:** 107 tentativas; válidas P1 10, P2 10, P3 10, P3b 10, P4 10 (3 refeitas), P5 10 (1 refeita), P6 10, P7 3, P8 10, P9 10, P10 10; todas `ok`, `problemas` vazio, A e B `iguais`. Sem o P3b: **93 de 93**. Refeitas **4 de 107**. Convergência desde o app: pior 7,7 s nos curtos, 13,0 s no P7, 20,8 s no P8. **P8 desde o modo avião: 30,2; 30,6; 33,1; 33,3 e 34,5 s acima de 30 s, e as outras 5 de 28,6 a 29,9 s.** É exatamente o que o `resultado.md` traz (D4 e tabela). `medida-online-r3.json`: 20 de 20, mediana 137 ms, pior 1227 ms, 0 acima de 5 s. `testes-servidor.txt`: 37 de 37. Vídeos pelo `ffprobe`: 73,87 s e 52,80 s.
- **Item 2 (F0-3), `resultados.json` de cada caso:** (a) 10/10, 0,8 a 1,7 s, mediana 1,05 s; (b) 10/10, 0,7 a 1,8 s, mediana 1,1 s; (c) 10/10, 0,7 a 3,7 s, mediana 1,75 s, alarme de volta entre 17 e 30 s depois do boot. Em todas: modo avião ligado no agendamento e no aviso, relógio adiantado 60 s depois do horário, toque abrindo a viagem (30 de 30). O atraso recalculado (aviso menos relógio adiantado) bate com o registrado. (d) 5/5, 0 quebras, 1ª pela tela do sistema e 4 por `pm revoke`. (e) 16,5 a 20,5 s, mediana 16,7 s. Tempo real: 5,9; 132,5; 159,1; 200,3 e 228,6 s, com 5 a 9 min de antecedência. (f) 3/3. Vídeo: 11,79 s.
- **Item 3 (F0-4), `resultados.json` de cada caso, comparando o id do link com o id na tela, sem usar o campo `certo`:** (a) 10/10 COLD, mediana 721 ms e pior 988 ms; (b) 10/10; (b-fundo) 10/10 HOT; (c) 10/10 com a mensagem; (d) 10/10. Fumaça (a) 5/5 e (b) 5/5; link prevalece 3/3 e 3/3. `pm-get-app-links.txt`: `1024` e `approved`. (e) 5/5 no navegador.
- **Item 4 (F0-5):** **rodado pelo QA** com o Node do sistema (v24.19.0): `node --test testes/verificacao.test.mjs testes/verificacao-app.test.mjs` = **54 de 54**, exit 0. O worktree ficou limpo. Os 89 de 89 da suíte inteira precisam da pilha isolada e não foram repetidos, porque os emuladores e a pilha agora são do agente da junção. Valem o `testes.txt` (89 pass, 0 fail) e a rodada 1 da F0-5, em que o QA rodou a suíte.
- **Base:** RLS 19/19, Maestro 4 de 6 e 7.982 MB conferem com o relatório da F0-1. WHPX confere com o da F0-0.

## O que mais o piloto pediu

- **Item 4 PENDENTE e prova INCOMPLETA:** ok, no topo, na tabela do responsável, no título e no texto do item 4 e na tabela "Aposta por aposta".
- **Decisão do responsável de 24/11 (a base pode começar sem o Google Play):** ok. Está registrada como decisão tomada, sem nova pergunta, na seção "O que você precisa validar", que pede só a validação dos itens 1 a 3. O plano (H9 e J1, mudança não commitada) diz o mesmo.
- **"Junção dos trabalhos":** ok, marcada **PENDENTE**, com o que deve entrar nela e a regra de integrar só por squash.
- **Checagem de G em `docs/`, feita pelo QA:** 0 valores de segredo (JWT, `sb_secret_`/`sb_publishable_` com valor, `ghp_`, `github_pat_`, `AKIA`, `AIza`, chave privada). 0 nome de usuário do Windows e 0 e-mail pessoal. Os únicos e-mails são o noreply da conta, já público, e `c@usuarios-prova.test`, de teste. As ocorrências de `gmail`, `C:\Users`, `AppData` e `.claude` são textos que descrevem buscas, ou nomes de marca na descrição das capturas antigas. Em `resultado.md` e na seção nova de `infra.md`: 0 caminhos de máquina e 0 travessões. `run.app`, `pages.dev` e `workers.dev` aparecem só em textos de documentação (o registro da Cloudflare e a divergência da INF-01, já aprovados, e o plano), e nunca em código.
- **Escopo:** nenhum commit, e nada mudou fora de `docs/`.

## Observações (não reprovam; para o piloto)

1. **A "mediana" das tabelas da F0-2 é o valor do meio de baixo** (`resumo.mjs`, `mediana`), não a média dos dois do meio, como na F0-3. Exemplos: P4 0,5 s (pela conta usual, 0,60 s), P6 0,5 s (0,63 s) e P8 15,9 s (16,07 s). A diferença é de até 0,2 s, não muda nenhum veredito, e a tabela é a aprovada na F0-2. Na B1, usar uma definição só.
2. **Correção no histórico do QA:** a rodada 1 da F0-2 diz "29,3 a 34,5 s" para as 5 execuções do P8 acima de 30 s. Pelo registro bruto, as 5 vão de **30,2 a 34,5 s**, como está no `resultado.md`. O 29,3 s é uma das 5 que ficaram abaixo de 30 s.
3. **Memória do PowerSync e do MongoDB** (`resultado.md`, "Versões…": de 93 a 283 MB e de 92 a 192 MB "em três leituras") está atribuída à entrega da F0-1, e não ao QA. A evidência guardada (`evidencias/F0-1/memoria-livre.txt`) tem uma leitura só, de 96,8 MiB e 192,2 MiB, dentro das faixas. A regra do próprio documento é "só entra número que o QA conferiu", e este número está marcado como da entrega. Não é critério da prova.
4. **"O atraso máximo é de 75% do tempo que falta"** (D2, opção 2) é leitura da janela do `dumpsys alarm` (`+22m29s` para 30 min) e dos 5 avisos em tempo real, todos dentro dessa janela. É coerente com a evidência, mas não é um teto garantido pelo Android, que pela documentação vai até cerca de 1 h. O texto já cita a hora logo em seguida.
5. **A observação 2 da rodada 1 continua valendo.** O "Encerramento dos processos locais" fica pendente até a F0-INT fechar. O aceite "nenhum processo da prova rodando" só se cumpre quando o piloto registrar esse encerramento.

**F0-7, primeira vez: APROVADA.** O documento fica com a prova **INCOMPLETA**, item 4 **PENDENTE** e a "Junção dos trabalhos" **PENDENTE**, como o plano e o piloto mandam.

---

# Complemento (junção e encerramento) · rodada 1 · 2026-11-26 · REPROVADO (1 item)

Entregue por: pane-679 · Conferido por: QA (pane-676).
Alvo: `docs/prova-tecnica/resultado.md`, sem commit. O diff entregue (antes e depois) é **igual** ao estado do arquivo no disco: o QA refez o diff e comparou linha por linha.

## O que passou

- **Topo e "O que falta":** a prova continua **INCOMPLETA**, só pelo item 4 (**PENDENTE**). A junção está aprovada e o trabalho para para a validação humana dos itens 1 a 3. A entrada no `main` é só por squash, num único commit "F0: prova técnica".
- **"Junção dos trabalhos":** commits, conflitos, contagens (218, 214 e 211) e fumaça batem com o relatório `F0-INT-rodada-1.md` (rodadas 1 e 2) e com a conta do QA.
- **Caminhos no ramo:** o QA repetiu as contas no worktree da junção, na ponta `806b938`. São 1.261 arquivos: F0-0 11, F0-1 14, F0-2 17, F0-3 57, F0-4 64, F0-5 5 e F0-integracao 54. Tudo igual ao texto. As correções de `manifesto-links.txt` e `resumo.md` (pasta `F0-4/`) estão certas.
- **Encerramento:** conferido agora pelo QA, com `docker ps -a` vazio e nenhum `qemu-system` nem `emulator.exe` no `tasklist`.
- **Checagem de G no `resultado.md`:** 0 travessões, 0 usuário do Windows, 0 caminho de máquina, 0 e-mail, 0 chave e 0 dos três domínios.

## Item que reprova

| # | Onde | Problema | O que fazer |
| --- | --- | --- | --- |
| 1 | "Conferência dos caminhos de evidência", item 2 (ressalva), e a linha da tabela com `infra.md`, `plano.md` e `ambiente.md` ("existem") | **A lista do que falta no ramo está incompleta.** O piloto vai usar essa lista para montar o squash, e o que faltar nela fica fora do repositório público. A conferência do QA, caminho por caminho, achou mais 3 casos: (a) **`docs/prova-tecnica/qa/F0-INT-rodada-1.md`**, citado como fonte no começo da própria seção "Junção dos trabalhos", não está no ramo e não aparece na ressalva. (b) **`docs/infra.md`** existe no ramo, mas na versão antiga. O ramo não tem a seção da Cloudflare nem a seção "Prova técnica F0: serviços locais…" (diff de 109 linhas com a árvore principal), e o `resultado.md` aponta para ela em "Serviços registrados". (c) **`docs/prova-tecnica/plano.md`** existe no ramo, mas sem a decisão de 24/11 em H9 e J1 (diff de 12 linhas), que o `resultado.md` cita | Completar a ressalva com: `qa/F0-INT-rodada-1.md`; as mudanças ainda não commitadas de `docs/infra.md` e de `docs/prova-tecnica/plano.md`; e, para o squash ficar inteiro, `qa/F0-7-rodada-1.md`. Na tabela, trocar "existem" por "existem, mas na versão anterior; a versão citada está só na árvore principal, sem commit" para `infra.md` e `plano.md`. Só texto, sem commit |

## Complemento · rodada 2 · 2026-11-26 · APROVADO

- O diff entregue é igual ao estado do arquivo no disco. Mudou só texto, sem commit.
- **Tabela:** `infra.md` e `plano.md` agora dizem "existem, mas na versão anterior; a versão citada está só na árvore principal, sem commit". O `ambiente.md` ficou numa linha própria, como "existe".
- **Ressalva:** a lista agora tem `resultado.md`, `qa/F0-1` a `F0-5`, `INF-01`, `F0-INT-rodada-1.md` (citado como fonte) e `F0-7-rodada-1.md`, todos ausentes do ramo. Tem também `infra.md` (109 linhas a menos) e `plano.md` (12 linhas a menos, sem a decisão de H9 e J1), que estão no ramo em versão anterior. Bate com a conferência do QA, caminho por caminho.
- **Checagem de G:** 0 travessões, 0 usuário do Windows, caminho de máquina, e-mail ou domínio proibido.
- **F0-7, primeira vez, com complemento: APROVADA.** A prova fica **INCOMPLETA** só pelo item 4 (**PENDENTE**). A junção está feita e aprovada, e nenhum processo da prova está rodando. O trabalho para para a **validação humana dos itens 1 a 3**. Para o piloto: o squash "F0: prova técnica" precisa levar o ramo `feature/F0-integracao` e também os arquivos listados na ressalva, que hoje estão só na árvore principal, sem commit. Esse envio passa antes pela checagem de G.
