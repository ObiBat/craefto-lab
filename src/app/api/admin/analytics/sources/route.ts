import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics/sources - Get lead source attribution data
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get leads with source data
    const { data: leads, error } = await supabase
      .from("leads")
      .select("id, source, utm_source, utm_medium, utm_campaign, referrer, landing_page, score, created_at")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate by source
    const sourceMap: Record<string, {
      count: number;
      totalScore: number;
      leads: typeof leads;
    }> = {};

    leads?.forEach(lead => {
      const source = lead.source || lead.utm_source || categorizeReferrer(lead.referrer) || "direct";
      
      if (!sourceMap[source]) {
        sourceMap[source] = { count: 0, totalScore: 0, leads: [] };
      }
      
      sourceMap[source].count++;
      sourceMap[source].totalScore += lead.score || 0;
      sourceMap[source].leads.push(lead);
    });

    const sources = Object.entries(sourceMap)
      .map(([source, data]) => ({
        source,
        count: data.count,
        avgScore: Math.round(data.totalScore / data.count),
        percentage: leads?.length ? Math.round((data.count / leads.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Aggregate by UTM campaign
    const campaignMap: Record<string, number> = {};
    leads?.forEach(lead => {
      if (lead.utm_campaign) {
        campaignMap[lead.utm_campaign] = (campaignMap[lead.utm_campaign] || 0) + 1;
      }
    });

    const campaigns = Object.entries(campaignMap)
      .map(([campaign, count]) => ({
        campaign,
        count,
        percentage: leads?.length ? Math.round((count / leads.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Aggregate by landing page
    const landingPageMap: Record<string, number> = {};
    leads?.forEach(lead => {
      if (lead.landing_page) {
        const path = new URL(lead.landing_page, "https://example.com").pathname;
        landingPageMap[path] = (landingPageMap[path] || 0) + 1;
      }
    });

    const landingPages = Object.entries(landingPageMap)
      .map(([page, count]) => ({
        page,
        count,
        percentage: leads?.length ? Math.round((count / leads.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get traffic source breakdown for comparison
    const { data: pageViews } = await supabase
      .from("page_views")
      .select("utm_source, referrer")
      .gte("created_at", startDate.toISOString())
      .limit(50000);

    const trafficSourceMap: Record<string, number> = {};
    pageViews?.forEach(pv => {
      const source = pv.utm_source || categorizeReferrer(pv.referrer) || "direct";
      trafficSourceMap[source] = (trafficSourceMap[source] || 0) + 1;
    });

    const totalTraffic = pageViews?.length || 1;
    const trafficSources = Object.entries(trafficSourceMap)
      .map(([source, count]) => ({
        source,
        visits: count,
        percentage: Math.round((count / totalTraffic) * 100),
        leads: sourceMap[source]?.count || 0,
        conversionRate: count > 0 ? ((sourceMap[source]?.count || 0) / count * 100).toFixed(2) : "0",
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    return NextResponse.json({
      totalLeads: leads?.length || 0,
      sources,
      campaigns,
      landingPages,
      trafficSources,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function categorizeReferrer(referrer: string | null): string | null {
  if (!referrer) return null;

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();

    // Social media
    if (hostname.includes("twitter") || hostname.includes("x.com")) return "twitter";
    if (hostname.includes("linkedin")) return "linkedin";
    if (hostname.includes("facebook")) return "facebook";
    if (hostname.includes("instagram")) return "instagram";
    if (hostname.includes("youtube")) return "youtube";
    if (hostname.includes("tiktok")) return "tiktok";

    // Search engines
    if (hostname.includes("google")) return "google";
    if (hostname.includes("bing")) return "bing";
    if (hostname.includes("duckduckgo")) return "duckduckgo";
    if (hostname.includes("yahoo")) return "yahoo";

    // Other common sources
    if (hostname.includes("reddit")) return "reddit";
    if (hostname.includes("producthunt")) return "producthunt";
    if (hostname.includes("hackernews") || hostname.includes("ycombinator")) return "hackernews";

    return hostname;
  } catch {
    return "other";
  }
}
