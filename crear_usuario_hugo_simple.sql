-- Primero eliminar el usuario si existe
DELETE FROM auth.users WHERE email = 'hugo.lópez.garcía@cabrerizos-fc.app';

-- Crear usuario con método más simple
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
  raw_app_meta_data,
  raw_user_meta_data
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
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Hugo", "surname": "López García"}'
);