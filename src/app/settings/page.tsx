"use client";

import { useEffect, useState } from "react";
import { Key, Check, Eye, EyeOff, AlertCircle } from "lucide-react";

interface ApiKeyConfig {
  key: string;
  label: string;
  storageKey: string;
  placeholder: string;
  helpText: string;
  linkText: string;
  linkUrl: string;
}

const API_KEYS: ApiKeyConfig[] = [
  {
    key: "mapbox",
    label: "Mapbox",
    storageKey: "fm_mapbox_key",
    placeholder: "pk.eyJ1Ijoi...",
    helpText: "Powers the interactive map. Free tier includes 50,000 map loads per month.",
    linkText: "Get a token at mapbox.com",
    linkUrl: "https://account.mapbox.com/access-tokens/",
  },
  {
    key: "google",
    label: "Google Places",
    storageKey: "fm_google_places_key",
    placeholder: "AIzaSy...",
    helpText: "Finds real businesses near your pin. Enable \"Places API (New)\" in Google Cloud Console. $200/mo free credit included.",
    linkText: "Get a key at console.cloud.google.com",
    linkUrl: "https://console.cloud.google.com/apis/credentials",
  },
  {
    key: "anthropic",
    label: "Claude API (Anthropic)",
    storageKey: "fm_anthropic_key",
    placeholder: "sk-ant-...",
    helpText: "Powers AI-generated pitches tailored to each business. Uses Claude to write truly personalized cold call scripts and emails.",
    linkText: "Get a key at console.anthropic.com",
    linkUrl: "https://console.anthropic.com/settings/keys",
  },
];

function ApiKeyInput({ config }: { config: ApiKeyConfig }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(config.storageKey) || "";
    setValue(stored);
    setHasKey(!!stored);
  }, [config.storageKey]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(config.storageKey, trimmed);
    } else {
      localStorage.removeItem(config.storageKey);
    }
    setHasKey(!!trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem(config.storageKey);
    setValue("");
    setHasKey(false);
  };

  return (
    <div className="px-6 py-5 bg-paper-card border border-ink-border rounded-[2px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-brass" />
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--ink-display)",
            }}
          >
            {config.label}
          </h3>
          {hasKey && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 bg-forest-green/10 text-forest-green rounded-[2px]"
              style={{
                fontFamily: "var(--font-sans)",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.06em",
                fontSize: "0.5rem",
              }}
            >
              <Check className="w-2.5 h-2.5" />
              Connected
            </span>
          )}
        </div>
      </div>

      <p
        className="mb-3"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          color: "var(--ink-secondary)",
          lineHeight: 1.5,
        }}
      >
        {config.helpText}
      </p>

      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={config.placeholder}
            className="w-full px-3 py-2.5 bg-paper-mid border border-ink-border rounded-[2px] text-ink-primary placeholder:text-ink-disabled outline-none focus:border-brass transition-colors duration-150 pr-10"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
            }}
          />
          <button
            onClick={() => setVisible(!visible)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-disabled hover:text-ink-secondary transition-colors cursor-pointer"
          >
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2.5 rounded-[2px] transition-all duration-150 cursor-pointer ${
            saved
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
          {saved ? "Saved" : "Save"}
        </button>
        {hasKey && (
          <button
            onClick={handleClear}
            className="px-3 py-2.5 border border-ink-border text-ink-tertiary rounded-[2px] hover:border-surveyor-red hover:text-surveyor-red transition-all duration-150 cursor-pointer"
            style={{
              fontFamily: "var(--font-sans)",
              fontFeatureSettings: '"smcp","c2sc"',
              letterSpacing: "0.08em",
              fontSize: "0.65rem",
            }}
          >
            Clear
          </button>
        )}
      </div>

      <a
        href={config.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-ink-tertiary hover:text-surveyor-red transition-colors"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
        }}
      >
        {config.linkText} →
      </a>
    </div>
  );
}

export default function SettingsPage() {
  const [sellerName, setSellerName] = useState("");
  const [sellerCompany, setSellerCompany] = useState("");
  const [sellerSelling, setSellerSelling] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setSellerName(localStorage.getItem("fm_seller_name") || "");
    setSellerCompany(localStorage.getItem("fm_seller_company") || "");
    setSellerSelling(localStorage.getItem("fm_seller_selling") || "");
  }, []);

  const saveProfile = () => {
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
            API keys and profile. Everything is stored locally in your browser.
          </p>
        </div>

        {/* API Keys */}
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
            API Keys
          </h2>
          <div className="space-y-3">
            {API_KEYS.map((config) => (
              <ApiKeyInput key={config.key} config={config} />
            ))}
          </div>

          <div className="flex items-start gap-2 mt-4 px-4 py-3 bg-paper-mid border border-ink-border rounded-[2px]">
            <AlertCircle className="w-4 h-4 text-brass shrink-0 mt-0.5" />
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                color: "var(--ink-tertiary)",
                lineHeight: 1.5,
              }}
            >
              Keys are stored in your browser&apos;s localStorage and sent directly to each provider. They never touch our servers.
              The Google Places key is also passed to the server side API route for business searches.
            </p>
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
