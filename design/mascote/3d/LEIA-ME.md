# Campinguim 3D · modelo do mascote · MSC-10, MSC-11, MSC-12

Modelo 3D do mascote escolhido pelo responsável: **opção 03, Filhote de gorro** (`design/mascote/ESCOLHA.md`). A única referência de forma é o desenho aprovado em `design/mascote/final/vetor/claro/` (vistas, principal, sem acessório, poses e as 7 expressões).

- **Data:** 24/11/2026.
- **Entregas:** `campinguim.glb` (o que o vídeo e o app usam), `campinguim.blend` (arquivo-fonte), scripts em `fonte/`, `PARTES.md` (nós, ossos, expressões, clipes, âncoras e como acionar), `previas/`.
- **Variante da máscara: C (meio-termo)**, escolhida pelo responsável em 24/11/2026. **Desvio aceito:** de frente, face +24%, barriga +23% e olhos +12% contra o vetor (seção 5.1).
- **Altura: 0,40 m, aprovada pelo responsável em 24/11/2026** (seção 3).

## 1. Como regerar

Blender 5.3.0, sem janela. Os scripts leem o vetor aprovado direto dos SVG (medem os contornos) e constroem tudo por cálculo. Nada aleatório: regerar dá o mesmo arquivo, byte a byte.

```
cd design\mascote\3d\fonte
"C:\Program Files\Blender Foundation\Blender 5.3\blender.exe" -b --factory-startup -P construir.py
```

Gera `../campinguim.blend` e `../campinguim.glb` na variante C, a oficial. Só para refazer o registro da escolha: `-- A <pasta>` ou `-- B <pasta>` gera outra variante numa pasta à parte (seção 5.1).

| Script | Roda com | Faz |
| --- | --- | --- |
| `fonte/svgpoly.py` | (módulo) | lê os caminhos SVG do vetor e mede contornos |
| `fonte/construir.py` | Blender | malhas, materiais, esqueleto, pesos, 7 alvos, 7 clipes, âncoras; salva o `.blend` e exporta o GLB |
| `fonte/previas.py` | Blender: `blender -b ../campinguim.blend -P previas.py -- <pasta temporária> tudo` | renderiza as prévias (luz feita em código: céu uniforme + sol; nenhum HDRI) |
| `fonte/folhas.py` | Python com Pillow: `python -I -B folhas.py <pasta dos renders> ../previas` | monta as folhas de `previas/` |
| `fonte/conferir.py` | Blender: `blender -b --factory-startup -P conferir.py -- ../campinguim.glb` | reabre o GLB num Blender limpo e lista tudo |
| `fonte/conferir_glb.py` | Python puro: `python -I -B conferir_glb.py ../campinguim.glb` | lê o GLB byte a byte: extensões, malhas, cores, nós de topo, influências, caixa, clipes, emendas |

Os renders ficam numa pasta temporária fora do projeto; só as folhas entram em `previas/`.

## 2. Orientação, escala e origem

- Unidade: metro (1 unidade = 1 m). Escala do desenho para o 3D: 0,40 m / 433 unidades da prancha (do chão em 480 ao topo do gorro em 47).
- GLB: **+Y para cima**, mascote **de frente para +Z** (no Blender: Z para cima, de frente para −Y; o exportador converte).
- Origem: no chão (Y = 0 é o ponto mais baixo), no meio entre os centros dos dois pés. As solas encostam no chão pela ponta, 9 mm à frente da origem.
- Nós de topo sem translação, rotação nem escala. Transformações aplicadas.

## 3. Altura: 0,40 m (aprovada pelo responsável em 24/11/2026)

O responsável não tinha a medida e só disse que não imaginava o mascote grande. Propus **0,40 m do chão ao topo do gorro**, e a altura foi **aprovada pelo responsável em 24/11/2026** (sem o gorro, o topo da cabeça fica a 0,39 m; largura com as nadadeiras 0,39 m):

