import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();

  const { data: articles, error } = await supabase
    .from("journal_articles")
    .select(
      `
      id,
      title,
      slug,
      status,
      content_type,
      published_at,
      created_at,
      updated_at,
      author:journal_authors!journal_articles_author_id_fkey(name),
      pillar:journal_pillars!journal_articles_pillar_id_fkey(name, color)
    `
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedArticles = (articles || []).map((article) => {
    // Handle Supabase type inference for relations
    const pillar = article.pillar as unknown as { name: string; color: string } | null;
    const author = article.author as unknown as { name: string } | null;

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      content_type: article.content_type,
      pillar_name: pillar?.name || "Unknown",
      pillar_color: pillar?.color || "#888",
      author_name: author?.name || "Unknown",
      published_at: article.published_at,
      created_at: article.created_at,
      updated_at: article.updated_at,
    };
  });

  return NextResponse.json({ articles: formattedArticles });
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const body = await request.json();

  const {
    title,
    slug,
    subtitle,
    excerpt,
    content,
    featured_image_url,
    featured_image_alt,
    content_type,
    status,
    meta_title,
    meta_description,
    author_id,
    pillar_id,
    reading_time,
  } = body;

  // Validate required fields
  if (!title || !slug || !author_id || !pillar_id) {
    return NextResponse.json(
      { error: "Missing required fields: title, slug, author_id, pillar_id" },
      { status: 400 }
    );
  }

  // Check for duplicate slug
  const { data: existing } = await supabase
    .from("journal_articles")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "An article with this slug already exists" },
      { status: 400 }
    );
  }

  const { data: article, error } = await supabase
    .from("journal_articles")
    .insert({
      title,
      slug,
      subtitle,
      excerpt,
      content,
      featured_image_url,
      featured_image_alt,
      content_type: content_type || "article",
      status: status || "draft",
      meta_title,
      meta_description,
      author_id,
      pillar_id,
      reading_time,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ article }, { status: 201 });
}
