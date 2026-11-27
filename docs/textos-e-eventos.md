# Textos e eventos de medição

Criado na feature **B6** (arquivo de textos e eventos de medição) em 26/11/2026. Cobre **NF-09** (português do Brasil, textos separados do código, reais e datas no formato brasileiro), **DAT-04**, **DAT-05**, **RET-09**, **RET-10** e a **seção 12 da SPEC** (eventos de medição).

Tudo aqui é regra pura e arquivo de dados, testado na máquina local (`npm run testar`). Nada chama serviço externo.

## 1. Arquivo de textos (NF-09)

**Onde ficam**

| Arquivo | Para quê |
| --- | --- |
| `apps/mobile/src/textos/pt-BR.json` | Todos os textos do app, por tela e área (SPEC, seção 7) |
| `apps/web/src/textos/pt-BR.json` | Textos da página do convidado e do site |
| `apps/*/src/textos/index.ts` | Acesso tipado: `textos.tela.chave` e `t('tela.chave', { n })` |
| `packages/core/src/formato/texto.ts` | O mecanismo (interpolação, plural, busca por chave), igual no app e na página |

O mesmo JSON serve ao app, aos roteiros do Maestro (marcador `{{textos.tela.chave}}`) e aos testes da página (`import textos from '.../pt-BR.json'`). Não existe cópia de texto.

**Como usar**

```ts
import { t, textos } from '../src/textos';

textos.lista.titulo                  // texto fixo; a tela e a chave são conferidas pelo TypeScript
t('lista.faltam', { n: 3 })          // "Faltam 3 para o carro."
t('lista.faltam', { n: 1 })          // "Falta 1 para o carro."  (singular pela chave lista.faltam_um)
t('estados.falado', { nome, quantidade, estado })
```

- **Marcas** `{nome}` são trocadas pelo valor de mesmo nome. Marca sem valor é erro (nunca sai `{n}` na tela).
- **Plural** (DESIGN, seção 10): a chave normal é o plural; o singular é a mesma chave com o sufixo `_um` e vale só quando `n` é exatamente 1. Zero vai no plural ("0 itens"). A chave `_um` precisa pedir as mesmas marcas da chave normal (um teste confere).
- **Chave errada não compila**: `t` só aceita chave que existe no arquivo (`ChaveDeTexto`), e `textos.tela.chave` é tipado pelo próprio JSON. A chave `_um` não entra na lista de chaves de `t`: o código escreve a chave normal.
- **Chaves que começam com `_`** (como `_leia`) são comentário do arquivo e não são textos.
- **Nada de frase solta no código:** a regra `react/jsx-no-literals` do lint barra texto no JSX; textos em propriedades (`accessibilityLabel`, `placeholder`, `title`) seguem a mesma regra por revisão do QA.
- **Tom (DESIGN, seção 10):** diário de expedição, verbo no presente, sem adjetivo, sem exclamação (um teste barra `!` nos textos definidos). Reais com centavos; o estado dito por extenso nos textos para leitor de tela.
- **Origem dos textos:** os da etapa 1 e os das telas já desenhadas vêm de `design/prototipos/rumo/textos.js` e `design/prototipos/_compartilhado/textos.js`, sem os textos da apresentação do protótipo (avaliador, paletas, identidade, comparação). Os lembretes locais vêm da SPEC, seção 10 ("Texto-base"). O texto "N entraram, M saíram" é o da SPEC, seção 7.
- **Singulares acrescentados** (`_um`) que o protótipo não trazia, para não sair "1 cotas": `gastos.cotas`, `gastos.cotasDe`, `grupo.assumidos`, `camping.confirmadoPor`, `camping.confirmaram`, `notificacoes.faltamItens` e, na página, `listaDoGrupo.assumidos`. São a mesma frase no singular, no tom do protótipo.
- **Avisos remotos** (SPEC, seção 10: pendência no grupo, mudança no grupo, repetir a última viagem, novidade no camping) são montados pelo servidor, não pelo app: os textos deles entram com a B5 e a feature 2.8. Não estão neste arquivo.

