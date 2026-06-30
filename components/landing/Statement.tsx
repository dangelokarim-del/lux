"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShinyText } from "./anim/ShinyText";

/** Full-bleed editorial statement. Pure typography, maximal whitespace. */
export function Statement({
  eyebrow,
  children,
  id,
  tall,
  black,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  id?: string;
  /** full-viewport, oversized — for the dramatic "core problem" reveal */
  tall?: boolean;
  /** pure-black backdrop, isolating the statement from the rest of the page */
  black?: boolean;
}) {
  const reduce = useReducedMotion();
  const ease = [0.62, 0.04, 0.2, 1] as const;
  return (
    <section
      id={id}
      className={`relative ${tall ? "flex min-h-[96vh] items-center px-5 py-40" : "px-5 py-52 sm:py-64"}`}
      style={black ? { background: "radial-gradient(120% 90% at 50% 50%, #0a0b0e 0%, #000 72%)" } : undefined}
    >
      {/* soft fade edges so a black section melts into the story, never a hard cut */}
      {black && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(180deg,#050608,transparent)" }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(0deg,#050608,transparent)" }} />
        </>
      )}
      <div className={`mx-auto text-center ${tall ? "max-w-6xl" : "max-w-4xl"}`}>
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease }}
            className={`text-[12px] font-medium uppercase tracking-[0.26em] ${tall ? "mb-14" : "mb-11"}`}
          >
            <ShinyText>{eyebrow}</ShinyText>
          </motion.div>
        )}
        <motion.h2
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 34, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.7, ease }}
          className={`text-balance font-semibold leading-[0.94] tracking-[-0.05em] text-white ${
            tall ? "text-[clamp(3rem,10.5vw,8rem)]" : "text-[clamp(2.6rem,8.4vw,6.4rem)]"
          }`}
        >
          {children}
        </motion.h2>
      </div>
    </section>
  );
}
