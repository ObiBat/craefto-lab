/**
 * Google Gemini API Integration
 * Using Gemini 2.5 Pro for content generation
 * Docs: https://ai.google.dev/gemini-api/docs
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-3-pro-preview"; // Gemini 3 Pro - most intelligent model

interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
  generationConfig?: GeminiGenerationConfig;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_GEMINI_API_KEY || "";
    this.model = model || DEFAULT_MODEL;

    if (!this.apiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY is required");
    }
  }

  /**
   * Generate content with Gemini
   */
  async generateContent(
    prompt: string,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<string> {
    const model = options?.model || this.model;
    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${this.apiKey}`;

    const request: GeminiRequest = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 1.0, // Gemini 3 recommends 1.0
        maxOutputTokens: options?.maxTokens ?? 8192,
      },
    };

    if (options?.systemPrompt) {
      request.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini");
    }

    return data.candidates[0].content.parts.map((p) => p.text).join("");
  }

  /**
   * Generate content with conversation history
   */
  async chat(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const url = `${GEMINI_API_URL}/${this.model}:generateContent?key=${this.apiKey}`;

    const geminiMessages: GeminiMessage[] = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const request: GeminiRequest = {
      contents: geminiMessages,
      generationConfig: {
        temperature: options?.temperature ?? 1.0,
        maxOutputTokens: options?.maxTokens ?? 8192,
      },
    };

    if (options?.systemPrompt) {
      request.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini");
    }

    return data.candidates[0].content.parts.map((p) => p.text).join("");
  }

  /**
   * Stream content generation (returns async iterator)
   */
  async *streamContent(
    prompt: string,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): AsyncGenerator<string> {
    const url = `${GEMINI_API_URL}/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;

    const request: GeminiRequest = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 1.0,
        maxOutputTokens: options?.maxTokens ?? 8192,
      },
    };

    if (options?.systemPrompt) {
      request.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield data.candidates[0].content.parts[0].text;
            }
          } catch {
            // Ignore parse errors for incomplete JSON
          }
        }
      }
    }
  }
}

/**
 * Create a Gemini client instance
 */
export function createGeminiClient(apiKey?: string, model?: string): GeminiClient {
  return new GeminiClient(apiKey, model);
}

/**
 * Simple helper for one-off content generation
 */
export async function generateWithGemini(
  prompt: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
  }
): Promise<string> {
  const client = createGeminiClient(options?.apiKey);
  return client.generateContent(prompt, options);
}
