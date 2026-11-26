# Evidências da B5 (esquema do servidor e autorização)

Geradas em 26/11/2026 no worktree `feature/B5-esquema-do-servidor`, rebaseado sobre o `main` 87d5c1b (B1-FIX), com o ambiente local recriado do zero (`npm run ambiente:zerar`). Caminhos locais trocados por `<worktree B5>`.

| Arquivo | O que mostra |
| --- | --- |
| `ambiente-zerar.txt` | `npm run ambiente:zerar`: banco apagado e recriado pelas 6 migrações e pelos 4 arquivos de dados de exemplo; 7 contêineres no ar |
| `testar-exigir-completa.txt` | `npm run testar -- --exigir-completa`: segredos, endereços, tipos (5 de 5), lint, servidor **109 de 109**, página web 2 de 2. A etapa "Testes unitários" sai com 84 de 88: 3 pulados (manifesto do APK; não há APK gerado e a B5 não toca o app) e 1 falha de tempo (ver abaixo) |
| `teste-b1-enderecos-isolado.txt` | O teste da B1 que estourou o tempo na suíte, rodado sozinho: 7 de 7 em 1,3 s |
| `catalogo-rls-e-politicas.txt` | Consulta ao catálogo: migrações aplicadas; as 27 tabelas com RLS, número de políticas e se sincronizam; todas as políticas; privilégios de `anon` e `authenticated`; funções expostas; ajuste local; dados de exemplo (viagens, campings e cidades, relatos por fato) |
| `grupo-1-rls.txt` | Grupo 1: RLS em todas as tabelas, nenhuma política nas protegidas (8 testes) |
| `grupo-2-sincronizacao.txt` | Grupo 2: membro da viagem A não recebe nada da B pela sincronização, com login e PowerSync reais (5 testes) |
| `grupo-3-autorizacao-por-linha.txt` | Grupo 3 (NF-10): uma tentativa indevida por linha da tabela de autorização, com controle (17 testes) |
| `grupo-4-sync-apply.txt` | Grupo 4: lote misto, J1, J2, regras de conflito, campos da B3 (49 testes) |
| `grupo-extra-*.txt` | Verificação do aparelho (8), exclusão de conta (2), premissas e dados de exemplo, inclusive os campings e os 7 relatos (9), contratos da seção 8 (3) |

**Falha de tempo na etapa unitária (não é da B5).** O teste da B1 `scripts/testes/enderecos.test.ts`, "a árvore do repositório está limpa", varre o repositório inteiro com o limite padrão de 5 s do Vitest. Na suíte, com a máquina carregada por outras tarefas e os testes em paralelo, levou de 20 a 25 s nas três últimas rodadas e caiu por tempo. A mesma varredura passa como etapa própria da suíte ("Endereços só no arquivo de configuração", 2,6 s) e o arquivo de teste passa sozinho em 1,3 s (`teste-b1-enderecos-isolado.txt`). Numa rodada anterior, com a máquina menos carregada, a suíte inteira passou com esse teste. Correção sugerida, fora das pastas da B5: dar a esse teste um limite de tempo maior.
