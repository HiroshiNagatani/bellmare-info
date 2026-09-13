interface CloudflareEnv {
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>;
  };
  ASSETS?: unknown;
  WORKER_SELF_REFERENCE?: unknown;
  IMAGES?: unknown;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  API_KEY?: string;
}
