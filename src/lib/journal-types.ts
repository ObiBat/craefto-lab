// Journal Content Types

export interface Author {
  id: string;
  name: string;
  slug: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  twitter: string | null;
  linkedin: string | null;
  expertise: string[];
  is_ai_agent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pillar {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  strategic_intent: string | null;
  target_reader: 'founder' | 'designer' | 'cto' | 'product-manager' | 'general' | null;
  color: string;
  icon: string | null;
  keywords: string[];
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  pillar_id: string;
  author_id: string;
  content_type: 'article' | 'deep_dive' | 'case_study' | 'tutorial' | 'opinion';
  featured_image_url: string | null;
  featured_image_alt: string | null;
  og_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  keywords: string[];
  reading_time: number | null;
  word_count: number | null;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  published_at: string | null;
  scheduled_for: string | null;
  source_insight_id: string | null;
  agent_generated: boolean;
  human_edited: boolean;
  editorial_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithRelations extends Article {
  pillar_name: string;
  pillar_slug: string;
  pillar_color: string;
  author_name: string;
  author_slug: string;
  author_avatar: string | null;
  author_role: string | null;
  author_bio: string | null;
  author_twitter: string | null;
  author_linkedin: string | null;
  related_articles?: ArticleCard[];
}

export interface ArticleCard {
  id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  reading_time: number | null;
  published_at: string | null;
  content_type: Article['content_type'];
  pillar_name: string;
  pillar_slug: string;
  pillar_color: string;
  author_name: string;
  author_slug: string;
  author_avatar: string | null;
}

// Content type labels for UI
export const contentTypeLabels: Record<Article['content_type'], string> = {
  article: 'Article',
  deep_dive: 'Deep Dive',
  case_study: 'Case Study',
  tutorial: 'Tutorial',
  opinion: 'Opinion',
};

// Subscriber types
export interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  confirmation_token: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

// Pillar color mappings
export const pillarColors: Record<string, { bg: string; text: string; border: string }> = {
  'systems-thinking': {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
  },
  'applied-ai': {
    bg: 'bg-sage-100',
    text: 'text-sage-700',
    border: 'border-sage-300',
  },
  'product-craft': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-300',
  },
  'creative-technology': {
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    border: 'border-violet-300',
  },
  'studio-practice': {
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-300',
  },
};
