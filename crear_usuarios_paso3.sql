-- PASO 3: CREAR SIGUIENTES 5 USUARIOS
-- Ejecutar DESPUÉS del Paso 2

-- Carlos Martín Silva (#14)
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
  'carlos.martín.silva@cabrerizos-fc.app',
  crypt('carlos14cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Carlos", "surname": "Martín Silva", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Unai Rodríguez Ríos (#15)
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
  'unai.rodríguez.ríos@cabrerizos-fc.app',
  crypt('unai15cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Unai", "surname": "Rodríguez Ríos", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Daniel Alonso Gago (#16)
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
  'daniel.alonso.gago@cabrerizos-fc.app',
  crypt('daniel16cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Daniel", "surname": "Alonso Gago", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Álex Hernández Nicolás (#17)
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
  'álex.hernández.nicolás@cabrerizos-fc.app',
  crypt('álex17cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Álex", "surname": "Hernández Nicolás", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Iván Matías González (#18)
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
  'iván.matías.gonzález@cabrerizos-fc.app',
  crypt('iván18cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Iván Matías", "surname": "González", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);