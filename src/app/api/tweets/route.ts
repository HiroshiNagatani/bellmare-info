import { NextRequest, NextResponse } from "next/server";
import { BELLMARE_ACCOUNTS } from "@/lib/accounts";
import {
  fetchHashtagSearch,
  fetchMultipleTimelines,
  fetchUserTimeline,
} from "@/lib/fxtwitter";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("mode") ?? "all";
  const account = searchParams.get("account");
  const count = Math.min(Number(searchParams.get("count") ?? 20), 20);

  try {
    let tweets;

    if (mode === "search") {
      const query = searchParams.get("q")?.trim() || "湘南ベルマーレ";
      tweets = await fetchHashtagSearch(query, count);
    } else if (account) {
      tweets = await fetchUserTimeline(account, count);
      tweets = tweets.filter(
        (t) =>
          t.author.screen_name.replace(/^@/, "").toLowerCase() ===
          account.replace(/^@/, "").toLowerCase()
      );
    } else if (mode === "all") {
      const handles = BELLMARE_ACCOUNTS.filter((a) => a.includeInAll !== false).map(
        (a) => a.handle
      );
      tweets = await fetchMultipleTimelines(handles, 3);
    } else {
      return NextResponse.json({ error: "無効なモードです" }, { status: 400 });
    }

    return NextResponse.json({
      tweets: tweets.slice(0, count),
      source: "fxtwitter",
      account: account ?? undefined,
      mode,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "データの取得に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
