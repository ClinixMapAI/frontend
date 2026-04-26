import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  CloseIcon,
  MapPinIcon,
  SparkleIcon,
} from "@/components/ui/icons";
import { useFacilityStore } from "@/store/useFacilityStore";
import {
  formatDistanceKm,
  getFacilityCoordinates,
  getFacilityDistanceKm,
  getFacilityLocation,
  getFacilityName,
} from "@/utils/format";

// Leaflet ships its default marker icon URLs in a way that breaks under Vite's
// asset pipeline. Re-bind them to the bundled asset URLs so markers render.
const markerIconUrl = new URL(
  "leaflet/dist/images/marker-icon.png",
  import.meta.url,
).toString();
const markerIcon2xUrl = new URL(
  "leaflet/dist/images/marker-icon-2x.png",
  import.meta.url,
).toString();
const markerShadowUrl = new URL(
  "leaflet/dist/images/marker-shadow.png",
  import.meta.url,
).toString();

const facilityMarker = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Leaflet sometimes mis-measures inside a freshly-mounted modal — give it
    // a tick to settle and then invalidate the size.
    const id = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => window.clearTimeout(id);
  }, [center, zoom, map]);
  return null;
}

export function FacilityMapModal() {
  const isOpen = useFacilityStore((state) => state.isMapOpen);
  const facility = useFacilityStore((state) => state.mapFacility);
  const close = useFacilityStore((state) => state.closeMap);
  const openAnalyze = useFacilityStore((state) => state.openFacility);
  const closeMap = useFacilityStore((state) => state.closeMap);

  const coords = useMemo(
    () => (facility ? getFacilityCoordinates(facility) : null),
    [facility],
  );

  // Lock body scroll + ESC to close, mirroring the regular Modal.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  if (!isOpen || !facility) return null;

  const name = getFacilityName(facility);
  const location = getFacilityLocation(facility);
  const distanceKm = getFacilityDistanceKm(facility);
  const center: [number, number] | null = coords
    ? [coords.lat, coords.lng]
    : null;

  const handleAnalyze = () => {
    closeMap();
    openAnalyze(facility);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Map view of ${name}`}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        aria-label="Close map"
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink-900/70 backdrop-blur-sm animate-fade-in"
      />

      <div className="relative z-10 mx-4 flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-glow animate-fade-in sm:mx-6">
        <header className="flex items-start justify-between gap-4 border-b border-ink-100 p-5 sm:p-6">
          <div className="min-w-0">
            <Badge tone="accent" className="mb-2">
              <MapPinIcon size={10} />
              Map view
            </Badge>
            <h2 className="font-display text-xl font-semibold text-ink-900 sm:text-2xl">
              {name}
            </h2>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-500">
              <MapPinIcon size={14} />
              {location}
              {distanceKm !== null && (
                <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
                  {formatDistanceKm(distanceKm)} away
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-mr-2 -mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="relative flex-1 bg-ink-100">
          {center ? (
            <MapContainer
              center={center}
              zoom={14}
              scrollWheelZoom
              className="h-full w-full"
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center} icon={facilityMarker}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold text-ink-900">{name}</p>
                    <p className="text-xs text-ink-600">{location}</p>
                    <p className="font-mono text-[11px] text-ink-500">
                      {center[0].toFixed(4)}, {center[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <RecenterMap center={center} zoom={14} />
            </MapContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
                  <MapPinIcon size={20} />
                </div>
                <p className="mt-3 font-display text-lg font-semibold text-ink-900">
                  No coordinates available
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  This facility doesn’t have geolocation data attached, so we
                  can’t plot it on a map yet.
                </p>
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/60 p-4">
          <p className="text-xs text-ink-500">
            Map data ©{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              OpenStreetMap
            </a>{" "}
            contributors
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={close}>
              Close
            </Button>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<SparkleIcon size={14} />}
              rightIcon={<ArrowRightIcon size={14} />}
              onClick={handleAnalyze}
            >
              Analyze with AI
            </Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
