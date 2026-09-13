import type { AccountProfile, Tweet, TweetMedia } from "./types";

const FX_API_BASE = "https://api.fxtwitter.com";

const FETCH_HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (compatible; BellmareInfoApp/1.0; +https://www.bellmare.co.jp/)",
};

async function fetchFxApi(pathOrUrl: string): Promise<Response> {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${FX_API_BASE}${pathOrUrl}`;
  return fetch(url, {
    headers: FETCH_HEADERS,
    cache: "no-store",
  });
}

interface FxAuthor {
  screen_name?: string;
  name?: string;
  avatar_url?: string;
  verification?: { verified?: boolean };
}

interface FxMediaItem {
  type?: string;
  url?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
}

interface FxMediaBlock {
  photos?: FxMediaItem[];
  videos?: FxMediaItem[];
  mosaic?: FxMediaItem[] | { formats?: Record<string, string> };
  all?: FxMediaItem[];
}

interface FxStatus {
  type?: string;
  id?: string;
  text?: string;
  url?: string;
  created_at?: string;
  timestamp?: number;
  created_timestamp?: number;
  author?: FxAuthor;
  likes?: number;
  retweets?: number;
  reposts?: number;
  replies?: number;
  media?: FxMediaBlock;
}

interface FxTimelineResponse {
  code: number;
  results?: FxStatus[];
  cursor?: { bottom?: string };
}

interface FxUserResponse {
  code: number;
  user?: {
    screen_name: string;
    name: string;
    description: string;
    avatar_url: string;
    followers: number;
    tweets: number;
    verification?: { verified?: boolean };
  };
}

function parseMedia(media?: FxMediaBlock): TweetMedia[] {
  if (!media) return [];

  const items: TweetMedia[] = [];
  const seen = new Set<string>();

  const pushItem = (item: FxMediaItem, type: TweetMedia["type"] = "photo") => {
    const url = item.url ?? item.thumbnail_url;
    if (!url || seen.has(url)) return;
    seen.add(url);
    items.push({
      type: item.type === "video" || item.type === "gif" ? item.type : type,
      url,
      thumbnail_url: item.thumbnail_url ?? url,
      width: item.width,
      height: item.height,
    });
  };

  if (media.all?.length) {
    for (const item of media.all) {
      pushItem(item);
    }
  } else {
    for (const photo of media.photos ?? []) {
      pushItem(photo, "photo");
    }

    for (const video of media.videos ?? []) {
      pushItem(video, video.type === "gif" ? "gif" : "video");
    }

    const { mosaic } = media;
    if (Array.isArray(mosaic)) {
      for (const item of mosaic) {
        pushItem(item, "photo");
      }
    } else if (mosaic?.formats) {
      const url =
        mosaic.formats.jpeg ??
        mosaic.formats.webp ??
        Object.values(mosaic.formats)[0];
      if (url) {
        pushItem({ url, thumbnail_url: url }, "photo");
      }
    }
  }

  return items;
}

function parseStatus(status: FxStatus): Tweet | null {
  if (!status.id || !status.text) return null;

  const author = status.author ?? {};
  const timestamp = status.timestamp ?? status.created_timestamp ?? 0;

  return {
    id: status.id,
    text: status.text,
    url: status.url ?? `https://x.com/i/status/${status.id}`,
    created_at: status.created_at ?? "",
    timestamp,
    author: {
      screen_name: author.screen_name ?? "unknown",
      name: author.name ?? author.screen_name ?? "unknown",
      avatar_url: author.avatar_url ?? "",
      verified: author.verification?.verified ?? false,
    },
    likes: status.likes ?? 0,
    retweets: status.retweets ?? status.reposts ?? 0,
    replies: status.replies ?? 0,
    media: parseMedia(status.media),
  };
}

async function fetchFxTimeline(
  path: string,
  errorMessage: string
): Promise<FxTimelineResponse> {
  const res = await fetchFxApi(path);

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `${errorMessage} (HTTP ${res.status}${body ? `: ${body.slice(0, 120)}` : ""})`
    );
  }

  return res.json();
}

function isSameHandle(a: string, b: string): boolean {
  return a.replace(/^@/, "").toLowerCase() === b.replace(/^@/, "").toLowerCase();
}

export async function fetchUserTimeline(
  handle: string,
  count = 20
): Promise<Tweet[]> {
  const fetchCount = Math.min(Math.max(count * 3, 20), 60);
  const data = await fetchFxTimeline(
    `/2/profile/${encodeURIComponent(handle)}/statuses?count=${fetchCount}`,
    `タイムラインの取得に失敗しました: @${handle}`
  );

  if (data.code !== 200 || !Array.isArray(data.results)) {
    throw new Error(`タイムラインが空です: @${handle}`);
  }

  return data.results
    .filter((r) => r.type === "status")
    .map(parseStatus)
    .filter((t): t is Tweet => t !== null)
    .filter((t) => isSameHandle(t.author.screen_name, handle))
    .slice(0, count);
}

export async function fetchHashtagSearch(
  query: string,
  count = 15
): Promise<Tweet[]> {
  const keyword = query.trim().replace(/^#/, "") || "湘南ベルマーレ";
  const searchUrl = new URL(`${FX_API_BASE}/2/search`);
  searchUrl.searchParams.set("q", `#${keyword}`);
  searchUrl.searchParams.set("count", String(count));

  const data = await fetchFxTimeline(
    searchUrl.toString(),
    "検索結果の取得に失敗しました"
  );

  if (data.code !== 200 || !Array.isArray(data.results)) {
    return [];
  }

  return data.results
    .filter((r) => r.type === "status")
    .map(parseStatus)
    .filter((t): t is Tweet => t !== null);
}

export async function fetchUserProfile(
  handle: string
): Promise<AccountProfile | null> {
  const res = await fetchFxApi(`/${encodeURIComponent(handle)}`);

  if (!res.ok) return null;

  const data: FxUserResponse = await res.json();

  if (data.code !== 200 || !data.user) return null;

  const user = data.user;

  return {
    handle: user.screen_name,
    name: user.name,
    description: user.description,
    avatar_url: user.avatar_url,
    followers: user.followers,
    tweets: user.tweets,
    verified: user.verification?.verified ?? false,
  };
}

export async function fetchMultipleTimelines(
  handles: string[],
  countPerAccount = 5
): Promise<Tweet[]> {
  const results = await Promise.allSettled(
    handles.map((handle) => fetchUserTimeline(handle, countPerAccount))
  );

  const tweets: Tweet[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      tweets.push(...result.value);
    }
  }

  return tweets.sort((a, b) => b.timestamp - a.timestamp);
}
