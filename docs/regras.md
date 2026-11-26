# Motor de regras e catálogo

Como funcionam as regras puras do Campinguim (`packages/core`) e o catálogo da lista (`packages/content`). Criado na feature **B3** (motor de regras e carregamento do catálogo; SPEC, seções 5 e 9) em 26/11/2026.

Tudo aqui é função pura em TypeScript: sem tela, sem rede, sem banco, sem relógio e sem sorteio. O app chama estas funções offline; o servidor (etapa 3) usa as mesmas para camping, alertas, frescor e duplicados (SPEC, seção 2, "O que roda onde").

## 1. Requisitos cobertos

Critérios copiados do `docs/PRD.md`. A tela e a gravação de cada um são das features 1.2 a 1.10, 2.8 e 3.x; a B3 entrega a regra pura e os testes.

| ID | Requisito | Critério de aceite | Onde |
| --- | --- | --- | --- |
| E1-02 | Gerar a lista por categoria: abrigo, dormir, cozinha, comida e bebida, roupa, higiene, primeiros socorros e segurança, ferramentas, lazer, documentos, crianças, pet. | Mudar uma resposta recalcula a lista e mostra quantos itens entraram e saíram. Categorias sem itens (pet, crianças) não aparecem. | `lista.ts`: `gerarLista`, `recalcularLista`, `categoriasVisiveis` |
| E1-03 | Calcular quantidades de consumíveis (água, gás, gelo, carvão) por pessoas e noites. | As quantidades mudam ao alterar pessoas ou noites. As fórmulas vêm do conteúdo definido na spec. | `itens.json` (`qty`), `expressao.ts` |
| E1-04 | Editar a lista: adicionar, remover, renomear, alterar quantidade e escrever uma nota por item. | Item removido não volta ao recalcular. Item adicionado à mão nunca é apagado por recálculo. | `lista.ts`: `removerItem`, `restaurarItem`, `editarQuantidade`, `editarItem`, `adicionarItemManual`, `recalcularLista` |
| E1-11 | Perguntar em casa o que sobrou e o que faltou, e usar isso na próxima lista. | Na viagem seguinte, o que faltou já vem na lista e o que sobrou vem com quantidade menor ou sinalizado. A mudança é mostrada ao usuário. | `aprendizado.ts`: `aplicarAprendizado`, `desfazerAprendizado` |
| E1-12 | Repetir a última viagem ou salvar uma lista como modelo. | Uma nova viagem é criada em um toque a partir da anterior, com os ajustes do E1-11 aplicados. | `aprendizado.ts`: `repetirViagem` |
| E2-09 | Marcar um item do grupo como "vai ser dividido", com estimativa antes da compra e valor real depois. | O comprador informa o valor e pode anexar foto da nota. A estimativa aparece para todos antes da compra. | `cotas.ts`: `dividirGasto` (tipo `estimado` ou `real`) |
| E2-10 | Sugerir a divisão por cotas: adulto e adolescente (12+) uma cota, criança (5 a 11) meia cota, menor de 5 não paga. | O valor por cota e o total por família aparecem assim que o valor é informado. | `cotas.ts`: `meiasCotasDe`, `dividirGasto` |
| E2-11 | Permitir trocar a regra por item: igual por família, ou só adultos. | A troca recalcula na hora e fica registrada. | `cotas.ts`: regras `per_family` e `adults_teens` (o registro é do servidor, `expense_audit`) |
| E2-12 | Escolher quem participa de cada item (ex.: bebida só entre quem bebe). | O padrão é todos. Desmarcar uma pessoa a retira do cálculo daquele item. | `cotas.ts`: `excluidos` |
| E2-13 | Resumo de gastos por família: quanto cada família deve a cada comprador, por item e no total. | A soma do que as famílias devem mais a parte do comprador é igual ao valor do item, ao centavo. | `cotas.ts`: `resumirGastos` |
| E3-05, E3-06, E3-08 | Alertas em três níveis; cruzar a ficha com a viagem; ajustar a lista e mostrar o que mudou. | "Atenção" exige confirmação mínima; dado de uma só pessoa aparece como informação "não confirmada"; cada ajuste aparece como "entrou" ou "saiu" com o motivo; o usuário pode desfazer. | `alertas.ts`: `avaliarRetrato`, `aplicarAjustes` |
| E3-09 | Para camping sem dados, gerar a lista "na dúvida". | Itens que dependem do camping entram marcados como "depende do camping". | `lista.ts` (etiqueta `dependeDoCamping`) |
| E3-16, E3-17 | Validade do dado; restringir quem confirma. | Dado antigo não gera alerta. Só conta logada, com viagem registrada para aquele camping e data de volta já passada. | `fatos.ts`: `resumirFato`, `relatoContaNoLimite`, `verificarElegibilidade` |
| E3-20 a E3-24 | Duplicados: nome normalizado, similaridade, apelidos, fila e fusão que pode ser desfeita. | "Camping Recanto das Águas" e "recanto das aguas" são o mesmo candidato. | `duplicados.ts` |

