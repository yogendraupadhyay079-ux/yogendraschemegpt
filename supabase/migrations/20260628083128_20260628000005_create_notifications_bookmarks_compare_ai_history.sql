/*
# Create notifications, user_schemes, bookmarks, compare_history, and ai_history tables

1. New Tables
- `notifications`: Stores per-user alerts (scheme deadlines, document verification,
  new scheme discoveries). Each has a type (info/warning/success/urgent) and read status.
- `user_schemes`: Tracks the user's interaction with schemes — saved, applied, approved,
  or rejected. Also tracks viewed_at for recently-viewed functionality.
- `bookmarks`: Stores user's bookmarked (saved) schemes for quick access. Separate from
  user_schemes to allow independent bookmark tracking without affecting application status.
- `compare_history`: Stores the user's scheme comparison history — which schemes were
  compared together and when, so users can revisit past comparisons.
- `ai_history`: Stores the user's AI assistant interaction history — prompts and responses,
  linked to conversations for audit trail and analytics.

2. Columns (notifications)
- id, user_id (DEFAULT auth.uid()), title, message, type (info/warning/success/urgent),
  read (bool), created_at

3. Columns (user_schemes)
- id, user_id (DEFAULT auth.uid()), scheme_id (FK → schemes CASCADE),
  status (saved/applied/approved/rejected), viewed_at, created_at, updated_at

4. Columns (bookmarks)
- id, user_id (DEFAULT auth.uid()), scheme_id (FK → schemes CASCADE),
  created_at — unique per user+scheme pair

5. Columns (compare_history)
- id, user_id (DEFAULT auth.uid()), scheme_ids (uuid[]) — array of compared scheme IDs,
  created_at

6. Columns (ai_history)
- id, user_id (DEFAULT auth.uid()), conversation_id (FK → conversations CASCADE, nullable),
  prompt (text), response (text), created_at

7. Security
- All tables are owner-scoped via auth.uid().
- user_id defaults to auth.uid() on all tables.
- user_schemes and bookmarks also verify scheme existence via FK.
*/

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'urgent')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- User schemes (saved/applied/approved/rejected tracking)
CREATE TABLE IF NOT EXISTS user_schemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'approved', 'rejected')),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, scheme_id)
);

CREATE INDEX IF NOT EXISTS idx_user_schemes_user_id ON user_schemes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_schemes_scheme_id ON user_schemes(scheme_id);
CREATE INDEX IF NOT EXISTS idx_user_schemes_status ON user_schemes(status);
CREATE INDEX IF NOT EXISTS idx_user_schemes_viewed_at ON user_schemes(viewed_at DESC);

ALTER TABLE user_schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_user_schemes" ON user_schemes;
CREATE POLICY "select_own_user_schemes" ON user_schemes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_user_schemes" ON user_schemes;
CREATE POLICY "insert_own_user_schemes" ON user_schemes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_user_schemes" ON user_schemes;
CREATE POLICY "update_own_user_schemes" ON user_schemes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_user_schemes" ON user_schemes;
CREATE POLICY "delete_own_user_schemes" ON user_schemes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, scheme_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_scheme_id ON bookmarks(scheme_id);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookmarks" ON bookmarks;
CREATE POLICY "select_own_bookmarks" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookmarks" ON bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookmarks" ON bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Compare history
CREATE TABLE IF NOT EXISTS compare_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_compare_history_user_id ON compare_history(user_id);
CREATE INDEX IF NOT EXISTS idx_compare_history_created_at ON compare_history(created_at DESC);

ALTER TABLE compare_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_compare_history" ON compare_history;
CREATE POLICY "select_own_compare_history" ON compare_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_compare_history" ON compare_history;
CREATE POLICY "insert_own_compare_history" ON compare_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_compare_history" ON compare_history;
CREATE POLICY "delete_own_compare_history" ON compare_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- AI history
CREATE TABLE IF NOT EXISTS ai_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_conversation_id ON ai_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_created_at ON ai_history(created_at DESC);

ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_history" ON ai_history;
CREATE POLICY "select_own_ai_history" ON ai_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_history" ON ai_history;
CREATE POLICY "insert_own_ai_history" ON ai_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_history" ON ai_history;
CREATE POLICY "delete_own_ai_history" ON ai_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
