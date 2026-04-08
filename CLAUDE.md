# Glowboard — Testimonial Collection & Display SaaS

## Project Overview
Glowboard helps businesses collect, curate, and showcase customer testimonials
through beautiful embeddable widgets. Customers submit reviews via a branded
public form; the business owner approves/rejects them in a dashboard; approved
testimonials render on any website via a lightweight embed script.

## Quick Start
Prerequisites: Node.js >=18.18, pnpm >=9
```bash
pnpm install
cp .env.local.example .env.local   # fill in real values
git init && git add -A && git commit -m "init"
pnpm dev                            # http://localhost:3000
```

## Tech Stack
- Framework: Next.js 16 (App Router, Server Components by default)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS v4 (CSS-first config, no tailwind.config.js) + shadcn/ui
- Database: Supabase (PostgreSQL + Row Level Security) via `@supabase/ssr`
- Auth: Supabase Auth (Google OAuth + magic link)
- Payments: Stripe Checkout + Customer Portal + Webhooks
- File Storage: Supabase Storage (avatars, customer photos)
- Email: Resend (transactional emails)
- Deployment: Vercel
- Package Manager: pnpm

## Environment Variables (.env.local)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, NEVER expose to client

# Stripe
STRIPE_SECRET_KEY=                  # server-only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=              # from Stripe Dashboard → Webhooks

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRO_PRICE_ID=
STRIPE_BUSINESS_PRICE_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture

### Directory Structure
```
/app
  /(marketing)        — public: landing, pricing, login pages
  /(dashboard)         — protected: requires auth
    /projects          — list of user's projects
    /projects/[id]     — single project: testimonials list + management
    /projects/[id]/settings — embed code, widget customization
    /account           — billing, profile, subscription management
  /collect/[publicId]  — PUBLIC: testimonial submission form (no auth)
  /api
    /webhooks/stripe   — Stripe webhook handler
    /embed/[publicId]  — JSON API for embed widget (public, CORS enabled)
/components
  /ui                  — shadcn/ui primitives
  /dashboard           — dashboard-specific components
  /marketing           — landing page components
  /embed               — widget preview components
/lib
  /supabase            — client.ts, server.ts, middleware.ts, admin.ts
  /stripe              — stripe.ts, helpers.ts
  /utils               — general utilities
  /validations         — Zod schemas
/public
  /embed
    /widget.js         — standalone vanilla JS embed script (NO React dependency, served statically)
/supabase
  /migrations          — SQL migration files
```

### Database Tables

**profiles**
- id (uuid, FK → auth.users.id)
- full_name (text)
- avatar_url (text, nullable)
- created_at, updated_at

**projects**
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- name (text)
- public_id (text, unique, URL-safe slug)
- logo_url (text, nullable)
- primary_color (text, default '#6366f1')
- widget_style (text, default 'carousel') — carousel | grid | wall | minimal
- thank_you_message (text, default 'Thank you for your feedback!')
- created_at, updated_at

**testimonials**
- id (uuid, PK)
- project_id (uuid, FK → projects.id)
- customer_name (text)
- customer_email (text, nullable)
- customer_avatar_url (text, nullable)
- rating (int, 1-5)
- text (text)
- status (text, default 'pending') — pending | approved | rejected
- created_at

**subscriptions**
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- stripe_customer_id (text)
- stripe_subscription_id (text, nullable)
- plan (text, default 'free') — free | pro | business
- status (text, default 'active')
- current_period_end (timestamptz, nullable)
- created_at, updated_at

### RLS Policies (CRITICAL)
- profiles: users can read/update only their own profile
- projects: users can CRUD only their own projects
- testimonials: 
  - INSERT: anyone (anon) can insert if they provide a valid project public_id
  - SELECT for owner: user can see all testimonials for their projects
  - SELECT for public: anyone can see APPROVED testimonials (for embed widget)
  - UPDATE/DELETE: only project owner
- subscriptions: users can read only their own subscription

### Plan Limits
- Free: 1 project, 15 testimonials, Glowboard branding on widget
- Pro ($19/mo): unlimited projects, unlimited testimonials, no branding, video testimonials, custom colors
- Business ($49/mo): everything in Pro + API access, priority support, custom domain for forms

## Обязательные скиллы по типу задачи

### Дизайн и UI/UX (ОБЯЗАТЕЛЬНО перед любым визуальным кодом)
- **`ui-ux-pro-max`** — вызывай ПЕРЕД разработкой любого экрана, компонента или страницы.
  Покрывает: выбор палитры, типографику, layout, spacing, accessibility, mobile-first.
