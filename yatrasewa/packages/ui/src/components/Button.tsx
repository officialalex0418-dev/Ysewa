import * as React from "react";
import { cn } from "../lib/cn.js";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-ys-emerald)] hover:bg-[var(--color-ys-emerald-hover)] text-white shadow-sm disabled:bg-[#C8EADB]",
  secondary: "bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)] hover:bg-[#D5F8E3]",
  ghost: "bg-transparent text-[var(--color-ys-emerald)] hover:bg-[var(--color-ys-mint-tint)]",
  danger: "bg-[var(--color-ys-danger)] hover:brightness-95 text-white shadow-sm",
  outline:
    "bg-white border border-[var(--color-ys-emerald)] text-[var(--color-ys-emerald)] hover:bg-[var(--color-ys-mint-tint)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-[6px]",
  md: "h-10 px-4 text-sm rounded-[var(--radius-btn)]",
  lg: "h-12 px-6 text-sm font-semibold rounded-[var(--radius-btn)]",
  xl: "h-14 px-7 text-base font-semibold rounded-[var(--radius-btn)]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "lg", fullWidth, loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ys-emerald)]/50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
