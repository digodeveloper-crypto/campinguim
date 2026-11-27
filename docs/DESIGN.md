# Identidade visual do Campinguim

Referência visual da spec e do QA durante o desenvolvimento (DSG-06). Também é a base do arquivo de identidade dos vídeos e o ponto de partida do site (`docs/brief-cinema-2-prototipos.md`, "Depois da escolha").

Quem lê: agentes de desenvolvimento e o QA. Este arquivo não repete o PRD nem a SPEC. Regras de negócio, conteúdo da lista e textos legais ficam lá.

Cada valor daqui vem do protótipo aprovado ou de um documento do projeto, e a origem está citada. Caminhos de `rumo/` e `_compartilhado/` são relativos a `design/prototipos/`.

**Regra de ouro:** na dúvida entre este arquivo e o protótipo, abra o protótipo. Se os dois divergirem, pare e avise o orquestrador.

---

## 1. A escolha

| Item | Valor | Origem |
| --- | --- | --- |
| Protótipo | 4 · **Rumo** (mapa e expedição) | escolha do responsável, DSG-05 |
| Paleta | **Eucalipto** | escolha do responsável, DSG-05 |
| Data | 24/11/2026 | escolha do responsável |
| Quem escolheu | o responsável pelo produto | DSG-05, MSC-07 |
| Mascote | opção 03, **Filhote de gorro** | MSC-07 |
| Combinação de direções | nenhuma. Só a paleta muda: a Eucalipto, uma das quatro opções de cor do Rumo | `rumo/paletas.html` |

### Onde está a referência navegável

- Pasta: `design/prototipos/rumo/`.
- Abra `rumo/01-abertura.html` no navegador, direto do disco (`file://`), sem servidor e sem rede.
- **Sem parâmetro, o Rumo abre na Eucalipto.** Qualquer tela pode ser aberta direto, por exemplo `rumo/04-lista.html`.
- Parâmetros úteis no endereço:
  - `tema=claro` ou `tema=escuro`. Sem ele, segue o aparelho;
  - `fonte=100`, `130` ou `200`. É o tamanho da letra na raiz;
  - `moldura=0` tira a moldura de celular no computador;
  - `avaliador=0` esconde a barra do avaliador;
  - `paleta=original` mostra a paleta anterior, só para comparar. As outras opções (`geleira`, `pitanga`, `jabuticaba`) também continuam abrindo.
- Página de identidade do Rumo: `rumo/identidade.html`. Ela lê as cores do próprio `estilo.css` e calcula os contrastes na hora.
- Comparação das cinco paletas: `rumo/paletas.html`. A Eucalipto aparece marcada como a escolhida.
- A página inicial dos protótipos e a comparação das cinco direções abrem o Rumo sem parâmetro, então já mostram a Eucalipto.
- Como as paletas funcionam: `design/prototipos/LEIA-ME.md`, seção "Opções de cor do Rumo".
- Aprovação do QA:
  - protótipo: `design/prototipos/qa/relatorios/rumo-rodada-3.md`;
  - paletas: `rumo-paletas-rodada-1.md`, na mesma pasta.

### As 15 telas de referência

| Nº | Tela | Arquivo |
| --- | --- | --- |
| 1 | Abertura | `rumo/01-abertura.html` |
| 2 | Criar viagem | `rumo/02-criar-viagem.html` |
| 3 | Alertas do camping | `rumo/03-alertas.html` |
| 4 | Lista | `rumo/04-lista.html` |
| 5 | Item | `rumo/05-item.html` |
| 6 | Aviso de saída | `rumo/06-aviso-de-saida.html` |
| 7 | Durante a estadia | `rumo/07-estadia.html` |
| 8 | Checklist da volta | `rumo/08-volta.html` |
| 9 | Em casa | `rumo/09-em-casa.html` |
| 10 | Fato do camping | `rumo/10-fato.html` |
| 11 | Grupo | `rumo/11-grupo.html` |
| 12 | Gastos | `rumo/12-gastos.html` |
| 13 | Camping sem dados | `rumo/13-camping-sem-dados.html` |
| 14 | Página do convidado (web) | `rumo/14-convidado.html` |
| 15 | Página inicial do site (web) | `rumo/15-site.html` |

Os dados das telas são os do pedido (`_compartilhado/dados.js`). Eles ilustram a identidade e não são regra. As perguntas provisórias P-01 a P-23 continuam em `design/prototipos/direcao/telas.md`.

---

## 2. Conceito

- **A viagem é uma rota de cinco paradas:** Preparar · Carregar · No camping · Volta · Em casa. A família sempre sabe em qual parada está.
- O topo de cada tela mostra a rota. O pinguim pequeno marca a parada atual, como quem diz "você está aqui".
- O que não é parada (camping, grupo, gastos) fica na **legenda**, um botão no canto de baixo, como a legenda de um mapa.
- **Inspiração:** cartas topográficas, cadernetas de expedição e o hábito de marcar a rota com lápis antes de sair.
- O **selo** vem dos carimbos de visto da caderneta de viagem, com forma própria: retângulo de canto cortado.
- Origem: `rumo/textos.js` (`direcao.frase`, `rumo.id.origem`) e `design/prototipos/direcao/direcoes.md`, seção 4.
- **Elemento-assinatura:** a curva de nível, só no fundo do topo, e a rota tracejada. As curvas são enfeite. Nunca vira mapa de verdade, trilha colorida ou pino.
- Tema principal: claro. O escuro é "o mapa lido com lanterna" (`direcoes.md`, seção 4).
- Na Eucalipto, o papel da carta fica verde-acinzentado, e a tinta, verde-petróleo escura. O botão principal tem o mesmo matiz do gorro do mascote: 183°, mais escuro.

---

## 3. Cores

### 3.1 Os 10 papéis

São variáveis CSS com os mesmos nomes do protótipo. **Não existe cor fora delas.** A única exceção é a arte do mascote (seção 8).

- Origem dos valores: `rumo/estilo.css`, seção 1b, bloco `:root[data-paleta="eucalipto"]` e o do tema escuro.
- Origem do "para quê": `direcoes.md`, "Papéis de cor".

