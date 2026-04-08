# Glowboard — Промпты для Claude Code (сессия за сессией)

Копируй эти промпты по одному в Claude Code.
После каждой сессии делай коммит: `git add . && git commit -m "описание"`
Между сессиями используй `/clear` для очистки контекста.

> **ВАЖНО:** Claude автоматически читает CLAUDE.md при старте. Там есть инструкция
> проверять актуальные API через context7 перед каждой сессией. Это гарантирует
> использование последних версий библиотек и избавляет от устаревших паттернов.

---

## ФАЗА 1: ФУНДАМЕНТ

### Сессия 1 — Инициализация проекта
```
Прочитай CLAUDE.md и architecture.md.
Инициализируй проект Next.js 16 с App Router и TypeScript.
Используй pnpm. Установи и настрой:
- Tailwind CSS v4 (ВАЖНО: CSS-first конфигурация):
  - Установи: tailwindcss @tailwindcss/postcss
  - postcss.config.mjs: { plugins: { "@tailwindcss/postcss": {} } }
  - В CSS: @import "tailwindcss"; затем @theme { ... } для кастомизации
  - НЕ создавай tailwind.config.js — его больше нет в v4
  - НЕ ставь autoprefixer и postcss-import — они встроены в v4
- shadcn/ui (инициализируй с темой "neutral", стиль "new-york")
- Добавь эти компоненты shadcn: button, card, input, textarea, dialog, 
  dropdown-menu, avatar, badge, tabs, toast, separator, skeleton
  
Создай структуру директорий как описано в CLAUDE.md.
Создай .env.local.example с плейсхолдерами для всех env переменных 
(см. секцию "Environment Variables" в CLAUDE.md).
Добавь .env.local в .gitignore.
Запусти dev сервер и убедись что стартовая страница открывается.
```

**После: `git add . && git commit -m "feat: initial project setup"`**

---

### Сессия 2 — База данных и Auth
```
Прочитай architecture.md секцию "Database Tables" и "RLS Policies".
Создай SQL миграции в /supabase/migrations/ для таблиц:
profiles, projects, testimonials, subscriptions.

Включи:
- Все поля как описано в architecture.md
- RLS policies для каждой таблицы (ВАЖНО: анонимный INSERT для testimonials)
- Trigger: при создании нового auth.users → auto-create profile + free subscription
- Trigger: auto-update updated_at при изменении записей
- Индексы: projects.public_id (unique), projects.user_id, testimonials.project_id

Установи @supabase/supabase-js и @supabase/ssr.
Создай Supabase клиенты (ВАЖНО — используй @supabase/ssr, НЕ старые auth-helpers):

1. /lib/supabase/server.ts — createServerClient с getAll/setAll cookies:
   import { createServerClient } from '@supabase/ssr'
   import { cookies } from 'next/headers'
   Используй cookies().getAll() и cookies().set() паттерн.

2. /lib/supabase/client.ts — createBrowserClient для клиентских компонентов:
   import { createBrowserClient } from '@supabase/ssr'

3. /lib/supabase/middleware.ts — обновление сессии:
   КРИТИЧНО: вызывай supabase.auth.getUser() СРАЗУ после createServerClient.
   Никакого кода между ними — иначе пользователей будет выбрасывать из сессии.
   Обязательно возвращай supabaseResponse object как есть.

4. /lib/supabase/admin.ts — createClient с service_role для вебхуков.

Сгенерируй типы и сохрани в /lib/supabase/database.types.ts 
(пока создай файл с типами на основе наших таблиц вручную).
```

**После: `git add . && git commit -m "feat: database schema, RLS, auth setup"`**

---

### Сессия 3 — Auth flow и middleware
```
Настрой Supabase Auth:
1. Создай /app/login/page.tsx с формой входа:
   - Кнопка "Continue with Google" (Supabase OAuth)
   - Поле email + кнопка "Send magic link"
   - Красивый дизайн, по центру страницы
   
2. Создай /app/auth/callback/route.ts для обработки OAuth callback:
   - Обменивай code на session через supabase.auth.exchangeCodeForSession()
   - Редиректь на /dashboard/projects после успеха

3. Создай middleware.ts в корне проекта:
   - Импортируй updateSession из /lib/supabase/middleware.ts
   - КРИТИЧНО: в updateSession — auth.getUser() сразу после createServerClient
   - Matcher должен исключать: _next/static, _next/image, favicon.ico, статику
   - Редиректит неавторизованных пользователей с /(dashboard)/* на /login
   - Редиректит авторизованных с /login на /dashboard/projects

4. При первом входе пользователя:
   - Trigger в БД уже создаёт profile и subscription
   - Также создай первый проект автоматически (Server Action при первом входе)
   - Используй nanoid (12+ символов) для генерации publicId проекта
```

