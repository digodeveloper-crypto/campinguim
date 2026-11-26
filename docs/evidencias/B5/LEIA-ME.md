# Evidências da B5 (esquema do servidor e autorização)

Geradas em 26/11/2026 no worktree `feature/B5-esquema-do-servidor`, com o ambiente local recriado do zero (`npm run ambiente:zerar`). Caminhos locais trocados por `<worktree B5>`.

| Arquivo | O que mostra |
| --- | --- |
| `ambiente-zerar.txt` | `npm run ambiente:zerar`: banco apagado e recriado pelas 6 migrações e pelos 3 arquivos de dados de exemplo; 7 contêineres no ar |
| `testar-exigir-completa.txt` | `npm run testar -- --exigir-completa`: segredos, endereços, tipos (5 de 5), lint, servidor **104 de 104**, página web 2 de 2. A etapa "Testes unitários" sai PULADA só pelos 3 testes do manifesto do APK (não há APK gerado; a B5 não toca o app), 85 de 88 passaram |
| `catalogo-rls-e-politicas.txt` | Consulta ao catálogo: migrações aplicadas; as 27 tabelas com RLS, número de políticas e se sincronizam; todas as políticas; privilégios de `anon` e `authenticated`; funções expostas; ajuste local; dados de exemplo carregados |
| `grupo-1-rls.txt` | Grupo 1: RLS em todas as tabelas, nenhuma política nas protegidas (8 testes) |
| `grupo-2-sincronizacao.txt` | Grupo 2: membro da viagem A não recebe nada da B pela sincronização, com login e PowerSync reais (5 testes) |
| `grupo-3-autorizacao-por-linha.txt` | Grupo 3 (NF-10): uma tentativa indevida por linha da tabela de autorização, com controle (17 testes) |
| `grupo-4-sync-apply.txt` | Grupo 4: lote misto, J1, J2, regras de conflito, campos da B3 (49 testes) |
| `grupo-extra-*.txt` | Verificação do aparelho (8), exclusão de conta (2), premissas e dados de exemplo (4), contratos da seção 8 (3) |

Observação sobre o ambiente: num worktree novo no Windows, o Git entrega `.github/workflows/versao.yml` com quebras de linha CRLF, e o teste da B1 `scripts/testes/repositorio.test.ts` ("dispara só com etiqueta v*") falha por isso. É defeito anterior da B1, já em correção no main pelo orquestrador. Para esta rodada, o arquivo foi regravado com LF só na cópia de trabalho (`git -c core.autocrlf=false checkout`), sem mudança de conteúdo nem commit.
