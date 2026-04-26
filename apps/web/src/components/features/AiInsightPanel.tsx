import { useMemo } from "react";
import { motion } from "framer-motion";

import { SparkleIcon } from "@/components/ui/icons";
import type { Facility } from "@/types/facility";
import {
  getFacilityConfidenceScore,
  getFacilityInconsistencies,
} from "@/utils/format";

const MAX_ARROWS = 6;
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
  facilities: Facility[] | undefined,
): string[] {
  const q = keyword.trim();
  const bullets: string[] = [];

  bullets.push(
    q ? `Analyzed query: "${q}"` : "Analyzed your search and ranking signals",
  );

  if (cacheRows != null && cacheRows > 0) {
    bullets.push(
      cacheRows >= 1000
        ? `Filtered from ${cacheRows.toLocaleString()}+ facilities`
        : `Scanned ${cacheRows.toLocaleString()} cached facility records`,
    );
  }

  const cleaned = explanation.replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().replace(/\.+$/, ""))
    .filter((s) => s.length > 12);

  for (const raw of sentences) {
    if (bullets.length >= MAX_ARROWS) break;
    if (/^however\b/i.test(raw)) continue;
    let line = raw.charAt(0).toUpperCase() + raw.slice(1);
    line = shortenPhrase(line);
    const prefix = line.slice(0, 28);
    if (bullets.some((a) => a.slice(0, 28) === prefix)) continue;
    bullets.push(line);
  }

  if (facilities && facilities.length > 0) {
    const scores = facilities
      .map(getFacilityConfidenceScore)
      .filter((n): n is number => n !== null);
    if (scores.length >= 1 && bullets.length < MAX_ARROWS) {
      const lo = Math.min(...scores);
      const hi = Math.max(...scores);
      bullets.push(
        lo === hi
          ? `Model confidence in this set: ${lo.toFixed(2)}`
          : `Confidence ranges from ${lo.toFixed(2)} to ${hi.toFixed(2)}`,
      );
    }
    const withInc = facilities.filter(
      (f) => getFacilityInconsistencies(f).length > 0,
    ).length;
    if (withInc > 0 && bullets.length < MAX_ARROWS) {
      bullets.push(
        `⚠ Inconsistencies flagged in ${withInc} ${withInc === 1 ? "facility" : "facilities"}`,
      );
    }
  }

  if (bullets.length < 3 && sentences.length === 0) {
    bullets.push("Ranked top matches using distance, quality, and AI signals");
  }

  return bullets.slice(0, MAX_ARROWS);
}

const listContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 5 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: "easeOut" },
  },
};

interface AiInsightPanelProps {
  explanation: string;
  keyword: string;
  cacheRows: number | null;
  /** When provided, adds aggregate confidence and inconsistency bullets. */
  facilities?: Facility[];
}

export function AiInsightPanel({
  explanation,
  keyword,
  cacheRows,
  facilities,
}: AiInsightPanelProps) {
  const bullets = useMemo(
    () => buildBullets(explanation, keyword, cacheRows, facilities),
    [explanation, keyword, cacheRows, facilities],
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
            <span className="text-lg leading-none" aria-hidden>
              🤖
            </span>
            <h3 className="text-base font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
              AI Insight
            </h3>
          </div>

          <motion.ul
            className="mt-4 list-none space-y-2.5 p-0 text-sm leading-relaxed text-slate-700 dark:text-gray-300 sm:text-[15px] sm:leading-relaxed"
            variants={listContainer}
            initial="hidden"
            animate="show"
          >
            {bullets.map((line, i) => (
              <motion.li
                key={`${i}-${line.slice(0, 32)}`}
                variants={listItem}
                className="flex gap-2.5"
              >
                <span
                  className="mt-0.5 shrink-0 font-medium text-brand-600 dark:text-brand-400"
                  aria-hidden
                >
                  →
                </span>
                <span className="min-w-0 text-slate-800 dark:text-gray-200">
                  {line}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </motion.section>
  );
}
