import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./Loading";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[-0.01em] transition-all duration-200 ease-[var(--ease-premium)] focus-ring disabled:pointer-events-none disabled:opacity-50 select-none active:translate-y-px",
  {
    variants: {
      variant: {
        accent:
          "rounded-[var(--radius-control)] bg-[linear-gradient(180deg,#3d87ff_0%,#2e7dff_100%)] text-white shadow-[var(--shadow-accent)] hover:shadow-[var(--shadow-accent-hover)] hover:brightness-[1.05]",
        secondary:
          "rounded-[var(--radius-control)] border border-line-2 bg-white/[0.02] text-ink hover:bg-white/[0.06] hover:border-white/20",
        ghost:
          "rounded-[var(--radius-control)] text-ink-2 hover:text-ink hover:bg-white/[0.05]",
        subtle:
          "rounded-[var(--radius-control)] bg-white/[0.05] text-ink hover:bg-white/[0.09]",
        danger:
          "rounded-[var(--radius-control)] border border-[rgba(255,92,92,0.3)] bg-[rgba(255,92,92,0.08)] text-urgent hover:bg-[rgba(255,92,92,0.14)]",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-[14px]",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: { variant: "accent", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && <Spinner size={size === "sm" ? 13 : 15} />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
