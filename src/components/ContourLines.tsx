"use client";

import { useMemo } from "react";

/**
 * Generates organic contour line paths using a simplified Perlin-like flow field.
 * Full-viewport SVG layer that slowly animates via stroke-dashoffset.
 */
export default function ContourLines() {
  const paths = useMemo(() => generateContourPaths(12), []);

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="rgba(176, 158, 120, 0.18)"
          strokeWidth={1.2}
          className="contour-line"
          style={{
            animationDelay: `${i * -5}s`,
            animationDuration: `${55 + i * 5}s`,
          }}
        />
      ))}
    </svg>
  );
}

/** Attempt a flow-field-style approach for organic contour lines */
function generateContourPaths(count: number): string[] {
  const paths: string[] = [];
  const seed = 42;

  for (let i = 0; i < count; i++) {
    const points: [number, number][] = [];
    const yBase = 60 + (i * 780) / count;
    const steps = 60;

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = t * 1440;
      // Layered sine waves for organic curvature
      const y =
        yBase +
        Math.sin(t * Math.PI * 2 + seed + i * 0.7) * (40 + i * 8) +
        Math.sin(t * Math.PI * 4.3 + i * 1.3) * (20 + i * 3) +
        Math.cos(t * Math.PI * 1.7 + i * 2.1) * 15;
      points.push([x, y]);
    }

    // Build smooth cubic bezier path through points
    let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
    for (let j = 1; j < points.length - 2; j++) {
      const xc = (points[j][0] + points[j + 1][0]) / 2;
      const yc = (points[j][1] + points[j + 1][1]) / 2;
      d += ` Q ${points[j][0].toFixed(1)} ${points[j][1].toFixed(1)} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
    }
    // Final segment
    const last = points[points.length - 1];
    d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;

    paths.push(d);
  }

  return paths;
}
