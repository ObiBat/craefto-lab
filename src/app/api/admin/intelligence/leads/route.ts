import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();

    // Get all leads with their analysis data
    const { data: leads, error } = await supabase
      .from('leads')
      .select(`
        id,
        name,
        email,
        company,
        service_interest,
        budget_range,
        timeline,
        message,
        created_at,
        lead_analysis(
          fit_score,
          project_type,
          complexity,
          scope_creep_risk,
          recommended_stack,
          requires_review,
          analyzed_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    // Transform data to flatten analysis
    const transformedLeads = (leads || []).map((lead: Record<string, unknown>) => ({
      ...lead,
      analysis: Array.isArray(lead.lead_analysis) && lead.lead_analysis.length > 0
        ? lead.lead_analysis[0]
        : null,
      lead_analysis: undefined,
    }));

    // Calculate stats
    const analyzed = transformedLeads.filter((l: Record<string, unknown>) => l.analysis).length;
    const analyzedLeads = transformedLeads.filter((l: Record<string, unknown>) => l.analysis);
    const avgFit = analyzed > 0
      ? analyzedLeads.reduce((sum: number, l: Record<string, { fit_score: number }>) => sum + (l.analysis?.fit_score || 0), 0) / analyzed
      : 0;
    const highRisk = analyzedLeads.filter((l: Record<string, { scope_creep_risk: number }>) =>
      l.analysis && l.analysis.scope_creep_risk > 0.7
    ).length;

    return NextResponse.json({
      leads: transformedLeads,
      stats: {
        total: transformedLeads.length,
        analyzed,
        avgFit,
        highRisk,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