## 2. Catálogo (`packages/content`)

| Arquivo | Conteúdo |
| --- | --- |
| `catalogo/itens.json` | 80 itens da seção 5, em 11 categorias, com `key`, `name`, `category`, `scope`, `when`, `qty`, `unit`, `dependsOnCamping`, `consumivel`; as variáveis da viagem; as unidades; as exclusões por tipo de viagem |
| `catalogo/tarefas.json` | Tarefas de véspera (E1-08) e da volta (E1-10) |
| `catalogo/alertas.json` | Textos-base da tabela da seção 6, textos das tarefas de ajuste, rótulos de horário |
| `esquemas/*.schema.json` | Esquema JSON de cada arquivo |

`carregarCatalogo()` (`packages/core/src/catalogo.ts`) lê os três arquivos, confere tudo (campos, categorias, unidades, chaves repetidas, expressões, tipos, textos comparados com os valores fechados de cada variável) e devolve o catálogo tipado com as expressões já compiladas. Um catálogo com erro não carrega.

**Fidelidade à SPEC.** `catalogo.test.ts` lê as tabelas da seção 5 direto do `docs/SPEC.md` e falha se faltar, sobrar ou mudar qualquer item: chave, nome, categoria, escopo, texto de "Entra quando" e texto de "Quantidade" (guardados em `entraQuandoSpec` e `quantidadeSpec`). Também confere as exclusões por tipo, as tarefas de véspera e da volta e os textos-base dos alertas da seção 6. As fórmulas em si são conferidas pelos casos L1 a L8 e pela lista esperada da família da Carla, item a item.

**Expressões.** `when` e `qty` são lidas por `expressao.ts`, um interpretador pequeno, sem `eval`: números, variáveis do catálogo, textos entre aspas simples, `+ - * /`, comparações, `e`, `ou`, `nao`, `sempre`, `teto(x)` e `se(condição, a, b)`. Os tipos são conferidos ao carregar.

| Variável | Como é calculada |
| --- | --- |
| `P`, `A`, `C`, `T` | Contagem das pessoas (`trip_person.age_band`): `adult` e `teen` em `A`, `child` em `C`, `toddler` em `T` |
| `N`, `D` | Noites informadas (ou `noitesEntre(ida, volta)`); `D = N + 1` |
| `F`, `pets` | Famílias da viagem; pets da família (`trip_family.pets`) |
| `clima`, `chuva` | `cold`/`mild`/`hot` viram `frio`/`ameno`/`calor` |
| `tipo` | `tent_car`/`backpack`/`motorhome` viram `barraca_carro`/`mochila`/`motorhome` |
| `destino` | Destino informado (E1-13) |
| `piscina` | Sempre falso na geração: a piscina entra pelo ajuste da ficha (seção 6) |
| `semDadosDoCamping` | Verdadeiro sem destino ou sem retrato com dados |