- É a altura de uma caixa térmica média e fica abaixo do joelho de um adulto: lê como pequeno e "de colo", como um filhote.
- Ao lado de uma barraca de 1,2 a 1,3 m ou de um carro, ainda aparece no plano aberto sem sumir. Menor que isso (0,25 a 0,30 m) ele vira um ponto nesses planos.
- Trocar a altura é um número em `construir.py` (`ALTURA_M`); tudo (ossos, clipes, âncoras) acompanha.

## 4. Números e tetos

Teto definido para rodar bem em navegador e no render do vídeo: **25.000 triângulos e 1,5 MB**. Os limites do vídeo (até 30 mil triângulos, 5 MB, 12 malhas, 10 materiais, 60 ossos, 4 influências) também são cumpridos.

| Item | Valor | Teto |
| --- | --- | --- |
| Triângulos | **23.056** | 25.000 |
| Tamanho do GLB | **1.080.632 bytes (1,03 MB)** | 1,5 MB |
| Malhas | 10 | 12 |
| Materiais | 10 | 10 |
| Ossos | 9 | 60 |
| Influências por vértice | até 2 | 4 |
| `.blend` (comprimido) | 690.054 bytes | — |

GLB binário único, **sem Draco, sem meshopt, sem KTX2/Basis, sem textura, sem imagem** (`extensionsUsed` vazio). Sem quantização.

Por malha (triângulos): corpo 9.216; gorro 4.160; olhos 2.440; face 1.472; barriga 1.472; nadadeiras 1.280; gotas 1.152; pés 1.040; bico 624; boca 200.

## 5. Decisões e desvios do desenho, declarados

### 5.1 Máscara da face e da barriga: variante C, decisão do responsável

Medido no vetor: de frente, a máscara da face é um círculo de raio 90 e os olhos ficam a 35 do centro; de lado, a máscara vai 146 para trás da ponta do rosto e o olho fica uns 68 para trás. Numa cabeça redonda de meia-largura ~150, as duas coisas não cabem juntas (é a trapaça normal do desenho 2D). O mesmo vale para a barriga e para a nadadeira (de frente ela está na frente-lateral; de lado, atrás do meio do corpo). O caso foi levado ao piloto, que pediu três variantes para o responsável escolher vendo. **Decisão do responsável em 24/11/2026: variante C, para o três quartos mostrar os dois olhos e a face inteira.**

| Variante | Fatores (máscara / olhos e bico / nadadeira) | Frente contra o vetor (face 180, barriga 220, olhos 70) | Lado e três quartos |
| --- | --- | --- | --- |
| A, frente exata (não escolhida) | 1,0 / 1,0 / 60° | face +0,4%, barriga +1%, olhos +2% | a face vira uma lasca e o olho encosta no contorno |
| B, máscara envolvente (não escolhida) | 2,2 / 1,45 / 85° | face +68%, barriga +57%, olhos +45% | como o desenho de lado |
| **C, meio-termo (OFICIAL)** | 1,3 / 1,1 / 70° | **face +24%, barriga +23%, olhos +12%** | o três quartos mostra os dois olhos e a face inteira |

Como a C funciona: o desenho do rosto e da barriga, que no vetor é visto de frente, é colado na cabeça com o ângulo em volta do eixo multiplicado por 1,3 (máscara e barriga) e por 1,1 (olhos, bico e boca); a nadadeira vai de 60° para 70° em volta do corpo. Formas, traços, espessuras, cores e alturas continuam os do vetor; só a largura de frente cresce nos números acima.

**O que isso muda para o QA:** a fidelidade do 3D ao vetor é julgada **já com este desvio aceito**. O que sair além dele (outra forma, outra cor, outra altura, traço novo) é reprovável. **O 2D fica como está** (vetor, ícone, expressões): de frente, o 3D tem a face e a barriga mais largas que o 2D na proporção acima.

`previas/variantes/` fica como registro da escolha (A e B não são mais opção). A, B e C saem do mesmo script (`VARIANTE` em `construir.py`, padrão `C`).

### 5.2 Outros desvios e decisões