**Texto pendente.** Onde a SPEC, o protótipo e o PRD não definem o texto, a chave existe com o valor começando por `[PENDENTE]` e a descrição do que falta. A lista completa está na seção 8. Nenhum texto legal (consentimento, política de privacidade, termos) é escrito pelo desenvolvimento: essas chaves ficam pendentes até uma pessoa habilitada fornecer o texto (PRV-04), e um teste falha se uma chave de consentimento, privacidade ou termos for preenchida com texto que não seja `[PENDENTE]`.

**Testes** (`apps/mobile/src/textos/textos.test.ts`)

- Toda chave usada em `apps/mobile/app`, `apps/mobile/src`, `apps/web/src`, nos testes de tela (`e2e/web`) e nos roteiros do Maestro (`e2e/jornadas`) existe no arquivo de textos. A varredura (`varredura.ts`, só para teste) reconhece `textos.a.b`, `t('a.b')` e `{{textos.a.b}}`.
- A varredura de fato acha chave plantada que não existe (prova de que o teste falha quando deve).
- Valores não vazios e sem espaço sobrando; marcas bem formadas; sem `!`; sem endereço de serviço, e-mail ou caminho de máquina.
- Toda chave pendente está na seção 8 deste documento, e só elas.
- Palavras comuns (estados, categorias, nome do app, mascote) iguais no app e na página.

**Como acrescentar um texto:** escreva a chave no JSON, use no código (`textos.tela.chave` ou `t('tela.chave')`), rode `npm run testar`. Se o texto ainda não está definido, escreva `[PENDENTE] o que falta` e acrescente a linha na seção 8.

## 2. Formatação em português do Brasil (NF-09)

`packages/core/src/formato/` (funções puras, sem `Intl`: a saída é a mesma no aparelho e no teste). Importe de `@campinguim/core/formato`.

| Função | Entrada | Saída |
| --- | --- | --- |
| `formatarReais(centavos)` | `123456` | `R$ 1.234,56` (`42000` dá `R$ 420,00`; negativo dá `-R$ 10,00`) |
| `formatarReaisSemSimbolo(centavos)` | `123456` | `1.234,56` |
| `formatarData(iso)` | `2027-01-12` | `12/01/2027` |
| `formatarDataCurta(iso)` | `2027-01-15` | `sex., 15 de jan.` |
| `formatarMesAno(anoMes)` | `2026-11` | `nov/2026` (histórico do fato, sem o dia: E3-19) |
| `formatarPeriodo(inicio, fim)` | duas datas | `15/01/2027 a 17/01/2027` |
| `formatarNumero(valor, casas)` | `1234.5`, `2` | `1.234,50` |
| `formatarPorcentagem(fracao)` | `0.35` | `35 %` |

- Dinheiro é sempre inteiro em centavos; centavo quebrado é erro (`RangeError`).
- Data é um dia sem hora e sem fuso (`AAAA-MM-DD`): o dia 12 é o dia 12 em qualquer fuso (um teste troca o fuso e confere). Data que não existe (31 de fevereiro) é erro.
- Semana e mês abreviados com ponto (`dom.`, `seg.`, ..., `jan.`, ..., `dez.`), como nos exemplos da tarefa.

## 3. Eventos de medição (SPEC, seção 12)

`packages/core/src/eventos/` (regras puras) e `apps/mobile/src/medicao/` (registro no app). Importe de `@campinguim/core/eventos`.

**Catálogo.** São 28 nomes de evento, com as propriedades exatas da tabela da SPEC. Um teste lê a tabela da seção 12 do `docs/SPEC.md` e confere que o catálogo tem os mesmos eventos e as mesmas propriedades (nem mais, nem menos): se a SPEC mudar, o teste avisa.

