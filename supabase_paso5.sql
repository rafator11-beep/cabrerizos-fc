-- ============================================
-- PASO 5: Crear política para ver notificaciones
-- ============================================

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = player_id);