1. **Penugem.** As ondas do contorno (12 a 16 por volta no desenho) estão na silhueta dos lados e das costas, medidas do próprio contorno do vetor. Na frente, onde ficam face e barriga, a pele é lisa, como no desenho de lado. A luz usa normais da forma lisa, para as ondas aparecerem no contorno e não como listras no meio do corpo.
2. **Sombra de um tom do fundo do ovo.** No desenho é uma meia-lua escura no contorno de baixo. No 3D é o fundo do ovo (abaixo de 4,4 cm do chão) em ardósia-escura; a luz de cima faz o resto. Não depende do ângulo.
3. **Frio.** Os traços de tremor do desenho são marcas 2D e não viraram objeto: o tremor está no clipe `tremer-de-frio`, que também cola as nadadeiras, junta os pés e encolhe o corpo. A aba, ao descer até os olhos, abre o necessário para abraçar a cabeça com a penugem eriçada, em volta toda: o raio da aba é medido, ângulo a ângulo, na pele do `frio` em toda a altura que a aba cobre, e a copa não passa por fora dela. De frente fica 2,5 cm mais larga de cada lado que a aba desenhada (meia-largura 177 contra 150 unidades; no desenho ela é mais estreita que a cabeça naquela altura, o que não se sustenta em volume).
4. **Calor.** No desenho o gorro "sobe e encurta a 80%", como visto de frente com ele inclinado para trás. No 3D ele inclina 9° para trás e sobe 1,1 cm: a testa aparece e a aba, de frente, vira um arco suave em vez de uma faixa reta.
5. **Alegre e alerta** são só rosto. O pulo, as nadadeiras para cima e a sombra no chão do `alegre` estão no clipe `comemorar`; o corpo inclinado e a nadadeira que aponta do `alerta` estão no clipe `apontar`.
6. **Três quartos.** Renderizado a 45°, como diz o desenho. Na arte de três quartos a face está menos virada (lê como uns 30°); com a variante C, o render mostra os dois olhos e a face inteira, mas a face ainda fica mais perto do contorno que na arte.
7. **Bico.** O triângulo do desenho vira uma pirâmide pequena de cantos arredondados que sai 1,8 cm da face, com a ponta na altura da vista de lado. De frente, o contorno é o triângulo do desenho (no mesmo lugar; a variante C só o abre 1,1× na largura, junto com os olhos).
8. **Pés.** Os ovais 100 × 40 do desenho são elipsoides de 10 × 5 × 4 cm, virados 55° para fora e com a ponta 14° para baixo, sola achatada no chão.
9. **Pompom.** Esfera com 18 tufos regulares. Fica a 106 / 102 unidades do eixo do gorro (no desenho, 108 / 108) para encostar na copa; em qualquer expressão ele é puxado para continuar encostado.
10. **Peças escondidas** (pupilas no neutro e no frio, metade de baixo do bico, boca, gotas): encolhidas a 1 ou 2% e escondidas atrás da face. Não são visíveis; o alvo as traz para o lugar.
11. **Normais dos alvos não exportadas.** Os alvos de forma levam só posição. O corpo usa normais suaves próprias, e exportar as normais dos alvos estragaria essa suavidade. Efeito: no `calor`, a luz do gorro inclinado fica como se ele não tivesse inclinado (diferença de 9°, pouco visível).
12. **Materiais de dois lados** (padrão do Blender): face e barriga são superfícies abertas presas à pele.
13. **Nada inventado:** sem dentes, sem bochecha, sem brilho de olho, sem sobrancelha fora das expressões que a têm. O gorro é sempre verde-azulado `#3EA8AE`.

## 6. Conferências (saídas guardadas na pasta temporária, já apagada)

