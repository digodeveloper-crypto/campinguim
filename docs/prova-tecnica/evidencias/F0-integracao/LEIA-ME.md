# F0-INT · junção dos trabalhos aprovados da prova técnica

Ramo `feature/F0-integracao`, saído de `fb54ca9`. Junta, sem squash, as pontas aprovadas pelo QA:

| Tarefa | Ponta juntada | Commit da junção |
| --- | --- | --- |
| F0-5 verificação do aparelho (parte local) | `01fa6de` | `cfcf47c` |
| F0-4 link, com a ponta da F0-3 lembrete (`39aef77`) dentro | `88015ad` | `81dcad8` |
| F0-2 sincronização | `7f78a41` | `b0aa168` |
| Ajuste de convivência (pilha paralela) | — | `55d1d18` |
| Ajuste de convivência (roteiros gravam fora das evidências aprovadas) e este registro | — | commit `F0-INT` desta entrega |

Regra da tarefa: só o necessário para os trabalhos conviverem. Nenhuma função nova, nenhuma mudança de comportamento, nenhuma correção de pendência deixada para a B1.

## Tarefa retomada depois de um reinício

O primeiro ajudante desta tarefa foi derrubado por um reinício do app no meio da fumaça (25/11). A tarefa foi retomada em 26/11 por outro ajudante, que:

- conferiu de novo os 4 commits da junção (abaixo);
- desfez o único efeito colateral encontrado: a fumaça de sincronização anterior tinha acrescentado 1 linha a `docs/prova-tecnica/evidencias/F0-2/execucoes.jsonl`, evidência aprovada da F0-2. O arquivo voltou ao commit com `git checkout`, e os roteiros passaram a gravar aqui (ver "O que mudou na junção");
- **reaproveitou** só o build Android (`build-android.txt`, 25/11): o código do app não mudou desde `55d1d18` (`git diff 55d1d18 -- prova/app` vazio), e o APK é o mesmo (SHA-256 começa por `0e55876efb72e2f2`);
- **rodou de novo** todo o resto, porque os registros anteriores não mostravam que o app estava com dados limpos e sem login no lembrete e nos links (o roteiro de links semeou viagens de teste no `emulator-5556`, que depois foi usado na sincronização), e porque a sincronização tinha parado por memória livre abaixo de 2048 MB (P1 1 de 3, P9 não rodou).

Os registros da primeira tentativa ficaram em `antes-do-reinicio/`, só como histórico. Os registros de execução das fumaças, antes `.log`, que o `.gitignore` ignora, estão versionados como `.txt`, os desta pasta e os de `antes-do-reinicio/`. No `fumaca-links.txt` antigo, só os códigos de cor do terminal foram tirados. Os números desta entrega são os da retomada.

## O que conflitou e como foi resolvido

Só 4 arquivos foram mudados por mais de um ramo. Em todos, a resolução é a **soma dos dois lados**, sem mudar nenhuma linha que veio de um ramo:

| Arquivo | Ramos | Resolução |
| --- | --- | --- |
| `prova/app/app/_layout.tsx` | F0-3/F0-4 e F0-2 | Conflito no merge da F0-2. Ficam os dois: o gancho que abre a tela da viagem ao tocar no aviso (F0-3) e o início da sincronização com sessão guardada (F0-2), nessa ordem. O import de `react` traz `useEffect` e `useRef`. |
| `prova/app/src/textos.ts` | F0-5 e F0-3/F0-4 | Conflito no merge da F0-4. Os blocos `verificacao` (F0-5), `lembretes` e `links` (F0-3/F0-4) foram acrescentados no mesmo ponto; ficam os três. |
| `prova/LEIA-ME.md` | F0-5 e F0-3/F0-4 | Juntou sozinho: linhas da F0-5 (função de teste e pilha paralela) e das pastas `lembretes/` e `links/`. |
| `prova/servidor/supabase/config.jsonc` | F0-5 e F0-2 | Juntou sozinho: `jwt_expiry` de 180 s (F0-2) e o bloco `functions` (F0-5). |

Conferência feita na retomada:

- Para cada um dos 4 arquivos, a diferença entre a junção e cada ponta é só o que a outra ponta acrescentou.
- Os merges mudam 218 arquivos desde `fb54ca9` (`git diff --name-only fb54ca9 b0aa168`). Tirando os 4 acima, sobram 214. Cada um foi comparado com a ponta do único ramo que o mudou (laço com `git diff --quiet <ponta> <ref> -- <arquivo>`):
  - em `b0aa168`, o último merge: **214 de 214 idênticos**;
  - em HEAD: **211 de 214 idênticos**. Os 3 que diferem são só os ajustes descritos em "O que mudou na junção": `prova/servidor/scripts/pilha-paralela.mjs` (`55d1d18`), `prova/e2e/sincronizacao/rodar.mjs` e `prova/lembretes/roteiro.mjs` (commit do `EVIDENCIAS_DIR`).
- `git merge-base --is-ancestor 39aef77 HEAD`: a ponta aprovada da F0-3 está dentro.

