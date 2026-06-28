/*
# Create schemes and success_stories tables

1. New Tables
- `schemes`: Stores all government welfare schemes (central + state). Contains scheme metadata,
  eligibility criteria, AI match scores, benefit details, application links, deadlines, and
  AI-generated tips. This is the core reference table that all other tables relate to.
- `success_stories`: Stores verified beneficiary testimonials linked to a specific scheme.
  Used to build trust and show real-world impact on scheme detail pages.

2. Columns (schemes)
- id (uuid PK)
- name, description, ministry, category (text) — scheme identity
- eligibility (text[]) — list of eligibility criteria strings
- estimated_benefit (text) — human-readable benefit description (e.g. "₹1.25 Lakhs")
- benefit_type (text) — categorization (Scholarship, Direct Benefit, etc.)
- ai_score (int, default 0) — AI-computed match score 0-100
- success_probability (int, nullable) — probability of successful application
- opening_date, closing_date (text) — application window dates
- status (text, default 'Open') — Open / Closing Soon / Closed
- featured (bool, default false) — highlighted on dashboard
- apply_link, official_website (text) — government portal URLs
- official_helpline (text, nullable) — contact number
- documents_required (text[]) — list of required documents
- why_eligible (text, nullable) — AI explanation of eligibility
- ai_tips (text[]) — AI-generated application tips
- common_mistakes (text[]) — common application errors to avoid
- processing_time (text, nullable) — expected processing duration
- difficulty (text, nullable) — Easy / Medium / Hard
- created_at, updated_at (timestamptz)

3. Columns (success_stories)
- id (uuid PK)
- scheme_id (uuid FK → schemes, CASCADE) — which scheme this story belongs to
- name, city (text) — beneficiary identity
- photo (text, nullable) — optional photo URL
- story (text) — testimonial text
- amount_received (text) — benefit amount received
- rating (int, default 5) — 1-5 star rating
- verified (bool, default true) — admin verification flag
- created_at (timestamptz)

4. Security
- schemes: public read (TO anon, authenticated) since scheme data is reference data.
  No inserts/updates/deletes from the frontend — managed via admin/edge functions.
- success_stories: public read (TO anon, authenticated) for the same reason.

5. Indexes
- schemes: ai_score DESC, status, category, featured
- success_stories: scheme_id, verified
*/

-- Schemes table
CREATE TABLE IF NOT EXISTS schemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  ministry TEXT NOT NULL,
  category TEXT NOT NULL,
  eligibility TEXT[] DEFAULT '{}',
  estimated_benefit TEXT NOT NULL,
  benefit_type TEXT NOT NULL,
  ai_score INTEGER DEFAULT 0,
  success_probability INTEGER,
  opening_date TEXT,
  closing_date TEXT NOT NULL,
  status TEXT DEFAULT 'Open',
  featured BOOLEAN DEFAULT FALSE,
  apply_link TEXT NOT NULL,
  official_website TEXT NOT NULL,
  official_helpline TEXT,
  documents_required TEXT[] DEFAULT '{}',
  why_eligible TEXT,
  ai_tips TEXT[] DEFAULT '{}',
  common_mistakes TEXT[] DEFAULT '{}',
  processing_time TEXT,
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Success stories table
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  photo TEXT,
  story TEXT NOT NULL,
  amount_received TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schemes_ai_score ON schemes(ai_score DESC);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_featured ON schemes(featured);
CREATE INDEX IF NOT EXISTS idx_success_stories_scheme_id ON success_stories(scheme_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_verified ON success_stories(verified);

-- Enable RLS
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;

-- RLS: schemes are public reference data (read-only from frontend)
DROP POLICY IF EXISTS "select_schemes" ON schemes;
CREATE POLICY "select_schemes" ON schemes FOR SELECT
  TO anon, authenticated USING (true);

-- RLS: success stories are public reference data (read-only from frontend)
DROP POLICY IF EXISTS "select_success_stories" ON success_stories;
CREATE POLICY "select_success_stories" ON success_stories FOR SELECT
  TO anon, authenticated USING (true);
