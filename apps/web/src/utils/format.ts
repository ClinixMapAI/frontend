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

function readNumberFromRaw(raw: Record<string, unknown>, keys: string[]): number | null {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    lower[String(k).toLowerCase()] = v;
  }
  for (const k of keys) {
    const v = lower[k.toLowerCase()];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function getMedicalScore(facility: Facility): number | null {
  const direct = facility.medical_score;
  if (typeof direct === "number" && Number.isFinite(direct)) return direct;
  const raw = facility.raw as Record<string, unknown> | undefined;
  if (raw) {
    const n = readNumberFromRaw(raw, [
      "medical_score",
      "Medical_Score",
      "med_score",
      "clinical_score",
      "ai_medical_score",
    ]);
    if (n !== null) return n;
  }
  return null;
}

/** Phrases from the AI reasoning layer (comma- or newline-separated). */
export function getAiExplanationLines(facility: Facility): string[] {
  let text = typeof facility.explanation === "string" ? facility.explanation.trim() : "";
  if (!text) {
    const raw = facility.raw as Record<string, unknown> | undefined;
    if (raw) {
      const lower: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(raw)) {
        lower[String(k).toLowerCase()] = v;
      }
      for (const key of [
        "explanation",
        "ai_explanation",
        "reasoning",
        "match_explanation",
        "medical_explanation",
      ]) {
        const v = lower[key];
        if (typeof v === "string" && v.trim()) {
          text = v.trim();
          break;
        }
        if (v != null && typeof v !== "object") {
          text = String(v).trim();
          if (text) break;
        }
      }
    }
  }
  if (!text) return [];
  return text
    .split(/[,\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function explanationItemHasWarning(line: string): boolean {
  return (
    line.includes("⚠") ||
    line.includes("\u26A0") ||
    line.includes("\u26A0\uFE0F")
  );
}

/** One string per comma-separated phrase from the AI explanation field. */
export function getExplanationPhrases(facility: Facility): string[] {
  const chunks = getAiExplanationLines(facility);
  if (chunks.length === 0) return [];

  const items: string[] = [];
  for (const chunk of chunks) {
    const parts = chunk
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      items.push(...parts);
    } else {
      const t = chunk.trim();
      if (t) items.push(t);
    }
  }
  return items;
}

function decapitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function softenCapabilityPhrase(phrase: string): string {
  let t = phrase.trim();
  if (!t) return t;
  t = t.replace(/\bICU\s+available\b/gi, "ICU care");
  t = t.replace(/\boxygen\s+available\b/gi, "oxygen support");
  t = t.replace(/\boxygen\s+support\s+available\b/gi, "oxygen support");
  t = t.replace(/\bsurgery\s+capability\b/gi, "surgical capability");
  t = t.replace(/\bsurgical\s+capability\b/gi, "surgical capability");
  return decapitalize(t);
}

function formatWarningAsClause(text: string): string {
  const cleaned = text
    .replace(/^⚠\s*/u, "")
    .replace(/\u26A0\uFE0F?/gu, "")
    .trim();
  if (!cleaned) return "";
  const lower = decapitalize(cleaned);
  if (/^no\b/i.test(cleaned) && /anesthesiologist/i.test(cleaned)) {
    return "No anesthesiologist listed — this may impact surgical safety.";
  }
  if (/^no\b/i.test(cleaned)) {
    const detail = lower.replace(/^no\s+/, "").trim();
    return `no ${detail} is listed, which may impact surgical safety.`;
  }
  if (!/[.!?]$/.test(lower)) {
    return `${lower}, which may warrant verification.`;
  }
  return lower;
}

function joinPositives(positives: string[]): string {
  const parts = positives.map(softenCapabilityPhrase).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/**
 * Turns comma-separated AI signals into 1–2 natural sentences (not a checklist).
 */
export function formatFacilityReasoningProse(facility: Facility): string | null {
  const phrases = getExplanationPhrases(facility);
  if (phrases.length === 0) return null;

  const positives: string[] = [];
  const warnings: string[] = [];

  for (const raw of phrases) {
    const stripped = raw
      .replace(/^⚠\s*/u, "")
      .replace(/\u26A0\uFE0F?/gu, "")
      .trim();
    if (explanationItemHasWarning(raw)) {
      if (stripped) warnings.push(stripped);
    } else if (stripped) {
      positives.push(stripped);
    }
  }

  const sentences: string[] = [];

  if (positives.length > 0) {
    const body = joinPositives(positives);
    const head = body.charAt(0).toUpperCase() + body.slice(1);
    sentences.push(`Offers ${head}.`);
  }

  if (warnings.length > 0) {
    const clauses = warnings.map(formatWarningAsClause).filter(Boolean);
    if (clauses.length > 0) {
      sentences.push(`However, ${clauses.join(" ")}`);
    }
  }

  const out = sentences.join(" ").trim();
  return out || null;
}

export function getTrustFlag(facility: Facility): "OK" | "LOW" | null {
  const parse = (v: unknown): "OK" | "LOW" | null => {
    if (v === true) return "OK";
    if (v === false) return "LOW";
    if (typeof v !== "string") return null;
    const u = v.trim().toUpperCase();
    if (u === "OK" || u === "LOW") return u;
    if (u === "TRUE" || u === "1" || u === "YES" || u === "Y") return "OK";
    if (u === "FALSE" || u === "0" || u === "NO" || u === "N") return "LOW";
    return null;
  };

  const a = parse(facility.trust_flag);
  if (a) return a;
  const raw = facility.raw as Record<string, unknown> | undefined;
  if (!raw) return null;
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    lower[String(k).toLowerCase()] = v;
  }
  for (const key of ["trust_flag", "trustflag", "data_trust_flag"]) {
    const b = parse(lower[key]);
    if (b) return b;
  }
  return null;
}

export function getFacilityScore(facility: Facility): number | null {
  const candidates: unknown[] = [
    getMedicalScore(facility),
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

