# Dados de exemplo do ambiente local

Arquivos `.sql` aplicados pelo Supabase local depois das migrações, em ordem alfabética, sempre que o banco é recriado (`npm run ambiente:zerar`). Configuração: `supabase/config.jsonc`, `db.seed.sql_paths`. O envio de migrações para produção (`supabase db push`) não aplica estes arquivos.

| Arquivo | O que tem |
| --- | --- |
| `000-ambiente-local.sql` | Marca o banco como ambiente local e liga a prova de desenvolvimento do aparelho (SPEC, seção 11). Em produção a tabela fica vazia e a prova fica desligada |
| `010-familia-da-carla.sql` | A família da Carla e a viagem de referência (SPEC, seções 9 e 13) |
| `020-grupo-de-tres-familias.sql` | O grupo de três famílias, itens do grupo, o fogareiro triplicado e a carne de R$ 420,00 (caso C1) |
| `030-campings.sql` | O Camping Recanto das Águas com 7 relatos que reproduzem o retrato de referência (SPEC, seção 9), o Sítio Pedra Lisa sem dados (jornada J8), e o destino das viagens da Carla |

**Nenhum camping real é retratado.** Os nomes dos campings são fictícios (os mesmos dos protótipos). As cidades são reais, com o código oficial do IBGE, conferido na API de localidades do IBGE em 26/11/2026: São Tomé das Letras (MG), 3165206, para o Recanto das Águas, e Cunha (SP), 3513603, para o Sítio Pedra Lisa (decisão do orquestrador de 26/11/2026). Os 7 relatos são de pessoas fictícias e foram montados para reproduzir o retrato de referência; não vêm de nenhum relato real.

Regras:

- Nome do arquivo com número na frente, para a ordem ficar clara.
- Dados do protótipo (`design/prototipos/_compartilhado/dados.js`), com nomes fictícios. O que o protótipo não dá fica de fora e vira pergunta ao orquestrador; os 7 relatos e as cidades de `030-campings.sql` foram montados por decisão dele.
- Pessoas de teste só com e-mail em domínio reservado para teste (`@pessoas-de-teste.test`). Nenhuma pessoa real.
- Pessoas de teste sem senha. Senhas, quando uma feature precisar de login com elas, são geradas pelo script do ambiente e guardadas em `.env.local`, fora do git.
- Nenhum dado de camping real copiado de fora.
