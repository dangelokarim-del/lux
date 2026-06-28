import { cn } from "@/lib/utils";

/** Semantic table for tabular pages. Wrap in <Card> for the panel frame. */
export function Table({ className, children }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-left", className)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line">{children}</tr>
    </thead>
  );
}

export function Th({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-4",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-line transition-colors last:border-0 hover:bg-white/[0.02]",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Td({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-5 py-4 text-[13px] text-ink-2 align-middle", className)} {...props}>
      {children}
    </td>
  );
}

/**
 * Shared list row — divider + hover, used by list-style panels
 * (requests, team, etc.) so they all behave identically.
 */
export function Row({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.02]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
