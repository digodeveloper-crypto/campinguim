# F0-P · Conferência do que fica público

- **Data:** 24/11/2026.
- **Tarefa:** F0-P do `plano.md` (seção D), com as regras de F, G e B9. Repositório público decidido pelo responsável (H4).
- **Modo:** só leitura. Nenhum commit, checkout, mudança de histórico ou de configuração do git, nenhum arquivo apagado. Os arquivos abertos por dentro (modelo 3D) foram extraídos para a pasta temporária da sessão e apagados no fim.
- **O que foi conferido ("o que será enviado"):** o `main` final ainda não existe (PROPOSTA 1 de F). Por isso a conferência cobre:
  - os **19 commits** de `feature/MSC-01-opcoes-de-mascote` (18 de design + `f1ed7d7`, o `main` atual), um por um: arquivos de todas as versões, mensagens, autor e quem gravou;
  - a árvore final desse ramo: **851 arquivos**. Nenhum arquivo foi apagado ou renomeado no histórico (`git log --diff-filter=D` e `--diff-filter=R` vazios), então todo nome que já existiu está na árvore final;
  - os **15 arquivos ainda não rastreados** de `docs/prova-tecnica/`, que vão entrar no ramo da prova.
  - **Fora desta conferência:** a pasta não rastreada `design/marca/` apareceu durante o trabalho (de outra tarefa). Ela não foi conferida; se for entrar no que é enviado, precisa da mesma checagem (G).
- **Mascaramento:** e-mail, nome de usuário do Windows, nome do computador e o ID do Docker não aparecem aqui. Nos comandos, `<usuário>` e `<computador>` são os valores lidos na hora (`whoami`, `hostname`); `$R` é `feature/MSC-01-opcoes-de-mascote`.

## Resumo

| # | Categoria | Comando principal | Saída | Achados |
| --- | --- | --- | --- | --- |
| 1 | Segredos e chaves | `git grep -I -n -i -E <padrões> $(git rev-list $R)` | 1 (nada achado) | **0** |
| 2 | Dados pessoais | `git log $R --format='%an <%ae>\|%cn <%ce>' \| sort -u` e outras abaixo | 0 | **3** (e-mail pessoal nos 19 commits; nome real; ID do Docker) |
| 3 | Caminhos da máquina e usuário do Windows | `git grep -I -c -i -E "C:[\\/]+Users\|<usuário>\|AppData\|\.claude\|\.overclock" $(git rev-list $R)` | 0 | **4** (3 textos + o `.blend`) |
| 4 | Terceiros e licenças | leitura de `OFL.txt`, SHA-256 das fontes, `package-lock.json`, captura | 0 | **1** a corrigir (captura com marcas do Google) + **1 não confirmado** (Remotion) |
| 5 | Arquivos que não deveriam ir | `git ls-tree -r --name-only $R \| grep -i -E <pastas e extensões>` | 1 (nada achado) | **1** (o `.blend`, decisão) |
| 6 | Licença do repositório | `git ls-tree -r --name-only $R \| grep -i -E '(^\|/)(LICEN[CS]E\|COPYING)'` (fora das fontes) | 1 (nada achado) | **0 arquivos de licença.** Ponto aberto H4b |

Os achados das categorias 1, 2 e 3 somem do que é enviado se o `main` for montado do zero, com as correções da seção "Antes do envio". Nenhum deles foi corrigido nesta tarefa.

## 1. Segredos e chaves

| Comando | Saída | Achados |
| --- | --- | --- |
| `git grep -I -n -i -E '(AKIA[0-9A-Z]{16}\|AIza[0-9A-Za-z_-]{35}\|ghp_[0-9A-Za-z]{36}\|github_pat_\|gho_\|ghs_\|sk-[A-Za-z0-9]{20,}\|sk-ant-\|xox[baprs]-\|-----BEGIN [A-Z ]*PRIVATE KEY\|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.\|service_role\|SUPABASE_[A-Z_]*KEY\|api[_-]?key\s*[:=]\|secret\s*[:=]\|password\s*[:=]\|passwd\|senha\s*[:=]\|token\s*[:=]\|Bearer [A-Za-z0-9._-]{20,}\|client_secret\|private_key\|AccountKey=\|hooks\.slack\.com\|ya29\.)' $(git rev-list $R)` (todas as versões de todos os arquivos dos 19 commits) | 1 | 0 |
| Busca solta para revisão manual na árvore final: `git grep -I -n -i -E 'senha\|token\|secret\|password\|api[_-]?key\|credential\|private' $R` | 0 | 0. Os resultados são texto comum: "desenha"/"desenhado" (contém "senha"), `token` como campo do convite em `docs/SPEC.md`, "design tokens" em `docs/DESIGN.md`, `"private": true` em `videos/package.json`, o pacote `js-tokens` no `package-lock.json`, regras do `CLAUDE.md` |
| Nomes de arquivo sensíveis no histórico: `git log $R --name-only --format= \| sort -u \| grep -i -E '(^\|/)\.env\|\.jks$\|\.keystore$\|\.pem$\|\.key$\|\.p12$\|\.pfx$\|google-services\.json\|GoogleService-Info\|service[-_]?account\|credential\|secret\|id_rsa\|\.npmrc$'` | 1 | 0 |
| Não rastreados de `docs/prova-tecnica/`: `grep -r -n -i -E 'token\|password\|secret\|...' docs/prova-tecnica` | 0 | 0 segredos. Só menções de texto (`decodeIntegrityToken`, "token de acesso vencido", a linha `pass: Docker Pass Secrets Manager Plugin` do `docker info`) |

**Resultado:** nenhum segredo, chave ou arquivo de credencial em nenhum commit nem nos não rastreados.

## 2. Dados pessoais

### Autores e quem gravou (histórico inteiro)

Comando: `git log $R --format='%an <%ae>|%cn <%ce>' | sort -u` (saída 0).

| Commits | Autor | Quem gravou | E-mail pessoal |
| --- | --- | --- | --- |
| 19 de 19 (`f1ed7d7` até `0ff1a12`) | nome real do responsável (2 palavras, mascarado) `<***@***>` | o mesmo | **sim**, nos 19, como autor e como quem gravou |

