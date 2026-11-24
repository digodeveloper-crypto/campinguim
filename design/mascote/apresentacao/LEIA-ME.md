# Apresentação dos 10 mascotes do Campinguim · guia para quem preenche uma opção

Você só precisa de duas coisas por opção: o arquivo `dados.js` e a pasta `arte\`. Não é preciso ler nem mexer no código das páginas.

## Onde cada coisa fica

```
apresentacao\
  index.html            página inicial (as 10 opções)
  comparacao.html       ícones em 48 px e versões em uma cor
  avaliacao.html        folha de avaliação
  recomendacao.html     recomendação da Cinema (preenchida depois)
  recomendacao-dados.js dados da recomendação (vazio por enquanto)
  _compartilhado\       código e textos das páginas (não mexer)
  opcoes\
    00-exemplo\         opção de teste com arte de marcação (não aparece entre as 10)
    01\ ... 10\         uma pasta por opção
      index.html        NÃO mexer (igual em todas)
      dados.js          VOCÊ preenche
      arte\             VOCÊ coloca a arte aqui
```

Modelo comentado para copiar: `opcoes\00-exemplo\dados.js`.

## Passo a passo

1. Abra `opcoes\NN\dados.js` (NN = o número da sua opção). Hoje ele é um espaço reservado com `pronta: false`.
2. Substitua o conteúdo pelo modelo de `opcoes\00-exemplo\dados.js` e troque os valores. Troque `"00"` pelo seu número (duas ocorrências: a chave e `numero`).
3. Coloque a arte em `opcoes\NN\arte\` com os nomes abaixo.
4. Abra `opcoes\NN\index.html` com duplo clique. Se algo faltar ou estiver errado, a página mostra um aviso amarelo "Pendências do arquivo de dados" listando o que corrigir. Ele avisa: campo ou arte sem caminho; arquivo de arte que não existe ou não carrega; mais de 3 `poses_extras`; `numero` diferente da pasta; e chave entre colchetes diferente da pasta (neste caso a página mostra só o aviso, não "em produção"). Sem pendências, está completo.

## Campos do dados.js

| Campo | Tipo | Obrigatório | O que é |
| --- | --- | --- | --- |
| `pronta` | `true` / `false` | sim | `true` tira a opção de "em produção". |
| `numero` | texto `"01"` a `"10"` | sim | Igual à pasta. |
| `nome` | texto | sim | Nome curto. |
| `frase` | texto | sim | Uma frase sobre a ideia. |
| `raciocinio` | lista de 3 textos | sim | Exatamente 3 linhas. |
| `paleta` | lista de `{ nome, hex, papel }` | sim | Cores sugeridas. `hex` no formato `#rrggbb`. A primeira cor vira o acento das simulações. |
| `originalidade` | texto | sim | Declaração de que a checagem de originalidade (MSC-06) foi feita e o que foi comparado. |
| `poses_extras` | lista de `{ titulo, arte }` | não | Poses além das quatro obrigatórias. |
| `arte` | objeto com os caminhos | sim | Ver abaixo. |

Os caminhos da arte são sempre relativos à pasta da opção, por exemplo `"arte/principal.svg"`.

## Arquivos de arte

Em `.svg` ou `.png` com fundo transparente. Pode usar extensões diferentes entre arquivos; os nomes das chaves não mudam.

| Chave em `arte` | Arquivo sugerido | Para quê |
| --- | --- | --- |
| `principal` | `arte/principal.svg` | Mascote grande. |
| `vista-frente` | `arte/vista-frente.svg` | Vista de frente (MSC-09). |
| `vista-lado` | `arte/vista-lado.svg` | Vista de lado. |
| `vista-tres-quartos` | `arte/vista-tres-quartos.svg` | Vista de três quartos. |
| `pose-neutro` | `arte/pose-neutro.svg` | Pose neutra. |
| `pose-comemorando` | `arte/pose-comemorando.svg` | Comemorando. |
| `pose-alerta` | `arte/pose-alerta.svg` | Em alerta (também aparece na tela do app). |
| `pose-camping` | `arte/pose-camping.svg` | Situação de camping. |
| `icone` | `arte/icone.svg` | Otimizado para 48 px: sem detalhe fino. |
| `uma-cor` | `arte/uma-cor.svg` | Versão em uma cor só. |
| `sem-acessorio` (opcional) | `arte/sem-acessorio.svg` | Ver abaixo. |

