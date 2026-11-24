# Direção de arte · as 5 direções dos protótipos do Campinguim

DSG-01 · Cinema, etapa 2 · 24/11/2026.

Base: `docs/brief-cinema-2-prototipos.md` (o pedido), `docs/PRD.md` (DSG-01 a DSG-13, NF-07, NF-08, seções 7 a 10), `docs/SPEC.md` (seções 5 a 7 e 9), a ficha 03 de `design/mascote/direcao/conceitos.md` e a opção 03 em `design/mascote/apresentacao/opcoes/03/` (escolha registrada em `design/mascote/ESCOLHA.md`).

Este arquivo é o contrato de cada direção: o construtor faz o protótipo a partir da sua ficha, e o QA confere o protótipo contra ela. O conteúdo das telas está em `telas.md`; os arquivos, pastas e regras de produção, em `padrao-producao.md`; a checagem contra concorrentes, em `concorrentes.md`.

## O que vale para as cinco

**Os cinco territórios do pedido ficam.** Fogueira e noite, mata e trilha, equipamento e ofício, mapa e expedição, comunidade e encontro. Eles já cobrem cinco temperaturas diferentes (noite quente, dia verde, oficina neutra, papel e tinta, encontro solar). O que muda em relação ao pedido é o **modelo de navegação**, que é diferente em cada uma (seção final).

| Nº | Nome | Território | Pasta |
| --- | --- | --- | --- |
| 1 | Brasa | Fogueira e noite | `design/prototipos/brasa/` |
| 2 | Clareira | Mata e trilha | `design/prototipos/clareira/` |
| 3 | Oficina | Equipamento e ofício | `design/prototipos/oficina/` |
| 4 | Rumo | Mapa e expedição | `design/prototipos/rumo/` |
| 5 | Roda | Comunidade e encontro | `design/prototipos/roda/` |

**Premium, nas cinco.** Uma família tipográfica de título e no máximo uma de texto. Paleta de 10 papéis (abaixo), sem cor fora deles. Um elemento-assinatura por direção, usado com parcimônia; nenhum enfeite que não informe. Espaço de respiro mínimo de 16 px nas bordas da tela e 24 px entre blocos. Nada de sombra pesada, degradê pronto, ilustração de banco de imagens, emoji ou foto. Movimento curto (até 200 ms) e desligado com `prefers-reduced-motion`.

**Ao ar livre, nas cinco.** Texto principal com contraste de pelo menos 7:1 (acima do AA, pela leitura sob sol); texto secundário de pelo menos 4,5:1; bordas de controle e ícones com significado de pelo menos 3:1. Corpo de texto de 17 px, nenhum texto abaixo de 15 px, peso de texto nunca abaixo de 400. Alvos de toque de pelo menos 44 × 44 px; ação principal de cada tela na faixa de baixo da tela (alcance do polegar), detalhe em `padrao-producao.md`.

**Estados que não dependem de cor (DSG-10).** "Separei" e "está no carro" sempre aparecem com ícone **e** texto visível. Os ícones de base, comuns às cinco (cada direção redesenha no seu traço, sem trocar a ideia): "separei" = caixa marcada; "está no carro" = carro de perfil; "preciso comprar" = sacola; "atenção" = triângulo com exclamação; "faltou" = caixa vazia com sinal de menos; "ciente" = marca de visto. Carro, casa, barraca, triângulo de aviso e marca de visto são entendidos em qualquer país (DSG-11); nenhuma direção usa bandeira, moeda desenhada, gesto de mão ou objeto típico de um só país.

**Papéis de cor (os mesmos nomes nas cinco, em `estilo.css` como variáveis CSS).**

| Papel | Para quê |
| --- | --- |
| `fundo` | Fundo da tela |
| `superficie` | Cartões, folhas, linhas de lista |
| `texto` | Texto principal |
| `texto-suave` | Texto secundário, rótulos |
| `linha` | Bordas de campo, divisórias com função, contorno de controle |
| `acento` | Preenchimento do botão principal |
| `sobre-acento` | Texto e ícone sobre `acento` |
| `atencao` | Texto e ícone de alerta de atenção |
| `separei` | Texto e ícone do estado "separei" |
| `carro` | Texto e ícone do estado "está no carro" |

**Como o contraste foi calculado.** Fórmula de luminância relativa e razão de contraste das WCAG 2.x, calculada por script (`(L1 + 0,05) / (L2 + 0,05)`), para os 14 pares de cada tema. Resultado: **0 falhas nas 10 paletas** (5 direções × 2 temas). Os valores estão na tabela de cada direção. O QA recalcula a partir de `estilo.css` (ver `padrao-producao.md`, seção 9).

Pares e mínimos: `texto`/`fundo` e `texto`/`superficie` ≥ 7; `texto-suave`/`fundo` e `/superficie` ≥ 4,5; `sobre-acento`/`acento` ≥ 4,5; `acento`/`fundo` ≥ 3; `linha`/`superficie` e `/fundo` ≥ 3; `atencao`, `separei` e `carro` sobre `superficie` e sobre `fundo` ≥ 4,5.

