export interface BellmareAccount {
  handle: string;
  name: string;
  description: string;
  category: "official" | "academy" | "info";
  includeInAll?: boolean;
}

export const BELLMARE_ACCOUNTS: BellmareAccount[] = [
  {
    handle: "bellmare_staff",
    name: "湘南ベルマーレ公式",
    description: "試合情報・クラブニュースの公式発信",
    category: "official",
  },
  {
    handle: "bellmare_acad",
    name: "フットボールアカデミー",
    description: "アカデミー・スクールの試合結果・イベント情報",
    category: "academy",
  },
  {
    handle: "jleague",
    name: "Ｊリーグ公式",
    description: "リーグ全体の公式情報（ベルマーレ関連投稿も）",
    category: "info",
    includeInAll: false,
  },
];

export const OFFICIAL_LINKS = [
  {
    title: "湘南ベルマーレ公式サイト",
    url: "https://www.bellmare.co.jp/",
    description: "試合・ニュース・チケットの総合情報",
  },
  {
    title: "Ｊリーグチケット",
    url: "https://www.jleague-ticket.jp/club/bm/",
    description: "ホーム・アウェイチケット購入",
  },
  {
    title: "レモンガススタジアム平塚",
    url: "https://www.bellmare.co.jp/stadium",
    description: "スタジアムアクセス・座席案内",
  },
  {
    title: "公式オンラインストア",
    url: "https://store.bellmare.co.jp/ja/",
    description: "ユニフォーム・応援グッズ",
  },
];
