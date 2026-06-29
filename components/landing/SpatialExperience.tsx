"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { LuxaMark } from "@/components/ui/LuxaMark";
import { LiveNumber } from "./anim/LiveNumber";
import { SplineStage } from "./SplineStage";

const ease = [0.16, 1, 0.3, 1] as const;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

const CHIPS = ["AC Issue", "Master Bedroom", "Maintenance", "High Priority"];

const CAPTIONS = [
  "Villa Ocean · Marbella",
  "Incoming request",
  "LUXA understands",
  "Extracting the details",
  "Task created",
  "Live update",
  "",
];

/* ------------------------------------------------------------------ *
 *  SPATIAL EXPERIENCE — a pinned, scroll-driven cinematic in the Apple
 *  Vision Pro language: crisp LUXA glass panels floating in a dark,
 *  depth-blurred Marbella villa at dusk. Scroll = camera + story clock.
 *  Dark luxury atmosphere, warm *indirect* light — never a glowing house,
 *  never toy 3D. Every panel has a job; every beat explains what LUXA does.
 * ------------------------------------------------------------------ */

/* ---- the villa environment (dark, calm, expensive) ---- */
export function VillaSpace({ dolly }: { dolly: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const scale = useTransform(dolly, [0, 1], [1.04, 1.16]);
  const y = useTransform(dolly, [0, 1], ["0%", "-3%"]);
  return (
    <motion.div aria-hidden className="absolute inset-0 overflow-hidden" style={{ scale, y }}>
      {/* the room */}
      <div className="absolute inset-0 bg-[#070809]" />

      {/* floor-to-ceiling glass view, inset so the dark room frames it */}
      <div className="absolute inset-x-[8%] top-0 bottom-[18%] overflow-hidden">
        {/* dusk sky — deep blue hour to a restrained warm horizon (no orange glare) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(178deg,#0b1124 0%,#141a2d 30%,#23202f 50%,#3a2a31 64%,#6b4338 75%,#9a5e47 84%)",
          }}
        />
        {/* low, soft horizon bloom — muted, indirect */}
        <div
          className="absolute inset-x-0"
          style={{ top: "52%", height: "44%", background: "radial-gradient(44% 40% at 46% 90%, rgba(214,150,104,0.5), rgba(150,96,72,0.16) 46%, transparent 74%)", filter: "blur(3px)" }}
        />
        {/* sea */}
        <div className="absolute inset-x-0" style={{ top: "78%", bottom: 0, background: "linear-gradient(180deg,#7b5142 0%,#34323f 26%,#171f2d 64%,#0e1622 100%)" }} />
        <div className="absolute inset-x-0" style={{ top: "78%", height: "1.5px", background: "linear-gradient(90deg,transparent,rgba(220,170,130,0.55),transparent)" }} />
        {/* warm reflection column on the water */}
        <motion.div
          className="absolute"
          style={{ left: "40%", right: "50%", top: "78%", height: "16%", background: "linear-gradient(180deg,rgba(214,150,104,0.45),transparent)", filter: "blur(7px)" }}
          animate={reduce ? undefined : { opacity: [0.4, 0.7, 0.4], scaleX: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* palms — soft, peripheral, out of focus */}
        <Palm className="-left-4 bottom-[2%]" scale={1.45} flip />
        <Palm className="-right-6 bottom-[-1%]" scale={1.65} />
        {/* glass mullions */}
        {[34, 66].map((x) => (
          <div key={x} className="absolute top-0 bottom-0 w-px" style={{ left: `${x}%`, background: "linear-gradient(180deg,rgba(255,255,255,0.07),transparent)" }} />
        ))}
        {/* faint interior reflection on the glass */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 22%, transparent 78%, rgba(255,255,255,0.03) 100%)" }} />
      </div>

      {/* infinity pool deck in the interior foreground */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: "22%", background: "linear-gradient(180deg,rgba(40,34,30,0.0),#070809 70%)" }} />
      {[86, 90, 94].map((t, i) => (
        <motion.div
          key={t}
          className="absolute inset-x-[16%]"
          style={{ top: `${t}%`, height: "1px", background: "rgba(210,170,140,0.12)" }}
          animate={reduce ? undefined : { opacity: [0.04, 0.16, 0.04] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        />
      ))}

      {/* warm indirect cove light washing the interior — subtle, never a hot window */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 40% at 12% 4%, rgba(255,184,128,0.10), transparent 56%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(64% 36% at 90% 100%, rgba(255,176,120,0.07), transparent 58%)" }} />
      {/* ceiling shadow + cinematic vignette */}
      <div className="absolute inset-x-0 top-0 h-[16%]" style={{ background: "linear-gradient(180deg,#05060a,transparent)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(118% 118% at 50% 44%, transparent 42%, rgba(4,5,9,0.82) 100%)" }} />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }} />
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

/* a glass surface, warm rim-light on the top edge (indirect light catching it) */
function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`glass edge-light relative rounded-[20px] border border-white/[0.1] shadow-[0_40px_90px_-36px_rgba(0,0,0,0.85)] ${className ?? ""}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[20px]" style={{ background: "linear-gradient(160deg, rgba(255,186,130,0.07), transparent 40%)" }} />
      {children}
    </div>
  );
}

export function SpatialExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const b = v < 0.12 ? 0 : v < 0.26 ? 1 : v < 0.4 ? 2 : v < 0.54 ? 3 : v < 0.68 ? 4 : v < 0.86 ? 5 : 6;
    setBeat(b);
  });

  // camera + parallax drift
  const driftFar = useTransform(scrollYProgress, [0, 1], ["0px", "-26px"]);
  const driftNear = useTransform(scrollYProgress, [0, 1], ["0px", "44px"]);

  const at = (a: number, b = 99) => beat >= a && beat <= b;
  const requestShow = at(1, 3);
  const chipsShow = at(2, 3);
  const taskShow = at(4, 5);
  const statsShow = at(5, 5);
  const updated = beat >= 5;
  const inProgress = beat >= 5;
  const brand = beat >= 6;

  return (
    <section ref={ref} id="product" className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* environment — Spline villa when configured, handcrafted CSS villa otherwise */}
        <SplineStage fallback={<VillaSpace dolly={scrollYProgress} />} />

        {/* dim the scene as the brand resolves */}
        <motion.div aria-hidden className="absolute inset-0 bg-[#05060a]" animate={{ opacity: brand ? 0.55 : 0 }} transition={{ duration: 1, ease }} />

        {/* ---- floating panels (full-stage layer so % positions resolve) ---- */}
        <div className="absolute inset-0">
          {/* beat caption */}
          <div className="absolute left-1/2 top-[12%] -translate-x-1/2 text-center">
            <motion.div
              key={beat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: brand ? 0 : 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/45"
            >
              {CAPTIONS[beat]}
            </motion.div>
          </div>

          {/* electric-blue AI path tracing from the request to the master-bedroom window */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M 50 45 C 55 39, 60 33, 63 28"
              fill="none"
              stroke="#2E7DFF"
              strokeWidth={0.4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              style={{ filter: "drop-shadow(0 0 2px rgba(46,125,255,0.5))", strokeDasharray: 1 }}
              animate={{ strokeDashoffset: beat >= 2 ? 0 : 1, opacity: beat === 2 || beat === 3 ? 0.85 : 0 }}
              transition={{ strokeDashoffset: { duration: 1, ease }, opacity: { duration: 0.6 } }}
            />
          </svg>
          {/* the located room marker */}
          <motion.div
            className="pointer-events-none absolute"
            style={{ left: "63%", top: "28%" }}
            animate={{ opacity: beat === 2 || beat === 3 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="relative block h-2 w-2 -translate-x-1/2 -translate-y-1/2">
              {!reduce && (
                <motion.span className="absolute inset-0 rounded-full bg-[#2E7DFF]" animate={{ scale: [1, 2.8], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
              )}
              <span className="absolute inset-0 rounded-full bg-[#2E7DFF] shadow-[0_0_10px_2px_rgba(46,125,255,0.55)]" />
            </span>
            <span className="absolute left-3 top-0 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-2 py-0.5 text-[9px] font-medium text-[#8fbcff] backdrop-blur-sm">
              Master Bedroom
            </span>
          </motion.div>

          {/* request → task occupy the same spatial slot (the request becomes the task) */}
          <motion.div className="absolute left-1/2 top-1/2 w-[320px] max-w-[84%] -translate-x-1/2 -translate-y-1/2" style={{ y: driftNear }}>
            {/* request (WhatsApp) */}
            <motion.div
              animate={{ opacity: requestShow ? 1 : 0, y: requestShow ? 0 : beat > 3 ? -22 : 20, scale: requestShow ? 1 : 0.95, filter: requestShow ? "blur(0px)" : "blur(6px)" }}
              transition={{ duration: 1, ease }}
              className="pointer-events-none"
            >
              <Panel className="p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/45">
                    <span className="h-1 w-1 rounded-full bg-white/55" /> WhatsApp
                  </span>
                  <span className="text-[9px] text-white/30">Villa Ocean · now</span>
                </div>
                <p className="mt-2.5 text-[13.5px] leading-snug text-white/90">Hi, the AC is not working in the master bedroom.</p>
                {/* analyzing scan */}
                <motion.div
                  className="mt-3 h-px w-full overflow-hidden rounded-full bg-white/[0.06]"
                  animate={{ opacity: beat === 2 ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#2E7DFF] to-transparent"
                    animate={beat === 2 && !reduce ? { x: ["-120%", "320%"] } : { x: "-120%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </Panel>
            </motion.div>

            {/* extracted chips float just beneath the request */}
            <div className="absolute left-1/2 top-full mt-4 flex w-full -translate-x-1/2 flex-wrap justify-center gap-2">
              {CHIPS.map((c, i) => (
                <motion.span
                  key={c}
                  animate={{ opacity: chipsShow ? 1 : 0, y: chipsShow ? 0 : beat >= 4 ? -16 : 10, scale: chipsShow ? 1 : 0.92 }}
                  transition={{ duration: 0.7, delay: chipsShow ? i * 0.12 : 0, ease }}
                  className="glass rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/85"
                >
                  <span className="mr-1 inline-block h-[3px] w-[3px] -translate-y-px rounded-full bg-[#2E7DFF]/80" />
                  {c}
                </motion.span>
              ))}
            </div>

            {/* the task the request became */}
            <motion.div
              className="absolute inset-x-0 top-0"
              animate={{ opacity: taskShow ? 1 : 0, y: taskShow ? 0 : 24, scale: taskShow ? 1 : 0.96, filter: taskShow ? "blur(0px)" : "blur(6px)" }}
              transition={{ duration: 1, ease }}
            >
              <Panel className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/40">Maintenance · Villa Ocean</span>
                  <StatusTag inProgress={inProgress} />
                </div>
                <p className="mt-2 text-[14px] font-medium text-white">AC — Master Bedroom</p>
                <div className="mt-3 flex items-center gap-2 border-t border-white/[0.07] pt-3 text-[11px] text-white/45">
                  <motion.span className="flex items-center gap-1.5" animate={{ opacity: inProgress ? 1 : 0.25 }} transition={{ duration: 0.6 }}>
                    <span className="grid h-4 w-4 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-[7px] text-white/70">CN</span>
                    Assigned · Carlos
                  </motion.span>
                </div>
              </Panel>
            </motion.div>
          </motion.div>

          {/* live dashboard stats — float to the side at a deeper layer */}
          <motion.div
            className="absolute right-[2%] top-[24%] hidden w-[230px] md:block"
            style={{ y: driftFar }}
            animate={{ opacity: statsShow ? 1 : 0, x: statsShow ? 0 : 30, filter: statsShow ? "blur(0px)" : "blur(8px)" }}
            transition={{ duration: 1.1, ease }}
          >
            <Panel className="p-4">
              <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-[#8fbcff]/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> Live · Operations
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Stat label="Open requests" value={updated ? 15 : 14} />
                <Stat label="Urgent" value={updated ? 3 : 2} accent />
              </div>
            </Panel>
          </motion.div>

          {/* brand end frame */}
          <motion.div
            className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center"
            animate={{ opacity: brand ? 1 : 0, y: brand ? 0 : 18 }}
            transition={{ duration: 1.1, ease }}
          >
            <div className="mx-auto w-[clamp(150px,24vw,220px)]">
              <LuxaMark />
            </div>
            <div className="mt-7 text-[clamp(1.5rem,4vw,2.6rem)] font-semibold tracking-[-0.035em] text-white">
              Luxury. <span className="text-white/55">Automated.</span>
            </div>
          </motion.div>
        </div>

        {/* scroll hint */}
        <motion.div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-white/30"
          animate={{ opacity: beat === 0 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        >
          Scroll
        </motion.div>
      </div>
    </section>
  );
}

function StatusTag({ inProgress }: { inProgress: boolean }) {
  return (
    <motion.span
      key={inProgress ? "ip" : "new"}
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none ${inProgress ? "border-[#2E7DFF]/25 bg-[#2E7DFF]/12 text-[#8fbcff]" : "border-white/[0.12] bg-white/[0.05] text-white/55"}`}
    >
      {inProgress ? "In Progress" : "New"}
    </motion.span>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <div className="text-[8.5px] uppercase tracking-[0.14em] text-white/35">{label}</div>
      <div className={`mt-1 text-[26px] font-semibold leading-none tabular-nums ${accent ? "text-[#6ba5ff]" : "text-white"}`}>
        <LiveNumber value={value} pad={2} />
      </div>
    </div>
  );
}
