import { cn } from "@/lib/utils";

/** Compact mark + wordmark for nav, sidebar, footer. */
export function Logo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span className="relative grid h-7 w-7 place-items-center rounded-[8px] border border-line-2 bg-bg-elev">
        <span className="block h-3 w-[2px] -translate-x-[3px] rounded bg-white" />
        <span className="absolute block h-3 w-[2px] translate-x-[3px] rounded bg-accent" />
      </span>
      {withWordmark && (
        <span className="text-[17px] font-semibold tracking-[-0.03em]">LUXA</span>
      )}
    </span>
  );
}

/**
 * Large letter-spaced chrome wordmark with the signature accent dot.
 * The hero brand treatment — matches the official LUXA logo.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "chrome inline-flex items-baseline font-semibold leading-none tracking-[0.22em]",
        className
      )}
      aria-label="LUXA"
    >
      LUXA
      <span className="ml-[0.12em] inline-block h-[0.12em] w-[0.12em] translate-y-[-0.04em] rounded-full bg-accent align-baseline shadow-[0_0_12px_2px_rgba(46,125,255,0.7)]" />
    </span>
  );
}
