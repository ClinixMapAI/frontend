export interface IndianCityPreset {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

/** Major Indian cities for search origin. First entry is the app default. */
export const INDIAN_CITY_PRESETS: IndianCityPreset[] = [
  { id: "bengaluru", label: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  { id: "mumbai", label: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { id: "delhi", label: "New Delhi", latitude: 28.6139, longitude: 77.209 },
  { id: "hyderabad", label: "Hyderabad", latitude: 17.385, longitude: 78.4867 },
  { id: "chennai", label: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { id: "kolkata", label: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
  { id: "pune", label: "Pune", latitude: 18.5204, longitude: 73.8567 },
  { id: "ahmedabad", label: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  { id: "jaipur", label: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
  { id: "lucknow", label: "Lucknow", latitude: 26.8467, longitude: 80.9462 },
  { id: "kochi", label: "Kochi", latitude: 9.9312, longitude: 76.2673 },
  { id: "chandigarh", label: "Chandigarh", latitude: 30.7333, longitude: 76.7794 },
];

export const DEFAULT_INDIAN_CITY = INDIAN_CITY_PRESETS[0];

/** Match store coordinates to a preset within ~5 km. */
export function matchPresetByCoordinates(
  latitude: number,
  longitude: number,
  presets: IndianCityPreset[] = INDIAN_CITY_PRESETS,
): IndianCityPreset | null {
  const eps = 0.045;
  return (
    presets.find(
      (p) =>
        Math.abs(p.latitude - latitude) < eps &&
        Math.abs(p.longitude - longitude) < eps,
    ) ?? null
  );
}
