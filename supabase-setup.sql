
-- Create seeds table with user support
CREATE TABLE IF NOT EXISTS seeds (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pillar TEXT NOT NULL,
  status TEXT DEFAULT 'captured',
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  seed_id BIGINT REFERENCES seeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pillar TEXT NOT NULL,
  questions JSONB,
  answers JSONB,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create user-specific policies
DROP POLICY IF EXISTS "Allow all operations on seeds" ON seeds;
DROP POLICY IF EXISTS "Allow all operations on articles" ON articles;

CREATE POLICY "Users can manage their own seeds" ON seeds
  FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'replit_user_id');

CREATE POLICY "Users can manage their own articles" ON articles  
  FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'replit_user_id');

-- For development, allow all operations (you can tighten this later)
CREATE POLICY "Allow all operations on seeds dev" ON seeds FOR ALL USING (true);
CREATE POLICY "Allow all operations on articles dev" ON articles FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_seeds_updated_at BEFORE UPDATE ON seeds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
