"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Cinematic page transition on every route change.
 * Opacity-only by design — a transform here would create a containing block
 * that breaks the fixed navbar and full-bleed backgrounds.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
