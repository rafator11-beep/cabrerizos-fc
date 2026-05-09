/* Crear primeros 5 usuarios - Haritz González Delgado (#1) */
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
  'haritz.gonzález.delgado@cabrerizos-fc.app',
  crypt('haritz1cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Haritz", "surname": "González Delgado", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

/* Álvaro Delgado González (#2) */
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
  'álvaro.delgado.gonzález@cabrerizos-fc.app',
  crypt('álvaro2cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Álvaro", "surname": "Delgado González", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

/* Asier Marcos Riesco (#4) */
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
  'asier.marcos.riesco@cabrerizos-fc.app',
  crypt('asier4cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Asier", "surname": "Marcos Riesco", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

/* Hugo López García (#5) */
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
  'hugo.lópez.garcía@cabrerizos-fc.app',
  crypt('hugo5cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Hugo", "surname": "López García", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);

/* Gabriel Fraile Alguacil (#6) */
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
  'gabriel.fraile.alguacil@cabrerizos-fc.app',
  crypt('gabriel6cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Gabriel", "surname": "Fraile Alguacil", "role": "player"}',
  '{"provider": "email", "providers": ["email"]}'
);