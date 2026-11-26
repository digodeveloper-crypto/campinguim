# F0-INT · junção dos trabalhos da prova · rodada 1 · REPROVADO (2 ajustes no registro, nenhum no código)

Data: 2026-11-26 · Entregue por: pane-677 (retomada depois do reinício) · Conferido por: QA (pane-676)
Base: pedido do piloto (junção de F0-5, F0-4 com F0-3 e F0-2; tsc, testes do servidor do zero, build e fumaça reduzida; nada aprovado muda de comportamento; conflitos resolvidos só no necessário; evidências aprovadas intactas; checagem G); `docs/prova-tecnica/plano.md`, G e PROPOSTA 3; `CLAUDE.md`; regra do piloto de 25/11 sobre imagens.
Alvo: worktree `C:\campinguim-wt\F0-integracao`, ramo `feature/F0-integracao`, ponta `bc1a8fe`, sobre `fb54ca9`. Merges `cfcf47c` (F0-5 `01fa6de`), `81dcad8` (F0-4 `88015ad`, com a F0-3 `39aef77`) e `b0aa168` (F0-2 `7f78a41`), mais `55d1d18` e `bc1a8fe`. Só local. Autor e quem gravou nos 19 commits: noreply.

**Resumo:** a junção do código está certa e foi conferida rodando. O QA rodou tsc, configuração, `db reset` do zero, a suíte da pilha padrão e a da pilha paralela. A reprovação é só pelo `LEIA-ME.md` da evidência, que tem uma contagem errada e cita três arquivos que não vão para o repositório.

## Aceite

