# Dados de exemplo do ambiente local

Arquivos `.sql` aplicados pelo Supabase local depois das migrações, em ordem alfabética, sempre que o banco é recriado (`npm run ambiente:zerar`). Configuração: `supabase/config.jsonc`, `db.seed.sql_paths`.

Vazio na B1: o esquema é da B5, e os dados das jornadas (SPEC, seção 13, "Dados de teste": a família da Carla, o grupo de três famílias, o Camping Recanto das Águas com 7 relatos e um camping sem dados) entram com as features que os usam.

Regras:

- Nome do arquivo com número na frente, para a ordem ficar clara: `010-familia-da-carla.sql`, `020-grupo.sql`.
- Pessoas de teste só com e-mail em domínio reservado para teste (`@pessoas-de-teste.test`). Nenhuma pessoa real.
- Senhas de usuários de teste nunca ficam aqui: o script do ambiente gera e guarda em `.env.local`, fora do git.
- Nenhum dado de camping real copiado de fora.
