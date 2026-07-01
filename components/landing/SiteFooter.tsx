import Link from "next/link";
import { LuxaMark } from "@/components/ui";

const COLS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    items: [
      { label: "Platform", href: "/login" },
      { label: "Operations", href: "/login" },
      { label: "Integrations", href: "/login" },
      { label: "Enterprise", href: "/login" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/login" },
      { label: "Contact", href: "/login" },
      { label: "Book a Demo", href: "/login" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/login" },
      { label: "Terms", href: "/login" },
      { label: "Security", href: "/login" },
    ],
  },
];

const LOCATIONS = ["Marbella", "Ibiza", "Mykonos", "Dubai", "Saint-Tropez", "Lake Como"];

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-white/[0.06] px-6 pb-16 pt-28 sm:px-8 sm:pt-40">
      <div className="mx-auto grid max-w-6xl gap-14 sm:grid-cols-[1.7fr_1fr_1fr_1fr] sm:gap-12">
        {/* brand */}
        <div>
          <Link href="/" aria-label="LUXA" className="inline-block transition-opacity duration-300 hover:opacity-80">
            <LuxaMark className="h-[26px] w-auto" />
          </Link>
          <p className="mt-5 max-w-xs text-[13.5px] leading-relaxed text-white/40">
            The AI Operating System for Luxury Hospitality. Designed in Marbella. Built for the world&apos;s finest properties.
          </p>
        </div>

        {COLS.map((c) => (
          <div key={c.title}>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">{c.title}</div>
            <ul className="mt-5 space-y-3">
              {c.items.map((it) => (
                <li key={it.label}>
                  <Link href={it.href} className="text-[14px] text-white/75 transition-colors duration-[250ms] hover:text-white">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* international footprint */}
      <div className="mx-auto mt-20 max-w-6xl border-t border-white/[0.06] pt-10">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 sm:gap-x-6">
          {LOCATIONS.map((l, i) => (
            <span key={l} className="flex items-center gap-x-4 sm:gap-x-6">
              <span className="text-[12px] uppercase tracking-[0.2em] text-white/40 sm:text-[12.5px]">{l}</span>
              {i < LOCATIONS.length - 1 && <span aria-hidden className="text-white/20">•</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-[12px] text-white/30 sm:flex-row">
        <span>© {new Date().getFullYear()} LUXA</span>
        <span>Luxury. Automated.</span>
      </div>
    </footer>
  );
}
