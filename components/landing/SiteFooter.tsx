import Link from "next/link";
import { LuxaMark } from "@/components/ui";

const cols = [
  { title: "Product", items: ["Overview", "Operations", "Requests", "Analytics"] },
  { title: "Company", items: ["About", "Careers", "Contact"] },
  { title: "Legal", items: ["Privacy", "Terms"] },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-white/[0.06] px-5 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="LUXA" className="inline-block transition-opacity duration-300 hover:opacity-80">
            <LuxaMark className="h-[24px] w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/40">
            The AI Operating System for luxury hospitality. Designed in Marbella.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">{c.title}</div>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((it) => (
                <li key={it}>
                  <Link href="/login" className="text-[14px] text-white/55 transition-colors hover:text-white">
                    {it}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl items-center justify-between border-t border-white/[0.06] pt-6 text-[12px] text-white/30">
        <span>© {new Date().getFullYear()} LUXA</span>
        <span>Luxury. Automated.</span>
      </div>
    </footer>
  );
}
