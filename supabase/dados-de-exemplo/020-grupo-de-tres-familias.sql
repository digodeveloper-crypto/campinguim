-- Dados de exemplo: o grupo de três famílias (SPEC, seção 13; seção 9, caso C1; PRD, seção 10).
-- Fonte: design/prototipos/_compartilhado/dados.js (`grupo`, `gastos`, `convidado`), com nomes
-- fictícios. Organizadora: Carla. Bruno tem conta e comprou a carne. Diego entrou pela página do
-- convidado (sem conta). Rafael, Paula e Lívia não usam o app neste cenário.
--
-- Itens do grupo, só os que o protótipo dá (P-10): isqueiro e saco de lixo sem dono; fogareiro
-- assumido pelas três famílias (duplicado, P-09); carne levada pela família de Bruno, com o gasto
-- de R$ 420,00 na regra de cotas (caso C1: Carla e Rafael R$ 180,00, Diego e Lívia R$ 120,00,
-- Bruno recebe R$ 300,00). Ninguém marcou "paguei" ainda (P-12). Chave Pix de Bruno: a do
-- protótipo (P-11), em domínio reservado.
-- `catalog_key` só onde a chave do protótipo é a mesma do catálogo (seção 5); `origin` fica no
-- padrão ('manual'), porque o protótipo não diz se o item veio da lista gerada.
-- O destino (Camping Recanto das Águas) é ligado em 030-campings.sql. Ficam de fora os dados da
-- viagem que o protótipo não dá (noites, clima, datas).

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change)
values (
  '00000000-0000-0000-0000-000000000000', '42942872-cff4-4736-b2b7-ffde33cd7bd9',
  'authenticated', 'authenticated', 'bruno@pessoas-de-teste.test', '', now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), '', '', '', '');

update public.profile
   set display_name = 'Bruno', updated_at = now()
 where id = '42942872-cff4-4736-b2b7-ffde33cd7bd9';

insert into public.trip (id, owner_profile_id, name, kind, is_group, status, updated_by)
values (
  '8d84183b-0319-4aa5-aff2-32d2f71ef088', '639868af-d201-4b8c-9784-5bd80e68e4b0',
  'Viagem de Carla ao Camping Recanto das Águas', 'tent_car', true, 'planning',
  '639868af-d201-4b8c-9784-5bd80e68e4b0');

insert into public.trip_family (id, trip_id, name, pets, is_organizer, updated_by) values
  ('639effb2-81f5-46df-aad7-bfe9c9d57038', '8d84183b-0319-4aa5-aff2-32d2f71ef088', 'Carla e Rafael', 0, true,
   '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('e5fa05d6-e28d-44b6-a380-2add587ecc87', '8d84183b-0319-4aa5-aff2-32d2f71ef088', 'Bruno e Paula', 0, false,
   '42942872-cff4-4736-b2b7-ffde33cd7bd9'),
  ('1c414586-da01-4f68-9df6-12ac9eb41bb6', '8d84183b-0319-4aa5-aff2-32d2f71ef088', 'Diego e Lívia', 0, false,
   '639868af-d201-4b8c-9784-5bd80e68e4b0');