## 3. Como o motor funciona

**Geração (`gerarLista`).** Percorre o catálogo na ordem. Item do tipo excluído (mochila, motorhome) não entra. Para cada item, avalia `when` e `qty` no alvo certo:

- escopo **grupo**: um item para a viagem (`familiaId` nulo), com as variáveis somadas de todas as famílias (E2-06);
- escopo **família**: um item por família, com as variáveis da própria família;
- escopo **pessoa**: um item por família, com `porPessoa` = a quantidade da fórmula e `qty` = `porPessoa` × pessoas da família ("mudas 3 por pessoa" = 12; "manta 4").

Cada item gerado tem a referência estável `chave@família` (ou `chave@grupo`) e nasce com origem `generated` e todos os estados zerados. Item que depende do camping entra com `dependeDoCamping` verdadeiro quando não há dados (E3-09). Linha com quantidade zero não entra (por exemplo, cadeiras numa família só de bebês).

**Recálculo (`recalcularLista`).** Gera de novo e compara pela referência. Só itens `generated` mudam: removidos ficam guardados como removidos e nunca voltam; manuais e itens de ajuste do camping não são tocados; quantidade editada à mão (`qtyEditada`) fica. Item manual com a mesma chave do catálogo (o que voltou por "faltou") ocupa o lugar do gerado, que não entra em duplicado. Devolve `entraram`, `sairam` e `quantidadesAlteradas` para a tela mostrar "N entraram, M saíram".

**Alertas e ajustes (`avaliarRetrato`, `aplicarAjustes`).** O retrato traz, por fato, valor vigente, confirmação e frescor. `avaliarRetrato` percorre a tabela da seção 6 e devolve os alertas (com a chave do texto-base) e os ajustes, cada um com identificador estável `fato:valor:efeito:alvo`. Fato sem valor vigente não gera nada; fato não confirmado vira informação "não confirmado" e não mexe na lista. `aplicarAjustes` recebe a lista base (gerada, manuais e itens que já entraram por ajuste, com seus estados) e a lista de ajustes desfeitos, e devolve a lista que a pessoa vê:

- "entra": item com origem `camping_adjust` e referência `ajuste:chave@família`, a não ser que já esteja na lista; item removido pela pessoa não volta;
- "sai": o item sai da lista mostrada;
- "soma": a quantidade ganha o acréscimo, a não ser que a pessoa a tenha editado;
- "tarefa": volta à parte, com o texto de `alertas.json`.

Como a saída é derivada, desfazer um ajuste é aplicar de novo sem ele, e um retrato novo igual não o reaplica (A6).

**Cotas (`dividirGasto`, `resumirGastos`).** Meias cotas (adulto e adolescente 2, criança 1, menor de 5 zero; excluído zero), `H` = soma, valor da parte = valor ÷ `H` arredondado para baixo, em centavos inteiros. A família compradora deve zero e absorve a diferença. `per_family`: 1 parte por família com ao menos uma pessoa não excluída. `adults_teens`: 1 parte por adulto ou adolescente não excluído. Só com estimativa, a divisão sai marcada `estimado` e não vira dívida (C7).

**Aprendizado (`aplicarAprendizado`, `repetirViagem`).** "Faltou" na última viagem: o item entra na próxima lista (volta, se estava removido; item fora da lista entra como item da pessoa, que o recálculo não apaga). "Sobrou" num consumível nas duas últimas viagens: quantidade × 0,75 arredondada para cima, com aviso; se o arredondamento não muda a quantidade, o item vem só sinalizado (E1-11: "com quantidade menor ou sinalizado"). A redução continua valendo sobre a quantidade recalculada até ser desfeita. `repetirViagem` gera a lista com as mesmas respostas, leva removidos, itens manuais e quantidades editadas, zera os estados e aplica o aprendizado.

