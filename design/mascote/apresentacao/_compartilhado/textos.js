/* Todos os textos da interface da apresentação (pt-BR). Nada de texto solto no código. */
window.TEXTOS = {
  produto: "Campinguim",
  tituloApresentacao: "Mascote do Campinguim · 10 opções",

  topo: {
    inicio: "Início",
    comparacao: "Comparação",
    avaliacao: "Avaliação",
    fundoRotulo: "Fundo da arte",
    fundoClaro: "Claro",
    fundoEscuro: "Escuro",
    navRotulo: "Páginas",
    fundoDica: "Alterna o fundo em que a arte é exibida, para julgar a leitura sob sol e em tela escura."
  },

  inicial: {
    titulo: "10 opções de mascote",
    intro: "Dez pinguins de desenho original para o Campinguim, todos no mesmo tamanho e sobre o mesmo fundo. Abra cada opção para ver vistas, poses e usos reais. A folha de avaliação fica no menu do topo.",
    abrir: "Ver opção",
    emProducao: "em produção",
    emProducaoFrase: "Esta opção ainda não foi entregue.",
    naoValidada: "não validada",
    naoValidadaFrase: "Entregue, mas não validada: a escolha do mascote foi feita antes.",
    ariaOpcao: "Opção {n}: {nome}"
  },

  opcao: {
    tituloPagina: "Opção {n} · {nome}",
    tituloPaginaVazia: "Opção {n} · em produção",
    tituloPaginaNaoValidada: "Opção {n} · não validada",
    opcaoRotulo: "Opção",
    anterior: "Anterior",
    proxima: "Próxima",
    voltarInicio: "Voltar à inicial",
    avaliarEsta: "Avaliar esta opção",
    naoValidadaTitulo: "Opção não validada",
    naoValidadaTexto: "Entregue, mas não validada: a escolha do mascote foi feita antes.",
    emProducaoTitulo: "Esta opção está em produção",
    emProducaoTexto: "A arte e os textos desta opção ainda não foram entregues. Esta página monta tudo sozinha assim que eles chegarem.",
    exemploAviso: "Página de teste da estrutura, com arte de marcação. Não faz parte das 10 opções.",

    secPrincipal: "O mascote",
    semAcessorio: "Sem o acessório",
    comAcessorio: "Com o acessório",
    secVistas: "Três vistas",
    secVistasNota: "Frente, lado e três quartos: mostram que a forma se sustenta em volume (3D).",
    vistaFrente: "Frente",
    vistaLado: "Lado",
    vistaTresQuartos: "Três quartos",
    secPoses: "Poses",
    poseNeutro: "Neutro",
    poseComemorando: "Comemorando",
    poseAlerta: "Em alerta",
    poseCamping: "Em situação de camping",
    poseExtra: "Pose extra",
    secUsos: "Usos reais",
    secUsosNota: "Montados pela página a partir da arte da opção, iguais para todas. Tipografia e fundos são neutros; só a paleta sugerida entra como acento.",
    usoIcone: "Ícone do app em tamanho pequeno",
    usoAbertura: "Tela de abertura",
    usoTela: "Uma tela do app",
    usoSite: "Cabeçalho do site",
    usoUmaCor: "Versão em uma cor só",
    secUmaCor: "Versão em uma cor",
    secUmaCorNota: "O mascote precisa ser reconhecido sem depender de cor.",
    secIcone: "Ícone em 48 px",
    secIconeNota: "Primeiro a versão grande; depois o ícone no tamanho real de 48 px, sem ampliar, sobre fundo claro e escuro.",
    iconeGrande: "Versão grande",
    icone48Claro: "48 px sobre claro",
    icone48Escuro: "48 px sobre escuro",
    secPaleta: "Paleta sugerida e raciocínio",
    paletaTitulo: "Paleta sugerida",
    raciocinioTitulo: "O raciocínio da opção",
    estudo: {
      titulo: "Estudo ilustrado",
      rotulo: "Estudo gerado por IA a partir do desenho aprovado. A arte oficial é o vetor, mostrado nas seções acima; esta imagem é só uma leitura de volume e textura.",
      legenda: "Estudo ilustrado (gerado por IA, não é a arte oficial)",
      alt: "Estudo ilustrado do mascote, gerado por IA a partir do vetor aprovado"
    },
    secOriginalidade: "Originalidade",
    originalidadeSelo: "Checagem de originalidade feita (MSC-06)",
    pendenciasTitulo: "Pendências do arquivo de dados desta opção",
    pendenciasNota: "Aviso para quem preenche a opção. Some quando o dados.js estiver completo.",
    arteAusente: "arte ausente",
    arteAusenteDetalhe: "Arquivo não encontrado: {arquivo}"
  },

  pendencias: {
    campoAusente: "campo ausente: {campo}",
    raciocinio: "raciocinio deve ter exatamente 3 linhas",
    paletaVazia: "paleta vazia",
    paletaItem: "paleta[{i}]: precisa de nome, hex (#rrggbb) e papel",
    arteSemCaminho: "arte.{chave} sem caminho",
    arteNaoCarregou: "arquivo de arte não encontrado ou não carregou: {arquivo}",
    posesExtras: "poses_extras tem {n} itens; o limite é 3",
    numeroDiferente: "numero \"{numero}\" é diferente da pasta desta opção (\"{pasta}\")",
    chaveDiferente: "o dados.js registrou a opção com a chave \"{chave}\", mas esta pasta é a \"{pasta}\": troque a chave entre colchetes e o campo numero para \"{pasta}\""
  },

  usos: {
    iconesVizinhos: ["Notas", "Fotos", "Mapa", "Relógio", "Agenda", "Música", "Ajustes"],
    telaInicialRotulo: "Campinguim",
    aberturaBotao: "Começar",
    telaTitulo: "Camping Recanto das Águas",
    telaSub: "Confirmado por 7 campistas · aceita pet",
    telaFonte: "última: Carla R., nov/2026",
    telaRegrasTipo: "Regras",
    telaRegrasFato: "Som até 22h: cumprida · 6 confirmações · última: Carla R., nov/2026",
    telaAlertaTitulo: "Atenção",
    telaAlerta1: "1 chuveiro quente para cerca de 25 barracas.",
    telaAlerta2: "Churrasco só no quiosque comum.",
    telaEntrou: "Entrou",
    telaEntrouItem: "Extensão de 20 m (tomada longe)",
    telaSaiu: "Saiu",
    telaSaiuItem: "Grelha portátil (churrasco só no quiosque)",
    telaTarefa: "Tarefa",
    telaTarefaItem: "Conferir os aparelhos (220 V)",
    siteBotao: "Entrar na lista de espera",
    siteChamada: "Monte a lista do que levar para acampar.",
    siteSub: "Saiba o que o camping escolhido tem e o que não tem antes de sair de casa."
  },

  comparacao: {
    titulo: "Comparação",
    intro: "Os ícones no tamanho real de 48 px e as versões em uma cor, lado a lado.",
    secIcones: "Ícones em 48 px",
    secUmaCor: "Versões em uma cor",
    emProducao: "em produção",
    naoValidada: "não validada",
    verOpcao: "Abrir a opção {n}",
    recomendacaoLink: "Recomendação da Cinema",
    recomendacaoAvisoTitulo: "Antes de abrir",
    recomendacaoAviso: "A página seguinte traz as três opções preferidas da Cinema e o motivo. Ela fica separada para não influenciar a primeira olhada. Só abra depois de ver todas as opções.",
    recomendacaoVoltar: "Ainda não",
    recomendacaoAbrir: "Abrir a recomendação"
  },

  recomendacao: {
    titulo: "Recomendação da Cinema",
    intro: "As três opções preferidas da Cinema e o motivo de cada uma.",
    vazia: "A recomendação ainda não foi escrita.",
    posicao: "{p}ª preferida",
    voltar: "Voltar à comparação",
    semOpcao: "Opção {n} (não encontrada)"
  },

  avaliacao: {
    titulo: "Folha de avaliação",
    intro: "Para cada opção, dê uma nota de 1 a 5 em cada critério. As notas ficam guardadas neste navegador. Copie o resultado como texto para enviar.",
    escala: "1 = fraco · 5 = excelente",
    resumoTitulo: "Resumo",
    colOpcao: "Opção",
    colTotal: "Total",
    totalDe: "{t} de 35",
    semNota: "–",
    legendaCriterios: "Rec = Reconhecimento · Íco = Ícone · Sim = Simpatia · Pre = Premium · Alc = Alcance · Víd = Vídeo · Só = Só seu",
    copiar: "Copiar como texto",
    copiado: "Copiado.",
    copiarFalhou: "Não foi possível copiar sozinho. Selecione o texto abaixo e copie.",
    textoCaixa: "Texto para enviar",
    limpar: "Apagar todas as notas",
    limparConfirmaTitulo: "Apagar todas as notas?",
    limparConfirmaTexto: "As notas das 10 opções serão removidas deste navegador.",
    limparSim: "Apagar",
    limparNao: "Cancelar",
    armazenamentoFalhou: "Este navegador não permite guardar as notas. Elas valem só enquanto a página estiver aberta; copie o texto antes de sair.",
    emProducao: "em produção",
    naoValidada: "não validada",
    notaRotulo: "{c}: nota {v}",
    textoCabecalho: "Avaliação dos mascotes do Campinguim",
    textoLinha: "{n} {nome}: {notas} | total {total}",
    criterios: [
      { id: "reconhecimento", nome: "Reconhecimento", curto: "Rec", pergunta: "Em um segundo, dá para ver que é um pinguim que acampa?" },
      { id: "icone", nome: "Ícone", curto: "Íco", pergunta: "No tamanho pequeno, ele se destaca entre outros apps?" },
      { id: "simpatia", nome: "Simpatia", curto: "Sim", pergunta: "Dá vontade de ter esse personagem avisando você?" },
      { id: "premium", nome: "Premium", curto: "Pre", pergunta: "Parece de um produto bem feito?" },
      { id: "alcance", nome: "Alcance", curto: "Alc", pergunta: "Funciona para criança, adulto, Brasil e fora?" },
      { id: "video", nome: "Vídeo", curto: "Víd", pergunta: "Dá para imaginar esse personagem passando frio, calor e chuva em 3D?" },
      { id: "soseu", nome: "Só seu", curto: "Só", pergunta: "Não lembra nenhum outro pinguim?" }
    ]
  },

  rodape: {
    nota: "Nomes, cores e fundos desta apresentação são neutros. A identidade visual do app é assunto da etapa seguinte."
  },

  erros: {
    semScript: "Esta apresentação precisa de JavaScript ativo no navegador."
  }
};
