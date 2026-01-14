import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { insightSynthesiser } from "@/lib/agents/insight-synthesiser";
import { seoStrategist } from "@/lib/agents/seo-strategist";
import { editorialWriter } from "@/lib/agents/editorial-writer";
import type { ContentBrief } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pipeline/briefs - Get all briefs
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    let query = supabase
      .from("content_briefs")
      .select("*, content_insights(title), journal_pillars(name, slug)")
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
 * POST /api/admin/pipeline/briefs - Manage briefs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, briefId, reviewedBy, feedback, targetKeyword } = body;

    switch (action) {
      case "approve": {
        // Approve brief for writing
        if (!briefId || !reviewedBy) {
          return NextResponse.json(
            { error: "briefId and reviewedBy required" },
            { status: 400 }
          );
        }
        await insightSynthesiser.approveBrief(briefId, reviewedBy, feedback);
        return NextResponse.json({ success: true });
      }

      case "reject": {
        // Request revisions on brief
        if (!briefId || !reviewedBy || !feedback) {
          return NextResponse.json(
            { error: "briefId, reviewedBy, and feedback required" },
            { status: 400 }
          );
        }
        await insightSynthesiser.requestRevisions(briefId, reviewedBy, feedback);
        return NextResponse.json({ success: true });
      }

      case "seo_optimize": {
        // Run SEO optimization on brief
        if (!briefId) {
          return NextResponse.json(
            { error: "briefId required" },
            { status: 400 }
          );
        }

        const supabase = createServerClient();
        const { data: brief } = await supabase
          .from("content_briefs")
          .select("*")
          .eq("id", briefId)
          .single();

        if (!brief) {
          return NextResponse.json(
            { error: "Brief not found" },
            { status: 404 }
          );
        }

        const { output, runId } = await seoStrategist.run({
          brief_id: briefId,
          brief: brief as ContentBrief,
          target_keyword: targetKeyword,
        });

        return NextResponse.json({
          success: true,
          runId,
          seo: output,
        });
      }

      case "write": {
        // Generate draft from brief
        if (!briefId) {
          return NextResponse.json(
            { error: "briefId required" },
            { status: 400 }
          );
        }

        const supabase = createServerClient();
        const { data: brief } = await supabase
          .from("content_briefs")
          .select("*")
          .eq("id", briefId)
          .single();

        if (!brief) {
          return NextResponse.json(
            { error: "Brief not found" },
            { status: 404 }
          );
        }

        const { output, runId } = await editorialWriter.run({
          brief_id: briefId,
          brief: brief as ContentBrief,
        });

        return NextResponse.json({
          success: true,
          runId,
          draft: output,
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
