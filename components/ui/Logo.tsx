import { cn } from "@/lib/utils";

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
        {/* abstract mark — two offset bars, not an icon cliché */}
        <span className="block h-3 w-[2px] -translate-x-[3px] rounded bg-white" />
        <span className="absolute block h-3 w-[2px] translate-x-[3px] rounded bg-accent" />
      </span>
      {withWordmark && (
        <span className="text-[17px] font-semibold tracking-[-0.03em]">LUXA</span>
      )}
    </span>
  );
}
