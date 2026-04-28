import type { Business } from "./mockData";

function noWebsiteHook(name: string): string {
  return `I was looking up ${name} online and noticed you don't have a website yet. In 2026, that's actually a huge opportunity — most of your competitors do, which means customers searching for what you offer are landing on their sites instead of finding you.`;
}

function brokenWebsiteHook(name: string): string {
  return `I tried visiting ${name}'s website and ran into some issues — it looks like the site might be down or not loading properly. That means anyone Googling you right now is hitting a dead end, and probably clicking on a competitor instead.`;
}

function hasWebsiteHook(name: string): string {
  return `I was checking out ${name}'s online presence and I think there's a real opportunity to take things to the next level. You've got a website, which is great — but there are some quick wins that could help you show up higher in local searches and convert more visitors into customers.`;
}

function getHook(biz: Business): string {
  if (biz.websiteStatus === "none") return noWebsiteHook(biz.name);
  if (biz.websiteStatus === "broken") return brokenWebsiteHook(biz.name);
  return hasWebsiteHook(biz.name);
}

export function generateColdCallScript(biz: Business): string {
  const hook = getHook(biz);
  const rating = biz.rating >= 4.0
    ? `You've got a ${biz.rating}-star rating with ${biz.reviewCount} reviews — that's solid social proof that should be working harder for you online.`
    : `You've got ${biz.reviewCount} reviews on Google, which shows people are finding you. The question is — how many more could you reach?`;

  return `COLD CALL SCRIPT — ${biz.name.toUpperCase()}
${"═".repeat(40)}

[OPENING]
"Hi, is this the owner or manager of ${biz.name}?"

[PAUSE — wait for confirmation]

"Great — my name is [YOUR NAME] with [YOUR COMPANY]. I'm not trying to sell you anything right now, I just had a quick observation about your business that I wanted to share. Do you have 30 seconds?"

[PAUSE — if yes, continue]

[THE HOOK]
"${hook}"

[VALUE]
"${rating}"

"What I do is help local ${biz.category} businesses like yours get found online and turn that visibility into real foot traffic and phone calls. I'm talking about a professional web presence that actually drives revenue — not just a digital business card."

[THE ASK]
"I'd love to put together a quick mockup of what this could look like for ${biz.name} — totally free, no obligation. If you like it, we can talk next steps. If not, no hard feelings. Would that be worth 5 minutes of your time?"

[IF YES]
"Perfect. What's the best email to send that to? And what days work best if we wanted to do a quick 10-minute walkthrough?"

[IF NO / NOT NOW]
"Totally understand. Mind if I shoot you a quick email with some info? That way you have it whenever the timing feels right."

${"─".repeat(40)}
NOTES:
• Address: ${biz.address}
• Phone: ${biz.phone || "N/A"}
• Category: ${biz.category}
• Rating: ${biz.rating} (${biz.reviewCount} reviews)
• Website: ${biz.websiteStatus === "none" ? "None" : biz.websiteStatus === "broken" ? "Broken" : biz.websiteUrl}
`;
}

export type EmailTone = "professional" | "casual" | "direct";

const DETAILS_BLOCK = (biz: Business) => `${"─".repeat(40)}
BUSINESS DETAILS:
• ${biz.name} — ${biz.category}
• ${biz.address}
• ${biz.phone || "No phone listed"}
• Website: ${biz.websiteStatus === "none" ? "None" : biz.websiteStatus === "broken" ? "Broken" : biz.websiteUrl}
• Rating: ${biz.rating} (${biz.reviewCount} reviews)`;

function professionalEmail(biz: Business): string {
  const subject = biz.websiteStatus === "none"
    ? `Opportunity: Establishing ${biz.name}'s Digital Presence`
    : biz.websiteStatus === "broken"
    ? `${biz.name} — Website Issue & Quick Fix`
    : `Growth Opportunity for ${biz.name}`;

  const hook = getHook(biz);

  const cta = biz.websiteStatus === "none"
    ? `I would be happy to prepare a complimentary mockup of a professional website tailored to ${biz.name}. There is no cost or obligation — simply a visual to illustrate what is possible.`
    : biz.websiteStatus === "broken"
    ? `I would like to offer a complimentary audit of your current site and provide a detailed report on the issues and recommended fixes.`
    : `I have prepared several specific recommendations for ${biz.name} that I believe could meaningfully improve your online performance. I would welcome the opportunity to walk you through them.`;

  return `PITCH EMAIL — ${biz.name.toUpperCase()} (Professional)
${"═".repeat(40)}

Subject: ${subject}

Dear ${biz.name} Team,

I hope this message finds you well. My name is [YOUR NAME] with [YOUR COMPANY], and I am reaching out because I recently came across ${biz.name} while researching ${biz.category} businesses in your area.

${hook}

${biz.rating >= 4.0
  ? `With a ${biz.rating}-star rating and ${biz.reviewCount} reviews, your reputation speaks for itself. The goal would be to ensure your digital presence reflects the quality of service your customers already experience.`
  : `With ${biz.reviewCount} reviews on Google, you have clearly built a loyal customer base. A stronger online presence would help you reach the many potential customers actively searching for ${biz.category} services in your area.`}

${cta}

Would you have availability for a brief 10-minute call this week? I am happy to work around your schedule.

I look forward to hearing from you.

Warm regards,
[YOUR NAME]
[YOUR TITLE]
[YOUR COMPANY]
[YOUR PHONE]
[YOUR EMAIL]

${DETAILS_BLOCK(biz)}`;
}

