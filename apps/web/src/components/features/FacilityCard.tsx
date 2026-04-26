import { memo, useMemo } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { RiskNotice } from "@/components/ui/RiskNotice";
import {
  ArrowRightIcon,
  MapPinIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/ui/icons";
import {
  explanationItemHasWarning,
  formatDistanceKm,
  getAiExplanationLines,
  getFacilityConfidenceScore,
  getFacilityCoordinates,
  getFacilityDistanceKm,
  getFacilityInconsistencies,
  getFacilityLocation,
  getFacilityName,
  getMedicalScore,
  getFacilitySpecialties,
  getRatingLabel,
  getTrustFlag,
  summarizeFacility,
} from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Facility } from "@/types/facility";

interface FacilityCardProps {
  facility: Facility;
  rank?: number;
  onAnalyze: (facility: Facility) => void;
  onViewMap: (facility: Facility) => void;
}

const reasoningList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

const reasoningItem = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
};

const CONFIDENCE_HIGH_MIN = 0.8;
const CONFIDENCE_MODERATE_MIN = 0.6;
const CONFIDENCE_FALLBACK = 0.5;

/** Prefer top-level ``medical_score`` (number or string from JSON); then ``getMedicalScore`` / ``raw``. */
function readMedicalScoreNumeric(facility: Facility): number | null {
  const direct = facility.medical_score as unknown;
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  if (typeof direct === "string" && direct.trim()) {
    const n = Number(direct.trim());
    if (Number.isFinite(n)) return n;
  }
  return getMedicalScore(facility);
}

/** 0–100 integer for UI; ``medical_score`` from API may be 0–1 or 0–100. */
function getMedicalScoreDisplayPercent(facility: Facility): number | null {
  const n = readMedicalScoreNumeric(facility);
  if (n === null || !Number.isFinite(n)) return null;
  const pct = n > 1 ? n : n * 100;
  return Math.round(Math.min(100, Math.max(0, pct)));
}

/** &gt;= 80 green, 60–79 yellow, &lt; 60 red. */
function getMedicalScoreBadgeTone(displayPct: number): "green" | "yellow" | "red" {
  if (displayPct >= 80) return "green";
  if (displayPct >= 60) return "yellow";
  return "red";
}

function medicalScoreBadgeClasses(tone: "green" | "yellow" | "red"): string {
  switch (tone) {
    case "green":
      return "bg-green-500/20 text-green-400";
    case "yellow":
      return "bg-yellow-500/20 text-yellow-400";
    default:
      return "bg-red-500/20 text-red-400";
  }
}

function getConfidenceLevel(score: number): {
  label: string;
  color: "green" | "yellow" | "red";
} {
  if (score >= CONFIDENCE_HIGH_MIN) return { label: "High", color: "green" };
  if (score >= CONFIDENCE_MODERATE_MIN) return { label: "Moderate", color: "yellow" };
  return { label: "Low", color: "red" };
}

function confidenceColorClasses(color: "green" | "yellow" | "red"): {
  text: string;
  bar: string;
} {
  switch (color) {
    case "green":
      return {
        text: "text-emerald-700 dark:text-emerald-300",
        bar: "bg-emerald-500 dark:bg-emerald-400",
      };
    case "yellow":
      return {
        text: "text-amber-800 dark:text-amber-300",
        bar: "bg-amber-500 dark:bg-amber-400",
      };
    default:
      return {
        text: "text-red-700 dark:text-red-300",
        bar: "bg-red-500 dark:bg-red-400",
      };
  }
}

function normalizeReasoningKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatDetectedLine(raw: string): string {
  const t = raw.trim();
  if (/detected$/i.test(t)) return t;
  if (/^icu\b/i.test(t)) {
    if (/available/i.test(t)) return "ICU capability detected";
    return `${t} detected`;
  }
  if (/oxygen/i.test(t) && /support|available/i.test(t)) return "Oxygen support detected";
  if (/surgery|surgical/i.test(t) && /capability|available/i.test(t)) {
    return "Surgery capability detected";
  }
  const head = t.charAt(0).toUpperCase() + t.slice(1);
  return `${head.replace(/\.$/, "")} detected`;
}

