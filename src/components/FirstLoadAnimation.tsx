"use client";

import { useEffect, useState, useRef } from "react";

interface FirstLoadAnimationProps {
  onComplete: () => void;
}

export default function FirstLoadAnimation({
  onComplete,
}: FirstLoadAnimationProps) {
  const [phase, setPhase] = useState<"drawing" | "title" | "fading" | "done">(
    "drawing"
  );
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Phase 1: compass draws (2s)
    // Phase 2: title fades in (0.8s)
    // Phase 3: whole thing fades out (0.6s)
    const t1 = setTimeout(() => setPhase("title"), 2000);
    const t2 = setTimeout(() => setPhase("fading"), 3200);
    const t3 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper-deep transition-opacity duration-600"
      style={{ opacity: phase === "fading" ? 0 : 1 }}
    >
      {/* Compass rose drawing */}
      <svg
        viewBox="0 0 200 200"
        className="w-48 h-48"
        fill="none"
        stroke="var(--ink-display)"
        strokeWidth="1.2"
      >
        {/* Outer ring */}
        <circle
          cx="100"
          cy="100"
          r="85"
          strokeDasharray="535"
          strokeDashoffset={phase === "drawing" ? "535" : "0"}
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />

        {/* Inner ring */}
        <circle
          cx="100"
          cy="100"
          r="70"
          strokeDasharray="440"
          strokeDashoffset={phase === "drawing" ? "440" : "0"}
          style={{
            transition: "stroke-dashoffset 1.5s ease-out",
            transitionDelay: "0.2s",
          }}
          strokeWidth="0.6"
        />

        {/* Star / compass points */}
        <polygon
          points="100,20 108,75 145,40 125,88 180,100 125,112 145,160 108,125 100,180 92,125 55,160 75,112 20,100 75,88 55,40 92,75"
          strokeDasharray="1200"
          strokeDashoffset={phase === "drawing" ? "1200" : "0"}
          style={{
            transition: "stroke-dashoffset 1.8s ease-out",
            transitionDelay: "0.3s",
          }}
        />

        {/* North diamond (filled) */}
        <polygon
          points="100,20 107,55 100,48 93,55"
          fill="var(--red)"
          stroke="var(--red)"
          strokeWidth="0.5"
          opacity={phase === "drawing" ? 0 : 1}
          style={{ transition: "opacity 0.5s ease-out", transitionDelay: "1.2s" }}
        />

        {/* Center */}
        <circle
          cx="100"
          cy="100"
          r="4"
          fill="var(--ink-display)"
          opacity={phase === "drawing" ? 0 : 1}
          style={{ transition: "opacity 0.4s ease-out", transitionDelay: "1s" }}
        />

        {/* Cardinal labels */}
        {[
          { letter: "N", x: 100, y: 12 },
          { letter: "S", x: 100, y: 196 },
          { letter: "E", x: 194, y: 104 },
          { letter: "W", x: 8, y: 104 },
        ].map(({ letter, x, y }) => (
          <text
            key={letter}
            x={x}
            y={y}
            textAnchor="middle"
            fill="var(--ink-secondary)"
            fontSize="8"
            fontFamily="var(--font-sans)"
            style={{
              fontFeatureSettings: '"smcp"',
              letterSpacing: "0.1em",
              opacity: phase === "drawing" ? 0 : 1,
              transition: "opacity 0.5s ease-out",
              transitionDelay: "1.4s",
            }}
          >
            {letter}
          </text>
        ))}
      </svg>

      {/* App name */}
      <h1
        className="mt-8 text-display-lg"
        style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: '"opsz" 144',
          opacity: phase === "drawing" ? 0 : 1,
          transform:
            phase === "drawing" ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          transitionDelay: "0.2s",
        }}
      >
        Field Map
      </h1>
      <p
        className="mt-2"
        style={{
          fontFamily: "var(--font-sans)",
          fontFeatureSettings: '"smcp", "c2sc"',
          letterSpacing: "0.15em",
          fontSize: "0.7rem",
          color: "var(--ink-tertiary)",
          opacity: phase === "drawing" ? 0 : 1,
          transition: "opacity 0.8s ease-out",
          transitionDelay: "0.5s",
        }}
      >
        Cold Outreach Discovery
      </p>
    </div>
  );
}
