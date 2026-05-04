import { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getOptionalUser, isOverLimit } from "@/lib/auth";
import { getOrCreateUsage, incrementUsageField } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 20;
const RATE_WINDOW = 60_000;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`pitch:${ip}`, RATE_LIMIT, RATE_WINDOW);
  if (!ok) {
    return Response.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // Server-side usage enforcement
  const user = await getOptionalUser();
  if (user) {
    const currentUsage = await getOrCreateUsage(user.id);
    if (isOverLimit(currentUsage, user.tier, "pitches")) {
      return Response.json(
        { error: "Pitch limit reached. Upgrade your plan for more." },
        { status: 403 }
      );
    }
    await incrementUsageField(user.id, "pitches");
  }

  try {
    const body = await request.json();
    const {
      businessName,
      businessCategory,
      businessAddress,
      businessPhone,
      businessRating,
      businessReviewCount,
      businessWebsiteStatus,
      businessWebsiteUrl,
      pitchType,
      tone,
      sellerName,
      sellerCompany,
      sellerSelling,
    } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "AI pitch generation is not available." },
        { status: 400 }
      );
    }

    const sellerContext = sellerName
      ? `The seller's name is ${sellerName}${sellerCompany ? ` from ${sellerCompany}` : ""}. ${sellerSelling ? `They sell: ${sellerSelling}` : ""}`
      : "The seller hasn't provided their name yet, so use [YOUR NAME] and [YOUR COMPANY] as placeholders.";

    const websiteContext =
      businessWebsiteStatus === "none"
        ? "This business has NO website at all. This is the #1 pitch hook. They are invisible online."
        : businessWebsiteStatus === "broken"
        ? `This business has a website (${businessWebsiteUrl}) but it is broken, down, or a parked domain. Pitch around fixing this.`
        : `This business has a working website at ${businessWebsiteUrl}. Pitch around improving it, better SEO, more conversions.`;

    const toneInstructions: Record<string, string> = {
      professional:
        "Write in a professional, polished tone. Formal but warm. Use complete sentences, proper grammar. Sign off with 'Warm regards'.",
      casual:
        "Write in a casual, friendly tone. Like a neighbor reaching out. Contractions, conversational flow. Sign off with 'Cheers'.",
      direct:
        "Write in a direct, no-nonsense tone. Short sentences. Get to the point fast. No fluff. Bold claims backed by their data. End with a yes/no question.",
      super_casual:
        "Write in a super casual, almost text-message-like tone. Friendly, relaxed, like you're talking to a friend. Use phrases like 'just thought I'd reach out', 'no worries either way'. Keep it real and human. Sign off casually.",
    };

    const systemPrompt = `You are an expert cold outreach copywriter. You write ${pitchType === "cold-call" ? "cold call scripts" : "pitch emails"} for sales reps who help local businesses improve their online presence.

Your writing sounds like a real human, not a template. No dashes, no bullet points, no rigid formatting. Just natural, flowing text that someone would actually say or write.

${toneInstructions[tone] || toneInstructions.professional}

${sellerContext}`;

    const userPrompt = pitchType === "cold-call"
      ? `Write a cold call script for calling ${businessName}, a ${businessCategory} business at ${businessAddress}.

${websiteContext}

Their Google rating is ${businessRating} stars with ${businessReviewCount} reviews.
${businessPhone ? `Their phone number is ${businessPhone}.` : "No phone number on file."}

Structure the script as a natural conversation flow:
1. Opening (ask for owner/manager)
2. Permission to talk for 30 seconds
3. The hook (based on their website status)
4. Value statement referencing their rating/reviews
5. The ask (free mockup/audit, no obligation)
6. Handle "yes" response
7. Handle "no/not now" response

End with their business details for reference.

Write it as natural dialogue with brief stage directions, not a rigid template. Make it sound like something a real person would say out loud.`
      : `Write a pitch email to ${businessName}, a ${businessCategory} business at ${businessAddress}.

${websiteContext}

Their Google rating is ${businessRating} stars with ${businessReviewCount} reviews.
${businessPhone ? `Their phone number is ${businessPhone}.` : "No phone number on file."}

Start with "Subject: " on the first line, then a blank line, then the email body.

The email should:
1. Open with a personalized hook based on their specific situation
2. Reference their actual rating and review count as social proof
3. Explain what you can do for them specifically
4. End with a clear, low-pressure call to action
5. Include the seller's sign-off

Keep it concise. No more than 200 words for the body. Make every sentence count. No filler, no generic lines. This should feel like it was written just for them.`;

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, err);
      return Response.json(
        { error: `Claude API error: ${anthropicRes.status}` },
        { status: anthropicRes.status }
      );
    }

    const result = await anthropicRes.json();
    const text = result.content?.[0]?.text || "Failed to generate pitch.";

    return Response.json({ pitch: text });
  } catch (err) {
    console.error("Pitch generation error:", err);
    return Response.json({ error: "Failed to generate pitch" }, { status: 500 });
  }
}