- **`frontend-design`** — вызывай при создании компонентов, страниц, виджетов.
  Генерирует production-grade код с высоким дизайн-качеством, избегает generic AI-эстетики.

Эти два скилла используются вместе: `ui-ux-pro-max` определяет дизайн-решения,
`frontend-design` реализует их в коде.

**Когда они нужны (полный список):**
- Шаг 1: stартовая страница + globals.css (палитра, типографика)
- Шаг 3: `/app/login/page.tsx`
- Шаг 4: Dashboard layout + Sidebar
- Шаг 5-7: все dashboard страницы
- Шаг 8: `/app/collect/[publicId]` — публичная форма
- Шаг 10: embed widget карточки и стили
- Шаг 13: landing page (здесь особенно важно — это витрина продукта)

### Отладка
- **`superpowers:systematic-debugging`** — при любом баге, неожиданном поведении или ошибке теста.
  Обязательно перед предложением фикса.

### Завершение задач
- **`superpowers:verification-before-completion`** — перед каждым коммитом и заявлением "готово".
  Запускает проверочные команды и подтверждает вывод.

### Code review
- **`superpowers:requesting-code-review`** — после завершения каждой фазы (v0.2.0, v0.3.0, ...).

### Упрощение кода
- **`simplify`** — после завершения каждого шага, перед коммитом.

## Context7 — обязательная проверка документации

**ПЕРЕД каждой сессией** проверяй актуальные API через context7 для библиотек этой сессии.
Если API расходится с этим файлом — следуй context7.

| Библиотека | context7 ID | Что проверять |
|------------|-------------|---------------|
| Next.js 16 | `/vercel/next.js` | App Router, Server Actions, middleware |
| Tailwind v4 | `/tailwindlabs/tailwindcss.com` | `@theme`, CSS-first config |
| shadcn/ui | `/shadcn-ui/ui` | CLI (`npx shadcn@latest init -t next`), компоненты |
| Supabase | `/supabase/supabase` | `@supabase/ssr`, auth, RLS |
| Stripe | `/stripe/stripe-node` | checkout, webhooks, portal |
| Resend | `/websites/resend` | emails.send(), React Email |

## Coding Conventions

### Tailwind CSS v4 (IMPORTANT)
- No `tailwind.config.js` — all configuration via `@theme` block in CSS
- Install: `@tailwindcss/postcss` (not `tailwindcss` as PostCSS plugin)
- CSS entry: `@import "tailwindcss";` then `@theme { ... }` for customization
- PostCSS config: `{ plugins: { "@tailwindcss/postcss": {} } }`
- No `autoprefixer` or `postcss-import` needed — built into v4

### Supabase SSR (CRITICAL)
- Use `@supabase/ssr` package with `createServerClient` (NOT old `createServerComponentClient`)
- Cookie API uses `getAll()` / `setAll()` pattern
- In middleware: MUST call `supabase.auth.getUser()` immediately after `createServerClient`
  — no code between them, or users get randomly logged out
- MUST return the `supabaseResponse` object unchanged from middleware
- Use `createBrowserClient` from `@supabase/ssr` for client components

### Next.js 16 — async params (BREAKING CHANGE)
- `params` и `searchParams` в Page, Layout, Route Handler теперь `Promise` — ОБЯЗАТЕЛЬНО `await`
- Пример Page: `export default async function Page(props: { params: Promise<{ id: string }> }) { const { id } = await props.params; }`
- Пример Route Handler: `export async function GET(request: Request, segmentData: { params: Promise<{ slug: string }> }) { const { slug } = await segmentData.params; }`
- Пример generateMetadata: аналогично — `await props.params`
- Upgrade command: `pnpm next upgrade` (доступен с 16.1.0+)

### MUST follow
- Use TypeScript strict mode everywhere
- Use Server Components by default; add 'use client' only when hooks/interactivity needed
- Validate ALL user input with Zod before database writes
- Use named exports (not default exports) for components
- Prefer async/await over .then() chains
- Handle errors with try/catch; return typed error objects, never throw in Server Actions
- Use Supabase RLS — never rely solely on client-side auth checks
- Use the /lib/supabase/server.ts client in Server Components and Route Handlers
- Use the /lib/supabase/client.ts client only in Client Components

