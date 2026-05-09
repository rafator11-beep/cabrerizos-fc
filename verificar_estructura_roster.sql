-- Verificar estructura de la tabla roster
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'roster'
ORDER BY ordinal_position;

-- Ver los primeros 3 registros con todos los campos
SELECT *
FROM roster
ORDER BY number
LIMIT 3;
