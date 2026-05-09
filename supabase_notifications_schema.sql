-- Tabla para notificaciones de jugadores
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES roster(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general', -- 'lineup', 'training', 'general', 'match'
  lineup_id UUID REFERENCES lineups(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadir campos a la tabla lineups para capitán y comentarios
ALTER TABLE lineups 
ADD COLUMN IF NOT EXISTS captain_id UUID REFERENCES roster(id),
ADD COLUMN IF NOT EXISTS player_comments JSONB DEFAULT '{}';

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_player_id ON notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_lineups_captain_id ON lineups(captain_id);

-- RLS (Row Level Security) para notificaciones
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los jugadores solo vean sus propias notificaciones
CREATE POLICY "Players can view own notifications" ON notifications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.player_id = notifications.player_id
    )
  );

-- Política para que los admins puedan crear notificaciones
CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Política para que los jugadores puedan marcar como leídas sus notificaciones
CREATE POLICY "Players can update own notifications" ON notifications
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT profiles.id FROM profiles 
      WHERE profiles.player_id = notifications.player_id
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para notifications
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios en las tablas
COMMENT ON TABLE notifications IS 'Notificaciones para jugadores sobre alineaciones, entrenamientos, etc.';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: lineup, training, general, match';
COMMENT ON COLUMN notifications.lineup_id IS 'ID de la alineación relacionada (si aplica)';
COMMENT ON COLUMN lineups.captain_id IS 'ID del jugador designado como capitán';
COMMENT ON COLUMN lineups.player_comments IS 'Comentarios específicos para cada jugador en formato JSON';