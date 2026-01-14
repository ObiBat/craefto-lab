-- =====================================================
-- MIGRATION: Support Multiple Pillars per Article
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create junction table for article-pillar many-to-many relationship
CREATE TABLE IF NOT EXISTS journal_article_pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES journal_articles(id) ON DELETE CASCADE,
  pillar_id UUID NOT NULL REFERENCES journal_pillars(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each article can only have a pillar once
  UNIQUE(article_id, pillar_id)
);

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_journal_article_pillars_article ON journal_article_pillars(article_id);
CREATE INDEX IF NOT EXISTS idx_journal_article_pillars_pillar ON journal_article_pillars(pillar_id);

-- 3. Enable RLS
ALTER TABLE journal_article_pillars ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Service role has full access to journal_article_pillars"
  ON journal_article_pillars FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read article pillars"
  ON journal_article_pillars FOR SELECT
  USING (true);

-- 5. Migrate existing data: Copy current pillar_id to junction table
INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT id, pillar_id, TRUE, 0
FROM journal_articles
WHERE pillar_id IS NOT NULL
ON CONFLICT (article_id, pillar_id) DO NOTHING;

-- 6. Check constraint to limit to max 3 pillars per article
CREATE OR REPLACE FUNCTION check_max_pillars()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM journal_article_pillars WHERE article_id = NEW.article_id) >= 3 THEN
    RAISE EXCEPTION 'An article can have at most 3 pillars';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_max_pillars
  BEFORE INSERT ON journal_article_pillars
  FOR EACH ROW
  EXECUTE FUNCTION check_max_pillars();

-- =====================================================
-- Now update the two remaining articles with their pillars
-- =====================================================

-- First, add the Craefto Practice pillar if it doesn't exist
INSERT INTO journal_pillars (name, slug, description, color, sort_order)
VALUES ('Craefto Practice', 'craefto-practice', 'How we work, what we believe, and lessons from the studio.', '#1A1714', 5)
ON CONFLICT (slug) DO NOTHING;

-- Clear existing junction entries first (from migration)
DELETE FROM journal_article_pillars;

-- Assign pillars to articles
-- For "Building Design Systems That Scale" - Engineering + Design
INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT 
  a.id,
  p.id,
  CASE WHEN p.slug = 'engineering' THEN TRUE ELSE FALSE END,
  CASE 
    WHEN p.slug = 'engineering' THEN 0
    WHEN p.slug = 'design' THEN 1
    ELSE 2
  END
FROM journal_articles a
CROSS JOIN journal_pillars p
WHERE a.title LIKE '%Design System%' 
  AND p.slug IN ('engineering', 'design')
ON CONFLICT (article_id, pillar_id) DO NOTHING;

-- For AI-related articles - AI & Automation + Product
INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT 
  a.id,
  p.id,
  CASE WHEN p.slug = 'ai-automation' THEN TRUE ELSE FALSE END,
  CASE 
    WHEN p.slug = 'ai-automation' THEN 0
    WHEN p.slug = 'product' THEN 1
    ELSE 2
  END
FROM journal_articles a
CROSS JOIN journal_pillars p
WHERE (a.title LIKE '%AI%' OR a.title LIKE '%Future%')
  AND p.slug IN ('ai-automation', 'product')
ON CONFLICT (article_id, pillar_id) DO NOTHING;

-- Verify the assignments
SELECT a.title, array_agg(p.name ORDER BY ap.display_order) as pillars
FROM journal_articles a
JOIN journal_article_pillars ap ON a.id = ap.article_id
JOIN journal_pillars p ON ap.pillar_id = p.id
GROUP BY a.id, a.title;
