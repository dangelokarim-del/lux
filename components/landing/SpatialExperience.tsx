"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { LuxaMark } from "@/components/ui/LuxaMark";
import { buttonVariants } from "@/components/ui";
import { LiveNumber } from "./anim/LiveNumber";
import { Magnetic } from "./anim/Magnetic";
import { ParallaxScene, ParallaxLayer } from "./anim/Parallax";
import { VideoBackdrop } from "./VideoBackdrop";

const ease = [0.16, 1, 0.3, 1] as const;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

const CHIPS = ["AC Issue", "Master Bedroom", "Maintenance", "High Priority"];

const CAPTIONS = [
  "Villa Ocean · Marbella",
  "Incoming request",
  "The building wakes",
  "Extracting the details",
  "The villa becomes the system",
  "Live operations",
  "",
];

/* mount-entrance for the opening brand identity (independent of scroll) */
function Rise({ children, delay = 0, blur = 7 }: { children: React.ReactNode; delay?: number; blur?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, filter: `blur(${blur}px)` }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 *  SPATIAL EXPERIENCE — this IS the homepage. The page opens INSIDE a
 *  silent Marbella villa at dusk, the LUXA identity living in the room.
 *  As you scroll it becomes one continuous Apple-keynote sequence with no
 *  cuts: the brand dissolves, a WhatsApp request arrives, an electric-blue
 *  AI signal enters and travels, waking each room in turn; the architecture
 *  transforms — concrete to aluminium, walls to frosted panels, structural
 *  lines to dashboard frames — and the LUXA operating system materialises
 *  exactly where the rooms were. Then it stays alive. The building is
 *  running LUXA. Frosted glass + brushed aluminium + soft white light;
 *  electric blue is AI intelligence only. No neon, no particles, no clichés.
 * ------------------------------------------------------------------ */

export function VillaSpace({ dolly }: { dolly: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const scale = useTransform(dolly, [0, 1], [1.04, 1.16]);
  const y = useTransform(dolly, [0, 1], ["0%", "-3%"]);
  return (
    <motion.div aria-hidden className="absolute inset-0 overflow-hidden" style={{ scale, y }}>
      <div className="absolute inset-0 bg-[#070809]" />
      <div className="absolute inset-x-[8%] top-0 bottom-[18%] overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(178deg,#0b1124 0%,#141a2d 30%,#23202f 50%,#3a2a31 64%,#6b4338 75%,#9a5e47 84%)" }} />
        <div className="absolute inset-x-0" style={{ top: "52%", height: "44%", background: "radial-gradient(44% 40% at 46% 90%, rgba(214,150,104,0.5), rgba(150,96,72,0.16) 46%, transparent 74%)", filter: "blur(3px)" }} />
        <div className="absolute inset-x-0" style={{ top: "78%", bottom: 0, background: "linear-gradient(180deg,#7b5142 0%,#34323f 26%,#171f2d 64%,#0e1622 100%)" }} />
        <div className="absolute inset-x-0" style={{ top: "78%", height: "1.5px", background: "linear-gradient(90deg,transparent,rgba(220,170,130,0.55),transparent)" }} />
        <motion.div className="absolute" style={{ left: "40%", right: "50%", top: "78%", height: "16%", background: "linear-gradient(180deg,rgba(214,150,104,0.45),transparent)", filter: "blur(7px)" }} animate={reduce ? undefined : { opacity: [0.4, 0.7, 0.4], scaleX: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <Palm className="-left-4 bottom-[2%]" scale={1.45} flip />
        <Palm className="-right-6 bottom-[-1%]" scale={1.65} />
        {[34, 66].map((x) => (
          <div key={x} className="absolute top-0 bottom-0 w-px" style={{ left: `${x}%`, background: "linear-gradient(180deg,rgba(255,255,255,0.07),transparent)" }} />
        ))}
        <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.05) 0%, transparent 22%, transparent 78%, rgba(255,255,255,0.03) 100%)" }} />
      </div>
      <div className="absolute inset-x-0 bottom-0" style={{ height: "22%", background: "linear-gradient(180deg,rgba(40,34,30,0.0),#070809 70%)" }} />
      {[86, 90, 94].map((t, i) => (
        <motion.div key={t} className="absolute inset-x-[16%]" style={{ top: `${t}%`, height: "1px", background: "rgba(210,170,140,0.12)" }} animate={reduce ? undefined : { opacity: [0.04, 0.16, 0.04] }} transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }} />
      ))}
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 40% at 12% 4%, rgba(255,184,128,0.10), transparent 56%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(64% 36% at 90% 100%, rgba(255,176,120,0.07), transparent 58%)" }} />
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

