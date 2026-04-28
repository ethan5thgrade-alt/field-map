"use client";

import { MapPin } from "lucide-react";

interface HeaderProps {
  coordinates: { lat: number; lng: number } | null;
}

function formatCoord(value: number, pos: string, neg: string): string {
  const abs = Math.abs(value);
  const dir = value >= 0 ? pos : neg;
  return `${abs.toFixed(4)}°${dir}`;
}

export default function Header({ coordinates }: HeaderProps) {
  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-3 border-b border-ink-border bg-paper-mid/80 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-surveyor-red rounded-[2px]">
          <MapPin className="w-4 h-4 text-paper-card" strokeWidth={2.5} />
        </div>
        <h1
          className="text-xl tracking-tight text-ink-display"
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: '"opsz" 48',
          }}
        >
          Field Map
        </h1>
      </div>

      {/* Live coordinate readout */}
      <div
        className="text-mono text-ink-tertiary tabular-nums"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
      >
        {coordinates ? (
          <span>
            {formatCoord(coordinates.lat, "N", "S")}
            <span className="mx-1.5 text-ink-disabled">·</span>
            {formatCoord(coordinates.lng, "E", "W")}
          </span>
        ) : (
          <span className="text-ink-disabled">—.————° · —.————°</span>
        )}
      </div>

      {/* Settings placeholder */}
      <nav className="flex items-center gap-4">
        <button
          className="text-cartographic text-ink-secondary hover:text-ink-primary transition-colors duration-150"
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: '"smcp", "c2sc"',
            letterSpacing: "0.12em",
            fontSize: "0.7rem",
          }}
        >
          Settings
        </button>
      </nav>
    </header>
  );
}
