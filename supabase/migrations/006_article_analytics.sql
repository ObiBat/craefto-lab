-- Article Analytics Schema
-- Tracks views, engagement, and performance metrics

-- Article views table (aggregated daily)
CREATE TABLE IF NOT EXISTS article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES journal_articles(id) ON DELETE CASCADE,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  view_count INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT NULL, -- in seconds
  scroll_depth_avg DECIMAL(5,2) DEFAULT NULL, -- percentage 0-100
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, view_date)
);

-- Article engagement events (individual events for detailed tracking)
CREATE TABLE IF NOT EXISTS article_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES journal_articles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'scroll_25', 'scroll_50', 'scroll_75', 'scroll_100', 'share', 'copy_code', 'click_link'
  visitor_id TEXT, -- anonymous visitor identifier (cookie/fingerprint)
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Article performance summary (materialized for fast queries)
CREATE TABLE IF NOT EXISTS article_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES journal_articles(id) ON DELETE CASCADE UNIQUE,
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT NULL,
  avg_scroll_depth DECIMAL(5,2) DEFAULT NULL,
  share_count INTEGER NOT NULL DEFAULT 0,
  click_through_rate DECIMAL(5,4) DEFAULT NULL, -- for internal links
  bounce_rate DECIMAL(5,4) DEFAULT NULL,
  -- Trending metrics
  views_last_7_days INTEGER NOT NULL DEFAULT 0,
  views_last_30_days INTEGER NOT NULL DEFAULT 0,
  trend_score DECIMAL(8,4) DEFAULT 0, -- calculated score for trending
  -- Timestamps
  first_view_at TIMESTAMPTZ,
  last_view_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A/B test variants for titles
CREATE TABLE IF NOT EXISTS article_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES journal_articles(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL, -- 'title', 'excerpt', 'image'
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  variant_a_views INTEGER NOT NULL DEFAULT 0,
  variant_b_views INTEGER NOT NULL DEFAULT 0,
  variant_a_clicks INTEGER NOT NULL DEFAULT 0,
  variant_b_clicks INTEGER NOT NULL DEFAULT 0,
  winner TEXT, -- 'a', 'b', or null if test ongoing
  confidence DECIMAL(5,4) DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent feedback for improvement loop
CREATE TABLE IF NOT EXISTS agent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES journal_articles(id) ON DELETE SET NULL,
  agent_type TEXT NOT NULL, -- 'topic_scout', 'research_analyst', 'editorial_strategist', 'editorial_writer', 'editor_guardian'
  feedback_type TEXT NOT NULL, -- 'quality', 'accuracy', 'relevance', 'engagement', 'style', 'technical_accuracy', 'overall'
  feedback_score INTEGER NOT NULL CHECK (feedback_score >= 1 AND feedback_score <= 5),
  feedback_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_views_article_date ON article_views(article_id, view_date DESC);
CREATE INDEX IF NOT EXISTS idx_article_events_article_id ON article_events(article_id);
CREATE INDEX IF NOT EXISTS idx_article_events_created_at ON article_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_events_type ON article_events(event_type);
CREATE INDEX IF NOT EXISTS idx_article_performance_trend ON article_performance(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_article_performance_views ON article_performance(total_views DESC);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_unaddressed ON agent_feedback(addressed, created_at DESC) WHERE NOT addressed;

-- Function to update article performance summary
CREATE OR REPLACE FUNCTION update_article_performance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO article_performance (article_id, total_views, unique_visitors, first_view_at, last_view_at)
  VALUES (NEW.article_id, 1, 1, NOW(), NOW())
  ON CONFLICT (article_id) DO UPDATE SET
    total_views = article_performance.total_views + 1,
    last_view_at = NOW(),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update performance on new view event
DROP TRIGGER IF EXISTS trg_update_performance ON article_events;
CREATE TRIGGER trg_update_performance
  AFTER INSERT ON article_events
  FOR EACH ROW
  WHEN (NEW.event_type = 'view')
  EXECUTE FUNCTION update_article_performance();

-- Function to calculate trend score (called periodically)
CREATE OR REPLACE FUNCTION calculate_trend_scores()
RETURNS void AS $$
BEGIN
  UPDATE article_performance ap
  SET
    views_last_7_days = COALESCE((
      SELECT SUM(view_count)
      FROM article_views av
      WHERE av.article_id = ap.article_id
      AND av.view_date >= CURRENT_DATE - INTERVAL '7 days'
    ), 0),
    views_last_30_days = COALESCE((
      SELECT SUM(view_count)
      FROM article_views av
      WHERE av.article_id = ap.article_id
      AND av.view_date >= CURRENT_DATE - INTERVAL '30 days'
    ), 0),
    -- Trend score: recent views weighted higher
    trend_score = COALESCE((
      SELECT SUM(view_count)
      FROM article_views av
      WHERE av.article_id = ap.article_id
      AND av.view_date >= CURRENT_DATE - INTERVAL '7 days'
    ), 0) * 2 + COALESCE((
      SELECT SUM(view_count)
      FROM article_views av
      WHERE av.article_id = ap.article_id
      AND av.view_date >= CURRENT_DATE - INTERVAL '30 days'
    ), 0) * 0.5,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;

-- Public read for performance (for public stats display)
CREATE POLICY "Public can view article performance" ON article_performance FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "Service can manage article_views" ON article_views FOR ALL USING (true);
CREATE POLICY "Service can manage article_events" ON article_events FOR ALL USING (true);
CREATE POLICY "Service can manage article_performance" ON article_performance FOR ALL USING (true);
CREATE POLICY "Service can manage article_ab_tests" ON article_ab_tests FOR ALL USING (true);
CREATE POLICY "Service can manage agent_feedback" ON agent_feedback FOR ALL USING (true);