-- Pessoas por família (PRD, seção 10, exemplo da carne): Carla e Rafael com Lucas (9) e Bia (5);
-- Bruno e Paula com um bebê; Diego e Lívia.
insert into public.trip_person (id, trip_id, family_id, age_band, label, updated_by) values
  ('3aaf5505-46f1-4f12-a69b-656669e0f45f', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '639effb2-81f5-46df-aad7-bfe9c9d57038', 'adult', 'Carla', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('962965f1-1a78-4f94-9fe4-2597abedcf8b', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '639effb2-81f5-46df-aad7-bfe9c9d57038', 'adult', 'Rafael', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('7e82fdcb-9cdf-4f2c-a374-832c0dac19fa', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '639effb2-81f5-46df-aad7-bfe9c9d57038', 'child', 'Lucas', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('0ec8eb3f-cb21-4974-934d-a7e71fee3c64', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '639effb2-81f5-46df-aad7-bfe9c9d57038', 'child', 'Bia', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('b7009cf5-671a-4d67-8db5-c07c2e463543', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   'e5fa05d6-e28d-44b6-a380-2add587ecc87', 'adult', 'Bruno', '42942872-cff4-4736-b2b7-ffde33cd7bd9'),
  ('ecc0c03a-4f39-462a-9fd5-98d5d3da48f5', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   'e5fa05d6-e28d-44b6-a380-2add587ecc87', 'adult', 'Paula', '42942872-cff4-4736-b2b7-ffde33cd7bd9'),
  ('694d0c0d-a3fd-4c70-ad19-73d5ce010aae', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   'e5fa05d6-e28d-44b6-a380-2add587ecc87', 'toddler', null, '42942872-cff4-4736-b2b7-ffde33cd7bd9'),
  ('7cd29a5c-3c08-4172-b310-dee71b03b8ac', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '1c414586-da01-4f68-9df6-12ac9eb41bb6', 'adult', 'Diego', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('1a61e938-0d2c-4627-81f1-80ea896ac540', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '1c414586-da01-4f68-9df6-12ac9eb41bb6', 'adult', 'Lívia', '639868af-d201-4b8c-9784-5bd80e68e4b0');

insert into public.trip_member (id, trip_id, family_id, profile_id, display_name, role, updated_by) values
  ('42128617-16ee-4a3f-9622-3532c5117c42', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '639effb2-81f5-46df-aad7-bfe9c9d57038', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'Carla', 'organizer',
   '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('f074ea6e-0d3c-4b54-bf0a-751761395b02', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   'e5fa05d6-e28d-44b6-a380-2add587ecc87', '42942872-cff4-4736-b2b7-ffde33cd7bd9', 'Bruno', 'member',
   '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('dafe4401-53ed-4555-86c3-15665c7404ae', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '1c414586-da01-4f68-9df6-12ac9eb41bb6', null, 'Diego', 'guest',
   '639868af-d201-4b8c-9784-5bd80e68e4b0');

insert into public.trip_item (id, trip_id, family_id, catalog_key, name, qty, updated_by) values
  ('18f0cad2-da7e-4cdc-9d13-1e1e313ab7d9', '8d84183b-0319-4aa5-aff2-32d2f71ef088', null, 'isqueiro', 'Isqueiro', 1,
   '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('480ba41c-563e-4895-aef0-4dbbd13fe062', '8d84183b-0319-4aa5-aff2-32d2f71ef088', null, null, 'Saco de lixo', 1,
   '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('91b8bb4c-a466-4279-8856-92d1c064f05a', '8d84183b-0319-4aa5-aff2-32d2f71ef088', null, 'fogareiro', 'Fogareiro', 1,
   '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('18541487-23e1-440b-9118-d47f9f7dcf7f', '8d84183b-0319-4aa5-aff2-32d2f71ef088', null, null, 'Carne', 1,
   '42942872-cff4-4736-b2b7-ffde33cd7bd9');

insert into public.item_claim (id, trip_id, item_id, family_id, updated_by) values
  ('23d71392-07f1-4001-b054-cf8306e5dc6c', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '91b8bb4c-a466-4279-8856-92d1c064f05a', '639effb2-81f5-46df-aad7-bfe9c9d57038',
   '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('afbbff5c-76a8-4b8b-b76e-89c2d07ce78e', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '91b8bb4c-a466-4279-8856-92d1c064f05a', 'e5fa05d6-e28d-44b6-a380-2add587ecc87',
   '42942872-cff4-4736-b2b7-ffde33cd7bd9'),
  ('600ec95f-17d2-4ed7-8256-f0c210f403ae', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '91b8bb4c-a466-4279-8856-92d1c064f05a', '1c414586-da01-4f68-9df6-12ac9eb41bb6', null),
  ('44bcd68a-491c-477e-8760-53c406ab11ee', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
   '18541487-23e1-440b-9118-d47f9f7dcf7f', 'e5fa05d6-e28d-44b6-a380-2add587ecc87',
   '42942872-cff4-4736-b2b7-ffde33cd7bd9');

insert into public.expense (id, trip_id, item_id, buyer_family_id, amount_cents, split_rule, updated_by)
values (
  '962b9836-056e-4606-9689-3d53987067f6', '8d84183b-0319-4aa5-aff2-32d2f71ef088',
  '18541487-23e1-440b-9118-d47f9f7dcf7f', 'e5fa05d6-e28d-44b6-a380-2add587ecc87', 42000, 'shares',
  '42942872-cff4-4736-b2b7-ffde33cd7bd9');

insert into public.expense_audit (trip_id, expense_id, actor_member_id, field, old_value, new_value, updated_by) values
  ('8d84183b-0319-4aa5-aff2-32d2f71ef088', '962b9836-056e-4606-9689-3d53987067f6',
   'f074ea6e-0d3c-4b54-bf0a-751761395b02', 'amount_cents', null, '42000', '42942872-cff4-4736-b2b7-ffde33cd7bd9'),
  ('8d84183b-0319-4aa5-aff2-32d2f71ef088', '962b9836-056e-4606-9689-3d53987067f6',
   'f074ea6e-0d3c-4b54-bf0a-751761395b02', 'split_rule', null, 'shares', '42942872-cff4-4736-b2b7-ffde33cd7bd9');

insert into public.pix_key (profile_id, key, key_type)
values ('42942872-cff4-4736-b2b7-ffde33cd7bd9', 'bruno@example.com', 'e-mail');
