-- ============================================
-- PASO 6: Crear política para actualizar notificaciones
-- ============================================

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = player_id);
