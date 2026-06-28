"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Building2,
  Users,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const items: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListChecks, badge: 14 },
  { href: "/villas", label: "Villas", icon: Building2 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/requests", label: "Guest Requests", icon: MessageSquareText, badge: 2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[244px] shrink-0 flex-col border-r border-line bg-bg lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <div className="px-2 pb-2 pt-3 text-[10px] uppercase tracking-[0.18em] text-ink-4">
          Workspace
        </div>
        <nav className="space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[10px] px-3 py-2 text-[14px] transition-colors",
                  active
                    ? "bg-white/[0.06] text-ink"
                    : "text-ink-2 hover:bg-white/[0.03] hover:text-ink"
                )}
              >
                <Icon
                  size={17}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "text-accent" : "text-ink-3 group-hover:text-ink-2"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
                      active ? "bg-accent text-white" : "bg-white/[0.06] text-ink-2"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3">
        <div className="panel p-4">
          <div className="text-[13px] font-medium">Marbella Portfolio</div>
          <div className="mt-1 text-[12px] text-ink-3">6 villas · 21 staff</div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[72%] rounded-full bg-accent" />
          </div>
          <div className="mt-2 text-[11px] text-ink-3">72% occupancy</div>
        </div>
      </div>
    </aside>
  );
}
