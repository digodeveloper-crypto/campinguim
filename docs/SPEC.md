# Spec: Campinguim (versão 1)

Nov 23, 2026 · @digodeveloper-crypto

Esta spec diz como construir o que o PRD do Campinguim define: as três etapas da versão 1, para Android primeiro e iPhone no lançamento oficial.

## 1. Como usar esta spec

O PRD diz o quê e o porquê; esta spec diz como. Quando os dois divergirem, vale o PRD, e a divergência é avisada ao orquestrador antes de qualquer código.

**Convenções**

- Os IDs do PRD (E1-01, E2-09, E3-05, DEF-01 e os demais) são citados aqui sem repetir o texto. Cada feature de desenvolvimento aponta para um ou mais IDs.
- Nomes de tabelas, campos e eventos ficam em inglês no código. Todo texto visível ao usuário fica em português do Brasil, em arquivo de textos.
- Valores marcados como **premissa** podem mudar sem redesenho e ficam em um único arquivo de configuração no servidor.
- A referência visual é o protótipo escolhido entre os 5 da Cinema. Até a escolha, nenhuma tela é desenvolvida.

**Definição de pronto de uma feature**

1. Atende a todos os critérios de aceite dos IDs do PRD que ela cobre.
2. Tem testes automáticos para as regras que implementa, e todos passam localmente.
3. Os roteiros de tela afetados passam no emulador, inclusive em modo avião quando o requisito é offline.
4. Não quebra nenhuma feature já aprovada.
5. Está fiel ao protótipo escolhido.
6. O QA aprovou e registrou o resultado dos testes.

**O que nenhum agente decide sozinho**

- Regra de negócio que não esteja no PRD ou nesta spec.
- Item, quantidade ou pergunta fora dos catálogos das seções 5 e 6.
- Texto legal, política de privacidade e termos de uso.
- Troca de tecnologia definida na seção 2.

## 2. Arquitetura e tecnologia

O app guarda tudo no aparelho e sincroniza quando há internet; a inteligência sobre campings fica só no servidor. Uma única linguagem, TypeScript, atende o app, a página do convidado e o servidor, para que as regras sejam escritas e testadas uma vez.

```
App no celular                                   Servidor
  Telas  ------ camping, convites e gastos ----> Funções e regras de camping
  Banco local cifrado <--> Sincronização <-----> Banco Postgres
  Regras e catálogo da lista  (viagens e listas) Login e autorização

Página do convidado e site (navegador do celular)
  ------ pelas mesmas funções, só com internet --> Servidor
```

A lista funciona só com o que está no celular. Tudo o que diz respeito a campings passa pelas funções do servidor, e o aparelho guarda apenas o resultado.

**Decisões**

| Camada | Escolha | Por quê | Alternativa se a prova técnica falhar |
| --- | --- | --- | --- |
| App | React Native com Expo, em TypeScript | Gera Android agora e iPhone no lançamento a partir do mesmo código; desenvolvimento em Windows ou Linux; mesma linguagem do resto | Flutter |
| Dados no aparelho | SQLite | Funciona offline e aguenta consultas da lista | — |
| Sincronização | PowerSync, ligando o SQLite do aparelho ao Postgres | Evita escrever do zero a parte de maior risco técnico; tem edição auto-hospedada para rodar localmente | Fila própria de alterações com leitura incremental |
| Servidor | Supabase: Postgres, autenticação, autorização por linha e funções | Roda inteiro na máquina local com Docker (GIT-11); login com Google e Apple; similaridade de texto no próprio banco (E3-21) | Postgres com servidor próprio em Node |
| Lógica protegida | Funções no servidor, em TypeScript | Regras da ficha do camping e aprendizado ficam fora do aparelho (DEF-05) | — |
| Página do convidado e site | Aplicação web leve em React e TypeScript | Abre rápido no navegador do celular, sem instalar | — |
| Notificações | Locais para lembretes; por servidor para avisos de grupo | Lembrete chega sem internet (E1-08) | — |
| Verificação do aparelho | Play Integrity no Android, App Attest no iPhone | DEF-04 e FRD-04 | Módulo nativo direto, se a biblioteca do Expo não atender |
| Testes | Unitários em TypeScript; roteiros de tela em emulador com Maestro; página web em navegador automático | Tudo roda localmente (GIT-10 a GIT-17) | — |

A biblioteca do Expo para verificação do aparelho está em versão alfa. Ela fica isolada atrás de uma interface própria, para poder ser trocada sem tocar no resto do app.

**Estrutura do repositório**

```
campinguim/
  apps/mobile        app Expo
  apps/web           página do convidado e site
  packages/core      regras puras: geração da lista, cotas, validade, alertas
  packages/content   catálogos das seções 5 e 6, em arquivos de dados
  supabase/          migrações, políticas e funções do servidor
  e2e/               roteiros de tela e testes da página web
  docs/              PRD, spec e registro de decisões
```

`packages/core` não depende de tela nem de rede. É onde ficam os testes obrigatórios da seção 9.

**O que roda onde**

| Regra | No aparelho | No servidor |
| --- | --- | --- |
| Geração da lista básica e quantidades | Sim, offline | — |
| Estados dos itens, checklist da volta | Sim, offline | Guarda a cópia sincronizada |
| Cotas e resumo de gastos | Sim, offline | Recalcula e é a fonte da verdade |
| Busca de camping, ficha, alertas e ajustes pela ficha | Só guarda o resultado | Sim |
| Confirmações, validade, divergência | — | Sim |
| Aprendizado de "faltou e sobrou" entre usuários | — | Sim |

**Ambientes**

- **Local:** tudo em Docker na máquina de desenvolvimento, com dados de exemplo das jornadas do PRD.
- **Produção:** servidor hospedado, com as versões 0.x distribuídas pela faixa de teste interno do Google Play.

**Prova técnica antes de qualquer feature**

A primeira tarefa de desenvolvimento valida as apostas arriscadas em pequeno, antes de construir sobre elas:

1. Dois emuladores sincronizando a mesma lista, com alterações feitas offline nos dois e reunidas sem perda.
2. Um lembrete local disparando com o emulador em modo avião e o relógio adiantado.
3. O app abrindo direto em uma viagem a partir de um link.
4. Uma chamada ao servidor recusada sem verificação válida do aparelho, em uma versão instalada pela faixa de teste.

Se o item 1 não ficar estável, a sincronização passa para a alternativa da tabela antes de a etapa 1 começar. O resultado da prova fica em `docs/`.

As escolhas acima foram conferidas em buscas feitas em 23/11/2026. Versões e condições de licença devem ser confirmadas na documentação oficial no momento da instalação.

## 3. Modelo de dados

O modelo tem três grupos: a viagem e sua lista, que vivem no aparelho e sincronizam; os gastos do grupo; e os campings, que vivem só no servidor.

**Regras gerais**

- Todo identificador é aleatório (UUID versão 4), gerado no aparelho ou no servidor (DEF-08).
- Dinheiro é inteiro em centavos. Nunca número com vírgula.
- Datas de viagem são datas locais, sem hora. Carimbos de tempo são em UTC.
- Nada é apagado de verdade em tabelas sincronizadas: usa-se `deleted_at`.
- Todo registro sincronizado tem `updated_at` e `updated_by`.

**Viagem e lista (sincronizam com o aparelho)**

| Entidade | Campos principais | Regras |
| --- | --- | --- |
| `profile` | `id`, `display_name`, `nickname`, `anonymous_by_default`, `origin_channel`, `last_active_at` | Criado no primeiro login. Sem CPF, telefone ou endereço (PRV-01). |
| `trip` | `id`, `owner_profile_id`, `name`, `kind` (`tent_car`, `backpack`, `motorhome`), `start_date`, `end_date`, `nights`, `climate` (`cold`, `mild`, `hot`), `rain`, `camping_id`, `is_group`, `status`, `source_trip_id` | `start_date` e `end_date` podem ser nulos (RET-02). `status`: `planning`, `packing`, `traveling`, `returning`, `closed`. Sem conta, `owner_profile_id` é nulo e a viagem fica só no aparelho (E1-14). |
| `trip_family` | `id`, `trip_id`, `name`, pets, `is_organizer` | Uma viagem de família única tem exatamente uma. |
| `trip_person` | `id`, `family_id`, `age_band` (`adult`, `teen`, `child`, `toddler`), `label` | `label` é opcional. As contagens por faixa são derivadas daqui. Pets ficam em `trip_family.pets`. |
| `trip_member` | `id`, `trip_id`, `family_id`, `profile_id`, `display_name`, `role` (`organizer`, `member`, `guest`) | Convidado da página web tem `profile_id` nulo e `role` `guest`. |
| `trip_item` | `id`, `trip_id`, `family_id`, `catalog_key`, `name`, `category`, `qty`, `unit`, `note`, `origin`, `removed`, `pack_state`, `need_buy`, `depends_on_camping`, `return_state`, `missing`, `leftover` | `family_id` nulo significa item do grupo. `origin`: `generated`, `manual`, `camping_adjust`. `pack_state`: `todo`, `set_aside`, `in_car`. `return_state`: `unchecked`, `checked`, `dry_at_home`, `wash_at_home`. Item com `removed` verdadeiro nunca volta por recálculo (E1-04). |
| `item_claim` | `item_id`, `family_id` | Uma linha por família que assumiu um item do grupo. Duas linhas no mesmo item são um duplicado, não um conflito (E2-08). |
| `trip_camping_snapshot` | `trip_id`, `camping_id`, `facts`, `alerts`, `adjustments`, `rules_ack_at`, `fetched_at` | Cópia do que o servidor devolveu para aquela viagem. É a única informação de camping guardada no aparelho (DEF-11). |
| `invite` | `token`, `trip_id`, `family_id`, `created_by`, `expires_at`, `revoked` | `family_id` preenchido convida para a mesma família (E2-18). Validade padrão de 30 dias (premissa). |

**Gastos**

| Entidade | Campos principais | Regras |
| --- | --- | --- |
| `expense` | `id`, `trip_id`, `item_id`, `buyer_family_id`, `estimate_cents`, `amount_cents`, `split_rule` (`shares`, `per_family`, `adults_teens`), `receipt_path` | Um gasto por item dividido. |
| `expense_exclusion` | `expense_id`, `person_id` | Pessoa desmarcada daquele gasto (E2-12). |
| `expense_payment` | `expense_id`, `family_id`, `paid_marked_at` | Marcação de "paguei". Não há confirmação bancária. |
| `expense_audit` | `expense_id`, `actor_member_id`, `field`, `old_value`, `new_value`, `at` | Escrito pelo servidor a cada alteração de valor ou regra (E2-15). |
| `pix_key` | `profile_id`, `key`, `key_type` | Lida só por membros de uma viagem em que o dono é comprador (PRV-06). |

