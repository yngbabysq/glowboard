# Glowboard — План реализации

> Единый источник правды о прогрессе. Обновляется после каждого шага.
> При возобновлении работы — читай этот файл первым делом.

## Статусы
- [ ] — не начато
- [~] — в процессе
- [x] — завершено

## Скиллы по типу задачи
| Ситуация | Скилл |
|----------|-------|
| Любой UI/UX экран | `ui-ux-pro-max` → `frontend-design` |
| Баг или неожиданное поведение | `superpowers:systematic-debugging` |
| Перед коммитом | `superpowers:verification-before-completion` + `simplify` |
| После завершения фазы | `superpowers:requesting-code-review` |
| Планирование сложной фичи | `superpowers:brainstorming` → `superpowers:writing-plans` |

---

## Фаза 1: Фундамент

### Шаг 1 — Инициализация проекта
**context7 перед стартом:** Next.js 16 (`/vercel/next.js`), Tailwind v4 (`/tailwindlabs/tailwindcss.com`), shadcn/ui (`/shadcn-ui/ui`)
**скиллы:** `ui-ux-pro-max` (цветовая система, типографика, spacing) → `frontend-design` (globals.css, базовые стили)

- [ ] `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"` (или аналог для Next.js 16)
- [ ] Убедиться что в `package.json` стоит `next@^16`, не 15
- [ ] Настроить Tailwind CSS v4:
  - `pnpm add tailwindcss @tailwindcss/postcss`
  - `postcss.config.mjs`: `export default { plugins: { "@tailwindcss/postcss": {} } }`
  - В `globals.css`: `@import "tailwindcss";` + `@theme { --color-primary: #6366f1; }`
  - **НЕ** создавать `tailwind.config.js` — v4 его игнорирует
  - **НЕ** ставить `autoprefixer`, `postcss-import` — встроены
- [ ] Инициализировать shadcn/ui: `npx shadcn@latest init -t next` (neutral, new-york)
- [ ] Добавить компоненты: `npx shadcn@latest add button card input textarea dialog dropdown-menu avatar badge tabs toast separator skeleton`
- [ ] Создать пустые директории (mkdir -p):
  - `app/(marketing)`, `app/(dashboard)/projects/[id]/settings`, `app/(dashboard)/account`
  - `app/collect/[publicId]`, `app/api/webhooks/stripe`, `app/api/embed/[publicId]`
  - `components/ui` (уже от shadcn), `components/dashboard`, `components/marketing`, `components/embed`
  - `lib/supabase`, `lib/stripe`, `lib/utils`, `lib/validations`
  - `public/embed`, `supabase/migrations`
- [ ] Создать `.env.local.example` (скопировать из CLAUDE.md секцию Environment Variables)
- [ ] Убедиться `.env.local` в `.gitignore`
- [ ] Установить доп. зависимости: `pnpm add nanoid zod`
- [ ] **Проверка:** `pnpm dev` → http://localhost:3000 открывается без ошибок
- [ ] **Проверка:** `pnpm build` проходит без ошибок
- [ ] `git init && git add -A && git commit -m "feat: initial project setup"`

**Критерий завершения:** dev сервер стартует, build проходит, shadcn компоненты установлены, структура директорий на месте.

---

### Шаг 2 — База данных и Supabase клиенты
**context7 перед стартом:** Supabase (`/supabase/supabase`) — createServerClient, RLS, triggers

- [ ] Создать `supabase/migrations/001_profiles.sql`:
  ```sql
  -- profiles: id (uuid PK, FK → auth.users.id), full_name, avatar_url, created_at, updated_at
  -- RLS: SELECT/UPDATE only own profile (auth.uid() = id)
  ```