// (the standalone glass Panel used by the old static request card is no longer
//  needed — the WhatsApp request now rides the phone via PhoneMessage)

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
const ALU_FRAME = "inset 0 0 0 1px rgba(208,222,244,0.5), inset 0 1px 0 rgba(255,255,255,0.38)";

/* a villa room that wakes (warm light) then becomes a dashboard panel in place */
function Cell({ index, wake, base, cool, assemble, label, value, accent, live }: {
  index: number;
  wake: MotionValue<number>;
  base: number;
  cool: MotionValue<number>;
  assemble: MotionValue<number>;
  label: string;
  value: number;
  accent?: boolean;
  live?: boolean;
}) {
  // the AI signal wakes this room as it passes; `base` is the one already-lit room
  const woken = useTransform(wake, [index * 0.24, index * 0.24 + 0.32], [0, 1]);
  const warmShown = useTransform([woken, cool] as MotionValue<number>[], ([w, c]: number[]) => Math.max(base, w) * (1 - c));
  return (
    <div className="relative h-[74px]">
      <div className="absolute inset-0 rounded-xl bg-[#0a0c12]" />
      <motion.div className="absolute inset-0 rounded-xl" style={{ opacity: warmShown, background: "linear-gradient(180deg,rgba(255,200,146,0.5),rgba(226,150,98,0.72))" }} />
      <motion.div className="absolute inset-0 rounded-xl" style={{ opacity: cool, boxShadow: ALU_FRAME, filter: "drop-shadow(0 0 2px rgba(180,205,255,0.25))" }} />
      <motion.div className="absolute inset-0 rounded-xl glass" style={{ opacity: assemble }} />
      <motion.div className="absolute inset-0 px-3.5 py-2.5" style={{ opacity: assemble }}>
        <div className="text-[9px] uppercase tracking-[0.14em] text-white/40">{label}</div>
        <div className={`mt-1.5 text-[24px] font-semibold leading-none tabular-nums ${accent ? "text-[#6ba5ff]" : "text-white"}`}>
          {live ? <LiveNumber value={value} pad={2} /> : String(value).padStart(2, "0")}
        </div>
      </motion.div>
    </div>
  );
}

/* the operating system the villa becomes — frames first, then frosted panels,
   then genuinely alive (breathing, a request arriving, numbers moving) */
