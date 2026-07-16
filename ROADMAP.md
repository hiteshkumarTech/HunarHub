# HunarHub — Architecture Review & Production Roadmap

_Analysis of the existing codebase (no rebuilds). Prioritized P0 → P4. Nothing is implemented until you approve._

---

## 1. Where the project stands today

**Frontend** (`/`, Vite + React 19 + TS, deployed to Vercel)
Routes: `/` Landing · `/browse` · `/profile/:id` · `/dashboard`. Clean monochrome design system, Motion animations, reusable components (`Header`, `PageBar`, `Monogram`, `Stars`, `craftIcons`, `SandTransitionImage`).
**It runs entirely on `src/data/mockData.ts`.** There is no API client, no auth/session, no login/register, no forms posting to the server.

**Backend** (`/server`, Express + Mongoose + JWT + Zod, deployed to Render)
Endpoints in use:
- Auth — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Entrepreneurs — `GET /api/entrepreneurs`, `GET /api/entrepreneurs/:id`, `PATCH /api/entrepreneurs/me`
- Services / Products — `POST`, `PATCH /:id`, `DELETE /:id`
- Orders — `POST`, `GET /mine`, `GET /incoming`, `PATCH /:id/status`
- Reviews — `POST`, `GET /entrepreneur/:id`
- Admin — `GET /entrepreneurs`, `PATCH /entrepreneurs/:id/verify`, `GET /stats`

The API is solid and RESTful. The gap is that **nothing consumes it yet.**

---

## 2. Findings by category

### Security
- **No `helmet`, no rate limiting, no NoSQL-injection sanitisation.** Auth endpoints are brute-forceable today.
- **`env.ts` silently falls back to `dev-secret-change-me`** if `JWT_SECRET` is missing — a prod deploy with a missing var would run insecurely instead of failing fast.
- **Reviews aren't earned.** `POST /api/reviews` lets any customer review any entrepreneur without ever ordering → fake-review vector. Should require a completed order.
- **Token storage (once wired):** avoid `localStorage` (XSS-readable). Plan httpOnly cookie or short-lived access token + refresh.
- **CORS** currently allows any `*.vercel.app` — convenient, but should tighten to the exact production origin before launch.
- No password strength rules, email verification, or login lockout.

### Missing product features (the "it's not a real app yet" list)
- Frontend **auth** (register/login/logout, persisted session, protected routes).
- **Live data** on Browse / Profile / Dashboard (replace mock).
- **Order placement** end-to-end + a customer **"My Orders"** page.
- **Become-a-seller onboarding** (entrepreneur profile creation UI).
- **Entrepreneur listing management** UI (add/edit services & products from the dashboard).
- **Admin panel** UI (verify entrepreneurs, view stats).
- **Image uploads** (products, profile, cover) — currently Picsum placeholders.
- Later: payments, notifications, messaging, favorites/wishlist.

### Architecture
- Route files hold business logic inline. Fine now; extract a **service layer** as complexity grows.
- **Types are duplicated** across FE (`src/types.ts`) and BE (models). They will drift. Introduce **shared types** (or generate a typed client from the Zod schemas / OpenAPI).
- **No API versioning** — add `/api/v1` before external consumers exist.
- **No tests, no CI, no lint config** committed.
- Production runs via `tsx` (fine); a compiled `tsc` build is the standard prod path — revisit.

### Scalability
- **No pagination anywhere** (`entrepreneurs` capped at 100; orders/reviews unbounded).
- **Browse search uses regex `$or`**, which can't use indexes well at scale. A `text` index exists but is unused — move to `$text` or Atlas Search, and add compound indexes (`role+category`, `role+startingPrice`, `role+ratingAvg`).
- **Render free tier cold-starts** (~30s after idle) — keep-alive ping or paid tier before demos.
- No caching layer (Redis) yet — fine until traffic grows.

### Performance
- Read endpoints hydrate full Mongoose docs then serialize — use **`.lean()`** on read-only queries.
- Frontend: **no route-level code splitting** (`React.lazy`), **no data caching** (add React Query), images not lazy-loaded or responsive.
- No HTTP cache headers on public GETs.

### UI/UX
- Once wired, needs **loading / empty / error states**, skeletons, and **toasts** for actions.
- **Accessibility:** icon-only buttons lack `aria-label`s; light-gray mono labels risk failing WCAG contrast; verify focus states + keyboard nav.
- **SEO:** SPA with no per-page meta/OG; consider prerender/SSG for entrepreneur pages.

---

## 3. The roadmap (highest → lowest priority)

### P0 — Make it a real product + close critical security holes
Highest priority: without this, HunarHub is a design demo plus a separate API.
1. **Frontend data + auth layer** — typed API client pointing at `VITE_API_URL` (`https://hunarhub-api-s03k.onrender.com`), React Query for fetching/caching, `AuthContext` (login/register/logout, session restore via `/auth/me`), protected routes.
2. **Login / Register pages** — customer + entrepreneur onboarding (creates the profile the API expects).
3. **Wire Browse / Profile / Dashboard** to live endpoints; remove reliance on `mockData`.
4. **Backend hardening** — `helmet`, `express-rate-limit` (auth), `express-mongo-sanitize`, and **fail-fast env validation** in production (no insecure fallbacks).
5. **Earned reviews** — gate `POST /reviews` to customers with a completed order. _(Schema note: add optional `order` ref to `Review`; I'll detail before touching it.)_

### P1 — Core product completeness
6. **Order placement flow** end-to-end (place → entrepreneur accept/decline/complete → customer history).
7. **Server-side pagination + real search** on Browse (indexes + `$text`/Atlas Search).
8. **Image uploads** via Cloudinary (products/profile/cover); replace Picsum.
9. **Listing management UI** (entrepreneur adds/edits services & products).
10. **Admin panel UI** (verify entrepreneurs, platform stats).
11. **UX states** — loading/empty/error, skeletons, toasts.

### P2 — Trust, quality, developer experience
12. **Shared types / typed client** to kill FE↔BE drift.
13. **Testing** — Vitest + Supertest (API), component tests (UI).
14. **Observability** — `pino` structured logs, Sentry error tracking, readiness endpoint.
15. **`/api/v1` versioning** + **GitHub Actions CI** (typecheck, lint, test).
16. **Accessibility pass** (aria, focus, contrast) + keyboard nav.

### P3 — Growth features
17. **Payments** (Razorpay for India) with escrow/hold on service completion.
18. **Notifications** (email via Resend/SES; in-app).
19. **Messaging** between customer and entrepreneur.
20. **Favorites / wishlist**, saved searches, review photos & rating breakdown.
21. **SEO/social** — meta/OG, sitemap; prerender entrepreneur pages.

### P4 — Scale & polish
22. **Redis** caching + rate-limit store.
23. **Atlas Search / geo** for location-based discovery (fits the "local" mission).
24. **Analytics dashboards** (KPIs from the brief).
25. **Internationalisation** (Hindi + regional languages) — strongly on-brand for local workers.
26. **Compiled prod build**, staging environment, containerisation.

---

## 4. Ground rules I'll follow (yours, restated)
Never rewrite working code · never remove features · keep it modular and reusable · strict TypeScript · production-ready · explain major decisions · **flag any schema change before writing it** · everything stays compatible with the deployed backend.

---

## 5. Suggested first sprint
**P0 items 1–5.** It turns the live API into a working product and closes the exploitable gaps, without changing anything already deployed. Recommended order within P0: API client + AuthContext → Login/Register → wire Browse/Profile/Dashboard → backend hardening → earned reviews.