**Campings (só no servidor)**

| Entidade | Campos principais | Regras |
| --- | --- | --- |
| `city` | `ibge_code`, `name`, `state` | Carregada da lista oficial do IBGE (E3-20). |
| `camping` | `id`, `name`, `name_normalized`, `city_ibge_code`, `created_by`, `merged_into_id`, `status` | A busca devolve só `id`, `name` e cidade (DEF-01). |
| `camping_alias` | `camping_id`, `name`, `name_normalized` | Nomes alternativos e nomes vindos de fusão (E3-22). |
| `fact_report` | `id`, `camping_id`, `trip_id`, `profile_id`, `fact_key`, `value`, `source` (`camper`, `owner_via_camper`), `occasion`, `trip_kind`, `visited_month`, `anonymous`, `held`, `counts` | Único por `trip_id` e `fact_key` (FRD-03). `visited_month` guarda só ano e mês (E3-19). |
| `fact_summary` | `camping_id`, `fact_key`, `current_value`, `recent_count`, `last_month`, `last_label`, `divergence`, `freshness` | Calculada pelo servidor a partir de `fact_report`. É o que alimenta alertas e a tela do fato. |
| `suggestion` | `id`, `camping_id`, `trip_id`, `profile_id`, `option_keys`, `text` | Só consulta interna (E3-26). |
| `merge_candidate` | `camping_a`, `camping_b`, `score`, `status`, `reviewed_by` | Fila de fusão (E3-23, E3-24). |
| `list_feedback` | `trip_id`, `catalog_key`, `kind` (`missing`, `leftover`) | Insumo do aprendizado da lista (E1-11). |

**Apoio**

| Entidade | Campos principais | Regras |
| --- | --- | --- |
| `device` | `install_id`, `platform`, `integrity_ok_at`, `first_seen_at` | Um por instalação. Base dos limites por aparelho (DEF-03). |
| `event` | `name`, `props`, `at`, `install_id`, `profile_id` | Eventos da seção 12. Sem texto livre do usuário. |
| `config` | `key`, `value` | Todas as premissas numéricas do PRD. |

**O que chega ao aparelho**

Só as viagens em que a pessoa é membro, com famílias, pessoas, itens, quem assumiu o quê, gastos e o retrato do camping daquela viagem. Nunca `fact_report`, `suggestion` ou `fact_summary` de forma direta.

**Exclusão de conta**

Apaga `profile`, `pix_key` e vínculos de login. Em `trip_member`, o nome vira "participante". Em `fact_report`, `profile_id` fica nulo e o registro passa a anônimo (E2-17, RET-11).

## 4. Sincronização offline

Toda alteração é gravada primeiro no aparelho e aparece na tela na hora; o envio ao servidor acontece em segundo plano, quando houver internet. Esta é a parte de maior risco técnico do projeto e a mais testada.

**Princípios**

1. O app nunca espera a rede para responder a um toque.
2. Cada alteração tem um identificador gerado no aparelho. O servidor ignora repetições, então reenviar é sempre seguro.
3. A fila de envio fica gravada no aparelho e sobrevive a fechar o app e reiniciar o celular.
4. O relógio do celular não decide conflito. Vale a ordem de chegada ao servidor, mais as regras abaixo.
5. Nenhum conflito apaga trabalho de alguém em silêncio.

**Regras de conflito, por tipo de dado**

| Dado | Quando dois alteram ao mesmo tempo | Motivo |
| --- | --- | --- |
| Estado de separação do item (`pack_state`) | Vence o estado mais avançado: `in_car` sobre `set_aside` sobre `todo` | Quem marcou que está no carro viu o item lá |
| Quem assumiu um item do grupo (`item_claim`) | As duas marcações ficam | Vira aviso de duplicado, que é informação útil (E2-05) |
| Quantidade, nome e nota do item | Vence a última a chegar ao servidor; em item do grupo, o valor perdido aparece no histórico do item | Alterações raras e fáceis de refazer |
| Item removido e editado ao mesmo tempo | Vence a remoção; o item pode ser restaurado | Evita item "fantasma" voltando |
| Dois itens novos com o mesmo nome | Os dois ficam, e a lista sugere juntar | O app nunca junta itens sozinho |
| Valor e regra de um gasto | O servidor aplica em sequência e grava cada mudança em `expense_audit` | Dinheiro exige rastro (E2-15) |
| "Faltou", "sobrou" e estados da volta | Vence a última a chegar | Marcações pessoais de uma família |

**Casos especiais**

- **Sem conta:** nada sincroniza. No primeiro login, todas as viagens do aparelho sobem com os mesmos identificadores (E1-14).
- **Convidado na página web:** só funciona com internet. Cada toque chama o servidor com o código do convite; não há armazenamento local.
- **Escrita recusada pelo servidor** (por exemplo, sem permissão): o aparelho desfaz a alteração local e avisa a pessoa.
- **Retrato do camping:** buscado com internet ao escolher o destino. Offline, o app mostra o retrato guardado com a data. Com internet e retrato de mais de 7 dias (premissa), busca de novo.

**O que a pessoa vê**

- Um indicador discreto quando há alterações aguardando envio, com a contagem.
- Com internet, a alteração de um membro aparece para os outros em até 5 segundos (premissa).
- Nenhuma tela de erro por falta de rede em função marcada como offline no PRD.

**Cenários de teste obrigatórios**

Todos rodam com dois emuladores, A e B, na mesma viagem de grupo.

| Nº | Cenário | Resultado esperado |
| --- | --- | --- |
| S1 | A marca 10 itens em modo avião, fecha o app, reabre e reconecta | Os 10 chegam ao servidor e a B, sem duplicar |
| S2 | A e B, offline, assumem o mesmo item do grupo; reconectam | O item mostra as duas famílias e o aviso de duplicado |
| S3 | A marca `in_car` offline; B, online, marca `set_aside` depois | O item termina em `in_car` nos dois |
| S4 | A remove um item offline; B edita a quantidade do mesmo item | O item termina removido nos dois e pode ser restaurado |
| S5 | A e B criam offline um item chamado "isqueiro" | Dois itens na lista e a sugestão de juntar |
| S6 | A altera o valor de um gasto; B altera a regra de divisão, quase juntos | As duas mudanças aplicadas, duas linhas em `expense_audit`, resumo coerente |
| S7 | A fica 7 dias offline com 200 alterações e reconecta | Tudo sincroniza sem travar a tela |
| S8 | O envio é interrompido no meio e repetido | Nenhuma alteração aplicada duas vezes |
| S9 | Uma pessoa sem conta cria 2 viagens e depois faz login | As 2 viagens aparecem na conta, com os mesmos itens e estados |
| S10 | B é removido do grupo enquanto está offline com alterações pendentes | As alterações de B são recusadas e B é avisado ao reconectar |

## 5. Conteúdo das listas

Este catálogo é a fonte única do que a lista gera. Ele vive em `packages/content` como arquivo de dados, e nenhum agente acrescenta item ou fórmula fora dele. As quantidades são um ponto de partida (premissas) e serão calibradas pelo "faltou e sobrou" dos usuários.

**Variáveis da viagem**

| Símbolo | Significado |
| --- | --- |
| `P` | Total de pessoas |
| `A` | Adultos e adolescentes |
| `C` | Crianças de 5 a 11 anos |
| `T` | Menores de 5 anos |
| `N` | Noites |
| `D` | Dias, igual a `N + 1` |
| `F` | Famílias na viagem |
| `pets` | Número de pets |
| `clima` | `frio`, `ameno` ou `calor` |
| `chuva` | Sim ou não |

`teto(x)` significa arredondar para cima.

**Escopo de cada item**

- **Pessoa:** um por pessoa, na lista da família.
- **Família:** um por família.
- **Grupo:** um para a viagem toda. Em viagem de grupo, vira item compartilhado, com dono (E2-03).

**Categorias.** **Decidido pelo responsável em 26/11/2026:** valem as 11 categorias das tabelas abaixo; o PRD (E1-02) foi ajustado para citar as mesmas.

**Consumíveis.** **Decidido pelo responsável em 26/11/2026:** são consumíveis, tudo o que acaba e não volta para casa: `agua`, `gas`, `gelo`, `carvao`, `sacos_lixo`, `papel_hig`, `papel_toalha`, `fraldas`, `lencos` e `racao`. Alimentos e básicos de cozinha não são. Só os consumíveis têm a quantidade reduzida por "sobrou" (veja "Aprendizado", abaixo).

**Abrigo**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `barraca` | Barraca com sobreteto | Sempre | 1 | Família |
| `lona_chao` | Lona de chão | Sempre | 1 | Família |
| `espeques` | Espeques e cordas extras | Sempre | 1 jogo | Família |
| `martelo` | Martelo de borracha | Sempre | 1 | Grupo |
| `lona_sombra` | Lona ou gazebo de sombra | `clima` calor ou `chuva` | 1 | Grupo |
| `kit_reparo` | Fita de reparo e selador de costura | Sempre | 1 | Grupo |
| `tapete` | Tapete de entrada | `chuva` | 1 | Família |
| `vassourinha` | Vassourinha e pá | `N` maior ou igual a 2 | 1 | Família |

**Dormir**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `saco_dormir` | Saco de dormir | Sempre | 1 | Pessoa |
| `isolante` | Isolante ou colchonete | Sempre | 1 | Pessoa |
| `travesseiro` | Travesseiro | Sempre | 1 | Pessoa |
| `manta` | Manta extra | `clima` frio | 1 | Pessoa |
| `lencol` | Lençol ou forro leve | `clima` calor | 1 | Pessoa |

**Cozinha**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `fogareiro` | Fogareiro | Sempre | 1 até 8 pessoas; 2 acima | Grupo |
| `gas` | Cartucho de gás | Sempre | `teto(P × N / 8) + 1` | Grupo |
| `isqueiro` | Isqueiro ou fósforos | Sempre | 2 | Grupo |
| `para_vento` | Para-vento | Sempre | 1 | Grupo |
| `panelas` | Panela, frigideira e chaleira | Sempre | 1 jogo | Grupo |
| `utensilios` | Faca, colher grande, espátula e abridor | Sempre | 1 jogo | Grupo |
| `tabua` | Tábua de corte | Sempre | 1 | Grupo |
| `pratos` | Prato, copo e talheres | Sempre | 1 jogo | Pessoa |
| `cooler` | Cooler | Sempre | 1 | Família |
| `louca` | Esponja, detergente, pano e bacia | Sempre | 1 jogo | Grupo |
| `sacos_lixo` | Sacos de lixo | Sempre | `2 × D` | Grupo |
| `papel_toalha` | Papel-toalha | Sempre | 1 rolo | Grupo |
| `mesa` | Mesa dobrável | Viagem de barraca com carro | 1 | Família |
| `cadeiras` | Cadeiras | Viagem de barraca com carro | `A + C` | Família |
| `carvao` | Carvão | Viagem de barraca com carro | 1 saco de 4 kg para cada 8 pessoas | Grupo |
| `grelha` | Grelha portátil e pegador | Viagem de barraca com carro | 1 | Grupo |

