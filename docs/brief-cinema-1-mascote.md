# Pedido à Cinema · Etapa 1 · Mascote do Campinguim

Pedido para o orquestrador entregar à squad Cinema. Esta é a primeira entrega do projeto: nada de protótipo de tela começa antes de o mascote ser escolhido.

## O que é o Campinguim

Um app de celular, com site, que monta a lista do que levar para acampar e avisa o campista sobre o que o camping escolhido tem ou não tem: voltagem, chuveiros, regras de som, churrasco, pet. Também organiza grupos (quem leva o quê, divisão de gastos). Nasce no Brasil, começando por São Paulo, com plano de ir para outros países.

- **Público:** famílias e grupos de amigos que acampam com barraca e carro.
- **Nome:** Campinguim, de camping mais pinguim.
- **Onde o mascote vai aparecer:** ícone do app, telas do app, site, cartazes e como personagem de vídeos 3D de divulgação.

## O que entregar

**10 opções de mascote**, todas pinguins de desenho original, apresentadas em HTML navegável.

## Quem é o personagem

- **Preparado:** é o amigo que nunca esquece nada e avisa você a tempo.
- **Companheiro de perrengue:** já passou por tudo o que o campista passa e leva com bom humor.
- **Confiável:** fala a verdade sobre o camping, inclusive o que não agrada.
- **Para a família toda:** simpático sem ser infantil. O produto tem acabamento premium, e o mascote acompanha.

Ele vai aparecer em situações de alegria, de alerta e de desconforto (frio, calor, chuva). Precisa funcionar nas três.

## Como variar as 10 opções

As opções devem ser diferentes de verdade, e não a mesma figura com outra cor ou outro acessório. Explore estes eixos:

| Eixo | De um lado | Do outro |
| --- | --- | --- |
| Traço | geométrico e mínimo | orgânico e expressivo |
| Idade aparente | filhote | adulto |
| Proporção | compacto, quase uma forma só | corpo com braços e pernas definidos |
| Acabamento | chapado, de emblema | com volume, de boneco |
| Ligação com o camping | no próprio desenho (forma, postura) | em um acessório (mochila, lanterna, lenço, caneca) |

Nenhuma combinação é obrigatória. O conjunto das 10 deve cobrir bem esse espaço.

## Requisitos de cada opção

| ID no PRD | Requisito | Como mostrar |
| --- | --- | --- |
| MSC-01 | Desenho original e distinto dos outros nove | — |
| MSC-03 | Aplicado nos usos reais | Ícone do app em tamanho pequeno, tela de abertura, uma tela do app, cabeçalho do site e versão em uma cor só |
| MSC-04 | Ao menos 4 poses ou expressões | Neutro, comemorando, em alerta e uma em situação de camping |
| MSC-05 | Reconhecível como pinguim e como campista no tamanho do ícone | Mostrar o ícone em 48 px ao lado da versão grande |
| MSC-06 | Não lembra personagens nem logotipos de pinguim que já existem | Declarar na página que a checagem foi feita |
| MSC-09 | Funciona em 3D | Vistas de frente, de lado e de três quartos |

Também valem para todas:

- **Leitura sob sol forte** e em telas pequenas: formas claras, contraste alto.
- **Não depender de cor** para ser reconhecido: precisa funcionar em uma cor só.
- **Funcionar fora do Brasil:** nada que dependa de referência local.
- **Acessório nunca é essencial:** o mascote continua sendo ele mesmo sem a mochila ou a lanterna.

## O que evitar

- Semelhança com qualquer pinguim conhecido de marca, desenho, jogo ou sistema.
- Semelhança com o logotipo da marca de equipamentos Pinguin.
- Detalhes finos que somem no tamanho do ícone.
- Visual de modelo pronto ou de banco de imagens.

## Formato da apresentação

Um conjunto de páginas HTML que abre no navegador do celular e do computador, sem instalar nada.

1. **Página inicial:** as 10 opções lado a lado, no mesmo tamanho e sobre o mesmo fundo neutro, numeradas de 01 a 10, cada uma com um nome curto e uma frase sobre a ideia.
2. **Uma página por opção**, todas com a mesma estrutura, para a comparação ser justa:
   - o mascote grande;
   - as três vistas;
   - as quatro poses;
   - os cinco usos reais;
   - a versão em uma cor;
   - o ícone em 48 px;
   - paleta sugerida e o raciocínio da opção em três linhas.
3. **Página de comparação:** os 10 ícones em 48 px numa fileira e as 10 versões em uma cor em outra.
4. **Recomendação da Cinema**, numa página separada no fim: as três preferidas e o motivo. Fica separada para não influenciar a primeira olhada.

Nomes, cores e fundos das páginas são neutros. A identidade visual do app é assunto da etapa 2.

## Como trabalhar

- A Cinema pode abrir vários painéis. O limite é de 6 ativos ao mesmo tempo, e o que passar disso espera.
- O QA valida cada opção contra a tabela de requisitos antes de ela entrar na apresentação. Reprovação volta direto ao agente, com o motivo.
- O orquestrador fecha cada painel ao fim da tarefa e apaga os arquivos temporários, depois de confirmar que o trabalho aprovado está guardado.

## Depois da escolha

O responsável pelo produto escolhe uma opção ou pede uma combinação. Só então a Cinema produz o pacote final (MSC-08 e MSC-10 a MSC-14 no PRD):

- arquivos em vetor, versões clara e escura e versão em uma cor;
- ícone do app nos tamanhos exigidos pelas lojas;
- modelo 3D em GLB com arquivo-fonte, esqueleto, 7 expressões e 7 animações básicas;
- guia de uso do mascote;
- um plano de teste de 5 segundos renderizado com o modelo.

## Folha de avaliação para quem escolhe

Para cada opção, de 1 a 5:

| Critério | Pergunta |
| --- | --- |
| Reconhecimento | Em um segundo, dá para ver que é um pinguim que acampa? |
| Ícone | No tamanho pequeno, ele se destaca entre outros apps? |
| Simpatia | Dá vontade de ter esse personagem avisando você? |
| Premium | Parece de um produto bem feito? |
| Alcance | Funciona para criança, adulto, Brasil e fora? |
| Vídeo | Dá para imaginar esse personagem passando frio, calor e chuva em 3D? |
| Só seu | Não lembra nenhum outro pinguim? |
