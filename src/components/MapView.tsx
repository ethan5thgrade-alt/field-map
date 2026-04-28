"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface MapViewProps {
  token: string;
  onCoordinatesChange: (coords: { lat: number; lng: number }) => void;
  onPinDrop: (coords: { lat: number; lng: number }) => void;
  pinLocation: { lat: number; lng: number } | null;
  radiusMiles: number;
  flyTo: { lat: number; lng: number } | null;
}

// Use Mapbox's built-in light style as a reliable default.
// User can override with NEXT_PUBLIC_MAPBOX_STYLE_URL for a custom Studio style.
const DEFAULT_STYLE = "mapbox://styles/mapbox/light-v11";

export default function MapView({
  token,
  onCoordinatesChange,
  onPinDrop,
  pinLocation,
  radiusMiles,
  flyTo,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markerRef = useRef<import("mapbox-gl").Marker | null>(null);
  const callbacksRef = useRef({ onCoordinatesChange, onPinDrop });
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep callbacks fresh
  useEffect(() => {
    callbacksRef.current = { onCoordinatesChange, onPinDrop };
  }, [onCoordinatesChange, onPinDrop]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) return;

    let cancelled = false;

    async function initMap() {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");

        if (cancelled || !containerRef.current) return;

        mapboxgl.accessToken = token;
        const style = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || DEFAULT_STYLE;

        const map = new mapboxgl.Map({
          container: containerRef.current,
          style,
          center: [-98.5795, 39.8283],
          zoom: 4,
          attributionControl: false,
          pitchWithRotate: false,
          dragRotate: false,
          touchZoomRotate: true,
        });

        map.addControl(
          new mapboxgl.AttributionControl({ compact: true }),
          "bottom-left"
        );

        map.on("load", () => {
          if (cancelled) return;
          setMapReady(true);
          setLoading(false);

          map.addSource("radius-circle", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: { type: "Point", coordinates: [0, 0] },
              properties: {},
            },
          });

          map.addLayer({
            id: "radius-fill",
            type: "fill",
            source: "radius-circle",
            paint: { "fill-color": "#C2410C", "fill-opacity": 0.08 },
          });

          map.addLayer({
            id: "radius-stroke",
            type: "line",
            source: "radius-circle",
            paint: {
              "line-color": "#C2410C",
              "line-width": 1.5,
              "line-dasharray": [4, 3],
              "line-opacity": 0.5,
            },
          });
        });

        map.on("error", (e) => {
          console.error("Mapbox error:", e);
          const msg = e.error?.message || String(e);
          if (
            msg.includes("access token") ||
            msg.includes("401") ||
            msg.includes("Not Found")
          ) {
            setError("Invalid Mapbox token. Check your token and try again.");
            setLoading(false);
          }
        });

        map.on("move", () => {
          const center = map.getCenter();
          callbacksRef.current.onCoordinatesChange({
            lat: center.lat,
            lng: center.lng,
          });
        });

        map.on("click", (e) => {
          callbacksRef.current.onPinDrop({
            lat: e.lngLat.lat,
            lng: e.lngLat.lng,
          });
        });

        // Disable rotation from touch (keep pinch zoom)
        map.touchZoomRotate.disableRotation();

        // Disable right-click context menu on the map
        map.getCanvas().addEventListener("contextmenu", (e) => e.preventDefault());

        mapRef.current = map;
      } catch (err) {
        console.error("Failed to init map:", err);
        setError("Failed to load the map library. Try refreshing.");
        setLoading(false);
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token]);

  // flyTo
  useEffect(() => {
    if (!mapRef.current || !flyTo) return;
    mapRef.current.flyTo({
      center: [flyTo.lng, flyTo.lat],
      zoom: 12,
      duration: 2000,
      essential: true,
    });
  }, [flyTo]);

  // Pin placement
  useEffect(() => {
    if (!mapRef.current || !pinLocation) return;

    async function placePin() {
      const mapboxgl = (await import("mapbox-gl")).default;
      const map = mapRef.current;
      if (!map) return;

      if (markerRef.current) markerRef.current.remove();

      const el = document.createElement("div");
      el.className = "sitelab-pin";
      el.innerHTML = `
        <div class="pin-container">
          <svg width="28" height="40" viewBox="0 0 28 40" fill="none">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#C2410C"/>
            <path d="M14 2C7.373 2 2 7.373 2 14c0 9.25 12 23 12 23s12-13.75 12-23C26 7.373 20.627 2 14 2z" fill="#9A2E08" opacity="0.3"/>
            <circle cx="14" cy="14" r="5" fill="#FBF7EF"/>
            <circle cx="14" cy="14" r="2.5" fill="#C2410C"/>
          </svg>
        </div>
        <div class="pin-ripple-container">
          <div class="pin-ripple"></div>
          <div class="pin-ripple"></div>
          <div class="pin-ripple"></div>
        </div>
      `;
      el.style.animation = "pin-drop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards";

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([pinLocation!.lng, pinLocation!.lat])
        .addTo(map);
      markerRef.current = marker;

      setTimeout(() => {
        el.querySelectorAll(".pin-ripple").forEach((r, i) => {
          const ripple = r as HTMLElement;
          ripple.style.animationDelay = `${i * 150}ms`;
          ripple.style.animation = "ripple-out 0.8s cubic-bezier(0,0.55,0.45,1) forwards";
        });
      }, 400);

      setTimeout(() => {
        const svg = el.querySelector("svg");
        if (svg) svg.style.animation = "pin-pulse 4s ease-in-out infinite";
      }, 1200);
    }

    placePin();
  }, [pinLocation]);

  // Radius circle
  const updateRadius = useCallback(() => {
    const map = mapRef.current;
    if (!map || !pinLocation || !mapReady) return;
    const source = map.getSource("radius-circle") as import("mapbox-gl").GeoJSONSource | undefined;
    if (!source) return;

    const radiusKm = radiusMiles * 1.60934;
    const coords: [number, number][] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * 2 * Math.PI;
      coords.push([
        pinLocation.lng + (radiusKm * Math.cos(a)) / (111.32 * Math.cos((pinLocation.lat * Math.PI) / 180)),
        pinLocation.lat + (radiusKm * Math.sin(a)) / 111.32,
      ]);
    }
    source.setData({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] },
      properties: {},
    });
  }, [pinLocation, radiusMiles, mapReady]);

  useEffect(() => { updateRadius(); }, [updateRadius]);

  // Error state
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-paper-deep">
        <div className="px-6 py-5 border border-ink-border bg-paper-card rounded-[2px] max-w-sm text-center">
          <p className="text-surveyor-red mb-2" style={{ fontFamily: "var(--font-serif)", fontSize: "1rem" }}>
            Map Error
          </p>
          <p className="text-ink-secondary mb-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
            {error}
          </p>
          <button
            onClick={() => { localStorage.removeItem("fm_mapbox_key"); window.location.reload(); }}
            className="px-4 py-1.5 bg-surveyor-red text-paper-card rounded-[2px] hover:bg-surveyor-red-pressed transition-colors cursor-pointer"
            style={{ fontSize: "0.7rem", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.08em" }}
          >
            Reset Token &amp; Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper-deep/80">
          <div className="text-center">
            <svg viewBox="0 0 40 40" className="w-10 h-10 mx-auto compass-spinner" fill="none" stroke="var(--ink-tertiary)" strokeWidth="1.5">
              <circle cx="20" cy="20" r="16" />
              <polygon points="20,6 22,18 20,16 18,18" fill="var(--red)" stroke="var(--red)" strokeWidth="0.5" />
              <polygon points="20,34 22,22 20,24 18,22" fill="var(--ink-border)" stroke="var(--ink-border)" strokeWidth="0.5" />
            </svg>
            <p className="mt-3 text-ink-tertiary" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>
              Loading map...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
