-- SCRIPT PARA VERIFICAR QUE LOS USUARIOS FUERON CREADOS CORRECTAMENTE
-- Ejecutar en SQL Editor de Supabase después de crear los usuarios

-- 1. Verificar usuarios en auth.users
SELECT 
  email,
  created_at,
  email_confirmed_at IS NOT NULL as confirmed,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'surname' as surname
FROM auth.users 
WHERE email LIKE '%@cabrerizos-fc.app'
ORDER BY email;

-- 2. Verificar perfiles creados
SELECT 
  name,
  surname,
  role,
  created_at
FROM profiles 
WHERE role = 'player'
ORDER BY name;

-- 3. Verificar enlaces con roster
SELECT 
  r.number,
  r.name,
  r.surname,
  r.auth_profile_id IS NOT NULL as linked,
  p.name as profile_name
FROM roster r
LEFT JOIN profiles p ON r.auth_profile_id = p.id
ORDER BY r.number;

-- 4. Contar totales
SELECT 
  'auth.users' as tabla,
  COUNT(*) as total
FROM auth.users 
WHERE email LIKE '%@cabrerizos-fc.app'

UNION ALL

SELECT 
  'profiles' as tabla,
  COUNT(*) as total
FROM profiles 
WHERE role = 'player'

UNION ALL

SELECT 
  'roster linked' as tabla,
  COUNT(*) as total
FROM roster 
WHERE auth_profile_id IS NOT NULL;

-- RESULTADO ESPERADO:
-- - 20 usuarios en auth.users
-- - 20 perfiles en profiles  
-- - 20 enlaces en roster
-- Si algún número es diferente, hay un problema