**O mascote (DSG-13).** É sempre a opção 03, Filhote de gorro, nos arquivos aprovados (`design/mascote/apresentacao/opcoes/03/arte/`), copiados sem alteração (`padrao-producao.md`, seção 6). Cores oficiais: penugem `#4A5560`, face e barriga `#FBF3E4`, gorro `#3EA8AE`, bico e pés `#E4A33A`, sombra e nadadeiras `#333C45`.

O que cada direção **pode** fazer: escolher qual pose aparece em cada tela; mudar o tamanho (sempre proporcional); pôr um apoio atrás dele (halo, etiqueta, papel, emblema); usar a versão `uma-cor` pintada com uma cor da própria paleta. O que **nenhuma** pode: redesenhar, recortar a figura, espelhar, girar, esticar, trocar cores da versão colorida (o gorro inclusive, ver pergunta P-20 em `telas.md`), pôr texto, balão ou objeto na arte, animar partes do corpo, pôr o mascote dentro de um disco azul (`design/mascote/direcao/originalidade.md`).

Regra de contraste do mascote: o corpo (`#4A5560`) tem de 2,37:1 a 2,47:1 contra os fundos escuros das cinco direções, ou seja, some no escuro. **Em tema escuro, a versão colorida só aparece sobre o apoio claro da direção** (todos com 5,6:1 a 6,1:1 contra o corpo, calculados); fora do apoio, usa-se a versão `uma-cor` em cor clara da paleta. Em tema claro, o corpo tem de 6,17:1 a 7,16:1 contra os fundos e dispensa apoio.

**Sem exagero.** O mascote aparece no máximo uma vez por tela e **nunca** dentro das linhas da lista, da tabela de gastos ou dos campos de formulário. A tabela de poses por tela está em cada direção; o padrão de partida é: abertura `principal`; alertas `pose-alerta`; aviso de saída `pose-alerta`, e `pose-comemorando` quando tudo estiver no carro; estadia `pose-camping` (a pose de frio, que combina com a viagem de clima frio); em casa `pose-neutro`; camping sem dados `pose-alerta`; site `principal`; marca pequena no cabeçalho, `icone`.

**Fontes.** Todas de licença SIL Open Font License 1.1 (OFL), conferidas no repositório oficial `github.com/google/fonts` em 24/11/2026, pasta `ofl/<familia>/`, cada uma com o próprio `OFL.txt`. Embutidas localmente por `@font-face`, sem serviço de fontes (padrao-producao, seção 5).

---

## 1 · Brasa · fogueira e noite

**Frase.** O app que se lê à luz da fogueira: escuro, quente e calmo, com uma brasa acesa onde está a próxima coisa a fazer.

**Linguagem visual.**
- Tema principal: **escuro**. O claro é a "manhã de cinzas", papel quente.
- Elemento-assinatura: **o brilho de brasa**. Um halo radial suave, cor de brasa a 12% de opacidade, atrás do único elemento que pede ação na tela (o botão principal, o item a marcar, o alerta). Só um halo por tela.
- Formas: cantos arredondados grandes (20 px nas folhas, 14 px nos botões), cartões sem borda, separados por tom de superfície.
- Densidade: baixa. Uma ideia por bloco; listas com linhas altas (64 px).
- Textura: nenhuma. A profundidade vem de três tons de carvão (fundo, superfície, folha aberta).

**Paleta.**

| Papel | Escuro | Claro |
| --- | --- | --- |
| `fundo` | `#15110E` carvão | `#F6EFE6` cinza de manhã |
| `superficie` | `#241D18` brasa apagada | `#FFFDF9` papel |
| `texto` | `#F7EDE0` creme | `#23180F` fuligem |
| `texto-suave` | `#C8B6A3` fumaça | `#66513F` casca queimada |
| `linha` | `#8A735F` | `#8F7863` |
| `acento` | `#F3A847` âmbar de brasa | `#9A4A12` brasa escura |
| `sobre-acento` | `#1C1108` | `#FFFFFF` |
| `atencao` | `#FF8F6B` brasa viva | `#A8341A` |
| `separei` | `#E9CF8E` palha | `#7A5B12` |
| `carro` | `#9FD3C7` verde-água | `#1F6B62` |
| apoio do mascote | `#F3D9B8` halo de fogueira | dispensado |

**Contraste calculado.**

| Par | Escuro | Claro |
| --- | --- | --- |
| texto / fundo · superfície | 16,22 · 14,36 | 15,23 · 17,10 |
| texto-suave / fundo · superfície | 9,55 · 8,45 | 6,54 · 7,35 |
| sobre-acento / acento | 9,27 | 6,25 |
| acento / fundo | 9,39 | 5,47 |
| linha / superfície · fundo | 3,72 · 4,20 | 4,11 · 3,66 |
| atenção / superfície · fundo | 7,43 · 8,40 | 6,52 · 5,80 |
| separei / superfície · fundo | 10,90 · 12,32 | 6,20 · 5,52 |
| carro / superfície · fundo | 9,98 · 11,28 | 6,19 · 5,52 |
| corpo do mascote / apoio `#F3D9B8` | 5,59 | — |

