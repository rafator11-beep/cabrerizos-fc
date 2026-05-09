-- PASO 4: CREAR ÚLTIMOS 5 USUARIOS
-- Ejecutar DESPUÉS del Paso 3

-- Raúl Rodríguez Morán (#19)
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
  'raúl.rodríguez.morán@cabrerizos-fc.app',
  crypt('raúl19cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Raúl", "surname": "Rodríguez Morán", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Juan Vicente Hernández (#20)
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
  'juan.vicente.hernández@cabrerizos-fc.app',
  crypt('juan20cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Juan", "surname": "Vicente Hernández", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Guillermo Domínguez García (#21)
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
  'guillermo.domínguez.garcía@cabrerizos-fc.app',
  crypt('guillermo21cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Guillermo", "surname": "Domínguez García", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Jorge Alonso Cordovilla (#22)
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
  'jorge.alonso.cordovilla@cabrerizos-fc.app',
  crypt('jorge22cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Jorge", "surname": "Alonso Cordovilla", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Carlos Jose Montes Ricse (#23)
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
  'carlos.jose.montes.ricse@cabrerizos-fc.app',
  crypt('carlos23cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Carlos Jose", "surname": "Montes Ricse", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);