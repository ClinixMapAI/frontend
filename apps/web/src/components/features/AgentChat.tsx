import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Loader";
import { SendIcon, SparkleIcon } from "@/components/ui/icons";
import { useAgentQuery } from "@/hooks/useAgentQuery";
import { newChatMessage, useAgentStore } from "@/store/useAgentStore";
import { ApiError } from "@/types/api";
import type { ChatMessage } from "@/types/agent";

import { FacilityList } from "./FacilityList";

const SUGGESTIONS = [
  "Find the best cardiac hospital in Delhi",
  "Top maternity facilities in Mumbai with excellent rating",
  "Recommend an ICU-equipped hospital in Bangalore",
  "Which orthopedic centers have the highest engagement score?",
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={
        isUser
          ? "flex justify-end"
          : "flex justify-start"
      }
    >
      <div
        className={
          isUser
            ? "max-w-[85%] rounded-3xl rounded-tr-md bg-ink-900 px-4 py-3 text-sm text-white shadow-soft"
            : "max-w-[85%] rounded-3xl rounded-tl-md border border-ink-100 bg-white px-4 py-3 text-sm leading-relaxed text-ink-800 shadow-soft"
        }
      >
        {!isUser && (
          <div className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gold-700">
            <SparkleIcon size={12} />
            AI Agent
          </div>
        )}
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </div>
  );
}

export function AgentChat() {
  const messages = useAgentStore((state) => state.messages);
  const lastResponse = useAgentStore((state) => state.lastResponse);
  const appendMessage = useAgentStore((state) => state.appendMessage);
  const setLastResponse = useAgentStore((state) => state.setLastResponse);
  const reset = useAgentStore((state) => state.reset);

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const mutation = useAgentQuery({
    onSuccess: (data) => {
      setLastResponse(data);
      const explanation =
        data.explanation?.trim() ||
        "Here are the top facilities matching your request.";
      appendMessage(newChatMessage("assistant", explanation, data));
    },
    onError: (error, variables) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "The agent service is temporarily unavailable. Please try again.";
      appendMessage(
        newChatMessage(
          "assistant",
          `I couldn't process "${variables}". ${message}`,
        ),
      );
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, mutation.isPending]);

  const submitQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || mutation.isPending) return;
    appendMessage(newChatMessage("user", trimmed));
    setInput("");
    mutation.mutate(trimmed);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuery(input);
  };

  const showResults =
    !!lastResponse &&
    lastResponse.results.length > 0 &&
    !mutation.isPending;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-7 xl:col-span-6">
        <div className="flex h-[calc(100vh-14rem)] min-h-[520px] flex-col rounded-3xl border border-ink-100 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink-900 text-gold-400">
                <SparkleIcon size={14} />
              </span>
              <div>
                <p className="font-display text-sm font-semibold text-ink-900">
                  HackNation AI Agent
                </p>
                <p className="text-[11px] text-ink-500">
                  Natural-language facility recommendations
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => reset()}>
                Clear
              </Button>
            )}
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto scrollbar-thin px-5 py-4"
          >
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-50 text-gold-700 shadow-soft">
                  <SparkleIcon size={20} />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">
                  Ask anything about healthcare facilities
                </h3>
                <p className="mt-1 max-w-md text-sm text-ink-500">
                  Describe what you need in plain English. The agent extracts
                  intent, ranks facilities, and explains the trade-offs.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => submitQuery(suggestion)}
                      className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 transition hover:-translate-y-0.5 hover:border-gold-300 hover:text-ink-900 hover:shadow-soft"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {mutation.isPending && (
              <div className="flex items-center gap-2 rounded-3xl rounded-tl-md border border-ink-100 bg-white px-4 py-3 text-sm text-ink-600 shadow-soft">
                <Spinner size={14} />
                Thinking, querying Databricks, and ranking facilities…
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-ink-100 p-3"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-white p-2 shadow-soft focus-within:border-ink-900 focus-within:ring-2 focus-within:ring-gold-200">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitQuery(input);
                  }
                }}
                placeholder="e.g. Find the best cardiac hospital in Delhi"
                rows={1}
                className="block h-11 max-h-32 min-h-[2.75rem] w-full resize-none bg-transparent px-2 py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none"
                aria-label="Ask the AI agent"
              />
              <Button
                type="submit"
                size="md"
                variant="primary"
                isLoading={mutation.isPending}
                disabled={!input.trim() || mutation.isPending}
                rightIcon={<SendIcon size={14} />}
              >
                Send
              </Button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-ink-400">
              Press <kbd className="rounded border border-ink-200 px-1">Enter</kbd> to send · <kbd className="rounded border border-ink-200 px-1">Shift</kbd>+<kbd className="rounded border border-ink-200 px-1">Enter</kbd> for newline
            </p>
          </form>
        </div>
      </div>

      <div className="lg:col-span-5 xl:col-span-6">
        <div className="sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Ranked facilities
            </h2>
            {lastResponse && (
              <span className="text-xs text-ink-500">
                {lastResponse.results.length} of{" "}
                {lastResponse.pagination?.total ?? lastResponse.results.length}
              </span>
            )}
          </div>

          {!lastResponse && !mutation.isPending && (
            <div className="rounded-3xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
              <p className="font-display text-base font-semibold text-ink-900">
                Results appear here
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
                Ask the agent a question. We will return the top-ranked
                facilities and a short explanation of why.
              </p>
            </div>
          )}

          {showResults && (
            <FacilityList
              facilities={lastResponse!.results}
              startRank={1}
              emptyTitle="The agent did not return any facilities"
              emptyDescription="Try refining your query — for example, add a city or specialty."
            />
          )}

          {!mutation.isPending &&
            lastResponse &&
            lastResponse.results.length === 0 && (
              <div className="rounded-3xl border border-dashed border-ink-200 bg-white/60 p-10 text-center">
                <p className="font-display text-base font-semibold text-ink-900">
                  No matching facilities
                </p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
                  Try broadening your location or specialty terms.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
