import { AnimatePresence, motion } from "framer-motion";

import { FacilityCard } from "./FacilityCard";
import { FacilityCardSkeleton } from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { SparkleIcon } from "@/components/ui/icons";
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

function AnalyzingIndicator() {
  return (
    <motion.div
      key="analyzing"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-4"
    >
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-700 shadow-soft dark:border-brand-800/50 dark:bg-ink-900/80 dark:text-brand-300 dark:shadow-soft-dark">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="text-brand-600"
        >
          <SparkleIcon size={14} />
        </motion.span>
        <span className="font-medium">Analyzing</span>
        <span className="ml-1 inline-flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-1 w-1 rounded-full bg-brand-600"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -1, 0] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.18,
              }}
            />
          ))}
        </span>
      </div>

      {Array.from({ length: 3 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1 + index * 0.08,
            duration: 0.35,
            ease: "easeOut",
          }}
        >
          <FacilityCardSkeleton />
        </motion.div>
      ))}
    </motion.div>
  );
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
  const openMap = useFacilityStore((state) => state.openMap);

  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <AnalyzingIndicator />
      </AnimatePresence>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto w-full max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
      >
        <p className="font-semibold">We couldn’t load facilities right now.</p>
        <p className="mt-1 text-red-600/90 dark:text-red-300/90">
          {errorMessage ?? "The backend returned an unexpected error."}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            Retry
          </Button>
        )}
      </motion.div>
    );
  }

  if (facilities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto w-full max-w-2xl rounded-3xl border border-dashed border-ink-200 bg-white/60 p-10 text-center dark:border-ink-600 dark:bg-ink-900/50"
      >
        <p className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">
          {emptyTitle}
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-500 dark:text-ink-400">
          {emptyDescription}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <AnimatePresence initial>
        {facilities.map((facility, index) => (
          <motion.div
            key={getFacilityId(facility)}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              delay: index * 0.1,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <FacilityCard
              facility={facility}
              rank={startRank + index}
              onAnalyze={(target) => openFacility(target)}
              onViewMap={(target) => openMap(target)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
