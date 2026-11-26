-- Dados de exemplo: a família da Carla (SPEC, seção 13, "Dados de teste"; seção 9, viagem de
-- referência). Fonte: design/prototipos/_compartilhado/dados.js (cenário e família), os mesmos
-- dados dos protótipos, com nomes fictícios.
--
-- Viagem de referência: barraca com carro, 2 noites, 2 adultos, 2 crianças (Lucas, 9, e Bia, 5),
-- 1 pet, clima frio, sem chuva, uma família. Sem datas (no protótipo, `datas: null`).
-- Fica de fora até decisão (docs/servidor.md, "Pendências"):
--   - o destino (Camping Recanto das Águas): falta a cidade do camping (P-07 do protótipo);
--   - os 68 itens da lista: a lista é gerada no aparelho pelo motor de regras (B3, feature 1.2),
--     e as chaves de item do protótipo não são as do catálogo (por exemplo, `cartucho_gas` e `gas`).
--
-- Pessoa de teste sem senha: o login com e-mail e senha não funciona para ela. Quem precisar de
-- login (feature 2.1) gera a senha no script do ambiente e guarda em .env.local, fora do git.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change)
values (
  '00000000-0000-0000-0000-000000000000', '639868af-d201-4b8c-9784-5bd80e68e4b0',
  'authenticated', 'authenticated', 'carla@pessoas-de-teste.test', '', now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', '');

-- O perfil nasce pelo gatilho do primeiro login; aqui só o nome de exibição.
update public.profile
   set display_name = 'Carla', nickname = 'Carla R.', updated_at = now()
 where id = '639868af-d201-4b8c-9784-5bd80e68e4b0';

insert into public.trip (
  id, owner_profile_id, name, kind, start_date, end_date, nights, climate, rain, is_group, status, updated_by)
values (
  '85fd7af8-93e5-406b-80e9-be617938afe0', '639868af-d201-4b8c-9784-5bd80e68e4b0', null, 'tent_car',
  null, null, 2, 'cold', false, false, 'planning', '639868af-d201-4b8c-9784-5bd80e68e4b0');

insert into public.trip_family (id, trip_id, name, pets, is_organizer, updated_by)
values (
  '8de550e7-ff2a-477a-8062-7889b375b51d', '85fd7af8-93e5-406b-80e9-be617938afe0', 'Carla e Rafael', 1, true,
  '639868af-d201-4b8c-9784-5bd80e68e4b0');

insert into public.trip_person (id, trip_id, family_id, age_band, label, updated_by) values
  ('19eb0aba-7c6a-45a9-a0f4-d320bb5d1906', '85fd7af8-93e5-406b-80e9-be617938afe0',
   '8de550e7-ff2a-477a-8062-7889b375b51d', 'adult', 'Carla', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('e209abec-9adc-44fe-89c1-7a84c2f49b6f', '85fd7af8-93e5-406b-80e9-be617938afe0',
   '8de550e7-ff2a-477a-8062-7889b375b51d', 'adult', 'Rafael', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('727e0190-ddbb-4c9d-a6ec-89b5a485cd23', '85fd7af8-93e5-406b-80e9-be617938afe0',
   '8de550e7-ff2a-477a-8062-7889b375b51d', 'child', 'Lucas', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('6c442e09-0a9e-4082-9a9f-bce3ecbcae7d', '85fd7af8-93e5-406b-80e9-be617938afe0',
   '8de550e7-ff2a-477a-8062-7889b375b51d', 'child', 'Bia', '639868af-d201-4b8c-9784-5bd80e68e4b0');

insert into public.trip_member (id, trip_id, family_id, profile_id, display_name, role, updated_by)
values (
  'e59eb927-e9f7-49e0-9a75-a9b5bc669c2c', '85fd7af8-93e5-406b-80e9-be617938afe0',
  '8de550e7-ff2a-477a-8062-7889b375b51d', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'Carla', 'organizer',
  '639868af-d201-4b8c-9784-5bd80e68e4b0');
