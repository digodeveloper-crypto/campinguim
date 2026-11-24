# Conteúdo das 15 telas · igual nos 5 protótipos

DSG-02 e DSG-03 · Cinema, etapa 2 · 24/11/2026.

Este arquivo diz **o que** cada tela mostra, com os dados exatos. **Como** mostra é de cada direção (`direcoes.md`). Os cinco protótipos leem tudo de um único arquivo de dados (`_compartilhado/dados.js`, ver `padrao-producao.md`), escrito a partir daqui; mudar uma resposta das perguntas abaixo muda os cinco de uma vez.

Fontes, em ordem de autoridade: o pedido (`docs/brief-cinema-2-prototipos.md`, seção "Dados para preencher as telas"), o PRD (seções 7 a 10) e a spec (seções 5 a 7 e 9). Cada dado abaixo diz de onde veio: **[pedido]**, **[PRD]**, **[spec]**, **[derivado]** (conta ou consequência direta dos dados) ou **[P-nn]** (lacuna: pergunta em aberto, com a proposta provisória que os construtores usam até a resposta).

Nenhum texto de preenchimento. Onde falta dado, a tela não inventa: usa a proposta marcada como provisória, que fica isolada no arquivo de dados com a marca `provisorio: true`, ou deixa o bloco de fora, como cada tela diz.

## 0. O cenário

**Quem usa:** Carla, a organizadora, no celular dela. Ela é quem cria a viagem, vê a lista e os gastos. [PRD seção 3]

**A família** [pedido]: Carla e Rafael, adultos; Lucas, 9 anos; Bia, 5 anos; a cachorra Mel. Viagem de 2 noites, barraca com carro, clima frio à noite.

**Faixas** [PRD seção 10]: Carla e Rafael, adultos; Lucas (9) e Bia (5), crianças de 5 a 11. Nenhum adolescente, nenhum menor de 5. Um pet.

**Variáveis da lista** [spec seção 5, derivado]: `P` = 4, `A` = 2, `C` = 2, `T` = 0, `N` = 2, `D` = 3, `pets` = 1, `clima` = frio, `chuva` = não. É exatamente a viagem de referência dos casos L1 a L3 da spec.

**Duas viagens no mesmo cenário.** As telas 2 a 10 e 13 mostram a viagem **da família** (etapas 1 e 3 do PRD). As telas 11, 12 e 14 mostram a mesma viagem **como grupo** de três famílias (etapa 2). As quantidades da lista (tela 4) são as da família, como no caso L1 da spec; em grupo, os itens compartilhados seriam recalculados para 9 pessoas (E2-06), e isso não aparece nos protótipos. Ver P-01.

**O momento.** Telas 4, 5 e 6: sábado, antes de sair. Tudo já foi separado; tudo está no carro, menos os três itens do aviso de saída [pedido]. Por isso a lista mostra 65 de 68 itens no carro. Ver P-02.

**Mel.** O app pergunta só o número de pets, não o nome (E1-01; PRV-01 no espírito de dado mínimo). Mel não aparece em nenhuma tela do app. Ver P-03.

## 1. Divergências encontradas

| ID | Onde | O que diverge | Como os protótipos fazem até a decisão |
| --- | --- | --- | --- |
| D-01 | Tela 3 | O pedido lista "churrasco só no quiosque comum" como **Atenção**. O PRD (seção 10) e a spec (seção 6) dizem que churrasco só em área comum é **Informação**, com ajuste na lista (sai a grelha portátil, fica o carvão). | Vale o pedido ("use exatamente estes"), pela mesma regra da D-02: o aviso aparece como **Atenção**, com o texto do pedido, e o ajuste "saiu: grelha portátil" continua. A escolha do nível vai ao responsável (P-23); se ele preferir o PRD, muda só o campo `nivel` no arquivo de dados. |
| D-02 | Telas 3 e 4 | O pedido lista 3 ajustes. O PRD (seção 10) diz que piscina com horário faz **entrar roupa de banho e boia para crianças**; a spec (caso A1) diz ainda que **entra a ducha portátil** (1 chuveiro para 25 barracas) e dá as quantidades (roupa de banho 4, boia 2). A ducha não está no PRD. | Vale o pedido ("use exatamente estes"): os 3 ajustes, e a lista sem ducha, roupa de banho e boia. Ver P-04. |
| D-03 | Tela 4 | O PRD (E1-02) chama a categoria de **"ferramentas"**; a spec (seção 5) chama de **"Ferramentas e energia"**. O PRD separa "lazer" e "documentos"; a spec agrupa os dois numa mesma tabela (os itens não mudam). | Vale o PRD: "Ferramentas", "Lazer" e "Documentos" como três categorias. |
| D-04 | Tela 6 | O pedido descreve só "o que está separado e não está no carro". O PRD (E1-06) e a spec pedem também "o que não foi separado". | As duas listas aparecem. A segunda está vazia, porque tudo foi separado [derivado], com a frase de lista vazia. |
| D-05 | Tela 8 | O pedido diz "secar em casa"; o PRD (seção 10 e E1-10) e a spec dizem "secar ou lavar em casa". | Vale o PRD: "secar ou lavar em casa". |
| D-06 | Ordem de trabalho | `design/mascote/ESCOLHA.md` põe o pacote final do mascote (MSC-08) antes dos protótipos. Os protótipos começam com a arte aprovada da opção 03, antes do pacote final. | A arte é copiada de `opcoes/03/arte/` com registro de origem (`padrao-producao.md`, seção 6); quando o MSC-08 sair, troca-se a cópia, sem mexer nas telas. |

