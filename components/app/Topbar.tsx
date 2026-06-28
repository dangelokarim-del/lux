"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-black/70 px-5 backdrop-blur-xl sm:px-7">
      <div className="min-w-0">
        <h1 className="truncate text-[18px] font-semibold tracking-[-0.02em]">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[12px] text-ink-3">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-[10px] border border-line bg-white/[0.02] px-3 py-2 text-[13px] text-ink-3 md:flex">
          <Search size={15} />
          <span>Search</span>
          <kbd className="ml-3 rounded border border-line-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
            ⌘K
          </kbd>
        </div>

        <button className="grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-white/[0.02] text-ink-2 transition-colors hover:text-ink">
          <span className="relative">
            <Bell size={16} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        </button>

        <Link href="/" className="ml-1">
          <Avatar name="Daniela Ruiz" size={36} />
        </Link>
      </div>
    </header>
  );
}