**Tipografia.** Títulos em **Fraunces** (OFL; `ofl/fraunces/Fraunces[SOFT,WONK,opsz,wght].ttf`), eixo SOFT no máximo, peso 560, tamanho óptico automático: serifa macia, de livro lido à noite. Texto em **Atkinson Hyperlegible** (OFL; `ofl/atkinsonhyperlegible/`, Regular e Bold), feita para leitura com baixa visão, boa para tela escura e brilho baixo. Escala: título de tela 30/36, título de bloco 21/28, corpo 17/26, rótulo 15/20. Números da lista em Atkinson Bold.

**Ícones.** Traço de 2 px com pontas arredondadas, cantos curvos, desenhados em grade de 24; preenchidos só quando o estado está ativo (caixa de "separei" ganha preenchimento palha; o carro ganha preenchimento verde-água). Nenhum ícone de chama: o fogo está no halo, não no desenho.

**Modelo de navegação: folhas que sobem.** A tela se divide em duas metades. A metade de cima é só para ler: onde a viagem está ("2 noites · Camping Recanto das Águas · 65 de 68 no carro"). A metade de baixo é para tocar: uma **folha** que sobe do rodapé, com alça de arrastar e altura de 60% da tela. Tudo o que se faz abre como folha por cima da anterior (a lista, um item, o aviso de saída, os gastos); fechar a folha (botão "fechar" de 48 px na alça, ou arrastar para baixo) volta à anterior. Na base da folha principal, um **seletor de 4 áreas** em linha (Lista, Camping, Grupo, Gastos), segmentado, dentro da folha e não numa barra de abas fixa. Não há botão no topo da tela.
- Ação principal: botão largo no rodapé da folha ("Vou sair", "Ver a lista", "Ciente").
- Voltar: fechar a folha.
- Telas 14 e 15 (web): sem folhas; página corrida de uma coluna, com o mesmo halo no único botão.

**Mascote.** Na abertura, `principal` grande, sobre o halo de fogueira, na metade de cima; na estadia, `pose-camping` (frio) ao lado do texto "Regras à mão"; no aviso de saída, `pose-alerta`, que vira `pose-comemorando` quando o último item entra no carro. Versão `uma-cor` em `texto-suave` como marca no topo das folhas. Em tema escuro, a versão colorida sempre sobre o halo `#F3D9B8`, um círculo difuso de borda esfumada (não é disco sólido nem anel).

**Tom de voz.** De quem conversa ao pé do fogo: frases curtas, segunda pessoa, sem exclamação. Exemplos com os dados do pedido: "Faltam 3 coisas para o carro." · "1 chuveiro quente para cerca de 25 barracas. Vale combinar o horário do banho." · "Tudo no carro. Boa estrada."

**Origem da inspiração.** A roda em volta do fogo depois que as crianças dormem: luz baixa, rosto iluminado de um lado, conversa calma. O halo vem do jeito que a luz da fogueira só ilumina o que está perto; a folha que sobe vem do gesto de puxar a manta.

**Riscos.**
- Tema escuro como principal pode cansar sob sol forte: o claro precisa estar à mão (botão de tema) e é o que o QA mede ao sol; os dois passam com folga.
- Folha sobre folha pode virar labirinto: no máximo duas folhas empilhadas; a terceira substitui a segunda.
- Laranja de fogueira é cor comum em marcas de camping (`concorrentes.md`): por isso o acento é âmbar de brasa, não laranja vivo, e nunca combinado com verde-pinho.
- Leitor de tela: folha precisa de foco preso dentro dela e de anúncio ao abrir.

---

## 2 · Clareira · mata e trilha

**Frase.** A lista como uma trilha bem marcada: verde de sombra, terra firme e uma marca pintada em cada etapa.

**Linguagem visual.**
- Tema principal: **claro**, a luz filtrada da clareira. O escuro é a mata ao anoitecer.
- Elemento-assinatura: **a marca de trilha**. O retângulo vertical pintado que sinaliza trilhas no mundo todo (4 × 14 px), usado como marcador de categoria e como passo do progresso: cada categoria completa ganha a marca cheia; incompleta, só o contorno.
- Formas: cantos médios (12 px), cartões com borda de 1 px em `linha`, cabeçalhos de categoria encostados na margem esquerda com a marca de trilha.
- Densidade: média; linhas de lista de 56 px.
- Textura: uma linha de copas de árvore, desenhada à mão em SVG, uma só cor (`superficie` sobre `fundo`), só no topo da abertura e do site. Nunca atrás de texto.

**Paleta.**

| Papel | Claro | Escuro |
| --- | --- | --- |
| `fundo` | `#F1F0E6` líquen | `#0F1712` mata à noite |
| `superficie` | `#FFFFFF` | `#18231C` |
| `texto` | `#17251B` sombra de mata | `#EAF0E6` |
| `texto-suave` | `#4A5B4E` musgo seco | `#AFC0B1` |
| `linha` | `#7A8B7C` | `#6A8070` |
| `acento` | `#2E5A45` musgo profundo | `#8CC7A1` folha nova |
| `sobre-acento` | `#FFFFFF` | `#0E1A12` |
| `atencao` | `#9A2B47` baga | `#F2A0B4` |
| `separei` | `#6B4A2F` casca | `#D9B98A` |
| `carro` | `#1E5A62` rio | `#8FD0CC` |
| apoio do mascote | dispensado | `#DDE7D6` clareira |

**Contraste calculado.**

