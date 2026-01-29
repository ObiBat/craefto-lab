import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createGeminiClient } from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/pipeline/drafts/[id]/social - Generate social media snippets
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    // Get the draft
    const { data: draft, error: fetchError } = await supabase
      .from("content_drafts")
      .select("title, excerpt, content, keywords")
      .eq("id", id)
      .single();

    if (fetchError || !draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    // Generate social snippets using Gemini
    const gemini = createGeminiClient();

    const prompt = `Generate social media snippets for this article. Return JSON only.

Title: ${draft.title}
Excerpt: ${draft.excerpt || ""}
Keywords: ${draft.keywords?.join(", ") || ""}

Content (first 2000 chars): ${draft.content?.substring(0, 2000)}

Generate:
1. Twitter/X post (max 280 chars, engaging, with relevant hashtags)
2. LinkedIn post (professional tone, 1-2 paragraphs, with call to action)
3. Instagram caption (engaging, storytelling, with relevant hashtags)

Return as JSON:
{
  "twitter_snippet": "...",
  "linkedin_snippet": "...",
  "instagram_caption": "..."
}`;

    const response = await gemini.generateContent(prompt, { temperature: 0.8 });
    
    // Parse the JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to generate snippets" },
        { status: 500 }
      );
    }

    const snippets = JSON.parse(jsonMatch[0]);

    // Update the draft with the snippets
    const { error: updateError } = await supabase
      .from("content_drafts")
      .update({
        twitter_snippet: snippets.twitter_snippet,
        linkedin_snippet: snippets.linkedin_snippet,
        instagram_caption: snippets.instagram_caption,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      snippets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/admin/pipeline/drafts/[id]/social - Get social snippets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerClient();
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from("content_drafts")
      .select("twitter_snippet, linkedin_snippet, instagram_caption")
      .eq("id", id)
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
