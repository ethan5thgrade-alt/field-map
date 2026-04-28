"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader2, Filter, X } from "lucide-react";
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

interface Filters {
  category: string;
  websiteStatus: "any" | "none" | "broken" | "working";
  hasPhone: "any" | "yes" | "no";
  minRating: number;
  minReviews: number;
}

const DEFAULT_FILTERS: Filters = {
  category: "all",
  websiteStatus: "any",
  hasPhone: "any",
  minRating: 0,
  minReviews: 0,
};

const CATEGORIES = [
  "all", "restaurant", "contractor", "salon", "auto", "retail", "professional",
];

async function fetchRealBusinesses(
  lat: number,
  lng: number,
  radiusMiles: number,
  category: string,
): Promise<Business[] | null> {
  try {
    const googleApiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("fm_google_places_key")
        : null;

    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat,
        lng,
        radiusMiles,
        category: category !== "all" ? category : undefined,
        googleApiKey: googleApiKey || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 500 && data.error?.includes("not configured")) {
        return null;
      }
      console.error("Places API error:", data.error);
      return null;
    }
    const data = await res.json();
    return data.businesses as Business[];
  } catch (err) {
    console.error("Failed to fetch businesses:", err);
    return null;
  }
}

function applyClientFilters(businesses: Business[], filters: Filters): Business[] {
  return businesses.filter((biz) => {
    if (filters.websiteStatus !== "any" && biz.websiteStatus !== filters.websiteStatus) return false;
    if (filters.hasPhone === "yes" && !biz.phone) return false;
    if (filters.hasPhone === "no" && biz.phone) return false;
    if (biz.rating < filters.minRating) return false;
    if (biz.reviewCount < filters.minReviews) return false;
    return true;
  });
}

