import * as React from "react";
import { cn } from "../lib/cn.js";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leadingIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-1.5 block text-xs font-semibold text-[var(--color-ys-ink-muted)]">{label}</label>}
        <div className="relative">
          {leadingIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ys-ink-subtle)]">{leadingIcon}</span>
          )}
          <input
            ref={ref}
            className={cn(
              "h-11 w-full rounded-[var(--radius-btn)] border border-[var(--color-ys-border)] bg-white px-3 text-sm text-[var(--color-ys-ink)] placeholder:text-[var(--color-ys-ink-subtle)] focus:border-[var(--color-ys-emerald)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ys-emerald)]/20",
              leadingIcon && "pl-10",
              error && "border-[var(--color-ys-danger)] focus:border-[var(--color-ys-danger)] focus:ring-[var(--color-ys-danger)]/20",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[var(--color-ys-danger)]">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
