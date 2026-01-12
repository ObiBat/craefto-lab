import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string | null;
  service_interest: string | null;
  budget_range: string | null;
  timeline: string | null;
  message: string | null;
}

// Rule-based analysis when ML service is unavailable
function analyzeLeadRuleBased(lead: LeadData) {
  let fitScore = 0.5; // Base score
  let scopeCreepRisk = 0.3; // Base risk
  const redFlags: string[] = [];
  const greenFlags: string[] = [];

  // Budget analysis
  const budgetScores: Record<string, { fit: number; risk: number }> = {
    '50k+': { fit: 0.3, risk: -0.1 },
    '25-50k': { fit: 0.2, risk: -0.05 },
    '10-25k': { fit: 0.1, risk: 0 },
    '5-10k': { fit: 0, risk: 0.1 },
    '3-5k': { fit: -0.1, risk: 0.2 },
    'discuss': { fit: -0.05, risk: 0.15 },
  };

  if (lead.budget_range && budgetScores[lead.budget_range]) {
    fitScore += budgetScores[lead.budget_range].fit;
    scopeCreepRisk += budgetScores[lead.budget_range].risk;
    if (['50k+', '25-50k'].includes(lead.budget_range)) {
      greenFlags.push('Strong budget');
    }
  }

  // Timeline analysis
  const timelineScores: Record<string, { fit: number; risk: number }> = {
    'asap': { fit: 0.1, risk: 0.2 },
    '1-3months': { fit: 0.15, risk: 0 },
    '3-6months': { fit: 0.1, risk: -0.1 },
    'flexible': { fit: 0.05, risk: 0.1 },
  };

  if (lead.timeline && timelineScores[lead.timeline]) {
    fitScore += timelineScores[lead.timeline].fit;
    scopeCreepRisk += timelineScores[lead.timeline].risk;
    if (lead.timeline === 'asap') {
      redFlags.push('Urgent timeline');
    }
    if (lead.timeline === '1-3months') {
      greenFlags.push('Realistic timeline');
    }
  }

  // Company presence
  if (lead.company) {
    fitScore += 0.1;
    greenFlags.push('Company provided');
  }

  // Message length analysis
  const messageLength = lead.message?.length || 0;
  if (messageLength > 500) {
    fitScore += 0.1;
    greenFlags.push('Detailed brief');
  } else if (messageLength < 50) {
    scopeCreepRisk += 0.15;
    redFlags.push('Vague requirements');
  }

  // Service type to project type mapping
  const serviceToProject: Record<string, string> = {
    'web': 'Web Application',
    'saas': 'SaaS Platform',
    'ai': 'AI Integration',
    'brand': 'Brand Identity',
    'other': 'Discovery',
  };

  // Complexity based on service + budget
  let complexity = 'Medium';
  if (['saas', 'ai'].includes(lead.service_interest || '')) {
    complexity = 'High';
    scopeCreepRisk += 0.1;
  } else if (lead.service_interest === 'brand') {
    complexity = 'Low';
    scopeCreepRisk -= 0.1;
  }

  // Recommended stack based on service
  const stackRecommendations: Record<string, string[]> = {
    'web': ['Next.js', 'Tailwind', 'Vercel'],
    'saas': ['Next.js', 'Supabase', 'Stripe', 'Vercel'],
    'ai': ['Next.js', 'Python', 'OpenAI', 'Vercel'],
    'brand': ['Figma', 'Adobe CC'],
    'other': ['Next.js', 'Tailwind'],
  };

  // Clamp values
  fitScore = Math.max(0, Math.min(1, fitScore));
  scopeCreepRisk = Math.max(0, Math.min(1, scopeCreepRisk));

  // Determine if review needed
  const requiresReview = fitScore < 0.4 || scopeCreepRisk > 0.7 || redFlags.length > 2;

  return {
    fit_score: fitScore,
    project_type: serviceToProject[lead.service_interest || 'other'] || 'Discovery',
    complexity,
    scope_creep_risk: scopeCreepRisk,
    recommended_stack: stackRecommendations[lead.service_interest || 'other'] || ['Next.js', 'Tailwind'],
    red_flags: redFlags,
    green_flags: greenFlags,
    requires_review: requiresReview,
    analysis_mode: 'rule_based',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Fetch the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Try ML service first (if configured)
    let analysis;
    const mlServiceUrl = process.env.ML_SERVICE_URL;

    if (mlServiceUrl) {
      try {
        const mlResponse = await fetch(`${mlServiceUrl}/api/v1/intelligence/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: lead.company,
            industry: 'unknown',
            project_description: lead.message,
            budget_range: lead.budget_range,
            timeline: lead.timeline,
            requested_features: [],
            client_experience: 'unknown',
            revision_expectations: 'moderate',
          }),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          analysis = {
            fit_score: mlData.client_fit_score,
            project_type: mlData.project_type,
            complexity: mlData.complexity_level,
            scope_creep_risk: mlData.scope_creep_risk,
            recommended_stack: mlData.recommended_stack,
            red_flags: mlData.red_flags,
            green_flags: mlData.green_flags,
            requires_review: mlData.requires_human_review,
            analysis_mode: 'ml_service',
          };
        }
      } catch (mlError) {
        console.log('ML service unavailable, using rule-based analysis');
      }
    }

    // Fall back to rule-based analysis
    if (!analysis) {
      analysis = analyzeLeadRuleBased(lead as LeadData);
    }

    // Save analysis to database
    const { error: insertError } = await supabase
      .from('lead_analysis')
      .upsert({
        lead_id: leadId,
        fit_score: analysis.fit_score,
        project_type: analysis.project_type,
        complexity: analysis.complexity,
        scope_creep_risk: analysis.scope_creep_risk,
        recommended_stack: analysis.recommended_stack,
        red_flags: analysis.red_flags,
        green_flags: analysis.green_flags,
        requires_review: analysis.requires_review,
        analysis_mode: analysis.analysis_mode,
        analyzed_at: new Date().toISOString(),
      }, {
        onConflict: 'lead_id',
      });

    if (insertError) {
      console.error('Error saving analysis:', insertError);
      // Still return the analysis even if save fails
    }

    // Log activity
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      type: 'ai_analysis',
      title: 'AI Analysis Completed',
      description: `${analysis.analysis_mode === 'ml_service' ? 'ML Service' : 'Rule-based'} analysis: Fit Score ${Math.round(analysis.fit_score * 100)}%, Scope Risk ${Math.round(analysis.scope_creep_risk * 100)}%`,
      metadata: {
        fit_score: analysis.fit_score,
        scope_creep_risk: analysis.scope_creep_risk,
        project_type: analysis.project_type,
        complexity: analysis.complexity,
        analysis_mode: analysis.analysis_mode,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error analyzing lead:', error);
    return NextResponse.json({ error: 'Failed to analyze lead' }, { status: 500 });
  }
}
