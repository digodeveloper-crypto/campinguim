# Modelo 3D do mascote 03 (MSC-10, MSC-11, MSC-12) · rodada 1 · REPROVADO (3 itens)

Data: 2026-11-24 · Entregue por: pane-588 · Alvo: `design/mascote/3d/` (`campinguim.glb`, `campinguim.blend`, `fonte/`, `LEIA-ME.md`, `PARTES.md`, `previas/`)

**Base:**
- MSC-10 a MSC-12 do PRD;
- os requisitos da missão do vídeo repassados pelo piloto: GLB único sem Draco, meshopt nem KTX2; nomes exatos de clipes e expressões; `extras.targetNames`; âncora `campinguim.ancora-rotulo`; gorro em malha e material próprios; só cor lisa;
- os tetos declarados: 30 mil triângulos, 5 MB, 12 malhas, 10 materiais, 60 ossos e 4 influências;
- o vetor aprovado em `final/vetor/claro/`.

**Decisão aplicada:** a variante C (face +24%, barriga +23% e olhos +12% de frente) foi escolhida pelo responsável em 24/11/2026. A fidelidade foi julgada com esse desvio já aceito.

**Resumo:**
- **O modelo é fiel ao desenho, e o desvio ficou exatamente no tamanho aceito.** Medi de frente no three.js: face 0,2062 m, ou seja +24,0% sobre os 0,1663 m do vetor; barriga 0,2500 m, ou seja +23,0%. Fora isso, o contorno, as cores e as alturas são as do vetor.
- **Os requisitos técnicos passam.** O arquivo lido byte a byte confirma tudo o que foi declarado.
- **O modelo é reprodutível.** Refiz do zero, numa pasta temporária, e o GLB saiu idêntico ao entregue.
- **Três pontos travam a aprovação:**
  1. um rasgo na aba do gorro na expressão de frio;
  2. as pontas dos traços dos olhos não são redondas como no desenho e têm um dente;
  3. no three.js, que é o que o vídeo usa, os nomes com ponto mudam, e o `PARTES.md` não avisa; seguido à letra, o código do vídeo não acha a âncora.

**Evidências** em `qa/relatorios/modelo3d-r1/`. Todas foram renderizadas pelo QA com o three.js 0.170 da pasta `videos/`, no Chrome, numa cópia temporária já apagada:
- `detalhes.png`: frio a 90°, 180° e 270°; neutro a 90°; olhos de perto no neutro, surpreso, calor e alegre; pés vistos de baixo;
- `pontas-e-aba.png`: ponta do traço do olho ampliada e aba do frio a 135°;
- `giro-threejs.png`: 10 ângulos, mais as vistas de cima e de baixo;
- `expressoes-threejs.png`: as 7 expressões a 0°, 45°, 90° e 180°;
- `clipes-threejs.png`: 8 quadros de cada clipe, com a expressão que combina.

## Itens que reprovam

| # | Item | Onde | O que fazer |
| --- | --- | --- | --- |
| 1 | **Aba do gorro rasgada no `frio`.** Quando a aba desce até os olhos, abre-se um vão com degrau na parte de trás, logo abaixo do pompom: a aba some num trecho, e aparece uma faixa mais funda e mais escura. Aparece a 90°, 135° e 180°, e já se vê no tamanho normal (`expressoes-threejs.png`, linha 3, 3ª e 4ª colunas). No `neutro`, a aba é contínua | `detalhes.png` (frio 90 e frio 180), `pontas-e-aba.png` (4º quadro) | Fechar a aba em volta toda no alvo `frio`, sem vão nem degrau, também nos quadros do `tremer-de-frio` |
| 2 | **Pontas dos traços dos olhos e das sobrancelhas.** No vetor, todo traço tem ponta redonda (`stroke-linecap="round"` em `principal.svg` e nas 7 expressões). No 3D, a ponta é um corte facetado, com um **dente** saliente na quina de baixo da ponta de dentro. Aparece no `neutro`, `alegre`, `alerta`, `preocupado`, `surpreso` e `frio`. Basta um plano com o rosto ocupando o quadro, comum no vídeo, para se ver | `detalhes.png` (neutro, surpreso e alegre de perto), `pontas-e-aba.png` (1º e 2º quadros) | Terminar cada traço com uma calota redonda inteira, sem dente, com resolução bastante para não facetar num plano fechado do rosto |
| 3 | **Nomes no three.js.** O `GLTFLoader` passa todo nome de nó por `PropertyBinding.sanitizeNodeName`, que **tira o ponto**. Assim, `campinguim.ancora-rotulo` vira `campinguimancora-rotulo`, `campinguim.ancora-mao` vira `campinguimancora-mao`, `campinguim.face` vira `campinguimface`, e o corpo vira o grupo `campinguimcorpo`, com `campinguimcorpo_1` e `campinguimcorpo_2`. Testado: `getObjectByName('campinguim.ancora-rotulo')` devolve `undefined`. O nome original fica em `userData.name`. No GLB os nomes estão certos, como pedido; o problema é que o `PARTES.md` mostra os nomes com ponto e um trecho de three.js, sem avisar | `PARTES.md` seções 1, 2 e 4 | Dizer no `PARTES.md` como achar cada nó no three.js, por `userData.name` ou pelo nome sem ponto, com um trecho de código, como já há para as expressões. Não renomear sem decisão do piloto: o nome com ponto é requisito da missão do vídeo |

