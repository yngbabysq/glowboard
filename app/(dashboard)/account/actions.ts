"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/stripe";
import { getPriceId } from "@/lib/stripe/helpers";

export async function createCheckoutSession(plan: "pro" | "business") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;

    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    success_url: `${appUrl}/dashboard/account?success=true`,
    cancel_url: `${appUrl}/dashboard/account?canceled=true`,
  });

  return { url: session.url };
}

export async function createPortalSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!subscription?.stripe_customer_id) {
    return { error: "No billing account found" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${appUrl}/dashboard/account`,
  });

  return { url: session.url };
}
