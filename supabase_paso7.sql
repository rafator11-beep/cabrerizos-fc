-- ============================================
-- PASO 7: Crear política para insertar notificaciones
-- ============================================

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
