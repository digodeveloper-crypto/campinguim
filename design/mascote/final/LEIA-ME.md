# Campinguim · mascote final · MSC-08

Pacote final em vetor do mascote escolhido pelo responsável: **opção 03, Filhote de gorro** (registro em `design/mascote/ESCOLHA.md`, MSC-07).

- **Data:** 24/11/2026.
- **Requisitos:** MSC-08 (vetor, versões clara e escura, versão em uma cor, poses, ícone nos tamanhos das lojas). Também entrega a referência 2D das 7 expressões do MSC-11 e a paleta oficial do MSC-13. O guia de uso completo (proporções, tamanhos mínimos, o que o mascote nunca faz) não faz parte desta tarefa.
- **Regra seguida:** o desenho aprovado não foi redesenhado. As 11 artes aprovadas foram copiadas byte a byte. Tudo o que é novo deriva delas, na mesma construção.
- **Conferência visual:** abra `index.html` com dois cliques. A página mostra cada arte sobre fundo claro e sobre fundo escuro, com o ícone em 48 px ao lado do grande. Não usa nada da internet.

## 1. O que foi copiado sem mudança

Origem: `design/mascote/apresentacao/opcoes/03/arte/`, aprovada pelo QA nos relatórios `03-rodada-2.md` (vetor) e `03-rodada-1.md` (desvios aceitos).

A igualdade foi conferida com `cmp` arquivo a arquivo (11 de 11 iguais) e com `sha256` (por exemplo, `principal.svg` = `247c31da…9773` nos dois lugares).

| Arquivo em `vetor/claro/` | O que é |
| --- | --- |
| `principal.svg` | frente, neutro, com o gorro |
| `vista-frente.svg`, `vista-lado.svg`, `vista-tres-quartos.svg` | as três vistas para o 3D |
| `pose-neutro.svg`, `pose-comemorando.svg`, `pose-alerta.svg`, `pose-camping.svg` | as quatro poses aprovadas; a de camping é a de frio |
| `icone.svg` | ícone da interface (arte própria para 48 px, fundo transparente) |
| `sem-acessorio.svg` | o filhote sem o gorro |
| `uma-cor.svg` | versão em uma cor, **positivo** (tinta `#111111`, recortes transparentes) |

Quatro das sete expressões também são cópias byte a byte das poses aprovadas:

| Expressão | Arquivo de origem |
| --- | --- |
| `expressoes/expressao-neutro.svg` | `pose-neutro.svg` |
| `expressoes/expressao-alegre.svg` | `pose-comemorando.svg` |
| `expressoes/expressao-alerta.svg` | `pose-alerta.svg` |
| `expressoes/expressao-frio.svg` | `pose-camping.svg` |

## 2. O que é novo

### 2.1 Três expressões NOVAS (nunca vistas pelo responsável nem pelo QA)

Cada uma é uma cópia do `principal` (ou do `sem-acessorio`) com só as partes indicadas mudadas. Corpo, face, barriga, pés, paleta, espessuras e vocabulário de olhos são os aprovados: olho aberto é pupila redonda com o arco por cima, como em `pose-alerta` e `pose-comemorando`.

| Arquivo | O que muda em relação ao aprovado |
| --- | --- |
| `vetor/claro/expressoes/expressao-preocupado.svg` | olhos abertos (pupila de raio 15); os arcos viram sobrancelhas inclinadas, com as pontas de dentro levantadas; bico um pouco menor. O corpo e o gorro ficam iguais ao `principal`. |
| `vetor/claro/expressoes/expressao-calor.svg` (refeita na rodada 2) | Parte do `principal`. **Gorro na cabeça, empurrado para trás:** é o mesmo gorro (copa, aba e pompom), que sobe 26 e encurta a 80% na altura, como visto de frente com ele inclinado para trás. A testa e a face inteira aparecem. **Penugem murcha:** o mesmo contorno do ovo, suavizado, com as ondas menores. **Olhos caídos:** pálpebra reta inclinada para fora, com meia pupila embaixo. **Três gotas** verde-azuladas fora do corpo, duas à esquerda e uma à direita. Nadadeiras e pés iguais ao `principal`. |
| `vetor/claro/expressoes/expressao-surpreso.svg` | olhos maiores (pupila de raio 19); arcos altos e mais curvos; bico aberto (metade de cima e metade de baixo, com a boca em ardósia-escura); o gorro "pula" 22 para cima com o susto. |

