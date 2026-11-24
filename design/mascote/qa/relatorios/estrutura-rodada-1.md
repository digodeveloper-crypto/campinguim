# Estrutura da apresentação · rodada 1 · REPROVADA

Data: 2026-11-24 · Validado pelo QA (pane-551) · Autor: terminal da estrutura (encerrado; resultado vai ao piloto)
Alvo: `design/mascote/apresentacao/` (páginas, `_compartilhado/`, `opcoes/00-exemplo`, `opcoes/01` a `10` vazias, `LEIA-ME.md`)
Base: `docs/brief-cinema-1-mascote.md` ("Formato da apresentação"), `docs/brief-cinema-2-prototipos.md` ("Dados para preencher as telas"), `docs/PRD.md` (seção 4, MSC-02/03, NF-07, seção 17), `docs/SPEC.md` (telas 1 e 15), `CLAUDE.md`, `qa/roteiro.md` seção 5.

**Resumo:** o esqueleto está bem feito: ordem e partes pedidas no brief, 48 px reais, abre por duplo clique e por servidor, nenhum pedido externo, sem rolagem horizontal, botão de fundo funcionando, folha de avaliação completa. Reprova por **8 itens a corrigir**, quase todos pequenos e concentrados em textos e cores: telas simuladas que mostram funções que o PRD não tem, contraste abaixo de AA assim que a paleta de uma opção tiver uma cor média (verde, laranja), cabeçalho do site ilegível no celular, alvos de toque pequenos, textos fora do arquivo de textos e falhas silenciosas no aviso de pendências que o LEIA-ME promete.

Capturas e saídas em `qa/relatorios/estrutura-r1/` (feitas com `qa/captura.py`, Chrome 158, celular 390×844 densidade 3 e computador 1440×900, arte em fundo claro e escuro pelo botão da página). As capturas do autor em `evidencias/estrutura/` foram vistas, mas não usadas como prova: só têm fundo claro, só `file://`, sem medição.

---

## O que precisa mudar

### 1. Telas simuladas afirmam funções e regras que não estão no PRD

Evidência: `file-00-exemplo-computador-claro.png` (seção "Usos reais"), `teste-03-computador-claro.png`; textos em `_compartilhado/textos.js`, bloco `usos`.

| Texto | Problema | O que mudar |
| --- | --- | --- |
| Tela do app: "Confirmado por 7 campistas · aceita pet" e os dois "Atenção" sem data nem autor | Viola o princípio 6 do PRD ("Dado tem data e autor. Toda informação de camping mostra quem confirmou e quando"). A tela mostra o produto descumprindo um princípio dele. | Mostrar quem e quando, com o dado fixo do brief 2: "última: Carla R., nov/2026" (ou a linha inteira do fato de exemplo). |
| Cabeçalho do site: links "Listas · Campings · Grupos" | Inventa seções do site. A SPEC (tela 15) define a página inicial do site como "o que é, mascote, uma lista de exemplo navegável, lista de espera". Uma seção "Campings" no site contradiz o PRD seção 17: "a abertura pública da base de campings acontece só na fase 3". | Tirar os três links, ou usar só o que a tela 15 da SPEC tem. |
| Tela de abertura: barra de carregamento e "Preparando a lista" | A SPEC (tela 1) define a abertura como "mascote e botão único de começar". Na primeira abertura não há lista a preparar: ela nasce das respostas de E1-01. | Trocar barra e texto por um botão único neutro ("Começar"), como na SPEC. |

Para decisão do piloto (não conta para a reprovação):

- **"Seu amigo que nunca esquece nada."** (abertura): é uma promessa absoluta que não está no PRD. Vem da descrição do personagem no brief 1 ("o amigo que nunca esquece nada"), não de um texto do produto, e slogan é identidade, da etapa 2. Sugestão do QA: tirar, ou trocar por algo descritivo e sem promessa.
- **"Entrar na lista de espera"** (site): não foi inventado pelo autor. Está na SPEC (tela 15, função `waitlist_join`, tarefa 1.12) e no brief 2 (tela 15), mas o texto do PRD não fala de lista de espera, nem a seção 18 que a SPEC cita como fonte. Pode ficar; aviso ao piloto que é um item da SPEC sem fonte no PRD.
- **Abas "Lista · Camping · Grupo"** na tela do app: antecipam uma navegação que é escolha dos protótipos (DSG-01). Aceitável como cenário; o piloto decide.

### 2. Contraste abaixo de AA quando a primeira cor da paleta é média

Evidência: `saida-teste-leiame.txt`, `teste-03-*.png` (acento `#3f8f5a`), `teste-05-*.png` (acento `#e07a2f`).