| Papel | Para quê | Claro | Escuro |
| --- | --- | --- | --- |
| `fundo` | Fundo da tela (o papel da carta) | `#DCE8E2` | `#0C1615` |
| `superficie` | Folhas, cartões, linhas de lista, campos | `#F4F9F6` | `#14211F` |
| `texto` | Texto principal (a tinta). No escuro, também é o papel do apoio do mascote | `#10201C` | `#E2EEEA` |
| `texto-suave` | Texto secundário, rótulos, quantidade | `#3D514A` | `#A6BBB4` |
| `linha` | Bordas de campo e de controle, divisórias, curvas de nível | `#66847A` | `#5F7A73` |
| `acento` | Preenchimento do botão principal e do filtro ativo | `#1F4B4D` | `#B8D5C8` |
| `sobre-acento` | Texto e ícone sobre o `acento` | `#F4F9F6` | `#0C1615` |
| `atencao` | Texto e ícone de alerta de atenção e de "faltou" | `#A0282E` | `#FF8F86` |
| `separei` | Estado "separei" e faixa do item fora do carro | `#77560F` | `#E8C27C` |
| `carro` | Estado "está no carro", régua de progresso e selo | `#24507F` | `#A3C8F2` |

Duas variáveis auxiliares não são cor nova:
- `--ico-recorte` é o recorte do ícone cheio e vale a `superficie` (ou o fundo do botão onde o ícone está);
- `--chanfro` é o tamanho do canto cortado (seção 5).

Quando a interface usa transparência, ela vem destes papéis. É o caso das curvas de nível (`linha` a 35 %, e 60 % na abertura) e do fundo do painel (`fundo` a 88 %).

### 3.2 Pares de contraste

Os pares são os 14 de `direcoes.md`, calculados pela fórmula das WCAG 2.x. A tabela traz o meu cálculo a partir dos hexadecimais acima. Ele é igual ao que `rumo/identidade.html` mostra na tela.

| Par | Mínimo | Claro | Escuro |
| --- | --- | --- | --- |
| `texto` / `fundo` | 7 | 13,40 | 15,47 |
| `texto` / `superficie` | 7 | 15,84 | 13,93 |
| `texto-suave` / `fundo` | 4,5 | 6,74 | 9,10 |
| `texto-suave` / `superficie` | 4,5 | 7,97 | 8,20 |
| `sobre-acento` / `acento` | 4,5 em `direcoes.md`; 7 na conferência das paletas (ver seção 15, D-2) | 9,08 | 11,73 |
| `acento` / `fundo` | 3 | 7,68 | 11,73 |
| `linha` / `superficie` | 3 | 3,83 | 3,57 |
| `linha` / `fundo` | 3 | **3,24** (o mais apertado) | 3,96 |
| `atencao` / `superficie` | 4,5 | 6,95 | 7,52 |
| `atencao` / `fundo` | 4,5 | 5,88 | 8,35 |
| `separei` / `superficie` | 4,5 | 6,32 | 9,82 |
| `separei` / `fundo` | 4,5 | 5,34 | 10,90 |
| `carro` / `superficie` | 4,5 | 7,80 | 9,55 |
| `carro` / `fundo` | 4,5 | 6,60 | 10,60 |

O que o QA mediu (`rumo-paletas-rodada-1.md`):
- nenhum dos 14 pares fica abaixo do mínimo;
- na Eucalipto, o par mais apertado é `linha`/`fundo` no claro, com **3,24**;
- na tela de verdade, `prototipo.py` mediu 0 texto abaixo do mínimo, em 2 temas × 3 tamanhos de letra × 16 páginas.

**Usos fora da tabela, conferidos no protótipo:**
- Botão alternado ligado (`.marca[aria-pressed="true"]`): fundo `texto` e letra `fundo`, com 13,40 no claro e 15,47 no escuro.
- Caixa de marcar ligada (`.check`): as mesmas cores.

### 3.3 Cores de estado

O estado nunca depende só da cor: tem sempre ícone **e** texto (seção 7.4 e DSG-10).

| Estado | Cor | Ícone | Texto (arquivo de textos) |
| --- | --- | --- | --- |
| a separar | `texto-suave` | caixa vazia (traço) | "a separar" |
| separei, fora do carro | `separei` | caixa cheia com visto | "separei · fora do carro" |
| está no carro | `carro` | carro cheio | "está no carro" |
| preciso comprar | `texto` | sacola | "preciso comprar" |
| faltou | `atencao` | caixa com sinal de menos | "faltou" |
| atenção (alerta) | `atencao` | triângulo | "Atenção" |
| informação (alerta) | `texto-suave` | quadrado com "i" | "Informação" |
| conferido (volta) | `texto` | losango cheio com visto | "conferido" |
| não conferido | `texto-suave` | losango vazio | "não conferido" |
| secar ou lavar em casa | `carro` | ícone `secar` | "secar ou lavar em casa" |

- Origem das cores: `rumo/estilo.css`, seção 9 (`.estado--*`) e seção 9, botões `.alt-*`.
- Origem dos textos: `_compartilhado/textos.js` (`estado.*`, `nivel.*`) e `rumo/textos.js` (`rumo.estado.separei_fora`).

### 3.4 Cores do mascote (não mudam)

A arte colorida nunca muda de cor, em nenhuma paleta e em nenhum tema.

| Cor | Hex | Onde |
| --- | --- | --- |
| Ardósia | `#4A5560` | penugem (corpo) |
| Ardósia-escura | `#333C45` | sombra do corpo, nadadeiras, olhos |
| Creme | `#FBF3E4` | face e barriga |
| Âmbar | `#E4A33A` | bico e pés |
| Verde-azulado | `#3EA8AE` | gorro (fixo; confirmado pelo responsável em 27/11/2026; ver seção 14) |

Origem: `design/mascote/guia/guia.html`, seção 2. A tabela inteira, com tinta única e branco, está lá.

**Contraste do mascote na Eucalipto (meu cálculo):**
- corpo `#4A5560` sobre o `fundo` claro: **6,05**; sobre a `superficie` clara: 7,15;
- no escuro, o mascote colorido fica sobre um papel (o apoio) na cor `texto` `#E2EEEA`. O corpo fica a **6,40** dele;
- o QA mediu de 5,91 a 6,24 no claro e de 6,39 a 6,54 no apoio escuro, nas quatro paletas novas (`rumo-paletas-rodada-1.md`);
- o mínimo é 3:1, pelo guia do mascote, seção 3;
- o gorro fica a **2,25** do `fundo` claro e a 2,66 da `superficie`. O guia aceita isso no branco (2,83) e no creme (2,57), porque o corpo faz o contorno. Ver a seção 15, D-4.

---

## 4. Tipografia

