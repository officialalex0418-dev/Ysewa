import * as React from "react";
import { cn } from "../lib/cn.js";

type BadgeVariant = "emerald" | "mint" | "warning" | "danger" | "info" | "neutral";

const variantMap: Record<BadgeVariant, string> = {
  emerald: "bg-[var(--color-ys-emerald)] text-white",
  mint: "bg-[var(--color-ys-mint-tint)] text-[var(--color-ys-emerald)]",
  warning: "bg-[#FFF1E2] text-[var(--color-ys-warning)]",
  danger: "bg-[#FCE8E8] text-[var(--color-ys-danger)]",
  info: "bg-[#E6EAF6] text-[var(--color-ys-info)]",
  neutral: "bg-[#F1F3F6] text-[var(--color-ys-ink-muted)]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ variant = "neutral", dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-[6px] px-2 py-0.5 text-[11px] font-semibold leading-5", variantMap[variant], className)}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", variant === "emerald" || variant === "mint" ? "bg-[var(--color-ys-emerald)] animate-pulse" : "bg-current")} />}
      {children}
    </span>
  );
}