- [ ] Создать `supabase/migrations/002_projects.sql`:
  ```sql
  -- projects: id, user_id (FK → profiles.id), name, public_id (unique), logo_url,
  --   primary_color (default '#6366f1'), widget_style (default 'carousel'),
  --   thank_you_message, created_at, updated_at
  -- RLS: full CRUD only where user_id = auth.uid()
  -- Indexes: public_id (unique), user_id
  ```
- [ ] Создать `supabase/migrations/003_testimonials.sql`:
  ```sql
  -- testimonials: id, project_id (FK → projects.id ON DELETE CASCADE),
  --   customer_name, customer_email, customer_avatar_url, rating (1-5 CHECK),
  --   text, status (default 'pending', CHECK in pending/approved/rejected), created_at
  -- RLS INSERT: anon может вставлять (для публичной формы!)
  -- RLS SELECT: owner видит все; anon видит только status='approved'
  -- RLS UPDATE/DELETE: только owner (через join на projects.user_id)
  -- Index: project_id
  ```
- [ ] Создать `supabase/migrations/004_subscriptions.sql`:
  ```sql
  -- subscriptions: id, user_id (FK → profiles.id), stripe_customer_id,
  --   stripe_subscription_id, plan (default 'free'), status (default 'active'),
  --   current_period_end, created_at, updated_at
  -- RLS: SELECT only own (user_id = auth.uid())
  ```
- [ ] Создать `supabase/migrations/005_triggers.sql`:
  ```sql
  -- Trigger on auth.users INSERT → create profile + subscription (plan='free')
  -- Trigger on profiles/projects/subscriptions UPDATE → set updated_at = now()
  ```
- [ ] `pnpm add @supabase/supabase-js @supabase/ssr`
- [ ] Создать `/lib/supabase/server.ts`:
  - `import { createServerClient } from '@supabase/ssr'`
  - `import { cookies } from 'next/headers'`
  - Паттерн: `cookies().getAll()` / `cookies().set(name, value, options)`
  - Экспортировать `createClient()` функцию
- [ ] Создать `/lib/supabase/client.ts`:
  - `import { createBrowserClient } from '@supabase/ssr'`
  - Использует `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Создать `/lib/supabase/middleware.ts`:
  - `createServerClient` с getAll/setAll
  - **КРИТИЧНО:** `supabase.auth.getUser()` СРАЗУ после создания клиента — ни строчки кода между ними
  - Возвращать `supabaseResponse` объект без изменений
- [ ] Создать `/lib/supabase/admin.ts`:
  - `import { createClient } from '@supabase/supabase-js'`
  - Использует `SUPABASE_SERVICE_ROLE_KEY` — только для webhook handler
- [ ] Создать `/lib/supabase/database.types.ts` — вручную описать типы всех 4 таблиц
- [ ] **Проверка:** `pnpm type-check` без ошибок
- [ ] `git add -A && git commit -m "feat: database schema, RLS, auth setup"`

**Критерий завершения:** все миграции созданы, 4 Supabase клиента работают, типы описаны, type-check проходит.

---

### Шаг 3 — Auth flow и middleware
**context7 перед стартом:** Supabase Auth (`/supabase/supabase`) — exchangeCodeForSession, OAuth, magic link
**скиллы:** `ui-ux-pro-max` + `frontend-design` для login page (первое впечатление о продукте)

- [ ] Создать `/app/login/page.tsx`:
  - Client Component (для кнопок и формы)
  - Кнопка "Continue with Google" → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })`
  - Поле email + кнопка "Send magic link" → `supabase.auth.signInWithOtp({ email })`
  - Дизайн: по центру, карточка, логотип Glowboard сверху
- [ ] Создать `/app/auth/callback/route.ts`:
  - Получить `code` из `searchParams` (Next.js 16: `await` на searchParams!)
  - `supabase.auth.exchangeCodeForSession(code)`
  - Redirect на `/dashboard/projects`
  - Обработка ошибки → redirect на `/login?error=auth`
