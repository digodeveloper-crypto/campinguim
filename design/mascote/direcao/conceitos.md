# Direção de arte · as 10 opções de mascote do Campinguim

Fichas de construção para dez designers independentes, um por opção. Cada ficha é o contrato da opção: o QA confere o desenho entregue contra ela (MSC-01). Base: `docs/brief-cinema-1-mascote.md`, `docs/PRD.md` (seções 3, 4, 14, 15), regras do piloto de 24/11/2026 e `padrao-producao.md` (tamanhos, nomes, ciclo de renderização).

## O que vale para as dez

**Quem ele é.** O amigo preparado que nunca esquece nada e avisa a tempo. Já passou por todo perrengue e leva com bom humor. Fala a verdade sobre o camping. Simpático sem ser infantil: o produto é premium e o mascote acompanha. Em todas as opções, inclusive nas de filhote, o olhar é atento, nunca bobo; a boca nunca é uma boca humana desenhada no bico.

**O que é fixo, em qualquer opção.**
- É pinguim na primeira olhada: corpo escuro atrás, claro na frente, asas em nadadeira, pés achatados, bico. Nada de penas de outro pássaro, orelhas, dentes, mãos com dedos.
- Dois olhos com pupila. A expressão sai de pálpebra, sobrancelha de pena e inclinação do corpo, não de boca.
- Funciona em uma cor só: a leitura de pinguim vem da silhueta mais os recortes claros (barriga, olhos, bico), nunca da cor.
- Nada que dependa de referência local (sem bandeira, time, chinelo, cuia, texto). Nenhum gesto de mão: as nadadeiras não têm dedos, então não há sinal de OK, polegar nem figa.
- Acessório nunca é essencial. Quem usa acessório entrega também `arte/sem-acessorio`, e a figura sem ele continua sendo este personagem e continua diferente das outras nove.
- Toda opção mostra pelo menos uma situação de desconforto (frio, calor ou chuva). A ficha diz qual é e se vem como `pose-camping` ou como pose extra.
- As três vistas descrevem o mesmo volume. Antes de desenhar, o designer imagina o personagem como boneco de vinil: cada parte tem onde se apoiar. Vista de lado mostra o bico projetado, a barriga em perfil e a nadadeira; três quartos é a 45°, não a frente inclinada.
- Em 48 px o ícone precisa dizer "pinguim" e "camping" sem detalhe menor que 4 px (43 unidades na prancha de 512). Quem precisa de uma linha fina para ser entendido falha.

**O que foi descartado já na direção, por não se sustentar em 3D (MSC-09).**
- Pinguim só de perfil, estilo emblema de livro: de frente não se reconhece e não dá pose.
- Pinguim dentro de um círculo, com o círculo fazendo parte do corpo (o anel some de lado).
- Figura de linha única, sem massa (contorno sem preenchimento vira arame em volume).
- Olhos desenhados fora do contorno da cabeça, ou um olho só visto de frente.
- Barriga que "flutua" sem tocar o corpo, asas que saem da barriga, cabeça separada do corpo por um vão.
- Corpo cujo contorno é uma barraca com estacas e cordas: as cordas não têm onde ficar de lado. A opção 01 usa só a proporção da barraca, não os detalhes.
- Mascote sentado no chão como pose padrão: tira os pés, o andar e a altura, e aproxima de um mascote de sistema já famoso.

**Eixos** (brief): traço (geométrico ↔ orgânico), idade aparente (filhote ↔ adulto), proporção (compacto ↔ braços e pernas definidos), acabamento (chapado de emblema ↔ volume de boneco), ligação com o camping (no desenho ↔ em acessório).

**Prancha.** Tudo em 512 × 512 (ver `padrao-producao.md`). As medidas abaixo estão nessa unidade. "Altura" é a altura da figura em pé, pés inclusos, dentro da área útil de 448.

---

## 01 · Corpo de barraca

**Ideia.** O pinguim cuja proporção é a de uma barraca canadense: triângulo largo na base, estável, a barriga é a porta. Camping na própria forma; emblema puro.

**Eixos.** Traço: geométrico (extremo). Idade: adulto. Proporção: compacto, quase uma forma só. Acabamento: chapado, sem linha. Camping: no desenho (forma).

**Construção.**
- Silhueta: triângulo isósceles de base 400 e altura 448, com os três cantos arredondados (raio 60 no topo, 40 na base). O topo é a cabeça: não há pescoço nem cabeça destacada; os olhos ficam no terço superior do triângulo. Proporção cabeça/corpo: 1 para 3, medida pela linha dos olhos.
- Barriga: arco de porta de barraca, base reta no chão, largura 200, altura 300, raio no topo 100, centrada. Cor clara.
- Olhos: duas cápsulas verticais 28 × 48, centros a 120 do topo, afastados 70 entre si. Pupila: a cápsula inteira é escura sobre um branco de olho 44 × 64 (branco só na versão colorida; na de uma cor, a cápsula vira recorte claro).
- Bico: losango 60 de largura, 44 de altura, ponta inferior a 200 do topo, cor de bico. Sem boca.
- Asas: dois triângulos retângulos de cateto 130, colados nas laterais do corpo a 220 do topo, apontando para baixo e para fora. São as abas da barraca. Sem articulação visível no neutro.
- Pés: dois semicírculos de raio 44, saindo da base, afastados 160 entre centros. Nunca escondidos: são o que faz ele ser bicho e não barraca.
- Linha: nenhuma. Detalhe: nenhum além de olhos, bico, barriga, asas, pés.
- Camping no desenho: a proporção de barraca e os pés bem abertos (postura de quem fincou no chão). Nenhum acessório. Sem arquivo `sem-acessorio`.

