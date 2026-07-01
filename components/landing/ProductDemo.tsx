"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { MessageCircle, Sparkles, ClipboardList, UserCheck, CheckCircle2 } from "lucide-react";

// keynote easing — slow, smooth, never bouncy
const ease = [0.4, 0, 0.2, 1] as const;

const STEPS = [
  { label: "WhatsApp", sub: "Guest message", time: "09:14", Icon: MessageCircle },
  { label: "AI understands", sub: "Intent parsed", time: "09:14:02", Icon: Sparkles },
  { label: "Task Created", sub: "Structured", time: "09:14:04", Icon: ClipboardList },
  { label: "Assigned", sub: "To Carlos", time: "09:14:08", Icon: UserCheck },
  { label: "Completed", sub: "Confirmed", time: "09:14:11", Icon: CheckCircle2 },
];

// what the AI extracts from the message — these chips become the task
const CHIPS = ["Maintenance", "Villa Ocean", "Master Bedroom", "High Priority"];

/* ------------------------------------------------------------------ *
 *  SECTION 2 — the product demonstration. The real guest message slides up
 *  and stops; the AI extracts its chips; then the five cards light up one at
 *  a time on a calm ~0.8s cadence (only ever one step animating), ending on
 *  Completed. The whole request→completed story reads in under 10 seconds,
 *  and the live dashboard sits directly below as the result. No words needed.
 * ------------------------------------------------------------------ */