**Comida e bebida**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `agua` | Água potável | Sempre; depende do camping | `3 L × P × D`, em galões de 5 L, arredondando para cima | Grupo |
| `gelo` | Gelo | Sempre | `teto(D / 2) × teto(P / 4)` sacos de 5 kg | Grupo |
| `refeicoes` | Comida das refeições | Sempre | Tarefa: planejar `D` cafés, `D` almoços e `N` jantares | Grupo |
| `basicos` | Sal, óleo, açúcar e café | Sempre | 1 kit | Grupo |
| `lanches` | Lanches para a estrada | Sempre | 1 | Pessoa |

**Roupa**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `mudas` | Mudas de roupa | Sempre | `D` | Pessoa |
| `roupa_dormir` | Roupa de dormir | Sempre | 1 | Pessoa |
| `agasalho` | Agasalho | `clima` frio ou ameno | 2 no frio; 1 no ameno | Pessoa |
| `gorro` | Gorro e meia grossa | `clima` frio | 1 | Pessoa |
| `capa_chuva` | Capa de chuva | `chuva` | 1 | Pessoa |
| `muda_seca` | Muda reserva em saco fechado | `chuva` | 1 | Pessoa |
| `calcado` | Calçado fechado | Sempre | 1 par | Pessoa |
| `chinelo` | Chinelo | Sempre | 1 par | Pessoa |
| `roupa_banho` | Roupa de banho | `clima` calor, ou camping com piscina | 1 | Pessoa |
| `chapeu` | Chapéu ou boné | `clima` calor ou ameno | 1 | Pessoa |

**Higiene**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `toalha` | Toalha | Sempre | 1 | Pessoa |
| `kit_higiene` | Escova, pasta, sabonete e xampu | Sempre | 1 kit | Família |
| `papel_hig` | Papel higiênico | Sempre | `teto(P × N / 4)` rolos | Família |
| `protetor` | Protetor solar | Sempre | 1 | Família |
| `repelente` | Repelente | Sempre | 1 | Família |
| `lencos` | Lenços umedecidos | `C + T` maior que 0 | 1 pacote | Família |
| `ducha` | Ducha portátil | Depende do camping | 1 | Família |

**Primeiros socorros e segurança**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `kit_socorros` | Kit de primeiros socorros | Sempre | 1 | Família |
| `remedios` | Remédios de uso contínuo | Sempre | Tarefa: conferir | Família |
| `lanterna` | Lanterna | Sempre | `A` | Família |
| `lampiao` | Lampião | Sempre | 1 | Família |
| `pilhas` | Pilhas ou baterias de reserva | Sempre | 1 jogo | Família |
| `bateria_portatil` | Bateria portátil | Sempre | 1 | Família |
| `balde` | Balde para água perto do fogo | Viagem de barraca com carro | 1 | Grupo |

**Ferramentas e energia**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `canivete` | Canivete ou faca de uso geral | Sempre | 1 | Família |
| `varal` | Corda e prendedores | Sempre | 1 | Grupo |
| `fita` | Fita adesiva forte | Sempre | 1 | Grupo |
| `extensao` | Extensão elétrica | Depende do camping | 1 | Família |
| `adaptador` | Adaptador de tomada | Depende do camping | 1 | Família |
| `carregadores` | Carregadores | Sempre | 1 jogo | Família |
| `cintas` | Cintas para amarrar a carga | Viagem de barraca com carro | 1 jogo | Família |

**Lazer e documentos**

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `jogos` | Baralho ou jogo | Sempre | 1 | Família |
| `documentos` | Documentos e carteira | Sempre | Tarefa: conferir | Família |
| `reserva` | Comprovante da reserva | Destino informado | 1 | Família |
| `dinheiro` | Dinheiro em espécie | Sempre | Tarefa: conferir | Família |

**Crianças**

A categoria só aparece com `C + T` maior que 0.

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `muda_crianca` | Muda extra por criança | `C + T` maior que 0 | `C + T` | Família |
| `brinquedos` | Brinquedos e bola | `C + T` maior que 0 | 1 jogo | Família |
| `boia` | Boia | `C + T` maior que 0 e (`clima` calor ou camping com piscina) | `C + T` | Família |
| `fraldas` | Fraldas | `T` maior que 0 | `6 × T × D` | Família |
| `comida_bebe` | Alimentação do bebê | `T` maior que 0 | Tarefa: conferir | Família |

**Pet**

A categoria só aparece com `pets` maior que 0.

| Chave | Item | Entra quando | Quantidade | Escopo |
| --- | --- | --- | --- | --- |
| `racao` | Ração | `pets` maior que 0 | Porções para `D + 1` dias | Família |
| `potes` | Potes de água e comida | `pets` maior que 0 | 1 jogo | Família |
| `guia` | Guia e coleira com identificação | `pets` maior que 0 | `pets` | Família |
| `vacina` | Carteira de vacinação | `pets` maior que 0 | 1 | Família |
| `saquinhos` | Saquinhos higiênicos | `pets` maior que 0 | 1 rolo | Família |
| `cama_pet` | Manta ou caminha | `pets` maior que 0 | `pets` | Família |

**Tarefas de véspera (E1-08)**

1. Carregar lanternas, bateria portátil e celulares.
2. Congelar garrafas de água ou comprar o gelo.
3. Conferir o gás.
4. Calibrar os pneus para carro carregado e conferir o estepe.
5. Abastecer o carro.
6. Olhar a previsão do tempo e ajustar clima e chuva na viagem.

**Tarefas da volta (E1-10)**

1. Contar os espeques.
2. Apagar o fogo até esfriar.
3. Recolher todo o lixo.
4. Olhar o chão em volta da barraca antes de sair.
5. Em casa: abrir a barraca para secar.
6. Em casa: guardar o saco de dormir solto, fora do saco de compressão.

**Regras de geração**

- **Tipos de viagem.** Trilha com mochila exclui `mesa`, `cadeiras`, `cooler`, `carvao`, `grelha`, `lona_sombra`, `balde` e `cintas`. Motorhome exclui `barraca`, `lona_chao`, `espeques`, `martelo` e `isolante`. O conteúdo desses dois tipos é mínimo na versão 1. **Decidido pelo responsável em 26/11/2026:** o motorhome também leva `mesa`, `cadeiras`, `grelha` e `carvao`, como a viagem de barraca com carro; não leva `balde` nem `cintas`. A trilha com mochila segue sem esses itens.
- **Depende do camping.** Sem destino ou sem dados, os itens marcados assim entram com a etiqueta "depende do camping" (E3-09). Com dados, quem decide é a tabela da seção 6. **Decidido pelo responsável em 26/11/2026:** com dados, camping com tomada (perto ou longe da barraca, qualquer tensão) faz entrar `extensao` (com o comprimento da seção 6) e `adaptador`; sem tomada na área de barracas, os dois saem.
- **Recálculo.** Ao mudar uma resposta, só itens de origem `generated` são recalculados. Itens removidos não voltam, itens manuais não são tocados e quantidades editadas à mão são preservadas.
- **Aprendizado (E1-11).** Um item marcado como "faltou" entra na próxima lista daquela pessoa. Um consumível marcado como "sobrou" em duas viagens seguidas tem a quantidade reduzida em 25% (premissa), com aviso. O usuário pode desfazer. **Decidido pelo responsável em 26/11/2026:** a redução acumula: cada nova viagem seguida em que o item sobrou reduz de novo, sobre a quantidade já reduzida, até o mínimo de 1, e toda redução vem sinalizada "sobrou da última vez". A conta de cada redução está na seção 9 ("Sobras").
- **Formato do arquivo.** Cada item tem `key`, `name`, `category`, `scope`, `when`, `qty`, `unit` e `dependsOnCamping`. `when` e `qty` são expressões sobre as variáveis acima, avaliadas por um interpretador pequeno em `packages/core`, sem execução de código livre.

## 6. Ficha do camping

A ficha tem 8 fatos e 1 opinião, todos com opções fechadas. Cada resposta de campista é um `fact_report`; o servidor resume os relatos em `fact_summary`, e é esse resumo que gera alertas e ajustes na lista.

**Fatos e opções**

| Fato | Chave | Opções |
| --- | --- | --- |
| Energia: voltagem | `energia_voltagem` | 127 V, 220 V, as duas, sem energia |
| Energia: tomada | `energia_tomada` | perto da barraca, longe da barraca, sem tomada na área de barracas |
| Chuveiros | `chuveiros_qtd` | 1, 2, 3, 4, 5 ou mais |
| Capacidade | `capacidade` | até 10 barracas, 11 a 25, 26 a 50, mais de 50 |
| Água quente | `agua_quente` | elétrico, a gás, solar, não tem |
| Churrasco | `churrasco` | liberado na área de barracas, só em área comum, proibido |
| Pet | `pet` | aceita, aceita com restrição, não aceita |
| Som | `som_horario` | sem regra, silêncio a partir das 20h, 21h, 22h, 23h, meia-noite |
| Som cumprido | `som_cumprido` | sim, não |
| Piscina | `piscina` | não tem, tem sem horário, abre às 8h, 9h, 10h, 11h |
| Sinal de celular | `sinal_<operadora>` | pega bem, pega mal, não pega; uma resposta por operadora que a pessoa usa |
| Opinião: limpeza do banheiro | `limpeza` | limpo, razoável, sujo |

Energia e chuveiros têm duas chaves cada, mas contam como um fato na interface. A lista de operadoras fica em `config`.

**Do relato ao resumo**

1. Entram na conta os relatos dos últimos 12 meses que não estão retidos e contam para o limite (FRD-03).
2. O valor vigente é o da maioria. No empate, vale o mais recente.
3. Relato de campista pesa 1. Relato "informado pelo camping, via campista" pesa 0,5 (premissa).
4. Frescor: "recente" se o último relato tem até 6 meses; "pode ter mudado" entre 6 e 12; acima disso, o fato fica sem valor vigente.
5. "Confirmado" exige ao menos 2 relatos de contas diferentes concordando com o valor vigente.
6. Havendo valores diferentes entre os relatos recentes, o resumo guarda a divergência com contagem, mês e ocasião de cada lado.

**Do resumo aos alertas e à lista**

Níveis: **atenção** (pode mudar a decisão de ir), **ajuste** (muda a lista) e **informação**. Um fato não confirmado nunca gera atenção: aparece como informação, com o aviso "não confirmado".

