-- Dados de exemplo: campings (SPEC, seção 13: "o Camping Recanto das Águas com 7 relatos e um
-- camping sem dados"; seção 9, "retrato de referência"; seção 6). Decisão do orquestrador de
-- 26/11/2026 (resposta à pergunta P1 da B5).
--
-- NENHUM CAMPING REAL É RETRATADO. Os nomes dos campings são fictícios (os mesmos dos protótipos);
-- as cidades são reais, com o código oficial do IBGE (conferido em 26/11/2026 na API de
-- localidades do IBGE): São Tomé das Letras (MG), 3165206, e Cunha (SP), 3513603. As pessoas são
-- fictícias, com e-mail em domínio reservado para teste e sem senha.
--
-- Camping Recanto das Águas: 7 relatos, de 7 contas diferentes, em 7 viagens encerradas, que
-- reproduzem o retrato de referência da seção 9: 220 V, tomada longe, 1 chuveiro, capacidade de 11
-- a 25, churrasco só em área comum, aceita pet, silêncio às 22h, piscina às 10h; cada fato com ao
-- menos 2 contas concordando e o último relato nos últimos 6 meses (confirmado e recente, em
-- novembro de 2026). "Som cumprido": 6 vezes "sim", nas 6 viagens que já sabiam a regra do som;
-- a última é a da Carla, em novembro de 2026 (P-08 do protótipo).
-- Cada viagem: encerrada, com volta antes de hoje e o camping como destino (FRD-01); criada antes
-- da ida, com item marcado (FRD-02); uma viagem por conta, um relato por fato (FRD-03); contas com
-- mais de 7 dias (FRD-05). Até 6 perguntas na primeira visita e 4 nas demais (seção 6).
-- Códigos das opções: os do motor da B3. occasion e trip_kind: códigos provisórios até a 3.2.
-- O resumo (fact_summary) e o retrato das viagens da Carla não entram: são calculados pelo
-- servidor (features 3.2 e 3.3).
--
-- Sítio Pedra Lisa: o camping sem dados (jornada J8), sem relato.

insert into public.city (ibge_code, name, state) values
  ('3165206', 'São Tomé das Letras', 'MG'),
  ('3513603', 'Cunha', 'SP');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change)
values
  ('00000000-0000-0000-0000-000000000000', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'authenticated', 'authenticated', 'relato-1@pessoas-de-teste.test', '',
   '2025-10-02 14:00+00', '{"provider": "email", "providers": ["email"]}', '{}', '2025-10-02 14:00+00', '2025-10-02 14:00+00', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '703e3d41-a185-499c-8b89-b50c215e9741', 'authenticated', 'authenticated', 'relato-2@pessoas-de-teste.test', '',
   '2025-11-18 21:30+00', '{"provider": "email", "providers": ["email"]}', '{}', '2025-11-18 21:30+00', '2025-11-18 21:30+00', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c', 'authenticated', 'authenticated', 'relato-3@pessoas-de-teste.test', '',
   '2026-01-09 12:10+00', '{"provider": "email", "providers": ["email"]}', '{}', '2026-01-09 12:10+00', '2026-01-09 12:10+00', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '50d84b67-a54c-4746-a395-4484f46c01e6', 'authenticated', 'authenticated', 'relato-4@pessoas-de-teste.test', '',
   '2026-03-27 09:45+00', '{"provider": "email", "providers": ["email"]}', '{}', '2026-03-27 09:45+00', '2026-03-27 09:45+00', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '13a430b0-dad7-4b27-91c9-b9376f381e78', 'authenticated', 'authenticated', 'relato-5@pessoas-de-teste.test', '',
   '2026-05-14 18:20+00', '{"provider": "email", "providers": ["email"]}', '{}', '2026-05-14 18:20+00', '2026-05-14 18:20+00', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '46029115-723a-496a-9e46-fb0566c9a92b', 'authenticated', 'authenticated', 'relato-6@pessoas-de-teste.test', '',
   '2026-07-01 11:05+00', '{"provider": "email", "providers": ["email"]}', '{}', '2026-07-01 11:05+00', '2026-07-01 11:05+00', '', '', '', '');

