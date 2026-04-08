# Changelog

All notable changes to Glowboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Policy

- **MAJOR** (x.0.0) — breaking changes to public API or embed widget
- **MINOR** (0.x.0) — new features (new widget style, new plan feature, new page)
- **PATCH** (0.0.x) — bug fixes, security patches, copy changes

## [Unreleased]

### Planned — Phase 1: Foundation
- Next.js 16 + Tailwind CSS v4 + shadcn/ui project scaffold
- Supabase database schema (profiles, projects, testimonials, subscriptions)
- Row Level Security policies
- Google OAuth + magic link authentication

### Planned — Phase 2: Dashboard
- Dashboard layout with sidebar
- Projects list and management
- Testimonial approval workflow (approve / reject / delete)
- Project settings (widget customization, embed code)

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

## [0.1.0] - 2026-04-09

### Added
- Project foundation and documentation
  - `CLAUDE.md` — AI coding assistant context (conventions, gotchas, Tailwind v4, Supabase SSR, Next.js 16 async params, context7 workflow)
  - `architecture.md` — full product spec, user flows, DB schema, RLS policies, security checklist
  - `PROMPTS.md` — session-by-session development prompts (16 sessions across 6 phases)
  - `plan.md` — detailed step-by-step implementation plan with acceptance criteria per step
  - `CHANGELOG.md` — semantic versioning and change tracking (this file)
  - `README.md` — project overview, features comparison, tech stack, embed docs
