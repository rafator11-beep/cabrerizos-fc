INSERT INTO profiles (id, name, surname, role, created_at)
SELECT id, 'Hugo', 'López García', 'player', NOW()
FROM auth.users WHERE email = 'hugo.lópez.garcía@cabrerizos-fc.app';