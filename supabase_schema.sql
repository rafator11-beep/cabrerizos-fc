-- ==========================================
-- CABRERIZOS FC - SUPABASE DATABASE SCHEMA
-- ==========================================
-- Run this SQL in your Supabase SQL Editor.

-- 1. Create Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'player', -- 'admin' or 'player'
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  position TEXT,
  number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Create Sessions Table (Training sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE POLICY "Sessions viewable by everyone" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert sessions" ON sessions
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update sessions" ON sessions
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete sessions" ON sessions
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Create Plays Table (Pizarra Táctica)
CREATE TABLE plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  tokens JSONB NOT NULL DEFAULT '[]'::jsonb,
  arrows JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plays viewable by everyone" ON plays
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert plays" ON plays
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update plays" ON plays
  FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete plays" ON plays
  FOR DELETE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Create Exercises / Feedback Table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL, -- 'exercise_suggestion', 'session_comment'
  content TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id), -- Optional, if linked to a session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback viewable by admins and author" ON feedback
  FOR SELECT USING (
    auth.uid() = player_id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Players can insert feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- 5. Create Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) NOT NULL,
  player_id UUID REFERENCES profiles(id) NOT NULL,
  present BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(session_id, player_id)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance viewable by everyone" ON attendance
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage attendance" ON attendance
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Add a default Admin (You will need to create the user in Supabase Auth first, then link here, or just create the admin from the app)