- Um único endereço em todo o histórico. Não há outro autor.
- As mensagens de commit têm só a linha `Co-Authored-By: Claude … <noreply@anthropic.com>` (19 vezes): endereço público da Anthropic, não é dado pessoal.
- As datas dos commits mostram o fuso `-0300` (19 de 19). Não é achado: é informação de fuso, comum em qualquer repositório público.

### Outros dados pessoais

| Busca | Comando | Saída | Resultado |
| --- | --- | --- | --- |
| E-mails nos textos, todas as versões | `git grep -I -n -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' $(git rev-list $R)` | 0 | 33 ocorrências de **um** endereço fictício em `example.com` (domínio reservado para exemplos) em dados de demonstração dos protótipos (`design/prototipos/_compartilhado/dados.js`, `direcao/telas.md` e as medições do QA). **Não é achado.** |
| Provedores de e-mail | `git grep -I -c -i -E 'gmail\|hotmail\|outlook\.com\|yahoo\.' $(git rev-list $R)` | 1 | 0 |
| Telefone e CPF | `git grep -I -n -E '\(?[0-9]{2}\)?[ ]?9[0-9]{4}-?[0-9]{4}\|[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}' $R` | 0 | 0. Dois resultados são falsos positivos (coordenada de desenho num SVG e um nome de arquivo de fonte) |
| Nome do responsável nos textos | `git grep -I -n -i -E '<nome>\|<sobrenome>' $(git rev-list $R)` | 0 | **Achado:** o nome real aparece no cabeçalho de `docs/PRD.md` (linha 3) e `docs/SPEC.md` (linha 3), desde o `f1ed7d7`, no formato "data · @nome" |
| Nome do computador | `git grep -I -l -i '<computador>' $(git rev-list $R)` e `grep -r -l -i '<computador>' docs/prova-tecnica` | 1 e 1 | 0 |
| ID da instalação do Docker | leitura de `docs/prova-tecnica/evidencias/F0-0/docker-info.txt` | — | **Achado:** a linha 91, `ID: ***`, identifica a instalação do Docker desta máquina. Mascarar antes de ir a público |
| Capturas de tela | leitura de `docs/prova-tecnica/evidencias/F0-0/dois-emuladores.png` | — | Sem conta, e-mail, nome ou notificação pessoal. O problema dela é de marcas (categoria 4) |

### Metadados de arquivos

| Tipo | O que foi aberto | Como | Resultado |
| --- | --- | --- | --- |
| PNG | **236** conteúdos distintos de PNG em todas as versões dos 19 commits (a árvore final tem 269 PNG; os demais são cópias idênticas) + a captura não rastreada | script próprio que lê os blocos do PNG direto do `git cat-file` (`tEXt`, `zTXt`, `iTXt`, `eXIf`, `tIME`, `iCCP`); saída 0 | **0 blocos de metadado** em todos. Sem autor, programa, caminho, data ou localização |
| SVG | 215 SVG, todas as versões | `git grep -I -c -i -E 'inkscape\|sodipodi\|export-filename\|<metadata\|dc:creator\|Adobe\|Illustrator\|Figma' $(git rev-list $R) -- '*.svg'`; saída 1 | 0. São escritos à mão, sem metadado de editor |
| MP4 | **nenhum MP4 rastreado** em nenhum commit. Os 4 vídeos em `videos/renders/` são ignorados pelo `.gitignore` (`git check-ignore` = sim nos 4) | `ffprobe -show_entries format_tags:stream_tags` nos 4, por garantia | Só `encoder=Lavf61.7.100` e `comment=Made with Remotion 4.0.546`. Sem autor, caminho ou local. Não vão a público |
| PDF | nenhum no repositório | `git ls-tree` por extensão | — |
| GLB | `design/mascote/3d/campinguim.glb` nas **2 versões** do histórico (`bc62220`, `72f3acb`) | leitura do bloco JSON e varredura dos bytes por caminho absoluto, usuário, computador e e-mail | `asset.generator = "Khronos glTF Blender I/O v5.3.43"`. Sem imagens, sem `uri` externa, sem extensões; os `extras` só têm os nomes das 7 expressões. **0 caminhos, 0 usuário.** Não é compactado (glTF binário comum) |
| `.blend` | `design/mascote/3d/campinguim.blend` nas **2 versões** (`bc62220`, `72f3acb`) | o arquivo é compactado com zstd; descompactado com o Python do Blender 5.3 e varrido por dentro | **Achado (categoria 3):** cada versão guarda **1 caminho** `C:\Users\<usuário>\OneDrive\Documentos`, na memória da janela "Save As Blender File" que o Blender grava junto do arquivo. Sem e-mail, sem nome do computador. Ver correção (b) |

## 3. Caminhos da máquina e nome de usuário do Windows

Comando: `git grep -I -c -i -E "C:[\\/]+Users|<usuário>|AppData|\.claude|\.overclock|/home/|/Users/|\\Users\\" $(git rev-list $R)` (saída 0), e o mesmo com `git log $R --format=%B` para as mensagens de commit (0 resultados nas mensagens).

### Achados (têm o nome de usuário do Windows)

| # | Arquivo | Commit | Linhas | O que é |
| --- | --- | --- | --- | --- |
| 3.1 | `design/mascote/evidencias/estrutura/auditoria-qa-r2.txt` | `49c9981` (única versão) | 4 (156, 162, 168, 174) | `erro: falhou: file:///C:/Users/<usuário>/AppData/Local/Temp/cp/a/opcoes/09/arte/vista-lado.svg` (saída de teste do QA) |
| 3.2 | `design/mascote/qa/relatorios/estrutura-r1/saida-teste-leiame.txt` | `49c9981` | 4 (157, 163, 169, 175) | `file:///C:/Users/<usuário>/AppData/Local/Temp/claude/<pasta da sessão>/scratchpad/leiame/…` |
| 3.3 | `design/mascote/qa/relatorios/estrutura-r2/saida-teste-leiame.txt` | `49c9981` | 20 | o mesmo prefixo da 3.2 |
| 3.4 | `design/mascote/3d/campinguim.blend` | `bc62220` e `72f3acb` | 1 em cada versão (binário) | `C:\Users\<usuário>\OneDrive\Documentos`, gravado pelo Blender (ver categoria 2, metadados) |

