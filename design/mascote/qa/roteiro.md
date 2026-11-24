# Roteiro de validação de uma opção de mascote

Roteiro do QA para validar UMA opção (01 a 10) antes de ela entrar na apresentação.
Base: `docs/brief-cinema-1-mascote.md`, `docs/PRD.md` (seção 4, seção 14 MSC-01 a MSC-09, seção 15 "Risco de marca do nome Campinguim") e `CLAUDE.md`.

Também incorporados: `direcao/conceitos.md` (as fichas são o contrato da opção), `direcao/padrao-producao.md` (regras de arquivo e mínimos) e `direcao/originalidade.md` (procedimento do MSC-06); a barra premium e o desvio declarado de medida (pedidos do piloto).

**Estudo ilustrado (decisão do responsável, 24/11/2026):** depois que o QA aprova uma opção, um ajudante Codex pode gerar um estudo ilustrado a partir do vetor dela. O vetor continua sendo a arte oficial, e é ele que este roteiro valida. O estudo entra na apresentação só rotulado como estudo e só depois de passar pelo QA. O QA confere a fidelidade ao vetor (silhueta, proporções, olhos, bico, barriga, cores da paleta, acessório) e refaz a originalidade (MSC-06), porque o gerador pode puxar traços de pinguins conhecidos. Continuam proibidos: designer enviar arte a serviço externo, busca reversa de imagem e imagem de terceiros no projeto.

Decisões do piloto em 24/11/2026 já incorporadas: contrato da pasta `arte/` (seção 2), busca reversa proibida (MSC-06), desconforto obrigatório (MSC-04), `sem-acessorio` obrigatório para opção com acessório, telas de exemplo validadas uma vez na estrutura e tema escuro da página não exigido (seção 5).

O QA julga a **arte renderizada**, nunca o código. Toda conclusão sai de uma captura que fica guardada e é citada no relatório.

---

## 1. Como capturar nesta máquina (Windows 11)

Ferramenta: `design/mascote/qa/captura.py` (Python 3.12 + Playwright + Pillow, já instalados). Usa o **Google Chrome instalado** (`channel="chrome"`): o Chromium próprio do Playwright não está baixado nesta máquina e não é preciso baixar. Testado em 24/11/2026 com Chrome 158.

Rodar de dentro de `design/mascote/qa/`, sempre com `python -I` (o `-I` impede o Python de carregar código da pasta da opção):

```
python -I captura.py pagina ..\apresentacao\opcoes\NN\index.html relatorios\NN-rR
python -I captura.py arte   <arquivo de arte .svg/.png>            relatorios\NN-rR --rotulo <nome>
```

`pagina` (aceita arquivo ou endereço `http://`; `--rotulo NOME` dá o prefixo dos arquivos) gera, da página inteira (rolagem completa; páginas altas são fotografadas em faixas e coladas, porque o Chrome repete o conteúdo acima de ~16 mil pixels):

| Arquivo | O que é |
| --- | --- |
| `<rotulo>-celular-claro/escuro.png` | 390 × 844, densidade 3, toque; arte em fundo claro / escuro |
| `<rotulo>-computador-claro/escuro.png` | 1440 × 900, densidade 1; arte em fundo claro / escuro |

Com `--auditar`, imprime também os alvos de toque menores que 44 px, os textos abaixo do contraste AA (4,5:1, ou 3:1 para texto grande) e o tamanho real, em px CSS, de cada ícone de 48 px.

`conferir <opcoes/NN> <saída>` faz a bateria de uma opção:
- confere o contrato de `arte/` e as regras de arquivo de `padrao-producao.md`;
- mede a caixa de cada figura renderizada (largura, altura, chão, margem) e compara as alturas em pé;
- roda `arte` em todos os arquivos e `pagina --auditar` na página.

`mosaico <opcoes/NN> <saída> <opcoes/MM> ...` põe lado a lado, opção por opção, a silhueta, a versão em uma cor e os ícones de 48 px reais em fundo claro e escuro.

O tema do sistema não é exigido da página: o fundo da arte é trocado por um **botão da própria página** (claro/escuro). O `captura.py` clica nesse botão (`.btn-fundo`) para gerar as capturas com a arte em fundo escuro; sem o botão, usa o tema escuro do sistema.