- [ ] Создать `middleware.ts` в корне проекта:
  - Импорт `updateSession` из `/lib/supabase/middleware.ts`
  - Matcher: `/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`
  - Внутри `updateSession`:
    - auth.getUser() — если нет user и путь `/dashboard/*` → redirect `/login`
    - Если есть user и путь `/login` → redirect `/dashboard/projects`
- [ ] Создать Server Action `/app/(dashboard)/projects/actions.ts`:
  - `ensureFirstProject(userId)` — если у пользователя 0 проектов, создаёт первый
  - Генерация publicId через `nanoid(12)`
  - Название по умолчанию: "My First Project"
- [ ] **Проверка (ручная):** login → Google OAuth → callback → dashboard (потребует настроенный Supabase проект)
- [ ] **Проверка:** `pnpm build` без ошибок
- [ ] `git add -A && git commit -m "feat: auth flow with Google and magic link"`

**Критерий завершения:** middleware защищает dashboard, login page рендерится, auth callback обрабатывает code, первый проект создаётся автоматически.

### ✦ После Фазы 1 → v0.2.0
- [ ] Обновить `[Unreleased]` → `[0.2.0] - YYYY-MM-DD` в CHANGELOG.md
- [ ] `git tag -a v0.2.0 -m "v0.2.0 — foundation"` && `git push origin main --tags`
- [ ] Скилл `superpowers:requesting-code-review` — ревью фазы
- [ ] Скилл `simplify` — упростить весь написанный код

---

## Фаза 2: Dashboard

### Шаг 4 — Layout дашборда
**context7 перед стартом:** shadcn/ui (`/shadcn-ui/ui`) — sidebar, dropdown-menu, avatar
**скиллы:** `ui-ux-pro-max` (sidebar layout, responsive, nav patterns) → `frontend-design` (компоненты)

- [ ] Создать `/app/(dashboard)/layout.tsx` (Server Component):
  - Загрузка данных: user profile + subscription через Supabase server client
  - Если нет user → redirect на `/login`
  - Вызов `ensureFirstProject(user.id)` при первом входе
  - Передача данных в клиентский Sidebar компонент
- [ ] Создать `/components/dashboard/Sidebar.tsx` (Client Component):
  - Логотип "Glowboard" вверху
  - Навигация: Projects (link), Account (link)
  - Badge с текущим планом (Free/Pro/Business)
  - Кнопка "Upgrade to Pro" если план free → ведёт на `/dashboard/account`
  - Внизу: аватар + имя + DropdownMenu (Profile, Logout)
  - Logout: `supabase.auth.signOut()` → redirect `/login`
- [ ] Создать `/components/dashboard/MobileNav.tsx` (Client Component):
  - Hamburger кнопка → Sheet/Drawer с тем же меню
  - Показывается только на `md:hidden`
- [ ] **Проверка:** sidebar рендерится, навигация работает, mobile menu открывается
- [ ] `git add -A && git commit -m "feat: dashboard layout with sidebar"`

**Критерий завершения:** layout отображает sidebar на desktop, hamburger на mobile, user data загружается, logout работает.

---

### Шаг 5 — Список проектов
**скиллы:** `ui-ux-pro-max` + `frontend-design` (project cards, empty state, dialog)

- [ ] Создать `/app/(dashboard)/projects/page.tsx` (Server Component):
  - Запрос: все проекты пользователя + count testimonials + count pending
  - Передача в клиентский компонент
- [ ] Создать `/components/dashboard/ProjectCard.tsx`:
  - Название, количество отзывов, количество pending (badge), дата создания
  - Клик → `router.push(/dashboard/projects/${id})`
- [ ] Создать Server Action `createProject` в `/app/(dashboard)/projects/actions.ts`:
  - Zod валидация: `{ name: z.string().min(1).max(100) }`
  - Проверка лимита: free план → max 1 проект. Если превышен → return error
  - Генерация publicId через nanoid(12)
  - `revalidatePath('/dashboard/projects')`
