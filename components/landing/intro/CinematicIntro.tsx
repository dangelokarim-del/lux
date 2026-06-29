"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LuxaMark } from "@/components/ui/LuxaMark";
import { useIntro } from "./IntroContext";
import { VillaStage } from "./VillaStage";
import { ProductDashboard } from "../ProductDashboard";

const ease = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
const q = (v: number) => Math.round(v * 20) / 20; // quantize → fewer re-renders

/* ------------------------------------------------------------------ *
 *  CINEMATIC HERO — a directed 8-second opening, no audio.
 *
 *  Real Three.js villa (VillaStage) as the hero for the first ~70%, then
 *  the architecture cools and resolves into the live dashboard. One free-
 *  running clock drives every beat; prefers-reduced-motion skips the whole
 *  thing (IntroContext). Palette: #090909 base · one 3000K warm · one
 *  electric blue · charcoal/white/beige.
 *
 *  Story:  villa → guest message → AI understands → becomes software →
 *          task already handled → "Luxury. Automated."
 * ------------------------------------------------------------------ */
const SCENE = {
  villa: 0.15, // silhouette eases out of black
  lights: 0.5, // warm interior turns on, bay by bay
  notifyIn: 1.2, // WhatsApp glass card slides in
  notifyOut: 4.4, // …leaves as the dissolve begins
  detect: 2.5, // blue AI line leaves the notification
  flag: 3.2, // master-bedroom window receives the blue frame
  chips: 3.3, // four chips fade in, one after another
  dissolve: 4.5, // architecture begins resolving into the dashboard
  dashboard: 6.5, // dashboard fully sharp; task already exists
  reveal: 8.0, // LUXA end frame fades in
  end: 9.0, // hold 1s, then hand off to the live homepage
  // master-bedroom window position on screen (percent) — the 3D upper-right volume
  window: { x: 65, y: 34 },
};

/* exactly four chips, surfaced relative to the window */
const CHIPS = [
  { label: "AC Issue", dx: 3, dy: -7 },
  { label: "Master Bedroom", dx: 11, dy: -1.5 },
  { label: "Maintenance", dx: 4.5, dy: 5.5 },
  { label: "High Priority", dx: 13, dy: 11 },
];

