import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.customer) break;

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      // Look up the plan from the subscription
      let plan: "pro" | "business" = "pro";
      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price.id;
        if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) {
          plan = "business";
        }
      }

      await supabase
        .from("subscriptions")
        .update({
          stripe_subscription_id: subscriptionId ?? null,
          plan,
          status: "active",
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      const priceId = sub.items.data[0]?.price.id;
      let plan: "free" | "pro" | "business" = "pro";
      if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) {
        plan = "business";
      }

      const status = sub.status === "past_due" ? "past_due" as const : "active" as const;
      const periodEnd = sub.items.data[0]?.current_period_end;

      await supabase
        .from("subscriptions")
        .update({
          plan,
          status,
          ...(periodEnd
            ? { current_period_end: new Date(periodEnd * 1000).toISOString() }
            : {}),
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      await supabase
        .from("subscriptions")
        .update({ plan: "free", status: "active", stripe_subscription_id: null })
        .eq("stripe_customer_id", customerId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;

      if (customerId) {
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
