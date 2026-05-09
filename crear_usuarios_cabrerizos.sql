-- CREAR USUARIOS CABRERIZOS F.C. EN SUPABASE
-- Ejecutar en SQL Editor de Supabase

-- Alejandro García Martín (#1) - Portero
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
  'alejandro.garcía1@cabrerizosfc.com',
  crypt('alejandro1cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Alejandro García Martín", "role": "player", "number": 1, "position": "Portero"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Carlos Rodríguez Sánchez (#2) - Defensa
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
  'carlos.rodríguez2@cabrerizosfc.com',
  crypt('carlos2cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Carlos Rodríguez Sánchez", "role": "player", "number": 2, "position": "Defensa"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- David López Fernández (#3) - Defensa
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
  'david.lópez3@cabrerizosfc.com',
  crypt('david3cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "David López Fernández", "role": "player", "number": 3, "position": "Defensa"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Fernando Martín González (#4) - Defensa
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
  'fernando.martín4@cabrerizosfc.com',
  crypt('fernando4cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Fernando Martín González", "role": "player", "number": 4, "position": "Defensa"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Gabriel Sánchez Pérez (#5) - Defensa
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
  'gabriel.sánchez5@cabrerizosfc.com',
  crypt('gabriel5cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Gabriel Sánchez Pérez", "role": "player", "number": 5, "position": "Defensa"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Hugo Fernández Ruiz (#6) - Centrocampista
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
  'hugo.fernández6@cabrerizosfc.com',
  crypt('hugo6cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Hugo Fernández Ruiz", "role": "player", "number": 6, "position": "Centrocampista"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Iván Pérez Jiménez (#7) - Centrocampista
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
  'iván.pérez7@cabrerizosfc.com',
  crypt('iván7cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Iván Pérez Jiménez", "role": "player", "number": 7, "position": "Centrocampista"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Javier González Moreno (#8) - Centrocampista
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
  'javier.gonzález8@cabrerizosfc.com',
  crypt('javier8cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Javier González Moreno", "role": "player", "number": 8, "position": "Centrocampista"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Kevin Ruiz Herrera (#9) - Delantero
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
  'kevin.ruiz9@cabrerizosfc.com',
  crypt('kevin9cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Kevin Ruiz Herrera", "role": "player", "number": 9, "position": "Delantero"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Luis Jiménez Torres (#10) - Delantero
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
  'luis.jiménez10@cabrerizosfc.com',
  crypt('luis10cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Luis Jiménez Torres", "role": "player", "number": 10, "position": "Delantero"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Mario Moreno Vargas (#11) - Extremo
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
  'mario.moreno11@cabrerizosfc.com',
  crypt('mario11cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Mario Moreno Vargas", "role": "player", "number": 11, "position": "Extremo"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Nicolás Herrera Castro (#12) - Portero
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
  'nicolás.herrera12@cabrerizosfc.com',
  crypt('nicolás12cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Nicolás Herrera Castro", "role": "player", "number": 12, "position": "Portero"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Óscar Romero Ortega (#13) - Defensa
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
  'óscar.romero13@cabrerizosfc.com',
  crypt('óscar13cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Óscar Romero Ortega", "role": "player", "number": 13, "position": "Defensa"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Pablo Torres Ramos (#14) - Centrocampista
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
  'pablo.torres14@cabrerizosfc.com',
  crypt('pablo14cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Pablo Torres Ramos", "role": "player", "number": 14, "position": "Centrocampista"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Raúl Vargas Delgado (#15) - Centrocampista
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
  'raúl.vargas15@cabrerizosfc.com',
  crypt('raúl15cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Raúl Vargas Delgado", "role": "player", "number": 15, "position": "Centrocampista"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Sergio Castro Mendoza (#16) - Defensa
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
  'sergio.castro16@cabrerizosfc.com',
  crypt('sergio16cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Sergio Castro Mendoza", "role": "player", "number": 16, "position": "Defensa"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Tomás Ortega Silva (#17) - Extremo
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
  'tomás.ortega17@cabrerizosfc.com',
  crypt('tomás17cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Tomás Ortega Silva", "role": "player", "number": 17, "position": "Extremo"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Víctor Ramos Guerrero (#18) - Delantero
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
  'víctor.ramos18@cabrerizosfc.com',
  crypt('víctor18cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Víctor Ramos Guerrero", "role": "player", "number": 18, "position": "Delantero"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- William Delgado Vega (#19) - Centrocampista
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
  'william.delgado19@cabrerizosfc.com',
  crypt('william19cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "William Delgado Vega", "role": "player", "number": 19, "position": "Centrocampista"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Xavier Mendoza Blanco (#20) - Defensa
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
  'xavier.mendoza20@cabrerizosfc.com',
  crypt('xavier20cfc', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Xavier Mendoza Blanco", "role": "player", "number": 20, "position": "Defensa"}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Crear perfiles en tabla profiles
INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Alejandro García Martín', 'alejandro.garcía1@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'alejandro.garcía1@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Carlos Rodríguez Sánchez', 'carlos.rodríguez2@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'carlos.rodríguez2@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'David López Fernández', 'david.lópez3@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'david.lópez3@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Fernando Martín González', 'fernando.martín4@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'fernando.martín4@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Gabriel Sánchez Pérez', 'gabriel.sánchez5@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'gabriel.sánchez5@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Hugo Fernández Ruiz', 'hugo.fernández6@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'hugo.fernández6@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Iván Pérez Jiménez', 'iván.pérez7@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'iván.pérez7@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Javier González Moreno', 'javier.gonzález8@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'javier.gonzález8@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Kevin Ruiz Herrera', 'kevin.ruiz9@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'kevin.ruiz9@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Luis Jiménez Torres', 'luis.jiménez10@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'luis.jiménez10@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Mario Moreno Vargas', 'mario.moreno11@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'mario.moreno11@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Nicolás Herrera Castro', 'nicolás.herrera12@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'nicolás.herrera12@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Óscar Romero Ortega', 'óscar.romero13@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'óscar.romero13@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Pablo Torres Ramos', 'pablo.torres14@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'pablo.torres14@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Raúl Vargas Delgado', 'raúl.vargas15@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'raúl.vargas15@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Sergio Castro Mendoza', 'sergio.castro16@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'sergio.castro16@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Tomás Ortega Silva', 'tomás.ortega17@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'tomás.ortega17@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Víctor Ramos Guerrero', 'víctor.ramos18@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'víctor.ramos18@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'William Delgado Vega', 'william.delgado19@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'william.delgado19@cabrerizosfc.com';

INSERT INTO profiles (id, name, email, role, created_at, updated_at)
SELECT id, 'Xavier Mendoza Blanco', 'xavier.mendoza20@cabrerizosfc.com', 'player', NOW(), NOW()
FROM auth.users WHERE email = 'xavier.mendoza20@cabrerizosfc.com';