- O `.gitignore` tem a linha `.overclock-app/`: nome de pasta de ferramenta, não caminho. **Não é achado.**
- Os não rastreados de `docs/prova-tecnica/` não têm o nome de usuário nem o do computador (`grep -r -l -i -E '<usuário>|<computador>' docs/prova-tecnica`, saída 1). Os relatórios do QA citam `.codex/` e `.overclock-app/` só como nomes de pasta.
- `git log $R -S'<usuário>' --format=%h` devolve só `49c9981`: os três textos entraram naquele commit e nunca mudaram. O `.blend` não aparece nessa busca porque é compactado; foi achado abrindo por dentro.

### Observações sem dado pessoal (não são achados; correção recomendada, decisão do responsável)

Caminhos absolutos que não têm o nome de usuário, mas mostram a estrutura da máquina:

| Tipo | Onde | Quantidade |
| --- | --- | --- |
| Pasta do projeto (`C:\campinguim\…` ou `file:///C:/campinguim/…`) | `design/mascote/direcao/padrao-producao.md` (1), `design/mascote/direcao/testes/LEIA-ME.md` (1), `design/mascote/qa/relatorios/02-r2/saida-conferir.txt` (4), `design/mascote/qa/relatorios/estrutura-r3/saida.txt` (2), `design/prototipos/LEIA-ME.md` (1), `design/prototipos/qa/relatorios/apresentacao-rodada-1.md` (1), `design/prototipos/qa/relatorios/base-r1/saida-apresentacao.txt` (60) | 7 arquivos, 70 linhas |
| Pastas de instalação comuns (`C:\Program Files\…`, `C:\Windows\Fonts`, `%LOCALAPPDATA%`) | `design/mascote/3d/LEIA-ME.md`, `design/mascote/3d/fonte/folhas.py`, `design/mascote/ferramentas/render.py`; não rastreados: `docs/prova-tecnica/ambiente.md`, `docs/prova-tecnica/plano.md`, `evidencias/F0-0/docker-info.txt` | 6 arquivos |
| Pasta de ferramentas da máquina (`C:\Ferramentas\…`) | `docs/prova-tecnica/ambiente.md` (não rastreado) | 1 arquivo |

Proposta: manter as pastas de instalação comuns (são instruções de uso e não identificam ninguém) e trocar a pasta do projeto por caminho relativo nos documentos de uso (`LEIA-ME.md`, `padrao-producao.md`, `apresentacao-rodada-1.md`). Nas saídas de teste (`.txt`), a troca é opcional.

## 4. Terceiros e licenças

### Fontes (8 famílias, 13 arquivos `.ttf`)

Comando: script que lê o `OFL.txt` e a tabela de nomes de cada `.ttf`, mais `sha256sum` de cada arquivo contra a tabela de `design/prototipos/LEIA-ME.md` (seção "Fontes", baixadas de `github.com/google/fonts`). Saída 0; **21 de 21 arquivos com o SHA-256 igual ao registrado**: nenhuma fonte foi modificada, só os arquivos variáveis foram renomeados (sem os colchetes), o que não muda a fonte.

| Família | Arquivos | Licença | `OFL.txt` junto | Nome reservado | Situação |
| --- | --- | --- | --- | --- | --- |
| Archivo | 1 | SIL OFL 1.1 | sim | nenhum | ok |
| Atkinson Hyperlegible | 2 | SIL OFL 1.1 | sim | nenhum | ok |
| Bricolage Grotesque | 1 | SIL OFL 1.1 | sim | nenhum | ok |
| Figtree | 2 | SIL OFL 1.1 | sim | nenhum | ok |
| Fraunces | 1 | SIL OFL 1.1 | sim | nenhum | ok |
| IBM Plex Mono | 2 | SIL OFL 1.1 | sim | "Plex" | ok: fonte não modificada, o nome original pode ficar |
| IBM Plex Sans Condensed | 3 | SIL OFL 1.1 | sim | "Plex" | ok: idem |
| Lexend | 1 | SIL OFL 1.1 | sim | "RevReading Lexend" | ok: idem |

A OFL permite redistribuir as fontes junto com outro software desde que o `OFL.txt` vá junto. Se alguém **modificar** uma fonte (inclusive cortar caracteres), o nome reservado não pode ser usado na versão modificada.

### Dependências de `videos/package.json`

`node_modules/` não é rastreado (`.gitignore`); só `package.json` e `package-lock.json` vão a público. Licenças lidas do `package-lock.json` (campo `license`), saída 0.

| Dependência direta | Versão | Licença |
| --- | --- | --- |
| `remotion` | 4.0.546 | Remotion License ("SEE LICENSE IN LICENSE.md"): não é de código aberto |
| `@remotion/bundler` | 4.0.546 | Remotion License |
| `@remotion/cli` | 4.0.546 | Remotion License |
| `@remotion/renderer` | 4.0.546 | Remotion License |
| `@remotion/three` | 4.0.546 | MIT |
| `@fontsource/inter` | 5.2.8 | OFL-1.1 |
| `@react-three/fiber` | 8.18.0 | MIT |
| `react` | 18.3.1 | MIT |
| `react-dom` | 18.3.1 | MIT |
| `three` | 0.170.0 | MIT |
| `@types/react` (dev) | 18.3.12 | MIT |
| `@types/three` (dev) | 0.170.0 | MIT |
| `typescript` (dev) | 5.6.3 | Apache-2.0 |

Todas as **319** dependências do `package-lock.json` têm licença declarada (0 sem licença): MIT 252, ISC 17, Remotion License 17, BSD-2-Clause 9, BSD-3-Clause 8, Apache-2.0 5, MPL-2.0 4, Unlicense 2, OFL-1.1 1, Python-2.0 1, CC-BY-4.0 1, BlueOak-1.0.0 1, 0BSD 1. Nenhuma delas é copiada para o repositório.

**Remotion e repositório público:**