**Poses.** Neutro: como acima, olhos no centro. Comemorando: asas sobem até a horizontal (triângulo fica mais largo), olhos viram dois arcos fechados de alegria, corpo inclina 8° para trás. Alerta: corpo inclina 12° para a frente, olhos viram cápsulas estreitas (pálpebra superior desce metade), uma asa aponta para a frente; nunca boca aberta. Camping (desconforto: **chuva**, é a `pose-camping`): gotas grandes escorrem pelas laterais do triângulo como por uma lona, olhos semicerrados, asas coladas no corpo; a barriga continua seca. Frio: triângulo "encolhe" (base mais estreita 340, altura igual), olhos fechados em linha, três traços curtos de tremor ao lado. Calor: topo arredondado "derrete" numa curva mais larga, olhos caídos, uma gota grande na lateral, asas afastadas do corpo para ventilar.

**Volume.** Frente: triângulo. Lado: gota alongada com a barriga saliente na frente e o dorso reto atrás, bico projetado 40, asa vista como aba plana. Três quartos: mostra a aresta frontal suave e a asa do lado de cá; o corpo é uma pirâmide de base oval, com lados côncavos de leve. Ícone 48 px: o triângulo com porta e dois olhos, pés visíveis; o bico pode crescer para 56 de largura. Uma cor: silhueta do triângulo com pés, barriga, olhos e bico como recortes transparentes.

**Paleta sugerida.** Verde-floresta profundo `#1F3D2E` (corpo), areia `#F3E7CF` (barriga), âmbar `#E39B2D` (bico e pés), carvão `#1B1F24` (pupila).

**O que o distingue.** É o único cuja silhueta é um triângulo: de longe é uma barraca, de perto é um pinguim.

---

## 02 · Guia alto de lenço

**Ideia.** O adulto esguio que já conhece o caminho: alto, de pernas e asas articuladas, traço de pincel. O lenço no pescoço é o acessório de quem organiza o grupo.

**Eixos.** Traço: orgânico e expressivo. Idade: adulto. Proporção: braços e pernas definidos (extremo). Acabamento: com volume, de boneco (sombra de um tom nas partes de baixo). Camping: em acessório (lenço).

**Construção.**
- Silhueta: alto e estreito, altura 448, largura máxima 190 no peito. Proporção cabeça/corpo 1 para 4,5: cabeça oval 100 × 110, pescoço curto e visível (largura 70, altura 30), tronco em fuso (ombros 170, cintura 150, quadril 160), pernas visíveis de 90 de altura, pés 90 × 34 virados para fora em 20°.
- Barriga: faixa clara que começa no pescoço com uma ponta em V (como gola) e desce até entre as pernas, largura 110, borda irregular de pincel.
- Olhos: amêndoas 34 × 22, pálpebra superior pesada em linha grossa (dá idade), íris escura ocupando metade, pequeno brilho quadrado de 6. Afastados 44.
- Bico: fino e longo, 70 de comprimento, 26 de altura na base, levemente curvo para baixo, cor de bico com a linha superior em traço escuro. Sem boca aberta no neutro.
- Asas: longas, 200, com um "cotovelo" sugerido por uma curva, terminando em ponta arredondada; no neutro a esquerda repousa no quadril (nadadeira na cintura), a direita cai.
- Pés: pés grandes, três dedos sugeridos por duas incisões curtas (nunca dedos separados).
- Linha: contorno orgânico de espessura variável, 10 a 20, mais grossa embaixo das formas (peso). Detalhe: médio; sombra de um tom sob a cabeça, sob a barriga e nas pernas.
- Acessório: lenço triangular amarrado atrás, ponta na frente cobrindo a gola em V, 120 de largura. `sem-acessorio`: o mesmo desenho, o V da barriga aparece inteiro.

**Poses.** Neutro: peso numa perna, asa na cintura, cabeça 5° para o lado. Comemorando: as duas asas para o alto, um pé fora do chão, olhos fechados em arcos, lenço esvoaçando. Alerta: tronco ereto, asa estendida apontando para fora do quadro, olhos abertos com a pálpebra reta, bico fechado; a outra asa para trás. Camping (desconforto: **calor**, é a `pose-camping`): bico entreaberto ofegante, lenço usado como abano na asa, duas gotas na têmpora, pálpebras caídas, pés abertos. Frio: asas cruzadas sobre o peito, lenço puxado até o bico, joelhos juntos. Chuva: ombros erguidos, asa sobre a cabeça como aba, olhar de lado resignado.

**Volume.** Frente: fuso com pescoço. Lado: dorso levemente curvo, barriga quase reta, bico fino projetado 70, pés compridos para a frente, asa colada ao flanco. Três quartos: pescoço e cotovelo da asa dão profundidade; o lenço tem nó atrás. Ícone 48 px: enquadrar do peito para cima (cabeça, bico longo, lenço), não a figura inteira, que ficaria um palito; a linha de pincel vira preenchimento sólido. Uma cor: silhueta com barriga em V, olhos e lenço em recorte; o lenço some na versão `sem-acessorio`.

**Paleta sugerida.** Grafite `#2A2E33` (corpo), marfim `#F7F1E3` (barriga), ocre `#C9842B` (lenço), bico `#D98E3B`, sombra `#1A1D20`.

**O que o distingue.** O único alto e esguio com articulação visível e traço de pincel; parece um adulto que caminha, não uma bola.

---

## 03 · Filhote de gorro

**Ideia.** O filhote felpudo de gorro de lã, o novato tranquilo que já anota tudo. Macio, de contorno de penugem, o mais jovem do conjunto.

