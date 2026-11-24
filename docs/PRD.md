# PRD: App de checklist para camping (versão 1)

Nov 23, 2026 · @digodeveloper-crypto

## 1. Resumo

O produto é um app de celular, para Android e iPhone, que monta a lista do que levar para acampar e avisa o campista sobre o que o camping escolhido tem ou não tem. O nome escolhido é Campinguim, com um pinguim como mascote; a análise de marca está pendente (seção 15). Este documento usa "o app".

A aposta central tem duas partes:

- **O checklist é a porta de entrada.** Resolve um problema imediato e conhecido: esquecer itens e se organizar em grupo.
- **O destino é o ativo.** Cada viagem registra para qual camping a pessoa foi e o que encontrou lá. Com o tempo, isso forma uma base de dados que nenhum guia tem, e que alimenta alertas, busca e, mais adiante, reserva.

A versão 1 depende só do campista. O dono do camping não participa do app nesta versão.

A versão 1 é entregue em três etapas, cada uma utilizável por si:

1. **Lista para uma família:** gerar a lista, separar, carregar o carro, voltar.
2. **Grupo:** convite por link, quem leva o quê e divisão de gastos.
3. **Camping:** ficha do destino, alertas ao escolher o camping e confirmações de quem já foi.

Este PRD define o quê e o porquê. O como (telas, modelo de dados, contratos e protocolo dos agentes) fica na spec, que será escrita a partir dele.

## 2. Problema e oportunidade

Quem acampa hoje se organiza com listas soltas e mensagens de WhatsApp, e só descobre como o camping realmente é depois de chegar.

**Dores do campista**

- **Esquecer itens.** O que foi separado em casa nem sempre entra no carro.
- **Surpresa no destino.** Exemplos reais que motivaram o produto: um camping com um único chuveiro, outro onde não se podia fazer churrasco na área das barracas.
- **Regras desconhecidas viram conflito.** Horário de som e horário de abertura da piscina geram reclamação contra o camping por algo que é procedimento dele.
- **Desorganização em grupo.** Itens duplicados, itens que ninguém levou e acerto de gastos confuso.

**Concorrência**

Os produtos existentes caem em cinco grupos, e nenhum junta o preparo da viagem com o conhecimento do destino.