O script imprime, por captura: se há rolagem horizontal, erros do console, arquivos que não carregaram e **pedidos externos** (qualquer coisa fora do próprio arquivo: fonte da internet, biblioteca, imagem remota).

`arte` gera, para um arquivo de arte isolado, sobre fundo claro `#FFFFFF` e escuro `#121212`:

| Arquivo | O que é |
| --- | --- |
| `<rotulo>-512-claro/escuro.png` | arte grande, 512 px |
| `<rotulo>-48-claro/escuro.png` | **48 px reais** (densidade 1, a arte é desenhada pelo navegador em 48 px, sem reduzir depois) |
| `<rotulo>-48x8-claro/escuro.png` | os mesmos 48 px ampliados 8× sem suavizar, para o olho ver cada pixel |
| `<rotulo>-48-cinza-*.png`, `<rotulo>-cinza-*.png` | em tons de cinza (teste de não depender de cor) |
| `<rotulo>-48-sol-*.png` | 48 px com contraste achatado (×0,45) e brilho alto (×1,35): simulação de tela sob sol forte |
| `<rotulo>-silhueta.png`, `<rotulo>-48-silhueta.png` | tudo o que tem tinta vira preto (sai do canal de transparência), em 512 e em 48 px |
| `<rotulo>-48-redondo-*.png` | 48 px cortado em círculo, como a máscara do ícone adaptável do Android |
| `<rotulo>-48-entre-apps-*.png` | o ícone de 48 px no meio de uma grade de 47 ícones coloridos neutros |

Para ver as capturas, o QA abre os PNG (o `Read` do Claude Code mostra a imagem). Para comparar várias, monta um mosaico com Pillow numa pasta temporária e apaga depois.

**Teste feito em 24/11/2026** (página de teste com um pinguim simples em SVG, na pasta temporária do QA, já apagada):

```
pagina-celular-claro.png  rolagem_horizontal=nao (390px)  erros=0  pedidos_externos=1
    externo: https://fonts.googleapis.com/css2?family=Inter
pagina-celular-escuro.png  rolagem_horizontal=nao (390px)  erros=0  pedidos_externos=1
pagina-computador-claro.png  rolagem_horizontal=nao (1440px)  erros=0  pedidos_externos=1
pagina-computador-escuro.png  rolagem_horizontal=nao (1440px)  erros=0  pedidos_externos=1
exit=0
arte: 19 arquivos gerados (512 = 512×512, 48 = 48×48, ampliados = 384×384)  exit=0
```

O teste já mostrou o tipo de falha que o roteiro pega: o corpo azul-marinho do pinguim de teste **sumia no fundo escuro** `#121212`.

Limite conhecido: não há motor do Safari (WebKit) nesta máquina. A página é conferida no Chrome em largura de celular; o Safari fica para o teste humano.

---

## 2. O que o QA precisa receber da opção

Contrato fechado pelo piloto (resposta às dúvidas 1 e 4). Cada opção vive em `design/mascote/apresentacao/opcoes/NN/` com:

- `index.html` (a página da opção) e `dados.js` (formato em `apresentacao/LEIA-ME.md`);
- a pasta `arte/` com **dez** arquivos `.svg` ou `.png` de fundo transparente: `principal`, `vista-frente`, `vista-lado`, `vista-tres-quartos`, `pose-neutro`, `pose-comemorando`, `pose-alerta`, `pose-camping`, `icone`, `uma-cor`;
- `arte/sem-acessorio` quando a opção usa acessório (pela direção de arte: 02 lenço, 03 gorro, 04 mochila, 07 caneca, 10 lanterna). Opção sem acessório não tem acessório em arquivo nenhum;
- opcional: `arte/pose-extra-frio`, `-calor` ou `-chuva`, declarada em `poses_extras`. Nas dez fichas a `pose-camping` já é a de desconforto.
- Nenhum outro arquivo em `arte/`: nada de `_render/` nem de temporário.

**Regras de arquivo** (`design/mascote/direcao/padrao-producao.md`, seção 3), conferidas por `captura.py conferir`:

- SVG com `viewBox="0 0 512 512"` e 512 × 512; sem `<text>`, imagem, `<filter>`, `<style>` ou referência externa; sem `rect` de fundo; comentário de uma linha no topo;
- figura dentro da margem de 32 (poses com parte saindo: até 16); chão em y = 480; **mesma altura** em `principal`, vistas, `pose-neutro` e `sem-acessorio`;
- degradê só nas opções de acabamento "volume" (02, 03, 05, 08, 10) e nunca em `icone` ou `uma-cor`;
- `uma-cor` numa tinta só, `#111111`, sem linha, sem opacidade, com barriga, olhos e bico em **recorte transparente** (nunca branco);
- mínimos na prancha de 512: linha 8, elemento 16 e vão 12 nas artes grandes; elemento 24 e vão 24 no `uma-cor`; no `icone`, linha 24 (ou nenhuma), elemento 43 (4 px em 48) e vão 43.

O aviso automático não reprova sozinho: o QA olha a captura correspondente e decide. Exemplos: uma margem estourada por 2 unidades que não corta nada é observação; um `uma-cor` com segundo tom reprova.

A entrega do designer ao QA traz: número da opção, IDs cobertos, o que foi feito, a saída do `render.py`, **os desvios da ficha com o motivo** (ver MSC-01) e, numa reentrega, o que mudou desde a rodada anterior.

Faltando arquivo do contrato, o QA não consegue testar fundo claro e escuro, 48 px e silhueta: a entrega volta sem rodada contada, com a lista do que falta. Exceção: faltar `sem-acessorio` numa opção com acessório, ou faltar a situação de desconforto, **reprova** (rodada contada), porque o requisito fica não verificável.

---

## 3. Passo a passo de uma validação

1. Criar `relatorios/NN-rR/` (pasta das capturas) e `relatorios/NN-rodada-R.md` (relatório).
2. Rodar `python -I captura.py conferir ..\apresentacao\opcoes\NN relatorios\NN-rR > relatorios\NN-rR\saida-conferir.txt`. Esse comando:
   - confere o contrato e as regras de arquivo;
   - mede a caixa de cada figura (largura, altura, chão, margem);
   - roda `arte` em cada arquivo, com o nome do arquivo como rótulo;
   - roda `pagina --auditar` na página da opção.
3. Rodar `python -I captura.py mosaico ..\apresentacao\opcoes\NN relatorios\NN-rR <pastas das outras opções já entregues>` para comparar as opções lado a lado (MSC-01).
4. Ler a ficha da opção em `direcao/conceitos.md`, os desvios que o designer declarou e a checagem dele (`dados.js` e a ficha, ou `direcao/checagens/NN.md`). Depois, aplicar os critérios das seções 4, 5 e 5a, um por um, olhando as capturas.
5. Escrever o relatório (modelo na seção 6). Qualquer critério reprovado reprova a opção.
6. Reprovada: devolver direto ao terminal do designer que entregou, com o caminho do relatório. Na **terceira reprovação seguida** da mesma opção, avisar o piloto em vez de devolver.
7. Aprovada: avisar o piloto com o número da opção e o caminho do relatório.

Uma opção por vez, na ordem de chegada. Opção mediana não entra: "passa raspando" é reprovação com o que falta para ficar boa.

---

## 4. Critérios dos requisitos

Para cada critério: **o que olhar**, **como olhar**, **o que reprova**.

### MSC-01 · Original e distinto das outras nove

- **O que olhar:** a figura grande, a silhueta e o ícone de 48 px da opção, contra os das outras opções já entregues, e contra a ficha da opção em `design/mascote/direcao/conceitos.md`.
- **Como olhar:**
  - montar um mosaico com as silhuetas de 512 px e os ícones de 48 px desta opção e de todas as já entregues (aprovadas ou na fila) e comparar lado a lado;
  - posicionar a opção nos 5 eixos do brief (traço, idade aparente, proporção, acabamento, ligação com o camping) e anotar no relatório; repetir para as já validadas;
  - conferir se o desenho entregue cumpre a ficha de `conceitos.md`: ideia, eixos, silhueta, barriga, olhos, bico, asas, pés, linha, acessório, paleta e "o que o distingue". A ficha é o contrato da opção. As medidas grandes da ficha (largura, altura e proporção da silhueta) são conferidas pela caixa medida em `saida-conferir.txt`; as demais, a olho, nas capturas de 512;
  - comparar com os **vizinhos mais próximos** listados na ficha (01 × 06, 02 × 07, 03 × 05, 06 × 08, 04 × 10, 09 × 02) e com os "Riscos de semelhança já tratados".
