# Servidor do Campinguim: esquema, autorização e sincronização

Feature **B5** (26/11/2026). Cobre a SPEC, seções 3 e 11, e a parte de servidor das seções 4, 6, 8 e 13. Tudo aqui roda no ambiente local em Docker da B1 (`docs/desenvolvimento.md`); nenhum serviço externo foi criado.

| Onde | O quê |
| --- | --- |
| `supabase/migrations/20261126190000_b5_viagem_e_lista.sql` | Viagem e lista: `profile`, `trip`, `trip_family`, `trip_person`, `trip_member`, `trip_item`, `item_claim`, `trip_camping_snapshot`, `invite`; funções de apoio às políticas; perfil criado no primeiro login |
| `supabase/migrations/20261126190100_b5_gastos.sql` | Gastos: `expense`, `expense_exclusion`, `expense_payment`, `expense_audit`, `pix_key` |
| `supabase/migrations/20261126190200_b5_campings.sql` | Campings, só no servidor: `city`, `camping`, `camping_alias`, `fact_report`, `fact_summary`, `suggestion`, `merge_candidate`, `list_feedback` |
| `supabase/migrations/20261126190300_b5_apoio.sql` | Apoio: `device`, `event`, `config` (com as premissas); verificação do aparelho (esboço); exclusão de conta |
| `supabase/migrations/20261126190400_b5_sync_apply.sql` | `public.sync_apply`: aplica as alterações vindas do aparelho |
| `supabase/sincronizacao/powersync/sync-config.yaml` | Regras de sincronização: o que cada aparelho recebe |
| `supabase/dados-de-exemplo/` | Dados das jornadas (família da Carla, grupo de três famílias) e o ajuste do ambiente local |
| `supabase/functions/_compartilhado/contratos.ts` | Lista dos contratos da seção 8: de que feature é cada função e o que já existe |
| `supabase/testes/` | Testes do servidor (seção "Testes" abaixo) |

## 1. Requisitos do PRD cobertos

| ID | Requisito | Critério de aceite (PRD) | Onde |
| --- | --- | --- | --- |
| NF-10 | Comunicação cifrada, acesso por menor privilégio, registros sem dados pessoais | Cada usuário só acessa as próprias viagens e as viagens de grupo em que está. Verificado por testes de autorização | Políticas, `sync_apply`, regras de sincronização; testes dos grupos 1 a 4 |
| DEF-01 | A base de campings nunca é entregue em massa. O app recebe a ficha só do camping escolhido pelo usuário | Não existe chamada que liste campings com suas fichas; a busca devolve só nome e cidade | Tabelas de camping sem política, sem privilégio e fora da publicação; nenhuma função de listagem |
| DEF-05 | Regras de ajuste da lista pela ficha e ajustes por aprendizado rodam no servidor | O aparelho guarda só o resultado para as viagens do usuário, não as regras completas | Só `trip_camping_snapshot` vai ao aparelho; `fact_summary`, `list_feedback` e regras ficam no servidor |
| DEF-08 | Identificadores aleatórios, nunca sequenciais | Não é possível percorrer campings, viagens ou usuários somando 1 a um número | Todo `id` é UUID v4 (`gen_random_uuid`); o único número sequencial (`private.sync_change.arrival`) fica em esquema que a API não expõe |
| DEF-09 | Nenhuma chave ou segredo dentro do app | A inspeção do pacote não revela credenciais. Tudo o que exige segredo passa pelo servidor | Nenhum segredo no repositório; a chave de serviço só em `.env.local`; o app só tem papel `authenticated` |
| DEF-11 | O aparelho guarda só as viagens do próprio usuário, em armazenamento cifrado | Nenhum dado de outro camping ou de outro usuário fica no aparelho | Parte do servidor: regras de sincronização só entregam viagens de que a pessoa é membro ativo (teste do grupo 2). A cifra no aparelho é da B4 |
| PRV-01 | Coletar o mínimo: nome de exibição, e-mail do login, contagem de pessoas por faixa etária. Sem CPF, sem telefone, sem nomes de crianças obrigatórios | Nenhuma tela pede esses dados | Nenhuma coluna de CPF, telefone ou endereço; `trip_person.label` é opcional |
| PRV-02 | Não coletar localização na versão 1 | O app não pede permissão de localização | Nenhuma coluna de localização no esquema |
| PRV-06 | Chave Pix visível só para membros da mesma viagem | A chave não aparece em nenhuma outra tela ou chamada | Política de `pix_key`; fora da publicação; `sync_apply` recusa escrita |
| FRD-01 | Confirmação exige conta, viagem registrada para aquele camping e data de volta passada | Sem os três, a pergunta nem é exibida | Estrutura: `fact_report.trip_id`, `trip.camping_id`, `trip.end_date`; a regra é da feature 3.5 e 3.7 |
| FRD-02 | A viagem precisa ter sinais de uso real: criada antes da data de ida e com itens marcados | Viagem criada depois da data de ida não gera confirmação | Estrutura: `trip.created_at` (carimbo do servidor), registro de chegada das alterações (`private.sync_change`); regra na 3.7 |
| FRD-03 | Uma confirmação por fato por viagem; no máximo 2 viagens por mês para o mesmo camping contam por conta | O excedente é guardado, mas não conta | Índice único `fact_report (trip_id, fact_key)`; coluna `counts`; limite em `config` |
| FRD-04 | Verificação do aparelho (mesma do DEF-04) | Confirmação sem atestado válido é recusada | `device`, `device_register` (esboço) e `private.device_is_verified` (seção 6 abaixo) |
| FRD-05 | Reter para revisão picos anormais | As confirmações retidas não aparecem até serem liberadas por uma pessoa | Coluna `fact_report.held`; limiares em `config`; regra na 3.7 |

