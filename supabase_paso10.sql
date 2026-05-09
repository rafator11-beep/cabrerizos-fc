-- ============================================
-- PASO 10: Dar permisos a la función
-- ============================================

GRANT EXECUTE ON FUNCTION change_user_password(TEXT) TO authenticated;
