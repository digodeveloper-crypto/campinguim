# B5 · esquema do servidor e autorização · rodada 1 · APROVADO

Data: 2026-11-26 · Entregue por: pane-702 · Conferido por: QA (pane-689)
Base: cartão da B5; SPEC, seções 3, 4, 8, 11 e 13 (dados de teste); PRD NF-10, DEF-01, DEF-05, DEF-08, DEF-09, PRV-01, PRV-02, PRV-06 e a parte de servidor da DEF-11; pontos J1, J2, J4 e J15 e decisão D3; `CLAUDE.md`, "Segurança"; regras do piloto (RLS na mesma migração; os dois testes da §11; a B5 não toca `apps/mobile`, então só o manifesto pode ficar PULADO).
Alvo: worktree `C:\campinguim-wt\B5`, ramo `feature/B5-esquema-do-servidor`, ponta `28f5210`, rebaseada sobre o main `8b97d5f`. 4 commits, só locais; autor e quem gravou: noreply.

**Resumo:** o esquema da §3 está inteiro, com RLS em todas as 27 tabelas na mesma migração que as cria, e sem nenhum privilégio para quem não tem login. A escrita vinda do aparelho passa só por `sync_apply`, que confere a autorização alteração por alteração e não trava o lote por um dado ruim. A sincronização entrega só as viagens de que a pessoa é membro. O QA rodou a suíte duas vezes do zero e plantou 3 defeitos de segurança: os três foram pegos.

## Suíte local (GIT-10)

| Execução | Comando | Resultado |
| --- | --- | --- |
| Ambiente | `npm run ambiente:zerar` a partir da B5 (Node 24.19.0), com a vez do Docker dada pelo piloto e B4 e B5 pausadas | exit 0; banco com 6 migrações, 25 tabelas em `public` (mais 2 em `private`) e os dados de exemplo aplicados (30 relatos de fatos no Recanto) |
| 1ª | `npm run testar -- --exigir-servidor` | **0 falhas, exit 0.** **Servidor 109 de 109.** Unitários 252 de 255, com 3 PULADOS: **só** o manifesto do APK, aceito porque a B5 não toca `apps/mobile`. Web 2 de 2; tipos 5 de 5; lint, segredos e endereços ok. **363 testes passaram, 0 falharam** |
| 2ª, sem derrubar | o mesmo | igual, exit 0 |

**A etapa pulada é só a do manifesto do APK**, pela regra do piloto: o diff da B5 não toca `apps/mobile`.

## Defeitos plantados pelo QA (no banco local e na configuração, desfeitos logo depois)

| # | Defeito | Resultado |
| --- | --- | --- |
| M1 | `alter table public.trip_item disable row level security` | `rls.test.ts` falha ("toda tabela dos esquemas da aplicação tem RLS ativo"). Com o RLS religado: 8 de 8 |
| M2 | Em `private.sync_item`, a conferência `is_family_member(v_family)` na criação do item foi trocada por `if false` (J2 desligado) | **2 testes falham:** "item novo com a família de OUTRA família da viagem: recusado" (`sync-apply`) e "membro de outra família da mesma viagem não lê nem escreve o item pessoal" (`autorizacao-por-linha`). Com a função original de volta: 66 de 66 |
| M3 | Regra `meus_itens` alargada para os itens de todas as famílias das minhas viagens, com o PowerSync reiniciado | `sincronizacao.test.ts` falha ("B recebe os itens do grupo e os da própria família, nunca os pessoais da outra família"). Arquivo restaurado e PowerSync reiniciado: 5 de 5 |

## Aceite

