import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("time_logs")
      .insert({
        project_id: body.project_id,
        contractor_id: body.contractor_id,
        assignment_id: body.assignment_id || null,
        date: body.date,
        hours: body.hours,
        description: body.description || null,
        billable: body.billable ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update actual_hours on the assignment if provided
    if (body.assignment_id) {
      const { data: assignment } = await supabase
        .from("project_assignments")
        .select("actual_hours")
        .eq("id", body.assignment_id)
        .single();

      if (assignment) {
        await supabase
          .from("project_assignments")
          .update({
            actual_hours: Number(assignment.actual_hours || 0) + Number(body.hours),
          })
          .eq("id", body.assignment_id);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
