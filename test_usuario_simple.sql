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