"use client";

import { useEffect, useState } from "react";
import { Check, MapPin } from "lucide-react";
import { TIERS, getUsage, setTier as setStoreTier } from "@/lib/store";

const FEATURES: Record<string, string[]> = {
  free: [
    "10 searches per month",
    "5 pitch generations",
    "15 starred businesses",
    "Basic map search",
    "Yelp & Instagram links",
  ],
  pro: [
    "100 searches per month",
    "50 pitch generations",
    "200 starred businesses",
    "Everything in Scout",
    "Priority geocoding",
    "Export starred as CSV",
  ],
  enterprise: [
    "Unlimited searches",
    "Unlimited pitch generations",
    "Unlimited starred businesses",
    "Everything in Surveyor",
    "API access",
    "Custom pitch templates",
    "Team sharing",
  ],
};

export default function PricingPage() {
  const [currentTier, setCurrentTier] = useState("free");

  useEffect(() => {
    setCurrentTier(getUsage().tier);
  }, []);

  const handleSelect = (tier: string) => {
    setStoreTier(tier);
    setCurrentTier(tier);
  };

  return (
    <div className="min-h-full bg-paper-deep">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: '"opsz" 144',
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--ink-display)",
              marginBottom: "8px",
            }}
          >
            Choose Your Expedition
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.9rem",
              color: "var(--ink-tertiary)",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            Scale your cold outreach with the right tools for your territory.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {Object.entries(TIERS).map(([key, tier]) => {
            const isActive = currentTier === key;
            const isPro = key === "pro";

            return (
              <div
                key={key}
                className={`relative flex flex-col px-6 py-8 rounded-[2px] border transition-all duration-200 ${
                  isPro
                    ? "border-surveyor-red bg-paper-card shadow-lg scale-[1.02]"
                    : "border-ink-border bg-paper-card hover:border-ink-tertiary"
                }`}
              >
                {isPro && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-surveyor-red text-paper-card rounded-[2px]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontFeatureSettings: '"smcp","c2sc"',
                      letterSpacing: "0.1em",
                      fontSize: "0.55rem",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Tier name */}
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontFeatureSettings: '"smcp","c2sc"',
                    letterSpacing: "0.12em",
                    fontSize: "0.65rem",
                    color: "var(--ink-tertiary)",
                    marginBottom: "4px",
                  }}
                >
                  {tier.name}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: '"opsz" 72',
                      fontSize: "2.5rem",
                      color: "var(--ink-display)",
                    }}
                  >
                    {tier.price === 0 ? "Free" : `$${tier.price}`}
                  </span>
                  {tier.price > 0 && (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
                        color: "var(--ink-tertiary)",
                      }}
                    >
                      /month
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2.5 mb-8">
                  {FEATURES[key].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2"
                    >
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          isPro ? "text-surveyor-red" : "text-forest-green"
                        }`}
                        strokeWidth={2.5}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8rem",
                          color: "var(--ink-secondary)",
                        }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSelect(key)}
                  disabled={isActive}
                  className={`w-full py-2.5 rounded-[2px] transition-all duration-150 cursor-pointer disabled:cursor-default ${
                    isActive
                      ? "bg-paper-mid border border-ink-border text-ink-tertiary"
                      : isPro
                      ? "bg-surveyor-red text-paper-card hover:bg-surveyor-red-pressed active:translate-y-px"
                      : "border border-ink-primary text-ink-primary hover:bg-ink-primary hover:text-paper-card active:translate-y-px"
                  }`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontFeatureSettings: '"smcp","c2sc"',
                    letterSpacing: "0.1em",
                    fontSize: "0.7rem",
                  }}
                >
                  {isActive ? "Current Plan" : tier.price === 0 ? "Get Started" : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p
          className="text-center mt-8"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            color: "var(--ink-disabled)",
          }}
        >
          Plans are stored locally for demo purposes. No real charges.
        </p>
      </div>
    </div>
  );
}
