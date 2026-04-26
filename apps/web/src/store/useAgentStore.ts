import { create } from "zustand";

import type { AgentQueryResponse, ChatMessage } from "@/types/agent";

interface AgentState {
  messages: ChatMessage[];
  lastResponse: AgentQueryResponse | null;
  appendMessage: (message: ChatMessage) => void;
  setLastResponse: (response: AgentQueryResponse | null) => void;
  reset: () => void;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export const useAgentStore = create<AgentState>((set) => ({
  messages: [],
  lastResponse: null,
  appendMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLastResponse: (response) => set({ lastResponse: response }),
  reset: () => set({ messages: [], lastResponse: null }),
}));

export function newChatMessage(
  role: ChatMessage["role"],
  content: string,
  payload?: AgentQueryResponse,
): ChatMessage {
  return {
    id: createId(),
    role,
    content,
    payload,
    createdAt: Date.now(),
  };
}