Não há divergência entre PRD e spec que afete estas telas além de D-02 (ducha só na spec) e D-03 (nome da categoria).

## 2. Perguntas em aberto

Cada pergunta tem uma proposta provisória que os construtores usam agora. Nenhuma proposta é decisão; todas ficam no arquivo de dados com `provisorio: true`, e o QA confere que são as daqui.

| ID | Tela | Pergunta | Proposta provisória |
| --- | --- | --- | --- |
| P-01 | 4, 11 | A lista da tela 4 deve ser a da família (quantidades do caso L1) ou a da viagem em grupo (itens compartilhados para 9 pessoas)? | Lista da família. |
| P-02 | 4, 6 | O momento da lista é "antes de sair", com 65 de 68 no carro? Ou o responsável prefere uma lista em andamento (quinta-feira), que exige dizer quais itens estão em cada estado? | Antes de sair, 65 de 68 no carro. |
| P-03 | todas | Mel deve aparecer em algum lugar (por exemplo, no grupo: "com Lucas, Bia e Mel")? O app só conta pets. | Não aparece. |
| P-04 | 3, 4 | Entram também roupa de banho (4), boia (2) e ducha portátil (1), como dizem PRD e spec? (D-02) Roupa de banho e boia têm apoio duplo: o PRD (seção 10, piscina com horário) e o próprio catálogo da spec (seção 5), em que "camping com piscina" é condição de entrada de `roupa_banho` e `boia`; a ducha só tem apoio na spec (caso A1). | Não: só os 3 ajustes do pedido. |
| P-05 | 4, 6 | Os três itens do aviso de saída ("travesseiro da Bia", "remédio do Lucas", "carregador") não existem com esses nomes no catálogo da spec, que tem "Travesseiro" (4, um por pessoa), "Remédios de uso contínuo" (tarefa) e "Carregadores" (1 jogo). Como representar? | A família editou a lista (E1-04): "Travesseiro" passou de 4 para 3 e entrou à mão "Travesseiro da Bia" (1); "Remédios de uso contínuo" foi renomeado "Remédio do Lucas"; "Carregadores" foi renomeado "Carregador". |
| P-06 | 4 | Tarefas da lista (planejar refeições, conferir documentos, conferir dinheiro, conferir os aparelhos de 220 V) têm os dois passos "separei" e "está no carro"? A spec não define estado de tarefa. | Itens com quantidade de tarefa (refeições, documentos, dinheiro, remédio) têm os dois passos, como os demais. A tarefa "Conferir os aparelhos (220 V)", que não é objeto, fica numa faixa de tarefas no alto da lista, com uma marca só, "feito", desmarcada. |
| P-07 | 2 | Qual a cidade do Camping Recanto das Águas? (E1-13 pede nome e cidade; E3-20, cidade da lista do IBGE.) | O campo cidade aparece vazio, com o rótulo "Cidade". |
| P-08 | 10 | Quem são as 6 confirmações do fato "Som até 22h" (nome curto, mês/ano, tipo de viagem, ocasião)? Há divergência a mostrar? O pedido só dá a última. | O histórico mostra só a linha conhecida, "Carla R. · nov/2026 · família com crianças", e a linha "e mais 5 confirmações de 'cumprida'". A ocasião da Carla fica de fora (as datas da viagem não foram dadas). |
| P-09 | 11 | Quem assumiu os 3 fogareiros? (A persona de Diego e Lívia diz que eles não têm equipamento.) | O item mostra "3 assumidos" sem nomes, com o aviso "3 fogareiros, precisa de todos?". |
| P-10 | 11 | Quais são os demais itens do grupo, quem assumiu cada um e o progresso de cada família? | O grupo mostra só o que o pedido dá: carne (Bruno), fogareiro (3), isqueiro e saco de lixo (sem dono). Sem progresso por família. |
| P-11 | 12 | Qual a chave Pix do Bruno? | Chave do tipo e-mail `bruno@example.com` (domínio reservado para exemplo, não é endereço real). |
| P-12 | 12 | Alguma família já marcou "paguei"? | Ninguém marcou. Bruno e Paula aparecem como "já pago" porque são os compradores [pedido]. |
| P-13 | 13, 15 | Qual o nome e a cidade do camping sem dados? | "Sítio Pedra Lisa", nome que a spec já usa no caso D3; cidade vazia, como em P-07. |
| P-14 | 13 | A água potável leva a etiqueta "depende do camping" na lista "na dúvida"? (A spec, seção 6, diz que a água entra sempre com quantidade cheia até decisão.) | Leva a etiqueta e a quantidade cheia (36 L em 8 galões). |
| P-15 | 13 | O texto de perguntas ao camping: a spec dá a abertura e a ordem, não as linhas. Aprovar as linhas propostas? | As 7 linhas da tela 13, abaixo. |
| P-16 | 9 | Quais são as outras 3 perguntas da volta? A spec dá a regra de escolha, mas não sabemos quais fatos do camping têm relato. | A tela mostra a pergunta 1 de 4 ("som cumprido", que entra sempre, spec seção 6). O botão "próxima" leva à sugestão; o contador continua "1 de 4". |
| P-17 | 14 | Qual o nome da viagem de grupo? | Sem nome próprio: "Viagem de Carla ao Camping Recanto das Águas". |
| P-18 | 15 | O texto de consentimento da lista de espera (PRD seção 18; spec, `waitlist_join`) e o link de privacidade: texto legal, que a Cinema não escreve. | Caixa de marcar com o rótulo "Quero receber um e-mail quando o Campinguim abrir." e nenhum link de política, até o texto ser escrito por quem pode. |
| P-19 | 15 | Os textos de apresentação do site (o que é o Campinguim). | Frases tiradas do PRD seção 1, na tela 15 abaixo. |
| P-20 | todas | O gorro do mascote pode mudar de cor por direção, ou a cor `#3EA8AE` é fixa? (Vai para o guia de uso, MSC-13.) | Fixa. Nenhuma direção muda as cores da versão colorida. |
| P-21 | todas | Fontes: pode baixar uma vez os arquivos das fontes do repositório oficial (`github.com/google/fonts`, licença OFL) para dentro do projeto? Os protótipos não usam rede para abrir, mas os arquivos precisam chegar à pasta. | Sim, uma única vez, na etapa 0 (`padrao-producao.md`, seção 5). Sem isso, cai-se para as fontes do sistema e a comparação tipográfica perde valor. |
| P-22 | todas | Como o responsável abre os protótipos no celular? (Arquivo copiado para o aparelho, servidor na rede local ou página publicada.) | Os protótipos funcionam por arquivo, sem servidor (`file://`) e também por qualquer servidor estático; a forma de levar ao celular é decisão do orquestrador. |
| P-23 | 3, 7 | Churrasco só no quiosque comum: Atenção, como no pedido, ou Informação, como no PRD (seção 10) e na spec (seção 6)? (D-01) | Atenção, como no pedido. Se o responsável preferir o PRD, muda só o campo `nivel` no arquivo de dados, e o ajuste "saiu: grelha portátil" continua igual. |

