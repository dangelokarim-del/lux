import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-[var(--radius-control)] border border-line-2 bg-bg-elev text-[14px] text-ink outline-none transition-colors duration-200 placeholder:text-ink-4 focus:border-accent disabled:opacity-50";

/** Labelled wrapper with optional hint / error. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  className,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-[12px] text-ink-2">
          {label}
        </label>
      )}
      {children}
      {(error || hint) && (
        <p className={cn("text-[12px]", error ? "text-urgent" : "text-ink-3")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3">
            {icon}
          </span>
          <input
            ref={ref}
            className={cn(fieldBase, "h-10 pl-10 pr-3.5", invalid && "border-urgent focus:border-urgent", className)}
            {...props}
          />
        </div>
      );
    }
    return (
      <input
        ref={ref}
        className={cn(fieldBase, "h-10 px-3.5", invalid && "border-urgent focus:border-urgent", className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, "min-h-24 px-3.5 py-2.5 resize-y", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";
