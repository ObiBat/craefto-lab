// Content Pipeline Agent Types

export type AgentType =
  | "trend_scanner"
  | "insight_synthesiser"
  | "seo_strategist"
  | "editorial_writer"
  | "editor_guardian";

export type AgentRunStatus = "pending" | "running" | "completed" | "failed";

export type InsightStatus = "new" | "approved" | "rejected" | "used";
export type InsightUrgency = "low" | "medium" | "high" | "trending";
export type InsightSourceType = "trend" | "competitor" | "keyword" | "audience" | "manual";

export type BriefStatus = "draft" | "approved" | "rejected" | "in_progress" | "completed";
export type ContentType = "article" | "deep_dive" | "case_study" | "tutorial" | "opinion";

export type DraftStatus = "draft" | "reviewing" | "needs_revision" | "approved" | "published";

export type ReviewVerdict = "approve" | "revise" | "reject";

export type QueueItemType = "insight" | "brief" | "draft" | "review";
export type PipelineStage =
  | "trend_scan"
  | "synthesize"
  | "seo_optimize"
  | "write"
  | "review"
  | "human_approval"
  | "publish"
  | "complete";
export type QueueStatus = "queued" | "processing" | "awaiting_approval" | "completed" | "failed" | "cancelled";

// ============================================
// Database Types
// ============================================

export interface AgentRun {
  id: string;
  agent_type: AgentType;
  status: AgentRunStatus;
  started_at: string | null;
  completed_at: string | null;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  error_message: string | null;
  tokens_used: number;
  execution_time_ms: number | null;
  triggered_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentInsight {
  id: string;
  source_type: InsightSourceType;
  source_url: string | null;
  source_title: string | null;
  title: string;
  summary: string;
  key_points: string[];
  pillar_id: string | null;
  relevance_score: number | null;
  urgency: InsightUrgency | null;
  target_keywords: string[];
  search_volume_estimate: number | null;
  competition_level: "low" | "medium" | "high" | null;
  status: InsightStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  agent_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutlineItem {
  heading: string;
  points: string[];
  notes?: string;
}

export interface ContentBrief {
  id: string;
  insight_id: string | null;
  working_title: string;
  angle: string;
  thesis_statement: string | null;
  target_audience: string | null;
  content_type: ContentType | null;
  suggested_pillar_id: string | null;
  outline: OutlineItem[];
  key_takeaways: string[];
  primary_keyword: string | null;
  secondary_keywords: string[];
  meta_description_draft: string | null;
  suggested_links: string[];
  target_word_count: number | null;
  estimated_reading_time: number | null;
  status: BriefStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  feedback: string | null;
  agent_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentDraft {
  id: string;
  brief_id: string | null;
  version: number;
  title: string;
  subtitle: string | null;
  content: string;
  excerpt: string | null;
  word_count: number | null;
  reading_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[];
  readability_score: number | null;
  seo_score: number | null;
  originality_score: number | null;
  overall_score: number | null;
  status: DraftStatus;
  agent_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EditSuggestion {
  type: "grammar" | "style" | "clarity" | "seo" | "structure" | "fact_check";
  location: string;
  original: string;
  suggested: string;
  reason: string;
}

export interface ContentReview {
  id: string;
  draft_id: string;
  draft_version: number;
  verdict: ReviewVerdict;
  readability_score: number | null;
  seo_score: number | null;
  originality_score: number | null;
  accuracy_score: number | null;
  brand_voice_score: number | null;
  overall_score: number | null;
  summary: string;
  strengths: string[];
  improvements: string[];
  critical_issues: string[];
  suggestions: EditSuggestion[];
  human_override: boolean;
  human_verdict: ReviewVerdict | null;
  human_notes: string | null;
  human_reviewed_by: string | null;
  human_reviewed_at: string | null;
  agent_run_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentQueueItem {
  id: string;
  item_type: QueueItemType;
  item_id: string;
  current_stage: PipelineStage;
  next_stage: PipelineStage | null;
  status: QueueStatus;
  priority: number;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Agent Input/Output Types
// ============================================

export interface TrendScannerInput {
  topics?: string[];
  pillars?: string[];
  sources?: string[];
}

export interface TrendScannerOutput {
  insights: Array<{
    title: string;
    summary: string;
    key_points: string[];
    source_type: InsightSourceType;
    source_url?: string;
    source_title?: string;
    relevance_score: number;
    urgency: InsightUrgency;
    target_keywords: string[];
    suggested_pillar?: string;
  }>;
}

export interface InsightSynthesiserInput {
  insight_id: string;
  insight: ContentInsight;
  pillar_context?: string;
  existing_articles?: string[];
}

export interface InsightSynthesiserOutput {
  working_title: string;
  angle: string;
  thesis_statement: string;
  target_audience: string;
  content_type: ContentType;
  outline: OutlineItem[];
  key_takeaways: string[];
  target_word_count: number;
  estimated_reading_time: number;
}

export interface SEOStrategistInput {
  brief_id: string;
  brief: ContentBrief;
  target_keyword?: string;
}

export interface SEOStrategistOutput {
  primary_keyword: string;
  secondary_keywords: string[];
  meta_description_draft: string;
  suggested_links: string[];
  title_suggestions: string[];
  content_gaps: string[];
}

export interface EditorialWriterInput {
  brief_id: string;
  brief: ContentBrief;
  seo_data?: SEOStrategistOutput;
  previous_draft?: ContentDraft;
  revision_feedback?: string;
}

export interface EditorialWriterOutput {
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  word_count: number;
  reading_time: number;
}

export interface EditorGuardianInput {
  draft_id: string;
  draft: ContentDraft;
  brief?: ContentBrief;
  brand_guidelines?: string;
}

export interface EditorGuardianOutput {
  verdict: ReviewVerdict;
  readability_score: number;
  seo_score: number;
  originality_score: number;
  accuracy_score: number;
  brand_voice_score: number;
  overall_score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  critical_issues: string[];
  suggestions: EditSuggestion[];
}

// ============================================
// Agent Context
// ============================================

export interface AgentContext {
  runId: string;
  agentType: AgentType;
  startTime: Date;
}
