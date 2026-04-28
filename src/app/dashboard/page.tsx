"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, Trash2 } from "lucide-react";
import { getSentPitches, type SentPitch } from "@/lib/store";

export default function DashboardPage() {
  const [pitches, setPitches] = useState<SentPitch[]>([]);
  const [filter, setFilter] = useState<"all" | "cold-call" | "email">("all");

  useEffect(() => {
    setPitches(getSentPitches());
  }, []);

  const filtered =
    filter === "all" ? pitches : pitches.filter((p) => p.type === filter);

  const clearAll = () => {
    localStorage.removeItem("fm_pitches");
    setPitches([]);
  };

  return (
    <div className="min-h-full bg-paper-deep">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: '"opsz" 72',
              fontSize: "2rem",
              color: "var(--ink-display)",
              marginBottom: "4px",
            }}
          >
            Outreach Dashboard
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--ink-tertiary)",
            }}
          >
            All pitches and cold call scripts you&apos;ve generated.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Pitches",
              value: pitches.length,
              color: "var(--ink-display)",
            },
            {
              label: "Cold Calls",
              value: pitches.filter((p) => p.type === "cold-call").length,
              color: "var(--red)",
            },
            {
              label: "Emails",
              value: pitches.filter((p) => p.type === "email").length,
              color: "var(--teal)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="px-5 py-4 bg-paper-card border border-ink-border rounded-[2px]"
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontFeatureSettings: '"smcp","c2sc"',
                  letterSpacing: "0.1em",
                  fontSize: "0.6rem",
                  color: "var(--ink-tertiary)",
                  marginBottom: "4px",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.5rem",
                  color: stat.color,
                  fontWeight: 600,
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs + clear */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {(["all", "cold-call", "email"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-[2px] transition-all duration-150 cursor-pointer ${
                  filter === f
                    ? "bg-surveyor-red text-paper-card"
                    : "bg-paper-card border border-ink-border text-ink-secondary hover:border-ink-tertiary"
                }`}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontFeatureSettings: '"smcp","c2sc"',
                  letterSpacing: "0.08em",
                  fontSize: "0.65rem",
                }}
              >
                {f === "all" ? "All" : f === "cold-call" ? "Cold Calls" : "Emails"}
              </button>
            ))}
          </div>
          {pitches.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-ink-tertiary hover:text-surveyor-red transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.08em",
              }}
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Pitch list */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: '"opsz" 48',
                fontStyle: "italic",
                fontSize: "1.2rem",
                color: "var(--ink-tertiary)",
              }}
            >
              {pitches.length === 0
                ? "No pitches generated yet."
                : "No pitches match this filter."}
            </p>
            <p
              className="mt-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--ink-disabled)",
              }}
            >
              Generate pitches from the map by clicking a business card.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((pitch, i) => (
              <div
                key={pitch.id}
                className="flex items-start gap-4 px-5 py-4 bg-paper-card border border-ink-border rounded-[2px] transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                style={{
                  animation: "card-fade-in 0.3s ease-out both",
                  animationDelay: `${i * 40}ms`,
                }}
              >
                {/* Icon */}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-[2px] shrink-0 ${
                    pitch.type === "cold-call"
                      ? "bg-surveyor-red/10 text-surveyor-red"
                      : "bg-deep-teal/10 text-deep-teal"
                  }`}
                >
                  {pitch.type === "cold-call" ? (
                    <Phone className="w-3.5 h-3.5" />
                  ) : (
                    <Mail className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--ink-display)",
                      }}
                    >
                      {pitch.businessName}
                    </span>
                    <span
                      className="px-1.5 py-0.5 bg-paper-mid rounded-[2px]"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontFeatureSettings: '"smcp","c2sc"',
                        letterSpacing: "0.06em",
                        fontSize: "0.55rem",
                        color: "var(--ink-tertiary)",
                      }}
                    >
                      {pitch.businessCategory}
                    </span>
                  </div>
                  <p
                    className="truncate"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      color: "var(--ink-secondary)",
                    }}
                  >
                    {pitch.preview}
                  </p>
                </div>

                {/* Date */}
                <span
                  className="shrink-0"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--ink-disabled)",
                  }}
                >
                  {new Date(pitch.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