-- Perfis (nascem pelo gatilho): nome e data da conta.
update public.profile set display_name = 'Marina', created_at = '2025-10-02 14:00+00', updated_at = '2025-10-02 14:00+00' where id = '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c';
update public.profile set display_name = 'Otávio', created_at = '2025-11-18 21:30+00', updated_at = '2025-11-18 21:30+00' where id = '703e3d41-a185-499c-8b89-b50c215e9741';
update public.profile set display_name = 'Helena', created_at = '2026-01-09 12:10+00', updated_at = '2026-01-09 12:10+00' where id = 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c';
update public.profile set display_name = 'Joaquim', created_at = '2026-03-27 09:45+00', updated_at = '2026-03-27 09:45+00' where id = '50d84b67-a54c-4746-a395-4484f46c01e6';
update public.profile set display_name = 'Sueli', created_at = '2026-05-14 18:20+00', updated_at = '2026-05-14 18:20+00' where id = '13a430b0-dad7-4b27-91c9-b9376f381e78';
update public.profile set display_name = 'Renato', created_at = '2026-07-01 11:05+00', updated_at = '2026-07-01 11:05+00' where id = '46029115-723a-496a-9e46-fb0566c9a92b';

-- Os campings. Normalização da seção 6: minúsculas, sem acento, sem as palavras "camping", "das"...
insert into public.camping (id, name, name_normalized, city_ibge_code, created_by, created_at, updated_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'Camping Recanto das Águas', 'recanto aguas', '3165206', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', '2025-12-01 20:05+00', '2025-12-01 20:05+00'),
  ('be4c94f0-acdb-4fec-9907-50a1b489499f', 'Sítio Pedra Lisa', 'sitio pedra lisa', '3513603', '639868af-d201-4b8c-9784-5bd80e68e4b0', '2026-11-20 12:00+00', '2026-11-20 12:00+00');

-- Relato 1: 2025-12-20 a 2025-12-23, familia_com_criancas, ferias.
insert into public.trip (id, owner_profile_id, kind, start_date, end_date, nights, climate, camping_id, is_group, status, created_at, updated_at, updated_by)
values ('3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'tent_car', '2025-12-20', '2025-12-23', 3, null, 'bcb414ee-8ade-41ea-aa38-0846f510e532', false, 'closed', '2025-12-01 20:00+00', '2025-12-23 22:00+00', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c');
insert into public.trip_family (id, trip_id, pets, is_organizer, updated_by) values
  ('92a8fd99-3228-4a85-8f49-8980f3776805', '3731fa31-6c95-4e0d-9e5c-7d3a2817b576', 0, true, '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c');
insert into public.trip_person (trip_id, family_id, age_band, updated_by) values
  ('3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '92a8fd99-3228-4a85-8f49-8980f3776805', 'adult', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c'),
  ('3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '92a8fd99-3228-4a85-8f49-8980f3776805', 'adult', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c'),
  ('3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '92a8fd99-3228-4a85-8f49-8980f3776805', 'child', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c');
insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
values ('3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '92a8fd99-3228-4a85-8f49-8980f3776805', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'Marina', 'organizer', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c');
insert into public.trip_item (trip_id, family_id, catalog_key, name, category, qty, origin, pack_state, return_state, updated_by)
values ('3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '92a8fd99-3228-4a85-8f49-8980f3776805', 'barraca', 'Barraca com sobreteto', 'abrigo', 1, 'generated', 'in_car', 'checked', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c');
insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, source, occasion, trip_kind, visited_month, anonymous, created_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'energia_voltagem', '220v', 'camper', 'ferias', 'familia_com_criancas', '2025-12-01', false, '2025-12-23 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'energia_tomada', 'longe', 'camper', 'ferias', 'familia_com_criancas', '2025-12-01', false, '2025-12-23 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'chuveiros_qtd', '1', 'camper', 'ferias', 'familia_com_criancas', '2025-12-01', false, '2025-12-23 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'capacidade', '11_a_25', 'camper', 'ferias', 'familia_com_criancas', '2025-12-01', false, '2025-12-23 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'som_horario', '22h', 'camper', 'ferias', 'familia_com_criancas', '2025-12-01', false, '2025-12-23 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '3731fa31-6c95-4e0d-9e5c-7d3a2817b576', '3dbe9c6d-53d1-4a57-a6b5-e0ae8f2d939c', 'piscina', '10h', 'camper', 'ferias', 'familia_com_criancas', '2025-12-01', false, '2025-12-23 20:00+00');

-- Relato 2: 2026-03-14 a 2026-03-15, casal, fim_de_semana.
insert into public.trip (id, owner_profile_id, kind, start_date, end_date, nights, climate, camping_id, is_group, status, created_at, updated_at, updated_by)
values ('41498949-973d-405d-b250-dbed257999fe', '703e3d41-a185-499c-8b89-b50c215e9741', 'tent_car', '2026-03-14', '2026-03-15', 1, null, 'bcb414ee-8ade-41ea-aa38-0846f510e532', false, 'closed', '2026-02-20 22:00+00', '2026-03-15 22:00+00', '703e3d41-a185-499c-8b89-b50c215e9741');
insert into public.trip_family (id, trip_id, pets, is_organizer, updated_by) values
  ('06025bb1-8e19-4913-ba40-683d6eb040ab', '41498949-973d-405d-b250-dbed257999fe', 0, true, '703e3d41-a185-499c-8b89-b50c215e9741');
insert into public.trip_person (trip_id, family_id, age_band, updated_by) values
  ('41498949-973d-405d-b250-dbed257999fe', '06025bb1-8e19-4913-ba40-683d6eb040ab', 'adult', '703e3d41-a185-499c-8b89-b50c215e9741'),
  ('41498949-973d-405d-b250-dbed257999fe', '06025bb1-8e19-4913-ba40-683d6eb040ab', 'adult', '703e3d41-a185-499c-8b89-b50c215e9741');
insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
values ('41498949-973d-405d-b250-dbed257999fe', '06025bb1-8e19-4913-ba40-683d6eb040ab', '703e3d41-a185-499c-8b89-b50c215e9741', 'Otávio', 'organizer', '703e3d41-a185-499c-8b89-b50c215e9741');
insert into public.trip_item (trip_id, family_id, catalog_key, name, category, qty, origin, pack_state, return_state, updated_by)
values ('41498949-973d-405d-b250-dbed257999fe', '06025bb1-8e19-4913-ba40-683d6eb040ab', 'barraca', 'Barraca com sobreteto', 'abrigo', 1, 'generated', 'in_car', 'checked', '703e3d41-a185-499c-8b89-b50c215e9741');
insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, source, occasion, trip_kind, visited_month, anonymous, created_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '41498949-973d-405d-b250-dbed257999fe', '703e3d41-a185-499c-8b89-b50c215e9741', 'som_cumprido', 'sim', 'camper', 'fim_de_semana', 'casal', '2026-03-01', false, '2026-03-15 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '41498949-973d-405d-b250-dbed257999fe', '703e3d41-a185-499c-8b89-b50c215e9741', 'churrasco', 'area_comum', 'camper', 'fim_de_semana', 'casal', '2026-03-01', false, '2026-03-15 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '41498949-973d-405d-b250-dbed257999fe', '703e3d41-a185-499c-8b89-b50c215e9741', 'pet', 'aceita', 'camper', 'fim_de_semana', 'casal', '2026-03-01', false, '2026-03-15 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '41498949-973d-405d-b250-dbed257999fe', '703e3d41-a185-499c-8b89-b50c215e9741', 'energia_voltagem', '220v', 'camper', 'fim_de_semana', 'casal', '2026-03-01', false, '2026-03-15 20:00+00');

-- Relato 3: 2026-04-03 a 2026-04-05, grupo, feriado.
insert into public.trip (id, owner_profile_id, kind, start_date, end_date, nights, climate, camping_id, is_group, status, created_at, updated_at, updated_by)
values ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c', 'tent_car', '2026-04-03', '2026-04-05', 2, null, 'bcb414ee-8ade-41ea-aa38-0846f510e532', true, 'closed', '2026-03-10 13:00+00', '2026-04-05 22:00+00', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c');
insert into public.trip_family (id, trip_id, pets, is_organizer, updated_by) values
  ('dcd995ed-6dd8-49d1-9818-7c076c953007', 'e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 0, true, 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c'),
  ('cffd0161-ea6f-42ee-b09b-aba316da6cd7', 'e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 0, false, 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c');
