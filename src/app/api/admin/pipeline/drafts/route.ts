import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { editorialWriter } from "@/lib/agents/editorial-writer";
import { editorGuardian } from "@/lib/agents/editor-guardian";
import type { ContentDraft, ContentBrief } from "@/lib/agents/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/pipeline/drafts - Get all drafts
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const briefId = searchParams.get("briefId");

  try {
    let query = supabase
      .from("content_drafts")
      .select("*, content_briefs(working_title, content_type)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (briefId) {
      query = query.eq("brief_id", briefId);
    }

    const { data, error } = await query;

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
 * POST /api/admin/pipeline/drafts - Manage drafts
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, draftId, feedback } = body;

    switch (action) {
      case "review": {
        // Run editor guardian review on draft
        if (!draftId) {
          return NextResponse.json(
            { error: "draftId required" },
            { status: 400 }
          );
        }

        const supabase = createServerClient();
        const { data: draft } = await supabase
          .from("content_drafts")
          .select("*")
          .eq("id", draftId)
          .single();

        if (!draft) {
          return NextResponse.json(
            { error: "Draft not found" },
            { status: 404 }
          );
        }

        // Get brief if available
        let brief: ContentBrief | undefined;
        if (draft.brief_id) {
          const { data: briefData } = await supabase
            .from("content_briefs")
            .select("*")
            .eq("id", draft.brief_id)
            .single();
          brief = briefData as ContentBrief;
        }

        const { output, runId } = await editorGuardian.run({
          draft_id: draftId,
          draft: draft as ContentDraft,
          brief,
        });

        return NextResponse.json({
          success: true,
          runId,
          review: output,
        });
      }

      case "revise": {
        // Request revision with feedback
        if (!draftId || !feedback) {
          return NextResponse.json(
            { error: "draftId and feedback required" },
            { status: 400 }
          );
        }

        const draft = await editorialWriter.reviseDraft(
          draftId,
          feedback
        );

        return NextResponse.json({
          success: true,
          draft,
        });
      }

      case "approve": {
        // Manually approve draft for publishing
        if (!draftId) {
          return NextResponse.json(
            { error: "draftId required" },
            { status: 400 }
          );
        }

        const supabase = createServerClient();
        await supabase
          .from("content_drafts")
          .update({ status: "approved" })
          .eq("id", draftId);

        return NextResponse.json({ success: true });
      }

      case "publish": {
        // Publish draft to journal
        if (!draftId) {
          return NextResponse.json(
            { error: "draftId required" },
            { status: 400 }
          );
        }

        const supabase = createServerClient();
        const { data: draft } = await supabase
          .from("content_drafts")
          .select("*, content_briefs(*)")
          .eq("id", draftId)
          .single();

        if (!draft) {
          return NextResponse.json(
            { error: "Draft not found" },
            { status: 404 }
          );
        }

        // Generate slug
        const slug = draft.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        // Check for existing slug
        const { data: existing } = await supabase
          .from("journal_articles")
          .select("slug")
          .eq("slug", slug)
          .single();

        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const brief = draft.content_briefs;

        // Get default author
        const { data: defaultAuthor } = await supabase
          .from("journal_authors")
          .select("id")
          .eq("slug", "craefto-team")
          .single();

        // Create article
        const { data: article, error: insertError } = await supabase
          .from("journal_articles")
          .insert({
            title: draft.title,
            slug: finalSlug,
            excerpt: draft.excerpt || draft.content?.substring(0, 200) + "...",
            content: draft.content,
            pillar_id: brief?.suggested_pillar_id || null,
            author_id: defaultAuthor?.id || null,
            status: "published",
            published_at: new Date().toISOString(),
            meta_title: draft.meta_title || draft.title,
            meta_description: draft.meta_description || draft.excerpt?.substring(0, 160),
            reading_time: draft.reading_time || Math.ceil((draft.content?.split(/\s+/).length || 0) / 200),
          })
          .select()
          .single();

        if (insertError) {
          return NextResponse.json(
            { error: insertError.message },
            { status: 500 }
          );
        }

        // Update draft status
        await supabase
          .from("content_drafts")
          .update({ status: "published" })
          .eq("id", draftId);

        // Update brief status
        if (brief?.id) {
          await supabase
            .from("content_briefs")
            .update({ status: "completed" })
            .eq("id", brief.id);
        }

        return NextResponse.json({
          success: true,
          article: {
            id: article.id,
            slug: article.slug,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
