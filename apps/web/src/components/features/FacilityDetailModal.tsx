import { useEffect } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Loader } from "@/components/ui/Loader";
import { ChartIcon, MapPinIcon, RefreshIcon, SparkleIcon, StarIcon } from "@/components/ui/icons";
import { useFacilityAnalyze } from "@/hooks/useFacilityAnalyze";
import { useFacilityStore } from "@/store/useFacilityStore";
import {
  formatScore,
  getFacilityLocation,
  getFacilityName,
  getFacilityScore,
  getFacilitySpecialties,
  getRatingLabel,
  summarizeFacility,
} from "@/utils/format";
import { ApiError } from "@/types/api";

interface ParsedSection {
  title: string;
  body: string;
}

const SECTION_PATTERN =
  /(?:^|\n)\s*\**\s*(Specialties|Capabilit(?:y|ies)|Strengths|Risks|Weaknesses|Recommendation(?:\s+Summary)?)\s*\**\s*[:\-]?\s*\n?/gi;

function parseAnalysis(raw: string): { summary: string; sections: ParsedSection[] } {
  const text = (raw ?? "").trim();
  if (!text) return { summary: "", sections: [] };

  const matches = Array.from(text.matchAll(SECTION_PATTERN));
  if (matches.length === 0) {
    return { summary: text, sections: [] };
  }

  const firstStart = matches[0].index ?? 0;
  const summary = text.slice(0, firstStart).trim();
  const sections: ParsedSection[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = (match.index ?? 0) + match[0].length;
    const nextStart = matches[i + 1]?.index ?? text.length;
    const title = match[1].trim();
    const body = text.slice(start, nextStart).trim();
    sections.push({ title, body });
  }

  return { summary, sections };
}

function AnalysisBody({ analysis }: { analysis: string }) {
  const { summary, sections } = parseAnalysis(analysis);

  return (
    <div className="space-y-4">
      {summary && (
        <p className="rounded-2xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-800">
          {summary}
        </p>
      )}
      {sections.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">
                {section.title}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                {section.body || "—"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !summary && (
          <p className="text-sm text-ink-500">
            The AI did not return a structured response.
          </p>
        )
      )}
    </div>
  );
}

export function FacilityDetailModal() {
  const isOpen = useFacilityStore((state) => state.isModalOpen);
  const facility = useFacilityStore((state) => state.selected);
  const close = useFacilityStore((state) => state.closeFacility);

  const analyzeMutation = useFacilityAnalyze();

  useEffect(() => {
    if (isOpen && facility) {
      analyzeMutation.reset();
      // Prefer the original Databricks row when available – the LLM gets
      // richer, untransformed data to ground its answer in.
      const payload =
        facility.raw && typeof facility.raw === "object"
          ? (facility.raw as typeof facility)
          : facility;
      analyzeMutation.mutate(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facility]);

  if (!facility) return null;

  const name = getFacilityName(facility);
  const location = getFacilityLocation(facility);
  const score = getFacilityScore(facility);
  const rating = getRatingLabel(facility);
  const specialties = getFacilitySpecialties(facility);
  const description = summarizeFacility(facility);

  const errorMessage =
    analyzeMutation.error instanceof ApiError
      ? analyzeMutation.error.message
      : analyzeMutation.error
        ? "Unable to generate analysis at this time."
        : null;

  return (
    <Modal
      open={isOpen}
      onClose={close}
      size="xl"
      title={name}
      description={
        <span className="inline-flex items-center gap-1.5">
          <MapPinIcon size={14} />
          {location}
        </span>
      }
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Close
          </Button>
          <Button
            variant="secondary"
            leftIcon={<RefreshIcon size={14} />}
            isLoading={analyzeMutation.isPending}
            onClick={() => facility && analyzeMutation.mutate(facility)}
          >
            Re-run analysis
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <p className="text-[11px] uppercase tracking-wider text-ink-500">
              AI Score
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-2xl font-semibold text-ink-900">
              <ChartIcon size={18} className="text-accent-600" />
              {formatScore(score)}
            </p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <p className="text-[11px] uppercase tracking-wider text-ink-500">
              Rating
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-display text-lg font-semibold text-ink-900">
              <StarIcon size={16} className="text-accent-500" />
              {rating ?? "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
            <p className="text-[11px] uppercase tracking-wider text-ink-500">
              Specialties
            </p>
            <p className="mt-1 text-sm font-medium text-ink-900">
              {specialties.length > 0
                ? `${specialties.length} mapped`
                : "Not specified"}
            </p>
          </div>
        </div>

        <section>
          <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-ink-500">
            Overview
          </h3>
          <p className="text-sm leading-relaxed text-ink-700">{description}</p>
          {specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {specialties.map((item) => (
                <Badge key={item} tone="brand">
                  {item}
                </Badge>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center gap-2">
            <SparkleIcon size={16} className="text-brand-600" />
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-500">
              AI analysis
            </h3>
          </div>

          {analyzeMutation.isPending && (
            <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-6">
              <Loader label="Generating a structured analysis with the LLM…" />
            </div>
          )}

          {errorMessage && !analyzeMutation.isPending && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {analyzeMutation.data && !analyzeMutation.isPending && (
            <AnalysisBody analysis={analyzeMutation.data.analysis} />
          )}
        </section>
      </div>
    </Modal>
  );
}