- [ ] "New Project" кнопка → Dialog (shadcn) с input для имени + submit
- [ ] Empty state: иллюстрация + текст (маловероятно, т.к. auto-create)
- [ ] **Проверка:** проекты отображаются, создание работает, лимит срабатывает
- [ ] `git add -A && git commit -m "feat: projects list page"`

**Критерий завершения:** список проектов с карточками, создание нового проекта через dialog, лимит free плана работает.

---

### Шаг 6 — Управление отзывами
**Next.js 16 напоминание:** `params` — Promise! `const { id } = await props.params;`
**скиллы:** `ui-ux-pro-max` + `frontend-design` (testimonial cards, status badges, tabs)

- [ ] Создать `/app/(dashboard)/projects/[id]/page.tsx` (Server Component):
  - `const { id } = await props.params` (Next.js 16!)
  - Загрузить проект + проверить ownership (user_id = current user)
  - Если не найден или чужой → `notFound()`
  - Загрузить testimonials с возможностью фильтрации по статусу
- [ ] Строка с collection link: `{APP_URL}/collect/{publicId}` + кнопка "Copy" (toast)
- [ ] Tabs (shadcn): All | Pending | Approved | Rejected
  - Фильтрация через searchParams или client state
- [ ] Создать `/components/dashboard/TestimonialCard.tsx`:
  - Аватар (фото или инициалы на цветном фоне из первых букв имени)
  - Имя, звёзды (★ заполненные/пустые), текст отзыва, дата (relative)
  - Badge статуса: pending=yellow, approved=green, rejected=red
  - Кнопки действий: Approve (если не approved), Reject (если не rejected), Delete
- [ ] Server Actions в `/app/(dashboard)/projects/actions.ts`:
  - `approveTestimonial(id)` — проверка ownership → update status='approved'
  - `rejectTestimonial(id)` — проверка ownership → update status='rejected'
  - `deleteTestimonial(id)` — проверка ownership → delete
  - Все с `revalidatePath`
- [ ] Empty state: "No testimonials yet. Share your collection link to get started!"
- [ ] Loading: Skeleton компоненты пока данные грузятся
- [ ] **Проверка:** карточки рендерятся, фильтрация по табам, approve/reject/delete работают
- [ ] `git add -A && git commit -m "feat: project detail page with testimonial management"`

**Критерий завершения:** полное CRUD testimonials, фильтрация по статусу, ownership проверяется, loading/empty states.

---

### Шаг 7 — Настройки проекта
**Next.js 16 напоминание:** `params` — Promise!
**скиллы:** `ui-ux-pro-max` + `frontend-design` (settings layout, widget style picker, color picker)

- [ ] Создать `/app/(dashboard)/projects/[id]/settings/page.tsx`:
  - `const { id } = await props.params`
  - Загрузить проект, проверить ownership
- [ ] Секция "Widget Appearance":
  - Radio cards для стиля: Carousel / Grid / Wall / Minimal (с миниатюрными превью)
  - Color picker: 8 preset цветов + custom hex input
  - Логотип: file upload в Supabase Storage (images only, <5MB)
  - Thank you message: textarea
  - Server Action `updateProjectSettings` с Zod валидацией
- [ ] Секция "Embed Code":
  - Готовый `<script>` тег с data-project={publicId}
  - Кнопка "Copy Code" → clipboard + toast "Copied!"
- [ ] Секция "Collection Link":
  - Полная ссылка + кнопка копирования
  - QR-код (сгенерировать на клиенте — `qrcode` npm или canvas)
- [ ] Секция "Danger Zone":
  - "Delete Project" → Dialog подтверждения ("Type project name to confirm")
  - Server Action `deleteProject` → cascade delete testimonials → redirect `/dashboard/projects`
- [ ] **Проверка:** настройки сохраняются, embed code копируется, QR генерируется, удаление работает
- [ ] `git add -A && git commit -m "feat: project settings and embed code"`