- **Reaberto num Blender limpo** (`conferir.py`, rodada 2): 23.056 triângulos, 10 malhas com os nomes `campinguim.*`, 10 materiais, 9 ossos, 7 alvos em corpo, olhos, bico, boca, gorro e gotas, as 2 âncoras filhas dos ossos `cabeca` e `nadadeira-direita`, 7 clipes com 60, 30, 60, 48, 48, 30 e 45 quadros. Altura 0,4000 m, chão em 0,00000, meio dos pés em (0,0000; 0,0000), ponta do bico para a frente, escala 1 em tudo.
- **Validação** (`npx @gltf-transform/cli validate`, numa pasta temporária fora do projeto): **0 erros, 0 avisos**; 2 notas "nó vazio" (as duas âncoras, de propósito).
- **Inspeção** (`npx @gltf-transform/cli inspect`): sem extensões, sem texturas, 10 materiais opacos, 7 animações com 27 canais cada.
- **Leitura do GLB** (`conferir_glb.py`): cores dos materiais iguais à paleta oficial (#4A5560, #333C45, #FBF3E4, #E4A33A, #3EA8AE); `extras.targetNames` com os 7 nomes em cada malha que muda; nós de topo sem transformação; no máximo 2 influências.
- **Emendas dos clipes** (`conferir_glb.py`): nos 3 ciclos, a passagem do último quadro para o primeiro não é maior que o maior passo normal do clipe e não repete a pose; nos 4 pontuais, o primeiro e o último quadro ficam a 0,00000000 da pose do quadro 0 de `parado-respirando`. Folha visual: `previas/clipes/emendas.png`.
- **Regerar do zero:** quatro execuções de `construir.py` em pastas diferentes deram o mesmo GLB (SHA-256 `a51fb8af333b4658e43691eda5000944dcb39945d9dc8db4c4ad3ec090ec4597` nas quatro e no entregue, correção das pupilas de 24/11/2026; o anterior, aprovado na rodada 2, era `dd9a7820…1a2a`). Para isso, a ordem das faces das esferas criadas pelo Blender é posta em ordem fixa (o Blender 5.3 a entrega diferente a cada execução).
- **Lado a lado com o vetor:** `previas/comparar-frente.png`, `comparar-lado.png`, `comparar-tres-quartos.png` (vetor | 3D com luz | 3D chapado com o contorno do vetor em vermelho | os dois a 50%). De frente, o contorno do corpo, do gorro, dos pés e das nadadeiras coincide com o do vetor; face e barriga ficam mais largas na medida do desvio aceito (seção 5.1).

### 6.1 Rodada 2 do QA (relatório `qa/relatorios/modelo3d-rodada-1.md`)

| Item | O que mudou |
| --- | --- |
| 1. Aba rasgada no `frio` | A copa esticada era empurrada pela penugem eriçada para fora da aba atrás, embaixo do pompom. Agora a aba do `frio` é medida na pele eriçada, ângulo a ângulo, em toda a altura que ela cobre, e a copa fica sempre por dentro dela na faixa da aba. O expoente do canto caído da copa passou a variar suave (antes trocava de uma vez no meridiano de trás e fazia quina). Conferido no `frio` a 90°, 135°, 180° e 225° e no `tremer-de-frio` |
| 2. Pontas dos traços | Cada traço (arco, sobrancelha, pálpebra) termina em calota redonda inteira: o contorno da ponta é um semicírculo de raio 7 (o `stroke-linecap round` do vetor) e a altura cai em domo até a borda, sem quina nem dente. Resolução subiu (28 amostras no traço, 8 em cada calota, 11 na largura); pupilas com 40 lados e boca com 40, para não facetar em plano fechado |
| Observação: vinco do bico de baixo no `surpreso` | A ponta do bico de baixo foi para o centro do triângulo (sem vinco) e a base de todo bico fica 1 unidade acima da face já no primeiro anel |
| 3. Nomes no three.js | `PARTES.md` seção 8: como achar nós, malhas e âncoras no three.js (o `GLTFLoader` tira o ponto dos nomes), com código. Nomes no GLB mantidos com ponto |
| Observação: peças escondidas | `PARTES.md` seção 8: o que fazer se o vídeo deixar corpo ou face translúcidos |

### 6.2 Correção das pupilas (MSC-10, 24/11/2026, achada pelo QA no vídeo VID-01)

**Defeito:** sob luz lateral, uma pupila saía cinza-média e a outra quase preta. Causa: as pupilas são discos colados na face e acompanham a curva da cabeça, então cada uma ficava virada um pouco para o seu lado (normal ±0,2 em X); o material `campinguim-olhos` tinha rugosidade 0,55 e refletia. A pupila virada para a luz clareava.

**O que mudou na fonte (`construir.py`), e só isto:**

1. As normais das duas pupilas apontam todas para a frente (+Z no glTF), iguais nos dois olhos (função `pupilas_para_frente`). O disco continua no mesmo lugar e com a mesma forma; só a luz passa a lê-lo como a cor chapada do desenho. Como o GLB não leva normal nos alvos de forma (`export_morph_normal` desligado), a normal do repouso vale em todas as expressões: as pupilas de `alegre`, `preocupado`, `alerta`, `calor` e `surpreso` ficam todas para a frente.
2. O material `campinguim-olhos` passou a fosco: rugosidade 1,0 (era 0,55), metálico 0, cor `#333C45`. Ele serve às pupilas, aos traços (arcos, sobrancelhas, pálpebras) e à boca, então tudo o que é escuro no rosto fica igualmente fosco. Os traços mantêm as normais do relevo.

**O que não mudou:** comparando o GLB novo com o aprovado, campo a campo, as únicas diferenças são as 402 normais das pupilas na malha `campinguim.olhos` e a rugosidade de `campinguim-olhos`. Posições, índices, pesos, alvos de forma, nós, esqueleto, matrizes de ligação e as 7 animações são idênticos byte a byte. `conferir.py` dá a mesma saída do modelo aprovado.

**Teste:** o GLB reaberto num Blender limpo, com luz forte (sol) vinda da esquerda, da direita e de frente, e com luz de estúdio (céu claro e três painéis grandes, imitando o `RoomEnvironment`), nas 7 expressões. Os olhos são mostrados como o three.js mostra o GLB: o alvo move a posição e a normal é a do repouso. A cor média de cada pupila é medida no render e as duas são comparadas pela diferença de cor (ΔE CIELAB 1976; abaixo de 1 é imperceptível):

| | antes (rugosidade 0,55, normais para os lados) | depois |
| --- | --- | --- |
| luz forte da esquerda | ΔE 14,8 (80,86,92 contra 47,52,58) | **ΔE 0,00 a 0,09** |
| luz forte da direita | ΔE 14,8 | **ΔE 0,00 a 0,09** |
| luz forte de frente | ΔE 0,00 a 0,08 | **ΔE 0,00 a 0,04** |
| luz de estúdio | ΔE 4,3 a 4,6 | **ΔE 0,08 a 0,14** |

Folha: `previas/olhos-luz-lateral.png` (as 7 expressões × 4 luzes, com os números de cada pupila). Nota para quem abrir o `.blend`: o Blender guarda a normal personalizada relativa à superfície e a gira junto quando o alvo move a pupila; por isso as prévias das expressões são feitas como o GLB funciona (`previas.py` congela os olhos com a normal do repouso). Sem isso, dentro do Blender sobra uma diferença de até ΔE 2 sob luz lateral, que no GLB não existe.

## 7. Prévias (`previas/`)

| Arquivo | O que mostra |
| --- | --- |
| `giro.png` | frente, três quartos, lado e costas, no neutro |
| `comparar-frente.png`, `comparar-lado.png`, `comparar-tres-quartos.png` | o render contra o vetor aprovado, na mesma prancha |
| `expressoes.png` e `expressoes/<nome>.png` | as 7 expressões, com o vetor ao lado e o três quartos |
| `clipes/<nome>.png` | 8 quadros de cada clipe |
| `clipes/emendas.png` | primeiro e último quadro de cada clipe |
| `olhos-luz-lateral.png` | as pupilas sob luz forte da esquerda, da direita, de frente e de estúdio, nas 7 expressões, com a cor medida de cada uma (seção 6.2) |
| `variantes/` | registro da escolha: as variantes A, B e C da máscara (seção 5.1), feitas antes da correção das pupilas e só no neutro (sem pupila à mostra); a oficial é a C |

## 8. Materiais de terceiros

Nenhum. Nenhum modelo, textura, HDRI, esqueleto, animação ou complemento baixado. As ferramentas de conferência (`@gltf-transform/cli`) rodaram por `npx` numa pasta temporária fora do projeto, sem instalar nada no projeto.
