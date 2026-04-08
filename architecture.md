# Glowboard — Architecture & Product Specification

## 1. Product Vision

Glowboard is a tool that makes social proof effortless. A business owner signs up,
creates a "project" (representing one website/product), gets a shareable link to
collect testimonials, approves the best ones, and embeds a beautiful widget on
their site with one line of code.

The embed widget shows "Powered by Glowboard" on the free plan — this is our
primary growth engine.

### Key Technical Decisions
- **Tailwind CSS v4**: CSS-first configuration (`@theme` block in CSS, no `tailwind.config.js`)
- **Supabase SSR**: Uses `@supabase/ssr` with `createServerClient` + `getAll/setAll` cookie pattern
- **Embed widget**: Standalone vanilla JS in `/public/embed/widget.js`, served statically by Next.js
- **Auth session**: Cookie-based (not localStorage) — required for Server Components support

---

## 2. User Flows

### Flow A: Owner Onboarding
1. Owner visits glowboard.com → sees landing page
2. Clicks "Get Started Free" → redirected to /login
3. Signs in with Google or magic link email
4. On first login: auto-create profile + free subscription + first project
5. Lands on /dashboard/projects/[first-project-id]
6. Sees empty state: "No testimonials yet. Share this link with your customers →"

### Flow B: Collecting Testimonials
1. Owner copies their collection link: glowboard.com/collect/[publicId]
2. Sends link to customers (email, SMS, QR code, social media)
3. Customer opens link → sees branded form (owner's logo, colors)
4. Customer fills: name, email (optional), rating (1-5 stars), review text, photo (optional)
5. Customer submits → sees thank you message
6. Owner gets email notification (via Resend): "New testimonial from [name]!"
7. Testimonial appears in dashboard with status "pending"

### Flow C: Managing Testimonials
1. Owner opens project in dashboard
2. Sees all testimonials: tabs for All / Pending / Approved / Rejected
3. Clicks "Approve" → testimonial goes live on embed widget
4. Clicks "Reject" → testimonial hidden
5. Can edit testimonial text (minor corrections only)
6. Can delete testimonials

### Flow D: Embedding Widget
1. Owner goes to project Settings tab
2. Chooses widget style: Carousel, Grid, Wall, or Minimal
3. Picks primary color (color picker)
4. Sees live preview of how widget will look
5. Copies embed code: `<script src="https://glowboard.com/embed/widget.js" data-project="[publicId]"></script>`
6. Pastes into their website's HTML
7. Widget loads, fetches approved testimonials via /api/embed/[publicId], renders them
8. "Powered by Glowboard" link appears at bottom (removed on Pro/Business plans)

### Flow E: Upgrading Plan
1. Owner clicks "Upgrade" in dashboard sidebar or hits a limit
2. Redirected to Stripe Checkout with pre-selected plan
3. Completes payment
4. Stripe sends webhook → our handler updates subscription table
5. Owner redirected back to dashboard with new plan active
6. Managing subscription: "Manage Billing" → Stripe Customer Portal

---

## 3. Pages & Routes

### Marketing (public, no auth)
| Route | Purpose |
|-------|---------|
| / | Landing page with hero, features, pricing, footer |
| /pricing | Detailed pricing comparison |
| /login | Auth page (Google + magic link) |
| /collect/[publicId] | Testimonial submission form |

### Dashboard (protected, requires auth)
| Route | Purpose |
|-------|---------|
| /dashboard | Redirect to /dashboard/projects |
| /dashboard/projects | List all projects |
| /dashboard/projects/[id] | Project detail: testimonials management |
| /dashboard/projects/[id]/settings | Widget customization + embed code |
| /dashboard/account | Profile + billing management |

### API Routes
| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| /api/embed/[publicId] | GET | Return approved testimonials as JSON | None (public, CORS) |
| /api/webhooks/stripe | POST | Handle Stripe events | Stripe signature |

---

## 4. Embed Widget Technical Spec

The embed widget is a **standalone vanilla JavaScript file** in `/public/embed/widget.js`
that does NOT depend on React or Next.js. It must be lightweight (<15KB gzipped).
All styles are injected inside a Shadow DOM — no external CSS file needed.

### How it works:
1. Website owner adds: `<script src="https://glowboard.com/embed/widget.js" data-project="abc123"></script>`
2. Script reads `data-project` attribute via `document.currentScript`
3. Fetches `https://glowboard.com/api/embed/abc123`
4. API returns: `{ testimonials: [...], style: "carousel", primaryColor: "#6366f1", showBranding: true }`
5. Script creates a Shadow DOM container (to isolate styles from host site)
6. Renders testimonials in the chosen style
7. If `showBranding` is true, shows "Powered by Glowboard" link at bottom

### Widget Styles:
- **Carousel**: horizontal scrolling cards with navigation arrows
- **Grid**: 2-3 column responsive grid of cards
- **Wall**: masonry-style "wall of love" layout
- **Minimal**: simple list with subtle separators

### Each testimonial card shows:
- Customer name
- Star rating (filled/empty stars)
- Review text (truncated with "read more" for long reviews)
- Customer photo (if available, otherwise initials avatar)
- Relative date ("2 weeks ago")

---

## 5. Stripe Integration

### Products & Prices (create in Stripe Dashboard)
- Product: "Glowboard Pro" → Price: $19/month (recurring)
- Product: "Glowboard Business" → Price: $49/month (recurring)

### Webhook Events to Handle:
- `checkout.session.completed` → create/update subscription
- `customer.subscription.updated` → sync plan changes
- `customer.subscription.deleted` → downgrade to free
- `invoice.payment_failed` → mark subscription as past_due

### Checkout Flow:
1. Server Action creates Stripe Checkout Session
2. Redirect user to Stripe-hosted checkout page
3. On success: Stripe sends webhook, we update DB
4. Redirect user back to /dashboard with success message

### Customer Portal:
- For managing subscription, updating payment method, canceling
- Create portal session via Server Action, redirect user

---

## 6. Email Notifications (Resend)

### Trigger: New testimonial submitted
- To: project owner's email
- Subject: "New testimonial for [project name] from [customer name]"
- Body: star rating, review text preview, link to dashboard
- Template: simple, branded HTML email

---

## 7. Security Checklist

- [ ] All tables have RLS policies
- [ ] Supabase service_role key only used in server-side code (never in `NEXT_PUBLIC_*`)
- [ ] Stripe webhooks verify signature before processing (`constructEvent` with `STRIPE_WEBHOOK_SECRET`)
- [ ] File uploads validate type (images only) and size (<5MB)
- [ ] Rate limiting on testimonial submission (prevent spam)
- [ ] CORS on /api/embed/* allows all origins (widget needs this)
- [ ] Input sanitization on all user-submitted text (XSS prevention)
- [ ] publicId is URL-safe, random, non-guessable (nanoid, 12+ chars)
- [ ] Middleware calls `auth.getUser()` immediately after creating Supabase client
- [ ] Middleware returns `supabaseResponse` object unchanged (cookie sync)

---

## 8. Performance Requirements

- Landing page: Lighthouse score >90
- Dashboard: interactive within 2 seconds
- Embed widget: loads in <500ms, <15KB gzipped
- API /embed/[publicId]: response in <200ms (use Supabase edge)

---

## 9. Implementation Order (for Claude Code sessions)

### Phase 1: Foundation
1. Initialize Next.js 16 + TypeScript + Tailwind CSS v4 (CSS-first, `@tailwindcss/postcss`) + shadcn/ui + pnpm
2. Set up Supabase project, create migrations for all tables + RLS
3. Configure Supabase Auth (Google + magic link) using `@supabase/ssr`
4. Create auth middleware for dashboard routes (getAll/setAll cookies, auth.getUser())
5. Auto-create profile + subscription on first sign-in

### Phase 2: Core Dashboard
6. Dashboard layout (sidebar nav, header with user menu)
7. Projects list page (create, rename, delete projects)
8. Project detail page (testimonials list with status tabs + approve/reject)
9. Project settings page (widget style picker, color picker, embed code copy)

### Phase 3: Testimonial Collection
10. Public collection form /collect/[publicId] (branded, responsive)
11. Form submission → insert into DB with status "pending"
12. Email notification to owner via Resend

### Phase 4: Embed Widget
13. Build /api/embed/[publicId] endpoint (JSON, CORS headers)
14. Build standalone widget.js (vanilla JS, Shadow DOM)
15. Implement all 4 widget styles
16. "Powered by Glowboard" branding logic

### Phase 5: Payments
17. Stripe Checkout integration (Pro + Business plans)
18. Stripe webhook handler
19. Plan limit enforcement (project count, testimonial count, branding)
20. Stripe Customer Portal for subscription management

### Phase 6: Polish
21. Landing page (hero, features, pricing, social proof)
22. Responsive design pass on all pages
23. Loading states, error states, empty states
24. SEO meta tags, Open Graph images
25. Final security review