Desvios declarados nas novas:
- **Alegre** usa a pose comemorando. A neutra já tem os olhos em arco sorridentes, e a comemorando é a alegria aprovada, com olhos abertos.
- **Com calor: desvio da ficha.** A ficha diz "gorro na asa". Na rodada 1 o gorro na nadadeira não se lia: virava uma tira solta, que lembrava peixe (relatório `qa/relatorios/final-rodada-1.md`). Na rodada 2 foi adotada a saída (b) do QA: o gorro fica na cabeça, empurrado para trás. O calor está no rosto e na postura (pálpebras caídas, gotas, penugem murcha), sem objeto fora do corpo. É mais útil como referência de expressão para o 3D e preserva a ideia da ficha (o filhote tira o gorro do lugar quando esquenta). Caixa medida: (42, 41, 448, 480) no claro e (42, 35, 456, 488) no escuro; chão em 480, como o `principal`.

### 2.2 Versões para fundo escuro (`vetor/escuro/`)

Medido no fundo escuro de referência `#121212` (o mesmo do `captura.py`), o corpo ardósia tem contraste de 2,46:1 e as nadadeiras e a sombra, 1,67:1. A silhueta se perde. A versão escura **não muda nenhuma cor nem forma do personagem**. Ela acrescenta só um **contorno de separação creme `#FBF3E4`** por fora da silhueta. É feito com cópias das formas da própria arte, pintadas de creme e com traço arredondado, colocadas por baixo de tudo. É SVG puro, sem filtro.

| Arquivo | Tratamento |
| --- | --- |
| todas as artes e expressões (17) | contorno de 8 (a linha mínima das artes grandes). A figura fica exatamente na mesma posição da versão clara, então trocar uma pela outra não faz a figura pular. |
| `icone.svg` | contorno de 24 (a linha mínima do ícone) e figura a 90% em torno do centro, para o contorno caber na margem de 32 |
| `pose-camping.svg`, `expressao-frio.svg` | os traços de tremor passam de ardósia-escura para creme, sem contorno |
| `expressao-calor.svg` | as gotas continuam verde-azuladas (6,62:1 no escuro), sem contorno |
| `pose-comemorando.svg`, `expressao-alegre.svg` | a sombra no chão do pulo continua em ardósia-escura, sem contorno (é sombra, não figura) |
| `uma-cor.svg` | **negativo:** a mesma arte com a tinta branca `#FFFFFF`. Face, barriga e olhos continuam recortes transparentes e mostram o fundo escuro. |

Efeito medido no `captura.py conferir`, versão escura:
- o contorno ocupa 8 além da figura: o chão aparece em y = 488 e a margem de baixo fica em 24;
- na comemorando, a margem de cima fica em 8;
- nada é cortado.

### 2.3 Ícone do app (`icone/`)

