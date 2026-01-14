import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface AnalyticsEvent {
  articleId: string;
  slug: string;
  eventType: string;
  visitorId?: string;
  sessionId?: string;
  referrer?: string;
  deviceType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * POST /api/analytics/article - Record article analytics event
 */
export async function POST(request: NextRequest) {
  try {
    // Parse body - handle both JSON and sendBeacon (text)
    let body: AnalyticsEvent;
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = JSON.parse(text);
    }

    const {
      articleId,
      eventType,
      visitorId,
      sessionId,
      referrer,
      deviceType,
      metadata = {},
    } = body;

    if (!articleId || !eventType) {
      return NextResponse.json(
        { error: "articleId and eventType required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Get user agent and country from headers
    const userAgent = request.headers.get("user-agent") || undefined;
    const country = request.headers.get("cf-ipcountry") || // Cloudflare
      request.headers.get("x-vercel-ip-country") || // Vercel
      undefined;

    // Record the event
    const { error } = await supabase.from("article_events").insert({
      article_id: articleId,
      event_type: eventType,
      visitor_id: visitorId || null,
      session_id: sessionId || null,
      referrer: referrer || null,
      user_agent: userAgent,
      country,
      device_type: deviceType || null,
      metadata,
    });

    if (error) {
      console.error("Analytics insert error:", error);
      // Don't expose internal errors
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // For view events, also update daily aggregates
    if (eventType === "view") {
      await updateDailyViews(supabase, articleId, visitorId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

async function updateDailyViews(
  supabase: ReturnType<typeof createServerClient>,
  articleId: string,
  visitorId?: string
) {
  const today = new Date().toISOString().split("T")[0];

  // Check if we already have a record for today
  const { data: existing } = await supabase
    .from("article_views")
    .select("id, view_count, unique_visitors")
    .eq("article_id", articleId)
    .eq("view_date", today)
    .single();

  if (existing) {
    // Update existing record
    await supabase
      .from("article_views")
      .update({
        view_count: existing.view_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    // Create new record for today
    await supabase.from("article_views").insert({
      article_id: articleId,
      view_date: today,
      view_count: 1,
      unique_visitors: visitorId ? 1 : 0,
    });
  }
}

/**
 * GET /api/analytics/article - Get article analytics (for admin)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");
  const days = parseInt(searchParams.get("days") || "30");

  const supabase = createServerClient();

  if (articleId) {
    // Get specific article analytics
    const [performance, dailyViews, recentEvents] = await Promise.all([
      supabase
        .from("article_performance")
        .select("*")
        .eq("article_id", articleId)
        .single(),
      supabase
        .from("article_views")
        .select("*")
        .eq("article_id", articleId)
        .gte("view_date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
        .order("view_date", { ascending: false }),
      supabase
        .from("article_events")
        .select("event_type, created_at, metadata")
        .eq("article_id", articleId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    return NextResponse.json({
      performance: performance.data,
      dailyViews: dailyViews.data || [],
      recentEvents: recentEvents.data || [],
    });
  }

  // Get overview of all articles
  const { data: topArticles } = await supabase
    .from("article_performance")
    .select(`
      *,
      journal_articles(title, slug)
    `)
    .order("total_views", { ascending: false })
    .limit(20);

  const { data: trending } = await supabase
    .from("article_performance")
    .select(`
      *,
      journal_articles(title, slug)
    `)
    .order("trend_score", { ascending: false })
    .limit(10);

  return NextResponse.json({
    topArticles: topArticles || [],
    trending: trending || [],
  });
}
