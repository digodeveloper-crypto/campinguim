# Campinguim 3D · partes, ossos, expressões e clipes

Arquivo: `campinguim.glb` (ao lado deste). Mascote: opção 03, Filhote de gorro. Requisitos: MSC-10, MSC-11, MSC-12.

Eixos do GLB: **+Y para cima**, mascote **de frente para +Z**, unidade em **metros**, origem no chão, no meio entre os dois pés. Nenhum nó de topo tem translação, rotação ou escala.

## 1. Nós de topo

| Nó | O que é |
| --- | --- |
| `campinguim` | esqueleto (raiz dos ossos) |
| `campinguim.corpo`, `campinguim.face`, `campinguim.barriga`, `campinguim.olhos`, `campinguim.bico`, `campinguim.boca`, `campinguim.nadadeiras`, `campinguim.pes`, `campinguim.gorro`, `campinguim.gotas` | as 10 malhas, cada uma com pele (skin) no mesmo esqueleto |

## 2. Malhas

| Malha | Material (cor oficial) | Para que serve | Muda em quais expressões |
| --- | --- | --- | --- |
| `campinguim.corpo` | `campinguim-penugem` (#4A5560) e `campinguim-penugem-sombra` (#333C45) | o ovo felpudo: cabeça e corpo numa peça só, sem pescoço. As ondas da penugem ficam no contorno dos lados e das costas. A "sombra de um tom" do desenho é o fundo do ovo, abaixo de 4,4 cm do chão, no material de sombra | `frio` (penugem eriçada, ondas maiores), `calor` (penugem murcha, ondas menores) |
| `campinguim.face` | `campinguim-face` (#FBF3E4) | a máscara clara da face, lisa, presa à frente da cabeça. Variante C (decisão do responsável): envolve a cabeça 1,3× mais que o desenho de frente, para o três quartos mostrar os dois olhos e a face inteira | nenhuma |
| `campinguim.barriga` | `campinguim-barriga` (#FBF3E4) | a mancha clara da barriga, lisa | nenhuma |
| `campinguim.olhos` | `campinguim-olhos` (#333C45, fosco) | os dois traços dos olhos (arco, sobrancelha ou pálpebra, conforme a expressão) e as duas pupilas. As normais das pupilas apontam todas para a frente (+Z), iguais nos dois olhos e em toda expressão: as duas leem o mesmo tom com luz vinda de qualquer lado | `alegre`, `preocupado`, `alerta`, `frio`, `calor`, `surpreso` |
| `campinguim.bico` | `campinguim-bico` (#E4A33A) | o bico (metade de cima) e a metade de baixo, que só aparece aberta no `surpreso` | `preocupado` (bico menor), `surpreso` (bico aberto) |
| `campinguim.boca` | `campinguim-olhos` (#333C45, fosco) | a boca aberta escura, só no `surpreso` | `surpreso` |
| `campinguim.nadadeiras` | `campinguim-nadadeiras` (#333C45) | as duas nadadeiras (tocos arredondados) | nenhuma |
| `campinguim.pes` | `campinguim-pes` (#E4A33A) | os dois pés, ovais, virados para fora | nenhuma |
| `campinguim.gorro` | `campinguim-gorro` (#3EA8AE), **material próprio e único** | copa, aba dobrada e pompom do gorro de lã | `frio` (desce até os olhos), `calor` (vai para trás), `surpreso` (pula) |
| `campinguim.gotas` | `campinguim-gotas` (#3EA8AE) | as três gotas de calor, ao lado da cabeça | `calor` |

Materiais: 10, todos PBR com cor de base lisa, rugosidade e metálico 0. `campinguim-olhos` (pupilas, traços e boca) é fosco: rugosidade 1,0, para não refletir a luz nem o ambiente. Nenhuma imagem, nenhuma textura, nenhuma cor por vértice. O efeito "por dentro" pode trocar opacidade, emissivo e saturação por material.

Peças escondidas quando não estão em uso (pupilas no `neutro` e no `frio`, metade de baixo do bico, boca, gotas): ficam encolhidas a 1 ou 2% e, as do rosto, enterradas atrás da face. Não aparecem em nenhum ângulo. O alvo de forma as traz para o lugar.

## 3. Esqueleto (9 ossos)

Todos os ossos apontam para cima no repouso. No espaço local de cada osso: X = esquerda do personagem, Y = para cima, Z = para a frente.

| Osso | Pai | Onde fica | Pesa em |
| --- | --- | --- | --- |
| `raiz` | — | origem, no chão entre os pés | (pai de tudo) |
| `corpo` | `raiz` | 4,6 cm do chão, no eixo do corpo | corpo, barriga e a parte de baixo da face (pesos suaves por altura) |
| `cabeca` | `corpo` | 17,6 cm do chão | metade de cima do corpo, face, olhos, bico, boca e gotas. A passagem corpo/cabeça é suave entre 14 e 23 cm do chão (o desenho não tem pescoço) |
| `gorro` | `cabeca` | centro da aba | copa e aba |
| `pompom` | `gorro` | onde o pompom encosta na copa | pompom |
| `nadadeira-esquerda`, `nadadeira-direita` | `corpo` | topo de cada nadadeira (o "ombro") | cada nadadeira, rígida |
| `pe-esquerdo`, `pe-direito` | `raiz` | calcanhar de cada pé | cada pé, rígido |

Esquerda e direita são do personagem (a esquerda dele fica à direita de quem olha de frente). No máximo 2 influências por vértice.

## 4. Âncoras (nós vazios)

| Nó | Filho de | Onde |
| --- | --- | --- |
| `campinguim.ancora-rotulo` | osso `cabeca` | 3 cm acima do topo do gorro, no eixo do gorro. Acompanha a cabeça; fica acima do gorro também no `surpreso` |
| `campinguim.ancora-mao` | osso `nadadeira-direita` | na ponta da nadadeira que aponta (a direita do personagem, a que levanta no clipe `apontar`) |

## 5. Expressões (alvos de forma)

Nomes exatos, sem prefixo: `neutro`, `alegre`, `preocupado`, `alerta`, `frio`, `calor`, `surpreso`. A forma de base é o `neutro`.

**Regra:** toda malha que muda em alguma expressão tem os **mesmos 7 alvos, na mesma ordem** (corpo, olhos, bico, boca, gorro, gotas). Para ligar uma expressão inteira, dê peso ao alvo de mesmo nome **em todas as malhas que o têm**. As malhas que nunca mudam (face, barriga, nadadeiras, pés) não têm alvos. O alvo `neutro` existe só para o nome responder; ele não move nada (neutro = todos os pesos em 0).

Nada de expressão é feito por osso ou por nó: gorro, penugem e gotas também são alvos de forma. Os nomes saem em `extras.targetNames` de cada malha (conferido no GLB).

| Expressão | O que liga (referência: o SVG de mesmo nome em `final/vetor/claro/expressoes/`) |
| --- | --- |
| `neutro` | olhos em arco fechados, bico pequeno, gorro no lugar |
| `alegre` | olhos abertos (pupila redonda) com o arco por cima. Só o rosto: o pulo, as nadadeiras para cima e a sombra no chão do desenho são pose, e estão no clipe `comemorar` |
| `preocupado` | olhos abertos com sobrancelhas inclinadas (pontas de dentro levantadas); bico menor |
| `alerta` | olhos abertos com o arco por cima. Só o rosto: o corpo inclinado e a nadadeira apontando estão no clipe `apontar` |
| `frio` | olhos em arco ainda mais fechados; gorro puxado até os olhos (a aba desce 4,1 cm e abre para continuar abraçando a cabeça); penugem eriçada. Os traços de tremor do desenho são 2D: o tremor de verdade está no clipe `tremer-de-frio` |
| `calor` | pálpebras retas caídas com meia pupila embaixo; gorro empurrado para trás (inclina 9° e sobe 1,1 cm, mostrando a testa); penugem murcha; três gotas verde-azuladas |
| `surpreso` | olhos maiores com arcos altos; bico aberto (metade de cima e de baixo) com a boca escura; o gorro pula 2 cm |

Use **uma expressão por vez**, ou misture com os pesos somando 1 (os alvos se somam; dois alvos inteiros juntos dobram o deslocamento).

Em three.js:

```js
// liga uma expressão em todas as malhas que a têm (peso de 0 a 1)
function expressao(raiz, nome, peso = 1) {
  raiz.traverse((o) => {
    if (!o.isMesh || !o.morphTargetDictionary) return;
    for (const [n, i] of Object.entries(o.morphTargetDictionary)) {
      o.morphTargetInfluences[i] = n === nome ? peso : 0;
    }
  });
}
```

## 6. Clipes

30 quadros por segundo. Cada clipe é uma animação própria no glTF, com o nome exato, um quadro-chave gravado em **cada** quadro (interpolação linear), sem física e sem nada aleatório. Os clipes só mexem em ossos: não mexem em alvos de forma, então combinam com qualquer expressão.

| Clipe | Quadros | Duração | Tipo | O que faz | Expressão que combina |
| --- | --- | --- | --- | --- | --- |
| `parado-respirando` | 60 (0 a 59) | 2,0 s | ciclo | corpo infla 1 a 2%, cabeça sobe um pouco, nadadeiras abrem, pompom balança | qualquer |
| `andar` | 30 (0 a 29) | 1,0 s | ciclo | gingado de pinguim: corpo balança de lado, um pé levanta enquanto o outro apoia, nadadeiras abertas. **Anda no lugar**: para deslocar, mova o nó raiz a **0,088 m/s** para a frente (+Z) | qualquer |
| `acenar` | 60 (0 a 59) | 2,0 s | pontual | levanta a nadadeira esquerda, acena três vezes e baixa | `alegre` |
| `apontar` | 48 (0 a 47) | 1,6 s | pontual | inclina para a frente, vira a cabeça e aponta com a nadadeira direita (a da `ancora-mao`), segura e volta | `alerta` |
| `olhar-para-cima` | 48 (0 a 47) | 1,6 s | pontual | inclina a cabeça para trás, segura e volta | `surpreso` ou `neutro` |
| `tremer-de-frio` | 30 (0 a 29) | 1,0 s | ciclo | encolhe, nadadeiras coladas ao corpo, pés juntos, treme 5 vezes por segundo | `frio` |
| `comemorar` | 45 (0 a 44) | 1,5 s | pontual | agacha, pula 5,5 cm com as nadadeiras para cima, cai, amortece e volta | `alegre` |

- **Ciclos** (`parado-respirando`, `andar`, `tremer-de-frio`): o último quadro emenda no primeiro **sem repetir a pose** (o quadro N seria igual ao 0 e não é gravado). Para tocar em laço amostrando quadro a quadro: quadro k → `mixer.setTime((k % N) / 30)`. Se usar `LoopRepeat` com `mixer.update`, defina `clip.duration = N / 30` antes (o glTF guarda o último tempo como (N − 1)/30).
- **Pontuais** (`acenar`, `apontar`, `olhar-para-cima`, `comemorar`): o primeiro e o último quadro são **exatamente** a pose do quadro 0 de `parado-respirando` (o repouso), para emendar sem salto.
- Amostrar um quadro exato: `AnimationClip.findByName(gltf.animations, 'andar')`, uma ação só tocando, `mixer.setTime(N / 30)`.

## 7. Medidas (repouso, neutro)

| Medida | Valor |
| --- | --- |
| Altura (chão ao topo do gorro) | **0,400 m — aprovada pelo responsável em 24/11/2026** |
| Largura (com as nadadeiras) | 0,388 m |
| Profundidade (ponta do bico às costas) | 0,368 m |
| Origem | chão, no meio entre os centros dos dois pés (as solas tocam o chão pela ponta, 9 mm à frente da origem) |

## 8. Como achar as peças no three.js

O `GLTFLoader` passa o nome de todo **nó** por `THREE.PropertyBinding.sanitizeNodeName`, que **tira o ponto** (e os caracteres `[ ] . : /`). Então `getObjectByName('campinguim.ancora-rotulo')` devolve `undefined`. O nome original fica guardado em `userData.name`. No GLB os nomes continuam com ponto, como pede a missão do vídeo.

| No GLB (`userData.name`) | No three.js (`object.name`) |
| --- | --- |
| `campinguim.ancora-rotulo` | `campinguimancora-rotulo` |
| `campinguim.ancora-mao` | `campinguimancora-mao` |
| `campinguim.face` (e as outras malhas de uma primitiva) | `campinguimface` |
| `campinguim.corpo` (duas primitivas: penugem e sombra) | um grupo `campinguimcorpo` com duas malhas filhas, `campinguimcorpo_1` e `campinguimcorpo_2` |
| ossos (`cabeca`, `nadadeira-direita`...) e o esqueleto `campinguim` | iguais (não têm ponto) |

Não mudam: os nomes dos **clipes** (`gltf.animations`), dos **alvos de forma** (`morphTargetDictionary`) e dos **materiais** (`material.name`, por exemplo `campinguim-gorro`).

```js
// acha um nó pelo nome que está no GLB (com ponto)
function peca(raiz, nome) {
  let achado;
  raiz.traverse((o) => {
    if (!achado && (o.userData.name === nome || o.name === nome)) achado = o;
  });
  return achado;
}

const ancora = peca(gltf.scene, 'campinguim.ancora-rotulo');
// ou, sem percorrer a cena:
// gltf.scene.getObjectByName(THREE.PropertyBinding.sanitizeNodeName('campinguim.ancora-rotulo'))

// posição da âncora no mundo, a cada quadro, para pôr o rótulo em HTML
const p = new THREE.Vector3();
ancora.getWorldPosition(p);

// todas as malhas de uma peça (o corpo é um grupo com duas malhas)
const malhasDe = (nome) => {
  const out = [];
  peca(gltf.scene, nome)?.traverse((o) => o.isMesh && out.push(o));
  return out;
};
malhasDe('campinguim.gorro').forEach((m) => { m.material.transparent = true; m.material.opacity = 0.3; });

// o material do gorro, pelo nome (material não perde o ponto nem o hífen)
let gorro;
gltf.scene.traverse((o) => { if (o.isMesh && o.material.name === 'campinguim-gorro') gorro = o.material; });
```

**Peças escondidas e o efeito "por dentro".** Pupilas (no `neutro` e no `frio`), a metade de baixo do bico, a boca e as gotas ficam encolhidas a 1 ou 2% e enterradas atrás da face quando não estão em uso. Se o vídeo deixar o corpo ou a face translúcidos, elas viram pontinhos visíveis dentro da cabeça. Nesse caso, esconda essas malhas (`campinguim.olhos`, `campinguim.bico`, `campinguim.boca`, `campinguim.gotas`) com `visible = false`, ou zere a opacidade delas, enquanto a transparência durar.