- `videos/node_modules/remotion/LICENSE.md` (versão instalada): uso grátis para "an individual", empresa com até 3 funcionários ou organização sem fins lucrativos; proibido "copy or modify Remotion code for the purpose of selling, renting, licensing, relicensing, or sublicensing your own derivate of Remotion".
- remotion.dev/docs/license/faq: "Remotion is source-available software, but it is not open source software"; "You don't have to contact us to use Remotion under the Free License."
- remotion.dev/docs/terms (versão 5.0, **ainda não em vigor**, "will take effect upon the release of Remotion 5.0"): quem dá acesso ao código de um projeto Remotion a outras pessoas faz com que elas fiquem sujeitas à mesma licença ("If an end-user is granted direct access to a Remotion codebase … the end-user must hold their own license for that use"). Há uma regra de atribuição só para serviços que oferecem download de projetos.
- remotion.dev/docs/terms-4-0 (em vigor): não trata de repositório público.
- remotion.dev/docs/terms: "Remotion does not pose any restrictions on media generated with the Remotion Software."
- **Se publicar o código de `videos/` em repositório público exige algo: não confirmado** na documentação oficial. Nada achado exige aviso, licença específica ou licença de empresa para isso. O código do Remotion em si não é publicado (só a dependência no `package.json`).
- O comentário `Made with Remotion 4.0.546` nos MP4: **não confirmado** na documentação. Sem efeito agora, porque nenhum MP4 vai a público.

### Marcas, personagens e imagens de terceiros (regra 6 do `CLAUDE.md`)

| # | Onde | O que é | Pode ir a público? |
| --- | --- | --- | --- |
| 4.1 | `docs/prova-tecnica/evidencias/F0-0/dois-emuladores.png` (não rastreado) | Captura da tela inicial dos dois emuladores, com os ícones e nomes de Gmail, Google Fotos, YouTube, Chrome, Telefone, Mensagens, o "G" e a barra de busca do Google | **Não como está.** A regra 6 diz "Não use marcas, personagens nem imagens de terceiros", e a captura mostra 7 marcas do Google em tela cheia. A captura serve só para provar "dois emuladores ligados juntos", o que pode ser provado sem a tela inicial. Proposta em (b) |
| — | `design/mascote/direcao/originalidade.md`, `conceitos.md`, os `dados.js` das 10 opções e relatórios do QA do mascote | Nomes de pinguins de filmes e desenhos citados **em texto**, como lista do que o mascote não pode lembrar | Não é uso de marca: é a checagem de originalidade. Nenhuma imagem de terceiros. **Não é achado** |
| — | Fontes e ícones | Fontes OFL (acima); ícones dos protótipos desenhados para o projeto (`docs/DESIGN.md`) | ok |

## 5. Arquivos que não deveriam ir

| Busca | Comando | Saída | Resultado |
| --- | --- | --- | --- |
| Pastas de ferramenta, temporários e saídas de sistema | `git ls-tree -r --name-only $R \| grep -i -E '(^\|/)(\.claude\|\.overclock\|\.codex\|__pycache__\|_render\|tmp\|temp\|node_modules)(/\|$)\|\.pyc$\|\.log$\|\.bak$\|~$\|Thumbs\.db\|desktop\.ini\|\.DS_Store'` | 1 | 0 |
| Arquivos grandes | `git ls-tree -r -l $R \| sort -k4 -n -r` | 0 | O maior tem 1,9 MB (`design/mascote/apresentacao/opcoes/01/estudo/estudo-ilustrado.png`). Pacote de 43 MiB. Abaixo dos limites do GitHub |
| Arquivo de trabalho do Blender | idem | 0 | **Achado 5.1:** `design/mascote/3d/campinguim.blend` (690 KB). É o arquivo-fonte do modelo e tem o caminho com o nome de usuário (3.4). Decisão em (b) |
| Relatórios do QA com dado local | categoria 3 | — | Os 3 textos de 3.1 a 3.3 (já contados lá) |
| Saídas de ferramenta (`.txt`) | `git ls-tree -r --name-only $R \| grep '\.txt$'` | 0 | 54 saídas de teste e medição do QA em `design/*/qa/relatorios/` e `design/mascote/evidencias/`. São evidência das aprovações; fora os 3 de 3.1 a 3.3 e as observações de caminho do projeto, sem dado local. Não é achado |
| Capturas do QA e vídeos gerados | `.gitignore` | — | Já ficam fora (`design/*/qa/relatorios/**/*.png`, `videos/renders/`, `videos/node_modules/`) |

## 6. Licença do repositório

Comando: `git ls-tree -r --name-only $R | grep -i -E '(^|/)(LICEN[CS]E|COPYING)[^/]*$'` (fora de `fontes/`), saída 1: **não há arquivo de licença.** Sem licença, "the default copyright laws apply" e ninguém pode reproduzir, distribuir nem criar obras derivadas, embora qualquer usuário do GitHub possa ver e copiar (fork) o repositório público (B9). Opções em (d); a escolha é do responsável (H4b).

## Antes do envio

### (a) Correção de texto em arquivo

Feitas nos arquivos durante a montagem do novo `main` (passo 5 de (c)) ou no ramo da prova, antes do commit. Nenhuma foi feita nesta tarefa.

| # | Arquivo | Correção | Como conferir |
| --- | --- | --- | --- |
| a1 | `design/mascote/evidencias/estrutura/auditoria-qa-r2.txt` | Trocar o prefixo `file:///C:/Users/<usuário>/AppData/Local/Temp/` por `file:///<pasta temporária>/` nas 4 linhas | `git grep -c -i -E 'C:/Users\|AppData' -- <arquivo>` sem resultado |
| a2 | `design/mascote/qa/relatorios/estrutura-r1/saida-teste-leiame.txt` | Trocar `file:///C:/Users/<usuário>/AppData/Local/Temp/claude/<pasta da sessão>/scratchpad/` por `file:///<pasta temporária>/` nas 4 linhas | idem |
| a3 | `design/mascote/qa/relatorios/estrutura-r2/saida-teste-leiame.txt` | O mesmo de a2, nas 20 linhas | idem |
| a4 | `docs/prova-tecnica/evidencias/F0-0/docker-info.txt` (não rastreado) | Linha 91: `ID: ***` (mascarar o identificador inteiro) | `grep -n '^ *ID:' <arquivo>` mostra só `ID: ***` |
| a5 | `docs/PRD.md` e `docs/SPEC.md`, linha 3 | **Só se o responsável decidir** não publicar o nome real (decisão D2): trocar "@nome" pelo nome da conta do GitHub ou por "responsável pelo produto" | `git grep -i -E '<nome>\|<sobrenome>'` sem resultado |
| a6 | 3 documentos com a pasta do projeto (`design/mascote/direcao/padrao-producao.md`, `design/prototipos/LEIA-ME.md`, `design/prototipos/qa/relatorios/apresentacao-rodada-1.md`) | Recomendada, não obrigatória: caminho relativo no lugar de `C:\campinguim\…` | `git grep -c -i 'C:.campinguim'` nesses arquivos sem resultado |