export function ProductDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [lit, setLit] = useState(0); // how many cards are lit (0–5)
  const [arrows, setArrows] = useState(0); // how many arrows drawn (0–4)
  const [msg, setMsg] = useState(0); // 0 hidden · 1 message up & held · 2 AI chips shown
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (!inView) {
      setLit(0);
      setArrows(0);
      setMsg(0);
      return;
    }
    if (reduce) {
      setLit(5);
      setArrows(4);
      setMsg(2);
      return;
    }
    const t: ReturnType<typeof setTimeout>[] = [];
    // the request arrives first: message slides up and stops, then the AI chips
    t.push(setTimeout(() => setMsg(1), 800));
    t.push(setTimeout(() => setMsg(2), 1900));
    // then the workflow — one card every ~0.8s, its arrow lighting just after
    t.push(setTimeout(() => setLit(1), 3200));
    t.push(setTimeout(() => setArrows(1), 3600));
    t.push(setTimeout(() => setLit(2), 4000));
    t.push(setTimeout(() => setArrows(2), 4400));
    t.push(setTimeout(() => setLit(3), 4800));
    t.push(setTimeout(() => setArrows(3), 5200));
    t.push(setTimeout(() => setLit(4), 5600));
    t.push(setTimeout(() => setArrows(4), 6000));
    t.push(setTimeout(() => setLit(5), 6400));
    // hold the completed state, then reset and loop (pause ~0.5s after Completed)
    t.push(
      setTimeout(() => {
        setLit(0);
        setArrows(0);
        setMsg(0);
        setCycle((c) => c + 1);
      }, 8700)
    );
    return () => t.forEach(clearTimeout);
  }, [inView, cycle, reduce]);

  return (
    <section ref={ref} id="product" className="relative overflow-x-clip px-5 pb-4 pt-28 sm:pb-6 sm:pt-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 46% at 50% 40%, rgba(46,125,255,0.05), transparent 72%)" }} />

      <div className="mx-auto max-w-6xl">
        {/* headline */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.3, ease }}
            className="text-balance text-[clamp(2.3rem,6vw,4.4rem)] font-semibold leading-[1.0] tracking-[-0.045em] text-white"
          >
            One WhatsApp.
            <br />
            <span className="text-white/45">Entire operation automated.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.1, delay: 0.15, ease }}
            className="mx-auto mt-6 max-w-xl text-balance text-[15px] leading-relaxed text-white/55 sm:text-[17px]"
          >
            Watch one guest request become a completed task in under 10 seconds.
          </motion.p>
        </div>

        {/* the request — message slides up and stops, then the AI extracts the chips */}
        <div className="mt-14 flex min-h-[176px] flex-col items-center justify-start gap-4 sm:mt-20">
          <motion.div
            animate={msg >= 1 ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 26, filter: "blur(9px)" }}
            transition={{ duration: 1.1, ease }}
            className="flex max-w-[86vw] items-start gap-3.5 rounded-[22px] border border-[#25D366]/22 bg-[#0b0d12]/80 px-5 py-4 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:px-6 sm:py-5"
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25D366]/15 sm:h-10 sm:w-10">
              <MessageCircle className="h-4.5 w-4.5 text-[#43d178] sm:h-5 sm:w-5" />
            </span>
            <span className="text-[15px] leading-snug text-white/90 sm:text-[17px]">
              Hi, the AC is not working
              <br className="hidden sm:block" /> in the master bedroom.
            </span>
          </motion.div>

          {/* AI detects — the extracted chips */}
          <motion.div
            animate={msg >= 2 ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14, filter: "blur(9px)" }}
            transition={{ duration: 1, ease }}
            className="flex flex-col items-center gap-2.5"
          >
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#8fbcff]/70">
              <Sparkles className="h-3 w-3" /> AI detects
            </div>
            <div className="flex max-w-[92vw] flex-wrap items-center justify-center gap-2">
              {CHIPS.map((c, i) => (
                <motion.span
                  key={c}
                  initial={{ opacity: 0, y: 8, filter: "blur(5px)" }}
                  animate={msg >= 2 ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0 }}
                  transition={{ duration: 0.55, delay: msg >= 2 ? 0.15 + i * 0.4 : 0, ease }}
                  className="rounded-full border border-[#2E7DFF]/25 bg-[#2E7DFF]/[0.08] px-3 py-1.5 text-[12.5px] font-medium text-white/90 sm:text-[13.5px]"
                >
                  {c}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* the five cards — vertical on mobile, horizontal on desktop */}
        <div className="mt-14 flex flex-col items-center justify-center gap-0 sm:mt-20 sm:flex-row sm:gap-0">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center sm:flex-row">
              <FlowCard step={s} lit={i < lit} pulsing={i === lit - 1} reduce={!!reduce} />
              {i < STEPS.length - 1 && <Arrow on={i < arrows} reduce={!!reduce} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* one large step card */
function FlowCard({
  step,
  lit,
  pulsing,
  reduce,
}: {
  step: { label: string; sub: string; time: string; Icon: typeof MessageCircle };
  lit: boolean;
  pulsing: boolean;
  reduce: boolean;
}) {
  const { Icon } = step;
  return (
    <motion.div
      className="relative flex w-[min(272px,80vw)] flex-col items-center gap-4 rounded-[26px] border px-6 py-8 sm:w-[204px] sm:py-9"
      animate={{
        borderColor: lit ? "rgba(46,125,255,0.42)" : "rgba(255,255,255,0.08)",
        backgroundColor: lit ? "rgba(46,125,255,0.06)" : "rgba(255,255,255,0.015)",
        boxShadow: lit ? "0 0 44px -12px rgba(46,125,255,0.45)" : "0 0 0 rgba(0,0,0,0)",
        y: lit ? -3 : 0,
      }}
      transition={{ duration: 0.9, ease }}
    >
      {pulsing && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px]"
          initial={{ opacity: 0.55, scale: 1 }}
          animate={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{ boxShadow: "0 0 0 1px rgba(46,125,255,0.65), 0 0 34px rgba(46,125,255,0.4)" }}
        />
      )}
      <motion.span
        className="grid h-14 w-14 place-items-center rounded-2xl sm:h-16 sm:w-16"
        animate={{
          backgroundColor: lit ? "rgba(46,125,255,0.16)" : "rgba(255,255,255,0.04)",
          color: lit ? "#8fbcff" : "rgba(255,255,255,0.5)",
        }}
        transition={{ duration: 0.9, ease }}
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
      </motion.span>
      <div className="text-center">
        <motion.div
          className="text-[16px] font-medium leading-tight tracking-[-0.01em] sm:text-[17px]"
          animate={{ color: lit ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.62)" }}
          transition={{ duration: 0.9 }}
        >
          {step.label}
        </motion.div>
        <div className="mt-1 text-[12px] text-white/35">{step.sub}</div>
        {/* the subtle timestamp — appears the moment the step lights */}
        <motion.div
          className="mt-2 font-mono text-[10.5px] tabular-nums tracking-tight text-[#8fbcff]"
          animate={{ opacity: lit ? 0.75 : 0 }}
          transition={{ duration: 0.7, ease }}
        >
          {step.time}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* the connector — draws when its step completes; points down on mobile, right on desktop */
function Arrow({ on, reduce }: { on: boolean; reduce: boolean }) {
  return (
    <div className="flex items-center justify-center py-3 sm:px-1 sm:py-0">
      <motion.svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        className="rotate-90 sm:rotate-0"
        initial={false}
        animate={{ opacity: on ? 1 : 0.18 }}
        transition={{ duration: 0.6, ease }}
      >
        <motion.path
          d="M3 13H21M21 13L15 7M21 13L15 19"
          stroke="#2E7DFF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: on || reduce ? 1 : 0.001 }}
          transition={{ duration: 0.7, ease }}
        />
      </motion.svg>
    </div>
  );
}
