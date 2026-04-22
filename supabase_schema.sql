-- ==========================================
-- CABRERIZOS FC - SUPABASE DATABASE SCHEMA
-- ==========================================
-- Run this SQL in your Supabase SQL Editor.
-- Project: yaltxcmspsvnhnxomhwa

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'player', -- 'admin' or 'player'
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  position TEXT,
  number INTEGER,
  device_id TEXT, -- limits 1 device per account
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe to re-run)
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

-- 2. Create Plays Table (Pizarra Táctica)
CREATE TABLE IF NOT EXISTS plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
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

-- 3. Create Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'exercise_suggestion', 'session_comment'
  content TEXT NOT NULL,
  session_id UUID, -- Optional
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

-- 4. Create Sessions Table (Training sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  duration INTEGER NOT NULL,
  intensity INTEGER NOT NULL,
  objective TEXT,
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sessions viewable by everyone" ON sessions;
DROP POLICY IF EXISTS "Admins can insert sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can update sessions" ON sessions;
DROP POLICY IF EXISTS "Admins can delete sessions" ON sessions;

CREATE POLICY "Sessions viewable by everyone" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert sessions" ON sessions
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update sessions" ON sessions
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete sessions" ON sessions
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