Comando sugerido para a1 a a3, sem escrever o nome de usuário (PowerShell, na pasta do novo `main`):

```powershell
$arquivos = 'design/mascote/evidencias/estrutura/auditoria-qa-r2.txt',
            'design/mascote/qa/relatorios/estrutura-r1/saida-teste-leiame.txt',
            'design/mascote/qa/relatorios/estrutura-r2/saida-teste-leiame.txt'
foreach ($f in $arquivos) {
  $t = [IO.File]::ReadAllText($f)
  $t = [regex]::Replace($t, 'file:///C:/Users/[^/]+/AppData/Local/Temp/(claude/[^/]+/[^/]+/scratchpad/)?', 'file:///<pasta temporaria>/')
  [IO.File]::WriteAllText($f, $t, (New-Object Text.UTF8Encoding($false)))
}
```

Depois: `git diff --stat` mostra só esses 3 arquivos, e o fim de linha não muda (`git diff --ignore-cr-at-eol --stat` igual a `git diff --stat`).

### (b) Arquivo a substituir ou retirar (proposta; decisão do responsável)

| # | Arquivo | Problema | Opções |
| --- | --- | --- | --- |
| b1 | `design/mascote/3d/campinguim.blend` | Guarda `C:\Users\<usuário>\OneDrive\Documentos` (memória da janela de salvar do Blender). Regerar com `construir.py` não resolve: o caminho é gravado pelo próprio `save_as_mainfile` | **(1) Regravar sem a parte de interface (recomendada):** `bpy.data.libraries.write(<saída>, <todos os objetos, malhas, materiais, esqueletos, ações, cenas, coleções e chaves de forma>, compress=True)`. **Testado nesta tarefa, só na pasta temporária:** o arquivo regravado tem 0 caminhos e 0 nome de usuário, e reabre com os mesmos 13 objetos, 10 malhas, 10 materiais, 7 ações e 1 cena. Para valer também nas próximas regerações, a linha 1317 de `design/mascote/3d/fonte/construir.py` (`bpy.ops.wm.save_as_mainfile`) passaria a usar essa gravação: mudança de código no mascote, a pedir ao dono da pasta. **(2) Retirar o `.blend` do público** e manter só o `campinguim.glb` e os scripts de `fonte/`, que regeram tudo. O `.blend` continua no disco, ignorado pelo git. |
| b2 | `docs/prova-tecnica/evidencias/F0-0/dois-emuladores.png` (não rastreado) | Marcas do Google em tela cheia (4.1) | **(1) Substituir (recomendada)** por uma captura dos dois emuladores numa tela sem marcas de terceiros, por exemplo Configurações › Sobre o emulador, ou uma tela em branco aberta por `adb shell am start`, com a barra de estado visível. **(2) Retirar a captura** e manter só a prova em texto (`adb-devices.txt` com os dois aparelhos). **(3) Recortar** só a barra de estado e a moldura, sem ícones. O aceite de F0-0 pede "captura da tela com os dois emuladores abertos"; a opção 2 precisa de aval do QA |

### (c) Histórico: montar o `main` do zero com o e-mail do GitHub

PROPOSTA do plano (F0-P e F, PROPOSTA 1). **Nada disto foi feito.** Reescreve o histórico local do `main` e grava configuração do git no repositório: só depois do "pode" do responsável. Nenhum passo envia nada ao GitHub.

**Antes de começar**

1. O responsável marca no GitHub, em Settings › Emails, "Keep my email addresses private" e "Block command line pushes that expose my email" (H4a). Login, se pedido, é do responsável.
2. O responsável decide D2 (nome do autor) e D3 a D5 (`.blend`, captura, licença), porque a árvore do novo `main` depende delas.
3. Obter o e-mail do GitHub sem expor o pessoal: `gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"'`. Conferir que o resultado termina em `@users.noreply.github.com`.
4. `git status --short` mostra só `docs/prova-tecnica/` como não rastreado (nenhuma mudança pendente em arquivo rastreado).

**Montagem** (os comandos usam uma pasta de trabalho separada, para não mexer na pasta do projeto nem nos arquivos não rastreados)

5. Guardar os ramos antigos, só locais e nunca enviados:
   ```
   git branch reserva/main-antigo main
   git branch reserva/design-antigo feature/MSC-01-opcoes-de-mascote
   ```
6. Gravar o e-mail **só neste repositório** (não muda a configuração global):
   ```
   git config user.email "<e-mail do GitHub do passo 3>"
   git config user.name  "<nome decidido em D2>"
   ```
   Conferir: `git config --show-origin --get user.email` aponta para `.git/config`.
7. Abrir um ramo vazio numa pasta de trabalho separada (git 2.55 tem `--orphan`):
   ```
   git worktree add --orphan -b main-novo <pasta temporária>/main-novo
   ```
   Daqui até o passo 13, os comandos rodam dentro de `<pasta temporária>/main-novo`.
8. **Commit 1, igual ao `f1ed7d7`:**
   ```
   git checkout reserva/main-antigo -- .
   git commit -m "docs: PRD, spec, pedidos da Cinema e regras do projeto"
   git diff --stat reserva/main-antigo HEAD          # vazio, ou só docs/PRD.md e docs/SPEC.md se D2 trocar o nome (a5)
   ```
   Se D2 trocar o nome, a correção a5 entra aqui, antes do commit.
9. **Commit 2, mascote** (`design/mascote`):
   ```
   git checkout reserva/design-antigo -- design/mascote
   ```
   Aplicar a1, a2, a3 (comando de (a)), a6 se aprovada, e b1 conforme D3 (regravar, ou `git rm design/mascote/3d/campinguim.blend`, que apaga só a cópia da pasta separada, e a linha `design/mascote/3d/*.blend` no `.gitignore` do commit 5, depois do `checkout` do passo 12).
   ```
   git commit -m "MSC-01 a MSC-14: mascote 03 (Filhote de gorro) e pacote final"
   ```
10. **Commit 3, protótipo:**
    ```
    git checkout reserva/design-antigo -- design/prototipos docs/DESIGN.md
    git commit -m "DSG-01, DSG-05, DSG-06: protótipo Rumo, paleta Eucalipto e DESIGN.md"
    ```
