"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Almost-invisible animated blue atmosphere behind the hero. Two very soft,
 * slowly drifting radial fields — cinematic depth, never a visible "blob".
 * Fixed, pointer-events-none, disabled for reduced-motion.
 */
export function Atmosphere() {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-40 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-[8%] h-[70vh] w-[70vw] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle at center, rgba(46,125,255,0.06), transparent 62%)", filter: "blur(40px)" }}
        animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.08, 1], x: ["-52%", "-48%", "-52%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[18%] top-[34%] h-[46vh] w-[46vw] rounded-full"
        style={{ background: "radial-gradient(circle at center, rgba(60,110,200,0.05), transparent 64%)", filter: "blur(48px)" }}
        animate={{ opacity: [0.4, 0.7, 0.4], x: [0, 40, 0], y: [0, -24, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
}