| Arquivo | Para quê | Medidas |
| --- | --- | --- |
| `fonte/android-frente.svg` | camada da frente do ícone adaptativo do Android (vetor-fonte) | prancha 512 = 108 dp; o `icone.svg` aprovado a 62% fica dentro do círculo seguro de 66 dp; a figura mede cerca de 55 dp (o pedido é ≥ 48 e ≤ 66) |
| `fonte/android-fundo.svg` | camada de fundo | creme `#FBF3E4` liso, até a borda |
| `fonte/android-monocromatico.svg` | camada monocromática (ícone com tema, Android 13 ou mais novo) | o ícone em uma tinta branca, na mesma escala da frente; face e barriga recortadas, olhos e bico em tinta |
| `fonte/loja.svg` | ícone das lojas | quadrado cheio, creme, opaco, figura a 78%, sem cantos arredondados nem sombra |
| `fonte/icone-uma-cor.svg` | o ícone em uma tinta `#111111` (positivo), para usos de uma cor | — |
| `android/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher_{foreground,background,monochrome}.png` | as três camadas por densidade | 108, 162, 216, 324 e 432 px |
| `android/expo-1024/ic_launcher_{foreground,background,monochrome}.png` | as três camadas em 1024 px, para `android.adaptiveIcon` do Expo (fundo com as mesmas dimensões da frente, como a documentação do Expo pede) | 1024 × 1024 |
| `play/icone-play-512.png` | ícone da Google Play | 512 × 512, PNG de 32 bits (RGBA) totalmente opaco, sRGB, 35 KB |
| `ios/icone-app-store-1024.png` | ícone da App Store | 1024 × 1024, PNG RGB **sem canal alfa**, sRGB, 37 KB |

No Expo, a cor de fundo também pode ir direto como `android.adaptiveIcon.backgroundColor: "#FBF3E4"`.

### 2.4 PNG exportados (`png/`)

`png/claro/` e `png/escuro/`, cada um com `expressoes/`. Para cada uma das 18 artes há quatro tamanhos: `-1024.png`, `-512.png`, `-256.png` e `-48.png`. São 144 arquivos, todos com fundo transparente.
- **1024 e 48:** saída direta do `render.py`. O de 48 é desenhado pelo navegador em 48 px reais.
- **512 e 256:** reduzidos do 1024 com Pillow (LANCZOS).

### 2.5 `index.html`

Prancha de conferência:
- cada arte sobre fundo claro (`#FFFFFF`) e sobre fundo escuro (`#121212`);
- os 3 ícones (interface, lojas e adaptativo) grandes, com o de 48 px ao lado;
- prévias da máscara redonda, da quadrada arredondada e do ícone com tema;
- a paleta.

É HTML e CSS em um arquivo, sem script e sem nada externo.

## 3. Paleta oficial

| Nome | Hex | Papel |
| --- | --- | --- |
| Ardósia | `#4A5560` | penugem (corpo) |
| Ardósia-escura | `#333C45` | sombra do fundo do ovo, nadadeiras, olhos, boca aberta |
| Creme | `#FBF3E4` | face, barriga, fundo do ícone, contorno da versão escura |
| Âmbar | `#E4A33A` | bico e pés |
| Verde-azulado | `#3EA8AE` | gorro (acento), gotas de calor |
| Tinta única | `#111111` | versão em uma cor, positivo |
| Branco | `#FFFFFF` | versão em uma cor, negativo; camada monocromática do Android |

## 4. Contraste conferido (razão de contraste WCAG, calculada pelos hex)

| Cor | Sobre claro `#FFFFFF` | Sobre escuro `#121212` |
| --- | --- | --- |
| Ardósia (corpo) | **7,61** | 2,46 |
| Ardósia-escura | 11,21 | 1,67 |
| Creme | 1,10 | **16,99** |
| Âmbar | 2,19 | 8,56 |
| Verde-azulado | 2,83 | 6,62 |
| Tinta `#111111` | 18,88 | — |
| Branco | — | 18,73 |

Entre cores da figura: creme × ardósia 6,90; creme × ardósia-escura 10,17; âmbar × ardósia 3,48; verde-azulado × ardósia 2,69.

**Leitura:**
- **Versão clara sobre branco.** A silhueta é carregada pelo corpo ardósia (7,61:1). O gorro (2,83:1) e os pés (2,19:1) ficam abaixo de 3:1 contra o branco puro. É a arte aprovada, mantida sem alteração pela regra desta tarefa. Fica como observação para o guia de uso: sobre branco puro, o gorro e os pés leem pela forma, não pelo contraste.
- **Versão escura sobre `#121212`.** Quem separa a figura do fundo é o contorno creme (16,99:1). Por dentro, o contorno separa do corpo com 6,90:1.
- **Uma cor.** O positivo tem 18,88:1 sobre branco e o negativo, 18,73:1 sobre escuro.
- **Ícones das lojas e adaptativo.** Têm fundo próprio creme. O corpo contra esse fundo fica em 6,90:1.

