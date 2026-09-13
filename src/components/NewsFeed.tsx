"use client";

import { useCallback, useEffect, useState } from "react";
import type { NewsItem } from "@/lib/types";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;

  return new Date(iso).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [digest, setDigest] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/news");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "取得に失敗しました");
      }

      setNews(data.news ?? []);
      setDigest(data.digest);
      setFetchedAt(data.fetchedAt ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setNews([]);
      setDigest(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[#5a7a8f]">
          {loading
            ? "読み込み中..."
            : fetchedAt
              ? `直近24時間 · ${news.length}件 · ${formatRelativeTime(fetchedAt)}に更新`
              : `${news.length}件`}
        </p>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="text-xs font-bold text-[#0b2c4a] bg-white/80 px-3 py-1.5 rounded-full border border-[#b8d9eb] hover:bg-[#e8f6fc] disabled:opacity-50 transition-colors"
        >
          更新
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="h-10 w-10 rounded-full brand-wave animate-float" />
          <p className="text-sm text-[#5a7a8f] animate-pulse-soft">
            ベルマーレニュースを取得中...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-2 text-xs font-bold text-red-500 hover:underline"
          >
            再試行
          </button>
        </div>
      )}

      {!loading && digest && (
        <div className="rounded-2xl bg-gradient-to-br from-[#e8f6fc] via-white to-[#d5eef9] border border-[#b8d9eb] p-4">
          <p className="text-xs font-bold text-[#0b2c4a] mb-2">AIダイジェスト</p>
          <p className="text-sm text-[#0f2a3d] leading-relaxed whitespace-pre-wrap">
            {digest}
          </p>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="text-center py-10 text-[#5a7a8f]">
          <p className="text-sm">直近24時間のニュースはありません</p>
        </div>
      )}

      {!loading && news.length > 0 && (
        <ul className="space-y-3">
          {news.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-2xl bg-white/80 border border-[#b8d9eb] hover:border-[#00a0e9] hover:bg-[#e8f6fc]/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-[#0b2c4a] leading-snug">
                    {item.title}
                  </h3>
                  <span className="shrink-0 text-[11px] text-[#5a7a8f]">
                    {formatRelativeTime(item.publishedAt)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#5a7a8f]">{item.source}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
