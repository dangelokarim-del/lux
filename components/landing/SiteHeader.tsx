"use client";

import Link from "next/link";
import { PrimaryPill } from "./MarketingUI";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#ECE8DF]/80 bg-[#FAF9F6]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-1 text-[19px] font-semibold tracking-[-0.02em] text-[#0E0E0F]">
          LUXA
          <span className="mb-2 h-1 w-1 rounded-full bg-[#A9854A]" />
        </Link>

        <nav className="hidden items-center gap-9 text-[14px] text-[#57565C] md:flex">
          <a href="#features" className="transition-colors hover:text-[#0E0E0F]">How it works</a>
          <Link href="/login" className="transition-colors hover:text-[#0E0E0F]">Sign in</Link>
        </nav>

        <PrimaryPill href="/login" className="h-10 px-5 text-[14px]">
          Book a Demo
        </PrimaryPill>
      </div>
    </header>
  );
}
