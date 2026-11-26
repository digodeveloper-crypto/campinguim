# F0-P · conferência do que fica público · rodada 2 (`main` montado) · APROVADO

Data: 2026-11-24 · Entregue por: pane-649 · Conferido por: QA (pane-646)
Base: `docs/prova-tecnica/plano.md` (F0-P e F); `docs/prova-tecnica/qa/F0-P-rodada-1.md` (parte 2 pendente); decisões D1 a D6 do responsável, registradas em `conferencia-publica.md` (D1 sim; D2 nome da conta do GitHub; D3 regravar; D4 substituir; D5 sem licença; D6 trocar); DSG-07 como último commit, por decisão do piloto.

O QA rodou de novo, ele mesmo, cada conferência no `main` local.

## Q1 a Q9

| # | Conferência | Resultado do QA |
| --- | --- | --- |
| Q1 | `git rev-list --count main` | **6**: docs → MSC → DSG-01/05/06 → VID → docs técnica e roteiros → DSG-07. Sem licença, por D5 |
| Q2 | `git log main --format='%an <%ae>\|%cn <%ce>' \| sort -u` | **1 linha**, com `…@users.noreply.github.com` como autor e como quem gravou. O e-mail é igual ao `ID+login` que a API do GitHub devolve, e o nome é igual ao login da conta (D2) |
| Q3 | `git diff --name-status reserva/design-antigo main` | **10 arquivos**: 9 `M` (PRD, SPEC, 3 textos de a1 a a3, 3 documentos de a6, `.blend`) e 1 `A` (`design/marca/qa/dsg07-rodada-1.md`, com o mesmo `hash-object` do disco, que inclui a última edição do QA). Árvore com 926 arquivos = 925 + 1. **Conteúdo das mudanças:** em PRD e SPEC, só a linha 3 (o nome trocado pelo login); a6, 1 linha por arquivo (caminho absoluto → relativo); a1 a a3, 4 + 4 + 20 linhas (`file:///<pasta temporaria>/`) |
| Q4 | padrões de segredo em `$(git rev-list main)`; nomes de arquivo sensíveis no histórico | **0** e **0** |
| Q5 | `C:\Users`, nome de usuário do Windows e nome do computador em todas as versões e nas mensagens | **0** arquivos e **0** mensagens |
| Q6 | `.blend` do `main` aberto por dentro (todas as partes zstd) | **0** usuário, 0 computador, 0 `Users`, 0 caminho com letra de unidade, 0 `OneDrive`, 0 e-mail. **Aberto no Blender 5.3**, o antigo e o novo têm os mesmos números: 13 objetos, 10 malhas, 10 materiais, 7 ações, 1 cena, 11.811 vértices |
| Q7 | blobs antigos `cb61663`, `86c9a45`, `3f85924`, `ced985c`, `ae7a59b` alcançáveis pelo `main` | **0** |
| Q8 | ramos e etiquetas | `main`, `feature/MSC-01-opcoes-de-mascote`, `reserva/design-antigo`, `reserva/main-antigo`; **0 etiquetas**; 1 worktree (a pasta separada foi removida) |
| Q9 | e-mail pessoal (inteiro e antes do `@`) e cada palavra do nome real, em todas as versões, nos cabeçalhos e nas mensagens de commit | **0** |

**Fora do `main`, para o ramo da prova:**
- `docker-info.txt`, linha 91: `ID: ***` (a4).
- `dois-emuladores.png` foi trocado por duas telas "About emulated device" (D4): sem ícone nem marca de terceiros, sem dado pessoal, PNG sem bloco de metadado.

A configuração global do git não tem o e-mail do GitHub, ou seja, não foi mexida. O e-mail novo está só no `.git/config`. Nada foi enviado.

## Condição antes do envio (H4a ainda pendente)

O histórico local já não expõe o e-mail pessoal, então o **primeiro envio** em si não depende de H4a. Mas a PROPOSTA 2 do plano faz cada feature seguinte entrar por **pedido de integração com "squash" feito no GitHub**. Um commit feito pelo site leva o e-mail principal da conta enquanto "Keep my email addresses private" estiver desligado, e esse commit vai para o `main` público. **Por isso o QA pede que H4a (ligar as duas opções) seja feito pelo responsável antes do "pode" final (H4c)**, ou, no máximo, antes da primeira integração pelo GitHub. O piloto leva isso junto com o pedido do "pode".

## Observações (não reprovam)

1. O `.blend` regravado abre com o aviso "Library file, loading empty scene", porque não traz mais a interface. Os dados são os mesmos (Q6). Quem abrir verá a interface padrão do Blender.
2. A troca a6 em `design/prototipos/LEIA-ME.md` deixou um caminho relativo dentro de um trecho de código (`pathlib.Path(r"design\prototipos\rumo")`). Esse trecho só funciona se for rodado da raiz do repositório.
3. Regerar o modelo 3D com `construir.py` grava o caminho da máquina de novo. A pendência está registrada na entrega e vale para quem mexer em `design/mascote/3d/`.
4. Os 4 arquivos de saída de teste com `C:\campinguim` ficaram como estão, conforme D6. Não têm dado pessoal.
