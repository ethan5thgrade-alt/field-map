"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MapPin, LayoutDashboard, Star, CreditCard, Gauge, Settings } from "lucide-react";
import { getUsage, TIERS } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/", label: "Map", icon: MapPin },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/starred", label: "Starred", icon: Star },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function NavBar() {
  const pathname = usePathname();
  const [usage, setUsage] = useState({ searches: 0, pitches: 0, starred: 0, tier: "free" });

  useEffect(() => {
    const u = getUsage();
    setUsage(u);

    // Re-check on focus (in case user was on another tab)
    const handleFocus = () => setUsage(getUsage());
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [pathname]); // re-read when navigating

  const tier = TIERS[usage.tier] || TIERS.free;

  return (
    <nav className="relative z-30 flex items-center justify-between px-4 py-2 border-b border-ink-border bg-paper-mid/90 backdrop-blur-sm">
      {/* Left: logo + nav links */}
      <div className="flex items-center gap-1">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1.5 mr-3"
        >
          <div className="flex items-center justify-center w-6 h-6 bg-surveyor-red rounded-[2px]">
            <MapPin className="w-3 h-3 text-paper-card" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: '"opsz" 48',
              fontSize: "0.95rem",
              color: "var(--ink-display)",
            }}
          >
            Sitelab
          </span>
        </Link>

        {/* Nav links */}
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] transition-all duration-150 ${
                isActive
                  ? "bg-paper-card border border-ink-border text-ink-display"
                  : "text-ink-tertiary hover:text-ink-primary hover:bg-paper-card/50"
              }`}
              style={{
                fontFamily: "var(--font-sans)",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.08em",
                fontSize: "0.6rem",
              }}
            >
              <item.icon className="w-3 h-3" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Right: usage meter */}
      <div className="flex items-center gap-4">
        {/* Compact usage display */}
        <div className="flex items-center gap-3">
          <UsagePill
            label="Searches"
            used={usage.searches}
            limit={tier.limits.searches}
          />
          <UsagePill
            label="Pitches"
            used={usage.pitches}
            limit={tier.limits.pitches}
          />
          <UsagePill
            label="Starred"
            used={usage.starred}
            limit={tier.limits.starred}
          />
        </div>

        {/* Tier badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 border border-ink-border rounded-[2px] bg-paper-card"
          style={{
            fontFamily: "var(--font-sans)",
            fontFeatureSettings: '"smcp","c2sc"',
            letterSpacing: "0.08em",
            fontSize: "0.55rem",
            color: "var(--ink-secondary)",
          }}
        >
          <Gauge className="w-3 h-3 text-brass" />
          {tier.name}
        </div>
      </div>
    </nav>
  );
}

function UsagePill({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNear = pct >= 80;
  const isOver = pct >= 100;

  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontFeatureSettings: '"smcp","c2sc"',
          letterSpacing: "0.06em",
          fontSize: "0.5rem",
          color: "var(--ink-disabled)",
        }}
      >
        {label}
      </span>
      <div className="relative w-12 h-1.5 bg-paper-deep rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
            isOver
              ? "bg-surveyor-red"
              : isNear
              ? "bg-goldenrod"
              : "bg-forest-green"
          }`}
          style={{ width: isUnlimited ? "0%" : `${pct}%` }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.5rem",
          color: isOver
            ? "var(--red)"
            : isNear
            ? "var(--goldenrod)"
            : "var(--ink-tertiary)",
        }}
      >
        {used}/{isUnlimited ? "\u221E" : limit}
      </span>
    </div>
  );
}
