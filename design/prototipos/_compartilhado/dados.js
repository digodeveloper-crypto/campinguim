/* Campinguim · protótipos · ÚNICO arquivo de dados dos cinco protótipos.
   Escrito a partir de design/prototipos/direcao/telas.md, e só dele (DSG-02, DSG-03).
   Nenhum nome, número ou valor do cenário pode aparecer em outro arquivo.
   Valores em dinheiro em centavos; base.js formata ("R$ 420,00").
   Cada proposta provisória de telas.md leva provisorio: "P-nn" no próprio registro
   (quando duas valem para o mesmo registro: "P-05, P-06").
   Os textos de interface (estados, categorias, rótulos, botões) ficam em textos.js;
   aqui ficam só os dados do cenário. */
(function () {
  "use strict";

  /* Ordem das categorias: PRD, E1-02 (D-03: Ferramentas, Lazer e Documentos separadas).
     O nome de cada categoria está em textos.js, chave "categoria.<id>".
     estado: "carro" (está no carro), "separei" (separado, fora do carro), "a_separar". */
  var categorias = [
    {
      id: "abrigo", aberta: false, progresso: { noCarro: 6, total: 6 },
      itens: [
        { id: "barraca", nome: "Barraca com sobreteto", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "lona_chao", nome: "Lona de chão", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "espeques", nome: "Espeques e cordas extras", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" },
        { id: "martelo", nome: "Martelo de borracha", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "fita_reparo", nome: "Fita de reparo e selador de costura", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "vassourinha", nome: "Vassourinha e pá", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" }
      ]
    },
    {
      id: "dormir", aberta: true, progresso: { noCarro: 4, total: 5 },
      itens: [
        { id: "saco_dormir", nome: "Saco de dormir", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro" },
        { id: "isolante", nome: "Isolante ou colchonete", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro" },
        { id: "travesseiro", nome: "Travesseiro", quantidade: 3, unidade: "", quantidadeTexto: "3", estado: "carro", provisorio: "P-05" },
        { id: "travesseiro_bia", nome: "Travesseiro da Bia", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "separei", provisorio: "P-05" },
        { id: "manta", nome: "Manta extra", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro", formula: "1 por pessoa, frio" }
      ]
    },
    {
      id: "cozinha", aberta: false, progresso: { noCarro: 15, total: 15 },
      itens: [
        { id: "fogareiro", nome: "Fogareiro", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro", formula: "1 até 8 pessoas" },
        { id: "cartucho_gas", nome: "Cartucho de gás", quantidade: 2, unidade: "", quantidadeTexto: "2", estado: "carro", formula: "teto(P × N / 8) + 1" },
        { id: "isqueiro", nome: "Isqueiro ou fósforos", quantidade: 2, unidade: "", quantidadeTexto: "2", estado: "carro" },
        { id: "para_vento", nome: "Para-vento", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "panelas", nome: "Panela, frigideira e chaleira", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" },
        { id: "utensilios", nome: "Faca, colher grande, espátula e abridor", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" },
        { id: "tabua", nome: "Tábua de corte", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "pratos", nome: "Prato, copo e talheres", quantidade: 4, unidade: "jogos", quantidadeTexto: "4 jogos", estado: "carro" },
        { id: "cooler", nome: "Cooler", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "limpeza", nome: "Esponja, detergente, pano e bacia", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" },
        { id: "sacos_lixo", nome: "Sacos de lixo", quantidade: 6, unidade: "", quantidadeTexto: "6", estado: "carro", formula: "2 × D" },
        { id: "papel_toalha", nome: "Papel-toalha", quantidade: 1, unidade: "rolo", quantidadeTexto: "1 rolo", estado: "carro" },
        { id: "mesa", nome: "Mesa dobrável", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "cadeiras", nome: "Cadeiras", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro", formula: "A + C" },
        { id: "carvao", nome: "Carvão", quantidade: 1, unidade: "saco de 4 kg", quantidadeTexto: "1 saco de 4 kg", estado: "carro", sacos: 1, kgPorSaco: 4, formula: "1 saco de 4 kg para cada 8 pessoas" }
      ]
    },
    {
      id: "comida", aberta: false, progresso: { noCarro: 5, total: 5 },
      itens: [
        { id: "agua", nome: "Água potável", quantidade: 36, unidade: "L em 8 galões de 5 L", quantidadeTexto: "36 L em 8 galões de 5 L", estado: "carro", litros: 36, galoes: 8, litrosPorGalao: 5, formula: "3 L × P × D em galões de 5 L, para cima" },
        { id: "gelo", nome: "Gelo", quantidade: 2, unidade: "sacos de 5 kg", quantidadeTexto: "2 sacos de 5 kg", estado: "carro", sacos: 2, kgPorSaco: 5, formula: "teto(D / 2) × teto(P / 4) sacos de 5 kg" },
        { id: "refeicoes", nome: "Comida das refeições", quantidade: null, unidade: "", tarefa: "3 cafés, 3 almoços e 2 jantares", quantidadeTexto: "tarefa: 3 cafés, 3 almoços e 2 jantares", estado: "carro", cafes: 3, almocos: 3, jantares: 2, formula: "D cafés, D almoços, N jantares", provisorio: "P-06" },
        { id: "temperos", nome: "Sal, óleo, açúcar e café", quantidade: 1, unidade: "kit", quantidadeTexto: "1 kit", estado: "carro" },
        { id: "lanches", nome: "Lanches para a estrada", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro" }
      ]
    },
    {
      id: "roupa", aberta: false, progresso: { noCarro: 6, total: 6 },
      itens: [
        { id: "mudas", nome: "Mudas de roupa", quantidade: 12, unidade: "", quantidadeTexto: "12 (3 por pessoa)", estado: "carro", porPessoa: 3, formula: "D por pessoa" },
        { id: "roupa_dormir", nome: "Roupa de dormir", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro" },
        { id: "agasalho", nome: "Agasalho", quantidade: 8, unidade: "", quantidadeTexto: "8 (2 por pessoa)", estado: "carro", porPessoa: 2, formula: "2 por pessoa no frio" },
        { id: "gorro_meia", nome: "Gorro e meia grossa", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro" },
        { id: "calcado", nome: "Calçado fechado", quantidade: 4, unidade: "pares", quantidadeTexto: "4 pares", estado: "carro" },
        { id: "chinelo", nome: "Chinelo", quantidade: 4, unidade: "pares", quantidadeTexto: "4 pares", estado: "carro" }
      ]
    },
    {
      id: "higiene", aberta: false, progresso: { noCarro: 6, total: 6 },
      itens: [
        { id: "toalha", nome: "Toalha", quantidade: 4, unidade: "", quantidadeTexto: "4", estado: "carro" },
        { id: "kit_higiene", nome: "Escova, pasta, sabonete e xampu", quantidade: 1, unidade: "kit", quantidadeTexto: "1 kit", estado: "carro" },
        { id: "papel_higienico", nome: "Papel higiênico", quantidade: 2, unidade: "rolos", quantidadeTexto: "2 rolos", estado: "carro", formula: "teto(P × N / 4) rolos" },
        { id: "protetor", nome: "Protetor solar", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "repelente", nome: "Repelente", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "lencos", nome: "Lenços umedecidos", quantidade: 1, unidade: "pacote", quantidadeTexto: "1 pacote", estado: "carro" }
      ]
    },
    {
      id: "socorros", aberta: true, progresso: { noCarro: 6, total: 7 },
      itens: [
        { id: "kit_socorros", nome: "Kit de primeiros socorros", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "remedio_lucas", nome: "Remédio do Lucas", quantidade: null, unidade: "", tarefa: "conferir", quantidadeTexto: "tarefa: conferir", estado: "separei", provisorio: "P-05, P-06" },
        { id: "lanterna", nome: "Lanterna", quantidade: 2, unidade: "", quantidadeTexto: "2", estado: "carro", formula: "A" },
        { id: "lampiao", nome: "Lampião", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "pilhas", nome: "Pilhas ou baterias de reserva", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" },
        { id: "bateria_portatil", nome: "Bateria portátil", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "balde", nome: "Balde para água perto do fogo", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" }
      ]
    },
    {
      id: "ferramentas", aberta: true, progresso: { noCarro: 5, total: 6 },
      itens: [
        { id: "canivete", nome: "Canivete ou faca de uso geral", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "corda", nome: "Corda e prendedores", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "fita_adesiva", nome: "Fita adesiva forte", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "extensao", nome: "Extensão elétrica", quantidade: 1, unidade: "", detalhe: "20 m", quantidadeTexto: "1 · 20 m", estado: "carro", metros: 20, motivo: "Tomada longe: extensão de 20 m", ajuste: "entrou_extensao" },
        { id: "carregador", nome: "Carregador", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "separei", provisorio: "P-05" },
        { id: "cintas", nome: "Cintas para amarrar a carga", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" }
      ]
    },
    {
      id: "lazer", aberta: false, progresso: { noCarro: 1, total: 1 },
      itens: [
        { id: "baralho", nome: "Baralho ou jogo", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" }
      ]
    },
    {
      id: "documentos", aberta: false, progresso: { noCarro: 3, total: 3 },
      itens: [
        { id: "documentos", nome: "Documentos e carteira", quantidade: null, unidade: "", tarefa: "conferir", quantidadeTexto: "tarefa: conferir", estado: "carro", provisorio: "P-06" },
        { id: "reserva", nome: "Comprovante da reserva", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "dinheiro", nome: "Dinheiro em espécie", quantidade: null, unidade: "", tarefa: "conferir", quantidadeTexto: "tarefa: conferir", estado: "carro", provisorio: "P-06" }
      ]
    },
    {
      id: "criancas", aberta: false, progresso: { noCarro: 2, total: 2 },
      itens: [
        { id: "muda_crianca", nome: "Muda extra por criança", quantidade: 2, unidade: "", quantidadeTexto: "2", estado: "carro", formula: "C + T" },
        { id: "brinquedos", nome: "Brinquedos e bola", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" }
      ]
    },
    {
      id: "pet", aberta: false, progresso: { noCarro: 6, total: 6 },
      itens: [
        { id: "racao", nome: "Ração", quantidade: 4, unidade: "dias", quantidadeTexto: "porções para 4 dias", estado: "carro", dias: 4, formula: "porções para D + 1 dias" },
        { id: "potes", nome: "Potes de água e comida", quantidade: 1, unidade: "jogo", quantidadeTexto: "1 jogo", estado: "carro" },
        { id: "guia_coleira", nome: "Guia e coleira com identificação", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "vacinacao", nome: "Carteira de vacinação", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" },
        { id: "saquinhos", nome: "Saquinhos higiênicos", quantidade: 1, unidade: "rolo", quantidadeTexto: "1 rolo", estado: "carro" },
        { id: "caminha", nome: "Manta ou caminha", quantidade: 1, unidade: "", quantidadeTexto: "1", estado: "carro" }
      ]
    }
  ];

  window.CAMPINGUIM_DADOS = {
    fonte: "design/prototipos/direcao/telas.md",
    data: "24/11/2026",

    /* Seção 0 de telas.md. Quem usa: Carla, a organizadora, no celular dela. */
    cenario: {
      usuaria: "Carla",
      usuariaNomeCurto: "Carla R."
    },

    familia: {
      pessoas: [
        { id: "carla", nome: "Carla", faixa: "adulto" },
        { id: "rafael", nome: "Rafael", faixa: "adulto" },
        { id: "lucas", nome: "Lucas", idade: 9, faixa: "crianca" },
        { id: "bia", nome: "Bia", idade: 5, faixa: "crianca" }
      ],
      /* O app só conta pets (E1-01); Mel não aparece em nenhuma tela. */
      pet: { quantidade: 1, especie: "cachorra", nome: "Mel", aparece: false, provisorio: "P-03" }
    },

    /* Faixas do PRD, seção 10. Chaves dos rótulos em textos.js: "campo.<faixa>". */
    faixas: { adultos: 2, adolescentes: 0, criancas: 2, menores5: 0, pets: 1 },

    /* Variáveis da lista (spec seção 5): viagem de referência dos casos L1 a L3. */
    variaveis: { P: 4, A: 2, C: 2, T: 0, N: 2, D: 3, pets: 1, clima: "frio", chuva: false },

    /* Tela 2 · Criar viagem. Rótulos das opções em textos.js ("opcao.tipo.<id>", "opcao.clima.<id>"). */
    viagem: {
      tipo: "barraca_carro",
      tipos: ["barraca_carro", "trilha_mochila", "motorhome"],
      noites: 2,
      datas: null,
      clima: "frio",
      climas: ["frio", "ameno", "calor"],
      chuva: false,
      obrigatorios: ["tipo", "noites", "pessoas"],
      destino: { camping: "Camping Recanto das Águas", cidade: "", provisorio: "P-07" },
      /* Exemplo de camping sem dados, ligação 2 → 13. */
      destinoSemDados: "Sítio Pedra Lisa",
      cabecalho: "2 noites · Camping Recanto das Águas"
    },

    /* Tela 3 · Alertas do camping. nivel: "atencao" | "informacao". */
    camping: {
      nome: "Camping Recanto das Águas",
      confirmacoes: 7
    },

    alertas: [
      { id: "chuveiro", nivel: "atencao", texto: "1 chuveiro quente para cerca de 25 barracas" },
      /* D-01: nível do pedido; se o responsável preferir o PRD, muda só este campo para "informacao". */
      { id: "churrasco", nivel: "atencao", texto: "Churrasco só no quiosque comum", provisorio: "P-23" },
      { id: "pet", nivel: "informacao", texto: "Aceita pet" },
      { id: "energia", nivel: "informacao", texto: "Energia: 220 V, tomada longe da barraca" }
    ],

    /* Ajustes na lista, cada um com "desfazer" (E3-08). Só os 3 do pedido (D-02). tipo: "entrou" | "saiu" | "tarefa". */
    ajustes: {
      provisorio: "P-04",
      itens: [
        { id: "entrou_extensao", tipo: "entrou", item: "Extensão de 20 m", motivo: "Tomada longe", itemDaLista: "extensao" },
        { id: "saiu_grelha", tipo: "saiu", item: "Grelha portátil", motivo: "Churrasco só no quiosque" },
        { id: "tarefa_aparelhos", tipo: "tarefa", item: "Conferir os aparelhos", motivo: "220 V", tarefaDaLista: "aparelhos" }
      ]
    },

    /* Regras, cada uma com o botão "ciente" (E3-07); nenhuma marcada no início. */
    regras: [
      { id: "som", texto: "Som até 22h", ciente: false, fato: "som" },
      { id: "piscina", texto: "Piscina abre às 10h", ciente: false }
    ],

    /* Tela 4 · Lista. Lista da família (P-01), momento "antes de sair" (P-02). */
    lista: {
      provisorio: "P-01",
      momento: { id: "antes_de_sair", provisorio: "P-02" },
      cabecalho: "2 noites · Camping Recanto das Águas",
      total: 68,
      noCarro: 65,
      separei: 3,
      aSeparar: 0,
      comprar: 0,
      filtros: ["a_separar", "separados", "no_carro", "comprar"],
      /* Faixa de tarefas no alto da lista: o texto é dado e não é reescrito pela direção. */
      tarefas: [
        { id: "aparelhos", texto: "Conferir os aparelhos (220 V)", feito: false, provisorio: "P-06" }
      ],
      categorias: categorias,
      /* Ausentes, só para conferência (telas.md, tela 4). Não aparecem nas telas. */
      ausentes: {
        porCondicao: ["Lona ou gazebo de sombra", "Tapete de entrada", "Lençol", "Capa de chuva", "Muda reserva", "Roupa de banho", "Chapéu", "Boia", "Fraldas", "Alimentação do bebê"],
        porAjuste: ["Grelha portátil"],
        porProposta: { itens: ["Ducha portátil", "Adaptador de tomada"], provisorio: "P-04" }
      }
    },

    /* Tela 5 · Item: Extensão elétrica, o único item com motivo vindo do camping. */
    itemDetalhe: {
      item: "extensao",
      nome: "Extensão elétrica",
      quantidade: 1,
      detalhe: "20 m",
      motivo: "Tomada longe: extensão de 20 m",
      estado: "carro",
      nota: "",
      comprar: false
    },

    /* Tela 6 · Aviso de saída (E1-06; D-04). */
    avisoSaida: {
      foraDoCarro: ["travesseiro_bia", "remedio_lucas", "carregador"],
      naoSeparados: []
    },

    /* Tela 7 · Durante a estadia. Ordem de telas.md; cada regra aponta para o registro de origem. */
    estadia: {
      regrasAMao: [
        { origem: "regra", id: "som", texto: "Som até 22h", fato: "som" },
        { origem: "regra", id: "piscina", texto: "Piscina abre às 10h" },
        { origem: "alerta", id: "churrasco", texto: "Churrasco só no quiosque comum" },
        { origem: "alerta", id: "pet", texto: "Aceita pet" },
        { origem: "alerta", id: "energia", texto: "Energia: 220 V, tomada longe da barraca" },
        { origem: "alerta", id: "chuveiro", texto: "1 chuveiro quente para cerca de 25 barracas" }
      ],
      confirmacoes: 7,
      faltou: []
    },

    /* Tela 8 · Checklist da volta (E1-10; D-05). Os 68 itens da lista, nas mesmas categorias. */
    volta: {
      itens: "lista",
      total: 68,
      conferidos: 0,
      conferidoInicial: false,
      secarInicial: false,
      lembreteDias: 2,
      desmontagem: [
        "Contar os espeques",
        "Apagar o fogo até esfriar",
        "Recolher todo o lixo",
        "Olhar o chão em volta da barraca antes de sair"
      ],
      emCasa: [
        "Abrir a barraca para secar",
        "Guardar o saco de dormir solto, fora do saco de compressão"
      ]
    },

    /* Tela 9 · Em casa: três passos, um por vez, com "pular" em cada um. */
    emCasa: {
      passo1: {
        /* Consumíveis; nenhuma opção marcada no início. resposta: null | "sobrou" | "faltou". */
        itens: [
          { id: "agua", nome: "Água potável", levado: "36 L em 8 galões", resposta: null },
          { id: "cartucho_gas", nome: "Cartucho de gás", levado: "2", resposta: null },
          { id: "gelo", nome: "Gelo", levado: "2 sacos de 5 kg", resposta: null },
          { id: "carvao", nome: "Carvão", levado: "1 saco de 4 kg", resposta: null }
        ]
      },
      passo2: {
        provisorio: "P-16",
        atual: 1,
        total: 4,
        regra: "Som até 22h",
        fato: "som",
        resposta: null,
        responderComo: ["Carla R.", "campista · família com crianças"]
      },
      passo3: {
        opcoes: [
          "abrir a piscina mais cedo",
          "mais chuveiros",
          "mais tomadas",
          "mais sombra",
          "banheiros mais limpos",
          "mais lixeiras"
        ],
        texto: "",
        limiteCaracteres: 200
      }
    },

    /* Tela 10 · Fato do camping (E3-14). */
    fato: {
      id: "som",
      nome: "Som até 22h",
      valor: "cumprida",
      confirmacoes: 6,
      ultima: { nome: "Carla R.", mesAno: "nov/2026" },
      frescor: "recente",
      resumo: "Som até 22h: cumprida · 6 confirmações · última: Carla R., nov/2026",
      historico: {
        provisorio: "P-08",
        linhas: [
          { nome: "Carla R.", mesAno: "nov/2026", tipo: "família com crianças" }
        ],
        outras: 5,
        outrasTexto: "e mais 5 confirmações de 'cumprida'"
      }
    },

    /* Tela 11 · Grupo (etapa 2). Organizadora: Carla. */
    grupo: {
      organizadora: "Carla",
      nomeViagem: { texto: "Viagem de Carla ao Camping Recanto das Águas", provisorio: "P-17" },
      familias: [
        { id: "carla_rafael", nome: "Carla e Rafael", descricao: "Carla e Rafael, com Lucas e Bia", pessoas: "2 adultos, 2 crianças", iniciais: "C&R", adultos: 2, adolescentes: 0, criancas: 2, menores5: 0 },
        { id: "bruno_paula", nome: "Bruno e Paula", descricao: "Bruno e Paula, com um bebê", pessoas: "2 adultos, 1 menor de 5", iniciais: "B&P", adultos: 2, adolescentes: 0, criancas: 0, menores5: 1 },
        { id: "diego_livia", nome: "Diego e Lívia", descricao: "Diego e Lívia", pessoas: "2 adultos", iniciais: "D&L", adultos: 2, adolescentes: 0, criancas: 0, menores5: 0 }
      ],
      /* Só o que o pedido dá (P-10), na ordem da página do convidado (tela 14). */
      itens: {
        provisorio: "P-10",
        lista: [
          { id: "isqueiro", nome: "Isqueiro", dono: null, semDono: true },
          { id: "saco_lixo", nome: "Saco de lixo", dono: null, semDono: true },
          { id: "fogareiro", nome: "Fogareiro", dono: null, assumidos: 3, duplicado: true, aviso: "3 fogareiros, precisa de todos?", provisorio: "P-09" },
          { id: "carne", nome: "Carne", dono: "Bruno", familia: "bruno_paula", gasto: true }
        ]
      },
      semDono: ["isqueiro", "saco_lixo"],
      duplicados: ["fogareiro"],
      quemLeva: ["carne"],
      progressoPorFamilia: { mostrar: false, provisorio: "P-10" }
    },

    /* Tela 12 · Gastos, vista pela Carla. Valores em centavos (E2-13, ao centavo).
       Divisão por cotas (PRD seção 10): adulto e adolescente 1 cota (2 meias); criança de 5 a 11 meia cota; menor de 5 não paga. */
    gastos: {
      item: "Carne",
      comprou: "Bruno",
      compradorFamilia: "bruno_paula",
      totalCentavos: 42000,
      meiasCotas: 14,
      cotas: 7,
      meiaCotaCentavos: 3000,
      cotaCentavos: 6000,
      /* situacao: "a_pagar" | "ja_pago" (rótulos em textos.js). */
      familias: [
        { familia: "carla_rafael", nome: "Carla e Rafael", pessoas: "2 adultos, Lucas (9), Bia (5)", meiasCotas: 6, cotas: 3, valorCentavos: 18000, situacao: "a_pagar" },
        { familia: "bruno_paula", nome: "Bruno e Paula", pessoas: "2 adultos, bebê", meiasCotas: 4, cotas: 2, valorCentavos: 12000, situacao: "ja_pago", comprador: true },
        { familia: "diego_livia", nome: "Diego e Lívia", pessoas: "2 adultos", meiasCotas: 4, cotas: 2, valorCentavos: 12000, situacao: "a_pagar" }
      ],
      compradorRecebeCentavos: 30000,
      /* Bloco da Carla (E2-14). */
      usuaria: {
        familia: "carla_rafael",
        deveA: "Bruno",
        deveCentavos: 18000,
        pix: { tipo: "e-mail", chave: "bruno@example.com", provisorio: "P-11" },
        paguei: { marcado: false, provisorio: "P-12" }
      }
    },

    /* Tela 13 · Camping sem dados (E3-09, E3-10). */
    campingSemDados: {
      nome: "Sítio Pedra Lisa",
      cidade: "",
      provisorio: "P-13",
      itensNaDuvida: [
        { id: "agua", nome: "Água potável", quantidadeTexto: "36 L em 8 galões", provisorio: "P-14" },
        { id: "extensao", nome: "Extensão elétrica", quantidadeTexto: "1" },
        { id: "adaptador", nome: "Adaptador de tomada", quantidadeTexto: "1" },
        { id: "ducha", nome: "Ducha portátil", quantidadeTexto: "1" }
      ],
      perguntas: {
        provisorio: "P-15",
        abertura: "Oi! Vou acampar aí e queria confirmar:",
        linhas: [
          "Tem energia elétrica? É 127 V ou 220 V, e a tomada fica perto das barracas?",
          "Quantos chuveiros há, e para mais ou menos quantas barracas?",
          "Tem água quente no banho?",
          "Pode fazer churrasco perto da barraca, ou só em área comum?",
          "Aceita pet?",
          "Tem horário de silêncio? A partir de que horas?",
          "Tem piscina? Que horas abre?"
        ]
      }
    },

    /* Tela 14 · Página do convidado (web). O convidado é Diego. */
    convidado: {
      convite: { viagem: "Viagem de Carla ao Camping Recanto das Águas", convidouPor: "Carla", provisorio: "P-17" },
      nome: "Diego",
      familia: "Diego e Lívia",
      familiaId: "diego_livia",
      itens: "grupo",
      assumirExemplo: "isqueiro",
      deve: { a: "Bruno", centavos: 12000, item: "carne" }
    },

    /* Tela 15 · Página inicial do site (web). O texto "o que é" (P-19) e o consentimento (P-18) estão em textos.js. */
    site: {
      resumoLista: "Barraca com carro · 2 noites · 2 adultos e 2 crianças · 1 pet · frio",
      lista: "lista"
    },

    /* Índice das propostas provisórias de telas.md (seção 2) e onde cada uma está. */
    provisorias: {
      "P-01": "lista",
      "P-02": "lista.momento",
      "P-03": "familia.pet",
      "P-04": "ajustes; lista.ausentes.porProposta",
      "P-05": "lista: travesseiro, travesseiro_bia, remedio_lucas, carregador",
      "P-06": "lista.tarefas; itens com tarefa (refeicoes, remedio_lucas, documentos, dinheiro)",
      "P-07": "viagem.destino.cidade",
      "P-08": "fato.historico",
      "P-09": "grupo.itens.lista: fogareiro",
      "P-10": "grupo.itens; grupo.progressoPorFamilia",
      "P-11": "gastos.usuaria.pix",
      "P-12": "gastos.usuaria.paguei",
      "P-13": "campingSemDados",
      "P-14": "campingSemDados.itensNaDuvida: agua",
      "P-15": "campingSemDados.perguntas",
      "P-16": "emCasa.passo2",
      "P-17": "grupo.nomeViagem; convidado.convite",
      "P-18": "textos.js: site.consentimento",
      "P-19": "textos.js: site.oQueE",
      "P-20": "mascote.js (cores da versão colorida fixas; nenhuma direção muda)",
      "P-21": "fontes/ (baixadas uma vez na etapa 0)",
      "P-22": "LEIA-ME.md (abre por file:// e por servidor estático)",
      "P-23": "alertas: churrasco"
    }
  };
})();
