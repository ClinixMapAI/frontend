import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  ChartIcon,
  HospitalIcon,
  MapPinIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { SearchBar } from "@/components/features/SearchBar";
import { FacilityList } from "@/components/features/FacilityList";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearestFacilities } from "@/hooks/useNearestFacilities";
import { useSearchStore } from "@/store/useSearchStore";
import { syncFacilityCache } from "@/services/nearestService";
import { ApiError } from "@/types/api";
import { formatDistanceKm } from "@/utils/format";

export default function DashboardPage() {
  // Subscribe to each slice individually so React re-renders (and React Query
  // re-runs) whenever any filter changes. This is the bug that previously
  // made the search bar feel inert.
  const keyword = useSearchStore((state) => state.keyword);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const minQualityScore = useSearchStore((state) => state.minQualityScore);
  const limit = useSearchStore((state) => state.limit);
  const includeReasoning = useSearchStore((state) => state.includeReasoning);
  const location = useSearchStore((state) => state.location);
  const setLocation = useSearchStore((state) => state.setLocation);
  const setLocating = useSearchStore((state) => state.setLocating);
  const setLocationError = useSearchStore((state) => state.setLocationError);

  const geo = useGeolocation();
  const queryClient = useQueryClient();

  // Auto-detect the user's location once on first visit (best-effort, silent
  // on denial — the store falls back to a default location).
  useEffect(() => {
    if (location.source !== "default") return;
    let cancelled = false;
    setLocating(true);
    geo.request().then((result) => {
      if (cancelled) return;
      if (result) {
        setLocation({
          latitude: result.latitude,
          longitude: result.longitude,
          source: "browser",
          label: "Detected location",
        });
      } else {
        setLocating(false);
        if (geo.error) setLocationError(geo.error);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoize options against the actual reactive slices so React Query's
  // queryKey changes whenever something the user can edit changes.
  const options = useMemo(
    () => ({
      latitude: location.latitude,
      longitude: location.longitude,
      radius_km: radiusKm ?? undefined,
      limit,
      min_quality_score: minQualityScore ?? undefined,
      keyword: keyword.trim() || undefined,
      include_reasoning: includeReasoning,
    }),
    [
      location.latitude,
      location.longitude,
      radiusKm,
      limit,
      minQualityScore,
      keyword,
      includeReasoning,
    ],
  );

  const query = useNearestFacilities({ options });

  const refreshMutation = useMutation({
    mutationFn: () => syncFacilityCache(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities", "nearest"] });
    },
  });

  const facilities = query.data?.results ?? [];
  const explanation = query.data?.explanation ?? null;
  const cacheRows = query.data?.cache?.rows ?? null;

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
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-ink-100 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-6 text-white shadow-soft sm:p-10">
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div>
            <Badge
              tone="gold"
              className="bg-gold-500/20 text-gold-200 border-gold-400/30"
            >
              <SparkleIcon size={10} />
              AI-powered
            </Badge>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
              The nearest, highest-quality healthcare{" "}
              <span className="text-gold-400">on demand</span>.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-ink-200 sm:text-base">
              We rank facilities by a composite of geographic proximity and
              quality score from the Databricks dataset, and explain the top
              picks in plain English.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link to="/agent">
                <Button
                  variant="secondary"
                  rightIcon={<ArrowRightIcon size={14} />}
                >
                  Try the AI agent
                </Button>
              </Link>
              <a
                href="#facilities"
                className="text-xs text-ink-300 hover:text-white"
              >
                Or browse the catalog ↓
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold-300">
                <HospitalIcon size={12} />
                Showing
              </div>
              <p className="mt-1 font-mono text-2xl font-semibold text-white">
                {stats?.count ?? "—"}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-300">
                {cacheRows !== null ? `of ${cacheRows} cached` : "facilities"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold-300">
                <MapPinIcon size={12} />
                Closest
              </div>
              <p className="mt-1 font-mono text-2xl font-semibold text-white">
                {stats?.closest !== null && stats?.closest !== undefined
                  ? formatDistanceKm(stats.closest)
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-gold-300">
                <ChartIcon size={12} />
                Top score
              </div>
              <p className="mt-1 font-mono text-2xl font-semibold text-white">
                {stats?.top !== null && stats?.top !== undefined
                  ? (stats.top > 1
                      ? stats.top.toFixed(0)
                      : (stats.top * 100).toFixed(0))
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <SearchBar
        onForceRefresh={() => refreshMutation.mutate()}
        isRefreshing={refreshMutation.isPending}
      />

      {explanation && (
        <section
          aria-label="AI explanation"
          className="rounded-3xl border border-gold-200 bg-gold-50/60 p-5 shadow-soft"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-ink-900 text-gold-400">
              <SparkleIcon size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-700">
                Why these results
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-800">
                {explanation}
              </p>
            </div>
          </div>
        </section>
      )}

      <section id="facilities" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink-900">
              Nearest top-ranked facilities
            </h2>
            <p className="text-sm text-ink-500">
              Centered at{" "}
              <span className="font-mono">
                {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
              </span>{" "}
              {radiusKm
                ? `within ${radiusKm} km`
                : "with no radius limit"}
              {keyword.trim() ? ` · matching "${keyword.trim()}"` : ""}
            </p>
          </div>
          {query.isFetching && !query.isLoading && (
            <Badge tone="neutral">Refreshing…</Badge>
          )}
        </div>

        <FacilityList
          facilities={facilities}
          isLoading={query.isLoading}
          isError={query.isError}
          errorMessage={errorMessage}
          onRetry={() => query.refetch()}
          startRank={1}
          emptyTitle="No facilities matched your filters"
          emptyDescription="Try widening the radius, lowering the minimum quality score, or clearing the keyword."
        />
      </section>
    </div>
  );
}
