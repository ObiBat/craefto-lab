import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/pipeline/batch - Perform batch operations on pipeline items
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();
    const { action, itemType, itemIds, reviewedBy, reason } = body;

    if (!action || !itemType || !itemIds || itemIds.length === 0) {
      return NextResponse.json(
        { error: "action, itemType, and itemIds are required" },
        { status: 400 }
      );
    }

    const tableName = getTableName(itemType);
    if (!tableName) {
      return NextResponse.json(
        { error: `Invalid itemType: ${itemType}` },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = {};
    const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

    switch (action) {
      case "approve":
        updateData = {
          status: itemType === "draft" ? "approved" : "approved",
          reviewed_by: reviewedBy || "admin",
          reviewed_at: new Date().toISOString(),
        };
        break;

      case "reject":
        updateData = {
          status: "rejected",
          reviewed_by: reviewedBy || "admin",
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        };
        break;

      case "delete":
        // Delete all items
        for (const id of itemIds) {
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq("id", id);
          
          if (error) {
            results.failed.push(id);
          } else {
            results.success.push(id);
          }
        }

        // Log the batch operation
        await supabase.from("batch_operations").insert({
          operation_type: action,
          item_type: itemType,
          item_ids: itemIds,
          performed_by: reviewedBy || "admin",
          result: results,
        });

        return NextResponse.json({
          success: true,
          results,
          message: `Deleted ${results.success.length} items`,
        });

      case "publish":
        if (itemType !== "draft") {
          return NextResponse.json(
            { error: "Publish action only works with drafts" },
            { status: 400 }
          );
        }
        // Publishing requires individual handling due to article creation
        // For now, just approve them for publishing
        updateData = {
          status: "approved",
          reviewed_by: reviewedBy || "admin",
          reviewed_at: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Perform the batch update
    for (const id of itemIds) {
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("id", id);

      if (error) {
        results.failed.push(id);
      } else {
        results.success.push(id);
      }
    }

    // Log the batch operation
    await supabase.from("batch_operations").insert({
      operation_type: action,
      item_type: itemType,
      item_ids: itemIds,
      performed_by: reviewedBy || "admin",
      result: results,
    });

    return NextResponse.json({
      success: true,
      results,
      message: `${action}d ${results.success.length} ${itemType}s`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getTableName(itemType: string): string | null {
  const tables: Record<string, string> = {
    insight: "content_insights",
    brief: "content_briefs",
    draft: "content_drafts",
  };
  return tables[itemType] || null;
}
