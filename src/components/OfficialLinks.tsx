import { OFFICIAL_LINKS } from "@/lib/accounts";

export function OfficialLinks() {
  return (
    <section className="bg-white/75 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-[#b8d9eb]">
      <h2 className="text-lg font-bold text-[#0b2c4a] mb-3">
        公式リンク
      </h2>
      <ul className="space-y-2">
        {OFFICIAL_LINKS.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-gradient-to-r from-[#e8f6fc] to-white hover:from-[#d5eef9] hover:to-[#e8f6fc] transition-colors border border-[#b8d9eb]"
            >
              <span className="font-semibold text-[#0b2c4a] text-sm">
                {link.title}
              </span>
              <span className="block text-xs text-[#5a7a8f] mt-0.5">
                {link.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