| Critério | Resultado do QA |
| --- | --- |
| Conflitos resolvidos só no necessário | ok. **Conferido arquivo por arquivo pelo QA.** Entre `fb54ca9` e `b0aa168` mudaram 218 arquivos. Só 4 foram mudados por mais de uma ponta: `_layout.tsx`, `textos.ts`, `prova/LEIA-ME.md` e `config.jsonc`. Nos 4, a junção é a soma das pontas. Cada linha que uma ponta não traz é linha que a outra ponta mudou ou acrescentou, e a única linha nova é uma linha em branco no `_layout.tsx` (`git show --cc`). Os outros **214** arquivos, em `b0aa168`, são idênticos à única ponta que os mudou |
| Nada aprovado mudou de comportamento | ok. Fora dos merges, há só dois commits. `55d1d18` acrescenta 3 linhas em `pilha-paralela.mjs`: as senhas de D e E, que o `semear.mjs` da F0-2 exige. `bc1a8fe` faz `rodar.mjs` e `lembretes/roteiro.mjs` aceitarem `EVIDENCIAS_DIR`, e sem a variável o caminho é o de antes. `git diff 55d1d18 HEAD -- prova/app` está vazio. O `config.jsonc` juntado leva o `jwt_expiry` de 180 s da F0-2 também à pilha da F0-5, e a suíte da F0-5 passa com ele (89/89) |
| Evidências aprovadas intactas | ok. `git diff` entre cada ponta aprovada e `HEAD` está vazio em `evidencias/F0-2` (`7f78a41`), `F0-3` e `F0-4` (`88015ad`) e `F0-5` (`01fa6de`). `F0-0` e `F0-1` não mudaram desde `fb54ca9`. A linha que a primeira fumaça pôs no `execucoes.jsonl` da F0-2 não está no ramo |
| tsc | ok. **Rodado pelo QA** (Node 24.19.0): `npx tsc --noEmit`, exit 0 |
| Configuração | ok. **Rodado pelo QA:** 5 de 5, exit 0 |
| Testes do servidor do zero, pilha padrão | ok. **Rodado pelo QA:** `prova.mjs subir --sem-emuladores` e `supabase db reset`, que aplicou as 3 migrações; depois `semear` (A a E) e o reinício do PowerSync. `npm run testar` deu **107 testes, 96 ok, 0 falhas e 11 pulados**, exit 0. Os 11 pulados são todos "pilha sem o dublê de teste", que é o esperado. O servidor de funções subiu junto, sem o problema do 503 que a entrega registrou |
| Testes do servidor do zero, pilha paralela F0-5 | ok. **Rodado pelo QA:** 89 de 89, 0 pulados, exit 0. Ver a observação 2 sobre a primeira tentativa do QA |
| Build | ok. O APK é de 25/11 às 04:49, depois do merge `b0aa168` (04:38). Nenhum arquivo do app é mais novo que o APK. SHA-256 começa por `0e55876efb72e2f2`, como diz a entrega. **O pacote JS do APK foi lido pelo QA:** tem os textos dos lembretes, dos links e da verificação, o aviso da véspera, `useLastNotificationResponse` e `redirectSystemPath`, ou seja, as 4 tarefas juntas. `run.app` e `pages.dev`: 0. JWT: 0. O único `sb_secret_` é um pedaço de texto de biblioteca (`…GetVectorsb_secret__expo_chunk…`), sem chave |
| Fumaça | ok. **Recalculada pelo QA a partir dos registros brutos:** P1 3/3, com 10 aplicadas em cada, A e B iguais ao servidor e convergência de 0,6, 1,8 e 1,9 s desde o app (3,8, 4,2 e 4,3 s desde o modo avião). P9 1/1, com 5 recusadas e avisadas. Lembrete (a) 3/3: alarme exato `permission`, modo avião no agendamento e no aviso, **deslize real** na lista de recentes, atraso de 0,5, 0,3 e 0,3 s, e toque abrindo a viagem `…c3`. Links: (a) 3/3 COLD, mediana 719 ms (656, 719 e 751); (b) 3/3; (d) 3/3; (c) 1/1 e id inválido com a mensagem certa. A conta foi feita comparando o id do link com o id na tela |
| Checagem G | ok. Nos 50 arquivos de `bc1a8fe` e no diff inteiro `fb54ca9..HEAD`: 0 usuário do Windows, 0 `C:\Users`, 0 e-mail pessoal (só os de teste `d@`/`e@usuarios-prova.test`), 0 JWT, 0 chave com valor. `run.app`, `pages.dev` e `workers.dev` aparecem só no texto que descreve a busca. `LOCALAPPDATA` e `SERVICE_ROLE_KEY` são leituras de variável já aprovadas na F0-2 e na F0-3. O caminho no aviso do Node está mascarado como `<raiz>`. Os 3 `.log` ignorados também não têm token, caminho ou usuário |
| Imagens (regra do piloto) | ok. O QA viu as 8 PNG novas lado a lado. São a barra de avisos (só o aviso do Campinguim e avisos do sistema Android: "Set a screen lock" e "Serial console enabled"), as telas da viagem, a de id inválido e a de links. Nenhuma tela inicial, ícone nem nome de app de terceiro. Não há vídeo |
| Limpeza | ok depois da conferência: 0 contêineres, `git status` vazio. O `prova/.env.local` (ignorado) voltou ao lugar depois dos testes do QA |

## Itens para corrigir

| # | Onde | Problema | O que fazer |
| --- | --- | --- | --- |
| 1 | `docs/prova-tecnica/evidencias/F0-integracao/LEIA-ME.md`, linha 40 | Diz "Os outros **213** arquivos mudados desde `fb54ca9` são idênticos à ponta […] (`git diff --quiet <ponta> HEAD`: 0 diferenças)". O número e o comando não batem. Em `b0aa168` são **214** idênticos (218 menos os 4 dos conflitos). Em `HEAD`, são **211**, porque `rodar.mjs`, `lembretes/roteiro.mjs` e `pilha-paralela.mjs` mudaram depois, em `55d1d18` e `bc1a8fe` | Trocar por algo como: "Os outros 214 arquivos mudados entre `fb54ca9` e `b0aa168` são idênticos à única ponta que os mudou. Em `HEAD`, 211 continuam idênticos, e os 3 restantes mudam só pelos dois ajustes descritos em 'O que mudou na junção'". Refazer a conta antes de escrever |
| 2 | Mesmo `LEIA-ME.md`, tabela da fumaça, coluna "Arquivo" | Cita `fumaca-sincronizacao.log`, `fumaca-lembrete-a.log` e `fumaca-links.log` como evidência. Os três são ignorados pelo `.gitignore` (`*.log`, linha 42) e **não estão no commit**. Num repositório público, quem conferir não vai achar esses arquivos | Ou versionar os três com outra extensão (por exemplo `.txt`; o QA conferiu que estão limpos: 54 linhas, sem token, caminho ou usuário), ou tirar a citação e deixar só os arquivos versionados. Commit local no mesmo ramo, citando F0-INT. A mesma regra vale para `antes-do-reinicio/`, que também tem `.log` ignorados, mas a tabela não os cita |