## O que passou

| Item | Resultado | Como conferi |
| --- | --- | --- |
| GLB único | ok: 979.104 bytes, SHA-256 `2054a4ca…cb`, igual ao declarado; 1 buffer embutido; `extensionsUsed` e `extensionsRequired` ausentes (sem Draco, meshopt nem KTX2); 0 imagens, 0 texturas, 0 amostradores; sem cor por vértice | leitura do GLB por script próprio do QA |
| Números | ok: 21.520 triângulos, 10 malhas (o corpo tem 2 primitivas, penugem e sombra), 10 materiais, 9 ossos, até 2 influências com soma 1 | idem |
| Só cor lisa | ok: os 10 materiais PBR só com `baseColorFactor` (#FBF3E4, #E4A33A, #333C45, #4A5560, #3EA8AE), metálico 0, opacos, dois lados (declarado) | idem |
| Gorro próprio | ok: malha `campinguim.gorro` com material único `campinguim-gorro` #3EA8AE | idem |
| Expressões | ok: os 7 nomes exatos, na mesma ordem, em `extras.targetNames` das 6 malhas que mudam; no three.js aparecem em `morphTargetDictionary`. Cada uma lê como a do vetor de frente e a 45° | `expressoes-threejs.png` |
| Clipes | ok: os 7 nomes exatos; 60, 30, 60, 48, 48, 30 e 45 quadros a 30 fps, linear, com uma chave por quadro; tocam no three.js. Medi a malha deformada em todos os quadros: nada passa do chão (menor Y 0,0000); só o `comemorar` sai do chão, até 5,5 cm | `clipes-threejs.png`, medição por vértice |
| Âncoras | ok: `ancora-rotulo` é filha de `cabeca`, 2,96 cm acima do topo do gorro no repouso e 0,93 cm no `surpreso`. Nunca entra na malha: a menor folga sobre a malha logo abaixo dela é de 0,69 cm, no `olhar-para-cima` com `surpreso`. `ancora-mao` é filha de `nadadeira-direita`, na ponta | medição no three.js |
| Escala, origem, orientação | ok: altura 0,4000 m, chão em 0, +Y para cima, de frente para +Z, nós de topo sem transformação | caixa e nós |
| Reprodutível | ok: `construir.py -- C <pasta temporária>` no Blender 5.3.0 gerou o GLB com o mesmo SHA-256 do entregue | execução do QA |
| Arquivo-fonte | ok: `campinguim.blend` presente; os scripts em `fonte/` regeneram tudo | idem |
| Terceiros e segredos | ok: nada baixado no projeto; nenhum endereço nem segredo nos scripts e documentos | busca |

## Observações (não reprovam)

- **Altura de 0,40 m:** é proposta e ainda espera o responsável.
- **Três quartos:** a 45°, a nadadeira do lado de trás some atrás do corpo, enquanto o desenho a mostra como uma lasca. É consequência da nadadeira a 70° da variante C. A 30°, o render fica mais perto da arte.
- **`surpreso`:** a metade de baixo do bico tem um vinco escuro pequeno na ponta (`detalhes.png`). Se for mexer nas pontas do item 2, vale alisar junto.
- **Peças escondidas:** as pupilas, a boca, a metade de baixo do bico e as gotas ficam encolhidas a 1 ou 2% dentro da cabeça. Se o vídeo usar o efeito "por dentro", com o corpo ou a face translúcidos, elas viram pontinhos visíveis; nesse caso, esconda as malhas inteiras ou zere a opacidade delas. Vale uma linha no `PARTES.md`.
- **Pompom:** é um pouco menor e menos tufado que o do vetor (declarado, item 9).

## Para a rodada 2

O QA refaz os itens 1 a 3 e repete a leitura do GLB, a regeração, a medição nos clipes e as folhas de expressões. Se o GLB mudar, o SHA-256 novo precisa aparecer no `LEIA-ME.md`.
