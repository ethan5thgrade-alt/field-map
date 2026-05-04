import { NextRequest } from "next/server";
import Stripe from "stripe";
import { updateUserByStripeCustomerId, getUserByStripeCustomerId } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "");
}

function getPriceToTier(): Record<string, string> {
  const map: Record<string, string> = {};
  if (process.env.STRIPE_PRICE_PRO) map[process.env.STRIPE_PRICE_PRO] = "pro";
  if (process.env.STRIPE_PRICE_ENTERPRISE) map[process.env.STRIPE_PRICE_ENTERPRISE] = "enterprise";
  return map;
}

function tierFromSubscription(subscription: Stripe.Subscription): string {
  const priceToTier = getPriceToTier();
  for (const item of subscription.items.data) {
    const priceId = item.price.id;
    if (priceToTier[priceId]) return priceToTier[priceId];
  }
  return "free";
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const tier = tierFromSubscription(subscription);
        const customerId = session.customer as string;

        // The clerkId is stored in metadata during checkout
        const clerkId = session.metadata?.clerkId;
        if (clerkId) {
          const { updateUserTier } = await import("@/lib/db/queries");
          await updateUserTier(clerkId, tier, customerId, subscription.id);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const tier = subscription.status === "active"
        ? tierFromSubscription(subscription)
        : "free";
      await updateUserByStripeCustomerId(customerId, tier, subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      await updateUserByStripeCustomerId(customerId, "free");
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      // Optionally downgrade on payment failure
      console.warn("Payment failed for customer:", customerId);
      break;
    }
  }

  return Response.json({ received: true });
}
