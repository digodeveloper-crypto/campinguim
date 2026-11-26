// Textos das telas da prova de sincronização (F0-2), em português do Brasil.
// Arquivo separado do textos.ts da base para as tarefas paralelas da prova não mexerem no mesmo
// arquivo; a base B1 junta tudo num arquivo só.
export const textosSinc = {
  entrar: {
    titulo: 'Entrar',
    email: 'E-mail',
    senha: 'Senha',
    botao: 'Entrar',
    entrando: 'Entrando…',
    erro: 'Não deu para entrar. Confira o e-mail e a senha.',
    pronto: 'Você entrou. A lista sincroniza quando houver internet.',
    semConta: 'Usar sem conta',
  },
  lista: {
    titulo: 'Lista',
    naoEncontrada: 'Esta viagem não está neste aparelho.',
    conectado: 'sincronizando',
    desconectado: 'sem conexão: tudo fica guardado no aparelho',
    semLogin: 'sem login: nada sincroniza',
    aguardando: (n: number) => (n === 1 ? '1 alteração aguardando envio' : `${n} alterações aguardando envio`),
    tudoEnviado: 'tudo enviado',
    quantidade: (q: number) => `qtd ${q}`,
    estados: { todo: 'a separar', set_aside: 'separado', in_car: 'no carro' } as Record<string, string>,
    assumidoPor: (nomes: string) => `assumido por: ${nomes}`,
    duplicado: 'duas famílias assumiram este item',
    historico: (n: number) => (n === 1 ? '1 troca no histórico' : `${n} trocas no histórico`),
    separar: 'Separar',
    noCarro: 'No carro',
    assumir: 'Assumir',
    maisUm: '+1',
    remover: 'Remover',
    removidos: 'Removidos',
    restaurar: 'Restaurar',
    novoItem: 'Novo item',
    adicionar: 'Adicionar',
    avisoRecusadas: (n: number) =>
      n === 1
        ? '1 alteração sua não foi aceita: você não faz mais parte desta viagem.'
        : `${n} alterações suas não foram aceitas: você não faz mais parte desta viagem.`,
    teste: 'Teste da prova',
    gerar200: 'Gerar 200 alterações',
    medir20: 'Medir 20 alterações online',
    maiorPausa: (ms: number) => `maior pausa da tela: ${ms} ms`,
    toques: (n: number) => `toques: ${n}`,
    tocar: 'Tocar',
  },
  semConta: {
    titulo: 'Sem conta',
    explicacao: 'Sem login, as viagens ficam só neste aparelho. No primeiro login, elas sobem com os mesmos itens.',
    criar: 'Criar 2 viagens de teste',
    criadas: (n: number) => `${n} viagens neste aparelho`,
    viagem: (n: number) => `Viagem sem conta ${n}`,
  },
  avisos: {
    recusadas: 'recusadas',
  },
} as const;
