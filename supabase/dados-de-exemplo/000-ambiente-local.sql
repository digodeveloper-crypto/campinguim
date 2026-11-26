-- Ambiente local: liga o que só vale na máquina de desenvolvimento.
-- Este arquivo é dado de exemplo: o Supabase local aplica depois das migrações (npm run ambiente:zerar),
-- e o envio de migrações para produção (supabase db push) não aplica. Em produção a tabela fica
-- vazia e tudo o que está aqui fica desligado (teste: supabase/testes/aparelho.test.ts).

-- Prova de desenvolvimento do aparelho (SPEC, seção 11): aceita só no ambiente local, porque no
-- emulador não há prova real.
insert into private.server_setting (key, value) values
  ('environment', 'local'),
  ('accept_dev_device_proof', 'true');
