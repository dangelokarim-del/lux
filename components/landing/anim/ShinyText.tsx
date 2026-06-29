"use client";

import { cn } from "@/lib/utils";

/**
 * React Bits — Shiny Text, retuned to LUXA. A slow metallic highlight sweeps
 * across the text, echoing the wordmark sheen. Inherits the parent's font /
 * tracking, so it drops into eyebrows and labels unchanged. Static under
 * prefers-reduced-motion (handled by the `.shiny-text` class).
 */
export function ShinyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("shiny-text", className)}>{children}</span>;
}
