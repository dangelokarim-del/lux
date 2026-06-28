"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/ui";

const miniStats = [
  { label: "Open", value: "14" },
  { label: "Urgent", value: "2" },
  { label: "Done", value: "28" },
  { label: "Check-ins", value: "6" },
];

const miniRows = [
  { villa: "Villa Ocean", task: "AC issue", tag: "Urgent", tone: "urgent" },
  { villa: "Villa Sol", task: "Airport transfer", tag: "Confirmed", tone: "accent" },
  { villa: "Villa Aura", task: "Private chef", tag: "Pending", tone: "warn" },
  { villa: "Villa Mar", task: "Cleaning", tag: "New", tone: "muted" },
];

const toneClass: Record<string, string> = {
  urgent: "text-urgent",
  accent: "text-accent",
  warn: "text-warn",
  muted: "text-ink-3",
};

export function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
      className="relative mx-auto w-full max-w-[940px]"
    >
      {/* ambient glow behind the panel */}
      <div className="glow-accent absolute -inset-x-20 -top-10 bottom-0 -z-10 blur-2xl" />

      <div className="panel overflow-hidden shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden text-[12px] text-ink-3 sm:inline">/ Operations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="grid gap-px bg-line sm:grid-cols-[1fr_240px]">
          {/* main */}
          <div className="bg-bg p-4 sm:p-5">
            {/* stats */}
            <div className="grid grid-cols-4 gap-2.5">
              {miniStats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                  className="panel px-3 py-2.5"
                >
                  <div className="text-[10px] uppercase tracking-wider text-ink-3">
                    {s.label}
                  </div>
                  <div className="mt-1 text-xl font-semibold tracking-tight">
                    {s.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* table */}
            <div className="mt-3 panel overflow-hidden">
              {miniRows.map((r, i) => (
                <motion.div
                  key={r.villa}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                  className="flex items-center justify-between border-b border-line px-3.5 py-2.5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-ink-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-[13px] font-medium">{r.villa}</div>
                      <div className="text-[11px] text-ink-3">{r.task}</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium ${toneClass[r.tone]}`}>
                    {r.tag}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* side rail */}
          <div className="hidden bg-bg p-4 sm:block">
            <div className="eyebrow">Live feed</div>
            <div className="mt-4 space-y-4">
              {[
                { v: "Villa Ocean", t: "AC fixed", c: "text-ok" },
                { v: "Villa Aura", t: "Chef booked", c: "text-accent" },
                { v: "Villa Sol", t: "Driver en route", c: "text-ink-2" },
              ].map((f) => (
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
    </motion.div>
  );
}
