import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchFacilities } from "@/services/searchService";
import type { SearchFilters, SearchResponse } from "@/types/facility";

export function searchFacilitiesQueryKey(filters: SearchFilters) {
  return ["facilities", "search", filters] as const;
}

export function useSearchFacilities(filters: SearchFilters, enabled = true) {
  return useQuery<SearchResponse>({
    queryKey: searchFacilitiesQueryKey(filters),
    queryFn: () => searchFacilities(filters),
    enabled,
    placeholderData: keepPreviousData,
  });
}
