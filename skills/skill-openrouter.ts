interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const apiKey = process.env.OPENROUTER_API_KEY;
const baseUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const primaryModel = process.env.OPENROUTER_PRIMARY_MODEL ?? "qwen/qwen3.6-plus:free";
const fallbackModels = (process.env.OPENROUTER_FALLBACK_MODELS ?? "").split(",").map((m) => m.trim()).filter(Boolean);
const maxRetries = Number.parseInt(process.env.MAX_OPENROUTER_RETRIES ?? "3", 10);
const allConfiguredModels = [primaryModel, ...fallbackModels];
const nonFreeModels = allConfiguredModels.filter((model) => !model.endsWith(":free"));

if (!apiKey) {
  throw new Error("Missing OPENROUTER_API_KEY environment variable.");
}

if (nonFreeModels.length > 0) {
  throw new Error(`OpenRouter models must be free-tier (:free). Invalid model(s): ${nonFreeModels.join(", ")}`);
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function callModel(model: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}) for model ${model}: ${body}`);
  }

  const data = (await response.json()) as OpenRouterChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error(`OpenRouter returned empty content for model ${model}.`);
  }

  return content;
}

export async function chatWithFallback(messages: ChatMessage[]): Promise<{ model: string; output: string }> {
  const candidates = [primaryModel, ...fallbackModels];
  let lastError: unknown;

  for (const model of candidates) {
    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        const output = await callModel(model, messages);
        return { model, output };
      } catch (error) {
        lastError = error;
        const backoffMs = Math.min(4000, 250 * 2 ** (attempt - 1));
        await delay(backoffMs);
      }
    }
  }

  throw new Error(`OpenRouter failed after retries across fallback models: ${String(lastError)}`);
}
