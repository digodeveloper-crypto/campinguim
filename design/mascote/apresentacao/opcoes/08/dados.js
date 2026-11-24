/* Opção 08 · Barriga de montanha · dados da apresentação (formato em ../../LEIA-ME.md).

   Registro da checagem de originalidade (originalidade.md, seção 3, passos 1 a 9), feita em 24/11/2026
   por descrição e busca em texto, sem busca reversa de imagem. Fica aqui porque a pasta direcao/ não é
   deste designer; o QA refaz a checagem com as capturas dele.
   1. Silhueta: hexágono alongado de cantos muito arredondados (cabeça integrada, sem pescoço), asas em
      meia-lua coladas, pés ovais para fora; em uma cor, a barriga é recortada em dois picos de alturas
      diferentes. Comparada com: perfil em oval (editora: aqui é de frente, sem oval), sentado e gordo
      (Tux: em pé, corpo facetado, nada sentado), massa de modelar com trouxa (Pingu: sem bico cônico, sem
      trouxa), redondo sem pescoço de avatar (Club Penguin, Pudgy: o corpo é hexagonal e a barriga não é
      oval nem coração), cápsula com capuz (opção 06), triângulo (opção 01). Nenhuma coincide.
   2. Olhos: branco redondo com pupila grande e um brilho pequeno; expressão por pálpebra (calor, chuva),
      arco (alegria), oval apertado (alerta) e traço fechado (frio). Sem olhos gigantes, sem bochecha rosa
      (Pudgy), sem meia-lua emburrada (Badtz-Maru), sem olho de bolinha de massa (Pingu), sem piscadela (QQ).
   3. Bico: triângulo equilátero de ponta para baixo, em duas faces (pirâmide), amarelo-solar. Não é cônico
      comprido (Pingu), nem amarelo grande e chato (Madagascar), nem o bico largo de Tux.
   4. Barriga: o recorte claro NÃO é oval de emblema, nem coração, nem máscara que sobe até os olhos: é uma
      cordilheira de dois picos com face de sombra em cada encosta, e os olhos ficam no escuro acima dela.
      Pingviini (nome escrito na barriga) e Penguin Books (oval) não têm nada parecido.
   5. Cores: azul-profundo quase noturno, neve, amarelo-solar e os tons de luz e sombra. Não é
      preto-branco-amarelo puro (Tux, hóquei): o corpo é azul-noite com luz azulada; não é azul-branco-rosa
      (Pororo); não é azul-royal vivo com laranja (marca Pinguin): o azul é escuro e o acento é amarelo,
      não laranja; o corpo nunca é laranja-avermelhado; sem disco, círculo ou letreiro.
   6. Pose-assinatura: em pé, parado, de frente, pés abertos para fora. Não é sentado, megafone, trouxa no
      ombro, piscadela, língua de fora nem taco.
   7. Acessório: nenhum, em nenhum arquivo (o camping está na barriga).
   8. Buscas em texto: "penguin mascot mountain on belly logo", "penguin logo mountain peaks chest outdoor
      brand", "pinguim mascote montanha barriga logo camping", "hexagon penguin mascot navy yellow app icon".
      Achados: galerias genéricas (1000logos, logos-world, Vistaprint, 99designs, Canva, Flaticon); a marca
      suíça de freeride "Penguin" (já na lista, sem descrição do logotipo); o modelo de banco "Arctic
      Mountain Penguin" (BrandCrowd, id 7653261), cuja descrição em texto é só promocional, sem dizer onde
      fica a montanha nem a forma do pinguim: referência nova a conferir pelo QA; um app de mensagens "Pingu"
      com pinguim preto e amarelo (Penji), sem barriga de picos. Nenhum pinguim com a barriga recortada em
      picos de montanha apareceu.
   9. Modelo pronto: buscas "penguin mascot vector", "penguin logo template", "cute penguin clipart"
      (Magnific, Adobe Stock, Template.net, SeekLogo, FreeSVG, Creative Market): os pinguins de banco são
      redondos ou ovais, de barriga oval ou coração, olhos gigantes; a opção 08 não é intercambiável com eles
      (corpo facetado, barriga-cordilheira de duas faces, sem contorno).
*/
window.CAMPINGUIM_OPCOES = window.CAMPINGUIM_OPCOES || {};
window.CAMPINGUIM_OPCOES["08"] = {
  pronta: true,
  numero: "08",
  nome: "Barriga de montanha",
  frase: "Um pinguim jovem e compacto, de volume macio, com a barriga clara recortada em dois picos de montanha: o horizonte do acampamento está no peito dele.",

  raciocinio: [
    "O corpo escuro é o céu da noite e a barriga clara é a serra com neve: dois picos de alturas diferentes, cada um com a sua face de sombra.",
    "O camping está no próprio desenho, sem acessório: os picos se leem na figura grande, em 48 px e na versão em uma cor.",
    "Hexágono macio sem contorno, em poucos tons chapados de boneco de vinil: vira um volume simples em 3D e a barriga continua montanha de perfil."
  ],

  paleta: [
    { nome: "Azul-profundo",  hex: "#22364f", papel: "corpo e asas" },
    { nome: "Neve",           hex: "#fbfbf7", papel: "barriga (os picos), branco dos olhos" },
    { nome: "Amarelo-solar",  hex: "#f0b429", papel: "bico e pés (face de sombra em #cf8e17)" },
    { nome: "Luz",            hex: "#3b5478", papel: "luz de cima na cabeça e nas asas, gotas e traços de situação" },
    { nome: "Sombra",         hex: "#17263a", papel: "sombra do corpo e pupilas" },
    { nome: "Neve à sombra",  hex: "#d9e1ea", papel: "face de sombra de cada pico" }
  ],

  originalidade: "Checagem de originalidade feita em 24/11/2026 por descrição e busca em texto, sem busca reversa de imagem; comparado com: marca Pinguin (letreiro atual e emblema antigo), Tux, Pingu, Club Penguin, Pudgy Penguins, Pororo, QQ, Penguin Books, Pittsburgh Penguins, Badtz-Maru, Piplup, Pingviini, Tuxedo Sam, Suica, emojis de sistema e os resultados das buscas \"penguin mascot mountain on belly logo\", \"penguin logo mountain peaks chest outdoor brand\", \"pinguim mascote montanha barriga logo camping\", \"hexagon penguin mascot navy yellow app icon\", \"penguin mascot vector\", \"penguin logo template\" e \"cute penguin clipart\"; nenhum traço marcante em comum: corpo hexagonal macio sem contorno, barriga recortada em dois picos de montanha com face de sombra, bico em pirâmide de ponta para baixo, azul-profundo com neve e amarelo-solar.",

  poses_extras: [
    { titulo: "Com calor", arte: "arte/pose-extra-calor.svg" },
    { titulo: "Na chuva",  arte: "arte/pose-extra-chuva.svg" }
  ],

  arte: {
    "principal":          "arte/principal.svg",
    "vista-frente":       "arte/vista-frente.svg",
    "vista-lado":         "arte/vista-lado.svg",
    "vista-tres-quartos": "arte/vista-tres-quartos.svg",
    "pose-neutro":        "arte/pose-neutro.svg",
    "pose-comemorando":   "arte/pose-comemorando.svg",
    "pose-alerta":        "arte/pose-alerta.svg",
    "pose-camping":       "arte/pose-camping.svg",
    "icone":              "arte/icone.svg",
    "uma-cor":            "arte/uma-cor.svg"
  }
};