## 3. Formato dos valores

- Dinheiro: "R$ 420,00", com centavos e vírgula, nas telas 12 e 14 (E2-13 é ao centavo; NF-09). Nos textos curtos do mural e do tom de voz, o valor também vai com centavos.
- Quantidade: número + unidade da spec ("2 sacos de 5 kg", "36 L em 8 galões de 5 L", "1 jogo", "4 pares"). Item de escopo "por pessoa" mostra o total e a regra quando a regra não é 1: "12 (3 por pessoa)".
- Data: só mês e ano nos fatos ("nov/2026"), como o PRD (E3-14, E3-19). Nenhuma data de viagem aparece.
- Nome curto: "Carla R." [pedido].

## 4. As telas

### Tela 1 · Abertura

| Elemento | Conteúdo | Fonte |
| --- | --- | --- |
| Mascote | pose de abertura da direção (`principal` por padrão) | `direcoes.md` |
| Nome | Campinguim | [PRD seção 1] |
| Frase | uma frase do tom da direção, sobre montar a lista do que levar para acampar | [direção] |
| Botão único | "Começar", leva à tela 2 | [spec seção 7] |
| O que não tem | login, cadastro, pedido de permissão, tutorial | [spec seção 7, RET-03, E1-01] |

### Tela 2 · Criar viagem

Valores já preenchidos como a Carla deixou. Obrigatórios marcados: tipo, noites e pessoas [E1-01].

