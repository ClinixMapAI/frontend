import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { searchNearestFacilities } from "@/services/nearestService";
import type {
  NearestSearchOptions,
  NearestSearchResponse,
} from "@/types/nearest";

export function nearestFacilitiesQueryKey(options: NearestSearchOptions | null) {
  if (!options) return ["facilities", "nearest", "disabled"] as const;
  return [
    "facilities",
    "nearest",
    {
      lat: Number(options.latitude.toFixed(4)),
      lng: Number(options.longitude.toFixed(4)),
      radius: options.radius_km ?? null,
      limit: options.limit ?? null,
      keyword: options.keyword?.trim() || null,
      minQ: options.min_quality_score ?? null,
      dW: options.distance_weight ?? null,
      qW: options.quality_weight ?? null,
      reason: options.include_reasoning ?? null,
    },
  ] as const;
}

interface UseNearestFacilitiesArgs {
  options: NearestSearchOptions | null;
  enabled?: boolean;
}

export function useNearestFacilities({
  options,
  enabled = true,
}: UseNearestFacilitiesArgs) {
  return useQuery<NearestSearchResponse>({
    queryKey: nearestFacilitiesQueryKey(options),
    queryFn: () => searchNearestFacilities(options as NearestSearchOptions),
    enabled: enabled && options !== null,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
