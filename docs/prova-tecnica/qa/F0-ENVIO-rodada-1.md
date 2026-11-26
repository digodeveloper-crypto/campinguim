# F0-ENVIO · envio único "F0: prova técnica" · rodada 1 · APROVADO

Data: 2026-11-26 · Entregue por: pane-681 · Conferido por: QA (pane-676)
Base: pedido do piloto (squash único a partir do `main`, com `feature/F0-integracao` e os arquivos da ressalva; exceções fora; checagem G completa; mídias iguais às aprovadas; validação humana registrada); plano, G e PROPOSTA 3; `CLAUDE.md`; regra do piloto de 25/11 sobre imagens.
Alvo: worktree `C:\campinguim-wt\F0-envio`, ramo `feature/F0-prova-tecnica-envio`, commit `fcbeea5`. Nada foi enviado.

Este relatório fica fora do commit conferido. Ele foi escrito depois do commit e entra num envio seguinte.

## Estrutura

| Critério | Resultado do QA |
| --- | --- |
| Um commit só sobre o `main` | ok. `git rev-list main..fcbeea5` = 1. O pai é `33ba082`, que é o `main` local e o `origin/main` (`git ls-remote`). O histórico da F0-3 com as imagens antigas (`2dfa308`) **não vai junto** |
| Autor e quem gravou | ok. Os dois são noreply da conta. A mensagem não tem e-mail pessoal, nome real nem caminho |
| Só arquivos novos | ok. 345 `A`, 0 `M` e 0 `D` em relação ao `main` |
| Árvore = junção + ressalva + checagem | ok. `806b938..01c5105` acrescenta só os 15 arquivos da ressalva. `01c5105..fcbeea5` acrescenta só `evidencias/F0-envio/checagem-g.txt` |
| Arquivos da árvore principal iguais ao disco | ok. `resultado.md`, `infra.md`, `plano.md`, os 9 relatórios `qa/` e as 2 PNG da SOC-01 têm o hash igual ao arquivo em `C:\campinguim`. O `redes-sociais.md` do commit é igual às linhas 1 a 56 do arquivo de trabalho, só com o fim de linha normalizado (CRLF para LF) |
| Exceções fora | ok. 0 caminhos com `REELS` na árvore. "Episódio 1 no Instagram" e `REELS-ep01` só aparecem dentro do `checagem-g.txt`, como texto da própria busca |

## Checagem G, feita pelo QA na árvore inteira

- **Segredos com valor:** 0 JWT, `sb_secret_`/`sb_publishable_` com valor, `ghp_`, `github_pat_`, `AKIA`, `AIza`, `sk-`, `xox` e chave privada. As ocorrências encontradas são o texto das buscas nos relatórios e um resumo SHA-256 de APK.
- **E-mails nos arquivos novos:** noreply da conta (já público), `noreply@anthropic.com`, os de teste `*@usuarios-prova.test`, os modelos `ID+USUÁRIO@…` e `admin@email.com` (comentário do modelo do `config.jsonc` do Supabase). Os outros (`bruno@example.com` e `RIO@…`) já estão no `main` e aparecem no `checagem-g.txt` só como lista. 0 provedores pessoais.
- **Usuário do Windows e `C:\Users`:** 0 nomes de usuário. Todo `C:\Users` está mascarado como `<usuário>`, e todo `AppData` aparece mascarado ou como `%LOCALAPPDATA%`/`process.env.LOCALAPPDATA`.
- **`run.app`, `pages.dev` e `workers.dev`:** 0 em `prova/`. Só aparecem em documentos.
- **Arquivos sensíveis:** 0 `.env` de verdade, `.jks`, `.keystore`, `.pem`, `.key`, `.p12`, `.apk` e `.aab`. 0 `.github/` e 0 pastas de ferramenta (`.claude`, `.overclock`, `node_modules`, `android/`). O único modelo é `prova/servidor/config/verificacao-producao.env.example`, que só tem nomes e premissas não secretas (300, 60 e 24).
- **Metadados das 50 mídias:** 0 ocorrências de usuário, `Users\` ou e-mail nos bytes.

## Mídias (50 novas)

- **Cada uma tem o mesmo blob de uma ponta aprovada:** 24 da `88015ad` (F0-3 e F0-4), 15 da `7f78a41` (F0-2, mais F0-0, F0-1 e os ícones que vieram por ela), 8 da `806b938` (F0-integracao), 1 da `01fa6de` (F0-5) e 2 iguais às da árvore principal (SOC-01).
- **O vídeo da F0-3 é a versão cortada** da `39aef77` (11,79 s), sem a tela inicial.
- **Imagens que o QA abriu agora**, porque não tinham sido vistas uma a uma:
  - `F0-0/dois-emuladores.png`: é a versão corrigida, com as duas telas "About emulated device". A versão antiga, com a tela inicial e os ícones de terceiros, não está no commit.
  - as 4 do `F0-1/app-emulador-*`: só telas do app.
  - as 2 da SOC-01: só o perfil do Campinguim, sem logo das redes.
  - os 4 `prova/app/assets/icone*.png`: iguais aos arquivos de `design/mascote/final/` que já estão no `main`.
- As 8 da F0-integracao e as da F0-2, F0-3 e F0-4 já tinham sido vistas pelo QA nas rodadas delas.

## Validação humana registrada

ok. Está no `resultado.md`: no topo ("Os itens 1, 2 e 3 foram validados pelo responsável em 26/11/2026") e no começo de "O que você precisa validar". Está no `plano.md`, linha H9 ("validação dos itens 1 a 3 feita pelo responsável em 26/11/2026"), e na mensagem do commit. A prova continua **INCOMPLETA** só pelo item 4 (**PENDENTE**).

## Observações (não reprovam; para o piloto)

1. **Frases do `resultado.md` que ficam velhas depois do envio:**
   - "Os caminhos de evidência […] valem no ramo `feature/F0-integracao`" (linha 9) e "nada foi enviado ao GitHub" (item 3 de "O que falta"). Depois do squash, os caminhos valem no `main`.
   - "Se bater, a validação humana dos itens 1 a 3 fica registrada pelo piloto" (linha 42) é anterior à validação.

   Os números não mudam. Se quiser, o piloto atualiza esse texto na segunda vez da F0-7, com a F0-6.
2. **Caminho da pasta de trabalho** (`C:\campinguim-wt\...`) aparece em 8 linhas dos relatórios do QA. Não tem nome de usuário, e o QA já tinha registrado isso na F0-7, rodada 1, observação 1, como decisão do piloto.
3. **Só por squash:** o pedido de integração deve usar "Squash and merge" e o título "F0: prova técnica". O ramo `feature/F0-prova-tecnica-envio` tem um commit só, então o histórico enviado é só esse. Os ramos `feature/F0-*` de trabalho continuam locais.
