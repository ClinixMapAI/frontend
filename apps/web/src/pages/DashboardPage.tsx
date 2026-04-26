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
import { Typewriter } from "@/components/ui/Typewriter";
import { SearchBar } from "@/components/features/SearchBar";
import { FacilityList } from "@/components/features/FacilityList";
import { useNearestFacilities } from "@/hooks/useNearestFacilities";
import { useSearchStore } from "@/store/useSearchStore";
import { ApiError } from "@/types/api";
import { formatDistanceKm } from "@/utils/format";

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

  const errorMessage =
    query.error instanceof ApiError ? query.error.message : undefined;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-36 sm:px-6 sm:pb-32">
      {shouldSearch ? (
        <div key={keyword.trim()} className="animate-fade-in space-y-6 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge tone="neutral" className="mb-2">
                <SearchIcon size={10} />
                {keyword.trim()}
              </Badge>
              <h2 className="font-display text-xl font-semibold text-ink-900">
                Nearest top-ranked facilities
              </h2>
              <p className="mt-0.5 text-xs text-ink-500">
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
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500">
                  <HospitalIcon size={11} />
                  Showing
                </div>
                <p className="mt-1 font-mono text-lg font-semibold text-ink-900">
                  {stats.count}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-400">
                  {cacheRows !== null ? `of ${cacheRows} cached` : "facilities"}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500">
                  <MapPinIcon size={11} />
                  Closest
                </div>
                <p className="mt-1 font-mono text-lg font-semibold text-ink-900">
                  {stats.closest !== null
                    ? formatDistanceKm(stats.closest)
                    : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ink-500">
                  <ChartIcon size={11} />
                  Top score
                </div>
                <p className="mt-1 font-mono text-lg font-semibold text-ink-900">
                  {stats.top !== null
                    ? stats.top > 1
                      ? stats.top.toFixed(0)
                      : (stats.top * 100).toFixed(0)
                    : "—"}
                </p>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {explanation && !query.isLoading && (
              <motion.section
                key={explanation}
                aria-label="AI explanation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mx-auto mb-6 w-full max-w-2xl rounded-3xl border border-brand-200 bg-brand-100 p-5 shadow-soft sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <motion.span
                    initial={{ scale: 0.6, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.45, ease: "backOut" }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-brand-600 text-white"
                  >
                    <SparkleIcon size={14} />
                  </motion.span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                      Why these results
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-800 sm:text-[15px]">
                      <Typewriter text={explanation} speed={40} />
                    </p>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {searchNote && !query.isLoading && (
            <p
              className="rounded-2xl border border-ink-200 bg-ink-50 px-3 py-2.5 text-xs text-ink-600"
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
        <div className="flex min-h-[65vh] items-center justify-center">
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
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              Start by describing your medical need
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink-500 sm:text-base">
              Try{" "}
              <span className="font-medium text-ink-700">
                “ICU with oxygen”
              </span>{" "}
              or{" "}
              <span className="font-medium text-ink-700">
                “child breathing problem”
              </span>
              . We’ll rank the nearest facilities by quality and explain the top
              matches.
            </p>
          </section>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6 sm:py-4">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
