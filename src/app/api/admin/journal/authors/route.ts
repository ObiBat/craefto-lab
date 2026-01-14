import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();

  const { data: authors, error } = await supabase
    .from("journal_authors")
    .select("id, name, slug, role, avatar_url")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ authors: authors || [] });
}
