import type { Facility } from "@/types/facility";

export function getFacilityId(facility: Facility): string {
  const candidates: Array<unknown> = [
    facility.facility_id,
    facility.id,
    facility.facility_name,
    facility.name,
  ];
  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null && String(candidate).trim() !== "") {
      return String(candidate);
    }
  }
  return Math.random().toString(36).slice(2);
}

export function getFacilityName(facility: Facility): string {
  return (
    facility.facility_name?.toString().trim() ||
    facility.name?.toString().trim() ||
    "Unnamed facility"
  );
}

export function getFacilityLocation(facility: Facility): string {
  const city = (facility.city ?? facility.address_city ?? "").toString().trim();
  const state = (facility.state ?? facility.address_state ?? "").toString().trim();
  if (city && state) return `${city}, ${state}`;
  return city || state || "Location unavailable";
}

export function getFacilitySpecialties(facility: Facility): string[] {
  const raw = facility.specialties;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((value) => String(value).trim()).filter(Boolean);
  }
  return String(raw)
    .split(/[,;|]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getFacilityScore(facility: Facility): number | null {
  const candidates: unknown[] = [
    facility.composite_score,
    facility.quality_score,
    facility.healthcare_score,
    facility.engagement_score,
    facility.trust_score,
    facility.score,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

export function getFacilityDistanceKm(facility: Facility): number | null {
  const value = facility.distance_km;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

function readNumeric(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function getFacilityCoordinates(
  facility: Facility,
): { lat: number; lng: number } | null {
  const candidates: Array<[unknown, unknown]> = [
    [facility.latitude, facility.longitude],
    [
      (facility.raw as Record<string, unknown> | undefined)?.latitude,
      (facility.raw as Record<string, unknown> | undefined)?.longitude,
    ],
    [facility.lat, facility.lng],
  ];
  for (const [latRaw, lngRaw] of candidates) {
    const lat = readNumeric(latRaw);
    const lng = readNumeric(lngRaw);
    if (lat !== null && lng !== null) {
      return { lat, lng };
    }
  }
  return null;
}

export function formatDistanceKm(km: number | null): string {
  if (km === null) return "";
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${km.toFixed(0)} km`;
}

export function formatScore(value: number | null): string {
  if (value === null) return "—";
  // Heuristic: if score is on 0–1 scale, present it as percent.
  const normalized = value > 1 ? value : value * 100;
  return `${normalized.toFixed(0)}`;
}

export function getRatingLabel(facility: Facility): string | null {
  const raw = facility.rating;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed || null;
}

export function summarizeFacility(facility: Facility): string {
  const description =
    typeof facility.description === "string" && facility.description.trim()
      ? facility.description.trim()
      : "";
  if (description) return description;

  const specialties = getFacilitySpecialties(facility);
  if (specialties.length) {
    return `Specialties: ${specialties.slice(0, 4).join(", ")}.`;
  }
  return "No description available for this facility.";
}