## O que mudou na junção (fora dos merges)

1. **`55d1d18`, `prova/servidor/scripts/pilha-paralela.mjs`:** a pilha paralela da F0-5 passa a gerar também `SENHA_TESTE_D` e `SENHA_TESTE_E`. Depois da junção, o `semear.mjs` da F0-2 cria os usuários D e E e exige essas senhas; sem elas a pilha paralela parava em "semear.mjs falhou". No ramo da F0-5 isso não acontece, porque lá só existem A, B e C. É encontro da junção. São 3 linhas, sem mudança de regra.
2. **Commit desta entrega, `prova/e2e/sincronizacao/rodar.mjs` e `prova/lembretes/roteiro.mjs`:** os dois roteiros passam a aceitar `EVIDENCIAS_DIR`, como o roteiro de links da F0-4 já aceitava. Sem a variável, continuam gravando em `evidencias/F0-2` e `evidencias/F0-3`, como antes. É o que permite rodar a fumaça da junção sem tocar nas evidências aprovadas. O app e o servidor não mudam.

## Fumaça na árvore juntada (retomada, 26/11/2026)

Node do sistema v24.19.0. Emuladores `campinguim-a` (`emulator-5554`) e `campinguim-b` (`emulator-5556`), todo `adb` com `-s`. Pilha padrão `campinguim-prova` (Supabase local e PowerSync) e pilha paralela `campinguim-f0-5` (com o dublê da F0-5).

| Item | Exigido | Resultado | Arquivo |
| --- | --- | --- | --- |
| tsc do app | saída 0 | saída 0 | `tsc.txt` |
| Testes de configuração (depois do build, com o manifesto gerado) | passar | 5 de 5, saída 0 | `testes-configuracao.txt` |
| Banco do zero | `db reset` | 3 migrações aplicadas (`f0_base`, `f0_5_verificacao`, `f0_2_sincronizacao`); `semear` cria A, B, C, D e E; PowerSync reiniciado | `db-reset.txt` |
| Testes do servidor, pilha padrão | todas as suítes | 107 testes: **96 ok, 0 falhas**, 11 pulados (são os que precisam do dublê e rodam na pilha paralela), saída 0. Inclui RLS, acesso entre viagens, configuração, sincronização (segunda barreira) e verificação | `testes-servidor-pilha-padrao.txt` |
| Testes do servidor, pilha paralela (F0-5, do zero, com o dublê) | todas as suítes da verificação | 89 testes: **89 ok, 0 falhas, 0 pulados**, saída 0 | `testes-servidor-pilha-paralela.txt` |
| Build Android | gerar | `expo prebuild` saída 0; `gradlew assembleRelease` BUILD SUCCESSFUL, saída 0 (reaproveitado, ver acima) | `build-android.txt` |
| Sincronização P1 | 3 vezes | **3 de 3 ok**, 0 refeitas. 10 alterações aplicadas em cada, 0 perda, 0 duplicação, A e B iguais ao servidor. Convergência 3,8 / 4,2 / 4,3 s desde o comando que desliga o modo avião (0,6 / 1,8 / 1,9 s desde o app alcançar o servidor) | `fumaca-sincronizacao.txt`, `sincronizacao/execucoes.jsonl` |
| Sincronização P9 | 1 vez | **1 de 1 ok**, 0 refeitas. As 5 alterações de B recusadas e avisadas, A e B iguais ao servidor. Convergência 4,8 s | idem |
| Lembrete caso (a) | 3 vezes | **3 de 3 ok**. Alarme exato (`permission`, janela 0), app fechado pelo deslize na lista de recentes, modo avião ligado no momento do aviso, atraso 0,5 / 0,3 / 0,3 s, tocar no aviso abre a viagem `…c3` | `fumaca-lembrete-a.txt`, `lembrete/caso-a/` |
| Link caso (a), app fechado | 3 vezes | **3 de 3** na viagem certa, COLD. Tempo até a tela: 719 / 656 / 751 ms (mediana 719) | `fumaca-links.txt`, `links/caso-a/` |
| Link caso (b), app aberto em outra tela | 3 vezes | **3 de 3** na viagem certa | `links/caso-b/` |
| Link caso (d), https com vínculo forçado | 3 vezes | **3 de 3** na viagem certa (2 fechado, 1 aberto) | `links/caso-d/` |
| Link caso (c), viagem que não existe | 1 vez | **1 de 1**: "Esta viagem não está neste aparelho."; id inválido: "O link não traz uma viagem válida." | `links/caso-c/` |
| Verificação do aparelho, parte local | pelos testes dela | Coberta pelas duas linhas de testes do servidor acima: unidade, app e servidor; casos negativos devolvem `integrity_required`, casos aceitos só com o dublê e a prova de desenvolvimento ligada no local | `testes-servidor-*.txt` |

Ordem e estado dos aparelhos:

- Lembrete e links rodaram com o app **instalado de novo, com `pm clear` e sem login** nos dois emuladores (`preparo-lembrete-links.txt`). As permissões do lembrete foram dadas por comando (`pm grant … POST_NOTIFICATIONS` e `appops … SCHEDULE_EXACT_ALARM allow`), não pelas telas do sistema.
- As viagens de teste (`campinguim://links?semear=1`) foram semeadas só no `emulator-5556`, **sem login**. Risco conhecido (QA da F0-4, observação 1): semear em aparelho com login trava a fila de envio. Não foi corrigido, só respeitado.
- Antes da sincronização, `rodar.mjs preparar` instalou o APK, limpou os dados (`pm clear`) e fez login de A e B.

Comandos (Node do sistema; os caminhos de evidência estão abreviados):

```
cd prova/app && npx tsc --noEmit
cd prova/servidor && node --test --test-reporter=spec testes/configuracao.test.mjs
node prova/prova.mjs subir --sem-emuladores
cd prova/servidor && npx supabase db reset && npm run semear
docker compose restart powersync                                  (em prova/sincronizacao)
cd prova/servidor && npm run testar
CAMPINGUIM_SERIAL=emulator-5554 EVIDENCIAS_DIR=<evidencias>/F0-integracao/lembrete node prova/lembretes/roteiro.mjs a 3
CAMPINGUIM_SERIAL=emulator-5556 EVIDENCIAS_DIR=<evidencias>/F0-integracao/links node prova/links/roteiro.mjs semear | a 3 | b 3 | d 3 | c 1
EVIDENCIAS_DIR=<evidencias>/F0-integracao/sincronizacao node prova/e2e/sincronizacao/rodar.mjs preparar
EVIDENCIAS_DIR=<evidencias>/F0-integracao/sincronizacao node prova/e2e/sincronizacao/rodar.mjs cenarios --so P1 --vezes 3 --rodada int
EVIDENCIAS_DIR=<evidencias>/F0-integracao/sincronizacao node prova/e2e/sincronizacao/rodar.mjs cenarios --so P9 --vezes 1 --rodada int
node prova/servidor/scripts/pilha-paralela.mjs subir
cd prova/servidor && node --test --test-reporter=spec testes/rls*.test.mjs testes/acesso*.test.mjs testes/configuracao.test.mjs testes/verificacao*.test.mjs
node prova/servidor/scripts/pilha-paralela.mjs derrubar
```

## Falhas vistas na retomada e de onde vêm

Nenhuma é da junção.

1. **Node errado no terminal.** A primeira rodada dos testes do servidor usou o Node v22.16.0 que estava antes no PATH, e não o Node do sistema (v24.19.0). Resultado: 40 testes, 37 ok, 3 falhas, porque os 3 arquivos `verificacao*.test.mjs` não carregaram (`ERR_UNKNOWN_FILE_EXTENSION` para `.ts`). **Reproduzido no ramo de origem** (`feature/F0-5-verificacao`, `01fa6de`, só leitura): com o Node 22, os 2 arquivos de unidade falham do mesmo jeito; com o Node 24, dão 54 de 54 (`falha-node22-no-ramo-de-origem-F0-5.txt`). É requisito do ambiente que já existia na F0-5. Ver `tentativa-node22.txt`.
2. **Servidor de funções parado.** Com o Node certo, 3 testes de `verificacao-servidor.test.mjs` receberam 503 em vez de 403 (107 testes: 93 ok, 3 falhas, 11 pulados). Causa: o contêiner `supabase_edge_runtime_campinguim-prova` estava em "Exited (255)" desde o desligamento do Docker, e o `supabase start` e o `db reset` não o religaram. Depois de `docker start` nesse contêiner, sem mudar nenhum arquivo, deram 96 ok e 0 falhas. É estado da máquina, não código.

## Limpeza

- Emuladores desligados por `adb -s emulator-<porta> emu kill`. `adb devices` vazio, nenhum processo de emulador.
- Pilha padrão desligada por `docker compose -p campinguim-prova-sincronizacao down` e `npx supabase stop` (sem `prova.mjs derrubar`). Pilha paralela desligada pelo `derrubar` dela. 0 contêineres da prova. Os volumes da pilha padrão ficam (o `supabase stop` guarda o banco), como já estavam antes da tarefa.
- `prova/.env.local` (fora do git) ficou como estava no início. O conteúdo não foi exibido.
- Nenhum arquivo em `evidencias/F0-2`, `F0-3`, `F0-4` ou `F0-5` mudou (`git status`).

## Checagem G antes do commit

Nos arquivos deste commit: 0 senhas, chaves, tokens ou JWT; 0 e-mail pessoal ou nome real; 0 nome de usuário do Windows ou caminho da pasta de usuário; 0 ocorrências dos três domínios de hospedagem que a regra G proíbe fora do valor único de configuração. O caminho da pasta de trabalho, que aparecia num aviso do Node nos testes do servidor (`MODULE_TYPELESS_PACKAGE_JSON`, já registrado pelo QA da F0-5), foi trocado por `<raiz>`. Autor e quem gravou: o e-mail noreply do GitHub. As imagens desta pasta mostram só telas do Campinguim e a barra de avisos com avisos do sistema Android, sem tela inicial nem ícone de outro app.
