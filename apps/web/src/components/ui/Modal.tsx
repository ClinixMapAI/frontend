import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
}

const sizeStyles: Record<NonNullable<ModalProps["size"]>, string> = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "lg",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Close modal backdrop"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink-900/40 backdrop-blur-sm animate-fade-in dark:bg-black/60"
      />
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-t-3xl bg-white shadow-glow dark:bg-ink-900 dark:shadow-glow-dark",
          "sm:rounded-3xl sm:m-4",
          sizeStyles[size],
          "animate-fade-in",
          className,
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-4 border-b border-ink-100 p-6 dark:border-ink-700">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-xl font-semibold text-ink-900 dark:text-ink-50">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 -mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
              aria-label="Close"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>
        )}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin p-6">
          {children}
        </div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-ink-100 bg-ink-50/60 p-4 dark:border-ink-700 dark:bg-ink-800/50">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
