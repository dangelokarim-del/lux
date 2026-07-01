"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { MessageCircle, Wind, Car, UtensilsCrossed, Waves, ClipboardCheck, Check } from "lucide-react";
import { LiveNumber } from "./anim/LiveNumber";

const ease = [0.4, 0, 0.2, 1] as const;
const slide = { duration: 0.85, ease };

/* status tones — shared by the live task and the standing rows */
type StatusName = "New" | "In Progress" | "Completed" | "Pending";
const STATUS: Record<StatusName, { bd: string; bg: string; tx: string; dot: string; row: string; rowbd: string }> = {
  New: { bd: "border-[#2E7DFF]/30", bg: "bg-[#2E7DFF]/12", tx: "text-[#8fbcff]", dot: "#2E7DFF", row: "rgba(46,125,255,0.06)", rowbd: "rgba(46,125,255,0.30)" },
  "In Progress": { bd: "border-[#f5b53d]/30", bg: "bg-[#f5b53d]/10", tx: "text-[#f0b64e]", dot: "#f5b53d", row: "rgba(245,181,61,0.05)", rowbd: "rgba(245,181,61,0.28)" },
  Completed: { bd: "border-[#4ad48a]/30", bg: "bg-[#4ad48a]/12", tx: "text-[#5fe0a0]", dot: "#4ad48a", row: "rgba(74,212,138,0.06)", rowbd: "rgba(74,212,138,0.32)" },
  Pending: { bd: "border-white/15", bg: "bg-white/[0.05]", tx: "text-white/55", dot: "rgba(255,255,255,0.42)", row: "rgba(255,255,255,0.02)", rowbd: "rgba(255,255,255,0.10)" },
};

const STAFF: Record<string, { initials: string; color: string }> = {
  Carlos: { initials: "CA", color: "#2E7DFF" },
  Lucia: { initials: "LU", color: "#a78bfa" },
  Marta: { initials: "MA", color: "#fb7185" },
};

function Avatar({ name }: { name: string }) {
  const s = STAFF[name];
  return (
    <span
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold sm:h-8 sm:w-8 sm:text-[11px]"
      style={{ color: s.color, background: `${s.color}22`, boxShadow: `inset 0 0 0 1px ${s.color}55` }}
      title={name}
    >
      {s.initials}
    </span>
  );
}

