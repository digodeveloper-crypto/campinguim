# Campinguim · logos para o perfil · DSG-07

Logos para a foto de perfil do Instagram e do TikTok. O pedido do responsável foi "precisamos de uma logo para por no instagram e tiktok". Depois ele mudou o pedido para "gera 10 versoes de logotipo para rede social".

- **Data:** 24/11/2026.
- **Conferência visual:** abra `index.html` com dois cliques.
  - A página mostra as 10 opções já recortadas em círculo, em três tamanhos: grande (160 px), 80 px e 40 px.
  - Cada opção aparece em três quadros: tela clara com a versão clara, tela escura com a versão escura, e a versão de uma cor.
  - A página não usa nada da internet. A fonte é a Archivo local e os textos estão em `textos.js`.
- **A escolha é do responsável.** A seção 7 traz a recomendação da Cinema.

## Escolha do responsável

- **Data:** 24/11/2026.
- **Escolhida:** a **opção 01, o pinguim sozinho**, para a foto de perfil do Instagram e do TikTok. É a mesma que a Cinema pôs em primeiro (seção 7). A página `index.html` a marca como "Escolhida".
- **Arquivos prontos para subir**, na pasta `perfil/`:

| Arquivo | Para quê | O que é |
| --- | --- | --- |
| `perfil/instagram-perfil.png` | foto de perfil do Instagram | cópia exata de `opcoes/01-mascote/png/01-claro-1024.png` |
| `perfil/tiktok-perfil.png` | foto de perfil do TikTok | a mesma cópia exata |
| `perfil/perfil.svg` | vetor-fonte da foto de perfil | cópia exata de `opcoes/01-mascote/01-claro.svg` |

- **Formato:** 1024 × 1024, RGB opaco. Atende ao mínimo de 20 × 20 do TikTok. O Instagram não fixa tamanho (seção 5).
- **Variante: a clara.**
  - O pinguim fica sobre o `fundo` claro da Eucalipto, `#DCE8E2`, com o corpo a 6,05:1 do fundo.
  - Este LEIA-ME não recomenda a escura para o perfil. A foto é uma só e aparece igual com a rede em tema claro ou escuro, e a clara é a do tema principal do app (DESIGN.md, seção 2).
  - A escura (`01-escuro`) e a de uma cor (`01-uma-cor`) ficam guardadas em `opcoes/01-mascote/` para outros usos.
- **Conferência da cópia:** o SHA-256 das cópias é igual ao dos originais.
  - os dois PNG: `2ded1b669ec2…`;
  - o SVG: `694908b85f45…`.
- **Observações do QA, levadas ao responsável antes da escolha** (`qa/dsg07-rodada-1.md`). Nenhuma das duas toca na opção 01.
  1. **06 clara e 10 clara ficam perto do "disco azul" proibido.** A foto é sempre redonda, e nessas duas o mascote aparece dentro de um disco cheio de `acento` `#1F4B4D`, o verde-petróleo da paleta; na 10, ele ainda está em uma cor só.
     - O DESIGN.md (seção 13) e `design/mascote/direcao/originalidade.md` proíbem o mascote, e em especial a versão de uma cor, dentro de um disco azul, porque lembra o emblema de uma marca de equipamentos de camping.
     - O verde-petróleo não é o azul vivo da referência, mas a 10 clara é a opção mais perto daquele emblema. O QA as deixou como as menos indicadas.
  2. **04, 05, 06 e 09 ficam abaixo dos mínimos do guia em 40 px.** Em 40 px, que é o tamanho dos comentários, o mascote fica com 13,6 a 17,9 px e o letreiro com 1,8 a 2,7 px (seção 6.2).

## 1. O que tem na pasta

