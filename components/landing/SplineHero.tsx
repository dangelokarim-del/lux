"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { LuxaMark, buttonVariants } from "@/components/ui";
import { Magnetic } from "./anim/Magnetic";
import { ParallaxScene, ParallaxLayer } from "./anim/Parallax";
import { SplineStage } from "./SplineStage";
import { VillaSpace } from "./SpatialExperience";
import { CountUp } from "./anim/CountUp";

const ease = [0.16, 1, 0.3, 1] as const;

function Rise({ children, delay = 0, blur = 7 }: { children: React.ReactNode; delay?: number; blur?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, filter: `blur(${blur}px)` }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/* a compact, recognisable LUXA operations panel — the floating dashboard */
function HeroOpsPanel() {
  return (
    <div className="glass edge-light w-[min(560px,90vw)] overflow-hidden rounded-[22px] border border-white/[0.1] shadow-[0_50px_120px_-40px_rgba(0,0,0,0.85),0_30px_90px_-60px_rgba(46,125,255,0.25)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[22px]" style={{ background: "linear-gradient(155deg,rgba(255,184,128,0.06),transparent 38%)" }} />
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold tracking-[-0.02em] text-white">
          LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF]" />
          <span className="ml-1 text-[10px] font-normal text-white/30">Operations</span>
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-white/55">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> Live
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {[
          { l: "Open", v: 15 },
          { l: "Urgent", v: 3, a: true },
          { l: "Resolved", v: 28 },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-3 py-2">
            <div className="text-[8.5px] uppercase tracking-[0.14em] text-white/35">{s.l}</div>
            <div className={`mt-1 text-[22px] font-semibold leading-none tabular-nums ${s.a ? "text-[#6ba5ff]" : "text-white"}`}>
              <CountUp to={s.v} pad={2} />
            </div>
          </div>
        ))}
      </div>
      <div className="px-3 pb-3">
        <div className="flex items-center justify-between rounded-xl border border-[#2E7DFF]/12 bg-[#2E7DFF]/[0.05] px-3 py-2.5">
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-white">AC — Master Bedroom</div>
            <div className="text-[10.5px] text-white/40">Maintenance · Villa Ocean · Carlos</div>
          </div>
          <span className="shrink-0 rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2 py-0.5 text-[10px] font-medium text-[#8fbcff]">In Progress</span>
        </div>
      </div>
    </div>
  );
}

function FloatChip({ className, depth, delay, children }: { className?: string; depth: number; delay: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <ParallaxLayer depth={depth} className={`pointer-events-none absolute ${className}`}>
      <motion.div initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, delay, ease }}>
        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay }}
          className="glass edge-light rounded-2xl border border-white/[0.1] px-3.5 py-2.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]"
        >
          {children}
        </motion.div>
      </motion.div>
    </ParallaxLayer>
  );
}

/* ------------------------------------------------------------------ *
 *  SPLINE HERO — the first thing users see. Fullscreen (100svh) Spline
 *  villa (lazy, desktop-only; CSS villa fallback everywhere else), with the
 *  LUXA brand text + CTA + a floating dashboard and glass chips layered as
 *  React over the canvas. Slow camera dolly, mouse parallax, persistent text.
 * ------------------------------------------------------------------ */
export function SplineHero() {
  const reduce = useReducedMotion();
  const dolly = useMotionValue(0);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(dolly, 1, { duration: 26, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" });
    return () => controls.stop();
  }, [reduce, dolly]);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#070809]">
      {/* environment — Spline villa when configured, CSS villa otherwise */}
      <SplineStage fallback={<VillaSpace dolly={dolly} />} />

      {/* legibility wash + seamless fade into the page below */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 95% at 50% 30%, transparent 42%, rgba(5,6,10,0.72))" }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(180deg,transparent,#050505)" }} />

      {/* React overlay (parallax tracks the whole hero) */}
      <ParallaxScene className="absolute inset-0 z-10">
        {/* brand text — persistent, never scrolls away */}
        <div className="pointer-events-none absolute inset-x-0 top-[19%] flex flex-col items-center px-5 text-center">
          <ParallaxLayer depth={12} className="flex flex-col items-center">
            <Rise delay={0.35} blur={5}>
              <LuxaMark className="mx-auto w-[min(340px,58vw)]" />
            </Rise>
            <Rise delay={0.55} blur={10}>
              <h1 className="mt-9 text-balance text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
                Luxury. <span className="text-white/55">Automated.</span>
              </h1>
            </Rise>
            <Rise delay={0.75}>
              <p className="mx-auto mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-white/60 sm:text-lg">
                The AI Operating System for Luxury Hospitality.
              </p>
            </Rise>
            <Rise delay={0.95}>
              <div className="pointer-events-auto mt-9">
                <Magnetic className="inline-block" strength={0.3}>
                  <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
                    Book a Demo
                  </Link>
                </Magnetic>
              </div>
            </Rise>
          </ParallaxLayer>
        </div>

        {/* floating LUXA dashboard inside the scene */}
        <ParallaxLayer depth={30} className="pointer-events-none absolute inset-x-0 bottom-[6%] flex justify-center px-5">
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.3, delay: 1.7, ease }}>
            <motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="relative">
              <HeroOpsPanel />
            </motion.div>
          </motion.div>
        </ParallaxLayer>

        {/* glass chips floating at depth */}
        <FloatChip className="left-[6%] top-[34%] hidden lg:block" depth={-12} delay={2.1}>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/55"><span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> Live · avg</div>
          <div className="mt-1.5 text-[18px] font-semibold leading-none text-white">37<span className="ml-0.5 text-[11px] text-white/45">s</span></div>
        </FloatChip>
        <FloatChip className="right-[6%] top-[40%] hidden lg:block" depth={48} delay={2.35}>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#8fbcff]/80"><span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> Assigned</div>
          <div className="mt-1 text-[12px] font-medium text-white">Carlos · Villa Ocean</div>
        </FloatChip>
      </ParallaxScene>

      {/* scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/35"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.8, ease }}
      >
        Scroll
        <motion.span className="h-6 w-px bg-gradient-to-b from-white/40 to-transparent" animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "top" }} />
      </motion.div>
    </section>
  );
}
