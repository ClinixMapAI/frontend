import { useMutation } from "@tanstack/react-query";

import { analyzeFacility } from "@/services/aiService";
import type { FacilityAnalyzeResponse } from "@/types/agent";
import type { Facility } from "@/types/facility";

export function useFacilityAnalyze() {
  return useMutation<FacilityAnalyzeResponse, unknown, Facility>({
    mutationFn: (facility: Facility) => analyzeFacility(facility),
  });
}
