"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ListChecks,
  Building2,
  Users,
  MessageSquareText,
} from "lucide-react";

const stats = [
  { label: "Open tasks", value: "14" },
  { label: "Urgent", value: "02" },
  { label: "Completed", value: "28" },
  { label: "Check-ins", value: "06" },
];

const rows = [
  { villa: "Villa Ocean", task: "AC — master suite", who: "Carlos", tag: "Urgent", tone: "text-urgent" },
  { villa: "Villa Sol", task: "Airport transfer", who: "Lucía", tag: "Confirmed", tone: "text-accent" },
  { villa: "Villa Aura", task: "Private chef", who: "—", tag: "Pending", tone: "text-warn" },
  { villa: "Villa Mar", task: "Cleaning check", who: "Marta", tag: "New", tone: "text-ink-3" },
];

const nav = [
  { icon: LayoutDashboard, active: true },
  { icon: ListChecks, active: false },
  { icon: Building2, active: false },
  { icon: Users, active: false },
  { icon: MessageSquareText, active: false },
];

const feed = [
  { v: "Villa Ocean", t: "AC fixed", c: "text-ok" },
  { v: "Villa Aura", t: "Chef booked", c: "text-accent" },
  { v: "Villa Sol", t: "Driver en route", c: "text-ink-2" },
];

export function DashboardPreview({ tilt = true }: { tilt?: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[1120px]" style={{ perspective: 1600 }}>
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: tilt ? 14 : 0 }}
        whileInView={{ opacity: 1, y: 0, rotateX: tilt ? 7 : 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* ambient — neutral, calm; no colored wash */}
        <div className="glow-soft pointer-events-none absolute -inset-x-24 -top-16 bottom-10 -z-10 blur-2xl" />

        <div className="relative overflow-hidden rounded-[18px] border border-line-2 bg-[#070708] shadow-[0_60px_140px_-40px_rgba(0,0,0,0.95)]">
          {/* top inner highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* window bar */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="relative grid h-6 w-6 place-items-center rounded-[7px] border border-line-2 bg-bg-elev">
                <span className="block h-2.5 w-[2px] -translate-x-[2.5px] rounded bg-white" />
                <span className="absolute block h-2.5 w-[2px] translate-x-[2.5px] rounded bg-accent" />
              </span>
              <span className="text-[13px] font-semibold tracking-[-0.02em]">LUXA</span>
              <span className="hidden text-[12px] text-ink-4 sm:inline">/ Operations</span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-line bg-white/[0.02] px-3 py-1 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              <span className="text-[11px] text-ink-3">Live</span>
            </div>
          </div>

          <div className="flex">
            {/* mini sidebar */}
            <div className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-line py-4 lg:flex">
              {nav.map((n, i) => {
                const Icon = n.icon;
                return (
                  <span
                    key={i}
                    className={`grid h-9 w-9 place-items-center rounded-[10px] ${
                      n.active ? "bg-white/[0.06] text-accent" : "text-ink-4"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                );
              })}
            </div>

            {/* main */}
            <div className="min-w-0 flex-1 p-4 sm:p-6">
              {/* stats */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 + i * 0.07, duration: 0.5 }}
                    className="rounded-[12px] border border-line bg-white/[0.015] px-3.5 py-3"
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] text-ink-4">{s.label}</div>
                    <div className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums sm:text-[28px]">
                      {s.value}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* task list */}
              <div className="mt-3 overflow-hidden rounded-[12px] border border-line sm:mt-4">
                <div className="hidden grid-cols-[1.6fr_1fr_0.8fr] gap-4 border-b border-line px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-ink-4 sm:grid">
                  <span>Task</span>
                  <span>Assignee</span>
                  <span className="text-right">Status</span>
                </div>
                {rows.map((r, i) => (
                  <motion.div
                    key={r.villa}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-0 sm:grid-cols-[1.6fr_1fr_0.8fr]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-[11px] text-ink-4">{String(i + 1).padStart(2, "0")}</span>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium">{r.villa}</div>
                        <div className="truncate text-[11px] text-ink-3">{r.task}</div>
                      </div>
                    </div>
                    <div className="hidden text-[12px] text-ink-2 sm:block">{r.who}</div>
                    <div className="text-right">
                      <span className={`text-[11px] font-medium ${r.tone}`}>{r.tag}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* live feed */}
            <div className="hidden w-56 shrink-0 border-l border-line p-5 xl:block">
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-4">Live feed</div>
              <div className="mt-4 space-y-4">
                {feed.map((f) => (
                  <div key={f.v} className="flex gap-2.5">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${f.c.replace("text-", "bg-")}`} />
                    <div>
                      <div className="text-[12px] font-medium">{f.v}</div>
                      <div className={`text-[11px] ${f.c}`}>{f.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* reflection */}
        <div
          aria-hidden
          className="mask-fade-b pointer-events-none mx-6 h-24 rounded-b-[18px] border-x border-b border-line/40 bg-gradient-to-b from-white/[0.03] to-transparent opacity-50"
        />
      </motion.div>
    </div>
  );
}
