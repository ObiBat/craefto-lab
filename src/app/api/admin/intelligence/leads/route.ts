import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface Analysis {
  fit_score: number;
  project_type: string;
  complexity: string;
  scope_creep_risk: number;
  recommended_stack: string[];
  requires_review: boolean;
  analyzed_at: string;
}

interface TransformedLead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string | null;
  created_at: string;
  analysis: Analysis | null;
}

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
    const transformedLeads: TransformedLead[] = (leads || []).map((lead) => {
      const leadData = lead as Record<string, unknown>;
      const leadAnalysis = leadData.lead_analysis as Analysis[] | null;
      return {
        id: leadData.id as string,
        name: leadData.name as string,
        email: leadData.email as string,
        company: leadData.company as string | null,
        service_interest: leadData.service_interest as string | null,
        budget_range: leadData.budget_range as string | null,
        timeline: leadData.timeline as string | null,
        message: leadData.message as string | null,
        created_at: leadData.created_at as string,
        analysis: Array.isArray(leadAnalysis) && leadAnalysis.length > 0
          ? leadAnalysis[0]
          : null,
      };
    });

    // Calculate stats
    const analyzed = transformedLeads.filter((l) => l.analysis).length;
    const analyzedLeads = transformedLeads.filter((l) => l.analysis);
    const avgFit = analyzed > 0
      ? analyzedLeads.reduce((sum, l) => sum + (l.analysis?.fit_score || 0), 0) / analyzed
      : 0;
    const highRisk = analyzedLeads.filter((l) =>
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
