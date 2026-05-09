-- SCRIPT PARA CREAR USUARIOS EN SUPABASE AUTH
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- Usuario: Alejandro García (#1)
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
  'alejandro.garcía.1@cabrerizosfc.com',
  crypt('CFCalejandro12026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Alejandro García", "role": "player", "number": 1}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Carlos Rodríguez (#2)
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
  'carlos.rodríguez.2@cabrerizosfc.com',
  crypt('CFCcarlos22026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Carlos Rodríguez", "role": "player", "number": 2}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: David López (#3)
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
  'david.lópez.3@cabrerizosfc.com',
  crypt('CFCdavid32026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "David López", "role": "player", "number": 3}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Fernando Martín (#4)
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
  'fernando.martín.4@cabrerizosfc.com',
  crypt('CFCfernando42026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Fernando Martín", "role": "player", "number": 4}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Gabriel Sánchez (#5)
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
  'gabriel.sánchez.5@cabrerizosfc.com',
  crypt('CFCgabriel52026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Gabriel Sánchez", "role": "player", "number": 5}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Hugo Fernández (#6)
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
  'hugo.fernández.6@cabrerizosfc.com',
  crypt('CFChugo62026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Hugo Fernández", "role": "player", "number": 6}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Iván Pérez (#7)
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
  'iván.pérez.7@cabrerizosfc.com',
  crypt('CFCiván72026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Iván Pérez", "role": "player", "number": 7}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Javier González (#8)
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
  'javier.gonzález.8@cabrerizosfc.com',
  crypt('CFCjavier82026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Javier González", "role": "player", "number": 8}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Kevin Ruiz (#9)
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
  'kevin.ruiz.9@cabrerizosfc.com',
  crypt('CFCkevin92026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Kevin Ruiz", "role": "player", "number": 9}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Luis Jiménez (#10)
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
  'luis.jiménez.10@cabrerizosfc.com',
  crypt('CFCluis102026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Luis Jiménez", "role": "player", "number": 10}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Mario Moreno (#11)
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
  'mario.moreno.11@cabrerizosfc.com',
  crypt('CFCmario112026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Mario Moreno", "role": "player", "number": 11}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Nicolás Herrera (#12)
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
  'nicolás.herrera.12@cabrerizosfc.com',
  crypt('CFCnicolás122026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Nicolás Herrera", "role": "player", "number": 12}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Óscar Romero (#13)
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
  'óscar.romero.13@cabrerizosfc.com',
  crypt('CFCóscar132026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Óscar Romero", "role": "player", "number": 13}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Pablo Torres (#14)
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
  'pablo.torres.14@cabrerizosfc.com',
  crypt('CFCpablo142026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Pablo Torres", "role": "player", "number": 14}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Raúl Vargas (#15)
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
  'raúl.vargas.15@cabrerizosfc.com',
  crypt('CFCraúl152026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Raúl Vargas", "role": "player", "number": 15}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Sergio Castro (#16)
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
  'sergio.castro.16@cabrerizosfc.com',
  crypt('CFCsergio162026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Sergio Castro", "role": "player", "number": 16}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Tomás Ortega (#17)
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
  'tomás.ortega.17@cabrerizosfc.com',
  crypt('CFCtomás172026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Tomás Ortega", "role": "player", "number": 17}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Víctor Ramos (#18)
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
  'víctor.ramos.18@cabrerizosfc.com',
  crypt('CFCvíctor182026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Víctor Ramos", "role": "player", "number": 18}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: William Delgado (#19)
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
  'william.delgado.19@cabrerizosfc.com',
  crypt('CFCwilliam192026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "William Delgado", "role": "player", "number": 19}',
  '{"provider": "email", "providers": ["email"]}'
);

-- Usuario: Xavier Mendoza (#20)
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
  'xavier.mendoza.20@cabrerizosfc.com',
  crypt('CFCxavier202026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"name": "Xavier Mendoza", "role": "player", "number": 20}',
  '{"provider": "email", "providers": ["email"]}'
);