| Evento | Propriedades (valores aceitos) |
| --- | --- |
| `app_opened` | `origin` (`icon`, `notification`, `invite_link`) |
| `install_attributed` | `channel` (`store`, `invite`, `site`, `social`, `unknown`; decidido em 27/11/2026), `invite_token_hash` (opcional, resumo SHA-256) |
| `trip_created` | `kind` (`tent_car`, `backpack`, `motorhome`), `nights` (0 a 365), `people` (1 a 999), `has_dates`, `has_destination`, `from_previous` (verdadeiro ou falso) |
| `list_generated` | `items_added`, `items_removed` (inteiros, 0 a 9999) |
| `item_state_changed` | `catalog_key`, `to_state` (`todo`, `set_aside`, `in_car`) |
| `item_removed`, `item_added_manual` | `catalog_key` **ou** `is_custom` (só `true`), nunca os dois |
| `need_buy_marked`, `affiliate_clicked`, `missing_marked`, `leftover_marked` | `catalog_key` |
| `departure_checked` | `left_behind_count` |
| `return_checklist_done` | `unchecked_count` |
| `trip_repeated` | nenhuma |
| `coming_soon_tapped` | `feature` (`gear_inventory`, `menu_planner`) |
| `group_created`, `invite_shared` | `families` |
| `guest_joined`, `guest_claimed` | `installed_later` |
| `expense_added` | `catalog_key`, `amount_band` (uma das faixas `0-50`, `50-150`, `150-500`, `500-1500`, `1500+`, em reais; decidido em 27/11/2026), `split_rule` (`shares`, `per_family`, `adults_teens`) |
| `destination_set` | `camping_id` (UUID), `had_data` |
| `camping_not_found` | `city_code` (código do IBGE, 7 dígitos) |
| `alert_shown` | `fact_key`, `level` (`attention`, `adjustment`, `information`) |
| `adjustment_undone` | `fact_key`, `catalog_key` |
| `owner_questions_shared` | `facts_count` |
| `return_questions_answered` | `asked`, `answered` (0 a 4; `answered` não passa de `asked`), `anonymous` |
| `suggestion_sent` | `options_count`, `has_text` |
| `notification_opened` | `kind` (os nove avisos da SPEC, seção 10: `pack_reminder`, `eve_reminder`, `return_checklist`, `at_home`, `dry_tent`, `group_pending`, `group_change`, `repeat_trip`, `camping_news`) |

`catalog_key` e `fact_key` são identificadores: minúsculas, números e sublinhado, até 64 caracteres, começando por letra (por exemplo, `bateria_portatil`, `energia_voltagem`). Os valores em inglês das listas fechadas que a SPEC só nomeia em português são a tradução direta; veja as pendências.

**Forma de um evento guardado:** `{ id, nome, ocorridoEm, propriedades }`. `id` identifica o evento no aparelho (o envio em lote não duplica); `ocorridoEm` é o instante em UTC (`2026-11-26T15:00:00.000Z`).

**Validação** (`validarEvento`): o TypeScript já barra o erro de quem escreve o código; a validação em tempo de execução barra o resto (dado do armazenamento, de um lote, montado na hora).

- Nome de evento e propriedades são **fechados**: o que não está no catálogo é recusado.
- **Nenhum texto livre.** Texto só entra em formato fixo: lista fechada, identificador (`[a-z][a-z0-9_]{0,63}`), UUID, código do IBGE, resumo. Nome, e-mail, telefone, CPF, nome de camping, chave Pix e texto digitado não cabem em nenhuma propriedade. Nomes de propriedade típicos de dado pessoal (`email`, `nome`, `text`, `camping_name`, `pix_key`, `amount_cents`, ...) são recusados com a mensagem "proibida", para o motivo ficar claro.
- A resposta de erro **nunca repete o valor recusado** (ele pode ser um dado pessoal); diz só a propriedade e a regra.
- Inteiros fora dos limites e tipos errados (texto no lugar de número, objeto, lista, nulo, NaN) são recusados. Os limites (`nights` até 365, contagens até 9999) são só de sanidade, não regra de negócio.

**Dinheiro vira faixa** (`faixaDeValor`, `amount_band`): `faixaDeValor(42000)` dá `150-500` (em reais). O valor exato nunca entra no evento: o evento só aceita o nome de uma faixa, e a validação recusa `420,00` e `42000`. Cada faixa é fechada embaixo e aberta em cima: o valor igual ao limite cai na faixa de cima (R$ 150,00 vale `150-500`). **Os limites são configuração** (`ConfigDeFaixas`), recebidos por parâmetro; o padrão (`FAIXAS_PADRAO`) é a decisão do responsável de 27/11/2026 (veja a seção 7).