**Eixos.** Traço: orgânico. Idade: filhote (extremo). Proporção: compacto. Acabamento: com volume (luz de cima, sombra embaixo). Camping: em acessório (gorro).

**Construção.**
- Silhueta: ovo deitado de ponta para cima, 360 de largura por 400 de altura, com o contorno em pequenas ondas de penugem (12 a 16 ondas por volta, amplitude 6). Proporção cabeça/corpo 1 para 1: a cabeça é a metade de cima do ovo, sem pescoço.
- Barriga: mancha clara oval 220 × 260 no terço inferior, de borda felpuda igual ao contorno. A face é uma segunda mancha clara, redonda, 200 de diâmetro, onde ficam olhos e bico (máscara de filhote).
- Olhos: dois arcos descendentes (olhos calmos, quase fechados), traço 14 de espessura, 50 de largura, afastados 70; abrem em círculos de 30 só nas poses de alerta e comemorando. Sem brilho.
- Bico: minúsculo, triângulo 36 × 26, cor de bico, logo abaixo dos olhos.
- Asas: tocos arredondados 70 × 110 colados ao corpo, apontando para baixo.
- Pés: grandes para o corpo, dois ovais 100 × 40 virados para fora, cor de bico; o filhote parece "calçado".
- Linha: nenhuma; a leitura é de massa felpuda contra o fundo. Detalhe: baixo; sombra interna de um tom no fundo do ovo.
- Acessório: gorro de lã liso cobrindo o topo do ovo, 300 de largura, borda dobrada de 40 e pompom de raio 34 inclinado para o lado. Sem estampa. `sem-acessorio`: o topo do ovo volta a ser penugem; o personagem continua reconhecível pelos olhos em arco e pelos pés grandes.

**Poses.** Neutro: como acima. Comemorando: pula (pés fora do chão, sombra embaixo), olhos abrem em círculos, asas para cima, pompom no ar. Alerta: olhos abertos e redondos, corpo inclina para a frente, uma asa aponta; expressão de "achei", não de medo. Camping (desconforto: **frio**, é a `pose-camping`): gorro puxado até os olhos, asas coladas, contorno de penugem eriçado (ondas maiores), três traços de tremor; os olhos em arco ficam ainda mais fechados. Calor: gorro na asa, penugem murcha (ondas menores), olhos caídos, gota. Chuva: penugem encharcada vira contorno liso e pesado, gorro escorre, olhar de lado.

**Volume.** Frente: ovo. Lado: ovo mais fundo que largo, barriga saliente, bico minúsculo, pés para a frente; o gorro é uma calota. Três quartos: a máscara clara da face envolve a frente da cabeça, o pompom cai para o lado de cá. Ícone 48 px: o ovo com gorro, olhos em arco e pés; as ondas de penugem somem e o contorno vira liso (o ícone não tenta a textura). Uma cor: silhueta do ovo com gorro; face, barriga e olhos em recorte; o pompom precisa ter raio ≥ 34 para sobreviver.

**Paleta sugerida.** Cinza-ardósia `#4A5560` (penugem), creme `#FBF3E4` (face e barriga), vermelho-tijolo `#B9472F` (gorro), bico e pés `#E4A33A`.

**O que o distingue.** O único filhote felpudo e de olhos calmos em arco: o mais macio e o mais jovem das dez.

---

## 04 · Pictograma de trilha

**Ideia.** O pinguim desenhado como figura de sinalização de trilha: círculo, retângulo e linhas retas, mochila nas costas. Lê em qualquer tamanho e em qualquer país, como uma placa.

**Eixos.** Traço: geométrico (extremo), de pictograma. Idade: adulto. Proporção: braços e pernas definidos. Acabamento: chapado, sem linha. Camping: em acessório (mochila).

**Construção.**
- Silhueta: construída em grade de 32. Cabeça: círculo de raio 70. Pescoço: retângulo 50 × 24. Tronco: retângulo 180 × 220 com cantos de raio 40. Pernas: dois retângulos 34 × 70. Pés: dois retângulos 90 × 30 com cantos de raio 15, apontando para fora. Altura total 448. Proporção cabeça/corpo 1 para 3,2.
- Barriga: retângulo claro 100 × 180 com cantos de raio 30, centrado no tronco.
- Olhos: dois pontos de raio 12, afastados 50, na metade da altura da cabeça. Sem branco de olho.
- Bico: triângulo isósceles 44 × 32 apontando para baixo, colado sob os olhos. Sem boca.
- Asas: duas barras retas 36 × 170 com pontas arredondadas, saindo dos ombros; no neutro inclinadas 15° para fora.
- Pés: como acima; de perfil viram um retângulo único para a frente.
- Linha: nenhuma. Detalhe: mínimo. Todas as formas em ângulos de 0°, 45° e 90°; nada de curva livre.
- Acessório: mochila como retângulo 110 × 150 de cantos de raio 24 atrás do tronco, sobressaindo 50 de cada lado do ombro para ser visível de frente, com uma barra horizontal clara (a aba) de 110 × 24 no topo. Sem alças finas. `sem-acessorio`: o tronco sozinho; o personagem continua reconhecível pela construção de pictograma.

