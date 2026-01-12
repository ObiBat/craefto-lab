import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get page views over time
    const { data: pageViews } = await supabase
      .from('page_views')
      .select('created_at, path')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get unique sessions
    const { data: sessions } = await supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', startDate.toISOString());

    const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size;

    // Get page view counts by path
    const pathCounts: Record<string, number> = {};
    pageViews?.forEach(pv => {
      pathCounts[pv.path] = (pathCounts[pv.path] || 0) + 1;
    });

    const topPages = Object.entries(pathCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Get leads over time
    const { data: leads } = await supabase
      .from('leads')
      .select('created_at, source, score')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    // Get traffic sources
    const { data: sources } = await supabase
      .from('page_views')
      .select('utm_source, referrer')
      .gte('created_at', startDate.toISOString());

    const sourceCounts: Record<string, number> = {};
    sources?.forEach(s => {
      const source = s.utm_source || (s.referrer ? new URL(s.referrer).hostname : 'direct');
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });

    const trafficSources = Object.entries(sourceCounts)
      .map(([source, visits]) => ({ source, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Group data by day for charts
    const viewsByDay: Record<string, number> = {};
    const leadsByDay: Record<string, number> = {};

    pageViews?.forEach(pv => {
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
    const totalViews = pageViews?.length || 0;
    const totalLeads = leads?.length || 0;
    const avgScore = leads?.length
      ? Math.round(leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length)
      : 0;
    const conversionRate = totalViews > 0 ? ((totalLeads / uniqueSessions) * 100).toFixed(2) : '0';

    return NextResponse.json({
      summary: {
        totalViews,
        uniqueVisitors: uniqueSessions,
        totalLeads,
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
