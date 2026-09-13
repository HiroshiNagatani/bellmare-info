const MODEL = "openai/gpt-5.4-mini";

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AiRunOptions {
  max_tokens?: number;
  temperature?: number;
}

function extractAiResponse(result: unknown): string {
  if (typeof result === "object" && result !== null) {
    if ("response" in result) {
      const response = (result as { response?: unknown }).response;
      if (typeof response === "string") {
        return response;
      }
    }

    if ("choices" in result) {
      const choices = (
        result as { choices?: Array<{ message?: { content?: string } }> }
      ).choices;
      const content = choices?.[0]?.message?.content;
      if (typeof content === "string") {
        return content;
      }
    }
  }
  return "";
}

async function resolveCloudflareCredentials(): Promise<{
  accountId?: string;
  apiToken?: string;
}> {
  let accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  let apiToken = process.env.CLOUDFLARE_API_TOKEN;

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const cfEnv = env as CloudflareEnv & {
      CLOUDFLARE_API_TOKEN?: string;
    };

    accountId = cfEnv.CLOUDFLARE_ACCOUNT_ID ?? accountId;
    apiToken = apiToken ?? cfEnv.CLOUDFLARE_API_TOKEN ?? cfEnv.API_KEY;
  } catch {
    // Workers バインディングが使えない環境では process.env のみを参照する
  }

  return { accountId, apiToken };
}

export async function runCloudflareAi(
  messages: AiMessage[],
  options?: AiRunOptions
): Promise<string> {
  const input = {
    messages,
    max_completion_tokens: options?.max_tokens ?? 1024,
    temperature: options?.temperature ?? 0.3,
  };

  const bindingResponse = await runWithBinding(input);
  if (bindingResponse !== null) {
    return bindingResponse;
  }

  return runWithRestApi(input);
}

async function runWithBinding(
  input: Record<string, unknown>
): Promise<string | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const ai = (env as CloudflareEnv).AI;

    if (!ai) return null;

    const result = await ai.run(MODEL, input);
    const text = extractAiResponse(result);

    if (!text) {
      return null;
    }

    return text;
  } catch {
    return null;
  }
}

async function runWithRestApi(input: Record<string, unknown>): Promise<string> {
  const { accountId, apiToken } = await resolveCloudflareCredentials();

  if (!accountId || !apiToken) {
    throw new Error(
      "AIの設定がありません。Workers AIバインディングを有効にするか、CLOUDFLARE_ACCOUNT_ID と CLOUDFLARE_API_TOKEN を設定してください。"
    );
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: MODEL,
        ...input,
      }),
    }
  );

  const data = (await response.json()) as {
    success?: boolean;
    result?: unknown;
    choices?: Array<{ message?: { content?: string } }>;
    errors?: Array<{ message?: string }>;
    error?: { message?: string };
  };

  if (!response.ok || data.success === false) {
    throw new Error(
      data.errors?.[0]?.message ??
        data.error?.message ??
        "Cloudflare AI APIの呼び出しに失敗しました"
    );
  }

  const payload = data.result ?? data;
  const text = extractAiResponse(payload);

  if (!text) {
    throw new Error("AIからの応答が空でした");
  }

  return text;
}
