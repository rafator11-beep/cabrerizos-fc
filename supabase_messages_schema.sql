-- Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Habilitar Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver mensajes donde son sender o receiver
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

-- Política: Los usuarios pueden insertar mensajes donde son el sender
CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Política: Los usuarios pueden actualizar mensajes donde son el receiver (para marcar como leído)
CREATE POLICY "Users can update received messages"
  ON messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Política: Los usuarios pueden eliminar sus propios mensajes enviados
CREATE POLICY "Users can delete their sent messages"
  ON messages
  FOR DELETE
  USING (auth.uid() = sender_id);
