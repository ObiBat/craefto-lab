import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createServerClient();

    const { data: article, error } = await supabase
      .from('journal_published_articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      console.error('Error fetching article:', error);
      return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
    }

    // Fetch related articles
    const { data: relatedArticles } = await supabase
      .from('journal_article_relations')
      .select(`
        related_article_id,
        relation_type,
        display_order
      `)
      .eq('article_id', article.id)
      .order('display_order');

    // If we have related articles, fetch their details
    let related: Record<string, unknown>[] = [];
    if (relatedArticles && relatedArticles.length > 0) {
      const relatedIds = relatedArticles.map(r => r.related_article_id);
      const { data: relatedDetails } = await supabase
        .from('journal_published_articles')
        .select('id, title, slug, excerpt, featured_image_url, reading_time, pillar_name, pillar_slug, pillar_color, author_name')
        .in('id', relatedIds);

      related = relatedDetails || [];
    }

    // If no explicit relations, get articles from same pillar
    if (related.length === 0) {
      const { data: sameTopicArticles } = await supabase
        .from('journal_published_articles')
        .select('id, title, slug, excerpt, featured_image_url, reading_time, pillar_name, pillar_slug, pillar_color, author_name')
        .eq('pillar_id', article.pillar_id)
        .neq('id', article.id)
        .order('published_at', { ascending: false })
        .limit(3);

      related = sameTopicArticles || [];
    }

    return NextResponse.json({
      article,
      relatedArticles: related,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}
