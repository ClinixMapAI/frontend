import { useCallback, useState } from "react";

export type GeolocationStatus = "idle" | "loading" | "ok" | "error";

interface GeolocationState {
  status: GeolocationStatus;
  error: string | null;
}

interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn extends GeolocationState {
  request: () => Promise<GeolocationResult | null>;
  reset: () => void;
}

/**
 * Wraps `navigator.geolocation.getCurrentPosition` in a promise-based React
 * hook with explicit status tracking. Components await `request()` and decide
 * what to do with the coordinates (e.g. push them into the search store).
 */
export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    error: null,
  });

  const reset = useCallback(() => {
    setState({ status: "idle", error: null });
  }, []);

  const request = useCallback((): Promise<GeolocationResult | null> => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({
        status: "error",
        error: "Geolocation is not available in this browser.",
      });
      return Promise.resolve(null);
    }

    setState({ status: "loading", error: null });

    return new Promise<GeolocationResult | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result: GeolocationResult = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setState({ status: "ok", error: null });
          resolve(result);
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Location permission denied. Enter coordinates manually."
              : error.code === error.POSITION_UNAVAILABLE
                ? "Location unavailable on this device."
                : error.message || "Failed to read location.";
          setState({ status: "error", error: message });
          resolve(null);
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
      );
    });
  }, []);

  return { ...state, request, reset };
}