function formatInconsistencyLine(text: string): string {
  let t = text.trim();
  if (/^no\s+/i.test(t)) {
    t = `Missing ${t.replace(/^no\s+/i, "").trim()}`;
  }
  const lower = t.toLowerCase();
  if (
    (lower.includes("anesthesiologist") || lower.includes("surgery")) &&
    !/\(may affect/i.test(t)
  ) {
    return `${t.replace(/\.$/, "")} (may affect surgery safety)`;
  }
  return t.replace(/\.$/, "");
}

/** Normalize ``facility.inconsistencies`` (array, JSON string, or comma-separated). */
function parseFacilityInconsistenciesField(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return [];
    if (t.startsWith("[")) {
      try {
        const parsed = JSON.parse(t) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x).trim()).filter(Boolean);
        }
      } catch {
        /* single string */
      }
    }
    if (t.includes(",")) {
      return t.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [t];
  }
  return [];
}

function getFacilityInconsistencyList(facility: Facility): string[] {
  const fromTop = parseFacilityInconsistenciesField(facility.inconsistencies);
  const fromRaw = getFacilityInconsistencies(facility);
  const merged = [...fromTop, ...fromRaw];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of merged) {
    const line = formatInconsistencyLine(raw);
    const k = normalizeReasoningKey(line);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(line);
  }
  return out;
}

