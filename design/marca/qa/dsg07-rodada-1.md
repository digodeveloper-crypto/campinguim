# DSG-07 · logos para o perfil do Instagram e do TikTok · rodada 1 · APROVADO

Data: 2026-11-24 · Entregue por: Cinema (pane-651) · Conferido por: QA (pane-646)
Alvo: commit local `c932b51`, 74 arquivos, todos em `design/marca/`. São 10 opções em 3 variantes cada, o letreiro horizontal, a página, o LEIA-ME, as medidas e o gerador.
Base: o pedido do piloto (material oficial, contraste medido, tamanhos com fonte, página sem dependência externa, sem caminho de máquina nem segredo, nada fora de `design/marca/`); o guia do mascote (`design/mascote/guia/guia.html`); `design/mascote/final/LEIA-ME.md`; `docs/DESIGN.md`; `design/mascote/direcao/originalidade.md`; `CLAUDE.md`.

## Aceite

| Critério | Resultado | Como o QA conferiu |
| --- | --- | --- |
| Mascote só do pacote final, sem giro, espelho, recorte ou filtro | ok. Nos 33 SVG com mascote, a sequência de formas é **idêntica** à do arquivo oficial: `vetor/claro/icone.svg` (13 formas), `vetor/escuro/icone.svg` (26) e `icone/fonte/icone-uma-cor.svg` (11). Nas versões em uma cor só a tinta muda, e o guia (seção 3) permite isso: "só a `uma-cor`, trocando o preenchimento". As transformações são só `translate` e `scale` com um número positivo (de 0,68 a 1,92). Nenhum `rotate`, `matrix`, escala negativa, `filter`, `mask` ou `clip-path` | script que compara elemento por elemento com os arquivos oficiais; busca nas transformações |
| Archivo OFL local | ok. O letreiro é contorno, sem nenhum `<text>`, `font-family`, `href` ou `url(` nos SVG. A página carrega `Archivo-variavel.ttf` de `design/prototipos/_compartilhado/fontes/archivo/`, onde está o `OFL.txt` | busca nos SVG; fontes carregadas no navegador: só "Archivo" |
| Só a paleta Eucalipto (mais as cores oficiais do mascote) | ok. 18 cores distintas nos SVG, **0 fora** dos 18 hex da Eucalipto (claro e escuro), das 5 cores do mascote e da tinta `#111111` com o branco | extração de todos os hex |
| Contraste medido | ok. **11 pares recalculados pelo QA, todos iguais à entrega:** 13,40; 15,47; 9,08; 11,73; 6,05; 4,85; 6,40; 8,77; 3,24; 7,68; 6,60. Corpo do mascote ≥ 3:1 em todas as variantes, como pede o guia na seção 3. Letreiros ≥ 9,08 | fórmula da WCAG pelos hex |
| Tamanhos de perfil com fonte oficial e data, ou "não confirmado" | ok. **Instagram:** "não confirmado", com as páginas oficiais citadas; o QA abriu a página de ajuda da foto de perfil e ela não traz nenhum pixel. **TikTok:** frase confirmada pelo QA na página oficial renderizada, na versão em português: "As fotos carregadas devem ser de pelo menos 20x20 pixels". Os números de blog não foram usados | página oficial aberta no Chrome |
| `index.html` sem dependência externa, opções em círculo em 3 tamanhos | ok. 0 pedidos fora de `file:`, 0 falhas, 0 erros no console. 93 imagens, 0 quebradas. Círculos (`border-radius: 50%`) de 160, 80 e 40 px. Sem rolagem lateral em 1280, 390 e 320 px (`scrollWidth` = `clientWidth`). Textos todos em `textos.js` (o HTML só tem `data-texto`) | Chrome pelo Playwright, nas três larguras; captura em 390 px |
| Nenhum caminho de máquina nem segredo | ok. 0 resultados para `C:\`, `Users`, `AppData`, nome de usuário do Windows, e-mail ou padrões de segredo em `design/marca/`. Os 36 PNG não têm bloco de metadado além dos técnicos | busca no texto; leitura dos blocos dos PNG |
| Nada fora de `design/marca/` | ok. O commit tem 74 arquivos, todos em `design/marca/`. Depois dele, `git status` não tem mudança em arquivo rastreado | `git show --name-only` |
| Gerador refaz tudo | ok. `python -I design/marca/ferramentas/gerar.py`: exit 0 em 28 s, e `git status` em `design/marca/` saiu **vazio**: a saída é idêntica byte a byte ao que está no commit | execução pelo QA |
| PNG | ok. 36 PNG em RGB; 1024 × 1024, 2048 × 512 e 1024 × 256, conforme o nome | Pillow |

## Respiro (a interpretação que a Cinema pediu para conferir)

- **A regra do guia, seção 5.** "Use sempre o quadrado inteiro da prancha. Nunca recorte o viewBox nem aproxime a figura da borda." O respiro mínimo é "32 de 512 = 1/16 do lado".
- **A leitura da Cinema.** O respiro de 1/16 é medido entre a figura e a borda do círculo da foto. Os cantos vazios da prancha ficam fora do círculo.
- **Medida do QA, nos PNG.** A distância da figura até a borda do círculo é de 62,1 px (01 claro), 62,4 (01 escuro), 61,9 (10 claro) e 61,8 (01 uma cor), em 1024. O mínimo pedido, 32 × 1,911, é 61,2 px. **Cumpre.**
- **Veredito do QA.** A leitura é aceita. A figura não é recortada e não fica a menos de 1/16 da borda visível. O que sai do círculo são só os cantos vazios da prancha, e esse recorte é feito pela própria rede, não pela arte. Se o responsável preferir a leitura literal (a prancha inteira dentro do círculo), a figura encolhe cerca de 29 %, e em 40 px a prancha cai para uns 28 px. Isso fica abaixo do mínimo de 32 px do ícone escuro.
- **Letreiro fora do quadrado (04, 05, 06 e letreiro horizontal).** Pela caixa dos contornos, o letreiro começa exatamente na borda da prancha. Em 04 e 06, a diferença é de até 1 unidade em 1024, vinda dos pontos de controle das curvas, menos de 0,05 px em 40 px. Não entra no quadrado. Entre a figura e o letreiro fica o respiro de 32 da própria prancha.

## Observações (não reprovam; o piloto leva ao responsável junto com as opções)

1. **"Disco azul" nas opções 06 clara e 10 clara.** A foto de perfil é sempre redonda, então nessas duas o mascote aparece dentro de um disco cheio da cor `acento` `#1F4B4D`. Na 10, ele está ainda em uma cor só. `docs/DESIGN.md` diz "não pôr o mascote dentro de um disco azul". `design/mascote/direcao/originalidade.md` diz "Versão em uma cor nunca é apresentada dentro de um disco azul", por causa de um emblema de pinguim em círculo azul de uma marca de equipamentos de camping. O `#1F4B4D` é o verde-petróleo da paleta, não o "azul vivo" da referência, então a regra não é quebrada ao pé da letra. Mas a 10 clara é a opção mais perto daquele emblema, e o LEIA-ME não fala disso. **Recomendação do QA:** avisar o responsável antes da escolha; a 10 e a 06 em versão clara ficam como as menos indicadas.
2. **As opções 04, 05, 06 e 09 ficam abaixo dos mínimos do guia em 40 px** (o mascote com 13,6 a 17,9 px; o letreiro com 1,8 a 2,7 px). A entrega declara isso no LEIA-ME, seção 6.2, mas a página não mostra o aviso. Como foto de perfil, elas aparecem pequenas nos comentários.
3. **O commit `c932b51` foi feito no ramo `feature/MSC-01-opcoes-de-mascote`**, que a conferência F0-P vai guardar como `reserva/design-antigo` e usar como base da montagem do `main`. Consequências:
   - o roteiro (c) da F0-P não tem commit para `design/marca/`;
   - a conferência Q3 (árvore igual à da reserva) vai acusar a pasta;
   - a F0-P não conferiu esta pasta.

   **Decidido pelo piloto (24/11/2026):** o DSG-07 entra no `main` como o último commit, com `design/marca/` inteira, e a montagem foi avisada. Na rodada 2 da F0-P, o QA confere que o commit existe e que a árvore está igual. As buscas deste relatório já cobrem, para `design/marca/`, as categorias 1 e 3 e os metadados dos PNG. O autor do commit é o mesmo e-mail pessoal dos outros, e a montagem do zero resolve isso.
4. **O `uharfbuzz` 0.57.0 foi instalado no Python da máquina**, fora do repositório. Está registrado e é preciso para rodar o gerador de novo.