### Stripe in Next.js App Router (IMPORTANT)
- Webhook route handler: use `await request.text()` for raw body (NOT `express.raw()`)
- Verify signature: `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
- Export `const runtime = 'nodejs'` in webhook route (not edge)
- Checkout: `stripe.checkout.sessions.create({ mode: 'subscription', ... })`

### shadcn/ui CLI
- Init: `npx shadcn@latest init -t next`
- Add component: `npx shadcn@latest add button`
- Uses Tailwind v4 `@theme` directive for theming

### MUST NOT do
- NEVER expose SUPABASE_SERVICE_ROLE_KEY or STRIPE_SECRET_KEY to client code
- NEVER use `any` type — define proper types or use `unknown`
- NEVER skip RLS policies on any table
- NEVER process Stripe webhooks without verifying the signature
- NEVER commit .env or .env.local files
- NEVER use inline styles — use Tailwind classes
- NEVER create separate CSS/JS files for components — keep everything colocated

### Naming
- Components: PascalCase (TestimonialCard.tsx)
- Utilities/hooks: camelCase (useProject.ts)
- Database columns: snake_case
- API routes: kebab-case in URL paths
- Zod schemas: camelCase with Schema suffix (createProjectSchema)

## Commands
- `pnpm dev` — dev server (port 3000)
- `pnpm build` — production build (also catches SSR issues)
- `pnpm lint` — ESLint
- `pnpm type-check` — TypeScript strict check (no emit)
- `pnpm db:types` — regenerate Supabase types → /lib/supabase/database.types.ts
- `pnpm db:migrate` — apply pending migrations
- After changes: always run `pnpm lint && pnpm type-check` before committing

## Key Patterns
Once code exists, look here first before creating new patterns:
- Server Actions: /app/(dashboard)/projects/actions.ts
- Supabase server client: /lib/supabase/server.ts (createServerClient + getAll/setAll cookies)
- Supabase browser client: /lib/supabase/client.ts (createBrowserClient)
- Supabase middleware: /lib/supabase/middleware.ts (session refresh + auth.getUser)
- Stripe webhook: /app/api/webhooks/stripe/route.ts
- Protected layout: /app/(dashboard)/layout.tsx
- Zod validation: /lib/validations/project.ts

## Gotchas
- Supabase middleware: any code between `createServerClient` and `auth.getUser()` → random logouts
- Supabase middleware: must return `supabaseResponse` unchanged → cookie sync breaks otherwise
- Tailwind v4: creating `tailwind.config.js` will be silently ignored — use `@theme` in CSS
- Stripe webhook: must use `await request.text()` for raw body in App Router (not `express.raw()`)
- Resend: `from` address must use a verified domain, not arbitrary emails
- Embed widget: all styles must live inside Shadow DOM — external CSS won't work
- Next.js 16: forgetting `await` on `params`/`searchParams` → runtime error, not compile-time

## Git & Versioning Workflow

### Commits
- Commit after each completed step (see plan.md)
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `security:`
- Push to GitHub after every commit: `git push origin main`
- NEVER commit secrets or .env files

### Versioning (Semantic Versioning)
- **MAJOR** (x.0.0) — breaking change to embed widget API or public routes
- **MINOR** (0.x.0) — new user-visible feature (page, widget style, plan feature)
- **PATCH** (0.0.x) — bug fix, security patch, copy/UI tweak

### CHANGELOG.md (Keep a Changelog format)
After EVERY commit that adds/changes/fixes something user-facing:
1. Move items from `[Unreleased]` to a new version block `[x.y.z] - YYYY-MM-DD`
2. Use sections: `Added`, `Changed`, `Fixed`, `Removed`, `Security`
3. Bump version in `package.json` (`npm version patch|minor|major` or manual)
4. Create a git tag: `git tag -a v0.x.x -m "version 0.x.x"`

### Phase milestones → version bumps
| Phase completed | Version |
|----------------|---------|
| Phase 1 (Foundation) | v0.1.0 |
| Phase 2 (Dashboard) | v0.2.0 |
| Phase 3 (Collection) | v0.3.0 |
| Phase 4 (Widget) | v0.4.0 |
| Phase 5 (Payments) | v0.5.0 |
| Phase 6 (Polish) | v0.9.0 |
| Production launch | v1.0.0 |

## When compacting, ALWAYS preserve:
- The full list of modified files
- Current step being worked on (check plan.md)
- Any pending bugs or issues
- Database schema state