- **Desvio de medida da ficha** (regra do piloto): o designer pode se afastar de uma medida, desde que declare o desvio e o motivo na entrega. O QA julga e registra no relatório se o desvio:
  - preserva a ideia e "o que o distingue" da ficha;
  - mantém a opção nos mesmos eixos;
  - mantém a distância dos vizinhos (a silhueta em uma cor continua inconfundível);
  - tem motivo de leitura ou de acabamento (por exemplo, 48 px, 3D ou equilíbrio), e não só de gosto.

  Desvio declarado que passa nas quatro perguntas é aceito. Desvio não declarado que muda a leitura reprova. Desvio pequeno não declarado (até ~10% numa medida, sem mudar a leitura) vira observação, com pedido de declarar.
- **Reprova se:**
  - a silhueta, com as cores tiradas, se confunde com a de outra opção;
  - a diferença para outra opção é só de cor, acessório ou expressão (o PRD pede diferença de **traço, proporção e personalidade**);
  - a opção cai na mesma combinação de eixos de outra já validada e não tem outra diferença forte;
  - o desenho não cumpre a própria ficha (outro eixo, outra idade, outra ideia, outra silhueta), ou um desvio falha numa das quatro perguntas acima;
  - usa uma forma que `conceitos.md` descartou por não se sustentar em 3D.
- **Ordem de chegada:** quem chega depois se diferencia de quem já foi aprovado. Ao fim das 10, o QA refaz a comparação com a página de comparação (10 ícones e 10 versões em uma cor) e registra o resultado.

### MSC-03 · Aplicado nos usos reais

As telas de exemplo (tela de abertura, tela do app, cabeçalho do site) são montadas pela própria página, **iguais para as 10 opções**, com os dados fixos de `docs/brief-cinema-2-prototipos.md` (seção "Dados para preencher as telas"), tipografia e fundos neutros. Elas são validadas **uma vez**, na estrutura da apresentação (seção 5, "Página da opção e estrutura"). Por opção, o QA confere só se **o mascote funciona dentro delas**.

- **O que olhar:** o mascote nos cinco usos: ícone do app em tamanho pequeno, tela de abertura, uma tela do app, cabeçalho do site, versão em uma cor.
- **Como olhar:** capturas da página em celular e computador, com a arte exibida em fundo claro e em fundo escuro (botão da página). Conferir que o mascote se lê em cada uso, no tamanho e no lugar em que aparece.
- **Reprova se:**
  - falta o mascote em algum dos cinco usos;
  - o mascote é cortado, distorcido (esticado), pixelado ou borrado em algum uso;
  - a versão em uma cor tem degradê, sombra ou segundo tom (uma cor = uma tinta sobre o fundo; versão vazada, invertida, também precisa funcionar no fundo escuro);
  - algum uso usa cor, fonte ou elemento de marca de terceiros.

### MSC-04 · Ao menos 4 poses ou expressões

- **O que olhar:** neutro, comemorando, em alerta e uma em situação de camping.
- **Como olhar:** capturas grandes e em 48 px de cada pose; tapar o rótulo e perguntar "que emoção é esta?".
- **Reprova se:**
  - falta uma das quatro;
  - uma pose não se distingue de outra sem ler o rótulo (alerta parecendo surpresa alegre, comemorando parecendo neutro);
  - "em alerta" fica assustador, raivoso ou infantil demais para "o amigo que avisa você a tempo";
  - a pose muda o personagem (outra proporção, outro bico, outros olhos): é a mesma figura em todas;
  - nenhuma imagem mostra o personagem em desconforto (frio, calor ou chuva), nem como a pose de camping nem como pose extra. Regra confirmada pelo piloto: o brief exige que ele funcione em alegria, alerta e desconforto, e sem essa imagem não é verificável;
  - a `pose-camping` não mostra o desconforto que a ficha pede (01 chuva, 02 calor, 03 frio, 04 calor, 05 chuva, 06 frio, 07 chuva, 08 frio, 09 calor, 10 chuva), sem desvio declarado;
  - elementos de situação (gotas, tremor, sol, chuva) são finos ou miúdos (abaixo de 16 na prancha), ou viram cenário, fundo ou texto;
  - a pose não é edição do `principal`: o personagem muda de proporção entre arquivos;
  - o desconforto não se lê (frio, calor ou chuva precisam ser reconhecíveis pela postura e expressão, não só por um detalhe pequeno).

