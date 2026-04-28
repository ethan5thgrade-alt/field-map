"use client";

import { useEffect, useState } from "react";
import { Star, ExternalLink, Trash2 } from "lucide-react";
import { getStarred, toggleStar } from "@/lib/store";
import type { Business } from "@/lib/mockData";

function YelpIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.271 6.727c-.263.588-3.139 5.887-3.455 6.32-.218.298-.61.37-.908.152-.13-.095-.232-.242-.296-.403L4.63 5.178c-.18-.453-.034-.87.398-1.074C6.35 3.52 9.732 2.84 11.56 2.84c.504 0 .822.236.886.635.033.207-.044 1.852-.175 3.252zm-4.14 9.16c-.045-.562.2-.946.678-1.089l2.898-.86c.357-.107.736.088.867.438.057.152.064.303.015.454l-1.89 5.77c-.131.402-.49.623-.942.519-1.538-.36-3.2-1.2-3.2-1.2-.36-.224-.47-.57-.426-1.032zm14.496-2.53c-.364 1.48-1.084 3.093-1.084 3.093-.185.385-.56.538-.995.375l-2.76-1.04a.66.66 0 01-.403-.87c.06-.155.168-.283.312-.37l5.13-3.065c.41-.245.822-.117.966.36.06.199.037.65-.166 1.517zm-6.37-1.02c.232.28.242.674-.006.953l-2.052 2.31c-.285.32-.7.343-1.003.03-.133-.137-.216-.316-.24-.511l-.407-5.986c-.03-.441.264-.738.71-.687 1.568.18 2.723.62 2.723.62.27.107.16.108.275.271z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function StarredPage() {
  const [starred, setStarred] = useState<Business[]>([]);

  useEffect(() => {
    setStarred(getStarred());
  }, []);

  const handleUnstar = (business: Business) => {
    const result = toggleStar(business);
    setStarred(result.starred);
  };

  const clearAll = () => {
    localStorage.removeItem("fm_starred");
    setStarred([]);
  };

  return (
    <div className="min-h-full bg-paper-deep">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
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
            Starred Businesses
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              color: "var(--ink-tertiary)",
            }}
          >
            Your saved leads — {starred.length} business{starred.length !== 1 ? "es" : ""}.
          </p>
        </div>

        {starred.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-ink-tertiary hover:text-surveyor-red transition-colors cursor-pointer"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.65rem",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.08em",
              }}
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>
        )}

        {starred.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="w-10 h-10 mx-auto text-ink-border mb-4" />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: '"opsz" 48',
                fontStyle: "italic",
                fontSize: "1.2rem",
                color: "var(--ink-tertiary)",
              }}
            >
              No starred businesses yet.
            </p>
            <p
              className="mt-2"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--ink-disabled)",
              }}
            >
              Star businesses from the map results to save them here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {starred.map((biz, i) => (
              <div
                key={biz.id}
                className="flex items-start gap-4 px-5 py-4 bg-paper-card border border-ink-border rounded-[2px] group transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                style={{
                  animation: "card-fade-in 0.3s ease-out both",
                  animationDelay: `${i * 40}ms`,
                }}
              >
                {/* Star */}
                <button
                  onClick={() => handleUnstar(biz)}
                  className="shrink-0 mt-0.5 text-goldenrod hover:text-surveyor-red transition-colors cursor-pointer"
                  title="Remove from starred"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "var(--ink-display)",
                      }}
                    >
                      {biz.name}
                    </span>
                    <span
                      className="px-1.5 py-0.5 bg-paper-mid rounded-[2px]"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontFeatureSettings: '"smcp","c2sc"',
                        letterSpacing: "0.06em",
                        fontSize: "0.55rem",
                        color: "var(--ink-tertiary)",
                      }}
                    >
                      {biz.category}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.7rem",
                        color: "var(--ink-primary)",
                      }}
                    >
                      <span style={{ color: "var(--goldenrod)" }}>&#9733;</span> {biz.rating}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.75rem",
                      color: "var(--ink-secondary)",
                      marginBottom: "6px",
                    }}
                  >
                    {biz.address}
                    {biz.phone && (
                      <span className="text-ink-tertiary"> &middot; {biz.phone}</span>
                    )}
                  </p>

                  {/* Links */}
                  <div className="flex items-center gap-3">
                    <a
                      href={biz.yelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-ink-tertiary hover:text-surveyor-red transition-colors"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.6rem",
                        fontFeatureSettings: '"smcp","c2sc"',
                        letterSpacing: "0.06em",
                      }}
                    >
                      <YelpIcon className="w-3 h-3" /> Yelp
                      <ExternalLink className="w-2 h-2 opacity-50" />
                    </a>
                    {biz.instagramUrl && (
                      <a
                        href={biz.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-ink-tertiary hover:text-surveyor-red transition-colors"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.6rem",
                          fontFeatureSettings: '"smcp","c2sc"',
                          letterSpacing: "0.06em",
                        }}
                      >
                        <InstagramIcon className="w-3 h-3" /> Instagram
                        <ExternalLink className="w-2 h-2 opacity-50" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Website status */}
                <div className="shrink-0 flex items-center gap-1.5" style={{ fontSize: "0.6rem", fontFeatureSettings: '"smcp","c2sc"', letterSpacing: "0.06em", color: "var(--ink-tertiary)" }}>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      biz.websiteStatus === "working"
                        ? "bg-forest-green"
                        : biz.websiteStatus === "broken"
                        ? "bg-goldenrod"
                        : "bg-deep-teal"
                    }`}
                  />
                  {biz.websiteStatus === "working"
                    ? "Website"
                    : biz.websiteStatus === "broken"
                    ? "Broken"
                    : "No site"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
