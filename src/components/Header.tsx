export function Header() {
  return (
    <header className="relative overflow-hidden text-center py-10 px-4 mb-2">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 brand-wave opacity-90" />
      <div className="pointer-events-none absolute inset-x-0 top-28 h-24 bg-gradient-to-b from-transparent to-[rgba(243,250,253,0.95)]" />

      <div className="relative animate-rise">
        <p className="font-display text-xs md:text-sm tracking-[0.35em] uppercase text-white/90 mb-3">
          Shonan Bellmare
        </p>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide drop-shadow-sm">
          湘南ベルマーレ
        </h1>
        <p className="mt-1 text-lg md:text-xl font-bold text-[#e8f6fc]">
          情報まとめ
        </p>
        <p className="mt-4 text-sm md:text-base text-[#d6ebf5] max-w-lg mx-auto leading-relaxed">
          公式Xの最新投稿と、直近24時間のベルマーレ関連ニュースをまとめてチェック
        </p>
      </div>
    </header>
  );
}