**Relatos (`resumirFato`).** Entram os relatos dos últimos 12 meses, não retidos e que contam; maioria com peso 1 (campista) e 0,5 ("informado pelo camping"); empate: o mais recente (mês da visita; no mesmo mês, o que chegou depois). Frescor pelo último relato: até 6 meses recente, até 12 pode ter mudado, acima sem valor. Confirmado com 2 contas diferentes concordando. Divergência: um lado por valor, com contagem, último mês e ocasiões.

**Duplicados.** `normalizarNome`, trigramas no formato do `pg_trgm` (cada palavra com dois espaços antes e um depois), `compararCampings` (mesmo, parecido a partir de 0,6, fila de fusão de 0,45 a 0,6, distintos; sempre distintos em cidades diferentes), `avaliarCriacao` (o existente, ou os parecidos por qualquer apelido), `fundirCampings` e `desfazerFusao` (pelo registro da fusão).

**Premissas.** Ficam em constantes exportadas (`REDUCAO_POR_SOBRA_PERCENTUAL`, `PREMISSAS_DOS_RELATOS`, `PREMISSAS_DOS_ALERTAS`, `PREMISSAS_DE_DUPLICADOS`) e nas fórmulas do catálogo, com os valores da SPEC, seção 15. Passam para `config` quando o servidor existir (B5).

## 4. Leituras adotadas e dúvidas para o orquestrador

Onde a SPEC não diz, a B3 implementou a leitura literal ou a mais conservadora e deixou a dúvida registrada. Nada aqui foi decidido como regra de negócio.

| # | Ponto | Leitura implementada | Pergunta |
| --- | --- | --- | --- |
| 1 | **Consumíveis.** A seção 5 não marca quais itens são consumíveis; o PRD (E1-03) cita "água, gás, gelo, carvão". A redução por "sobrou" vale só para consumível. | Só `agua`, `gas`, `gelo` e `carvao` têm `consumivel: true`. | Quais outros itens são consumíveis (sacos de lixo, papel higiênico, papel-toalha, fraldas, ração, lanches, básicos...)? |
| 2 | **Arredondamento da redução de 25 %.** | Quantidade × 0,75 arredondada para cima; se não muda, o item vem sinalizado. Gás 2 e gelo 2 nunca caem. | Arredondar para cima, para baixo (com mínimo 1) ou outra regra? |
| 3 | **"Duas viagens seguidas"** do "sobrou". | As duas viagens mais recentes da pessoa, com o item marcado nas duas; a redução não se acumula. | A redução se acumula se continuar sobrando? |
| 4 | **Itens "Depende do camping" com dados do camping.** A seção 5 diz "com dados, quem decide é a tabela da seção 6"; a tabela tem "entra `ducha`" e "`extensao` de 20 m", mas também "saem `extensao` e `adaptador`". | Com dados, `ducha`, `extensao` e `adaptador` não entram pela geração; `ducha` e `extensao` entram por ajuste. O `adaptador` nunca entra quando o camping tem dados, porque nenhuma linha da tabela o faz entrar. | Com dados, o adaptador deve ficar na lista (por exemplo, sempre, ou quando a voltagem for 220 V ou "as duas")? E a extensão, quando o fato de tomada não tem valor? |
| 5 | **Fato não confirmado.** A5 cobre o chuveiro. | Qualquer fato não confirmado vira informação "não confirmado" e não mexe na lista (nem os de nível ajuste, como tomada e piscina). | Fato de nível "ajuste" não confirmado também não deve ajustar a lista? |
| 6 | **Categorias.** O PRD (E1-02) lista "ferramentas", "lazer" e "documentos" separados; a SPEC tem "Ferramentas e energia" e "Lazer e documentos". | As 11 categorias da SPEC. | Divergência PRD × SPEC: separar "lazer" e "documentos"? Em qual entra cada item? |
| 7 | **Itens "Viagem de barraca com carro" no motorhome.** | Literal: `mesa`, `cadeiras`, `carvao`, `grelha`, `balde` e `cintas` só entram em barraca com carro. | O motorhome deve ter mesa, cadeiras e churrasco? |
| 8 | **Escopo em viagem de grupo.** | Itens de família e pessoa usam as contagens da própria família; itens do grupo, a soma (E2-06). Condições de família (`pets > 0`, `C + T > 0`) também por família. | Confirma? |
| 9 | **Barracas por chuveiro com "5 ou mais".** | Conta 5 chuveiros. O texto "cerca de X" usa X arredondado. | Confirma? |
| 10 | **Quem pode relatar sem datas.** E3-17 pede "data de volta já passada"; RET-02 permite viagem sem data. | Viagem sem datas não pode relatar (`not_eligible`, motivo `sem_datas`). | Confirma? |
| 11 | **Divisão sem ninguém participando** (todos excluídos, ou só menores de 5). | Ninguém deve; o comprador fica com o valor todo. Na regra `per_family`, família só com menor de 5 participa com 1 parte. | Confirma? |
| 12 | **Repetir viagem.** | Leva removidos, itens manuais (não removidos) e quantidades editadas; não leva itens de ajuste do camping; zera os estados. | Confirma? |
| 13 | **Tarefas de ajuste** ("confira seus aparelhos", "baixe os mapas e avise a família"). | Voltam à parte do resultado, fora das categorias da lista. | Em que categoria aparecem? |

