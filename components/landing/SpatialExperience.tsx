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
  "The villa becomes the system",
  "Live operations",
  "",
];

/* ------------------------------------------------------------------ *
 *  SPATIAL EXPERIENCE — a pinned, scroll-driven cinematic. The dark
 *  Marbella villa receives a request, its rooms light one by one, the
 *  architecture dissolves into cool glass, and the LUXA operating system
 *  emerges from it: the villa IS the OS. Apple-keynote slow; no toy 3D,
 *  no glowing house, no flashy particles — light, glass and meaning only.
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

/* a single villa room — warm interior light comes on, then cools into UI glass */
function Room({ index, lit, cool }: { index: number; lit: MotionValue<number>; cool: MotionValue<number> }) {
  const warm = useTransform(lit, [index * 0.18, index * 0.18 + 0.5], [0, 1]);
  const warmShown = useTransform([warm, cool] as MotionValue<number>[], ([w, c]: number[]) => w * (1 - c * 0.92));
  const lift = useTransform(cool, [0, 1], [0, -7]);
  return (
    <motion.div className="relative h-[84px] w-[132px] overflow-hidden rounded-2xl border border-white/[0.08]" style={{ y: lift }}>
      <div className="absolute inset-0 bg-[#0a0c12]" />
      {/* warm interior light */}
      <motion.div className="absolute inset-0" style={{ opacity: warmShown, background: "linear-gradient(180deg,rgba(255,200,146,0.5),rgba(226,150,98,0.72))" }} />
      <motion.div className="absolute inset-x-0 bottom-0 h-1/2" style={{ opacity: warmShown, background: "linear-gradient(180deg,transparent,rgba(255,224,180,0.4))" }} />
      {/* cool glass — the room becomes interface */}
      <motion.div className="absolute inset-0" style={{ opacity: cool, background: "linear-gradient(180deg,rgba(150,185,255,0.12),rgba(46,125,255,0.07))" }} />
      <motion.div className="absolute inset-x-0 top-0 h-px" style={{ opacity: cool, background: "rgba(46,125,255,0.5)" }} />
    </motion.div>
  );
}

/* the villa facade — four rooms light up one by one, then dissolve into glass */
function RoomsFacade({ lit, cool, fade }: { lit: MotionValue<number>; cool: MotionValue<number>; fade: MotionValue<number> }) {
  return (
    <motion.div aria-hidden className="absolute left-1/2 top-[34%] flex -translate-x-1/2 -translate-y-1/2 gap-3" style={{ opacity: fade }}>
      {[0, 1, 2, 3].map((i) => (
        <Room key={i} index={i} lit={lit} cool={cool} />
      ))}
    </motion.div>
  );
}

