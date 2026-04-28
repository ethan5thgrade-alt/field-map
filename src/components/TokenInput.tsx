"use client";

import { useState } from "react";
import { Key, ArrowRight } from "lucide-react";

interface TokenInputProps {
  onTokenSet: (token: string) => void;
}

export default function TokenInput({ onTokenSet }: TokenInputProps) {
  const [token, setToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    localStorage.setItem("fm_mapbox_key", trimmed);
    onTokenSet(trimmed);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-full max-w-md">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-6 border border-ink-border rounded-[2px] bg-paper-card">
          <Key className="w-5 h-5 text-ink-tertiary" />
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: '"opsz" 48',
            fontSize: "1.5rem",
            color: "var(--ink-display)",
            marginBottom: "8px",
          }}
        >
          Enter your Mapbox token
        </h2>
        <p
          className="mb-6"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            color: "var(--ink-tertiary)",
            lineHeight: 1.5,
          }}
        >
          Paste your public token from{" "}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              color: "var(--ink-secondary)",
            }}
          >
            mapbox.com/account/access-tokens
          </span>
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="pk.eyJ1Ijoi..."
            className="flex-1 px-3 py-2.5 bg-paper-card border border-ink-border rounded-[2px] text-ink-primary placeholder:text-ink-disabled outline-none focus:border-brass transition-colors duration-150"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!token.trim()}
            className="flex items-center justify-center w-10 bg-surveyor-red text-paper-card rounded-[2px] hover:bg-surveyor-red-pressed disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-100 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p
          className="mt-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--ink-disabled)",
          }}
        >
          Stored locally in your browser. Never sent to our servers.
        </p>
      </div>
    </div>
  );
}
