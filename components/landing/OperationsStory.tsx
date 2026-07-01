"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { MessageCircle, Sparkles, ClipboardList, UserCheck, CheckCircle2, Check } from "lucide-react";
import { LiveNumber } from "./anim/LiveNumber";

const ease = [0.62, 0.04, 0.2, 1] as const;
const spring = { type: "spring" as const, stiffness: 300, damping: 26 };

/* the five stages of the operation, shown as one horizontal flow */
const FLOW = [
  { label: "WhatsApp", sub: "Guest message", Icon: MessageCircle },
  { label: "AI understands", sub: "Intent parsed", Icon: Sparkles },
  { label: "Task Created", sub: "Structured", Icon: ClipboardList },
  { label: "Assigned", sub: "Right team", Icon: UserCheck },
  { label: "Completed", sub: "Confirmed", Icon: CheckCircle2 },
];

const CHIPS = ["Guest identified", "Villa Ocean", "Maintenance", "High Priority"];
const MESSAGE = "Hi, the AC is not working in the master bedroom.";

/* ------------------------------------------------------------------ *
 *  One WhatsApp → entire operation. A single scene that auto-plays forever
 *  while in view, stage by stage, at a calm ~0.8s cadence:
 *   1 WhatsApp message arrives · 2 AI extracts chips · 3 task created (NEW) ·
 *   4 assigned (IN PROGRESS) · 5 completed (green) — then a 2s hold and loop.
 *  The dashboard reacts live at every step. The product explains itself.
 * ------------------------------------------------------------------ */
