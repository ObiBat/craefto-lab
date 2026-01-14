import { NextRequest, NextResponse } from "next/server";
import { contentPipeline } from "@/lib/agents/pipeline";
import { trendScanner } from "@/lib/agents/trend-scanner";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pipeline - Get pipeline status overview
 */
export async function GET() {
  try {
    const status = await contentPipeline.getStatus();
    const awaiting = await contentPipeline.getAwaitingApproval();

    return NextResponse.json({
      status,
      awaitingApproval: awaiting,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/pipeline - Run pipeline operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, topics, itemId, reason } = body;

    switch (action) {
      case "scan": {
        // Run trend scanner with optional topics
        const { output, runId } = await trendScanner.run({
          topics: topics || [],
        });
        return NextResponse.json({
          success: true,
          runId,
          insights: output.insights.length,
        });
      }

      case "process_next": {
        // Process the next queued item
        const result = await contentPipeline.processNext();
        return NextResponse.json(result);
      }

      case "approve": {
        // Approve an item awaiting human approval
        if (!itemId) {
          return NextResponse.json(
            { error: "itemId is required" },
            { status: 400 }
          );
        }
        await contentPipeline.approveItem(itemId);
        return NextResponse.json({ success: true });
      }

      case "reject": {
        // Reject an item
        if (!itemId || !reason) {
          return NextResponse.json(
            { error: "itemId and reason are required" },
            { status: 400 }
          );
        }
        await contentPipeline.rejectItem(itemId, reason);
        return NextResponse.json({ success: true });
      }

      case "run_full": {
        // Run full pipeline for topics
        const { runId } = await contentPipeline.runFullPipeline(topics || []);
        return NextResponse.json({ success: true, runId });
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
