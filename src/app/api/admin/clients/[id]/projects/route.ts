import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/clients/[id]/projects - Get all projects for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        milestones:milestones(*)
      `)
      .eq("client_id", id)
      .order("created_at", { ascending: false });

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
 * POST /api/admin/clients/[id]/projects - Create a new project
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        client_id: id,
        name: body.name,
        description: body.description,
        project_type: body.project_type,
        status: body.status || 'planning',
        health: body.health || 'on_track',
        start_date: body.start_date,
        target_end_date: body.target_end_date,
        budget: body.budget,
        progress: body.progress || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create default milestones if provided
    if (body.milestones && body.milestones.length > 0) {
      const milestones = body.milestones.map((m: { name: string; due_date?: string; description?: string }, idx: number) => ({
        project_id: data.id,
        name: m.name,
        due_date: m.due_date,
        description: m.description,
        sort_order: idx,
      }));

      await supabase.from("milestones").insert(milestones);
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
