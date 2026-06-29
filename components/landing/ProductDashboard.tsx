"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Inbox,
  ListChecks,
  Building2,
  Users,
  Search,
  MessageCircle,
  Phone,
  Mail,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import { CountUp } from "./anim/CountUp";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- small atoms ---------- */

function StatusPill({ tone, children }: { tone: "accent" | "urgent" | "warn" | "muted"; children: React.ReactNode }) {
  const map = {
    accent: "text-[#2E7DFF] bg-[#2E7DFF]/10 border-[#2E7DFF]/20",
    urgent: "text-[#ff6b6b] bg-[#ff6b6b]/10 border-[#ff6b6b]/15",
    warn: "text-[#e7b15a] bg-[#e7b15a]/10 border-[#e7b15a]/15",
    muted: "text-white/55 bg-white/[0.04] border-white/10",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none ${map[tone]}`}>
      {children}
    </span>
  );
}

function NavItem({ icon: Icon, label, active, badge }: { icon: typeof Inbox; label: string; active?: boolean; badge?: number }) {
  return (
    <div
      className={`group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] transition-colors ${
        active ? "bg-white/[0.06] text-white" : "text-white/55 hover:bg-white/[0.03] hover:text-white/80"
      }`}
    >
      <Icon size={15} className={active ? "text-[#2E7DFF]" : "text-white/40"} strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${active ? "bg-[#2E7DFF] text-white" : "bg-white/[0.06] text-white/60"}`}>
          {badge}
        </span>
      ) : null}
    </div>
  );
}

const stats = [
  { label: "Open requests", to: 14, tone: "white" },
  { label: "Urgent", to: 2, tone: "accent" },
  { label: "Resolved today", to: 28, tone: "white" },
  { label: "Arrivals", to: 6, tone: "white" },
] as const;

const rows = [
  { id: "01", task: "Beach club reservation", villa: "Villa Aura", dept: "Concierge", pill: <StatusPill tone="accent">Confirmed</StatusPill>, incoming: true },
  { id: "02", task: "Private chef — dinner for 6", villa: "Villa Sol", dept: "Concierge", pill: <StatusPill tone="warn">Pending</StatusPill> },
  { id: "03", task: "AC — master suite", villa: "Villa Ocean", dept: "Maintenance", pill: <StatusPill tone="urgent">Urgent</StatusPill> },
  { id: "04", task: "Yacht day charter", villa: "Villa Mar", dept: "Concierge", pill: <StatusPill tone="muted">New</StatusPill> },
];

const activity = [
  { icon: MessageCircle, who: "Mr. Anderson", note: "Requested a beach club table", time: "now", incoming: true },
  { icon: Mail, who: "Familia Rossi", note: "Private chef for tonight", time: "4m" },
  { icon: Phone, who: "Ms. Laurent", note: "Airport transfer arranged", time: "18m" },
];

/* ---------- the dashboard ---------- */

export function ProductDashboard() {
  return (
    <div className="relative w-full overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#0A0A0C]">
      {/* top edge-light */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5B9BFF]/40 to-transparent" />
      {/* inner vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(46,125,255,0.05),transparent_55%)]" />

      {/* top bar */}
      <div className="relative flex h-14 items-center justify-between border-b border-white/[0.05] px-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-[14px] font-semibold tracking-[-0.02em] text-white">
            LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF]" />
          </span>
          <span className="hidden text-[12px] text-white/35 sm:inline">/ Operations</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/40 md:flex">
            <Search size={13} />
            Search
            <kbd className="ml-1 rounded border border-white/10 px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E7DFF] opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" />
            </span>
            <span className="text-[11px] text-white/55">Live</span>
          </span>
          <Avatar name="Daniela Ruiz" size={28} />
        </div>
      </div>

      <div className="relative flex">
        {/* sidebar */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-white/[0.05] p-3 lg:flex">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="text-[13px] font-medium text-white">Marbella Portfolio</div>
            <div className="mt-0.5 text-[11px] text-white/40">6 villas · 21 staff</div>
          </div>
          <div className="px-2 pb-1.5 pt-4 text-[10px] uppercase tracking-[0.16em] text-white/30">Operations</div>
          <nav className="space-y-0.5">
            <NavItem icon={LayoutGrid} label="Overview" active />
            <NavItem icon={Inbox} label="Requests" badge={2} />
            <NavItem icon={ListChecks} label="Tasks" badge={14} />
            <NavItem icon={Building2} label="Villas" />
            <NavItem icon={Users} label="Team" />
          </nav>
          <div className="mt-auto flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <svg width="34" height="34" viewBox="0 0 36 36" className="-rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#2E7DFF" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${0.72 * 2 * Math.PI * 15} ${2 * Math.PI * 15}`} />
            </svg>
            <div>
              <div className="text-[13px] font-medium text-white">72%</div>
              <div className="text-[11px] text-white/40">Occupancy</div>
            </div>
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-white/30">Tuesday · 14 June</div>
              <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">Good morning, Daniela</h3>
            </div>
            <div className="hidden items-center rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5 text-[12px] sm:flex">
              <span className="rounded-md bg-white/[0.06] px-2.5 py-1 text-white">Today</span>
              <span className="px-2.5 py-1 text-white/40">Week</span>
            </div>
          </div>

          {/* stats */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.035]"
              >
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">{s.label}</div>
                <div className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${s.tone === "accent" ? "text-[#2E7DFF]" : "text-white"}`}>
                  <CountUp to={s.to} pad={2} />
                </div>
              </div>
            ))}
          </div>

          {/* live operations table */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.015]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
              <span className="text-[13px] font-medium text-white">Live operations</span>
              <span className="text-[11px] text-white/35">Updated just now</span>
            </div>
            <div className="hidden grid-cols-[1.7fr_1fr_0.9fr] gap-4 border-b border-white/[0.05] px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-white/30 sm:grid">
              <span>Request</span>
              <span>Villa</span>
              <span className="text-right">Status</span>
            </div>
            <div>
              {rows.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={r.incoming ? { opacity: 0, y: -8 } : false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: r.incoming ? 1.1 : 0, ease }}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.025] sm:grid-cols-[1.7fr_1fr_0.9fr]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[11px] text-white/25">{r.id}</span>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-white">{r.task}</div>
                      <div className="truncate text-[11px] text-white/40">{r.dept}</div>
                    </div>
                  </div>
                  <div className="hidden text-[12px] text-white/55 sm:block">{r.villa}</div>
                  <div className="flex justify-end">{r.pill}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </main>

        {/* activity rail */}
        <aside className="hidden w-[272px] shrink-0 border-l border-white/[0.05] p-5 xl:block">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/30">Activity</span>
            <span className="text-[11px] text-white/35">Live</span>
          </div>
          <div className="mt-5 space-y-5">
            {activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.who}
                  initial={a.incoming ? { opacity: 0, x: 10 } : false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: a.incoming ? 0.9 : 0, ease }}
                  className="flex gap-3"
                >
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border ${a.incoming ? "border-[#2E7DFF]/30 bg-[#2E7DFF]/10 text-[#2E7DFF]" : "border-white/10 bg-white/[0.03] text-white/45"}`}>
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-white">{a.who}</span>
                      <span className="shrink-0 text-[10px] text-white/30">{a.time}</span>
                    </div>
                    <div className="truncate text-[12px] text-white/45">{a.note}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/30">Avg. response</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-white">
                <CountUp to={2} pad={1} />
              </span>
              <span className="text-[13px] text-white/45">min</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
