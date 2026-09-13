import type { NewsItem } from "./types";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const BROWSER_HEADERS = {
  Accept: "application/rss+xml, application/xml, text/xml, */*;q=0.8",
  "Accept-Language": "ja,en;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (compatible; BellmareInfoApp/1.0; +https://www.bellmare.co.jp/)",
};

/** Cloudflare Workers からだと Google News は 503 になりやすいので Bing を優先する */
const NEWS_SOURCES = [
  {
    name: "bing",
    url: "https://www.bing.com/news/search?q=%E6%B9%98%E5%8D%97%E3%83%99%E3%83%AB%E3%83%9E%E3%83%BC%E3%83%AC&format=rss&mkt=ja-JP",
  },
  {
    name: "google",
    url: "https://news.google.com/rss/search?q=%E6%B9%98%E5%8D%97%E3%83%99%E3%83%AB%E3%83%9E%E3%83%BC%E3%83%AC+when:1d&hl=ja&gl=JP&ceid=JP:ja",
  },
] as const;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, num: string) =>
      String.fromCodePoint(Number.parseInt(num, 10))
    )
    .replace(/&nbsp;/g, " ");
}

function stripHtml(text: string): string {
  return decodeXmlEntities(text)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const escaped = tag.replace(/:/g, "\\:");
  const cdata = block.match(
    new RegExp(`<${escaped}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${escaped}>`, "i")
  );
  if (cdata?.[1]) return cdata[1].trim();

  const normal = block.match(
    new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i")
  );
  return normal?.[1]?.trim() ?? "";
}

function extractSource(block: string): string {
  const bingSource = extractTag(block, "News:Source");
  if (bingSource) return bingSource;

  const match = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  return match?.[1]?.trim() ?? "不明";
}

function parsePubDate(value: string): number {
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

function cleanTitle(title: string): string {
  return stripHtml(title)
    .replace(/\s*[-–—]\s*[^-–—]+$/u, "")
    .replace(/\s*\.{3}$/u, "")
    .trim();
}

function resolveArticleUrl(rawUrl: string): string {
  const decoded = decodeXmlEntities(rawUrl.trim());

  try {
    const parsed = new URL(decoded);
    const nested = parsed.searchParams.get("url");
    if (nested) {
      return nested.startsWith("http") ? nested : decoded;
    }
  } catch {
    // keep original
  }

  return decoded;
}

function normalizeTitleKey(title: string): string {
  return title.replace(/\s+/g, "").toLowerCase();
}

export function parseNewsRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  const now = Date.now();

  for (const block of itemBlocks) {
    const rawTitle = extractTag(block, "title");
    const url = resolveArticleUrl(extractTag(block, "link"));
    const pubDate = extractTag(block, "pubDate");
    const description = extractTag(block, "description");
    const source = extractSource(block);
    const publishedAt = parsePubDate(pubDate);

    if (!rawTitle || !url || !publishedAt) continue;
    if (now - publishedAt > TWENTY_FOUR_HOURS_MS) continue;

    const title = cleanTitle(rawTitle);
    if (!title) continue;

    items.push({
      id: `${publishedAt}-${url.slice(-32)}`,
      title,
      url,
      source: stripHtml(source),
      publishedAt: new Date(publishedAt).toISOString(),
      summary: stripHtml(description).slice(0, 200) || undefined,
    });
  }

  return items.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

async function fetchRssXml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: BROWSER_HEADERS,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  if (!/<rss[\s>]/i.test(text) && !/<item[\s>]/i.test(text)) {
    throw new Error("RSSではない応答を受信しました");
  }

  return text;
}

function dedupeNews(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const result: NewsItem[] = [];

  for (const item of items) {
    const key = normalizeTitleKey(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export async function fetchBellmareNews(limit = 12): Promise<NewsItem[]> {
  const errors: string[] = [];
  let fetchedSuccessfully = false;

  for (const source of NEWS_SOURCES) {
    try {
      const xml = await fetchRssXml(source.url);
      fetchedSuccessfully = true;
      const news = dedupeNews(parseNewsRss(xml)).slice(0, limit);
      if (news.length > 0) {
        return news;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${source.name}: ${message}`);
    }
  }

  // RSS 自体は取得できたが24時間以内の記事が無い場合は空配列を返す
  if (fetchedSuccessfully) {
    return [];
  }

  throw new Error(
    `ニュースの取得に失敗しました (${errors.join(" / ") || "不明なエラー"})`
  );
}
