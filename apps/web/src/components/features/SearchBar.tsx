import { useEffect, useState } from "react";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loader";
import {
  FilterIcon,
  MapPinIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/ui/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useSearchStore } from "@/store/useSearchStore";

const RADIUS_PRESETS = [
  { label: "Any", value: null },
  { label: "5 km", value: 5 },
  { label: "15 km", value: 15 },
  { label: "30 km", value: 30 },
  { label: "75 km", value: 75 },
];

const LIMIT_OPTIONS = [6, 12, 24, 48];

interface SearchBarProps {
  onForceRefresh?: () => void;
  isRefreshing?: boolean;
}

export function SearchBar({ onForceRefresh, isRefreshing }: SearchBarProps) {
  const keyword = useSearchStore((state) => state.keyword);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const minQualityScore = useSearchStore((state) => state.minQualityScore);
  const limit = useSearchStore((state) => state.limit);
  const location = useSearchStore((state) => state.location);
  const isLocating = useSearchStore((state) => state.isLocating);
  const locationError = useSearchStore((state) => state.locationError);

  const setKeyword = useSearchStore((state) => state.setKeyword);
  const setRadiusKm = useSearchStore((state) => state.setRadiusKm);
  const setMinQualityScore = useSearchStore((state) => state.setMinQualityScore);
  const setLimit = useSearchStore((state) => state.setLimit);
  const setLocation = useSearchStore((state) => state.setLocation);
  const setLocating = useSearchStore((state) => state.setLocating);
  const setLocationError = useSearchStore((state) => state.setLocationError);
  const resetFilters = useSearchStore((state) => state.resetFilters);

  const [localKeyword, setLocalKeyword] = useState(keyword);
  const debouncedKeyword = useDebounce(localKeyword, 350);

  useEffect(() => {
    if (debouncedKeyword !== keyword) {
      setKeyword(debouncedKeyword);
    }
  }, [debouncedKeyword, keyword, setKeyword]);

  // Keep local input in sync if the store is reset elsewhere.
  useEffect(() => {
    if (keyword !== localKeyword && keyword === "") {
      setLocalKeyword("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const geo = useGeolocation();

  const handleDetectLocation = async () => {
    setLocating(true);
    const result = await geo.request();
    if (result) {
      setLocation({
        latitude: result.latitude,
        longitude: result.longitude,
        source: "browser",
        label: "Detected location",
      });
    } else {
      setLocationError(geo.error ?? "Unable to detect location.");
    }
  };

  const filtersActive =
    keyword.trim() !== "" ||
    radiusKm !== null ||
    minQualityScore !== null ||
    limit !== 12;

  return (
    <div className="rounded-3xl border border-ink-100 bg-white/90 p-4 shadow-soft backdrop-blur sm:p-5">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <Input
          containerClassName="lg:col-span-5"
          placeholder="Search by specialty, procedure, name, or city…"
          value={localKeyword}
          onChange={(event) => setLocalKeyword(event.target.value)}
          leftIcon={<SearchIcon size={16} />}
          aria-label="Keyword"
        />

        <div className="lg:col-span-4">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
            Search radius
          </label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-ink-200 bg-white p-1.5 shadow-soft">
            {RADIUS_PRESETS.map((preset) => {
              const active = radiusKm === preset.value;
              return (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setRadiusKm(preset.value)}
                  className={
                    active
                      ? "rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white shadow-soft"
                      : "rounded-full px-3 py-1 text-xs font-medium text-ink-600 transition hover:bg-ink-50"
                  }
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
            Show
          </label>
          <div className="flex h-11 items-center rounded-2xl border border-ink-200 bg-white px-3.5 shadow-soft focus-within:border-ink-900 focus-within:ring-2 focus-within:ring-gold-200">
            <FilterIcon size={16} className="text-ink-400" />
            <select
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="ml-2 w-full bg-transparent text-sm text-ink-900 outline-none"
              aria-label="Result limit"
            >
              {LIMIT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Top {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">
            Min. quality score
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-3.5 py-2 shadow-soft">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={minQualityScore ?? 0}
              onChange={(event) => {
                const value = Number(event.target.value);
                setMinQualityScore(value <= 0 ? null : value);
              }}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-ink-100 accent-ink-900"
              aria-label="Minimum quality score"
            />
            <span className="font-mono text-xs tabular-nums text-ink-700">
              {minQualityScore !== null ? minQualityScore.toFixed(2) : "off"}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <label className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ink-500">
            <span>Search center</span>
            <span className="font-mono text-[10px] normal-case text-ink-400">
              {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
            </span>
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-3 py-2 shadow-soft">
            <MapPinIcon
              size={16}
              className={
                location.source === "browser" ? "text-emerald-600" : "text-ink-400"
              }
            />
            <span className="flex-1 truncate text-xs text-ink-700">
              {location.label ??
                (location.source === "browser"
                  ? "Detected location"
                  : "Default location")}
            </span>
            <Button
              size="sm"
              variant={location.source === "browser" ? "outline" : "secondary"}
              onClick={handleDetectLocation}
              isLoading={isLocating}
              leftIcon={
                isLocating ? (
                  <Spinner size={12} />
                ) : (
                  <MapPinIcon size={12} />
                )
              }
            >
              {location.source === "browser" ? "Update" : "Use my location"}
            </Button>
          </div>
          {locationError && (
            <p className="mt-1.5 text-[11px] text-amber-700">{locationError}</p>
          )}
        </div>
      </div>

      {(filtersActive || onForceRefresh) && (
        <div className="mt-3 flex items-center justify-end gap-2">
          {onForceRefresh && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshIcon size={14} />}
              isLoading={isRefreshing}
              onClick={onForceRefresh}
            >
              Re-sync data
            </Button>
          )}
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetFilters();
                setLocalKeyword("");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
