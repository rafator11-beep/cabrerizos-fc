# 📋 EJECUTAR SQL EN SUPABASE - PASO A PASO

## ⚠️ IMPORTANTE: Ejecuta los archivos EN ORDEN

He dividido el SQL en 10 pasos pequeños para evitar errores.

---

## 🔢 ORDEN DE EJECUCIÓN:

### PASO 1: Crear tabla notifications
**Archivo:** `supabase_paso1.sql`
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 2: Crear índices
**Archivo:** `supabase_paso2.sql`
```sql
CREATE INDEX IF NOT EXISTS idx_notifications_player ON notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 3: Activar RLS
**Archivo:** `supabase_paso3.sql`
```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 4: Eliminar políticas antiguas
**Archivo:** `supabase_paso4.sql`
```sql
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
```
✅ Ejecuta → Debe decir "Success" (aunque no existan)

---

### PASO 5: Política para ver notificaciones
**Archivo:** `supabase_paso5.sql`
```sql
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = player_id);
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 6: Política para actualizar notificaciones
**Archivo:** `supabase_paso6.sql`
```sql
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = player_id);
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 7: Política para insertar notificaciones
**Archivo:** `supabase_paso7.sql`
```sql
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 8: Agregar columna photo_url
**Archivo:** `supabase_paso8.sql`
```sql
ALTER TABLE roster ADD COLUMN IF NOT EXISTS photo_url TEXT;
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 9: Crear función cambiar contraseña
**Archivo:** `supabase_paso9.sql`
```sql
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
```
✅ Ejecuta → Debe decir "Success"

---

### PASO 10: Dar permisos a la función
**Archivo:** `supabase_paso10.sql`
```sql
GRANT EXECUTE ON FUNCTION change_user_password(TEXT) TO authenticated;
```
✅ Ejecuta → Debe decir "Success"

---

## ✅ VERIFICACIÓN FINAL

Después de ejecutar todos los pasos, verifica que todo está bien:

```sql
-- Verificar que la tabla existe
SELECT COUNT(*) FROM notifications;

-- Verificar que la columna existe
SELECT photo_url FROM roster LIMIT 1;

-- Verificar que la función existe
SELECT proname FROM pg_proc WHERE proname = 'change_user_password';
```

Debe devolver resultados sin errores.

---

## 🎯 CÓMO EJECUTAR:

1. Ve a Supabase → SQL Editor
2. Abre cada archivo `supabase_pasoX.sql` en orden
3. Copia el contenido
4. Pégalo en SQL Editor
5. Haz clic en "Run"
6. Verifica que diga "Success"
7. Continúa con el siguiente paso

---

## ❌ SI ALGO FALLA:

- **Error "relation already exists"**: Está bien, significa que ya existe. Continúa.
- **Error "policy already exists"**: Está bien, significa que ya existe. Continúa.
- **Error "column already exists"**: Está bien, significa que ya existe. Continúa.
- **Cualquier otro error**: Copia el error completo y envíamelo.

---

## 🎉 CUANDO TERMINES:

1. Limpia la caché del navegador (Ctrl+Shift+N para incógnito)
2. Ve a: https://rafator11-beep.github.io/cabrerizos-fc/
3. Inicia sesión
4. Verás la campana 🔔 en el header
5. ¡Las notificaciones funcionarán!

---

**IMPORTANTE**: Ejecuta los pasos EN ORDEN del 1 al 10.