| Campo | Valor | Fonte |
| --- | --- | --- |
| Tipo | Barraca com carro (opções visíveis: barraca com carro, trilha com mochila, motorhome) | [pedido, E1-01] |
| Noites | 2 (datas em branco, "Datas: opcional") | [pedido, RET-02] |
| Adultos | 2 | [pedido] |
| Adolescentes (12 a 17) | 0 | [derivado] |
| Crianças (5 a 11) | 2 | [derivado: Lucas 9, Bia 5] |
| Menores de 5 | 0 | [derivado] |
| Pets | 1 | [pedido] |
| Clima | Frio (opções: frio, ameno, calor) | [pedido] |
| Chance de chuva | Não | [spec seção 9, viagem de referência] |
| Destino (opcional) | Camping Recanto das Águas; cidade: P-07 | [pedido] |
| Botão principal | "Gerar lista", leva à tela 3 (há destino, então vêm os alertas) | [spec seção 7] |

### Tela 3 · Alertas do camping

Cabeçalho: "Camping Recanto das Águas" · "confirmado por 7 campistas" [pedido].

**Atenção**

| Alerta | Fonte |
| --- | --- |
| 1 chuveiro quente para cerca de 25 barracas | [pedido; spec: atenção acima de 15 barracas por chuveiro] |
| Churrasco só no quiosque comum | [pedido; nível em pergunta: D-01, P-23] |

**Informação**

| Alerta | Fonte |
| --- | --- |
| Aceita pet | [pedido] |
| Energia: 220 V, tomada longe da barraca | [pedido] |

**Ajustes na lista**, cada um com "desfazer" [E3-08]

| Tipo | Item | Motivo | Fonte |
| --- | --- | --- | --- |
| Entrou | Extensão de 20 m | Tomada longe | [pedido] |
| Saiu | Grelha portátil | Churrasco só no quiosque | [pedido] |
| Tarefa | Conferir os aparelhos | 220 V | [pedido] |

**Regras**, cada uma com o botão "ciente" [E3-07]

| Regra | Fonte |
| --- | --- |
| Som até 22h | [pedido] |
| Piscina abre às 10h | [pedido] |

Botão principal: "Ver a lista", leva à tela 4. Estado inicial: nenhum "ciente" tocado; tocar troca o botão por "ciente" marcado (ícone de visto e texto).

### Tela 4 · Lista

Cabeçalho: "2 noites · Camping Recanto das Águas". Progresso total: **65 de 68 no carro** [derivado]. Filtros: a separar, separados, no carro, comprar [spec seção 7].

Faixa de tarefas (P-06): "Conferir os aparelhos (220 V)", marca "feito" desmarcada. O texto da tarefa é dado: vem igual de `dados.js` na tela 3 e na tela 4, e o tom de voz da direção pode emoldurar a faixa, nunca reescrever a tarefa.

Estados no início: **"separei"** (fora do carro) só nos 3 itens do aviso; todos os outros **"está no carro"**; nenhum "a separar"; nenhum "preciso comprar" [derivado de P-02 e P-05].

Categorias na ordem do PRD (E1-02). Categorias recolhíveis; na abertura da tela, as três com pendência ficam abertas (Dormir, Primeiros socorros e segurança, Ferramentas) e as demais fechadas, mostrando o progresso.

