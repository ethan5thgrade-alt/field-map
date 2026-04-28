"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import MapView from "@/components/MapView";
import SearchInput from "@/components/SearchInput";
import RadiusSlider from "@/components/RadiusSlider";
import ResultCard from "@/components/ResultCard";
import TokenInput from "@/components/TokenInput";
import { generateMockBusinesses, type Business } from "@/lib/mockData";
import { incrementUsage, isOverLimit } from "@/lib/store";

function formatCoord(value: number, pos: string, neg: string): string {
  const abs = Math.abs(value);
  const dir = value >= 0 ? pos : neg;
  return `${abs.toFixed(4)}\u00B0${dir}`;
}

export default function Home() {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pinLocation, setPinLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(5);
  const [results, setResults] = useState<Business[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);

  useEffect(() => {
    const stored =
      localStorage.getItem("fm_mapbox_key") ||
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      null;
    if (stored) setMapboxToken(stored);
    setTokenChecked(true);
  }, []);

  const handleCoordinatesChange = useCallback(
    (coords: { lat: number; lng: number }) => setCoordinates(coords),
    []
  );

  const handlePinDrop = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (isOverLimit("searches")) {
        alert("You've reached your search limit. Upgrade your plan for more.");
        return;
      }
      setPinLocation(coords);
      setCoordinates(coords);
      incrementUsage("searches");
      const businesses = generateMockBusinesses(coords.lat, coords.lng, radiusMiles);
      setResults(businesses);
      setResultsOpen(true);
    },
    [radiusMiles]
  );

  const handleLocationFound = useCallback(
    (result: { lat: number; lng: number; name: string }) => {
      if (isOverLimit("searches")) {
        alert("You've reached your search limit. Upgrade your plan for more.");
        return;
      }
      setFlyTo({ lat: result.lat, lng: result.lng });
      setTimeout(() => {
        setPinLocation({ lat: result.lat, lng: result.lng });
        setCoordinates({ lat: result.lat, lng: result.lng });
        incrementUsage("searches");
        const businesses = generateMockBusinesses(result.lat, result.lng, radiusMiles);
        setResults(businesses);
        setResultsOpen(true);
      }, 1500);
    },
    [radiusMiles]
  );

  const handleTokenSet = useCallback((token: string) => {
    setMapboxToken(token);
  }, []);

  if (!tokenChecked) return null;

  if (!mapboxToken) {
    return (
      <div className="relative h-full">
        <TokenInput onTokenSet={handleTokenSet} />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Map fills entire screen */}
      <MapView
        token={mapboxToken}
        onCoordinatesChange={handleCoordinatesChange}
        onPinDrop={handlePinDrop}
        pinLocation={pinLocation}
        radiusMiles={radiusMiles}
        flyTo={flyTo}
      />

      {/* ── Floating search + coords ── */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Search */}
          <div className="pointer-events-auto flex-1 max-w-sm">
            <SearchInput onLocationFound={handleLocationFound} />
          </div>

          <div className="flex-1" />

          {/* Coordinate readout */}
          <div
            className="pointer-events-auto px-3 py-2 bg-paper-card/90 backdrop-blur-sm border border-ink-border rounded-[2px] shadow-sm tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "var(--ink-tertiary)",
            }}
          >
            {coordinates ? (
              <span>
                {formatCoord(coordinates.lat, "N", "S")}
                <span className="mx-1 text-ink-disabled">&middot;</span>
                {formatCoord(coordinates.lng, "E", "W")}
              </span>
            ) : (
              <span className="text-ink-disabled">
                &mdash;.&mdash;&mdash;&mdash;&mdash;&deg; &middot;
                &mdash;.&mdash;&mdash;&mdash;&mdash;&deg;
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Radius slider — floating bottom-left ── */}
      {pinLocation && (
        <div className="absolute bottom-6 left-4 z-20 w-56 px-4 py-3 bg-paper-card/90 backdrop-blur-sm border border-ink-border rounded-[2px] shadow-sm">
          <RadiusSlider
            value={radiusMiles}
            onChange={(v) => {
              setRadiusMiles(v);
              if (pinLocation) {
                setResults(
                  generateMockBusinesses(pinLocation.lat, pinLocation.lng, v)
                );
              }
            }}
          />
        </div>
      )}

      {/* ── Results panel — floating right side ── */}
      {results.length > 0 && (
        <div
          className="absolute top-16 right-4 bottom-4 z-20 flex flex-col bg-paper-card/95 backdrop-blur-sm border border-ink-border rounded-[2px] shadow-lg transition-all duration-300"
          style={{ width: resultsOpen ? "360px" : "48px" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border shrink-0">
            {resultsOpen && (
              <div className="flex items-center gap-2">
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontFeatureSettings: '"smcp","c2sc"',
                    letterSpacing: "0.1em",
                    fontSize: "0.65rem",
                    color: "var(--ink-secondary)",
                  }}
                >
                  Results
                </h2>
                <span
                  className="px-1.5 py-0.5 bg-paper-mid rounded-[2px]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--ink-tertiary)",
                  }}
                >
                  {results.length}
                </span>
              </div>
            )}
            <button
              onClick={() => setResultsOpen(!resultsOpen)}
              className="p-1 text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
            >
              {resultsOpen ? (
                <ChevronDown className="w-4 h-4 rotate-90" />
              ) : (
                <ChevronUp className="w-4 h-4 -rotate-90" />
              )}
            </button>
          </div>

          {resultsOpen && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {results.map((biz, i) => (
                <ResultCard key={biz.id} business={biz} index={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {!pinLocation && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: '"opsz" 72',
                fontStyle: "italic",
                fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
                color: "var(--ink-secondary)",
                textShadow: "0 1px 8px rgba(237,230,214,0.9)",
              }}
            >
              Click anywhere to drop a pin
            </p>
            <p
              className="mt-1"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--ink-tertiary)",
                textShadow: "0 1px 6px rgba(237,230,214,0.9)",
              }}
            >
              or search by city / zip code above
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
