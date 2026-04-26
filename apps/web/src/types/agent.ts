import type { Facility, Pagination, SearchFilters } from "./facility";

export interface AgentIntent {
  specialty?: string | null;
  location?: string | null;
  rating?: string | null;
  keywords?: string[];
  engagement_score?: number | null;
  [key: string]: unknown;
}

export interface AgentQueryResponse {
  intent: AgentIntent;
  filters: SearchFilters;
  results: Facility[];
  pagination: Pagination;
  explanation: string;
}

export interface FacilityAnalyzeResponse {
  analysis: string;
}

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: number;
  payload?: AgentQueryResponse;
}
