"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
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
  Check,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import { CountUp } from "./anim/CountUp";
import { LiveNumber } from "./anim/LiveNumber";

const ease = [0.16, 1, 0.3, 1] as const;

/* ---------- workflow timeline ---------- */

const SEQ = [
  "idle",
  "message",
  "analyzing",
  "classified",
  "created",
  "assigned",
  "inprogress",
  "completed",
  "hold",
] as const;
type Step = (typeof SEQ)[number];

const DUR: Record<Step, number> = {
  idle: 300,
  message: 1100,
  analyzing: 1000,
  classified: 1200,
  created: 800,
  assigned: 800,
  inprogress: 800,
  completed: 1300,
  hold: 700,
};

/* ---------- atoms ---------- */

type Tone = "accent" | "urgent" | "warn" | "muted" | "ok";

const pillMap: Record<Tone, string> = {
  accent: "text-[#7fb0ff] bg-[#2E7DFF]/12 border-[#2E7DFF]/25",
  urgent: "text-[#ff8a8a] bg-[#ff5c5c]/10 border-[#ff5c5c]/18",
  warn: "text-[#f0c074] bg-[#f5b53d]/10 border-[#f5b53d]/16",
  muted: "text-white/50 bg-white/[0.04] border-white/[0.08]",
  ok: "text-[#74dba4] bg-[#4ad48a]/10 border-[#4ad48a]/18",
};

