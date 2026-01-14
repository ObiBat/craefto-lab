import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  if (!query || query.length < 2) {
    return NextResponse.json({ articles: [] });
  }

  const supabase = createServerClient();

  // Search in title, excerpt, and content
  const { data: articles, error } = await supabase
    .from("journal_published_articles")
    .select(
      "id, title, slug, excerpt, pillar_name, pillar_slug, pillar_color, author_name, published_at, reading_time"
    )
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({
    articles: articles || [],
    query,
    count: articles?.length || 0,
  });
}
