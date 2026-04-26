import { create } from "zustand";

import { DEFAULT_INDIAN_CITY } from "@/constants/indianCities";
import type {
  ClientLocation,
  NearestSearchOptions,
} from "@/types/nearest";

const DEFAULT_LOCATION: ClientLocation = {
  latitude: DEFAULT_INDIAN_CITY.latitude,
  longitude: DEFAULT_INDIAN_CITY.longitude,
  source: "default",
  label: DEFAULT_INDIAN_CITY.label,
};

interface SearchState {
  keyword: string;
  radiusKm: number | null;
  minQualityScore: number | null;
  limit: number;
  includeReasoning: boolean;
  location: ClientLocation;
  /** When set, nearest search uses this for lat/lng so distances match the device. Cleared when user picks a city. */
  deviceLocation: ClientLocation | null;
  isLocating: boolean;
  locationError: string | null;

  setKeyword: (value: string) => void;
  setRadiusKm: (value: number | null) => void;
  setMinQualityScore: (value: number | null) => void;
  setLimit: (value: number) => void;
  setIncludeReasoning: (value: boolean) => void;
  setLocation: (location: ClientLocation) => void;
  setDeviceLocation: (location: ClientLocation | null) => void;
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
  deviceLocation: null,
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
  setDeviceLocation: (deviceLocation) => set({ deviceLocation }),
  setLocating: (value) => set({ isLocating: value }),
  setLocationError: (value) => set({ locationError: value, isLocating: false }),
  resetFilters: () => set({ ...initialFilters, deviceLocation: null }),

  toOptions: (overrides) => {
    const state = get();
    const origin = state.deviceLocation ?? state.location;
    return {
      latitude: origin.latitude,
      longitude: origin.longitude,
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
