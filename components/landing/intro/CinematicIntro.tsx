"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIntro } from "./IntroContext";
import { Villa } from "./Villa";

const ease = [0.16, 1, 0.3, 1] as const;

const PHASES = ["emerge", "hold", "notify", "enter", "bloom", "out"] as const;
type Phase = (typeof PHASES)[number];
const DUR: Record<Phase, number> = {
  emerge: 3000,
  hold: 1300,
  notify: 2500,
  enter: 1900,
  bloom: 750,
  out: 750,
};

export function CinematicIntro() {
  const { shouldRun, done, finish } = useIntro();
  const [i, setI] = useState(0);
  const phase = PHASES[i];

  // timeline
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

  // lock scroll while the film plays
  useEffect(() => {
    if (shouldRun !== true || done) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [shouldRun, done]);

  if (shouldRun !== true || done) return null;

  const at = (k: Phase) => i >= PHASES.indexOf(k);
  const isEnter = at("enter");

  const skip = () => setI(PHASES.indexOf("out"));

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: DUR.out / 1000, ease }}
    >
      {/* camera */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "50% 48.5%" }}
        initial={{ scale: 1.0, x: "0%" }}
        animate={{
          scale: isEnter ? 2.9 : at("notify") ? 1.075 : at("hold") ? 1.05 : 1.02,
          x: isEnter ? "0%" : at("notify") ? "-1.5%" : "0%",
        }}
        transition={{ duration: isEnter ? 1.9 : 3, ease }}
      >
        <Villa />
      </motion.div>

      {/* emerge-from-black cover */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2.8, ease }}
      />

      {/* Act 2 — WhatsApp notification */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[24%] w-[300px] max-w-[82%] -translate-x-1/2"
        initial={{ opacity: 0, y: -14, scale: 0.97 }}
        animate={{
          opacity: at("notify") && !isEnter ? 1 : 0,
          y: at("notify") && !isEnter ? 0 : isEnter ? -20 : -14,
          scale: at("notify") && !isEnter ? 1 : 0.97,
        }}
        transition={{ duration: 0.8, ease }}
      >
        <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.05] p-3.5 backdrop-blur-2xl shadow-[0_24px_70px_-34px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-white/45">
              <span className="h-1 w-1 rounded-full bg-[#25D366]" />
              WhatsApp
            </span>
            <span className="text-[9px] text-white/30">Villa Ocean · now</span>
          </div>
          <p className="mt-2 text-[13px] leading-snug text-white/85">
            Hi, the AC is not working in the master bedroom.
          </p>
        </div>
      </motion.div>

      {/* Act 3 — passing through the glass: warm bloom then light */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[48.5%] h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,214,170,0.95), rgba(255,180,120,0.4) 45%, transparent 70%)" }}
        initial={{ opacity: 0, scale: 0.25 }}
        animate={{ opacity: isEnter ? 1 : 0, scale: isEnter ? 5.5 : 0.25 }}
        transition={{ duration: 1.7, ease }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 48%, rgba(255,250,244,0.96), rgba(245,247,252,0.6) 40%, transparent 72%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: at("bloom") ? 1 : 0 }}
        transition={{ duration: 0.7, ease }}
      />

      {/* skip */}
      <button
        onClick={skip}
        className="absolute bottom-6 right-6 z-10 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-[12px] text-white/55 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
      >
        Skip
      </button>
    </motion.div>
  );
}
