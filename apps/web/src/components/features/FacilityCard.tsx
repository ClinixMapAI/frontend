import { memo } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import {
  ArrowRightIcon,
  ChartIcon,
  MapPinIcon,
  StarIcon,
} from "@/components/ui/icons";
import {
  formatDistanceKm,
  formatScore,
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
}

function FacilityCardImpl({ facility, rank, onAnalyze }: FacilityCardProps) {
  const name = getFacilityName(facility);
  const location = getFacilityLocation(facility);
  const distanceKm = getFacilityDistanceKm(facility);
  const score = getFacilityScore(facility);
  const rating = getRatingLabel(facility);
  const specialties = getFacilitySpecialties(facility).slice(0, 4);
  const summary = summarizeFacility(facility);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wider text-ink-500">
            {typeof rank === "number" && (
              <span className="rounded-full bg-ink-900 px-2 py-0.5 font-mono text-[10px] text-gold-400">
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
          </div>
          <h3 className="mt-2 truncate font-display text-lg font-semibold text-ink-900">
            {name}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 rounded-2xl bg-ink-900 px-3 py-1.5 text-xs font-semibold text-gold-400 shadow-soft">
            <ChartIcon size={14} />
            <span className="font-mono text-sm">{formatScore(score)}</span>
            <span className="text-[10px] uppercase tracking-wider text-gold-200/80">
              score
            </span>
          </div>
          {rating && (
            <Badge tone="gold" icon={<StarIcon size={10} />}>
              {rating}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardBody className="flex-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-ink-600">
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
      </CardBody>

      <CardFooter>
        <span className="text-xs text-ink-500">AI analysis available</span>
        <Button
          size="sm"
          variant="secondary"
          rightIcon={<ArrowRightIcon size={14} />}
          onClick={() => onAnalyze(facility)}
        >
          Analyze
        </Button>
      </CardFooter>
    </Card>
  );
}

export const FacilityCard = memo(FacilityCardImpl);
