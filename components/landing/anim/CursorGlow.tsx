"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A soft light that slowly follows the cursor within its parent area.
 * Pure ambience — pointer-events-none, desktop-only, off for reduced-motion.
 */
export function CursorGlow({
  size = 520,
  color = "rgba(255,255,255,0.06)",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 26, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 90, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (inside) {
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
        setActive(true);
      } else {
        setActive(false);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  if (reduce) return null;

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 -z-0 overflow-hidden", className)}>
      <motion.div
        style={{ x: sx, y: sy, width: size, height: size, background: `radial-gradient(circle at center, ${color}, transparent 60%)` }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ opacity: { duration: 0.8, ease: "easeOut" } }}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
      />
    </div>
  );
}
