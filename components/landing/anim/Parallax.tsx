"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

interface ParallaxCtx {
  x: MotionValue<number>;
  y: MotionValue<number>;
}
const Ctx = createContext<ParallaxCtx | null>(null);

/** Tracks the pointer over its area and exposes normalized -0.5..0.5 motion values. */
export function ParallaxScene({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 50, damping: 18, mass: 0.6 });
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={className}>
      <Ctx.Provider value={{ x, y }}>{children}</Ctx.Provider>
    </div>
  );
}

/** Moves with the pointer by `depth` px. Positive depth = foreground. */
export function ParallaxLayer({
  depth = 12,
  children,
  className,
}: {
  depth?: number;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const x = useTransform(ctx?.x ?? fallbackX, (v) => v * depth);
  const y = useTransform(ctx?.y ?? fallbackY, (v) => v * depth);
  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}
