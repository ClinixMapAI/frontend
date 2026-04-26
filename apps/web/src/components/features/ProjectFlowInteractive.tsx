import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

type FlowMode = "request" | "data";

type FlowStep = {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
};

const REQUEST_FLOW: FlowStep[] = [
  {
    id: "user",
    title: "You",
    subtitle: "Care seeker or navigator",
    bullets: [
      "Types a question in plain language on the dashboard or agent chat.",
      "Location and filters refine what “near” and “best” mean for that session.",
    ],
  },
  {
    id: "ui",
    title: "Web app",
    subtitle: "React · Vite · TypeScript",
    bullets: [
      "ClinixAi UI: search, maps, agent chat, and facility detail—client-side state and React Query.",
      "Calls the backend with axios; base URL from VITE_API_BASE_URL (e.g. Django on :8000).",
    ],
  },
  {
    id: "transport",
    title: "HTTPS / JSON",
    subtitle: "REST API",
    bullets: [
      "POST /api/search/, /api/agent/query/, /api/facilities/nearest/, and related routes.",
      "Request/response validation at the edge; errors surface as clear client messages.",
    ],
  },
  {
    id: "django",
    title: "Django + DRF",
    subtitle: "Thin orchestration",
    bullets: [
      "Routes requests to the right view; no heavy business logic in the framework layer.",
      "Health checks, CORS, OpenAPI docs, and optional admin tools for operators.",
    ],
  },
  {
    id: "services",
    title: "Service layer",
    subtitle: "Search · Agent · Nearest · LLM",
    bullets: [
      "SearchService and AgentService build SQL and call Databricks gateways.",
      "NearestSearchService blends geo, cache, and quality; LLMService adds narrative analysis when needed.",
    ],
  },
  {
    id: "databricks",
    title: "Databricks",
    subtitle: "SQL warehouse · models · Delta",
    bullets: [
      "Executes parameterized SQL against curated facility data; LLM endpoints for reasoning text.",
      "Pipelines (Bronze → Silver → Gold) land in tables the API queries—see the data tab for that path.",
    ],
  },
];