**Resumo irreversível do convite** (`resumoDoConvite`, `invite_token_hash`): SHA-256 do código do convite, em UTF-8, em 64 letras hexadecimais minúsculas, **sem sal** de propósito: o servidor (B5) calcula o mesmo resumo do código que ele guarda e a igualdade diz de qual convite veio a instalação (DAT-04). O código do convite é sorteado e longo, então o resumo não se desfaz por tentativa. A implementação é própria (sem dependência) porque o Hermes não traz o `crypto` do Node; um teste a compara com o SHA-256 do Node em textos de 0 a 200 caracteres, com acento e emoji, e com os vetores oficiais. **Para a B5:** use SHA-256 hexadecimal minúsculo do código exato, sem alteração.

**Usuário ativo (RET-09)** (`ehUsuarioAtivo`): verdadeiro se há `trip_created` ou `item_state_changed` entre `agora` menos 12 meses e `agora`, nas duas pontas incluídas. A data de 12 meses atrás mantém o dia e a hora (UTC); 29 de fevereiro vira 28. Evento depois de `agora` (relógio do aparelho que andou para trás) não conta. No aparelho a função enxerga só os eventos do próprio aparelho; a métrica do produto soma os eventos de todos os aparelhos no servidor, com a mesma regra.

**Funil (RET-10):** `app_opened`, `trip_created`, `item_state_changed` com `to_state` `in_car` ("está no carro"), `return_checklist_done` e `trip_created` com `from_previous` verdadeiro (a segunda viagem) cobrem os passos do funil. Instalações sem abertura vêm do relatório da loja (SPEC, seção 12).

**Origem (DAT-04):** `install_attributed` com `channel` e, quando veio de convite, `invite_token_hash`. **"Em breve" (DAT-05):** `coming_soon_tapped` com `feature` (`gear_inventory`, `menu_planner`): inventário de equipamento e cardápio.

## 4. Medição no app (`apps/mobile/src/medicao/`)

| Arquivo | O que é |
| --- | --- |
| `porta.ts` | `ArmazenamentoDeEventos`: `guardar`, `listarPendentes(limite)`, `marcarEnviados(ids)`, `contarPendentes` |
| `memoria.ts` | Implementação em memória (testes e referência de comportamento) |
| `registrador.ts` | `criarMedicao({ armazenamento, agora, gerarId, faixas?, canais?, aoRecusar? })` com `registrar(nome, propriedades)`, `faixaDe(centavos)` e `contarPendentes()` |

- `registrar` valida contra o catálogo antes de guardar: **evento inválido nunca chega ao armazenamento**.
- `registrar` **nunca lança erro**: devolve `{ ok: true, id }`, `{ ok: false, motivo: 'invalido', erros }` ou `{ ok: false, motivo: 'armazenamento' }`. Medir nunca derruba o app.
- Relógio e gerador de id entram por parâmetro (o teste fixa a hora; a jornada J3 adianta o relógio).
- **O que não está pronto, de propósito:** a implementação em SQLite liga na tabela local que a **B4** cria, numa tarefa de integração posterior (a porta já tem o formato que ela precisa: guardar, listar os mais antigos, apagar os enviados, contar). O envio em lote ao servidor é da **feature 2.2** e usa `listarPendentes` e `marcarEnviados`. Falta decidir, na integração, o tamanho máximo da fila de eventos no aparelho quando fica muito tempo sem internet.

## 5. Decisões técnicas da B6

