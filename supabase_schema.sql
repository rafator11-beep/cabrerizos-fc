-- ==========================================
-- CABRERIZOS FC - SUPABASE DATABASE SCHEMA
-- ==========================================
-- Run this SQL in your Supabase SQL Editor.
-- Project: yaltxcmspsvnhnxomhwa

-- 1. Create Profiles Table (expanded for Plantilla)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'player', -- 'admin' or 'player'
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  position TEXT DEFAULT '',
  number INTEGER,
  photo_url TEXT DEFAULT '',
  stats JSONB NOT NULL DEFAULT '{}'::jsonb, -- {goals, assists, yellow_cards, red_cards, matches_played, etc.}
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Create Plays Table (Pizarra Táctica) with category support
CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- 'corners', 'free_kicks_for', 'free_kicks_against', 'build_up', 'set_pieces', 'general'
  type TEXT NOT NULL DEFAULT 'Táctica',
  tokens JSONB NOT NULL DEFAULT '[]'::jsonb,
  arrows JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE plays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Plays viewable by everyone" ON plays;
DROP POLICY IF EXISTS "Admins can insert plays" ON plays;
DROP POLICY IF EXISTS "Admins can update plays" ON plays;
DROP POLICY IF EXISTS "Admins can delete plays" ON plays;

CREATE POLICY "Plays viewable by everyone" ON plays
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert plays" ON plays
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update plays" ON plays
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete plays" ON plays
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Create Trainings Table (Entrenamientos)
CREATE TABLE IF NOT EXISTS trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration INTEGER DEFAULT 90, -- minutes
  intensity TEXT DEFAULT 'media', -- 'baja', 'media', 'alta'
  objective TEXT DEFAULT '',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{name, description, duration, category}]
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trainings viewable by everyone" ON trainings;
DROP POLICY IF EXISTS "Admins can insert trainings" ON trainings;
DROP POLICY IF EXISTS "Admins can update trainings" ON trainings;
DROP POLICY IF EXISTS "Admins can delete trainings" ON trainings;

CREATE POLICY "Trainings viewable by everyone" ON trainings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert trainings" ON trainings
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update trainings" ON trainings
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete trainings" ON trainings
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Create Training Scores (Puntuaciones de entrenamiento)
CREATE TABLE IF NOT EXISTS training_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES trainings(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES profiles(id) NOT NULL,
  score INTEGER DEFAULT 5, -- 1-10
  comment TEXT DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{label, value}] custom items
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(training_id, player_id)
);

ALTER TABLE training_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Scores viewable by admins and player" ON training_scores;
DROP POLICY IF EXISTS "Admins can insert scores" ON training_scores;
DROP POLICY IF EXISTS "Admins can update scores" ON training_scores;

CREATE POLICY "Scores viewable by admins and player" ON training_scores
  FOR SELECT USING (
    auth.uid() = player_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert scores" ON training_scores
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update scores" ON training_scores
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Create Technique Table (Técnica - exercises/videos for players)
CREATE TABLE IF NOT EXISTS technique (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'general', -- 'control', 'passing', 'shooting', 'dribbling', 'defending', 'heading', 'general'
  video_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  tips JSONB NOT NULL DEFAULT '[]'::jsonb, -- ["tip1", "tip2"]
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE technique ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Technique viewable by everyone" ON technique;
DROP POLICY IF EXISTS "Admins can insert technique" ON technique;
DROP POLICY IF EXISTS "Admins can update technique" ON technique;
DROP POLICY IF EXISTS "Admins can delete technique" ON technique;

CREATE POLICY "Technique viewable by everyone" ON technique
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert technique" ON technique
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update technique" ON technique
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete technique" ON technique
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Create Lineups Table (Alineaciones)
CREATE TABLE IF NOT EXISTS lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g. 'Jornada 12 vs Villamayor'
  formation TEXT DEFAULT '4-3-3',
  match_date DATE,
  starters JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{player_id, x, y, number}]
  substitutes JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{player_id, number}]
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lineups viewable by everyone" ON lineups;
DROP POLICY IF EXISTS "Admins can insert lineups" ON lineups;
DROP POLICY IF EXISTS "Admins can update lineups" ON lineups;
DROP POLICY IF EXISTS "Admins can delete lineups" ON lineups;