### 4.1 Família

- **Archivo**, uma família só, variável, com eixos de largura (62 a 125) e de peso (100 a 900).
- Arquivo local: `_compartilhado/fontes/archivo/Archivo-variavel.ttf`, com a licença `_compartilhado/fontes/archivo/OFL.txt` (SIL Open Font License 1.1).
- Vem do repositório oficial `github.com/google/fonts`, pasta `ofl/archivo/` (`direcoes.md`, "Fontes"; P-21).
- No app, a fonte vai embutida. Não se usa serviço de fontes.
- Declarada em `_compartilhado/base.css` (`@font-face`, `--cg-fonte-archivo`). A pilha de reserva é a fonte do sistema.
- Números sempre tabulares (`font-variant-numeric: tabular-nums`), em todo o app.

### 4.2 Escala

Valores de `rumo/estilo.css`. "Largura" é o eixo `font-stretch`. As medidas valem com a letra em 100 % (1 rem = 16 px).

| Uso | Tamanho / entrelinha | Largura | Peso | Caixa e espaço | Classe |
| --- | --- | --- | --- | --- | --- |
| Letreiro da marca (abertura) | 36 / 40 | 125 | 800 | caixa alta, +0,08 em | `.marca-nome` |
| Título de tela | 26 / 30 | 125 | 700 | caixa alta, +0,04 em | `.titulo-tela` |
| Número do progresso | 26 / 30 | 125 | 700 | — | `.progresso-numero strong` |
| Título de painel e texto grande do selo | 19 / 24 | 125 | 700 | caixa alta, +0,04 em | `.painel-titulo`, `.selo-grande` |
| Subtítulo e nome de categoria | 19 / 24 | 112,5 | 600 | — | `.subtitulo`, `.cat-nome` |
| Frase da abertura | 19 / 25,6 | 100 | 400 | — | `.abertura-frase` |
| Texto do botão | 17 / 22 | 112,5 | 700 | +0,02 em | `.botao` |
| Corpo | 17 / 26 | 100 | 400 | — | `.cg-tela` |
| Nome do item | 17 / 26 | 100 | 500 | — | `.item-nome` |
| Nome de linha | 17 / 26 | 100 | 600 | — | `.linha-nome` |
| Rótulo de carta (marca da etapa, título de bloco) | 15 / 20 | 125 | 600 | caixa alta, +0,06 em | `.rotulo`, `.bloco-titulo`, `.etapa-marca` |
| Nome da legenda | 15 / 20 | 125 | 700 | caixa alta, +0,06 em | `.legenda-botao-nome` |
| Nome da parada na rota | 15 / 18 | 85 | 500 (700 na atual) | — | `.rota-rotulo` |
| Texto secundário, estado, quantidade | 15 / 20 | 100 | 400 a 600 | — | `.linha-sub`, `.estado`, `.item-meta` |

Regras de `direcoes.md`, "Ao ar livre":
- corpo de 17 px;
- **nenhum texto abaixo de 15 px**;
- peso nunca abaixo de 400.

Pesos usados: 400, 500, 600, 700 e 800.

### 4.3 O letreiro em caixa alta

- Título de tela, título de painel, rótulo de carta, nome da legenda, texto grande do selo e a marca "CAMPINGUIM" usam caixa alta, largura 125 e espaço entre letras, como letreiro de mapa.
- A caixa alta é só de estilo (`text-transform`). **O texto no arquivo de textos fica em caixa normal**, e o leitor de tela lê a frase normal.

### 4.4 Letra em 130 % e 200 %

O tamanho da letra muda na raiz (`html { font-size: 100 % | 130 % | 200 % }`, por `_compartilhado/base.js`). Quase todo texto está em `rem` e cresce junto. Bordas, alvos e ícones estão em `px`.

| O que muda | 130 % | 200 % | Origem |
| --- | --- | --- | --- |
| Rota | o nome da parada some e fica o número (1 a 5) | igual | `estilo.css` §5 |
| Prévia da rota na abertura | some | some | §15 |
| Letreiro da marca | largura 100, +0,02 em, até 10,5 % da largura da tela, entrelinha 1,15 | igual | §15 |
| Título de tela | — | largura 100, +0,01 em | §2 |
| Rótulos de carta | — | largura 100, +0,02 em | §2 |
| Botão da legenda | — | fica só "LEGENDA". O nome acessível continua "Legenda: camping, grupo, gastos" | §13 |
| Linhas com botão | o texto encolhe até a palavra mais longa. Quando nome, quantidade e botão não cabem lado a lado, o botão ou a quantidade desce de linha | igual | §8 |
| Tela estreita (até 340 px) | os dois botões do item ficam um embaixo do outro | igual | `@container cg-tela` |

Medido pelo QA (`rumo-rodada-3.md`, `rumo-paletas-rodada-1.md`):
- 0 rolagem para o lado e 0 texto cortado em 100, 130 e 200 %;
- nenhuma palavra partida no meio. As exceções aceitas são o e-mail do Pix (`.chave`, que pode quebrar em qualquer ponto) e caminhos de arquivo.

**Confirmado pelo responsável em 27/11/2026:** o texto encolhe até a palavra mais longa caber (nenhuma palavra partida), como o app faz (`docs/componentes.md`, seção 7.2, "Palavra que não cabe").

---

## 5. Espaço, grade, raios, bordas e sombras

Origem: `rumo/estilo.css` e `direcoes.md`, "Premium".

| Item | Valor |
| --- | --- |
| Margem lateral da tela | 16 px, mais a área segura do aparelho (`.rumo`) |
| Entre blocos | 24 px (`.bloco`); 32 px entre seções do site e da identidade |
| Respiro interno de linha e folha | 6 a 12 px na vertical, 12 px nas laterais |
| Espaço entre ícone e texto | 6 a 12 px |
| Altura de linha de lista | mínimo de 56 px (`.linha`); item da lista, mínimo de 64 px (`.item`) |
| Grade | uma coluna, feita para celular (390 px de referência na moldura). No computador, o app aparece numa moldura de celular |
| Raio | **2 px** em tudo que é retângulo (folhas, botões, campos, filtros, alternâncias, painel). Círculo só no ponto da rota, no ponto dos passos e na bolinha da opção |
| Borda de folha e divisória | 1 px `linha` |
| Borda de controle (campo, filtro, alternância, opção, passo) | 1,5 px `linha`; quando está ligado, passa para a cor do estado ou `texto` |
| Borda de destaque (botão secundário, legenda, painel, caixa de marcar) | 1,5 px `texto` |
| Faixa lateral | 4 px à esquerda: `separei` no item fora do carro; `texto` na tarefa, no registro e no resultado escolhido |
| Sombra | **nenhuma.** A faixa lateral usa `box-shadow: inset` só para desenhar a faixa, sem desfoque. Nada de degradê nem de sombra de elevação |
| Movimento | até 200 ms, desligado com `prefers-reduced-motion` (`_compartilhado/base.css`, seção 2) |

