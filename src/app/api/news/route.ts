import { NextResponse } from "next/server";
import { runCloudflareAi } from "@/lib/cloudflare-ai";
import { fetchBellmareNews } from "@/lib/news";
import type { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

async function createNewsDigest(news: NewsItem[]): Promise<string | undefined> {
  if (news.length === 0) return undefined;

  const headlines = news
    .slice(0, 8)
    .map((item, index) => `${index + 1}. ${item.title}（${item.source}）`)
    .join("\n");

  try {
    const digest = await runCloudflareAi(
      [
        {
          role: "system",
          content:
            "あなたは湘南ベルマーレのサポーター向けニュース編集者です。与えられた直近24時間の見出しだけを根拠に、日本語で簡潔なまとめを書いてください。事実のない推測はしないでください。3〜5文、わかりやすい口調で。",
        },
        {
          role: "user",
          content: `直近24時間の湘南ベルマーレ関連ニュース見出しです。短いダイジェストを作成してください。\n\n${headlines}`,
        },
      ],
      { max_tokens: 400, temperature: 0.4 }
    );

    return digest.trim() || undefined;
  } catch {
    // AI未設定・失敗時は記事一覧のみ返す
    return undefined;
  }
}

export async function GET() {
  try {
    const news = await fetchBellmareNews(12);
    const digest = await createNewsDigest(news);

    return NextResponse.json({
      news,
      digest,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ニュースの取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