function StatusBadge({ status }: { status: StatusName }) {
  const s = STATUS[status];
  return (
    <span className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:text-[12px] ${s.bd} ${s.bg} ${s.tx}`}>
      {status === "Completed" ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />}
      {status}
    </span>
  );
}

/* the standing operations — the AC task is the live one and is rendered separately on top */
const OPS: { Icon: typeof MessageCircle; title: string; cat: string; villa: string; staff?: string; status: StatusName }[] = [
  { Icon: Car, title: "Airport transfer — 4 guests", cat: "Transport", villa: "Villa Sol", staff: "Lucia", status: "In Progress" },
  { Icon: Waves, title: "Beach club reservation", cat: "Concierge", villa: "Villa Brisa", staff: "Lucia", status: "Completed" },
  { Icon: UtensilsCrossed, title: "Private chef — dinner for 6", cat: "Concierge", villa: "Villa Aura", staff: "Marta", status: "Pending" },
  { Icon: ClipboardCheck, title: "Pre-arrival inspection", cat: "Housekeeping", villa: "Villa Ocean", staff: "Marta", status: "New" },
];

/* ------------------------------------------------------------------ *
 *  SECTION 3 — the live operations dashboard. Large, centered, nearly
 *  full width — the real product surface, reacting in real time so the
 *  visitor literally watches the software solve the request:
 *   wait · New (Open 15→16, Urgent 2→3, task slides in) · In Progress
 *   (Carlos, blue glow) · Completed (green, counters settle back).
 * ------------------------------------------------------------------ */
export function LiveDashboard() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.35 });
  const [phase, setPhase] = useState(0); // 0 idle · 1 New · 2 In Progress · 3 Completed
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!inView) {
      setPhase(0);
      return;
    }
    if (reduce) {
      setPhase(3);
      return;
    }
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setPhase(1), 2000)); // wait 2s → New
    t.push(setTimeout(() => setPhase(2), 4000)); // pause 2s → In Progress
    t.push(setTimeout(() => setPhase(3), 7000)); // pause 3s → Completed
    t.push(
      setTimeout(() => {
        setPhase(0);
        setCycle((c) => c + 1);
      }, 11500) // hold the solved state ~4.5s, then loop
    );
    return () => t.forEach(clearTimeout);
  }, [inView, cycle, reduce]);

  const status: StatusName | null = phase >= 3 ? "Completed" : phase >= 2 ? "In Progress" : phase >= 1 ? "New" : null;
  const assigned = phase >= 2;
  const open = phase >= 1 && phase < 3 ? 16 : 15;
  const urgent = phase >= 1 && phase < 3 ? 3 : 2;
  const inProgress = phase === 2 ? 4 : 3;
  const completedToday = phase >= 3 ? 29 : 28;
  const tone = status ? STATUS[status] : null;

  const cells = [
    { l: "Open requests", v: open },
    { l: "Urgent", v: urgent, a: true },
    { l: "In progress", v: inProgress },
    { l: "Completed today", v: completedToday },
    { l: "Arrivals", v: 6 },
  ];

  return (
    <section ref={ref} id="dashboard" className="relative overflow-x-clip px-4 pb-20 pt-4 sm:px-6 sm:pb-28 sm:pt-8">
      <div className="relative mx-auto max-w-[1200px]">
        <div aria-hidden className="absolute -inset-10 -z-10" style={{ background: "radial-gradient(55% 60% at 50% 24%, rgba(216,230,255,0.08), transparent 72%)", filter: "blur(34px)" }} />
        <motion.div
          initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.3, ease }}
          className="relative overflow-hidden rounded-[28px]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.2), inset 0 1px 0 rgba(255,255,255,0.16), 0 80px 160px -50px rgba(0,0,0,0.9)", background: "rgba(255,255,255,0.012)" }}
        >
          <div className="glass absolute inset-0" aria-hidden />
          <div className="relative px-4 py-6 sm:px-9 sm:py-9">
            {/* product chrome */}
            <div className="mb-6 flex items-center justify-between sm:mb-8">
              <div className="flex items-baseline gap-2.5">
                <span className="flex items-center gap-1 text-[16px] font-semibold tracking-[-0.02em] text-white sm:text-[19px]">
                  LUXA<span className="h-1 w-1 translate-y-1.5 rounded-full bg-[#2E7DFF]" />
                </span>
                <span className="text-[12px] text-white/35 sm:text-[14px]">Operations · Marbella</span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-white/65 sm:text-[12px]">
                <span className="relative flex h-1.5 w-1.5">
                  {!reduce && <motion.span className="absolute inset-0 rounded-full bg-[#2E7DFF]" animate={{ scale: [1, 2.6], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />}
                  <span className="relative h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" />
                </span>
                Live
              </span>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 sm:gap-4">
              {cells.map((c, i) => (
                <div
                  key={c.l}
                  className={`relative h-[96px] rounded-2xl bg-white/[0.03] px-4 py-3.5 sm:h-[116px] sm:px-5 sm:py-5 ${i === cells.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
                  style={{ boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.14)" }}
                >
                  <div className="text-[10px] uppercase tracking-[0.13em] text-white/40 sm:text-[10.5px]">{c.l}</div>
                  <div className={`mt-2.5 text-[32px] font-semibold leading-none tabular-nums sm:mt-4 sm:text-[46px] ${c.a && urgent >= 3 ? "text-[#7fb0ff]" : "text-white"}`}>
                    <LiveNumber value={c.v} pad={2} duration={1.3} />
                  </div>
                </div>
              ))}
            </div>

            {/* live operations */}
            <div className="mt-7 sm:mt-9">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[14px] font-medium text-white sm:text-[15px]">Live operations</span>
                <span className="text-[11px] text-white/30 sm:text-[12px]">{status ? "Updated just now" : "Up to date"}</span>
              </div>

              {/* the AC task — slides in from the left, then New → In Progress → Completed */}
              <AnimatePresence>
                {status && tone && (
                  <motion.div
                    key="ac"
                    initial={{ opacity: 0, height: 0, marginBottom: 0, x: -34, filter: "blur(6px)" }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 8, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, x: -20 }}
                    transition={reduce ? { duration: 0 } : slide}
                    className="relative overflow-hidden rounded-2xl"
                    style={{ background: tone.row, boxShadow: `inset 0 0 0 1px ${tone.rowbd}` }}
                  >
                    {!reduce && (
                      <motion.span
                        key={status}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-2xl"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 2.2, ease: "easeOut" }}
                        style={{ boxShadow: `inset 0 0 0 1px ${tone.rowbd.replace(/0\.\d+\)/, "0.8)")}, 0 0 30px ${tone.row.replace(/0\.\d+\)/, "0.45)")}` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-4.5">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11"
                          style={{ color: tone.dot, background: tone.dot === "rgba(255,255,255,0.42)" ? "rgba(255,255,255,0.06)" : tone.dot + "1f", boxShadow: `inset 0 0 0 1px ${tone.rowbd}` }}
                        >
                          <Wind className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-[15px] font-medium text-white sm:text-[16px]">AC — Master Bedroom</div>
                          <div className="truncate text-[12px] text-white/45 sm:text-[13px]">Maintenance · Villa Ocean</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                        <AnimatePresence>
                          {assigned && (
                            <motion.span key="carlos" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={slide} className="flex items-center gap-2">
                              <Avatar name="Carlos" />
                              <span className="hidden text-[13px] text-white/55 sm:inline">Carlos</span>
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                          <motion.span key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.5, ease }}>
                            <StatusBadge status={status} />
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* the standing rows */}
              <div className="divide-y divide-white/[0.05] border-b border-white/[0.05]">
                {OPS.map((r) => (
                  <div key={r.title} className="flex items-center justify-between gap-3 py-4 sm:py-4.5">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-white/45 sm:h-11 sm:w-11" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
                        <r.Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[15px] font-medium text-white/90 sm:text-[16px]">{r.title}</div>
                        <div className="truncate text-[12px] text-white/40 sm:text-[13px]">{r.cat} · {r.villa}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
                      {r.staff && (
                        <span className="flex items-center gap-2">
                          <Avatar name={r.staff} />
                          <span className="hidden text-[13px] text-white/55 sm:inline">{r.staff}</span>
                        </span>
                      )}
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>

              {/* team presence — a calm sign the operation is staffed and live */}
              <div className="mt-5 flex items-center justify-between pt-1">
                <span className="text-[11px] uppercase tracking-[0.14em] text-white/30">Team online</span>
                <div className="flex items-center gap-4">
                  {["Carlos", "Lucia"].map((n) => (
                    <span key={n} className="flex items-center gap-1.5 text-[12px] text-white/55 sm:text-[13px]">
                      <span className="relative flex h-1.5 w-1.5">
                        {!reduce && <motion.span className="absolute inset-0 rounded-full bg-[#4ad48a]" animate={{ scale: [1, 2.4], opacity: [0.5, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }} />}
                        <span className="relative h-1.5 w-1.5 rounded-full bg-[#4ad48a]" />
                      </span>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
