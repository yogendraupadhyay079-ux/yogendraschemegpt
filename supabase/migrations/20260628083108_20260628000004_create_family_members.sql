/*
# Create family_members table

1. New Tables
- `family_members`: Stores family member profiles linked to the authenticated user.
  Each member has demographic info, socio-economic details, category flags (farmer, student,
  widow, minority, BPL), caste, location, and document ownership status (aadhaar, pan,
  ration card, bank account, disability certificate, income certificate, farmer ID).
  Used by the missed-opportunities engine to check eligibility across the entire family.

2. Columns
- id (uuid PK)
- user_id (uuid, DEFAULT auth.uid(), FK → auth.users CASCADE) — owner
- name (text) — member name
- relation (text, CHECK in father/mother/wife/husband/son/daughter/grandfather/grandmother/other)
- age (int), gender (text)
- occupation (text, nullable), annual_income (int, default 0)
- education (text, nullable)
- disability, farmer, student, widow, minority, bpl_status (bool) — category flags
- caste (text, nullable)
- state, district (text, nullable)
- aadhaar, pan, ration_card, bank_account (bool) — document ownership
- disability_certificate, income_certificate, farmer_id (bool) — document ownership
- created_at, updated_at (timestamptz)

3. Security
- RLS enabled, owner-scoped via auth.uid().
- user_id defaults to auth.uid() so inserts without explicit user_id succeed.
*/

CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (relation IN ('father', 'mother', 'wife', 'husband', 'son', 'daughter', 'grandfather', 'grandmother', 'other')),
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  occupation TEXT,
  annual_income INTEGER DEFAULT 0,
  education TEXT,
  disability BOOLEAN DEFAULT FALSE,
  farmer BOOLEAN DEFAULT FALSE,
  student BOOLEAN DEFAULT FALSE,
  widow BOOLEAN DEFAULT FALSE,
  minority BOOLEAN DEFAULT FALSE,
  bpl_status BOOLEAN DEFAULT FALSE,
  caste TEXT,
  state TEXT,
  district TEXT,
  aadhaar BOOLEAN DEFAULT FALSE,
  pan BOOLEAN DEFAULT FALSE,
  ration_card BOOLEAN DEFAULT FALSE,
  bank_account BOOLEAN DEFAULT FALSE,
  disability_certificate BOOLEAN DEFAULT FALSE,
  income_certificate BOOLEAN DEFAULT FALSE,
  farmer_id BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_family_members" ON family_members;
CREATE POLICY "select_own_family_members" ON family_members FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_family_members" ON family_members;
CREATE POLICY "insert_own_family_members" ON family_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_family_members" ON family_members;
CREATE POLICY "update_own_family_members" ON family_members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_family_members" ON family_members;
CREATE POLICY "delete_own_family_members" ON family_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
