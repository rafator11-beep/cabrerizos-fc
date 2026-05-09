-- ============================================
-- PASO 2: Crear índices para notificaciones
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notifications_player ON notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
