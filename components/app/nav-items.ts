import {
  LayoutDashboard,
  ListChecks,
  Building2,
  Users,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  badge?: number;
}

/** Single source of truth for primary navigation. */
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", shortLabel: "Tasks", icon: ListChecks, badge: 14 },
  { href: "/villas", label: "Villas", shortLabel: "Villas", icon: Building2 },
  { href: "/team", label: "Team", shortLabel: "Team", icon: Users },
  { href: "/requests", label: "Guest Requests", shortLabel: "Requests", icon: MessageSquareText, badge: 2 },
];