**Критерий завершения:** все настройки сохраняются и применяются, embed code правильный, удаление с подтверждением.

### ✦ После Фазы 2 → v0.3.0
- [ ] Обновить CHANGELOG.md → `[0.3.0]`
- [ ] `git tag -a v0.3.0 -m "v0.3.0 — dashboard"` && push
- [ ] Скилл `superpowers:requesting-code-review`
- [ ] Скилл `simplify`

---

## Фаза 3: Сбор отзывов

### Шаг 8 — Публичная форма
**Next.js 16 напоминание:** `params` — Promise! `const { publicId } = await props.params;`
**скиллы:** `ui-ux-pro-max` + `frontend-design` (публичная форма — первое впечатление клиента о бизнесе!)

- [ ] Создать `/app/collect/[publicId]/page.tsx` (Server Component):
  - `const { publicId } = await props.params`
  - Загрузить проект по publicId (без auth — анонимный запрос)
  - Если не найден → `notFound()`
  - Показать логотип проекта + название
- [ ] Создать `/components/collect/TestimonialForm.tsx` (Client Component):
  - Имя* (text input)
  - Email (text input, optional)
  - Rating* (кликабельные звёзды 1-5, интерактивные)
  - Отзыв* (textarea, max 1000 chars, показывать counter)
  - Фото (file input, optional, preview, max 5MB, images only)
  - Submit кнопка с loading state
- [ ] Создать Zod схему `/lib/validations/testimonial.ts`:
  ```ts
  createTestimonialSchema = z.object({
    customerName: z.string().min(1).max(100),
    customerEmail: z.string().email().optional().or(z.literal('')),
    rating: z.number().int().min(1).max(5),
    text: z.string().min(1).max(1000),
    projectPublicId: z.string(),
  })
  ```
- [ ] Server Action `submitTestimonial`:
  - Zod валидация
  - Проверка лимита testimonials (free план → max 15)
  - Upload фото в Supabase Storage если есть
  - Insert в testimonials с status='pending'
  - Не проверять auth — анонимный доступ
  - Return `{ success: true }` или `{ error: 'message' }`
- [ ] После отправки: скрыть форму, показать thank_you_message проекта
- [ ] Внизу страницы: "Powered by Glowboard" со ссылкой на главную
- [ ] Дизайн: чистый, минималистичный, хорошо на mobile
- [ ] **Проверка:** форма отправляется, testimonial появляется в dashboard как pending
- [ ] `git add -A && git commit -m "feat: public testimonial collection form"`

**Критерий завершения:** анонимная форма работает, валидация отлавливает ошибки, лимит проверяется, thank you показывается.

### ✦ После Фазы 3 → v0.4.0
- [ ] Обновить CHANGELOG.md → `[0.4.0]`
- [ ] `git tag -a v0.4.0 -m "v0.4.0 — testimonial collection"` && push
- [ ] Скилл `superpowers:requesting-code-review`
- [ ] Скилл `simplify`

---

## Фаза 4: Embed виджет

### Шаг 9 — API endpoint
**Next.js 16 напоминание:** `params` — Promise в route handler!

- [ ] Создать `/app/api/embed/[publicId]/route.ts`:
  - `const { publicId } = await segmentData.params`
  - GET: загрузить проект (style, primaryColor) + approved testimonials
  - Определить showBranding: join с subscriptions → free plan = true
  - Response JSON: `{ testimonials: [...], style, primaryColor, showBranding }`
  - Headers:
    - `Access-Control-Allow-Origin: *`
    - `Access-Control-Allow-Methods: GET, OPTIONS`
    - `Cache-Control: public, max-age=300` (5 мин)
  - OPTIONS handler для CORS preflight
  - Проект не найден → `NextResponse.json({ error: 'Not found' }, { status: 404 })`
