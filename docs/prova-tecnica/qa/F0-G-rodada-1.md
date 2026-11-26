# F0-G · publicação no GitHub · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: pane-656 · Conferido por: QA (pane-646)
Base: pedido do piloto (só `main`; autores só noreply; número de commits igual ao local; proteção ativa; nenhum workflow; `docs/infra.md` sem segredo); plano, F, PROPOSTA 2; condição H4a da `F0-P-rodada-2.md`.

O QA conferiu tudo de novo pela API do `gh` e pelo repositório local.

## No GitHub

| Critério | Resultado |
| --- | --- |
| Só o ramo `main` | ok. `branches` = `[{"name":"main","protected":true}]`; `git ls-remote origin` = `HEAD` e `refs/heads/main` em `33ba082`; 0 etiquetas |
| Autores só noreply | ok. Nos 6 commits do GitHub, autor e quem gravou são `ID+digodeveloper-crypto@users.noreply.github.com`, com login `digodeveloper-crypto` dos dois lados |
| Commits iguais ao local | ok. 6 no GitHub e 6 no `main` local. A árvore do commit remoto é **igual** à local (`139f2ab…`), com 930 arquivos nos dois |
| Proteção | ok. Pull request obrigatório (0 aprovações, porque a conta é única, como no plano); `enforce_admins` ligado; force push e exclusão bloqueados; sem checagem obrigatória; histórico linear desligado; 0 rulesets. Integração só por squash (merge commit e rebase desligados) e ramo apagado depois da integração |
| Nenhum workflow | ok. `actions/workflows` = 0; não existe pasta `.github` |
| Visibilidade e licença | pública; licença `null` (D5); wiki desligada; ramo padrão `main` |
| **H4a** (condição do QA) | ok. A captura de `settings/emails` mostra "Keep my email addresses private" **On** e "Block command line pushes that expose my email" **On**. O único endereço visível é o noreply da conta. A captura está fora do repositório |

## O que foi publicado, conferido de novo no `main` (`33ba082`)

- **Diferença para a versão aprovada na F0-P rodada 2** (`9565ae7`): só o DSG-07. São 3 arquivos modificados (`LEIA-ME.md`, `index.html`, `textos.js`) e 4 novos (`perfil/` com 3 arquivos e `qa/dsg07-rodada-2.md`). É exatamente o conteúdo aprovado na rodada 2 do DSG-07. Todos os arquivos de `design/marca/` no `main` são iguais ao disco.
- **Q4** segredos: 0. **Q5** `C:\Users`, usuário e computador: 0. **Q9** e-mail pessoal e nome real: 0 em arquivos, cabeçalhos e mensagens. **Q7** blobs antigos: 0. O `.blend` é o mesmo aprovado na rodada 2 da F0-P.

## `docs/infra.md`

ok. Seção GitHub com conta, endereço, visibilidade, proteção, forma de integração e comandos de conferência. 0 e-mail pessoal, 0 nome de usuário do Windows, 0 caminho de máquina, 0 token ou senha. O nome da conta do GitHub já é público pelo endereço do repositório. O arquivo ainda não está no repositório: vai com a checagem de G no próximo envio.

## Observações (não reprovam)

1. A entrega registra que o "histórico linear" foi ligado por engano e desligado em seguida. O estado final está conforme o pedido.
2. Ficam fora do repositório, sem commit: `docs/infra.md`, `docs/prova-tecnica/` (com as evidências de F0-0 já corrigidas) e o que a SOC-01 está produzindo (`docs/redes-sociais.md`, `docs/evidencias/`). Cada um passa pela checagem de G antes do envio.
3. A captura de H4a ficou numa pasta temporária do Chrome, fora do projeto. Pode ser apagada quando o piloto fechar a tarefa.