**После: `git add . && git commit -m "feat: auth flow with Google and magic link"`**

---

## ФАЗА 2: DASHBOARD

### Сессия 4 — Layout дашборда
```
Создай layout для дашборда /app/(dashboard)/layout.tsx:
- Sidebar слева: логотип "Glowboard", навигация (Projects, Account), 
  кнопка Upgrade (если free plan), юзер-меню внизу (аватар, имя, logout)
- На мобильных: sidebar скрыт, hamburger menu
- Основной контент справа
- Используй shadcn/ui компоненты
- Sidebar должен показывать текущий план пользователя (Free/Pro/Business)
- Загружай данные пользователя и подписки через Server Component
```

**После: `git add . && git commit -m "feat: dashboard layout with sidebar"`**

---

### Сессия 5 — Список проектов
```
Создай /app/(dashboard)/projects/page.tsx:
- Показывай все проекты пользователя (Server Component, запрос через Supabase)
- Каждый проект — карточка с: название, количество отзывов, количество pending, дата создания
- Кнопка "New Project" → Dialog с полем для имени проекта
- Server Action для создания проекта (генерируй publicId через nanoid)
- Проверка лимитов: Free план = макс 1 проект. Показывай Upgrade prompt при попытке создать второй
- Empty state если нет проектов (не должно случиться, но на всякий)
- Клик по карточке → переход на /dashboard/projects/[id]
```

**После: `git add . && git commit -m "feat: projects list page"`**

---

### Сессия 6 — Страница проекта (управление отзывами)
```
Создай /app/(dashboard)/projects/[id]/page.tsx:
- ВАЖНО (Next.js 16): params теперь Promise — используй await:
  const { id } = await props.params;
- Заголовок с названием проекта
- Строка с collection link (glowboard.com/collect/[publicId]) + кнопка копировать
- Tabs: All | Pending | Approved | Rejected (используй shadcn Tabs)
- Список testimonials как карточки:
  - Аватар (или инициалы), имя, звёзды (★), текст отзыва, дата
  - Badge со статусом (pending=yellow, approved=green, rejected=red)
  - Кнопки: Approve (если не approved), Reject (если не rejected), Delete
- Server Actions для approve/reject/delete
- Проверяй что проект принадлежит текущему пользователю!
- Empty state: "No testimonials yet. Share your collection link to get started!"
- Loading skeletons пока данные загружаются
```

**После: `git add . && git commit -m "feat: project detail page with testimonial management"`**

---

### Сессия 7 — Настройки проекта и embed код
```
Создай /app/(dashboard)/projects/[id]/settings/page.tsx:
- Секция "Widget Appearance":
  - Выбор стиля: Carousel / Grid / Wall / Minimal (radio cards с превью)
  - Color picker для primary color (простой — 8 предустановленных + custom input)
  - Поле для логотипа (upload файла в Supabase Storage)
  - Поле thank you message
  - Кнопка "Save Settings" (Server Action)

- Секция "Embed Code":
  - Показывай готовый script tag: 
    <script src="https://glowboard.com/embed/widget.js" data-project="[publicId]"></script>
  - Кнопка "Copy Code" с toast подтверждением
  - Текст: "Paste this code anywhere in your website's HTML"

- Секция "Collection Link":
  - Полная ссылка для сбора отзывов
  - Кнопка копировать
  - QR-код (сгенерируй на клиенте)

- Секция "Danger Zone":
  - Кнопка "Delete Project" с подтверждением через Dialog
```

**После: `git add . && git commit -m "feat: project settings and embed code"`**

---

## ФАЗА 3: СБОР ОТЗЫВОВ

### Сессия 8 — Публичная форма сбора
```
Создай /app/collect/[publicId]/page.tsx:
- ВАЖНО (Next.js 16): params теперь Promise — используй await:
  const { publicId } = await props.params;
- Это ПУБЛИЧНАЯ страница — НЕ требует авторизации
- Загружай данные проекта по publicId (Server Component)
- Если проект не найден → 404
- Показывай брендированную форму:
  - Логотип проекта (если есть) + название
  - Поля: Имя* (text), Email (text, optional), Rating* (кликабельные звёзды 1-5), 
    Отзыв* (textarea, max 1000 chars), Фото (file upload, optional, max 5MB)
  - Кнопка "Submit Testimonial"
- Client Component для интерактивности (звёзды, file upload preview)
- Server Action для сохранения (валидация через Zod):
  - Вставка в testimonials с status="pending"
  - НЕ проверяй auth — анонимный доступ
  - Проверяй лимит testimonials для free плана
- После отправки: показывай thank_you_message проекта
- Дизайн: чистый, минималистичный, хорошо выглядит на мобильных
- Внизу: "Powered by Glowboard" со ссылкой на главную (всегда)
```