## 2. Esquema

Regras gerais (SPEC, seção 3), em todas as tabelas: identificador UUID v4; dinheiro em centavos inteiros (`integer`); datas de viagem como `date` (data local, sem hora); carimbos como `timestamptz` (UTC); nada se apaga de verdade em tabela sincronizada (`deleted_at`); `updated_at` e `updated_by` em todo registro sincronizado, sempre preenchidos pelo servidor.

Os nomes e os campos são os da SPEC, seção 3. **Campos técnicos** acrescentados (o B4 precisa criar os mesmos no banco do aparelho):

| Tabela | Campo técnico | Por quê |
| --- | --- | --- |
| Todas as sincronizadas | `created_at`, `updated_at`, `updated_by`, `deleted_at` | Regras gerais da seção 3; `trip.created_at` é usado pelo FRD-02 |
| `item_claim`, `expense_exclusion`, `expense_payment`, `expense_audit` | `id` | O PowerSync exige um `id` por linha |
| `trip_person`, `item_claim`, `expense_exclusion`, `expense_payment`, `expense_audit` | `trip_id` | Copiado do pai pelo servidor, para as políticas e as regras de sincronização filtrarem por viagem |
| `trip_camping_snapshot` | (nenhum) | No aparelho, o `id` da linha é o próprio `trip_id` (a regra de sincronização faz `trip_id AS id`) |
| `device` | `profile_id` | Ponto J4: a marca de aparelho verificado é da instalação e da conta |
| `camping_alias`, `merge_candidate`, `list_feedback` | `id` | Chave da linha (não vão ao aparelho) |

**Campos pedidos pela B3** (motor de regras; lista em `docs/regras.md` da B3, seção 6, "Campos que o modelo de dados precisa"). Mesmos nomes e regras; o B4 cria os mesmos no aparelho:

| Tabela | Campo | Regra no servidor |
| --- | --- | --- |
| `trip` | `created_at` | Já existia. Vem do aparelho (hora da criação), nunca no futuro; sem valor, a hora do servidor. A hora de chegada ao servidor fica em `private.sync_change` (ver decisão 9) |
| `trip` | `destination_name` | Texto, nulo. Destino sem camping do servidor (E1-13); só o organizador muda |
| `trip_item` | `item_ref` | Texto, não nulo. Sem valor, o servidor aplica a regra da B3 (`<catalog_key>@<família ou grupo>`, `ajuste:...`, ou o próprio `id`). Único por viagem entre os itens vivos; não muda depois de criado |
| `trip_item` | `qty_edited`, `qty_per_person`, `detail_qty`, `detail_unit` (`litro`, `metro`; preenchido junto com `detail_qty`) | Vale a última a chegar |
| `trip_item` | `learning_kind` (`missing`, `reduced`, `flagged`), `learning_qty_before`, `learning_percent` (1 a 99; os dois só com `reduced`) | Vale a última a chegar |
| `trip_item` | `category`, `unit` | Agora só chaves do catálogo (`itens.json`): 11 categorias e 9 unidades |
| `trip_camping_snapshot` | `undone_adjustment_ids` | Lista de texto. O membro muda pela sincronização (E3-08, A6); vale a última a chegar |
| `fact_summary` | `confirmed` | Lógico, padrão falso. Só no servidor |
| `merge_candidate` | `merge_record` | JSON, nulo. Só no servidor |

Escolhas de tipo onde a SPEC não diz:

- `trip_item.qty` é `numeric` e aceita nulo (os itens-tarefa do catálogo, "tarefa: conferir", não têm quantidade).
- `trip_camping_snapshot.rules_ack_at` é um mapa `{regra: carimbo UTC}` (`jsonb`), porque o "ciente" é por regra (E3-07).
- `trip_member.family_id` e `trip_member.display_name` aceitam nulo só enquanto a viagem enviada no primeiro login ainda não subiu a família e o nome (seção 4 abaixo).
- Limites de tamanho de texto (nome do item até 120, nota até 500, nome de família até 80) são técnicos, para um dado absurdo ser recusado como inválido. Não são regra de produto.
- `pix_key.key_type`, `camping.status`, `merge_candidate.status`, `fact_report.value`, `occasion` e `trip_kind` ficam sem lista fechada: a SPEC não dá os valores em código. As features 2.9, 3.1 e 3.2 fecham.

### O que chega ao aparelho

Sincronizam (publicação `powersync` e regras de sincronização): `profile` (só o próprio), `trip`, `trip_family`, `trip_person`, `trip_member`, `trip_item`, `item_claim`, `trip_camping_snapshot`, `expense`, `expense_exclusion`, `expense_payment`, `expense_audit`.

Nunca vão: `invite`, `pix_key`, `city`, `camping`, `camping_alias`, `fact_report`, `fact_summary`, `suggestion`, `merge_candidate`, `list_feedback`, `device`, `event`, `config` e o esquema `private`.

## 3. Autorização (SPEC, seção 11)

O papel do app é `authenticated` (com login). Quem não tem login (`anon`) não tem privilégio em nenhuma tabela nem função da aplicação.

| Dado | Quem lê (política) | Quem escreve (dentro de `sync_apply`, ou política onde indicado) |
| --- | --- | --- |
| Viagem, famílias, pessoas, membros, itens do grupo, marcações, retrato | Membros ativos da viagem | Membros. Dados da viagem (`trip`), membros (remover, papel, nome) e tirar uma família: só o organizador. A família de um membro só é preenchida quando está vazia (ninguém se muda para outra família, nem o organizador). Marcação: sempre em nome da própria família; desfazer, só a família que marcou. Retrato: o membro só marca "ciente" e muda a lista de ajustes desfeitos |
| Itens pessoais de uma família (`trip_item.family_id` preenchido) | Membros ativos daquela família | Membros daquela família, inclusive na criação (o `family_id` mandado pelo aparelho é conferido) |
| Gastos (`expense`, `expense_exclusion`, `expense_payment`, `expense_audit`) | Membros ativos da viagem | Gasto e exclusões: comprador (membro da família compradora) e organizador. "Paguei": só membro da família devedora (seção 8, `expense_mark_paid`). Histórico: só o servidor |
| Chave Pix | O dono, e membros ativos de viagem em que a família do dono é compradora (política) | O dono (política) |
| Perfil | A própria pessoa | A própria pessoa (nome, apelido, "anônimo por padrão"; o canal de origem é gravado uma vez) |
| Convite | Ninguém diretamente (funções da seção 8) | Funções da seção 8 |
| Campings, relatos, resumos, sugestões, insumo do aprendizado | Ninguém diretamente | Funções da seção 8 |
| Eventos, `config`, fila de fusão, aparelho | Só operação interna | Só operação interna |