**Poses.** Neutro: parado, asas 15°. Comemorando: asas a 45° para cima, um pé a 30° fora do chão, olhos viram dois traços horizontais curtos (sorriso geométrico de olhos). Alerta: tronco inclina 10°, asa reta na horizontal apontando, olhos viram dois traços verticais (atenção). Camping (desconforto: **calor**, é a `pose-camping`): sol como semicírculo no canto, duas gotas em losango ao lado da cabeça, asas afastadas a 40°, pés abertos, olhos em traço horizontal caído; a mochila fica no chão ao lado (retângulo). Frio: asas cruzadas em X sobre o tronco, pernas juntas, três traços retos de tremor. Chuva: traços diagonais paralelos no fundo, asa sobre a cabeça como barra horizontal, mochila na frente do peito.

**Volume.** Frente: pictograma. Lado: cabeça esfera, tronco cilindro de cantos arredondados, bico pirâmide de 32 projetada, asa como placa fina, mochila como caixa nas costas, pés para a frente. Três quartos: as primitivas (esfera, cilindro, caixa) giram sem perder a identidade; o pictograma vira brinquedo de madeira. Ícone 48 px: figura inteira cabe porque não há detalhe fino; mochila sobressaindo dos ombros garante "campista"; pontos dos olhos crescem para raio 16. Uma cor: silhueta com barriga, olhos e aba da mochila em recorte.

**Paleta sugerida.** Preto-azulado `#15202B` (corpo), branco-neve `#FFFFFF` (barriga), laranja de sinalização `#E8601C` (mochila, bico, pés).

**O que o distingue.** O único construído como placa de trilha: primitivas geométricas, zero curva livre, mochila como caixa.

---

## 05 · Topete de chama

**Ideia.** Um pinguim jovem, baixo e largo, com o topete de penas em forma de chama: a fogueira do acampamento está na cabeça dele. Energia e atenção.

**Eixos.** Traço: orgânico. Idade: jovem (entre filhote e adulto). Proporção: compacto. Acabamento: com volume (vinil, luz de cima). Camping: no desenho (topete-chama).

**Construção.**
- Silhueta: pera invertida larga, 400 de largura na base por 380 de altura do corpo, mais o topete de 70 acima. Cabeça e corpo contínuos, a cabeça é a parte larga de cima (o oposto do pinguim comum): largura 340 no nível dos olhos, estreitando para 300 no quadril e abrindo de novo nos pés. Proporção cabeça/corpo 1 para 1,4.
- Topete: três línguas de pena, a do meio maior (70 de altura, base 90), as laterais menores (40), inclinadas para o mesmo lado, com pontas arredondadas (raio 10): a forma de uma chama. É uma parte do corpo (pena), nunca fogo de verdade; na versão colorida é da cor do corpo com a ponta em tom mais claro.
- Barriga: mancha clara em forma de coração invertido suavizado (topo com duas bossas sob os olhos, ponta entre os pés), 260 de largura.
- Olhos: círculos de raio 30 com pupila de raio 16, afastados 110, com uma sobrancelha de pena espessa (26 de altura) por cima de cada, inclinada para fora: o olhar atento que define a personalidade.
- Bico: curto e largo, 90 de largura, 40 de altura, bordas arredondadas, cor de bico, com linha divisória sutil (traço escuro de 6) que abre nas poses.
- Asas: curtas e largas, 90 × 140, em gota, afastadas 20° do corpo.
- Pés: ovais 110 × 44 bem abertos, dedos sugeridos por uma incisão.
- Linha: contorno uniforme de 10, escuro. Detalhe: médio; luz de cima (tom mais claro no topo da cabeça e das asas), sombra de um tom sob o bico e a barriga.
- Camping no desenho: o topete-chama e a postura de pés abertos. Sem acessório, sem `sem-acessorio`.

**Poses.** Neutro: parado, sobrancelhas levemente inclinadas, bico fechado. Comemorando: pula, asas abertas, bico aberto em meia-lua para cima, topete mais alto (línguas esticadas). Alerta: sobrancelhas sobem, pupilas pequenas, corpo inclina, asa aponta; topete inclina na direção do olhar. Camping (desconforto: **chuva**, é a `pose-camping`): topete murcho caído para um lado (a chama "apagada"), olhos semicerrados, gotas, asas abraçando o corpo; a sobrancelha fica reta. Frio: topete encolhido, bico roxeado só por tom, tremor, asas cruzadas. Calor: topete "ondula" (línguas mais separadas), bico aberto ofegante, gota, pálpebras baixas.

**Volume.** Frente: pera invertida com topete. Lado: cabeça larga vista de perfil é uma cúpula funda, topete inclinado para trás, bico curto projetado 50, barriga saliente embaixo. Três quartos: o topete tem espessura (penas sobrepostas), a sobrancelha é um relevo. Ícone 48 px: cabeça e topete ocupam dois terços, barriga e pés o resto; o topete precisa ter base ≥ 90 por língua para ler como chama. Uma cor: silhueta com topete, barriga, olhos e bico em recorte; a sobrancelha vira parte da silhueta do olho (olho com "teto").

**Paleta sugerida.** Azul-noite `#1E2A44` (corpo), branco-quente `#FFF4E0` (barriga), laranja-brasa `#E86A2A` (bico, pés, ponta do topete), sombra `#141B2E`.

**O que o distingue.** O único de cabeça mais larga que o corpo e com topete; a chama é parte do bicho.

---

## 06 · Saco de dormir

**Ideia.** O pinguim cuja plumagem escura envolve o rosto como o capuz de um saco de dormir múmia: um casulo em pé, de linha grossa, pronto para a noite fria. Camping na forma.

**Eixos.** Traço: geométrico arredondado, de linha grossa uniforme. Idade: adulto. Proporção: compacto, uma forma só. Acabamento: chapado com linha. Camping: no desenho (forma de capuz).