| Critério | Resultado do QA |
| --- | --- |
| RLS na mesma migração (`CLAUDE.md`, SPEC §11) | ok. Conferido por script nas 5 migrações: 9 + 5 + 8 + 4 + 1 = 27 tabelas, cada uma com `enable row level security` no mesmo arquivo. Sem `for all tables`. Nenhum `grant … to anon`. Todo `security definer` tem `search_path` fixo |
| Os dois testes da §11 | ok. **Todas as tabelas com RLS:** `rls.test.ts` (grupo 1), que também confere políticas, privilégios de `anon` e `authenticated` e a publicação; pegou o M1. **Membro de A não recebe nada de B:** `sincronizacao.test.ts` (grupo 2), com login real e `/sync/stream` do PowerSync ("C, membro só de W, não recebe nada da viagem V", S10); pegou o M3 |
| Dados de camping nunca vão em lote ao aparelho | ok. As regras de sincronização entregam só `profile`, as tabelas da viagem de que a pessoa é membro ativo e `trip_camping_snapshot`, que é só o resultado por viagem. Camping, relato, resumo, sugestão, convite, Pix, aparelho, evento e config não estão na publicação nem nas regras (teste "ninguém recebe convite, chave Pix, camping…") |
| J1 (um dado inválido trava a fila) | ok. `sync_apply` tem um bloco de exceção por alteração; `data_exception` e `integrity_constraint_violation` viram "rejected validation", e só aquela alteração é desfeita. Teste "aplica as válidas e devolve o motivo das outras, na mesma ordem, sem abortar o lote", e repetição idempotente do mesmo lote |
| J2 (regras por família dentro da função) | ok. O `family_id` é conferido na criação; as chaves estrangeiras compostas `(family_id, trip_id)` barram família de outra viagem; ninguém muda de família pela sincronização (a brecha achada pelo ajudante tem teste). Pegou o M2 |
| J4 (marca do aparelho) | ok. A marca vale para o par instalação + conta (`device.profile_id`), e `device_register` exige login. A prova de desenvolvimento só vale com `private.server_setting` local, que as migrações deixam vazia (em produção fica desligada) |
| D3 | ok. `device.proof_max_age_seconds` = 300, `device.proof_future_tolerance_seconds` = 60 e `device.verified_validity_hours` = 24 em `config` |
| J15 (modelo completo) | ok. `profile`, `trip_family`, `trip_person`, `trip_member` etc. da §3 |
| NF-10 (tabela de autorização) | ok. `autorizacao-por-linha.test.ts`: 17 testes, uma tentativa indevida por linha |
| Dados de teste da §13 | ok. Família da Carla (viagem de referência), grupo de três famílias (meias cotas do C1, carne de R$ 420,00), Recanto das Águas com 7 relatos de 7 contas e Sítio Pedra Lisa sem relato. Pessoas em `@pessoas-de-teste.test`, sem senha. Os nomes dos campings são fictícios; os códigos do IBGE são de cidades reais |
| SPEC | ok. Só 1 linha na §15, autorizada pelo piloto |
| Rebase | ok. `range-diff`: o commit 1 muda só `docs/MUDANCAS.md`; os demais são idênticos |
| Checagem G | ok. 0 chave, JWT, usuário do Windows, caminho ou e-mail pessoal no diff, nas mensagens e nas evidências |

## Observações (não reprovam; para o piloto)

1. **Teste instável com a máquina carregada** (combinado para a B1-FIX-2): `scripts/testes/enderecos.test.ts > endereços fora do arquivo de configuração > a árvore do repositório está limpa`. O limite do Vitest é 5 s; a B5 mediu de 20 a 25 s com a máquina carregada; sozinho leva cerca de 1,3 s. Nas duas rodadas do QA acima, passou.
2. **Defeito da B1 nos scripts do ambiente** (veja a `B3-rodada-3.md`, observação 1): `parar`/`zerar` a partir de um worktree sem `.env.local` não para a pilha de sincronização. Vai para a B1-FIX-2.
3. **Coordenação do Docker:** o `.env.local` mostrou que a B4 subiu o ambiente sem estar na vez. Sugestão: os ajudantes avisam o piloto antes de `subir`/`zerar`.
4. Para as features seguintes, como no `docs/servidor.md`: tabela de histórico do item (2.2), funções de gasto e Pix (2.8–2.10), exportar e excluir conta (2.11), busca de camping com `pg_trgm` (3.1), antifraude e verificação real (3.7).
5. Os códigos do IBGE de São Tomé das Letras e de Cunha são reais, e os campings são fictícios. O `LEIA-ME` dos dados de exemplo diz "nenhum camping real é retratado".

## Limpeza

- Docker: vez dada pelo piloto. `zerar` a partir da B5, suíte, defeitos plantados e desfeitos (RLS religado, função `sync_item` restaurada e conferida, `sync-config.yaml` restaurado com `git status` limpo, PowerSync reiniciado), e `npm run ambiente:parar`: 0 contêineres `campinguim` no fim. A B4 e a B5 precisam de `npm run ambiente:zerar` a partir do próprio worktree para voltar ao estado delas.
- O emulador não foi usado. Os rascunhos ficaram só na pasta temporária do sistema e foram apagados. O worktree não mudou, só ganhou este relatório.
