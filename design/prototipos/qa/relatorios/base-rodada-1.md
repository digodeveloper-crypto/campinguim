# Base compartilhada dos protótipos (etapa 0) · rodada 1 · APROVADA

Data: 2026-11-24 · Entregue por: pane-587 · Alvo: `design/prototipos/_compartilhado/`, `index.html`, `comparacao.html`, `avaliacao.html`, `recomendacao.html`, `recomendacao-dados.js`, `LEIA-ME.md`
Base: `design/prototipos/qa/roteiro.md` seção 2, `direcao/padrao-producao.md` (seções 2 a 7, 10 e 11), `direcao/telas.md`.

**Resumo:**
- Os dados conferem com `telas.md` linha a linha, e as contas fecham.
- O mascote é idêntico, byte a byte, ao pacote final e à opção 03.
- As 8 famílias de fonte estão locais, com licença OFL.
- Não há nenhuma referência à rede.
- Moldura, barra de quem avalia e parâmetros de endereço funcionam.
- As quatro páginas de apresentação leem as fichas das direções.
- As travas para os construtores funcionam: chave sem texto, estado renomeado e mascote repetido viram erro visível.

Testei com uma cópia temporária, fora do projeto e já apagada, em que montei cinco direções de teste seguindo só o `LEIA-ME.md`.

Capturas e saídas: `qa/relatorios/base-r1/`:
- `pc-claro.png`, `pc-escuro-200.png`, `cel-claro.png`, `cel-semmoldura.png`: moldura, barra e parâmetros;
- `index.png`, `comparacao.png`, `avaliacao.png`: páginas com as fichas de teste;
- `saida-apresentacao.txt`: as páginas reais, sem direções.

| Item (roteiro, seção 2) | Resultado | Evidência |
| --- | --- | --- |
| `dados.js` contra `telas.md` | ok, conferido campo a campo: família e faixas; viagem (barraca com carro, 2 noites, frio, sem chuva, destino Recanto das Águas, cidade vazia P-07); camping (7 confirmações); alertas (chuveiro e churrasco em **Atenção**, P-23; pet e energia em Informação); ajustes (extensão, grelha, "Conferir os aparelhos" / 220 V); regras com "ciente" desmarcado; aviso de saída; item (extensão, motivo "Tomada longe: extensão de 20 m"); estadia (6 regras à mão); volta (68 itens, desmontagem e em casa); em casa (4 consumíveis, pergunta 1 de 4, 6 sugestões, 200 caracteres); fato (linha de resumo idêntica ao pedido); grupo; gastos; camping sem dados (Sítio Pedra Lisa, 4 itens, 7 perguntas); convidado; site. Propostas provisórias com `provisorio: "P-nn"` e o índice em `provisorias` | leitura do objeto por script |
| Lista | ok: 68 itens, 65 no carro, 3 "separei" (travesseiro da Bia, remédio do Lucas, carregador), 0 a separar; progresso por categoria igual a `telas.md` (Dormir 4 de 5, Primeiros socorros 6 de 7, Ferramentas 5 de 6, as outras completas); todas as quantidades iguais às da direção de arte; tarefa "Conferir os aparelhos (220 V)" fora da contagem | recontagem por script |
| Contas dos gastos | ok: 42000 centavos; H = 14; meia cota 3000; famílias 18000, 12000 (já pago) e 12000; Bruno recebe 30000; Carla deve 18000; o convidado deve 12000 | leitura por script |
| Textos comuns | ok: 262 chaves em pt-BR; estados ("separei", "está no carro", "preciso comprar", "faltou", "sobrou", "ciente", "conferido", "secar ou lavar em casa", "vou sair"...) e as 12 categorias com os nomes de `telas.md` | leitura por script |
| Dados do cenário fora de `dados.js` | ok: nenhuma ocorrência de "420", "Recanto", "Lucas", "Bia", "Bruno", "Pedra Lisa", "220 V" ou "Carla" em `base.js`, `textos.js`, `base.css`, nas páginas e em `recomendacao-dados.js` | busca |
| Mascote | ok: as 8 artes de `mascote.js`, decodificadas, têm SHA-256 e tamanho iguais aos de `final/vetor/claro/` e de `opcoes/03/arte/`, e iguais aos de `mascote-origem.md`. A base injeta o SVG sem alteração; no teste, 2 mascotes na tela deram erro no console | script |
| Fontes | ok: os 13 `.ttf` abrem e declaram a família certa (Fraunces, Atkinson Hyperlegible, Figtree e itálico, IBM Plex Sans Condensed nos 3 pesos, IBM Plex Mono em 2, Archivo, Bricolage Grotesque, Lexend); o SHA-256 bate com a tabela do LEIA-ME; um `OFL.txt` (SIL Open Font License) por família; 13 `@font-face` locais | script |
| Tudo local | ok: nenhum `http://`, `https://`, `fetch(`, `XMLHttpRequest`, `type="module"`, `import(` ou `@import` na base nem nas páginas. 0 pedido externo em todas as páginas | busca e `captura.py` |
| Moldura | ok: no computador (1280 × 900), tela de **390 × 844** dentro de moldura de 414 × 868 (borda de 12), centrada, sem entalhe nem barra de status; no celular (390), sem moldura | `pc-claro.png`, `cel-claro.png` |
| Barra do avaliador | ok: no computador, coluna à esquerda com nome da direção, "Tela 4 de 15 · Lista", anterior e próxima, tema, fonte 100/130/200 %, Identidade e Todas as direções; no celular, faixa de 45 px no topo, acima do app | idem |
| Parâmetros | ok: `tema=escuro` dá `data-tema="escuro"`; `fonte=200` dá raiz de 32 px; `moldura=0` e `avaliador=0` desligam as duas | `pc-escuro-200.png`, `cel-semmoldura.png` |
| Travas para os construtores | ok: direção redefinindo `estado.separei` gera erro e o texto comum continua; chave sem texto aparece como `[chave.inexistente]` e gera erro; mais de um mascote gera erro | teste na cópia |
| Páginas de apresentação | ok com as fichas de teste: a página inicial mostra as 5 lado a lado (nome, território, frase, amostra da lista, "Abrir o protótipo", "Identidade") e a recomendação no fim, discreta; a comparação mostra as 5 em claro e escuro; a avaliação tem os **8 critérios do pedido** e "Copiar como texto"; a recomendação mostra "A recomendação sai depois que os cinco protótipos forem aprovados."; direção com `pronta: false` aparece "Em produção". 0 erro com as 5 pastas presentes | capturas |

## Observação (não reprova)

- Nas páginas reais, enquanto as pastas das direções não existem, o console mostra 10 erros de arquivo não encontrado para `<pasta>/ficha.js` (`saida-apresentacao.txt`). Está declarado no LEIA-ME e some quando as 5 pastas existirem; no teste com as 5 pastas, ficou em 0. Na etapa 3, o QA confere que a apresentação final tem 0 erro.

## Próximo passo do QA

Escrever `design/prototipos/qa/prototipo.py` (roteiro, seção 1) sobre esta base, antes da primeira entrega de direção.
