"use client";

import { Bell } from "lucide-react";
import { SearchTrigger } from "@/components/ui";
import { UserMenu } from "./UserMenu";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-black/70 px-5 backdrop-blur-xl sm:px-7">
      <div className="min-w-0">
        <h1 className="truncate text-[18px] font-semibold tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="truncate text-[12px] text-ink-3">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <SearchTrigger className="hidden md:flex" />

        <button
          aria-label="Notifications"
          className="focus-ring grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-line bg-white/[0.02] text-ink-2 transition-colors hover:text-ink"
        >
          <span className="relative">
            <Bell size={16} />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        </button>

        <span className="ml-1">
          <UserMenu size={36} />
        </span>
      </div>
    </header>
  );
}
