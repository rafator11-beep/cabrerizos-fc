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
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb, -- [roster_id, roster_id, ...] asistencia del dia
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
-- 10. NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_player ON notifications(player_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = player_id);

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ==========================================
-- 11. MESSAGES TABLE (Chat)
-- ==========================================
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Messages viewable by sender or receiver or admin" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;

CREATE POLICY "Messages viewable by sender or receiver or admin" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ==========================================
-- 12. FUNCTIONS
-- ==========================================

-- Change Password Function
CREATE OR REPLACE FUNCTION change_user_password(new_password TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN RETURN json_build_object('success', false, 'message', 'Usuario no autenticado'); END IF;
  IF LENGTH(new_password) < 6 THEN RETURN json_build_object('success', false, 'message', 'La contraseña debe tener al menos 6 caracteres'); END IF;
  
  UPDATE auth.users SET encrypted_password = crypt(new_password, gen_salt('bf')), updated_at = NOW() WHERE id = user_id;
  RETURN json_build_object('success', true, 'message', 'Contraseña actualizada correctamente');
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION change_user_password(TEXT) TO authenticated;

-- Create Notification Function
CREATE OR REPLACE FUNCTION create_notification(p_player_id UUID, p_type TEXT, p_title TEXT, p_message TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE notification_id BIGINT;
BEGIN
  INSERT INTO notifications (player_id, type, title, message, read, created_at)
  VALUES (p_player_id, p_type, p_title, p_message, FALSE, NOW())
  RETURNING id INTO notification_id;
  RETURN json_build_object('success', true, 'notification_id', notification_id, 'message', 'Notificación creada correctamente');
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$;
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- ==========================================
-- 13. SEED & STORAGE
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('player-photos', 'player-photos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Anyone can view player photos" ON storage.objects FOR SELECT USING (bucket_id = 'player-photos');
CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'player-photos');
CREATE POLICY "Authenticated users can update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'player-photos');
CREATE POLICY "Authenticated users can delete photos" ON storage.objects FOR DELETE USING (bucket_id = 'player-photos');
