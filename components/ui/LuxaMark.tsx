"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The LUXA wordmark — thin geometric letterforms with a brushed-chrome finish,
 * an electric-blue light through the X, the glowing dot by the A, and a slow
 * reflection that sweeps across the metal. Pure SVG + CSS.
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
      viewBox="0 0 1200 260"
      role="img"
      aria-label={title}
      shapeRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
      style={{ aspectRatio: "1200 / 260" }}
      className={cn("block h-auto w-full overflow-visible", className)}
    >
      <defs>
        {/* brushed-chrome vertical gradient */}
        <linearGradient id={id("chrome")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6f9fd" />
          <stop offset="0.18" stopColor="#ced4dd" />
          <stop offset="0.40" stopColor="#9aa0ac" />
          <stop offset="0.52" stopColor="#eaeff6" />
          <stop offset="0.66" stopColor="#878d9a" />
          <stop offset="0.82" stopColor="#c7ced9" />
          <stop offset="1" stopColor="#dbe7f6" />
        </linearGradient>

        {/* moving specular band */}
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.72" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* electric-blue light for the X */}
        <radialGradient id={id("xglow")}>
          <stop offset="0" stopColor="#eaf3ff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#2E7DFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#2E7DFF" stopOpacity="0" />
        </radialGradient>

        <radialGradient id={id("dot")}>
          <stop offset="0" stopColor="#eaf4ff" />
          <stop offset="0.5" stopColor="#6fb0ff" />
          <stop offset="1" stopColor="#2E7DFF" />
        </radialGradient>

        {/* soft blue glow beneath the letters */}
        <filter id={id("lglow")} x="-15%" y="-25%" width="130%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#2E7DFF" floodOpacity="0.32" />
        </filter>
        <filter id={id("soft")} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        {/* shared geometry — thin geometric strokes */}
        <g id={id("letters")} fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
          <path d="M80 50 V190 Q80 210 100 210 H184" />
          <path d="M360 50 V140 C360 185 386 210 415 210 C444 210 470 185 470 140 V50" />
          <path d="M640 50 L760 210 M760 50 L640 210" />
          <path d="M965 50 L905 210 M965 50 L1025 210" />
        </g>

        <mask id={id("mask")}>
          <use href={`#${id("letters")}`} stroke="#fff" />
        </mask>
      </defs>

      {/* base blue reflection pooled at the feet */}
      <ellipse cx="560" cy="222" rx="470" ry="26" fill="#2E7DFF" opacity="0.14" filter={`url(#${id("soft")})`} />

      {/* chrome letters */}
      <use href={`#${id("letters")}`} stroke={`url(#${id("chrome")})`} filter={`url(#${id("lglow")})`} />

      {/* electric-blue light crossing the X */}
      <circle cx="700" cy="130" r="46" fill={`url(#${id("xglow")})`} filter={`url(#${id("soft")})`} />
      <circle cx="700" cy="130" r="9" fill="#eaf4ff" filter={`url(#${id("soft")})`} opacity="0.9" />

      {/* the A dot */}
      <circle cx="1064" cy="200" r="17" fill="#2E7DFF" opacity="0.5" filter={`url(#${id("soft")})`} />
      <circle cx="1064" cy="200" r="7" fill={`url(#${id("dot")})`} />

      {/* slow reflection sweep, clipped to the letters */}
      {animated && (
        <g mask={`url(#${id("mask")})`}>
          <rect className="luxa-sheen" x="0" y="0" width="300" height="260" fill={`url(#${id("sheen")})`} />
        </g>
      )}
    </svg>
  );
}
