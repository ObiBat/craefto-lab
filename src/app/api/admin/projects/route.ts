import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/projects - List all projects with client, assignments
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const sort = searchParams.get("sort") || "updated_at";

  try {
    let query = supabase
      .from("projects")
      .select(`
        id, name, description, project_type, status, health, progress, priority,
        start_date, target_end_date, actual_end_date,
        budget, spent, revenue, cost, margin_percent, currency,
        created_at, updated_at,
        client:clients(id, name, company),
        assignments:project_assignments(
          id, role, status,
          contractor:contractors(id, name, avatar_url)
        )
      `);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const ascending = sort === "name";
    query = query.order(sort === "name" ? "name" : "updated_at", { ascending });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/projects - Create a new project
 */
export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: body.name,
        description: body.description || null,
        project_type: body.project_type || "web_development",
        status: body.status || "planning",
        health: body.health || "on_track",
        priority: body.priority || "medium",
        client_id: body.client_id || null,
        start_date: body.start_date || null,
        target_end_date: body.target_end_date || null,
        budget: body.budget || 0,
        revenue: body.revenue || 0,
        cost: body.cost || 0,
        margin_percent: body.margin_percent || 0,
        currency: body.currency || "AUD",
        progress: 0,
      })
      .select(`
        *,
        client:clients(id, name, company)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