### O canto cortado

É o octógono alongado do selo e do apoio do mascote.

- Desenho: `clip-path: polygon(...)` com o corte de `--chanfro` em cada canto (`estilo.css` §6 e §11).
- Tamanhos do corte:
  - selo: 8 px fora e 7 px dentro, com 2 px de traço na cor `carro`;
  - apoio da rota: 4 px;
  - apoio da cabeça da etapa: 10 px;
  - apoio da abertura: 14 px;
  - apoio do cabeçalho web: 4 px.
- O canto cortado é a forma própria do Rumo. Não use selo redondo (seção 13).

### Curvas de nível

- Gerador: `rumo/icones.js`, função `curvas`.
- Traço de 1 px, `linha` a 35 %, sem crescer com o zoom (`vector-effect: non-scaling-stroke`).
- Ficam no fundo dos 15 rem do topo (`.topo-curvas`). Na abertura e no site, com 60 % de opacidade.
- Não recebem toque nem leitura de tela.

---

## 6. Ícones

- **Origem:** todos desenhados para o Rumo, em `rumo/icones.js` (objeto `ICONES`). Nenhum vem de biblioteca ou de terceiros.
- **Traço:** grade de 24, traço de 1,5 px, pontas retas (`butt`), junções em ângulo (`miter`), formas inscritas em quadrado.
- **Estado ativo:** vira símbolo cheio, como um ponto cotado, com recorte na cor do fundo (`.f`, `.r`).
- **Tamanhos:**
  - 24 px é o padrão;
  - 20 px em título de bloco, nível de alerta e botão alternado de texto;
  - 18 px na linha de estado.
- **Cor:** sempre `currentColor`, ou seja, a cor do texto ou do estado ao lado.
- O ícone acompanha um texto visível ou tem nome acessível. Sozinho, ele não carrega significado.

Os 30 ícones, na ordem da página de identidade (`ORDEM` em `icones.js`). Os sete primeiros têm repouso e ativo.

| Nome | Significado |
| --- | --- |
| `separei` · `carro` · `comprar` · `atencao` · `faltou` · `conferido` · `secar` | os estados, em repouso e ativos |
| `ciente` | ciente e feito (visto) |
| `info` | informação |
| `entrou` · `saiu` | ajuste na lista |
| `tarefa` | tarefa |
| `regra` | regra do camping |
| `preparar` · `barraca` · `volta` · `casa` | paradas e camping |
| `grupo` · `gastos` · `legenda` | legenda e áreas |
| `pessoa` · `sem_dono` | pessoas; `sem_dono` é tracejado |
| `voltar` · `direita` · `baixo` | navegação |
| `mais` · `menos` | contador |
| `copiar` · `compartilhar` · `fechar` | ações |

Os símbolos são universais: carro, casa, barraca, triângulo e visto (DSG-11, `direcoes.md`). Fora do Brasil, não precisam de tradução.

---

## 7. Componentes

As medidas são as de `rumo/estilo.css`, com a letra em 100 %. Para cada componente, a coluna "Ver" diz em que tela do protótipo ele aparece.

### 7.1 Rota de cinco paradas

- **Para que serve:** navegação principal. Mostra em que parada da viagem a família está e leva a outra parada.
- **Medidas:**
  - cada parada é um alvo de 64 px de largura e pelo menos 48 px de altura (`.rota-alvo`);
  - o ponto tem 12 px, com borda de 1,5 px `texto` e miolo `fundo`;
  - a linha tracejada tem 1,5 px, com traço de 2 px e espaço de 6 px, na cor `texto`.
- **Estados:**
  - parada comum: ponto vazio, nome em `texto-suave` com peso 500;
  - **parada atual:** o mascote `icone` de 24 px, "você está aqui". Nas telas que já mostram outra pose, fica o ponto cheio de 18 px. O nome vai em `texto`, com peso 700;
  - nome acessível: "Parada 2 de 5: Carregar. Você está aqui", com `aria-current="step"`.
- **Gestos:** deslizar para os lados troca de parada (pelo menos 70 px na horizontal, menos de 45 px na vertical, em até 700 ms). É só um atalho: as paradas são botões.
- **Letra grande:** em 130 % e 200 %, o nome some e fica o número.
- **Páginas web (14 e 15):** a rota vira uma régua de seções fixa no topo (`.regua-web`). A seção atual fica sublinhada com 2 px.
- **Ver:** telas 2 a 13. Nas telas 11 e 12, que ficam na legenda, a rota aparece sem parada atual. O mascote na parada atual aparece nas telas 2, 4, 5, 8, 9 e 10.

### 7.2 Cabeçalho da etapa (letreiro)

- **Para que serve:** diz onde a pessoa está e qual é a tela.
- **Partes:**
  - "Voltar" de texto, com ícone, só nas telas internas. Tem pelo menos 48 × 48 px e volta à tela de origem: o fato volta para os alertas ou para a estadia, de onde veio;
  - marca da etapa em rótulo de carta, com um traço de 18 px antes: "Parada 2 de 5 · Carregar" ou "Legenda · Grupo";
  - título da tela em letreiro, caixa alta;
  - subtítulo em `texto-suave`;
  - às vezes, o mascote de 96 px no apoio (seção 8).
- **Ver:** telas 3, 4, 5, 6 e 10.

### 7.3 Botões