| Caminho | O que é |
| --- | --- |
| `opcoes/NN-nome/NN-claro.svg`, `NN-escuro.svg`, `NN-uma-cor.svg` | SVG-fonte de cada opção, nas três variantes. Prancha quadrada de 1024, com fundo cheio até a borda |
| `opcoes/NN-nome/png/NN-{variante}-1024.png` | PNG quadrado de 1024 × 1024, RGB opaco, pronto para subir na rede |
| `letreiro-horizontal/letreiro-horizontal-{claro,escuro,uma-cor}.svg` | letreiro para capas e cabeçalhos, com prancha de 2048 × 512 |
| `letreiro-horizontal/png/…-2048x512.png` e `…-1024x256.png` | o letreiro em PNG |
| `index.html`, `textos.js` | página de apresentação e arquivo de textos dela |
| `medidas.json` | o que o gerador mediu: círculo da figura, escalas e todos os contrastes |
| `ferramentas/gerar.py` | gerador. Refaz tudo com `python -I design\marca\ferramentas\gerar.py`, com exit 0 |

São 30 SVG e 30 PNG nas opções, mais 3 SVG e 6 PNG no letreiro horizontal.

Os SVG não têm imagem embutida, nenhuma referência externa, nenhum `<text>` e nenhuma fonte: o letreiro está convertido em contorno. Conferido com `grep`: 0 arquivos com `<image`, `href=`, `<text`, `font-family` ou `url(`.

## 2. De onde vem cada peça

Tudo vem de material oficial. O mascote só muda de tamanho e de lugar.

| Peça | Origem | O que foi feito |
| --- | --- | --- |
| Mascote colorido | `design/mascote/final/vetor/claro/icone.svg` | As formas foram copiadas sem mudança, dentro de um `<g transform="translate() scale()">`. É a arte feita para tamanho pequeno. O guia manda usá-la abaixo de 48 px, no lugar da `principal` |
| Mascote para fundo escuro | `design/mascote/final/vetor/escuro/icone.svg` | a mesma regra, com o contorno creme da versão escura oficial |
| Mascote em uma cor | `design/mascote/final/icone/fonte/icone-uma-cor.svg` | A mesma regra. Só a tinta `#111111` troca de cor (na opção 10 e no negativo da 06), que é a única troca permitida (guia, seção 3) |
| Letreiro "CAMPINGUIM" | Archivo variável local, `design/prototipos/_compartilhado/fontes/archivo/` (OFL) | Largura 125, peso 800, +0,08 em entre letras e caixa alta, como na `.marca-nome` do DESIGN.md (seção 4.2). Convertido em contorno com HarfBuzz, com o kerning da fonte |
| Monograma "C" | a mesma Archivo 125/800 | a letra do letreiro, sozinha, centrada pela tinta |
| Cores | os 10 papéis da paleta Eucalipto (DESIGN.md, seção 3.1) e a tinta única `#111111` com o branco (guia, seção 2) | nenhuma cor nova |
| Curvas de nível | a função `curvas` de `design/prototipos/rumo/icones.js` | A mesma conta, na escala da prancha: 14 anéis, traço de 4 em 1024, papel `linha` a 60 %, a opacidade da abertura (DESIGN.md, seção 5). Na uma cor, a tinta fica a 35 % |
| Selo | o retângulo de canto cortado do Rumo (DESIGN.md, seção 5) | Octógono com corte de 10 % do lado e traço `carro`, como o selo. Não há selo redondo |

## 3. Regras do guia, e como cada uma foi cumprida

- **Mascote sem alteração.** Ele não foi girado, espelhado, recortado por dentro nem filtrado. Não tem transparência e não recebeu texto dentro da arte. Só `translate` e `scale` uniforme.
- **Respiro.** O guia pede 32 de 512, ou 1/16 da prancha (seção 5). Aqui ele vale contra a borda do círculo:
  - o gerador renderiza o ícone e mede o menor círculo que contém a figura;
  - claro e uma cor: centro (258,0; 269,3) e raio 235,9 na prancha de 512;
  - escuro, já com o contorno: centro (257,5; 269,0) e raio 234,0;
  - a escala é a maior em que esse raio, **mais 32**, cabe no círculo da foto;
  - a figura fica centrada pelo próprio círculo, não pela prancha.