### MSC-05 · Reconhecível como pinguim e como campista em 48 px

- **O que olhar:** o ícone em 48 px reais ao lado da versão grande.
- **Como olhar:** `icone-48-*`, `icone-48x8-*`, `icone-48-redondo-*`, `icone-48-silhueta`, `icone-48-entre-apps-*`, claro e escuro. Perguntas, nesta ordem, olhando só o 48 px real (não o ampliado):
  1. É um pinguim? (sem a versão grande ao lado)
  2. É um pinguim **que acampa**? O que diz "camping": a forma, a postura ou o acessório?
  3. Continua reconhecível dentro do círculo do Android?
- **Reprova se:**
  - em 48 px parece outra ave (coruja, pato, tucano) ou uma forma genérica;
  - a ligação com o camping some em 48 px (fica só pinguim), ou depende de um detalhe menor que ~3 px (alça fina, chama de lanterna, estampa);
  - o círculo do Android corta bico, olhos ou o elemento de camping (a direção pede tudo o que identifica dentro de um círculo central de 440);
  - o ícone se perde na grade de outros apps, no fundo claro ou no escuro;
  - o `icone` é o `principal` reduzido, e não uma arte própria simplificada e reenquadrada como a ficha pede (por exemplo, 02 e 07 do peito para cima; 09 com pés e cabeça exagerados);
  - o ícone tem elemento necessário menor que 43 unidades (4 px em 48), ou contorno mais fino que 24.

### MSC-06 · Não lembra pinguins nem logotipos existentes

- **O que olhar:** a figura grande, a silhueta e o ícone, contra a lista de `design/mascote/direcao/originalidade.md` e contra uma checagem refeita pelo QA.
- **Como olhar:**
  1. conferir a checagem do designer: o campo `originalidade` do `dados.js`, na frase-modelo de `originalidade.md`, seção 3, passo 10; e o registro dos passos 1 a 9 na ficha ou em `direcao/checagens/NN.md`;
  2. **refazer os passos 1 a 9 de `originalidade.md`, seção 3**, com as capturas do QA e sem confiar na declaração: silhueta, olhos, bico, barriga, cores, pose-assinatura e acessório, contra as tabelas da seção 2 de lá (marcas, animação, jogos, quadrinhos) e contra "o território livre" (os lugares-comuns que já são de alguém). A comparação é por **combinação** de traços, não por cor isolada: corpo escuro, barriga clara e bico laranja são do bicho. Os itens marcados (m) lá vêm de memória da direção; antes de usar um deles para reprovar, o QA confirma por busca em texto;
  2a. conferir também os riscos que a direção já apontou por opção: 01 não pode virar o emblema antigo da Pinguin; 03 sem capacete, óculos, bochecha rosa nem olhos gigantes; 05 sem cabelo espetado nem língua de fora; 06 não pode virar o pinguim gordo e sentado de bico amarelo; 07 sem taco e sem camisa; 10 sem lenço vermelho e sem piscadela;
  3. **busca reversa de imagem não é autorizada**: arte não publicada não sai desta máquina para serviço nenhum (decisão do piloto). A checagem é por descrição e busca em texto, e o relatório diz isso. Buscar na web por texto descrevendo a opção ("penguin mascot backpack logo", "cute penguin camping logo", "penguin app icon" e variações do traço dela), olhando os resultados de imagem para achar parecidos que não estão na lista;
  4. comparar contra bancos de imagens e geradores de mascote (ver "visual de modelo pronto" na seção 5);
  5. registrar no relatório cada referência conferida, o resultado e a frase "checagem por descrição e busca em texto, sem busca reversa de imagem";
  6. referência nova encontrada na busca vai para `qa/referencias-novas.md`, com a fonte. `originalidade.md`, seção 4, pede que o QA a anote lá, mas a pasta `direcao/` não é do QA; o piloto ou a direção de arte passa a referência para lá.
- **Marca Pinguin, regras concretas** (`originalidade.md`, seção 1):
  - corpo de cor dominante laranja-avermelhado reprova (bico e pés âmbar ou terracota são aceitos);
  - a dupla azul-royal vivo e laranja como as duas cores do mascote reprova;
  - pinguim dentro de círculo ou disco, ou versão em uma cor sobre disco azul, reprova;
  - qualquer letreiro na arte reprova.