**После: `git add . && git commit -m "feat: public testimonial collection form"`**

---

## ФАЗА 4: EMBED ВИДЖЕТ

### Сессия 9 — API endpoint для виджета
```
Создай /app/api/embed/[publicId]/route.ts:
- ВАЖНО (Next.js 16): params теперь Promise:
  const { publicId } = await segmentData.params;
- GET handler
- Запрашивает из Supabase: проект (style, primaryColor) + approved testimonials
- Возвращает JSON: { testimonials: [...], style, primaryColor, showBranding }
- showBranding = true если план free, false если pro/business
- CORS headers: Access-Control-Allow-Origin: * (виджет должен работать на любом домене)
- Добавь OPTIONS handler для preflight
- Кэширование: Cache-Control: public, max-age=300 (5 минут)
- Если проект не найден → 404 JSON
```

**После: `git add . && git commit -m "feat: embed API endpoint"`**

---

### Сессия 10 — Embed widget (standalone JS)
```
Создай /public/embed/widget.js — это standalone vanilla JavaScript файл.
НЕ используй React, НЕ используй импорты. Чистый JS + стили внутри Shadow DOM.
НЕ создавай отдельный widget.css — все стили инжектятся через JS в Shadow DOM.

Логика:
1. Скрипт находит себя в DOM (document.currentScript)
2. Читает data-project атрибут
3. Fetch к /api/embed/[publicId]
4. Создаёт Shadow DOM контейнер (для изоляции стилей)
5. Рендерит testimonials в выбранном стиле

Реализуй стили:
- Carousel: горизонтальная прокрутка, стрелки навигации, auto-play
- Grid: 2-3 колонки, responsive
- Wall: masonry layout (CSS columns)
- Minimal: простой вертикальный список

Каждая карточка:
- Аватар (фото или инициалы на цветном фоне)
- Имя
- Звёзды
- Текст (truncate длинный, "read more")
- Дата ("2 weeks ago" формат)

Если showBranding=true:
- Внизу виджета: "⭐ Powered by Glowboard" со ссылкой на glowboard.com

ВАЖНО:
- Файл должен быть <15KB
- Все стили внутри Shadow DOM
- Никаких конфликтов с хост-сайтом
- Работает на HTTP и HTTPS
- Graceful fallback если fetch fails
```

**После: `git add . && git commit -m "feat: standalone embed widget"`**

---

## ФАЗА 5: ПЛАТЕЖИ

### Сессия 11 — Stripe интеграция
```
Установи stripe пакет. Создай /lib/stripe/stripe.ts с инициализацией.

1. Server Action "createCheckoutSession":
   - Принимает plan: "pro" | "business"  
   - Создаёт Stripe Customer (если нет) или находит существующего
   - Создаёт Checkout Session с правильным price_id
   - success_url: /dashboard/projects?checkout=success
   - cancel_url: /dashboard/projects?checkout=cancel
   - Возвращает URL для редиректа

2. Server Action "createPortalSession":
   - Создаёт Stripe Customer Portal session
   - return_url: /dashboard/account
   - Возвращает URL для редиректа

3. Webhook handler /app/api/webhooks/stripe/route.ts:
   - ИСПОЛЬЗУЙ context7 для проверки актуального Stripe API перед кодингом
   - Для raw body: const body = await request.text()
   - const sig = request.headers.get('stripe-signature')
   - Верификация: stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)
   - Экспортируй: export const runtime = 'nodejs' (НЕ edge)
   - Handle: checkout.session.completed → upsert subscription
   - Handle: customer.subscription.updated → sync plan/status
   - Handle: customer.subscription.deleted → downgrade to free
   - Handle: invoice.payment_failed → mark past_due
   - Используй Supabase admin client (service_role) для записи

4. Добавь кнопку "Upgrade" в sidebar дашборда (для free plan)
5. Добавь страницу /dashboard/account с:
   - Текущий план
   - Кнопка "Manage Billing" → Stripe Customer Portal
   - Если free: карточки Pro и Business с кнопками Upgrade
```

**После: `git add . && git commit -m "feat: Stripe payments integration"`**

---

