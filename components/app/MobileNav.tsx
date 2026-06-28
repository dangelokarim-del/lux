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
import { cn } from "@/lib/utils";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/villas", label: "Villas", icon: Building2 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/requests", label: "Requests", icon: MessageSquareText },
];

export function MobileNav() {
  const pathname = usePathname();
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
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] transition-colors",
                active ? "text-ink" : "text-ink-3"
              )}
            >
              <Icon size={19} className={active ? "text-accent" : ""} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
