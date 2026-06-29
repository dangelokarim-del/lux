"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Full-bleed editorial statement. Pure typography, maximal whitespace. */
export function Statement({
  eyebrow,
  children,
  id,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <section id={id} className="relative px-5 py-44 sm:py-56">
      <div className="mx-auto max-w-4xl text-center">
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-9 text-[11px] font-medium uppercase tracking-[0.2em] text-white/30"
          >
            {eyebrow}
          </motion.div>
        )}
        <motion.h2
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-[clamp(2.5rem,8vw,6rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-white"
        >
          {children}
        </motion.h2>
      </div>
    </section>
  );
}
