import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { editorGuardian } from "@/lib/agents/editor-guardian";
import type { ReviewVerdict } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pipeline/reviews - Get all reviews
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("draftId");
  const verdict = searchParams.get("verdict");

  try {
    let query = supabase
      .from("content_reviews")
      .select("*, content_drafts(title, version)")
      .order("created_at", { ascending: false });

    if (draftId) {
      query = query.eq("draft_id", draftId);
    }
    if (verdict) {
      query = query.eq("verdict", verdict);
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
 * POST /api/admin/pipeline/reviews - Manage reviews
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, reviewId, verdict, notes, reviewedBy } = body;

    switch (action) {
      case "override": {
        // Human override of AI review
        if (!reviewId || !verdict || !reviewedBy) {
          return NextResponse.json(
            { error: "reviewId, verdict, and reviewedBy required" },
            { status: 400 }
          );
        }

        await editorGuardian.humanOverride(
          reviewId,
          verdict as ReviewVerdict,
          notes || "",
          reviewedBy
        );

        return NextResponse.json({ success: true });
      }

      case "stats": {
        // Get review statistics
        const stats = await editorGuardian.getReviewStats();
        return NextResponse.json(stats);
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
