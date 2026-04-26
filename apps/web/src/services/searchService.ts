import { api } from "./api";
import type { SearchFilters, SearchResponse } from "@/types/facility";

export async function searchFacilities(filters: SearchFilters): Promise<SearchResponse> {
  const { data } = await api.post<SearchResponse>("/api/search/", { filters });
  return {
    results: Array.isArray(data?.results) ? data.results : [],
    pagination: data?.pagination ?? { page: 1, page_size: 10, total: 0 },
  };
}
