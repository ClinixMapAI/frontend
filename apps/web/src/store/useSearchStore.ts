import { create } from "zustand";

import type {
  ClientLocation,
  NearestSearchOptions,
} from "@/types/nearest";

/**
 * Default location used while we wait for the user to grant geolocation.
 * Bengaluru is a sensible hackathon default for the seeded dataset.
 */
const DEFAULT_LOCATION: ClientLocation = {
  latitude: 12.9716,
  longitude: 77.5946,
  source: "default",
  label: "Bengaluru (default)",
};

interface SearchState {
  keyword: string;
  radiusKm: number | null;
  minQualityScore: number | null;
  limit: number;
  includeReasoning: boolean;
  location: ClientLocation;
  isLocating: boolean;
  locationError: string | null;

  setKeyword: (value: string) => void;
  setRadiusKm: (value: number | null) => void;
  setMinQualityScore: (value: number | null) => void;
  setLimit: (value: number) => void;
  setIncludeReasoning: (value: boolean) => void;
  setLocation: (location: ClientLocation) => void;
  setLocating: (value: boolean) => void;
  setLocationError: (value: string | null) => void;
  resetFilters: () => void;
  toOptions: (overrides?: Partial<NearestSearchOptions>) => NearestSearchOptions;
}

const initialFilters = {
  keyword: "",
  radiusKm: null as number | null,
  minQualityScore: null as number | null,
  limit: 12,
  includeReasoning: true,
};

export const useSearchStore = create<SearchState>((set, get) => ({
  ...initialFilters,
  location: DEFAULT_LOCATION,
  isLocating: false,
  locationError: null,

  setKeyword: (value) => set({ keyword: value }),
  setRadiusKm: (value) =>
    set({
      radiusKm:
        typeof value === "number" && Number.isFinite(value) && value > 0
          ? value
          : null,
    }),
  setMinQualityScore: (value) =>
    set({
      minQualityScore:
        typeof value === "number" && Number.isFinite(value) ? value : null,
    }),
  setLimit: (value) =>
    set({ limit: Math.min(100, Math.max(1, Math.round(value))) }),
  setIncludeReasoning: (value) => set({ includeReasoning: value }),
  setLocation: (location) =>
    set({ location, locationError: null, isLocating: false }),
  setLocating: (value) => set({ isLocating: value }),
  setLocationError: (value) => set({ locationError: value, isLocating: false }),
  resetFilters: () => set({ ...initialFilters }),

  toOptions: (overrides) => {
    const state = get();
    return {
      latitude: state.location.latitude,
      longitude: state.location.longitude,
      radius_km: state.radiusKm ?? undefined,
      limit: state.limit,
      min_quality_score: state.minQualityScore ?? undefined,
      keyword: state.keyword.trim() || undefined,
      include_reasoning: state.includeReasoning,
      ...overrides,
    };
  },
}));

export { DEFAULT_LOCATION };
