import { Header } from "@/components/Header";
import { NewsFeed } from "@/components/NewsFeed";
import { OfficialLinks } from "@/components/OfficialLinks";
import { TweetFeed } from "@/components/TweetFeed";

export default function Home() {
  return (
    <main className="min-h-screen pb-12">
      <Header />

      <div className="max-w-3xl mx-auto px-4 grid gap-6 md:grid-cols-[1fr_280px] md:items-start">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden bg-white/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-sm border border-[#b8d9eb]">
            <h2 className="text-lg font-bold text-[#0b2c4a] mb-4">
              24時間以内のニュース
            </h2>
            <NewsFeed />
          </section>

          <section className="overflow-hidden bg-white/65 backdrop-blur-sm rounded-2xl p-5 md:p-6 shadow-sm border border-[#b8d9eb]">
            <h2 className="text-lg font-bold text-[#0b2c4a] mb-4">
              X 最新情報
            </h2>
            <TweetFeed />
          </section>
        </div>

        <aside className="space-y-4 md:sticky md:top-4">
          <OfficialLinks />

          <div className="bg-white/75 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-[#b8d9eb] text-xs text-[#5a7a8f] leading-relaxed">
            <p className="font-bold text-[#0b2c4a] mb-2">このアプリについて</p>
            <p>
              直近24時間の湘南ベルマーレ関連ニュースと、X（旧Twitter）の公開投稿をまとめて表示しています。
            </p>
            <p className="mt-2">
              ニュースは公開RSSから取得し、AIダイジェストはCloudflare Workers AIで生成します。
            </p>
          </div>
        </aside>
      </div>

      <footer className="text-center mt-10 text-xs text-[#5a7a8f] px-4">
        <p>
          湘南ベルマーレ公式とは無関係のファン向け情報ビューアです
        </p>
      </footer>
    </main>
  );
}