- [ ] **Проверка:** `curl http://localhost:3000/api/embed/{publicId}` → валидный JSON
- [ ] `git add -A && git commit -m "feat: embed API endpoint"`

**Критерий завершения:** API возвращает JSON с testimonials, CORS headers правильные, кэширование работает.

---

### Шаг 10 — Standalone виджет
**скиллы:** `ui-ux-pro-max` (карточки, типографика виджета, стили всех 4 режимов) → `frontend-design` (генерация CSS-in-JS для Shadow DOM)

- [ ] Создать `/public/embed/widget.js` — чистый vanilla JS, БЕЗ React, БЕЗ импортов:
  - `document.currentScript` → прочитать `data-project`
  - Определить base URL из `src` атрибута скрипта
  - Fetch → `/api/embed/{publicId}`
  - Создать Shadow DOM: `container.attachShadow({ mode: 'open' })`
  - Инжектировать `<style>` внутрь Shadow DOM (НЕ внешний CSS файл)
- [ ] Реализовать 4 стиля рендеринга:
  - **Carousel**: flex container, overflow-x scroll, стрелки ←/→, auto-play каждые 5с
  - **Grid**: CSS grid, 2 колонки на mobile, 3 на desktop
  - **Wall**: CSS columns (masonry), 2-3 колонки responsive
  - **Minimal**: вертикальный список с разделителями
- [ ] Карточка testimonial:
  - Аватар: фото (img) или инициалы (div с цветным фоном)
  - Имя клиента
  - Звёзды: ★ (заполненные) + ☆ (пустые)
  - Текст: truncate >200 chars + "Read more" toggle
  - Дата: relative format ("2 weeks ago", "3 months ago")
- [ ] Branding: если `showBranding=true` → "⭐ Powered by Glowboard" внизу со ссылкой
- [ ] Error handling: если fetch fails → показать "Unable to load testimonials" (не crash)
- [ ] **Проверка размера:** файл должен быть <15KB
- [ ] **Проверка изоляции:** стили не должны утекать за Shadow DOM
- [ ] **Проверка:** создать тестовый HTML файл с `<script>` тегом, убедиться что виджет рендерится
- [ ] `git add -A && git commit -m "feat: standalone embed widget"`

**Критерий завершения:** виджет рендерится на внешнем сайте, 4 стиля работают, Shadow DOM изолирует стили, <15KB.

### ✦ После Фазы 4 → v0.5.0
- [ ] Обновить CHANGELOG.md → `[0.5.0]`
- [ ] `git tag -a v0.5.0 -m "v0.5.0 — embed widget"` && push
- [ ] Скилл `superpowers:requesting-code-review`
- [ ] Скилл `simplify`

---

## Фаза 5: Платежи

### Шаг 11 — Stripe интеграция
**context7 перед стартом:** Stripe (`/stripe/stripe-node`) — checkout, webhooks, constructEvent

- [ ] `pnpm add stripe`
- [ ] Создать `/lib/stripe/stripe.ts`:
  ```ts
  import Stripe from 'stripe'
  export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  ```
- [ ] Server Action `createCheckoutSession(plan: 'pro' | 'business')`:
  - Найти или создать Stripe Customer (по email)
  - Сохранить `stripe_customer_id` в subscriptions
  - `stripe.checkout.sessions.create({ mode: 'subscription', customer, line_items: [{ price: priceId, quantity: 1 }], success_url, cancel_url })`
  - Return URL для redirect
- [ ] Server Action `createPortalSession()`:
  - `stripe.billingPortal.sessions.create({ customer, return_url })`
  - Return URL для redirect