export function OperationsStory() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.4 });
  const [phase, setPhase] = useState(0); // 0 idle · 1 WhatsApp · 2 AI · 3 NEW · 4 IN PROGRESS · 5 COMPLETED
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!inView) {
      setPhase(0);
      return;
    }
    if (reduce) {
      setPhase(5); // static finished state for reduced motion
      return;
    }
    const seq: [number, number][] = [
      [1, 350],   // WhatsApp message arrives
      [2, 1150],  // +0.8s — AI understands (chips)
      [3, 1950],  // +0.8s — Task Created → dashboard: NEW, Open 15→16, Urgent 02→03
      [4, 2750],  // +0.8s — Assigned → IN PROGRESS, Carlos appears
      [5, 3750],  // +1.0s — Completed → COMPLETED, counters settle, green
    ];
    const ids = seq.map(([ph, t]) => setTimeout(() => setPhase(ph), t));
    const loop = setTimeout(() => {
      setPhase(0);
      setCycle((c) => c + 1);
    }, 5750); // hold the finished state ~2s, then restart
    return () => {
      ids.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [inView, cycle, reduce]);

  // dashboard state derived from the phase
  const status: "NEW" | "IN PROGRESS" | "COMPLETED" | null =
    phase >= 5 ? "COMPLETED" : phase >= 4 ? "IN PROGRESS" : phase >= 3 ? "NEW" : null;
  const open = phase >= 3 && phase < 5 ? 16 : 15;
  const urgent = phase >= 3 && phase < 5 ? 3 : 2;
  const completedToday = phase >= 5 ? 29 : 28;

  return (
    <section ref={ref} id="product" className="relative overflow-x-clip">
      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center gap-6 px-5 py-16 sm:gap-8 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 46% at 50% 42%, rgba(46,125,255,0.05), transparent 72%)" }} />

        {/* SECTION 1 — headline */}
        <div className="text-center">
          <h2 className="text-balance text-[clamp(2rem,5.4vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
            One WhatsApp.
            <br />
            <span className="text-white/45">Entire operation automated.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-balance text-[14px] leading-relaxed text-white/55 sm:text-[15.5px]">
            From guest message to completed task in seconds.
          </p>
        </div>

        {/* SECTION 2 — the horizontal flow */}
        <div className="flex w-full items-stretch justify-center gap-0.5 sm:gap-2">
          {FLOW.map((s, i) => (
            <FlowStep key={s.label} step={s} done={phase > i} pulsing={phase === i + 1} last={i === FLOW.length - 1} nextOn={phase > i + 1} reduce={!!reduce} />
          ))}
        </div>

        {/* live detail — the message, then the AI chips (reserved height, no shift) */}
        <div className="flex min-h-[56px] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.div
                key="msg"
                initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease }}
                className="flex max-w-[90vw] items-center gap-2.5 rounded-2xl border border-[#25D366]/22 bg-[#0b0d12]/75 px-4 py-2.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#25D366]/15">
                  <MessageCircle className="h-3.5 w-3.5 text-[#43d178]" />
                </span>
                <span className="text-[12.5px] leading-snug text-white/90 sm:text-[13.5px]">“{MESSAGE}”</span>
              </motion.div>
            )}
            {phase === 2 && (
              <motion.div key="chips" className="flex flex-wrap items-center justify-center gap-1.5" initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.35 } }}>
                {CHIPS.map((c, i) => (
                  <motion.span
                    key={c}
                    initial={{ opacity: 0, y: 8, scale: 0.9, filter: "blur(5px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.45, delay: i * 0.12, ease }}
                    className="flex items-center gap-1.5 rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-3 py-1.5 text-[12px] font-medium text-white/90 sm:text-[13px]"
                  >
                    <Check className="h-3 w-3 text-[#6ba5ff]" /> {c}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3–5 — the live dashboard */}
        <div className="w-full max-w-[720px]">
          <Dashboard open={open} urgent={urgent} completedToday={completedToday} status={status} assigned={phase >= 4} live={phase >= 1 && phase <= 5} reduce={!!reduce} />
        </div>
      </div>
    </section>
  );
}

/* one large flow card + the connector into the next */
function FlowStep({
  step,
  done,
  pulsing,
  last,
  nextOn,
  reduce,
}: {
  step: { label: string; sub: string; Icon: typeof MessageCircle };
  done: boolean;
  pulsing: boolean;
  last: boolean;
  nextOn: boolean;
  reduce: boolean;
}) {
  const { Icon } = step;
  return (
    <>
      <motion.div
        className="relative flex w-[clamp(48px,13.7vw,148px)] flex-col items-center gap-1.5 rounded-2xl border px-1 py-2.5 sm:gap-2.5 sm:px-3 sm:py-5"
        animate={{
          borderColor: done ? "rgba(46,125,255,0.45)" : "rgba(255,255,255,0.09)",
          backgroundColor: done ? "rgba(46,125,255,0.07)" : "rgba(255,255,255,0.015)",
          boxShadow: done ? "0 0 28px -8px rgba(46,125,255,0.4)" : "0 0 0 rgba(0,0,0,0)",
          y: done ? -2 : 0,
        }}
        transition={{ duration: 0.5, ease }}
      >
        {pulsing && !reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.07 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{ boxShadow: "0 0 0 1px rgba(46,125,255,0.7), 0 0 26px rgba(46,125,255,0.4)" }}
          />
        )}
        <motion.span
          className="grid h-8 w-8 place-items-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl"
          animate={{ backgroundColor: done ? "rgba(46,125,255,0.16)" : "rgba(255,255,255,0.04)", color: done ? "#8fbcff" : "rgba(255,255,255,0.5)" }}
          transition={{ duration: 0.5, ease }}
        >
          <Icon className="h-[18px] w-[18px] sm:h-[22px] sm:w-[22px]" />
        </motion.span>
        <div className="text-center">
          <motion.div className="text-[10px] font-medium leading-tight sm:text-[13.5px]" animate={{ color: done ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)" }} transition={{ duration: 0.5 }}>
            {step.label}
          </motion.div>
          <div className="mt-0.5 hidden text-[11px] text-white/35 sm:block">{step.sub}</div>
        </div>
      </motion.div>

      {!last && (
        <div className="flex shrink-0 items-center self-center">
          <motion.svg width="13" height="10" viewBox="0 0 20 10" fill="none" className="sm:w-7" animate={{ opacity: done ? 1 : 0.25 }} transition={{ duration: 0.5 }}>
            <path d="M0 5H16M16 5L12 1M16 5L12 9" stroke={nextOn || done ? "#2E7DFF" : "rgba(255,255,255,0.5)"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </div>
      )}
    </>
  );
}

/* status badge tones */
const STATUS_TONE: Record<"NEW" | "IN PROGRESS" | "COMPLETED", { bd: string; bg: string; tx: string; row: string; rowbd: string }> = {
  NEW: { bd: "border-[#2E7DFF]/30", bg: "bg-[#2E7DFF]/12", tx: "text-[#8fbcff]", row: "rgba(46,125,255,0.06)", rowbd: "rgba(46,125,255,0.3)" },
  "IN PROGRESS": { bd: "border-[#f5b53d]/30", bg: "bg-[#f5b53d]/10", tx: "text-[#f0b64e]", row: "rgba(245,181,61,0.05)", rowbd: "rgba(245,181,61,0.28)" },
  COMPLETED: { bd: "border-[#4ad48a]/30", bg: "bg-[#4ad48a]/12", tx: "text-[#5fe0a0]", row: "rgba(74,212,138,0.06)", rowbd: "rgba(74,212,138,0.32)" },
};

/* the live operations dashboard — reacts to every step, Dynamic-Island style */
function Dashboard({
  open,
  urgent,
  completedToday,
  status,
  assigned,
  live,
  reduce,
}: {
  open: number;
  urgent: number;
  completedToday: number;
  status: "NEW" | "IN PROGRESS" | "COMPLETED" | null;
  assigned: boolean;
  live: boolean;
  reduce: boolean;
}) {
  const cells = [
    { l: "Open requests", v: open },
    { l: "Urgent", v: urgent, a: true },
    { l: "Completed today", v: completedToday },
    { l: "Arrivals", v: 6 },
  ];
  const tone = status ? STATUS_TONE[status] : null;

  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-8 -z-10" style={{ background: "radial-gradient(55% 60% at 50% 30%, rgba(216,230,255,0.08), transparent 72%)", filter: "blur(26px)" }} />
      <div className="relative overflow-hidden rounded-[24px]" style={{ boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.2), inset 0 1px 0 rgba(255,255,255,0.16), 0 60px 130px -44px rgba(0,0,0,0.85)", background: "rgba(255,255,255,0.012)" }}>
        <div className="glass absolute inset-0" aria-hidden />
        <div className="relative px-4 py-4 sm:px-5">
          {/* header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[13px] font-semibold tracking-[-0.02em] text-white">
              LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF]" />
              <span className="ml-2 text-[11px] font-normal text-white/35">Operations</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/60">
              <span className="relative flex h-1.5 w-1.5">
                {live && !reduce && <motion.span className="absolute inset-0 rounded-full bg-[#2E7DFF]" animate={{ scale: [1, 2.6], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />}
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" />
              </span>
              Live
            </span>
          </div>

          {/* stat row */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {cells.map((c) => (
              <div key={c.l} className="relative h-[74px] rounded-xl bg-white/[0.03] px-3 py-2.5" style={{ boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.14)" }}>
                <div className="text-[8.5px] uppercase tracking-[0.12em] text-white/40 sm:text-[9px]">{c.l}</div>
                <div className={`mt-1.5 text-[22px] font-semibold leading-none tabular-nums sm:text-[26px] ${c.a && urgent >= 3 ? "text-[#6ba5ff]" : "text-white"}`}>
                  <LiveNumber value={c.v} pad={2} duration={0.7} />
                </div>
              </div>
            ))}
          </div>

          {/* operations list */}
          <div className="mt-3.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12px] font-medium text-white">Live operations</span>
              <span className="text-[10px] text-white/30">{status ? "Updated just now" : "Up to date"}</span>
            </div>

            {/* the AC task — slides in on "Task Created", then steps NEW → IN PROGRESS → COMPLETED */}
            <AnimatePresence>
              {status && tone && (
                <motion.div
                  key="ac"
                  layout
                  initial={{ opacity: 0, height: 0, marginBottom: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, height: 54, marginBottom: 5, filter: "blur(0px)" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={reduce ? { duration: 0 } : spring}
                  className="relative flex items-center justify-between overflow-hidden rounded-xl px-3.5"
                  style={{ background: tone.row, boxShadow: `inset 0 0 0 1px ${tone.rowbd}` }}
                >
                  {/* soft pulse each time the status changes */}
                  {!reduce && (
                    <motion.span
                      key={status}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{ boxShadow: `inset 0 0 0 1px ${tone.rowbd.replace(/0\.\d+\)/, "0.8)")}, 0 0 24px ${tone.row.replace(/0\.\d+\)/, "0.4)")}` }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-white">AC — Master Bedroom</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/45">
                      Villa Ocean
                      <AnimatePresence>
                        {assigned && (
                          <motion.span key="carlos" initial={{ opacity: 0, x: -4, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={spring} className="flex items-center gap-1.5">
                            <span className="text-white/20">·</span>
                            <span className="grid h-4 w-4 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-[7px] text-white/70">CN</span>
                            Carlos
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={status}
                      initial={{ opacity: 0, scale: 0.82, y: 2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.82, y: -2 }}
                      transition={spring}
                      className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tone.bd} ${tone.bg} ${tone.tx}`}
                    >
                      {status === "COMPLETED" && <Check size={11} />}
                      {status}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {[
              { t: "Beach club reservation", v: "Villa Aura", s: "Confirmed" },
              { t: "Private chef · dinner for 6", v: "Villa Sol", s: "Pending" },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] text-white/90">{r.t}</div>
                  <div className="text-[10.5px] text-white/35">Concierge · {r.v}</div>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/55">{r.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
