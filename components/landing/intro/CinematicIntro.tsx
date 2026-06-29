"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui";
import { useIntro } from "./IntroContext";
import { Villa } from "./Villa";
import { ProductDashboard } from "../ProductDashboard";

const ease = [0.16, 1, 0.3, 1] as const;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t);

/* ------------------------------------------------------------------ *
 *  CINEMATIC HERO — integration for a pre-rendered 8s 4K film.
 *
 *  TO GO LIVE WITH THE REAL FILM:
 *   1. Drop the file at  public/hero/hero.webm  (preferred) and/or
 *      public/hero/hero.mp4  (fallback). Optionally add
 *      public/hero/hero-poster.jpg for the first frame.
 *   2. Tune the beat timestamps in FILM below to match your edit, and
 *      point window.x / window.y at the lit window in your footage.
 *  Until a video exists, the handcrafted villa scene plays as a live
 *  placeholder — every overlay is identical, so nothing else changes.
 *
 *  All overlays are driven by the *video's playback clock* (or a free-running
 *  clock in placeholder mode), so they stay frame-synced to the footage.
 * ------------------------------------------------------------------ */
const FILM = {
  // webm is tried first (smaller), mp4 is the fallback
  webm: "/hero/hero.webm",
  mp4: "/hero/hero.mp4",
  poster: "/hero/hero-poster.jpg",
  // beat times, in seconds of the timeline (video ≈ 0–8s; reveal follows)
  notifyIn: 1.8,
  notifyOut: 6.2,
  detect: 3.9, // electric-blue line draws to the window, window lights
  chips: 4.9, // entity chips surface
  dissolve: 6.4, // glass dissolve: film → dashboard begins
  dashboard: 7.7, // dashboard fully sharp; task + stats run
  reveal: 9.9, // brand reveal over the dimmed dashboard
  end: 12.3, // hand off to the resting product hero
  // the lit window the line/chips point at (percent of the stage)
  window: { x: 58.2, y: 31.4 },
};

/* chips positioned relative to the lit window */
const CHIPS = [
  { label: "AC issue", dx: 4, dy: -8.5 },
  { label: "Master bedroom", dx: 12.5, dy: -3.5 },
  { label: "Maintenance", dx: 5.5, dy: 4.5 },
  { label: "High priority", dx: 15, dy: 9.5 },
  { label: "Villa Ocean", dx: 1.5, dy: 13.5 },
];

export function CinematicIntro() {
  const { shouldRun, done, finish } = useIntro();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resolved, setResolved] = useState<null | "video" | "villa">(null);
  const [clock, setClock] = useState(0);

  // decide video vs. placeholder once, before the timeline starts
  useEffect(() => {
    if (shouldRun !== true) return;
    const v = videoRef.current;
    let settled = false;
    const toVideo = () => {
      if (settled) return;
      settled = true;
      setResolved("video");
      v?.play().catch(() => setResolved("villa"));
    };
    const toVilla = () => {
      if (settled) return;
      settled = true;
      setResolved("villa");
    };
    if (!v) return toVilla();
    if (v.readyState >= 3) toVideo();
    v.addEventListener("canplay", toVideo);
    v.addEventListener("error", toVilla);
    const fallback = setTimeout(() => !settled && toVilla(), 1400);
    return () => {
      v.removeEventListener("canplay", toVideo);
      v.removeEventListener("error", toVilla);
      clearTimeout(fallback);
    };
  }, [shouldRun]);

  // master clock — follows the video while it plays, free-runs otherwise
  useEffect(() => {
    if (shouldRun !== true || resolved === null) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setClock((c) => {
        const v = videoRef.current;
        if (resolved === "video" && v && !v.paused && !v.ended && v.readyState >= 2) return v.currentTime;
        return Math.min(c + dt, FILM.end);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldRun, resolved]);

  useEffect(() => {
    if (shouldRun === true && clock >= FILM.end) finish();
  }, [clock, shouldRun, finish]);

  // lock scroll during the film
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
  const isVilla = resolved !== "video";

  // continuous, clock-derived transforms (frame-synced to the footage)
  const drift = clamp(clock / FILM.dissolve);
  const diss = clamp((clock - FILM.dissolve) / (FILM.dashboard - FILM.dissolve));
  const dash = clamp((clock - FILM.dissolve) / (FILM.dashboard - FILM.dissolve));
  const onReveal = after(FILM.reveal);

  const stageScale = (isVilla ? lerp(1, 1.1, drift) * lerp(1, 2.4, diss) : lerp(1, 1.05, drift) * lerp(1, 1.35, diss));
  const stageBlur = lerp(0, isVilla ? 18 : 14, diss);
  const stageOpacity = 1 - clamp((clock - (FILM.dashboard - 0.4)) / 0.8);
  const rootOpacity = 1 - clamp((clock - (FILM.end - 0.7)) / 0.7);

  const win = FILM.window;
  const lineD = `M 50 25 Q ${(50 + win.x) / 2} ${(25 + win.y) / 2 - 2} ${win.x} ${win.y}`;
  const lineDraw = clamp((clock - FILM.detect) / 0.9);
  const showNotify = clock >= FILM.notifyIn && clock < FILM.notifyOut && !after(FILM.dissolve);
  const showChips = clock >= FILM.chips && !after(FILM.dissolve);

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-black" style={{ opacity: rootOpacity }}>
      {/* ---- background stage: video (or villa placeholder) ---- */}
      <div
        className="absolute inset-0"
        style={{
          transformOrigin: `${win.x}% ${win.y}%`,
          transform: `scale(${stageScale})`,
          filter: `blur(${stageBlur}px)`,
          opacity: stageOpacity,
        }}
      >
        {/* the video always mounts so it can load/error; shown only if usable */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: resolved === "video" ? 1 : 0 }}
          poster={FILM.poster}
          muted
          playsInline
          autoPlay
          preload="auto"
        >
          {/* webm is tried first (smaller); mp4 is the fallback */}
          <source src={FILM.webm} type="video/webm" />
          <source src={FILM.mp4} type="video/mp4" />
        </video>
        {isVilla && <Villa lit={after(FILM.detect)} />}
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
            opacity: after(FILM.detect) && !after(FILM.dissolve) ? 0.9 : 0,
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
          animate={{ opacity: showChips ? 1 : 0, y: showChips ? 0 : after(FILM.dissolve) ? -10 : 8, scale: showChips ? 1 : 0.96 }}
          transition={{ duration: 0.7, delay: showChips ? idx * 0.16 : 0, ease }}
        >
          {c.label}
        </motion.span>
      ))}

      {/* ---- dashboard glass-dissolves in ---- */}
      {after(FILM.dissolve - 0.15) && (
        <div
          className="absolute left-1/2 top-1/2 w-[min(1000px,93vw)] -translate-x-1/2 -translate-y-1/2"
          style={{
            opacity: onReveal ? 0.32 : dash,
            filter: `blur(${onReveal ? 7 : lerp(22, 0, dash)}px)`,
            transform: `translate(-50%,-50%) scale(${onReveal ? 0.97 : lerp(1.05, 1, dash)})`,
          }}
        >
          <div className="shadow-[var(--shadow-float)]">
            <ProductDashboard animated intro />
          </div>
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
              Luxury. Automated.
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
        onClick={() => setClock(FILM.end)}
        className="absolute bottom-6 right-6 z-30 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[12px] text-white/55 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
      >
        Skip
      </button>
    </div>
  );
}