| Botão | Medidas | Cores | Ver |
| --- | --- | --- | --- |
| Principal (`.botao--principal`) | 56 px de altura no mínimo, largo, ocupa o dobro do espaço do secundário; 17/22, largura 112,5, peso 700 | fundo `acento`, letra `sobre-acento` | rodapé de quase todas; tela 1 "Começar" |
| Secundário (`.botao--secundaria`) | 56 px | borda de 1,5 px `texto`, fundo `superficie`, letra `texto` | telas 5 e 14 |
| Alternado de texto (`.marca`: ciente, feito, eu levo, paguei, está no carro) | 44 × 44 no mínimo (48 em "eu levo", tela 14) | repouso: borda `linha`, fundo `superficie`. Ligado: fundo `texto`, letra `fundo`. "Está no carro" ligado: borda e letra `carro` sobre `superficie` | telas 3, 6, 11, 12, 14 |
| Alternância de símbolo (`.alt`) | 44 × 44, borda de 1,5 px | repouso: borda `linha`, ícone `texto-suave`. Ligado: ícone cheio e borda na cor do estado (`separei`, `carro`, `texto`) | telas 4, 6, 8 |
| Filtro (`.filtro`) | 44 px de altura | ligado: fundo `acento`, letra `sobre-acento`, peso 700 | tela 4 |
| Discreto (`.discreto`) | 44 px, sublinhado | `texto-suave`, 15 px | tela 1 |
| Fechar painel | 48 × 48, borda de 1,5 px `linha` | — | painéis |

- Botão ligado sempre expõe `aria-pressed`.
- O foco visível é um contorno de 3 px na cor `texto`, afastado 2 px (`_compartilhado/base.css`).

### 7.4 Item da lista e seus estados

- **Para que serve:** marcar "separei" e "está no carro" depressa, e achar o que falta sem depender da cor.
- **Medidas:**
  - linha de 64 px no mínimo, com 4 px e 12 px de respiro e 12 px entre as partes (`.item`);
  - à esquerda, a área que abre o item, com 52 px no mínimo: nome em peso 500 e, embaixo, a quantidade e o estado em 15/20 `texto-suave`;
  - à direita, duas alternâncias de 44 × 44, "separei" e "está no carro", com 8 px entre elas.
- **Estados** (sempre ícone e texto, mais a faixa):

| Estado | Faixa à esquerda | Ícone | Texto | Botões |
| --- | --- | --- | --- | --- |
| a separar | 4 px `separei` | caixa vazia | "a separar" | os dois desligados |
| separei, fora do carro | 4 px `separei` | caixa cheia | "separei · fora do carro" | separei ligado |
| está no carro | sem faixa | carro cheio | "está no carro" | os dois ligados |

- Nome acessível do item: "{nome}, {quantidade}, {estado}. Abrir o item". Cada botão tem o próprio nome, por exemplo "Lanterna: está no carro".
- **Categoria:** cabeçalho que recolhe e abre, com 56 px no mínimo. Traz o nome em 19/24, a régua curta e "x de y" em `texto-suave`.
- **Régua de progresso:** um traço por item, de 12 px de altura (8 px na régua curta).
  - Na ida, o traço é cheio em `carro`, e o que falta é vazio, com borda `separei`.
  - Na volta, é cheio em `texto`, e o que falta tem borda `linha`.
- **Faixa de tarefa:** borda esquerda de 4 px `texto` e botão "feito".
- **Ver:** tela 4 (lista), tela 6 (aviso de saída), tela 8 (volta, com "conferido" e "secar").

### 7.5 Alerta do camping

- **Para que serve:** mostrar o que o camping tem de diferente antes de sair, na medida certa.
- **Como é:** os alertas ficam agrupados por nível. Cada grupo tem um título em rótulo de carta, com ícone: "ATENÇÃO" na cor `atencao` e "INFORMAÇÃO" em `texto-suave`. Cada alerta é uma linha de folha com o ícone do nível, o texto e, quando há, o botão "Ciente".
  - Atenção usa a cor `atencao` no ícone e no título do grupo. O texto do alerta fica em `texto`.
  - Ajustes da lista usam os ícones `entrou` e `saiu`.
  - Regras usam o ícone `regra`.
- Fatos confirmados levam ao selo (7.6) e à tela do fato.
- **Ver:** tela 3; também as telas 7 e 11.

### 7.6 Selo

- **Para que serve:** mostrar que uma informação tem autor e data: quantos confirmaram e quando.
- **Medidas:**
  - retângulo de canto cortado, traço de 2 px `carro`, miolo `fundo` (ou `superficie` dentro de folha);
  - respiro de 10/16 px (14/20 px na tela do fato);
  - texto grande em 19/24, largura 125, peso 700, caixa alta;
  - linha de baixo em 15/20, peso 600.
- **Texto:** tudo na cor `carro`. Exemplo: "6 confirmações" · "Última: Carla R., nov/2026".
- **Ver:** telas 10, 3, 7 e 9.

### 7.7 Legenda que abre de baixo

- **Botão:**
  - fica no rodapé, à direita, com 48 px no mínimo;
  - borda de 1,5 px `texto`, fundo `superficie`;
  - ícone `legenda`, "LEGENDA" em rótulo de 15/20 com peso 700 e, embaixo, "camping, grupo, gastos" em `texto-suave`.
- **Painel:**
  - abre de baixo para cima, sobre o `fundo` a 88 %, com 12 px de margem;
  - borda de 1,5 px `texto`, fundo `superficie`, cabeça de 56 px e "Fechar" de 48 × 48;
  - cada entrada tem um símbolo numa caixa de 40 × 40 e ligações de 48 px;
  - a entrada da tela atual fica sublinhada com 2 px.
- **Acessibilidade:**
  - o botão tem `aria-haspopup="dialog"` e `aria-expanded`;
  - o foco fica preso no painel, que fecha com Esc;
  - ao abrir, o leitor anuncia "Legenda aberta. Camping, grupo e gastos.".
- **Entradas:** Camping (alertas e fato), Grupo, Gastos.
- **Ver:** qualquer tela com rodapé; tocar em "LEGENDA".

### 7.8 Rodapé de ação

- **Para que serve:** pôr a ação principal ao alcance do polegar.
- **Como é:**
  - faixa fixa embaixo, fundo `fundo` e linha de 1 px `linha` em cima;
  - respiro de 12/16 px, mais a área segura;
  - ação principal (e secundária) em cima, e o botão da legenda embaixo, à direita;
  - o conteúdo da tela termina sempre acima do rodapé, em qualquer tamanho de letra.
- **Ver:** telas 2 a 13.

### 7.9 Campos