function ArchitectureOS({ wake, cool, assemble, alive }: { wake: MotionValue<number>; cool: MotionValue<number>; assemble: MotionValue<number>; alive: boolean }) {
  const reduce = useReducedMotion();
  const [pulse, setPulse] = useState(0);
  const [notif, setNotif] = useState(false);

  useEffect(() => {
    if (!alive || reduce) return;
    const id = setInterval(() => setPulse((v) => v + 1), 4200);
    return () => clearInterval(id);
  }, [alive, reduce]);
  useEffect(() => {
    if (!alive || reduce || pulse === 0 || pulse % 2 === 0) return;
    setNotif(true);
    const t = setTimeout(() => setNotif(false), 3200);
    return () => clearTimeout(t);
  }, [pulse, alive, reduce]);

  const open = notif ? 16 : 15;
  const resolved = 28 + (alive ? Math.min(pulse, 9) : 0);
  const cells: { l: string; v: number; a?: boolean; live?: boolean }[] = [
    { l: "Open requests", v: open, live: true },
    { l: "Urgent", v: 3, a: true },
    { l: "Resolved", v: resolved, live: true },
    { l: "Arrivals", v: 6 },
  ];
  const base = [0.34, 0, 0, 0]; // only the first room is lit at the start

  const signalX = useTransform(wake, [0, 1], ["3%", "97%"]);
  const signalOpacity = useTransform(wake, [0, 0.06, 0.92, 1], [0, 1, 1, 0]);

  return (
    <div className="absolute left-1/2 top-1/2 w-[min(900px,94%)] -translate-x-1/2 -translate-y-1/2">
      <motion.div animate={alive && !reduce ? { scale: [1, 1.005, 1] } : { scale: 1 }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }} className="relative">
        {/* soft white key light */}
        <motion.div aria-hidden className="absolute -inset-10 -z-10" style={{ opacity: assemble, background: "radial-gradient(55% 55% at 50% 26%, rgba(216,230,255,0.12), transparent 72%)", filter: "blur(26px)" }} />
        {/* container: luminous frame → frosted fill */}
        <motion.div aria-hidden className="absolute inset-0 rounded-[24px]" style={{ opacity: cool, boxShadow: "inset 0 0 0 1px rgba(208,222,244,0.45)", filter: "drop-shadow(0 0 3px rgba(180,205,255,0.18))" }} />
        <motion.div aria-hidden className="absolute inset-0 rounded-[24px] glass" style={{ opacity: assemble, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.24), 0 60px 130px -44px rgba(0,0,0,0.85)" }} />

        <div className="relative px-5 py-4">
          {/* header */}
          <motion.div className="mb-3 flex items-center justify-between" style={{ opacity: assemble }}>
            <span className="flex items-center gap-1 text-[13px] font-semibold tracking-[-0.02em] text-white">
              LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF]" />
              <span className="ml-2 text-[11px] font-normal text-white/35">Operations</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/60">
              <span className="relative flex h-1.5 w-1.5">
                {alive && !reduce && <motion.span className="absolute inset-0 rounded-full bg-[#2E7DFF]" animate={{ scale: [1, 2.6], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />}
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" />
              </span>
              Live
            </span>
          </motion.div>

          {/* stat row — the rooms wake, then become panels; AI signal sweeps across */}
          <div className="relative">
            <div className="grid grid-cols-4 gap-3">
              {cells.map((c, i) => (
                <Cell key={c.l} index={i} wake={wake} base={base[i]} cool={cool} assemble={assemble} label={c.l} value={c.v} accent={c.a} live={c.live && alive} />
              ))}
            </div>
            {/* travelling AI signal */}
            <motion.div className="pointer-events-none absolute top-0 bottom-0 w-8 -translate-x-1/2" style={{ left: signalX, opacity: signalOpacity }}>
              <div className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2" style={{ background: "linear-gradient(180deg,transparent,#2E7DFF,transparent)" }} />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2E7DFF] blur-[3px]" />
            </motion.div>
            <motion.div className="pointer-events-none absolute -bottom-1.5 left-0 h-px" style={{ width: signalX, opacity: signalOpacity, background: "linear-gradient(90deg,transparent,rgba(46,125,255,0.5))" }} />
          </div>

          {/* operations */}
          <div className="relative mt-4">
            <motion.div className="mb-1.5 flex items-center justify-between" style={{ opacity: assemble }}>
              <span className="text-[12px] font-medium text-white">Live operations</span>
              <span className="text-[10px] text-white/30">Updated just now</span>
            </motion.div>

            {/* a request arrives (alive) */}
            <AnimatePresence>
              {notif && (
                <motion.div
                  key="notif"
                  initial={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, x: 0, height: 44, marginBottom: 4 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.7, ease }}
                  className="flex items-center justify-between overflow-hidden rounded-xl px-3.5"
                  style={{ background: "rgba(46,125,255,0.05)", boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.18)" }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium text-white">New request · Villa Sol</div>
                    <div className="text-[10.5px] text-white/40">Late checkout requested</div>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/12 px-2 py-0.5 text-[10px] font-medium text-[#8fbcff]">New</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* the AI-resolved task — blue (AI action) */}
            <div className="relative h-[52px]">
              <motion.div className="absolute inset-0 rounded-xl" style={{ opacity: cool, boxShadow: "inset 0 0 0 1px rgba(46,125,255,0.4)", filter: "drop-shadow(0 0 2px rgba(46,125,255,0.3))" }} />
              <motion.div className="absolute inset-0 rounded-xl" style={{ opacity: assemble, background: "rgba(46,125,255,0.05)" }} />
              <motion.div className="absolute inset-0 flex items-center justify-between px-3.5" style={{ opacity: assemble }}>
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
            </div>

            {[
              { t: "Beach club reservation", v: "Villa Aura", s: "Confirmed" },
              { t: "Private chef — dinner for 6", v: "Villa Sol", s: "Pending" },
            ].map((r) => (
              <motion.div key={r.t} className="mt-1 flex items-center justify-between px-3.5 py-2.5" style={{ opacity: assemble }}>
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

export function SpatialExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  const [alive, setAlive] = useState(false);

  useMotionValueEvent(p, "change", (v) => {
    setBeat(v < 0.09 ? 0 : v < 0.24 ? 1 : v < 0.38 ? 2 : v < 0.48 ? 3 : v < 0.6 ? 4 : v < 0.8 ? 5 : 6);
    setAlive(v > 0.84);
  });

  const wake = useTransform(p, [0.26, 0.4], [0, 1]);
  const cool = useTransform(p, [0.5, 0.62], [0, 1]);
  const dissolve = useTransform(p, [0.5, 0.68], [0, 1]);
  const villaOpacity = useTransform(dissolve, [0, 1], [1, 0.13]);
  const villaBlur = useTransform(dissolve, [0, 1], ["blur(0px)", "blur(14px)"]);
  const coolOverlay = useTransform(dissolve, [0, 1], [0, 0.66]);
  const assemble = useTransform(p, [0.62, 0.8], [0, 1]);

  // camera: very slow dolly-in + almost-imperceptible orbit
  const camScale = useTransform(p, [0.42, 1], [1, 1.04]);
  const camRotY = useTransform(p, [0.5, 0.9], [0, 1.6]);
  const camRotX = useTransform(p, [0.5, 0.85], [1.6, 0]);

  // opening brand identity — lives in the villa, dissolves as the story begins
  const introOpacity = useTransform(p, [0, 0.07], [1, 0]);
  const introBlur = useTransform(p, [0, 0.06], ["blur(0px)", "blur(10px)"]);
  const introY = useTransform(p, [0, 0.08], ["0px", "-46px"]);
  const introScale = useTransform(p, [0, 0.08], [1, 0.985]);
  // the floating interface only emerges once the brand has dissolved
  const osReveal = useTransform(p, [0.05, 0.14], [0, 1]);
  // dark readability wash over the video — full during the brand/request beats,
  // easing off once the cool dashboard (its own dark base) takes over
  const readability = useTransform(p, [0, 0.06, 0.5, 0.62], [1, 1, 1, 0.35]);

  // the WhatsApp message that rides the guest's phone through the interior clip.
  // VideoBackdrop drives these (screen px + visibility) from part 2's playback.
  // It is revealed only as the brand dissolves (so it never fights the centred
  // headline) and fades out again as the architecture cools into the dashboard.
  const phoneX = useMotionValue(0);
  const phoneY = useMotionValue(0);
  const phoneVis = useMotionValue(0);
  const phoneReveal = useTransform(p, [0.05, 0.12, 0.44, 0.54], [0, 1, 1, 0]);
  const phoneOpacity = useTransform([phoneVis, phoneReveal] as MotionValue<number>[], ([v, r]: number[]) => v * r);

  // 1 — request rides the phone · 2 — it leaves the phone (AI line travels,
  // master bedroom highlights) · 3 — AI analysis chips · 4+ — dashboard
  const chipsShow = beat === 3;
  const aiLine = beat >= 2 && beat <= 3;
  const brand = beat >= 6;

  return (
    <section ref={ref} id="product" className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ opacity: villaOpacity, filter: villaBlur }}>
          <VideoBackdrop fallback={<VillaSpace dolly={p} />} phone={{ x: phoneX, y: phoneY, vis: phoneVis }} />
        </motion.div>

        {/* WhatsApp message locked to the guest's phone through the interior clip —
            positioned by VideoBackdrop via translate (GPU), hovering just above it */}
        <motion.div className="pointer-events-none absolute left-0 top-0 z-30" style={{ x: phoneX, y: phoneY, opacity: phoneOpacity }}>
          <div className="-translate-x-1/2 -translate-y-[132%]">
            <PhoneMessage />
          </div>
        </motion.div>
        {/* subtle readability wash (~20%) over the video — only to lift the text */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: readability,
            background:
              "radial-gradient(125% 100% at 50% 34%, transparent 38%, rgba(5,6,10,0.55)), linear-gradient(180deg, rgba(5,6,10,0.22), transparent 26%, transparent 64%, rgba(5,6,10,0.5))",
          }}
        />
        <motion.div aria-hidden className="absolute inset-0 bg-[#070b14]" style={{ opacity: coolOverlay }} />

        {/* camera-rigged architecture → operating system */}
        <div className="absolute inset-0" style={{ perspective: 2400 }}>
          <motion.div className="absolute inset-0" style={{ rotateX: camRotX, rotateY: camRotY, scale: camScale, opacity: osReveal, transformStyle: "preserve-3d" }}>
            <ArchitectureOS wake={wake} cool={cool} assemble={assemble} alive={alive} />
          </motion.div>
        </div>

        {/* flat overlays — caption, AI path, request */}
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-[10%] -translate-x-1/2 text-center">
            {brand ? (
              <motion.div key="brand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease }}>
                <div className="mx-auto w-[clamp(116px,16vw,160px)]">
                  <LuxaMark />
                </div>
                <div className="mt-3 text-[13px] font-medium tracking-[-0.02em] text-white/80">
                  Luxury. <span className="text-white/45">Automated.</span>
                </div>
              </motion.div>
            ) : beat >= 1 ? (
              <motion.div key={beat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
                {CAPTIONS[beat]}
              </motion.div>
            ) : null}
          </div>

          {/* electric-blue AI signal leaving the phone, travelling into the villa
              toward the master bedroom (the first room / first dashboard cell) */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M 50 60 C 47 52, 41 46, 34 43"
              fill="none"
              stroke="#2E7DFF"
              strokeWidth={0.4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              style={{ filter: "drop-shadow(0 0 2px rgba(46,125,255,0.5))", strokeDasharray: 1 }}
              animate={{ strokeDashoffset: aiLine ? 0 : 1, opacity: aiLine ? 0.85 : 0 }}
              transition={{ strokeDashoffset: { duration: 1.1, ease }, opacity: { duration: 0.6 } }}
            />
            {/* a travelling node riding the line as the message leaves the phone */}
            <motion.circle
              r={0.7}
              fill="#2E7DFF"
              style={{ filter: "drop-shadow(0 0 3px rgba(46,125,255,0.9))" }}
              animate={
                aiLine
                  ? { cx: [50, 47, 41, 34], cy: [60, 52, 46, 43], opacity: [0, 1, 1, 0] }
                  : { opacity: 0 }
              }
              transition={{ duration: 1.3, ease, times: [0, 0.35, 0.75, 1] }}
            />
          </svg>

          {/* AI analysis chips — the WhatsApp request, parsed into structured
              detail after the message leaves the phone */}
          <div className="pointer-events-none absolute left-1/2 top-[59%] flex w-[340px] max-w-[86%] -translate-x-1/2 flex-wrap justify-center gap-2">
            {CHIPS.map((c, i) => (
              <motion.span
                key={c}
                animate={{ opacity: chipsShow ? 1 : 0, y: chipsShow ? 0 : beat >= 4 ? -16 : 12, scale: chipsShow ? 1 : 0.92 }}
                transition={{ duration: 0.7, delay: chipsShow ? i * 0.1 : 0, ease }}
                className="glass rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-2.5 py-1 text-[11px] font-medium text-white/85"
              >
                <span className="mr-1 inline-block h-[3px] w-[3px] -translate-y-px rounded-full bg-[#2E7DFF]/80" />
                {c}
              </motion.span>
            ))}
          </div>
        </div>

        {/* OPENING — the LUXA identity living inside the villa (this is the hero).
            Mount-animates in, then dissolves into the story as you begin to scroll. */}
        <motion.div
          className="absolute inset-0 z-20"
          style={{ opacity: introOpacity, filter: introBlur, y: introY, scale: introScale, pointerEvents: beat === 0 ? "auto" : "none" }}
        >
          <ParallaxScene className="absolute inset-0">
            <div className="pointer-events-none absolute inset-x-0 top-[25%] flex flex-col items-center px-5 text-center">
              <ParallaxLayer depth={14} className="flex flex-col items-center">
                <Rise delay={0.35} blur={6}>
                  <span className="mb-7 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
                    <span className="h-1 w-1 rounded-full bg-[#2E7DFF]" /> Villa Ocean · Marbella
                  </span>
                </Rise>
                <Rise delay={0.5} blur={5}>
                  <LuxaMark className="mx-auto w-[min(320px,54vw)]" />
                </Rise>
                <Rise delay={0.7} blur={10}>
                  <h1 className="mt-9 text-balance text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
                    Luxury. <span className="text-white/55">Automated.</span>
                  </h1>
                </Rise>
                <Rise delay={0.9}>
                  <p className="mx-auto mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-white/60 sm:text-lg">
                    The AI Operating System for Luxury Hospitality.
                  </p>
                </Rise>
                <Rise delay={1.1}>
                  <div className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-3">
                    <Magnetic className="inline-block" strength={0.3}>
                      <Link href="/login" className={buttonVariants({ variant: "accent", size: "lg" })}>
                        Book a Demo
                      </Link>
                    </Magnetic>
                    <Magnetic className="inline-block" strength={0.25}>
                      <Link
                        href="/login"
                        className="glass edge-light inline-flex h-12 items-center gap-2 rounded-[var(--radius-control)] border border-white/15 px-6 text-[15px] font-medium text-white/90 transition-colors duration-300 hover:border-white/25 hover:text-white"
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

        {/* scroll cue */}
        <motion.div className="absolute bottom-7 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/30" animate={{ opacity: beat === 0 ? 1 : 0 }} transition={{ duration: 0.6 }}>
          Scroll
          <motion.span className="h-6 w-px bg-gradient-to-b from-white/40 to-transparent" animate={reduce ? undefined : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "top" }} />
        </motion.div>
      </div>
    </section>
  );
}
