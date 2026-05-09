SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'hugo.lópez.garcía@cabrerizos-fc.app';