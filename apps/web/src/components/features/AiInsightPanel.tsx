import { useMemo } from "react";
import { motion } from "framer-motion";

import { SparkleIcon } from "@/components/ui/icons";

const MAX_ARROWS = 5;
const MAX_PHRASE_LEN = 96;

function shortenPhrase(text: string): string {
  const t = text.trim();
  if (t.length <= MAX_PHRASE_LEN) return t;
  const cut = t.slice(0, MAX_PHRASE_LEN);
  const i = cut.lastIndexOf(" ");
  return (i > 32 ? cut.slice(0, i) : cut).trimEnd() + "…";
}

function buildBullets(
  explanation: string,
  keyword: string,
  cacheRows: number | null,
): { queryLine: string; arrows: string[] } {
  const q = keyword.trim();
  const queryLine = q
    ? `AI analyzed your query: "${q}"`
    : "AI analyzed your search and ranking signals";
  const arrows: string[] = [];

  if (cacheRows != null && cacheRows > 0) {
    arrows.push(
      cacheRows >= 1000
        ? `Filtered from ${cacheRows.toLocaleString()}+ healthcare records`
        : `Scanned ${cacheRows.toLocaleString()} cached facility records`,
    );
  }

  const cleaned = explanation.replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().replace(/\.+$/, ""))
    .filter((s) => s.length > 12);

  for (const raw of sentences) {
    if (arrows.length >= MAX_ARROWS) break;
    if (/^however\b/i.test(raw)) continue;
    let line = raw.charAt(0).toUpperCase() + raw.slice(1);
    line = shortenPhrase(line);
    const prefix = line.slice(0, 28);
    if (arrows.some((a) => a.slice(0, 28) === prefix)) continue;
    arrows.push(line);
  }

  if (arrows.length === 0) {
    arrows.push("Ranked matches using distance and quality score together");
  }

  return { queryLine, arrows: arrows.slice(0, MAX_ARROWS) };
}

const listContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.06 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

interface AiInsightPanelProps {
  explanation: string;
  keyword: string;
  cacheRows: number | null;
}

export function AiInsightPanel({
  explanation,
  keyword,
  cacheRows,
}: AiInsightPanelProps) {
  const { queryLine, arrows } = useMemo(
    () => buildBullets(explanation, keyword, cacheRows),
    [explanation, keyword, cacheRows],
  );

  return (
    <motion.section
      key={explanation}
      aria-label="AI insight"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="mx-auto mb-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 opacity-100 shadow-md sm:p-5 dark:border-white/10 dark:bg-[#0f172a] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_12px_40px_-10px_rgba(0,0,0,0.55)]"
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm dark:bg-brand-500"
          aria-hidden
        >
          <SparkleIcon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-white/10">
            <h3 className="text-base font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
              AI Insight
            </h3>
          </div>

          <motion.div
            className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-700 dark:text-gray-300 sm:text-[15px] sm:leading-relaxed"
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={listItem}
              className="font-medium text-slate-900 dark:text-white"
            >
              {queryLine}
            </motion.p>
            {arrows.map((line, i) => (
              <motion.div
                key={`${i}-${line.slice(0, 24)}`}
                variants={listItem}
                className="flex gap-3"
              >
                <span
                  className="mt-0.5 shrink-0 font-semibold text-brand-600 dark:text-brand-400"
                  aria-hidden
                >
                  →
                </span>
                <span className="min-w-0">{line}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
