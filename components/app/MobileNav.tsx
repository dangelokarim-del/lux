"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

// a curated set for the bottom bar — the full list lives in the sidebar
const MOBILE_HREFS = ["/dashboard", "/tasks", "/villas", "/requests", "/settings"];

export function MobileNav() {
  const pathname = usePathname();
  const items = navItems.filter((i) => MOBILE_HREFS.includes(i.href));
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-black/80 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors",
                active ? "text-ink" : "text-ink-3"
              )}
            >
              <Icon size={19} className={active ? "text-accent" : ""} />
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
