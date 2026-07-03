"use client";

/**
 * A premium villa thumbnail rendered entirely in SVG — a luxury property at dusk
 * (warm sky, sea, a lit villa and a pool). No external images, so it stays
 * self-contained and on-brand, and tints subtly to the villa's live status.
 */
import { VILLA_STATE_META, type VillaState } from "@/lib/live/engine";

export function VillaThumb({ state, seed = 0, className, radius = 0 }: { state: VillaState; seed?: number; className?: string; radius?: number }) {
  const hex = VILLA_STATE_META[state].hex;
  const id = `vt${seed}`;
  const jog = (n: number) => ((Math.imul(seed + 1, 2654435761 + n) >>> 0) % 100) / 100;
  return (
    <svg viewBox="0 0 200 96" preserveAspectRatio="xMidYMid slice" className={className} style={{ borderRadius: radius }}>
      <defs>
        <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12203c" />
          <stop offset="52%" stopColor="#26324f" />
          <stop offset="72%" stopColor="#7c6a86" />
          <stop offset="100%" stopColor="#caa07e" />
        </linearGradient>
        <linearGradient id={`${id}sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b98f76" />
          <stop offset="100%" stopColor="#1a2f4a" />
        </linearGradient>
        <radialGradient id={`${id}sun`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffdca8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffdca8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sky + sun */}
      <rect width="200" height="96" fill={`url(#${id}sky)`} />
      <circle cx={70 + jog(1) * 60} cy="60" r="34" fill={`url(#${id}sun)`} />
      {/* distant hills */}
      <path d="M0,58 C40,50 70,56 100,52 C140,47 170,55 200,50 L200,64 L0,64 Z" fill="#233650" />
      {/* sea */}
      <rect y="64" width="200" height="32" fill={`url(#${id}sea)`} />
      <g opacity="0.4" strokeWidth="0.7">
        <line x1="16" y1="72" x2="52" y2="72" stroke="#e9d3bd" />
        <line x1="120" y1="78" x2="176" y2="78" stroke="#bfe0f2" />
      </g>

      {/* villa silhouette */}
      <g>
        <rect x="96" y="46" width="70" height="22" fill="#0e1626" />
        <rect x="120" y="38" width="40" height="10" fill="#111c30" />
        {/* warm windows */}
        <rect x="104" y="52" width="6" height="6" fill="#ffd9a0" opacity="0.9" />
        <rect x="116" y="52" width="6" height="6" fill="#ffd9a0" opacity="0.8" />
        <rect x="140" y="42" width="6" height="5" fill="#ffe6bd" opacity="0.85" />
        <rect x="150" y="42" width="6" height="5" fill="#ffe6bd" opacity="0.7" />
        {/* pool */}
        <rect x="30" y="74" width="52" height="9" rx="4" fill="#2f6f9e" opacity="0.75" />
        <rect x="34" y="76" width="30" height="2" rx="1" fill="#bfe0f2" opacity="0.6" />
      </g>

      {/* status tint at the top edge */}
      <rect width="200" height="3" fill={hex} opacity="0.9" />
      <rect width="200" height="96" fill={hex} opacity="0.05" />
    </svg>
  );
}