| Condição | Nível | Efeito na lista | Texto-base |
| --- | --- | --- | --- |
| `energia_voltagem` = 220 V | Ajuste | Tarefa "confira seus aparelhos" | "220 V: confira o que você vai ligar" |
| `energia_voltagem` = sem energia | Atenção | Saem `extensao` e `adaptador`; `lanterna` e `bateria_portatil` ganham 1 | "Sem energia elétrica" |
| `energia_tomada` = longe | Ajuste | `extensao` de 20 m | "Tomada longe: extensão de 20 m" |
| `energia_tomada` = perto | Ajuste | `extensao` de 5 m | "Tomada perto da barraca" |
| `energia_tomada` = sem tomada | Atenção | Sai `extensao`; `bateria_portatil` ganha 1 | "Sem tomada na área de barracas" |
| Barracas por chuveiro maior que 15 | Atenção | Entra `ducha` | "1 chuveiro para cerca de X barracas" |
| `agua_quente` = não tem, com `clima` frio | Atenção | Nenhum | "Sem água quente" |
| `agua_quente` = não tem, demais climas | Informação | Nenhum | "Sem água quente" |
| `churrasco` = proibido | Atenção | Saem `carvao` e `grelha` | "Churrasco não é permitido" |
| `churrasco` = só em área comum | Informação | Sai `grelha` | "Churrasco só na área comum" |
| `pet` = não aceita, com `pets` maior que 0 | Atenção | Nenhum | "Este camping não aceita pet" |
| `pet` = aceita com restrição, com `pets` maior que 0 | Informação | Nenhum | "Aceita pet com restrições: confirme antes" |
| `som_horario` com horário | Informação com "ciente" | Nenhum | "Silêncio a partir das X" |
| `piscina` com horário | Informação com "ciente" | Entram `roupa_banho` e, com crianças, `boia` | "Piscina abre às X" |
| `piscina` = tem sem horário | Ajuste | Entram `roupa_banho` e, com crianças, `boia` | "Tem piscina" |
| `sinal` = não pega em alguma operadora | Informação | Tarefa "baixe os mapas e avise a família" | "Sinal fraco: veja por operadora" |
| `limpeza` = sujo na maioria dos relatos recentes | Informação | Nenhum | "Limpeza do banheiro: relatos recentes negativos" |

Barracas por chuveiro usa o limite de cima da faixa de capacidade: 10, 25 e 50, e 60 para "mais de 50" (premissa). Todo ajuste aparece na tela de alertas como "entrou" ou "saiu", com o motivo, e pode ser desfeito (E3-08). Itens removidos pelo usuário não voltam por ajuste.

**Perguntas da volta (E3-12)**

- São 4 perguntas por viagem. Para o primeiro visitante do app naquele camping, 6.
- Ordem de escolha: fatos sem nenhum relato; depois fatos sem valor vigente por idade; depois fatos com divergência; depois os de relato mais antigo.
- `som_cumprido` entra sempre que a viagem teve regra de som com "ciente", e conta dentro do limite (E3-13).
- `limpeza` entra em uma a cada duas viagens da mesma pessoa.
- Uma pergunta por tela, respondida com um toque. Sair no meio guarda o que foi respondido.
- A ocasião é calculada, não perguntada: "feriado" se as datas tocam um feriado nacional da lista em `config`; "férias" em janeiro, julho e na segunda quinzena de dezembro (premissa); senão, "fim de semana comum".
- O tipo de viagem também é calculado: grupo, família com crianças, casal ou sozinho.

**Sugestões (E3-25)**

Opções de toque: abrir a piscina mais cedo, mais chuveiros, mais tomadas, mais sombra, banheiros mais limpos, mais lixeiras. Campo de texto opcional com até 200 caracteres.

**Texto de perguntas para o camping (E3-10)**

Gerado com os fatos sem valor vigente, em linguagem de conversa, começando por "Oi! Vou acampar aí e queria confirmar:". Uma linha por fato, na ordem energia, chuveiros, água quente, churrasco, pet, som, piscina. O texto não cita o app.

**Duplicados (E3-20 a E3-24)**

- **Normalização do nome:** minúsculas, sem acento, sem pontuação, sem as palavras "camping", "acampamento", "área de", "de", "do", "da", "dos", "das" e "e", e com espaços reduzidos a um.
- **Mesmo camping:** nome normalizado igual na mesma cidade. Criar de novo devolve o existente.
- **Parecido:** similaridade de trigramas de 0,6 ou mais (premissa) na mesma cidade. O app pergunta "é este?" antes de criar.
- **Fila de fusão:** pares com similaridade entre 0,45 e 0,6, e pares sinalizados por usuários, entram em `merge_candidate`.
- **Fusão:** relatos, sugestões e viagens passam ao camping que fica; os nomes do outro viram `camping_alias`; `merged_into_id` aponta o destino. Desfazer restaura pelo registro da fusão.

**Um ponto fora do PRD**

O catálogo marca a água potável como dependente do camping, mas "água potável" não está entre os 8 fatos do PRD. Até decisão do responsável pelo produto, a água entra sempre com a quantidade cheia. A proposta de um nono fato está na seção 15.

## 7. Telas e fluxos

A aparência e a navegação de cada tela vêm do protótipo escolhido; esta seção define o que cada tela precisa conter, seus estados e de onde se chega a ela. Os números entre parênteses são os das telas do pedido de protótipos à Cinema.

**Mapa do app**

- **Início:** a viagem em andamento em destaque, as demais abaixo, e "nova viagem".
- **Viagem:** quatro áreas: Lista, Camping, Grupo e Gastos. Grupo e Gastos só aparecem em viagem de grupo.
- **Ajustes:** conta, notificações, privacidade, sobre.

Com uma viagem em andamento, o app abre direto nela (NF-05).

**Etapa 1**

| Tela | Contém | Estados e regras | PRD |
| --- | --- | --- | --- |
| Abertura (1) | Mascote e botão único de começar | Só na primeira vez. Sem pedido de conta nem de permissão. | E1-01, RET-03 |
| Criar viagem (2) | Tipo, noites ou datas, pessoas por faixa, pets, clima, chuva, destino opcional | Só tipo, noites e pessoas são obrigatórios. Datas podem ficar em branco. | E1-01, E1-13, RET-02 |
| Lista (4) | Categorias recolhíveis, item com quantidade, os dois passos de marcação, progresso total e por categoria, filtros | Filtros: a separar, separados, no carro, comprar. Mudança de resposta mostra "N entraram, M saíram". | E1-02 a E1-05 |
| Item (5) | Nome, quantidade, nota, "preciso comprar", remover | Itens gerados mostram o motivo de estarem na lista. | E1-04 |
| Adicionar item | Busca no catálogo e texto livre | Sugere itens do catálogo que não estão na lista. | E1-04 |
| Aviso de saída (6) | Duas listas: separados fora do carro; não separados | Aberto por "vou sair". Permite marcar ali mesmo e confirmar a saída. | E1-06 |
| Durante a estadia (7) | Regras do camping, botão "faltou algo" | Disponível a partir da data de ida. | E1-09, E3-07 |
| Checklist da volta (8) | Itens para conferir, tarefas de desmontagem, "secar ou lavar em casa" | Não conferidos ficam destacados. | E1-10 |
| Em casa (9) | "Sobrou" e "faltou" nos consumíveis; perguntas do camping e sugestão na etapa 3 | Uma pergunta por tela. Pode sair a qualquer momento. | E1-11 |
| Nova viagem a partir da anterior | "Repetir a última" e modelos salvos | Mostra o que mudou por aprendizado. | E1-12 |
| Em breve | Inventário e cardápio como funções futuras | O toque registra interesse e mostra uma mensagem curta. | DAT-05 |

**Etapa 2**

| Tela | Contém | Estados e regras | PRD |
| --- | --- | --- | --- |
| Entrar | Login com Google | Pedido só ao organizar grupo, lançar gasto, cadastrar Pix ou confirmar fato. | E2-16 |
| Transformar em grupo | Nome do grupo, famílias, link de convite | Gera o link e abre o compartilhamento do celular. | E2-01 |
| Grupo (11) | Famílias, itens do grupo com dono, "ninguém pegou", duplicados, progresso por família | O organizador vê pendências por família e pode lembrar quem falta. | E2-03 a E2-07 |
| Convidar para a minha família | Link próprio para o outro adulto | Quem entra vê a mesma lista pessoal. | E2-18 |
| Gastos (12) | Itens divididos, estimativa e valor, cotas, quem participa, resumo por família | Troca de regra recalcula na hora. | E2-09 a E2-13 |
| Pagar | Chave Pix do comprador, valor, copiar, "paguei" | A chave só aparece para membros da viagem. | E2-14 |
| Histórico do gasto | Alterações com autor, data e valor anterior | Somente leitura. | E2-15 |
| Conta | Nome de exibição, apelido, chave Pix, excluir conta, exportar dados | Exclusão pede confirmação em dois passos. | E2-17, PRV-05 |

**Etapa 3**

| Tela | Contém | Estados e regras | PRD |
| --- | --- | --- | --- |
| Escolher destino | Cidade pela lista do IBGE, busca por nome, "não achei, criar" | Exige internet. Ao criar, mostra parecidos com "é este?". | E3-01, E3-02, E3-20 |
| Alertas do camping (3) | Atenção, ajustes com "entrou" e "saiu", regras com "ciente" | Cada ajuste pode ser desfeito. Fato não confirmado aparece com aviso. | E3-05 a E3-08 |
| Camping sem dados (13) | Aviso, itens "depende do camping", texto de perguntas para copiar | O compartilhamento usa o menu do celular. | E3-09, E3-10 |
| Registrar respostas do camping | Os fatos em toques | Origem "informado pelo camping". | E3-11 |
| Camping | Todos os fatos com selo de frescor, contagem e última confirmação | Só do camping da viagem. | E3-14, E3-16 |
| Fato do camping (10) | Histórico: nome curto, mês e ano, tipo de viagem e ocasião; divergências lado a lado | No máximo 20 linhas. | E3-15 |
| Perguntas da volta (9) | 4 perguntas, sugestão opcional, opção de responder com apelido ou como anônimo | Exige conta e as condições do FRD-01. | E3-12, E3-13, E3-18, E3-25 |
| É o mesmo lugar | Sinalizar dois campings como o mesmo | Envia para a fila de fusão. | E3-23 |

**Página do convidado e site**