| Par | Claro | Escuro |
| --- | --- | --- |
| texto / fundo · superfície | 13,93 · 15,95 | 15,72 · 13,97 |
| texto-suave / fundo · superfície | 6,33 · 7,25 | 9,55 · 8,49 |
| sobre-acento / acento | 7,88 | 9,19 |
| acento / fundo | 6,89 | 9,38 |
| linha / superfície · fundo | 3,61 · 3,16 | 3,81 · 4,28 |
| atenção / superfície · fundo | 7,47 · 6,53 | 8,07 · 9,09 |
| separei / superfície · fundo | 7,94 · 6,93 | 8,69 · 9,77 |
| carro / superfície · fundo | 7,79 · 6,81 | 9,31 · 10,47 |
| corpo do mascote / apoio `#DDE7D6` | — | 5,97 |

**Tipografia.** **Figtree** (OFL; `ofl/figtree/Figtree[wght].ttf` e itálico) em tudo: grotesca humanista e aberta, de placa de parque bem feita. Títulos em peso 700, corpo 450, rótulos 600 em versalete simulado com espaçamento de 0,04 em. Escala: 28/34, 20/26, 17/26, 15/20.

**Ícones.** Traço de 1,75 px, pontas retas, cantos levemente arredondados, em grade de 24, com um gesto orgânico: os ícones de estado se apoiam numa linha de chão curta. Estado ativo: preenchimento em `separei` ou `carro`.

**Modelo de navegação: abas fixas no rodapé.** Uma barra fixa de 4 abas no rodapé, com ícone e texto sempre visíveis: **Lista · Camping · Grupo · Gastos** (as quatro áreas da viagem, spec seção 7). Acima da barra, um único botão flutuante largo com a ação da tela ("Vou sair" na lista, "Ver a lista" nos alertas). Cabeçalho com o nome da viagem e botão de voltar à esquerda nas telas internas (item, fato, aviso). É o modelo mais convencional dos cinco, de propósito: serve de régua para os outros.
- Mapa das telas: Lista (4, 5, 6, 8), Camping (3, 7, 10, 13), Grupo (11), Gastos (12); a 9 abre por um cartão "Como foi?" no topo da Lista; 1 e 2 vêm antes das abas.
- Telas 14 e 15 (web): cabeçalho fino com a marca de trilha e rolagem simples.

**Mascote.** Abertura com `principal` em pé na linha de copas, pequeno (40% da largura). `pose-alerta` no alto dos alertas, ao lado do título. `pose-camping` na estadia. Na aba Lista, quando tudo estiver no carro, `pose-comemorando` no lugar do botão flutuante, por 2 segundos. `uma-cor` em `acento` no cabeçalho. Em tema escuro, colorido sobre o apoio `#DDE7D6` em forma de clareira (elipse achatada, como uma abertura de céu entre copas).

**Tom de voz.** Guia de parque: claro, prático, gentil, verbo no imperativo suave. "Siga pela categoria Dormir: falta o travesseiro da Bia." · "Tomada longe: entrou a extensão de 20 m." · "Trilha completa. Tudo no carro."

**Origem da inspiração.** As marcas pintadas em árvores e pedras que orientam caminhantes em quase todos os países, e a placa de início de trilha: poucas informações, ordem clara, nenhuma dúvida sobre o próximo passo.

**Riscos.**
- Verde é a cor mais usada por apps de trilha e camping (`concorrentes.md`): o verde aqui é musgo azulado, nunca lima nem verde vivo, e o par verde-pinho com laranja de fogueira está proibido.
- Abas fixas são o modelo mais comum de app: o risco de "app genérico" (DSG-09) é desta direção. A defesa é a marca de trilha, a tipografia e o espaço; se o protótipo ficar parecido com um app qualquer, o QA reprova.
- Baga (atenção) e musgo (acento) são o par vermelho e verde que confunde daltônicos: atenção sempre com triângulo e a palavra "Atenção".

---

## 3 · Oficina · equipamento e ofício

**Frase.** A lista como uma bancada arrumada: cada coisa com etiqueta, medida e lugar, costurada com linha de verdade.

**Linguagem visual.**
- Tema principal: **claro**, lona crua. O escuro é alumínio anodizado.
- Elemento-assinatura: **a costura**. Borda tracejada de 1,5 px (traço 6, espaço 4) em `linha`, a 4 px para dentro da borda do cartão, como a costura de uma bolsa de lona. Usada só em cartões que agrupam (categoria, família, gasto), nunca em botão.
- Formas: cantos pequenos (6 px), como etiqueta cortada; o botão principal tem um ilhós desenhado (círculo vazado de 8 px) à esquerda do texto.
- Densidade: **alta**, com precisão. Linhas de 52 px; quantidade em coluna própria, alinhada à direita, em fonte mono ("2 × 5 kg", "36 L · 8 galões").
- Textura: nenhuma imagem; a "lona" é só a cor do fundo.

**Paleta.**

