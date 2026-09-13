import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "abs.twimg.com" },
    ],
  },
};

export default nextConfig;

void initOpenNextCloudflareForDev().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(
    "\n[next dev] Cloudflare のリモート接続をスキップします（Xタイムラインの確認は可能です）。\n" +
      "wrangler のログイン用ポート 8976 が使用中か、未ログインのときに発生します。\n" +
      "他の `next dev` / `wrangler login` を止めてから再実行してください。\n" +
      `詳細: ${message}\n`
  );
});
