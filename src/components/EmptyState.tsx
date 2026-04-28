"use client";

import { MapPin, Search, Phone } from "lucide-react";

interface Mission {
  title: string;
  icon: typeof MapPin;
  lat: number;
  lng: number;
  name: string;
}

const missions: Mission[] = [
  { title: "Find restaurants without websites in Phoenix", icon: Search, lat: 33.4484, lng: -112.074, name: "Phoenix, AZ" },
  { title: "Locate contractors in rural Texas", icon: MapPin, lat: 31.9686, lng: -99.9018, name: "Central Texas" },
  { title: "Survey salons in Brooklyn", icon: Phone, lat: 40.6782, lng: -73.9442, name: "Brooklyn, NY" },
];

interface EmptyStateProps {
  onMissionClick: (coords: { lat: number; lng: number; name: string }) => void;
}

export default function EmptyState({ onMissionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      {/* Spinning compass */}
      <svg
        viewBox="0 0 200 200"
        className="w-32 h-32 compass-rose"
        fill="none"
        stroke="var(--ink-border)"
        strokeWidth="1"
        style={{ animationDuration: "120s" }}
      >
        <circle cx="100" cy="100" r="85" />
        <polygon
          points="100,25 107,70 100,62 93,70"
          fill="var(--red)"
          stroke="var(--red)"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <polygon
          points="100,175 107,130 100,138 93,130"
          fill="var(--ink-border)"
          stroke="var(--ink-border)"
          strokeWidth="0.5"
        />
        <polygon
          points="25,100 70,93 62,100 70,107"
          fill="var(--ink-border)"
          stroke="var(--ink-border)"
          strokeWidth="0.5"
        />
        <polygon
          points="175,100 130,93 138,100 130,107"
          fill="var(--ink-border)"
          stroke="var(--ink-border)"
          strokeWidth="0.5"
        />
        <circle cx="100" cy="100" r="3" fill="var(--ink-border)" />
      </svg>

      <p
        className="mt-8 text-display-md"
        style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: '"opsz" 72',
          fontStyle: "italic",
          color: "var(--ink-secondary)",
        }}
      >
        Drop a pin to begin surveying.
      </p>

      <p
        className="mt-3 text-ink-tertiary"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.85rem",
        }}
      >
        Click anywhere on the map, or search by city or zip code.
      </p>

      {/* Example missions */}
      <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-xl">
        {missions.map((mission) => (
          <button
            key={mission.title}
            onClick={() => onMissionClick({ lat: mission.lat, lng: mission.lng, name: mission.name })}
            className="flex items-center gap-2 px-4 py-2.5 border border-ink-border bg-paper-card rounded-[2px] text-left hover:border-ink-tertiary hover:bg-paper-elevated transition-all duration-200 group cursor-pointer"
            style={{ fontSize: "0.8rem" }}
          >
            <mission.icon className="w-3.5 h-3.5 text-ink-disabled group-hover:text-surveyor-red transition-colors duration-200" />
            <span
              className="text-ink-secondary group-hover:text-ink-primary transition-colors duration-200"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {mission.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
