import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createServerClient();

  const { data: article, error } = await supabase
    .from("journal_articles")
    .select(
      `
      *,
      author:journal_authors!journal_articles_author_id_fkey(*),
      pillar:journal_pillars!journal_articles_pillar_id_fkey(*)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
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

  // Check for duplicate slug (excluding current article)
  if (slug) {
    const { data: existing } = await supabase
      .from("journal_articles")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 400 }
      );
    }
  }

  // Get current article to check status change
  const { data: current } = await supabase
    .from("journal_articles")
    .select("status, published_at")
    .eq("id", id)
    .single();

  // Set published_at when transitioning to published
  let published_at = current?.published_at;
  if (status === "published" && current?.status !== "published") {
    published_at = new Date().toISOString();
  }

  const { data: article, error } = await supabase
    .from("journal_articles")
    .update({
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
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ article });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from("journal_articles")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
