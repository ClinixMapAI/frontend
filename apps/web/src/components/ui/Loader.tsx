import { cn } from "@/utils/cn";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 18, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-2 border-ink-300 border-t-ink-900 animate-spin",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}

interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = "Loading…", className }: LoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-sm text-ink-500",
        className,
      )}
    >
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton rounded-2xl", className)} />;
}

export function FacilityCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/3" />
        </div>
        <Skeleton className="h-7 w-16" />
      </div>
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}
