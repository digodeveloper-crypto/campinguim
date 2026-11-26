# F0-P · conferência do que fica público · rodada 1 · DIAGNÓSTICO APROVADO; aceite final PENDENTE da montagem do `main`

Data: 2026-11-24 · Entregue por: pane-649 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md`, seção D, F0-P (aceite e evidência), seções F, G e B9; `CLAUDE.md`.
Alvo: `docs/prova-tecnica/conferencia-publica.md` (342 linhas).

## Por que o aceite fica em duas partes

O plano diz que F0-P "depende de: PROPOSTA 1 de F montada no `main` local (e aprovada pelo responsável)". O `main` novo ainda não existe, porque H4a e D1 não foram dados. Por isso a entrega conferiu o histórico atual, que é o que será remontado: os 19 commits de `feature/MSC-01-opcoes-de-mascote`, que contêm o `main` `f1ed7d7`. Ela também deixou pronto o roteiro de montagem e as conferências Q1 a Q8.

- **Parte 1, diagnóstico: APROVADA nesta rodada.**
- **Parte 2, aceite final: PENDENTE.** Fica aberta até o `main` ser montado com as decisões D1 a D6. Dois critérios do plano só podem ser cumpridos no `main` novo: "zero achados abertos nas categorias 1, 2 e 3 em todos os commits do `main` a enviar" e "autores só com o e-mail do GitHub". O QA roda Q1 a Q8 nesse `main` antes de o piloto pedir o "pode" final (H4c). **Sem essa segunda rodada, o envio não pode ser pedido.**

## Aceite do diagnóstico

| Critério do plano | Resultado | Como o QA conferiu |
| --- | --- | --- |
| 6 categorias, cada uma com comando, código de saída e contagem de achados | ok. Resumo e seções 1 a 6 trazem os três para cada busca | leitura |
| Categoria 1, segredos | ok, 0 achados. Padrões cobrem chaves de nuvem, GitHub, Slack, JWT, chave privada, Supabase e Google; nomes de arquivo sensíveis no histórico | leitura dos padrões; a busca de segredos do QA anterior no plano deu o mesmo |
| Categoria 2, dados pessoais | ok: 3 achados com correção proposta | **QA repetiu:** `git log $R --format='%an <%ae>\|%cn <%ce>' \| sort -u` = 1 linha, o mesmo nome e o mesmo e-mail pessoal como autor e quem gravou; 19 de 19 com endereço do provedor pessoal; 19 commits, `main` com 1, 0 etiquetas |
| Categoria 3, caminhos com usuário do Windows | ok: 4 achados | **QA repetiu:** `git grep -I -l -i -E "C:[\\/]+Users\|<usuário>" $(git rev-list $R)` = exatamente os 3 textos de `49c9981`, iguais em 18 commits; 0 nas mensagens de commit. **`.blend` aberto por dentro pelo QA** (todas as partes zstd, com o Python do Blender 5.3): nas 2 versões (`ae7a59b`, `ced985c`) há 1 ocorrência do nome de usuário, em `C:\Users\<usuário>\OneDrive\Documentos`. Confirma o achado 3.4 e fecha a observação 2 da rodada 3 do plano |
| Categoria 4, terceiros e licenças | ok: 8 famílias OFL com `OFL.txt`, SHA-256 igual ao registrado (sem modificação, nome reservado sem problema); 13 diretas e 319 no lock com licença; Remotion com fonte (`LICENSE.md`, FAQ, termos 4.0 e 5.0) e "não confirmado" onde a documentação não diz; captura com marcas do Google apontada | leitura |
| Categoria 5, arquivos indevidos | ok: 0 pastas de ferramenta ou temporários; o `.blend` como achado de decisão | leitura |
| Categoria 6, licença | ok: 0 arquivos; opções descritas sem escolher (H4b) | leitura |
| Só o `main` vai | ok: (e) lista só `main`, nunca `--all`, `--mirror` nem `--tags`; conferência pós-envio com `git ls-remote` | leitura |
| Relatório sem segredo, sem e-mail pessoal, sem nome de usuário do Windows | ok. Tudo mascarado (`<usuário>`, `<computador>`, `***`) | busca pelo nome de usuário e por provedores de e-mail no relatório: 0 |
| Nada alterado no repositório | ok. `git status`: `docs/prova-tecnica/` e `design/marca/`, que é de outra tarefa, DSG-07. Sem worktree extra, sem stash, sem ramo novo. `.git/config` com data de 08:50, anterior à tarefa | `git status`, `git worktree list`, `git branch`, `git stash list` |
| Roteiro de Q1 a Q8 repetível | ok. **Os 5 objetos de Q7 batem:** `ae7a59b` e `ced985c` = as 2 versões do `.blend`; `cb61663`, `86c9a45`, `3f85924` = os 3 textos com caminho | `git rev-list --objects $R` |

## Itens para a parte 2 (o QA vai cobrar)

1. **Nome real (D2):** se o responsável decidir trocar, Q1 a Q8 precisam de uma conferência a mais, Q9: `git grep -I -i -E '<nome>|<sobrenome>' $(git rev-list main)` com 0 resultados. Hoje o roteiro só pede isso dentro de a5.
2. **E-mail local:** o `.git/config` deste repositório já tem `user.name` e `user.email` gravados antes desta tarefa, e o e-mail não é o do GitHub. O passo 6 de (c) sobrescreve os dois. Q2 pega qualquer erro.
3. **`.blend` (D3):** se for regravado, Q6 abre o arquivo novo por dentro, lendo **todas** as partes zstd. Uma leitura só da primeira parte dá falso "0 caminhos": o QA tropeçou nisso nesta conferência.
4. **Linha `ID:` do `docker-info.txt` (a4) e captura (b2):** não entram no `main` (são não rastreados), mas precisam estar resolvidas antes do primeiro commit do ramo da prova.

## Aval pedido ao QA (b2, captura de F0-0)

O QA aceita qualquer uma das três opções para o aceite de F0-0. A prova de "dois emuladores ligados juntos" já está em `adb-devices.txt`, e o QA também a viu ao vivo na rodada 1 de F0-0. A recomendada continua sendo (1): substituir por uma tela sem marcas de terceiros.

## Observações (não reprovam)

1. **Mudança em `plano.md`:** a entrega alterou o aceite de F0-0 (linha 250). **Resolvida:** o piloto confirmou que a mudança estava no cartão de F0-P, pedida por ele a partir da observação 1 do QA na rodada 1 de F0-0.
2. As seções A e B do plano ainda citam `systeminfo` como leitura de 24/11 antes da BIOS. Isso é histórico e está certo como está.
3. A proposta de D6 (trocar `C:\campinguim\…` por caminho relativo em 3 documentos) não tem dado pessoal. A recomendação é boa, mas não é obrigatória para o envio.