- **Interpretação a conferir pelo QA.** Os cantos vazios da prancha quadrada passam da borda do círculo. A figura não: ela fica inteira, com pelo menos 1/16 de folga até a borda. O guia proíbe aproximar a **figura** da borda e recortá-la, e isso não acontece aqui.
- **Texto fora do quadrado do mascote.** Nas opções 04, 05 e 06 e no letreiro horizontal, o letreiro começa onde a prancha do mascote termina, embaixo ou ao lado (guia, seção 5).
- **Fundo escuro.** O mascote colorido aparece de dois jeitos:
  - a versão escura oficial, com contorno creme (opções 01, 03, 04, 05 e 06 claro);
  - a versão clara sobre o papel `texto` `#E2EEEA`, que é a regra do Rumo no tema escuro (DESIGN.md, seção 8). É o caso da opção 02 escuro.
- **O que o pedido trazia e as regras não permitem.** Esses pontos ficaram de fora:
  - **Só a cabeça ou o gorro.** O guia proíbe recortar ("A figura aparece inteira", seção 11). O enquadramento variou só pelo tamanho e pelo apoio.
  - **Selo circular.** O DESIGN.md proíbe "selo redondo" (seções 5 e 13). As opções "com selo" (02 e 08) usam o selo de canto cortado do Rumo.
  - **Letreiro em arco.** O DESIGN.md (seção 4) só define o letreiro em linha reta. Além disso, a seção 13 proíbe o "selo redondo com nome de lugar em anel", que é a forma do texto em arco dentro de um círculo.

## 4. As 10 opções

| Nº | Opção | Claro | Escuro | Uma cor |
| --- | --- | --- | --- | --- |
| 01 | Mascote sozinho, o maior possível | ícone sobre `fundo` | ícone escuro sobre `fundo` escuro | ícone uma cor `#111111` sobre branco |
| 02 | Mascote no selo de canto cortado | apoio `superficie`, traço `carro` | apoio papel `texto`, traço `carro` escuro, mascote claro | apoio branco, traço `#111111` |
| 03 | Mascote e curvas de nível | 01 com as curvas em `linha` a 60 % | igual, no escuro | curvas `#111111` a 35 % |
| 04 | Mascote e letreiro abaixo | letreiro `texto` | letreiro `texto` escuro | tudo `#111111` |
| 05 | Mascote e letreiro ao lado | idem | idem | idem |
| 06 | Mascote e letreiro sobre o acento | fundo `acento`, letreiro `sobre-acento`, mascote versão escura | fundo `acento` escuro (claro), mascote versão clara | negativo: branco sobre `#111111` |
| 07 | Monograma "C" | "C" `acento` sobre `fundo` | "C" `acento` escuro sobre `fundo` escuro | `#111111` sobre branco |
| 08 | Monograma "C" no selo | "C" e traço `carro` | o mesmo, no escuro | `#111111` |
| 09 | Letreiro sozinho e curvas de nível | letreiro `texto` | idem, no escuro | `#111111` |
| 10 | Mascote em uma cor sobre o acento | tinta `sobre-acento` sobre `acento` | tinta `sobre-acento` escura sobre `acento` escuro | negativo: branco sobre `#111111` |

## 5. Tamanhos pedidos pelas redes (consulta de 24/11/2026)

| Rede | O que a ajuda oficial diz | Fonte |
| --- | --- | --- |
| Instagram | **Tamanho mínimo e recomendado: não confirmado.** O artigo de ajuda sobre a foto de perfil só descreve os passos, sem pixel nem formato. A busca da Central de Ajuda responde, por um assistente e não por um artigo: "Instagram does not specify a required pixel size for profile pictures, but they are displayed as a circle" | https://help.instagram.com/557544397610546 (sem data); https://help.instagram.com/search?query=profile%20picture%20size (sem data) |
| Instagram (não é perfil) | "width between 320 and 1080 pixels" vale para **foto publicada no feed**, não para a foto de perfil. Os números 320 × 320 e 110 × 110 para perfil só aparecem em blogs | https://help.instagram.com/1631821640426723 (sem data) |
| TikTok | **Mínimo:** "Photos must be at least 20x20 pixels to upload." **Recomendado: não confirmado.** Os números 200 × 200 e outros só aparecem em blogs | https://support.tiktok.com/en/getting-started/setting-up-your-profile/adding-a-profile-photo-or-video (redireciona para https://www.tiktok.com/support/faq_detail?id=7581821549855038008; sem data) |
| TikTok Ads (não é perfil de conta) | 98 × 98 px, quadrado, jpg/png, menos de 50 KB, o essencial no centro de 66 × 66. Vale para anúncio com identidade própria, que o TikTok está encerrando: "Starting January 2026, all new campaigns must be linked to a TikTok account." | https://ads.tiktok.com/help/article/tiktok-auction-in-feed-ads (atualizada em junho de 2026); https://ads.tiktok.com/help/article/about-changes-coming-to-custom-identity (março de 2026) |