- A checagem contra o logotipo da Pinguin é **visual, não jurídica**. A pesquisa de marca (INPI, EUIPO, OMPI) é pendência do responsável (PRD, seção 15), não do QA.
- **Reprova se:**
  - alguém que conhece a referência diria "parece o X" ao ver a silhueta ou o ícone;
  - repete um traço marcante de uma referência (formato do bico, olhos, barriga, pose de assinatura, combinação de cores);
  - lembra o logotipo da Pinguin em qualquer aspecto (forma, cor, composição), já que o nome do app contém o nome da marca e o mascote é a defesa (PRD, seção 15);
  - `originalidade.md` não tem a checagem da opção, ou a página não declara que a checagem foi feita.

### MSC-09 · Funciona em 3D

- **O que olhar:** as vistas de frente, de lado e de três quartos.
- **Como olhar:** capturas grandes e silhuetas das três vistas lado a lado, mais a seção "Volume" da ficha. Conferir que as três descrevem **o mesmo volume**: altura, largura, posição de olhos, bico, asas e pés batem de uma vista para a outra; a vista de lado mostra profundidade coerente (barriga, bico projetado); a de três quartos não é a de frente inclinada. Regras de `padrao-producao.md`, conferidas na captura e na caixa medida:
  - mesma altura e chão em y = 480 nas três;
  - linha dos olhos na mesma altura;
  - lado em perfil puro, olhando para a esquerda, com uma asa visível;
  - três quartos a 45° para a esquerda, com os dois olhos (o de trás menor);
  - acessório consistente nas três.
- **Reprova se:**
  - falta uma das três vistas;
  - as vistas se contradizem (o bico ou os olhos mudam de tamanho ou lugar, a barriga muda de forma);
  - a forma só funciona chapada: olhos que saem da cabeça de lado, contorno que vira outra coisa de perfil, partes que não teriam onde se apoiar em volume;
  - não dá para imaginar o personagem passando frio, calor e chuva em 3D (pergunta "Vídeo" da folha de avaliação).

---

## 5. Critérios que valem para todas e "O que evitar"

### Leitura sob sol forte e em tela pequena

- **O que olhar:** ícone e mascote grande em 48 px e em tamanho de celular.
- **Como olhar:** `*-48-sol-*` (contraste achatado e brilho alto), `*-48-cinza-*`, e a captura da página em celular. Conferir também a tela de abertura e a tela do app no celular.
- **Reprova se:** sob a simulação de sol, a figura perde o contorno, os olhos ou o bico; partes vizinhas têm tons tão próximos que viram uma mancha; o mascote some no fundo claro ou no escuro (como o pinguim de teste, que sumiu no `#121212`).

### Não depender de cor

- **O que olhar:** versão em uma cor, versão em cinza e silhueta.
- **Como olhar:** `uma-cor-*`, `*-cinza-*`, `*-silhueta`. Perguntar: sem cor, ainda é este pinguim, e ainda se distingue das outras opções?
- **Reprova se:** em cinza ou em uma cor o personagem fica irreconhecível; a diferença entre barriga e costas, ou entre olhos e rosto, existia só na cor (dois tons de mesmo brilho); a versão em uma cor não funciona vazada no fundo escuro.

### Funcionar fora do Brasil

- **O que olhar:** todas as poses, acessórios, estampas e textos.
- **Como olhar:** procurar referência local: cores ou símbolos nacionais, objetos típicos de um país (cuia, chinelo de marca, camisa de time, chapéu regional), texto em português na arte, gestos de mão com sentido ofensivo ou ambíguo em outros países (sinal de OK, figa, V com a palma para dentro, polegar em certas regiões).
- **Reprova se:** a ideia da opção depende de uma referência que só o Brasil entende; há texto escrito na arte do mascote; algum gesto tem sentido ofensivo em país conhecido.

### Acessório nunca é essencial

- **O que olhar:** a figura sem o acessório.
- **Como olhar:** `sem-acessorio-*` (arquivo `arte/sem-acessorio`, obrigatório para opção com acessório), em grande, 48 px e silhueta. Perguntar: ainda é este personagem, e ainda é diferente das outras nove? Opção sem acessório não precisa do arquivo; o QA confere só que de fato não há acessório.
- **Reprova se:** sem o acessório a figura vira um pinguim genérico ou parecido com outra opção; o acessório faz parte do corpo e não sai; a opção usa acessório e não entregou `arte/sem-acessorio` (não verificável).

