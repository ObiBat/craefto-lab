import { createServerClient } from "@/lib/supabase";
import type { AgentType, AgentContext, AgentRun } from "./types";

export abstract class BaseAgent<TInput, TOutput> {
  protected agentType: AgentType;
  protected context: AgentContext | null = null;

  constructor(agentType: AgentType) {
    this.agentType = agentType;
  }

  /**
   * Main execution method - must be implemented by each agent
   */
  protected abstract execute(input: TInput): Promise<TOutput>;

  /**
   * Run the agent with full tracking
   */
  async run(input: TInput, triggeredBy?: string): Promise<{ output: TOutput; runId: string }> {
    const supabase = createServerClient();
    const startTime = new Date();

    // Create agent run record
    const { data: run, error: runError } = await supabase
      .from("content_agent_runs")
      .insert({
        agent_type: this.agentType,
        status: "running",
        started_at: startTime.toISOString(),
        input_data: input as Record<string, unknown>,
        triggered_by: triggeredBy || null,
      })
      .select()
      .single();

    if (runError || !run) {
      throw new Error(`Failed to create agent run: ${runError?.message}`);
    }

    this.context = {
      runId: run.id,
      agentType: this.agentType,
      startTime,
    };

    try {
      // Execute the agent
      const output = await this.execute(input);

      const endTime = new Date();
      const executionTimeMs = endTime.getTime() - startTime.getTime();

      // Update run record with success
      await supabase
        .from("content_agent_runs")
        .update({
          status: "completed",
          completed_at: endTime.toISOString(),
          output_data: output as Record<string, unknown>,
          execution_time_ms: executionTimeMs,
        })
        .eq("id", run.id);

      return { output, runId: run.id };
    } catch (error) {
      const endTime = new Date();
      const executionTimeMs = endTime.getTime() - startTime.getTime();
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Update run record with failure
      await supabase
        .from("content_agent_runs")
        .update({
          status: "failed",
          completed_at: endTime.toISOString(),
          error_message: errorMessage,
          execution_time_ms: executionTimeMs,
        })
        .eq("id", run.id);

      throw error;
    }
  }

  /**
   * Get the current run context
   */
  protected getContext(): AgentContext {
    if (!this.context) {
      throw new Error("Agent context not initialized. Call run() first.");
    }
    return this.context;
  }

  /**
   * Update tokens used for the current run
   */
  protected async updateTokensUsed(tokens: number): Promise<void> {
    if (!this.context) return;

    const supabase = createServerClient();
    await supabase
      .from("content_agent_runs")
      .update({ tokens_used: tokens })
      .eq("id", this.context.runId);
  }

  /**
   * Get recent runs for this agent type
   */
  async getRecentRuns(limit = 10): Promise<AgentRun[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("content_agent_runs")
      .select("*")
      .eq("agent_type", this.agentType)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get recent runs: ${error.message}`);
    }

    return data || [];
  }
}

/**
 * LLM Provider type
 */
type LLMProvider = "gemini" | "openai";

/**
 * Helper to call LLM APIs (Gemini or OpenAI)
 * Default: Google Gemini 2.5 Pro
 */
export async function callLLM(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    provider?: LLMProvider;
  } = {}
): Promise<{ content: string; tokensUsed: number }> {
  const provider = options.provider || getDefaultProvider();

  if (provider === "gemini") {
    return callGemini(systemPrompt, userPrompt, options);
  }
  return callOpenAI(systemPrompt, userPrompt, options);
}

/**
 * Get default LLM provider based on available API keys
 */
function getDefaultProvider(): LLMProvider {
  // Prefer Gemini if key is available
  if (process.env.GOOGLE_GEMINI_API_KEY) {
    return "gemini";
  }
  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }
  throw new Error("No LLM API key configured. Set GOOGLE_GEMINI_API_KEY or OPENAI_API_KEY");
}

/**
 * Call Google Gemini API
 * Using Gemini 3 Pro - the most intelligent model
 */
async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{ content: string; tokensUsed: number }> {
  const {
    model = "gemini-3-pro-preview", // Gemini 3 Pro
    temperature = 1.0,
    maxTokens = 8192,
  } = options;

  return await callGeminiModel(systemPrompt, userPrompt, model, temperature, maxTokens);
}

async function callGeminiModel(
  systemPrompt: string,
  userPrompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<{ content: string; tokensUsed: number }> {

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("No response from Gemini");
  }

  const content = data.candidates[0].content.parts
    .map((p: { text: string }) => p.text)
    .join("");

  const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

  return { content, tokensUsed };
}

/**
 * Call OpenAI API (fallback)
 */
async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{ content: string; tokensUsed: number }> {
  const {
    model = "gpt-4o",
    temperature = 0.7,
    maxTokens = 4000,
  } = options;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";
  const tokensUsed = data.usage?.total_tokens || 0;

  return { content, tokensUsed };
}

/**
 * Parse JSON from LLM response (handles markdown code blocks and common issues)
 */
export function parseJSONResponse<T>(content: string): T {
  // Remove markdown code blocks if present
  let cleanContent = content.trim();

  // Handle various markdown formats
  if (cleanContent.startsWith("```json")) {
    cleanContent = cleanContent.slice(7);
  } else if (cleanContent.startsWith("```")) {
    cleanContent = cleanContent.slice(3);
  }
  if (cleanContent.endsWith("```")) {
    cleanContent = cleanContent.slice(0, -3);
  }

  cleanContent = cleanContent.trim();

  // Try to extract JSON object/array if there's extra text
  const jsonMatch = cleanContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleanContent = jsonMatch[1];
  }

  try {
    return JSON.parse(cleanContent);
  } catch (firstError) {
    // Try to repair common JSON issues
    try {
      // Fix unterminated strings by finding the last complete object
      let repaired = cleanContent;

      // If JSON is truncated, try to close it properly
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;

      // Add missing closing brackets/braces
      if (openBrackets > closeBrackets) {
        // Find last complete array item and close
        const lastComma = repaired.lastIndexOf(",");
        if (lastComma > repaired.lastIndexOf("}")) {
          repaired = repaired.substring(0, lastComma);
        }
        repaired += "]".repeat(openBrackets - closeBrackets);
      }
      if (openBraces > closeBraces) {
        repaired += "}".repeat(openBraces - closeBraces);
      }

      return JSON.parse(repaired);
    } catch {
      // If repair fails, throw original error with context
      console.error("Failed to parse JSON response:", cleanContent.substring(0, 500));
      throw firstError;
    }
  }
}
