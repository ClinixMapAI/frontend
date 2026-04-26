import { FacilityCard } from "./FacilityCard";
import { FacilityCardSkeleton } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { useFacilityStore } from "@/store/useFacilityStore";
import type { Facility } from "@/types/facility";
import { getFacilityId } from "@/utils/format";

interface FacilityListProps {
  facilities: Facility[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  startRank?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function FacilityList({
  facilities,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  startRank = 1,
  emptyTitle = "No facilities matched your filters",
  emptyDescription = "Try broadening your keywords, removing the location, or lowering the minimum score.",
}: FacilityListProps) {
  const openFacility = useFacilityStore((state) => state.openFacility);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <FacilityCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p className="font-semibold">We couldn’t load facilities right now.</p>
        <p className="mt-1 text-red-600/90">
          {errorMessage ?? "The backend returned an unexpected error."}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
        <p className="font-display text-lg font-semibold text-ink-900">
          {emptyTitle}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {facilities.map((facility, index) => (
        <FacilityCard
          key={getFacilityId(facility)}
          facility={facility}
          rank={startRank + index}
          onAnalyze={(target) => openFacility(target)}
        />
      ))}
    </div>
  );
}
