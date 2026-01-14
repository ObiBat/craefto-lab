-- =====================================================
-- UPDATE ARTICLE IMAGES TO JPG
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update featured image
UPDATE journal_articles 
SET featured_image_url = REPLACE(featured_image_url, '.png', '.jpg')
WHERE featured_image_url LIKE '/images/articles/%.png';

-- Update content images
UPDATE journal_articles 
SET content = REPLACE(content, '.png)', '.jpg)')
WHERE content LIKE '%/images/articles/%.png%';

-- Verify
SELECT featured_image_url, 
       CASE WHEN content LIKE '%.png%' THEN 'Has PNG' ELSE 'All JPG' END as image_status
FROM journal_articles
WHERE slug = 'february-1st-official-launch-craefto';