function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none backdrop-blur-sm ${pillMap[tone]}`}>
      {children}
    </span>
  );
}

const dotMap: Record<Tone, string> = {
  accent: "bg-[#2E7DFF]",
  urgent: "bg-[#ff5c5c]",
  warn: "bg-[#f5b53d]",
  muted: "bg-white/40",
  ok: "bg-[#4ad48a]",
};

function NavItem({ icon: Icon, label, active, badge }: { icon: typeof Inbox; label: string; active?: boolean; badge?: number }) {
  return (
    <div className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-colors duration-300 ${active ? "bg-white/[0.07] text-white edge-light" : "text-white/50 hover:bg-white/[0.035] hover:text-white/80"}`}>
      {active && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-[#2E7DFF] shadow-[0_0_10px_1px_rgba(46,125,255,0.7)]" />}
      <Icon size={15} className={active ? "text-[#2E7DFF]" : "text-white/40"} strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge ? <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${active ? "bg-[#2E7DFF] text-white" : "bg-white/[0.06] text-white/55"}`}>{badge}</span> : null}
    </div>
  );
}

/* base (non-animated) rows */
const STATIC_ROWS = [
  { id: "01", task: "Beach club reservation", dept: "Concierge", villa: "Villa Aura", pill: <StatusPill tone="accent">Confirmed</StatusPill>, incoming: true },
  { id: "02", task: "Private chef — dinner for 6", dept: "Concierge", villa: "Villa Sol", pill: <StatusPill tone="warn">Pending</StatusPill> },
  { id: "03", task: "AC — master suite", dept: "Maintenance", villa: "Villa Ocean", pill: <StatusPill tone="urgent">Urgent</StatusPill> },
  { id: "04", task: "Yacht day charter", dept: "Concierge", villa: "Villa Mar", pill: <StatusPill tone="muted">New</StatusPill> },
];
/* rows that sit below the live workflow task */
const ANIM_BASE_ROWS = [
  { id: "02", task: "Beach club reservation", dept: "Concierge", villa: "Villa Aura", pill: <StatusPill tone="accent">Confirmed</StatusPill> },
  { id: "03", task: "Private chef — dinner for 6", dept: "Concierge", villa: "Villa Sol", pill: <StatusPill tone="warn">Pending</StatusPill> },
  { id: "04", task: "Yacht day charter", dept: "Concierge", villa: "Villa Mar", pill: <StatusPill tone="muted">New</StatusPill> },
];

const activity = [
  { icon: MessageCircle, who: "Mr. Anderson", note: "Requested a beach club table", time: "now", incoming: true },
  { icon: Mail, who: "Familia Rossi", note: "Private chef for tonight", time: "4m" },
  { icon: Phone, who: "Ms. Laurent", note: "Airport transfer arranged", time: "18m" },
];

const chips: { label: string; tone: Tone }[] = [
  { label: "Maintenance", tone: "muted" },
  { label: "High priority", tone: "warn" },
  { label: "Villa Ocean", tone: "accent" },
];

/* ---------- intake card (the signature) ---------- */

function IntakeCard({ reached, is }: { reached: (k: Step) => boolean; is: (k: Step) => boolean }) {
  return (
    <motion.div
      key="intake"
      initial={{ opacity: 0, y: -12, x: "-50%", scale: 0.98 }}
      animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
      exit={{ opacity: 0, y: 18, x: "-50%", scale: 0.98 }}
      transition={{ duration: 0.55, ease }}
      className="glass edge-light pointer-events-none absolute left-1/2 top-[76px] z-30 w-[330px] max-w-[86%] rounded-2xl border border-white/10 p-4 shadow-[var(--shadow-float)]"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
          <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
          WhatsApp
        </span>
        <span className="text-[11px] text-white/30">Villa Ocean</span>
      </div>

      <div className="mt-3 rounded-xl rounded-tl-sm border border-white/[0.07] bg-white/[0.04] px-3.5 py-2.5 text-[13px] leading-relaxed text-white/85">
        Hi, the AC is not working in the master bedroom.
      </div>

      <div className="mt-3 min-h-[28px]">
        <AnimatePresence mode="wait">
          {is("analyzing") && (
            <motion.div
              key="think"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-[12px] text-white/45"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF] shadow-[0_0_8px_1px_rgba(46,125,255,0.6)]" />
              LUXA is reading the request
              <span className="flex items-center gap-0.5">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} className="h-1 w-1 rounded-full bg-white/45" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }} />
                ))}
              </span>
            </motion.div>
          )}

          {reached("classified") && !reached("created") && (
            <motion.div key="chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-wrap gap-1.5">
              {chips.map((c, idx) => (
                <motion.span
                  key={c.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + idx * 0.12, duration: 0.4, ease }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/75 backdrop-blur-sm"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dotMap[c.tone]}`} />
                  {c.label}
                </motion.span>
              ))}
            </motion.div>
          )}

          {reached("created") && (
            <motion.div key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center gap-2 text-[12px] font-medium text-[#74dba4]">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#4ad48a]/15">
                <Check size={11} strokeWidth={2.4} />
              </span>
              Task created
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ---------- dashboard ---------- */

export function ProductDashboard({ animated = false }: { animated?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-12%" });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!animated) return;
    if (reduce) {
      setI(SEQ.indexOf("completed"));
      return;
    }
    if (!inView) return;
    const id = setTimeout(() => setI((p) => (p + 1) % SEQ.length), DUR[SEQ[i]]);
    return () => clearTimeout(id);
  }, [animated, reduce, inView, i]);

  const idx = (k: Step) => SEQ.indexOf(k);
  const reached = (k: Step) => i >= idx(k);
  const is = (k: Step) => SEQ[i] === k;

  // live stats
  const open = animated ? (reached("created") && !reached("completed") ? 15 : 14) : 14;
  const resolved = animated ? (reached("completed") ? 29 : 28) : 28;

  const taskTone: Tone = reached("completed") ? "ok" : reached("inprogress") ? "muted" : "warn";
  const taskLabel = reached("completed") ? "Completed" : reached("inprogress") ? "In Progress" : "Pending";
  const showTask = animated && reached("created");
  const showCard = animated && !reduce && reached("message") && i <= idx("created");
  const baseRows = animated ? ANIM_BASE_ROWS : STATIC_ROWS;

  const StatValue = ({ v, accent }: { v: number; accent?: boolean }) => (
    <span className={accent ? "text-[#6ba5ff]" : "text-white"}>
      {animated ? <LiveNumber value={v} pad={2} /> : <CountUp to={v} pad={2} />}
    </span>
  );

  const stats: { label: string; v: number; accent?: boolean }[] = [
    { label: "Open requests", v: open },
    { label: "Urgent", v: 2, accent: true },
    { label: "Resolved today", v: resolved },
    { label: "Arrivals", v: 6 },
  ];

  return (
    <div ref={ref} className="glass edge-light relative w-full overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0b0b0e]/70">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(255,255,255,0.06),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_-15%,rgba(46,125,255,0.06),transparent_55%)]" />

      {/* signature workflow intake */}
      <AnimatePresence>{showCard && <IntakeCard reached={reached} is={is} />}</AnimatePresence>

      {/* top bar */}
      <div className="relative flex h-[60px] items-center justify-between border-b border-white/[0.05] px-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[14px] font-semibold tracking-[-0.02em] text-white">
            LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF] shadow-[0_0_8px_1px_rgba(46,125,255,0.7)]" />
          </span>
          <span className="hidden text-[12px] text-white/30 sm:inline">/ Operations</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-white/40 backdrop-blur-md md:flex">
            <Search size={13} />
            Search
            <kbd className="ml-1 rounded border border-white/10 px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 backdrop-blur-md">
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
        <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r border-white/[0.05] p-3.5 lg:flex">
          <div className="edge-light rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
            <div className="text-[13px] font-medium text-white">Marbella Portfolio</div>
            <div className="mt-0.5 text-[11px] text-white/40">6 villas · 21 staff</div>
          </div>
          <div className="px-2 pb-1 pt-5 text-[10px] uppercase tracking-[0.18em] text-white/25">Operations</div>
          <nav className="space-y-1">
            <NavItem icon={LayoutGrid} label="Overview" active />
            <NavItem icon={Inbox} label="Requests" badge={2} />
            <NavItem icon={ListChecks} label="Tasks" badge={14} />
            <NavItem icon={Building2} label="Villas" />
            <NavItem icon={Users} label="Team" />
          </nav>
          <div className="mt-auto flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5 edge-light">
            <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15" fill="none" stroke="#2E7DFF" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${0.72 * 2 * Math.PI * 15} ${2 * Math.PI * 15}`} className="[filter:drop-shadow(0_0_4px_rgba(46,125,255,0.5))]" />
            </svg>
            <div>
              <div className="text-[13px] font-medium text-white tabular-nums">72%</div>
              <div className="text-[11px] text-white/40">Occupancy</div>
            </div>
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 p-5 sm:p-7">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">Tuesday · 14 June</div>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white sm:text-[22px]">Good morning, Daniela</h3>
            </div>
            <div className="hidden items-center rounded-xl border border-white/[0.06] bg-white/[0.03] p-0.5 text-[12px] backdrop-blur-md sm:flex">
              <span className="rounded-lg bg-white/[0.07] px-3 py-1.5 text-white edge-light">Today</span>
              <span className="px-3 py-1.5 text-white/40">Week</span>
            </div>
          </div>

          {/* stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="lift edge-light relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 hover:border-white/[0.1] hover:bg-white/[0.04]">
                {s.accent && <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-[#2E7DFF]/20 blur-2xl" />}
                <div className="text-[10px] uppercase tracking-[0.15em] text-white/35">{s.label}</div>
                <div className="mt-2.5 text-[32px] font-semibold leading-none tracking-tight tabular-nums">
                  <StatValue v={s.v} accent={s.accent} />
                </div>
              </div>
            ))}
          </div>

          {/* live operations */}
          <div className="edge-light mt-6 overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02]">
            <div className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[13px] font-medium text-white">Live operations</span>
              <span className="text-[11px] text-white/30">Updated just now</span>
            </div>
            <div className="hidden grid-cols-[1.7fr_1fr_0.9fr] gap-4 px-5 pb-2 text-[10px] uppercase tracking-[0.15em] text-white/25 sm:grid">
              <span>Request</span>
              <span>Villa</span>
              <span className="text-right">Status</span>
            </div>
            <div className="px-2 pb-2">
              {/* the live workflow task */}
              <AnimatePresence initial={false}>
                {showTask && (
                  <motion.div
                    key="livetask"
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-[#2E7DFF]/15 bg-[#2E7DFF]/[0.06] px-3 py-3 sm:grid-cols-[1.7fr_1fr_0.9fr]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="font-mono text-[11px] text-[#7fb0ff]/70">01</span>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-white">AC — master bedroom</div>
                        <div className="flex items-center gap-2 text-[11px] text-white/40">
                          Maintenance
                          <AnimatePresence>
                            {reached("assigned") && (
                              <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease }} className="inline-flex items-center gap-1.5">
                                <span className="text-white/20">·</span>
                                <Avatar name="Carlos Núñez" size={16} />
                                <span className="text-white/55">Carlos</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    <div className="hidden text-[12px] text-white/55 sm:block">Villa Ocean</div>
                    <div className="flex justify-end">
                      <AnimatePresence mode="wait">
                        <motion.span key={taskLabel} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3, ease }}>
                          <StatusPill tone={taskTone}>{taskLabel}</StatusPill>
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {baseRows.map((r) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={"incoming" in r && r.incoming ? { opacity: 0, y: -8 } : false}
                  whileInView={"incoming" in r && r.incoming ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: "incoming" in r && r.incoming ? 1.1 : 0, ease }}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.03] sm:grid-cols-[1.7fr_1fr_0.9fr]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="font-mono text-[11px] text-white/20">{r.id}</span>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-white">{r.task}</div>
                      <div className="truncate text-[11px] text-white/35">{r.dept}</div>
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
        <aside className="hidden w-[280px] shrink-0 border-l border-white/[0.05] p-6 xl:block">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">Activity</span>
            <span className="text-[11px] text-white/30">Live</span>
          </div>
          <div className="mt-6 space-y-5">
            {activity.map((a) => {
              const Icon = a.icon;
              return (
                <motion.div key={a.who} initial={a.incoming ? { opacity: 0, x: 10 } : false} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: a.incoming ? 0.9 : 0, ease }} className="flex gap-3">
                  <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border backdrop-blur-sm ${a.incoming ? "border-[#2E7DFF]/30 bg-[#2E7DFF]/12 text-[#7fb0ff] shadow-[0_0_16px_-2px_rgba(46,125,255,0.5)]" : "border-white/10 bg-white/[0.03] text-white/45"}`}>
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] font-medium text-white">{a.who}</span>
                      <span className="shrink-0 text-[10px] text-white/30">{a.time}</span>
                    </div>
                    <div className="truncate text-[12px] text-white/40">{a.note}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="edge-light mt-7 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
            <div className="text-[10px] uppercase tracking-[0.15em] text-white/30">Avg. response</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[26px] font-semibold leading-none tracking-tight text-white tabular-nums">
                <CountUp to={2} pad={1} />
              </span>
              <span className="text-[13px] text-white/40">min</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
