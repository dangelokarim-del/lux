/**
 * Single source of truth for semantic status colors across the platform.
 * Every badge, pill, dot and accent pulls from here — never hardcode a status
 * color in a component.
 */
export type Tone = "neutral" | "accent" | "urgent" | "warn" | "ok" | "muted";

export interface ToneStyle {
  text: string;
  border: string;
  bg: string;
  dot: string;
}

export const tones: Record<Tone, ToneStyle> = {
  neutral: {
    text: "text-ink",
    border: "border-line-2",
    bg: "bg-white/[0.05]",
    dot: "bg-ink-2",
  },
  accent: {
    text: "text-accent",
    border: "border-[rgba(46,125,255,0.3)]",
    bg: "bg-accent-soft",
    dot: "bg-accent",
  },
  urgent: {
    text: "text-urgent",
    border: "border-[rgba(255,92,92,0.25)]",
    bg: "bg-[rgba(255,92,92,0.07)]",
    dot: "bg-urgent",
  },
  warn: {
    text: "text-warn",
    border: "border-[rgba(245,181,61,0.25)]",
    bg: "bg-[rgba(245,181,61,0.07)]",
    dot: "bg-warn",
  },
  ok: {
    text: "text-ok",
    border: "border-[rgba(74,212,138,0.25)]",
    bg: "bg-[rgba(74,212,138,0.07)]",
    dot: "bg-ok",
  },
  muted: {
    text: "text-ink-3",
    border: "border-line",
    bg: "bg-transparent",
    dot: "bg-ink-4",
  },
};
