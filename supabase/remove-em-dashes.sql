-- =====================================================
-- REMOVE EM DASHES FROM ALL ARTICLES
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update content: Replace — with regular dash or remove
UPDATE journal_articles 
SET content = REPLACE(content, ' — ', ' - ');

-- Also update in title, subtitle, excerpt
UPDATE journal_articles 
SET title = REPLACE(title, ' — ', ' - '),
    subtitle = REPLACE(subtitle, ' — ', ' - '),
    excerpt = REPLACE(excerpt, ' — ', ' - ');

-- Also replace standalone em dashes (not surrounded by spaces)
UPDATE journal_articles 
SET content = REPLACE(content, '—', ' - ');

UPDATE journal_articles 
SET title = REPLACE(title, '—', ' - '),
    subtitle = REPLACE(subtitle, '—', ' - '),
    excerpt = REPLACE(excerpt, '—', ' - ');

-- Verify
SELECT title, 
       CASE WHEN content LIKE '%—%' THEN 'Has em dash' ELSE 'Clean' END as status
FROM journal_articles;
