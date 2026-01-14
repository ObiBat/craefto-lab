import { createServerClient } from "@/lib/supabase";
import { BaseAgent, callLLM, parseJSONResponse } from "./base-agent";
import type {
  EditorialWriterInput,
  EditorialWriterOutput,
  ContentDraft,
  ContentBrief,
} from "./types";

const SYSTEM_PROMPT = `You are an Editorial Writer agent for Craefto Lab, a creative tech studio. You write authoritative, practical content that builds long-term value.

Writing principles:
1. DEPTH OVER BREADTH - Go deep on topics, don't skim the surface
2. SHOW DON'T TELL - Use examples, code snippets, case studies
3. PRACTICAL ACTIONABILITY - Readers should leave with clear next steps
4. CONVERSATIONAL AUTHORITY - Expert knowledge, approachable tone
5. STRUCTURE FOR SCANNING - Clear headings, bullets where appropriate

Voice guidelines:
- First person plural ("we") when sharing company perspective
- Second person ("you") when addressing the reader
- Confident but not arrogant
- Technical accuracy without jargon overload
- Occasional wit, never forced

Formatting (MDX):
- Use ## for main sections, ### for subsections
- Use code blocks with language tags for code
- Use <Callout type="tip|note|warning"> for important asides
- Use bullet lists for 3+ related items
- Bold for key terms on first use
- Links should be contextual, not "click here"

IMPORTANT: Write complete, publication-ready content. Don't use placeholders or "[continue here]" markers.`;

const USER_PROMPT_TEMPLATE = `Write a complete article based on this brief:

Title: {{title}}
Angle: {{angle}}
Thesis: {{thesis}}
Target Audience: {{audience}}
Content Type: {{contentType}}
Target Word Count: {{wordCount}}

Outline:
{{outline}}

Key Takeaways to Include:
{{takeaways}}

SEO Context:
- Primary Keyword: {{primaryKeyword}}
- Secondary Keywords: {{secondaryKeywords}}

Articles to Link To:
{{suggestedLinks}}

{{revisionContext}}

Write the complete article in MDX format. Return as JSON:
{
  "title": "string - final title",
  "subtitle": "string - optional tagline",
  "content": "string - full MDX content",
  "excerpt": "string - 2-3 sentence summary for listings",
  "meta_title": "string - SEO title under 60 chars",
  "meta_description": "string - SEO description under 160 chars",
  "word_count": number,
  "reading_time": number
}`;

export class EditorialWriterAgent extends BaseAgent<EditorialWriterInput, EditorialWriterOutput> {
  constructor() {
    super("editorial_writer");
  }

  protected async execute(input: EditorialWriterInput): Promise<EditorialWriterOutput> {
    const supabase = createServerClient();
    const { brief, seo_data, previous_draft, revision_feedback } = input;

    // Format outline
    const outlineText = brief.outline
      .map((item) => {
        let section = `## ${item.heading}`;
        if (item.points.length) {
          section += "\n" + item.points.map((p) => `- ${p}`).join("\n");
        }
        if (item.notes) {
          section += `\n[Writer note: ${item.notes}]`;
        }
        return section;
      })
      .join("\n\n");

    // Build revision context if this is a revision
    let revisionContext = "";
    if (previous_draft && revision_feedback) {
      revisionContext = `
REVISION CONTEXT:
This is a revision. Previous draft issues:
${revision_feedback}

Please address these issues while maintaining the overall structure and quality.`;
    }

    // Build prompt
    const userPrompt = USER_PROMPT_TEMPLATE
      .replace("{{title}}", brief.working_title)
      .replace("{{angle}}", brief.angle)
      .replace("{{thesis}}", brief.thesis_statement || "Not specified")
      .replace("{{audience}}", brief.target_audience || "Tech professionals")
      .replace("{{contentType}}", brief.content_type || "article")
      .replace("{{wordCount}}", String(brief.target_word_count || 1500))
      .replace("{{outline}}", outlineText)
      .replace("{{takeaways}}", brief.key_takeaways.join("\n"))
      .replace("{{primaryKeyword}}", seo_data?.primary_keyword || brief.primary_keyword || "Not specified")
      .replace("{{secondaryKeywords}}", (seo_data?.secondary_keywords || brief.secondary_keywords || []).join(", "))
      .replace("{{suggestedLinks}}", (seo_data?.suggested_links || brief.suggested_links || []).map((s) => `- /journal/${s}`).join("\n") || "None specified")
      .replace("{{revisionContext}}", revisionContext);

    // Call LLM with higher token limit for long-form content
    const { content, tokensUsed } = await callLLM(SYSTEM_PROMPT, userPrompt, {
      temperature: 0.75,
      maxTokens: 6000,
    });

    await this.updateTokensUsed(tokensUsed);

    // Parse response
    const response = parseJSONResponse<EditorialWriterOutput>(content);

    // Calculate version number
    let version = 1;
    if (previous_draft) {
      version = previous_draft.version + 1;
    }

    // Save draft to database
    const context = this.getContext();
    await supabase.from("content_drafts").insert({
      brief_id: input.brief_id,
      version,
      title: response.title,
      subtitle: response.subtitle || null,
      content: response.content,
      excerpt: response.excerpt,
      word_count: response.word_count,
      reading_time: response.reading_time,
      meta_title: response.meta_title,
      meta_description: response.meta_description,
      keywords: seo_data?.secondary_keywords || brief.secondary_keywords || [],
      status: "draft",
      agent_run_id: context.runId,
    });

    // Update brief status
    await supabase
      .from("content_briefs")
      .update({ status: "in_progress" })
      .eq("id", input.brief_id);

    return response;
  }

  /**
   * Get draft by ID
   */
  async getDraft(draftId: string): Promise<ContentDraft | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("content_drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get all drafts for a brief
   */
  async getDraftsForBrief(briefId: string): Promise<ContentDraft[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("content_drafts")
      .select("*")
      .eq("brief_id", briefId)
      .order("version", { ascending: false });

    if (error) {
      throw new Error(`Failed to get drafts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get pending drafts awaiting review
   */
  async getPendingDrafts(): Promise<ContentDraft[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("content_drafts")
      .select("*")
      .eq("status", "draft")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get pending drafts: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Revise a draft based on feedback
   */
  async reviseDraft(draftId: string, feedback: string): Promise<EditorialWriterOutput> {
    const supabase = createServerClient();

    // Get the draft and its brief
    const { data: draft } = await supabase
      .from("content_drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (!draft) {
      throw new Error("Draft not found");
    }

    const { data: brief } = await supabase
      .from("content_briefs")
      .select("*")
      .eq("id", draft.brief_id)
      .single();

    if (!brief) {
      throw new Error("Brief not found");
    }

    // Run the agent with revision context
    const { output } = await this.run({
      brief_id: brief.id,
      brief: brief as ContentBrief,
      previous_draft: draft as ContentDraft,
      revision_feedback: feedback,
    });

    return output;
  }
}

// Export singleton instance
export const editorialWriter = new EditorialWriterAgent();
