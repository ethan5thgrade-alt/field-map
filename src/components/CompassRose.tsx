"use client";

/**
 * Layer 4 — Large faint compass rose anchored bottom-right.
 * Rotates one full turn per 5 minutes.
 */
export default function CompassRose({ className = "" }: { className?: string }) {
  return (
    <div
      className={`fixed bottom-[-80px] right-[-80px] w-[400px] h-[400px] pointer-events-none ${className}`}
      style={{ zIndex: 1, opacity: 0.04 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full compass-rose"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        color="var(--ink-primary)"
      >
        {/* Outer circle */}
        <circle cx="100" cy="100" r="90" />
        <circle cx="100" cy="100" r="80" strokeDasharray="4 4" />

        {/* Cardinal points — N, S, E, W */}
        <line x1="100" y1="10" x2="100" y2="30" strokeWidth="2" />
        <line x1="100" y1="170" x2="100" y2="190" strokeWidth="2" />
        <line x1="10" y1="100" x2="30" y2="100" strokeWidth="2" />
        <line x1="170" y1="100" x2="190" y2="100" strokeWidth="2" />

        {/* North point (diamond) */}
        <polygon points="100,15 106,50 100,45 94,50" fill="currentColor" />
        {/* South point */}
        <polygon points="100,185 106,150 100,155 94,150" opacity="0.4" fill="currentColor" />
        {/* East point */}
        <polygon points="185,100 150,94 155,100 150,106" opacity="0.4" fill="currentColor" />
        {/* West point */}
        <polygon points="15,100 50,94 45,100 50,106" opacity="0.4" fill="currentColor" />

        {/* Intercardinal lines */}
        <line x1="30" y1="30" x2="50" y2="50" strokeWidth="0.8" />
        <line x1="170" y1="30" x2="150" y2="50" strokeWidth="0.8" />
        <line x1="30" y1="170" x2="50" y2="150" strokeWidth="0.8" />
        <line x1="170" y1="170" x2="150" y2="150" strokeWidth="0.8" />

        {/* Inner star */}
        <polygon
          points="100,40 108,80 140,60 120,92 160,100 120,108 140,140 108,120 100,160 92,120 60,140 80,108 40,100 80,92 60,60 92,80"
          strokeWidth="0.6"
          opacity="0.6"
        />

        {/* Center dot */}
        <circle cx="100" cy="100" r="3" fill="currentColor" />

        {/* Degree marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const r1 = i % 9 === 0 ? 75 : 82;
          const r2 = 88;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.sin(angle)}
              y1={100 - r1 * Math.cos(angle)}
              x2={100 + r2 * Math.sin(angle)}
              y2={100 - r2 * Math.cos(angle)}
              strokeWidth={i % 9 === 0 ? 1.2 : 0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}
