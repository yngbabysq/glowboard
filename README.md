<div align="center">

# ✨ Glowboard

### Turn happy customers into your best marketing

**The effortless way to collect, curate, and showcase testimonials — with one line of code.**

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)

[Live Demo](#) · [Documentation](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

---

</div>

## The Problem

Your happiest customers are your best salespeople — but their words are buried in emails, DMs, and Google reviews. Meanwhile, your website says nothing about how much people love what you do.

**Glowboard fixes that in minutes.**

---

## How It Works

```
1. Create a project          → Get a shareable collection link
2. Share it with customers   → They fill a beautiful branded form
3. Approve the best ones     → Embed on your site with one line of code
```

That's it. Your testimonials go live on any website, beautifully rendered, automatically updated.

---

## Features

### For Business Owners
- **One-click collection** — Share a link, customers submit reviews without an account
- **Approval workflow** — Curate what the world sees (approve, reject, delete)
- **Beautiful embeds** — 4 widget styles: Carousel, Grid, Wall, Minimal
- **Brand customization** — Your logo, your colors, your thank-you message
- **Smart notifications** — Email alert every time a new testimonial arrives

### For Developers
- **One line of code** — `<script src="..." data-project="id"></script>`
- **Shadow DOM isolation** — Zero style conflicts with your existing CSS
- **Edge-cached API** — Widget loads in under 500ms
- **Lightweight widget** — Under 15KB, no React dependency

### Platform
| Feature | Free | Pro ($19/mo) | Business ($49/mo) |
|---------|------|-------------|------------------|
| Projects | 1 | Unlimited | Unlimited |
| Testimonials | 15 | Unlimited | Unlimited |
| Widget styles | All 4 | All 4 | All 4 |
| Custom colors | ✗ | ✓ | ✓ |
| Remove branding | ✗ | ✓ | ✓ |
| Custom domain | ✗ | ✗ | ✓ |
| API access | ✗ | ✗ | ✓ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components) |
| Language | TypeScript 5 (strict mode) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (Google OAuth + Magic Link) |
| Payments | [Stripe](https://stripe.com) (Checkout + Customer Portal + Webhooks) |
| Email | [Resend](https://resend.com) + React Email |
| Storage | Supabase Storage (avatars, customer photos) |
| Deployment | [Vercel](https://vercel.com) |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites

- Node.js >= 18.18
- pnpm >= 9
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account

### Installation

```bash
# Clone the repository
git clone https://github.com/yngbabysq/glowboard.git
cd glowboard

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.local.example` for the full list.

---

## Project Structure

```
/app
  /(marketing)          Public pages: landing, pricing, login
  /(dashboard)          Protected: projects, settings, account
  /collect/[publicId]   Public testimonial submission form
  /api/embed/[id]       JSON API for the embed widget (public, CORS)
  /api/webhooks/stripe  Stripe webhook handler
/components
  /ui                   shadcn/ui primitives
  /dashboard            Dashboard-specific components
  /marketing            Landing page components
/lib
  /supabase             Server, browser, middleware, admin clients
  /stripe               Stripe initialization and helpers
  /utils                Plan limits, utilities
  /validations          Zod schemas
/public/embed
  widget.js             Standalone vanilla JS embed script (<15KB)
/supabase/migrations    SQL migration files
```

---

## Database Schema

```
profiles       → auth.users (1:1)
projects       → profiles (many:1)  — public_id is the embed identifier
testimonials   → projects (many:1)  — status: pending | approved | rejected
subscriptions  → profiles (1:1)    — plan: free | pro | business
```

All tables use **Row Level Security**. The embed API is publicly accessible via anonymous Supabase client.

---

## Embed Widget

Add this to any HTML page:

```html
<script
  src="https://glowboard.app/embed/widget.js"
  data-project="your-project-id"
></script>
```

The widget:
- Fetches approved testimonials from the edge-cached API
- Renders inside a **Shadow DOM** (zero style conflicts)
- Supports 4 styles: `carousel` `grid` `wall` `minimal`
- Shows "Powered by Glowboard" on free plan (removed on Pro+)

---

## Development

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm type-check   # TypeScript check
pnpm db:migrate   # Apply database migrations
pnpm db:types     # Regenerate Supabase types
```

---

## Roadmap

- [x] Project documentation and planning
- [ ] Phase 1: Foundation (Next.js, Supabase, Auth)
- [ ] Phase 2: Dashboard (projects, testimonials, settings)
- [ ] Phase 3: Collection form
- [ ] Phase 4: Embed widget
- [ ] Phase 5: Stripe payments
- [ ] Phase 6: Polish + landing page
- [ ] Video testimonials (Pro)
- [ ] AI-powered testimonial highlights
- [ ] Zapier / Make integrations
- [ ] White-label solution (Business)

---

## Contributing

Contributions are welcome! Please read the [contributing guide](CONTRIBUTING.md) first.

---

## License

MIT © [Glowboard](https://glowboard.app)

---

<div align="center">

Built with ♥ using Next.js, Supabase, and Stripe

</div>
