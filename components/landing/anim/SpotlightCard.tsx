"use client";

import { useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * React Bits — Spotlight Card, retuned to LUXA. A soft radial light follows
 * the cursor across the surface, revealed on hover. Pointer position is written
 * to CSS variables (no re-render), so it stays smooth over large surfaces.
 * Pure ambience — pointer-events-none overlay, off for reduced-motion.
 */
export function SpotlightCard({
  children,
  className,
  radius = 360,
  color = "rgba(120,170,255,0.10)",
}: {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={reduce ? undefined : onMove}
      className={cn("group relative", className)}
    >
      {!reduce && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 opacity-0 transition-opacity duration-500 ease-[var(--ease-premium)] group-hover:opacity-100"
          style={{
            background: `radial-gradient(${radius}px circle at var(--mx, 50%) var(--my, 50%), ${color}, transparent 68%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