11. **Commit 4, vídeo:**
    ```
    git checkout reserva/design-antigo -- videos
    git commit -m "VID-01, MSC-14: vídeo do mascote 3D"
    ```
12. **Commit 5, documentos:**
    ```
    git checkout reserva/design-antigo -- docs/TECNICA-3D.md roteiros .gitignore
    git commit -m "docs: técnica 3D e roteiros"
    ```
    Se D5 escolher uma licença, um commit 6 `docs: licença do repositório` com o arquivo `LICENSE`.
13. **Árvore idêntica** (o passo que o QA repete):
    ```
    git diff --stat reserva/design-antigo main-novo
    ```
    Deve listar **só** os arquivos corrigidos em (a) e (b) (e o `LICENSE`, se houver). E, excluindo esses arquivos, deve sair vazio:
    ```
    git diff --stat reserva/design-antigo main-novo -- . ':!design/mascote/evidencias/estrutura/auditoria-qa-r2.txt' ':!design/mascote/qa/relatorios/estrutura-r1/saida-teste-leiame.txt' ':!design/mascote/qa/relatorios/estrutura-r2/saida-teste-leiame.txt' ':!design/mascote/3d/campinguim.blend' <demais corrigidos>
    ```
    Conferência extra: `git diff --name-status reserva/design-antigo main-novo` só com `M` (ou `D` no `.blend` se D3 for retirar). Nenhum `A` inesperado.
14. Sair da pasta separada e apagá-la: `git worktree remove <pasta temporária>/main-novo`.
15. Trocar o `main` (o `main` antigo já está guardado em `reserva/main-antigo`):
    ```
    git branch -f main main-novo
    git branch -d main-novo
    ```

**Como o QA confere** (antes do "pode" final do envio, H4c)

| # | Conferência | Esperado |
| --- | --- | --- |
| Q1 | `git rev-list --count main` | 5 (ou 6 com licença) |
| Q2 | `git log main --format='%an <%ae>\|%cn <%ce>' \| sort -u` | **1 linha**, com o e-mail `…@users.noreply.github.com` como autor e como quem gravou |
| Q3 | `git diff --stat reserva/design-antigo main` | só os arquivos corrigidos (passo 13) |
| Q4 | categoria 1 sobre `$(git rev-list main)` | saída 1, 0 achados |
| Q5 | `git grep -I -c -i -E "C:[\\/]+Users\|<usuário>\|AppData" $(git rev-list main)` | saída 1, 0 achados |
| Q6 | o `.blend` (se ficar) aberto por dentro, como na categoria 2 | 0 caminhos, 0 usuário |
| Q7 | os conteúdos antigos não estão no que será enviado: `git rev-list --objects main \| grep -E '^(cb61663\|86c9a45\|3f85924\|ced985c\|ae7a59b)'` (os 3 textos com caminho e as 2 versões do `.blend` com caminho) | nenhum resultado |
| Q8 | `git branch --list` e `git tag` | `main`, os ramos de reserva e os de trabalho; **0 etiquetas** |

O `main` antigo e o ramo de design ficam em `reserva/` até o envio confirmado; depois, o ramo antigo só é apagado com o aval de SQD-08 (ação sem volta: parar e chamar o responsável).

### (d) Licença do repositório (opções, sem escolha)

| Opção | Em uma frase |
| --- | --- |
| Sem licença | Todos os direitos reservados: qualquer um vê e faz fork no GitHub, mas ninguém pode reusar, copiar ou modificar o código fora disso. |
| MIT | Qualquer um pode usar, copiar, modificar e vender, inclusive em produto fechado, desde que mantenha o aviso de copyright e a licença. |
| Apache 2.0 | Igual à MIT em liberdade, com concessão expressa de patentes e exigência de avisar o que foi modificado. |
| GPL v3 | Quem distribuir uma versão modificada precisa publicar o código dela sob a mesma GPL. |
| AGPL v3 | Como a GPL, e vale também para quem usar uma versão modificada como serviço na internet. |
| Licença só de leitura ("source-available", ex.: PolyForm Noncommercial) | Código aberto para ler e estudar, com uso comercial ou redistribuição proibidos ou limitados. |

Observações para a decisão: as fontes continuam sob a OFL e o mascote e as artes podem ter licença própria, diferente da do código (por exemplo, código numa licença e `design/` com "todos os direitos reservados"). O Remotion tem licença própria e continua valendo para quem rodar `videos/`, seja qual for a licença do repositório.

### (e) O que será enviado

- **Só o ramo `main`**, com 5 commits (6 se houver licença), montado por (c), com as correções de (a) e (b).
- Comando de envio, na PROPOSTA 2 de F, depois do "pode" final: `git push -u origin main`. Nunca `--all`, `--mirror` nem `--tags`.
- **Não vai:** `feature/MSC-01-opcoes-de-mascote`, `reserva/main-antigo`, `reserva/design-antigo`, nenhum outro ramo; nenhuma etiqueta (hoje não há nenhuma); os arquivos não rastreados de `docs/prova-tecnica/` (vão depois pelo ramo da prova, com a checagem de G antes daquele envio, já com a4 e b2 aplicadas).
- Conferência depois do envio: `git ls-remote origin` mostra só `refs/heads/main` (e `HEAD`).

## Decisões do responsável

| # | Decisão | Opções |
| --- | --- | --- |
| D1 | "Pode" para montar o `main` do zero, com o e-mail do GitHub, e gravar esse e-mail só neste repositório (c) | sim / não |
| D2 | Nome que aparece como autor dos commits e no cabeçalho de `PRD.md` e `SPEC.md` | nome real / nome da conta do GitHub / outro |
| D3 | `campinguim.blend` (b1) | regravar sem a parte de interface (recomendada) / retirar do público |
| D4 | Captura `dois-emuladores.png` (b2) | substituir por tela sem marcas (recomendada) / retirar e manter só texto / recortar |
| D5 | Licença do repositório (d), H4b | uma das opções de (d) |
| D6 | Caminho da pasta do projeto em 3 documentos de uso (a6) | trocar por caminho relativo (recomendada) / manter |
| — | Depois do aprovado do QA: "pode" final do envio (H4c) | — |

