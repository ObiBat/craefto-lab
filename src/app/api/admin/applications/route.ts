import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const roleSlug = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = supabase
      .from("job_applications")
      .select("id, full_name, email, role_slug, role_title, status, rating, created_at")
      .order("created_at", { ascending: false });

    if (roleSlug && roleSlug !== "all") {
      query = query.eq("role_slug", roleSlug);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: applications, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: applications || [] });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
