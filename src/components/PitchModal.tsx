"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  X, Copy, Check, RotateCw, Phone, Mail,
  Briefcase, Coffee, Zap, MessageCircle, Pencil, Send,
} from "lucide-react";
import type { Business } from "@/lib/mockData";
import { generateColdCallScript, generatePitchEmail, type EmailTone } from "@/lib/pitchGenerator";

interface PitchModalProps {
  business: Business;
  type: "cold-call" | "email";
  onClose: () => void;
}

const TONE_OPTIONS: { value: EmailTone; label: string; icon: typeof Briefcase }[] = [
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "casual", label: "Casual", icon: Coffee },
  { value: "direct", label: "Direct", icon: Zap },
  { value: "super_casual", label: "Super Casual", icon: MessageCircle },
  { value: "custom", label: "Write Your Own", icon: Pencil },
];

export default function PitchModal({ business, type, onClose }: PitchModalProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [fullText, setFullText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [tone, setTone] = useState<EmailTone>("professional");
  const [customDraft, setCustomDraft] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const textRef = useRef<HTMLPreElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generate = useCallback(
    (t: EmailTone) => {
      return type === "cold-call"
        ? generateColdCallScript(business)
        : generatePitchEmail(business, t);
    },
    [business, type]
  );

  const startTyping = useCallback((text: string) => {
    setFullText(text);
    setDisplayedText("");
    setIsTyping(true);
    setCopied(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 3;
      if (i >= text.length) {
        setDisplayedText(text);
        setIsTyping(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedText(text.slice(0, i));
      }
    }, 8);
  }, []);

  useEffect(() => {
    startTyping(generate(tone));

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("keydown", handleEsc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (textRef.current && isTyping) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [displayedText, isTyping]);

  const handleCopy = async () => {
    const text = isCustomMode ? customDraft : (isTyping ? displayedText : fullText);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (isCustomMode) return;
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    startTyping(generate(tone));
  };

  const handleToneChange = (newTone: EmailTone) => {
    setTone(newTone);
    if (newTone === "custom") {
      setIsCustomMode(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTyping(false);
      // Pre-fill with business context
      if (!customDraft) {
        setCustomDraft(`Subject: \n\nHi,\n\nI came across ${business.name} and wanted to reach out.\n\n\n\n[YOUR NAME]\n[YOUR PHONE]`);
      }
    } else {
      setIsCustomMode(false);
      startTyping(generate(newTone));
    }
  };

  // Simple auto-fix for the custom draft
  const autoFixDraft = () => {
    let fixed = customDraft;

    // Fix common misspellings
    const fixes: [RegExp, string][] = [
      [/\bteh\b/gi, "the"],
      [/\brecieve\b/gi, "receive"],
      [/\bseperate\b/gi, "separate"],
      [/\boccured\b/gi, "occurred"],
      [/\bdefinately\b/gi, "definitely"],
      [/\baccommodate\b/gi, "accommodate"],
      [/\boccasion\b/gi, "occasion"],
      [/\bneccessary\b/gi, "necessary"],
      [/\bnecessary\b/gi, "necessary"],
      [/\bbuisness\b/gi, "business"],
      [/\bbussiness\b/gi, "business"],
      [/\bprofeshinal\b/gi, "professional"],
      [/\bprofessonal\b/gi, "professional"],
      [/\boppertunity\b/gi, "opportunity"],
      [/\bopportuniy\b/gi, "opportunity"],
      [/\bthier\b/gi, "their"],
      [/\byour welcome\b/gi, "you're welcome"],
      [/\byour ([a-z]+ing)\b/gi, "you're $1"],
      [/\bits a\b/g, "it's a"],
      [/\bdont\b/gi, "don't"],
      [/\bcant\b/gi, "can't"],
      [/\bwont\b/gi, "won't"],
      [/\bwouldnt\b/gi, "wouldn't"],
      [/\bcouldnt\b/gi, "couldn't"],
      [/\bshouldnt\b/gi, "shouldn't"],
      [/\bdoesnt\b/gi, "doesn't"],
      [/\bisnt\b/gi, "isn't"],
      [/\bwasnt\b/gi, "wasn't"],
      [/\bwerent\b/gi, "weren't"],
      [/\bhavent\b/gi, "haven't"],
      [/\bhasnt\b/gi, "hasn't"],
      [/\bim\b/g, "I'm"],
      [/\bi\b/g, "I"],
      [/\balot\b/gi, "a lot"],
      [/\bgonna\b/gi, "going to"],
      [/\bwanna\b/gi, "want to"],
      [/\bcuz\b/gi, "because"],
      [/\bu\b/g, "you"],
      [/\bur\b/gi, "your"],
      [/\bpls\b/gi, "please"],
      [/\bthx\b/gi, "thanks"],
      [/\btho\b/gi, "though"],
      [/\brn\b/g, "right now"],
      [/\bwebiste\b/gi, "website"],
      [/\bwesbite\b/gi, "website"],
    ];

    for (const [pattern, replacement] of fixes) {
      fixed = fixed.replace(pattern, replacement);
    }

    // Capitalize first letter of sentences
    fixed = fixed.replace(/(^|[.!?]\s+)([a-z])/gm, (_, prefix, letter) => prefix + letter.toUpperCase());

    // Fix double spaces
    fixed = fixed.replace(/ {2,}/g, " ");

    // Fix missing period at end of paragraphs
    fixed = fixed.replace(/([a-zA-Z])(\n\n)/g, (_, lastChar, newlines) => {
      if (/[.!?,:]/.test(lastChar)) return lastChar + newlines;
      return lastChar + "." + newlines;
    });

    setCustomDraft(fixed);
  };

  const handleSendToDrafts = async () => {
    const emailText = isCustomMode ? customDraft : fullText;

    // Extract subject line if present
    const subjectMatch = emailText.match(/^Subject:\s*(.+)$/m);
    const subject = subjectMatch ? subjectMatch[1].trim() : `Pitch for ${business.name}`;
    const body = emailText.replace(/^Subject:\s*.+\n\n?/m, "");

    // Store as a "draft" in localStorage for now
    const drafts = JSON.parse(localStorage.getItem("fm_email_drafts") || "[]");
    drafts.unshift({
      id: `draft-${Date.now()}`,
      to: "",
      subject,
      body,
      businessName: business.name,
      date: new Date().toISOString(),
    });
    localStorage.setItem("fm_email_drafts", JSON.stringify(drafts.slice(0, 100)));

    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink-display/30 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-paper-card border border-ink-border rounded-[2px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modal-in 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-ink-border shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-[2px] ${
                type === "cold-call"
                  ? "bg-surveyor-red/10 text-surveyor-red"
                  : "bg-deep-teal/10 text-deep-teal"
              }`}
            >
              {type === "cold-call" ? (
                <Phone className="w-3.5 h-3.5" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--ink-display)",
                }}
              >
                {type === "cold-call" ? "Cold Call Script" : "Pitch Email"}
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  color: "var(--ink-tertiary)",
                }}
              >
                {business.name} &middot; {business.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isCustomMode && (
              <button
                onClick={handleRegenerate}
                className="p-2 text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
                title="Regenerate"
              >
                <RotateCw
                  className={`w-4 h-4 ${spinning ? "animate-[spin_0.6s_ease-in-out]" : ""}`}
                />
              </button>
            )}

            {/* Save to drafts */}
            <button
              onClick={handleSendToDrafts}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] transition-all duration-150 cursor-pointer ${
                draftSaved
                  ? "bg-forest-green text-paper-card"
                  : "bg-paper-mid border border-ink-border text-ink-secondary hover:border-ink-tertiary"
              }`}
              style={{
                fontFamily: "var(--font-sans)",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.08em",
                fontSize: "0.6rem",
              }}
            >
              {draftSaved ? (
                <><Check className="w-3 h-3" /> Saved</>
              ) : (
                <><Send className="w-3 h-3" /> Save Draft</>
              )}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] transition-all duration-150 cursor-pointer ${
                copied
                  ? "bg-forest-green text-paper-card"
                  : "bg-paper-mid border border-ink-border text-ink-secondary hover:border-ink-tertiary"
              }`}
              style={{
                fontFamily: "var(--font-sans)",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.08em",
                fontSize: "0.6rem",
              }}
            >
              {copied ? (
                <><Check className="w-3 h-3" /> Copied</>
              ) : (
                <><Copy className="w-3 h-3" /> Copy</>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tone selector — only for emails */}
        {type === "email" && (
          <div className="flex items-center gap-1 px-5 py-2.5 border-b border-ink-border bg-paper-mid/50 shrink-0 flex-wrap">
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontFeatureSettings: '"smcp","c2sc"',
                letterSpacing: "0.08em",
                fontSize: "0.55rem",
                color: "var(--ink-disabled)",
                marginRight: "4px",
              }}
            >
              Tone:
            </span>
            {TONE_OPTIONS.map((opt) => {
              const isActive = tone === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleToneChange(opt.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-surveyor-red text-paper-card"
                      : "bg-paper-card border border-ink-border text-ink-secondary hover:border-ink-tertiary"
                  }`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontFeatureSettings: '"smcp","c2sc"',
                    letterSpacing: "0.08em",
                    fontSize: "0.5rem",
                  }}
                >
                  <opt.icon className="w-3 h-3" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Body */}
        {isCustomMode ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <textarea
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
              className="flex-1 px-5 py-4 bg-transparent resize-none outline-none"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                lineHeight: 1.7,
                color: "var(--ink-primary)",
              }}
              placeholder={`Write your pitch for ${business.name} here. Don't worry about spelling or grammar, hit the fix button when you're done.`}
            />
            <div className="flex items-center gap-2 px-5 py-3 border-t border-ink-border bg-paper-mid/30">
              <button
                onClick={autoFixDraft}
                className="flex items-center gap-1.5 px-4 py-2 bg-surveyor-red text-paper-card rounded-[2px] hover:bg-surveyor-red-pressed active:translate-y-px transition-all duration-100 cursor-pointer"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontFeatureSettings: '"smcp","c2sc"',
                  letterSpacing: "0.08em",
                  fontSize: "0.65rem",
                }}
              >
                <Check className="w-3 h-3" />
                Fix Spelling and Grammar
              </button>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6rem",
                  color: "var(--ink-disabled)",
                }}
              >
                Auto corrects common mistakes, capitalizes sentences, adds punctuation
              </span>
            </div>
          </div>
        ) : (
          <pre
            ref={textRef}
            className="flex-1 overflow-y-auto px-5 py-4 whitespace-pre-wrap"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              lineHeight: 1.7,
              color: "var(--ink-primary)",
            }}
          >
            {displayedText}
            {isTyping && (
              <span
                className="inline-block w-[2px] h-[14px] bg-surveyor-red ml-[1px] align-middle"
                style={{ animation: "blink 0.8s step-end infinite" }}
              />
            )}
          </pre>
        )}
      </div>
    </div>
  );
}
