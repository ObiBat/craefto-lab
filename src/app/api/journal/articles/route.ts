import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const pillar = searchParams.get('pillar');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('journal_published_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (pillar) {
      query = query.eq('pillar_slug', pillar);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