function casualEmail(biz: Business): string {
  const subject = biz.websiteStatus === "none"
    ? `Quick thought about ${biz.name}`
    : biz.websiteStatus === "broken"
    ? `Heads up about ${biz.name}'s website`
    : `Idea for ${biz.name} — 2 min read`;

  return `PITCH EMAIL — ${biz.name.toUpperCase()} (Casual)
${"═".repeat(40)}

Subject: ${subject}

Hey there!

So I was poking around online looking for ${biz.category} businesses in your area, and ${biz.name} caught my eye.

${biz.websiteStatus === "none"
  ? `I noticed you don't have a website yet — and honestly, that's not a bad thing. It means there's a huge untapped opportunity sitting right there. People are searching for exactly what you offer, and right now they're landing on your competitors instead.`
  : biz.websiteStatus === "broken"
  ? `I tried checking out your website and it looks like something's up with it — wasn't loading for me. Just wanted to give you a heads up because that means anyone Googling you is hitting a dead end right now.`
  : `You've already got a website up, which is awesome. But I think there are some easy wins that could help you show up more in local searches and turn more clicks into actual customers.`}

${biz.rating >= 4.0
  ? `BTW — ${biz.rating} stars with ${biz.reviewCount} reviews? People clearly love what you do. That kind of social proof is gold and should be front and center online.`
  : `You've got ${biz.reviewCount} reviews, which means people are finding you. Imagine what happens when even more people can.`}

${biz.websiteStatus === "none"
  ? `I'd love to throw together a free mockup of what a site could look like for you — zero cost, zero strings. Just something visual so you can see the potential.`
  : biz.websiteStatus === "broken"
  ? `Want me to take a quick look and send over what I find? Totally free — just want to help.`
  : `I've got a few ideas that I think you'd dig. Want me to send them over?`}

Either way, no pressure at all. Just thought it was worth reaching out.

Cheers,
[YOUR NAME]
[YOUR COMPANY]
[YOUR PHONE]

${DETAILS_BLOCK(biz)}`;
}

function directEmail(biz: Business): string {
  const subject = biz.websiteStatus === "none"
    ? `${biz.name} is invisible online. Let's fix that.`
    : biz.websiteStatus === "broken"
    ? `${biz.name}'s website is broken — losing you customers`
    : `${biz.name}: 3 things costing you customers online`;

  return `PITCH EMAIL — ${biz.name.toUpperCase()} (Direct)
${"═".repeat(40)}

Subject: ${subject}

${biz.websiteStatus === "none"
  ? `${biz.name} has no website. Every day that stays true, you're handing customers to competitors who do.`
  : biz.websiteStatus === "broken"
  ? `I tried to visit ${biz.name}'s website today. It's broken. Every person who Googles you right now hits a dead page and clicks somewhere else.`
  : `${biz.name} has a website, but it's not working hard enough. You're showing up behind competitors who are doing less but ranking higher.`}

${biz.rating >= 4.0
  ? `You have ${biz.reviewCount} reviews and a ${biz.rating}-star rating. That's a business people love — but they can't love what they can't find.`
  : `${biz.reviewCount} people left you reviews on Google. How many more would if they could actually find you?`}

Here's what I do: I build online presences for ${biz.category} businesses that drive real revenue. Not vanity metrics. Revenue.

${biz.websiteStatus === "none"
  ? `I'll build you a free mockup. If you like it, we talk. If not, you lose nothing.`
  : biz.websiteStatus === "broken"
  ? `I'll audit your site for free and tell you exactly what's wrong and what it's costing you.`
  : `I have 3 specific changes that would improve your online performance. 10 minutes of your time to hear them.`}

Yes or no — are you open to a 10-minute call this week?

[YOUR NAME]
[YOUR COMPANY]
[YOUR PHONE]

${DETAILS_BLOCK(biz)}`;
}

export function generatePitchEmail(biz: Business, tone: EmailTone = "professional"): string {
  switch (tone) {
    case "casual": return casualEmail(biz);
    case "direct": return directEmail(biz);
    default: return professionalEmail(biz);
  }
}
