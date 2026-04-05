import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    const { data: application, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();
    const body = await request.json();

    const allowedFields = ["status", "rating", "admin_notes", "reviewed_at"];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    if (body.status && body.status !== "new" && !updates.reviewed_at) {
      updates.reviewed_at = new Date().toISOString();
    }

    const { data: application, error } = await supabase
      .from("job_applications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ application });
  } catch {
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = createServerClient();

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