**Decidido pelo responsável em 24/11/2026** (pelo piloto): D1 sim; D2 nome da conta do GitHub; D3 regravar; D4 substituir; D5 **sem licença** (todos os direitos reservados, nenhum arquivo `LICENSE`); D6 trocar. Depois, por ajuste do piloto, o DSG-07 (logo para redes sociais, `design/marca/`, aprovado pelo QA na rodada 1) entra como último commit, com o relatório `design/marca/qa/dsg07-rodada-1.md`.

## Montagem (24/11/2026)

Roteiro (c) executado com as correções (a) e (b). **Nada foi enviado**: sem `push`, nenhum repositório criado no GitHub. O ramo antigo não foi apagado. A configuração global do git não foi mexida.

### O que foi feito

1. **Conferência de `design/marca/`** (DSG-07, commit `c932b51` mais `design/marca/qa/`, ainda não rastreado), com as mesmas buscas: segredos (saída 1, 0), nome de usuário, computador, nome real, e-mail pessoal, `AppData`, `C:\Users`, `.claude` e `.overclock` (0 nos 74 arquivos rastreados; no relatório do QA, 1 menção à palavra `AppData` como item buscado, não como caminho), metadados de 36 PNG (0 blocos), SVG sem metadado de editor (saída 1), nenhum desenho com marca de Instagram ou TikTok nos SVG (saída 1). Nenhum achado.
2. **Ramos de reserva**, só locais e nunca enviados: `reserva/main-antigo` = `f1ed7d7` e `reserva/design-antigo` = `c932b51` (ponta de `feature/MSC-01-opcoes-de-mascote`, que continua existindo).
3. **Configuração só deste repositório** (`.git/config`, conferido com `git config --show-origin`): `user.email` = e-mail do GitHub (`…@users.noreply.github.com`) e `user.name` = nome da conta do GitHub.
4. **Pasta separada**: `git worktree add --orphan -b main-novo <pasta temporária>/main-novo`. Os commits foram feitos lá; a pasta foi removida com `git worktree remove` (estava limpa), e o `main` passou a apontar para o novo (`git branch -f main main-novo`; `main-novo` apagado depois de conferido que apontava para o mesmo commit).
5. **Seis commits**, um por feature aprovada, autor e quem gravou com o e-mail do GitHub, mensagens terminando em `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`:

| # | Commit | Conteúdo | Correções aplicadas |
| --- | --- | --- | --- |
| 1 | `000fdbc` docs: PRD, spec, pedidos da Cinema e regras do projeto | conteúdo de `f1ed7d7` | a5: cabeçalho de `docs/PRD.md` e `docs/SPEC.md` com o nome da conta do GitHub |
| 2 | `e77527f` MSC-01 a MSC-14: mascote 03 (Filhote de gorro) e pacote final | `design/mascote` | a1, a2, a3 (28 trocas para `file:///<pasta temporaria>/`); a6 em `padrao-producao.md`; b1, `.blend` regravado |
| 3 | `126d50d` DSG-01, DSG-05, DSG-06: protótipo Rumo, paleta Eucalipto e DESIGN.md | `design/prototipos`, `docs/DESIGN.md` | a6 em `design/prototipos/LEIA-ME.md` e `qa/relatorios/apresentacao-rodada-1.md` |
| 4 | `b02155e` VID-01, MSC-14: vídeo do mascote 3D | `videos/` | nenhuma |
| 5 | `329e4c6` docs: técnica 3D e roteiros | `docs/TECNICA-3D.md`, `roteiros/`, `.gitignore` | nenhuma |
| 6 | `33ba082` DSG-07: logo do Campinguim para redes sociais | `design/marca/` inteira, com `qa/` e `perfil/` | nenhuma. Entram também a escolha do responsável (opção 01) e os relatórios do QA, rodadas 1 e 2 (ver "Atualização: logo 01") |

6. **`.blend` (b1, D3):** regravado com `bpy.data.libraries.write`, levando todos os dados menos janela, tela e área de trabalho (`window_managers`, `screens`, `workspaces`). Na primeira tentativa o filtro incluiu `all_ids`, que traz a interface de volta, e o caminho continuou no arquivo. A varredura pegou isso antes de seguir, o filtro foi corrigido e o commit 2 foi refeito (`--amend`, ainda local). Resultado final: 0 nome de usuário, 0 computador, 0 caminho com letra de unidade, 0 e-mail. O arquivo reabre com os mesmos dados do antigo (lista de 37 linhas idêntica: 7 ações, 1 esqueleto, 10 materiais, 10 malhas, 13 objetos, 1 cena, 6 conjuntos de alvos de forma, e vértices, faces, alvos, quadros, pais e posições de cada um). Os dois arquivos, exportados para GLB com as mesmas opções, dão o mesmo SHA-256 (`fe6e9210…`).
7. **Fora do repositório (vão depois, pelo ramo da prova):** `docs/prova-tecnica/evidencias/F0-0/docker-info.txt` com a linha 91 `ID: ***` (a4); `dois-emuladores.png` substituída (D4) por uma montagem das duas telas "About emulated device" (`emulator-5554` e `emulator-5556`, capturas pelo `adb`), recortada antes de "Phone number". Mostra só a barra de estado, o título e "Device name: sdk_gphone64_x86_64": nenhum ícone, logo ou nome de serviço de terceiros, e o arquivo não tem blocos de metadado.

### Atualização: logo 01 (24/11/2026)

O responsável escolheu a logo 01. A Cinema (pane-651) mudou `design/marca/LEIA-ME.md`, `textos.js` e `index.html` e criou `design/marca/perfil/`, sem commit. O QA aprovou na rodada 2 (`design/marca/qa/dsg07-rodada-2.md`).

- **Buscas antes de incluir**, no disco: usuário, computador, nome real, e-mail pessoal, `C:\Users`, `.claude` e `.overclock` deram 0. `AppData` aparece só em `qa/dsg07-rodada-1.md`, como item da lista de buscas. Padrões de segredo: saída 1, 0 achados. `perfil.svg` sem metadado de editor: saída 1. Os 2 PNG de `perfil/` têm 0 blocos de metadado.
- **Inclusão**: o `main` foi aberto numa pasta separada (`git worktree add <pasta temporária> main`). Lá, `design/marca/` foi trocada pela do disco e o commit DSG-07 foi refeito com `--amend` (ainda local, último commit). A mensagem agora cita a escolha da opção 01 e as rodadas 1 e 2. A pasta separada foi removida.
- **`design/marca/` do `main` = disco**: `diff -r --strip-trailing-cr` sem diferença. Ficam fora desse `diff` só as diferenças de fim de linha, que o git normaliza.
- Os números de Q1 a Q9 abaixo são os da **segunda rodada**, refeita depois dessa inclusão.

