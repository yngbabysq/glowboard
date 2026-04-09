# Changelog

All notable changes to Glowboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Policy

- **MAJOR** (x.0.0) — breaking changes to public API or embed widget
- **MINOR** (0.x.0) — new features (new widget style, new plan feature, new page)
- **PATCH** (0.0.x) — bug fixes, security patches, copy changes

## [Unreleased]

### Planned — Phase 3: Collection
- Public testimonial collection form (branded, mobile-friendly)
- Email notification on new testimonial (Resend)

### Planned — Phase 4: Embed Widget
- JSON API for widget with CORS + caching
- Standalone vanilla JS widget (<15KB, Shadow DOM)
- Styles: Carousel, Grid, Wall, Minimal

### Planned — Phase 5: Payments
- Stripe Checkout + Customer Portal integration
- Plan limits enforcement (Free / Pro / Business)

### Planned — Phase 6: Polish
- Landing page
- Loading / error / empty states
- SEO metadata
- Security hardening

---

## [0.3.0] - 2026-04-09

### Added
- Dashboard layout with responsive sidebar and mobile hamburger navigation
- Projects list page with testimonial counts, pending badges, create dialog
- Project detail page with testimonial management (approve/reject/delete)
- Tabs filtering: All, Pending, Approved, Rejected
- Project settings: widget style picker, color picker, thank you message
- Embed code section with copy-to-clipboard
- Danger zone with type-to-confirm project deletion
- Sonner toast notifications throughout dashboard

---

## [0.2.0] - 2026-04-09

### Added
- Next.js 16.2.3 + Tailwind CSS v4.2.2 + shadcn/ui project scaffold
- 12 shadcn/ui components (button, card, input, textarea, dialog, dropdown-menu, avatar, badge, tabs, sonner, separator, skeleton)
- Indigo design system with light/dark mode (oklch color tokens)
- Supabase database schema: profiles, projects, testimonials, subscriptions
- 5 SQL migrations with Row Level Security policies
- Auto-create profile + free subscription trigger on signup
- 4 Supabase clients: server (SSR), browser, proxy, admin
- Full TypeScript types for all database tables
- Login page with Google OAuth + magic link (dark atmospheric UI)
- Auth callback route handler
- Proxy (Next.js 16) protecting dashboard routes
- Server actions: createProject, ensureFirstProject, approve/reject/delete testimonials
- Zod validation schemas for project CRUD

---

## [0.1.0] - 2026-04-09

### Added
- Project foundation and documentation
  - `CLAUDE.md` — AI coding assistant context (conventions, gotchas, Tailwind v4, Supabase SSR, Next.js 16 async params, context7 workflow)
  - `architecture.md` — full product spec, user flows, DB schema, RLS policies, security checklist
  - `PROMPTS.md` — session-by-session development prompts (16 sessions across 6 phases)
  - `plan.md` — detailed step-by-step implementation plan with acceptance criteria per step
  - `CHANGELOG.md` — semantic versioning and change tracking (this file)
  - `README.md` — project overview, features comparison, tech stack, embed docs
