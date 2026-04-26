import { api } from "./api";
import type { Facility } from "@/types/facility";
import type { AgentQueryResponse, FacilityAnalyzeResponse } from "@/types/agent";

export async function queryAgent(query: string): Promise<AgentQueryResponse> {
  const { data } = await api.post<AgentQueryResponse>("/api/agent/query/", { query });
  return {
    intent: data?.intent ?? {},
    filters: data?.filters ?? {},
    results: Array.isArray(data?.results) ? data.results : [],
    pagination: data?.pagination ?? { page: 1, page_size: 10, total: 0 },
    explanation: typeof data?.explanation === "string" ? data.explanation : "",
  };
}

export async function analyzeFacility(facility: Facility): Promise<FacilityAnalyzeResponse> {
  const { data } = await api.post<FacilityAnalyzeResponse>("/api/facility/analyze/", { facility });
  return {
    analysis: typeof data?.analysis === "string" ? data.analysis : "",
  };
}