| Tela | Contém | Estados e regras | PRD |
| --- | --- | --- | --- |
| Convite (14) | Nome da viagem, quem convidou, campo de nome, família | Link vencido ou revogado mostra mensagem clara. | E2-02 |
| Lista do grupo | Itens do grupo, "eu levo", quem já assumiu | Só com internet. Atualiza sozinha. | E2-02, E2-04 |
| O que eu devo | Valor por comprador, sem a chave Pix | Convida a baixar o app para pagar e lançar gasto. | E2-16 |
| Página inicial do site (15) | O que é, mascote, uma lista de exemplo navegável, lista de espera | A lista de espera pede só e-mail, com consentimento. | Seção 18 do PRD |

**Estados que toda tela trata**

- **Vazio:** com uma ação clara, nunca uma tela em branco.
- **Offline:** as funções offline seguem normais; as que exigem internet dizem isso em uma linha.
- **Aguardando envio:** indicador discreto com a contagem.
- **Erro:** mensagem em português simples, com o que a pessoa pode fazer.
- **Fonte ampliada e leitor de tela:** nada cortado, tudo com nome falado (NF-08).

## 8. Contratos entre app e servidor

O app fala com o servidor por dois caminhos: a sincronização das viagens, que é automática, e um conjunto pequeno de funções para tudo o que envolve camping, convite e dinheiro. Não existe função que liste campings com ficha (DEF-01).

**Regras de todas as funções**

- Entrada e saída em JSON, com esquema validado no servidor.
- A autorização é feita no servidor, por viagem: só membro lê e escreve.
- Erros têm `code` estável e `message` em português. Códigos comuns: `not_member`, `rate_limited`, `integrity_required`, `invite_invalid`, `not_eligible`, `validation`.
- Toda função de escrita aceita `request_id` e ignora repetições.

**Camping**

| Função | Entrada | Saída | Regras |
| --- | --- | --- | --- |
| `camping_search` | `city_code`, `query` | Até 10 itens com `id`, `name`, `city` | Sem conta. Limite por aparelho. |
| `camping_create` | `city_code`, `name` | `id`, `existing`, `similar[]` | Devolve o existente se o nome normalizado for igual; devolve parecidos para o "é este?". |
| `trip_set_camping` | `trip_id`, `camping_id`, dados da viagem para o cálculo | Retrato: `facts`, `alerts`, `adjustments`, `rules` | Exige verificação do aparelho em produção. Limite de campings distintos por aparelho por dia. |
| `camping_fact_history` | `trip_id`, `fact_key` | Até 20 linhas: rótulo, mês, tipo de viagem, ocasião, valor | Só para o camping da viagem. |
| `return_questions` | `trip_id` | Lista de chaves de pergunta | Aplica FRD-01 e FRD-02; devolve vazio se a pessoa não é elegível. |
| `submit_fact_reports` | `trip_id`, `answers[]`, `anonymous` | `ok` | Aplica FRD-01 a FRD-05. |
| `submit_owner_answers` | `trip_id`, `answers[]` | Retrato atualizado | Grava com origem `owner_via_camper`. |
| `submit_suggestion` | `trip_id`, `option_keys[]`, `text` | `ok` | Texto com até 200 caracteres. |
| `flag_same_camping` | `camping_a`, `camping_b` | `ok` | Cria ou reforça um `merge_candidate`. |

**Grupo e convite**

| Função | Entrada | Saída | Regras |
| --- | --- | --- | --- |
| `invite_create` | `trip_id`, `family_id` opcional | `token`, `url` | Só organizador, ou adulto da própria família quando `family_id` é a dele. |
| `invite_revoke` | `token` | `ok` | Só organizador. |
| `guest_join` | `token`, `display_name`, `family_name` | Sessão curta, válida só para aquela viagem | Sem conta. Limite por endereço de rede. |
| `guest_view` | sessão de convidado | Itens do grupo, quem assumiu, o que a família deve | Nunca devolve chave Pix. |
| `guest_claim` | sessão, `item_id`, `on` | Item atualizado | Única escrita permitida ao convidado. |
| `member_remove` | `trip_id`, `member_id` | `ok` | Só organizador. |

**Gastos e conta**

| Função | Entrada | Saída | Regras |
| --- | --- | --- | --- |
| `expense_upsert` | `trip_id`, `item_id`, `estimate_cents`, `amount_cents`, `split_rule`, `excluded_person_ids[]` | Gasto e resumo recalculado | Só comprador ou organizador alteram valor. Grava `expense_audit`. |
| `expense_mark_paid` | `expense_id`, `family_id`, `paid` | `ok` | Só membro da família devedora. |
| `pix_key_set` | `key`, `key_type` | `ok` | Só o dono. |
| `pix_key_get` | `trip_id`, `buyer_family_id` | `key`, `key_type` | Só membro logado da mesma viagem (PRV-06). |
| `account_export` | — | Arquivo com os dados da pessoa | PRV-05. |
| `account_delete` | confirmação | `ok` | Aplica a regra de exclusão da seção 3. |

**Apoio**

| Função | Entrada | Saída | Regras |
| --- | --- | --- | --- |
| `device_register` | `install_id`, `platform`, prova de integridade | `ok` | Renova a marca de aparelho verificado. |
| `events_ingest` | lote de eventos | `ok` | Recusa propriedades fora do esquema da seção 12. |
| `waitlist_join` | `email`, consentimento | `ok` | Usada só pela página inicial do site. |

**Limites (premissas, em `config`)**

| Limite | Valor inicial |
| --- | --- |
| Buscas de camping por aparelho | 30 por hora |
| Campings distintos consultados por aparelho | 10 por dia |
| Entradas de convidado por endereço de rede | 20 por hora |
| Relatos que contam, por conta e por camping | 2 viagens por mês |
| Linhas no histórico de um fato | 20 |

Chamada acima do limite recebe `rate_limited` e gera um evento interno (DEF-03).

## 9. Regras de cálculo e casos de teste

Estes casos são obrigatórios em `packages/core` e no servidor. Nenhuma feature que toque nessas regras é aprovada com um deles falhando.

**Cotas**

O cálculo usa meias cotas, para nunca gerar fração de centavo:

1. Cada participante vale 2 meias cotas (adulto ou adolescente), 1 (criança) ou 0 (menor de 5). Pessoas excluídas valem 0.
2. `H` é a soma das meias cotas de todos os participantes, comprador incluído.
3. Valor da meia cota = valor do gasto dividido por `H`, arredondado para baixo, em centavos.
4. Cada família deve suas meias cotas vezes esse valor. A família compradora não deve nada e absorve a diferença de arredondamento.
5. Na regra `per_family`, cada família participante vale 1 parte. Na regra `adults_teens`, só adultos e adolescentes contam, com 1 parte cada.

| Caso | Entrada | Resultado esperado |
| --- | --- | --- |
| C1 | R$ 420,00. Carla e Rafael com Lucas (9) e Bia (5); Bruno e Paula com bebê, compradores; Diego e Lívia. Regra de cotas. | `H` = 14; meia cota R$ 30,00. Carla e Rafael R$ 180,00; Diego e Lívia R$ 120,00; Bruno recebe R$ 300,00. |
| C2 | R$ 100,00. Três famílias de 1 adulto; a primeira comprou. Regra de cotas. | `H` = 6; meia cota R$ 16,66. As outras duas devem R$ 33,32 cada; o comprador absorve R$ 33,36. |
| C3 | Como C1, com Lucas excluído do gasto. | `H` = 13; meia cota R$ 32,30. Carla e Rafael R$ 161,50; Diego e Lívia R$ 129,20; Bruno recebe R$ 290,70. |
| C4 | Como C1, regra `per_family`. | Cada família R$ 140,00; Bruno recebe R$ 280,00. |
| C5 | Como C1, regra `adults_teens`. | 6 partes de R$ 70,00; cada família R$ 140,00; Bruno recebe R$ 280,00. |
| C6 | Como C1, com todos excluídos menos a família compradora. | Ninguém deve nada. |
| C7 | Gasto só com estimativa, sem valor real. | Mostra a estimativa por família com a marca "estimado"; nenhuma dívida é registrada. |

Em todos os casos, a soma do que as famílias devem mais a parte absorvida pelo comprador é igual ao valor do gasto, ao centavo.

**Geração da lista**

Viagem de referência: barraca com carro, 2 noites, 2 adultos, 2 crianças (9 e 5), 1 pet, clima frio, sem chuva, uma família.

| Caso | Verificação | Resultado esperado |
| --- | --- | --- |
| L1 | Quantidades | `gas` 2; `gelo` 2 sacos; `agua` 36 L em 8 galões; `sacos_lixo` 6; `papel_hig` 2; `cadeiras` 4; `lanterna` 2; `mudas` 3 por pessoa; `manta` 4; `muda_crianca` 2; `carvao` 1 saco |
| L2 | Itens presentes por condição | `manta`, `gorro`, `agasalho` com 2 por pessoa, `lencos`, `brinquedos`, todos os itens de pet |
| L3 | Itens ausentes por condição | `lencol`, `capa_chuva`, `muda_seca`, `tapete`, `lona_sombra`, `roupa_banho`, `chapeu`, `boia`, `fraldas`, `comida_bebe` |
| L4 | Mudar o clima para calor | Saem `manta`, `gorro` e `agasalho`; entram `lencol`, `lona_sombra`, `roupa_banho`, `chapeu` e `boia`; a tela mostra a contagem de entradas e saídas |
| L5 | Remover `grelha` e depois mudar as noites para 3 | `grelha` continua removida; `gas` vai a 3; `sacos_lixo` vai a 8; `mudas` vai a 4 |
| L6 | Adicionar à mão "rede de descanso" e recalcular | O item continua na lista, sem alteração |
| L7 | Editar `agua` para 4 galões e recalcular | A quantidade editada é preservada |
| L8 | Trocar para trilha com mochila | Saem `mesa`, `cadeiras`, `cooler`, `carvao`, `grelha`, `balde` e `cintas` |

**Ficha, alertas e ajustes**

Retrato de referência: 220 V, tomada longe, 1 chuveiro, capacidade de 11 a 25, churrasco só em área comum, aceita pet, silêncio às 22h, piscina abre às 10h; todos os fatos confirmados e recentes.

| Caso | Verificação | Resultado esperado |
| --- | --- | --- |
| A1 | Viagem de referência com o retrato de referência | Atenção: chuveiro (25 por chuveiro). Ajustes: tarefa de 220 V; `extensao` de 20 m; entra `ducha`; sai `grelha`, fica `carvao`; entram `roupa_banho` 4 e `boia` 2. Informação com "ciente": som e piscina. |
| A2 | Mesmo retrato, com 2 chuveiros | Sem atenção de chuveiro (12,5 por chuveiro); `ducha` não entra. |
| A3 | `pet` = não aceita | Atenção de pet. Sem pet na viagem, nenhum alerta. |
| A4 | `churrasco` = proibido | Atenção; saem `carvao` e `grelha`. |
| A5 | Fato de chuveiro com um único relato | Aparece como informação "não confirmado"; `ducha` não entra por ajuste. |
| A6 | Usuário desfaz o ajuste da `extensao` | Volta ao estado anterior, e um novo retrato não reaplica o ajuste desfeito. |