| Grupo | Exemplos | O que fazem | O que não fazem |
| --- | --- | --- | --- |
| Apps de lista de bagagem | PackPoint, Packr, Packing List Checklist, PackGoat | Geram lista por destino, duração e atividade | Não conhecem o camping; camping é só uma atividade entre várias; pouco pensados para o Brasil |
| Apps só de camping, estrangeiros | Camping Checklist - Pro, Backpacking List | Lista específica de equipamento | Só iPhone, base pequena de usuários, sem dados de destino |
| Guias de camping no Brasil | [MaCamp](https://macamp.com.br/guia/guia/), [Camped](https://camped.com.br/), [VaiAcampar](https://www.vaiacampar.com.br/) | Localizam campings e mostram contato e estrutura | Não transformam a informação em lista nem em alerta |
| Reserva de camping no Brasil | [77camps](https://www.77camps.com/), [Kampin](https://www.kampin.com.br/), [TuristaRV](https://www.turistarv.com.br/), Campyng, CampyOne | Busca e reserva online com Pix ou cartão | Não ajudam no preparo da viagem; nenhum aparece como líder consolidado |
| Reserva de camping no exterior | Hipcamp, Pitchup | Marketplace maduro de reservas | Sem atuação relevante no Brasil |

**A brecha**

Nenhum produto encontrado usa os dados do camping para dizer ao campista o que levar e o que esperar. É esse o espaço do app.

**Tamanho do mercado, em ordem de grandeza**

- O guia MaCamp lista cerca de 4.100 campings no Brasil, cerca de 3.500 em funcionamento.
- Um estudo da Expo Motorhome, citado pela LIBBER Campers, estima em R$ 1,5 bilhão o giro de campismo e caravanismo em 2023. O número inclui venda de veículos.
- A Barraca Livre, lançada em 2017 como primeira plataforma brasileira de reserva de campings, não mostra atividade recente. Reserva é um espaço disputado e difícil.

Estes dados vêm de buscas na web feitas em 23/11/2026. As páginas de origem não puderam ser abertas para conferência, então os números devem ser tratados como aproximados e verificados antes de uso externo. A tração real dos concorrentes (downloads, campings ativos) não foi verificada.

## 3. Público e personas

O público da versão 1 é quem acampa com barraca e carro, em família ou com amigos, em campings estruturados no Brasil.

| Persona | Contexto | O que precisa do app |
| --- | --- | --- |
| Carla, 36, a organizadora | Planeja a viagem da família (2 adultos, 2 crianças, 1 cachorro). Odeia surpresa. | Lista pronta em minutos, saber o que o camping tem, não esquecer nada na saída |
| Rafael, 38, o parceiro | Cuida do carro e da barraca. Não quer planejar, quer saber a parte dele. | Ver e marcar os itens dele sem configurar nada |
| Bruno, o amigo que compra | Assume a carne do churrasco para o grupo todo. | Registrar o valor, ver a divisão justa e receber sem cobrar um por um |
| Diego e Lívia, os novatos | Nunca acamparam e não têm equipamento. Entram pelo link do grupo. | Participar sem instalar nada; saber o que falta para eles |

**Fora do público da versão 1**

- **Dono do camping.** Entra como hipótese para a fase 2 (ver seção 17).
- **Trilha com mochila e motorhome.** O tipo de viagem existe na criação da lista, mas o conteúdo e os testes da versão 1 priorizam barraca com carro.

## 4. Princípios do produto

Estes princípios decidem os casos que os requisitos não cobrem. Na dúvida, o agente e o QA aplicam o princípio.

1. **Valor antes do esforço.** A lista aparece pronta em poucos toques, sem cadastro, sem tutorial.
2. **O app nunca pede sem devolver.** Cada resposta muda algo visível na hora ("4 itens adicionados").
3. **Não perguntar o que dá para descobrir.** O uso normal (marcar, remover, anotar "faltou") é a principal fonte de dados.
4. **Funciona sem sinal.** Camping quase nunca tem internet. Nada essencial depende de conexão.
5. **Regra do camping é característica, não defeito.** O app informa e cruza com o perfil da viagem; não dá nota para regra.
6. **Dado tem data e autor.** Toda informação de camping mostra quem confirmou e quando.
7. **A versão 1 depende só do campista.** Nenhuma função exige a participação do dono do camping.
8. **O app calcula, não movimenta dinheiro.** Divisão de gastos mostra valores e chave Pix; o pagamento acontece fora.
9. **Mínimo de dados pessoais.** Sem CPF, sem localização obrigatória, sem expor quando a casa está vazia.
10. **Qualidade antes de velocidade.** Uma função só está pronta quando passa nos critérios de aceite, validada pelo QA.

## 5. O que torna o app difícil de copiar

Telas e funções podem ser copiadas em semanas; a defesa do produto está no que se acumula com o uso e não pode ser reproduzido sem os usuários.

**As quatro defesas**

| Defesa | Por que é difícil copiar | O que o produto faz para construí-la |
| --- | --- | --- |
| Base de campings confirmada | Cada fato tem data, autor e confirmações de quem esteve lá. Um concorrente parte do zero e leva temporadas para alcançar. | Destino opcional desde a etapa 1; perguntas na volta; confirmações (etapa 3) |
| Histórico de cada usuário | Listas ajustadas, o que faltou e sobrou, viagens passadas. Trocar de app significa recomeçar. | "Faltou / sobrou" ajusta a próxima lista; repetir a última viagem |
| Rede dos grupos | Quem organiza traz os amigos; o grupo inteiro precisaria migrar junto. | Convite por link sem instalação; divisão de gastos |
| Inteligência que melhora com dados | As regras que ligam a ficha do camping à lista e as quantidades por perfil ficam mais precisas com o uso real. | Regras e fórmulas no servidor, ajustadas pelos dados de "faltou / sobrou" |

**Requisitos de proteção**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| DEF-01 | A base de campings nunca é entregue em massa. O app recebe a ficha só do camping escolhido pelo usuário. | Não existe chamada que liste campings com suas fichas; a busca devolve só nome e cidade |
| DEF-02 | Não há página pública de camping na versão 1. | Nenhuma ficha é acessível sem o app e sem uma viagem para aquele destino |
| DEF-03 | Limite de consultas por conta e por aparelho. | Consultas acima do limite são recusadas e registradas |
| DEF-04 | Verificação de que o acesso vem do app verdadeiro em aparelho real. | Chamadas sem atestado válido da Apple ou do Google não recebem ficha de camping |
| DEF-05 | Regras de ajuste da lista pela ficha e ajustes por aprendizado rodam no servidor. | O aparelho guarda só o resultado para as viagens do usuário, não as regras completas |
| DEF-06 | Termos de uso proíbem coleta automatizada e reuso da base. | Texto presente nos termos aceitos no primeiro login |

**Proteção no código**

O que fica no celular pode ser inspecionado com esforço; o que fica no servidor, não. Por isso o app é fino e a inteligência fica no servidor.

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| DEF-07 | Versão publicada com código ofuscado e sem símbolos de depuração. | O pacote das lojas não expõe nomes legíveis das funções de negócio. |
| DEF-08 | Identificadores aleatórios, nunca sequenciais. | Não é possível percorrer campings, viagens ou usuários somando 1 a um número. |
| DEF-09 | Nenhuma chave ou segredo dentro do app. | A inspeção do pacote não revela credenciais. Tudo o que exige segredo passa pelo servidor. |
| DEF-10 | O servidor devolve só o que a tela mostra. | A resposta da ficha traz contagens e a última confirmação, não os registros brutos. |
| DEF-11 | O aparelho guarda só as viagens do próprio usuário, em armazenamento cifrado. | Nenhum dado de outro camping ou de outro usuário fica no aparelho. |

**Fora do código**

- **Marca:** registrar nome e logotipo no INPI antes do lançamento.
- **Velocidade:** quem chega primeiro aos grupos de camping acumula dados antes dos outros.
- **Relacionamento com os campings (fase 2):** difícil de replicar depois de estabelecido.

**Limite honesto**

A lista básica de itens precisa ficar no aparelho para funcionar sem sinal, então pode ser extraída por quem quiser. Isso é aceitável: uma lista genérica de camping não é o diferencial. O que se protege é a base de destinos e a inteligência construída sobre ela.

## 6. Escopo da versão 1

A versão 1 tem três etapas construídas em sequência; cada uma termina utilizável e testável com campistas reais.

| Etapa | Entrega | O que prova |
| --- | --- | --- |
| 1. Lista para uma família | Gerar a lista, editar, "separei" e "está no carro", offline, lembretes de véspera, checklist da volta, repetir viagem, destino opcional (nome e cidade) | Que a lista é boa o bastante para uma viagem real e que a pessoa volta para a segunda |
| 2. Grupo | Convite por link, página web do convidado, quem leva o quê, quantidades do grupo, divisão de gastos com cotas e Pix, login com Google ou Apple | Que o app se espalha sozinho: cada viagem traz novos usuários |
| 3. Camping | Ficha mínima do camping, alertas ao escolher o destino, ajustes automáticos na lista, perguntas na volta, confirmações com nome e mês, texto de perguntas para mandar ao camping | Que os dados de destino mudam a decisão e o preparo do campista |

**Fora da versão 1**

- Clima automático pela previsão do tempo
- Cardápio que vira lista de compras
- Inventário de equipamento e peso da mochila
- Perfil "o que é importante para mim" com alertas personalizados
- Acerto compensado entre vários compradores (a versão 1 mostra o que cada família deve a cada comprador)
- Empréstimos entre o grupo e achados e perdidos
- Envio das sugestões ao camping (a versão 1 só guarda, ver E3-25)
- Prova de presença por localização, verificação de celular por SMS, peso por reputação
- Resumo de viagem para compartilhar
- Tudo o que envolve o dono do camping
- Busca pública de campings, reserva e qualquer forma de receita

Esses itens estão ordenados na seção 17.

## 7. Requisitos da Etapa 1: lista para uma família

A etapa 1 leva uma família do "vou acampar" até a volta para casa, sem conta e sem internet.

**Jornada de referência**

Carla cria a viagem na quarta, separa os itens na quinta, recebe os lembretes na sexta, carrega o carro no sábado, anota o que faltou durante a estadia, confere tudo na volta e responde o que sobrou e faltou em casa.

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E1-01 | Criar viagem sem cadastro, respondendo: tipo (barraca com carro, trilha com mochila, motorhome), número de noites ou datas, adultos, adolescentes (12+), crianças (5 a 11), menores de 5, pets, clima esperado (frio, ameno, calor) e chance de chuva. | Na primeira abertura, a lista aparece sem pedir conta. Só tipo, noites e pessoas são obrigatórios; o resto tem valor padrão. |
| E1-02 | Gerar a lista por categoria: abrigo, dormir, cozinha, comida e bebida, roupa, higiene, primeiros socorros e segurança, ferramentas, lazer, documentos, crianças, pet. | Mudar uma resposta recalcula a lista e mostra quantos itens entraram e saíram. Categorias sem itens (pet, crianças) não aparecem. |
| E1-03 | Calcular quantidades de consumíveis (água, gás, gelo, carvão) por pessoas e noites. | As quantidades mudam ao alterar pessoas ou noites. As fórmulas vêm do conteúdo definido na spec. |
| E1-04 | Editar a lista: adicionar, remover, renomear, alterar quantidade e escrever uma nota por item. | Item removido não volta ao recalcular. Item adicionado à mão nunca é apagado por recálculo. |
| E1-05 | Marcar cada item em dois passos, "separei" e "está no carro", e sinalizar "preciso comprar". | Os três estados são visíveis na lista e filtráveis. O progresso aparece por categoria e no total. |
| E1-06 | Avisar na saída o que está separado mas não está no carro, e o que não foi separado. | Ao tocar em "vou sair", o app lista os pendentes dos dois tipos antes de confirmar. |
| E1-07 | Funcionar sem internet. | Em modo avião, criar viagem, editar e marcar itens funcionam. Ao reconectar, nada se perde e nada duplica. |
| E1-08 | Lembretes de véspera por notificação: carregar lanternas e baterias, congelar gelo, checar o gás. | Uma notificação no dia anterior à saída, com as tarefas. Chega sem internet. Pode ser desligada. |
| E1-09 | Anotar durante a estadia o que faltou. | Em dois toques, a partir da lista, o item entra em "faltou". Funciona offline. |
| E1-10 | Checklist da volta: conferir o que veio, tarefas de desmontagem (contar espeques, recolher lixo) e marcar o que precisa secar ou lavar em casa. | A lista de ida vira lista de conferência. Itens não conferidos ficam destacados. Itens "secar em casa" geram um lembrete dois dias depois. |
| E1-11 | Perguntar em casa o que sobrou e o que faltou, e usar isso na próxima lista. | Na viagem seguinte, o que faltou já vem na lista e o que sobrou vem com quantidade menor ou sinalizado. A mudança é mostrada ao usuário. |
| E1-12 | Repetir a última viagem ou salvar uma lista como modelo. | Uma nova viagem é criada em um toque a partir da anterior, com os ajustes do E1-11 aplicados. |
| E1-13 | Informar o destino, opcional: nome do camping e cidade. | A viagem pode ser criada e concluída sem destino. O destino pode ser incluído ou trocado depois. |
| E1-14 | Guardar as viagens no aparelho e, se a pessoa criar conta depois, vincular todas a ela. | Após o login, as viagens feitas sem conta continuam lá e passam a sincronizar. |

**Dependência crítica**

O conteúdo das listas (itens por tipo de viagem, por perfil e as fórmulas de quantidade) não existe ainda. Ele é o coração da etapa 1 e será escrito na spec, não inventado pelos agentes durante o desenvolvimento.

## 8. Requisitos da Etapa 2: grupo e divisão de gastos

A etapa 2 permite que várias famílias preparem a mesma viagem, com o mínimo de esforço para quem é convidado.

**Jornada de referência**

Carla marca a viagem como grupo e manda o link no WhatsApp. Bruno e Paula, Diego e Lívia abrem no navegador, entram com o nome e tocam no que vão levar. Bruno assume a carne, informa R$ 420 e o app mostra quanto cada família deve a ele.

**Convite e lista do grupo**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E2-01 | Transformar uma viagem em viagem de grupo e gerar um link de convite. | O organizador precisa estar logado. O link pode ser compartilhado por qualquer app do celular. |
| E2-02 | Página web do convidado: abrir o link no navegador do celular, entrar só com o nome, ver a lista do grupo e assumir itens. | Do toque no link até assumir o primeiro item, sem instalar e sem criar conta. A página oferece baixar o app para as demais funções. |
| E2-03 | Separar a lista em "itens de cada família" (pessoais) e "itens do grupo" (compartilhados). | Cada família vê e marca só os próprios itens pessoais. Itens do grupo são vistos por todos. |
| E2-04 | Assumir um item do grupo com um toque ("eu levo"). | O nome de quem assumiu aparece no item para todos. É possível desistir. |
| E2-05 | Mostrar itens do grupo sem responsável e itens assumidos por mais de uma família. | Uma visão "ninguém pegou" e um aviso "3 fogareiros, precisa de todos?". |
| E2-06 | Calcular as quantidades do grupo pela soma das pessoas de todas as famílias. | Entrar ou sair uma família recalcula água, carvão, gelo e similares. |
| E2-07 | Mostrar ao organizador o progresso de cada família e lembrar só quem tem pendência. | O organizador vê pendências por família. O lembrete vai apenas para quem tem item do grupo assumido e não separado. No máximo um lembrete por dia por pessoa. |
| E2-08 | Sincronizar o grupo. | Com internet, a mudança de um aparece para os outros em poucos segundos. Mudanças feitas offline entram ao reconectar sem apagar as dos outros. Se dois assumem o mesmo item, os dois ficam registrados. |

**Divisão de gastos**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E2-09 | Marcar um item do grupo como "vai ser dividido", com estimativa antes da compra e valor real depois. | O comprador informa o valor e pode anexar foto da nota. A estimativa aparece para todos antes da compra. |
| E2-10 | Sugerir a divisão por cotas: adulto e adolescente (12+) uma cota, criança (5 a 11) meia cota, menor de 5 não paga. | O valor por cota e o total por família aparecem assim que o valor é informado. |
| E2-11 | Permitir trocar a regra por item: igual por família, ou só adultos. | A troca recalcula na hora e fica registrada. |
| E2-12 | Escolher quem participa de cada item (ex.: bebida só entre quem bebe). | O padrão é todos. Desmarcar uma pessoa a retira do cálculo daquele item. |
| E2-13 | Resumo de gastos por família: quanto cada família deve a cada comprador, por item e no total. | A soma do que as famílias devem mais a parte do comprador é igual ao valor do item, ao centavo. |
| E2-14 | Chave Pix do comprador, com botão para copiar chave e valor, e marcação "paguei". | A chave é visível só para membros da viagem. O comprador vê quem já marcou como pago. Nenhum pagamento passa pelo app. |
| E2-15 | Registrar quem alterou valores e regras de divisão. | Cada alteração mostra autor, data e valor anterior. |

**Conta**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E2-16 | Login com Google, e com Apple a partir do lançamento oficial, exigido para organizar grupo, lançar gasto e cadastrar chave Pix. | Convidado sem conta consegue ver a lista, assumir itens e ver o que deve. Para lançar gasto, precisa do app e de login. |
| E2-17 | Excluir a conta e os dados pessoais pelo próprio app. | A exclusão remove os dados pessoais e mantém os valores do grupo com o nome substituído por "participante". |

**Família com mais de um aparelho**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E2-18 | Dois adultos da mesma família usam a mesma lista, cada um no próprio celular. Vale também para viagem de uma família só. | Um adulto convida o outro por link para a mesma família. Os dois veem e marcam os mesmos itens, com a sincronização do E2-08. |

## 9. Requisitos da Etapa 3: camping, alertas e confirmações

A etapa 3 faz o app avisar o campista, no momento em que ele escolhe o destino, sobre o que vai encontrar lá. Os dados do camping não ficam expostos em busca pública: aparecem só como alerta e ajuste na lista de quem escolheu aquele camping.

**Jornada de referência**

Carla escolhe o Camping Recanto das Águas. O app avisa: um chuveiro quente para cerca de 25 barracas, churrasco só no quiosque, som até 22h, piscina abre às 10h. Ela toca em "ciente", a lista ganha a extensão de 20 m e perde a grelha portátil. Na volta, responde quatro perguntas e passa a constar como última confirmação.

**Destino e ficha**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E3-01 | Buscar o camping por nome ou cidade e, se não existir, criar com nome e cidade. | A busca devolve só nome e cidade. Criar um camping leva dois campos. |
| E3-02 | Evitar duplicados ao criar. | Se já existe camping com nome parecido na mesma cidade, o app pergunta "é este?" antes de criar. |
| E3-03 | Ficha mínima com 8 fatos: energia (voltagem e tomada perto da barraca); chuveiros e capacidade aproximada em barracas; água quente; churrasco; pet; horário de som; piscina e horário; sinal de celular por operadora. | Cada fato tem opções fechadas definidas na spec. Fato sem dado aparece como "não sabemos ainda". |
| E3-04 | Uma avaliação de opinião, a limpeza do banheiro, em três níveis. | É a única opinião da versão 1. Não existe nota geral do camping. |

**Campings duplicados**

A solução combina prevenção na criação e fusão depois, sem serviço pago.

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E3-20 | A cidade é escolhida na lista oficial de municípios do IBGE, não digitada. | Não existem duas grafias da mesma cidade. |
| E3-21 | A comparação usa o nome normalizado (minúsculas, sem acento, sem palavras genéricas como "camping") e similaridade de texto, dentro da mesma cidade. | "Camping Recanto das Águas" e "recanto das aguas" são reconhecidos como o mesmo candidato. A similaridade usa função do próprio banco de dados. |
| E3-22 | Um camping pode ter vários nomes (apelidos), e a busca encontra por qualquer um. | Buscar por um apelido leva ao mesmo camping. |
| E3-23 | Qualquer usuário pode sinalizar "é o mesmo lugar", e o sistema também lista pares suspeitos. | Os pares entram numa fila de revisão. |
| E3-24 | A fusão preserva tudo e pode ser desfeita. | Viagens, confirmações e histórico dos dois passam ao camping unificado; os nomes viram apelidos. Nomes normalizados idênticos na mesma cidade são fundidos automaticamente; os demais dependem de aprovação de uma pessoa. |

**Alertas e lista**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E3-05 | Mostrar alertas ao escolher o destino, em três níveis: atenção, ajuste na lista e informação. | "Atenção" exige confirmação mínima (seção 10). Dado de uma só pessoa aparece como informação "não confirmada". |
| E3-06 | Cruzar a ficha com a viagem. | Viagem com pet e camping que não aceita pet gera alerta de atenção. O mesmo vale para os demais cruzamentos definidos na seção 10. |
| E3-07 | Mostrar as regras do camping com um toque em "ciente". | As regras ficam acessíveis offline durante a viagem. |
| E3-08 | Ajustar a lista conforme a ficha e mostrar o que mudou. | Cada ajuste aparece como "entrou" ou "saiu" com o motivo ("tomada longe: extensão de 20 m"). O usuário pode desfazer. |
| E3-09 | Para camping sem dados, gerar a lista "na dúvida". | Itens que dependem do camping entram marcados como "depende do camping". |
| E3-10 | Gerar um texto de perguntas para o campista mandar ao camping. | O texto cobre os fatos sem dado e é compartilhado pelo menu do celular. O app não guarda nem usa contato do camping. |
| E3-11 | Registrar as respostas obtidas do camping, por toques. | As respostas ajustam a lista e ficam com a origem "informado pelo camping, via campista". |

**Volta e confirmações**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E3-12 | Perguntas fechadas na volta, uma por tela, que variam entre usuários. | De 3 a 4 perguntas; até 6 para o primeiro visitante. Uma única notificação, na noite da chegada. Parar no meio guarda o que foi respondido. |
| E3-13 | Incluir a pergunta "as regras informadas foram cumpridas?". | A resposta alimenta o fato da regra, não uma nota. |
| E3-14 | Mostrar em cada fato: número de confirmações e a última, com nome curto e mês/ano. | Exemplo: "Som até 22h: cumprida · 6 confirmações · última: Carla R., nov/2026". |
| E3-15 | Histórico ao tocar no fato: quem, mês/ano, tipo de viagem e ocasião (fim de semana comum, feriado, férias). | Divergências aparecem lado a lado ("5 confirmam, 1 diz que não, em feriado"). Não há média que as esconda. |
| E3-16 | Aplicar validade ao dado: recente, pode ter mudado, antigo. | Os prazos estão na seção 10. Dado antigo não gera alerta. |
| E3-17 | Restringir quem confirma. | Só conta logada, com viagem registrada para aquele camping e data de volta já passada. Uma confirmação por fato por viagem. |
| E3-18 | Opção de confirmar com apelido ou de forma anônima. | Anônimo aparece como "campista" mais o tipo de viagem. A confirmação conta igual. |
| E3-19 | Nada é publicado antes do fim da viagem. | Confirmações só ficam visíveis a outros depois da data de volta. O dia exato nunca é mostrado. |

**Sugestões ao camping, só guardadas**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| E3-25 | Na volta, uma pergunta opcional: "alguma sugestão para o camping?", com opções de toque (abrir a piscina mais cedo, mais chuveiros, mais tomadas, mais sombra) e um campo curto de texto. | A sugestão não altera nenhum fato nem avaliação do camping. Pode ser pulada com um toque. |
| E3-26 | As sugestões são guardadas e somadas por camping, sem envio a ninguém. | É possível consultar internamente "quantos campistas sugeriram o quê" por camping. Nada é exibido a outros usuários. Nada é enviado ao dono na versão 1. |
| E3-27 | O campista vê uma confirmação simples de que a sugestão foi registrada. | O texto não promete que o camping vai receber ou responder. |

Essas sugestões são o principal insumo para a conversa com os donos de camping na fase 2 (seção 17).

**Conexão**

Escolher um destino e receber a ficha exige internet naquele momento. Depois disso, ficha, regras e ajustes ficam guardados no aparelho para a viagem.

## 10. Regras de negócio

Estas regras valem para todas as etapas. Os números marcados como premissa estão listados na seção 16 e podem ser calibrados sem mudar o desenho.

**Faixas etárias**

| Faixa | Idade | Cota na divisão de gastos |
| --- | --- | --- |
| Adulto | 18 ou mais | 1 |
| Adolescente | 12 a 17 | 1 |
| Criança | 5 a 11 | 0,5 |
| Menor de 5 | 0 a 4 | 0 |

**Divisão de gastos**

- Valor por cota = valor do item dividido pela soma das cotas dos participantes daquele item.
- Cada família paga suas cotas vezes o valor por cota. A parte do comprador já está paga.
- O valor por cota é arredondado para baixo, ao centavo. A diferença fica com o comprador.
- Regras alternativas por item: igual por família, ou só adultos e adolescentes.

Exemplo de conferência, carne a R$ 420:

| Família | Pessoas | Cotas | Valor |
| --- | --- | --- | --- |
| Carla e Rafael | 2 adultos, Lucas (9), Bia (5) | 3 | R$ 180 |
| Bruno e Paula (comprador) | 2 adultos, bebê | 2 | R$ 120, já pago |
| Diego e Lívia | 2 adultos | 2 | R$ 120 |

São 7 cotas de R$ 60. Bruno recebe R$ 300.

**Estados do item**

- Ida: a separar, separei, está no carro. "Preciso comprar" é uma marca à parte, que sai quando o item é separado.
- Estadia: "faltou" pode ser marcado em qualquer item, inclusive em item que não estava na lista.
- Volta: conferido, não conferido, secar ou lavar em casa.
- Pós-viagem: sobrou, faltou.

**Da ficha do camping para a lista**

| Fato | Condição | Efeito |
| --- | --- | --- |
| Energia | 220 V | Tarefa "confira seus aparelhos" |
| Energia | Tomada longe da barraca | Entra extensão de 20 m |
| Energia | Sem energia | Saem itens elétricos; entram lanterna extra e bateria portátil |
| Chuveiros | Mais de 15 barracas por chuveiro | Alerta de atenção com a proporção |
| Água quente | Não tem | Alerta de atenção se o clima for frio; informação nos demais casos |
| Churrasco | Proibido | Alerta de atenção; saem carvão e grelha |
| Churrasco | Só em área comum | Informação; sai a grelha portátil, fica o carvão |
| Pet | Não aceita, e a viagem tem pet | Alerta de atenção |
| Som | Horário de silêncio | Informação com "ciente" |
| Piscina | Tem, com horário | Informação com "ciente"; entram roupa de banho e boia para crianças |
| Sinal | Sem sinal da operadora | Informação; tarefa "baixe os mapas e avise a família" |

A tabela completa de itens e condições faz parte do conteúdo da spec.

**Confiança no dado do camping**

- **Validade:** até 6 meses, "recente"; de 6 a 12 meses, "pode ter mudado"; acima de 12 meses, o dado fica só no histórico e não gera alerta.
- **Mínimo para alerta de atenção:** 2 confirmações de contas diferentes nos últimos 12 meses.
- **Dado único:** uma só confirmação aparece como informação "não confirmada".
- **Divergência:** vale a maioria das confirmações recentes; em empate, a mais recente. As duas versões ficam visíveis no histórico.
- **Origem:** "confirmado por campistas" pesa mais que "informado pelo camping, via campista".
- **Regra não é nota:** nenhum fato de regra (som, piscina, churrasco, pet) entra em avaliação de qualidade.

**Permissões no grupo**

- O organizador edita os dados da viagem, o destino e remove participantes.
- Todos os participantes adicionam e assumem itens do grupo.
- O valor de um gasto é editado pelo comprador ou pelo organizador, com registro.

## 11. Cadastro, privacidade e antifraude

O app pede conta só quando a função exige identidade, não pede CPF e trata destino com datas como dado sensível.

**Quando a conta é exigida**

| Função | Sem conta | Com conta (Google ou Apple) |
| --- | --- | --- |
| Criar e usar a lista (etapa 1) | Sim | Sim, com cópia de segurança |
| Entrar em grupo pelo link e assumir itens | Sim, só com o nome | Sim |
| Organizar grupo, lançar gasto, cadastrar Pix | Não | Sim |
| Escolher destino e ver alertas | Sim | Sim |
| Confirmar fatos do camping | Não | Sim |

**Privacidade**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| PRV-01 | Coletar o mínimo: nome de exibição, e-mail do login, contagem de pessoas por faixa etária. Sem CPF, sem telefone, sem nomes de crianças obrigatórios. | Nenhuma tela pede esses dados. |
| PRV-02 | Não coletar localização na versão 1. | O app não pede permissão de localização. |
| PRV-03 | Nunca mostrar a terceiros o destino ou as datas de uma viagem em andamento ou futura. | Confirmações só aparecem após a volta, com mês e ano. |
| PRV-04 | Consentimento claro no primeiro login, com política de privacidade e termos de uso em português. | O usuário aceita antes de qualquer dado sair do aparelho. |
| PRV-05 | Exclusão de conta e dados pelo app, e exportação dos próprios dados a pedido. | Atende aos direitos do titular previstos na LGPD. A revisão jurídica dos textos é feita por uma pessoa, não pelos agentes. |
| PRV-06 | Chave Pix visível só para membros da mesma viagem. | A chave não aparece em nenhuma outra tela ou chamada. |

**Antifraude nas confirmações**

O risco mais provável não é robô genérico, e sim alguém inflando o próprio camping ou prejudicando um concorrente.

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| FRD-01 | Confirmação exige conta, viagem registrada para aquele camping e data de volta passada. | Sem os três, a pergunta nem é exibida. |
| FRD-02 | A viagem precisa ter sinais de uso real: criada antes da data de ida e com itens marcados. | Viagem criada depois da data de ida não gera confirmação. |
| FRD-03 | Uma confirmação por fato por viagem; no máximo 2 viagens por mês para o mesmo camping contam por conta. | O excedente é guardado, mas não conta. |
| FRD-04 | Verificação do aparelho (mesma do DEF-04). | Confirmação sem atestado válido é recusada. |
| FRD-05 | Reter para revisão picos anormais: muitas confirmações do mesmo camping vindas de contas novas em poucos dias. | As confirmações retidas não aparecem até serem liberadas por uma pessoa. O limiar é definido na spec. |

## 12. Requisitos não funcionais

O app é desenvolvido em Android e ganha a versão de iPhone no lançamento oficial, funciona offline como padrão e é pensado para uso ao ar livre com uma mão.

| ID | Tema | Requisito | Critério de aceite |
| --- | --- | --- | --- |
| NF-01 | Plataforma | Durante o desenvolvimento (versões 0.x), o app é gerado e testado só em Android. No lançamento oficial (1.0.0), sai para Android e iPhone a partir do mesmo código. A escolha entre Flutter e React Native é feita na spec. | Nada no código impede gerar a versão de iPhone depois, sem reescrever telas ou regras. |
| NF-02 | Plataforma | Página web do convidado, feita para navegador de celular. | Abre nos navegadores padrão de iPhone e Android sem instalação. |
| NF-03 | Offline | Os dados da viagem ficam no aparelho e sincronizam quando há conexão. | Todos os requisitos marcados como offline passam em modo avião. Sincronização não perde nem duplica dados. |
| NF-04 | Desempenho | Gerar ou recalcular a lista é instantâneo para o usuário. | Até 1 segundo em aparelho intermediário, sem internet. |
| NF-05 | Desempenho | O app abre rápido direto na viagem em andamento. | Até 3 segundos do toque no ícone à lista visível. |
| NF-06 | Notificações | Lembretes de véspera e pós-volta são locais; avisos de grupo usam notificação por servidor. | Lembretes chegam sem internet. O usuário controla cada tipo. |
| NF-07 | Uso ao ar livre | Legível sob sol, usável com uma mão, com tema claro e escuro. | Contraste mínimo AA. Áreas de toque de pelo menos 44 pontos. Ações principais ao alcance do polegar. |
| NF-08 | Acessibilidade | Compatível com leitor de tela e com tamanho de fonte do sistema. | Todas as telas navegáveis por VoiceOver e TalkBack. Nada quebra com fonte ampliada. |
| NF-09 | Idioma | Português do Brasil, com textos separados do código. | Nenhum texto fixo no código. Valores em reais, datas no formato brasileiro. |
| NF-10 | Segurança | Comunicação cifrada, acesso por menor privilégio, registros sem dados pessoais. | Cada usuário só acessa as próprias viagens e as viagens de grupo em que está. Verificado por testes de autorização. |
| NF-11 | Qualidade | Testes automatizados para regras de negócio, sincronização e autorização. | As regras da seção 10 têm teste, incluindo o exemplo de cotas. Nenhuma entrega é aprovada com teste falhando. |
| NF-12 | Publicação | Publicação no Google Play e na App Store no lançamento oficial (1.0.0). Antes disso, só versões de teste em Android. | Contas de desenvolvedor, textos e capturas de tela prontos. Atende às regras de exclusão de conta das lojas. |
| NF-13 | Medição | Registrar os eventos necessários para as métricas da seção 13, sem dados pessoais além do necessário. | Cada métrica da seção 13 pode ser calculada a partir dos eventos. |

**O que precisa de validação humana**

- Teste em aparelhos reais, com foco em offline e sincronização de grupo.
- Revisão de privacidade e dos textos legais.
- Envio às lojas e resposta às revisões da Apple e do Google.
- Teste com campistas ao fim de cada etapa.

## 13. Métricas de sucesso

Cada etapa tem uma pergunta a responder e as medidas que a respondem. As metas numéricas ficam em aberto até a primeira medição com usuários reais.

| Etapa | Pergunta | Medida principal | Medidas de apoio |
| --- | --- | --- | --- |
| 1 | A lista serve para uma viagem real? | Parcela das viagens criadas que chegam a ter itens marcados como "está no carro" | Parcela que conclui o checklist da volta; parcela que responde "faltou / sobrou"; parcela com destino informado |
| 1 | A pessoa volta? | Parcela dos usuários que criam a segunda viagem em até 90 dias | Uso de "repetir a última viagem" |
| 2 | O app se espalha pelos grupos? | Número médio de convidados que assumem ao menos um item, por viagem de grupo | Parcela de convidados que instalam o app; parcela de viagens de grupo com gasto dividido |
| 3 | Os dados de destino crescem? | Número de campings com 2 ou mais confirmações recentes | Parcela de viagens com destino da base; parcela que responde às perguntas na volta |
| 3 | Os alertas mudam o preparo? | Parcela de viagens com destino em que ao menos um ajuste da ficha foi mantido na lista | Alertas de atenção exibidos por viagem; ajustes desfeitos |

**Sinal para a fase 2**

Quando alguns campings acumularem 10 ou mais visitas pelo app, vale o teste manual com os donos descrito na seção 17.

## 14. Modelo de execução da squad

O app é construído por uma squad de agentes de IA: um orquestrador cria cada feature e a entrega a um agente, e toda entrega passa por um QA sempre ativo antes de ser dada como concluída. A prioridade é qualidade, não velocidade.

```
Orquestrador --cria a feature--> Agente --entrega--> QA --aprovado?
                                   ^                  |
                                   |--- não: volta ---|
QA --sim: avisa--> Orquestrador

Cinema (design): chamada pelo orquestrador quando a feature precisa.
Agentes: até 6 ao mesmo tempo, além do orquestrador e do QA.
```

A reprovação volta direto ao agente, sem passar pelo orquestrador; só a aprovação chega a ele.

**Papéis**

| Papel | Modelo e esforço | Responsabilidade |
| --- | --- | --- |
| Orquestrador | Fable 5.2, esforço alto | Lê o PRD e a spec, cria cada feature como tarefa, escolhe o modelo e o esforço do agente conforme a atividade, chama a Cinema quando precisa de design e mantém o QA ativo. |
| QA | Opus 5.5, esforço alto | Fica ativo durante todo o desenvolvimento. Valida cada entrega contra os critérios de aceite. Aprova avisando o orquestrador; reprova devolvendo ao agente. |
| Agentes de desenvolvimento | Definidos pelo orquestrador a cada tarefa | Constroem a feature (app, servidor, testes). Entregam sempre ao QA, nunca direto ao orquestrador. |
| Cinema, a squad de design | Próprios da squad | Telas, componentes e identidade visual. É chamada pelo orquestrador quando a feature precisa. |

**Regras do fluxo**

1. O orquestrador cria cada feature a partir dos IDs deste PRD e a passa a um agente. Features independentes rodam em paralelo.
2. O agente desenvolve e entrega ao QA.
3. Se o QA aprova, avisa o orquestrador, que segue para a próxima feature.
4. Se o QA reprova, devolve direto ao agente, que ajusta e entrega de novo ao QA.
5. Nenhuma feature é concluída sem aprovação do QA.
6. Na escolha de modelo e esforço, o orquestrador prioriza qualidade: na dúvida, usa o nível mais alto.

**Escolha do mascote antes dos protótipos**

A primeira entrega da Cinema são 10 opções de mascote, apresentadas da mesma forma que os protótipos. O mascote escolhido entra nos protótipos, no app e no site.

O pedido pronto para entregar à Cinema está no arquivo `docs/brief-cinema-1-mascote.md`.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| MSC-01 | A Cinema entrega 10 opções de mascote, todas pinguins de desenho original, em estilos diferentes entre si. | As diferenças são de traço, proporção e personalidade, não só de cor ou acessório. |
| MSC-02 | As 10 opções são apresentadas em HTML navegável. | Abre no navegador do celular e do computador, sem instalar nada. Cada opção tem a sua tela, e há uma visão com as 10 lado a lado. |
| MSC-03 | Cada opção aparece nos usos reais. | Ícone do app em tamanho pequeno, tela de abertura, uma tela do app, cabeçalho do site e versão em uma cor só. |
| MSC-04 | Cada opção traz ao menos 4 poses ou expressões. | Neutro, comemorando, em alerta e uma em situação de camping. |
| MSC-05 | O mascote remete ao camping sem depender de detalhe pequeno. | No tamanho do ícone do app, continua reconhecível como pinguim e como campista. |
| MSC-06 | O desenho é original. | Não lembra pinguins de outras marcas nem o logotipo da marca de equipamentos Pinguin. |
| MSC-07 | O responsável pelo produto escolhe um, ou pede uma combinação. | A escolha fica registrada. Nenhum protótipo começa antes dela. |
| MSC-08 | Depois da escolha, a Cinema entrega os arquivos finais do mascote. | Vetor, versões clara e escura, versão em uma cor, todas as poses e o ícone do app nos tamanhos exigidos pelas lojas. |

**Mascote pronto para os vídeos**

O mascote também é o personagem dos vídeos 3D de divulgação, então a entrega da Cinema inclui o que a produção de vídeo precisa como entrada.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| MSC-09 | As 10 opções são desenhadas para funcionar em 3D. | Cada opção traz vistas de frente, de lado e de três quartos. Formas que não se sustentam em volume são descartadas antes da apresentação. |
| MSC-10 | O mascote escolhido é entregue como modelo 3D. | Arquivo GLB e arquivo-fonte, com escala, origem e orientação padronizadas, materiais e partes nomeados, e leve o bastante para renderizar em computador comum. |
| MSC-11 | O modelo vem com esqueleto e expressões. | Expressões mínimas: neutro, alegre, preocupado, em alerta, com frio, com calor e surpreso. |
| MSC-12 | O modelo vem com animações básicas. | Parado respirando, andar, acenar, apontar, olhar para cima, tremer de frio e comemorar. |
| MSC-13 | A entrega inclui um guia de uso do mascote. | Cores oficiais, proporções, tamanhos mínimos e o que o mascote nunca faz. |
| MSC-14 | O pacote é testado na produção de vídeo antes de ser dado como entregue. | Um plano de teste de 5 segundos é renderizado com o mascote, e o QA confere fidelidade ao desenho escolhido. |

**Escolha do design antes do desenvolvimento**

Depois da escolha do mascote e antes de qualquer desenvolvimento, a Cinema entrega 5 protótipos navegáveis e o responsável pelo produto escolhe um.

O pedido pronto para entregar à Cinema está no arquivo `docs/brief-cinema-2-prototipos.md`.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| DSG-01 | A Cinema entrega 5 protótipos em HTML, navegáveis, com direções diferentes entre si. | Cada um abre no navegador do celular e do computador, sem instalar nada. As diferenças são de linguagem visual e de navegação, não só de cor. |
| DSG-02 | Os 5 cobrem as mesmas telas, para comparação justa. | Criar viagem, lista com "separei" e "está no carro", aviso de saída, alertas do camping, grupo com "quem leva o quê", divisão de gastos, checklist da volta, página do convidado e página inicial do site. |
| DSG-03 | Os protótipos usam os dados das jornadas de referência. | Família da Carla, carne a R$ 420, Camping Recanto das Águas. Sem texto de preenchimento. |
| DSG-04 | Os protótipos respeitam os requisitos de uso ao ar livre e de acessibilidade. | Atendem a NF-07 e NF-08. |
| DSG-05 | O responsável pelo produto testa os 5 e escolhe um, ou pede uma combinação. | A escolha fica registrada. Nenhum agente de desenvolvimento é aberto antes dela. |
| DSG-06 | O protótipo escolhido vira a referência visual da spec e do QA. | As telas entregues são comparadas com ele. |

**Identidade ligada ao camping, com acabamento premium**

A comunidade campista tem cultura visual própria, e o app deve parecer feito por quem acampa, com acabamento de produto premium.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| DSG-07 | Cada direção nasce do universo do camping: cores, elementos e tom de voz ligados à cultura campista. | Cada protótipo traz uma página curta com paleta, tipografia, ícones e a origem da inspiração. |
| DSG-08 | As 5 direções exploram territórios diferentes do camping. | Exemplos: fogueira e noite, mata e trilha, equipamento e ofício, mapa e expedição, comunidade e encontro. A Cinema pode propor outros. |
| DSG-09 | Acabamento premium: poucos elementos, bem resolvidos. | Tipografia cuidada, espaçamento generoso e paleta contida. Nenhum protótipo parece modelo pronto ou app genérico de lista. |
| DSG-10 | A identidade funciona no uso real. | Leitura garantida sob sol forte. Os estados dos itens não dependem só de cor, para quem não distingue verde de vermelho. |
| DSG-11 | A identidade funciona fora do Brasil. | Símbolos e metáforas compreensíveis em outros países, sem depender de referência local. |
| DSG-12 | A identidade não imita a de concorrentes. | Nenhuma direção reproduz cores, marca ou traços reconhecíveis de outro app de camping ou de lista. |

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| DSG-13 | As 5 direções usam o mascote escolhido na etapa anterior (MSC-07). | Cada direção adapta cor e contexto do mascote à sua linguagem, sem redesenhá-lo. |

**Painéis e paralelismo**

A squad usa até 8 painéis: o orquestrador, o QA e até 6 agentes em paralelo.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| SQD-01 | No máximo 6 agentes ativos além do orquestrador e do QA. | O total de painéis abertos nunca passa de 8. |
| SQD-02 | O orquestrador decide o que roda em paralelo. | Só features sem dependência entre si rodam juntas. As que mexem nos mesmos arquivos ou dependem uma da outra rodam em sequência. |
| SQD-03 | Cada agente trabalha em ramo e pasta de trabalho próprios. | Dois agentes nunca editam a mesma cópia do código. |
| SQD-04 | O QA valida uma entrega por vez, na ordem de chegada. | As entregas em espera ficam em fila visível ao orquestrador. Cada aprovação considera o que já foi integrado. |
| SQD-05 | Qualidade vem antes de paralelismo. | Se a fila do QA crescer ou as reprovações aumentarem, o orquestrador reduz o número de agentes. |

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| SQD-10 | Os 6 lugares são compartilhados entre os agentes de desenvolvimento e os painéis da Cinema. A Cinema pode pedir quantos painéis quiser. | A soma dos painéis ativos de desenvolvimento e da Cinema nunca passa de 6. |
| SQD-11 | Sem lugar livre, o pedido de painel espera em fila até outro ser fechado. | Nenhum painel abre acima do limite. O orquestrador controla a fila e libera os lugares. |
| SQD-12 | Nas fases do mascote e dos 5 protótipos, sem agentes de desenvolvimento abertos, a Cinema pode usar os 6 lugares. | Os 5 protótipos podem ser produzidos em paralelo. |

**Encerramento e limpeza dos painéis**

O orquestrador fecha cada painel quando a tarefa termina e não deixa arquivo solto para trás.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| SQD-06 | O orquestrador fecha o painel assim que a tarefa do agente é aprovada e integrada. | Nenhum painel fica aberto sem tarefa. |
| SQD-07 | Ao fechar um painel, seus arquivos temporários são excluídos: rascunhos, registros, arquivos gerados, pasta de trabalho e ramo local já integrado. | Depois do fechamento, não sobra arquivo do painel fora do repositório. |
| SQD-08 | Antes de excluir, o orquestrador confirma que o trabalho aprovado está integrado. | Nenhuma exclusão acontece com alteração aprovada ainda não integrada. Trabalho descartado fica registrado com o motivo. |
| SQD-09 | Emuladores e servidores locais abertos pelo painel são encerrados junto. | Nenhum processo do painel continua rodando. |

**Propostas a confirmar**

Estes pontos não foram definidos e são sugestões para fechar o protocolo na spec:

- **O que o QA verifica:** critérios de aceite do requisito, princípios da seção 4, testes automatizados passando e nenhuma quebra nas features já aprovadas.
- **Reprovação com evidência:** o QA informa qual critério falhou e como reproduzir.
- **Limite de voltas:** após 3 reprovações seguidas da mesma feature, o QA avisa o orquestrador, que divide a tarefa, troca o modelo ou pede decisão humana.
- **Ambiguidade:** agente não inventa regra de negócio nem conteúdo. Pergunta ao orquestrador, que consulta o PRD, a spec ou o responsável humano.
- **Ponto de controle humano:** ao fim de cada etapa, uma pessoa testa em aparelho real antes de liberar a etapa seguinte.

**Controle de versão**

O código fica em git, e só o que foi aprovado pelo QA chega ao repositório remoto. O vai e vem entre agente e QA acontece localmente e não dispara a esteira.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| GIT-01 | Cada feature é desenvolvida em um ramo próprio, com o ID do requisito no nome. | Exemplo: `feature/E1-05-estados-do-item`. |
| GIT-02 | Durante o ciclo entre agente e QA, os commits ficam locais. | Nenhum envio ao remoto antes da aprovação do QA. Reprovações e ajustes não geram execução da esteira. |
| GIT-03 | Após a aprovação, os commits da feature são reunidos em um só e enviados. | O histórico principal tem um commit por feature aprovada, com o ID do requisito na mensagem. |
| GIT-04 | O ramo principal é protegido. | Ninguém envia direto a ele. A entrada é feita pelo orquestrador, só com aprovação do QA registrada. |
| GIT-05 | Os testes rodam localmente. A esteira do GitHub roda só quando há uma versão. | A entrada de uma feature no ramo principal não dispara nada no GitHub. Gerar os apps e enviar às lojas só acontece com uma etiqueta de versão. |
| GIT-06 | Versões seguem numeração semântica e são criadas pelo orquestrador com aprovação humana. | 0.1.0 ao fim da etapa 1, 0.2.0 da etapa 2, 0.3.0 da etapa 3, 1.0.0 no lançamento público. Correções aumentam o último número. |
| GIT-07 | Cada versão tem registro do que mudou. | Um arquivo de mudanças lista as features por ID em cada versão. |
| GIT-08 | Segredos, arquivos gerados e rascunhos dos agentes não entram no repositório. | Uma verificação automática bloqueia o envio de credenciais. |
| GIT-09 | PRD, spec e conteúdo das listas são versionados junto com o código. | Cada versão do app aponta para a versão dos documentos que a originou. |

**Teste local primeiro**

O repositório fica no GitHub, usado o mínimo possível: ele guarda código aprovado e versões. Tudo o que pode ser testado na máquina local é testado lá.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| GIT-10 | O QA roda a suíte completa localmente antes de aprovar: regras de negócio, sincronização e autorização. | A aprovação registra o resultado dos testes locais. Sem isso, a feature não sobe. |
| GIT-11 | Servidor e banco de dados têm versão local para desenvolvimento e teste. | Um agente consegue subir o ambiente inteiro na própria máquina, sem depender de serviço externo. |
| GIT-12 | O app é testado em emulador de Android local. | Os fluxos das jornadas de referência passam no emulador, incluindo modo avião. |
| GIT-13 | O que não dá para testar localmente é listado e validado por uma pessoa a cada versão. | Lista mínima: login real com Google, notificações em aparelho real, verificação do aparelho, envio às lojas. |

**Teste a fundo no emulador**

O QA opera o app em emulador de Android no desktop, por comandos, como um usuário faria.

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| GIT-14 | Cada jornada de referência (seções 7, 8 e 9) tem um roteiro automático de tela, executado no emulador. | O roteiro abre o app, toca, digita e confere o que aparece. Roda sem intervenção humana e guarda capturas de tela como evidência. |
| GIT-15 | Os testes de grupo usam dois ou mais emuladores ao mesmo tempo. | Uma mudança feita em um aparece no outro; mudanças feitas offline nos dois se juntam sem perda. |
| GIT-16 | O QA simula as condições reais de uso. | Modo avião, rede lenta, fonte ampliada, tema escuro, telas pequenas e grandes, e avanço do relógio para disparar lembretes. |
| GIT-17 | A página do convidado é testada em navegador automático com tela de celular, incluindo o motor usado pelo iPhone. | Os fluxos de entrar, assumir item e ver gastos passam nos motores de navegador do Android e do iPhone. |

## 15. Riscos e hipóteses

O maior risco não é técnico: tudo neste documento ainda é hipótese, porque nenhum campista foi ouvido ou viu o produto.

| Risco | Efeito | Como o produto responde |
| --- | --- | --- |
| Nenhuma validação com campistas até aqui | Construir as três etapas sobre premissas erradas | Teste com 5 a 10 campistas ao fim de cada etapa, antes de liberar a seguinte |
| Poucos respondem às perguntas na volta | A base de campings cresce devagar | O desenho funciona com uma minoria: poucas confirmações por camping bastam, e cada grupo gera várias de uma vez |
| Base de campings vazia no início | O alerta, que é o momento de maior valor, não aparece | Lista "na dúvida" e texto de perguntas para o camping (E3-09, E3-10) |
| Escopo grande para uma primeira versão | Demora para chegar aos usuários | Três etapas, cada uma publicável por si |
| Sincronização offline em grupo | Perda ou duplicação de dados, a falha mais difícil de corrigir depois | Tratada como tema central da spec e do QA; teste em aparelhos reais |
| Convidado não instala o app | O grupo não funciona | Página web do convidado sem instalação (E2-02) |
| Confirmações falsas | Alertas errados, perda de confiança | Requisitos FRD-01 a FRD-05 |
| Cópia do app | Um concorrente replica as funções | Seção 5: a defesa está na base, no histórico e na rede, não nas telas |
| Plataformas de reserva adicionarem checklist | Concorrente com base de campings pronta | Chegar primeiro aos grupos e acumular confirmações datadas, que elas não têm |
| Agentes inventarem o que a spec não diz | Regras e conteúdo inconsistentes | Critérios de aceite por requisito, QA ativo, regra de não inventar (seção 14) |
| Divisão de gastos gerar conflito entre amigos | Má experiência atribuída ao app | Cálculo transparente, registro de alterações, pagamento fora do app |
| Dado pessoal mal tratado | Problema legal e de reputação | Requisitos PRV-01 a PRV-06 e revisão humana dos textos legais |
| Rejeição ou demora nas lojas | Atraso de lançamento | Requisitos das lojas atendidos desde a etapa 1 (NF-12) |

**Risco de marca do nome Campinguim**

Existe uma marca tcheca de equipamento de camping chamada Pinguin, ativa e vendida em vários países da Europa e por revendedores na América Latina. O nome do app contém quase todo o nome dela, no mesmo nicho.

- **Onde pesa:** pouco no Brasil, onde a marca não foi encontrada operando; mais na Europa, se o app for lançado lá.
- **O que falta:** consulta às bases oficiais de marca (INPI, EUIPO, OMPI), que não pôde ser feita por busca automática, e parecer de um agente de propriedade industrial.
- **Como reduzir:** mascote e identidade visual originais, sem semelhança com a marca; depósito no INPI nas classes de software antes do lançamento; nome alternativo reservado caso a expansão internacional exija.
- **Situação em 23/11/2026:** campinguim.com, campinguin.com e os dois .com.br estavam sem registro; nenhum app com esse nome no Google Play.

**Hipóteses que a versão 1 testa**

1. Campistas usam uma lista gerada em vez da própria lista de sempre.
2. Quem usa uma vez repete na viagem seguinte.
3. Um organizador consegue trazer o grupo pelo link.
4. As pessoas informam o destino mesmo sendo opcional.
5. Uma minoria suficiente responde na volta para manter a base viva.
6. Saber antes o que o camping tem muda a decisão ou o preparo.

## 16. Decisões em aberto e premissas adotadas

Para não travar a spec, este PRD adotou uma premissa em cada ponto não decidido. Cada linha abaixo pode ser confirmada ou trocada antes do desenvolvimento.

**Decisões que só o responsável pelo produto pode tomar**

| Tema | Situação |
| --- | --- |
| Nome e marca do app | Escolhido em 23/11/2026: Campinguim. Faltam o registro dos domínios, a busca no INPI e um parecer sobre a proximidade com a marca Pinguin. |
| Prazo e orçamento | Não definidos. |
| Como chegar aos primeiros usuários | Definido em 23/11/2026: começar pelo estado de São Paulo. Plano na seção 18. |
| Quem faz a validação humana (aparelhos, textos legais, lojas) | Não definido. |
| Liberar as etapas uma a uma para campistas, ou só ao fim das três | O PRD recomenda uma a uma. A decisão registrada é construir as três. |

**Decisões já tomadas**

- **Android no desenvolvimento, iPhone no lançamento.** As versões 0.x são desenvolvidas e testadas só em Android, sem Mac, para economizar. No lançamento oficial (1.0.0) haverá Mac e o app sai também para iPhone, depois de uma rodada própria de testes nessa plataforma.
- **Convidados com iPhone participam pela página web** (E2-02). Durante a fase de testes, as funções completas ficam só no Android.
- **Repositório no GitHub, com uso mínimo.** Testes locais; esteira só em versão.
- **Construção das três etapas completas.**

* **Design escolhido entre 5 protótipos da Cinema,** antes de qualquer desenvolvimento (DSG-01 a DSG-06), com o mascote escolhido antes disso entre 10 opções (MSC-01 a MSC-08).
* **Até 8 painéis:** orquestrador, QA e até 6 agentes em paralelo, fechados e limpos pelo orquestrador ao fim de cada tarefa.

A Cinema pode abrir mais de um painel; todos contam no mesmo limite de 6 e esperam quando não há lugar livre (SQD-10 e SQD-11).

**Premissas adotadas**

| Tema | Premissa neste PRD | Onde aparece |
| --- | --- | --- |
| Faixas etárias e cotas | 12+ cota inteira, 5 a 11 meia, menor de 5 isento | Seção 10 |
| Arredondamento | Para baixo ao centavo; a diferença fica com o comprador | Seção 10 |
| Permissões no grupo | Organizador edita a viagem; todos mexem nos itens do grupo | Seção 10 |
| Convidado sem conta | Assume itens e vê o que deve; não lança gasto | E2-16 |
| Destino sem conta | Permitido, com verificação do aparelho e limite de consultas | Seção 11 |
| Mínimo para alerta de atenção | 2 confirmações de contas diferentes em 12 meses | Seção 10 |
| Validade do dado | 6 meses recente, 12 meses limite | Seção 10 |
| Proporção de chuveiros que gera alerta | Mais de 15 barracas por chuveiro | Seção 10 |
| Limite de confirmações | 2 viagens por mês por camping por conta | FRD-03 |
| Base inicial de campings | Começa vazia e é criada pelos usuários | E3-01 |
| Opinião na ficha | Só limpeza do banheiro | E3-04 |
| Login | Google ou Apple, sem verificação por SMS | E2-16 |
| Localização | Não coletada na versão 1 | PRV-02 |
| Tipos de viagem | Três na criação; conteúdo prioriza barraca com carro | Seção 3 |
| Protocolo do QA | Propostas da seção 14, incluindo limite de 3 reprovações | Seção 14 |
| Metas numéricas | Definidas após a primeira medição | Seção 13 |

**O que a spec precisa resolver**

- Conteúdo das listas: itens por tipo de viagem e perfil, e fórmulas de quantidade.
- Tabela completa de fatos da ficha, com as opções de cada um e os efeitos na lista.
- Banco de perguntas da volta e a regra de rodízio.
- Fluxo de telas das três etapas e da página do convidado.
- Modelo de dados e estratégia de sincronização offline.
- Escolha de tecnologia do app e do servidor.
- Contratos entre app e servidor, com os limites dos requisitos DEF.
- Eventos de medição.
- Protocolo detalhado entre orquestrador, agentes, QA e Cinema, com a ordem das features e a definição de pronto.

## 17. Depois da versão 1

O que foi cortado da versão 1 volta em três blocos, na ordem em que deve trazer mais retorno.

**Versão 1.1: melhorias para o campista**

1. Resumo de viagem para compartilhar, o primeiro a voltar por ajudar o crescimento
2. Clima automático pelo destino e pelas datas
3. Perfil "o que é importante para mim", com alertas pessoais
4. Acerto compensado entre vários compradores
5. Cardápio que vira lista de compras
6. Inventário de equipamento, empréstimos e achados e perdidos do grupo
7. Prova de presença opcional e peso por reputação nas confirmações

**Fase 2: o dono do camping, como hipótese**

Nada é construído para o dono antes de um teste manual. Quando alguns campings tiverem 10 ou mais visitas pelo app, o responsável pelo produto procura cerca de 10 donos pelo contato público e apresenta um resumo: quantas famílias foram e o que confirmaram.

- Se houver interesse: página do dono para completar fatos, responder e receber sugestões.
- Se não houver: o app segue só com campistas, sem custo perdido.

**Fase 3: busca, reserva e receita**

- Busca de campings com os filtros que só esta base permite: voltagem, proporção de chuveiros, sinal da operadora, regras de som.
- Reserva, própria ou em parceria com uma plataforma existente.
- Receita: afiliados para itens que faltam, versão paga para grupos grandes e funções avançadas, e comissão sobre reservas.

A abertura pública da base de campings acontece só na fase 3, e é a decisão que mais afeta a defesa descrita na seção 5.

## 18. Divulgação, dados e receita futura

O lançamento começa pelo estado de São Paulo, sem cobrança, e o app registra desde a primeira versão os dados que vão sustentar a receita depois.

**Por que começar por uma região**

Os alertas só aparecem quando o camping tem confirmações. Concentrar os primeiros usuários nos campings paulistas faz a base ficar densa mais rápido do que espalhar os mesmos usuários pelo país. O app funciona em qualquer lugar; o que se concentra em São Paulo é a divulgação.

**Canais de divulgação**

| Canal | Como funciona | Custo |
| --- | --- | --- |
| O próprio app | Convite de grupo leva o link a novas famílias; o texto de perguntas ao camping leva o nome do app | Nenhum |
| Conteúdo no site | Páginas com listas prontas por tipo de viagem, para quem busca "o que levar para acampar" | Tempo de produção |
| Comunidades de campistas | Participação como campista em grupos e clubes, oferecendo a lista como ajuda | Tempo |
| Criadores de conteúdo do nicho | Acesso antecipado para canais e perfis pequenos de camping | Baixo |
| Campings | Guardado por ora (seção 21). Cartaz com QR code na recepção: "veja o que levar para este camping" | Impressão |
| Feiras e encontros | Presença em eventos do setor e encontros de clubes | Variável |

O lançamento deve anteceder um feriado ou período de férias.

**Dados registrados desde o início**

| Dado | De onde vem | Para que serve depois |
| --- | --- | --- |
| Demanda por destino: viagens por camping, região, data e tamanho do grupo | Destino informado na viagem | Reserva, painel para donos de camping, priorização de regiões |
| Buscas por campings que não existem na base | Campo de destino | Saber onde a base precisa crescer |
| Itens marcados como "preciso comprar" e "faltou" | Uso da lista | Afiliados e acordos com marcas de equipamento |
| Itens removidos e adicionados à lista | Uso da lista | Melhorar o conteúdo; entender o equipamento real do campista |
| Gasto do grupo por tipo de item | Divisão de gastos | Custo médio de uma viagem; valor percebido para a versão paga |
| Fatos e confirmações dos campings | Perguntas na volta | Guia, busca e reserva |
| Origem de cada usuário: canal ou convite | Instalação e link de convite | Saber qual divulgação funciona e quanto o app se espalha sozinho |
| Interesse em funções futuras | Toques em itens marcados "em breve" | Decidir o que entra na versão paga |
| Cliques em links de afiliado | Itens "preciso comprar" | Receita inicial e prova de intenção de compra |

**Regras para esses dados**

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| DAT-01 | Todos os dados da tabela acima são registrados desde a versão 0.1, mesmo sem uso imediato. | Cada linha da tabela tem um evento correspondente, com data. |
| DAT-02 | O consentimento do primeiro uso informa o uso estatístico dos dados. | O texto diz, em linguagem simples, que dados de uso são analisados de forma agregada para melhorar o app e gerar estatísticas, e que o resultado agregado pode ser compartilhado com o camping visitado. |
| DAT-03 | Qualquer uso fora da empresa é agregado e sem identificação. | Nenhum recorte com menos de 10 pessoas é compartilhado. Dado individual nunca é vendido nem cedido. |
| DAT-04 | A origem de cada usuário é registrada. | É possível dizer quantos usuários vieram de cada canal e de convites. |
| DAT-05 | Funções futuras aparecem como "em breve", e os toques são contados. | Ao menos inventário de equipamento e cardápio aparecem assim desde a etapa 1. |
| DAT-06 | Links de afiliado são identificados como tal e não alteram a lista. | Nenhum item entra na lista por causa de afiliado. O aviso aparece junto do link. |

A revisão dessas regras frente à LGPD é feita por uma pessoa habilitada, antes do lançamento.

**Receita, na ordem prevista**

1. Links de afiliado, desde o início, sem depender de volume.
2. Versão paga para grupos grandes, modelos ilimitados e inventário.
3. Campings: página do dono e destaque.
4. Reservas, com comissão.
5. Marcas de equipamento e turismo: patrocínio e estatísticas agregadas de demanda.

**Sinais de que é hora de cobrar**

- Parcela relevante dos usuários criando a segunda viagem.
- Campings paulistas com confirmações recentes em número suficiente para os alertas aparecerem na maioria das viagens.
- Toques frequentes nas funções marcadas "em breve".

## 19. Reativação e contas inativas

Camping é atividade de poucas vezes por ano: o app trata meses sem uso como normal, avisa só quando há motivo e não guarda dado pessoal de conta parada para sempre.

**Do primeiro acesso à viagem**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RET-01 | Links de convite e de QR code abrem direto na viagem ou no camping, inclusive para quem ainda vai instalar o app. | Depois de instalar pelo link, a primeira tela é a viagem ou o camping do link, não a tela inicial genérica. |
| RET-02 | Viagem sem data, para quem quer ver a lista antes de marcar a viagem. | A lista é gerada sem data. Os lembretes passam a existir quando a data é informada. |
| RET-03 | A permissão de notificação é pedida quando o primeiro lembrete é criado, não na abertura do app. | Nenhum pedido de permissão antes de a pessoa ter uma viagem com data. |
| RET-04 | Lembrete antes da viagem com o que falta separar. | Uma notificação 3 dias antes da ida, só se houver itens a separar. Soma-se ao lembrete de véspera (E1-08). |

**Quem já usou e parou**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RET-05 | Antes de feriados e férias, o app oferece repetir a última viagem. | No máximo 4 avisos por ano por pessoa. Um toque cria a nova viagem com os ajustes do E1-11. |
| RET-06 | Aviso de novidade no camping que a pessoa visitou. | Só quando há confirmações novas. No máximo 1 por mês. |
| RET-07 | O app para de avisar quem ignora. | Depois de 3 avisos de reativação seguidos sem abertura, nenhum outro é enviado até a pessoa voltar por conta própria. |
| RET-08 | Cada tipo de aviso pode ser desligado separadamente. | Lembretes de viagem, avisos de grupo e avisos de reativação têm controles próprios. |

**Medição e contas paradas**

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RET-09 | Usuário ativo é quem teve uma viagem nos últimos 12 meses. | As métricas da seção 13 usam essa definição, não o uso semanal ou mensal. |
| RET-10 | O funil completo é registrado: instalou, abriu, criou viagem, marcou "está no carro", fez a volta, criou a segunda viagem. | É possível ver em qual passo as pessoas param. Instalações sem abertura vêm dos relatórios da loja. |
| RET-11 | Contas sem uso por 24 meses são avisadas e, sem resposta, têm os dados pessoais apagados ou anonimizados. | Aviso com 30 dias de antecedência. Confirmações já publicadas permanecem como "campista". |

Os limites numéricos desta seção (3 dias, 4 avisos por ano, 3 avisos ignorados, 24 meses) são premissas. O prazo do RET-11 deve ser confirmado pelo responsável jurídico.

## 20. Parceria com campings: QR code em troca de resumo (ideia guardada)

Guardada em 23/11/2026 e fora da versão 1; as regras abaixo ficam como ponto de partida para quando for retomada. A ideia: campings parceiros expõem um cartaz com QR code e recebem, em troca, um resumo agregado do que os hóspedes informaram pelo app. A parceria é manual, opcional e não exige que o dono use o app.

**A troca**

| Quem | O que dá | O que recebe |
| --- | --- | --- |
| Camping | Espaço para o cartaz na recepção e nas áreas comuns | Resumo periódico do que os hóspedes sugerem e confirmam; hóspedes que chegam sabendo as regras |
| App | Resumo básico gratuito | Campistas no lugar e na hora certos; base de dados densa naquele camping |

**Regras**

| ID | Regra | Critério de aceite |
| --- | --- | --- |
| PAR-01 | O QR code abre a página daquele camping no app. | Quem lê o código cai em "o que levar para este camping" (RET-01). O cartaz padrão é feito pela Cinema, com o mascote. |
| PAR-02 | O resumo é agregado e sem identificação. | Só é enviado com ao menos 10 respostas no período. Não traz nomes, apelidos nem datas de visita. |
| PAR-03 | Textos livres não seguem na íntegra. | O resumo traz as opções de toque somadas e os temas dos textos, reescritos pela equipe. |
| PAR-04 | O resumo básico tem conteúdo fixo. | Número de famílias que informaram o camping como destino, sugestões mais frequentes, fatos confirmados e divergentes, e avaliação de limpeza. |
| PAR-05 | O dono não edita nem remove dados. | Confirmações e avaliações continuam visíveis aos campistas, favoráveis ou não. Isso é informado por escrito antes do acordo. |
| PAR-06 | O dono pode informar fatos e regras do camping. | Entram com a origem "informado pelo camping" e ficam sujeitos à confirmação dos campistas (seção 10). |
| PAR-07 | Parceria não compra tratamento melhor. | Camping parceiro não tem alertas suprimidos nem destaque sobre os demais. |
| PAR-08 | O campista é informado do compartilhamento. | Coberto pelo consentimento do DAT-02. |
| PAR-09 | A parceria é manual na versão 1. | O resumo é montado internamente e enviado por mensagem. Nenhuma tela para o dono é construída. |
| PAR-10 | O resumo básico é gratuito enquanto o cartaz estiver exposto. | O relatório detalhado (comparação com a região, demanda por data, resposta às sugestões) fica reservado para a oferta paga da fase 2. |

**Piloto**

A parceria começa com 3 a 5 campings do estado de São Paulo, escolhidos pelo responsável pelo produto. O resultado do piloto decide se e como a fase 2 é construída.

**O que combinar com o dono antes**

- Nos primeiros meses o resumo vem com poucos dados.
- O app é neutro: mostra aos campistas o que eles confirmam, inclusive o que não agrada.
- A regra do camping aparece como característica, não como defeito, e o campista chega sabendo dela.

## 21. Ideias guardadas

Esta seção guarda ideias para avaliação futura. Nada aqui é requisito, e nada daqui entra no desenvolvimento sem decisão explícita.

**Critério para uma ideia virar requisito**

A pergunta é: "os primeiros 100 campistas precisam disso para completar uma viagem?". Se a resposta for não, a ideia espera aqui até o uso real mostrar que faz falta.

**Incentivos para o camping parceiro**

Guardadas em 23/11/2026, por serem um sistema de incentivos para parceiros que ainda não existem.

| Ideia | O que é | Quando reavaliar |
| --- | --- | --- |
| Link e código próprios do camping | Cada parceiro divulga um link único nas redes sociais; quem entra por ele fica associado ao camping. O código digitado é a alternativa. | Depois do piloto de parceria (seção 20), se os donos quiserem divulgar |
| Pergunta do camping | O dono escolhe uma pergunta extra para os hóspedes responderem na volta. | Depois do piloto, se os donos pedirem |
| Resumo por níveis | O resumo fica mais detalhado ou mais frequente conforme o número de campistas que o camping traz. O detalhado pode ser comprado ou conquistado. | No desenho da fase 2 |
| Agrado do camping ao campista | Lenha, saída mais tarde ou desconto, mostrados pelo app e bancados pelo dono. | No desenho da fase 2 |
| Kit de divulgação do parceiro | Imagens para post e stories e selo de "camping parceiro", feitos pela Cinema. | Quando houver 3 ou mais parceiros ativos |

**Limites que valem se alguma dessas ideias voltar**

- Nada que altere o que os campistas veem: sem comentário favorável, nota melhor, destaque ou alerta escondido (PAR-07).
- Agrado nunca condicionado a responder, nem a responder bem.
- Só viagens reais contam para qualquer recompensa (FRD-01 a FRD-05).

**Parceria com campings por QR code**

Guardada em 23/11/2026. O cartaz com QR code em troca de um resumo agregado para o dono fica para depois, e as regras já desenhadas estão preservadas na seção 20. O momento de reavaliar é o mesmo previsto para a fase 2: quando alguns campings tiverem 10 ou mais visitas pelo app.
