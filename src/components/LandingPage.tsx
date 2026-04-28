"use client";

import { useState } from "react";
import { MapPin, Search, Phone, Mail, Star, Zap, ArrowRight, Check } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const FEATURES = [
  {
    icon: MapPin,
    title: "Drop a Pin, Find Leads",
    desc: "Click anywhere on the map and instantly discover businesses in that area that need your services.",
  },
  {
    icon: Search,
    title: "No Website = Hot Lead",
    desc: "Automatically filters for businesses with no website or a broken one. These are the easiest sells.",
  },
  {
    icon: Zap,
    title: "AI-Powered Pitches",
    desc: "Generate personalized cold call scripts and pitch emails in seconds. 5 tones from professional to super casual.",
  },
  {
    icon: Phone,
    title: "Everything You Need",
    desc: "Yelp links, Instagram pages, phone numbers, ratings, reviews. All the intel for your call in one place.",
  },
  {
    icon: Star,
    title: "Save Your Best Leads",
    desc: "Star businesses to build your prospect list. Track every pitch you send in the dashboard.",
  },
  {
    icon: Mail,
    title: "Write Your Own or Let AI Do It",
    desc: "Use our templates, let Claude write it, or type your own and we'll fix the spelling. Your choice.",
  },
];

const STEPS = [
  "Drop a pin on the map or search a city",
  "Browse businesses without websites",
  "Click to generate a personalized pitch",
  "Copy, save as draft, or call them directly",
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-full bg-paper-deep overflow-y-auto">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-surveyor-red rounded-[2px]">
            <MapPin className="w-5 h-5 text-paper-card" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: '"opsz" 72',
              fontSize: "1.5rem",
              color: "var(--ink-display)",
            }}
          >
            Sitelab
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: '"opsz" 144',
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            lineHeight: 1.1,
            color: "var(--ink-display)",
            marginBottom: "16px",
          }}
        >
          Find businesses that need you.
          <br />
          Pitch them in seconds.
        </h1>

        <p
          className="max-w-lg mx-auto mb-8"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: "var(--ink-secondary)",
          }}
        >
          The cold outreach tool for sales reps. Drop a pin on a map, discover
          local businesses without websites, and generate personalized pitch
          emails and cold call scripts with AI.
        </p>

        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-surveyor-red text-paper-card rounded-[2px] hover:bg-surveyor-red-pressed active:translate-y-px transition-all duration-150 cursor-pointer shadow-lg"
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: '"smcp","c2sc"',
            letterSpacing: "0.1em",
            fontSize: "0.8rem",
          }}
        >
          Get Started Free
          <ArrowRight className="w-4 h-4" />
        </button>

        <p
          className="mt-3"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            color: "var(--ink-disabled)",
          }}
        >
          Free tier includes 10 searches and 5 AI pitches per month
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2
          className="text-center mb-8"
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: '"smcp","c2sc"',
            letterSpacing: "0.12em",
            fontSize: "0.7rem",
            color: "var(--ink-tertiary)",
          }}
        >
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
              <div
                className="flex items-center justify-center w-8 h-8 shrink-0 bg-paper-card border border-ink-border rounded-full"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--red)",
                }}
              >
                {i + 1}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--ink-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2
          className="text-center mb-8"
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: '"smcp","c2sc"',
            letterSpacing: "0.12em",
            fontSize: "0.7rem",
            color: "var(--ink-tertiary)",
          }}
        >
          Everything You Need to Close
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="px-5 py-5 bg-paper-card border border-ink-border rounded-[2px] hover:-translate-y-px hover:shadow-sm transition-all duration-200"
            >
              <f.icon className="w-5 h-5 text-surveyor-red mb-3" />
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--ink-display)",
                  marginBottom: "6px",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.8rem",
                  color: "var(--ink-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: '"opsz" 72',
            fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
            color: "var(--ink-display)",
            marginBottom: "12px",
          }}
        >
          Stop cold calling blind.
        </h2>
        <p
          className="mb-8"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            color: "var(--ink-secondary)",
          }}
        >
          Know exactly who needs your services before you pick up the phone.
        </p>
        <button
          onClick={onGetStarted}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-surveyor-red text-paper-card rounded-[2px] hover:bg-surveyor-red-pressed active:translate-y-px transition-all duration-150 cursor-pointer shadow-lg"
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: '"smcp","c2sc"',
            letterSpacing: "0.1em",
            fontSize: "0.8rem",
          }}
        >
          Start Finding Leads
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-border py-6 text-center">
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--ink-disabled)" }}>
          Sitelab &middot; Built for sales reps who hustle
        </p>
      </footer>
    </div>
  );
}
