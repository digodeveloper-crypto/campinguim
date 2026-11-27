// Componentes visuais do Rumo (B2). Catálogo, propriedades, estados e decisões: docs/componentes.md.
export { Texto } from './Texto';
export { Tela } from './Tela';
export { Curvas } from './Curvas';
export { CantoCortado } from './CantoCortado';
export { Mascote } from './mascote/Mascote';
export { Rota, PARADAS, nomeFaladoDaParada, type Parada } from './Rota';
export { CabecalhoEtapa, marcaDaEtapa } from './CabecalhoEtapa';
export { Botao, BotaoMarca, Alternancia, Filtro, Discreto, BotaoFechar, BotaoVoltar, LinhaDeBotoes } from './Botoes';
export { LinhaEstado, Folha, Divisoria, Faixa, ItemLista, Regua, Categoria, FaixaTarefa, ESTADOS, nomeFaladoDoItem, type Estado, type EstadoItem } from './Lista';
export { GrupoDeAlertas, LinhaAlerta, type Nivel, type TipoAlerta } from './Alertas';
export { Selo } from './Selo';
export { Legenda, BotaoLegenda, PainelLegenda, type DestinoLegenda } from './Legenda';
export { Rodape } from './Rodape';
export { CampoTexto, Opcao, Opcoes, Contador, CaixaMarcar, Resultado } from './Campos';
export { Vazio, Mensagem, MensagemErro } from './Mensagens';
export { formatar, direcaoDoGesto } from './formatar';
