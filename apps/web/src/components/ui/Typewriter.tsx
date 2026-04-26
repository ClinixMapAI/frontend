import { useEffect, useMemo, useState } from "react";

import { cn } from "@/utils/cn";

interface TypewriterProps {
  text: string;
  /** Milliseconds between revealed words. */
  speed?: number;
  /** Optional className applied to the wrapper span. */
  className?: string;
  /** Optional className applied to the trailing cursor span. */
  cursorClassName?: string;
  /** When true, the cursor keeps blinking even after the text is fully typed. */
  keepCursor?: boolean;
}

/**
 * Renders text progressively, one word at a time, with a blinking cursor.
 * Resets cleanly when the source text changes (e.g. a new AI explanation).
 */
export function Typewriter({
  text,
  speed = 45,
  className,
  cursorClassName,
  keepCursor = true,
}: TypewriterProps) {
  // Split keeping whitespace as separate tokens so word breaks are preserved.
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
  }, [text]);

  useEffect(() => {
    if (revealed >= tokens.length) return;
    const id = window.setTimeout(() => setRevealed((n) => n + 1), speed);
    return () => window.clearTimeout(id);
  }, [revealed, tokens.length, speed]);

  const isComplete = revealed >= tokens.length;
  const visible = tokens.slice(0, revealed).join("");

  return (
    <span aria-live="polite" className={cn("inline", className)}>
      {visible}
      {(!isComplete || keepCursor) && (
        <span
          aria-hidden
          className={cn(
            "ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-current align-baseline",
            "animate-pulse",
            isComplete && "opacity-60",
            cursorClassName,
          )}
        />
      )}
    </span>
  );
}