## 5. Conferências feitas (saídas guardadas na pasta temporária do designer, já apagada)

- **`captura.py conferir` na versão clara:**
  - 11 arquivos, sem nenhum aviso;
  - medidas iguais às do relatório aprovado: altura 434, chão 480, margens ok;
  - a altura do `sem-acessorio` (423) é o desvio 9, já aceito.
- **`captura.py conferir` na versão escura:**
  - avisos esperados de chão em y = 487–488 e margem abaixo de 32, por causa do contorno de 8;
  - o aviso de tinta branca na `uma-cor` é esperado, porque é o negativo;
  - ícone: caixa (50, 55, 462, 480), margem ok, depois da redução a 90%. Antes dela, a margem de baixo era 27.
- **`captura.py arte`** nas 3 expressões novas (claro e escuro), no ícone da Play, no ícone da App Store, na camada monocromática e no `icone-uma-cor`: tudo com exit 0. Olhados nas capturas:
  - os 48 px reais, a grade entre apps, a máscara redonda e o sol forte;
  - o ícone escuro em 48 px lê como "pinguim de gorro", com o contorno de cerca de 2 px.
- **`captura.py pagina ../final/index.html --auditar`**, em celular (390) e computador (1440), claro e escuro:
  - sem rolagem horizontal, 0 erros e 0 pedidos externos;
  - 0 alvos de toque abaixo de 44 px e 0 textos abaixo de AA;
  - 6 ícones de 48 × 48 px reais.
- **Regras de arquivo** (`lint_svg` do QA) em todos os SVG novos:
  - nenhuma tag proibida, nenhuma referência externa;
  - comentário de uma linha no topo, viewBox 512;
  - os únicos avisos são os esperados: o `rect` de fundo em `android-fundo.svg` e `loja.svg` (são camadas de fundo, de propósito) e a tinta branca da `uma-cor` negativa.
- **PNG das lojas:**
  - Play: 512 × 512, RGBA com alfa mínimo 255 (opaco), 35 KB, abaixo de 1024 KB;
  - App Store: 1024 × 1024, RGB sem alfa;
  - os dois sem perfil de cor embutido, ou seja, sRGB.

**Rodada 2 (só a `expressao-calor`):**
- `render.py` com `--fundo claro` e `--fundo escuro`: exit 0;
- `captura.py arte` no claro e no escuro: exit 0; olhados 48x8, sol, máscara redonda, silhueta e cinza. Em 48 px lê "pinguim de gorro com calor" (gorro, pálpebras, gotas);
- `lint_svg`: sem avisos;
- PNG refeitos com `export` (5 rodadas do `render.py`, exit 0);
- `captura.py pagina --auditar` na prancha: 0 erros, 0 pedidos externos, sem rolagem horizontal, 0 alvos abaixo de 44 px, 0 textos abaixo de AA.

Originalidade (MSC-06), checagem por descrição, sem busca reversa de imagem:
- as expressões novas não trazem traço novo de personagem conhecido;
- o gorro continua verde-azulado, nunca vermelho (risco Chilly Willy, já tratado);
- sem bochecha rosa, sem brilho de olho, sem boca com dentes;
- as gotas são formas genéricas de gota.

Nenhuma imagem de terceiros entrou no projeto e nenhuma arte foi enviada a serviço externo.

## 6. Fontes consultadas (pesquisa de texto na documentação oficial, em 24/11/2026)

