import Link from "next/link";
import { Logo } from "@/components/ui";

export function Footer() {
  return (
    <footer className="border-t border-line px-5 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-3">
            The AI Operating System for luxury hospitality. Designed in Marbella.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-3 text-[13px] text-ink-2">
          <a href="#problem" className="transition-colors hover:text-ink">Problem</a>
          <a href="#flow" className="transition-colors hover:text-ink">How it works</a>
          <a href="#dashboard" className="transition-colors hover:text-ink">Product</a>
          <Link href="/dashboard" className="transition-colors hover:text-ink">Live demo</Link>
          <Link href="/login" className="transition-colors hover:text-ink">Sign in</Link>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-line pt-6 text-[12px] text-ink-4">
        <span>© {new Date().getFullYear()} LUXA</span>
        <span className="font-mono">Luxury. Automated.</span>
      </div>
    </footer>
  );
}
