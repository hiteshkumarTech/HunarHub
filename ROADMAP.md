# HunarHub — Roadmap

_Last refreshed after the M1–M5 milestones + a QA/polish pass (a11y, performance, docs). Supersedes the
original pre-M1 audit — most of P0 and P1 below are now done; this file tracks what's actually left._

## Done

**P0 — real product + security basics**
- ✅ Frontend data + auth layer (typed API client, TanStack Query, `AuthContext`, protected routes)
- ✅ Login / Register (customer + entrepreneur onboarding)
- ✅ Browse / Profile / Dashboard wired to the live API (mock data now only a landing-page fallback)
- ✅ Backend hardening — `helmet`, rate limiting, `express-mongo-sanitize`, fail-fast env validation in prod
- ✅ Earned reviews — `POST /reviews` requires a completed order

**P1 — core product completeness**
- ✅ Order placement end-to-end (request → accept/decline/complete → customer history + status timeline)
- ✅ Server-side pagination + filtering on Browse (category/search/price/verified/available, indexed)
- ✅ UX states — loading/empty/error, skeletons, toasts, throughout
- ⬜ Image uploads (still Picsum placeholders)
- ⬜ Listing management UI (entrepreneur adds/edits services & products — API exists, no UI yet)
- ⬜ Admin panel UI (API exists — `GET/PATCH /admin/*` — no frontend consumes it yet)

**Design system / QA (this pass)**
- ✅ Dark mode (CSS variable tokens + `.dark` class), shared primitives (Button/Card/Badge/Avatar/Tabs/Toast)
- ✅ Accessibility — skip links + `<main>` landmarks on every screen, ARIA roles on Tabs, toast urgency
  (`role="alert"` vs `"status"`), decorative icons hidden from screen readers, labelled form controls,
  `:focus-visible` ring, AA-contrast muted text
- ✅ Performance — route-level code splitting (`React.lazy`), `.lean()` on read-only Mongoose queries,
  compound indexes on the hot paths (`Order` by customer/entrepreneur + createdAt, `User` by role + rating)
- ✅ Fixed pre-existing breakage this pass surfaced: `typecheck` script (`tsc -b --noEmit` is fundamentally
  incompatible with project references — switched to `tsc -b`), `tsconfig.node.json` missing `composite`,
  `Landing.test.tsx` missing `ThemeProvider`, `@testing-library/user-event` declared but never installed, a
  TS overload error on a `Service | Product` model union in `orders.ts`

## Remaining (highest → lowest priority)

### P2 — trust, quality, developer experience
1. **Backend tests** — no test suite exists yet (frontend has Vitest coverage; backend safety net is
   typecheck only). Vitest/Supertest against the route handlers is the natural next step.
2. **Shared types / typed client** — `src/types/api.ts` (frontend) and the Mongoose models (backend) are
   hand-kept in sync. Low risk at current size; worth a generator (tRPC-style or OpenAPI) if the schema churns.
3. **CI** — no GitHub Actions yet. Typecheck + test on every PR would have caught the `typecheck` script bug
   and the missing test dependency automatically.
4. **Observability** — structured logs (`morgan` only today), error tracking (Sentry), a readiness probe
   beyond `/health`.
5. **`/api/v1` versioning** before any external consumer exists.

### P3 — growth features
6. **Payments** (Razorpay for India) with hold/escrow on service completion.
7. **Image uploads** via Cloudinary/S3 (products, profile, cover) — replaces Picsum.
8. **Listing management UI** + **Admin panel UI** (both have working APIs already — see P1 above).
9. **Notifications** (email via Resend/SES; in-app) and **messaging** between customer and entrepreneur.
10. **SEO/social** — per-page meta/OG tags, sitemap; consider prerendering entrepreneur profile pages.

### P4 — scale & polish
11. **Full-text search** — swap the regex `$or` on Browse for `$text` (index already exists, unused) or
    Atlas Search; add geo-based "near me" discovery, which fits the "local" mission directly.
12. **Redis** caching + a shared rate-limit store (current limiter is in-memory, fine for one instance).
13. **Compiled backend build** — `server` runs via `tsx` in production today; a `tsc` build + `node dist/`
    is the more conventional prod path once uptime/cold-start matters more than iteration speed.
14. **i18n** — Hindi + regional languages; strongly on-brand for the target sellers.
15. **httpOnly-cookie sessions** instead of a `localStorage` JWT, if the app ever handles anything more
    sensitive than a craft marketplace (see README → Known trade-offs).

## Ground rules (unchanged)

Never rewrite working code · never remove features · keep it modular and reusable · strict TypeScript ·
production-ready · explain major decisions · flag any schema change before writing it · stay compatible with
the deployed backend.