- Os avisos "Atenção" da tela do app e o botão do site usam a primeira cor da paleta como fundo e escolhem texto branco ou escuro por `CAMP.corSobre`, que troca para texto escuro só acima de luminância 0,4. Com verde `#3f8f5a` o texto branco fica em **3,97:1**; com laranja `#e07a2f`, em **3:1**. AA pede 4,5:1 (NF-07). Paletas de camping (verdes, laranjas, terra) caem exatamente nessa faixa.
- **Mudar:** escolher entre branco e escuro pelo maior contraste calculado (o ponto de troca correto fica perto de luminância 0,18), e, se nenhum dos dois chegar a 4,5:1, escurecer o fundo até chegar. Vale para `aviso-app` e para o botão do site.
- Também: o texto "em produção" dentro dos palcos fica em **2,22:1** com o fundo da arte escuro (`#55555b` sobre `#1f1f23`), na comparação e na avaliação (`file-comparacao-*-escuro.png`). Passageiro, mas é o que o responsável vê até as opções chegarem. Clarear o texto nesse modo.

### 3. Cabeçalho do site ilegível no celular

Evidência: `file-00-exemplo-celular-claro.png` e `teste-03-celular-claro.png`, bloco "Cabeçalho do site". Medido a 390 px: o cabeçalho é a versão de computador reduzida para 0,324 do tamanho. Os links ficam com **4,9 px**, o botão com **4,5 px**, o subtítulo com **5,5 px** e o mascote do logotipo com **14 × 14 px**.

No celular, quem escolhe não consegue julgar o mascote no cabeçalho do site (MSC-03), e a apresentação precisa funcionar no celular (MSC-02). **Mudar:** abaixo de uma largura, mostrar o cabeçalho do site em versão de celular (logo, nome, botão), ou deixar a moldura rolar na horizontal sem reduzir, com aviso.

### 4. Alvos de toque menores que 44 px

Evidência: `saida-file.txt` (avaliação), `saida-teste-leiame.txt` (recomendação).

- Avaliação, tabela "Resumo": links "01" a "10" com **16 × 18 px** no celular e **18 × 20 px** no computador; nome da opção no cartão ("em produção", depois o nome) com **94 × 21 px**.
- Recomendação: título com link de cada preferida, **102 × 23 px**.
- **Mudar:** área de toque mínima de 44 × 44 px (padding ou `min-height`), como já existe nos botões e na navegação.

### 5. Textos fora do arquivo de textos

`CLAUDE.md`, regra 5, e o pedido do piloto: textos em pt-BR num único arquivo.

- `comum.js:145`: `aria-label: "Páginas"`.
- `comum.js`, `CAMP.validar`: todas as mensagens de pendência ("campo ausente: ", "raciocinio deve ter exatamente 3 linhas", "paleta vazia", "paleta[i]: precisa de nome, hex (#rrggbb) e papel", "arte.X sem caminho").
- **Mudar:** levar para `textos.js`. (Os símbolos "✓", "←" e "→" podem ficar no código.)

### 6. O aviso de pendências falha calado nos erros mais prováveis

O LEIA-ME promete: "Se algo faltar ou estiver errado, a página mostra no fim um aviso amarelo [...]. Sem pendências, está completo." Testei de verdade numa cópia temporária, fora de `apresentacao/` e já apagada, preenchendo as opções 03, 05, 07 e 09 só com o LEIA-ME e o modelo comentado.

| Caso testado | O que aconteceu | Evidência |
| --- | --- | --- |
| 07: trocou `numero` e esqueceu a chave `["00"]` (o passo 2 do LEIA-ME pede as duas trocas) | A página diz "Esta opção está em produção". **Nenhum aviso.** O designer acha que falta só esperar. | `teste-07-computador-claro.png` |
| 09: um arquivo de arte (`vista-lado`) não existe | A página mostra "arte ausente" no lugar, mas **sem aviso no fim**: a lista de pendências não confere se o arquivo existe. | `teste-09-computador-claro.png`, `saida-teste-leiame.txt` |
| 09: 8 poses extras (o limite é 3) | Mostra 12 poses, **sem aviso**. | `teste-09-computador-claro.png` |

**Mudar:** (a) quando o registro tiver uma opção com chave diferente da pasta, ou `numero` diferente da chave, mostrar o aviso em vez de "em produção"; (b) incluir no aviso os arquivos de arte que não carregaram; (c) avisar acima de 3 poses extras.

### 7. Nota do bloco "Ícone em 48 px" errada no celular

"À esquerda, a versão grande. À direita, o ícone..." No celular os blocos ficam um embaixo do outro (`file-00-exemplo-celular-claro.png`). **Mudar** para algo que valha nas duas larguras ("Primeiro a versão grande; depois o ícone no tamanho real...").

### 8. Frase da página inicial imprecisa

"A avaliação fica na última página." A última página é a recomendação (brief: "numa página separada no fim"); a avaliação fica no menu do topo. **Mudar** para "A folha de avaliação fica no menu do topo".

