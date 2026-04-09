export function getPriceId(plan: "pro" | "business"): string {
  if (plan === "pro") return process.env.STRIPE_PRO_PRICE_ID!;
  return process.env.STRIPE_BUSINESS_PRICE_ID!;
}