**Decidido pelo responsável em 26/11/2026:** há tomada no retrato de referência, então em A1 entram `extensao`, de 20 m como na tabela, e `adaptador` (seção 5, "Depende do camping"). Fato não confirmado de nível ajuste, como tomada e piscina, também só aparece como informação e não mexe na lista, como no A5.

**Sobras**

**Conciliação das decisões do responsável de 26/11/2026, proposta pelo orquestrador no mesmo dia e confirmada pelo responsável em 27/11/2026:** a cada viagem seguida em que um consumível sobrou, a partir da segunda (seção 5, "Aprendizado"), nova = `teto(qty × 0,75)`; se o teto não muda a quantidade, nova = `max(1, qty − 1)`. A redução sempre avança e chega a 1: 10 → 8 → 6 → 5 → 4 → 3 → 2 → 1; 2 vai a 1 na segunda sobra; 1 fica 1. Toda redução vem sinalizada "sobrou da última vez".

**Frescor e confirmação**

Data de referência: novembro de 2026. A idade é contada em meses entre o mês atual e o mês da visita.

| Caso | Relatos | Resultado esperado |
| --- | --- | --- |
| F1 | Último em outubro de 2026 | Recente |
| F2 | Último em março de 2026 | Pode ter mudado |
| F3 | Último em outubro de 2025 | Sem valor vigente; não gera alerta |
| F4 | Dois relatos iguais, de contas diferentes, recentes | Confirmado |
| F5 | Dois relatos iguais, da mesma conta, em viagens diferentes | Não confirmado |
| F6 | 5 relatos "cumprida" e 1 "não cumprida" em feriado | Valor vigente "cumprida"; divergência guardada com a ocasião |
| F7 | 1 relato "sim" de setembro e 1 "não" de outubro | Empate: vale "não", o mais recente; não confirmado |
| F8 | Terceira viagem da mesma conta ao mesmo camping no mesmo mês | Relato guardado, sem contar |
| F9 | Relato de viagem criada depois da data de ida | Recusado com `not_eligible` |

**Duplicados**

| Caso | Entrada, na mesma cidade | Resultado esperado |
| --- | --- | --- |
| D1 | "Camping Recanto das Águas" e "recanto das aguas" | Mesmo camping: a criação devolve o existente |
| D2 | "Recanto das Águas" e "Recanto das Agoas" | Parecido: o app pergunta "é este?" |
| D3 | "Recanto das Águas" e "Sítio Pedra Lisa" | Distintos |
| D4 | Mesmo nome em cidades diferentes | Distintos |
| D5 | Fusão de dois campings com relatos | Todos os relatos no camping que fica; o nome do outro vira apelido; desfazer restaura os dois |

## 10. Notificações e lembretes

Lembretes ligados a datas da viagem são agendados no próprio aparelho e chegam sem internet. Avisos que dependem de outra pessoa ou do servidor chegam por notificação remota.

| Aviso | Tipo | Quando | Texto-base | Limite | PRD |
| --- | --- | --- | --- | --- | --- |
| Faltam itens para separar | Local | 3 dias antes da ida, às 19h, se houver itens a separar | "Faltam 3 dias: N itens para separar" | 1 por viagem | RET-04 |
| Véspera | Local | Dia anterior à ida, às 18h | "Amanhã é dia de camping: carregue as lanternas, congele o gelo e confira o gás" | 1 por viagem | E1-08 |
| Checklist da volta | Local | Último dia, às 8h | "Antes de sair: confira o que veio com você" | 1 por viagem | E1-10 |
| Em casa | Local | Dia da volta, às 20h | "Chegou bem? Um minuto para dizer como foi" | 1 por viagem | E3-12 |
| Secar a barraca | Local | 2 dias depois da volta, se houver item "secar em casa" | "A barraca já secou? Pode guardar" | 1 por viagem | E1-10 |
| Pendência no grupo | Remota | Quando o organizador toca em "lembrar", ou na véspera, para quem tem item do grupo sem separar | "Você ficou de levar: carvão" | 1 por dia por pessoa | E2-07 |
| Mudança no grupo | Remota | Alguém entra no grupo ou um gasto é lançado | "Bruno lançou a carne: R$ 420" | Agrupadas a cada 30 minutos | E2-08 |
| Repetir a última viagem | Remota | 10 dias antes de feriado ou férias da lista em `config`, para quem não tem viagem marcada | "Feriado chegando: repetir a lista da última viagem?" | 4 por ano por pessoa | RET-05 |
| Novidade no camping visitado | Remota | Fato com novas confirmações em camping onde a pessoa esteve | "O Recanto das Águas ganhou 3 confirmações novas" | 1 por mês | RET-06 |

**Regras**

- A permissão de notificação é pedida quando a primeira viagem com data é criada, com uma tela própria explicando o motivo antes do pedido do sistema (RET-03).
- Mudar as datas da viagem reagenda todos os lembretes locais. Apagar a viagem cancela todos.
- Três avisos de reativação seguidos sem abertura do app suspendem os avisos de reativação daquela pessoa (RET-07).
- Ajustes têm três chaves independentes: lembretes de viagem, avisos de grupo e avisos de reativação (RET-08).
- Tocar no aviso abre a tela correspondente, não o início do app.
- Os horários são premissas e ficam em `config`.

## 11. Segurança, privacidade e antifraude

A regra de base é simples: o servidor não confia no aparelho. Toda permissão é verificada no servidor, e o aparelho guarda só o que pertence ao próprio usuário.

**Autorização**

| Dado | Quem lê | Quem escreve |
| --- | --- | --- |
| Viagem, famílias, pessoas, itens | Membros da viagem | Membros; dados da viagem e remoção de membro, só organizador |
| Itens pessoais de uma família | Membros daquela família | Membros daquela família |
| Gastos | Membros da viagem | Comprador e organizador |
| Chave Pix | Membros logados de viagem em que o dono é comprador | O dono |
| Campings, relatos, resumos, sugestões | Ninguém diretamente; só pelas funções da seção 8 | Só pelas funções da seção 8 |
| Eventos, `config`, fila de fusão | Só operação interna | Só operação interna |

Cada linha da tabela tem teste automático que tenta o acesso indevido e espera recusa (NF-10).

**RLS ativo em todas as tabelas**

RLS é a segurança por linha do Postgres: com ela ativa, cada consulta só enxerga as linhas que uma política libera.

- Toda tabela nasce com RLS ativo, na mesma migração que a cria. Sem política escrita, ninguém lê nem escreve.
- As tabelas de camping, relatos, resumos, sugestões, eventos, `config` e fila de fusão têm RLS ativo e nenhuma política para o app. Só as funções da seção 8 chegam nelas.
- A chave de serviço, que ignora o RLS, existe só no servidor e nunca entra no app nem no repositório (DEF-09).
- A sincronização lê o banco com credencial própria e não passa pelo RLS. Por isso as regras de sincronização são uma segunda barreira, escrita e testada à parte: cada aparelho só recebe as viagens de que a pessoa é membro.
- Um teste automático lista todas as tabelas e falha se alguma estiver sem RLS, ou se uma tabela protegida tiver política de leitura para o app. Outro teste confere que um membro da viagem A não recebe nada da viagem B pela sincronização.
- O QA roda os dois testes em toda feature que toca o servidor, e eles rodam de novo contra o banco de produção antes de cada versão.

**Verificação do aparelho (DEF-04, FRD-04)**

1. Na instalação, o app gera um `install_id` aleatório.
2. Antes de `trip_set_camping` e de `submit_fact_reports`, o app obtém uma prova de integridade do sistema e a envia.
3. O servidor valida a prova com o serviço do Google e marca o aparelho como verificado por tempo limitado.
4. Sem verificação válida, essas duas funções devolvem `integrity_required`.

No ambiente local e em emulador não há prova real. O servidor local aceita uma prova de desenvolvimento, e essa aceitação é desligada por configuração em produção, com teste automático que garante isso.

**Antifraude nas confirmações**

| Regra | Implementação |
| --- | --- |
| FRD-01 | Conta logada, `trip.camping_id` igual ao camping do relato e `end_date` anterior a hoje |
| FRD-02 | `trip.created_at` anterior a `start_date`, e ao menos um item com mudança de `pack_state` registrada antes de `start_date` |
| FRD-03 | Único por viagem e fato; a partir da terceira viagem do mês ao mesmo camping, `counts` falso |
| FRD-05 | Mais de 5 relatos para o mesmo camping, vindos de contas com menos de 7 dias, em 72 horas: todos ficam `held` até revisão (premissa) |

**No aparelho**

- O banco local é cifrado, com a chave guardada no cofre do sistema (DEF-11).
- Nenhuma chave de serviço no app. O app só carrega a chave pública do servidor (DEF-09).
- A versão de loja é gerada com ofuscação e sem mapas de código (DEF-07). Um teste de publicação confere a ausência de mapas e de segredos no pacote.

**Privacidade**

- Nenhuma tela pede CPF, telefone ou localização. O app não declara permissão de localização (PRV-02).
- O consentimento é uma tela no primeiro uso que envia dados ao servidor: login, destino ou convite. O texto vem da pessoa responsável pela parte jurídica, não dos agentes (PRV-04, DAT-02).
- Registros do servidor não guardam nomes, e-mails, chaves Pix nem texto livre.
- A foto de nota fiscal fica em armazenamento privado, acessível só a membros da viagem, e é apagada com a viagem.
- Exportação e exclusão de conta seguem a seção 3.
- Uma rotina mensal avisa contas sem uso há 23 meses e apaga ou anonimiza aos 24 (RET-11).

**Operação interna**

A fila de fusão, a liberação de relatos retidos e a consulta de sugestões são feitas por uma página interna simples, protegida por login de administrador. Ela não faz parte do app.

## 12. Eventos de medição

Cada métrica do PRD sai de um destes eventos. O app guarda os eventos no aparelho e envia em lote quando há internet. Nenhum evento leva nome, e-mail, texto digitado ou nome de camping: só identificadores e valores fechados.

