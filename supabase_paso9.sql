-- ============================================
-- PASO 9: Crear función para cambiar contraseña
-- ============================================

CREATE OR REPLACE FUNCTION change_user_password(new_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Usuario no autenticado');
  END IF;
  
  IF LENGTH(new_password) < 6 THEN
    RETURN json_build_object('success', false, 'message', 'La contraseña debe tener al menos 6 caracteres');
  END IF;
  
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN json_build_object('success', true, 'message', 'Contraseña actualizada correctamente');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;
