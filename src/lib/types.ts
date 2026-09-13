export interface TweetAuthor {
  screen_name: string;
  name: string;
  avatar_url: string;
  verified?: boolean;
}

export interface TweetMedia {
  type: "photo" | "video" | "gif";
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
}

export interface Tweet {
  id: string;
  text: string;
  url: string;
  created_at: string;
  timestamp: number;
  author: TweetAuthor;
  likes: number;
  retweets: number;
  replies: number;
  media: TweetMedia[];
}

export interface TweetFeedResponse {
  tweets: Tweet[];
  source: string;
  account?: string;
  fetchedAt: string;
}

export interface AccountProfile {
  handle: string;
  name: string;
  description: string;
  avatar_url: string;
  followers: number;
  tweets: number;
  verified: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
}

export interface NewsFeedResponse {
  news: NewsItem[];
  digest?: string;
  fetchedAt: string;
}