Como isso está montado:

- **RLS ativo em todas as 27 tabelas**, na mesma migração que cria cada uma. As tabelas protegidas (convite, campings, relatos, resumos, sugestões, fila de fusão, insumo do aprendizado, aparelho, eventos, `config` e as duas do esquema `private`) não têm **nenhuma** política e não têm privilégio para `anon` nem `authenticated`.
- **Leitura:** uma política de `SELECT` por tabela sincronizada, para `authenticated`, com os predicados `private.is_trip_member`, `private.is_family_member` e `private.can_read_pix_key` (funções `SECURITY DEFINER` no esquema `private`, que a API não expõe).
- **Escrita:** o app não escreve direto em nenhuma tabela sincronizada (o privilégio de `INSERT`, `UPDATE` e `DELETE` é retirado). Toda escrita passa por `sync_apply`, que aplica as regras de conflito da seção 4 e confere o "quem escreve" desta tabela por alteração (ponto J2 da prova). A única escrita direta é a da chave Pix, pelo dono, protegida por política.
- **Membro** é sempre membro ativo (`trip_member.deleted_at` nulo) com conta. Quem é removido perde leitura, escrita e sincronização de tudo da viagem (S10).

## 4. Aplicação das alterações do aparelho (`public.sync_apply`)

Chamada pelo conector do PowerSync no app (`uploadData`), com o login da pessoa: `rpc('sync_apply', { p_changes: [...] })`.

**Entrada.** Uma lista de até 500 alterações. Cada uma:

```json
{ "change_id": "uuid gerado no aparelho", "table": "trip_item", "op": "PUT | PATCH | DELETE",
  "id": "uuid da linha", "data": { "colunas": "novas" }, "prev": { "colunas": "anteriores" } }
```

- `PUT` traz a linha inteira (criação); `PATCH` só as colunas que mudaram; `DELETE` vira exclusão lógica.
- `prev` são os valores anteriores no aparelho (`previousValues` do PowerSync). **O app precisa ligar `trackPrevious` na tabela `trip_item`** para o servidor reconhecer estado de separação concorrente (S3). Sem `prev`, a alteração vale como veio.
- Booleanos podem vir como `0`/`1` e colunas JSON como texto (é assim que o SQLite guarda).

**Saída.** Uma lista com um resultado por alteração, na mesma ordem:

| `status` | `reason` | Significado | O que o app faz |
| --- | --- | --- | --- |
| `applied` | — | Aplicada. `outcome` pode trazer avisos: `pack_state: concurrent_won/concurrent_lost`, `overwritten: [campos]` (item do grupo), `edit_on_removed`, `claim: already_claimed`, `member: merged`, `payment: merged`, `trip: created` | Tira da fila |
| `rejected` | `not_member` | Autorização: não é membro ativo da viagem | Tira da fila, desfaz a cópia local e avisa (seção 4, "Escrita recusada") |
| `rejected` | `not_allowed` | Autorização: é membro, mas sem direito àquela escrita | Idem |
| `rejected` | `validation` | Dado inválido (`detail` traz `sqlstate`, `constraint` e `column`, nunca o valor) | Idem |
| `rejected` | `not_found` | Alteração sobre linha que não existe | Idem |
| `duplicate` | — | O `change_id` já chegou antes. `first_status` e `first_reason` repetem o primeiro veredito | Tira da fila |

