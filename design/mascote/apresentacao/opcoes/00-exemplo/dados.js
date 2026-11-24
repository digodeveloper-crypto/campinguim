/* ===================================================================
   dados.js · modelo comentado de uma opção
   Copie este arquivo para opcoes/NN/dados.js (NN = 01 a 10), troque os
   valores e coloque a arte em opcoes/NN/arte/. Não mexa em mais nada:
   as páginas montam tudo sozinhas, sempre na mesma estrutura.

   Regras:
   - Mantenha as duas primeiras linhas (o registro global) como estão.
   - A chave entre colchetes é o número da opção, com dois dígitos.
   - "pronta: true" faz a opção sair de "em produção". Enquanto estiver
     false (ou o arquivo for o original de espaço reservado), a página
     mostra "em produção".
   - Caminhos de arte são relativos à pasta da opção (opcoes/NN/).
   - Textos em português do Brasil, com acentos. Sem marcas de terceiros.
   =================================================================== */
window.CAMPINGUIM_OPCOES = window.CAMPINGUIM_OPCOES || {};
window.CAMPINGUIM_OPCOES["00"] = {
  pronta: true,                       // true quando a opção estiver entregue
  numero: "00",                       // "01" a "10", igual à chave e à pasta
  nome: "Exemplo de marcação",        // nome curto (até ~3 palavras)
  frase: "Opção de teste: formas cinzas com o nome do espaço escrito, só para provar que a página monta.", // uma frase sobre a ideia

  // O raciocínio da opção: EXATAMENTE 3 linhas curtas.
  raciocinio: [
    "Linha 1: de onde vem a ideia do desenho.",
    "Linha 2: como ele remete ao camping sem depender de detalhe pequeno.",
    "Linha 3: por que funciona no ícone, em uma cor e em 3D."
  ],

  // Paleta sugerida: 3 a 6 cores. A PRIMEIRA vira o acento das simulações
  // (alertas, botão do site, barra da abertura). Use hex de 6 dígitos (#rrggbb).
  paleta: [
    { nome: "Cinza-chumbo", hex: "#4a4a50", papel: "contorno e corpo principal" },
    { nome: "Cinza-claro",  hex: "#c8c8cc", papel: "barriga e detalhes" },
    { nome: "Cinza-médio",  hex: "#8a8a90", papel: "sombras e volume" }
  ],

  // Declaração de que a checagem de originalidade (MSC-06) foi feita:
  // diga o que foi comparado (pinguins de marca, desenho, jogo, sistema e
  // o logotipo da marca de equipamentos Pinguin) e o resultado.
  originalidade: "Checagem feita: comparado com pinguins de marcas, desenhos, jogos e sistemas conhecidos e com o logotipo da marca de equipamentos Pinguin. Nenhuma semelhança encontrada. (Texto de exemplo.)",

  // Poses extras (opcional). Cada uma: titulo + arte (caminho do arquivo).
  // Total de poses na página: 4 obrigatórias + até 3 extras = de 4 a 7.
  // Toda opção deve mostrar ao menos uma situação de desconforto (frio, calor
  // ou chuva), como pose-camping ou como pose extra.
  poses_extras: [
    { titulo: "Com frio", arte: "arte/pose-extra-frio.svg" },
    { titulo: "Com calor", arte: "arte/pose-extra-calor.svg" },
    { titulo: "Na chuva", arte: "arte/pose-extra-chuva.svg" }
  ],

  // Os 10 arquivos de arte obrigatórios (.svg ou .png, fundo transparente).
  // Pode trocar a extensão por arquivo; os nomes das chaves não mudam.
  arte: {
    "principal":          "arte/principal.svg",           // mascote grande
    "vista-frente":       "arte/vista-frente.svg",        // vista de frente
    "vista-lado":         "arte/vista-lado.svg",          // vista de lado
    "vista-tres-quartos": "arte/vista-tres-quartos.svg",  // vista de três quartos
    "pose-neutro":        "arte/pose-neutro.svg",         // pose: neutro
    "pose-comemorando":   "arte/pose-comemorando.svg",    // pose: comemorando
    "pose-alerta":        "arte/pose-alerta.svg",         // pose: em alerta
    "pose-camping":       "arte/pose-camping.svg",        // pose: situação de camping
    "icone":              "arte/icone.svg",               // otimizado para 48 px (sem detalhe fino)
    "uma-cor":            "arte/uma-cor.svg",             // versão em uma cor só

    // OPCIONAL: a figura sem o acessório. Obrigatório só se a opção usa
    // acessório (mochila, lanterna, lenço, caneca). Declarado: a página mostra
    // o bloco "Sem o acessório" ao lado do mascote principal. Não declare
    // esta linha se não houver acessório: o bloco simplesmente não aparece.
    "sem-acessorio":      "arte/sem-acessorio.svg"
  }
};