| Papel | Claro | Escuro |
| --- | --- | --- |
| `fundo` | `#ECE7DC` lona crua | `#131416` anodizado |
| `superficie` | `#F8F5EE` | `#1E2024` |
| `texto` | `#1B1D20` grafite | `#ECEAE4` |
| `texto-suave` | `#4C5057` | `#A9ADB3` |
| `linha` | `#6F747B` aço | `#737881` |
| `acento` | `#22252A` grafite | `#F2C230` amarelo de cinta |
| `sobre-acento` | `#F6C744` amarelo de cinta | `#17181A` |
| `atencao` | `#A1360F` ferrugem | `#FF9A73` |
| `separei` | `#7A5800` latão | `#E2C27A` |
| `carro` | `#2C5470` aço azulado | `#9CC3E4` |
| apoio do mascote | dispensado | `#E7E0D1` etiqueta de lona |

**Contraste calculado.**

| Par | Claro | Escuro |
| --- | --- | --- |
| texto / fundo · superfície | 13,70 · 15,51 | 15,32 · 13,56 |
| texto-suave / fundo · superfície | 6,57 · 7,44 | 8,18 · 7,24 |
| sobre-acento / acento | 9,64 | 10,60 |
| acento / fundo | 12,47 | 11,00 |
| linha / superfície · fundo | 4,32 · 3,82 | 3,68 · 4,15 |
| atenção / superfície · fundo | 6,32 · 5,58 | 7,86 · 8,88 |
| separei / superfície · fundo | 5,98 · 5,28 | 9,50 · 10,74 |
| carro / superfície · fundo | 7,39 · 6,53 | 8,81 · 9,95 |
| corpo do mascote / apoio `#E7E0D1` | — | 5,79 |

**Tipografia.** **IBM Plex Sans Condensed** (OFL; `ofl/ibmplexsanscondensed/`, Regular, Medium e SemiBold) para títulos e texto: condensada, técnica, cabe mais em linha estreita sem perder leitura. **IBM Plex Mono** (OFL; `ofl/ibmplexmono/`, Regular e Medium) só para quantidades, valores em reais e contagens. Títulos em caixa alta com espaçamento de 0,06 em, só nos rótulos de categoria. Escala: 28/32, 19/24, 17/24, 15/20.

**Ícones.** Geométricos, traço de 2 px, pontas e cantos retos, em grade de 24, como pictograma de manual de equipamento. Estado ativo: o ícone ganha um fundo de etiqueta (retângulo de 6 px de canto) em `separei` ou `carro`, com o ícone em `superficie`.

**Modelo de navegação: abas de fichário na borda.** As áreas são **divisórias de fichário** presas na borda direita da tela, na faixa de baixo (alcance do polegar direito): abas de 56 × 72 px empilhadas, cada uma com ícone em cima e rótulo de uma palavra embaixo, escrito na horizontal (nunca girado), em 15 px. Áreas: **Lista, Camping, Grupo, Gastos**, e uma quinta, **Volta**, que agrupa 8 e 9. Tocar numa aba troca o conteúdo inteiro, como abrir o fichário naquela divisória. Sem barra de abas no rodapé; o rodapé é só da ação principal.
- Voltar: botão "voltar" de texto no canto de cima à esquerda nas telas internas; nas áreas, não há voltar, há aba.
- Uso com a mão esquerda: botão de 44 px no topo da tela "trocar lado" leva as abas para a borda esquerda (estado guardado no navegador, com tentativa protegida).
- Telas 14 e 15 (web): sem abas; página com etiquetas costuradas em sequência.

**Mascote.** Pouco e preciso. Abertura com `principal` dentro de uma etiqueta de lona costurada (apoio `#E7E0D1`, mesmo no tema claro, como identidade). `pose-alerta` na etiqueta do alerta de atenção. `pose-camping` na estadia. `pose-comemorando` no aviso de saída concluído. `uma-cor` em `texto-suave` como marca d'água na etiqueta da viagem (no máximo 48 px).

**Tom de voz.** De quem cuida bem do equipamento: técnico, curto, com medida. "3 itens fora do carro." · "Extensão: 20 m. Motivo: tomada longe da barraca." · "Carga completa: 68 de 68."

**Origem da inspiração.** A bancada de quem guarda o equipamento de camping em caixas etiquetadas, as etiquetas costuradas em mochila e saco de dormir, a ficha técnica de barraca com medidas e peso.

**Riscos.**
- Densidade alta e texto condensado podem cansar e quebrar com fonte em 200%: a coluna de quantidade desce para baixo do nome quando não couber, nunca corta.
- Abas na borda não são um padrão conhecido: a primeira abertura da lista mostra as abas com rótulo grande; e há o "trocar lado" para canhotos.
- Amarelo e grafite lembram sinalização de obra e ferramentas elétricas: o amarelo é só texto sobre grafite e acento no escuro, nunca faixa zebrada.

---

## 4 · Rumo · mapa e expedição

**Frase.** A viagem como uma rota desenhada no mapa: cinco paradas, da sala de casa até a volta, e você sempre sabe em qual está.