### Evitar: semelhança com pinguim conhecido de marca, desenho, jogo ou sistema

Conferido em MSC-06, passos 2 a 5. Reprova nos mesmos casos.

### Evitar: semelhança com o logotipo da Pinguin

Conferido em MSC-06, item específico. O QA busca o logotipo atual da marca e compara forma, cor e composição com o ícone e a versão em uma cor. Reprova em qualquer semelhança perceptível, mesmo parcial.

### Evitar: detalhes finos que somem no tamanho do ícone

- **Como olhar:** `icone-48x8-*` (cada pixel visível) e `icone-48-*` real.
- **Reprova se:** o ícone tem traço de contorno, brilho, sombra ou detalhe que em 48 px vira 1 pixel cinza ou some; o elemento que diz "camping" é um desses detalhes; o ícone de 48 px é só a figura grande reduzida, sem simplificação.

### Evitar: visual de modelo pronto ou de banco de imagens

- **O que olhar:** a figura grande e as poses.
- **Como olhar:** comparar com resultados de busca de "penguin mascot vector", "penguin logo template", "cute penguin clipart", e com o estilo padrão de geradores de imagem. Pergunta "Premium" da folha: parece de um produto bem feito?
- **Reprova se:** o desenho é intercambiável com um resultado de banco de imagens (pinguim redondo genérico de olhos grandes e brilho no olho, gradiente pronto, contorno uniforme de vetor genérico); acabamento irregular (curvas tortas, nós de vetor visíveis, espessuras que variam sem intenção, cores sujas); visual infantil demais para "simpático sem ser infantil".

### 5a. Barra premium (pedido do piloto)

A barra é a de mascote de marca premium. **Acabamento com cara de clipart reprova mesmo que todos os requisitos formais passem**, e o relatório diz o que falta, em termos de desenho, para chegar lá. O QA olha a figura grande (`*-512-claro.png`, 1:1), as poses lado a lado e a página da opção no computador, e responde:

| Pergunta | Sinal de clipart (reprova) | Sinal de marca premium |
| --- | --- | --- |
| As curvas são desenhadas? | Bicos de quina onde devia ser curva; curvas que mudam de raio sem razão; elipses cruas encostadas umas nas outras; junções que não se fundem | Curvas contínuas, de tensão controlada; formas que se encaixam (a barriga segue o corpo, a asa nasce do ombro) |
| Há hierarquia de formas? | Tudo do mesmo tamanho e peso; muitas partes pequenas disputando a atenção | Uma forma-mãe clara, duas ou três secundárias, poucos detalhes; a silhueta lê antes de tudo |
| A linha (quando há) tem intenção? | Espessura igual e mecânica onde a ficha pede pincel ou marcador; ou variação aleatória; pontas cortadas | O peso da linha segue a ficha: mais grossa embaixo das formas, pontas resolvidas |
| A cor é contida? | Saturação de brinquedo barato; muitas cores; tons sujos ou quase iguais; degradê pronto de dois cliques | 3 a 5 cores da ficha, com valores bem separados, um acento só, e a luz e a sombra num tom cada (quando a ficha pede volume) |
| A expressão é de personagem? | Olhos grandes com brilho padrão e "carinha fofa" genérica; boca humana; expressão igual em todas as poses | Pálpebra, sobrancelha e inclinação do corpo contam a emoção; olhar atento, nunca bobo (o "Quem ele é" da direção) |
| Tem postura e peso? | Figura dura, simétrica e de frente em todas as poses; pés sem apoio; poses que são só a neutra com um elemento a mais | Peso apoiado, linha de ação clara nas poses, a mesma construção em todos os arquivos |
| É coerente entre os arquivos? | Pose ou vista com outra espessura, outro bico, outra proporção, outro acabamento | Tudo parece da mesma mão, no mesmo dia |
| Ficaria bem ao lado de mascotes de apps premium (no geral, sem copiar nenhum)? | Parece figurinha de banco de imagens, tema de festa infantil ou ícone de modelo pronto | Parece feito sob medida, com decisões visíveis |