| Categoria | Item | Quantidade | Estado | Progresso da categoria |
| --- | --- | --- | --- | --- |
| Abrigo | Barraca com sobreteto | 1 | no carro | 6 de 6 |
| | Lona de chão | 1 | no carro | |
| | Espeques e cordas extras | 1 jogo | no carro | |
| | Martelo de borracha | 1 | no carro | |
| | Fita de reparo e selador de costura | 1 | no carro | |
| | Vassourinha e pá | 1 | no carro | |
| Dormir | Saco de dormir | 4 | no carro | 4 de 5 |
| | Isolante ou colchonete | 4 | no carro | |
| | Travesseiro | 3 (P-05) | no carro | |
| | Travesseiro da Bia | 1 (P-05) | **separei** | |
| | Manta extra | 4 | no carro | |
| Cozinha | Fogareiro | 1 | no carro | 15 de 15 |
| | Cartucho de gás | 2 | no carro | |
| | Isqueiro ou fósforos | 2 | no carro | |
| | Para-vento | 1 | no carro | |
| | Panela, frigideira e chaleira | 1 jogo | no carro | |
| | Faca, colher grande, espátula e abridor | 1 jogo | no carro | |
| | Tábua de corte | 1 | no carro | |
| | Prato, copo e talheres | 4 jogos | no carro | |
| | Cooler | 1 | no carro | |
| | Esponja, detergente, pano e bacia | 1 jogo | no carro | |
| | Sacos de lixo | 6 | no carro | |
| | Papel-toalha | 1 rolo | no carro | |
| | Mesa dobrável | 1 | no carro | |
| | Cadeiras | 4 | no carro | |
| | Carvão | 1 saco de 4 kg | no carro | |
| Comida e bebida | Água potável | 36 L em 8 galões de 5 L | no carro | 5 de 5 |
| | Gelo | 2 sacos de 5 kg | no carro | |
| | Comida das refeições | tarefa: 3 cafés, 3 almoços e 2 jantares | no carro | |
| | Sal, óleo, açúcar e café | 1 kit | no carro | |
| | Lanches para a estrada | 4 | no carro | |
| Roupa | Mudas de roupa | 12 (3 por pessoa) | no carro | 6 de 6 |
| | Roupa de dormir | 4 | no carro | |
| | Agasalho | 8 (2 por pessoa) | no carro | |
| | Gorro e meia grossa | 4 | no carro | |
| | Calçado fechado | 4 pares | no carro | |
| | Chinelo | 4 pares | no carro | |
| Higiene | Toalha | 4 | no carro | 6 de 6 |
| | Escova, pasta, sabonete e xampu | 1 kit | no carro | |
| | Papel higiênico | 2 rolos | no carro | |
| | Protetor solar | 1 | no carro | |
| | Repelente | 1 | no carro | |
| | Lenços umedecidos | 1 pacote | no carro | |
| Primeiros socorros e segurança | Kit de primeiros socorros | 1 | no carro | 6 de 7 |
| | Remédio do Lucas | tarefa: conferir (P-05) | **separei** | |
| | Lanterna | 2 | no carro | |
| | Lampião | 1 | no carro | |
| | Pilhas ou baterias de reserva | 1 jogo | no carro | |
| | Bateria portátil | 1 | no carro | |
| | Balde para água perto do fogo | 1 | no carro | |
| Ferramentas | Canivete ou faca de uso geral | 1 | no carro | 5 de 6 |
| | Corda e prendedores | 1 | no carro | |
| | Fita adesiva forte | 1 | no carro | |
| | Extensão elétrica | 1 · 20 m | no carro | |
| | Carregador | 1 jogo (P-05) | **separei** | |
| | Cintas para amarrar a carga | 1 jogo | no carro | |
| Lazer | Baralho ou jogo | 1 | no carro | 1 de 1 |
| Documentos | Documentos e carteira | tarefa: conferir | no carro | 3 de 3 |
| | Comprovante da reserva | 1 | no carro | |
| | Dinheiro em espécie | tarefa: conferir | no carro | |
| Crianças | Muda extra por criança | 2 | no carro | 2 de 2 |
| | Brinquedos e bola | 1 jogo | no carro | |
| Pet | Ração | porções para 4 dias | no carro | 6 de 6 |
| | Potes de água e comida | 1 jogo | no carro | |
| | Guia e coleira com identificação | 1 | no carro | |
| | Carteira de vacinação | 1 | no carro | |
| | Saquinhos higiênicos | 1 rolo | no carro | |
| | Manta ou caminha | 1 | no carro | |

**Conferência das contas** [spec seção 5, fórmulas; caso L1].

| Item | Fórmula | Conta | Resultado | Bate com L1 |
| --- | --- | --- | --- | --- |
| Cartucho de gás | `teto(P × N / 8) + 1` | teto(4 × 2 / 8) + 1 = 1 + 1 | 2 | sim |
| Gelo | `teto(D / 2) × teto(P / 4)` sacos de 5 kg | teto(1,5) × teto(1) = 2 × 1 | 2 sacos | sim |
| Água | `3 L × P × D` em galões de 5 L, para cima | 3 × 4 × 3 = 36 L; 36 / 5 = 7,2 → 8 | 36 L em 8 galões | sim |
| Sacos de lixo | `2 × D` | 2 × 3 | 6 | sim |
| Papel higiênico | `teto(P × N / 4)` rolos | teto(4 × 2 / 4) | 2 | sim |
| Cadeiras | `A + C` | 2 + 2 | 4 | sim |
| Lanterna | `A` | 2 | 2 | sim |
| Mudas | `D` por pessoa | 3 × 4 | 12 (3 por pessoa) | sim |
| Manta extra | 1 por pessoa, frio | 4 | 4 | sim |
| Muda extra por criança | `C + T` | 2 + 0 | 2 | sim |
| Carvão | 1 saco de 4 kg para cada 8 pessoas | 4 pessoas | 1 saco | sim |
| Fogareiro | 1 até 8 pessoas | 4 pessoas | 1 | — |
| Agasalho | 2 por pessoa no frio | 2 × 4 | 8 | L2 |
| Ração | porções para `D + 1` dias | 3 + 1 | 4 dias | — |
| Comida das refeições | `D` cafés, `D` almoços, `N` jantares | 3, 3, 2 | 3 cafés, 3 almoços e 2 jantares | — |

