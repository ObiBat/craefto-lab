import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get total leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // Get leads from this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: newLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get qualified leads (stage: Qualified, Proposal, Negotiation)
    const { data: qualifiedStages } = await supabase
      .from('pipeline_stages')
      .select('id')
      .in('name', ['Qualified', 'Proposal', 'Negotiation']);

    const qualifiedStageIds = qualifiedStages?.map(s => s.id) || [];
    const { count: qualifiedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('stage_id', qualifiedStageIds);

    // Get won deals
    const { data: wonStage } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('name', 'Won')
      .single();

    const { count: wonDeals } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('stage_id', wonStage?.id || '');

    // Calculate conversion rate
    const conversionRate = totalLeads && totalLeads > 0
      ? ((wonDeals || 0) / totalLeads) * 100
      : 0;

    // Get total page views
    const { count: totalPageViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact', head: true });

    // Get recent leads with stage info
    const { data: recentLeads } = await supabase
      .from('leads')
      .select(`
        id,
        name,
        email,
        company,
        service_interest,
        created_at,
        stage:pipeline_stages(name, color)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      totalLeads: totalLeads || 0,
      newLeads: newLeads || 0,
      qualifiedLeads: qualifiedLeads || 0,
      wonDeals: wonDeals || 0,
      conversionRate,
      totalPageViews: totalPageViews || 0,
      recentLeads: recentLeads || [],
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
