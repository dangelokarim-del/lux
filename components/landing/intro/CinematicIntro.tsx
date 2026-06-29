"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui";
import { useIntro } from "./IntroContext";
import { Villa } from "./Villa";
import { ProductDashboard } from "../ProductDashboard";

const ease = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
const q = (v: number) => Math.round(v * 20) / 20; // quantize to 0.05 — fewer re-renders

/* ------------------------------------------------------------------ *
 *  CINEMATIC HERO — fully coded (no video). One free-running clock
 *  drives a 10s story: dark screen → villa silhouette → lights on →
 *  WhatsApp → AI precision line → entity chips → dissolve to dashboard
 *  → task created + stats → "Luxury. Automated." → hand off to the site.
 *
 *  Every beat is a timestamp in SCENE; all motion is derived continuously
 *  from the clock via clamp()/lerp(), so the sequence is deterministic and
 *  trivially re-timed. Respect for prefers-reduced-motion is handled one
 *  level up in IntroContext (reduced-motion users never see this).
 * ------------------------------------------------------------------ */
const SCENE = {
  villa: 0.6, // silhouette begins to appear (before this: dark screen)
  lights: 2.0, // warm interior lights turn on
  notifyIn: 3.0, // WhatsApp glass card slides in
  notifyOut: 6.3, // …and leaves
  detect: 4.6, // blue precision line travels to the master-bedroom window
  chips: 5.4, // AI entity chips surface
  dissolve: 6.8, // villa dissolves into the dashboard
  dashboard: 7.9, // dashboard fully sharp; task created + stats run
  reveal: 9.4, // brand reveal over the dimmed dashboard
  end: 11.0, // hand off to the resting product hero
  // the master-bedroom window the line + chips point at (percent of the stage)
  window: { x: 58.2, y: 31.4 },
};

/* chips positioned relative to the lit window */
const CHIPS = [
  { label: "AC Issue", dx: 4, dy: -8.5 },
  { label: "Master Bedroom", dx: 12.5, dy: -3.5 },
  { label: "Maintenance", dx: 5.5, dy: 4.5 },
  { label: "High Priority", dx: 15, dy: 9.5 },
  { label: "Villa Ocean", dx: 1.5, dy: 13.5 },
];