**Contagem.** Itens: Abrigo 6, Dormir 5, Cozinha 15, Comida e bebida 5, Roupa 6, Higiene 6, Primeiros socorros 7, Ferramentas 6, Lazer 1, Documentos 3, Crianças 2, Pet 6 = **68**. No carro 65; separei 3; a separar 0. A tarefa de 220 V fica fora da contagem (P-06).

**Itens ausentes** por condição, conferidos com L3 [spec]: lona ou gazebo de sombra, tapete de entrada, lençol, capa de chuva, muda reserva, roupa de banho, chapéu, boia, fraldas, alimentação do bebê. Ausentes pelos ajustes: grelha portátil (saiu). Ausentes por P-04 e por não terem regra para este camping: ducha portátil e adaptador de tomada (itens "depende do camping" sem efeito definido na tabela da spec seção 6 para 220 V e tomada longe).

Botão principal da tela: "Vou sair", leva à tela 6. Tocar num item leva à tela 5.

### Tela 5 · Item

Item mostrado: **Extensão elétrica** — o único item da lista que tem um motivo vindo do camping [pedido, spec seção 7: "itens gerados mostram o motivo"].

| Campo | Valor | Fonte |
| --- | --- | --- |
| Nome | Extensão elétrica | [spec seção 5] |
| Quantidade | 1, com botões de menos e mais | [spec] |
| Detalhe | 20 m | [pedido] |
| Motivo | Tomada longe: extensão de 20 m | [spec seção 6, texto-base] |
| Estado | está no carro | [derivado] |
| Nota | campo vazio, com o rótulo "Nota" | [E1-04] |
| Preciso comprar | desligado | [derivado: a marca sai quando o item é separado, PRD seção 10] |
| Remover | botão secundário "Remover da lista" | [spec seção 7] |

Ligar "preciso comprar" no protótipo mostra a marca (ícone de sacola e texto), sem mudar o estado.

### Tela 6 · Aviso de saída

Aberta por "vou sair" [E1-06].

| Bloco | Conteúdo | Fonte |
| --- | --- | --- |
| Separados e fora do carro | Travesseiro da Bia · Remédio do Lucas · Carregador, cada um com o botão "está no carro" | [pedido] |
| Não separados | vazio: "Nada ficou sem separar." | [derivado, D-04] |
| Botão principal | "Sair assim mesmo" enquanto houver item fora do carro; "Confirmar saída" quando os três estiverem no carro | [E1-06] |

Marcar os três como "está no carro" ali mesmo leva a lista a 68 de 68; é o momento da pose `pose-comemorando` nas direções que a usam.

### Tela 7 · Durante a estadia

| Bloco | Conteúdo | Fonte |
| --- | --- | --- |
| Regras à mão | Som até 22h · Piscina abre às 10h · Churrasco só no quiosque comum · Aceita pet · Energia: 220 V, tomada longe da barraca · 1 chuveiro quente para cerca de 25 barracas | [pedido] |
| Origem | "confirmado por 7 campistas" | [pedido] |
| Faltou | botão "Faltou algo", que abre a escolha de um item da lista ou de um nome escrito; em dois toques o item entra em "faltou" | [E1-09] |
| Lista de "faltou" | vazia no início | [derivado: o pedido não diz o que faltou] |

### Tela 8 · Checklist da volta

| Bloco | Conteúdo | Fonte |
| --- | --- | --- |
| Conferir o que volta | os 68 itens da lista, agrupados nas mesmas categorias, todos "não conferido" no início e destacados; cada um com "conferido" e "secar ou lavar em casa" | [E1-10, D-05] |
| Desmontagem | Contar os espeques · Apagar o fogo até esfriar · Recolher todo o lixo · Olhar o chão em volta da barraca antes de sair | [spec seção 5] |
| Em casa | Abrir a barraca para secar · Guardar o saco de dormir solto, fora do saco de compressão | [spec seção 5] |
| Progresso | "0 de 68 conferidos" no início | [derivado] |

Marcar "secar ou lavar em casa" mostra a nota "Lembrete em 2 dias" [E1-10, spec seção 10].

### Tela 9 · Em casa

Três passos na mesma tela, um por vez, com "pular" em cada um [spec seção 7; E3-12; E3-25].

**Passo 1 · Sobrou e faltou** (consumíveis, E1-03 e E1-11)

| Item | Levado | Opções |
| --- | --- | --- |
| Água potável | 36 L em 8 galões | sobrou · faltou |
| Cartucho de gás | 2 | sobrou · faltou |
| Gelo | 2 sacos de 5 kg | sobrou · faltou |
| Carvão | 1 saco de 4 kg | sobrou · faltou |

Nenhuma opção marcada no início; item sem toque fica sem resposta (os dois estados são os do PRD, seção 10).