/* the LUXA operating system the villa becomes — calm, minimal, resolved */
function EmergentOS({ reveal, scale, drift }: { reveal: MotionValue<number>; scale: MotionValue<number>; drift: MotionValue<string> }) {
  const stats = [
    { l: "Open requests", v: "15" },
    { l: "Urgent", v: "03", a: true },
    { l: "Resolved", v: "28" },
    { l: "Arrivals", v: "06" },
  ];
  return (
    <motion.div className="absolute left-1/2 top-1/2 w-[min(880px,94%)] -translate-x-1/2 -translate-y-1/2" style={{ opacity: reveal, scale, y: drift }}>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <span className="flex items-center gap-1 text-[13px] font-semibold tracking-[-0.02em] text-white">
            LUXA<span className="h-1 w-1 translate-y-1 rounded-full bg-[#2E7DFF]" />
            <span className="ml-2 text-[11px] font-normal text-white/30">Operations</span>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-white/55">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2E7DFF]" /> Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 px-5 py-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="rounded-xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-3">
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">{s.l}</div>
              <div className={`mt-1.5 text-[26px] font-semibold leading-none tabular-nums ${s.a ? "text-[#6ba5ff]" : "text-white"}`}>{s.v}</div>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-medium text-white">Live operations</span>
            <span className="text-[10px] text-white/30">Updated just now</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#2E7DFF]/12 bg-[#2E7DFF]/[0.05] px-3.5 py-3">
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
          </div>
          {[
            { t: "Beach club reservation", v: "Villa Aura", s: "Confirmed", a: true },
            { t: "Private chef — dinner for 6", v: "Villa Sol", s: "Pending" },
          ].map((r) => (
            <div key={r.t} className="mt-1 flex items-center justify-between px-3.5 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-[12.5px] text-white/90">{r.t}</div>
                <div className="text-[10.5px] text-white/35">Concierge · {r.v}</div>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${r.a ? "border-[#2E7DFF]/25 bg-[#2E7DFF]/12 text-[#8fbcff]" : "border-white/[0.1] bg-white/[0.04] text-white/55"}`}>{r.s}</span>
            </div>
          ))}
        </div>
      </Panel>
    </motion.div>
  );
}

export function SpatialExperience() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const b = v < 0.1 ? 0 : v < 0.22 ? 1 : v < 0.34 ? 2 : v < 0.46 ? 3 : v < 0.6 ? 4 : v < 0.8 ? 5 : 6;
    setBeat(b);
  });

  // continuous (scroll-scrubbed) — the transformation
  const driftNear = useTransform(scrollYProgress, [0, 1], ["0px", "40px"]);
  const roomLit = useTransform(scrollYProgress, [0.22, 0.44], [0, 1]);
  const roomCool = useTransform(scrollYProgress, [0.46, 0.6], [0, 1]);
  const dissolve = useTransform(scrollYProgress, [0.46, 0.66], [0, 1]);
  const villaOpacity = useTransform(dissolve, [0, 1], [1, 0.18]);
  const villaBlur = useTransform(dissolve, [0, 1], ["blur(0px)", "blur(13px)"]);
  const coolOverlay = useTransform(dissolve, [0, 1], [0, 0.6]);
  const facadeFade = useTransform(scrollYProgress, [0.6, 0.72], [1, 0]);
  const osReveal = useTransform(scrollYProgress, [0.58, 0.74], [0, 1]);
  const osScale = useTransform(scrollYProgress, [0.58, 0.78], [0.965, 1]);
  const osDrift = useTransform(scrollYProgress, [0.58, 1], ["18px", "-10px"]);

  const requestShow = beat >= 1 && beat <= 3;
  const chipsShow = beat === 2 || beat === 3;
  const brand = beat >= 6;

  return (
    <section ref={ref} id="product" className="relative h-[360vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* villa — dissolves into glass + light during the transform */}
        <motion.div className="absolute inset-0" style={{ opacity: villaOpacity, filter: villaBlur }}>
          <SplineStage fallback={<VillaSpace dolly={scrollYProgress} />} />
        </motion.div>
        {/* cool glass field the architecture resolves into */}
        <motion.div aria-hidden className="absolute inset-0 bg-[#070b14]" style={{ opacity: coolOverlay }} />

        {/* the villa's rooms — illuminate one by one, then cool into interface */}
        <RoomsFacade lit={roomLit} cool={roomCool} fade={facadeFade} />

        <div className="absolute inset-0">
          {/* caption / brand sign-off */}
          <div className="absolute left-1/2 top-[10%] -translate-x-1/2 text-center">
            {brand ? (
              <motion.div key="brand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease }}>
                <div className="mx-auto w-[clamp(116px,16vw,160px)]">
                  <LuxaMark />
                </div>
                <div className="mt-3 text-[13px] font-medium tracking-[-0.02em] text-white/80">
                  Luxury. <span className="text-white/45">Automated.</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key={beat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
                {CAPTIONS[beat]}
              </motion.div>
            )}
          </div>

          {/* electric-blue AI path from the request up to the master-bedroom room */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M 50 56 C 50 47, 48 40, 46 36"
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
          {/* located-room marker on the master bedroom */}
          <motion.div className="pointer-events-none absolute" style={{ left: "46%", top: "34%" }} animate={{ opacity: beat === 2 || beat === 3 ? 1 : 0 }} transition={{ duration: 0.6 }}>
            <span className="relative block h-2 w-2 -translate-x-1/2 -translate-y-1/2">
              {!reduce && <motion.span className="absolute inset-0 rounded-full bg-[#2E7DFF]" animate={{ scale: [1, 2.8], opacity: [0.5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />}
              <span className="absolute inset-0 rounded-full bg-[#2E7DFF] shadow-[0_0_10px_2px_rgba(46,125,255,0.55)]" />
            </span>
            <span className="absolute left-3 top-0 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-2 py-0.5 text-[9px] font-medium text-[#8fbcff] backdrop-blur-sm">Master Bedroom</span>
          </motion.div>

          {/* the request + extracted chips (recede as the villa transforms) */}
          <motion.div className="absolute left-1/2 top-[62%] w-[320px] max-w-[84%] -translate-x-1/2 -translate-y-1/2" style={{ y: driftNear }}>
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
                <motion.div className="mt-3 h-px w-full overflow-hidden rounded-full bg-white/[0.06]" animate={{ opacity: beat === 2 ? 1 : 0 }} transition={{ duration: 0.5 }}>
                  <motion.div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#2E7DFF] to-transparent" animate={beat === 2 && !reduce ? { x: ["-120%", "320%"] } : { x: "-120%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                </motion.div>
              </Panel>
            </motion.div>
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
          </motion.div>

          {/* the LUXA OS the villa became */}
          <EmergentOS reveal={osReveal} scale={osScale} drift={osDrift} />
        </div>

        {/* scroll cue */}
        <motion.div className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.22em] text-white/30" animate={{ opacity: beat === 0 ? 1 : 0 }} transition={{ duration: 0.6 }}>
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