- [ ] Webhook `/app/api/webhooks/stripe/route.ts`:
  - `export const runtime = 'nodejs'` (НЕ edge!)
  - `const body = await request.text()`
  - `const sig = request.headers.get('stripe-signature')`
  - `stripe.webhooks.constructEvent(body, sig!, STRIPE_WEBHOOK_SECRET)`
  - Использовать Supabase admin client (service_role)
  - Events:
    - `checkout.session.completed` → upsert subscription (plan, stripe_subscription_id, status='active')
    - `customer.subscription.updated` → sync plan + status
    - `customer.subscription.deleted` → set plan='free', status='active'
    - `invoice.payment_failed` → set status='past_due'
- [ ] Страница `/app/(dashboard)/account/page.tsx`:
  - Текущий план (Free/Pro/Business) + статус
  - Если платный: "Manage Billing" кнопка → Stripe Portal
  - Если free: карточки Pro и Business с описанием фич + кнопки "Upgrade"
- [ ] Обновить Sidebar: кнопка "Upgrade" если free plan
- [ ] **Проверка:** checkout flow работает (Stripe test mode), webhook обрабатывает events
- [ ] `git add -A && git commit -m "feat: Stripe payments integration"`

**Критерий завершения:** checkout → webhook → subscription update цикл работает, portal открывается, account page показывает план.

---

### Шаг 12 — Лимиты планов
- [ ] Создать `/lib/utils/plan-limits.ts`:
  ```ts
  const LIMITS = { free: { projects: 1, testimonials: 15 }, pro: { projects: Infinity, testimonials: Infinity }, business: { projects: Infinity, testimonials: Infinity } }
  export async function checkProjectLimit(userId): Promise<{ allowed: boolean; current: number; max: number }>
  export async function checkTestimonialLimit(projectId): Promise<{ allowed: boolean; current: number; max: number }>
  export async function shouldShowBranding(userId): Promise<boolean>  // true if free plan
  ```
- [ ] Применить `checkProjectLimit` в `createProject` Server Action
- [ ] Применить `checkTestimonialLimit` в `submitTestimonial` Server Action
- [ ] Применить `shouldShowBranding` в `/api/embed/[publicId]` route
- [ ] Создать `/components/dashboard/UpgradePrompt.tsx`:
  - Показывается когда лимит достигнут
  - "You've reached the limit of your Free plan. Upgrade to Pro for unlimited..."
  - Кнопка "Upgrade" → createCheckoutSession
- [ ] **Проверка:** при 2-м проекте на free → показывает Upgrade, при 16-м testimonial → показывает Upgrade
- [ ] `git add -A && git commit -m "feat: plan limits enforcement"`

**Критерий завершения:** все лимиты работают, upgrade prompt показывается, branding на free виджете.

### ✦ После Фазы 5 → v0.6.0
- [ ] Обновить CHANGELOG.md → `[0.6.0]`
- [ ] `git tag -a v0.6.0 -m "v0.6.0 — payments"` && push
- [ ] Скилл `superpowers:requesting-code-review`
- [ ] Скилл `simplify`

---

## Фаза 6: Polish

### Шаг 13 — Landing page
**context7 перед стартом:** Tailwind v4 (`/tailwindlabs/tailwindcss.com`) — animations, responsive
**скиллы:** `ui-ux-pro-max` СНАЧАЛА (полный дизайн-план страницы) → `frontend-design` (реализация). Это витрина — качество критично.

- [ ] Создать `/app/(marketing)/layout.tsx` — простой layout без sidebar, с header/footer
- [ ] Создать `/app/(marketing)/page.tsx`:
  - **Hero**: "Turn happy customers into your best marketing" + подзаголовок + CTA "Start Free" → /login
  - Анимированный превью виджета (carousel с фейковыми testimonials)
  - **How it Works**: 3 шага с иконками: Create → Share → Embed
  - **Widget Showcase**: интерактивный пример виджета, переключение между 4 стилями
  - **Pricing**: 3 карточки (Free/Pro/Business), сравнение фич, CTA кнопки
  - **Social proof**: "Trusted by X businesses" (placeholder)
  - **Footer**: ссылки, копирайт "© 2026 Glowboard"
