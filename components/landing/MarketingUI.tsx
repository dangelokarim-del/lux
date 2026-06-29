import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Light marketing palette (Apple-inspired, warm)
 *   bg base      #FAF9F6   warm white
 *   warm panel   #F3EEE4
 *   card         #FFFFFF
 *   ink          #0E0E0F
 *   ink-2        #57565C   soft grey
 *   ink-3        #8B8A90
 *   border       #E7E3DA   warm hairline
 *   champagne    #A9854A   accent text (used sparingly)
 *   champagne fill #F0E8D6
 */

/** Solid black pill — the primary CTA. No blue, ever. */
export function PrimaryPill({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full bg-[#0E0E0F] px-7 text-[15px] font-medium text-white",
        "transition-all duration-200 hover:bg-[#2a2a2c] hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] active:scale-[0.98]",
        className
      )}
    >
      {children}
    </Link>
  );
}

/** Outlined pill — secondary CTA. */
export function SecondaryPill({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-[#D9D4C8] bg-white/40 px-6 text-[15px] font-medium text-[#0E0E0F]",
        "transition-all duration-200 hover:bg-white hover:border-[#C9C2B2] active:scale-[0.98]",
        className
      )}
    >
      {children}
    </Link>
  );
}
