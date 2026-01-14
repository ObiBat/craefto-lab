-- Journal Content System Schema
-- Phase 3: Editorial Content Engine

-- ============================================
-- AUTHORS
-- ============================================
CREATE TABLE IF NOT EXISTS journal_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Profile
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  role TEXT,
  bio TEXT,
  avatar_url TEXT,

  -- Contact & Social
  email TEXT,
  twitter TEXT,
  linkedin TEXT,

  -- Metadata
  expertise TEXT[] DEFAULT '{}',
  is_ai_agent BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create default author
INSERT INTO journal_authors (name, slug, role, bio, expertise) VALUES
  ('Craefto Lab', 'craefto-lab', 'Studio', 'A design and technology studio building systems that compound value.', ARRAY['design systems', 'product development', 'applied AI'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- PILLARS (Content Categories)
-- ============================================
CREATE TABLE IF NOT EXISTS journal_pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,

  -- Strategy
  strategic_intent TEXT,
  target_reader TEXT CHECK (target_reader IN ('founder', 'designer', 'cto', 'product-manager', 'general')),

  -- Visual
  color TEXT DEFAULT '#5D6B59',
  icon TEXT,

  -- SEO
  keywords TEXT[] DEFAULT '{}',

  -- Order
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pillars
INSERT INTO journal_pillars (name, slug, description, strategic_intent, target_reader, display_order, color) VALUES
  ('Systems Thinking', 'systems-thinking', 'Design systems that scale and compound value over time.', 'Establish authority on design systems that compound value.', 'cto', 1, '#4A5568'),
  ('Applied AI', 'applied-ai', 'Practical AI for real work, not hype cycles.', 'Position as practitioners who ship AI, not theorists.', 'founder', 2, '#5D6B59'),
  ('Product Craft', 'product-craft', 'Building products people genuinely love to use.', 'Attract founders who value craft over speed-to-mediocrity.', 'founder', 3, '#744210'),
  ('Creative Technology', 'creative-technology', 'Where design excellence meets engineering craft.', 'Showcase the intersection of design and engineering.', 'designer', 4, '#553C9A'),
  ('Studio Practice', 'studio-practice', 'How we work, what we believe, and why it matters.', 'Build trust through transparency.', 'general', 5, '#1A1714')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ARTICLES
-- ============================================
CREATE TABLE IF NOT EXISTS journal_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core Content
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  excerpt TEXT,
  content TEXT NOT NULL, -- MDX content

  -- Classification
  pillar_id UUID NOT NULL REFERENCES journal_pillars(id),
  author_id UUID NOT NULL REFERENCES journal_authors(id),
  content_type TEXT DEFAULT 'signal' CHECK (content_type IN ('authority', 'signal', 'case-insight', 'perspective')),

  -- Media
  featured_image_url TEXT,
  featured_image_alt TEXT,
  og_image_url TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Metrics
  reading_time INTEGER, -- minutes
  word_count INTEGER,

  -- Editorial Workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Agent Metadata
  source_insight_id UUID,
  agent_generated BOOLEAN DEFAULT FALSE,
  human_edited BOOLEAN DEFAULT FALSE,
  editorial_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ARTICLE RELATIONSHIPS (for internal linking)
-- ============================================
CREATE TABLE IF NOT EXISTS journal_article_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES journal_articles(id) ON DELETE CASCADE,
  related_article_id UUID NOT NULL REFERENCES journal_articles(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'related' CHECK (relation_type IN ('related', 'series-next', 'series-prev', 'see-also')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(article_id, related_article_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_journal_articles_slug ON journal_articles(slug);
CREATE INDEX IF NOT EXISTS idx_journal_articles_status ON journal_articles(status);
CREATE INDEX IF NOT EXISTS idx_journal_articles_pillar ON journal_articles(pillar_id);
CREATE INDEX IF NOT EXISTS idx_journal_articles_author ON journal_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_journal_articles_published ON journal_articles(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_journal_articles_content_type ON journal_articles(content_type);

CREATE INDEX IF NOT EXISTS idx_journal_pillars_slug ON journal_pillars(slug);
CREATE INDEX IF NOT EXISTS idx_journal_authors_slug ON journal_authors(slug);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger for articles
CREATE TRIGGER trigger_journal_articles_updated_at
  BEFORE UPDATE ON journal_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Update timestamp trigger for authors
CREATE TRIGGER trigger_journal_authors_updated_at
  BEFORE UPDATE ON journal_authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Update timestamp trigger for pillars
CREATE TRIGGER trigger_journal_pillars_updated_at
  BEFORE UPDATE ON journal_pillars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE journal_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_article_relations ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role has full access to journal_authors"
  ON journal_authors FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to journal_pillars"
  ON journal_pillars FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to journal_articles"
  ON journal_articles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to journal_article_relations"
  ON journal_article_relations FOR ALL
  USING (auth.role() = 'service_role');

-- Public read access for published content
CREATE POLICY "Anyone can read published articles"
  ON journal_articles FOR SELECT
  USING (status = 'published' AND (published_at IS NULL OR published_at <= NOW()));

CREATE POLICY "Anyone can read pillars"
  ON journal_pillars FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read authors"
  ON journal_authors FOR SELECT
  USING (true);

-- ============================================
-- VIEWS
-- ============================================

-- Published articles with author and pillar info
CREATE OR REPLACE VIEW journal_published_articles AS
SELECT
  a.*,
  p.name as pillar_name,
  p.slug as pillar_slug,
  p.color as pillar_color,
  au.name as author_name,
  au.slug as author_slug,
  au.avatar_url as author_avatar,
  au.role as author_role,
  au.bio as author_bio,
  au.twitter as author_twitter,
  au.linkedin as author_linkedin
FROM journal_articles a
LEFT JOIN journal_pillars p ON a.pillar_id = p.id
LEFT JOIN journal_authors au ON a.author_id = au.id
WHERE a.status = 'published'
  AND (a.published_at IS NULL OR a.published_at <= NOW())
ORDER BY a.published_at DESC;
