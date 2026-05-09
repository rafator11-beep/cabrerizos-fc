-- CREAR USUARIOS REALES CABRERIZOS F.C. EN SUPABASE
-- Ejecutar en SQL Editor de Supabase Dashboard

-- Haritz González Delgado (#1)
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
  'haritz.gonzalez1@cabrerizosfc.com',
  crypt('haritz1cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Haritz González Delgado", "role": "player", "number": 1}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Álvaro Delgado González (#2)
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
  'alvaro.delgado2@cabrerizosfc.com',
  crypt('alvaro2cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Álvaro Delgado González", "role": "player", "number": 2}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Asier Marcos Riesco (#4)
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
  'asier.marcos4@cabrerizosfc.com',
  crypt('asier4cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Asier Marcos Riesco", "role": "player", "number": 4}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Hugo López García (#5)
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
  'hugo.lopez5@cabrerizosfc.com',
  crypt('hugo5cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Hugo López García", "role": "player", "number": 5}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Gabriel Fraile Alguacil (#6)
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
  'gabriel.fraile6@cabrerizosfc.com',
  crypt('gabriel6cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Gabriel Fraile Alguacil", "role": "player", "number": 6}',
  '{"provider": "email", "providers": ["email"]}'
);

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
  'hector.caceres7@cabrerizosfc.com',
  crypt('hector7cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Héctor Cáceres Marcos", "role": "player", "number": 7}',
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
  'ivan.martin9@cabrerizosfc.com',
  crypt('ivan9cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Iván Martín Cañizal", "role": "player", "number": 9}',
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
  'aarongabriel.garcia10@cabrerizosfc.com',
  crypt('aaron10cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Aarón Gabriel García", "role": "player", "number": 10}',
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
  'ricardoandre.romero11@cabrerizosfc.com',
  crypt('ricardo11cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Ricardo André Romero Chiuz", "role": "player", "number": 11}',
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
  'davidmario.hidalgo12@cabrerizosfc.com',
  crypt('david12cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "David Mario Hidalgo Vizcaíno", "role": "player", "number": 12}',
  '{"provider": "email", "providers": ["email"]}'
);

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
  'carlos.martin14@cabrerizosfc.com',
  crypt('carlos14cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Carlos Martín Silva", "role": "player", "number": 14}',
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
  'unai.rodriguez15@cabrerizosfc.com',
  crypt('unai15cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Unai Rodríguez Ríos", "role": "player", "number": 15}',
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
  'daniel.alonso16@cabrerizosfc.com',
  crypt('daniel16cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Daniel Alonso Gago", "role": "player", "number": 16}',
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
  'alex.hernandez17@cabrerizosfc.com',
  crypt('alex17cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Álex Hernández Nicolás", "role": "player", "number": 17}',
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
  'ivanmatias.gonzalez18@cabrerizosfc.com',
  crypt('ivan18cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Iván Matías González", "role": "player", "number": 18}',
  '{"provider": "email", "providers": ["email"]}'
);

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
  'raul.rodriguez19@cabrerizosfc.com',
  crypt('raul19cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Raúl Rodríguez Morán", "role": "player", "number": 19}',
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
  'juanvicente.hernandez20@cabrerizosfc.com',
  crypt('juan20cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Juan Vicente Hernández", "role": "player", "number": 20}',
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
  'guillermo.dominguez21@cabrerizosfc.com',
  crypt('guillermo21cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Guillermo Domínguez García", "role": "player", "number": 21}',
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
  'jorge.alonso22@cabrerizosfc.com',
  crypt('jorge22cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Jorge Alonso Cordovilla", "role": "player", "number": 22}',
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
  'carlosjose.montes23@cabrerizosfc.com',
  crypt('carlos23cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Carlos Jose Montes Ricse", "role": "player", "number": 23}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Crear perfiles en tabla profiles
INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Haritz González Delgado', 'haritz.gonzalez1@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'haritz.gonzalez1@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Álvaro Delgado González', 'alvaro.delgado2@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'alvaro.delgado2@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Asier Marcos Riesco', 'asier.marcos4@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'asier.marcos4@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Hugo López García', 'hugo.lopez5@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'hugo.lopez5@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Gabriel Fraile Alguacil', 'gabriel.fraile6@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'gabriel.fraile6@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Héctor Cáceres Marcos', 'hector.caceres7@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'hector.caceres7@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Iván Martín Cañizal', 'ivan.martin9@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'ivan.martin9@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Aarón Gabriel García', 'aarongabriel.garcia10@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'aarongabriel.garcia10@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Ricardo André Romero Chiuz', 'ricardoandre.romero11@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'ricardoandre.romero11@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'David Mario Hidalgo Vizcaíno', 'davidmario.hidalgo12@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'davidmario.hidalgo12@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Carlos Martín Silva', 'carlos.martin14@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'carlos.martin14@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Unai Rodríguez Ríos', 'unai.rodriguez15@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'unai.rodriguez15@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Daniel Alonso Gago', 'daniel.alonso16@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'daniel.alonso16@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Álex Hernández Nicolás', 'alex.hernandez17@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'alex.hernandez17@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Iván Matías González', 'ivanmatias.gonzalez18@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'ivanmatias.gonzalez18@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Raúl Rodríguez Morán', 'raul.rodriguez19@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'raul.rodriguez19@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Juan Vicente Hernández', 'juanvicente.hernandez20@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'juanvicente.hernandez20@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Guillermo Domínguez García', 'guillermo.dominguez21@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'guillermo.dominguez21@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Jorge Alonso Cordovilla', 'jorge.alonso22@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'jorge.alonso22@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Carlos Jose Montes Ricse', 'carlosjose.montes23@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'carlosjose.montes23@cabrerizosfc.com';

