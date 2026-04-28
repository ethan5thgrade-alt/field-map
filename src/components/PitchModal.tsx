"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Copy, Check, RotateCw, Phone, Mail, Briefcase, Coffee, Zap } from "lucide-react";
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
];

export default function PitchModal({ business, type, onClose }: PitchModalProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [fullText, setFullText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [tone, setTone] = useState<EmailTone>("professional");
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

  // Initial generation
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

  // Auto-scroll
  useEffect(() => {
    if (textRef.current && isTyping) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [displayedText, isTyping]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(isTyping ? displayedText : fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    startTyping(generate(tone));
  };

  const handleToneChange = (newTone: EmailTone) => {
    setTone(newTone);
    startTyping(generate(newTone));
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
            <button
              onClick={handleRegenerate}
              className="p-2 text-ink-tertiary hover:text-ink-primary transition-colors cursor-pointer"
              title="Regenerate"
            >
              <RotateCw
                className={`w-4 h-4 ${spinning ? "animate-[spin_0.6s_ease-in-out]" : ""}`}
              />
            </button>

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
          <div className="flex items-center gap-1 px-5 py-2.5 border-b border-ink-border bg-paper-mid/50 shrink-0">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-surveyor-red text-paper-card"
                      : "bg-paper-card border border-ink-border text-ink-secondary hover:border-ink-tertiary"
                  }`}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontFeatureSettings: '"smcp","c2sc"',
                    letterSpacing: "0.08em",
                    fontSize: "0.55rem",
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
      </div>
    </div>
  );
}
