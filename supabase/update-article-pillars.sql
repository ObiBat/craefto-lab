-- =====================================================
-- UPDATE ARTICLE PILLARS
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, let's see what articles exist
-- SELECT id, title FROM journal_articles;

-- Clear any existing pillar assignments
DELETE FROM journal_article_pillars;

-- For "Building Design Systems That Scale" article
-- Pillars: Engineering (primary), Design
INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT 
  a.id,
  p.id,
  CASE WHEN p.slug = 'engineering' THEN TRUE ELSE FALSE END,
  CASE p.slug
    WHEN 'engineering' THEN 0
    WHEN 'design' THEN 1
    ELSE 2
  END
FROM journal_articles a
CROSS JOIN journal_pillars p
WHERE a.title ILIKE '%Design System%' 
  AND p.slug IN ('engineering', 'design')
ON CONFLICT (article_id, pillar_id) DO NOTHING;

-- For AI/Future related articles
-- Pillars: AI & Automation (primary), Product
INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT 
  a.id,
  p.id,
  CASE WHEN p.slug = 'ai-automation' THEN TRUE ELSE FALSE END,
  CASE p.slug
    WHEN 'ai-automation' THEN 0
    WHEN 'product' THEN 1
    ELSE 2
  END
FROM journal_articles a
CROSS JOIN journal_pillars p
WHERE (a.title ILIKE '%AI%' OR a.title ILIKE '%Future%' OR a.title ILIKE '%automation%')
  AND p.slug IN ('ai-automation', 'product')
ON CONFLICT (article_id, pillar_id) DO NOTHING;

-- Catch any articles without pillars yet - assign to Craefto Practice
INSERT INTO journal_article_pillars (article_id, pillar_id, is_primary, display_order)
SELECT 
  a.id,
  p.id,
  TRUE,
  0
FROM journal_articles a
CROSS JOIN journal_pillars p
WHERE p.slug = 'craefto-practice'
  AND NOT EXISTS (
    SELECT 1 FROM journal_article_pillars ap WHERE ap.article_id = a.id
  )
ON CONFLICT (article_id, pillar_id) DO NOTHING;

-- Also update the main pillar_id on journal_articles to match primary pillar
UPDATE journal_articles a
SET pillar_id = (
  SELECT pillar_id 
  FROM journal_article_pillars ap 
  WHERE ap.article_id = a.id AND ap.is_primary = TRUE
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM journal_article_pillars ap 
  WHERE ap.article_id = a.id AND ap.is_primary = TRUE
);

-- Verify the assignments
SELECT 
  a.title,
  p_main.name as primary_pillar,
  array_agg(p.name ORDER BY ap.display_order) as all_pillars
FROM journal_articles a
LEFT JOIN journal_pillars p_main ON a.pillar_id = p_main.id
LEFT JOIN journal_article_pillars ap ON a.id = ap.article_id
LEFT JOIN journal_pillars p ON ap.pillar_id = p.id
GROUP BY a.id, a.title, p_main.name;
