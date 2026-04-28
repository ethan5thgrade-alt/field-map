"use client";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const TICKS = [1, 5, 10, 15, 20, 25];

export default function RadiusSlider({
  value,
  onChange,
  disabled = false,
}: RadiusSliderProps) {
  return (
    <div className={`${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <label
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: '"smcp", "c2sc"',
            letterSpacing: "0.12em",
            fontSize: "0.65rem",
            color: "var(--ink-secondary)",
          }}
        >
          Search Radius
        </label>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--ink-primary)",
          }}
        >
          {value} mi
        </span>
      </div>

      {/* Custom slider */}
      <div className="relative py-2">
        <input
          type="range"
          min={1}
          max={25}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="radius-slider w-full"
        />

        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-[2px]">
          {TICKS.map((tick) => (
            <div key={tick} className="flex flex-col items-center">
              <div
                className="w-px h-2"
                style={{
                  backgroundColor:
                    tick <= value ? "var(--red)" : "var(--ink-border)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.55rem",
                  color:
                    tick <= value
                      ? "var(--ink-secondary)"
                      : "var(--ink-disabled)",
                  marginTop: "2px",
                }}
              >
                {tick}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
