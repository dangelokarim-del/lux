"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { LuxaMark } from "@/components/ui";
import { cn } from "@/lib/utils";
import { statusMeta } from "@/lib/domain";
import { useDatabase } from "@/lib/store/hooks";
import { navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const db = useDatabase();

  const live = useMemo(() => {
    const open = db.tasks.filter((t) => statusMeta[t.status].open).length;
    const fresh = db.tasks.filter((t) => t.status === "new").length;
    const villas = db.properties.length;
    const staff = db.staff.length;
    const occupiedVillas = new Set(db.guests.map((g) => g.propertyId).filter(Boolean)).size;
    const occupancy = villas ? Math.round((occupiedVillas / villas) * 100) : 0;
    return { open, fresh, villas, staff, occupancy };
  }, [db]);

  const badgeFor = (kind?: "open" | "new") => (kind === "open" ? live.open : kind === "new" ? live.fresh : 0);

  return (
    <aside className="hidden w-[244px] shrink-0 flex-col border-r border-line bg-bg lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/" aria-label="LUXA" className="focus-ring rounded-md">
          <LuxaMark className="h-[22px] w-auto" />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <div className="px-2 pb-2 pt-3 text-[10px] uppercase tracking-[0.18em] text-ink-4">
          Workspace
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const badge = badgeFor(item.badge);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-[14px] transition-colors",
                  active
                    ? "bg-white/[0.06] text-ink"
                    : "text-ink-2 hover:bg-white/[0.03] hover:text-ink"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden
                />
                <Icon
                  size={17}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none tabular-nums",
                      active ? "bg-accent text-white" : "bg-white/[0.06] text-ink-2"
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3">
        <div className="panel p-4">
          <div className="truncate text-[13px] font-medium">{db.settings.portfolioName}</div>
          <div className="mt-1 text-[12px] tabular-nums text-ink-3">
            {live.villas} {live.villas === 1 ? "property" : "properties"} · {live.staff} staff
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-premium)]"
              style={{ width: `${live.occupancy}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] tabular-nums text-ink-3">{live.occupancy}% occupancy</div>
        </div>
      </div>
    </aside>
  );
}
