import { useEffect, useMemo, useRef, useState } from "react";

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

const LIMIT_OPTIONS = [6, 12, 24, 48];

const SUGGESTIONS = [
  "ICU with oxygen",
  "Child breathing problem",
  "Cardiac emergency",
  "Maternity care",
  "Orthopedic surgery",
];

export function SearchBar() {
  const keyword = useSearchStore((state) => state.keyword);
  const radiusKm = useSearchStore((state) => state.radiusKm);
  const limit = useSearchStore((state) => state.limit);
  const location = useSearchStore((state) => state.location);
  const deviceLocation = useSearchStore((state) => state.deviceLocation);
  const locationError = useSearchStore((state) => state.locationError);

  const setKeyword = useSearchStore((state) => state.setKeyword);
  const setRadiusKm = useSearchStore((state) => state.setRadiusKm);
  const setLimit = useSearchStore((state) => state.setLimit);

  const setLocation = useSearchStore((state) => state.setLocation);
  const setDeviceLocation = useSearchStore((state) => state.setDeviceLocation);
  const setLocating = useSearchStore((state) => state.setLocating);
  const setLocationError = useSearchStore((state) => state.setLocationError);

  // `inputValue` is the *local* draft the user is typing — changing it does
  // NOT trigger a network call. The store's `keyword` is the actual query
  // that drives `useNearestFacilities`, and is only updated on explicit
  // submit (Enter, button click, or suggestion chip).
  const [inputValue, setInputValue] = useState(keyword);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Keep the input in sync if the store's keyword is reset elsewhere
  // (e.g. a "Clear filters" action).
  useEffect(() => {
    if (keyword === "" && inputValue !== "") {
      setInputValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const submitSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      // [DEBUG] Submit attempted with empty input.
      // eslint-disable-next-line no-console
      console.debug("[search] submit ignored — empty input");
      return;
    }
    // [DEBUG] User triggered a search.
    // eslint-disable-next-line no-console
    console.debug("[search] submit →", trimmed);
    setKeyword(trimmed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Submit only on plain Enter; let Shift+Enter pass through (no submit).
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitSearch(inputValue);
    }
  };

  const handleSuggestion = (value: string) => {
    setInputValue(value);
    submitSearch(value);
    inputRef.current?.focus();
  };

  const trimmedInput = inputValue.trim();
  const showSuggestions = trimmedInput.length === 0;
  const hasPendingChange =
    trimmedInput.length > 0 && trimmedInput !== keyword.trim();
  const canSubmit = trimmedInput.length > 0;
  const isGeoLoading = geo.status === "loading";

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-1 text-[11px]">
        <span className="shrink-0 text-ink-400 dark:text-ink-500">Location</span>
        <div className="relative min-w-0 flex-1 basis-[160px] sm:max-w-[220px]">
          <MapPinIcon
            size={10}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500"
          />
          <select
            value={locationSelectValue}
            onChange={(event) => handleCityChange(event.target.value)}
            className="w-full cursor-pointer appearance-none rounded-full bg-transparent py-0.5 pl-7 pr-6 text-[11px] font-medium text-ink-600 outline-none transition hover:bg-ink-100/80 hover:text-ink-800 focus:bg-ink-100/80 dark:text-ink-300 dark:hover:bg-ink-800/80 dark:hover:text-ink-100 dark:focus:bg-ink-800/80"
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
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleUseCurrentLocation()}
          disabled={isGeoLoading}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 font-medium transition",
            isGeoLoading
              ? "cursor-wait bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500"
              : "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-200 dark:hover:bg-brand-900/60",
          )}
          aria-label="Use my current location"
        >
          {isGeoLoading ? (
            <Spinner size={12} />
          ) : (
            <MapPinIcon size={12} />
          )}
          <span className="whitespace-nowrap">My location</span>
        </button>
      </div>
      {location.source === "default" &&
        !deviceLocation &&
        !locationError && (
        <p className="px-1 text-[11px] text-ink-400 dark:text-ink-500">
          Allow location when your browser asks so distances match where you are.
        </p>
      )}
      {locationError && (
        <p className="px-1 text-[11px] text-red-600 dark:text-red-400">
          {locationError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[11px]">
        <span className="text-ink-400 dark:text-ink-500">Within</span>
        {RADIUS_PRESETS.map((preset) => {
          const active = radiusKm === preset.value;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => setRadiusKm(preset.value)}
              className={cn(
                "rounded-full px-2 py-0.5 font-medium transition",
                active
                  ? "bg-ink-900 text-white dark:bg-ink-100 dark:text-ink-900"
                  : "text-ink-500 hover:bg-ink-100/80 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800/80 dark:hover:text-ink-100",
              )}
            >
              {preset.label}
            </button>
          );
        })}

        <span className="mx-1 text-ink-200 dark:text-ink-600" aria-hidden>
          ·
        </span>

        <span className="text-ink-400 dark:text-ink-500">Show</span>
        <div className="relative">
          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="cursor-pointer appearance-none rounded-full bg-transparent px-2 py-0.5 pr-5 text-[11px] font-medium text-ink-600 outline-none transition hover:bg-ink-100/80 hover:text-ink-800 focus:bg-ink-100/80 dark:text-ink-300 dark:hover:bg-ink-800/80 dark:hover:text-ink-100 dark:focus:bg-ink-800/80"
            aria-label="Result limit"
          >
            {LIMIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                Top {option}
              </option>
            ))}
          </select>
          <FilterIcon
            size={9}
            className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500"
          />
        </div>
      </div>

      <div className="group relative w-full">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 transition group-focus-within:text-ink-700 dark:text-ink-500 dark:group-focus-within:text-ink-200">
          <SearchIcon size={18} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your medical need…"
          aria-label="Search"
          enterKeyHint="search"
          className={cn(
            "min-h-[52px] w-full rounded-xl bg-transparent",
            "pl-11 pr-12 text-base text-ink-900 placeholder:text-ink-400",
            "outline-none transition",
            "focus:bg-white/60 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:bg-ink-800/50",
          )}
        />
        <button
          type="button"
          aria-label="Search"
          onClick={() => submitSearch(inputValue)}
          disabled={!canSubmit}
          className={cn(
            "absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2",
            "place-items-center rounded-lg transition",
            canSubmit
              ? hasPendingChange
                ? "bg-brand-600 text-white shadow-glow hover:bg-brand-700"
                : "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500",
          )}
        >
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {showSuggestions && (
        <div className="flex flex-wrap items-center gap-1.5 px-1 pt-0.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestion(suggestion)}
              className="rounded-full bg-ink-50/80 px-2.5 py-1 text-[11px] text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:bg-ink-800/80 dark:text-ink-300 dark:hover:bg-ink-700 dark:hover:text-ink-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