---

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Página inicial: 10 lado a lado, mesmo tamanho, mesmo fundo, numeradas, nome e frase | ok. Arte alta (100×160) e larga (200×100) entram no mesmo palco quadrado, sem distorcer. | `file-index-*.png`, `teste-index-*.png` |
| Página por opção: mesma estrutura e ordem (grande, 3 vistas, 4 poses, 5 usos, uma cor, ícone 48, paleta + 3 linhas) | ok. O mesmo código monta as 10 e o exemplo; "Originalidade" vem depois, como acréscimo. | `file-00-exemplo-*.png` |
| Comparação: 10 ícones de 48 px numa fileira e 10 versões em uma cor em outra | ok. Fileira medida em 48 × 48 px. | `teste-comparacao-*.png` |
| Recomendação separada, só pelo link com aviso | ok. O único link fica num `<dialog>` aberto pelo botão discreto no fim da comparação; nenhuma outra página aponta para ela. | `interacao-*-aviso-recomendacao.png`, `saida-interacao.txt` |
| Nomes, cores e fundos neutros | ok. Só cinzas e areias no CSS; a paleta da opção entra só como acento. | `estilo.css` |
| Usos reais montados pela página, iguais para todas | ok na montagem; **falha nos textos** (item 1) e no **cabeçalho do site no celular** (item 3) | itens 1 e 3 |
| Dados fixos do brief 2, conferidos um a um | ok: Camping Recanto das Águas; confirmado por 7 campistas; aceita pet; 1 chuveiro quente para cerca de 25 barracas; churrasco só no quiosque comum; entrou extensão de 20 m (tomada longe); saiu grelha portátil (churrasco só no quiosque); tarefa conferir os aparelhos (220 V). Nada de texto de preenchimento. Falta data e autor (item 1). | `textos.js` |
| Ícone em 48 px CSS reais | ok: 48 × 48 na página da opção (claro e escuro) e na comparação | `saida-file.txt`, `saida-teste-leiame.txt` |
| Abre por duplo clique (`file://`) e por servidor estático | ok: as 6 páginas abriram nos dois modos, inclusive com opção preenchida | `saida-interacao.txt` |
| Zero pedido externo | ok, em todas as páginas e larguras | `saida-file.txt` |
| Zero erro de console | ok. O único erro foi o arquivo apagado de propósito no teste 09. | `saida-file.txt`, `saida-teste-leiame.txt` |
| Sem rolagem horizontal em 390 e 1440 | ok, em todas | idem |
| Alvos de toque de 44 px | **falha** (item 4) | |
| Contraste AA | **falha** (item 2) | |
| Botão de fundo claro/escuro | ok: troca, o rótulo diz o estado (`aria-pressed`) e o fundo se mantém entre páginas | `saida-interacao.txt` |
| Folha de avaliação: 7 critérios do pedido | ok: nomes e perguntas idênticos ao brief | `textos.js`, `file-avaliacao-*.png` |
| Notas guardadas e cópia em texto | ok: notas sobrevivem a recarregar (file e http); "Copiar como texto" mostra "Copiado." e a caixa com o texto | `interacao-*-avaliacao.png`, `saida-interacao.txt` |
| Bloco "Sem o acessório" | ok: aparece com a chave, some sem ela | `file-00-exemplo-*.png`, `teste-03-*.png` |
| De 4 a 7 poses | ok no layout (7 sem quebrar); **sem limite** acima de 7 (item 6) | `teste-09-*.png` |
| Textos em pt-BR num único arquivo | **falha** (item 5) | |
| LEIA-ME suficiente para preencher sem ler o código | **parcial**: preenchi 4 opções só com ele e o modelo, sem dificuldade, mas o aviso que ele promete falha calado (item 6) | `teste-*.png` |

## Observações (não reprovam)

- A recomendação aceita a mesma opção duas vezes (teste com "03" repetida: aparece em 2º e 3º lugar). Como quem preenche é a Cinema, basta o LEIA-ME avisar, ou a página ignorar repetidas.
- `"3"` sem zero é corrigido para `"03"`: bom.
- O fundo escuro escurece só os palcos da arte, não a página: está de acordo com a decisão do piloto (tema escuro não exigido).

## Como foi testado

```
python -I captura.py pagina <página> relatorios/estrutura-r1 --rotulo file-<nome> --auditar      (7 páginas, original)
python -I captura.py pagina <cópia>/<página> relatorios/estrutura-r1 --rotulo teste-<nome> --auditar  (cópia preenchida pelo LEIA-ME)
python -I interacao.py <cópia> relatorios/estrutura-r1   (file:// e http://127.0.0.1:8765: abrir, notas, cópia, aviso da recomendação, fundo)
```

Todos terminaram com exit 0. Cópia temporária e script de interação ficaram na pasta temporária do QA e foram apagados.

Durante a rodada, o `captura.py` ganhou: clique no botão de fundo da página, abertura por `http://`, medição (`--auditar`: alvos < 44 px, textos abaixo de AA, tamanho real dos ícones de 48 px) e captura em faixas coladas para páginas altas. Acima de cerca de 16 mil pixels, o Chrome repetia o conteúdo na captura; era falha da ferramenta, não da página, e foi corrigida e conferida. Por isso as primeiras saídas de `saida-file.txt` para `00-exemplo` e `avaliacao` vêm de antes da correção: os números são os mesmos, só as imagens foram refeitas.
