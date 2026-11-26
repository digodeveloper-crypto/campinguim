# Servidor local (`supabase/`)

| Pasta ou arquivo | O que tem | Quem preenche |
| --- | --- | --- |
| `config.jsonc` | Configuração do Supabase local (portas, login, serviços) | B1 |
| `migrations/` | Migrações versionadas do banco. Toda tabela nasce com RLS ativo na mesma migração (CLAUDE.md) | B5 em diante |
| `functions/` | Funções do servidor em TypeScript (SPEC, seção 8) | B5 em diante |
| `dados-de-exemplo/` | Dados de exemplo das jornadas, aplicados depois das migrações | features que usam |
| `sincronizacao/` | Serviço PowerSync auto-hospedado em Docker e as regras de sincronização | B1 (serviço), 2.2 (regras) |
| `testes/` | Testes do servidor contra o ambiente local (autorização, RLS, funções) | B1 em diante |

Como subir, parar e zerar: `docs/desenvolvimento.md`.