- [ ] Тёмная тема: dark bg, индиго/фиолетовый акцент (#6366f1)
- [ ] CSS transitions для hover effects, scroll animations (intersection observer)
- [ ] Fully responsive (mobile-first)
- [ ] **Проверка:** визуально привлекательно, responsive, анимации плавные
- [ ] `git add -A && git commit -m "feat: landing page"`

**Критерий завершения:** landing page выглядит профессионально, все секции на месте, responsive, анимации.

---

### Шаг 14 — Финальная полировка
- [ ] Loading states: добавить `loading.tsx` с Skeleton для всех dashboard страниц
- [ ] Error states: добавить `error.tsx` с retry кнопкой для всех route groups
- [ ] Empty states: проверить все страницы на случай пустых данных
- [ ] Responsive: тестировать каждую страницу на 320px, 768px, 1280px
- [ ] SEO: `generateMetadata` на каждой странице (title, description, openGraph)
- [ ] Toast уведомления: approve/reject/delete/copy actions
- [ ] Favicon: `/app/favicon.ico` + `/app/icon.tsx` (generated)
- [ ] OG image: `/app/opengraph-image.tsx` (generated)
- [ ] Формы: все имеют Zod валидацию + отображение ошибок под полями
- [ ] **Проверка:** `pnpm build` без ошибок, все страницы работают
- [ ] `git add -A && git commit -m "feat: polish — loading, errors, responsive, SEO"`

**Критерий завершения:** ни одной страницы без loading/error/empty state, SEO на месте, toast на всех actions.

---

### Шаг 15 — Security review
- [ ] RLS: проверить что все 4 таблицы имеют RLS включённый и policies
- [ ] Keys: grep по коду — `SUPABASE_SERVICE_ROLE_KEY` и `STRIPE_SECRET_KEY` не в `NEXT_PUBLIC_*` файлах
- [ ] Stripe webhook: `constructEvent` используется, signature проверяется
- [ ] Rate limiting: добавить на `/collect/[publicId]` submit и `/api/embed/[publicId]` (хотя бы простой in-memory)
- [ ] XSS: testimonial text sanitized при отображении (в виджете и dashboard)
- [ ] CORS: `/api/embed/*` — `Access-Control-Allow-Origin: *`, остальные API — нет
- [ ] Zod: все Server Actions и Route Handlers валидируют input
- [ ] SQL injection: Supabase client использует параметризованные запросы (по умолчанию)
- [ ] File upload: проверка MIME type (images only) + размер (<5MB)
- [ ] **Проверка:** `pnpm build` + ручная проверка всех endpoints
- [ ] `git add -A && git commit -m "fix: security review fixes"`

**Критерий завершения:** все пункты security checklist пройдены, никаких утечек.

### ✦ После Фазы 6 → v0.9.0 (pre-launch)
- [ ] Обновить CHANGELOG.md → `[0.9.0]`
- [ ] `git tag -a v0.9.0 -m "v0.9.0 — pre-launch"` && push
- [ ] Скилл `superpowers:requesting-code-review` — финальный ревью всего проекта
- [ ] Скилл `simplify` — финальная чистка кода

---

## Деплой

### Шаг 16 — Подготовка к деплою
- [ ] `pnpm build` проходит без ошибок и warnings
- [ ] Создать `DEPLOYMENT.md`:
  - Как создать Vercel проект (connect GitHub repo)
  - Список всех env переменных для Vercel
  - Как создать Supabase проект + применить миграции
  - Как настроить Stripe webhook endpoint (production URL)
  - Как подключить custom domain
  - Как настроить Google OAuth callback URL для production
- [ ] `vercel.json` если нужно (headers, redirects)
- [ ] Проверить что `.env.local.example` актуален
- [ ] `git add -A && git commit -m "chore: deployment preparation"`

**Критерий завершения:** build чистый, документация по деплою полная, готов к push на Vercel.