### Сессия 12 — Лимиты планов
```
Создай /lib/utils/plan-limits.ts:
- Функция checkProjectLimit(userId): можно ли создать ещё проект?
- Функция checkTestimonialLimit(projectId): можно ли принять ещё отзыв?
- Функция shouldShowBranding(userId): показывать ли бренд на виджете?

Примени лимиты:
1. Создание проекта → проверка checkProjectLimit
2. Сохранение testimonial → проверка checkTestimonialLimit
3. API embed endpoint → проверка shouldShowBranding
4. Если лимит достигнут → показывай Upgrade prompt/dialog с описанием планов

Обнови проекты и testimonials так, чтобы при достижении лимитов 
пользователь видел понятное сообщение с кнопкой Upgrade.
```

**После: `git add . && git commit -m "feat: plan limits enforcement"`**

---

## ФАЗА 6: POLISH

### Сессия 13 — Landing page
```
Создай landing page /app/(marketing)/page.tsx. 
Тёмная тема с фиолетовым/индиго акцентом (#6366f1 как primary).

Секции:
1. Hero: заголовок "Turn happy customers into your best marketing",
   подзаголовок, CTA "Start Free", анимированный превью виджета
2. "How it Works": 3 шага с иконками
   - Create your wall → Share the link → Embed & grow
3. Widget Showcase: интерактивный пример виджета (все 4 стиля)
4. Pricing: 3 карточки (Free / Pro / Business) со сравнением фич
5. Social proof: "Trusted by X businesses" (пока placeholder)
6. Footer: ссылки, копирайт

Дизайн должен быть ВЫДАЮЩИМСЯ — это наша витрина.
Добавь тонкие анимации (CSS transitions, не тяжёлые библиотеки).
Fully responsive.
```

**После: `git add . && git commit -m "feat: landing page"`**

---

### Сессия 14 — Финальная полировка
```
Пройдись по всему приложению и:
1. Добавь loading states (Skeleton компоненты) на все страницы с данными
2. Добавь error states (try-catch + error.tsx boundaries)
3. Добавь empty states (когда нет данных)
4. Проверь responsive дизайн на всех страницах (mobile, tablet, desktop)
5. Добавь SEO: metadata на каждой странице (title, description, OG image)
6. Добавь toast уведомления при действиях (approve, reject, delete, copy)
7. Добавь favicon и OG image
8. Проверь что все формы имеют валидацию (Zod) и показывают ошибки
```

**После: `git add . && git commit -m "feat: polish — loading, errors, responsive, SEO"`**

---

### Сессия 15 — Security review
```
Проведи полный security review проекта:
1. Все ли таблицы имеют RLS policies? Покажи список.
2. Нет ли утечки серверных ключей в клиентский код?
3. Верифицируется ли Stripe webhook signature?
4. Есть ли rate limiting на публичных endpoints?
5. Есть ли XSS prevention в testimonial тексте?
6. Правильно ли настроен CORS на embed API?
7. Валидируются ли все пользовательские входы через Zod?
8. Нет ли SQL injection возможностей?

Исправь все найденные проблемы.
```

**После: `git add . && git commit -m "fix: security review fixes"`**

---

## ДЕПЛОЙ

### Сессия 16 — Подготовка к деплою
```
1. Проверь что pnpm build проходит без ошибок
2. Создай файл DEPLOYMENT.md с инструкциями:
   - Как создать проект на Vercel
   - Какие env переменные нужно добавить
   - Как настроить Supabase проект
   - Как настроить Stripe webhooks endpoint
   - Как подключить домен
3. Убедись что все env переменные правильно используются
4. Добавь Vercel-specific конфиг если нужно (vercel.json)
```

**После: `git add . && git commit -m "chore: deployment preparation"`**

---

## Заметки

### Если Claude Code сломал что-то:
```bash
git diff                    # посмотри что изменилось
git stash                   # сохрани изменения отдельно
# или, если точно хочешь откатить:
git checkout -- .           # откати все изменения (НЕОБРАТИМО)
```

### Если контекст стал слишком большим:
В Claude Code набери `/clear` и начни новую сессию.
Claude перечитает CLAUDE.md автоматически.

### Если нужно посмотреть приложение:
В Claude Code используй MCP Playwright — он может открывать браузер,
делать скриншоты и взаимодействовать со страницами.

### Если нужна актуальная документация:
Claude Code подключён к context7 — при вопросах про библиотеки
он автоматически подтянет свежую документацию. Можно явно попросить:
"Используй context7 для проверки API [библиотеки]".

### Порядок работы в каждой сессии:
1. Claude читает CLAUDE.md автоматически
2. Скопируй промпт сессии → вставь в Claude Code
3. Дождись завершения
4. Проверь результат (`pnpm dev`, открой в браузере)
5. `git add . && git commit -m "описание"`
6. `/clear` → следующая сессия