| Peça | Medidas e cores | Ver |
| --- | --- | --- |
| Campo de texto (`.entrada`) | 48 px no mínimo (96 px em texto longo); borda de 1,5 px `linha`, fundo `superficie`; rótulo em cima, peso 600; "opcional" em `texto-suave` | telas 2, 5, 7, 9, 14, 15 |
| Opção (`.opcao`) | 48 px no mínimo, bolinha de 12 px. Escolhida: borda `texto`, peso 700, bolinha cheia | telas 2 e 9 |
| Contador (`.contador`) | linha de 56 px, botões "menos" e "mais" de 44 × 44, valor de 19 px com peso 700 | telas 2, 5, 9 |
| Caixa de marcar (`.check`) | caixa de 44 × 44 com borda de 1,5 px `texto`. Marcada: fundo `texto`, visto `fundo` | tela 15 |
| Resultado de busca (`.resultado`) | linha de 56 px. Escolhido: faixa de 4 px `texto` e a palavra "escolhido" | tela 2 |

### 7.10 Vazios e mensagens

- **Vazio** (`.vazio`): texto curto em `texto-suave`, com 16/12 px de respiro. Exemplos: "Nada anotado." e "Nenhum item neste filtro.". Ver telas 4 (filtro), 7 e 15.
- **Camping sem dados:** tela 13. Traz o mascote `pose-alerta`, "Nenhum registro deste camping ainda.", a lista "na dúvida" e o texto de perguntas numa carta (`.carta`, linhas com filete de 1,5 px `linha`).
- **Mensagem e erro** (`.mensagem`):
  - frase em peso 600, na cor `texto`, numa região anunciada ao leitor de tela (`aria-live="polite"`);
  - some quando está vazia;
  - exemplos: "Escreva um e-mail para entrar na lista." (tela 15) e "Entre com o seu nome para assumir um item." (tela 14);
  - o protótipo não tem cor nem ícone próprios para erro. A SPEC (§7) define o texto do erro, não a forma visual. Ver a seção 15, D-5.
- **Desfazer:** depois de "ciente", o botão vira "Desfazer" (tela 3).

---

## 8. Mascote na interface

O guia completo é `design/mascote/guia/guia.html`, com cores, proporções, respiro, tamanhos mínimos, poses, o que nunca faz, 3D e vídeo. Este arquivo não repete o guia: diz só onde o Rumo põe o mascote.

| Onde | Arte | Tamanho | Apoio | Ver |
| --- | --- | --- | --- | --- |
| Abertura do app | `principal`, em pé sobre as curvas de nível | 176 px | no escuro, papel `texto` de canto cortado de 14 px, com 8 px de respiro | tela 1 |
| Site, topo | `principal` | 136 px | o mesmo | tela 15 |
| Rota, parada atual ("você está aqui") | `icone` | 24 px | no escuro, papel de canto cortado de 4 px, com 4 px de respiro | telas 2, 4, 5, 8, 9, 10 |
| Alertas, aviso de saída, camping sem dados | `pose-alerta` | 96 px, no cabeçalho | no escuro, papel de 10 px, com 6 px de respiro | telas 3, 6, 13 |
| Aviso de saída quando tudo está no carro | `pose-comemorando` | 96 px | o mesmo | tela 6 (depois de "está no carro" no último item) |
| No camping (estadia) | `pose-camping` | 96 px | o mesmo | tela 7 |
| Cabeçalho da página do convidado | `icone` | 32 px | no escuro, papel de 4 px, com 3 px de respiro | tela 14 |
| Versão de uma cor | `uma-cor` pintada com `texto` | 88 px na identidade | — | `rumo/identidade.html` |

Regras do protótipo, que continuam valendo (`rumo/textos.js`, `rumo.id.b6_intro`; `direcoes.md`, "O mascote"):
- **No máximo um mascote por tela.** Nunca dentro de linha de lista, tabela de gastos ou campo de formulário.
- **No tema claro**, sem apoio: o corpo fica a 6,05 do `fundo`.
- **No tema escuro**, a versão colorida só aparece sobre o papel na cor `texto` (`#E2EEEA`), com o corpo a 6,40.
- O CSS só muda a largura do mascote, e a altura acompanha. Na arte `uma-cor`, pode mudar também o preenchimento, para uma cor da paleta.
- Sem girar, espelhar, recortar, filtrar, mudar a opacidade ou animar partes (`design/prototipos/direcao/padrao-producao.md`, seção 6).
- O ícone de 24 px é o mínimo medido para a "marca pequena" (guia, seção 6). Abaixo disso, o mascote não entra.

---

## 9. Acessibilidade

| Regra | Valor | Medido pelo QA |
| --- | --- | --- |
| Texto principal | 7:1 ou mais | 13,40 a 15,84 na Eucalipto (seção 3.2); 0 texto abaixo do mínimo nas medições (`rumo-paletas-rodada-1.md`) |
| Texto secundário e cores de estado | 4,5:1 ou mais | menor valor: 5,34 (`separei`/`fundo`, claro) |
| Bordas de controle, linhas e ícones com significado | 3:1 ou mais | menor valor: 3,24 (`linha`/`fundo`, claro) |
| Alvo de toque | 44 × 44 px ou mais; 48 nas paradas, na legenda, no "Voltar" e nos campos; 56 no botão principal | 0 alvo pequeno nas 96 combinações (`rumo-rodada-1.md` a `-3.md`) e nas 384 das paletas |
| Letra ampliada | 100, 130 e 200 % sem cortar, sem rolar para o lado e sem partir palavra | 0 em todas as combinações (`rumo-rodada-3.md`) |
| Estado sem depender de cor | ícone e texto em todo estado; faixa no item fora do carro | a tela 4 em tons de cinza, em cada paleta (`qa/relatorios/rumo-paletas-r1/*/04-lista-*-cinza.png`) |
| Leitura ao sol | texto a 7:1 ou mais, sem cinza claro sobre branco; tema claro como principal | contraste acima; o teste ao ar livre em aparelho de verdade é da SPEC, seção 13 |
| Leitor de tela | nome acessível em cada parada, item, botão alternado e diálogo; mensagens anunciadas | a legenda prende o foco e fecha com Esc (`rumo-rodada-1.md`) |
| Uma mão | ação principal no rodapé; a legenda abre de baixo | ver o risco 1 na seção 12 |
| Movimento | até 200 ms; desligado com `prefers-reduced-motion` | `_compartilhado/base.css` |

NF-07 e NF-08 (PRD) continuam sendo o critério de aceite. Os números acima mostram como o protótipo os atende.

---

## 10. Tom de voz

O Rumo fala como um **diário de expedição**: verbo no presente, registro com número, sem adjetivo e sem exclamação (`rumo/textos.js`, cabeçalho e `rumo.id.b7_intro`).