insert into public.trip_person (trip_id, family_id, age_band, updated_by) values
  ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'dcd995ed-6dd8-49d1-9818-7c076c953007', 'adult', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c'),
  ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'dcd995ed-6dd8-49d1-9818-7c076c953007', 'adult', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c'),
  ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'dcd995ed-6dd8-49d1-9818-7c076c953007', 'teen', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c'),
  ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'cffd0161-ea6f-42ee-b09b-aba316da6cd7', 'adult', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c'),
  ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'cffd0161-ea6f-42ee-b09b-aba316da6cd7', 'adult', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c');
insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
values ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'dcd995ed-6dd8-49d1-9818-7c076c953007', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c', 'Helena', 'organizer', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c');
insert into public.trip_item (trip_id, family_id, catalog_key, name, category, qty, origin, pack_state, return_state, updated_by)
values ('e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'dcd995ed-6dd8-49d1-9818-7c076c953007', 'barraca', 'Barraca com sobreteto', 'abrigo', 1, 'generated', 'in_car', 'checked', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c');
insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, source, occasion, trip_kind, visited_month, anonymous, created_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c', 'som_cumprido', 'sim', 'camper', 'feriado', 'grupo', '2026-04-01', true, '2026-04-05 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c', 'energia_tomada', 'longe', 'camper', 'feriado', 'grupo', '2026-04-01', true, '2026-04-05 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c', 'chuveiros_qtd', '1', 'camper', 'feriado', 'grupo', '2026-04-01', true, '2026-04-05 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'e4d75159-77e4-4ea3-ab0c-49f667a5ddf7', 'c1ed9916-60d5-4d0c-ad45-bd6287f3d69c', 'capacidade', '11_a_25', 'camper', 'feriado', 'grupo', '2026-04-01', true, '2026-04-05 20:00+00');

