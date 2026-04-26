import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-ink-100 bg-white shadow-soft " +
            "dark:border-ink-700 dark:bg-ink-900 dark:shadow-soft-dark",
          interactive &&
            "cursor-pointer transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-glow " +
            "dark:hover:border-brand-400 dark:hover:shadow-glow-dark",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 p-5 pb-3", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-t border-ink-100 px-5 py-3 dark:border-ink-700",
        className,
      )}
      {...props}
    />
  );
}
