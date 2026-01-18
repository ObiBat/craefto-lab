import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total page views count (using count query, not fetching all rows)
    const { count: totalViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get unique sessions count using RPC or distinct query
    const { data: sessionData } = await supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', startDate.toISOString())
      .limit(50000);

    const uniqueSessions = new Set(sessionData?.map(s => s.session_id)).size;

    // Get top pages with counts (limit to recent data for performance)
    const { data: recentPageViews } = await supabase
      .from('page_views')
      .select('path')
      .gte('created_at', startDate.toISOString())
      .limit(50000);

    const pathCounts: Record<string, number> = {};
    recentPageViews?.forEach(pv => {
      pathCounts[pv.path] = (pathCounts[pv.path] || 0) + 1;
    });

    const topPages = Object.entries(pathCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Get leads count and data
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { data: leads } = await supabase
      .from('leads')
      .select('created_at, score')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })
      .limit(10000);

    // Get traffic sources
    const { data: sources } = await supabase
      .from('page_views')
      .select('utm_source, referrer')
      .gte('created_at', startDate.toISOString())
      .limit(50000);

    const sourceCounts: Record<string, number> = {};
    sources?.forEach(s => {
      let source = 'direct';
      if (s.utm_source) {
        source = s.utm_source;
      } else if (s.referrer) {
        try {
          source = new URL(s.referrer).hostname;
        } catch {
          source = 'direct';
        }
      }
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const trafficSources = Object.entries(sourceCounts)
      .map(([source, visits]) => ({ source, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Get daily views for chart (separate query with limit)
    const { data: dailyPageViews } = await supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .limit(50000);

    // Group data by day for charts
    const viewsByDay: Record<string, number> = {};
    const leadsByDay: Record<string, number> = {};

    dailyPageViews?.forEach(pv => {
      const day = new Date(pv.created_at).toISOString().split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    leads?.forEach(lead => {
      const day = new Date(lead.created_at).toISOString().split('T')[0];
      leadsByDay[day] = (leadsByDay[day] || 0) + 1;
    });

    // Create daily data array
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData.push({
        date: dateStr,
        views: viewsByDay[dateStr] || 0,
        leads: leadsByDay[dateStr] || 0,
      });
    }

    // Calculate averages
    const avgScore = leads?.length
      ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)
      : 0;
    const conversionRate = uniqueSessions > 0 ? (((totalLeads || 0) / uniqueSessions) * 100).toFixed(2) : '0';

    return NextResponse.json({
      summary: {
        totalViews: totalViews || 0,
        uniqueVisitors: uniqueSessions,
        totalLeads: totalLeads || 0,
        avgLeadScore: avgScore,
        conversionRate: `${conversionRate}%`,
      },
      dailyData,
      topPages,
      trafficSources,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
