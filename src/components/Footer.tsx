"use client";

import { useEffect, useState } from "react";

const tips = [
  "Always lead with a question, not a pitch.",
  "The best cold calls start with genuine curiosity about the business.",
  "Research the business for 60 seconds before dialing — it shows.",
  "Mirror the prospect's energy and pace in the first 10 seconds.",
  "A voicemail is a pitch — write it before you call.",
  "Rejection is data. Track patterns, not feelings.",
  "The gatekeepers are people too. Befriend them.",
  "Tuesday through Thursday, 10am–12pm: prime cold-calling hours.",
  "Follow up within 24 hours. Speed signals seriousness.",
  "Your opening line should never start with your name.",
  "Ask permission to continue: 'Do you have 30 seconds?'",
  "If they say no, say thank you. Leave the door open.",
  "Speak 30% slower than you think you should.",
  "Businesses without websites often don't know what they're missing.",
  "One good pitch is worth more than fifty generic ones.",
  "Local knowledge beats any script. Mention a landmark, event, or neighbor.",
  "The close isn't the end — it's the beginning of the relationship.",
  "Record your calls (legally). You'll be shocked at your own habits.",
  "A 'not right now' is not a 'no'. Schedule the follow-up.",
  "The best reps treat every call like their first of the day.",
];

export default function Footer() {
  const [tipIndex, setTipIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * tips.length));

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
        setFade(true);
      }, 400);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative z-30 flex items-center justify-between px-6 py-2 border-t border-ink-border bg-paper-mid/80 backdrop-blur-sm">
      <p
        className="transition-opacity duration-400"
        style={{
          fontFamily: "var(--font-sans)",
          fontFeatureSettings: '"smcp", "c2sc"',
          letterSpacing: "0.1em",
          fontSize: "0.65rem",
          color: "var(--ink-tertiary)",
          opacity: fade ? 1 : 0,
        }}
      >
        Field Journal — {tips[tipIndex]}
      </p>
      <p
        className="text-ink-disabled"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
        }}
      >
        Sitelab v0.1
      </p>
    </footer>
  );
}