**Passo 2 · Pergunta do camping** (P-16)

- Contador: "1 de 4".
- Pergunta: "As regras informadas foram cumpridas?" [E3-13] · "Som até 22h" · opções de um toque: "Sim" · "Não" [spec seção 6, `som_cumprido`].
- Responder como: "Carla R." ou "campista · família com crianças" (anônimo) [E3-18; spec: tipo calculado].

**Passo 3 · Sugestão, opcional** [E3-25, spec seção 6]

- Pergunta: "Alguma sugestão para o camping?"
- Opções de toque: abrir a piscina mais cedo · mais chuveiros · mais tomadas · mais sombra · banheiros mais limpos · mais lixeiras.
- Campo de texto opcional, até 200 caracteres, vazio.
- "Pular" e "Enviar". Depois de enviar: "Sugestão registrada." (sem prometer resposta do camping, E3-27).

### Tela 10 · Fato do camping

| Elemento | Conteúdo | Fonte |
| --- | --- | --- |
| Fato | Som até 22h | [pedido] |
| Valor | cumprida | [pedido] |
| Contagem | 6 confirmações | [pedido] |
| Última | Carla R., nov/2026 | [pedido] |
| Frescor | recente | [derivado: última em nov/2026; spec caso F1] |
| Linha de resumo | "Som até 22h: cumprida · 6 confirmações · última: Carla R., nov/2026" | [pedido, E3-14] |
| Histórico | P-08 | — |

### Tela 11 · Grupo

Viagem de grupo, organizadora: Carla [PRD seção 8].

| Família | Pessoas | Fonte |
| --- | --- | --- |
| Carla e Rafael, com Lucas e Bia | 2 adultos, 2 crianças | [pedido] |
| Bruno e Paula, com um bebê | 2 adultos, 1 menor de 5 | [pedido] |
| Diego e Lívia | 2 adultos | [pedido] |

| Bloco | Conteúdo | Fonte |
| --- | --- | --- |
| Ninguém pegou | Isqueiro · Saco de lixo, cada um com "eu levo" | [pedido, E2-05] |
| Duplicado | Fogareiro: 3 assumidos, "3 fogareiros, precisa de todos?" (P-09) | [pedido, E2-05] |
| Quem leva o quê | Carne: Bruno | [pedido: Bruno comprou a carne] |
| Progresso por família | fora (P-10) | — |
| Ação do organizador | "Lembrar quem falta" | [spec seção 7, E2-07] |

### Tela 12 · Gastos

Vista pela Carla.

| Elemento | Conteúdo | Fonte |
| --- | --- | --- |
| Item dividido | Carne | [pedido] |
| Comprou | Bruno | [pedido] |
| Valor | R$ 420,00 | [pedido] |
| Regra | Por cotas: adulto e adolescente, 1 cota; criança de 5 a 11, meia cota; menor de 5 não paga | [PRD seção 10, E2-10] |
| Valor por cota | 7 cotas de R$ 60,00 | [pedido] |

| Família | Pessoas | Cotas | Valor | Situação |
| --- | --- | --- | --- | --- |
| Carla e Rafael | 2 adultos, Lucas (9), Bia (5) | 3 | R$ 180,00 | a pagar |
| Bruno e Paula | 2 adultos, bebê | 2 | R$ 120,00 | já pago (comprador) |
| Diego e Lívia | 2 adultos | 2 | R$ 120,00 | a pagar |

- **Bruno recebe R$ 300,00** [pedido].
- Bloco da Carla: "Vocês devem a Bruno: R$ 180,00" · chave Pix (P-11) · botões "Copiar chave" e "Copiar valor" · "Paguei" desmarcado (P-12) [E2-14].
- O protótipo não mostra a troca de regra (E2-11), a escolha de participantes (E2-12) nem o histórico (E2-15): não fazem parte da tela 12 do pedido.

**Conferência das contas** [PRD seção 10; spec seção 9, caso C1].

| Passo | Conta | Resultado |
| --- | --- | --- |
| Meias cotas (H) | Carla e Rafael 2 + 2 + 1 + 1 = 6; Bruno e Paula 2 + 2 + 0 = 4; Diego e Lívia 2 + 2 = 4 | H = 14 (7 cotas) |
| Valor da meia cota | R$ 420,00 / 14, para baixo, ao centavo | R$ 30,00 (cota inteira R$ 60,00) |
| Carla e Rafael | 6 × R$ 30,00 | R$ 180,00 |
| Diego e Lívia | 4 × R$ 30,00 | R$ 120,00 |
| Bruno e Paula | 4 × R$ 30,00, parte do comprador | R$ 120,00, já pago |
| Bruno recebe | R$ 180,00 + R$ 120,00 | R$ 300,00 |
| Prova (E2-13) | R$ 180,00 + R$ 120,00 + R$ 120,00 | R$ 420,00, sem sobra de arredondamento |