export default function Home() {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusMiles, setRadiusMiles] = useState(5);
  const [allResults, setAllResults] = useState<Business[]>([]);
  const [results, setResults] = useState<Business[]>([]);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [usingRealData, setUsingRealData] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const stored =
      localStorage.getItem("fm_mapbox_key") ||
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      null;
    if (stored) setMapboxToken(stored);
    setTokenChecked(true);
  }, []);

  // Re-apply client side filters when they change
  useEffect(() => {
    setResults(applyClientFilters(allResults, filters));
  }, [filters, allResults]);

  const handleCoordinatesChange = useCallback(
    (coords: { lat: number; lng: number }) => setCoordinates(coords),
    []
  );

  const searchBusinesses = useCallback(
    async (lat: number, lng: number, radius: number, cat: string) => {
      if (isOverLimit("searches")) {
        alert("You've reached your search limit. Upgrade your plan for more.");
        return;
      }

      setPinLocation({ lat, lng });
      setCoordinates({ lat, lng });
      incrementUsage("searches");
      setSearching(true);
      setResultsOpen(true);

      const real = await fetchRealBusinesses(lat, lng, radius, cat);
      let businesses: Business[];
      if (real && real.length > 0) {
        businesses = real;
        setUsingRealData(true);
      } else {
        businesses = generateMockBusinesses(lat, lng, radius);
        setUsingRealData(false);
      }
      setAllResults(businesses);
      setSearching(false);
    },
    []
  );

  const handlePinDrop = useCallback(
    (coords: { lat: number; lng: number }) => {
      searchBusinesses(coords.lat, coords.lng, radiusMiles, filters.category);
    },
    [radiusMiles, filters.category, searchBusinesses]
  );

  const handleLocationFound = useCallback(
    (result: { lat: number; lng: number; name: string }) => {
      setFlyTo({ lat: result.lat, lng: result.lng });
      setTimeout(() => {
        searchBusinesses(result.lat, result.lng, radiusMiles, filters.category);
      }, 1500);
    },
    [radiusMiles, filters.category, searchBusinesses]
  );

  const handleTokenSet = useCallback((token: string) => {
    setMapboxToken(token);
  }, []);

  const activeFilterCount =
    (filters.category !== "all" ? 1 : 0) +
    (filters.websiteStatus !== "any" ? 1 : 0) +
    (filters.hasPhone !== "any" ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.minReviews > 0 ? 1 : 0);

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
      <MapView
        token={mapboxToken}
        onCoordinatesChange={handleCoordinatesChange}
        onPinDrop={handlePinDrop}
        pinLocation={pinLocation}
        radiusMiles={radiusMiles}
        flyTo={flyTo}
      />

      {/* ── Top bar: search + filters + coords ── */}
      <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="pointer-events-auto flex-1 max-w-sm">
            <SearchInput onLocationFound={handleLocationFound} />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-[2px] border shadow-sm transition-all duration-150 cursor-pointer ${
              filtersOpen || activeFilterCount > 0
                ? "bg-surveyor-red text-paper-card border-surveyor-red"
                : "bg-paper-card/90 backdrop-blur-sm border-ink-border text-ink-secondary hover:border-ink-tertiary"
            }`}
            style={{
              fontFamily: "var(--font-sans)",
              fontFeatureSettings: '"smcp","c2sc"',
              letterSpacing: "0.08em",
              fontSize: "0.6rem",
            }}
          >
            <Filter className="w-3 h-3" />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="ml-0.5 px-1 py-0 bg-paper-card/20 rounded-full"
                style={{ fontSize: "0.55rem" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex-1" />

          <div
            className="pointer-events-auto px-3 py-2 bg-paper-card/90 backdrop-blur-sm border border-ink-border rounded-[2px] shadow-sm tabular-nums"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-tertiary)" }}
          >
            {coordinates ? (
              <span>
                {formatCoord(coordinates.lat, "N", "S")}
                <span className="mx-1 text-ink-disabled">&middot;</span>
                {formatCoord(coordinates.lng, "E", "W")}
              </span>
            ) : (
              <span className="text-ink-disabled">&mdash;.&mdash;&mdash;&mdash;&mdash;&deg; &middot; &mdash;.&mdash;&mdash;&mdash;&mdash;&deg;</span>
            )}
          </div>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="pointer-events-auto mx-4 mb-2 p-4 bg-paper-card/95 backdrop-blur-sm border border-ink-border rounded-[2px] shadow-lg" style={{ animation: "modal-in 0.15s ease-out" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.1em", fontSize: "0.6rem", color: "var(--ink-secondary)" }}>
                Search Filters
              </span>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="text-ink-tertiary hover:text-surveyor-red transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem" }}
                  >
                    Reset
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="text-ink-tertiary hover:text-ink-primary cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Category */}
              <div>
                <label className="block mb-1" style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.06em", fontSize: "0.5rem", color: "var(--ink-disabled)" }}>
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-2 py-1.5 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary outline-none focus:border-brass cursor-pointer"
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem" }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c === "all" ? "All categories" : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Website status */}
              <div>
                <label className="block mb-1" style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.06em", fontSize: "0.5rem", color: "var(--ink-disabled)" }}>
                  Website
                </label>
                <select
                  value={filters.websiteStatus}
                  onChange={(e) => setFilters({ ...filters, websiteStatus: e.target.value as Filters["websiteStatus"] })}
                  className="w-full px-2 py-1.5 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary outline-none focus:border-brass cursor-pointer"
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem" }}
                >
                  <option value="any">Any</option>
                  <option value="none">No website</option>
                  <option value="broken">Broken site</option>
                  <option value="working">Has website</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-1" style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.06em", fontSize: "0.5rem", color: "var(--ink-disabled)" }}>
                  Phone
                </label>
                <select
                  value={filters.hasPhone}
                  onChange={(e) => setFilters({ ...filters, hasPhone: e.target.value as Filters["hasPhone"] })}
                  className="w-full px-2 py-1.5 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary outline-none focus:border-brass cursor-pointer"
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem" }}
                >
                  <option value="any">Any</option>
                  <option value="yes">Has phone</option>
                  <option value="no">No phone</option>
                </select>
              </div>

              {/* Min rating */}
              <div>
                <label className="block mb-1" style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.06em", fontSize: "0.5rem", color: "var(--ink-disabled)" }}>
                  Min Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary outline-none focus:border-brass cursor-pointer"
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem" }}
                >
                  <option value={0}>Any</option>
                  <option value={3}>3+ stars</option>
                  <option value={3.5}>3.5+ stars</option>
                  <option value={4}>4+ stars</option>
                  <option value={4.5}>4.5+ stars</option>
                </select>
              </div>

              {/* Min reviews */}
              <div>
                <label className="block mb-1" style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.06em", fontSize: "0.5rem", color: "var(--ink-disabled)" }}>
                  Min Reviews
                </label>
                <select
                  value={filters.minReviews}
                  onChange={(e) => setFilters({ ...filters, minReviews: Number(e.target.value) })}
                  className="w-full px-2 py-1.5 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary outline-none focus:border-brass cursor-pointer"
                  style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem" }}
                >
                  <option value={0}>Any</option>
                  <option value={5}>5+</option>
                  <option value={10}>10+</option>
                  <option value={25}>25+</option>
                  <option value={50}>50+</option>
                  <option value={100}>100+</option>
                </select>
              </div>
            </div>

            {/* Re-search with category */}
            {pinLocation && filters.category !== "all" && (
              <button
                onClick={() => searchBusinesses(pinLocation.lat, pinLocation.lng, radiusMiles, filters.category)}
                className="mt-3 px-4 py-1.5 bg-surveyor-red text-paper-card rounded-[2px] hover:bg-surveyor-red-pressed transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.08em", fontSize: "0.6rem" }}
              >
                Search {filters.category} near pin
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Radius slider ── */}
      {pinLocation && (
        <div className="absolute bottom-6 left-4 z-20 w-56 px-4 py-3 bg-paper-card/90 backdrop-blur-sm border border-ink-border rounded-[2px] shadow-sm">
          <RadiusSlider
            value={radiusMiles}
            onChange={(v) => {
              setRadiusMiles(v);
              if (pinLocation) {
                searchBusinesses(pinLocation.lat, pinLocation.lng, v, filters.category);
              }
            }}
          />
        </div>
      )}

      {/* ── Results panel ── */}
      {(results.length > 0 || allResults.length > 0 || searching) && (
        <div
          className="absolute top-16 right-4 bottom-4 z-20 flex flex-col bg-paper-card/95 backdrop-blur-sm border border-ink-border rounded-[2px] shadow-lg transition-all duration-300"
          style={{ width: resultsOpen ? "360px" : "48px" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-border shrink-0">
            {resultsOpen && (
              <div className="flex items-center gap-2">
                <h2 style={{ fontFamily: "var(--font-sans)", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.1em", fontSize: "0.65rem", color: "var(--ink-secondary)" }}>
                  Results
                </h2>
                <span className="px-1.5 py-0.5 bg-paper-mid rounded-[2px]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-tertiary)" }}>
                  {searching ? "..." : results.length}
                  {!searching && results.length !== allResults.length && ` / ${allResults.length}`}
                </span>
                {!usingRealData && !searching && allResults.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-goldenrod/10 text-goldenrod rounded-[2px]" style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem" }}>
                    MOCK
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => setResultsOpen(!resultsOpen)}
              className="p-1 text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
            >
              {resultsOpen ? <ChevronDown className="w-4 h-4 rotate-90" /> : <ChevronUp className="w-4 h-4 -rotate-90" />}
            </button>
          </div>

          {resultsOpen && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {searching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-ink-tertiary animate-spin" />
                  <p className="mt-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--ink-tertiary)" }}>
                    Searching area...
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "var(--ink-tertiary)" }}>
                    No businesses match your filters.
                  </p>
                  <button
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="mt-2 text-surveyor-red cursor-pointer"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                results.map((biz, i) => (
                  <ResultCard key={biz.id} business={biz} index={i} />
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {!pinLocation && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <p style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"opsz" 72', fontStyle: "italic", fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)", color: "var(--ink-secondary)", textShadow: "0 1px 8px rgba(237,230,214,0.9)" }}>
              Click anywhere to drop a pin
            </p>
            <p className="mt-1" style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--ink-tertiary)", textShadow: "0 1px 6px rgba(237,230,214,0.9)" }}>
              or search by city / zip code above
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
