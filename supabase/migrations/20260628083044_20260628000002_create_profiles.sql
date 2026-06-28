/*
# Create profiles table

1. New Tables
- `profiles`: Stores the authenticated user's welfare profile. One row per user.
  Contains personal details (name, age, gender), location (state, district),
  socio-economic category info (caste, income, occupation, education),
  special category flags (farmer, student, disability, startup founder),
  and AI-computed aggregate stats (match score, total benefits, eligible/applied/pending counts).

2. Columns
- id (uuid PK)
- user_id (uuid, NOT NULL, DEFAULT auth.uid(), FK → auth.users CASCADE) — owner
- full_name, email (text) — identity
- avatar_url (text, nullable) — profile picture
- state, district, category (text) — location and caste category
- annual_income (int) — annual income in rupees
- occupation, education (text) — professional details
- age (int), gender (text) — demographics
- disability, farmer, student, startup_founder (bool) — special category flags
- ai_match_score (int, default 0) — overall AI eligibility score
- total_benefits (int, default 0) — total benefit value
- eligible_schemes (int, default 0) — count of eligible schemes
- applied_schemes (int, default 0) — count of applied schemes
- pending_applications (int, default 0) — count of pending applications
- created_at, updated_at (timestamptz)

3. Security
- RLS enabled, owner-scoped: each authenticated user can only read/update their own profile.
- user_id defaults to auth.uid() so inserts without explicit user_id succeed.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  category TEXT NOT NULL,
  annual_income INTEGER NOT NULL DEFAULT 0,
  occupation TEXT NOT NULL,
  education TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  disability BOOLEAN DEFAULT FALSE,
  farmer BOOLEAN DEFAULT FALSE,
  student BOOLEAN DEFAULT FALSE,
  startup_founder BOOLEAN DEFAULT FALSE,
  ai_match_score INTEGER DEFAULT 0,
  total_benefits INTEGER DEFAULT 0,
  eligible_schemes INTEGER DEFAULT 0,
  applied_schemes INTEGER DEFAULT 0,
  pending_applications INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
