"use client";

import { useEffect, useRef } from "react";

/**
 * Layer 2 — Cursor-reactive lantern glow.
 * Radial gradient follows cursor with eased delay.
 */
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const position = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      // Ease toward target
      position.current.x += (target.current.x - position.current.x) * 0.08;
      position.current.y += (target.current.y - position.current.y) * 0.08;

      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(circle 400px at ${position.current.x}px ${position.current.y}px, rgba(194, 65, 12, 0.06), transparent)`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    />
  );
}
