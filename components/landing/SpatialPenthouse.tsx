"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProductDashboard } from "./ProductDashboard";
import { ParallaxScene, ParallaxLayer } from "./anim/Parallax";
import { ShinyText } from "./anim/ShinyText";

const ease = [0.16, 1, 0.3, 1] as const;

/* faint film grain — sells "lens / passthrough", never visible as noise */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/* ------------------------------------------------------------------ *
 *  SPATIAL PENTHOUSE — Apple Vision Pro language: crisp LUXA glass UI
 *  floating in a soft, depth-blurred Marbella sunset. The environment is
 *  atmospheric (warm 3000K light, sea horizon, infinity-pool reflection,
 *  palm silhouettes) — never a literal modelled room — so the glass panels
 *  stay the hero. Everything drifts with the pointer for a spatial feel.
 * ------------------------------------------------------------------ */
function PenthouseEnv() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* sunset sky: night-blue → violet → rose → warm gold at the horizon */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(178deg,#161020 0%,#241826 22%,#3a2331 42%,#6a3640 58%,#b16149 70%,#e29a5c 80%,#f4c98a 87%)",
        }}
      />
      {/* low sun bloom near the horizon */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "40%",
          height: "55%",
          background:
            "radial-gradient(46% 42% at 44% 86%, rgba(255,206,140,0.85), rgba(255,170,110,0.25) 42%, transparent 72%)",
          filter: "blur(2px)",
        }}
      />
      {/* the sea */}
      <div
        className="absolute inset-x-0"
        style={{
          top: "70%",
          bottom: 0,
          background:
            "linear-gradient(180deg,#e7a866 0%,#9a5f4d 14%,#3c3a4d 40%,#1b2334 72%,#101a2a 100%)",
        }}
      />
      {/* horizon hairline + warm sun reflection column on the water */}
      <div className="absolute inset-x-0" style={{ top: "70%", height: "1.5px", background: "linear-gradient(90deg,transparent,rgba(255,214,150,0.7),transparent)" }} />
      <motion.div
        className="absolute"
        style={{ left: "38%", right: "48%", top: "70%", height: "20%", background: "linear-gradient(180deg,rgba(255,206,140,0.6),transparent)", filter: "blur(6px)" }}
        animate={reduce ? undefined : { opacity: [0.5, 0.8, 0.5], scaleX: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* infinity pool — foreground reflective bands */}
      <div className="absolute inset-x-0 bottom-0" style={{ top: "84%", background: "linear-gradient(180deg,rgba(150,120,110,0.5),rgba(40,40,58,0.2) 30%,rgba(12,16,28,0.9) 100%)", filter: "blur(1px)" }} />
      {[88, 92, 96].map((t, i) => (
        <motion.div
          key={t}
          className="absolute inset-x-[12%]"
          style={{ top: `${t}%`, height: "1px", background: "rgba(255,200,150,0.18)" }}
          animate={reduce ? undefined : { opacity: [0.06, 0.22, 0.06], scaleX: [1, 1.04, 1] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
        />
      ))}

      {/* palm silhouettes — soft, peripheral, out of focus */}
      <Palm className="-left-6 bottom-[6%]" scale={1.5} flip />
      <Palm className="-right-8 bottom-[3%]" scale={1.7} />

      {/* warm interior framing: room light from the top corners, dark soft walls */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 50% at 18% 6%, rgba(255,180,120,0.12), transparent 60%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 44% at 86% 4%, rgba(255,190,130,0.10), transparent 58%)" }} />
      {/* haze + cinematic vignette fading into the page */}
      <div className="absolute inset-x-0" style={{ top: "60%", height: "24%", background: "linear-gradient(180deg,rgba(255,190,130,0.08),transparent)", filter: "blur(10px)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 120% at 50% 42%, transparent 40%, rgba(6,8,14,0.78) 100%)" }} />
      {/* grain */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }} />
    </div>
  );
}

