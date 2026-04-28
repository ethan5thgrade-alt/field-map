"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  onLocationFound: (coords: { lat: number; lng: number; name: string }) => void;
}

interface Suggestion {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export default function SearchInput({ onLocationFound }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Geocode via Mapbox Geocoding API
  const geocode = async (text: string) => {
    const token =
      localStorage.getItem("fm_mapbox_key") ||
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      "";
    if (!token || text.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          text
        )}.json?access_token=${token}&types=place,postcode,locality,neighborhood&country=us&limit=5`
      );
      const data = await res.json();
      const results: Suggestion[] = (data.features || []).map(
        (f: { id: string; place_name: string; center: [number, number] }) => ({
          id: f.id,
          name: f.place_name,
          lng: f.center[0],
          lat: f.center[1],
        })
      );
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocode(value), 300);
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.name);
    setShowSuggestions(false);
    onLocationFound({ lat: s.lat, lng: s.lng, name: s.name });
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = () => setShowSuggestions(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      className="relative z-20"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-tertiary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search city or zip code..."
          className="w-full pl-9 pr-8 py-2 bg-paper-card border border-ink-border rounded-[2px] text-ink-primary placeholder:text-ink-disabled outline-none focus:border-ink-tertiary transition-colors duration-150"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-secondary transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 border border-ink-border border-t-ink-tertiary rounded-full animate-spin" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-paper-card border border-ink-border rounded-[2px] shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-3 py-2 hover:bg-paper-mid transition-colors duration-100 border-b border-ink-border last:border-0"
              style={{ fontSize: "0.8rem" }}
            >
              <span
                className="text-ink-primary"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {s.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