### Resultados Q1 a Q9

| # | Conferência | Saída | Resultado |
| --- | --- | --- | --- |
| Q1 | `git rev-list --count main` | 0 | **6** (5 do roteiro + DSG-07; sem licença, D5) |
| Q2 | `git log main --format='%an <%ae>\|%cn <%ce>' \| sort -u` | 0 | **1 linha**: nome da conta do GitHub com `…@users.noreply.github.com`, como autor e como quem gravou. As 6 mensagens terminam em `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` |
| Q3 | `git diff --name-status reserva/design-antigo main` | 0 | **17 arquivos** (12 `M`, 5 `A`), só as correções decididas e a logo 01 aprovada. Correções (10): `docs/PRD.md`, `docs/SPEC.md` (a5); `design/mascote/evidencias/estrutura/auditoria-qa-r2.txt`, `design/mascote/qa/relatorios/estrutura-r1/saida-teste-leiame.txt`, `design/mascote/qa/relatorios/estrutura-r2/saida-teste-leiame.txt` (a1 a a3); `design/mascote/direcao/padrao-producao.md`, `design/prototipos/LEIA-ME.md`, `design/prototipos/qa/relatorios/apresentacao-rodada-1.md` (a6); `design/mascote/3d/campinguim.blend` (b1). Logo 01 e QA do DSG-07 (8, todos em `design/marca/`): `LEIA-ME.md`, `index.html`, `textos.js` (M); `perfil/instagram-perfil.png`, `perfil/perfil.svg`, `perfil/tiktok-perfil.png`, `qa/dsg07-rodada-1.md`, `qa/dsg07-rodada-2.md` (A). Excluindo essas 9 correções e `design/marca`, `git diff --stat` sai **vazio**. Árvore: 930 arquivos = 925 de `c932b51` + 5 novos |
| Q4 | categoria 1 (padrões de segredo) sobre `$(git rev-list main)`; nomes de arquivo sensíveis no `git log main --name-only` | 1 e 1 | **0** e **0** |
| Q5 | `git grep -I -c -i -E "C:[\\/]+Users\|<usuário>" $(git rev-list main)` e nas mensagens | 1 | **0**. A busca larga com `AppData` dá 2 linhas que não são caminho: `%LOCALAPPDATA%` (variável do Windows) em `design/mascote/ferramentas/render.py` e a lista de itens buscados no relatório do QA do DSG-07 |
| Q6 | `.blend` do `main` aberto por dentro (zstd) | 0 | **0** usuário, 0 computador, 0 caminho com letra de unidade, 0 e-mail |
| Q7 | `git rev-list --objects main \| grep -E '^(cb61663\|86c9a45\|3f85924\|ced985c\|ae7a59b)'` | 1 | **nenhum**: as versões antigas dos 3 textos e as 2 do `.blend` não são alcançáveis pelo `main` |
| Q8 | `git branch --list`; `git tag` | 0 | `main`, `feature/MSC-01-opcoes-de-mascote`, `reserva/design-antigo`, `reserva/main-antigo`; **0 etiquetas** |
| Q9 | varredura de **todos** os objetos alcançáveis pelo `main` (815 blobs, inclusive o `.blend` descompactado e 252 PNG, e 6 commits com cabeçalho e mensagem) por nome de usuário, computador, e-mail pessoal (inteiro e antes do `@`) e cada palavra do nome real, lidos na hora da reserva e do sistema | 0 | **0 em todos**. Controle: o mesmo script em `reserva/design-antigo` acha usuário em 5 objetos, e-mail pessoal em 20 e o nome real em 22, então a busca funciona |

Também sobre o `main`: os 252 PNG alcançáveis têm 0 blocos de metadado; e-mails nos textos, só o fictício de `example.com` (132 ocorrências em todas as versões).

### Pendências

- **H4a (configuração da conta do GitHub): não feita.** Pelo navegador, em Settings › Emails, "Keep my email addresses private" está **desligado** (lido em 24/11/2026; a opção de bloquear envios que expõem o e-mail aparece só depois de ligar a primeira). O token do `gh` não tem a permissão `user`, então não há como fazer por API. Mudar configuração da conta precisa do aval direto do responsável, por isso nada foi clicado. O responsável liga as duas opções (ou autoriza na conversa) **antes do envio**. A montagem local não depende disso.
- Os 4 arquivos de saída de teste com a pasta do projeto (`C:\campinguim`) ficaram como estão: D6 tratou só dos 3 documentos de uso.
- **Regerar o modelo 3D** com `design/mascote/3d/fonte/construir.py` (linha 1317, `save_as_mainfile`) grava o caminho de novo. Quem regerar precisa regravar como no item 6, ou o script passa a gravar desse jeito (mudança de código no mascote, a pedir ao dono da pasta).
- `docs/prova-tecnica/ambiente.md` descreve a captura como "tela dos dois emuladores lado a lado", o que continua certo.
- Depois do aprovado do QA: "pode" final do envio (H4c) e PROPOSTA 2 de F. Só `git push -u origin main`.

## Como foi feito

- Leitura de PNG: script próprio que percorre os blocos do arquivo direto do `git cat-file`, para todos os conteúdos de PNG de todos os commits. GLB: leitura do bloco JSON e varredura dos bytes. `.blend`: descompactado com o Python do Blender 5.3 (que traz o módulo zstd) e varrido por dentro; o teste de regravação de b1 rodou com `blender -b --factory-startup`, só na pasta temporária.
- Fontes: tabela de nomes de cada `.ttf` e SHA-256 contra `design/prototipos/LEIA-ME.md`.
- Remotion: `LICENSE.md` instalado, remotion.dev/docs/license, /docs/license/faq, /docs/terms (5.0) e /docs/terms-4-0, lidos em 24/11/2026. Não é parecer jurídico.
- Extrações e scripts ficaram na pasta temporária da sessão e foram apagados no fim.
