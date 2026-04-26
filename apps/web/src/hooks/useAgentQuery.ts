import { useMutation } from "@tanstack/react-query";

import { queryAgent } from "@/services/aiService";
import type { AgentQueryResponse } from "@/types/agent";

interface UseAgentQueryOptions {
  onSuccess?: (data: AgentQueryResponse, variables: string) => void;
  onError?: (error: unknown, variables: string) => void;
}

export function useAgentQuery(options: UseAgentQueryOptions = {}) {
  return useMutation<AgentQueryResponse, unknown, string>({
    mutationFn: (query: string) => queryAgent(query),
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}