**O que foi entregue:** PNG quadrado de **1024 × 1024**, opaco.
- Atende ao único mínimo oficial, os 20 × 20 do TikTok.
- O Instagram não fixa tamanho.
- Não foram gerados 320 nem 200, porque nenhuma página oficial os pede para a foto de perfil.

As duas redes recortam a foto no aplicativo e mostram em círculo (o Instagram pela resposta da sua Central; o TikTok só diz "Crop your selected photo"). Por isso cada arte foi composta para o círculo inscrito no quadrado.

Pesquisa feita pelo texto das páginas oficiais. A página do TikTok só carrega com JavaScript, então foi lida num navegador automatizado.

## 6. Medidas

### 6.1 Contraste (WCAG 2.x, calculado pelos hex; tudo também em `medidas.json`)

| Opção | Par | Claro | Escuro | Uma cor |
| --- | --- | --- | --- | --- |
| 01, 03 | corpo `#4A5560` / fundo | **6,05** | — | — |
| 01, 03, 04, 05 | contorno creme `#FBF3E4` / `fundo` escuro `#0C1615` (o corpo fica a 6,90 do contorno) | — | **16,69** | — |
| 01, 03, 04, 05, 07, 09 | tinta `#111111` / branco | — | — | **18,88** |
| 02 | corpo / apoio | 7,15 (`superficie`) | 6,40 (papel `texto` `#E2EEEA`) | 18,88 |
| 02 | traço do selo `carro` / fundo | 6,60 | 10,60 | 18,88 |
| 03, 09 | curva `linha` cheia / fundo (enfeite, a 60 %) | 3,24 | 3,96 | — |
| 04, 05 | **letreiro `texto` / `fundo`** | **13,40** | **15,47** | 18,88 |
| 06 | **letreiro `sobre-acento` / `acento`** | **9,08** | **11,73** | 18,88 (branco / `#111111`) |
| 06 | mascote / `acento` | contorno creme 8,77 | corpo 4,85 | 18,88 |
| 07 | "C" `acento` / `fundo` | 7,68 | 11,73 | 18,88 |
| 08 | "C" e traço `carro` / `fundo` | 6,60 | 10,60 | 18,88 |
| 09 | **letreiro `texto` / `fundo`** | **13,40** | **15,47** | 18,88 |
| 10 | tinta `sobre-acento` / `acento` | 9,08 | 11,73 | 18,88 |
| letreiro horizontal | letreiro / fundo | 13,40 | 15,47 | 18,88 |

- Todos os letreiros ficam acima de 4,5:1. O menor é 9,08, na opção 06 clara.
- O corpo do mascote fica acima de 3:1 (guia, seção 3) em todas as variantes. O menor é 4,85, na opção 06 escura.

### 6.2 Tamanho real na tela (px de CSS)

"Prancha" é o quadrado de 512 do mascote. Os mínimos do guia, na seção 6, são: ícone claro 24 px, ícone escuro 32 px e uma cor 24 px. "Maiúscula" é a altura da letra maiúscula do letreiro.

