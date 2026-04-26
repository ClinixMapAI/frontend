import { Badge } from "@/components/ui/Badge";
import { SparkleIcon } from "@/components/ui/icons";
import { AgentChat } from "@/components/features/AgentChat";

export default function AgentPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="brand">
            <SparkleIcon size={10} />
            AI Agent
          </Badge>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            Ask in plain English. Get ranked facilities back.
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            The agent extracts intent, queries Databricks, ranks results, and
            generates a defensible explanation — all in one shot.
          </p>
        </div>
      </div>

      <AgentChat />
    </div>
  );
}
