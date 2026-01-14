import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { trendScanner } from "@/lib/agents/trend-scanner";
import { insightSynthesiser } from "@/lib/agents/insight-synthesiser";
import type { ContentInsight } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pipeline/insights - Get all insights
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    let query = supabase
      .from("content_insights")
      .select("*, journal_pillars(name, slug)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/pipeline/insights - Create or manage insights
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, insightId, topics, reviewedBy, reason } = body;

    switch (action) {
      case "scan": {
        // Run trend scanner
        const { output, runId } = await trendScanner.run({
          topics: topics || [],
        });
        return NextResponse.json({
          success: true,
          runId,
          insights: output.insights,
        });
      }

      case "approve": {
        // Approve insight for synthesis
        if (!insightId || !reviewedBy) {
          return NextResponse.json(
            { error: "insightId and reviewedBy required" },
            { status: 400 }
          );
        }
        await trendScanner.approveInsight(insightId, reviewedBy);
        return NextResponse.json({ success: true });
      }

      case "reject": {
        // Reject insight
        if (!insightId || !reviewedBy || !reason) {
          return NextResponse.json(
            { error: "insightId, reviewedBy, and reason required" },
            { status: 400 }
          );
        }
        await trendScanner.rejectInsight(insightId, reviewedBy, reason);
        return NextResponse.json({ success: true });
      }

      case "synthesize": {
        // Create brief from insight
        if (!insightId) {
          return NextResponse.json(
            { error: "insightId required" },
            { status: 400 }
          );
        }

        const supabase = createServerClient();
        const { data: insight } = await supabase
          .from("content_insights")
          .select("*")
          .eq("id", insightId)
          .single();

        if (!insight) {
          return NextResponse.json(
            { error: "Insight not found" },
            { status: 404 }
          );
        }

        const { output, runId } = await insightSynthesiser.run({
          insight_id: insightId,
          insight: insight as ContentInsight,
        });

        return NextResponse.json({
          success: true,
          runId,
          brief: output,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