**Construção.**
- Silhueta: cápsula vertical 300 de largura por 448 de altura, com a base levemente mais larga (320) e o topo arredondado. É um saco de dormir em pé. Sem pescoço, sem cabeça destacada.
- Capuz: a parte escura do corpo tem um recorte claro oval no topo, 180 × 200, centrado a 150 do topo: é a face, e a borda escura ao redor é o capuz. Abaixo, a barriga clara é um retângulo de cantos arredondados 160 × 170, começando a 60 abaixo da face (a faixa escura entre face e barriga é o "zíper fechado" da plumagem).
- Olhos: ovais 40 × 50, próximos (afastados 36), pupilas grandes de raio 16 com brilho de 8; o olhar é de quem espia de dentro do capuz.
- Bico: pequeno e arredondado, 50 × 30, meio-círculo com a base para cima, logo abaixo dos olhos.
- Asas: no neutro, quase escondidas: duas pontas arredondadas de 60 × 90 que saem das laterais da cápsula a 260 do topo, como mãos saindo pela abertura do saco. Nas poses, saem por completo (asas de 160).
- Pés: dois ovais 100 × 40 saindo por baixo da cápsula, para fora.
- Linha: contorno uniforme de 16, escuro, em todas as formas, inclusive olhos e bico. Detalhe: baixo.
- Camping no desenho: a forma de saco de dormir com capuz. Sem acessório, sem `sem-acessorio`.

**Poses.** Neutro: cápsula ereta, asas nas aberturas, olhos no centro. Comemorando: asas saem por inteiro para o alto, pula, olhos fechados em arcos, bico aberto em meia-lua. Alerta: corpo inclina, uma asa sai apontando, olhos abertos com pupila pequena, a borda do capuz "aperta" (a face fica um pouco menor). Camping (desconforto: **frio**, é a `pose-camping`): a abertura da face fecha até sobrar só os olhos e o bico (oval 140 × 120), asas recolhidas, três traços de tremor, pés juntos; a cápsula fica mais estreita. Calor: a abertura da face alarga até o peito (face e barriga viram um recorte só), asas para fora e caídas, pálpebras baixas, gota. Chuva: capuz na posição normal, gotas escorrendo pela cápsula, asa sobre os olhos como aba, bico virado.

**Volume.** Frente: cápsula. Lado: cápsula mais funda que larga, com a barriga reta e o dorso arredondado; a face é uma cavidade rasa no capuz (a borda tem espessura de 24); bico projetado 30; pés para a frente. Três quartos: a borda do capuz dá uma sombra própria; é o que convence de 3D. Ícone 48 px: a cápsula com face, barriga, olhos e pés; o traço de 16 vira 1,5 px e por isso no ícone o contorno é engrossado para 28 ou substituído por contraste de fundo. Uma cor: silhueta da cápsula com face e barriga em recorte; dentro da face (recorte claro), olhos e bico voltam a ser tinta, como ilhas, o que funciona porque medem ≥ 40.

**Paleta sugerida.** Azul-petróleo `#153845` (corpo e contorno), gelo `#EAF4F7` (face e barriga), coral `#E2603C` (bico e pés).

**O que o distingue.** O único com a face dentro de um capuz de plumagem: um casulo, não um pássaro de pescoço.

---

## 07 · Veterano da caneca

**Ideia.** O adulto maduro, baixo e parrudo, de sobrancelhas pesadas e caneca esmaltada na asa: já viu chover em todo camping e conta com bom humor. Traço grosso e orgânico, chapado.

**Eixos.** Traço: orgânico, linha grossa de marcador. Idade: adulto maduro (extremo). Proporção: braços e pernas definidos, mas curtos. Acabamento: chapado com uma sombra. Camping: em acessório (caneca).

**Construção.**
- Silhueta: barril. Corpo 330 de largura por 300 de altura, cabeça achatada e larga 240 × 150 encaixada sem pescoço no topo, pernas curtas de 50 visíveis, pés largos 120 × 44. Altura 448. Proporção cabeça/corpo 1 para 2. Ombros caídos.
- Barriga: mancha clara em forma de escudo largo, 240 × 240, com o topo reto na linha do pescoço; borda com duas pequenas reentrâncias nas laterais (penas do peito).
- Olhos: semicerrados por sobrancelha de pena pesada e reta (barra 70 × 24 em cada olho); o olho em si é uma meia-lua de 50 × 24 com a pupila de raio 12 encostada na sobrancelha. Pequena bolsa sob o olho em linha curta (idade, não cansaço). Afastados 60.
- Bico: largo e grosso, 120 × 50, com a linha divisória bem marcada (traço de 10) e cantos arredondados; levemente curvado para baixo nos cantos, sem ser triste.
- Asas: curtas e grossas, 80 × 150, com ponta quadrada arredondada; a direita segura a caneca na frente da barriga; a esquerda cai.
- Pés: largos, com três dedos sugeridos por duas incisões, bem plantados.
- Linha: contorno orgânico grosso, de 14 a 22, com variação de marcador (mais grosso nas junções). Detalhe: médio; uma sombra chapada de um tom sob a cabeça e sob a barriga.
- Acessório: caneca esmaltada de camping, cilindro 110 × 100 com alça em "D" de 30 de espessura e uma borda escura de 10 no topo; sem estampa. `sem-acessorio`: a asa direita repousa na barriga, aberta.

