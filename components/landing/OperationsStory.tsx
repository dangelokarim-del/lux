"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { LiveNumber } from "./anim/LiveNumber";

const ease = [0.16, 1, 0.3, 1] as const;

const CHIPS = ["AC Issue", "Master Bedroom", "Maintenance", "High Priority"];
const STEP = ["LUXA understands", "Task created", "Assigned", "Live operations"];

/* a single dashboard stat — frosted glass panel that assembles from the dark */
function Cell({ reveal, index, label, value, accent, live }: {
  reveal: MotionValue<number>;
  index: number;
  label: string;
  value: number;
  accent?: boolean;
  live?: boolean;
}) {
  const r = useTransform(reveal, [index * 0.12, index * 0.12 + 0.5], [0, 1]);
  const y = useTransform(r, [0, 1], [14, 0]);
  return (
    <motion.div className="relative h-[74px] rounded-xl" style={{ opacity: r, y }}>
      <div className="absolute inset-0 rounded-xl bg-white/[0.03]" style={{ boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.16), inset 0 1px 0 rgba(255,255,255,0.10)" }} />
      <div className="absolute inset-0 px-3.5 py-2.5">
        <div className="text-[9px] uppercase tracking-[0.14em] text-white/40">{label}</div>
        <div className={`mt-1.5 text-[24px] font-semibold leading-none tabular-nums ${accent ? "text-[#6ba5ff]" : "text-white"}`}>
          {live ? <LiveNumber value={value} pad={2} /> : String(value).padStart(2, "0")}
        </div>
      </div>
    </motion.div>
  );
}

/* the live operations dashboard — assembles from structured data, then stays alive */
function Dashboard({ reveal, alive }: { reveal: MotionValue<number>; alive: boolean }) {
  const reduce = useReducedMotion();
  const [pulse, setPulse] = useState(0);
  const [notif, setNotif] = useState(false);

  useEffect(() => {
    if (!alive || reduce) return;
    const id = setInterval(() => setPulse((v) => v + 1), 4200);
    return () => clearInterval(id);
  }, [alive, reduce]);
  useEffect(() => {
    if (!alive || reduce || pulse === 0 || pulse % 2 === 0) return;
    setNotif(true);
    const t = setTimeout(() => setNotif(false), 3200);
    return () => clearTimeout(t);
  }, [pulse, alive, reduce]);

  const open = notif ? 16 : 15;
  const resolved = 28 + (alive ? Math.min(pulse, 9) : 0);
  const cells: { l: string; v: number; a?: boolean; live?: boolean }[] = [
    { l: "Open requests", v: open, live: true },
    { l: "Urgent", v: 3, a: true },
    { l: "Resolved", v: resolved, live: true },
    { l: "Arrivals", v: 6 },
  ];
  const body = useTransform(reveal, [0.25, 0.7], [0, 1]);

  return (
    <div className="w-full">
      <motion.div animate={alive && !reduce ? { scale: [1, 1.005, 1] } : { scale: 1 }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="relative">
        {/* soft white key light */}
        <motion.div aria-hidden className="absolute -inset-10 -z-10" style={{ opacity: body, background: "radial-gradient(55% 55% at 50% 26%, rgba(216,230,255,0.12), transparent 72%)", filter: "blur(26px)" }} />
        {/* frosted container */}
        <motion.div aria-hidden className="absolute inset-0 rounded-[24px] glass" style={{ opacity: useTransform(reveal, [0, 0.5], [0, 1]), boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.22), inset 0 1px 0 rgba(255,255,255,0.18), 0 60px 130px -44px rgba(0,0,0,0.85)" }} />

        <div className="relative px-5 py-4">
          {/* header */}
          <motion.div className="mb-3 flex items-center justify-between" style={{ opacity: body }}>
            <span className="flex items-center gap-1 text-[13px] font-semibold tracking-[-0.02em] text-white">
              LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF]" />
              <span className="ml-2 text-[11px] font-normal text-white/35">Operations</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/60">
              <span className="relative flex h-1.5 w-1.5">
                {alive && !reduce && <motion.span className="absolute inset-0 rounded-full bg-[#2E7DFF]" animate={{ scale: [1, 2.6], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />}
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" />
              </span>
              Live
            </span>
          </motion.div>

          {/* stat row */}
          <div className="grid grid-cols-4 gap-3">
            {cells.map((c, i) => (
              <Cell key={c.l} reveal={reveal} index={i} label={c.l} value={c.v} accent={c.a} live={c.live && alive} />
            ))}
          </div>

          {/* operations */}
          <div className="relative mt-4">
            <motion.div className="mb-1.5 flex items-center justify-between" style={{ opacity: body }}>
              <span className="text-[12px] font-medium text-white">Live operations</span>
              <span className="text-[10px] text-white/30">Updated just now</span>
            </motion.div>

            <AnimatePresence>
              {notif && (
                <motion.div
                  key="notif"
                  initial={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, x: 0, height: 44, marginBottom: 4 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.7, ease }}
                  className="flex items-center justify-between overflow-hidden rounded-xl px-3.5"
                  style={{ background: "rgba(46,125,255,0.05)", boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.18)" }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium text-white">New request · Villa Sol</div>
                    <div className="text-[10.5px] text-white/40">Late checkout requested</div>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2 py-0.5 text-[10px] font-medium text-[#8fbcff]">New</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* the AI-resolved task — the same request, now inside the system */}
            <motion.div className="relative flex h-[52px] items-center justify-between rounded-xl px-3.5" style={{ opacity: body, background: "rgba(46,125,255,0.05)", boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.28)" }}>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-white">AC — Master Bedroom</div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/45">
                  Maintenance · Villa Ocean
                  <span className="text-white/20">·</span>
                  <span className="grid h-4 w-4 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-[7px] text-white/70">CN</span>
                  Carlos
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2 py-0.5 text-[10px] font-medium text-[#8fbcff]">In Progress</span>
            </motion.div>

            {[
              { t: "Beach club reservation", v: "Villa Aura", s: "Confirmed" },
              { t: "Private chef — dinner for 6", v: "Villa Sol", s: "Pending" },
            ].map((r) => (
              <motion.div key={r.t} className="mt-1 flex items-center justify-between px-3.5 py-2.5" style={{ opacity: body }}>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] text-white/90">{r.t}</div>
                  <div className="text-[10.5px] text-white/35">Concierge · {r.v}</div>
                </div>
                <span className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/55">{r.s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* small WhatsApp request card (recap of the message sent in the hero) */
function WhatsAppCard() {
  return (
    <div className="glass edge-light relative w-full rounded-[18px] border border-white/12 bg-[#0b0d12]/70 px-4 py-3.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#43d178]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> WhatsApp
        </span>
        <span className="text-[9px] text-white/35">Villa Ocean · now</span>
      </div>
      <p className="mt-2 text-[15px] leading-snug text-white/90">Hi, the AC is not working in the master bedroom.</p>
    </div>
  );
}

/* the structured task LUXA builds from the message */
function TaskCard({ assigned }: { assigned: boolean }) {
  return (
    <div className="glass edge-light relative w-full overflow-hidden rounded-[18px] border border-[#2E7DFF]/20 bg-[#2E7DFF]/[0.04] px-4 py-3.5 shadow-[0_40px_90px_-36px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8fbcff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> LUXA · Task
        </span>
        <span className="rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2 py-0.5 text-[9.5px] font-medium text-[#8fbcff]">High Priority</span>
      </div>
      <div className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-white">AC — Master Bedroom</div>
      <div className="mt-1 text-[12px] text-white/45">Maintenance · Villa Ocean</div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Maintenance", "Master Bedroom", "AC Issue"].map((t) => (
          <span key={t} className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10.5px] font-medium text-white/70">{t}</span>
        ))}
      </div>

      <motion.div
        initial={false}
        animate={{ height: assigned ? "auto" : 0, opacity: assigned ? 1 : 0, marginTop: assigned ? 14 : 0 }}
        transition={{ duration: 0.7, ease }}
        className="overflow-hidden"
      >
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
          <span className="flex items-center gap-2 text-[12.5px] text-white/85">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-[9px] text-white/75">CN</span>
            Carlos · Villa Ocean
          </span>
          <span className="rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2.5 py-1 text-[10.5px] font-medium text-[#8fbcff]">In Progress</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  OPERATIONS STORY — after the problem statement, the WhatsApp request
 *  becomes intelligence: a structured task, assigned, then folded into the
 *  live operations dashboard. Dark, cinematic, electric-blue only for AI.
 * ------------------------------------------------------------------ */
export function OperationsStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  const [alive, setAlive] = useState(false);

  useMotionValueEvent(p, "change", (v) => {
    setBeat(v < 0.24 ? 0 : v < 0.44 ? 1 : v < 0.6 ? 2 : 3);
    setAlive(v > 0.9);
  });

  const chipsShow = beat === 0;
  const dashReveal = useTransform(p, [0.6, 0.86], [0, 1]);
  const dashGlow = useTransform(p, [0.55, 0.8], [0, 1]);

  return (
    <section ref={ref} id="product" className="relative h-[440vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* dark premium stage — soft electric key light grows as the system assembles */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: dashGlow, background: "radial-gradient(60% 50% at 50% 46%, rgba(46,125,255,0.06), transparent 70%)" }} />

        {/* step caption */}
        <div className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={beat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease }}
              className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/45"
            >
              {STEP[beat]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BEAT 0 — the message becomes structured data */}
        <motion.div
          className="absolute left-1/2 top-1/2 flex w-[min(440px,88vw)] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-5"
          animate={{ opacity: beat === 0 ? 1 : 0, y: beat === 0 ? 0 : -28, scale: beat === 0 ? 1 : 0.97, filter: beat === 0 ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 0.8, ease }}
          style={{ pointerEvents: "none" }}
        >
          <WhatsAppCard />
          <div className="flex w-full flex-wrap justify-center gap-2">
            {CHIPS.map((c, i) => (
              <motion.span
                key={c}
                animate={{ opacity: chipsShow ? 1 : 0, y: chipsShow ? 0 : 10, scale: chipsShow ? 1 : 0.92 }}
                transition={{ duration: 0.6, delay: chipsShow ? 0.25 + i * 0.1 : 0, ease }}
                className="glass rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/85"
              >
                <span className="mr-1 inline-block h-[3px] w-[3px] -translate-y-px rounded-full bg-[#2E7DFF]/80" />
                {c}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* BEAT 1–2 — the structured task, then assigned */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-[min(440px,88vw)] -translate-x-1/2 -translate-y-1/2"
          animate={{
            opacity: beat === 1 || beat === 2 ? 1 : 0,
            y: beat === 1 || beat === 2 ? 0 : beat === 0 ? 28 : -28,
            scale: beat === 1 || beat === 2 ? 1 : 0.97,
            filter: beat === 1 || beat === 2 ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: 0.8, ease }}
          style={{ pointerEvents: "none" }}
        >
          <TaskCard assigned={beat === 2} />
        </motion.div>

        {/* BEAT 3 — the live operations dashboard */}
        <motion.div
          className="absolute left-1/2 top-1/2 w-[min(900px,94vw)] -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 3 ? 1 : 0, y: beat === 3 ? 0 : 28 }}
          transition={{ duration: 0.8, ease }}
          style={{ pointerEvents: "none" }}
        >
          <Dashboard reveal={dashReveal} alive={alive} />
        </motion.div>
      </div>
    </section>
  );
}