Exemplos tirados de `rumo/textos.js`:

| Situação | Texto |
| --- | --- |
| Onde está | "Parada 2 de 5: carregar o carro." |
| Abertura | "Marque a rota antes de sair: a lista do que levar, parada por parada." |
| Sem cadastro | "Sem cadastro. A lista começa na próxima tela." |
| Progresso | "Faltam {n} para o carro." / "Falta {n} para o carro." |
| Fim da etapa | "Tudo no carro. Parada 2 concluída." |
| Aviso de saída | "{n} itens separados ainda fora do carro." |
| Fato | "{fato}: {valor}. {n} confirmações. Última: {nome}, {mes}." |
| Camping | "{camping}: {n} campistas confirmaram." |
| Vazio | "Nada anotado." · "Nenhum registro deste camping ainda." |
| Formulário | "Tipo, noites e pessoas são obrigatórios. O resto entra se você souber." |
| Volta | "Registro da viagem fechado." |

Regras:
- **Os textos ficam no arquivo de textos, nunca soltos no código** (CLAUDE.md, regra 5; NF-09).
- No app, os textos vão para o arquivo de textos da SPEC. O protótipo usa `rumo/textos.js` e `_compartilhado/textos.js`.
- Singular e plural têm chaves próprias (`_um`), como "1 item" e "2 itens".
- Valores em reais vão com centavos: "R$ 420,00" (`design/prototipos/direcao/telas.md`, seção 3).
- O texto acessível diz o estado por extenso. Exemplo: "separei, fora do carro".

---

## 11. Vídeo e site

### 11.1 O que a TECNICA-3D espera

`docs/TECNICA-3D.md`, seção 15: "Cor de destaque e tipografia definitivas saem da identidade escolhida; até lá, valores provisórios de `marca/tokens.json`".

A mesma técnica fixa outras regras:
- seção 6: a cor de destaque é uma por episódio, "a mesma do selo";
- seção 7, item 5: o fundo do vídeo é um degradê escuro com leve vinheta.

| Ponto | Vídeo | Origem |
| --- | --- | --- |
| Tipografia | **Archivo**, a família da identidade. Letreiro em caixa alta, largura 125; texto em largura 100. Hoje a prova de vídeo usa Inter (seção 15, D-6) | seção 4 deste arquivo |
| Cor de destaque | **PROPOSTA a confirmar pelo responsável:** `#A3C8F2` (ver 11.2) | — |
| Fundo | degradê escuro com vinheta (TECNICA-3D §7). Como referência da paleta, o `fundo` escuro da Eucalipto é `#0C1615` | proposta, junto com o destaque |
| Mascote | o modelo 3D e as regras de vídeo do guia, seção 12 | `design/mascote/guia/guia.html` |
| Selo | retângulo de canto cortado, traço na cor do destaque, sem selo redondo | seção 5 deste arquivo |
| `marca/tokens.json` | **não existe no repositório.** Quem montar a fábrica de vídeos tira os valores deste arquivo | seção 15, D-6 |

### 11.2 Cor de destaque dos vídeos (PROPOSTA)

> **PROPOSTA, a confirmar pelo responsável. Não é decisão.**

- **Valor proposto:** `#A3C8F2`, o papel `carro` da Eucalipto no tema escuro.
- **Por quê:**
  - a TECNICA-3D pede o destaque igual ao selo;
  - no Rumo, o selo é pintado com o papel `carro`;
  - o vídeo tem fundo escuro, por isso vale o valor do tema escuro;
  - é um azul da mesma família do valor de teste `#4FD1FF` (matiz 212° contra 196°), então o vídeo aprovado não muda de caráter.
- **Contraste medido (meu cálculo, WCAG 2.x):**
  - contra o fundo da prova de vídeo `#111827`: 10,22 (o valor de teste `#4FD1FF` dá 10,05);
  - contra o `fundo` escuro da Eucalipto `#0C1615`: 10,60;
  - letra escura sobre ele, `#06202b` (rótulo da prova): 9,69;
  - letra `#0C1615` sobre ele: 10,60;
  - contra o gorro `#3EA8AE`: 1,63 (o de teste dá 1,60). O destaque é aplicado no gorro, e o que separa os dois é o brilho, como no vídeo aprovado.
- **O que fica aberto:** se o destaque é o mesmo em todos os episódios ou muda por episódio ("uma por episódio", TECNICA-3D §6). Ver a seção 14.

### 11.3 Site

- O ponto de partida são as telas 14 (convidado) e 15 (página inicial), com a régua de seções no lugar da rota.
- Elas têm o mesmo letreiro, as mesmas curvas de nível no topo e o mascote `principal` em 136 px.
- O conteúdo do site e os textos legais (P-18, P-19) não são definidos aqui.

---

## 12. Riscos conhecidos (pontos de atenção do desenvolvimento)

Os quatro riscos da recomendação da Cinema (`design/prototipos/recomendacao-dados.js`). Ficam registrados aqui e **não são resolvidos neste arquivo**. Qualquer mudança passa pelo orquestrador e pelo responsável.

1. **A rota fica no alto, longe do polegar.** Trocar de etapa com uma mão pede esticar o polegar ou deslizar a tela para o lado. Toca em NF-07 ("ações principais ao alcance do polegar"). A ação principal está no rodapé, mas a troca de parada não.
2. **Grupo e gastos ficam dentro da legenda.** Quem abre o app só para ver a conta precisa aprender esse caminho.
3. **O topo da lista é alto.** A rota, o título largo e as curvas de nível empurram os itens para baixo, e é preciso rolar um pouco para ver o primeiro.
4. **É a direção mais trabalhosa de manter.** Curvas de nível, rota e selo precisam de cuidado em cada tela nova, e o pinguim pequeno da rota precisa ser conferido sempre que o desenho mudar.

---

## 13. O que nunca fazer

- Usar marca, personagem, imagem, ícone ou fonte de terceiros (CLAUDE.md, regra 6). Toda fonte é OFL e local. Todo ícone é próprio.
- Fazer parecido com concorrentes (DSG-12, `design/prototipos/direcao/concorrentes.md`):
  - sem bússola, rosa dos ventos ou pino de mapa;
  - sem mapa de verdade nem trilha colorida;
  - sem selo redondo com nome de lugar em anel;
  - sem caixa redonda azul.