function Palm({ className, scale = 1, flip = false }: { className?: string; scale?: number; flip?: boolean }) {
  return (
    <div className={`absolute ${className}`} style={{ transformOrigin: "bottom center", transform: `${flip ? "scaleX(-1) " : ""}scale(${scale})`, filter: "blur(2.5px)", opacity: 0.92 }}>
      <svg width="150" height="320" viewBox="0 0 180 380" fill="none">
        <path d="M90 380 C87 270 86 200 89 110" stroke="#06080f" strokeWidth="6" strokeLinecap="round" />
        {[-86, -56, -28, 8, 40, 72, 104].map((deg, i) => (
          <path key={i} d="M89 110 C112 80 150 64 180 62 C146 74 118 92 89 110Z" fill="#06080f" transform={`rotate(${deg} 89 110)`} />
        ))}
      </svg>
    </div>
  );
}

/* a small frosted glass panel floating in the periphery (a Vision-Pro window) */
function GlassChip({ className, depth, blur = 0, delay = 0, children }: { className?: string; depth: number; blur?: number; delay?: number; children?: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <ParallaxLayer depth={depth} className={`absolute ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, delay, ease }}
      >
        <motion.div
          animate={reduce ? undefined : { y: [0, -8, 0] }}
          transition={{ duration: 9 + depth * 0.02, repeat: Infinity, ease: "easeInOut", delay }}
          className="glass edge-light rounded-2xl border border-white/[0.1] px-3.5 py-3 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]"
          style={{ filter: blur ? `blur(${blur}px)` : undefined }}
        >
          {children}
        </motion.div>
      </motion.div>
    </ParallaxLayer>
  );
}

export function SpatialPenthouse() {
  const reduce = useReducedMotion();
  return (
    <section id="product" className="relative px-5 py-32 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="text-[11px] font-medium uppercase tracking-[0.2em]">
            <ShinyText>The product</ShinyText>
          </div>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
            Your operation, in the room.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-balance text-[15px] leading-relaxed text-white/40">
            Every request, floating in front of you — understood and resolved.
          </p>
        </motion.div>

        {/* the spatial stage */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.2, ease }}
          className="relative mt-16"
        >
          <ParallaxScene className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[34px] border border-white/[0.08] shadow-[var(--shadow-float)] sm:aspect-[3/2] sm:rounded-[40px]">
              <PenthouseEnv />

              {/* peripheral floating glass windows (out-of-focus depth) */}
              <GlassChip className="left-[3%] top-[16%] hidden lg:block" depth={-10} blur={1.6} delay={0.3}>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> Live
                </div>
                <div className="mt-2 text-[22px] font-semibold leading-none text-white">37<span className="ml-0.5 text-[12px] text-white/45">s avg</span></div>
              </GlassChip>

              <GlassChip className="right-[4%] bottom-[14%] hidden md:block" depth={54} delay={0.5}>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#8fbcff]/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> Assigned
                </div>
                <div className="mt-1.5 text-[12px] font-medium text-white">Carlos · Villa Ocean</div>
              </GlassChip>

              {/* the LUXA dashboard, floating low so the sunset fills the view */}
              <div className="absolute inset-0 flex items-end justify-center px-4 sm:px-10" style={{ perspective: 2000 }}>
                <ParallaxLayer depth={24} className="w-[min(920px,100%)] translate-y-[6%] [transform-style:preserve-3d]">
                  <motion.div
                    animate={reduce ? undefined : { y: [0, -10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="relative origin-center sm:[transform:rotateX(7deg)]"
                  >
                    {/* warm sunset light catching the glass */}
                    <div aria-hidden className="pointer-events-none absolute -inset-px z-[1] rounded-[28px]" style={{ background: "linear-gradient(120deg, rgba(255,180,110,0.10), transparent 38%)" }} />
                    <div className="overflow-hidden rounded-[28px] shadow-[0_70px_150px_-40px_rgba(0,0,0,0.85),0_40px_120px_-60px_rgba(255,150,80,0.28)]">
                      <ProductDashboard animated introDelay={600} />
                    </div>
                  </motion.div>
                </ParallaxLayer>
              </div>
            </div>
          </ParallaxScene>
        </motion.div>
      </div>
    </section>
  );
}
