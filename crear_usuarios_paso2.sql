-- PASO 2: CREAR SIGUIENTES 5 USUARIOS
-- Ejecutar DESPUÉS del Paso 1

-- Héctor Cáceres Marcos (#7)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'héctor.cáceres.marcos@cabrerizos-fc.app',
  crypt('héctor7cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Héctor", "surname": "Cáceres Marcos", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Iván Martín Cañizal (#9)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'iván.martín.cañizal@cabrerizos-fc.app',
  crypt('iván9cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Iván", "surname": "Martín Cañizal", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Aarón Gabriel García (#10)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'aarón.gabriel.garcía@cabrerizos-fc.app',
  crypt('aarón10cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Aarón Gabriel", "surname": "García", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Ricardo André Romero Chiuz (#11)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ricardo.andré.romero.chiuz@cabrerizos-fc.app',
  crypt('ricardo11cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Ricardo André", "surname": "Romero Chiuz", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- David Mario Hidalgo Vizcaíno (#12)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  raw_app_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'david.mario.hidalgo.vizcaíno@cabrerizos-fc.app',
  crypt('david12cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "David Mario", "surname": "Hidalgo Vizcaíno", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);