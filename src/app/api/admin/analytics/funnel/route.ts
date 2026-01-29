import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics/funnel - Get conversion funnel data
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get funnel stages
    const { data: stages, error: stagesError } = await supabase
      .from("funnel_stages")
      .select("*")
      .order("sort_order", { ascending: true });

    if (stagesError) {
      return NextResponse.json({ error: stagesError.message }, { status: 500 });
    }

    // Get page views (first stage)
    const { count: pageViews } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString());

    // Get unique sessions that viewed services
    const { data: serviceViews } = await supabase
      .from("page_views")
      .select("session_id")
      .eq("path", "/services")
      .gte("created_at", startDate.toISOString());
    const uniqueServiceViews = new Set(serviceViews?.map(v => v.session_id)).size;

    // Get unique sessions that viewed portfolio
    const { data: portfolioViews } = await supabase
      .from("page_views")
      .select("session_id")
      .like("path", "/work%")
      .gte("created_at", startDate.toISOString());
    const uniquePortfolioViews = new Set(portfolioViews?.map(v => v.session_id)).size;

    // Get unique sessions that viewed contact
    const { data: contactViews } = await supabase
      .from("page_views")
      .select("session_id")
      .eq("path", "/contact")
      .gte("created_at", startDate.toISOString());
    const uniqueContactViews = new Set(contactViews?.map(v => v.session_id)).size;

    // Get leads (final conversion)
    const { count: leads } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString());

    // Build funnel data
    const funnelData = [
      {
        stage: "Visited Site",
        count: pageViews || 0,
        conversionRate: 100,
      },
      {
        stage: "Viewed Services",
        count: uniqueServiceViews,
        conversionRate: pageViews ? Math.round((uniqueServiceViews / pageViews) * 100) : 0,
      },
      {
        stage: "Viewed Portfolio",
        count: uniquePortfolioViews,
        conversionRate: pageViews ? Math.round((uniquePortfolioViews / pageViews) * 100) : 0,
      },
      {
        stage: "Viewed Contact",
        count: uniqueContactViews,
        conversionRate: pageViews ? Math.round((uniqueContactViews / pageViews) * 100) : 0,
      },
      {
        stage: "Submitted Lead",
        count: leads || 0,
        conversionRate: pageViews ? Math.round(((leads || 0) / pageViews) * 100) : 0,
      },
    ];

    return NextResponse.json({
      stages,
      funnel: funnelData,
      overallConversion: pageViews ? ((leads || 0) / pageViews * 100).toFixed(2) : "0",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