## Observações (não reprovam; para o piloto)

1. **Integração no `main` só por squash** (PROPOSTA 3). Os merges trazem o histórico da F0-3, com o vídeo e as imagens antigas com ícones de terceiros (`2dfa308`). O ramo `feature/F0-integracao` **não pode ir ao GitHub commit a commit**.
2. **A primeira tentativa do QA na pilha paralela deu 80 de 89.** As 9 falhas eram `assinatura_invalida` em vez do motivo esperado. Causa, confirmada: o `subir` da pilha paralela parou porque o `prova/.env.local` da pilha padrão já existia (proteção do script). Ele já tinha gravado o segredo do dublê e ligado o servidor de funções. Depois que o QA tirou o `.env.local` do lugar, o segundo `subir` gravou um segredo novo, mas o servidor de funções, que já estava rodando, ficou com o antigo. Com `derrubar` e `subir` limpos, deu 89/89. **Não é da junção.** Para a B1: o `subir` deveria recusar antes de ligar qualquer coisa, ou reiniciar o servidor de funções quando o segredo muda.
3. **As permissões do lembrete na fumaça foram dadas por comando** (`pm grant` e `appops`), não pelas telas do sistema. A entrega diz isso, e a fumaça não substitui as medições da F0-3.
4. **`jwt_expiry` de 180 s** vem da F0-2 e agora vale para a árvore inteira da prova. Já é o ponto 6 do `resultado.md` ("não copiar para a base").
5. **Ao fechar, a seção "Junção dos trabalhos" do `resultado.md` pode ser completada** com o ramo, os 4 conflitos, os resultados acima e a confirmação de que os caminhos de evidência existem. Também falta o "Encerramento dos processos locais": hoje há 0 contêineres e 0 emuladores.

---

# Rodada 2 · 2026-11-26 · APROVADO

Alvo: commit `806b938`, sobre `bc1a8fe`, com autor e quem gravou no noreply. Mudam 7 arquivos, todos em `docs/prova-tecnica/evidencias/F0-integracao/`. Nada mudou fora dessa pasta, e o worktree está limpo.

| Item da rodada 1 | Resultado do QA |
| --- | --- |
| 1. Contagem da linha 40 | ok. O texto agora diz: 218 arquivos em `fb54ca9..b0aa168`, menos os 4 dos conflitos, dá 214. São 214 de 214 idênticos em `b0aa168` e 211 de 214 em `HEAD`, e os 3 que diferem são nomeados (`pilha-paralela.mjs`, `rodar.mjs` e `lembretes/roteiro.mjs`). Os números batem com a conta do QA na rodada 1 |
| 2. Registros `.log` fora do commit | ok. `fumaca-sincronizacao.txt`, `fumaca-lembrete-a.txt` e `fumaca-links.txt` estão versionados, com 16, 7 e 31 linhas, o mesmo tamanho dos `.log` que o QA leu. Os 3 de `antes-do-reinicio/` também viraram `.txt`. A tabela aponta para os `.txt`, e o LEIA-ME registra a troca. Não sobrou nenhum `.log` na pasta. O conteúdo confere com a fumaça recalculada: P1 com 3,8, 4,2 e 4,3 s, P9 com 4,8 s e lembrete (a) 3 de 3 |

- **Checagem de G nos 7 arquivos:** 0 achados. Nenhum usuário do Windows, caminho, e-mail, token, link `entrar?t=` nem os três domínios, e nenhum código de cor do terminal.
- **F0-INT aprovada.** Ramo `feature/F0-integracao`, ponta `806b938`, só local. As observações 1 a 5 da rodada 1 continuam valendo e vão ao piloto. A principal: integrar no `main` **só por squash**.