**Um dado inválido nunca trava a fila (J1).** Cada alteração roda num bloco próprio: erro de dado (classes 22 e 23 do Postgres e as validações da função) desfaz só aquela alteração e vira `validation`; as outras do lote seguem. O lote inteiro só falha sem login (`28000`), com lote que não é lista ou com mais de 500 alterações (`22023`), ou com erro passageiro do banco (bloqueio, falta de recurso), que não é do dado e deve ser reenviado (a repetição é segura).

**Regras de conflito (seção 4).** O relógio do aparelho não decide nada: `updated_at`, `updated_by`, `deleted_at`, o "paguei" e o "ciente" levam o carimbo do servidor.

| Dado | Regra aplicada |
| --- | --- |
| `pack_state` | Alteração feita sobre um valor que já mudou no servidor (`prev` diferente do atual) fica com o mais avançado: `in_car` > `set_aside` > `todo`. Sobre o valor atual, vale o que veio (desmarcar é possível) |
| `item_claim` | Uma linha por família; duas famílias no mesmo item ficam as duas. A mesma família duas vezes vira uma só (`already_claimed`) |
| Quantidade, nome, nota e os demais campos do item | Vale a última a chegar. Em item do grupo, `outcome.overwritten` diz quais campos foram sobrescritos (ver pendência 1) |
| Removido e editado ao mesmo tempo | Vence a remoção (`removed` e `deleted_at`): editar não desfaz; o valor editado fica guardado. Restaurar só por `PATCH` explícito com `removed = false` ou `deleted_at = null`; uma linha inteira reenviada (`PUT`) nunca restaura |
| Dois itens novos com o mesmo nome | Ficam os dois |
| Valor e regra do gasto | Aplicados em sequência; cada mudança de `estimate_cents`, `amount_cents` ou `split_rule` vira uma linha em `expense_audit` (autor = linha de membro de quem mudou), inclusive os valores iniciais na criação |
| "Faltou", "sobrou" e estados da volta | Vale a última a chegar |
| Repetição | O `change_id` é guardado em `private.sync_change` antes de aplicar; repetido, nada se aplica de novo |

**Viagem que sobe no primeiro login (E1-14, S9).** Uma viagem nova (`PUT` em `trip`) cria o dono (quem enviou) e a linha de membro organizador no servidor. A primeira família enviada liga essa linha de membro, se ela ainda não tem família (viagem de família única, ou a família marcada `is_organizer`). Se o aparelho mandar a própria linha de organizador, ela é juntada à que o servidor criou (`member: merged`), sem duplicar. Depois disso, pessoas e itens da família sobem normalmente. A viagem de outra pessoa nunca é tomada por quem manda o mesmo identificador.

**O que é do servidor e o aparelho não muda por aqui:** o dono da viagem, `trip.camping_id` (só por `trip_set_camping`, seção 8), o retrato do camping (o aparelho só marca "ciente"), `trip_id` e `family_id` depois de criados, a família compradora do gasto, o histórico do gasto, o convite e a chave Pix.

**Registro sem texto livre.** `private.sync_change` guarda só identificadores, tabela, operação, veredito e avisos; nunca o conteúdo da alteração (seção 11, "Privacidade").

## 5. Regras de sincronização (`supabase/sincronizacao/powersync/sync-config.yaml`)

Segunda barreira: o PowerSync lê o banco sem RLS. Três fluxos, todos assinados automaticamente:

- `meu_perfil`: o próprio `profile`.
- `minhas_viagens`: `trip`, `trip_family`, `trip_person`, `trip_member`, `item_claim`, `trip_camping_snapshot`, `expense`, `expense_exclusion`, `expense_payment`, `expense_audit` das viagens em que a pessoa é membro ativo.
- `meus_itens`: itens do grupo dessas viagens e itens pessoais só das famílias da pessoa.

Linhas com `deleted_at` continuam indo, para o aparelho saber da remoção e poder restaurar. Quem sai da viagem deixa de receber tudo dela e a cópia no aparelho é retirada.

## 6. Verificação do aparelho (esboço; SPEC, seção 11; DEF-04, FRD-04)

