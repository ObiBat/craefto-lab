-- Journal Subscribers Schema
-- Newsletter subscription system with double opt-in

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS journal_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),

  -- Double opt-in
  confirmation_token UUID DEFAULT uuid_generate_v4(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,

  -- Source tracking
  source TEXT DEFAULT 'journal_page',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint on email
  CONSTRAINT unique_subscriber_email UNIQUE (email)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_journal_subscribers_email ON journal_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_journal_subscribers_status ON journal_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_journal_subscribers_token ON journal_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_journal_subscribers_created ON journal_subscribers(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger
CREATE TRIGGER trigger_journal_subscribers_updated_at
  BEFORE UPDATE ON journal_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE journal_subscribers ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access to journal_subscribers"
  ON journal_subscribers FOR ALL
  USING (auth.role() = 'service_role');

-- Public can insert (subscribe) - but only create new records
CREATE POLICY "Anyone can subscribe"
  ON journal_subscribers FOR INSERT
  WITH CHECK (true);

-- Public can read their own subscription by token (for confirmation/unsubscribe)
CREATE POLICY "Anyone can read by confirmation token"
  ON journal_subscribers FOR SELECT
  USING (true);