const DATA_FLOW: FlowStep[] = [
  {
    id: "ingest",
    title: "Ingestion",
    subtitle: "Notebooks & jobs",
    bullets: [
      "Source files and jobs load raw facility data into the lakehouse (e.g. bronze tables).",
      "Scheduled or on-demand runs keep the dataset aligned with upstream changes.",
    ],
  },
  {
    id: "bronze",
    title: "Bronze",
    subtitle: "Raw landing",
    bullets: [
      "Append-friendly storage of ingested rows with minimal transformation.",
      "Preserves lineage for replay and auditing as silver rules evolve.",
    ],
  },
  {
    id: "silver",
    title: "Silver",
    subtitle: "Structured + AI extraction",
    bullets: [
      "ai_query() and SQL transform raw fields into typed columns and structured JSON.",
      "Silver layers feed analytics and downstream gold scoring.",
    ],
  },
  {
    id: "gold",
    title: "Gold",
    subtitle: "Trust & quality",
    bullets: [
      "Trust scores and business rules elevate the best rows for search and ranking.",
      "Gold tables are what nearest-search and SQL search ultimately read.",
    ],
  },
  {
    id: "serve",
    title: "Serve & search",
    subtitle: "Indexes + API consumers",
    bullets: [
      "Vector or keyword indexes (where configured) complement SQL for retrieval.",
      "Django services issue queries; the React app never talks to Databricks directly.",
    ],
  },
];

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProjectFlowInteractive() {
  const reduce = useReducedMotion();
  const baseId = useId();
  const [mode, setMode] = useState<FlowMode>("request");
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [mode]);

  const steps = mode === "request" ? REQUEST_FLOW : DATA_FLOW;
  const safeIndex = Math.min(active, steps.length - 1);
  const current = steps[safeIndex];

  return (
    <div className="rounded-3xl border border-ink-100 bg-gradient-to-b from-white to-brand-50/30 p-4 shadow-sm sm:p-6 dark:border-ink-700 dark:from-ink-900 dark:to-brand-950/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Full project flow
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-ink-900 sm:text-xl dark:text-ink-50">
            Explore the architecture
          </h3>
          <p className="mt-1 max-w-xl text-sm text-ink-600 dark:text-ink-400">
            Switch between the <strong className="font-medium text-ink-800 dark:text-ink-200">live request path</strong>{" "}
            and the <strong className="font-medium text-ink-800 dark:text-ink-200">data pipeline</strong>. Select a step
            to read what happens there.
          </p>
        </div>
        <div
          className="flex shrink-0 rounded-2xl border border-ink-200 bg-white/90 p-1 dark:border-ink-600 dark:bg-ink-800/80"
          role="tablist"
          aria-label="Flow diagram mode"
        >
          <button
            type="button"
            role="tab"
            id={`${baseId}-req`}
            aria-selected={mode === "request"}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition",
              mode === "request"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-700/80",
            )}
            onClick={() => setMode("request")}
          >
            Request path
          </button>
          <button
            type="button"
            role="tab"
            id={`${baseId}-data`}
            aria-selected={mode === "data"}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition",
              mode === "data"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-700/80",
            )}
            onClick={() => setMode("data")}
          >
            Data pipeline
          </button>
        </div>
      </div>

      {/* Step rail */}
      <div
        className="mt-6 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center sm:overflow-visible"
        style={{ scrollbarGutter: "stable" }}
      >
        {steps.map((s, i) => {
          const isActive = i === safeIndex;
          return (
            <div key={s.id} className="flex items-center sm:contents">
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                }}
                className={cn(
                  "relative snap-center shrink-0 rounded-2xl border px-3 py-2 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  isActive
                    ? "border-brand-400 bg-brand-50 ring-1 ring-brand-300/50 dark:border-brand-600 dark:bg-brand-950/50 dark:ring-brand-800/50"
                    : "border-ink-200 bg-white/80 hover:border-brand-200 dark:border-ink-600 dark:bg-ink-900/60",
                )}
                aria-pressed={isActive}
                aria-current={isActive ? "step" : undefined}
              >
                <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
                  {i + 1} · {s.id}
                </p>
                <p className="mt-0.5 max-w-[10rem] font-display text-sm font-semibold text-ink-900 sm:max-w-none dark:text-ink-50">
                  {s.title}
                </p>
                <p className="text-[11px] text-ink-500 dark:text-ink-400">{s.subtitle}</p>
              </button>
              {i < steps.length - 1 && (
                <div className="hidden shrink-0 text-ink-300 sm:block dark:text-ink-600" aria-hidden>
                  <ArrowIcon />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      <motion.div
        key={mode + current.id}
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 rounded-2xl border border-ink-100 bg-white/95 p-4 sm:p-5 dark:border-ink-700 dark:bg-ink-900/70"
        role="tabpanel"
        aria-labelledby={mode === "request" ? `${baseId}-req` : `${baseId}-data`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div>
            <h4 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50 sm:text-lg">
              {current.title}
            </h4>
            <p className="text-sm text-ink-500 dark:text-ink-400">{current.subtitle}</p>
          </div>
          <div className="flex gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={() => setActive((a) => Math.max(0, a - 1))}
              disabled={safeIndex === 0}
              className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-800 transition enabled:hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-100 dark:enabled:hover:bg-ink-700"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setActive((a) => Math.min(steps.length - 1, a + 1))}
              disabled={safeIndex === steps.length - 1}
              className="rounded-xl bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition enabled:hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
        <ul className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-sm text-ink-700 dark:border-ink-600 dark:text-ink-300">
          {current.bullets.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* Mini diagram hint */}
        <div className="mt-4 rounded-xl bg-ink-50/80 p-3 font-mono text-[10px] leading-relaxed text-ink-600 dark:bg-ink-950/50 dark:text-ink-400 sm:text-xs">
          {mode === "request" ? (
            <pre className="whitespace-pre-wrap break-words">
              {`[ Browser ]  --HTTPS JSON-->  [ Django DRF ]  -->  [ Services ]  -->  [ Databricks ]
                  ^                                                           |
                  └____________________ JSON results _________________________┘`}
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap break-words">
              {`[ Ingest ]  -->  [ Bronze ]  -->  [ Silver / ai_query ]  -->  [ Gold + trust ]  -->  [ Search / API ]`}
            </pre>
          )}
        </div>
      </motion.div>
    </div>
  );
}
