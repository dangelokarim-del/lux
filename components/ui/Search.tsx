import { Search as SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";

/** Full search input. */
export function Search({
  placeholder = "Search",
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      type="search"
      placeholder={placeholder}
      icon={<SearchIcon size={15} />}
      className={cn(className)}
      {...props}
    />
  );
}

/** Compact command-bar trigger with a keyboard hint (opens search elsewhere). */
export function SearchTrigger({
  shortcut = "⌘K",
  label = "Search",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { shortcut?: string; label?: string }) {
  return (
    <button
      className={cn(
        "focus-ring flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-white/[0.02] px-3 py-2 text-[13px] text-ink-3 transition-colors hover:border-line-2 hover:text-ink-2",
        className
      )}
      {...props}
    >
      <SearchIcon size={15} />
      <span>{label}</span>
      <kbd className="ml-3 rounded border border-line-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-3">
        {shortcut}
      </kbd>
    </button>
  );
}