**Poses.** Neutro: parado, caneca na barriga, sobrancelhas retas. Comemorando: caneca erguida como brinde, sobrancelhas sobem em arco, bico aberto em meia-lua, um pé fora do chão (pouco: ele é pesado). Alerta: sobrancelhas descem para o centro (franzido de atenção), asa livre aponta, corpo inclina 10°, bico fechado reto. Camping (desconforto: **chuva**, é a `pose-camping`): chuva em traços, ele parado com a caneca cheia de água até a borda, olhar de lado resignado, sobrancelhas retas, uma gota escorrendo da ponta do bico; asas junto ao corpo. Frio: caneca fumegante (duas linhas de vapor de 16 de espessura) segurada com as duas asas, ombros subidos, olhos fechados. Calor: bico entreaberto, caneca na testa como compressa, sobrancelhas arqueadas, pés abertos.

**Volume.** Frente: barril. Lado: barril fundo, cabeça achatada em cúpula baixa, bico grosso projetado 60, barriga bojuda, pernas curtas para a frente, caneca à frente do peito. Três quartos: a sobrancelha é um relevo que faz sombra no olho; a caneca mostra a alça. Ícone 48 px: cabeça, sobrancelhas, bico largo e o topo da caneca; enquadrar do peito para cima. Sobrancelha ≥ 24 de altura e bico ≥ 50 sobrevivem. Uma cor: silhueta do barril; barriga, olhos sob as sobrancelhas (as sobrancelhas ficam na tinta, os olhos em recorte), bico com a linha divisória em recorte; a caneca em silhueta com a alça fechada (o vão da alça ≥ 40).

**Paleta sugerida.** Marrom-café escuro `#2E2420` (corpo), palha `#F1E6D0` (barriga), verde-esmalte `#3E7D5A` (caneca), bico e pés `#D08A2E`.

**O que o distingue.** O único maduro: baixo, parrudo, de sobrancelhas pesadas; o perrengue já é piada velha para ele.

---

## 08 · Barriga de montanha

**Ideia.** Um pinguim jovem, compacto, de volume macio, cuja barriga clara tem o topo recortado em dois picos de montanha: o horizonte do acampamento está no peito dele. Serve de emblema e de boneco.

**Eixos.** Traço: geométrico (curvas de compasso). Idade: jovem. Proporção: compacto. Acabamento: com volume (boneco de vinil, luz suave). Camping: no desenho (barriga-montanha).

**Construção.**
- Silhueta: hexágono alongado de cantos muito arredondados (raio 80), 340 de largura por 420 de altura, mais pés. Cabeça integrada: o topo do hexágono é a cabeça; os olhos ficam a 130 do topo. Proporção cabeça/corpo 1 para 2,2. Altura 448 com pés.
- Barriga: mancha clara que vai da base até 200 do topo, com o topo recortado em dois picos (o esquerdo mais alto, ápice a 190 do topo; o direito a 230), ângulo de 60° em cada pico, vales arredondados (raio 20). Largura 240. É a assinatura.
- Olhos: dois pontos grandes de raio 22 (sem branco de olho na cor; na versão em uma cor, recortes), afastados 90, logo acima dos picos. Brilho de raio 8 deslocado para cima.
- Bico: triângulo equilátero de lado 56, ponta para baixo, cor de bico, entre os olhos e os picos.
- Asas: duas meias-luas 70 × 180 coladas às laterais, pontas para baixo.
- Pés: dois ovais 100 × 40 virados para fora.
- Linha: nenhuma. Detalhe: baixo; volume por luz de cima (tom mais claro no topo da cabeça, raio suave) e sombra de contato embaixo.
- Camping no desenho: os picos da barriga. Sem acessório, sem `sem-acessorio`.

**Poses.** Neutro: como acima. Comemorando: pula, asas para cima como dois "V", olhos em arcos; os picos da barriga não mudam. Alerta: corpo inclina 12°, asa aponta, olhos ficam ovais (apertados na horizontal) com a pupila pequena. Camping (desconforto: **frio**, é a `pose-camping`): corpo encolhido (hexágono mais estreito, 300), asas cruzadas sobre a barriga cobrindo um dos picos, olhos fechados em linha, tremor; uma nuvem de respiração fria (oval claro de 60) na frente do bico. Calor: asas afastadas, olhos caídos, gota, o topo da cabeça com um brilho maior (sol). Chuva: gotas, asa como aba, pés virados para dentro.

**Volume.** Frente: hexágono. Lado: corpo em forma de feijão em pé, barriga saliente, dorso curvo, bico projetado 40; os picos da barriga continuam de perfil (a borda da mancha clara sobe e desce no flanco). Três quartos: o pico de cá fica em evidência; a luz de cima mostra a curvatura. Ícone 48 px: hexágono, dois olhos, bico e a barriga de picos; picos com ângulo de 60° e altura ≥ 50 cada sobrevivem; asas e pés podem ser simplificados em dois tocos. Uma cor: silhueta com barriga de picos, olhos e bico em recorte; é o mais forte das dez em uma cor.

**Paleta sugerida.** Azul-profundo `#22364F` (corpo), neve `#FBFBF7` (barriga), amarelo-solar `#F0B429` (bico e pés), luz `#3B5478`.

**O que o distingue.** O único em que o camping está na barriga: dois picos recortados que se leem até em 48 px.

---

## 09 · Caminhante de botas

**Ideia.** O adulto atlético de passo largo e pés enormes em forma de sola de bota, desenhado em recortes de papel sem contorno. O camping está no andar dele.

**Eixos.** Traço: orgânico, de recorte (formas soltas, sem linha). Idade: adulto. Proporção: braços e pernas definidos. Acabamento: chapado (papel recortado, sem sombra). Camping: no desenho (postura de caminhada e pés-bota).