- **Google Play, especificação do ícone:** https://developer.android.com/distribute/google-play/resources/icon-design-specifications (página sem data de atualização no texto).
  - "Final size: 512px x 512px"; "Format: 32-bit PNG"; "Color space: sRGB"; "Max file size: 1024KB".
  - Forma: "Full square — Google Play dynamically handles masking. Radius will be equivalent to 30% of icon size". Sombra: "None".
  - "Don't round the edges of your final asset". Pede fundo "that … doesn't include any transparency".
- **Google Play Console, ajuda "Add preview assets to showcase your app":** https://support.google.com/googleplay/android-developer/answer/9866151 (sem data; rodapé © 2026).
  - "32-bit PNG (with alpha)"; "Dimensions: 512px by 512px"; "Maximum file size: 1024KB".
- **Android, ícones adaptativos:** https://developer.android.com/develop/ui/views/launch/icon_design_adaptive (sem data no texto).
  - "Size all layers to 108x108 dp".
  - Logo "at least 48x48 dp. It must not exceed 66x66 dp"; "the inner 66x66 dp of the icon appears within the masked viewport"; "The outer 18 dp on each of the four sides of the layers is reserved for masking".
  - Camada monocromática para ícones com tema a partir do Android 13 (API 33).
- **Android, densidades de tela:** https://developer.android.com/training/multiscreen/screendensities. Proporção 3:4:6:8:12:16 entre densidades e `px = dp * (dpi / 160)`. Daí as camadas de 108 dp em 108, 162, 216, 324 e 432 px (conta do designer).
- **Apple, Human Interface Guidelines, App icons:** https://developer.apple.com/design/human-interface-guidelines/app-icons. Lido pelo texto JSON oficial da mesma página (https://developer.apple.com/tutorials/data/design/human-interface-guidelines/app-icons.json), porque a página só monta o conteúdo com JavaScript. Última alteração registrada: 28/10/2026.
  - iOS, iPadOS e macOS: "1024x1024 px", forma "Square", e "the system applies masking to produce rounded corners".
  - Cores: "sRGB (color)", "Gray Gamma 2.2", "Display P3".
  - Variantes "default, dark, clear, or tinted": "the system automatically generates variants you don't provide".
  - Camada de fundo "full-bleed and opaque".
- **Apple, Xcode, "Configuring your app icon":** https://developer.apple.com/tutorials/data/documentation/xcode/configuring-your-app-icon.json. "auto-generate all icon variations from a single 1024×1024 pixel image".
- **Expo, "Splash screen and app icon":** https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/ (modificada em 02/11/2026).
  - `android.adaptiveIcon.foregroundImage`, `monochromeImage` e `backgroundColor` / `backgroundImage`, com o fundo nas mesmas dimensões da frente.
  - Ícone iOS em PNG "exactly square", "fills the whole square, with no rounded corners or other transparent pixels"; "1024x1024 is a good size".

Observação sobre a App Store: nenhuma das duas páginas da Apple lidas traz a frase "sem transparência" para o ícone de 1024. A regra veio do pedido desta tarefa e da documentação do Expo citada acima. O arquivo entregue não tem canal alfa, o que atende às duas.

## 7. Como foi gerado

- **SVG:** escritos à mão no padrão de produção (`direcao/padrao-producao.md`). As cópias foram feitas por cópia de arquivo. As versões derivadas (contorno da versão escura, negativo, camadas do ícone) foram montadas por um script descartável na pasta temporária do designer, apagado depois da entrega. Ele só copia as formas aprovadas e muda cor, traço ou escala.
- **PNG:** `python -I design\mascote\ferramentas\render.py <pasta> --saida <temporária>` em `vetor/claro`, `vetor/claro/expressoes`, `vetor/escuro`, `vetor/escuro/expressoes` e `icone/fonte`. As 5 rodadas terminaram com exit 0. Depois:
  - o 1024 e o 48 foram copiados direto;
  - o 512, o 256 e as camadas por densidade foram reduzidos do 1024 com Pillow (LANCZOS);
  - os ícones das lojas foram achatados para opaco (Play: RGBA opaco; App Store: RGB).
