import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? props.name;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "group flex items-center gap-2 rounded-2xl border bg-white px-3.5 transition",
            "shadow-soft",
            error
              ? "border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-200"
              : "border-ink-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200",
          )}
        >
          {leftIcon && (
            <span className="text-ink-400 group-focus-within:text-ink-700">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none",
              className,
            )}
            {...props}
          />
          {rightIcon && <span className="text-ink-400">{rightIcon}</span>}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
