/**
 * Types for the proximity-aware facility search exposed at
 * `POST /api/facilities/nearest/`. The backend ranks facilities by a
 * composite of geographic distance and quality score and optionally returns
 * an LLM-generated explanation.
 */
export interface NearestFacility {
  facility_id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  /** Point used for distance and mapping (same as DB when `location_source` is `precise`, else city centroid). */
  latitude: number | null;
  longitude: number | null;
  /** `precise` = from dataset; `city_centroid` = approximate city center when DB had no coordinates. */
  location_source?: "precise" | "city_centroid";
  rating: string;
  quality_score: number | null;
  year_established: number | null;
  description: string;
  procedure: string;
  distance_km: number;
  distance_score: number;
  quality_score_normalized: number;
  composite_score: number;
  /** Original Databricks row, useful for the analyze endpoint. */
  raw: Record<string, unknown>;
  /** Allow forward-compatible fields without changing the type. */
  [key: string]: unknown;
}

export interface NearestSearchOptions {
  latitude: number;
  longitude: number;
  radius_km?: number | null;
  limit?: number;
  min_quality_score?: number | null;
  keyword?: string | null;
  distance_weight?: number;
  quality_weight?: number;
  include_reasoning?: boolean;
  force_refresh?: boolean;
}

export interface NearestSearchResponse {
  client_location: { latitude: number; longitude: number };
  weights: { distance: number; quality: number };
  cache: {
    rows: number;
    sync: Record<string, unknown>;
  };
  results: NearestFacility[];
  explanation: string | null;
  /** Set when a filter was removed so the list is not empty (see backend /api/facilities/nearest/). */
  search_note?: string | null;
}

export interface ClientLocation {
  latitude: number;
  longitude: number;
  source: "browser" | "manual" | "default";
  label?: string;
}
