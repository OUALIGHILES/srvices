-- Create the user_likes table to store service likes/favorites
CREATE TABLE IF NOT EXISTS user_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  liked BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id) -- Prevent duplicate likes from same user
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own likes
CREATE POLICY "Allow users to read their own likes" ON user_likes
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own likes
CREATE POLICY "Allow users to insert their own likes" ON user_likes
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own likes
CREATE POLICY "Allow users to update their own likes" ON user_likes
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own likes
CREATE POLICY "Allow users to delete their own likes" ON user_likes
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_likes_service_id ON user_likes(service_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);