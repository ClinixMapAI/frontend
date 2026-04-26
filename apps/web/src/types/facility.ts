/**
 * Backend facility records come straight from a Databricks Delta table, so the
 * exact column set is not guaranteed. We define the most common fields and
 * keep the record open via an index signature.
 */
export interface Facility {
  facility_id?: string | number;
  id?: string | number;
  facility_name?: string;
  name?: string;
  rating?: string;
  specialties?: string | string[];
  description?: string;
  city?: string;
  state?: string;
  address_city?: string;
  address_state?: string;
  procedure?: string;
  phone?: string;
  website?: string;
  engagement_score?: number;
  healthcare_score?: number;
  trust_score?: number;
  score?: number;
  quality_score?: number | null;
  /** AI / Databricks medical reasoning score (vf_medical_facilities). */
  medical_score?: number | null;
  /** "OK" or "LOW" from AI trust assessment. */
  trust_flag?: string | null;
  /** Short AI explanation of facility match (often comma-separated phrases). */
  explanation?: string | null;
  /** IDP / model confidence for this row (0–1 or 0–100). */
  confidence_score?: number | null;
  composite_score?: number;
  distance_km?: number;
  distance_score?: number;
  quality_score_normalized?: number;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  year_established?: number | null;
  raw?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

export interface SearchResponse {
  results: Facility[];
  pagination: Pagination;
}

export interface SearchFilters {
  rating?: string | string[];
  engagement_score?: number;
  location?: string;
  keywords?: string | string[];
  page?: number;
  page_size?: number;
}
