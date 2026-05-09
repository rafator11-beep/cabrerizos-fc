-- CONFIGURACIÓN DE STORAGE PARA FOTOS DE JUGADORES

-- IMPORTANTE: Este SQL debe ejecutarse en Supabase SQL Editor
-- Pero el bucket debe crearse desde la interfaz de Storage

-- PASOS MANUALES EN SUPABASE:
-- 1. Ve a Storage en el menú lateral
-- 2. Haz clic en "Create bucket"
-- 3. Nombre: player-photos
-- 4. Public bucket: SÍ (marcar como público)
-- 5. Haz clic en "Create bucket"

-- Una vez creado el bucket, ejecuta este SQL para las políticas:

-- Política para que los usuarios puedan subir sus propias fotos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'player-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que los usuarios puedan actualizar sus propias fotos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'player-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que los usuarios puedan eliminar sus propias fotos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'player-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que todos puedan ver las fotos (bucket público)
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'player-photos');

-- Verificar que la columna photo_url existe en roster
ALTER TABLE roster ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_roster_photo_url ON roster(photo_url);