export function CinematicIntro() {
  const { shouldRun, done, finish } = useIntro();
  const [clock, setClock] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [debug, setDebug] = useState(false);

  // memoize the heavy dashboard so the 60fps clock can't re-render its subtree
  const dashEl = useMemo(() => <ProductDashboard animated intro />, []);

  useEffect(() => {
    try {
      setDebug(new URLSearchParams(window.location.search).get("debug") === "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (shouldRun !== true) return;
    const t = setTimeout(() => setShowSkip(true), 1000);
    return () => clearTimeout(t);
  }, [shouldRun]);

  // master clock — absolute wall-time so the film always lasts exactly SCENE.end
  // seconds and merely drops frames on slow hardware (rather than dragging out).
  useEffect(() => {
    if (shouldRun !== true) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      setClock(Math.min((now - t0) / 1000, SCENE.end));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldRun]);

  useEffect(() => {
    if (shouldRun === true && clock >= SCENE.end) finish();
  }, [clock, shouldRun, finish]);

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

  // ---- villa stage drivers (the story) ----
  const entrance = clamp((clock - SCENE.villa) / 1.0);
  const lights = clamp((clock - SCENE.lights) / 0.9);
  const flag = clamp((clock - SCENE.flag) / 0.5);

  // ---- camera + dissolve (gentle — no excessive blur, no flash) ----
  const drift = clamp((clock - SCENE.villa) / (SCENE.dissolve - SCENE.villa));
  const diss = clamp((clock - SCENE.dissolve) / (SCENE.dashboard - SCENE.dissolve));
  const onReveal = after(SCENE.reveal);

  const stageScale = lerp(1, 1.04, drift) * lerp(1, 1.12, diss);
  const stageBlur = lerp(0, 6, diss);
  const stageOpacity = 1 - clamp((clock - (SCENE.dashboard - 0.5)) / 0.9);
  const rootOpacity = 1 - clamp((clock - (SCENE.end - 0.7)) / 0.7);

  // ---- overlays ----
  const win = SCENE.window;
  const lineD = `M 50 24 Q ${(50 + win.x) / 2} ${(24 + win.y) / 2 - 2} ${win.x} ${win.y}`;
  const lineDraw = clamp((clock - SCENE.detect) / 1.0);
  const showNotify = clock >= SCENE.notifyIn && clock < SCENE.notifyOut;
  const showChips = clock >= SCENE.chips && clock < SCENE.dissolve;
  const showLine = after(SCENE.detect) && clock < SCENE.dissolve;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden" style={{ background: "#090909", opacity: rootOpacity }}>
      {/* ---- background stage: the real 3D villa ---- */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: `${win.x}% ${win.y}%`,
          transform: `scale(${stageScale})`,
          filter: stageBlur > 0.1 ? `blur(${stageBlur}px)` : undefined,
          opacity: stageOpacity,
        }}
      >
        <VillaStage entrance={q(entrance)} lights={q(lights)} flag={q(flag)} cool={q(diss)} />
      </div>

      {/* ---- WhatsApp notification (small, premium glass) ---- */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[18%] w-[262px] max-w-[78%] -translate-x-1/2"
        animate={{ opacity: showNotify ? 1 : 0, y: showNotify ? 0 : -10, scale: showNotify ? 1 : 0.98 }}
        transition={{ duration: 0.9, ease }}
      >
        <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-3 backdrop-blur-2xl shadow-[0_24px_70px_-34px_rgba(0,0,0,0.85)]">
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

      {/* ---- electric-blue AI line (thin, intelligent — not flashy) ---- */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={lineD}
          fill="none"
          stroke="#2E7DFF"
          strokeWidth={1.1}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{
            filter: "drop-shadow(0 0 2px rgba(46,125,255,0.45))",
            strokeDasharray: 1,
            strokeDashoffset: 1 - lineDraw,
            opacity: showLine ? 0.85 : 0,
            transition: "opacity 0.6s ease",
          }}
        />
      </svg>

      {/* ---- four AI entity chips ---- */}
      {CHIPS.map((c, idx) => (
        <motion.span
          key={c.label}
          className="pointer-events-none absolute -translate-x-1/2 rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-xl"
          style={{ left: `${win.x + c.dx}%`, top: `${win.y + c.dy}%` }}
          animate={{ opacity: showChips ? 1 : 0, y: showChips ? 0 : after(SCENE.dissolve) ? -8 : 6, scale: showChips ? 1 : 0.97 }}
          transition={{ duration: 0.8, delay: showChips ? idx * 0.22 : 0, ease }}
        >
          {c.label}
        </motion.span>
      ))}

      {/* ---- dashboard resolves in (architecture → software) ---- */}
      {after(SCENE.dissolve - 0.15) && (
        <div
          className="absolute left-1/2 top-1/2 w-[min(1000px,93vw)] -translate-x-1/2 -translate-y-1/2"
          style={{
            opacity: onReveal ? 0.3 : diss,
            filter: diss < 0.999 && !onReveal ? `blur(${lerp(10, 0, diss)}px)` : onReveal ? "blur(6px)" : undefined,
            transform: `translate(-50%,-50%) scale(${onReveal ? 0.98 : lerp(1.03, 1, diss)})`,
          }}
        >
          <div className="shadow-[var(--shadow-float)]">{dashEl}</div>
        </div>
      )}

      {/* ---- LUXA end frame ---- */}
      {onReveal && (
        <motion.div
          className="absolute inset-0 z-20 grid place-items-center px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease }}
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, delay: 0.15, ease }}
              className="mx-auto w-[clamp(150px,26vw,230px)]"
            >
              <LuxaMark />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease }}
              className="mt-7 text-balance text-[clamp(1.6rem,4.4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-white"
            >
              Luxury. <span className="text-white/55">Automated.</span>
            </motion.h2>
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
          <div className="mt-0.5 text-white/40">villa {SCENE.villa} · lights {SCENE.lights} · notify {SCENE.notifyIn}</div>
          <div className="text-white/40">detect {SCENE.detect} · chips {SCENE.chips} · dissolve {SCENE.dissolve}</div>
          <div className="text-white/40">dash {SCENE.dashboard} · reveal {SCENE.reveal} · end {SCENE.end}</div>
        </div>
      )}
    </div>
  );
}
