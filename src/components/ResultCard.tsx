"use client";

import { useState, useEffect } from "react";
import { Phone as PhoneIcon, Mail, ExternalLink, Star } from "lucide-react";
import type { Business } from "@/lib/mockData";
import { isStarred as checkStarred, toggleStar, savePitch, isOverLimit } from "@/lib/store";
import PitchModal from "./PitchModal";

interface ResultCardProps {
  business: Business;
  index: number;
}

function StatusDot({ status }: { status: Business["websiteStatus"] }) {
  const colors = {
    working: "bg-forest-green",
    broken: "bg-goldenrod",
    none: "bg-deep-teal",
  };
  const labels = {
    working: "Website",
    broken: "Broken site",
    none: "No website",
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
      <span>{labels[status]}</span>
    </span>
  );
}

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

export default function ResultCard({ business, index }: ResultCardProps) {
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    setStarred(checkStarred(business.id));
  }, [business.id]);

  const handleStar = () => {
    if (!starred && isOverLimit("starred")) {
      alert("You've reached your starred businesses limit. Upgrade your plan for more.");
      return;
    }
    const result = toggleStar(business);
    setStarred(result.added);
  };

  const [modalType, setModalType] = useState<"cold-call" | "email" | null>(null);

  const handlePitch = (type: "cold-call" | "email") => {
    if (isOverLimit("pitches")) {
      alert("You've reached your pitch generation limit. Upgrade your plan for more.");
      return;
    }
    savePitch({
      id: `pitch-${Date.now()}`,
      businessName: business.name,
      businessCategory: business.category,
      type,
      date: new Date().toISOString(),
      preview:
        type === "cold-call"
          ? `Hi, I noticed ${business.name} doesn't have a strong online presence yet...`
          : `Subject: Grow ${business.name}'s online presence — quick idea...`,
    });
    setModalType(type);
  };

  return (
    <>
    {modalType && (
      <PitchModal
        business={business}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    )}
    <div
      className="group relative border border-ink-border bg-paper-card rounded-[4px] px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(31,36,33,0.12)] cursor-default"
      style={{
        animation: "card-fade-in 0.35s ease-out both",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Dog-ear on hover */}
      <div className="absolute top-0 right-0 w-0 h-0 border-l-[12px] border-l-transparent border-t-[12px] border-t-ink-border opacity-0 group-hover:opacity-40 transition-opacity duration-200 rounded-tr-[4px]" />

      {/* Name + star + rating */}
      <div className="flex items-start gap-2 mb-1.5">
        <button
          onClick={handleStar}
          className={`shrink-0 mt-0.5 transition-colors duration-150 cursor-pointer ${
            starred
              ? "text-goldenrod"
              : "text-ink-border hover:text-goldenrod"
          }`}
          title={starred ? "Remove from starred" : "Star this business"}
        >
          <Star className={`w-4 h-4 ${starred ? "fill-current" : ""}`} />
        </button>
        <h3
          className="flex-1"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: 1.3,
            color: "var(--ink-display)",
          }}
        >
          {business.name}
        </h3>
        <span
          className="shrink-0"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--ink-primary)",
          }}
        >
          <span style={{ color: "var(--goldenrod)" }}>&#9733;</span>{" "}
          {business.rating}{" "}
          <span className="text-ink-tertiary">({business.reviewCount})</span>
        </span>
      </div>

      {/* Address */}
      <p
        className="mb-2 pl-6"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          color: "var(--ink-secondary)",
        }}
      >
        {business.address}
      </p>

      {/* Status badges */}
      <div
        className="flex flex-wrap gap-x-3 gap-y-1 mb-2.5 pl-6"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.65rem",
          color: "var(--ink-tertiary)",
          fontFeatureSettings: '"smcp", "c2sc"',
          letterSpacing: "0.06em",
        }}
      >
        <StatusDot status={business.websiteStatus} />
        {business.phone ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-green" />
            <span>Phone</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-disabled" />
            <span>No phone</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brass" />
          <span>{business.category}</span>
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0",
            fontFeatureSettings: "normal",
            color: "var(--ink-disabled)",
          }}
        >
          {business.distanceMiles} mi
        </span>
      </div>

      {/* External links */}
      <div className="flex items-center gap-3 mb-2.5 pl-6">
        <a
          href={business.yelpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-ink-tertiary hover:text-surveyor-red transition-colors duration-150"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            fontFeatureSettings: '"smcp", "c2sc"',
            letterSpacing: "0.06em",
          }}
        >
          <YelpIcon className="w-3.5 h-3.5" />
          Yelp
          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
        </a>
        {business.instagramUrl ? (
          <a
            href={business.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-ink-tertiary hover:text-surveyor-red transition-colors duration-150"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontFeatureSettings: '"smcp", "c2sc"',
              letterSpacing: "0.06em",
            }}
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            Instagram
            <ExternalLink className="w-2.5 h-2.5 opacity-50" />
          </a>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 text-ink-disabled"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.65rem",
              fontFeatureSettings: '"smcp", "c2sc"',
              letterSpacing: "0.06em",
            }}
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            No Instagram
          </span>
        )}
      </div>

      {/* Dashed divider */}
      <div className="border-t border-dashed border-ink-border mb-2.5" />

      {/* Action buttons — fade in on hover */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => handlePitch("cold-call")}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-surveyor-red text-paper-card rounded-[2px] hover:bg-surveyor-red-pressed active:translate-y-px transition-all duration-100 cursor-pointer"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            fontFeatureSettings: '"smcp", "c2sc"',
            letterSpacing: "0.08em",
          }}
        >
          <PhoneIcon className="w-3 h-3" />
          Cold Call Script
        </button>
        <button
          onClick={() => handlePitch("email")}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-ink-primary text-ink-primary rounded-[2px] hover:bg-ink-primary hover:text-paper-card active:translate-y-px transition-all duration-100 cursor-pointer"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.65rem",
            fontFeatureSettings: '"smcp", "c2sc"',
            letterSpacing: "0.08em",
          }}
        >
          <Mail className="w-3 h-3" />
          Pitch Email
        </button>
      </div>
    </div>
    </>
  );
}
