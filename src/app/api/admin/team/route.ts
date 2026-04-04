import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerClient();

  try {
    const { data, error } = await supabase
      .from("contractors")
      .select(`
        *,
        assignments:project_assignments(
          id, role, status, estimated_hours, actual_hours,
          project:projects(id, name, status)
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get time logs per contractor for this week
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.getFullYear(), now.getMonth(), diff)
      .toISOString()
      .split("T")[0];

    const { data: weeklyLogs } = await supabase
      .from("time_logs")
      .select("contractor_id, hours")
      .gte("date", weekStart);

    const weeklyHours: Record<string, number> = {};
    (weeklyLogs || []).forEach((log) => {
      weeklyHours[log.contractor_id] =
        (weeklyHours[log.contractor_id] || 0) + Number(log.hours);
    });

    const enriched = (data || []).map((c) => ({
      ...c,
      hours_this_week: weeklyHours[c.id] || 0,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("contractors")
      .insert({
        name: body.name,
        email: body.email || null,
        role: body.role,
        skills: body.skills || [],
        hourly_rate: body.hourly_rate,
        currency: body.currency || "EUR",
        timezone: body.timezone || null,
        country: body.country || null,
        portfolio_url: body.portfolio_url || null,
        availability: body.availability || "available",
        capacity_hours_weekly: body.capacity_hours_weekly || 40,
        notes: body.notes || null,
        avatar_url: body.avatar_url || null,
        status: body.status || "active",
      })
      .select()
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