| Evento | Quando | Propriedades | Serve a |
| --- | --- | --- | --- |
| `app_opened` | App aberto | `origin` (ícone, aviso, link de convite) | RET-10 |
| `install_attributed` | Primeira abertura | `channel`, `invite_token_hash` | DAT-04 |
| `trip_created` | Viagem criada | `kind`, `nights`, `people`, `has_dates`, `has_destination`, `from_previous` | Ativação, E1-12 |
| `list_generated` | Lista gerada ou recalculada | `items_added`, `items_removed` | E1-02 |
| `item_state_changed` | Mudança de `pack_state` | `catalog_key`, `to_state` | Ativação |
| `item_removed`, `item_added_manual` | Edição da lista | `catalog_key` ou `is_custom` | Melhoria do catálogo |
| `need_buy_marked` | "Preciso comprar" | `catalog_key` | Afiliados |
| `affiliate_clicked` | Toque em link de afiliado | `catalog_key` | Receita |
| `departure_checked` | "Vou sair" confirmado | `left_behind_count` | E1-06 |
| `missing_marked`, `leftover_marked` | "Faltou" e "sobrou" | `catalog_key` | E1-11 |
| `return_checklist_done` | Checklist da volta concluído | `unchecked_count` | Etapa 1 |
| `trip_repeated` | Viagem criada a partir de outra | — | Retorno |
| `coming_soon_tapped` | Toque em função "em breve" | `feature` | DAT-05 |
| `group_created`, `invite_shared` | Grupo e convite | `families` | Etapa 2 |
| `guest_joined`, `guest_claimed` | Página do convidado | `installed_later` | Etapa 2 |
| `expense_added` | Gasto lançado | `catalog_key`, `amount_band`, `split_rule` | Etapa 2 |
| `destination_set` | Destino escolhido | `camping_id`, `had_data` | Etapa 3 |
| `camping_not_found` | Busca sem resultado | `city_code` | DAT-01 |
| `alert_shown` | Alerta exibido | `fact_key`, `level` | Etapa 3 |
| `adjustment_undone` | Ajuste desfeito | `fact_key`, `catalog_key` | Etapa 3 |
| `owner_questions_shared` | Texto de perguntas compartilhado | `facts_count` | E3-10 |
| `return_questions_answered` | Perguntas da volta | `asked`, `answered`, `anonymous` | Etapa 3 |
| `suggestion_sent` | Sugestão enviada | `options_count`, `has_text` | E3-25 |
| `notification_opened` | Aviso tocado | `kind` | RET-07 |

**Regras**

- Valores em dinheiro viram faixa (`amount_band`), nunca o valor exato.
- `invite_token_hash` é um resumo irreversível do código do convite.
- Usuário ativo é quem tem `trip_created` ou `item_state_changed` nos últimos 12 meses (RET-09).
- Instalações sem abertura vêm do relatório da loja, não destes eventos.

## 13. Estratégia de testes locais

Tudo o que pode ser testado na máquina local é testado lá, e o QA roda a suíte completa antes de aprovar cada feature. O GitHub não executa testes durante o desenvolvimento.

**Camadas**

| Camada | O que cobre | Onde roda | Quando |
| --- | --- | --- | --- |
| Regras puras | Casos da seção 9: cotas, geração da lista, alertas, frescor, duplicados | `packages/core`, sem rede nem tela | A cada alteração |
| Servidor | Funções da seção 8, autorização da seção 11, limites | Servidor e banco locais em Docker | A cada feature de servidor |
| Sincronização | Cenários S1 a S10 da seção 4 | Dois emuladores Android e o servidor local | A cada feature que toca dados sincronizados |
| Roteiros de tela | As jornadas abaixo, do primeiro toque ao fim | Emulador Android | A cada feature de tela e antes de cada versão |
| Página web | Convite, lista do grupo, "o que eu devo", página inicial | Navegador automático com tela de celular, nos motores do Android e do iPhone | A cada feature da web |
| Publicação | Pacote sem mapas de código nem segredos; aceitação de prova de desenvolvimento desligada | Sobre o pacote gerado | Antes de cada versão |

**Jornadas automatizadas**

| Jornada | Passos principais | Etapa |
| --- | --- | --- |
| J1 Família | Criar a viagem de referência, conferir quantidades, marcar "separei" e "está no carro", aviso de saída com 3 itens fora do carro, "faltou", checklist da volta, "sobrou", repetir a viagem | 1 |
| J2 Avião | J1 inteira em modo avião, fechando e reabrindo o app no meio | 1 |
| J3 Lembretes | Viagem com data, relógio adiantado, lembretes de 3 dias, véspera e volta chegando sem internet | 1 |
| J4 Grupo | Organizador cria o grupo; segundo emulador entra; itens assumidos, sem dono e duplicados | 2 |
| J5 Convidado | Abrir o link no navegador, entrar com o nome, assumir um item, ver no app do organizador | 2 |
| J6 Gastos | Lançar a carne a R$ 420, conferir as cotas do caso C1, copiar o Pix, marcar "paguei" | 2 |
| J7 Camping com dados | Escolher o camping de referência, conferir alertas e ajustes do caso A1, tocar em "ciente", desfazer um ajuste | 3 |
| J8 Camping sem dados | Criar camping novo, lista "na dúvida", compartilhar o texto de perguntas, registrar respostas | 3 |
| J9 Volta com perguntas | Viagem encerrada, 4 perguntas, sugestão, nome na última confirmação do fato | 3 |

Cada jornada guarda capturas de tela dos pontos principais como evidência para o QA (GIT-14).

**Condições simuladas (GIT-16)**

Modo avião, rede lenta, fonte do sistema no máximo, tema escuro, tela pequena (5 polegadas) e grande (6,7 polegadas), e relógio adiantado.

**Dados de teste**

O ambiente local sobe com a família da Carla, o grupo de três famílias, o Camping Recanto das Águas com 7 relatos e um camping sem dados. São os mesmos dados dos protótipos, para o QA comparar tela com tela.

**O que fica para validação humana a cada versão (GIT-13)**

- Login real com Google em aparelho de verdade.
- Notificações remotas chegando em aparelho de verdade.
- Verificação do aparelho em versão instalada pela loja.
- Leitura sob sol e uso com uma mão.
- Desempenho em um aparelho Android intermediário: lista em até 1 segundo, abertura em até 3 (NF-04, NF-05).
- Leitor de tela nas jornadas J1 e J4.
- Envio à loja.

## 14. Plano de construção

A construção segue esta ordem: prova técnica, base, etapa 1, etapa 2, etapa 3 e a rodada de lançamento. Dentro de cada bloco, o orquestrador põe em paralelo o que não tem dependência entre si, até o limite de 6 agentes.

**Antes de qualquer agente de desenvolvimento**

1. Mascote escolhido e pacote entregue (MSC-01 a MSC-14).
2. Um dos 5 protótipos escolhido (DSG-01 a DSG-13).
3. Repositório criado no GitHub, com o ramo principal protegido.

**Configuração dos serviços externos**

O agente configura tudo sozinho, pelo Chrome do responsável pelo produto: projeto no Supabase, serviço de sincronização, login com Google, Google Play Console, repositório no GitHub com o ramo principal protegido e o serviço no Cloud Run.

O agente para e chama o responsável só nestes casos:

- Login, senha ou código de verificação em duas etapas.
- Pagamento, cartão ou mudança de plano pago.
- Aceite de contrato ou termos em nome do responsável.
- Verificação de identidade, como a que o Google Play exige.
- Ação que apaga dados ou não tem volta, como excluir um projeto ou um banco.

Regras da configuração:

1. O agente nunca digita nem guarda senha. O responsável faz o login e devolve o controle.
2. Chaves secretas vão direto do painel para o cofre de segredos do serviço ou para um arquivo local fora do git. Nunca aparecem em conversa, registro, captura de tela ou commit.
3. O banco só muda por migração versionada no repositório. O painel serve para criar o projeto e conferir, não para alterar tabelas à mão.
4. Verificação em duas etapas ativa em todas as contas: Supabase, GitHub e Google; no lançamento, também o registrador do domínio.
5. Em produção: backup diário do banco ativo, conexão só cifrada e acesso direto ao banco restrito.
6. Cada serviço configurado é registrado em `docs/infra.md`: o que foi criado, onde e com quais opções, sem nenhum segredo, para que possa ser refeito.
7. Ao terminar, o agente entrega ao QA a evidência de cada item "ativo": RLS, backup, duas etapas e ramo protegido. O QA confere antes de liberar a feature.

**Endereço provisório no desenvolvimento**

Nas versões 0.x, a página do convidado e o site ficam publicados no Cloud Run, com o endereço provisório `run.app` que o próprio serviço fornece. O domínio próprio entra só na versão 1.0.0.

- O endereço fica em um único valor de configuração, lido pelo app, pela página web e pelo servidor. Nenhum código traz o endereço escrito.
- Um teste falha se `run.app` aparecer no repositório fora do arquivo de configuração.
- Nome do serviço, projeto e região no Cloud Run não mudam durante o desenvolvimento, porque o endereço depende deles.
- O endereço provisório não é divulgado ao público: não vai para rede social, lista de espera nem material de loja.
- Convites criados no endereço provisório deixam de abrir depois da troca. São dados de teste, então isso é aceito.

A troca para o domínio próprio é uma tarefa da rodada de lançamento e confere, nesta ordem:

1. Valor de configuração do endereço.
2. Arquivo que liga os links ao app no Android e, no lançamento, no iPhone.
3. Endereços de retorno do login com Google e do login com Apple.
4. Endereços aceitos pelo servidor nas chamadas da página web.
5. Links em avisos, no texto de convite e nas páginas das lojas.
6. Jornada J5 inteira no domínio novo.

**Prova técnica e base**

| ID | Feature | Depende de | Cobre |
| --- | --- | --- | --- |
| F0 | Prova técnica da seção 2 | — | Riscos de sincronização, lembrete, link e verificação |
| B1 | Repositório, scripts locais de teste e ambiente em Docker | F0 | GIT-10, GIT-11 |
| B2 | Componentes visuais a partir do protótipo escolhido | Protótipo | DSG-06, NF-07, NF-08 |
| B3 | Motor de regras e carregamento do catálogo | B1 | Seções 5 e 9 |
| B4 | Banco local cifrado e suas migrações | B1 | Seção 3, DEF-11 |
| B5 | Esquema do servidor e autorização | B1 | Seções 3 e 11 |
| B6 | Arquivo de textos e eventos de medição | B1 | NF-09, seção 12 |

B2 a B6 podem andar em paralelo.

**Etapa 1, até a versão 0.1.0**

