"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { LuxaMark } from "@/components/ui/LuxaMark";
import { buttonVariants } from "@/components/ui";
import { Magnetic } from "./anim/Magnetic";
import { ParallaxScene, ParallaxLayer } from "./anim/Parallax";
import { VideoBackdrop } from "./VideoBackdrop";

// keynote motion language — smooth ease-in-out cubic, everything breathes
const ease = [0.62, 0.04, 0.2, 1] as const;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/* mount-entrance for the opening brand identity (independent of scroll) */
function Rise({ children, delay = 0, blur = 7 }: { children: React.ReactNode; delay?: number; blur?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22, filter: `blur(${blur}px)` }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.5, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function Palm({ className, scale = 1, flip = false }: { className?: string; scale?: number; flip?: boolean }) {
  return (
    <div className={`absolute ${className}`} style={{ transformOrigin: "bottom center", transform: `${flip ? "scaleX(-1) " : ""}scale(${scale})`, filter: "blur(2.5px)", opacity: 0.9 }}>
      <svg width="150" height="320" viewBox="0 0 180 380" fill="none">
        <path d="M90 380 C87 270 86 200 89 110" stroke="#05070d" strokeWidth="6" strokeLinecap="round" />
        {[-86, -56, -28, 8, 40, 72, 104].map((deg, i) => (
          <path key={i} d="M89 110 C112 80 150 64 180 62 C146 74 118 92 89 110Z" fill="#05070d" transform={`rotate(${deg} 89 110)`} />
        ))}
      </svg>
    </div>
  );
}

/* handcrafted CSS villa at blue hour — the fallback under the hero video */
export function VillaSpace({ dolly }: { dolly: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const scale = useTransform(dolly, [0, 1], [1.04, 1.16]);
  const y = useTransform(dolly, [0, 1], ["0%", "-3%"]);
  return (
    <motion.div aria-hidden className="absolute inset-0 overflow-hidden" style={{ scale, y }}>
      <div className="absolute inset-0 bg-[#070809]" />
      <div className="absolute inset-x-[8%] top-0 bottom-[18%] overflow-hidden">
        {/* deep blue-hour sky */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(178deg,#060a16 0%,#0a1224 30%,#0e1830 50%,#152038 64%,#1d2b46 76%,#2a3a58 86%)" }} />
        {/* subtle moonlight high in the sky */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(40% 26% at 72% 8%, rgba(150,180,230,0.12), transparent 62%)" }} />
        {/* darker ocean + cool horizon glow, with a thin warm residual of the set sun */}
        <div className="absolute inset-x-0" style={{ top: "52%", height: "44%", background: "radial-gradient(46% 40% at 46% 90%, rgba(110,145,205,0.22), rgba(60,90,150,0.10) 46%, transparent 74%)", filter: "blur(3px)" }} />
        <div className="absolute inset-x-0" style={{ top: "70%", height: "12%", background: "radial-gradient(34% 60% at 47% 100%, rgba(208,150,110,0.16), transparent 72%)", filter: "blur(4px)" }} />
        <div className="absolute inset-x-0" style={{ top: "78%", bottom: 0, background: "linear-gradient(180deg,#16223c 0%,#101a30 26%,#0b1322 64%,#070c16 100%)" }} />
        <div className="absolute inset-x-0" style={{ top: "78%", height: "1.5px", background: "linear-gradient(90deg,transparent,rgba(150,185,230,0.45),transparent)" }} />
        <motion.div className="absolute" style={{ left: "40%", right: "50%", top: "78%", height: "16%", background: "linear-gradient(180deg,rgba(120,155,210,0.32),transparent)", filter: "blur(7px)" }} animate={reduce ? undefined : { opacity: [0.35, 0.6, 0.35], scaleX: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <Palm className="-left-4 bottom-[2%]" scale={1.45} flip />
        <Palm className="-right-6 bottom-[-1%]" scale={1.65} />
        {[34, 66].map((x) => (
          <div key={x} className="absolute top-0 bottom-0 w-px" style={{ left: `${x}%`, background: "linear-gradient(180deg,rgba(180,205,240,0.06),transparent)" }} />
        ))}
        {/* warm interior light spilling from the villa centre, through the glass */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(26% 22% at 50% 62%, rgba(255,190,135,0.12), transparent 72%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(180,205,240,0.045) 0%, transparent 22%, transparent 78%, rgba(180,205,240,0.03) 100%)" }} />
      </div>
      <div className="absolute inset-x-0 bottom-0" style={{ height: "22%", background: "linear-gradient(180deg,rgba(20,28,44,0.0),#070809 70%)" }} />
      {[86, 90, 94].map((t, i) => (
        <motion.div key={t} className="absolute inset-x-[16%]" style={{ top: `${t}%`, height: "1px", background: "rgba(150,180,220,0.10)" }} animate={reduce ? undefined : { opacity: [0.04, 0.14, 0.04] }} transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }} />
      ))}
      <div className="absolute inset-0" style={{ background: "radial-gradient(58% 38% at 16% 6%, rgba(150,180,225,0.06), transparent 56%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 36% at 88% 100%, rgba(255,184,128,0.06), transparent 58%)" }} />
      <div className="absolute inset-x-0 top-0 h-[16%]" style={{ background: "linear-gradient(180deg,#05060a,transparent)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(118% 118% at 50% 44%, transparent 42%, rgba(4,5,9,0.82) 100%)" }} />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  VIDEO HERO — the first thing visitors see: the €40M Marbella villa at
 *  blue hour (looping two-part film) with the LUXA identity. As you scroll,
 *  the brand dissolves and the blue-hour film slowly darkens into the dark
 *  site background, so the problem statement below emerges from the same
 *  atmosphere — never a hard cut. The video tells the villa/guest story.
 * ------------------------------------------------------------------ */
export function VideoHero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // brand identity — present at rest, dissolves slowly as you begin to scroll
  const introOpacity = useTransform(p, [0, 0.22], [1, 0]);
  const introBlur = useTransform(p, [0, 0.2], ["blur(0px)", "blur(12px)"]);
  const introY = useTransform(p, [0, 0.24], ["0px", "-54px"]);
  const introScale = useTransform(p, [0, 0.24], [1, 0.98]);

  // readability wash — strongest while the brand is up
  const readability = useTransform(p, [0, 0.5], [1, 0.82]);

  // the blue-hour film darkens fully into the dark site background as you scroll
  // — a dark gradient grows from the bottom so the problem headline emerges
  // *from* the film, in the same screen (no separate page). It reaches full dark
  // well before the hero ends, so when the whole (now-dark) hero scrolls away it
  // simply blends into the operations story below — one continuous surface.
  const darken = useTransform(p, [0.26, 0.6], [0, 1]);

  // the problem statement rises out of the darkening film and HOLDS at full
  // opacity — it is never faded out here; it scrolls away with the hero into the
  // next beat, so there is never an empty band between the two.
  const problemOpacity = useTransform(p, [0.3, 0.52], [0, 1]);
  const problemY = useTransform(p, [0.3, 0.52], ["48px", "0px"]);
  const problemBlur = useTransform(p, [0.3, 0.52], ["blur(16px)", "blur(0px)"]);

  return (
    <section ref={ref} className="relative h-[200vh]">
      {/* SSR, inline-styled villa layer: paints the poster on the very first
          frame — before the CSS bundle or any JS — so the hero is never black or
          empty. The video backdrop below fades over it (identical poster) once
          ready. Scoped to the first viewport so it never leaks into lower sections. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          zIndex: 0,
          backgroundColor: "#05070c",
          backgroundImage: "url(/hero/villa-poster.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <motion.div className="sticky top-0 h-screen overflow-hidden">
        <VideoBackdrop fallback={<VillaSpace dolly={p} />} />

        {/* readability wash */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: readability, background: "radial-gradient(125% 96% at 50% 40%, transparent 26%, rgba(5,6,10,0.74)), linear-gradient(180deg, rgba(5,6,10,0.4), transparent 24%, rgba(5,6,10,0.2) 50%, transparent 64%, rgba(5,6,10,0.62))" }} />

        {/* the film darkens into the dark background — grows from the bottom up */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: darken, background: "linear-gradient(180deg, transparent 8%, rgba(4,6,11,0.5) 46%, rgba(3,6,10,0.94) 80%, #03060a 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-64" style={{ background: "linear-gradient(180deg,transparent,#03060a)" }} />

        {/* THE PROBLEM — emerges from the darkening film in the same screen, so the
            hero and the statement are one continuous beat, never separate pages */}
        <motion.div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5" style={{ opacity: problemOpacity, y: problemY, filter: problemBlur }}>
          <h2 className="max-w-6xl text-balance text-center font-semibold leading-[0.94] tracking-[-0.05em] text-white text-[clamp(2.9rem,9.8vw,7.4rem)] [text-shadow:0_2px_60px_rgba(0,0,0,0.72)]">
            Luxury hospitality
            <br />
            still runs on <span className="text-white/35">WhatsApp.</span>
          </h2>
          <p className="mt-8 max-w-xl text-balance text-center text-[17px] leading-relaxed text-white/75 sm:text-[19px] [text-shadow:0_1px_24px_rgba(0,0,0,0.6)]">
            LUXA transforms every guest message into an automated operation.
          </p>
        </motion.div>

        {/* brand identity — fades as you scroll */}
        <motion.div className="absolute inset-0 z-20" style={{ opacity: introOpacity, filter: introBlur, y: introY, scale: introScale, pointerEvents: "auto" }}>
          <ParallaxScene className="absolute inset-0">
            <div className="pointer-events-none absolute inset-x-0 top-[21%] flex flex-col items-center px-5 text-center">
              <ParallaxLayer depth={14} className="flex flex-col items-center">
                {/* the logo reveals first and holds alone for ~2s — readable
                    silver chrome, always lifted off the video by a soft blurred
                    backdrop + glow so it never gets lost in a bright frame */}
                <Rise delay={0.6} blur={5}>
                  <div className="relative">
                    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(6,8,14,0.55), transparent 72%)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }} />
                    <div style={{ filter: "drop-shadow(0 2px 22px rgba(0,0,0,0.55)) drop-shadow(0 0 1px rgba(190,205,230,0.5))" }}>
                      <LuxaMark className="mx-auto w-[min(248px,50vw)]" />
                    </div>
                  </div>
                </Rise>
                {/* headline + subtitle share a near-invisible localized scrim, so
                    they stay perfectly legible over every frame without the eye
                    ever registering a gradient */}
                <div className="relative mt-14 flex flex-col items-center">
                  <span aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] -z-10 h-[300%] w-[164%] -translate-x-1/2 -translate-y-1/2" style={{ background: "radial-gradient(closest-side, rgba(4,5,9,0.38), rgba(4,5,9,0.13) 50%, transparent 76%)", filter: "blur(34px)" }} />
                  <Rise delay={2.35} blur={12}>
                    <h1 className="text-balance text-[clamp(2.9rem,7.6vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.6)]">
                      Luxury. <span className="text-white/65">Automated.</span>
                    </h1>
                  </Rise>
                  <Rise delay={2.65}>
                    <p className="mx-auto mt-8 max-w-xl text-balance text-[17px] leading-relaxed text-white/75 sm:text-[19px] [text-shadow:0_1px_20px_rgba(0,0,0,0.55)]">
                    The AI Operating System for Luxury Hospitality.
                  </p>
                  </Rise>
                </div>
                <Rise delay={2.95}>
                  <div className="pointer-events-auto mt-12 flex items-center justify-center">
                    <Magnetic className="inline-block" strength={0.3}>
                      <span className="relative inline-block">
                        {/* a slow breathing glow — calm, never flashy */}
                        {!reduce && (
                          <motion.span
                            aria-hidden
                            className="pointer-events-none absolute -inset-3 -z-10 rounded-full"
                            style={{ background: "radial-gradient(closest-side, rgba(46,125,255,0.5), transparent 72%)" }}
                            animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.96, 1.04, 0.96] }}
                            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                        <Link href="/login" className={`${buttonVariants({ variant: "accent", size: "lg" })} transition-transform duration-300 hover:-translate-y-0.5`}>
                          Book a Demo
                        </Link>
                      </span>
                    </Magnetic>
                  </div>
                </Rise>
              </ParallaxLayer>
            </div>
          </ParallaxScene>
        </motion.div>

        {/* scroll cue — appears last, completing the reveal; fades as you scroll */}
        <motion.div className="absolute bottom-9 left-1/2 z-20 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 3.4, ease }}>
          <motion.div className="flex flex-col items-center gap-2.5 text-[10px] uppercase tracking-[0.24em] text-white/30" style={{ opacity: introOpacity }}>
            Scroll
            <motion.span className="h-7 w-px bg-gradient-to-b from-white/40 to-transparent" animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "top" }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
