/* Opção 10 · Boneco de lanterna. Formato em ../../LEIA-ME.md; modelo comentado em ../00-exemplo/dados.js. */
window.CAMPINGUIM_OPCOES = window.CAMPINGUIM_OPCOES || {};
window.CAMPINGUIM_OPCOES["10"] = {
  pronta: false,
  estado: "nao-validada",
  numero: "10",
  nome: "Boneco de lanterna",
  frase: "Um filhote montado como brinquedo articulado, de cabeça maior que o corpo e olhos quadrados, que leva a lanterna do acampamento.",

  raciocinio: [
    "Vem do boneco de vinil: esfera, cápsula e cilindros, com luz dura em poucos tons chapados.",
    "O camping está na lanterna de alça, que vai baixa no neutro, erguida na chuva e abraçada no frio.",
    "Cabeça grande, placa de rosto quadrada de cantos redondos e olhos quadrados leem em 48 px e em uma cor; em 3D são primitivas prontas."
  ],

  paleta: [
    { nome: "Azul-ardósia", hex: "#2F3E55", papel: "corpo, cabeça, asas e pernas" },
    { nome: "Branco", hex: "#FFFFFF", papel: "rosto e barriga" },
    { nome: "Amarelo-lanterna", hex: "#F5C542", papel: "luz da lanterna, chapada" },
    { nome: "Cinza-grafite", hex: "#565C66", papel: "tampa, base e alça da lanterna" },
    { nome: "Laranja-bico", hex: "#E98A2E", papel: "bico e pés" }
  ],

  originalidade: "Checagem de originalidade feita em 24/11/2026 por descrição e busca em texto, sem busca reversa de imagem; comparado com: marca Pinguin (letreiro atual e emblema antigo), Tux, Pingu, Club Penguin, Pudgy Penguins, Pororo, QQ, Penguin Books, Pittsburgh Penguins, Badtz-Maru, Piplup, emojis de sistema, bonecos de vinil colecionáveis de cabeça grande, os pinguins de vinil Gwin e Tuxbird, pinguins de blocos de jogo e os resultados das buscas \"penguin mascot square eyes big head lantern toy\", \"penguin character holding camping lantern logo app\", \"pinguim mascote lanterna boneco vinil\", \"vinyl toy penguin designer figure big head cylinder arms\" e \"penguin mascot vector / penguin logo template / cute penguin clipart\"; nenhum traço marcante em comum: rosto em placa clara de quadrado arredondado, sem a máscara em coração de emoji, Club Penguin, Tux e Pororo; olhos quadrados escuros, cabeça-esfera maior que o corpo-cápsula, membros cilíndricos e lanterna de camping não aparecem juntos em nenhuma referência, sem lenço vermelho, sem piscadela, sem disco azul e sem letreiro.",

  poses_extras: [
    { titulo: "Com frio", arte: "arte/pose-extra-frio.svg" },
    { titulo: "Com calor", arte: "arte/pose-extra-calor.svg" }
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
    "uma-cor":            "arte/uma-cor.svg",
    "sem-acessorio":      "arte/sem-acessorio.svg"
  }
};