| Decisão | Por quê |
| --- | --- |
| Textos em JSON, acesso por `textos.tela.chave` (tipado pelo próprio JSON) e por `t('tela.chave', { n })` | Mantém o formato da B1 (o Maestro e os testes da página já leem o JSON) e dá erro de compilação para chave errada, sem biblioteca nova |
| Mecanismo de interpolação e plural em `packages/core/src/formato/texto.ts`, usado pelo app e pela página | Um mecanismo só, testado uma vez; o pacote `core` não depende de tela |
| Plural pela chave `_um`, como pede o DESIGN, seção 10 | Português só distingue 1 de "o resto" (0 vai no plural), então basta uma chave extra |
| Sem `Intl` e sem `toLocaleString` | O Hermes no Android pode ter outro conjunto de dados de idioma; a saída precisa ser a mesma no aparelho, no servidor e no teste |
| Datas como texto `AAAA-MM-DD` | Dia de viagem não tem hora nem fuso; converter pelo fuso do aparelho mudaria o dia |
| Importar por subcaminho (`@campinguim/core/formato`, `@campinguim/core/eventos`), sem mexer em `packages/core/src/index.ts` | A B3 está mudando esse arquivo; o subcaminho evita conflito |
| Testes de `apps/*/src` rodam no projeto `core` do Vitest (`vitest.config.ts`) | O `npm run testar` já roda esse projeto; um projeto novo pediria mexer em `scripts/testar.mjs`, que não é desta tarefa |
| SHA-256 próprio, sem dependência | Hermes sem `crypto`; a regra precisa rodar igual no app, no servidor e no teste; verificada contra o Node |
| Catálogo de eventos como dados (`CATALOGO`) com os tipos derivados dele | Um lugar só define evento, propriedades, tipo e validação; o teste compara com a tabela da SPEC |

## 6. Arquivos compartilhados tocados

| Arquivo | Mudança |
| --- | --- |
| `vitest.config.ts` | O projeto `core` passa a incluir `apps/*/src/**/*.test.ts` |
| `packages/core/package.json` | Dois subcaminhos de exportação: `./formato` e `./eventos` |
| `apps/web/package.json` | Dependência de `@campinguim/core` (a página usa o mecanismo de textos) |
| `apps/mobile/src/textos/pt-BR.json` | Reescrito por tela. **A B2 acrescenta a chave `componentes`: não a remova no rebase.** Foram mantidas `app.nome` e `telaProvisoria.*` (roteiro de fumaça do Maestro) |
| `apps/web/src/textos/pt-BR.json` | Reescrito por tela. Foi mantido `pagina.*` (teste da página provisória) |

`apps/mobile/app/_layout.tsx` e `apps/mobile/app/index.tsx` **não foram alterados**: o acesso tipado funciona com a importação que já existia (`import { textos } from '../src/textos'`).

## 7. Pendências para o orquestrador

1. **Limites das faixas de valor (`amount_band`). Decidido pelo responsável em 27/11/2026.** A SPEC não os define. As faixas definitivas, em reais, são `0-50`, `50-150`, `150-500`, `500-1500` e acima de 1500 (`1500+`; a carne de R$ 420 da jornada J6 cai em `150-500`). O código recebe os limites por configuração; o lugar do valor continua sendo o padrão `FAIXAS_PADRAO`, em `packages/core/src/eventos/faixas.ts` (R$ 50, R$ 150, R$ 500 e R$ 1.500, em centavos `[5000, 15000, 50000, 150000]`). A marca de pendente saiu.
2. **Canais de origem (`channel` de `install_attributed`). Decidido pelo responsável em 27/11/2026.** Lista fechada, com códigos em inglês: `store` (loja), `invite` (convite), `site` (site), `social` (redes sociais) e `unknown` (não identificado). A lista vive em `CANAIS_PADRAO`, em `packages/core/src/eventos/catalogo.ts`, e a validação aceita outra lista por configuração (`canais`). A proposta antiga (`site_content`, `communities`, `creators`, `camping_poster`, `events`, `other`) foi descartada. A marca de pendente saiu.
3. **Códigos em inglês das listas fechadas que a SPEC só nomeia em português:** `origin` (`icon`, `notification`, `invite_link`), `level` (`attention`, `adjustment`, `information`), `feature` (`gear_inventory`, `menu_planner`) e os nove `kind` de aviso. Seguem o estilo do esquema de dados; confirmar ou trocar (a B5 precisa dos mesmos valores se o servidor validar o lote).
4. **Limites de sanidade** (`nights` até 365, `people` até 999, contagens até 9999, `asked` e `answered` até 4): não são regra de negócio, só barram valor absurdo. **Ficam como estão: decisão técnica da B6**, registrada como tal na validação da Base de 27/11/2026.
5. **Textos pendentes** da seção 8. **Decidido pelo responsável em 27/11/2026:** (a) os textos comuns `[PENDENTE]` são escritos por cada feature, que escreve os seus, e o responsável revisa na validação da etapa; (b) os **textos legais** (consentimento, política de privacidade, termos de uso; PRV-04) têm rascunho preparado por um ajudante, marcado como rascunho, e o responsável revisa com quem de direito, até a etapa 3; (c) o rótulo do **botão de login com Google** é "Continuar com o Google" (`entrar.comGoogle`, já aplicado). Registro em `docs/decisoes-da-base.md`.
6. **Fila de eventos no aparelho:** tamanho máximo e o que fazer quando passa dele (ficou muito tempo sem internet). **Fica como está: decisão técnica da B6** (registrada na validação da Base de 27/11/2026); a integração com a B4 e o envio ficam na feature 2.2.

