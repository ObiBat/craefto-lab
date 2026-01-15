-- =====================================================
-- REMOVE ALL DASHES FROM ARTICLE CONTENT
-- Run this in Supabase SQL Editor
-- Replaces " - " patterns with proper punctuation
-- =====================================================

-- Replace " - " with ": " in content (common AI pattern)
UPDATE journal_articles
SET content = REPLACE(content, ' - ', ': ');

-- Replace in title, subtitle, excerpt
UPDATE journal_articles
SET title = REPLACE(title, ' - ', ': '),
    subtitle = REPLACE(subtitle, ' - ', ': '),
    excerpt = REPLACE(excerpt, ' - ', ': ');

-- Also handle em dashes if any remain
UPDATE journal_articles
SET content = REPLACE(content, ' — ', ': '),
    title = REPLACE(title, ' — ', ': '),
    subtitle = REPLACE(subtitle, ' — ', ': '),
    excerpt = REPLACE(excerpt, ' — ', ': ');

UPDATE journal_articles
SET content = REPLACE(content, '—', ': '),
    title = REPLACE(title, '—', ': '),
    subtitle = REPLACE(subtitle, '—', ': '),
    excerpt = REPLACE(excerpt, '—', ': ');

-- Handle en dashes too
UPDATE journal_articles
SET content = REPLACE(content, ' – ', ': '),
    title = REPLACE(title, ' – ', ': '),
    subtitle = REPLACE(subtitle, ' – ', ': '),
    excerpt = REPLACE(excerpt, ' – ', ': ');

-- Verify: Check for any remaining dashes
SELECT
    title,
    CASE
        WHEN content LIKE '% - %' OR content LIKE '%—%' OR content LIKE '%–%'
        THEN 'Has dashes'
        ELSE 'Clean'
    END as content_status,
    CASE
        WHEN title LIKE '% - %' OR title LIKE '%—%' OR title LIKE '%–%'
        THEN 'Has dashes'
        ELSE 'Clean'
    END as title_status
FROM journal_articles;
