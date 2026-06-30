import {
  LayoutDashboard,
  ListChecks,
  Building2,
  Users,
  MessageSquareText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** which live counter (if any) drives this item's badge */
  badge?: "open" | "new";
}

/** Single source of truth for primary navigation. Badges resolve to live counts. */
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", shortLabel: "Tasks", icon: ListChecks, badge: "open" },
  { href: "/villas", label: "Villas", shortLabel: "Villas", icon: Building2 },
  { href: "/team", label: "Team", shortLabel: "Team", icon: Users },
  { href: "/requests", label: "Guest Requests", shortLabel: "Requests", icon: MessageSquareText, badge: "new" },
  { href: "/analytics", label: "Analytics", shortLabel: "Stats", icon: BarChart3 },
];
