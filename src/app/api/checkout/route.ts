import { NextRequest } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return Response.json(
        { error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);

    // Map plan names to Stripe price IDs (set these in your Stripe dashboard)
    const priceIds: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "",
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return Response.json(
        { error: `No Stripe price configured for plan: ${plan}. Set STRIPE_PRICE_PRO and STRIPE_PRICE_ENTERPRISE in .env.local` },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3001";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true&plan=${plan}`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
