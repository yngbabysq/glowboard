# Glowboard — Deployment Guide

## Prerequisites

- Node.js >= 18.18
- pnpm >= 9
- Accounts: Vercel, Supabase, Stripe, Google Cloud (for OAuth)

---

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Apply migrations in order:
   ```bash
   # From the Supabase SQL editor, run each file in supabase/migrations/ in order:
   # 001_profiles.sql → 002_projects.sql → 003_testimonials.sql →
   # 004_subscriptions.sql → 005_triggers.sql
   ```
3. Copy from Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — service_role key (keep secret!)

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers → Google:
   - Enable Google provider
   - Paste Client ID and Client Secret

## 3. Stripe Setup

1. Create products and prices in [Stripe Dashboard](https://dashboard.stripe.com):
   - **Pro** plan: $19/month recurring
   - **Business** plan: $49/month recurring
2. Copy the Price IDs → `STRIPE_PRO_PRICE_ID`, `STRIPE_BUSINESS_PRICE_ID`
3. Copy Secret Key → `STRIPE_SECRET_KEY`
4. Copy Publishable Key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Set up Webhook:
   - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Events to listen: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`
6. Set up Customer Portal in Stripe Dashboard → Settings → Billing → Customer portal

## 4. Vercel Deployment

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Framework: Next.js (auto-detected)
3. Add all environment variables from `.env.local.example`:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe Pro price ID |
| `STRIPE_BUSINESS_PRICE_ID` | Stripe Business price ID |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` |

4. Deploy

## 5. Post-Deployment

1. Update Stripe webhook endpoint URL to your production domain
2. Update Google OAuth redirect URI if using a custom domain
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. In Supabase → Authentication → URL Configuration:
   - Set Site URL to `https://your-domain.com`
   - Add redirect URLs: `https://your-domain.com/auth/callback`

## 6. Custom Domain (Optional)

1. In Vercel → Project Settings → Domains → Add your domain
2. Update DNS records as instructed by Vercel
3. Update all references to use the new domain (env vars, OAuth, Stripe webhook)

---

## Verify

After deployment:
- [ ] Landing page loads at root URL
- [ ] Google OAuth login works end-to-end
- [ ] Magic link login works
- [ ] Dashboard loads after authentication
- [ ] Creating a project works
- [ ] Collection form is accessible via public link
- [ ] Embed widget loads on an external test page
- [ ] Stripe Checkout flow completes (use test card 4242 4242 4242 4242)
- [ ] Stripe webhook events are received (check Stripe Dashboard → Webhooks → Recent events)
- [ ] Customer Portal opens from Account page
