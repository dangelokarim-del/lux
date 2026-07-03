"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.4, 0, 0.2, 1] as const;

/**
 * A calm entrance: content rises and fades into place on mount, staggered by
 * `index` so a grid of cards resolves like a keynote build — never all at once,
 * never flashy. Animates once (fixed target), so store updates don't re-trigger it.
 */
export function Reveal({
  children,
  index = 0,
  className,
  y = 12,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), ease }}
    >
      {children}
    </motion.div>
  );
}