CREATE POLICY "Lineups viewable by everyone" ON lineups
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert lineups" ON lineups
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update lineups" ON lineups
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete lineups" ON lineups
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7. Feedback Table (kept from original)
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'exercise_suggestion', 'session_comment'
  content TEXT NOT NULL,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feedback viewable by admins and author" ON feedback;
DROP POLICY IF EXISTS "Players can insert feedback" ON feedback;

CREATE POLICY "Feedback viewable by admins and author" ON feedback
  FOR SELECT USING (
    auth.uid() = player_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Players can insert feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- 8. Add missing columns to existing tables (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='photo_url') THEN
    ALTER TABLE profiles ADD COLUMN photo_url TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='stats') THEN
    ALTER TABLE profiles ADD COLUMN stats JSONB NOT NULL DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plays' AND column_name='category') THEN
    ALTER TABLE plays ADD COLUMN category TEXT NOT NULL DEFAULT 'general';
  END IF;
END $$;

-- ==========================================
-- 9. ROSTER TABLE (Plantilla independiente de auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  number INTEGER,
  position TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_starter BOOLEAN DEFAULT true,
  auth_profile_id UUID, -- se vincula cuando el jugador se registra
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE roster ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Roster viewable by everyone" ON roster;
DROP POLICY IF EXISTS "Admins can insert roster" ON roster;
DROP POLICY IF EXISTS "Admins can update roster" ON roster;
DROP POLICY IF EXISTS "Admins can delete roster" ON roster;
DROP POLICY IF EXISTS "Anyone can update roster" ON roster;
DROP POLICY IF EXISTS "Anyone can insert roster" ON roster;

CREATE POLICY "Roster viewable by everyone" ON roster
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert roster" ON roster
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update roster" ON roster
  FOR UPDATE USING (true);

CREATE POLICY "Admins can delete roster" ON roster
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ==========================================
-- 10. SEED: Pre-cargar plantilla Cabrerizos FC
-- ==========================================
-- Solo ejecutar una vez. Si ya existe algún jugador, no duplicar.
INSERT INTO roster (name, surname, number, is_starter, position, stats) VALUES
  -- TITULARES CON FICHA FEDERATIVA
  ('Haritz', 'González Delgado', 1, true, 'Portero',
    '{"goals":1,"assists":0,"yellow_cards":1,"red_cards":0,"matches_played":20,"starts":18,"sub_appearances":2,"minutes":1599,"rating":4.95,"birth_date":"2007-06-22","age":18,"laterality":"Desconocido","club_origin":""}'::jsonb),
  ('Álvaro', 'Delgado González', 2, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":0,"starts":0,"sub_appearances":0,"minutes":0,"rating":0,"birth_date":"","age":0,"laterality":"","club_origin":""}'::jsonb),
  ('Asier', 'Marcos Riesco', 4, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":1,"matches_played":19,"starts":16,"sub_appearances":3,"minutes":1431,"rating":4.84,"birth_date":"2009-09-17","age":16,"laterality":"Derecho","club_origin":"Villares de la Reina"}'::jsonb),
  ('Hugo', 'López García', 5, true, '',
    '{"goals":0,"assists":0,"yellow_cards":6,"red_cards":0,"matches_played":19,"starts":18,"sub_appearances":1,"minutes":1619,"rating":4.89,"birth_date":"2009-10-13","age":16,"laterality":"Derecho","club_origin":"UDSalamanca"}'::jsonb),
  ('Gabriel', 'Fraile Alguacil', 6, true, '',
    '{"goals":3,"assists":1,"yellow_cards":0,"red_cards":0,"matches_played":14,"starts":14,"sub_appearances":0,"minutes":1169,"rating":4.93,"birth_date":"2009-11-04","age":16,"laterality":"Derecho","club_origin":"Cristo Rey"}'::jsonb),
  ('Iván', 'Martín Cañizal', 9, true, '',
    '{"goals":0,"assists":0,"yellow_cards":1,"red_cards":0,"matches_played":17,"starts":12,"sub_appearances":5,"minutes":996,"rating":4.88,"birth_date":"","age":0,"laterality":"Desconocido","club_origin":""}'::jsonb),
  ('Aarón', 'Gabriel García', 10, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":0,"starts":0,"sub_appearances":0,"minutes":0,"rating":0,"birth_date":"","age":0,"laterality":"","club_origin":""}'::jsonb),
  ('Ricardo André', 'Romero Chiuz', 11, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":19,"starts":7,"sub_appearances":12,"minutes":619,"rating":4.95,"birth_date":"2009-04-29","age":16,"laterality":"Desconocido","club_origin":""}'::jsonb),
  ('David Mario', 'Hidalgo Vizcaíno', 12, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":6,"starts":6,"sub_appearances":0,"minutes":495,"rating":4.67,"birth_date":"2008-07-14","age":17,"laterality":"Desconocido","club_origin":""}'::jsonb),
  ('Carlos', 'Martín Silva', 14, true, '',
    '{"goals":3,"assists":0,"yellow_cards":2,"red_cards":0,"matches_played":12,"starts":7,"sub_appearances":5,"minutes":599,"rating":4.58,"birth_date":"2008-01-14","age":18,"laterality":"Desconocido","club_origin":""}'::jsonb),
  ('Unai', 'Rodríguez Ríos', 15, true, '',
    '{"goals":1,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":19,"starts":17,"sub_appearances":2,"minutes":1423,"rating":4.95,"birth_date":"2009-09-14","age":16,"laterality":"Zurdo","club_origin":""}'::jsonb),
  ('Daniel', 'Alonso Gago', 16, true, '',
    '{"goals":5,"assists":0,"yellow_cards":2,"red_cards":0,"matches_played":20,"starts":13,"sub_appearances":7,"minutes":1248,"rating":4.90,"birth_date":"2009-09-06","age":16,"laterality":"","club_origin":""}'::jsonb),
  ('Álex', 'Hernández Nicolás', 17, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":10,"starts":7,"sub_appearances":3,"minutes":627,"rating":4.70,"birth_date":"2009-10-07","age":16,"laterality":"Desconocido","club_origin":""}'::jsonb),
  ('Iván', 'Matías González', 18, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":0,"starts":0,"sub_appearances":0,"minutes":0,"rating":0,"birth_date":"","age":0,"laterality":"","club_origin":""}'::jsonb),
  ('Raúl', 'Rodríguez Morán', 19, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":0,"starts":0,"sub_appearances":0,"minutes":0,"rating":0,"birth_date":"","age":0,"laterality":"","club_origin":""}'::jsonb),
  ('Juan', 'Vicente Hernández', 20, true, '',
    '{"goals":0,"assists":0,"yellow_cards":3,"red_cards":1,"matches_played":20,"starts":15,"sub_appearances":5,"minutes":1347,"rating":4.80,"birth_date":"2008-10-20","age":17,"laterality":"Desconocido","club_origin":""}'::jsonb),
  ('Guillermo', 'Domínguez García', 21, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":8,"starts":3,"sub_appearances":5,"minutes":294,"rating":5.12,"birth_date":"2009-08-19","age":16,"laterality":"Derecho","club_origin":""}'::jsonb),
  ('Jorge', 'Alonso Cordovilla', 22, true, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":16,"starts":1,"sub_appearances":15,"minutes":275,"rating":4.81,"birth_date":"2009-04-29","age":16,"laterality":"Derecho","club_origin":""}'::jsonb),
  -- SUPLENTES / CADETE (sin ficha federativa completa)
  ('Héctor', 'Cáceres Marcos', 7, false, '',
    '{"goals":0,"assists":0,"yellow_cards":1,"red_cards":0,"matches_played":11,"starts":8,"sub_appearances":3,"minutes":816,"rating":4.73,"birth_date":"2008-11-29","age":17,"laterality":"","club_origin":""}'::jsonb),
  ('Alejandro', 'Cuevas Gonzalo', NULL, false, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":0,"starts":0,"sub_appearances":0,"minutes":0,"rating":0,"birth_date":"","age":0,"laterality":"","club_origin":""}'::jsonb),
  ('Daniel', 'Fuentes Santana', NULL, false, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":0,"starts":0,"sub_appearances":0,"minutes":0,"rating":0,"birth_date":"","age":0,"laterality":"","club_origin":""}'::jsonb),
  ('Hugo', 'Torres Salvado', NULL, false, '',
    '{"goals":0,"assists":0,"yellow_cards":0,"red_cards":0,"matches_played":0,"starts":0,"sub_appearances":0,"minutes":0,"rating":0,"birth_date":"","age":0,"laterality":"","club_origin":""}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 11. STORAGE: Bucket para fotos de jugadores
-- ==========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-photos', 'player-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view player photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'player-photos');

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'player-photos');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'player-photos');
