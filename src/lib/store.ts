import { Business } from "./mockData";

// ── Usage Tier Limits ──
export interface TierLimits {
  searches: number;
  pitches: number;
  starred: number;
}

export const TIERS: Record<string, { name: string; limits: TierLimits; price: number }> = {
  free: {
    name: "Scout",
    limits: { searches: 10, pitches: 5, starred: 15 },
    price: 0,
  },
  pro: {
    name: "Surveyor",
    limits: { searches: 100, pitches: 50, starred: 200 },
    price: 29,
  },
  enterprise: {
    name: "Expedition",
    limits: { searches: -1, pitches: -1, starred: -1 }, // -1 = unlimited
    price: 79,
  },
};

// ── Usage Tracking ──
export interface Usage {
  searches: number;
  pitches: number;
  starred: number;
  tier: string;
  periodStart: string; // ISO date of current billing period start
}

function getDefaultUsage(): Usage {
  return {
    searches: 0,
    pitches: 0,
    starred: 0,
    tier: "free",
    periodStart: new Date().toISOString().slice(0, 10),
  };
}

export function getUsage(): Usage {
  if (typeof window === "undefined") return getDefaultUsage();
  const raw = localStorage.getItem("fm_usage");
  if (!raw) return getDefaultUsage();
  try {
    const usage = JSON.parse(raw) as Usage;
    // Reset counts if new month
    const now = new Date().toISOString().slice(0, 7); // YYYY-MM
    const period = usage.periodStart?.slice(0, 7);
    if (now !== period) {
      return { ...getDefaultUsage(), tier: usage.tier };
    }
    return usage;
  } catch {
    return getDefaultUsage();
  }
}

export function saveUsage(usage: Usage) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fm_usage", JSON.stringify(usage));
}

export function incrementUsage(field: "searches" | "pitches" | "starred"): Usage {
  const usage = getUsage();
  usage[field]++;
  saveUsage(usage);
  return usage;
}

export function decrementUsage(field: "searches" | "pitches" | "starred"): Usage {
  const usage = getUsage();
  usage[field] = Math.max(0, usage[field] - 1);
  saveUsage(usage);
  return usage;
}

export function isOverLimit(field: "searches" | "pitches" | "starred"): boolean {
  const usage = getUsage();
  const tier = TIERS[usage.tier] || TIERS.free;
  if (tier.limits[field] === -1) return false; // unlimited
  return usage[field] >= tier.limits[field];
}

export function setTier(tier: string): Usage {
  const usage = getUsage();
  usage.tier = tier;
  saveUsage(usage);
  return usage;
}

// ── Starred Businesses ──
export function getStarred(): Business[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("fm_starred");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Business[];
  } catch {
    return [];
  }
}

export function saveStarred(businesses: Business[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("fm_starred", JSON.stringify(businesses));
}

export function toggleStar(business: Business): { starred: Business[]; added: boolean } {
  const current = getStarred();
  const exists = current.findIndex((b) => b.id === business.id);
  if (exists >= 0) {
    current.splice(exists, 1);
    saveStarred(current);
    decrementUsage("starred");
    return { starred: current, added: false };
  } else {
    current.push(business);
    saveStarred(current);
    incrementUsage("starred");
    return { starred: current, added: true };
  }
}

export function isStarred(businessId: string): boolean {
  return getStarred().some((b) => b.id === businessId);
}

// ── Sent Pitches ──
export interface SentPitch {
  id: string;
  businessName: string;
  businessCategory: string;
  type: "cold-call" | "email";
  date: string; // ISO
  preview: string; // first ~100 chars of the pitch
}

export function getSentPitches(): SentPitch[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("fm_pitches");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SentPitch[];
  } catch {
    return [];
  }
}

export function savePitch(pitch: SentPitch) {
  const pitches = getSentPitches();
  pitches.unshift(pitch); // newest first
  if (typeof window !== "undefined") {
    localStorage.setItem("fm_pitches", JSON.stringify(pitches.slice(0, 500)));
  }
  incrementUsage("pitches");
}