-- Relato 4: 2026-06-13 a 2026-06-14, sozinho, fim_de_semana.
insert into public.trip (id, owner_profile_id, kind, start_date, end_date, nights, climate, camping_id, is_group, status, created_at, updated_at, updated_by)
values ('67dc6cb7-3392-43b7-921d-6ef864f715af', '50d84b67-a54c-4746-a395-4484f46c01e6', 'tent_car', '2026-06-13', '2026-06-14', 1, null, 'bcb414ee-8ade-41ea-aa38-0846f510e532', false, 'closed', '2026-05-25 19:00+00', '2026-06-14 22:00+00', '50d84b67-a54c-4746-a395-4484f46c01e6');
insert into public.trip_family (id, trip_id, pets, is_organizer, updated_by) values
  ('3a6518ab-73e8-480e-9ebe-bc9c55aaa237', '67dc6cb7-3392-43b7-921d-6ef864f715af', 0, true, '50d84b67-a54c-4746-a395-4484f46c01e6');
insert into public.trip_person (trip_id, family_id, age_band, updated_by) values
  ('67dc6cb7-3392-43b7-921d-6ef864f715af', '3a6518ab-73e8-480e-9ebe-bc9c55aaa237', 'adult', '50d84b67-a54c-4746-a395-4484f46c01e6');
insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
values ('67dc6cb7-3392-43b7-921d-6ef864f715af', '3a6518ab-73e8-480e-9ebe-bc9c55aaa237', '50d84b67-a54c-4746-a395-4484f46c01e6', 'Joaquim', 'organizer', '50d84b67-a54c-4746-a395-4484f46c01e6');
insert into public.trip_item (trip_id, family_id, catalog_key, name, category, qty, origin, pack_state, return_state, updated_by)
values ('67dc6cb7-3392-43b7-921d-6ef864f715af', '3a6518ab-73e8-480e-9ebe-bc9c55aaa237', 'barraca', 'Barraca com sobreteto', 'abrigo', 1, 'generated', 'in_car', 'checked', '50d84b67-a54c-4746-a395-4484f46c01e6');
insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, source, occasion, trip_kind, visited_month, anonymous, created_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '67dc6cb7-3392-43b7-921d-6ef864f715af', '50d84b67-a54c-4746-a395-4484f46c01e6', 'som_cumprido', 'sim', 'camper', 'fim_de_semana', 'sozinho', '2026-06-01', false, '2026-06-14 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '67dc6cb7-3392-43b7-921d-6ef864f715af', '50d84b67-a54c-4746-a395-4484f46c01e6', 'som_horario', '22h', 'camper', 'fim_de_semana', 'sozinho', '2026-06-01', false, '2026-06-14 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '67dc6cb7-3392-43b7-921d-6ef864f715af', '50d84b67-a54c-4746-a395-4484f46c01e6', 'piscina', '10h', 'camper', 'fim_de_semana', 'sozinho', '2026-06-01', false, '2026-06-14 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '67dc6cb7-3392-43b7-921d-6ef864f715af', '50d84b67-a54c-4746-a395-4484f46c01e6', 'churrasco', 'area_comum', 'camper', 'fim_de_semana', 'sozinho', '2026-06-01', false, '2026-06-14 20:00+00');

