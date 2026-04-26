import { Badge } from "@/components/ui/Badge";
import { SparkleIcon } from "@/components/ui/icons";
import { AgentChat } from "@/components/features/AgentChat";

export default function AgentPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <Badge tone="brand">
            <SparkleIcon size={10} />
            AI Agent
          </Badge>
          <h1 className="mt-2 font-display text-xl font-bold text-ink-900 xs:text-2xl sm:text-3xl dark:text-ink-50">
            Ask in plain English. Get ranked facilities back.
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-ink-500 xs:text-sm dark:text-ink-400">
            The agent extracts intent, queries Databricks, ranks results, and
            generates a defensible explanation — all in one shot.
          </p>
        </div>
      </div>

      <AgentChat />
    </div>
  );
}