## Dois pontos adicionados ao contrato

### 1. Arte `sem-acessorio` (opcional)

- **Obrigatória só para opção que usa acessório** (mochila, lanterna, lenço, caneca): mostra que o mascote continua sendo ele mesmo sem o acessório.
- Quando o `dados.js` declara `arte["sem-acessorio"]`, a página mostra o bloco **"Sem o acessório"** ao lado do mascote principal ("Com o acessório").
- Sem essa chave, o bloco não aparece e o mascote principal ocupa o espaço sozinho.

### 2. Poses: de 4 a 7

- As 4 poses obrigatórias (neutro, comemorando, em alerta, camping) podem ser acrescidas de até 3 em `poses_extras`: `{ titulo: "Na chuva", arte: "arte/pose-extra-chuva.svg" }`.
- **Toda opção deve mostrar pelo menos uma situação de desconforto** (frio, calor ou chuva): como `pose-camping` ou como pose extra.
- O bloco de poses acomoda de 4 a 7 sem quebrar (2 colunas no celular, 4 no computador, quebrando em linhas).

### 3. Opção não validada (`estado`)

- `pronta: false` com `estado: "nao-validada"` no `dados.js` mostra a opção como "não validada" (entregue, mas sem validação) no índice, na página, na comparação e na avaliação, em vez de "em produção". A arte continua na pasta e não é exibida. Sem `estado`, `pronta: false` continua sendo "em produção".

### 4. Estudo ilustrado (opcional)

- Arquivo opcional `opcoes\NN\estudo\estudo-ilustrado.png`: imagem gerada por IA a partir do vetor aprovado, colocada só depois do QA.
- A lista `_compartilhado\estudos.js` (`window.CAMPINGUIM_ESTUDOS = [...]`, números das opções entre aspas) diz quais opções têm estudo **aprovado pelo QA**; o piloto a atualiza quando o QA aprova um estudo. Quem gera o estudo não mexe nela.
- Só para as opções da lista, a página carrega o arquivo e mostra a seção "Estudo ilustrado" no fim, com o rótulo de que é estudo de IA e de que a arte oficial é o vetor. Opção fora da lista não pede o arquivo (sem erro no console) e não mostra nada. Não precisa declarar nada no `dados.js`.

## O que a página monta sozinha

Os cinco usos reais (ícone na tela inicial entre ícones neutros, tela de abertura, tela do app com os dados do Camping Recanto das Águas, cabeçalho do site e versão em uma cor), o ícone em 48 px reais ao lado da versão grande, a paleta e a declaração de originalidade. Usos usam `principal`, `pose-alerta`, `pose-neutro`, `icone` e `uma-cor`; a paleta entra só como acento. No fundo escuro, só as imagens `uma-cor` aparecem invertidas (clara sobre escura), em todas as páginas.

## Como abrir

Duplo clique em `index.html` (funciona por `file://`) ou por qualquer servidor estático. Não há dependência externa nem instalação.

## Avaliação e recomendação

- As notas de `avaliacao.html` ficam guardadas no navegador de quem avalia e podem ser copiadas como texto.
- Na recomendação, uma opção repetida em `preferidas` é ignorada (vale só a primeira vez que aparece); escreva três opções diferentes.
- `recomendacao.html` só é alcançada por um link discreto, com aviso, no fim de `comparacao.html`. O conteúdo vem de `recomendacao-dados.js` (formato no próprio arquivo).

## Textos da interface

Todos em `_compartilhado\textos.js` (pt-BR).