**Construção.**
- Silhueta: tronco em gota invertida alongada (ombros largos 220, quadril 150), 260 de altura; cabeça pequena 110 × 100 em cima de um pescoço de 40; pernas visíveis de 90; pés enormes 150 × 56, com a ponta quadrada e o calcanhar marcado (sola de bota, mas é o pé do bicho: cor de pé, não de couro). Altura 448. Proporção cabeça/corpo 1 para 4.
- Barriga: recorte claro em forma de pera, da base do pescoço ao meio das pernas, 130 de largura, com uma pequena fenda no topo (as formas de papel se sobrepõem com um desvio de 6, propositalmente).
- Olhos: dois círculos brancos de raio 22 com pupila deslocada (raio 12, para o lado do olhar), colados um no outro (afastamento zero): o olhar de "estou vendo o caminho".
- Bico: cunha longa e estreita, 90 de comprimento por 30 de base, apontando para a frente e levemente para cima (na vista de frente, aparece como losango estreito de 40 × 60).
- Asas: duas tiras em gota 60 × 190 com a ponta arredondada, soltas do corpo (um desvio de 8 entre a forma da asa e a do tronco, como papel sobreposto), balançando no sentido oposto ao das pernas.
- Pés: como acima; o passo é a pose padrão: um pé à frente, o outro atrás, levemente levantado.
- Linha: nenhuma. Detalhe: baixo; nada de sombra, textura ou brilho.
- Camping no desenho: o passo largo e os pés-bota. Sem acessório, sem `sem-acessorio`.

**Poses.** Neutro: andando (passo médio), asas balançando, cabeça erguida. Comemorando: salto com as duas pernas dobradas, asas para cima, olhos fechados em meias-luas brancas, bico aberto em cunha dupla. Alerta: para em pé, pés juntos, asa estendida apontando, pupilas no centro, corpo um pouco à frente. Camping (desconforto: **calor**, é a `pose-camping`): passo arrastado (pés quase sem levantar), ombros caídos, asas pendendo, bico aberto, duas gotas, pupilas para cima; sol como semicírculo no canto. Frio: pés juntos batendo (um pé levantado, traços de tremor), asas cruzadas, pescoço encolhido (cabeça desce 20). Chuva: anda inclinado contra a chuva, asa sobre a cabeça, traços diagonais, passo mais curto.

**Volume.** Frente: tronco gota, pernas, pés para fora. Lado: a melhor vista dele: bico em cunha apontando para a frente, tronco inclinado 8° no passo, pé da frente no ar com a sola visível (a ponta quadrada vira uma caixa baixa), asa para trás. Três quartos: a sobreposição de papel vira camadas com espessura mínima; o pescoço dá articulação. Ícone 48 px: enquadrar da cintura para cima não funciona (os pés são a identidade), então o ícone usa a figura inteira em passo com os pés-bota exagerados (180 × 64) e a cabeça maior (130): uma versão própria, não a figura reduzida. Uma cor: silhueta do passo com barriga, olhos e o recorte entre a asa e o corpo; os pés-bota são o que faz a silhueta única.

**Paleta sugerida.** Azul-marinho `#1C2B3A` (corpo), papel `#F4EEE2` (barriga), terracota `#C8613A` (bico e pés).

**O que o distingue.** O único que está sempre andando, de pés enormes de sola quadrada e formas de papel recortado sem contorno.

---

## 10 · Boneco de lanterna

**Ideia.** Um filhote construído como brinquedo articulado: esfera, cápsula, bracinhos e perninhas cilíndricos, e uma lanterna de camping na asa. Geométrico, com volume, o mais "boneco" dos dez.

**Eixos.** Traço: geométrico. Idade: filhote. Proporção: braços e pernas definidos (curtos). Acabamento: com volume (boneco de vinil, luz dura). Camping: em acessório (lanterna).

**Construção.**
- Silhueta: cabeça esférica de raio 110 sobre um corpo em cápsula 200 × 200 (a cabeça é maior que o corpo: proporção cabeça/corpo 1 para 0,9). Pernas: dois cilindros 44 × 50. Pés: duas cápsulas 90 × 36. Altura 448. Sem pescoço: a esfera encosta na cápsula.
- Barriga: círculo claro de raio 80 no centro da cápsula.
- Olhos: dois quadrados de cantos arredondados 46 × 46 (raio 14), escuros, com brilho quadrado de 12 no canto superior; afastados 60. Sem branco de olho.
- Bico: pequeno quadrado de 36 girado 45° (losango), cor de bico, abaixo dos olhos.
- Asas: dois cilindros 40 × 120 saindo da cápsula, articulados no ombro (ponta arredondada), um deles segurando a lanterna.
- Pés: cápsulas, virados para fora 15°.
- Linha: nenhuma. Detalhe: baixo a médio; volume por luz dura de cima à esquerda (um tom mais claro em meia-lua na esfera e na cápsula) e sombra de contato.
- Acessório: lanterna de camping de forma simples: cilindro 90 × 110 com tampa escura de 20 e alça em arco de 24 de espessura, corpo claro de "luz" (um tom de amarelo chapado, sem brilho radiante, sem raios). `sem-acessorio`: a asa cai; o personagem continua sendo o boneco de cabeça grande e olhos quadrados.

**Poses.** Neutro: parado, lanterna baixa ao lado do corpo. Comemorando: lanterna erguida, outra asa para cima, pula, olhos viram dois arcos quadrados (arco de cantos retos). Alerta: lanterna apontada para a frente, corpo inclina, olhos ficam retangulares estreitos (atenção), outra asa para trás. Camping (desconforto: **chuva**, é a `pose-camping`): noite (fundo não entra na arte: a chuva aparece em traços), lanterna erguida acima da cabeça com uma asa e a outra asa como aba, olhos semicerrados, gotas escorrendo pela esfera, pés virados para dentro. Frio: lanterna abraçada no peito como se aquecesse, olhos fechados em traço, tremor. Calor: lanterna no chão, asas afastadas, olhos caídos, gota, cabeça inclinada.