- `public.device_register(install_id, platform, proof)` (exige login): registra a instalação e renova a marca de verificado. Devolve `{ok: true, verified_until}` ou `{ok: false, code: 'integrity_required' | 'validation'}`.
- A marca vale para o par **instalação + conta** (J4): outra conta no mesmo `install_id` não herda a marca, e registrar a instalação com outra conta apaga a marca anterior. Validade em `config` (`device.verified_validity_hours`, 24 h, provisória até a F0-6).
- `private.device_is_verified(install_id)`: o que as funções `trip_set_camping` e `submit_fact_reports` (3.3, 3.5, 3.7) vão consultar.
- **Prova de desenvolvimento** (`{"kind": "dev"}`): aceita só com `private.server_setting` marcado `environment = local` **e** `accept_dev_device_proof = true`. As migrações deixam essa tabela vazia, isto é, em produção fica desligada. Só os dados de exemplo do ambiente local (`supabase/dados-de-exemplo/000-ambiente-local.sql`) ligam, e o `supabase db push` de produção não aplica dados de exemplo. Testes: `supabase/testes/aparelho.test.ts` (tabela vazia recusa; chave ligada fora do ambiente local recusa; nenhuma migração liga).
- **Prova real** (Play Integrity): ainda recusada aqui. A feature 3.7 valida com o Google numa função do servidor em TypeScript e chama `private.mark_device_verified`. A função da prova técnica não foi copiada.

## 7. Exclusão de conta (SPEC, seção 3)

Apagar o usuário do login apaga `profile` (cascata) e com ele `pix_key`. Antes, o gatilho `private.anonymize_deleted_profile` troca o nome em `trip_member` por "participante" e solta a conta, e deixa os relatos de `fact_report` anônimos. As demais referências à pessoa ficam nulas pelas chaves estrangeiras. Os valores do grupo (gastos, marcações) ficam. A função `account_delete` (seção 8) é da feature 2.11.

## 8. Premissas em `config`

40 chaves, todas tiradas do PRD (seção 16) e da SPEC (seções 5, 6, 8, 10, 11 e 15); a lista com a origem de cada uma está na migração `20261126190300_b5_apoio.sql`. Mudam sem nova versão do app. Ficam de fora, à espera das listas da SPEC, seção 15: feriados nacionais, períodos de férias e operadoras de celular. As fórmulas de quantidade ficam no catálogo (B3).

## 9. Dados de exemplo (SPEC, seção 13)

Carregados por `npm run ambiente:zerar` (o Supabase local aplica `supabase/dados-de-exemplo/*.sql` depois das migrações, em ordem):

| Arquivo | O que tem |
| --- | --- |
| `000-ambiente-local.sql` | Liga a prova de desenvolvimento do aparelho, só no ambiente local |
| `010-familia-da-carla.sql` | Carla (conta de teste, sem senha), a viagem de referência (barraca com carro, 2 noites, frio, sem chuva, sem datas), a família "Carla e Rafael" com 2 adultos, 2 crianças (Lucas e Bia) e 1 pet |
| `030-campings.sql` | Os campings (nomes fictícios, cidades reais com o código do IBGE: São Tomé das Letras, MG, 3165206; Cunha, SP, 3513603). Camping Recanto das Águas com 7 relatos de 7 contas fictícias em 7 viagens encerradas, que reproduzem o retrato de referência da seção 9 (cada fato confirmado por 2 contas ou mais e recente; "som cumprido" 6 vezes "sim", a última da Carla em novembro de 2026) e respeitam FRD-01, FRD-02, FRD-03 e FRD-05. Sítio Pedra Lisa sem relato (o camping sem dados). Liga o destino das duas viagens da Carla ao Recanto. O resumo (`fact_summary`) e o retrato das viagens não entram: são calculados pelas features 3.2 e 3.3 |
| `020-grupo-de-tres-familias.sql` | Viagem de grupo "Viagem de Carla ao Camping Recanto das Águas": Carla organizadora, Bruno membro, Diego convidado sem conta; famílias com as pessoas do caso C1 (meias cotas 6, 4 e 4); isqueiro e saco de lixo sem dono, fogareiro assumido pelas três famílias, carne de Bruno com o gasto de R$ 420,00 (regra de cotas) e a chave Pix de Bruno do protótipo |

