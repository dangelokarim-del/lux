"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The LUXA wordmark — handcrafted brushed-aluminium letterforms.
 *
 * Finish is layered for real dimension: a banded chrome gradient (body),
 * a centred specular shine (the polished-tube highlight), a top-edge light
 * and a bottom-edge shadow (the microscopic bevel). Electric blue appears in
 * exactly two contained places: the X intersection and the A dot. An extremely
 * slow metallic reflection drifts across the chrome (~12s), clipped to the
 * letters only. Elegant even when completely static.
 *
 * Geometry: rounded-foot L · rounded-bottom U · crossed X · open-peak A.
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
  const letters = `#${id("letters")}`;

  return (
    <svg
      viewBox="0 0 1240 272"
      role="img"
      aria-label={title}
      shapeRendering="geometricPrecision"
      preserveAspectRatio="xMidYMid meet"
      style={{ aspectRatio: "1240 / 272" }}
      className={cn("block h-auto w-full", className)}
    >
      <defs>
        {/* banded polished-chrome gradient (vertical) */}
        <linearGradient id={id("chrome")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.13" stopColor="#d3d8e0" />
          <stop offset="0.33" stopColor="#828893" />
          <stop offset="0.45" stopColor="#f1f4f8" />
          <stop offset="0.60" stopColor="#757b86" />
          <stop offset="0.80" stopColor="#c6ccd5" />
          <stop offset="1" stopColor="#d8dde4" />
        </linearGradient>

        {/* top-edge light — the bevel highlight */}
        <linearGradient id={id("tophi")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.16" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* bottom-edge shadow — the bevel shade */}
        <linearGradient id={id("botsh")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopOpacity="0" />
          <stop offset="0.8" stopColor="#171a1f" stopOpacity="0" />
          <stop offset="1" stopColor="#13151a" stopOpacity="0.55" />
        </linearGradient>

        {/* ultra-subtle reflection band */}
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* contained electric blue — X intersection */}
        <radialGradient id={id("xglow")}>
          <stop offset="0" stopColor="#eaf3ff" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#3f8bff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#2E7DFF" stopOpacity="0" />
        </radialGradient>

        {/* the A dot — muted, not glowing */}
        <radialGradient id={id("dot")}>
          <stop offset="0" stopColor="#bfdcff" />
          <stop offset="0.6" stopColor="#3f86e6" />
          <stop offset="1" stopColor="#2E7DFF" />
        </radialGradient>

        <filter id={id("soft")} x="-160%" y="-160%" width="420%" height="420%">
          <feGaussianBlur stdDeviation="2" />
        </filter>

        {/* shared geometry — handcrafted, wide premium tracking */}
        <g id={id("letters")} fill="none" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round">
          <path d="M108 56 V196 Q108 216 128 216 H214" />
          <path d="M372 56 V146 C372 192 399 216 430 216 C461 216 488 192 488 146 V56" />
          <path d="M660 56 L780 216 M780 56 L660 216" />
          <path d="M1000 56 L940 216 M1000 56 L1060 216" />
        </g>

        <mask id={id("mask")}>
          <use href={letters} stroke="#fff" />
        </mask>
      </defs>

      {/* chrome body */}
      <use href={letters} stroke={`url(#${id("chrome")})`} />
      {/* centred specular shine — the polished tube */}
      <use href={letters} stroke="#ffffff" strokeWidth="4" opacity="0.26" />
      {/* bevel: top light, bottom shade */}
      <use href={letters} stroke={`url(#${id("tophi")})`} />
      <use href={letters} stroke={`url(#${id("botsh")})`} />

      {/* X intersection — contained light + vertical lens streak */}
      <circle cx="720" cy="136" r="18" fill={`url(#${id("xglow")})`} filter={`url(#${id("soft")})`} />
      <ellipse cx="720" cy="136" rx="2.4" ry="15" fill="#ffffff" opacity="0.85" filter={`url(#${id("soft")})`} />
      <circle cx="720" cy="136" r="3" fill="#ffffff" opacity="0.95" />

      {/* A dot — muted blue */}
      <circle cx="1098" cy="206" r="8" fill="#2E7DFF" opacity="0.22" filter={`url(#${id("soft")})`} />
      <circle cx="1098" cy="206" r="5" fill={`url(#${id("dot")})`} />

      {/* extremely slow metallic reflection, clipped to the chrome */}
      {animated && (
        <g mask={`url(#${id("mask")})`}>
          <rect className="luxa-sheen" x="0" y="0" width="230" height="272" fill={`url(#${id("sheen")})`} />
        </g>
      )}
    </svg>
  );
}
