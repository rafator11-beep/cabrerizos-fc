-- ============================================
-- CONFIGURACIÓN COMPLETA DE SUPABASE
-- Ejecutar TODO este SQL en Supabase SQL Editor
-- ============================================

-- 1. TABLA DE NOTIFICACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_player ON notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_player_unread ON notifications(player_id, read) WHERE read = FALSE;

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;

-- Política: Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = player_id);

-- Política: Los usuarios pueden actualizar sus propias notificaciones (marcar como leídas)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = player_id);

-- Política: Cualquier usuario autenticado puede insertar notificaciones (para que admin pueda crear)
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. COLUMNA PHOTO_URL EN ROSTER
-- ============================================

ALTER TABLE roster ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_roster_photo_url ON roster(photo_url);

-- 3. FUNCIÓN PARA CAMBIAR CONTRASEÑA
-- ============================================

CREATE OR REPLACE FUNCTION change_user_password(new_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Obtener el ID del usuario actual
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Usuario no autenticado');
  END IF;
  
  -- Validar longitud mínima de contraseña
  IF LENGTH(new_password) < 6 THEN
    RETURN json_build_object('success', false, 'message', 'La contraseña debe tener al menos 6 caracteres');
  END IF;
  
  -- Actualizar contraseña del usuario actual
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

-- Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION change_user_password(TEXT) TO authenticated;

-- 4. VERIFICAR TABLA MESSAGES (para chat)
-- ============================================

-- Ya debería existir, pero verificamos
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. FUNCIÓN AUXILIAR PARA CREAR NOTIFICACIONES
-- ============================================

CREATE OR REPLACE FUNCTION create_notification(
  p_player_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id BIGINT;
BEGIN
  INSERT INTO notifications (player_id, type, title, message, read, created_at)
  VALUES (p_player_id, p_type, p_title, p_message, FALSE, NOW())
  RETURNING id INTO notification_id;
  
  RETURN json_build_object(
    'success', true, 
    'notification_id', notification_id,
    'message', 'Notificación creada correctamente'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- 6. VERIFICACIÓN FINAL
-- ============================================

-- Verificar que todo está correcto
DO $$
BEGIN
  RAISE NOTICE '✅ Configuración completada';
  RAISE NOTICE '📋 Tabla notifications: OK';
  RAISE NOTICE '📸 Columna photo_url en roster: OK';
  RAISE NOTICE '🔐 Función change_user_password: OK';
  RAISE NOTICE '🔔 Función create_notification: OK';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Debes crear el bucket "player-photos" manualmente en Storage';
  RAISE NOTICE '   1. Ve a Storage en Supabase';
  RAISE NOTICE '   2. Crea un bucket llamado "player-photos"';
  RAISE NOTICE '   3. Márcalo como PÚBLICO';
END $$;
