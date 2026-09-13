import Image from "next/image";
import type { ReactNode } from "react";
import type { Tweet, TweetMedia } from "@/lib/types";

function formatDate(timestamp: number, createdAt: string): string {
  if (timestamp) {
    return new Date(timestamp * 1000).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (createdAt) {
    return new Date(createdAt).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return "";
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function TweetMediaImage({
  media,
  single,
}: {
  media: TweetMedia;
  single: boolean;
}) {
  const src = media.thumbnail_url ?? media.url;
  const isVideo = media.type === "video";

  let image: ReactNode;

  if (media.width && media.height) {
    const maxWidth = single ? 480 : 240;
    const scale = Math.min(1, maxWidth / media.width);
    const width = Math.round(media.width * scale);
    const height = Math.round(media.height * scale);

    image = (
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        className="max-w-full h-auto rounded-xl"
        sizes={
          single ? "(max-width: 768px) 100vw, 480px" : "(max-width: 768px) 50vw, 240px"
        }
      />
    );
  } else {
    image = (
      <div
        className={`relative w-full min-w-0 overflow-hidden rounded-xl bg-[#e8f6fc] ${
          single ? "aspect-[4/3] max-h-72" : "aspect-square max-h-40"
        }`}
      >
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes={
            single ? "(max-width: 768px) 100vw, 480px" : "(max-width: 768px) 50vw, 240px"
          }
        />
      </div>
    );
  }

  if (!isVideo) return image;

  return (
    <div className="relative max-w-full">
      {image}
      <span className="absolute inset-0 flex items-center justify-center text-white text-2xl bg-black/20 rounded-xl">
        ▶
      </span>
    </div>
  );
}

export function TweetCard({ tweet }: { tweet: Tweet }) {
  const media = tweet.media.slice(0, 4);
  const singleMedia = media.length === 1;

  return (
    <article className="min-w-0 overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-[#b8d9eb] hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 min-w-0">
        {tweet.author.avatar_url ? (
          <Image
            src={tweet.author.avatar_url.replace("_normal", "_bigger")}
            alt={tweet.author.name}
            width={44}
            height={44}
            className="rounded-full shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-[#00a0e9] shrink-0 flex items-center justify-center text-white text-xs font-bold">
            BM
          </div>
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#0f2a3d] text-sm">
              {tweet.author.name}
            </span>
            {tweet.author.verified && (
              <span className="text-[#00a0e9] text-xs">✓</span>
            )}
            <a
              href={`https://x.com/${tweet.author.screen_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5a7a8f] text-xs hover:underline"
            >
              @{tweet.author.screen_name}
            </a>
            <span className="text-[#5a7a8f] text-xs ml-auto">
              {formatDate(tweet.timestamp, tweet.created_at)}
            </span>
          </div>

          <p className="mt-2 text-sm text-[#0f2a3d] whitespace-pre-wrap leading-relaxed break-words">
            {tweet.text}
          </p>

          {media.length > 0 && (
            <div
              className={`mt-3 grid w-full min-w-0 max-w-full gap-2 overflow-hidden ${
                singleMedia ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {media.map((m, i) => (
                <div key={i} className="min-w-0 max-w-full overflow-hidden">
                  <TweetMediaImage media={m} single={singleMedia} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-[#5a7a8f]">
            <span>💬 {formatCount(tweet.replies)}</span>
            <span>🔁 {formatCount(tweet.retweets)}</span>
            <span>❤️ {formatCount(tweet.likes)}</span>
            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[#00a0e9] hover:text-[#0b2c4a] font-semibold shrink-0"
            >
              Xで見る →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
