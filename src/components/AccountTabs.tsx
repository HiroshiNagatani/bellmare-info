import type { BellmareAccount } from "@/lib/accounts";

interface AccountTabsProps {
  accounts: BellmareAccount[];
  selected: string;
  onSelect: (handle: string) => void;
  mode: "all" | "search";
  onModeChange: (mode: "all" | "search") => void;
}

const categoryColors: Record<BellmareAccount["category"], string> = {
  official: "bg-[#e5f5d8] text-[#1a4d28] border-[#a8d48a]",
  academy: "bg-[#e6f7ee] text-[#1a5c3a] border-[#a8d9bc]",
  info: "bg-[#eef2f6] text-[#334155] border-[#cbd5e1]",
};

export function AccountTabs({
  accounts,
  selected,
  onSelect,
  mode,
  onModeChange,
}: AccountTabsProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange("all")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            mode === "all"
              ? "bg-[#7ac143] text-white shadow-md"
              : "bg-white/80 text-[#1a4d28] border border-[#c0dbb0] hover:bg-[#eef8e6]"
          }`}
        >
          公式アカウント
        </button>
        <button
          onClick={() => onModeChange("search")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            mode === "search"
              ? "bg-[#1a4d28] text-white shadow-md"
              : "bg-white/80 text-[#1a4d28] border border-[#c0dbb0] hover:bg-[#eef8e6]"
          }`}
        >
          #湘南ベルマーレ 検索
        </button>
      </div>

      {mode === "all" && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelect("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selected === "all"
                ? "bg-[#1a4d28] text-white border-[#1a4d28] shadow"
                : "bg-white/80 text-[#1a4d28] border-[#c0dbb0] hover:bg-[#eef8e6]"
            }`}
          >
            すべて
          </button>
          {accounts.map((account) => (
            <button
              key={account.handle}
              onClick={() => onSelect(account.handle)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selected === account.handle
                  ? "bg-[#1a4d28] text-white border-[#1a4d28] shadow"
                  : `${categoryColors[account.category]} hover:opacity-80`
              }`}
              title={account.description}
            >
              {account.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
