"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
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

/* compact WhatsApp notification that rides the guest's phone in the interior clip */
function PhoneMessage() {
  return (
    <div className="w-[230px] sm:w-[260px]">
      <div className="glass edge-light relative rounded-[15px] border border-white/12 bg-[#0b0d12]/70 px-3 py-2.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-[#43d178]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> WhatsApp
          </span>
          <span className="text-[8.5px] text-white/35">now</span>
        </div>
        <p className="mt-1.5 text-[12px] leading-snug text-white/90">Hi, the AC is not working in the master bedroom.</p>
        {/* tail pointing down to the phone */}
        <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[3px] border-b border-r border-white/12 bg-[#0b0d12]/70" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  VIDEO HERO — the first thing visitors see: the €40M Marbella villa at
 *  blue hour (looping two-part film) with the LUXA identity. As you scroll,
 *  the brand dissolves and a WhatsApp request rides the guest's phone — the
 *  guest sending a request. Then the page cuts to the problem statement.
 *  No dashboard here; the story continues in OperationsStory.
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

  // the whole hero gently lifts, blurs + fades at the very end → soft, not a cut,
  // into the problem statement below
  const exitOpacity = useTransform(p, [0.84, 1], [1, 0]);
  const exitBlur = useTransform(p, [0.84, 1], ["blur(0px)", "blur(9px)"]);
  const exitScale = useTransform(p, [0.84, 1], [1, 1.03]);

  // readability wash — strongest while the brand is up
  const readability = useTransform(p, [0, 0.5], [1, 0.82]);

  // WhatsApp message that rides the guest's phone (driven by VideoBackdrop from
  // part 2's playback); revealed once the brand has dissolved.
  const phoneX = useMotionValue(0);
  const phoneY = useMotionValue(0);
  const phoneVis = useMotionValue(0);
  const phoneReveal = useTransform(p, [0.1, 0.2, 0.82, 0.94], [0, 1, 1, 0]);
  const phoneOpacity = useTransform([phoneVis, phoneReveal] as MotionValue<number>[], ([v, r]: number[]) => v * r);

  // a quiet caption while the request is on the phone
  const captionOpacity = useTransform(p, [0.2, 0.3, 0.8, 0.9], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative h-[200vh]">
      <motion.div className="sticky top-0 h-screen overflow-hidden" style={{ opacity: exitOpacity, filter: exitBlur, scale: exitScale }}>
        <VideoBackdrop fallback={<VillaSpace dolly={p} />} phone={{ x: phoneX, y: phoneY, vis: phoneVis }} />

        {/* readability wash + seamless fade into the dark section below */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: readability, background: "radial-gradient(125% 96% at 50% 40%, transparent 30%, rgba(5,6,10,0.62)), linear-gradient(180deg, rgba(5,6,10,0.28), transparent 24%, rgba(5,6,10,0.14) 50%, transparent 66%, rgba(5,6,10,0.55))" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-56" style={{ background: "linear-gradient(180deg,transparent,#050608)" }} />

        {/* WhatsApp message locked to the guest's phone (GPU translate) */}
        <motion.div className="pointer-events-none absolute left-0 top-0 z-30" style={{ x: phoneX, y: phoneY, opacity: phoneOpacity }}>
          <div className="-translate-x-1/2 -translate-y-[132%]">
            <PhoneMessage />
          </div>
        </motion.div>

        {/* quiet caption */}
        <motion.div className="pointer-events-none absolute left-1/2 top-[13%] z-20 -translate-x-1/2 text-[11px] font-medium uppercase tracking-[0.24em] text-white/45" style={{ opacity: captionOpacity }}>
          Incoming request
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
                  <div className="pointer-events-auto mt-12 flex flex-wrap items-center justify-center gap-3.5">
                    <Magnetic className="inline-block" strength={0.3}>
                      <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
                        Book a Demo
                      </Link>
                    </Magnetic>
                    <Magnetic className="inline-block" strength={0.25}>
                      <Link
                        href="/login"
                        className="glass edge-light inline-flex h-12 items-center gap-2 rounded-[var(--radius-control)] border border-white/[0.18] px-6 text-[15px] font-medium text-white/90 transition-colors duration-300 hover:border-white/30 hover:text-white"
                      >
                        <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full border border-white/25">
                          <svg width="8" height="9" viewBox="0 0 8 9" fill="none" className="translate-x-px">
                            <path d="M0 0.5L8 4.5L0 8.5V0.5Z" fill="currentColor" />
                          </svg>
                        </span>
                        Watch Demo
                      </Link>
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
