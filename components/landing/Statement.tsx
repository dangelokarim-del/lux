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
  return (
    <section
      id={id}
      className={`relative ${tall ? "flex min-h-[92vh] items-center px-5 py-32" : "px-5 py-44 sm:py-56"}`}
      style={black ? { background: "radial-gradient(120% 90% at 50% 50%, #0a0b0e 0%, #000 70%)" } : undefined}
    >
      <div className={`mx-auto text-center ${tall ? "max-w-6xl" : "max-w-4xl"}`}>
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className={`text-[11px] font-medium uppercase tracking-[0.24em] ${tall ? "mb-12" : "mb-9"}`}
          >
            <ShinyText>{eyebrow}</ShinyText>
          </motion.div>
        )}
        <motion.h2
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className={`text-balance font-semibold leading-[0.95] tracking-[-0.05em] text-white ${
            tall ? "text-[clamp(2.8rem,10vw,7.5rem)]" : "text-[clamp(2.5rem,8vw,6rem)]"
          }`}
        >
          {children}
        </motion.h2>
      </div>
    </section>
  );
}
