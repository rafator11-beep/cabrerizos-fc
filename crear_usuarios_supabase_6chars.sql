-- SCRIPT PARA CREAR USUARIOS EN SUPABASE
-- URL: https://yaltxcmspsvnhnxomhwa.supabase.co
-- Ejecutar en SQL Editor de Supabase Dashboard

-- Haritz González Delgado (#1)
-- Contraseña: haritz1cfc (10 chars)
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

-- Álvaro Delgado González (#2)
-- Contraseña: álvaro2cfc (10 chars)
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

-- Asier Marcos Riesco (#4)
-- Contraseña: asier4cfc (9 chars)
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

-- Hugo López García (#5)
-- Contraseña: hugo5cfc (8 chars)
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

-- Gabriel Fraile Alguacil (#6)
-- Contraseña: gabriel6cfc (11 chars)
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

-- Héctor Cáceres Marcos (#7)
-- Contraseña: héctor7cfc (10 chars)
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
-- Contraseña: iván9cfc (8 chars)
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
-- Contraseña: aarón10cfc (10 chars)
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
-- Contraseña: ricardo11cfc (12 chars)
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
-- Contraseña: david12cfc (10 chars)
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

-- Carlos Martín Silva (#14)
-- Contraseña: carlos14cfc (11 chars)
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
-- Contraseña: unai15cfc (9 chars)
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
-- Contraseña: daniel16cfc (11 chars)
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
-- Contraseña: álex17cfc (9 chars)
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
-- Contraseña: iván18cfc (9 chars)
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

-- Raúl Rodríguez Morán (#19)
-- Contraseña: raúl19cfc (9 chars)
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
-- Contraseña: juan20cfc (9 chars)
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
-- Contraseña: guillermo21cfc (14 chars)
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
-- Contraseña: jorge22cfc (10 chars)
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
-- Contraseña: carlos23cfc (11 chars)
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

-- Crear perfiles en tabla profiles
INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Haritz', 'González Delgado', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'haritz.gonzález.delgado@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Álvaro', 'Delgado González', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'álvaro.delgado.gonzález@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Asier', 'Marcos Riesco', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'asier.marcos.riesco@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Hugo', 'López García', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'hugo.lópez.garcía@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Gabriel', 'Fraile Alguacil', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'gabriel.fraile.alguacil@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Héctor', 'Cáceres Marcos', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'héctor.cáceres.marcos@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Iván', 'Martín Cañizal', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'iván.martín.cañizal@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Aarón Gabriel', 'García', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'aarón.gabriel.garcía@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Ricardo André', 'Romero Chiuz', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'ricardo.andré.romero.chiuz@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'David Mario', 'Hidalgo Vizcaíno', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'david.mario.hidalgo.vizcaíno@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Carlos', 'Martín Silva', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'carlos.martín.silva@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Unai', 'Rodríguez Ríos', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'unai.rodríguez.ríos@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Daniel', 'Alonso Gago', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'daniel.alonso.gago@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Álex', 'Hernández Nicolás', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'álex.hernández.nicolás@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Iván Matías', 'González', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'iván.matías.gonzález@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Raúl', 'Rodríguez Morán', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'raúl.rodríguez.morán@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Juan', 'Vicente Hernández', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'juan.vicente.hernández@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Guillermo', 'Domínguez García', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'guillermo.domínguez.garcía@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Jorge', 'Alonso Cordovilla', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'jorge.alonso.cordovilla@cabrerizos-fc.app';

INSERT INTO profiles (id, name, surname, role, created_at, updated_at)
SELECT id, 'Carlos Jose', 'Montes Ricse', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'carlos.jose.montes.ricse@cabrerizos-fc.app';

-- Enlazar con tabla roster (ejecutar después de crear usuarios)
-- Enlazar Haritz González Delgado con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'haritz.gonzález.delgado@cabrerizos-fc.app'
) WHERE number = 1;

-- Enlazar Álvaro Delgado González con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'álvaro.delgado.gonzález@cabrerizos-fc.app'
) WHERE number = 2;

-- Enlazar Asier Marcos Riesco con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'asier.marcos.riesco@cabrerizos-fc.app'
) WHERE number = 4;

-- Enlazar Hugo López García con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'hugo.lópez.garcía@cabrerizos-fc.app'
) WHERE number = 5;

-- Enlazar Gabriel Fraile Alguacil con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'gabriel.fraile.alguacil@cabrerizos-fc.app'
) WHERE number = 6;

-- Enlazar Héctor Cáceres Marcos con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'héctor.cáceres.marcos@cabrerizos-fc.app'
) WHERE number = 7;

-- Enlazar Iván Martín Cañizal con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'iván.martín.cañizal@cabrerizos-fc.app'
) WHERE number = 9;

-- Enlazar Aarón Gabriel García con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'aarón.gabriel.garcía@cabrerizos-fc.app'
) WHERE number = 10;

-- Enlazar Ricardo André Romero Chiuz con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'ricardo.andré.romero.chiuz@cabrerizos-fc.app'
) WHERE number = 11;

-- Enlazar David Mario Hidalgo Vizcaíno con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'david.mario.hidalgo.vizcaíno@cabrerizos-fc.app'
) WHERE number = 12;

-- Enlazar Carlos Martín Silva con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'carlos.martín.silva@cabrerizos-fc.app'
) WHERE number = 14;

-- Enlazar Unai Rodríguez Ríos con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'unai.rodríguez.ríos@cabrerizos-fc.app'
) WHERE number = 15;

-- Enlazar Daniel Alonso Gago con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'daniel.alonso.gago@cabrerizos-fc.app'
) WHERE number = 16;

-- Enlazar Álex Hernández Nicolás con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'álex.hernández.nicolás@cabrerizos-fc.app'
) WHERE number = 17;

-- Enlazar Iván Matías González con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'iván.matías.gonzález@cabrerizos-fc.app'
) WHERE number = 18;

-- Enlazar Raúl Rodríguez Morán con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'raúl.rodríguez.morán@cabrerizos-fc.app'
) WHERE number = 19;

-- Enlazar Juan Vicente Hernández con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'juan.vicente.hernández@cabrerizos-fc.app'
) WHERE number = 20;

-- Enlazar Guillermo Domínguez García con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'guillermo.domínguez.garcía@cabrerizos-fc.app'
) WHERE number = 21;

-- Enlazar Jorge Alonso Cordovilla con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'jorge.alonso.cordovilla@cabrerizos-fc.app'
) WHERE number = 22;

-- Enlazar Carlos Jose Montes Ricse con roster
UPDATE roster SET auth_profile_id = (
  SELECT id FROM auth.users WHERE email = 'carlos.jose.montes.ricse@cabrerizos-fc.app'
) WHERE number = 23;