Tudo bate com o pedido e com o caso C1. Conferido também por script (soma em centavos: 42000).

### Tela 13 · Camping sem dados

| Elemento | Conteúdo | Fonte |
| --- | --- | --- |
| Camping | Sítio Pedra Lisa (P-13) | [spec caso D3] |
| Aviso | ainda não há dados deste camping; a lista veio "na dúvida" | [E3-09] |
| Itens "depende do camping" | Água potável 36 L em 8 galões (P-14) · Extensão elétrica 1 · Adaptador de tomada 1 · Ducha portátil 1, cada um com a etiqueta "depende do camping" | [spec seção 5, `dependsOnCamping`] |
| Texto de perguntas | abaixo, com "Copiar" e "Compartilhar" (menu do celular) | [E3-10, spec seção 6] |

Texto de perguntas (abertura da spec; linhas propostas em P-15; ordem da spec: energia, chuveiros, água quente, churrasco, pet, som, piscina; o texto não cita o app):

> Oi! Vou acampar aí e queria confirmar:
> Tem energia elétrica? É 127 V ou 220 V, e a tomada fica perto das barracas?
> Quantos chuveiros há, e para mais ou menos quantas barracas?
> Tem água quente no banho?
> Pode fazer churrasco perto da barraca, ou só em área comum?
> Aceita pet?
> Tem horário de silêncio? A partir de que horas?
> Tem piscina? Que horas abre?

### Tela 14 · Página do convidado (web)

O convidado é Diego, que entra pelo link [PRD seção 8, jornada; persona dos novatos].

| Passo | Conteúdo | Fonte |
| --- | --- | --- |
| Convite | "Viagem de Carla ao Camping Recanto das Águas" (P-17) · "Carla convidou você" | [spec seção 7] |
| Entrar | campo "Seu nome", preenchido no protótipo ao tocar: Diego; campo "Sua família": Diego e Lívia; botão "Entrar" | [E2-02] |
| Lista do grupo | Isqueiro · ninguém pegou · "eu levo" — Saco de lixo · ninguém pegou · "eu levo" — Fogareiro · 3 assumidos — Carne · Bruno | [pedido] |
| Assumir | tocar "eu levo" no isqueiro mostra "Diego leva" no item, com "desistir" | [E2-04] |
| O que eu devo | "Vocês devem a Bruno: R$ 120,00 · carne", sem chave Pix | [pedido; spec `guest_view`] |
| Baixar o app | botão de texto "Baixar o app para pagar e lançar gastos", sem selo de loja | [E2-02, E2-16; regra de marcas de terceiros] |

### Tela 15 · Página inicial do site (web)

| Bloco | Conteúdo | Fonte |
| --- | --- | --- |
| O que é | "Campinguim monta a lista do que levar para acampar e avisa o que o camping escolhido tem ou não tem." (P-19) | [PRD seção 1] |
| Mascote | pose da direção (`principal` por padrão) | `direcoes.md` |
| Lista pronta para ver | "Barraca com carro · 2 noites · 2 adultos e 2 crianças · 1 pet · frio": a mesma lista da tela 4, só leitura, categorias recolhíveis, sem estados de marcação | [spec seção 7; seção 5] |
| Lista de espera | campo "Seu e-mail", caixa de consentimento (P-18), botão "Entrar na lista de espera"; ao enviar: "Pronto. Avisaremos por e-mail." | [spec `waitlist_join`] |
| O que não tem | dados de camping (DEF-02: nenhuma ficha pública), selos de loja, links de política até P-18 | [PRD] |

## 5. Ligações obrigatórias entre as telas

Cada direção faz essas ligações pelo próprio modelo de navegação. A barra do avaliador (fora do app, `padrao-producao.md`) liga todas em ordem, mas não conta como navegação do app.

| De | Ação | Para |
| --- | --- | --- |
| 1 | Começar | 2 |
| 2 | Gerar lista | 3 |
| 3 | Ver a lista | 4 |
| 4 | tocar num item | 5 |
| 5 | voltar | 4 |
| 4 | Vou sair | 6 |
| 6 | Confirmar saída ou Sair assim mesmo | 7 |
| 7 | regra "Som até 22h" | 10 |
| 7 | Volta (pelo modelo da direção) | 8 |
| 8 | concluir | 9 |
| 3 ou área Camping | fato "Som até 22h" | 10 |
| qualquer tela da viagem | área Grupo | 11 |
| 11 | Gastos (pela área ou pelo item Carne) | 12 |
| 2 | destino Sítio Pedra Lisa (exemplo de camping sem dados) | 13 |
| 11 | ver como o convidado vê | 14 |
| 1 | link discreto "Ver o site" | 15 |