Uma resposta "clipart" já reprova. O relatório diz qual pergunta falhou, aponta a captura e descreve a correção em termos de desenho (por exemplo: "fundir a asa ao ombro com uma curva contínua, em vez de uma elipse encostada").

### Página da opção e estrutura (MSC-02 e formato da apresentação)

**Uma vez, antes das opções**, o QA valida a ESTRUTURA da apresentação com a opção de exemplo (`opcoes/00-exemplo/`): página inicial, página de opção, comparação, recomendação, e as telas de exemplo do MSC-03. Mesmo método: `captura.py pagina` em cada página, celular e computador, arte em fundo claro e escuro. Reprova se:

- falta alguma parte do formato do brief (página inicial com as 10 lado a lado, mesmo tamanho e fundo, numeradas, nome e frase; página de opção com mascote grande, três vistas, quatro poses, cinco usos, uma cor, ícone em 48 px, paleta e raciocínio em três linhas; comparação com os 10 ícones de 48 px numa fileira e as 10 versões em uma cor em outra; recomendação em página separada no fim, sem chamar atenção antes das opções);
- as telas de exemplo não usam exatamente os dados de `docs/brief-cinema-2-prototipos.md` ("Dados para preencher as telas"), têm texto de preenchimento, ou não são iguais para as 10 opções;
- tipografia, cores, nomes ou fundos não são neutros (a identidade é da etapa 2);
- tem rolagem horizontal no celular, erro, arquivo que não carrega, ou depende de internet para mostrar o mascote;
- o ícone "de 48 px" não é exibido em 48 px CSS reais;
- o botão de fundo claro/escuro da arte não funciona, ou o fundo escuro quebra a leitura de texto da página. Tema escuro da página **não** é exigido.

**Por opção**, o QA confere só que a opção preenche a estrutura sem quebrá-la: todos os lugares têm arte, nada cortado ou esticado, sem rolagem horizontal, sem erro, `dados.js` no formato de `apresentacao/LEIA-ME.md`.

---

## 6. Relatório da rodada

Arquivo: `design/mascote/qa/relatorios/NN-rodada-R.md`. Capturas em `design/mascote/qa/relatorios/NN-rR/`.

```markdown
# Opção NN · rodada R · APROVADA | REPROVADA

Data: AAAA-MM-DD · Entregue por: <terminal do designer> · Página: design/mascote/apresentacao/opcoes/NN/
Eixos: traço <...> · idade <...> · proporção <...> · acabamento <...> · camping no <desenho|acessório>

## Resultado por critério

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Contrato de arquivos e regras de arquivo | ok / falhou | NN-rR/saida-conferir.txt |
| MSC-01 distinto e fiel à ficha | ok / falhou | NN-rR/mosaico-opcoes.png |
| Desvios declarados da ficha | aceito / recusado (motivo), um por linha | ... |
| MSC-03 usos reais | ... | NN-rR/pagina-celular-claro.png |
| MSC-04 poses | ... | ... |
| MSC-05 48 px | ... | NN-rR/icone-48x8-claro.png |
| MSC-06 originalidade (checagem refeita) | ... | referências conferidas: ... |
| MSC-09 vistas 3D | ... | ... |
| Sol forte e tela pequena | ... | ... |
| Não depender de cor | ... | ... |
| Fora do Brasil | ... | ... |
| Acessório não essencial | ... | ... |
| Evitar: detalhe fino | ... | ... |
| Evitar: modelo pronto | ... | ... |
| Barra premium (5a) | ... | ... |
| Página da opção | ... | ... |

## O que precisa mudar (só se reprovada)

1. <critério> · <o que se vê na captura X> · <o que mudar>

## Saída da captura

<saída do captura.py: rolagem, erros, pedidos externos>
```

Toda reprovação diz o critério, a captura e o que mudar. A aprovação também lista as capturas. Reprovações seguidas contam por opção: R1, R2 reprovadas e R3 reprovada = aviso ao piloto.

## Onde ficam as capturas das rodadas

As capturas (`.png`) das subpastas de `qa/relatorios/` ficam **fora do git** (regra no `.gitignore`; são milhares de imagens, cerca de 200 MB) e existem só no disco desta máquina, em `design/mascote/qa/relatorios/<pasta da rodada>/`. Os relatórios `.md` e as saídas em texto entram no git e citam as capturas pelo nome.
