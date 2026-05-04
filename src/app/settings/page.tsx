"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [sellerName, setSellerName] = useState("");
  const [sellerCompany, setSellerCompany] = useState("");
  const [sellerSelling, setSellerSelling] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [serverKeys, setServerKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load profile from server
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setSellerName(data.sellerName || "");
        setSellerCompany(data.sellerCompany || "");
        setSellerSelling(data.sellerSelling || "");
      })
      .catch(() => {});

    fetch("/api/keys-status")
      .then((r) => r.json())
      .then((data) => setServerKeys(data))
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    // Save to server
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerName, sellerCompany, sellerSelling }),
    });
    // Also save to localStorage for immediate use in PitchModal
    localStorage.setItem("fm_seller_name", sellerName);
    localStorage.setItem("fm_seller_company", sellerCompany);
    localStorage.setItem("fm_seller_selling", sellerSelling);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="min-h-full bg-paper-deep">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: '"opsz" 72',
              fontSize: "2rem",
              color: "var(--ink-display)",
              marginBottom: "4px",
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--ink-tertiary)",
            }}
          >
            Your profile and service status.
          </p>
        </div>

        {/* Service Status */}
        <div className="mb-8">
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-sans)",
              fontFeatureSettings: '"smcp","c2sc"',
              letterSpacing: "0.12em",
              fontSize: "0.7rem",
              color: "var(--ink-secondary)",
            }}
          >
            Services
          </h2>
          <div className="space-y-3">
            {[
              { key: "mapbox", label: "Map (Mapbox)", desc: "Interactive map for finding businesses" },
              { key: "google", label: "Business Search (Google Places)", desc: "Real business data from Google" },
              { key: "anthropic", label: "AI Pitches (Claude)", desc: "AI-generated cold call scripts and emails" },
              { key: "stripe", label: "Payments (Stripe)", desc: "Subscription billing" },
            ].map((service) => (
              <div key={service.key} className="px-6 py-4 bg-paper-card border border-ink-border rounded-[2px]">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`w-4 h-4 ${serverKeys[service.key] ? "text-forest-green" : "text-ink-disabled"}`} />
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--ink-display)",
                    }}
                  >
                    {service.label}
                  </h3>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-[2px] ${
                      serverKeys[service.key]
                        ? "bg-forest-green/10 text-forest-green"
                        : "bg-paper-mid text-ink-disabled"
                    }`}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontFeatureSettings: '"smcp","c2sc"',
                      letterSpacing: "0.06em",
                      fontSize: "0.5rem",
                    }}
                  >
                    {serverKeys[service.key] ? "Active" : "Not configured"}
                  </span>
                </div>
                <p
                  className="mt-1 pl-6"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.7rem",
                    color: "var(--ink-tertiary)",
                  }}
                >
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Seller Profile */}
        <div>
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-sans)",
              fontFeatureSettings: '"smcp","c2sc"',
              letterSpacing: "0.12em",
              fontSize: "0.7rem",
              color: "var(--ink-secondary)",
            }}
          >
            Your Profile
          </h2>
          <div className="px-6 py-5 bg-paper-card border border-ink-border rounded-[2px] space-y-4">
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontFeatureSettings: '"smcp","c2sc"',
                  letterSpacing: "0.08em",
                  fontSize: "0.6rem",
                  color: "var(--ink-tertiary)",
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-3 py-2 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary placeholder:text-ink-disabled outline-none focus:border-brass transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}
              />
            </div>
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontFeatureSettings: '"smcp","c2sc"',
                  letterSpacing: "0.08em",
                  fontSize: "0.6rem",
                  color: "var(--ink-tertiary)",
                }}
              >
                Company Name
              </label>
              <input
                type="text"
                value={sellerCompany}
                onChange={(e) => setSellerCompany(e.target.value)}
                placeholder="Acme Web Services"
                className="w-full px-3 py-2 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary placeholder:text-ink-disabled outline-none focus:border-brass transition-colors"
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem" }}
              />
            </div>
            <div>
              <label
                className="block mb-1.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontFeatureSettings: '"smcp","c2sc"',
                  letterSpacing: "0.08em",
                  fontSize: "0.6rem",
                  color: "var(--ink-tertiary)",
                }}
              >
                What You&apos;re Selling
              </label>
              <textarea
                value={sellerSelling}
                onChange={(e) => setSellerSelling(e.target.value)}
                placeholder="Website design and development for local businesses. We build modern, mobile-friendly sites that help businesses get found online and convert visitors into customers."
                rows={3}
                className="w-full px-3 py-2 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary placeholder:text-ink-disabled outline-none focus:border-brass transition-colors resize-none"
                style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", lineHeight: 1.5 }}
              />
            </div>
            <button
              onClick={saveProfile}
              className={`px-4 py-2 rounded-[2px] transition-all duration-150 cursor-pointer ${
                profileSaved
                  ? "bg-forest-green text-paper-card"
                  : "bg-surveyor-red text-paper-card hover:bg-surveyor-red-pressed"
              }`}
              style={{
                fontFamily: "var(--font-sans)",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.08em",
                fontSize: "0.65rem",
              }}
            >
              {profileSaved ? "Saved" : "Save Profile"}
            </button>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                color: "var(--ink-disabled)",
              }}
            >
              This info replaces [YOUR NAME] and [YOUR COMPANY] in generated pitches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
