import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/projects/[id]/milestones - Get all milestones for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });

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
 * POST /api/admin/projects/[id]/milestones - Create a new milestone
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const body = await request.json();

    // Get current max sort_order
    const { data: existing } = await supabase
      .from("milestones")
      .select("sort_order")
      .eq("project_id", id)
      .order("sort_order", { ascending: false })
      .limit(1);

    const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from("milestones")
      .insert({
        project_id: id,
        name: body.name,
        description: body.description,
        due_date: body.due_date,
        status: body.status || 'pending',
        sort_order: body.sort_order ?? sortOrder,
        deliverables: body.deliverables || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update project progress based on milestones
    await updateProjectProgress(supabase, id);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/projects/[id]/milestones - Update a milestone
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id: projectId } = await params;

  try {
    const body = await request.json();
    const { milestoneId, ...updateData } = body;

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId required" }, { status: 400 });
    }

    // Handle completion
    if (updateData.status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("milestones")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", milestoneId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update project progress based on milestones
    await updateProjectProgress(supabase, projectId);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/projects/[id]/milestones - Delete a milestone
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id: projectId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("milestoneId");

    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestoneId)
      .eq("project_id", projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update project progress
    await updateProjectProgress(supabase, projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper to update project progress based on completed milestones
async function updateProjectProgress(supabase: ReturnType<typeof createServerClient>, projectId: string) {
  const { data: milestones } = await supabase
    .from("milestones")
    .select("status")
    .eq("project_id", projectId);

  if (milestones && milestones.length > 0) {
    const completed = milestones.filter(m => m.status === 'completed').length;
    const progress = Math.round((completed / milestones.length) * 100);

    await supabase
      .from("projects")
      .update({ progress, updated_at: new Date().toISOString() })
      .eq("id", projectId);
  }
}