**Linguagem visual.**
- Tema principal: **claro**, papel de carta. O escuro é o mapa lido com lanterna.
- Elemento-assinatura: **a curva de nível**. Linhas finas concêntricas e irregulares (1 px, `linha` a 35%), desenhadas em SVG próprio, no fundo do topo de cada etapa; e a **rota**: linha tracejada (traço 2, espaço 6) que liga as cinco paradas no topo da tela.
- Selos de confirmação: cada fato do camping confirmado aparece num **selo retangular de canto cortado** (octógono alongado), em tinta `carro`, com o número de confirmações e "nov/2026". Nada de selo redondo com nome de lugar em anel (`concorrentes.md`).
- Formas: retos, cantos de 2 px, réguas finas; números tabulares; coordenadas só como enfeite tipográfico do cabeçalho da etapa (nº da parada, "1/5"), nunca coordenadas geográficas reais (o app não usa localização, PRV-02).
- Densidade: média; linhas de 56 px.

**Paleta.**

| Papel | Claro | Escuro |
| --- | --- | --- |
| `fundo` | `#F3EEE2` papel de carta | `#10161C` noite |
| `superficie` | `#FBF8F1` | `#18212A` |
| `texto` | `#1C2630` tinta | `#EDE6D6` papel |
| `texto-suave` | `#4E5965` | `#AEB4B8` |
| `linha` | `#857558` curva de nível | `#6E7D89` |
| `acento` | `#1C2630` tinta | `#EDE6D6` papel |
| `sobre-acento` | `#FBF8F1` | `#10161C` |
| `atencao` | `#A8321F` vermelho de rota | `#FF8A70` |
| `separei` | `#8A5A14` ocre | `#E3B66B` |
| `carro` | `#2F5E6E` água do mapa | `#8CC8D8` |
| apoio do mascote | dispensado | `#EDE6D6` papel |

**Contraste calculado.**

| Par | Claro | Escuro |
| --- | --- | --- |
| texto / fundo · superfície | 13,25 · 14,46 | 14,64 · 13,10 |
| texto-suave / fundo · superfície | 6,17 · 6,73 | 8,69 · 7,77 |
| sobre-acento / acento | 14,46 | 14,64 |
| acento / fundo | 13,25 | 14,64 |
| linha / superfície · fundo | 4,23 · 3,87 | 3,84 · 4,30 |
| atenção / superfície · fundo | 6,30 · 5,77 | 7,07 · 7,91 |
| separei / superfície · fundo | 5,57 · 5,10 | 8,66 · 9,68 |
| carro / superfície · fundo | 6,72 · 6,15 | 8,81 · 9,86 |
| corpo do mascote / apoio `#EDE6D6` | — | 6,12 |

**Tipografia.** **Archivo** (OFL; `ofl/archivo/Archivo[wdth,wght].ttf`), uma família com eixo de largura: títulos em largura 125 e peso 700, em caixa alta espaçada, como letreiro de mapa; texto em largura 100, peso 400; números tabulares (`font-variant-numeric: tabular-nums`). Escala: 26/30, 19/24, 17/26, 15/20.

**Ícones.** Simbologia de carta: traço de 1,5 px, pontas retas, formas inscritas em quadrado; estados ativos viram **símbolo cheio** (como ponto cotado): caixa de "separei" cheia em ocre, carro cheio em água do mapa. Barraca, casa e carro com o mesmo peso de símbolo de legenda.

**Modelo de navegação: a rota da viagem.** O topo da tela é uma **rota com cinco paradas**: **Preparar · Carregar · No camping · Volta · Em casa**. A parada atual tem o ponto cheio; tocar numa parada (alvo de 48 px) ou deslizar a tela para os lados muda de etapa. Cada etapa é uma rolagem vertical própria. O que não é etapa (Camping, Grupo, Gastos) fica na **legenda**: um botão fixo no canto de baixo à direita, como a legenda de um mapa, que abre um painel com essas três entradas.
- Mapa das telas: Preparar (2, 3, 13); Carregar (4, 5, 6); No camping (7, 10); Volta (8); Em casa (9); legenda (Camping → 3 e 10, Grupo → 11, Gastos → 12).
- Ação principal: botão largo no rodapé, acima da legenda.
- Voltar: a própria rota (parada anterior) e, nas telas internas (item, fato), "voltar" de texto no topo.
- Telas 14 e 15 (web): a rota vira uma régua horizontal fixa de seções da página.

**Mascote.** Abertura: `principal` sobre uma curva de nível, como quem está no topo do mapa. Na rota, o `icone` marca a parada atual (24 px, o mascote como "você está aqui"); é a única vez que o ícone aparece em tamanho pequeno dentro da interface, e o QA confere que continua legível. `pose-alerta` nos alertas, `pose-camping` em No camping, `pose-comemorando` quando a etapa Carregar fecha. Em tema escuro, colorido sobre papel `#EDE6D6` em retângulo de canto cortado.

**Tom de voz.** Diário de expedição: verbo no presente, registro com data e número, sem adjetivo. "Parada 2 de 5: carregar o carro." · "Recanto das Águas: 7 campistas confirmaram." · "Som até 22h: cumprida. 6 confirmações. Última: Carla R., nov/2026."

**Origem da inspiração.** Cartas topográficas, cadernetas de expedição e o hábito de marcar a rota com lápis antes de sair; o selo vem dos carimbos de visto em caderneta de viagem, com forma própria.

