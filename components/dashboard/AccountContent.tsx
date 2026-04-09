"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CreditCard,
  Loader2,
  Zap,
  Building2,
  Sparkles,
} from "lucide-react";
import { createCheckoutSession, createPortalSession } from "@/app/(dashboard)/account/actions";
import type { Subscription } from "@/lib/supabase/database.types";

const PLANS = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    description: "Get started with testimonials",
    icon: Sparkles,
    features: [
      "1 project",
      "15 testimonials",
      "3 widget styles",
      "Glowboard branding",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "$19",
    description: "For growing businesses",
    icon: Zap,
    popular: true,
    features: [
      "Unlimited projects",
      "Unlimited testimonials",
      "All widget styles",
      "No branding",
      "Video testimonials",
      "Custom colors",
    ],
  },
  {
    id: "business" as const,
    name: "Business",
    price: "$49",
    description: "For teams and agencies",
    icon: Building2,
    features: [
      "Everything in Pro",
      "API access",
      "Priority support",
      "Custom domain for forms",
    ],
  },
];

export function AccountContent({
  subscription,
}: {
  subscription: Subscription;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(plan: "pro" | "business") {
    setLoading(plan);
    const result = await createCheckoutSession(plan);
    if (result.url) {
      window.location.assign(result.url);
      return;
    }
    setLoading(null);
  }

  async function handleManageBilling() {
    setLoading("portal");
    const result = await createPortalSession();
    if (result.url) {
      window.location.assign(result.url);
      return;
    }
    setLoading(null);
  }

  const currentPlan = subscription.plan;
  const isPaid = currentPlan === "pro" || currentPlan === "business";

  return (
    <div className="space-y-8">
      {/* Current plan card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Current Plan</h2>
              <Badge
                variant={isPaid ? "default" : "secondary"}
                className="uppercase"
              >
                {currentPlan}
              </Badge>
              {subscription.status === "past_due" && (
                <Badge variant="destructive">Past Due</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPaid && subscription.current_period_end
                ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                : "Free forever — no credit card required"}
            </p>
          </div>
          {isPaid && (
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleManageBilling}
              disabled={loading === "portal"}
            >
              {loading === "portal" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage Billing
            </Button>
          )}
        </div>
      </div>

      {/* Plans grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {isPaid ? "All Plans" : "Upgrade Your Plan"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const isDowngrade =
              (currentPlan === "business" && plan.id !== "business") ||
              (currentPlan === "pro" && plan.id === "free");

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border p-6 transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : plan.popular
                      ? "border-primary/40"
                      : "border-border"
                }`}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isCurrent ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <plan.icon
                      className={`h-5 w-5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.id !== "free" && (
                    <span className="text-sm text-muted-foreground">/month</span>
                  )}
                </div>

                <ul className="mb-6 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button
                    variant="outline"
                    className="w-full cursor-default"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={handleManageBilling}
                    disabled={loading === "portal"}
                  >
                    Downgrade
                  </Button>
                ) : plan.id !== "free" ? (
                  <Button
                    className="w-full cursor-pointer"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id as "pro" | "business")}
                    disabled={loading === plan.id}
                  >
                    {loading === plan.id && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Upgrade to {plan.name}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
