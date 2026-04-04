import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const [contractorRes, timeLogsRes] = await Promise.all([
      supabase
        .from("contractors")
        .select(`
          *,
          assignments:project_assignments(
            id, role, status, estimated_hours, actual_hours,
            project:projects(id, name, status, client:clients(name))
          )
        `)
        .eq("id", id)
        .single(),
      supabase
        .from("time_logs")
        .select("hours, date, project:projects(name)")
        .eq("contractor_id", id)
        .order("date", { ascending: false })
        .limit(50),
    ]);

    if (contractorRes.error) {
      return NextResponse.json({ error: contractorRes.error.message }, { status: 500 });
    }

    const totalHours = (timeLogsRes.data || []).reduce(
      (sum, log) => sum + Number(log.hours),
      0
    );
    const totalEarnings = totalHours * Number(contractorRes.data.hourly_rate);

    return NextResponse.json({
      ...contractorRes.data,
      total_hours: totalHours,
      total_earnings: totalEarnings,
      recent_logs: timeLogsRes.data || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const fields = [
      "name", "email", "role", "skills", "hourly_rate", "currency",
      "timezone", "country", "portfolio_url", "availability",
      "capacity_hours_weekly", "notes", "avatar_url", "status",
    ];

    const updateData: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (body[f] !== undefined) updateData[f] = body[f];
    });

    const { data, error } = await supabase
      .from("contractors")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const { error } = await supabase.from("contractors").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