export function CinematicIntro() {
  const { shouldRun, done, finish } = useIntro();
  const [clock, setClock] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [debug, setDebug] = useState(false);

  // the dashboard is heavy — memoize the element so the clock can re-render
  // the overlays at 60fps without re-rendering the dashboard subtree.
  const dashEl = useMemo(() => <ProductDashboard animated intro />, []);

  // ?debug=1 prints the live timeline clock so beats can be re-timed by eye.
  useEffect(() => {
    try {
      setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
    } catch {}
  }, []);

  // reveal the Skip control 1s in
  useEffect(() => {
    if (shouldRun !== true) return;
    const t = setTimeout(() => setShowSkip(true), 1000);
    return () => clearTimeout(t);
  }, [shouldRun]);

  // master clock — a single free-running timeline
  useEffect(() => {
    if (shouldRun !== true) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setClock((c) => Math.min(c + dt, SCENE.end));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldRun]);

  useEffect(() => {
    if (shouldRun === true && clock >= SCENE.end) finish();
  }, [clock, shouldRun, finish]);

  // lock scroll during the sequence
  useEffect(() => {
    if (shouldRun !== true || done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shouldRun, done]);

  if (shouldRun !== true || done) return null;

  const after = (t: number) => clock >= t;

  // ---- villa stage drivers (story) ----
  const entrance = clamp((clock - SCENE.villa) / 1.2); // silhouette reveal
  const lights = clamp((clock - SCENE.lights) / 1.1); // interior lights on
  const flag = clamp((clock - SCENE.detect) / 0.6); // window selected

  // ---- camera + dissolve ----
  const drift = clamp((clock - SCENE.villa) / (SCENE.dissolve - SCENE.villa));
  const diss = clamp((clock - SCENE.dissolve) / (SCENE.dashboard - SCENE.dissolve));
  const onReveal = after(SCENE.reveal);

  const stageScale = lerp(1, 1.08, drift) * lerp(1, 2.2, diss);
  const stageBlur = lerp(0, 16, diss);
  const stageOpacity = 1 - clamp((clock - (SCENE.dashboard - 0.4)) / 0.8);
  const rootOpacity = 1 - clamp((clock - (SCENE.end - 0.7)) / 0.7);

  // ---- overlays ----
  const win = SCENE.window;
  const lineD = `M 50 25 Q ${(50 + win.x) / 2} ${(25 + win.y) / 2 - 2} ${win.x} ${win.y}`;
  const lineDraw = clamp((clock - SCENE.detect) / 0.9);
  const showNotify = clock >= SCENE.notifyIn && clock < SCENE.notifyOut && clock < SCENE.dissolve;
  const showChips = clock >= SCENE.chips && clock < SCENE.dissolve;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-black" style={{ opacity: rootOpacity }}>
      {/* ---- background stage: the coded villa scene ---- */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: `${win.x}% ${win.y}%`,
          transform: `scale(${stageScale})`,
          filter: `blur(${stageBlur}px)`,
          opacity: stageOpacity,
        }}
      >
        <Villa entrance={q(entrance)} lights={q(lights)} flag={q(flag)} />
      </div>

      {/* ---- WhatsApp notification ---- */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[20%] w-[290px] max-w-[80%] -translate-x-1/2"
        animate={{ opacity: showNotify ? 1 : 0, y: showNotify ? 0 : -12, scale: showNotify ? 1 : 0.97 }}
        transition={{ duration: 0.8, ease }}
      >
        <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.05] p-3 backdrop-blur-2xl shadow-[0_24px_70px_-34px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[8.5px] font-medium uppercase tracking-[0.16em] text-white/45">
              <span className="h-1 w-1 rounded-full bg-[#25D366]" />
              WhatsApp
            </span>
            <span className="text-[8.5px] text-white/30">Villa Ocean · now</span>
          </div>
          <p className="mt-1.5 text-[12px] leading-snug text-white/85">
            Hi, the AC is not working in the master bedroom.
          </p>
        </div>
      </motion.div>

      {/* ---- electric-blue precision line to the window ---- */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={lineD}
          fill="none"
          stroke="#2E7DFF"
          strokeWidth={1.4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{
            filter: "drop-shadow(0 0 3px rgba(46,125,255,0.55))",
            strokeDasharray: 1,
            strokeDashoffset: 1 - lineDraw,
            opacity: after(SCENE.detect) && clock < SCENE.dissolve ? 0.9 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      </svg>

      {/* ---- AI entity chips ---- */}
      {CHIPS.map((c, idx) => (
        <motion.span
          key={c.label}
          className="pointer-events-none absolute -translate-x-1/2 rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white/75 backdrop-blur-xl"
          style={{ left: `${win.x + c.dx}%`, top: `${win.y + c.dy}%` }}
          animate={{ opacity: showChips ? 1 : 0, y: showChips ? 0 : after(SCENE.dissolve) ? -10 : 8, scale: showChips ? 1 : 0.96 }}
          transition={{ duration: 0.7, delay: showChips ? idx * 0.16 : 0, ease }}
        >
          {c.label}
        </motion.span>
      ))}

      {/* ---- dashboard glass-dissolves in ---- */}
      {after(SCENE.dissolve - 0.15) && (
        <div
          className="absolute left-1/2 top-1/2 w-[min(1000px,93vw)] -translate-x-1/2 -translate-y-1/2"
          style={{
            opacity: onReveal ? 0.32 : diss,
            filter: `blur(${onReveal ? 7 : lerp(22, 0, diss)}px)`,
            transform: `translate(-50%,-50%) scale(${onReveal ? 0.97 : lerp(1.05, 1, diss)})`,
          }}
        >
          <div className="shadow-[var(--shadow-float)]">{dashEl}</div>
        </div>
      )}

      {/* ---- brand reveal ---- */}
      {onReveal && (
        <motion.div
          className="absolute inset-0 z-20 grid place-items-center px-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.25, ease }}
              className="text-balance text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white"
            >
              Luxury.
              <br />
              Automated.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease }}
              className="mx-auto mt-5 max-w-md text-balance text-[15px] leading-relaxed text-white/55 sm:text-base"
            >
              Every guest request. Perfectly orchestrated.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.75, ease }}
              className="mt-9"
            >
              <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Book a Demo
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}

      <button
        onClick={() => setClock(SCENE.end)}
        style={{ opacity: showSkip ? 1 : 0, pointerEvents: showSkip ? "auto" : "none" }}
        className="absolute bottom-6 right-6 z-30 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[12px] text-white/55 backdrop-blur-md transition-[opacity,border-color,color] duration-500 hover:border-white/30 hover:text-white"
      >
        Skip
      </button>

      {/* ---- timeline HUD (?debug=1) ---- */}
      {debug && (
        <div className="absolute left-4 top-4 z-40 select-none rounded-md bg-black/75 px-3 py-2 font-mono text-[11px] leading-relaxed text-white/80 backdrop-blur-sm">
          <div className="text-white/90">
            clock <span className="text-[#2E7DFF]">{clock.toFixed(2)}s</span>
          </div>
          <div className="mt-0.5 text-white/40">
            villa {SCENE.villa} · lights {SCENE.lights} · notify {SCENE.notifyIn}–{SCENE.notifyOut}
          </div>
          <div className="text-white/40">
            detect {SCENE.detect} · chips {SCENE.chips} · dissolve {SCENE.dissolve}
          </div>
          <div className="text-white/40">
            dash {SCENE.dashboard} · reveal {SCENE.reveal} · end {SCENE.end}
          </div>
        </div>
      )}
    </div>
  );
}
