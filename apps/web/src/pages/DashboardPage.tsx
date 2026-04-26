import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/Badge";
import {
  ChartIcon,
  HospitalIcon,
  MapPinIcon,
  SearchIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { AiInsightPanel } from "@/components/features/AiInsightPanel";
import { SearchBar } from "@/components/features/SearchBar";
import { FacilityList } from "@/components/features/FacilityList";
import { useNearestFacilities } from "@/hooks/useNearestFacilities";
import { useSearchStore } from "@/store/useSearchStore";
import { ApiError } from "@/types/api";
import { formatDistanceKm, getTrustFlag } from "@/utils/format";

export default function DashboardPage() {
  // Subscribe to each slice individually so React re-renders (and React Query
  // re-runs) whenever any filter changes.
  const keyword = useSearchStore((state) => state.keyword);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const minQualityScore = useSearchStore((state) => state.minQualityScore);
  const limit = useSearchStore((state) => state.limit);
  const includeReasoning = useSearchStore((state) => state.includeReasoning);
  const location = useSearchStore((state) => state.location);
  const deviceLocation = useSearchStore((state) => state.deviceLocation);

  const searchOrigin = deviceLocation ?? location;

  // Only run the API call once the user has actually typed a query.
  const shouldSearch = keyword.trim().length > 0;

  // Memoize options against the actual reactive slices so React Query's
  // queryKey changes whenever something the user can edit changes.
  const options = useMemo(
    () => ({
      latitude: searchOrigin.latitude,
      longitude: searchOrigin.longitude,
      radius_km: radiusKm ?? undefined,
      limit,
      min_quality_score: minQualityScore ?? undefined,
      keyword: keyword.trim() || undefined,
      include_reasoning: includeReasoning,
    }),
    [
      searchOrigin.latitude,
      searchOrigin.longitude,
      radiusKm,
      limit,
      minQualityScore,
      keyword,
      includeReasoning,
    ],
  );

  const query = useNearestFacilities({
    options,
    enabled: shouldSearch,
  });

  const facilities = shouldSearch ? query.data?.results ?? [] : [];
  const explanation = shouldSearch ? query.data?.explanation ?? null : null;
  const searchNote = shouldSearch ? query.data?.search_note ?? null : null;
  const cacheRows = query.data?.cache?.rows ?? null;

  // [DEBUG] Trace the data the dashboard is about to render. Remove once the
  // search loop is confirmed working.
  useEffect(() => {
    if (!shouldSearch) return;
    // eslint-disable-next-line no-console
    console.debug("[search] render", {
      keyword: keyword.trim(),
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      facilitiesCount: facilities.length,
      cacheRows,
      hasExplanation: explanation !== null,
    });
  }, [
    shouldSearch,
    keyword,
    query.isLoading,
    query.isFetching,
    query.isError,
    facilities.length,
    cacheRows,
    explanation,
  ]);

  const stats = useMemo(() => {
    if (!facilities.length) return null;
    const distances = facilities
      .map((f) => f.distance_km)
      .filter((value): value is number => typeof value === "number");
    const composites = facilities
      .map((f) => f.composite_score)
      .filter((value): value is number => typeof value === "number");
    const closest = distances.length > 0 ? Math.min(...distances) : null;
    const top = composites.length > 0 ? Math.max(...composites) : null;
    const avg =
      composites.length > 0
        ? composites.reduce((sum, v) => sum + v, 0) / composites.length
        : null;
    return { count: facilities.length, closest, top, avg };
  }, [facilities]);

  const aiInsight = useMemo(() => {
    if (!facilities.length) return null;
    const lowTrust = facilities.filter((f) => getTrustFlag(f) === "LOW").length;
    const inconsistent = facilities.filter((f) => {
      const r = f.raw as Record<string, unknown> | undefined;
      const inc = r?.inconsistency;
      return typeof inc === "string" && inc.trim().length > 0;
    }).length;
    if (!lowTrust && !inconsistent) return null;
    const parts: string[] = [];
    if (lowTrust) {
      parts.push(
        `${lowTrust} ${lowTrust === 1 ? "has" : "have"} a low trust flag — review carefully`,
      );
    }
    if (inconsistent) {
      parts.push(
        `${inconsistent} ${inconsistent === 1 ? "has" : "have"} recorded data inconsistencies`,
      );
    }
    return parts.join(" · ");
  }, [facilities]);

  const errorMessage =
    query.error instanceof ApiError ? query.error.message : undefined;

  return (
    <div className="mx-auto w-full max-w-3xl px-2 pb-[calc(var(--dashboard-search-dock-height)+20px+1rem+env(safe-area-inset-bottom,0px))] xs:px-4 sm:px-6">
      {shouldSearch ? (
        <div key={keyword.trim()} className="animate-fade-in space-y-6 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge tone="neutral" className="mb-2">
                <SearchIcon size={10} />
                {keyword.trim()}
              </Badge>
              <h2 className="font-display text-base font-semibold text-ink-900 xs:text-lg sm:text-xl dark:text-ink-50">
                Nearest top-ranked facilities
              </h2>
              <p className="mt-0.5 text-[11px] text-ink-500 xs:text-xs dark:text-ink-400">
                {deviceLocation ? "Distances from your location" : "Centered at"}{" "}
                <span className="font-mono">
                  {searchOrigin.latitude.toFixed(3)},{" "}
                  {searchOrigin.longitude.toFixed(3)}
                </span>{" "}
                {radiusKm ? `within ${radiusKm} km` : "with no radius limit"}
              </p>
            </div>
            {query.isFetching && !query.isLoading && (
              <Badge tone="neutral">Refreshing…</Badge>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-1.5 watch:grid-cols-1 watch:gap-2 sm:gap-3">
              <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-soft dark:border-ink-700 dark:bg-ink-900/80 dark:shadow-soft-dark">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  <HospitalIcon size={11} />
                  Showing
                </div>
                <p className="mt-1 font-mono text-lg font-semibold text-ink-900 dark:text-ink-50">
                  {stats.count}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-400 dark:text-ink-500">
                  {cacheRows !== null ? `of ${cacheRows} cached` : "facilities"}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-soft dark:border-ink-700 dark:bg-ink-900/80 dark:shadow-soft-dark">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  <MapPinIcon size={11} />
                  Closest
                </div>
                <p className="mt-1 font-mono text-lg font-semibold text-ink-900 dark:text-ink-50">
                  {stats.closest !== null
                    ? formatDistanceKm(stats.closest)
                    : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-soft dark:border-ink-700 dark:bg-ink-900/80 dark:shadow-soft-dark">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  <ChartIcon size={11} />
                  Top score
                </div>
                <p className="mt-1 font-mono text-lg font-semibold text-ink-900 dark:text-ink-50">
                  {stats.top !== null
                    ? stats.top > 1
                      ? stats.top.toFixed(0)
                      : (stats.top * 100).toFixed(0)
                    : "—"}
                </p>
              </div>
            </div>
          )}

          {aiInsight && !query.isLoading && (
            <p
              className="rounded-2xl border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-xs leading-relaxed text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100"
              role="status"
            >
              <span className="font-semibold">AI insight:</span> Showing{" "}
              {facilities.length} facilities. {aiInsight}.
            </p>
          )}

          <AnimatePresence mode="wait">
            {explanation && !query.isLoading && (
              <AiInsightPanel
                explanation={explanation}
                keyword={keyword.trim()}
                cacheRows={cacheRows}
                facilities={facilities}
              />
            )}
          </AnimatePresence>

          {searchNote && !query.isLoading && (
            <p
              className="rounded-2xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs text-ink-600 dark:border-ink-600 dark:bg-ink-800/60 dark:text-ink-300"
              role="status"
            >
              {searchNote}
            </p>
          )}

          <div id="facilities">
            <FacilityList
              facilities={facilities}
              isLoading={query.isLoading}
              isError={query.isError}
              errorMessage={errorMessage}
              onRetry={() => query.refetch()}
              startRank={1}
              emptyTitle={
                cacheRows === 0
                  ? "Facility cache is empty"
                  : "No facilities matched your search"
              }
              emptyDescription={
                cacheRows === 0
                  ? "The backend has no facilities to rank yet. Sync the Databricks cache (POST /api/facilities/cache/sync) and try again."
                  : "Try widening the radius, lowering the minimum quality score, or rephrasing the keyword."
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-[min(65vh,calc(100dvh-12rem))] watch:min-h-[min(50vh,calc(100dvh-10rem))] items-center justify-center px-0.5">
          <section
            aria-label="Search prompt"
            className="w-full animate-fade-in text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-soft">
              <SearchIcon size={22} />
            </div>
            <Badge tone="brand" className="mt-4">
              <SparkleIcon size={10} />
              Search-driven
            </Badge>
            <h2 className="mt-3 font-display text-xl font-semibold text-ink-900 xs:text-2xl sm:text-3xl dark:text-ink-50">
              Start by describing your medical need
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-ink-500 xs:text-sm sm:text-base dark:text-ink-400">
              Try{" "}
              <span className="font-medium text-ink-700 dark:text-ink-200">
                “ICU with oxygen”
              </span>{" "}
              or{" "}
              <span className="font-medium text-ink-700 dark:text-ink-200">
                “child breathing problem”
              </span>
              . We’ll rank the nearest facilities by quality and explain the top
              matches.
            </p>
          </section>
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-4 sm:pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-ink-200/55 bg-white p-3 shadow-md shadow-ink-900/[0.07] dark:border-ink-700/70 dark:bg-ink-950 dark:shadow-lg dark:shadow-black/25"
        >
          <SearchBar />
        </motion.div>
      </div>
    </div>
  );
}
