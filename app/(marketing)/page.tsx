import Link from "next/link";
import { Check, MessageSquareText, Share2, Code2, Star } from "lucide-react";

const TESTIMONIALS_DEMO = [
  {
    name: "Sarah Chen",
    role: "Head of Marketing, Acme Inc",
    text: "Glowboard transformed how we showcase customer love. Setup took 5 minutes and the widget looks stunning on our site.",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Founder, Daybreak Studio",
    text: "The embed widget is incredibly polished. Our conversion rate went up 23% after adding testimonials to the landing page.",
    rating: 5,
  },
  {
    name: "Emily Park",
    role: "Product Lead, Nebula AI",
    text: "Finally a testimonial tool that doesn't look generic. The customization options are exactly what we needed.",
    rating: 5,
  },
];

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Collect",
    description:
      "Share a branded form link with your customers. They submit reviews in seconds — no account required.",
  },
  {
    icon: Share2,
    title: "Curate",
    description:
      "Approve, reject, or organize testimonials from your dashboard. Full control over what gets published.",
  },
  {
    icon: Code2,
    title: "Embed",
    description:
      "Copy one line of code. Your testimonials appear on any website as a beautiful, responsive widget.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect to get started",
    features: [
      "1 project",
      "15 testimonials",
      "3 widget styles",
      "Glowboard branding",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For growing businesses",
    features: [
      "Unlimited projects",
      "Unlimited testimonials",
      "All widget styles",
      "No branding",
      "Video testimonials",
      "Custom colors",
    ],
    cta: "Get Pro",
    popular: true,
  },
  {
    name: "Business",
    price: "$49",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "API access",
      "Priority support",
      "Custom domain for forms",
    ],
    cta: "Get Business",
    popular: false,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center lg:pt-32">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Star className="h-3.5 w-3.5 fill-primary" />
            Social proof that converts
          </div>

          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Turn happy customers into your{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              best marketing
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Collect testimonials with a simple form, manage them in a clean dashboard,
            and embed beautiful widgets on any website. Set up in minutes.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl hover:shadow-primary/30"
            >
              Start Free — No Credit Card
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
            >
              See How It Works
            </a>
          </div>

          {/* Widget preview */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xl shadow-primary/5">
              <div className="grid gap-4 md:grid-cols-3">
                {TESTIMONIALS_DEMO.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl border border-border/50 bg-background p-5 text-left"
                  >
                    <StarRating count={t.rating} />
                    <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="features" className="border-t border-border bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to social proof
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              No complex setup. No developer needed. Go from zero to embedded
              testimonials in under 5 minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <step.icon className="mt-2 h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.name !== "Free" && (
                    <span className="text-sm text-muted-foreground">/month</span>
                  )}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-8 block w-full cursor-pointer rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border bg-background hover:bg-accent"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/20 py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to showcase your best reviews?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join businesses that use Glowboard to turn customer love into conversions.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </>
  );
}
