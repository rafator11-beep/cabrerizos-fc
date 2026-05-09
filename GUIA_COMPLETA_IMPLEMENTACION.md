# 🚀 GUÍA COMPLETA DE IMPLEMENTACIÓN

## RESUMEN EJECUTIVO

Este documento contiene TODA la implementación de las mejoras solicitadas:

1. ✨ PlayerDashboard espectacular rediseñado
2. 🔔 Sistema de notificaciones completo
3. 📝 Notificaciones de alineación
4. 📺 Botón TV (modo presentación)
5. 🔍 Revisión y corrección de botones

---

## 📦 ARCHIVOS QUE SE VAN A CREAR/MODIFICAR:

### Nuevos Archivos:
1. `src/components/NotificationBell.jsx` - Campana de notificaciones
2. `src/components/PhotoUploadModal.jsx` - Modal para subir foto
3. `src/components/TVModeButton.jsx` - Botón modo TV
4. `src/pages/PlayerDashboard_v2.jsx` - Dashboard rediseñado

### Archivos a Modificar:
1. `src/pages/PlayerDashboard.jsx` - Reemplazar completamente
2. `src/pages/DashboardLayout.jsx` - Agregar campana de notificaciones
3. `src/pages/Alineacion.jsx` - Agregar notificaciones de comentarios
4. `src/pages/Tactica.jsx` - Agregar botón TV
5. `src/components/ChatSystem.jsx` - Ya tiene notificaciones (verificar)

### SQL a Ejecutar en Supabase:
1. Agregar columna `photo_url` a tabla `roster` (si no existe)
2. Crear función para cambiar contraseña
3. Verificar tabla `notifications` existe

---

## 🗄️ PASO 1: SQL EN SUPABASE

Ejecuta estos comandos en Supabase SQL Editor:

```sql
-- 1. Verificar/agregar columna photo_url en roster
ALTER TABLE roster ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Crear función para cambiar contraseña
CREATE OR REPLACE FUNCTION change_user_password(new_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Actualizar contraseña del usuario actual
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = auth.uid();
  
  RETURN json_build_object('success', true, 'message', 'Contraseña actualizada correctamente');
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;

-- 3. Verificar tabla notifications existe (ya debería existir)
-- Si no existe, crearla:
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_player ON notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = player_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = player_id);
```

---

## 📝 IMPLEMENTACIÓN COMPLETA

Ahora voy a implementar TODO el código...

