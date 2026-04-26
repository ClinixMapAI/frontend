import { api } from "./api";
import type {
  NearestSearchOptions,
  NearestSearchResponse,
} from "@/types/nearest";

const EMPTY_RESPONSE: NearestSearchResponse = {
  client_location: { latitude: 0, longitude: 0 },
  weights: { distance: 0.6, quality: 0.4 },
  cache: { rows: 0, sync: {} },
  results: [],
  explanation: null,
};

function cleanOptions(options: NearestSearchOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {
    latitude: options.latitude,
    longitude: options.longitude,
  };
  if (typeof options.radius_km === "number" && options.radius_km > 0) {
    body.radius_km = options.radius_km;
  }
  if (typeof options.limit === "number" && options.limit > 0) {
    body.limit = options.limit;
  }
  if (typeof options.min_quality_score === "number") {
    body.min_quality_score = options.min_quality_score;
  }
  if (options.keyword && options.keyword.trim()) {
    body.keyword = options.keyword.trim();
  }
  if (typeof options.distance_weight === "number") {
    body.distance_weight = options.distance_weight;
  }
  if (typeof options.quality_weight === "number") {
    body.quality_weight = options.quality_weight;
  }
  if (typeof options.include_reasoning === "boolean") {
    body.include_reasoning = options.include_reasoning;
  }
  if (typeof options.force_refresh === "boolean") {
    body.force_refresh = options.force_refresh;
  }
  return body;
}

export async function searchNearestFacilities(
  options: NearestSearchOptions,
): Promise<NearestSearchResponse> {
  const { data } = await api.post<NearestSearchResponse>(
    "/api/facilities/nearest/",
    cleanOptions(options),
  );

  return {
    client_location: data?.client_location ?? EMPTY_RESPONSE.client_location,
    weights: data?.weights ?? EMPTY_RESPONSE.weights,
    cache: data?.cache ?? EMPTY_RESPONSE.cache,
    results: Array.isArray(data?.results) ? data.results : [],
    explanation:
      typeof data?.explanation === "string" || data?.explanation === null
        ? data.explanation
        : null,
  };
}

export async function syncFacilityCache(force = false): Promise<unknown> {
  const { data } = await api.post("/api/facilities/cache/sync", { force });
  return data;
}
