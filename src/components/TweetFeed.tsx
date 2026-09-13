"use client";

import { useCallback, useEffect, useState } from "react";
import { BELLMARE_ACCOUNTS } from "@/lib/accounts";
import type { Tweet } from "@/lib/types";
import { AccountTabs } from "./AccountTabs";
import { TweetCard } from "./TweetCard";

export function TweetFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [mode, setMode] = useState<"all" | "search">("all");

  const fetchTweets = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (mode === "search") {
          params.set("mode", "search");
          params.set("q", "湘南ベルマーレ");
          params.set("count", "15");
        } else if (selectedAccount === "all") {
          params.set("mode", "all");
          params.set("count", "20");
        } else {
          params.set("mode", "account");
          params.set("account", selectedAccount);
          params.set("count", "20");
        }

        const res = await fetch(`/api/tweets?${params}`, { signal });
        const data = await res.json();

        if (signal?.aborted) return;

        if (!res.ok) {
          throw new Error(data.error ?? "取得に失敗しました");
        }

        const nextTweets: Tweet[] = data.tweets ?? [];
        const filtered =
          mode === "all" || selectedAccount === "all"
            ? nextTweets
            : nextTweets.filter(
                (t) =>
                  t.author.screen_name.replace(/^@/, "").toLowerCase() ===
                  selectedAccount.toLowerCase()
              );

        setTweets(filtered);
      } catch (err) {
        if (signal?.aborted || (err instanceof DOMException && err.name === "AbortError")) {
          return;
        }
        setError(err instanceof Error ? err.message : "エラーが発生しました");
        setTweets([]);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [mode, selectedAccount]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTweets(controller.signal);
    return () => controller.abort();
  }, [fetchTweets]);

  const selectedInfo = BELLMARE_ACCOUNTS.find(
    (a) => a.handle === selectedAccount
  );

  return (
    <div className="space-y-4">
      <AccountTabs
        accounts={BELLMARE_ACCOUNTS}
        selected={selectedAccount}
        onSelect={setSelectedAccount}
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          if (m === "search") setSelectedAccount("all");
        }}
      />

      {mode === "all" && selectedInfo && (
        <p className="text-xs text-[#5e7a62] bg-white/50 rounded-lg px-3 py-2">
          {selectedInfo.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#5e7a62]">
          {loading
            ? "読み込み中..."
            : `${tweets.length}件の投稿を表示`}
        </p>
        <button
          onClick={() => {
            void fetchTweets();
          }}
          disabled={loading}
          className="text-xs font-bold text-[#1a4d28] bg-white/80 px-3 py-1.5 rounded-full border border-[#c0dbb0] hover:bg-[#eef8e6] disabled:opacity-50 transition-colors"
        >
          更新
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="h-10 w-10 rounded-full brand-wave animate-float" />
          <p className="text-sm text-[#5e7a62] animate-pulse-soft">
            ベルマーレ情報を取得中...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => {
              void fetchTweets();
            }}
            className="mt-2 text-xs font-bold text-red-500 hover:underline"
          >
            再試行
          </button>
        </div>
      )}

      {!loading && !error && tweets.length === 0 && (
        <div className="text-center py-12 text-[#5e7a62]">
          <p className="text-sm">投稿が見つかりませんでした</p>
        </div>
      )}

      {!loading && tweets.length > 0 && (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <TweetCard key={`${tweet.author.screen_name}-${tweet.id}`} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}