| ID | Feature | Depende de | Cobre |
| --- | --- | --- | --- |
| 1.1 | Criar viagem, com e sem data | B2, B4 | E1-01, E1-13, RET-02 |
| 1.2 | Gerar a lista e as quantidades | B3, 1.1 | E1-02, E1-03 |
| 1.3 | Editar a lista e recalcular | 1.2 | E1-04 |
| 1.4 | Dois passos de marcação, filtros e progresso | 1.2 | E1-05 |
| 1.5 | Aviso de saída | 1.4 | E1-06 |
| 1.6 | Lembretes locais e pedido de permissão | 1.1 | E1-08, RET-03, RET-04 |
| 1.7 | "Faltou" durante a estadia | 1.4 | E1-09 |
| 1.8 | Checklist da volta | 1.4 | E1-10 |
| 1.9 | "Sobrou e faltou" e aprendizado | 1.8 | E1-11 |
| 1.10 | Repetir viagem e modelos | 1.9 | E1-12 |
| 1.11 | Funções "em breve" e funil | B6 | DAT-05, RET-10 |
| 1.12 | Página inicial do site com lista de espera | B2 | Seção 18 do PRD |
| 1.13 | Endurecimento offline: jornadas J1 a J3 | 1.1 a 1.10 | E1-07, NF-03 |

Paralelos possíveis: 1.3, 1.4 e 1.6 depois de 1.2; 1.11 e 1.12 a qualquer momento.

**Etapa 2, até a versão 0.2.0**

| ID | Feature | Depende de | Cobre |
| --- | --- | --- | --- |
| 2.1 | Login com Google e vínculo das viagens locais | B5 | E2-16, E1-14 |
| 2.2 | Sincronização das viagens | 2.1 | E2-08, seção 4 |
| 2.3 | Grupo: famílias, pessoas e itens do grupo | 2.2 | E2-01, E2-03, E2-06 |
| 2.4 | Convite e página do convidado | 2.3 | E2-02, RET-01 |
| 2.5 | Assumir item, "ninguém pegou" e duplicados | 2.3 | E2-04, E2-05 |
| 2.6 | Progresso por família e lembrete dirigido | 2.5 | E2-07 |
| 2.7 | Mesma família em dois aparelhos | 2.4 | E2-18 |
| 2.8 | Gastos: estimativa, valor, cotas, participantes, resumo | 2.3 | E2-09 a E2-13 |
| 2.9 | Chave Pix e "paguei" | 2.8 | E2-14 |
| 2.10 | Histórico de alterações do gasto | 2.8 | E2-15 |
| 2.11 | Conta: excluir e exportar | 2.1 | E2-17, PRV-05 |
| 2.12 | Cenários S1 a S10 e jornadas J4 a J6 | 2.2 a 2.10 | NF-03, NF-10 |

Paralelos possíveis: 2.4, 2.5 e 2.8 depois de 2.3; 2.11 a qualquer momento depois de 2.1.

**Etapa 3, até a versão 0.3.0**

| ID | Feature | Depende de | Cobre |
| --- | --- | --- | --- |
| 3.1 | Cidades do IBGE, busca, criação e duplicados | B5 | E3-01, E3-02, E3-20 a E3-22 |
| 3.2 | Relatos, resumo, frescor e divergência no servidor | 3.1 | E3-03, E3-04, seção 6 |
| 3.3 | Retrato, alertas e ajustes na lista | 3.2 | E3-05 a E3-08 |
| 3.4 | Camping sem dados, texto de perguntas e respostas do camping | 3.3 | E3-09 a E3-11 |
| 3.5 | Perguntas da volta e sugestões | 3.2 | E3-12, E3-13, E3-25 a E3-27 |
| 3.6 | Tela do camping e histórico do fato | 3.2 | E3-14 a E3-16, E3-18, E3-19 |
| 3.7 | Verificação do aparelho, limites e antifraude | 3.2 | E3-17, FRD-01 a FRD-05, DEF-03, DEF-04 |
| 3.8 | Página interna: fila de fusão, relatos retidos e sugestões | 3.2 | E3-23, E3-24, E3-26 |
| 3.9 | Avisos de reativação e controles | 2.2 | RET-05 a RET-08 |
| 3.10 | Rotina de contas inativas | 2.11 | RET-11 |
| 3.11 | Jornadas J7 a J9 e testes de autorização de camping | 3.3 a 3.7 | DEF-01, DEF-02, DEF-10 |

Paralelos possíveis: 3.3, 3.5, 3.6, 3.7 e 3.8 depois de 3.2.

**Lançamento, até a versão 1.0.0**

| ID | Feature | Cobre |
| --- | --- | --- |
| R1 | Geração para iPhone e rodada própria de testes, em Mac | NF-01 |
| R2 | Login com Apple e verificação do aparelho no iPhone | E2-16, DEF-04 |
| R3 | Textos legais revisados por pessoa habilitada | PRV-04, DAT-02 |
| R4 | Ofuscação, teste de publicação e páginas das lojas | DEF-07, NF-12 |
| R5 | Links de afiliado com aviso | DAT-06 |

**Cartão de tarefa**

Toda feature é entregue ao agente neste formato:

- ID e nome da feature.
- IDs do PRD cobertos, com os critérios de aceite copiados.
- Seções desta spec que se aplicam.
- Pastas que o agente pode alterar.
- Testes e jornadas que precisam passar, e os que precisam ser criados.
- Telas do protótipo de referência.
- Modelo e esforço escolhidos pelo orquestrador, com o motivo em uma linha.

**Relatório do QA**

- Aprovado ou reprovado.
- Resultado da suíte local: quantos testes, quantos passaram.
- Jornadas executadas, com as capturas de tela.
- Em reprovação: o critério que falhou, como reproduzir e a evidência.

**Regras do ciclo**

1. O agente entrega ao QA, nunca ao orquestrador.
2. Reprovação volta direto ao agente. Aprovação vai ao orquestrador.
3. Na terceira reprovação seguida da mesma feature, o QA avisa o orquestrador, que divide a tarefa, troca o modelo ou pede decisão humana.
4. Dúvida de regra de negócio ou de conteúdo para o trabalho até ser respondida. O agente não preenche a lacuna.
5. Commits locais durante o ciclo; só o aprovado sobe, em um commit com o ID da feature (GIT-02, GIT-03).
6. Aprovada e integrada a feature, o orquestrador fecha o painel e apaga seus arquivos temporários (SQD-06 a SQD-09).
7. Ao fim de cada etapa, o orquestrador prepara a versão e aguarda a validação humana antes de abrir a etapa seguinte.

**Escolha de modelo e esforço**

O orquestrador decide caso a caso, priorizando qualidade. Como orientação: sincronização, autorização, dinheiro e antifraude pedem o nível mais alto disponível; telas a partir de componentes prontos e textos aceitam nível intermediário. Na dúvida, o mais alto.

## 15. Pendências

Nenhum destes pontos impede o início do mascote e dos protótipos. A conta de desenvolvedor no Google Play precisa existir antes da prova técnica.

**Decisões do responsável pelo produto**

| Ponto | Por que importa | Proposta |
| --- | --- | --- |
| Conta de desenvolvedor no Google Play | Sem ela não há faixa de teste nem verificação do aparelho | Criar antes da prova técnica |
| Onde hospedar o servidor em produção e quanto gastar | Define custo mensal e onde ficam os dados | Serviço gerenciado, em região no Brasil se disponível |
| Sincronização em produção: serviço hospedado ou auto-hospedado | Custo, operação e condições de licença da edição auto-hospedada | Decidir depois da prova técnica, com os números na mão |
| Água potável como nono fato da ficha | O catálogo calcula 36 L para a família de referência; saber se o camping tem água muda muito a lista | Incluir como fato, com opções "tem", "não tem" |
| Churrasco entra na lista por padrão | Hoje carvão e grelha entram em toda viagem de barraca com carro | Manter, e medir quantos removem |
| Quem opera a página interna | Fila de fusão e relatos retidos precisam de uma pessoa | Definir antes da etapa 3 |
| Quem faz a validação humana de cada versão | Lista da seção 13 | Definir antes da versão 0.1.0 |
| Textos legais | Consentimento, política de privacidade e termos | Contratar revisão antes do lançamento |

**Decisões registradas em 26/11/2026 (depois da prova técnica F0, `docs/prova-tecnica/resultado.md`)**

- Sincronização em produção: o PowerSync segue auto-hospedado nas versões 0.x, que é o que a prova mediu. A escolha entre serviço hospedado e auto-hospedado em produção se decide com custo real antes da 1.0.0 e, de todo modo, antes de a 0.1.0 chegar a outras pessoas. A licença do serviço auto-hospedado é Apache 2.0 desde 03/11/2026.
- Verificação do aparelho: os tempos de 5 minutos, 1 minuto e 24 horas passam a constar da tabela de premissas numéricas acima, como valores provisórios, guardados em configuração do servidor (B5). Decidem-se de novo na F0-6, com um token real.
- Conta de desenvolvedor no Google Play: fica para depois da prova, e abre no começo da etapa 1, para a verificação de identidade andar em paralelo. O celular Android físico fica à mão até a feature 1.6.
- Histórico do item do grupo (seção 4, "o valor perdido aparece no histórico do item"): a seção 3 não tem a tabela. A tabela de histórico do item é definida na feature 2.2, onde o conflito acontece (decisão do orquestrador, registrada na B5).

**Premissas numéricas a calibrar**

Todas ficam em `config` e mudam sem nova versão do app.

| Premissa | Valor inicial | Seção |
| --- | --- | --- |
| Água por pessoa por dia | 3 L | 5 |
| Gás, gelo, carvão e demais fórmulas | Conforme o catálogo | 5 |
| Redução por "sobrou" em duas viagens | 25% | 5 |
| Barracas por chuveiro que geram atenção | Mais de 15 | 6 |
| Peso do relato "informado pelo camping" | 0,5 | 6 |
| Similaridade para "é este?" | 0,6 | 6 |
| Validade do convite | 30 dias | 3 |
| Retrato do camping considerado velho | 7 dias | 4 |
| Propagação no grupo com internet | Até 5 segundos | 4 |
| Limites de consulta | Tabela da seção 8 | 8 |
| Horários dos avisos | Tabela da seção 10 | 10 |
| Retenção por pico de relatos | Mais de 5, de contas com menos de 7 dias, em 72 horas | 11 |
| Idade máxima do comprovante da verificação do aparelho (provisória, a rever na F0-6 com um token real) | 5 minutos | 11 |
| Tolerância de relógio do comprovante para o futuro (provisória, a rever na F0-6) | 1 minuto | 11 |
| Validade da marca "aparelho verificado" (provisória, a rever na F0-6) | 24 horas | 11 |

**Listas que precisam ser fornecidas**

- Feriados nacionais e períodos de férias para o cálculo da ocasião e dos avisos de reativação.
- Operadoras de celular para o fato de sinal.
- Tabela de municípios do IBGE.

**Riscos técnicos acompanhados**

- A biblioteca de verificação do aparelho está em versão alfa e pode mudar.
- A verificação do aparelho só pode ser testada de verdade em versão instalada pela loja.
- A primeira geração para iPhone costuma revelar ajustes; a rodada R1 existe para isso.