-- Relato 5: 2026-07-17 a 2026-07-20, familia_com_criancas, ferias.
insert into public.trip (id, owner_profile_id, kind, start_date, end_date, nights, climate, camping_id, is_group, status, created_at, updated_at, updated_by)
values ('d28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '13a430b0-dad7-4b27-91c9-b9376f381e78', 'tent_car', '2026-07-17', '2026-07-20', 3, null, 'bcb414ee-8ade-41ea-aa38-0846f510e532', false, 'closed', '2026-06-30 10:00+00', '2026-07-20 22:00+00', '13a430b0-dad7-4b27-91c9-b9376f381e78');
insert into public.trip_family (id, trip_id, pets, is_organizer, updated_by) values
  ('70f63f70-f660-4674-849a-725707823543', 'd28f44ae-88ba-40d5-ae3e-22ca4ea7731f', 0, true, '13a430b0-dad7-4b27-91c9-b9376f381e78');
insert into public.trip_person (trip_id, family_id, age_band, updated_by) values
  ('d28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '70f63f70-f660-4674-849a-725707823543', 'adult', '13a430b0-dad7-4b27-91c9-b9376f381e78'),
  ('d28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '70f63f70-f660-4674-849a-725707823543', 'adult', '13a430b0-dad7-4b27-91c9-b9376f381e78'),
  ('d28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '70f63f70-f660-4674-849a-725707823543', 'child', '13a430b0-dad7-4b27-91c9-b9376f381e78'),
  ('d28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '70f63f70-f660-4674-849a-725707823543', 'toddler', '13a430b0-dad7-4b27-91c9-b9376f381e78');
insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
values ('d28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '70f63f70-f660-4674-849a-725707823543', '13a430b0-dad7-4b27-91c9-b9376f381e78', 'Sueli', 'organizer', '13a430b0-dad7-4b27-91c9-b9376f381e78');
insert into public.trip_item (trip_id, family_id, catalog_key, name, category, qty, origin, pack_state, return_state, updated_by)
values ('d28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '70f63f70-f660-4674-849a-725707823543', 'barraca', 'Barraca com sobreteto', 'abrigo', 1, 'generated', 'in_car', 'checked', '13a430b0-dad7-4b27-91c9-b9376f381e78');
insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, source, occasion, trip_kind, visited_month, anonymous, created_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'd28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '13a430b0-dad7-4b27-91c9-b9376f381e78', 'som_cumprido', 'sim', 'camper', 'ferias', 'familia_com_criancas', '2026-07-01', false, '2026-07-20 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'd28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '13a430b0-dad7-4b27-91c9-b9376f381e78', 'pet', 'aceita', 'camper', 'ferias', 'familia_com_criancas', '2026-07-01', false, '2026-07-20 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'd28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '13a430b0-dad7-4b27-91c9-b9376f381e78', 'energia_voltagem', '220v', 'camper', 'ferias', 'familia_com_criancas', '2026-07-01', false, '2026-07-20 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'd28f44ae-88ba-40d5-ae3e-22ca4ea7731f', '13a430b0-dad7-4b27-91c9-b9376f381e78', 'energia_tomada', 'longe', 'camper', 'ferias', 'familia_com_criancas', '2026-07-01', false, '2026-07-20 20:00+00');

-- Relato 6: 2026-09-05 a 2026-09-07, casal, feriado.
insert into public.trip (id, owner_profile_id, kind, start_date, end_date, nights, climate, camping_id, is_group, status, created_at, updated_at, updated_by)
values ('6d81f06c-e775-41cf-a09a-ff6452a76f23', '46029115-723a-496a-9e46-fb0566c9a92b', 'tent_car', '2026-09-05', '2026-09-07', 2, null, 'bcb414ee-8ade-41ea-aa38-0846f510e532', false, 'closed', '2026-08-15 16:00+00', '2026-09-07 22:00+00', '46029115-723a-496a-9e46-fb0566c9a92b');
insert into public.trip_family (id, trip_id, pets, is_organizer, updated_by) values
  ('4d5e1756-6803-4347-9540-6504fb8f43e8', '6d81f06c-e775-41cf-a09a-ff6452a76f23', 0, true, '46029115-723a-496a-9e46-fb0566c9a92b');
insert into public.trip_person (trip_id, family_id, age_band, updated_by) values
  ('6d81f06c-e775-41cf-a09a-ff6452a76f23', '4d5e1756-6803-4347-9540-6504fb8f43e8', 'adult', '46029115-723a-496a-9e46-fb0566c9a92b'),
  ('6d81f06c-e775-41cf-a09a-ff6452a76f23', '4d5e1756-6803-4347-9540-6504fb8f43e8', 'adult', '46029115-723a-496a-9e46-fb0566c9a92b');
insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
values ('6d81f06c-e775-41cf-a09a-ff6452a76f23', '4d5e1756-6803-4347-9540-6504fb8f43e8', '46029115-723a-496a-9e46-fb0566c9a92b', 'Renato', 'organizer', '46029115-723a-496a-9e46-fb0566c9a92b');
insert into public.trip_item (trip_id, family_id, catalog_key, name, category, qty, origin, pack_state, return_state, updated_by)
values ('6d81f06c-e775-41cf-a09a-ff6452a76f23', '4d5e1756-6803-4347-9540-6504fb8f43e8', 'barraca', 'Barraca com sobreteto', 'abrigo', 1, 'generated', 'in_car', 'checked', '46029115-723a-496a-9e46-fb0566c9a92b');
insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, source, occasion, trip_kind, visited_month, anonymous, created_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '6d81f06c-e775-41cf-a09a-ff6452a76f23', '46029115-723a-496a-9e46-fb0566c9a92b', 'som_cumprido', 'sim', 'camper', 'feriado', 'casal', '2026-09-01', false, '2026-09-07 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '6d81f06c-e775-41cf-a09a-ff6452a76f23', '46029115-723a-496a-9e46-fb0566c9a92b', 'chuveiros_qtd', '1', 'camper', 'feriado', 'casal', '2026-09-01', false, '2026-09-07 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '6d81f06c-e775-41cf-a09a-ff6452a76f23', '46029115-723a-496a-9e46-fb0566c9a92b', 'capacidade', '11_a_25', 'camper', 'feriado', 'casal', '2026-09-01', false, '2026-09-07 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', '6d81f06c-e775-41cf-a09a-ff6452a76f23', '46029115-723a-496a-9e46-fb0566c9a92b', 'piscina', '10h', 'camper', 'feriado', 'casal', '2026-09-01', false, '2026-09-07 20:00+00');

-- Relato 7: 2026-11-06 a 2026-11-08, familia_com_criancas, fim_de_semana.
insert into public.trip (id, owner_profile_id, kind, start_date, end_date, nights, climate, camping_id, is_group, status, created_at, updated_at, updated_by)
values ('be0aff3a-60ea-448f-800f-8dae8681876c', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'tent_car', '2026-11-06', '2026-11-08', 2, null, 'bcb414ee-8ade-41ea-aa38-0846f510e532', false, 'closed', '2026-10-20 23:00+00', '2026-11-08 22:00+00', '639868af-d201-4b8c-9784-5bd80e68e4b0');
insert into public.trip_family (id, trip_id, pets, is_organizer, updated_by) values
  ('59db4d30-2b55-4585-a8a3-5986a853918c', 'be0aff3a-60ea-448f-800f-8dae8681876c', 1, true, '639868af-d201-4b8c-9784-5bd80e68e4b0');
insert into public.trip_person (trip_id, family_id, age_band, updated_by) values
  ('be0aff3a-60ea-448f-800f-8dae8681876c', '59db4d30-2b55-4585-a8a3-5986a853918c', 'adult', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('be0aff3a-60ea-448f-800f-8dae8681876c', '59db4d30-2b55-4585-a8a3-5986a853918c', 'adult', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('be0aff3a-60ea-448f-800f-8dae8681876c', '59db4d30-2b55-4585-a8a3-5986a853918c', 'child', '639868af-d201-4b8c-9784-5bd80e68e4b0'),
  ('be0aff3a-60ea-448f-800f-8dae8681876c', '59db4d30-2b55-4585-a8a3-5986a853918c', 'child', '639868af-d201-4b8c-9784-5bd80e68e4b0');
insert into public.trip_member (trip_id, family_id, profile_id, display_name, role, updated_by)
values ('be0aff3a-60ea-448f-800f-8dae8681876c', '59db4d30-2b55-4585-a8a3-5986a853918c', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'Carla', 'organizer', '639868af-d201-4b8c-9784-5bd80e68e4b0');
insert into public.trip_item (trip_id, family_id, catalog_key, name, category, qty, origin, pack_state, return_state, updated_by)
values ('be0aff3a-60ea-448f-800f-8dae8681876c', '59db4d30-2b55-4585-a8a3-5986a853918c', 'barraca', 'Barraca com sobreteto', 'abrigo', 1, 'generated', 'in_car', 'checked', '639868af-d201-4b8c-9784-5bd80e68e4b0');
insert into public.fact_report (camping_id, trip_id, profile_id, fact_key, value, source, occasion, trip_kind, visited_month, anonymous, created_at) values
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'be0aff3a-60ea-448f-800f-8dae8681876c', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'som_cumprido', 'sim', 'camper', 'fim_de_semana', 'familia_com_criancas', '2026-11-01', false, '2026-11-08 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'be0aff3a-60ea-448f-800f-8dae8681876c', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'som_horario', '22h', 'camper', 'fim_de_semana', 'familia_com_criancas', '2026-11-01', false, '2026-11-08 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'be0aff3a-60ea-448f-800f-8dae8681876c', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'churrasco', 'area_comum', 'camper', 'fim_de_semana', 'familia_com_criancas', '2026-11-01', false, '2026-11-08 20:00+00'),
  ('bcb414ee-8ade-41ea-aa38-0846f510e532', 'be0aff3a-60ea-448f-800f-8dae8681876c', '639868af-d201-4b8c-9784-5bd80e68e4b0', 'pet', 'aceita', 'camper', 'fim_de_semana', 'familia_com_criancas', '2026-11-01', false, '2026-11-08 20:00+00');

-- Destino das viagens da Carla nos protótipos: o Camping Recanto das Águas.
update public.trip set camping_id = 'bcb414ee-8ade-41ea-aa38-0846f510e532'
 where id in ('85fd7af8-93e5-406b-80e9-be617938afe0', '8d84183b-0319-4aa5-aff2-32d2f71ef088');
