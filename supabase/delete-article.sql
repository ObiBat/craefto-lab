-- Delete the article "Craft-First AI: Craefto Lab's Framework for Integrating AI Without Compromising Design Excellence"
-- This will cascade delete related records (views, events, performance) due to ON DELETE CASCADE

DELETE FROM journal_articles 
WHERE title = 'Craft-First AI: Craefto Lab''s Framework for Integrating AI Without Compromising Design Excellence';

-- Alternatively, if the exact title is slightly different, use LIKE:
-- DELETE FROM journal_articles 
-- WHERE title LIKE 'Craft-First AI%';
