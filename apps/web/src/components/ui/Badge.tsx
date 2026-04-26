import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

type BadgeTone = "neutral" | "gold" | "success" | "warning" | "danger" | "ink";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-700 border-ink-200",
  gold: "bg-gold-50 text-gold-700 border-gold-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  ink: "bg-ink-900 text-white border-ink-900",
};

export function Badge({ className, tone = "neutral", icon, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