function FacilityCardImpl({
  facility,
  rank,
  onAnalyze,
  onViewMap,
}: FacilityCardProps) {
  const name = getFacilityName(facility);
  const location = getFacilityLocation(facility);
  const distanceKm = getFacilityDistanceKm(facility);
  const medicalScoreDisplay = getMedicalScoreDisplayPercent(facility);
  const medicalBadgeTone =
    medicalScoreDisplay !== null ? getMedicalScoreBadgeTone(medicalScoreDisplay) : null;
  const rating = getRatingLabel(facility);
  const specialties = getFacilitySpecialties(facility).slice(0, 5);
  const summary = summarizeFacility(facility);
  const hasCoordinates = getFacilityCoordinates(facility) !== null;
  const trustFlag = getTrustFlag(facility);
  const rawConfidenceScore = getFacilityConfidenceScore(facility);

  const positiveLines = useMemo(() => {
    const phrases = getAiExplanationLines(facility);
    const positives: string[] = [];
    const seenP = new Set<string>();
    const addP = (line: string) => {
      const k = normalizeReasoningKey(line);
      if (!k || seenP.has(k)) return;
      seenP.add(k);
      positives.push(line);
    };
    for (const raw of phrases) {
      if (explanationItemHasWarning(raw)) continue;
      const stripped = raw
        .replace(/^⚠\s*/u, "")
        .replace(/\u26A0\uFE0F?/gu, "")
        .trim();
      if (!stripped) continue;
      addP(formatDetectedLine(stripped));
    }
    return positives;
  }, [facility]);

  const inconsistencyItems = useMemo(
    () => getFacilityInconsistencyList(facility),
    [facility],
  );

  const hasPos = positiveLines.length > 0;
  const inconsistencies = inconsistencyItems;
  const hasInc = !!(inconsistencies && inconsistencies.length > 0);
  const showWhyBlock =
    hasPos || hasInc || rawConfidenceScore !== null;

  const resolvedConfidenceScore =
    rawConfidenceScore ?? (hasPos || hasInc ? CONFIDENCE_FALLBACK : null);

  const confidenceLevel =
    resolvedConfidenceScore !== null
      ? getConfidenceLevel(resolvedConfidenceScore)
      : null;
  const confidenceStyles = confidenceLevel
    ? confidenceColorClasses(confidenceLevel.color)
    : null;
  const confidenceBarPct =
    resolvedConfidenceScore !== null
      ? Math.min(1, Math.max(0, resolvedConfidenceScore)) * 100
      : 0;

  return (
    <Card className="w-full p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {typeof rank === "number" && (
          <span className="rounded-full bg-brand-600 px-2 py-0.5 font-mono text-[10px] text-white">
            #{rank}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <MapPinIcon size={12} />
          {location}
        </span>
        {distanceKm !== null && (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] normal-case text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {formatDistanceKm(distanceKm)} away
          </span>
        )}
        {medicalScoreDisplay !== null && medicalBadgeTone && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold normal-case",
              medicalScoreBadgeClasses(medicalBadgeTone),
            )}
            title="Medical score (capability)"
          >
            <span aria-hidden>🏥</span>
            <span className="font-mono text-[11px] tabular-nums sm:text-xs">
              {medicalScoreDisplay}
            </span>
            <span className="text-[9px] uppercase tracking-wider opacity-90 sm:text-[10px]">
              SCORE
            </span>
          </span>
        )}
        {rating && (
          <Badge tone="accent" icon={<StarIcon size={10} />}>
            {rating}
          </Badge>
        )}
      </div>

      <h3 className="mt-3 break-words font-display text-xl font-semibold text-ink-900 dark:text-ink-50 sm:text-2xl">
        {name}
      </h3>

      {trustFlag === "LOW" && (
        <RiskNotice className="mt-3">
          Lower trust flag on this record — confirm services and credentials
          before acting on this match.
        </RiskNotice>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300 sm:text-[15px]">
        {summary}
      </p>

      {showWhyBlock && (
        <div className="mt-4">
          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
            Why this facility
          </p>

          <div className="text-[13px] leading-snug text-ink-800 dark:text-gray-200 sm:text-sm sm:leading-relaxed">
            {positiveLines.length > 0 && (
              <motion.ul
                className="list-none space-y-2 p-0"
                variants={reasoningList}
                initial="hidden"
                animate="show"
              >
                {positiveLines.map((line) => (
                  <motion.li
                    key={`p-${line}`}
                    variants={reasoningItem}
                    className="flex gap-2.5"
                  >
                    <span className="mt-0.5 w-4 shrink-0 text-center" aria-hidden>
                      ✔
                    </span>
                    <span className="min-w-0">{line}</span>
                  </motion.li>
                ))}
              </motion.ul>
            )}

            {inconsistencies &&
              inconsistencies.length > 0 &&
              (() => {
                console.log("INCONSISTENCIES:", inconsistencies);
                return (
                  <motion.div
                    variants={reasoningItem}
                    className={cn(
                      "mt-3 rounded-lg border p-3",
                      "border-amber-200 bg-amber-50/90 dark:border-amber-800/55 dark:bg-amber-950/35",
                    )}
                  >
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-950 dark:text-amber-200">
                      <span aria-hidden>⚠</span>
                      AI DETECTED DATA INCONSISTENCY
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {inconsistencies.map((item) => (
                        <div
                          key={`inc-${item}`}
                          className="text-[13px] leading-snug text-amber-950 dark:text-amber-100 sm:text-sm"
                        >
                          • {item}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

            {resolvedConfidenceScore !== null &&
              confidenceLevel &&
              confidenceStyles && (
                <motion.div variants={reasoningItem} className="mt-3">
                  <p
                    className={cn(
                      "text-[13px] font-medium sm:text-sm",
                      confidenceStyles.text,
                    )}
                  >
                    <span aria-hidden>📊 </span>
                    Confidence:{" "}
                    <span className="font-mono tabular-nums">
                      {resolvedConfidenceScore.toFixed(2)}
                    </span>{" "}
                    ({confidenceLevel.label})
                  </p>
                  <div
                    className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-ink-200 dark:bg-ink-700"
                    role="progressbar"
                    aria-valuenow={Math.round(confidenceBarPct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      className={cn("h-full rounded-full", confidenceStyles.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidenceBarPct}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}
          </div>
        </div>
      )}

      {specialties.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {specialties.map((item) => (
            <Badge key={item} tone="neutral">
              {item}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-ink-100 pt-4 dark:border-ink-700">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAnalyze(facility)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-500 transition hover:bg-ink-50 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50 dark:focus-visible:ring-brand-500"
          >
            <SparkleIcon size={12} />
            Analyze
          </button>
          <button
            type="button"
            onClick={() => onViewMap(facility)}
            disabled={!hasCoordinates}
            title={
              hasCoordinates
                ? undefined
                : "No coordinates available for this facility"
            }
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:text-brand-300 dark:hover:bg-brand-900/40 dark:focus-visible:ring-brand-500"
          >
            <MapPinIcon size={14} />
            View on map
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

export const FacilityCard = memo(FacilityCardImpl);
