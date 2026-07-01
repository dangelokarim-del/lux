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

// top step captions (empty = the beat carries its own heading)
const STEP = ["Incoming request", "", "Live dashboard"];

const TIMELINE = [
  { t: "Guest Message", d: "A request arrives by WhatsApp." },
  { t: "AI understands", d: "Intent, villa and urgency parsed." },
  { t: "Task Created", d: "Structured automatically." },
  { t: "Assigned", d: "Routed to the right team." },
  { t: "Completed", d: "Tracked and confirmed." },
];

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

/* the "finished operation" — a minimal, centered vertical timeline. Steps rise
   in sequence along one continuous electric-blue rail. */
function OperationTimeline({ active }: { active: boolean }) {
  return (
    <div className="w-[min(460px,88vw)]">
      <h3 className="text-center text-[clamp(1.9rem,5vw,3.1rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.6)]">
        A finished operation out.
      </h3>

      <ol className="relative mx-auto mt-10 max-w-[380px] space-y-5">
        {/* the rail — the electric-blue thread, now the spine of the timeline */}
        <div
          aria-hidden
          className="absolute left-[12px] top-1.5 bottom-1.5 w-px"
          style={{ background: "linear-gradient(180deg, transparent, rgba(46,125,255,0.55) 10%, rgba(46,125,255,0.55) 90%, transparent)" }}
        />
        {TIMELINE.map((s, i) => (
          <motion.li
            key={s.t}
            className="relative flex gap-4"
            initial={false}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : -10, filter: active ? "blur(0px)" : "blur(6px)" }}
            transition={{ duration: 0.65, delay: active ? 0.12 + i * 0.16 : 0, ease }}
          >
            <span className="relative z-10 mt-0.5 grid h-[25px] w-[25px] shrink-0 place-items-center rounded-full border border-[#2E7DFF]/35 bg-[#080c14]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#2E7DFF] shadow-[0_0_8px_rgba(46,125,255,0.8)]" />
            </span>
            <div className="pt-0.5">
              <div className="text-[15px] font-medium leading-tight text-white">{s.t}</div>
              <div className="mt-0.5 text-[13px] leading-snug text-white/50">{s.d}</div>
            </div>
          </motion.li>
        ))}
      </ol>
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

/* the live operations dashboard — receives the WhatsApp request in real time:
   Open 15→16, Urgent 02→03 update, then the new AC row slides in (assigned,
   In Progress) with a soft blue pulse. */
function Dashboard({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0); // 0 assemble · 1 numbers bump · 2 new row

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 2500);
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

            {/* the new AC row — slides in as the live system reacts, with a blue pulse */}
            <AnimatePresence>
              {showAC && (
                <motion.div
                  key="ac"
                  initial={{ opacity: 0, height: 0, marginBottom: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, height: 52, marginBottom: 4, filter: "blur(0px)" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.9, ease }}
                  className="relative flex items-center justify-between overflow-hidden rounded-xl px-3.5"
                  style={{ background: "rgba(46,125,255,0.05)", boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.28)" }}
                >
                  {!reduce && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      initial={{ opacity: 0.55 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      style={{ boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.8), 0 0 24px rgba(46,125,255,0.35)" }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-white">AC — Master Bedroom</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/45">
                      Maintenance · Villa Ocean
                      <span className="text-white/20">·</span>
                      <span className="grid h-4 w-4 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-[7px] text-white/70">CN</span>
                      Carlos
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="rounded-full border border-[#f5b53d]/30 bg-[#f5b53d]/10 px-2 py-0.5 text-[10px] font-medium text-[#f0b64e]">High</span>
                    <span className="rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2 py-0.5 text-[10px] font-medium text-[#8fbcff]">In Progress</span>
                  </span>
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
 *  OPERATIONS STORY — one continuous cinematic beat: the WhatsApp request
 *  arrives, resolves through a minimal vertical timeline ("a finished
 *  operation"), then lands live in the operations dashboard in real time.
 *  Dark and cinematic; electric blue is the connective thread throughout.
 * ------------------------------------------------------------------ */
export function OperationsStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);

  useMotionValueEvent(p, "change", (v) => {
    setBeat(v < 0.3 ? 0 : v < 0.64 ? 1 : 2);
  });

  return (
    <section ref={ref} id="product" className="relative h-[440vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* soft electric key light grows as the system comes alive */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" animate={{ opacity: beat === 2 ? 1 : beat === 0 ? 0 : 0.5 }} transition={{ duration: 1.2, ease }} style={{ background: "radial-gradient(60% 50% at 50% 48%, rgba(46,125,255,0.06), transparent 70%)" }} />

        {/* a single, quiet electric-blue thread connecting the beats — dimmed on
            the timeline beat, which carries its own (brighter) rail */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[58vh] w-px -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 2 ? 0.12 : beat === 1 ? 0.05 : 0.3 }}
          transition={{ duration: 1, ease }}
          style={{ background: "linear-gradient(180deg, transparent, rgba(46,125,255,0.55) 26%, rgba(46,125,255,0.55) 74%, transparent)" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[58vh] w-[3px] -translate-x-1/2 -translate-y-1/2 blur-[7px]"
          animate={{ opacity: beat === 2 ? 0.08 : beat === 1 ? 0.04 : 0.2 }}
          transition={{ duration: 1, ease }}
          style={{ background: "linear-gradient(180deg, transparent, rgba(46,125,255,0.5), transparent)" }}
        />

        {/* step caption (hidden on the timeline beat) */}
        <div className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center">
          <AnimatePresence mode="wait">
            {STEP[beat] && (
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
            )}
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

        {/* BEAT 1 — "A finished operation out." vertical timeline */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 1 ? 1 : 0, y: beat === 1 ? 0 : beat < 1 ? 30 : -30, scale: beat === 1 ? 1 : 0.97, filter: beat === 1 ? "blur(0px)" : "blur(6px)" }}
          transition={{ duration: 1.05, ease }}
        >
          <OperationTimeline active={beat === 1} />
        </motion.div>

        {/* BEAT 2 — the live operations dashboard receiving the request */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[min(900px,94vw)] -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: beat === 2 ? 1 : 0, y: beat === 2 ? 0 : 30 }}
          transition={{ duration: 1.05, ease }}
        >
          <Dashboard active={beat === 2} />
        </motion.div>
      </div>
    </section>
  );
}