- Pôr coordenadas geográficas reais na tela. O app não usa localização (`direcoes.md`, seção 4).
- **Redesenhar o mascote**:
  - não trocar as cores da versão colorida (o gorro inclusive);
  - não girar, espelhar, recortar, esticar ou animar partes do desenho 2D;
  - não pôr texto, balão ou objeto na arte;
  - não pôr o mascote dentro de um disco azul.
- Pôr mais de um mascote por tela, ou mascote em linha de lista, tabela de gastos ou campo.
- Usar cor fora dos 10 papéis, sombra de elevação, degradê pronto, emoji, foto ou ilustração de banco de imagens (`direcoes.md`, "Premium").
- Mostrar estado só por cor.
- Pôr texto solto no código.
- Usar texto abaixo de 15 px ou alvo menor que 44 × 44.

---

## 14. Perguntas abertas ao responsável (só identidade)

Na validação da Base, em 27/11/2026, o responsável confirmou as linhas 1, 2 e 4 (gorro fixo, só as 5 expressões que o Rumo usa, sem 3D no app). Está marcado em cada linha. As demais seguem abertas. Registro completo em `docs/decisoes-da-base.md`.

| # | Pergunta | Como está agora | Origem |
| --- | --- | --- | --- |
| 1 | O gorro pode mudar de cor? | **confirmado pelo responsável em 27/11/2026:** não, fixo em `#3EA8AE` | P-20 (`direcao/telas.md`); guia do mascote, seção 13 |
| 2 | Em que telas entram as expressões preocupado, com calor e surpreso? | **confirmado pelo responsável em 27/11/2026:** no app entram só as 5 que o Rumo usa (`principal`, `icone`, `pose-alerta`, `pose-camping` e `pose-comemorando`); as outras não entram | guia, seção 13 |
| 3 | Tamanhos mínimos para impressão | provisório: convertidos da tela, sem prova em papel | guia, seção 13 |
| 4 | O 3D entra no app? Em que telas? | **confirmado pelo responsável em 27/11/2026:** sem 3D no app | guia, seção 13 |
| 5 | Tamanho no quadro, luz e destaque em outros planos de vídeo | só o que foi medido no teste de 5 segundos | guia, seção 13 |
| 6 | Quais clipes e expressões entram nos vídeos? | o teste usou `neutro`, `alegre`, `acenar` e `parado-respirando` | guia, seção 13 |
| 7 | Cor de destaque dos vídeos | **proposta** `#A3C8F2` (seção 11.2); hoje o teste usa `#4FD1FF` | TECNICA-3D §15; guia, seção 13 |
| 8 | O destaque é o mesmo em todos os episódios ou muda por episódio? | não definido | TECNICA-3D §6 |
| 9 | Tipografia dos vídeos: Archivo no lugar da Inter de hoje? | segue da identidade (seção 11.1), falta trocar na fábrica | TECNICA-3D §15 |

As outras perguntas provisórias dos protótipos (P-01 a P-19, P-21 a P-23) são de conteúdo e dados, não de identidade. Continuam em `design/prototipos/direcao/telas.md`.

---

## 15. Divergências entre o protótipo e os documentos

Listadas, sem escolha. Cada uma foi avisada ao orquestrador. As linhas D-2, D-5 e D-7 foram decididas pelo orquestrador na B2 e **confirmadas pelo responsável em 27/11/2026** (marcadas na coluna "O que diverge"; `docs/decisoes-da-base.md`).

| # | Onde | O que diverge |
| --- | --- | --- |
| D-1 | `direcoes.md`, seção 4, tabela "Paleta" | Traz os valores da paleta Original (papel `#F3EEE2`, tinta `#1C2630`...) e o apoio do mascote fixo em `#EDE6D6`. A escolha do responsável é a Eucalipto, cujo apoio é o papel `texto` escuro `#E2EEEA`. Neste arquivo valem os da Eucalipto; `direcoes.md` não foi alterado |
| D-2 | `direcoes.md`, "Pares e mínimos" | Pede `sobre-acento`/`acento` ≥ 4,5. A conferência das paletas usou ≥ 7, porque o texto do botão é texto principal. A Eucalipto passa nos dois (9,08 e 11,73). Falta decidir qual mínimo vale para o app. **Confirmado pelo responsável em 27/11/2026:** vale 4,5 em todo texto, botões inclusive |
| D-3 | `rumo/textos.js`, nomes dos papéis na identidade | Os nomes descrevem a Original: "papel de carta", "tinta", "vermelho de rota", "ocre", "água do mapa". Na Eucalipto, o papel é verde-acinzentado, mas os papéis continuam os mesmos. Os nomes não foram mudados |
| D-4 | `design/mascote/guia/guia.html`, seção 3 | Diz para não pôr o mascote "sobre um fundo da mesma família de cor do gorro". O `fundo` claro da Eucalipto é um verde-cinza muito claro (matiz 150°, saturação 0,21; o gorro tem 183° e 0,47). O gorro fica a 2,25 dele, um pouco abaixo do creme (2,57) e do branco (2,83), que o guia aceita. O corpo faz o contorno (6,05). O QA aprovou o mascote nessa paleta (`rumo-paletas-rodada-1.md`). Falta o dono do guia dizer se a regra se aplica |
| D-5 | `docs/SPEC.md` §7, "Estados que toda tela trata" | A SPEC define o **conteúdo** do vazio ("com uma ação clara, nunca uma tela em branco") e do erro ("mensagem em português simples, com o que a pessoa pode fazer"). Não define a **forma visual** do erro. O protótipo também não tem estilo próprio de erro: a mensagem (`.mensagem`) é texto em peso 600, sem cor nem ícone. A forma visual do erro no app segue em aberto. **Confirmado pelo responsável em 27/11/2026:** o erro sempre tem ícone, texto e ação, nunca só cor (forma em `docs/componentes.md`, seção 7.2) |
| D-6 | `docs/TECNICA-3D.md` §15 e a pasta `videos/` | A técnica manda tirar o provisório de `marca/tokens.json`, que não existe no repositório. A prova de vídeo usa Inter, o fundo `#111827` e o destaque `#4FD1FF` direto no código (`videos/src/`). A tipografia da identidade é Archivo |
| D-7 | `docs/brief-cinema-2-prototipos.md` | Fala em alvos de 44 **pontos**; o protótipo mede em px de CSS. No app, vale a unidade da plataforma (NF-07). **Confirmado pelo responsável em 27/11/2026:** alvo de toque de 44 dp |
