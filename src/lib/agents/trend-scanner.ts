import { createServerClient } from "@/lib/supabase";
import { BaseAgent, callLLM, parseJSONResponse } from "./base-agent";
import type { TrendScannerInput, TrendScannerOutput, ContentInsight } from "./types";

const SYSTEM_PROMPT = `You are a Trend Scanner agent for Craefto, a creative tech studio specializing in design systems, applied AI, and product development.

Your job is to identify content opportunities by analyzing topics for:
1. Trending discussions in the tech/design community
2. Emerging patterns and technologies
3. Underserved topics with high value potential
4. Opportunities to establish thought leadership

Our content pillars are:
- Systems Thinking: Design systems that scale and compound value
- Applied AI: Practical AI for real work, not hype cycles
- Product Craft: Building products people genuinely love
- Creative Technology: Where design excellence meets engineering craft
- Studio Practice: How we work, what we believe, and why it matters

For each insight, provide:
- A clear, compelling title
- A concise summary (2-3 sentences)
- 3-5 key points worth covering
- Relevance score (0-1) based on fit with our pillars
- Urgency level (low/medium/high/trending)
- Target keywords for SEO
- Suggested pillar

Return your analysis as JSON.`;

const USER_PROMPT_TEMPLATE = `Analyze the following topics and identify content opportunities for Craefto:

Topics to analyze:
{{topics}}

Focus pillars: {{pillars}}

Additional context:
- We prioritize depth over breadth (authority content)
- Our audience: founders, CTOs, designers, product managers
- We avoid hype - focus on practical, actionable insights
- Content should compound value over time

Identify 3-5 high-value content opportunities. Return as JSON:
{
  "insights": [
    {
      "title": "string",
      "summary": "string",
      "key_points": ["string"],
      "source_type": "trend|competitor|keyword|audience",
      "relevance_score": 0.0-1.0,
      "urgency": "low|medium|high|trending",
      "target_keywords": ["string"],
      "suggested_pillar": "systems-thinking|applied-ai|product-craft|creative-technology|studio-practice"
    }
  ]
}`;

export class TrendScannerAgent extends BaseAgent<TrendScannerInput, TrendScannerOutput> {
  constructor() {
    super("trend_scanner");
  }

  protected async execute(input: TrendScannerInput): Promise<TrendScannerOutput> {
    const supabase = createServerClient();

    // Get pillars for context
    const { data: pillars } = await supabase
      .from("journal_pillars")
      .select("name, slug, description, strategic_intent");

    // Default topics if none provided
    const topics = input.topics?.length
      ? input.topics
      : [
          "AI in product development",
          "Design systems trends",
          "Startup tech stack decisions",
          "Developer experience improvements",
          "No-code/low-code evolution",
        ];

    const pillarContext = input.pillars?.length
      ? input.pillars.join(", ")
      : pillars?.map((p) => p.name).join(", ") || "All pillars";

    // Build the prompt
    const userPrompt = USER_PROMPT_TEMPLATE
      .replace("{{topics}}", topics.map((t) => `- ${t}`).join("\n"))
      .replace("{{pillars}}", pillarContext);

    // Call LLM
    const { content, tokensUsed } = await callLLM(SYSTEM_PROMPT, userPrompt, {
      temperature: 0.8,
      maxTokens: 4000, // Increased for complete JSON responses
    });

    await this.updateTokensUsed(tokensUsed);

    // Parse response
    const response = parseJSONResponse<TrendScannerOutput>(content);

    // Save insights to database
    const context = this.getContext();
    for (const insight of response.insights) {
      // Find pillar ID
      let pillarId: string | null = null;
      if (insight.suggested_pillar && pillars) {
        const pillar = pillars.find((p) => p.slug === insight.suggested_pillar);
        pillarId = pillar?.slug ? (await this.getPillarId(insight.suggested_pillar)) : null;
      }

      await supabase.from("content_insights").insert({
        source_type: insight.source_type || "trend",
        source_url: insight.source_url || null,
        source_title: insight.source_title || null,
        title: insight.title,
        summary: insight.summary,
        key_points: insight.key_points,
        pillar_id: pillarId,
        relevance_score: insight.relevance_score,
        urgency: insight.urgency,
        target_keywords: insight.target_keywords,
        status: "new",
        agent_run_id: context.runId,
      });
    }

    return response;
  }

  private async getPillarId(slug: string): Promise<string | null> {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("journal_pillars")
      .select("id")
      .eq("slug", slug)
      .single();
    return data?.id || null;
  }

  /**
   * Get all pending insights for review
   */
  async getPendingInsights(): Promise<ContentInsight[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("content_insights")
      .select("*")
      .eq("status", "new")
      .order("relevance_score", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get pending insights: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Approve an insight for content creation
   */
  async approveInsight(insightId: string, reviewedBy: string): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("content_insights")
      .update({
        status: "approved",
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", insightId);

    if (error) {
      throw new Error(`Failed to approve insight: ${error.message}`);
    }
  }

  /**
   * Reject an insight
   */
  async rejectInsight(insightId: string, reviewedBy: string, reason: string): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("content_insights")
      .update({
        status: "rejected",
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq("id", insightId);

    if (error) {
      throw new Error(`Failed to reject insight: ${error.message}`);
    }
  }
}

// Export singleton instance
export const trendScanner = new TrendScannerAgent();
