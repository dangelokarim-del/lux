"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The LUXA wordmark — thin geometric letterforms in a soft brushed-chrome
 * finish. Electric blue lives in exactly two places: the X intersection and
 * the dot by the A. An ultra-subtle reflection drifts across the metal every
 * ~10s. Elegant even when completely static. Pure SVG + CSS.
 *
 * Geometry: rounded-foot L, rounded-bottom U, crossed X, open-peak A.
 */
export function LuxaMark({
  className,
  animated = true,
  title = "LUXA",
}: {
  className?: string;
  animated?: boolean;
  title?: string;
}) {
  const raw = useId().replace(/:/g, "");
  const id = (k: string) => `${raw}-${k}`;

  return (
    <svg
      viewBox="0 0 1240 260"
      role="img"
      aria-label={title}
      shapeRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
      style={{ aspectRatio: "1240 / 260" }}
      className={cn("block h-auto w-full", className)}
    >
      <defs>
        {/* soft brushed-chrome — neutral silver, gentle transitions */}
        <linearGradient id={id("chrome")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfcfe" />
          <stop offset="0.26" stopColor="#dde1e8" />
          <stop offset="0.48" stopColor="#b2b8c2" />
          <stop offset="0.57" stopColor="#e9edf2" />
          <stop offset="0.80" stopColor="#bcc2cc" />
          <stop offset="1" stopColor="#d4d9e1" />
        </linearGradient>

        {/* ultra-subtle reflection band */}
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* electric blue — confined to the X intersection */}
        <radialGradient id={id("xglow")}>
          <stop offset="0" stopColor="#f1f6ff" stopOpacity="1" />
          <stop offset="0.4" stopColor="#4f93ff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#2E7DFF" stopOpacity="0" />
        </radialGradient>

        {/* electric blue — the A dot */}
        <radialGradient id={id("dot")}>
          <stop offset="0" stopColor="#eaf4ff" />
          <stop offset="0.5" stopColor="#6fb0ff" />
          <stop offset="1" stopColor="#2E7DFF" />
        </radialGradient>

        {/* tight, contained blur — used only for the two blue accents */}
        <filter id={id("soft")} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>

        {/* shared geometry — thin geometric strokes, wide premium spacing */}
        <g id={id("letters")} fill="none" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M95 50 V191 Q95 210 114 210 H198" />
          <path d="M385 50 V140 C385 185 412 210 440 210 C468 210 495 185 495 140 V50" />
          <path d="M675 50 L795 210 M795 50 L675 210" />
          <path d="M1010 50 L948 210 M1010 50 L1072 210" />
        </g>

        <mask id={id("mask")}>
          <use href={`#${id("letters")}`} stroke="#fff" />
        </mask>
      </defs>

      {/* chrome letters — no glow, elegant on pure black */}
      <use href={`#${id("letters")}`} stroke={`url(#${id("chrome")})`} />

      {/* X intersection light — contained */}
      <circle cx="735" cy="130" r="22" fill={`url(#${id("xglow")})`} filter={`url(#${id("soft")})`} />
      <circle cx="735" cy="130" r="4.5" fill="#f1f7ff" filter={`url(#${id("soft")})`} opacity="0.9" />

      {/* the A dot — small contained glow */}
      <circle cx="1108" cy="200" r="10" fill="#2E7DFF" opacity="0.42" filter={`url(#${id("soft")})`} />
      <circle cx="1108" cy="200" r="6" fill={`url(#${id("dot")})`} />

      {/* ultra-subtle reflection, clipped to the chrome only */}
      {animated && (
        <g mask={`url(#${id("mask")})`}>
          <rect className="luxa-sheen" x="0" y="0" width="240" height="260" fill={`url(#${id("sheen")})`} />
        </g>
      )}
    </svg>
  );
}
