-- Journal Seed Content and Schema Updates
-- Phase 3: Editorial Content Engine - Seed Data

-- ============================================
-- SCHEMA UPDATES
-- ============================================

-- Add sort_order column to pillars if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_pillars' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE journal_pillars ADD COLUMN sort_order INTEGER DEFAULT 0;
    UPDATE journal_pillars SET sort_order = display_order;
  END IF;
END $$;

-- Update content_type constraint to match UI options
ALTER TABLE journal_articles DROP CONSTRAINT IF EXISTS journal_articles_content_type_check;
ALTER TABLE journal_articles ADD CONSTRAINT journal_articles_content_type_check
  CHECK (content_type IN ('article', 'deep_dive', 'case_study', 'tutorial', 'opinion'));

-- Update default content_type
ALTER TABLE journal_articles ALTER COLUMN content_type SET DEFAULT 'article';

-- ============================================
-- SEED ARTICLE
-- ============================================

-- Insert a sample article
INSERT INTO journal_articles (
  title,
  slug,
  subtitle,
  excerpt,
  content,
  pillar_id,
  author_id,
  content_type,
  status,
  reading_time,
  published_at,
  featured_image_url,
  featured_image_alt
)
SELECT
  'Why We Build Systems That Compound',
  'why-we-build-systems-that-compound',
  'The philosophy behind our approach to design and technology',
  'In a world obsessed with quick wins and rapid iteration, we take a different approach. We build systems designed to compound value over time.',
  E'## The Problem with Short-Term Thinking

Most technology projects are built for the next sprint, the next quarter, the next funding round. Teams optimize for shipping features, not for building value that compounds.

This creates a predictable pattern: initial velocity feels good, then slows as technical debt accumulates, then grinds to a halt as the codebase becomes unmaintainable.

## A Different Approach

At Craefto Lab, we think in decades. Not because we''re slow, but because we understand that the most valuable systems are the ones designed to get better over time.

<Callout type="tip">
Compound growth isn''t just for investments. The same principle applies to design systems, codebases, and organizational knowledge.
</Callout>

### What Compounding Looks Like in Practice

When we build a design system, we''re not just solving today''s design problems. We''re creating a vocabulary that will make every future design decision faster and more consistent.

When we architect a codebase, we''re not just writing code that works. We''re building patterns that future developers will naturally follow, making the system more coherent over time.

## The Three Principles

### 1. Clarity Over Cleverness

Code that''s clever today is confusing tomorrow. We write systems that explain themselves, using consistent naming, clear abstractions, and documentation that lives with the code.

### 2. Constraints That Liberate

Good systems don''t give you infinite freedom—they give you the right constraints. A well-designed component library doesn''t limit creativity; it frees designers to focus on solving real problems instead of reinventing buttons.

### 3. Evolution Over Revolution

The best systems are never finished. They''re designed to evolve gracefully, with clear upgrade paths and backward compatibility baked in from the start.

## The Long Game

Building systems that compound requires patience and conviction. It means saying no to shortcuts that feel fast today but create friction tomorrow.

It means investing in infrastructure that won''t show ROI for months. It means trusting that quality, consistency, and clarity will win in the end.

We''re not building for the next sprint. We''re building for the next decade. And we think you should too.

---

*This is the philosophy that guides everything we do at Craefto Lab. If this resonates with you, [let''s talk](/contact).*',
  (SELECT id FROM journal_pillars WHERE slug = 'systems-thinking' LIMIT 1),
  (SELECT id FROM journal_authors WHERE slug = 'craefto-lab' LIMIT 1),
  'article',
  'published',
  5,
  NOW() - INTERVAL '3 days',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
  'Abstract geometric pattern representing interconnected systems'
WHERE NOT EXISTS (
  SELECT 1 FROM journal_articles WHERE slug = 'why-we-build-systems-that-compound'
);

-- Insert a second sample article
INSERT INTO journal_articles (
  title,
  slug,
  subtitle,
  excerpt,
  content,
  pillar_id,
  author_id,
  content_type,
  status,
  reading_time,
  published_at,
  featured_image_url,
  featured_image_alt
)
SELECT
  'Practical AI: Beyond the Hype Cycle',
  'practical-ai-beyond-the-hype-cycle',
  'How we approach AI implementation for real business value',
  'The AI conversation is dominated by hype. We prefer to focus on what actually works: practical applications that solve real problems.',
  E'## Cutting Through the Noise

Every week brings a new "revolutionary" AI breakthrough. Most of them won''t matter to your business. Some will transform it entirely. The challenge is knowing the difference.

## Our Approach to AI

We don''t chase trends. We solve problems.

When a client comes to us with an AI request, we start with a simple question: **What problem are you actually trying to solve?**

More often than not, the answer reveals that AI is either:
- Exactly what they need
- Completely unnecessary
- A piece of a larger solution

### The Three-Layer Framework

We evaluate AI applications across three dimensions:

1. **Feasibility**: Can current AI actually do this reliably?
2. **Value**: Will this create meaningful business impact?
3. **Risk**: What are the failure modes and how do we handle them?

<Callout type="note">
The best AI implementations are often invisible. Users don''t need to know there''s a language model behind the feature—they just need it to work.
</Callout>

## What Actually Works

Based on our experience shipping AI features to production, here''s what consistently delivers value:

### 1. Intelligent Automation
Taking repetitive, rules-based tasks and adding just enough intelligence to handle edge cases. This isn''t glamorous, but it compounds.

### 2. Enhanced Search
Natural language understanding applied to search can be transformational. People can ask questions instead of guessing keywords.

### 3. Content Assistance
AI that helps humans write better, faster—without replacing human judgment. The key word is *assistance*.

## What Rarely Works

Some applications sound great in demos but fail in production:

- **Fully autonomous decision-making** for high-stakes situations
- **Perfect accuracy expectations** where 95% isn''t good enough
- **Replacing domain expertise** entirely with generic models

## The Bottom Line

AI is a tool, not a strategy. The companies winning with AI are the ones treating it as they would any other technology decision: evaluating trade-offs, starting small, and iterating based on real usage.

We''re here to help you navigate that process—without the hype.

---

*Interested in exploring what AI could do for your product? [Get in touch](/contact).*',
  (SELECT id FROM journal_pillars WHERE slug = 'applied-ai' LIMIT 1),
  (SELECT id FROM journal_authors WHERE slug = 'craefto-lab' LIMIT 1),
  'deep_dive',
  'published',
  4,
  NOW() - INTERVAL '1 day',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
  'Abstract visualization of neural network connections'
WHERE NOT EXISTS (
  SELECT 1 FROM journal_articles WHERE slug = 'practical-ai-beyond-the-hype-cycle'
);