**Volume.** Frente: esfera sobre cápsula. Lado: esfera, cápsula com a barriga como calota saliente, bico em pirâmide pequena, asa-cilindro, lanterna ao lado; pés para a frente. Três quartos: o mais fácil de todos: são primitivas de 3D. Ícone 48 px: cabeça grande com olhos quadrados e bico, corpo pequeno e a lanterna ao lado (a lanterna precisa de ≥ 90 × 110 e alça ≥ 24; sem raios de luz). Uma cor: silhueta esfera-cápsula com barriga, olhos e bico em recorte; a lanterna em silhueta com o vão da alça (≥ 40) em recorte.

**Paleta sugerida.** Azul-ardósia `#2F3E55` (corpo), branco `#FFFFFF` (barriga), amarelo-lanterna `#F5C542` (luz), cinza-escuro `#2A2A2A` (tampa e alça), bico e pés `#E98A2E`.

**O que o distingue.** O único de cabeça maior que o corpo, com olhos quadrados e construção de brinquedo articulado.

---

## Matriz 10 × 5

| # | Opção | Traço | Idade | Proporção | Acabamento | Camping | Desconforto mostrado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Corpo de barraca | geométrico | adulto | compacto | chapado, sem linha | no desenho (forma) | chuva |
| 02 | Guia alto de lenço | orgânico (pincel) | adulto | definido, esguio | volume | acessório (lenço) | calor |
| 03 | Filhote de gorro | orgânico (penugem) | filhote | compacto | volume | acessório (gorro) | frio |
| 04 | Pictograma de trilha | geométrico (placa) | adulto | definido, reto | chapado, sem linha | acessório (mochila) | calor |
| 05 | Topete de chama | orgânico | jovem | compacto | volume | no desenho (topete) | chuva |
| 06 | Saco de dormir | geométrico arredondado | adulto | compacto | chapado, linha grossa | no desenho (capuz) | frio |
| 07 | Veterano da caneca | orgânico (marcador) | adulto maduro | definido, curto | chapado, uma sombra | acessório (caneca) | chuva |
| 08 | Barriga de montanha | geométrico (compasso) | jovem | compacto | volume | no desenho (barriga) | frio |
| 09 | Caminhante de botas | orgânico (recorte) | adulto | definido, longo | chapado, sem linha | no desenho (postura e pés) | calor |
| 10 | Boneco de lanterna | geométrico | filhote | definido, curto | volume | acessório (lanterna) | chuva |

**Cobertura.** Traço: 5 geométricos, 5 orgânicos, nenhum igual ao outro no tipo de linha (sem linha, pincel, penugem, placa, contorno uniforme, marcador, compasso, recorte). Idade: 2 filhotes (03, 10), 2 jovens (05, 08), 5 adultos, 1 maduro (07). Proporção: 5 compactos, 5 definidos (esguio, reto, curto, longo, curto de filhote). Acabamento: 5 chapados, 5 com volume. Camping: 5 no desenho, 5 em acessório (lenço, gorro, mochila, caneca, lanterna, todos diferentes). Desconforto: 4 chuva, 3 frio, 3 calor.

**Vizinhos mais próximos e por que não se confundem.**
- 01 e 06 (geométrico, adulto, compacto, chapado, no desenho): triângulo sem linha contra cápsula de linha grossa com face em capuz; silhuetas opostas (base larga contra base estreita).
- 02 e 07 (orgânico, adulto, definido, acessório): alto e esguio de pincel contra baixo e parrudo de marcador; lenço contra caneca; volume contra chapado.
- 03 e 05 (orgânico, compacto, volume): ovo felpudo de olhos em arco contra pera invertida de topete e sobrancelha; filhote contra jovem; acessório contra forma.
- 06 e 08 (geométrico, compacto, no desenho): cápsula com face em capuz contra hexágono com barriga de picos; linha contra sem linha; chapado contra volume.
- 04 e 10 (geométrico, definido, acessório): placa de trilha chapada e adulta contra boneco de vinil filhote de cabeça grande.
- 09 e 02 (orgânico, adulto, definido): papel recortado sem linha e sempre andando contra pincel e lenço.

Nenhum par coincide nos cinco eixos. As silhuetas em uma cor (triângulo, fuso alto, ovo, pictograma, pera invertida com topete, cápsula, barril, hexágono, passo com botas, esfera sobre cápsula) são distintas entre si sem cor nem acessório, como pede MSC-01.

## Riscos de semelhança já tratados nas fichas

Cada ficha foi desenhada contra a lista de `originalidade.md`. Pontos de atenção que o designer e o QA conferem: 01 não pode virar o emblema antigo da marca Pinguin (pinguim abstrato preto e branco sobre círculo azul): por isso é triângulo, sem círculo, de cor verde. 03 não usa capacete, óculos, bochecha rosa nem olhos gigantes (Pororo, Pudgy Penguins). 05 não tem cabelo espetado nem língua de fora (Badtz-Maru): o topete é uma chama macia de três línguas. 06 não é um pinguim sentado e gordo de bico amarelo (Tux): está em pé, de capuz, bico coral. 07 não segura taco nem veste camisa (mascotes de hóquei). 10 não leva lenço vermelho nem pisca (QQ). Nenhuma opção usa barriga em oval de emblema com pinguim de perfil (editora). Nenhuma tem bico cônico comprido de massa de modelar (Pingu).