**Para as features seguintes (não são dúvidas):**

- **B4 e B5:** o modelo de dados (SPEC, seção 3) não tem onde guardar "quantidade editada à mão" (L7), a quantidade por pessoa, o detalhe (litros da água, metros da extensão), a marca do aprendizado nem a referência estável do item. O motor usa `qtyEditada`, `porPessoa`, `detalhe`, `aprendizado` e `ref`; o esquema local e o do servidor precisam de colunas para eles (ou de outra forma de guardar).
- **1.1:** E1-01 diz que clima e chuva têm valor padrão, mas a SPEC não diz qual. O motor recebe os valores sempre explícitos.

## 5. Testes

Rodar: `npm run unitarios` (todos os projetos do Vitest) ou, só o motor, `npx vitest run --project core`. Cobertura: `npm run cobertura --workspace packages/core` (falha abaixo de 90 % de linhas).

Todos os casos da SPEC, seção 9, um a um, com o nome do caso no título do teste:

| Caso | Teste | Arquivo | Resultado |
| --- | --- | --- | --- |
| C1 | C1: R$ 420,00, regra de cotas | `packages/core/src/cotas.test.ts` | passou |
| C2 | C2: R$ 100,00 entre três famílias de 1 adulto; a primeira comprou | `packages/core/src/cotas.test.ts` | passou |
| C3 | C3: como C1, com Lucas excluído do gasto | `packages/core/src/cotas.test.ts` | passou |
| C4 | C4: como C1, regra per_family | `packages/core/src/cotas.test.ts` | passou |
| C5 | C5: como C1, regra adults_teens | `packages/core/src/cotas.test.ts` | passou |
| C6 | C6: como C1, com todos excluídos menos a família compradora | `packages/core/src/cotas.test.ts` | passou |
| C7 | C7: gasto só com estimativa: mostra a estimativa por família, marcada "estimado", sem dívida | `packages/core/src/cotas.test.ts` | passou |
| C1 a C7 | a soma fecha ao centavo em qualquer valor, regra e exclusão | `packages/core/src/cotas.test.ts` | passou |
| L1 | L1: quantidades | `packages/core/src/lista.test.ts` | passou |
| L2 | L2: itens presentes por condição | `packages/core/src/lista.test.ts` | passou |
| L3 | L3: itens ausentes por condição | `packages/core/src/lista.test.ts` | passou |
| L4 | L4: mudar o clima para calor mostra as entradas e saídas | `packages/core/src/lista.test.ts` | passou |
| L5 | L5: remover a grelha e depois mudar as noites para 3 | `packages/core/src/lista.test.ts` | passou |
| L6 | L6: item adicionado à mão continua na lista, sem alteração, depois do recálculo | `packages/core/src/lista.test.ts` | passou |
| L7 | L7: a quantidade da água editada para 4 galões é preservada no recálculo | `packages/core/src/lista.test.ts` | passou |
| L8 | L8: trocar para trilha com mochila | `packages/core/src/lista.test.ts` | passou |
| Seção 13 | Lista esperada da família da Carla: gera exatamente estes itens, nesta ordem, com estas quantidades | `packages/core/src/lista.test.ts` | passou |
| A1 | A1: viagem de referência com o retrato de referência | `packages/core/src/alertas.test.ts` | passou |
| A2 | A2: mesmo retrato com 2 chuveiros | `packages/core/src/alertas.test.ts` | passou |
| A3 | A3: pet não aceito gera atenção; sem pet na viagem, nenhum alerta | `packages/core/src/alertas.test.ts` | passou |
| A4 | A4: churrasco proibido gera atenção e tira carvão e grelha | `packages/core/src/alertas.test.ts` | passou |
| A5 | A5: fato de chuveiro com um único relato aparece como informação "não confirmado", e a ducha não entra | `packages/core/src/alertas.test.ts` | passou |
| A6 | A6: desfazer o ajuste da extensão volta ao estado anterior, e um retrato novo não o reaplica | `packages/core/src/alertas.test.ts` | passou |
| F1 | F1: último relato em outubro de 2026 é recente | `packages/core/src/fatos.test.ts` | passou |
| F2 | F2: último relato em março de 2026 pode ter mudado | `packages/core/src/fatos.test.ts` | passou |
| F3 | F3: último relato em outubro de 2025 fica sem valor vigente (e não gera alerta) | `packages/core/src/fatos.test.ts` | passou |
| F4 | F4: dois relatos iguais, de contas diferentes, recentes: confirmado | `packages/core/src/fatos.test.ts` | passou |
| F5 | F5: dois relatos iguais, da mesma conta, em viagens diferentes: não confirmado | `packages/core/src/fatos.test.ts` | passou |
| F6 | F6: 5 relatos "cumprida" e 1 "não cumprida" em feriado: vale "cumprida", com a divergência e a ocasião | `packages/core/src/fatos.test.ts` | passou |
| F7 | F7: 1 "sim" de setembro e 1 "não" de outubro: empate, vale "não", o mais recente; não confirmado | `packages/core/src/fatos.test.ts` | passou |
| F8 | F8: terceira viagem da mesma conta ao mesmo camping no mesmo mês: relato guardado, sem contar | `packages/core/src/fatos.test.ts` | passou |
| F9 | F9: relato de viagem criada depois da data de ida é recusado com not_eligible | `packages/core/src/fatos.test.ts` | passou |
| D1 | D1: "Camping Recanto das Águas" e "recanto das aguas" são o mesmo camping; a criação devolve o existente | `packages/core/src/duplicados.test.ts` | passou |
| D2 | D2: "Recanto das Águas" e "Recanto das Agoas" são parecidos: o app pergunta "é este?" | `packages/core/src/duplicados.test.ts` | passou |
| D3 | D3: "Recanto das Águas" e "Sítio Pedra Lisa" são distintos | `packages/core/src/duplicados.test.ts` | passou |
| D4 | D4: mesmo nome em cidades diferentes são distintos | `packages/core/src/duplicados.test.ts` | passou |
| D5 | D5: fusão de dois campings com relatos; desfazer restaura os dois | `packages/core/src/duplicados.test.ts` | passou |

Além dos casos, cada arquivo testa as demais linhas das tabelas (todas as linhas da seção 6, as regras de geração, o aprendizado, a repetição, o interpretador, os erros de entrada e de catálogo). A saída completa e a cobertura estão em `docs/evidencias/B3/`.
