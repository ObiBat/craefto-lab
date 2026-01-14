-- Content Pipeline Schema
-- Stage 3: Multi-Agent Content Engine

-- ============================================
-- AGENT RUNS (Tracking all agent executions)
-- ============================================
CREATE TABLE IF NOT EXISTS content_agent_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Agent info
  agent_type TEXT NOT NULL CHECK (agent_type IN ('trend_scanner', 'insight_synthesiser', 'seo_strategist', 'editorial_writer', 'editor_guardian')),

  -- Execution details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Input/Output
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  error_message TEXT,

  -- Metrics
  tokens_used INTEGER DEFAULT 0,
  execution_time_ms INTEGER,

  -- Relations
  triggered_by UUID REFERENCES content_agent_runs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT INSIGHTS (From Trend Scanner)
-- ============================================
CREATE TABLE IF NOT EXISTS content_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source info
  source_type TEXT NOT NULL CHECK (source_type IN ('trend', 'competitor', 'keyword', 'audience', 'manual')),
  source_url TEXT,
  source_title TEXT,

  -- Insight content
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',

  -- Classification
  pillar_id UUID REFERENCES journal_pillars(id),
  relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'trending')),

  -- SEO opportunity
  target_keywords TEXT[] DEFAULT '{}',
  search_volume_estimate INTEGER,
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'approved', 'rejected', 'used')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Agent tracking
  agent_run_id UUID REFERENCES content_agent_runs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT BRIEFS (From Insight Synthesiser)
-- ============================================
CREATE TABLE IF NOT EXISTS content_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source insight
  insight_id UUID REFERENCES content_insights(id),

  -- Brief content
  working_title TEXT NOT NULL,
  angle TEXT NOT NULL,
  thesis_statement TEXT,

  -- Structure
  target_audience TEXT,
  content_type TEXT CHECK (content_type IN ('article', 'deep_dive', 'case_study', 'tutorial', 'opinion')),
  suggested_pillar_id UUID REFERENCES journal_pillars(id),

  -- Outline
  outline JSONB DEFAULT '[]', -- Array of {heading, points, notes}
  key_takeaways TEXT[] DEFAULT '{}',

  -- SEO strategy
  primary_keyword TEXT,
  secondary_keywords TEXT[] DEFAULT '{}',
  meta_description_draft TEXT,

  -- Internal linking
  suggested_links TEXT[] DEFAULT '{}', -- Article slugs to link to

  -- Estimates
  target_word_count INTEGER,
  estimated_reading_time INTEGER,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'in_progress', 'completed')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  feedback TEXT,

  -- Agent tracking
  agent_run_id UUID REFERENCES content_agent_runs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT DRAFTS (From Editorial Writer)
-- ============================================
CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Source brief
  brief_id UUID REFERENCES content_briefs(id),

  -- Draft content
  version INTEGER DEFAULT 1,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL, -- MDX content
  excerpt TEXT,

  -- Metadata
  word_count INTEGER,
  reading_time INTEGER,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Quality metrics (from Editor Guardian)
  readability_score DECIMAL(3,1),
  seo_score DECIMAL(3,1),
  originality_score DECIMAL(3,1),
  overall_score DECIMAL(3,1),

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'needs_revision', 'approved', 'published')),

  -- Agent tracking
  agent_run_id UUID REFERENCES content_agent_runs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT REVIEWS (From Editor Guardian)
-- ============================================
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- What's being reviewed
  draft_id UUID REFERENCES content_drafts(id),
  draft_version INTEGER,

  -- Review results
  verdict TEXT NOT NULL CHECK (verdict IN ('approve', 'revise', 'reject')),

  -- Scores
  readability_score DECIMAL(3,1),
  seo_score DECIMAL(3,1),
  originality_score DECIMAL(3,1),
  accuracy_score DECIMAL(3,1),
  brand_voice_score DECIMAL(3,1),
  overall_score DECIMAL(3,1),

  -- Feedback
  summary TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  improvements TEXT[] DEFAULT '{}',
  critical_issues TEXT[] DEFAULT '{}',

  -- Detailed suggestions
  suggestions JSONB DEFAULT '[]', -- Array of {type, location, original, suggested, reason}

  -- Human override
  human_override BOOLEAN DEFAULT FALSE,
  human_verdict TEXT CHECK (human_verdict IN ('approve', 'revise', 'reject')),
  human_notes TEXT,
  human_reviewed_by TEXT,
  human_reviewed_at TIMESTAMPTZ,

  -- Agent tracking
  agent_run_id UUID REFERENCES content_agent_runs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT QUEUE (Pipeline orchestration)
-- ============================================
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Item info
  item_type TEXT NOT NULL CHECK (item_type IN ('insight', 'brief', 'draft', 'review')),
  item_id UUID NOT NULL,

  -- Pipeline stage
  current_stage TEXT NOT NULL CHECK (current_stage IN ('trend_scan', 'synthesize', 'seo_optimize', 'write', 'review', 'human_approval', 'publish')),
  next_stage TEXT CHECK (next_stage IN ('synthesize', 'seo_optimize', 'write', 'review', 'human_approval', 'publish', 'complete')),

  -- Status
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'awaiting_approval', 'completed', 'failed', 'cancelled')),

  -- Priority
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Error handling
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_agent_runs_type ON content_agent_runs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON content_agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created ON content_agent_runs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_insights_status ON content_insights(status);
CREATE INDEX IF NOT EXISTS idx_insights_pillar ON content_insights(pillar_id);
CREATE INDEX IF NOT EXISTS idx_insights_urgency ON content_insights(urgency);
CREATE INDEX IF NOT EXISTS idx_insights_created ON content_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_briefs_status ON content_briefs(status);
CREATE INDEX IF NOT EXISTS idx_briefs_insight ON content_briefs(insight_id);
CREATE INDEX IF NOT EXISTS idx_briefs_created ON content_briefs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON content_drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_brief ON content_drafts(brief_id);
CREATE INDEX IF NOT EXISTS idx_drafts_created ON content_drafts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_draft ON content_reviews(draft_id);
CREATE INDEX IF NOT EXISTS idx_reviews_verdict ON content_reviews(verdict);

CREATE INDEX IF NOT EXISTS idx_queue_status ON content_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_stage ON content_queue(current_stage);
CREATE INDEX IF NOT EXISTS idx_queue_scheduled ON content_queue(scheduled_for);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trigger_agent_runs_updated_at
  BEFORE UPDATE ON content_agent_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_insights_updated_at
  BEFORE UPDATE ON content_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_briefs_updated_at
  BEFORE UPDATE ON content_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_drafts_updated_at
  BEFORE UPDATE ON content_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_reviews_updated_at
  BEFORE UPDATE ON content_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_queue_updated_at
  BEFORE UPDATE ON content_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE content_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role has full access to agent_runs"
  ON content_agent_runs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to insights"
  ON content_insights FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to briefs"
  ON content_briefs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to drafts"
  ON content_drafts FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to reviews"
  ON content_reviews FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to queue"
  ON content_queue FOR ALL
  USING (auth.role() = 'service_role');
