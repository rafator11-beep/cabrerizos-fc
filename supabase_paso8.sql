-- ============================================
-- PASO 8: Agregar columna photo_url a roster
-- ============================================

ALTER TABLE roster ADD COLUMN IF NOT EXISTS photo_url TEXT;