Os dados vêm de `design/prototipos/_compartilhado/dados.js`; os nomes são fictícios e os e-mails estão no domínio reservado `@pessoas-de-teste.test`. Nenhum camping real é retratado. Não entram os itens da lista da Carla (gerados no aparelho pela B3 e pela feature 1.2).

## 10. Testes

Rodam contra o ambiente local (`npm run ambiente:subir` ou `ambiente:zerar` antes). Na suíte: `npm run testar` (etapa "Testes do servidor"). Só o servidor: `npx vitest run --project servidor`.

| Arquivo | O que prova |
| --- | --- |
| `rls.test.ts` (grupo 1) | Toda tabela tem RLS; nenhuma protegida tem política; as políticas são exatamente as esperadas; `anon` sem privilégio; `authenticated` só lê as sincronizadas; publicação só com as sincronizadas; controle negativo |
| `sincronizacao.test.ts` (grupo 2) | Com login real e o fluxo do PowerSync: membro de W não recebe nada de V; membro de V recebe as 12 tabelas sincronizadas; item pessoal de outra família não chega; nada protegido chega; removido deixa de receber (S10) |
| `autorizacao-por-linha.test.ts` (grupo 3, NF-10) | Uma tentativa de acesso indevido por linha da tabela de autorização, pela leitura (RLS) e pela escrita (`sync_apply` e escrita direta), cada uma com um controle de quem pode |
| `sync-apply.test.ts` (grupo 4) | Lote misto (válida, inválida e não autorizada); J1 (15 tipos de dado inválido); J2 (família conferida); regras de conflito S2 a S6, S9 e S10; campos do servidor; campos da B3 |
| `aparelho.test.ts` | Prova de desenvolvimento só local; desligada em produção; marca por instalação e conta (J4); validade |
| `exclusao-de-conta.test.ts` | Exclusão de conta da seção 3 |
| `dados-e-config.test.ts` | Premissas em `config` e dados de exemplo |
| `contratos.test.ts` | A lista de contratos bate com a seção 8 e com o banco |
| `ambiente.test.ts`, `autorizacao.test.ts` | Da B1: ambiente no ar, migrações aplicadas, cadastro aberto desligado, `anon` sem tabela na API |

Os testes dos grupos 1, 3 e 4 rodam cada caso numa transação desfeita no fim (`supabase/testes/apoio-banco.ts`), agindo como a API age (`set role authenticated` e o token em `request.jwt.claims`). O grupo 2 cria pessoas com senha aleatória só na memória do teste e apaga tudo no fim.

## 11. Decisões desta feature

1. **Escrita só por `sync_apply`, leitura por política.** Toda tabela sincronizada é só leitura direta para o app; a escrita passa pela função, que aplica as regras de conflito e a autorização por alteração (J1, J2). Assim não há caminho que pule as regras da seção 4.
2. **"Paguei" pela família devedora**, como diz a seção 8 (`expense_mark_paid`), e não "comprador e organizador" da linha geral de gastos da seção 11, porque a marcação é de quem deve.
3. **Organizador criado pelo servidor** ao receber uma viagem nova, e ligado à primeira família; a linha que o aparelho mandar é juntada a ela. Evita viagem órfã, que ninguém conseguiria ler nem sincronizar.
4. **Família compradora, `trip_id` e `family_id` não mudam** depois de criados (mudança vira `validation`). Mudar quem recebe o dinheiro ou mover item entre famílias fica para uma função própria, se a feature precisar.
5. **Marca do aparelho por instalação e conta** (`device.profile_id`), e `device_register` só com login. O destino sem conta (PRD, seção 16) fica para a 3.7.
6. **Prova de desenvolvimento ligada por dado de exemplo**, não por migração nem por variável de ambiente: o banco de produção nasce só das migrações e fica desligado por construção.
7. **Registro das alterações sem conteúdo**: nada de nome, nota ou valor no registro do servidor.
8. **Convite sem política e fora do aparelho**: só pelas funções da seção 8 (2.4).
9. **Data de criação da viagem vem do aparelho** (pedido da B3: viagem feita sem conta sobe dias depois e precisa da data real), limitada a "agora". Atenção para a 3.7: o antifraude FRD-02 usa `trip.created_at`, e o relógio do aparelho pode ser adiantado ou atrasado. A hora de chegada ao servidor de cada alteração está guardada em `private.sync_change` (`received_at`, `row_id` = id da viagem), para a 3.7 decidir qual das duas vale. Confirmado pelo orquestrador em 26/11/2026.
10. **Ninguém muda de família pela sincronização** (nem o organizador muda a família de quem já tem uma): mudar de família daria acesso aos itens pessoais da outra. Entrar numa família é pelo convite para a mesma família (E2-18).

