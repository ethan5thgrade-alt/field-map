import { NextRequest } from "next/server";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return Response.json({ error: "Please sign in to upgrade." }, { status: 401 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return Response.json(
        { error: "Stripe not configured. Add STRIPE_SECRET_KEY to .env.local" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);

    const priceIds: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_PRO || "",
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
    };

    const priceId = priceIds[plan];
    if (!priceId) {
      return Response.json(
        { error: `No Stripe price configured for plan: ${plan}` },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3001";

    // Check if user already has a Stripe customer ID
    const user = await getUserByClerkId(clerkId);
    const customerOptions: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true&plan=${plan}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: { clerkId },
    };

    if (user?.stripeCustomerId) {
      customerOptions.customer = user.stripeCustomerId;
    } else if (user?.email) {
      customerOptions.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(customerOptions);

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
