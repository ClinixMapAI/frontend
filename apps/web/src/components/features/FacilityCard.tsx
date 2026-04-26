import { memo } from "react";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  ArrowRightIcon,
  ChartIcon,
  MapPinIcon,
  SparkleIcon,
  StarIcon,
} from "@/components/ui/icons";
import {
  formatDistanceKm,
  formatScore,
  getFacilityCoordinates,
  getFacilityDistanceKm,
  getFacilityLocation,
  getFacilityName,
  getFacilityScore,
  getFacilitySpecialties,
  getRatingLabel,
  summarizeFacility,
} from "@/utils/format";
import type { Facility } from "@/types/facility";

interface FacilityCardProps {
  facility: Facility;
  rank?: number;
  onAnalyze: (facility: Facility) => void;
  onViewMap: (facility: Facility) => void;
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
  const score = getFacilityScore(facility);
  const rating = getRatingLabel(facility);
  const specialties = getFacilitySpecialties(facility).slice(0, 5);
  const summary = summarizeFacility(facility);
  const hasCoordinates = getFacilityCoordinates(facility) !== null;

  return (
    <Card className="w-full p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-ink-500">
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
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] normal-case text-emerald-700">
            {formatDistanceKm(distanceKm)} away
          </span>
        )}
        {rating && (
          <Badge tone="accent" icon={<StarIcon size={10} />}>
            {rating}
          </Badge>
        )}
      </div>

      <h3 className="mt-3 break-words font-display text-xl font-semibold text-ink-900 sm:text-2xl">
        {name}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-ink-600 sm:text-[15px]">
        {summary}
      </p>

      {specialties.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {specialties.map((item) => (
            <Badge key={item} tone="neutral">
              {item}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
          <ChartIcon size={14} />
          <span className="font-mono text-sm">{formatScore(score)}</span>
          <span className="text-[10px] uppercase tracking-wider text-accent-600/80">
            score
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onAnalyze(facility)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-500 transition hover:bg-ink-50 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
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
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
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
