"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { LiveNumber } from "./anim/LiveNumber";

// keynote motion language — smooth ease-in-out cubic
const ease = [0.62, 0.04, 0.2, 1] as const;

const CHIPS = ["AC Issue", "Master Bedroom", "Maintenance", "High Priority"];
const STEP = ["Incoming request", "LUXA understands", "Task created", "Live operations"];

/* the WhatsApp request — large and readable, the main focus of its beat */
function WhatsAppCard() {
  return (
    <div className="glass edge-light relative w-full rounded-[22px] border border-white/12 bg-[#0b0d12]/75 px-6 py-5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#43d178]">
          <span className="h-2 w-2 rounded-full bg-[#25D366]" /> WhatsApp
        </span>
        <span className="text-[11px] text-white/40">Villa Ocean · now</span>
      </div>
      <p className="mt-3 text-[clamp(1.05rem,2.4vw,1.5rem)] font-medium leading-snug tracking-[-0.01em] text-white">
        Hi, the AC is not working in the master bedroom.
      </p>
    </div>
  );
}

/* the structured task LUXA builds from the message — High Priority lands after */
function TaskCard({ active }: { active: boolean }) {
  const [hp, setHp] = useState(false);
  useEffect(() => {
    if (!active) {
      setHp(false);
      return;
    }
    const t = setTimeout(() => setHp(true), 1050);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="glass edge-light relative w-full overflow-hidden rounded-[20px] border border-[#2E7DFF]/20 bg-[#2E7DFF]/[0.04] px-5 py-4 shadow-[0_44px_100px_-40px_rgba(0,0,0,0.88)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8fbcff]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> LUXA · Task
        </span>
        <AnimatePresence>
          {hp && (
            <motion.span
              initial={{ opacity: 0, scale: 0.82, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease }}
              className="rounded-full border border-[#2E7DFF]/30 bg-[#2E7DFF]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#8fbcff]"
            >
              High Priority
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2.5 text-[clamp(1.2rem,2.6vw,1.6rem)] font-semibold tracking-[-0.02em] text-white">AC — Master Bedroom</div>
      <div className="mt-1 text-[13px] text-white/45">Villa Ocean</div>

      <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
        <span className="flex items-center gap-2.5 text-[13.5px] text-white/85">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-[10px] text-white/75">CN</span>
          Assigned to Carlos
        </span>
        <span className="flex items-center gap-2 text-[12px] text-white/45">
          Status
          <span className="rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2.5 py-1 text-[11px] font-medium text-[#8fbcff]">In Progress</span>
        </span>
      </div>
    </div>
  );
}

/* one dashboard stat — frosted panel that assembles from the dark */
function Cell({ active, index, label, value, accent, live }: {
  active: boolean;
  index: number;
  label: string;
  value: number;
  accent?: boolean;
  live?: boolean;
}) {
  return (
    <motion.div
      className="relative h-[80px] rounded-xl"
      initial={false}
      animate={{ opacity: active ? 1 : 0, y: active ? 0 : 20, filter: active ? "blur(0px)" : "blur(8px)" }}
      transition={{ duration: 0.85, delay: active ? index * 0.13 : 0, ease }}
    >
      <div className="absolute inset-0 rounded-xl bg-white/[0.03]" style={{ boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.16), inset 0 1px 0 rgba(255,255,255,0.10)" }} />
      <div className="absolute inset-0 px-3.5 py-2.5">
        <div className="text-[9px] uppercase tracking-[0.14em] text-white/40">{label}</div>
        <div className={`mt-1.5 text-[26px] font-semibold leading-none tabular-nums ${accent ? "text-[#6ba5ff]" : "text-white"}`}>
          {live ? <LiveNumber value={value} pad={2} /> : String(value).padStart(2, "0")}
        </div>
      </div>
    </motion.div>
  );
}

/* the live operations dashboard — assembles, then behaves like a live system:
   Open 15→16, Urgent 02→03, then the new AC row slides in */
function Dashboard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0); // 0 assemble · 1 numbers bump · 2 new row

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    const t1 = setTimeout(() => setPhase(1), 1600);
    const t2 = setTimeout(() => setPhase(2), 2700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active]);

  const open = phase >= 1 ? 16 : 15;
  const urgent = phase >= 1 ? 3 : 2;
  const showAC = phase >= 2;
  const cells: { l: string; v: number; a?: boolean; live?: boolean }[] = [
    { l: "Open requests", v: open, live: true },
    { l: "Urgent", v: urgent, a: true, live: true },
    { l: "Resolved", v: 28 },
    { l: "Arrivals", v: 6 },
  ];

  return (
    <div className="w-full">
      <motion.div animate={active && !reduce ? { scale: [1, 1.005, 1] } : { scale: 1 }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="relative">
        {/* soft key light */}
        <div aria-hidden className="absolute -inset-10 -z-10" style={{ background: "radial-gradient(55% 55% at 50% 26%, rgba(216,230,255,0.10), transparent 72%)", filter: "blur(26px)" }} />
        {/* frosted container */}
        <motion.div aria-hidden className="absolute inset-0 rounded-[24px] glass" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 1, ease }} style={{ boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.22), inset 0 1px 0 rgba(255,255,255,0.18), 0 60px 130px -44px rgba(0,0,0,0.85)" }} />

        <div className="relative px-5 py-4">
          {/* header */}
          <motion.div className="mb-3 flex items-center justify-between" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.85, delay: 0.15, ease }}>
            <span className="flex items-center gap-1 text-[13px] font-semibold tracking-[-0.02em] text-white">
              LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF]" />
              <span className="ml-2 text-[11px] font-normal text-white/35">Operations</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/60">
              <span className="relative flex h-1.5 w-1.5">
                {active && !reduce && <motion.span className="absolute inset-0 rounded-full bg-[#2E7DFF]" animate={{ scale: [1, 2.6], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />}
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" />
              </span>
              Live
            </span>
          </motion.div>

          {/* stat row */}
          <div className="grid grid-cols-4 gap-3">
            {cells.map((c, i) => (
              <Cell key={c.l} active={active} index={i} label={c.l} value={c.v} accent={c.a} live={c.live} />
            ))}
          </div>

          {/* operations */}
          <div className="relative mt-4">
            <motion.div className="mb-1.5 flex items-center justify-between" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.85, delay: 0.6, ease }}>
              <span className="text-[12px] font-medium text-white">Live operations</span>
              <span className="text-[10px] text-white/30">Updated just now</span>
            </motion.div>

            {/* the new AC row — slides in as the live system reacts */}
            <AnimatePresence>
              {showAC && (
                <motion.div
                  key="ac"
                  initial={{ opacity: 0, height: 0, marginBottom: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, height: 52, marginBottom: 4, filter: "blur(0px)" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.9, ease }}
                  className="flex items-center justify-between overflow-hidden rounded-xl px-3.5"
                  style={{ background: "rgba(46,125,255,0.05)", boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.28)" }}
                >
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
              )}
            </AnimatePresence>

            {[
              { t: "Beach club reservation", v: "Villa Aura", s: "Confirmed" },
              { t: "Private chef — dinner for 6", v: "Villa Sol", s: "Pending" },
            ].map((r, i) => (
              <motion.div key={r.t} className="flex items-center justify-between px-3.5 py-3" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.85, delay: 0.7 + i * 0.12, ease }}>
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

/* ------------------------------------------------------------------ *
 *  OPERATIONS STORY — after the problem, the WhatsApp request becomes
 *  intelligence: the message is read large, parsed into structured data,
 *  becomes a task, then folds into a live operations dashboard. Dark and
 *  cinematic; electric blue only for AI.
 * ------------------------------------------------------------------ */
export function OperationsStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);

  useMotionValueEvent(p, "change", (v) => {
    setBeat(v < 0.2 ? 0 : v < 0.38 ? 1 : v < 0.58 ? 2 : 3);
  });

  return (
    <section ref={ref} id="product" className="relative h-[440vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* soft electric key light grows as the system assembles */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" animate={{ opacity: beat === 3 ? 1 : beat === 0 ? 0 : 0.5 }} transition={{ duration: 1.2, ease }} style={{ background: "radial-gradient(60% 50% at 50% 48%, rgba(46,125,255,0.06), transparent 70%)" }} />

        {/* a single, quiet electric-blue thread that runs through the whole
            sequence — the message, the AI, the task and the dashboard all sit on
            it, so the beats read as one connected flow rather than separate cards */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[58vh] w-px -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 3 ? 0.12 : beat === 0 ? 0.28 : 0.4 }}
          transition={{ duration: 1, ease }}
          style={{ background: "linear-gradient(180deg, transparent, rgba(46,125,255,0.55) 26%, rgba(46,125,255,0.55) 74%, transparent)" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[58vh] w-[3px] -translate-x-1/2 -translate-y-1/2 blur-[7px]"
          animate={{ opacity: beat === 3 ? 0.08 : 0.22 }}
          transition={{ duration: 1, ease }}
          style={{ background: "linear-gradient(180deg, transparent, rgba(46,125,255,0.5), transparent)" }}
        />

        {/* step caption */}
        <div className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={beat}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.85, ease }}
              className="text-[12px] font-medium uppercase tracking-[0.28em] text-white/45"
            >
              {STEP[beat]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BEAT 0 — the WhatsApp request, large */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(560px,90vw)] -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 0 ? 1 : 0, y: beat === 0 ? 0 : -30, scale: beat === 0 ? 1 : 0.97, filter: beat === 0 ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 1.05, ease }}
        >
          <WhatsAppCard />
        </motion.div>

        {/* BEAT 1 — structured intelligence */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 flex w-[min(560px,90vw)] -translate-x-1/2 -translate-y-1/2 flex-wrap justify-center gap-2.5"
          animate={{ opacity: beat === 1 ? 1 : 0, y: beat === 1 ? 0 : beat < 1 ? 30 : -30, scale: beat === 1 ? 1 : 0.97, filter: beat === 1 ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 1.05, ease }}
        >
          {CHIPS.map((c, i) => (
            <motion.span
              key={c}
              animate={{ opacity: beat === 1 ? 1 : 0, y: beat === 1 ? 0 : 14, scale: beat === 1 ? 1 : 0.9, filter: beat === 1 ? "blur(0px)" : "blur(5px)" }}
              transition={{ duration: 0.85, delay: beat === 1 ? i * 0.15 : 0, ease }}
              className="glass rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-4 py-2 text-[clamp(0.82rem,1.7vw,1rem)] font-medium text-white/90"
            >
              <span className="mr-1.5 inline-block h-1 w-1 -translate-y-px rounded-full bg-[#2E7DFF]" />
              {c}
            </motion.span>
          ))}
        </motion.div>

        {/* BEAT 2 — the structured, assigned task. On the way to the dashboard it
            fades DOWN as the dashboard rises up underneath it (item 7). */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(460px,90vw)] -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 2 ? 1 : 0, y: beat === 2 ? 0 : beat < 2 ? 30 : 64, scale: beat === 2 ? 1 : 0.97, filter: beat === 2 ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 1.05, ease }}
        >
          <TaskCard active={beat === 2} />
        </motion.div>

        {/* BEAT 3 — the live operations dashboard */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(900px,94vw)] -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 3 ? 1 : 0, y: beat === 3 ? 0 : 30 }}
          transition={{ duration: 1.05, ease }}
        >
          <Dashboard active={beat === 3} />
        </motion.div>
      </div>
    </section>
  );
}