**Riscos.**
- Curvas de nível e cartas lembram apps de mapa e trilha (`concorrentes.md`): aqui não há mapa de verdade, nem trilha colorida, nem pino de mapa; as curvas são enfeite de fundo de topo, nunca uma tela de mapa.
- Navegação por etapas é linear: quem quer só "ver os gastos" precisa saber que está na legenda. A legenda tem rótulo de texto ("Legenda: camping, grupo, gastos") e não só ícone.
- Deslizar para os lados não pode ser o único caminho: as paradas são botões.
- Bússola fica proibida como símbolo (lembra a marca de um guia brasileiro de campings, ver `concorrentes.md`).

---

## 5 · Roda · comunidade e encontro

**Frase.** A viagem como um encontro: cada família tem seu emblema, e o mural mostra quem já fez a sua parte.

**Linguagem visual.**
- Tema principal: **claro**, sol da manhã. O escuro é a roda depois do jantar.
- Elemento-assinatura: **o emblema de família**. Cada família ganha um emblema bordado próprio: forma de escudo de base reta e topo em arco (não redondo, sem corda, sem nó, sem flor-de-lis, ver `concorrentes.md`), com as iniciais em monograma ("C&R", "B&P", "D&L") e uma cor da paleta. O emblema "acende" (borda cheia) quando a família termina a parte dela no grupo. Não é placar: não há ranking, pontos nem medalha.
- Formas: cartões grandes com cantos de 16 px, blocos de cor chapada no mural, pílulas para os nomes de quem leva cada item.
- Densidade: baixa; o mural tem no máximo 6 blocos.
- Textura: nenhuma; o bordado é sugerido só pelo contorno duplo do emblema (dois traços de 2 px, 3 px de vão).

**Paleta.**

| Papel | Claro | Escuro |
| --- | --- | --- |
| `fundo` | `#FFF7EC` manhã | `#1A1420` noite |
| `superficie` | `#FFFFFF` | `#261E2E` |
| `texto` | `#241B2F` berinjela | `#F5ECF2` |
| `texto-suave` | `#5A4E66` | `#C2B4C4` |
| `linha` | `#8A7F96` | `#7E6E86` |
| `acento` | `#7A2E5C` ameixa | `#F2B53A` sol |
| `sobre-acento` | `#FFFFFF` | `#1A1420` |
| `atencao` | `#A63A12` | `#FF9E80` |
| `separei` | `#7A5600` mostarda | `#EBCB7C` |
| `carro` | `#1E6A6E` verde-azulado | `#8DD3D3` |
| apoio do mascote | dispensado | `#F4E2C6` emblema |

Cores dos emblemas das famílias (preenchimento, com o monograma em `texto` no claro): Carla e Rafael `#F2B53A` sol; Bruno e Paula `#9FD3D0` água; Diego e Lívia `#E8B7C8` flor. São cores de fundo de emblema, não de texto; o monograma sobre elas passa de 7:1 com `#241B2F` (o QA confere).

**Contraste calculado.**

| Par | Claro | Escuro |
| --- | --- | --- |
| texto / fundo · superfície | 15,53 · 16,50 | 15,59 · 13,89 |
| texto-suave / fundo · superfície | 7,28 · 7,73 | 9,12 · 8,12 |
| sobre-acento / acento | 8,85 | 9,83 |
| acento / fundo | 8,33 | 9,83 |
| linha / superfície · fundo | 3,78 · 3,56 | 3,41 · 3,83 |
| atenção / superfície · fundo | 6,49 · 6,11 | 8,00 · 8,97 |
| separei / superfície · fundo | 6,65 · 6,26 | 10,22 · 11,47 |
| carro / superfície · fundo | 6,28 · 5,91 | 9,48 · 10,64 |
| corpo do mascote / apoio `#F4E2C6` | — | 5,99 |

**Tipografia.** Títulos em **Bricolage Grotesque** (OFL; `ofl/bricolagegrotesque/BricolageGrotesque[opsz,wdth,wght].ttf`), peso 700, largura 90: letreiro de cartaz de encontro, expressivo sem ser infantil. Texto em **Lexend** (OFL; `ofl/lexend/Lexend[wght].ttf`), peso 400, feita para fluência de leitura. Escala: 32/36, 21/28, 17/26, 15/20.

**Ícones.** Traço de 2,25 px, pontas e cantos arredondados, formas cheias e amigáveis, em grade de 24; pessoas desenhadas como formas simples de cabeça e ombro, sem rosto. Estado ativo: o ícone ganha um círculo de fundo em `separei` ou `carro` a 18%, com o ícone na cor cheia.

**Modelo de navegação: o mural.** A tela inicial da viagem é um **mural de blocos grandes** (grade de 2 colunas, blocos de 160 px de altura no mínimo): **Nossa lista, Quem leva o quê, Gastos, O camping, A volta, Em casa**. Cada bloco mostra o essencial já no mural ("65 de 68 no carro", "2 itens sem dono", "Vocês devem R$ 180,00") e abre a tela inteira. Toda tela interna tem, no rodapé, à esquerda, o botão "Mural" (48 px) e, à direita, a ação principal. Não há abas nem menu.
- Mapa das telas: bloco Nossa lista (4, 5, 6), O camping (3, 7, 10, 13), Quem leva o quê (11), Gastos (12), A volta (8), Em casa (9); 1 e 2 vêm antes do mural.
- Voltar: "Mural" no rodapé, sempre no mesmo lugar.
- Telas 14 e 15 (web): o convidado vê um mural reduzido (Quem leva o quê, O que eu devo); o site usa os blocos como seções.

