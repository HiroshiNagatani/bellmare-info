import { OFFICIAL_LINKS } from "@/lib/accounts";

export function OfficialLinks() {
  return (
    <section className="bg-white/75 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-[#c0dbb0]">
      <h2 className="text-lg font-bold text-[#1a4d28] mb-3">
        公式リンク
      </h2>
      <ul className="space-y-2">
        {OFFICIAL_LINKS.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-gradient-to-r from-[#eef8e6] to-white hover:from-[#dcefcc] hover:to-[#eef8e6] transition-colors border border-[#c0dbb0]"
            >
              <span className="font-semibold text-[#1a4d28] text-sm">
                {link.title}
              </span>
              <span className="block text-xs text-[#5e7a62] mt-0.5">
                {link.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
