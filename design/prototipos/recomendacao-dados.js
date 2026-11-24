/* Campinguim · protótipos · conteúdo da recomendação da Cinema (padrão de produção, seção 10; etapa 3).
   Fica vazio até os cinco protótipos serem aprovados pelo QA. Na etapa 3, a Cinema preenche:
   - pronta: true;
   - direcao: a pasta da direção recomendada ("brasa", "clareira", "oficina", "rumo" ou "roda");
   - resumo: uma frase;
   - motivos e riscos: frases curtas, em listas;
   - combinacao: opcional, se a recomendação for juntar traços de duas direções.
   Textos em português do Brasil. Nenhum dado do cenário aqui (ele está em _compartilhado/dados.js). */
window.CAMPINGUIM_RECOMENDACAO = {
  pronta: true,
  direcao: "rumo",
  resumo: "É a que mais parece feita por quem acampa, com a viagem inteira desenhada como uma rota de cinco paradas, da sala de casa até a volta, e com o botão principal mais forte das cinco.",
  motivos: [
    "A rota no alto de cada tela mostra em que momento da viagem a família está, e o pinguim pequeno marca a parada atual como quem diz \"você está aqui\".",
    "O botão principal é o mais contrastado das cinco: tinta quase preta sobre papel claro, largo, no rodapé; o texto lê bem ao sol, com folga sobre o mínimo, e os números ficam alinhados.",
    "Na lista, o item que ainda não foi para o carro ganha uma faixa na borda e a frase \"separei · fora do carro\", então dá para achar o que falta sem depender da cor.",
    "O que os campistas confirmaram aparece num selo com quantos confirmaram e quando, que é a ideia do app de que toda informação tem autor e data.",
    "A ação principal fica sempre no rodapé, e a legenda que leva ao camping, ao grupo e aos gastos abre de baixo para cima, perto do polegar.",
    "Com a letra no dobro do tamanho, a rota vira números e a legenda encolhe para uma palavra, e as telas continuam inteiras."
  ],
  riscos: [
    "A rota fica no alto da tela: trocar de etapa com uma mão pede esticar o polegar ou deslizar a tela para o lado.",
    "Grupo e gastos ficam dentro da legenda; quem abre o app só para ver a conta precisa aprender esse caminho.",
    "O topo, com a rota, o título largo e as curvas de nível, é alto: na lista, os itens só aparecem depois de rolar um pouco.",
    "É a mais trabalhosa de manter: curvas de nível, rota e selo precisam de cuidado em cada tela nova, e o pinguim pequeno da rota precisa ser conferido sempre que o desenho mudar."
  ],
  combinacao: ""
};
