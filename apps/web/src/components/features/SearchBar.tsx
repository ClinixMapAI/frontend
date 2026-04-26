import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Spinner } from "@/components/ui/Loader";
import {
  ArrowRightIcon,
  FilterIcon,
  MapPinIcon,
  SearchIcon,
} from "@/components/ui/icons";
import {
  INDIAN_CITY_PRESETS,
  matchPresetByCoordinates,
} from "@/constants/indianCities";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearestFacilities } from "@/hooks/useNearestFacilities";
import { useSearchStore } from "@/store/useSearchStore";
import { cn } from "@/utils/cn";

const LOCATION_GPS_SELECT_VALUE = "__gps__";

const RADIUS_PRESETS = [
  { label: "Any", value: null },
  { label: "5 km", value: 5 },
  { label: "15 km", value: 15 },
  { label: "30 km", value: 30 },
  { label: "75 km", value: 75 },
];

export function SearchBar() {
  const keyword = useSearchStore((state) => state.keyword);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const limit = useSearchStore((state) => state.limit);
  const minQualityScore = useSearchStore((state) => state.minQualityScore);
  const includeReasoning = useSearchStore((state) => state.includeReasoning);
  const location = useSearchStore((state) => state.location);
  const deviceLocation = useSearchStore((state) => state.deviceLocation);
  const locationError = useSearchStore((state) => state.locationError);
  const toOptions = useSearchStore((state) => state.toOptions);

  const setKeyword = useSearchStore((state) => state.setKeyword);
  const setRadiusKm = useSearchStore((state) => state.setRadiusKm);

  const setLocation = useSearchStore((state) => state.setLocation);
  const setDeviceLocation = useSearchStore((state) => state.setDeviceLocation);
  const setLocating = useSearchStore((state) => state.setLocating);
  const setLocationError = useSearchStore((state) => state.setLocationError);

  // `query` is the *local* draft — changing it does not trigger a network call.
  // The store's `keyword` drives `useNearestFacilities` and updates only on
  // explicit submit (Ctrl/Cmd+Enter or arrow button).
  const [query, setQuery] = useState(keyword);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSubmittedRef = useRef<string | null>(null);
  const clearFlashTimerRef = useRef<number | null>(null);
  const [clearFlash, setClearFlash] = useState(false);
  const [submitShortcutLabel, setSubmitShortcutLabel] = useState("Ctrl+Enter");

  const nearestOptions = useMemo(
    () => toOptions(),
    [
      toOptions,
      keyword,
      radiusKm,
      limit,
      location,
      deviceLocation,
      minQualityScore,
      includeReasoning,
    ],
  );
  const shouldSearch = keyword.trim().length > 0;
  const nearestFacilitiesQuery = useNearestFacilities({
    options: nearestOptions,
    enabled: shouldSearch,
  });

  useEffect(() => {
    setSubmitShortcutLabel(
      typeof navigator !== "undefined" &&
        /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)
        ? "⌘+Enter"
        : "Ctrl+Enter",
    );
  }, []);

  const geo = useGeolocation();

  /** Ask for the browser location once on load so distances use the user’s position when allowed. */
  const hasRequestedInitialLocation = useRef(false);
  useEffect(() => {
    if (hasRequestedInitialLocation.current) return;
    hasRequestedInitialLocation.current = true;
    setLocationError(null);
    setLocating(true);
    void geo.request().then((result) => {
      if (result.ok) {
        const loc = {
          latitude: result.latitude,
          longitude: result.longitude,
          source: "browser" as const,
          label: "Current location",
        };
        setDeviceLocation(loc);
        setLocation(loc);
      } else {
        setLocating(false);
        const denied =
          result.error.toLowerCase().includes("denied") ||
          result.error.toLowerCase().includes("permission");
        if (!denied) {
          setLocationError(result.error);
        }
      }
    });
    // Intentionally once on mount; geolocation prompt is triggered here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locationSelectValue = useMemo(() => {
    if (deviceLocation !== null || location.source === "browser") {
      return LOCATION_GPS_SELECT_VALUE;
    }
    const preset = matchPresetByCoordinates(
      location.latitude,
      location.longitude,
    );
    return preset?.id ?? INDIAN_CITY_PRESETS[0].id;
  }, [deviceLocation, location.latitude, location.longitude, location.source]);

  const handleCityChange = (value: string) => {
    if (value === LOCATION_GPS_SELECT_VALUE) return;
    const city = INDIAN_CITY_PRESETS.find((c) => c.id === value);
    if (!city) return;
    setDeviceLocation(null);
    setLocation({
      latitude: city.latitude,
      longitude: city.longitude,
      source: "manual",
      label: city.label,
    });
  };

  const handleUseCurrentLocation = async () => {
    setLocationError(null);
    setLocating(true);
    const result = await geo.request();
    if (result.ok) {
      const loc = {
        latitude: result.latitude,
        longitude: result.longitude,
        source: "browser" as const,
        label: "Current location",
      };
      setDeviceLocation(loc);
      setLocation(loc);
    } else {
      setLocating(false);
      setLocationError(result.error);
    }
  };

  // Keep the draft in sync if the store's keyword is reset elsewhere
  // (e.g. a "Clear filters" action).
  useEffect(() => {
    if (keyword === "" && query !== "") {
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  useEffect(
    () => () => {
      const id = clearFlashTimerRef.current;
      if (id !== null) window.clearTimeout(id);
    },
    [],
  );

  // After a successful nearest search for the submitted text, clear the draft
  // (unless the user edited it while the request was in flight, or the call failed).
  useEffect(() => {
    const pending = pendingSubmittedRef.current;
    if (!pending) return;
    if (keyword.trim() !== pending) {
      pendingSubmittedRef.current = null;
      return;
    }
    if (!shouldSearch) {
      pendingSubmittedRef.current = null;
      return;
    }
    if (nearestFacilitiesQuery.isFetching) return;

    if (nearestFacilitiesQuery.isError) {
      pendingSubmittedRef.current = null;
      return;
    }

    if (nearestFacilitiesQuery.isSuccess) {
      if (query.trim() !== pending) {
        pendingSubmittedRef.current = null;
        return;
      }
      pendingSubmittedRef.current = null;
      setQuery("");
      const prevFlash = clearFlashTimerRef.current;
      if (prevFlash !== null) window.clearTimeout(prevFlash);
      setClearFlash(true);
      clearFlashTimerRef.current = window.setTimeout(() => {
        clearFlashTimerRef.current = null;
        setClearFlash(false);
      }, 380);
      queueMicrotask(() => textareaRef.current?.focus());
    }
  }, [
    keyword,
    query,
    shouldSearch,
    nearestFacilitiesQuery.isFetching,
    nearestFacilitiesQuery.isError,
    nearestFacilitiesQuery.isSuccess,
  ]);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 22;
    const padY =
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.paddingBottom) || 0);
    const minH = lineHeight + padY;
    const maxH = lineHeight * 5 + padY;

    el.style.height = "auto";
    const scrollH = el.scrollHeight;
    const next = Math.max(minH, Math.min(scrollH, maxH));
    el.style.height = `${next}px`;
    el.style.overflowY = scrollH > maxH ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [query, adjustTextareaHeight]);

  const handleSubmit = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      // [DEBUG] Submit attempted with empty input.
      // eslint-disable-next-line no-console
      console.debug("[search] submit ignored — empty input");
      return;
    }
    // [DEBUG] User triggered a search.
    // eslint-disable-next-line no-console
    console.debug("[search] submit →", trimmed);
    pendingSubmittedRef.current = trimmed;
    setKeyword(trimmed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmit(query);
    }
  };

  const trimmedInput = query.trim();
  const hasPendingChange =
    trimmedInput.length > 0 && trimmedInput !== keyword.trim();
  const canSubmit = trimmedInput.length > 0;
  const isGeoLoading = geo.status === "loading";

  return (
    <div className="relative z-0 flex w-full flex-col gap-4 bg-white dark:bg-ink-950">
      <div className="flex w-full flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-0.5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-tight text-ink-500 dark:text-ink-400">
          <span className="shrink-0 font-normal text-ink-500/85 dark:text-ink-400/90">
            Location
          </span>
          <div className="relative min-w-0 flex-1 basis-[130px] sm:max-w-[190px]">
            <MapPinIcon
              size={10}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-400/90 dark:text-ink-500"
            />
            <select
              value={locationSelectValue}
              onChange={(event) => handleCityChange(event.target.value)}
              className="w-full cursor-pointer appearance-none rounded-full border border-ink-100 bg-ink-50/80 py-1 pl-6 pr-5 text-xs font-normal text-ink-600 outline-none transition hover:border-ink-200 hover:bg-ink-50 focus-visible:border-brand-300 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-400/30 dark:border-ink-700/80 dark:bg-ink-900/50 dark:text-ink-300 dark:hover:border-ink-600 dark:hover:bg-ink-900/70 dark:focus-visible:border-brand-500/60 dark:focus-visible:bg-ink-950 dark:focus-visible:ring-brand-400/25"
              aria-label="Search near city"
            >
              {(deviceLocation !== null || location.source === "browser") && (
                <option value={LOCATION_GPS_SELECT_VALUE}>
                  Current location (device)
                </option>
              )}
              {INDIAN_CITY_PRESETS.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.label}
                </option>
              ))}
            </select>
            <FilterIcon
              size={9}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400/80 dark:text-ink-500"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleUseCurrentLocation()}
            disabled={isGeoLoading}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs font-normal transition",
              isGeoLoading
                ? "cursor-wait text-ink-400 dark:text-ink-500"
                : "text-ink-500 hover:border-ink-200 hover:bg-ink-50/90 dark:text-ink-400 dark:hover:border-ink-600 dark:hover:bg-ink-900/60",
            )}
            aria-label="Use my current location"
          >
            {isGeoLoading ? (
              <Spinner size={12} />
            ) : (
              <MapPinIcon size={12} className="shrink-0 text-ink-400 dark:text-ink-500" />
            )}
            <span className="whitespace-nowrap">My location</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-0.5 gap-y-0.5 text-xs leading-tight text-ink-500/85 sm:shrink-0 dark:text-ink-400/90">
          <span className="mr-0.5 font-normal">Within</span>
          {RADIUS_PRESETS.map((preset) => {
            const active = radiusKm === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setRadiusKm(preset.value)}
                className={cn(
                  "rounded-full px-2 py-px text-xs font-normal transition",
                  active
                    ? "bg-ink-800 text-white shadow-sm dark:bg-ink-200 dark:text-ink-900"
                    : "text-ink-500/95 hover:bg-ink-100/70 hover:text-ink-700 dark:text-ink-400 dark:hover:bg-ink-800/80 dark:hover:text-ink-200",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {location.source === "default" &&
        !deviceLocation &&
        !locationError && (
          <p className="-mt-2 text-[10px] leading-snug text-ink-400/75 dark:text-ink-500/80">
            Allow location for accurate distances.
          </p>
        )}
      {locationError && (
        <p className="-mt-2 text-[10px] leading-snug text-red-600/95 dark:text-red-400">
          {locationError}
        </p>
      )}

      <div className="w-full">
        <div
          className={cn(
            "group relative w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/65 transition-[box-shadow,ring-color] duration-200 ease-out dark:bg-ink-900 dark:ring-ink-600/75",
            "focus-within:shadow-md focus-within:ring-2 focus-within:ring-brand-500/35 dark:focus-within:ring-brand-400/30",
            clearFlash && "bg-brand-50/90 ring-brand-300/55 dark:bg-brand-950/40 dark:ring-brand-700/40",
          )}
        >
          <span className="pointer-events-none absolute left-3.5 top-4 text-ink-500 transition group-focus-within:text-brand-600 dark:text-ink-400 dark:group-focus-within:text-brand-400">
            <SearchIcon size={18} className="block" />
          </span>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Describe your medical needs..."
            aria-label="Search"
            className={cn(
              "min-h-[56px] w-full resize-none rounded-2xl bg-transparent py-3 pl-11 pr-12 text-base leading-relaxed text-ink-900",
              "placeholder:text-ink-500/90 outline-none transition-[height] duration-150 ease-out",
              "focus-visible:outline-none dark:text-ink-50 dark:placeholder:text-ink-400",
            )}
          />
          <button
            type="button"
            aria-label="Search"
            onClick={() => handleSubmit(query)}
            disabled={!canSubmit}
            className={cn(
              "absolute right-2 top-2 grid size-9 place-items-center rounded-xl transition",
              canSubmit
                ? hasPendingChange
                  ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700"
                  : "bg-brand-600 text-white hover:bg-brand-700"
                : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500",
            )}
          >
            <ArrowRightIcon size={16} />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[9px] font-normal leading-none tracking-wide text-ink-400/65 dark:text-ink-500/70">
          {submitShortcutLabel} to search
        </p>
      </div>
    </div>
  );
}
