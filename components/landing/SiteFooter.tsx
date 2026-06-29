import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#ECE8DF] bg-[#FAF9F6] px-5 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0E0E0F]">
            LUXA
            <span className="mb-2 h-1 w-1 rounded-full bg-[#A9854A]" />
          </Link>
          <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#8B8A90]">
            The AI Operating System for luxury hospitality. Designed in Marbella.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-3 text-[14px] text-[#57565C]">
          <a href="#features" className="transition-colors hover:text-[#0E0E0F]">Features</a>
          <a href="#features" className="transition-colors hover:text-[#0E0E0F]">How it works</a>
          <Link href="/login" className="transition-colors hover:text-[#0E0E0F]">Sign in</Link>
          <Link href="/login" className="transition-colors hover:text-[#0E0E0F]">Book a Demo</Link>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-[#ECE8DF] pt-6 text-[12px] text-[#9a9890]">
        <span>© {new Date().getFullYear()} LUXA</span>
        <span>Luxury made simple.</span>
      </div>
    </footer>
  );
}