## 12. Pendências

**De acordo do responsável em 27/11/2026** (validação da Base; `docs/decisoes-da-base.md`, V8): o histórico do item do grupo adiado para a 2.2 (item 1) e as listas fechadas do item 2 (tipos de chave Pix, `camping.status`, `merge_candidate.status`, opções dos fatos, `occasion` e `trip_kind`), que as features 2.9, 3.1 e 3.2 fecham.

1. **Histórico do item do grupo: fica para a feature 2.2** (decisão do orquestrador de 26/11/2026, registrada na SPEC, seção 15). A seção 4 diz que o valor perdido em item do grupo "aparece no histórico do item", mas a seção 3 não tem tabela para isso. Até a 2.2, `sync_apply` só devolve os campos sobrescritos (`outcome.overwritten`), sem guardar os valores (registro sem texto livre); nenhuma tabela `trip_item_history` foi criada.
2. **Valores fechados que a SPEC não dá em código** (aceito pelo orquestrador; as features 2.9, 3.1 e 3.2 fecham): tipos de chave Pix, `camping.status`, `merge_candidate.status`, valores das opções de cada fato, `occasion` e `trip_kind`. Nos dados de exemplo, as opções dos fatos usam os códigos do motor da B3 (`220v`, `longe`, `11_a_25`, `area_comum`, `22h`...), a ocasião usa `feriado`, `ferias` e `fim_de_semana` (os da B3) e o tipo de viagem usa códigos provisórios (`familia_com_criancas`, `casal`, `grupo`, `sozinho`).
3. **FRD-02, "item com mudança de pack_state registrada antes de start_date":** o servidor guarda a hora de chegada de cada alteração (`private.sync_change`), não a hora da mudança no aparelho. A feature 3.7 decide como provar isso.

## 13. O que fica para as features seguintes

| Feature | O que usa ou completa daqui |
| --- | --- |
| B4 | Criar no aparelho o mesmo esquema das tabelas sincronizadas, com os campos técnicos da seção 2; `trackPrevious` em `trip_item` |
| 2.1 | Login com Google; nome de exibição no `profile`; senhas de teste geradas no script do ambiente, se precisar de login com as pessoas de exemplo |
| 2.2 | Conector do PowerSync no app chamando `sync_apply`, tirando da fila e desfazendo as recusadas e avisando; cenários S1 a S10 com emuladores |
| 2.3, 2.4, 2.5 | `member_remove`, convites (`invite_create`, `invite_revoke`, `guest_join`, `guest_view`, `guest_claim`) |
| 2.8, 2.9, 2.10 | `expense_upsert`, `expense_mark_paid`, `pix_key_set`, `pix_key_get` (a política de leitura da chave Pix já existe) |
| 2.11 | `account_export` e `account_delete` (o gatilho de anonimização já existe) |
| 3.1 | Cidades do IBGE, busca e criação de camping, `pg_trgm` para a similaridade |
| 3.2 a 3.7 | Resumo dos relatos, retrato, perguntas da volta, antifraude (FRD-01 a FRD-05, usando `trip.created_at` e o registro de chegada), verificação real do aparelho e limites por aparelho |
| 3.10 | Rotina de contas inativas (prazos já em `config`) |
