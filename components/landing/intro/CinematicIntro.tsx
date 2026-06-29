"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui";
import { useIntro } from "./IntroContext";
import { Villa } from "./Villa";
import { ProductDashboard } from "../ProductDashboard";

const ease = [0.16, 1, 0.3, 1] as const;

const PHASES = ["emerge", "notify", "detect", "analyze", "dissolve", "dash", "reveal", "out"] as const;
type Phase = (typeof PHASES)[number];
const DUR: Record<Phase, number> = {
  emerge: 1900,
  notify: 1900,
  detect: 1100,
  analyze: 1600,
  dissolve: 1500,
  dash: 1900,
  reveal: 2300,
  out: 750,
};

/* AI chips that surface beside the lit window (x%, y%) */
const CHIPS: { label: string; x: number; y: number }[] = [
  { label: "AC issue", x: 62, y: 23 },
  { label: "Master bedroom", x: 70.5, y: 28 },
  { label: "Maintenance", x: 63.5, y: 36 },
  { label: "High priority", x: 73, y: 41 },
  { label: "Villa Ocean", x: 60, y: 45 },
];

export function CinematicIntro() {
  const { shouldRun, done, finish } = useIntro();
  const [i, setI] = useState(0);
  const phase = PHASES[i];
  const at = (k: Phase) => i >= PHASES.indexOf(k);

  useEffect(() => {
    if (shouldRun !== true) return;
    if (phase === "out") {
      const t = setTimeout(finish, DUR.out);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((p) => p + 1), DUR[phase]);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRun, i]);

  useEffect(() => {
    if (shouldRun !== true || done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shouldRun, done]);

  if (shouldRun !== true || done) return null;

  const camScale = at("dissolve") ? 2.5 : at("analyze") ? 1.11 : at("detect") ? 1.07 : at("notify") ? 1.035 : 1.0;

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: DUR.out / 1000, ease }}
    >
      {/* villa camera */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "58.2% 32%" }}
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: camScale,
          opacity: at("dash") ? 0 : 1,
          filter: at("dissolve") ? "blur(18px)" : "blur(0px)",
        }}
        transition={{ duration: at("dissolve") ? 1.5 : at("emerge") ? 2.6 : 1.6, ease }}
      >
        <Villa lit={at("detect")} />
      </motion.div>

      {/* Act 2 — WhatsApp notification */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[20%] w-[290px] max-w-[80%] -translate-x-1/2"
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{
          opacity: at("notify") && !at("dissolve") ? 1 : 0,
          y: at("notify") && !at("dissolve") ? 0 : -12,
          scale: at("notify") ? 1 : 0.97,
        }}
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

      {/* Act 3 — electric-blue precision line to the window */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d="M50 26 Q 54.5 29.5 58.2 31.4"
          fill="none"
          stroke="#2E7DFF"
          strokeWidth={1.4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 3px rgba(46,125,255,0.55))" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: at("detect") ? 1 : 0, opacity: at("detect") && !at("dissolve") ? 0.9 : 0 }}
          transition={{ pathLength: { duration: 0.9, ease }, opacity: { duration: 0.5 } }}
        />
      </svg>

      {/* Act 4 — AI chips beside the window */}
      {CHIPS.map((c, idx) => (
        <motion.span
          key={c.label}
          className="pointer-events-none absolute -translate-x-1/2 rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white/75 backdrop-blur-xl"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{
            opacity: at("analyze") && !at("dissolve") ? 1 : 0,
            y: at("analyze") && !at("dissolve") ? 0 : at("dissolve") ? -10 : 8,
            scale: at("analyze") && !at("dissolve") ? 1 : 0.96,
          }}
          transition={{ duration: 0.7, delay: at("analyze") && !at("dissolve") ? idx * 0.18 : 0, ease }}
        >
          {c.label}
        </motion.span>
      ))}

      {/* Acts 5–6 — dashboard glass-dissolves in, then reveal */}
      {at("dissolve") && (
        <motion.div
          className="absolute left-1/2 top-1/2 w-[min(1000px,93vw)] -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 1.05, filter: "blur(22px)" }}
          animate={{
            opacity: at("reveal") ? 0.32 : 1,
            scale: at("reveal") ? 0.97 : 1,
            filter: at("reveal") ? "blur(7px)" : "blur(0px)",
          }}
          transition={{ duration: at("reveal") ? 1 : 1.4, ease }}
        >
          <div className="shadow-[var(--shadow-float)]">
            <ProductDashboard animated intro />
          </div>
        </motion.div>
      )}

      {at("reveal") && (
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
        onClick={() => setI(PHASES.indexOf("out"))}
        className="absolute bottom-6 right-6 z-30 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[12px] text-white/55 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
      >
        Skip
      </button>
    </motion.div>
  );
}