| Opção | Grande (160) | 80 px | 40 px | Lê em 40 px? |
| --- | --- | --- | --- | --- |
| 01, 03, 10 | prancha 153 | 76,5 | **38,2** (escuro 38,5) | sim: acima dos mínimos de 24 e 32 |
| 02 | prancha 104 | 52 | **26** | sim. O escuro usa o ícone claro sobre o papel, que tem mínimo de 24 |
| 04, 06 | prancha 71 · maiúscula 9,3 | 35,7 · 4,7 | **17,9 · 2,3** | não: o mascote fica abaixo do mínimo e o letreiro é ilegível |
| 05 | prancha 55 · maiúscula 7,1 | 27,3 · 3,6 | **13,6 · 1,8** | não |
| 07 | maiúscula 83 | 42 | **21** | lê como "C" |
| 08 | maiúscula 64 | 32 | **16** | lê como "C" |
| 09 | maiúscula 10,8 | 5,4 | **2,7** | não: o nome só lê no tamanho grande |

## 7. Recomendação da Cinema (a escolha é do responsável)

> **RECOMENDAÇÃO, não decisão.**

1. **Opção 01, mascote sozinho.**
   - É a única família que fica acima dos mínimos do guia nos três tamanhos, em claro, escuro e uma cor. Em 40 px a prancha mede 38 px.
   - O pinguim de gorro é o que as pessoas vão reconhecer no feed e nos comentários.
   - O nome já aparece ao lado da foto nas duas redes, então não precisa estar dentro dela.
   - Usa a mesma arte do ícone do app, então o perfil e o ícone na tela do celular combinam.
2. **Opção 03, mascote e curvas de nível.**
   - Tem a mesma leitura da 01 e acrescenta a assinatura do Rumo.
   - As curvas somem sozinhas em 40 px, sem atrapalhar.
   - Fica melhor que a 01 no tamanho grande, na página do perfil.
   - É a escolha se o responsável quiser a identidade visual mais presente.
3. **Opção 02, mascote no selo.**
   - É a cara da caderneta do Rumo, e no escuro segue a regra do app: o mascote fica sobre o papel claro.
   - Lê em 40 px, mas o mascote fica um terço menor que na 01 (26 px contra 38 px).
   - O selo quadrado dentro do círculo também gasta espaço.

**Por que as outras não:**
- **04, 05, 06 e 09:** o letreiro dentro do círculo fica com 2 a 3 px de altura em 40 px, e mesmo em 80 px não passa de 5,4 px. O letreiro só serve no tamanho grande, e nele o nome já aparece escrito pela rede.
- **07 e 08:** leem bem, mas um "C" sozinho não diz "Campinguim". O mascote é o que a marca tem de próprio.

O **letreiro horizontal** é derivado da opção 01:
- o ícone ocupa a altura toda da prancha de 512;
- CAMPINGUIM vem ao lado, com maiúscula de 107 em 512 e largura de 1472;
- tem margem à direita igual ao respiro do ícone.

Se o responsável escolher outra opção, o letreiro pode ser refeito a partir dela.

## 8. Como foi gerado e conferido

- **Python 3.12** com Pillow 12.3 e fontTools 4.68, que já estavam instalados. **uharfbuzz 0.57.0 foi instalado nesta tarefa**, com `python -m pip install uharfbuzz`, para converter o letreiro em contorno com o kerning da fonte.
- **PNG:**
  - o Chrome instalado desenha cada SVG direto no tamanho final (`capturar` de `design/mascote/ferramentas/render.py`);
  - o resultado é salvo em RGB opaco;
  - tamanhos conferidos: 1024 × 1024, 2048 × 512 e 1024 × 256.
- **Rodada final:** `python -I design\marca\ferramentas\gerar.py`, exit 0. Foram 30 opções e variantes, mais 3 letreiros.
- **Olhado a olho:**
  - uma prancha com as 10 opções recortadas em círculo, em 200, 80 e 40 px, sobre branco e sobre preto;
  - o letreiro horizontal nas três variantes;
  - a página em 1280 px e em 390 px de largura, que tem 375 px úteis e nenhuma rolagem para o lado.
- **Nada de terceiros:** nenhuma marca, ícone ou imagem de fora. A fonte é a Archivo (OFL), já no projeto.
- **Temporários:** as capturas de conferência ficaram na pasta de rascunho da sessão, fora do repositório, e foram apagadas. O gerador apaga a pasta temporária dele ao terminar.