**Mascote.** O mascote é anfitrião, não protagonista. Abertura: `principal` no centro, com os três emblemas das famílias ao redor como num encontro (os emblemas não tocam a figura). `pose-comemorando` quando o emblema de uma família acende. `pose-alerta` nos alertas. `pose-camping` na estadia. No mural, nenhum mascote: os protagonistas são as famílias. Em tema escuro, colorido sobre o apoio `#F4E2C6` em forma de emblema.

**Tom de voz.** De quem organiza o encontro e chama pelo nome: primeira pessoa do plural, caloroso, sem infantilizar. "Ninguém pegou o isqueiro ainda." · "3 fogareiros: precisa de todos?" · "A carne ficou em R$ 60,00 por cota. Vocês devem R$ 180,00 ao Bruno."

**Origem da inspiração.** Os encontros de campistas em feriado, quando várias famílias montam as barracas em roda e dividem a cozinha; os emblemas bordados que clubes e grupos costuram na mochila, aqui com forma e monograma próprios.

**Riscos.**
- Emblema e "conquista" escorregam para gamificação e para emblemas de escotismo ou de apps de esporte (`concorrentes.md`): sem pontos, sem ranking, sem flor-de-lis, sem corda e nó, sem roxo-real de fundo, sem laranja de app de esporte.
- Mural é ótimo para o grupo e mais fraco para a lista longa: a lista abre em tela cheia, com rolagem própria e a mesma qualidade das outras direções.
- Verde-azulado do estado "carro" fica perto do turquesa de um app de dividir contas: aqui ele é escuro e só marca estado; o botão de gastos é ameixa.

---

## Matriz: as cinco diferem em linguagem visual e em navegação

**Linguagem visual.**

| Eixo | Brasa | Clareira | Oficina | Rumo | Roda |
| --- | --- | --- | --- | --- | --- |
| Tema principal | escuro | claro | claro | claro | claro |
| Temperatura | quente sobre carvão | verde frio e terra | neutro de lona e aço | papel e tinta | solar e ameixa |
| Elemento-assinatura | halo de brasa no que pede ação | marca de trilha como progresso | costura tracejada nos cartões | curva de nível, rota e selo de canto cortado | emblema de família com monograma |
| Cantos | 20 / 14 px, macios | 12 px | 6 px, de etiqueta | 2 px, retos | 16 px, cheios |
| Densidade | baixa (linha 64 px) | média (56) | alta (52) | média (56) | baixa (mural de blocos) |
| Tipografia | serifa macia + sans de alta legibilidade | humanista única | condensada técnica + mono | grotesca de largura variável, letreiro largo | grotesca de cartaz + sans de fluência |
| Família de título | Fraunces | Figtree | IBM Plex Sans Condensed | Archivo (largura 125) | Bricolage Grotesque |
| Ícones | traço 2, arredondado, preenche no estado | traço 1,75, com linha de chão | geométrico reto, estado em etiqueta | símbolo de legenda, estado cheio | traço 2,25 cheio, estado em círculo |
| Botão principal | âmbar com halo | musgo flutuante sobre as abas | grafite com ilhós | tinta, largo, sobre a legenda | ameixa, no rodapé ao lado de "Mural" |
| Mascote no escuro | sobre halo de fogueira | sobre elipse de clareira | sobre etiqueta de lona (também no claro) | sobre papel de canto cortado | sobre emblema |

**Navegação.**

| Eixo | Brasa | Clareira | Oficina | Rumo | Roda |
| --- | --- | --- | --- | --- | --- |
| Modelo | folhas que sobem | abas fixas no rodapé | abas de fichário na borda | rota de etapas no topo | mural de blocos |
| Organiza por | ação (o que fazer agora) | área (lista, camping, grupo, gastos) | área + Volta | momento da viagem | pessoas e assuntos do grupo |
| Onde se troca de área | seletor dentro da folha | barra de 4 abas | 5 divisórias na borda direita (ou esquerda) | 5 paradas + legenda | blocos do mural |
| Voltar | fechar a folha | voltar no topo | voltar no topo | parada anterior / voltar no topo | "Mural" no rodapé |
| Ação principal | rodapé da folha | botão flutuante acima das abas | rodapé, sozinho | rodapé, acima da legenda | rodapé, à direita |
| Gesto extra (nunca o único caminho) | arrastar a folha | nenhum | nenhum | deslizar entre etapas | nenhum |
| Topo da tela | só leitura | nome da viagem | nome + "trocar lado" | rota | nome da viagem |

Nenhum par de direções coincide em tema, assinatura, família tipográfica, estilo de ícone ou modelo de navegação. Os pares mais próximos e o que os separa:
- **Clareira e Oficina** (ambas claras, de área): abas no rodapé contra divisórias na borda; humanista contra condensada e mono; marca de trilha contra costura.
- **Rumo e Oficina** (ambas retas e precisas): navegação por momento contra por área; papel e tinta contra lona e aço; selo contra etiqueta.
- **Brasa e Roda** (ambas quentes e de densidade baixa): escuro contra claro; folhas contra mural; serifa contra grotesca de cartaz.
