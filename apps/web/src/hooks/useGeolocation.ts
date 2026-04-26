import { useCallback, useState } from "react";

export type GeolocationStatus = "idle" | "loading" | "ok" | "error";

interface GeolocationState {
  status: GeolocationStatus;
  error: string | null;
}

export type GeolocationRequestResult =
  | { ok: true; latitude: number; longitude: number; accuracy: number }
  | { ok: false; error: string };

interface UseGeolocationReturn extends GeolocationState {
  request: () => Promise<GeolocationRequestResult>;
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

  const request = useCallback((): Promise<GeolocationRequestResult> => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      const err = "Geolocation is not available in this browser.";
      setState({
        status: "error",
        error: err,
      });
      return Promise.resolve({ ok: false, error: err });
    }

    setState({ status: "loading", error: null });

    return new Promise<GeolocationRequestResult>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result = {
            ok: true as const,
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
          resolve({ ok: false, error: message });
        },
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
      );
    });
  }, []);

  return { ...state, request, reset };
}