## 8. Textos pendentes

Chaves cujo texto ainda não existe na SPEC, no protótipo nem no PRD. O valor no arquivo começa por `[PENDENTE]`. Um teste confere que esta lista e o arquivo dizem a mesma coisa.

### Pendentes do app

Arquivo `apps/mobile/src/textos/pt-BR.json`. Total: 54 chaves.

| Chave | O que falta |
| --- | --- |
| `lista.vazia` | Texto da lista sem nenhum item, com a ação clara (SPEC, seção 7, estado vazio) |
| `item.motivoGerado` | Frase que mostra o motivo de um item gerado estar na lista (E1-04), com o dado que o gerou |
| `adicionarItem.titulo` | Título da tela de adicionar item (busca no catálogo e texto livre) |
| `adicionarItem.busca` | Texto do campo de busca no catálogo |
| `adicionarItem.textoLivre` | Ação de criar um item com o texto digitado |
| `adicionarItem.sugestoes` | Título das sugestões de itens do catálogo que não estão na lista |
| `novaViagem.repetirAUltima` | Ação de repetir a última viagem (E1-12) |
| `novaViagem.modelosSalvos` | Título dos modelos salvos (E1-12) |
| `novaViagem.oQueMudou` | Frase do que mudou por aprendizado da viagem anterior (E1-12) |
| `emBreve.inventario` | Nome da função futura inventário de equipamento (DAT-05) |
| `emBreve.cardapio` | Nome da função futura cardápio (DAT-05) |
| `emBreve.mensagem` | Mensagem curta que aparece quando a pessoa toca numa função em breve (SPEC, seção 7) |
| `estadosGerais.vazio` | Texto padrão de tela vazia com ação clara (SPEC, seção 7, estados que toda tela trata) |
| `estadosGerais.semInternet` | Uma linha para dizer que a função precisa de internet (SPEC, seção 7) |
| `estadosGerais.aguardandoEnvio` | Indicador discreto de itens aguardando envio, com a contagem {n} |
| `estadosGerais.erro` | Mensagem de erro em português simples, com o que a pessoa pode fazer |
| `notificacoes.permissao.titulo` | Título da tela que explica o motivo antes do pedido de permissão de notificação (RET-03) |
| `notificacoes.permissao.motivo` | Texto que explica o motivo do pedido de permissão de notificação (RET-03) |
| `ajustesDoApp.titulo` | Título da área de ajustes |
| `ajustesDoApp.conta` | Item de ajustes: conta |
| `ajustesDoApp.notificacoes` | Item de ajustes: notificações (três chaves: lembretes de viagem, avisos de grupo, avisos de reativação, RET-08) |
| `ajustesDoApp.privacidade` | Item de ajustes: privacidade |
| `ajustesDoApp.sobre` | Item de ajustes: sobre |
| `legal.consentimento` | Texto de consentimento: vem de pessoa habilitada (PRV-04), nunca escrito pelo desenvolvimento |
| `legal.politicaDePrivacidade` | Política de privacidade: vem de pessoa habilitada (PRV-04), nunca escrita pelo desenvolvimento |
| `legal.termosDeUso` | Termos de uso: vêm de pessoa habilitada (PRV-04), nunca escritos pelo desenvolvimento |
| `entrar.titulo` | Título da tela de entrar (E2-16) |
| `entrar.motivo` | Frase que diz por que o login é pedido neste momento (organizar grupo, lançar gasto, cadastrar Pix, confirmar fato) |
| `transformarEmGrupo.titulo` | Título da tela de transformar em grupo (E2-01) |
| `transformarEmGrupo.nomeDoGrupo` | Rótulo do campo nome do grupo |
| `transformarEmGrupo.familias` | Rótulo das famílias |
| `transformarEmGrupo.gerarConvite` | Ação de gerar o link de convite |
| `convidarFamilia.titulo` | Título da tela de convidar para a minha família (E2-18) |
| `convidarFamilia.explicacao` | Frase que explica que quem entra vê a mesma lista pessoal |
| `pagar.titulo` | Título da tela de pagar (E2-14) |
| `pagar.soParaMembros` | Aviso de que a chave Pix só aparece para membros da viagem |
| `historicoDoGasto.titulo` | Título do histórico do gasto (E2-15) |
| `historicoDoGasto.linha` | Frase de cada alteração: autor, data e valor anterior |
| `conta.titulo` | Título da tela de conta (E2-17) |
| `conta.nomeDeExibicao` | Rótulo do nome de exibição |
| `conta.apelido` | Rótulo do apelido |
| `conta.excluirConta` | Ação de excluir a conta, com a confirmação em dois passos (PRV-05) |
| `conta.exportarDados` | Ação de exportar os dados (PRV-05) |
| `escolherDestino.titulo` | Título da tela de escolher destino (E3-01) |
| `escolherDestino.busca` | Texto do campo de busca por nome |
| `escolherDestino.naoAchei` | Ação não achei, criar (E3-02) |
| `escolherDestino.eEste` | Pergunta é este? com os campings parecidos (E3-20) |
| `alertas.naoConfirmado` | Aviso de fato não confirmado, que aparece como informação (SPEC, seção 5) |
| `registrarRespostasDoCamping.titulo` | Título da tela de registrar respostas do camping (E3-11) |
| `registrarRespostasDoCamping.origem` | Texto da origem informado pelo camping |
| `perguntasDaVolta.responderComoApelido` | Opção de responder com apelido |
| `perguntasDaVolta.responderComoAnonimo` | Opção de responder como anônimo (E3-13) |
| `mesmoLugar.titulo` | Título da tela é o mesmo lugar (E3-23) |
| `mesmoLugar.acao` | Ação de sinalizar dois campings como o mesmo |

### Pendentes da página web

Arquivo `apps/web/src/textos/pt-BR.json`. Total: 5 chaves.

| Chave | O que falta |
| --- | --- |
| `convite.linkVencido` | Mensagem clara de link de convite vencido (E2-02) |
| `convite.linkRevogado` | Mensagem clara de link de convite revogado (E2-02) |
| `listaDoGrupo.precisaDeInternet` | Uma linha que diz que a lista do grupo só funciona com internet (SPEC, seção 7) |
| `site.consentimento` | Texto legal (V6): o arquivo tem um **rascunho marcado como rascunho**, escrito pela 1.12 a partir da decisão do piloto (um único aviso por e-mail, quando o app estiver na loja). Falta a revisão do responsável com quem de direito. Enquanto for rascunho, o formulário só funciona no ambiente local (`formularioLiberado`, `apps/web/src/site/listaDeEspera.ts`) |
| `site.politicaDePrivacidade` | Texto legal (V6): **rascunho marcado como rascunho** da 1.12, que a página ainda não mostra (P-18: sem link de política até o texto ser aprovado). Faltam o prazo de guarda e a forma de pedir a saída da lista (decisão do responsável) e a revisão com quem de direito |
