-- GameVault Supabase Setup
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- Step 1: Create the games table
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  igdb_id INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  cover_url TEXT,
  release_year INTEGER,
  genres TEXT[],
  rating NUMERIC(4, 1),
  platforms TEXT[],
  summary TEXT,
  download_link TEXT NOT NULL,
  save_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS and create allow-all policy
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON games
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_games_igdb_id ON games(igdb_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
