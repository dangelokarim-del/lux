"use client";

/**
 * The bottom KPI strip — the operation's vital signs at a glance, Bloomberg-dense
 * but Apple-calm. Animated counters, blue accent only, minimal color.
 */
import { useMemo } from "react";
import { Inbox, TriangleAlert, Users, PlaneLanding, Timer, CircleCheck, TrendingUp, Heart } from "lucide-react";
import { LiveNumber } from "@/components/landing/anim/LiveNumber";
import { useDatabase } from "@/lib/store/hooks";
import { computeKpis, fmtDuration } from "@/lib/store/insights";
import type { LiveStaff } from "@/lib/live/engine";

export function KpiStrip({ staff }: { staff: LiveStaff[] }) {
  const db = useDatabase();
  const k = useMemo(() => computeKpis(db), [db]);
  const online = staff.filter((s) => s.status !== "offline").length;
  const arriving = db.properties.filter((p) => p.status === "arriving").length;

  // deterministic commercial figures from the live portfolio
  const revenue = useMemo(() => {
    const occupied = db.properties.filter((p) => p.status === "occupied");
    return occupied.reduce((sum, p) => sum + (2 + p.bedrooms) * 1900, 0);
  }, [db.properties]);
  const satisfaction = useMemo(() => {
    let h = 2166136261; const s = db.settings.portfolioName;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return 95 + ((h >>> 0) % 4);
  }, [db.settings.portfolioName]);

  type Tone = "default" | "urgent" | "ok" | "accent";
  const cards: { icon: typeof Inbox; label: string; value?: number; text?: string; tone?: Tone }[] = [
    { icon: Inbox, label: "Open requests", value: k.open },
    { icon: TriangleAlert, label: "Urgent", value: k.urgent, tone: k.urgent > 0 ? "urgent" : "default" },
    { icon: Users, label: "Staff online", value: online, tone: "ok" },
    { icon: PlaneLanding, label: "Guests arriving", value: arriving, tone: "accent" },
    { icon: Timer, label: "Avg response", text: fmtDuration(k.avgResponse) },
    { icon: CircleCheck, label: "Completed today", value: k.completedToday, tone: "ok" },
    { icon: TrendingUp, label: "Revenue today", text: `€${(revenue / 1000).toFixed(1)}k`, tone: "accent" },
    { icon: Heart, label: "Guest satisfaction", text: `${satisfaction}%`, tone: "ok" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
      {cards.map((c) => <KpiCard key={c.label} {...c} />)}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, text, tone = "default" }: { icon: typeof Inbox; label: string; value?: number; text?: string; tone?: "default" | "urgent" | "ok" | "accent" }) {
  const color = tone === "urgent" ? "text-urgent" : tone === "ok" ? "text-ok" : tone === "accent" ? "text-accent" : "text-ink";
  return (
    <div className="card-spotlight panel-hover relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white/[0.015] p-3.5">
      {tone === "accent" && <div aria-hidden className="glow-accent pointer-events-none absolute -right-5 -top-7 h-20 w-20 opacity-60 blur-xl" />}
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-ink-4">
        <Icon size={12} className={color} /> {label}
      </div>
      <div className={`mt-2 text-[24px] font-semibold leading-none tracking-tight tabular-nums ${color}`}>
        {text != null ? text : <LiveNumber value={value ?? 0} pad={1} duration={0.9} />}
      </div>
    </div>
  );
}
