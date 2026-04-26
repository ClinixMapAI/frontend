import type { ReactNode } from "react";

import { AlertTriangleIcon } from "@/components/ui/icons";
import { cn } from "@/utils/cn";

interface RiskNoticeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Clinical-style risk callout: label, icon row, and message. Keeps spacing
 * predictable for use inside cards and forms.
 */
export function RiskNotice({ children, className }: RiskNoticeProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 shadow-sm",
        "dark:border-amber-800/60 dark:bg-amber-950 dark:shadow-soft-dark",
        className,
      )}
    >
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
        Risk detected
      </p>
      <div className="flex gap-3">
        <div
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-amber-200 bg-amber-100 dark:border-amber-800/50 dark:bg-amber-900"
          aria-hidden
        >
          <AlertTriangleIcon
            size={18}
            className="text-amber-700 dark:text-amber-300"
          />
        </div>
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-amber-950 dark:text-amber-50">
          {children}
        </p>
      </div>
    </div>
  );
}
