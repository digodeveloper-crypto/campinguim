# Dados de exemplo do ambiente local

Arquivos `.sql` aplicados pelo Supabase local depois das migrações, em ordem alfabética, sempre que o banco é recriado (`npm run ambiente:zerar`). Configuração: `supabase/config.jsonc`, `db.seed.sql_paths`. O envio de migrações para produção (`supabase db push`) não aplica estes arquivos.

| Arquivo | O que tem |
| --- | --- |
| `000-ambiente-local.sql` | Marca o banco como ambiente local e liga a prova de desenvolvimento do aparelho (SPEC, seção 11). Em produção a tabela fica vazia e a prova fica desligada |
| `010-familia-da-carla.sql` | A família da Carla e a viagem de referência (SPEC, seções 9 e 13) |
| `020-grupo-de-tres-familias.sql` | O grupo de três famílias, itens do grupo, o fogareiro triplicado e a carne de R$ 420,00 (caso C1) |

Ainda não entram (decisão pendente, `docs/servidor.md`, seção 12): o Camping Recanto das Águas com 7 relatos e o camping sem dados, porque faltam a cidade de cada um e os dados dos 7 relatos.

Regras:

- Nome do arquivo com número na frente, para a ordem ficar clara.
- Dados só do protótipo (`design/prototipos/_compartilhado/dados.js`), com nomes fictícios. Nada inventado: o que o protótipo não dá fica de fora e vira pergunta.
- Pessoas de teste só com e-mail em domínio reservado para teste (`@pessoas-de-teste.test`). Nenhuma pessoa real.
- Pessoas de teste sem senha. Senhas, quando uma feature precisar de login com elas, são geradas pelo script do ambiente e guardadas em `.env.local`, fora do git.
- Nenhum dado de camping real copiado de fora.
