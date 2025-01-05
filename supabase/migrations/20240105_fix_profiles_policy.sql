-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policy for viewing profiles
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);