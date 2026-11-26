-- B1 · Publicação do PowerSync, vazia.
-- O serviço de sincronização (supabase/sincronizacao) lê as alterações do Postgres por uma
-- publicação chamada "powersync". Sem ela o serviço sobe, mas a replicação fica parada com erro
-- (PSYNC_S1141). Esta migração cria a publicação SEM nenhuma tabela: nenhuma tabela existe na B1.
-- A B5 (esquema do servidor) acrescenta cada tabela sincronizada na mesma migração que a cria, com
-- RLS ativo:  alter publication powersync add table public.<tabela>;
-- Nunca "for all tables": só o que a seção 4 da SPEC manda sincronizar vai para o aparelho.
create publication powersync;
